const net = require('net');
const WebSocket = require('./websocket/WebSocket');
const assert = require('assert');
const Request = require('./websocket/Request');
const Response = require('./websocket/Response');
const StatusLine = require('./websocket/StatusLine');
const Header = require('./websocket/Header');
const Headers = require('./websocket/Headers');
const ExtensionOptionsNotSupported = require('./errors/ExtensionOptionsNotSupported');
const ParseError = require('./errors/ParseError');
const ValidationError = require('./errors/ValidationError');
const HTTPStatusCodes = require('./HTTPStatusCodes');
const ExtensionsRequest = require('./websocket/ExtensionsRequest');
const crypto = require('crypto');

/**
 * Implements a websocket server.
 *
 * @class WebSocketServer
 */
class WebSocketServer {

  /**
   * Creates an instance of WebSocketServer.
   *
   * @param {Array} messageProcessors - Array of message processors associated with this server
   * @param {protocolExtensions} - Array of protocol extensions supported by this server (nullable)
   * @param {Boolean} - If true, verbose debugging information will be logged for most operations
   * @memberof WebSocketServer
   */
  constructor(messageProcessors, protocolExtensions=null, verbose=false) {
    assert(Array.isArray(messageProcessors))

    this.clientById = {};

    const server = net.createServer();

    server.on('connection', (socket) => this._onConnection(socket));

    this.server = server;
    this.messageProcessors = messageProcessors;
    this.verbose = verbose;
    this.clientIdsByMessageProcessorEndpoint = {};

    this.messageProcessorsByEndpoint = {};
    this.messageProcessors.forEach(messageProcessor => {
      this.messageProcessorsByEndpoint[messageProcessor.endpoint] = messageProcessor;
      this.clientIdsByMessageProcessorEndpoint[messageProcessor.endpoint] = new Set();
      messageProcessor.bind(this);
    });

    this.protocolExtensions = {};
    if (protocolExtensions !== null) {
      assert(Array.isArray(protocolExtensions))
      protocolExtensions.forEach(protocolExtension => {
        this.protocolExtensions[protocolExtension.name] = protocolExtension;
      });
    }

    this.idCounter = 0;
  }

  /**
   * Performs the handshake operation which negotiates any communication standards/protocols as well
   * as authentication, before a client is officially registered within the server for subsequent
   * communication.
   *
   * @param {WebSocket} webSocket - The socket for which handshake is being performed
   * @param {Buffer} data - The client request (this implementation assumes the request will be)
   * @returns
   * @memberof WebSocketServer
   */
  async doHandshake(webSocket, data) {
    let request, extensions, acceptKey, session, messageProcessor;
    const appliedExtensions = [];
    try {
      request = Request.parse(data);

      const securityKeyHeader = request.headers.get(WebSocketServer.SEC_WEBSOCKET_KEY);
      if (securityKeyHeader === undefined) {
        throw new Error("No security header present");
      }

      const securityKey = securityKeyHeader.value;
      const shasum = crypto.createHash('sha1');
      shasum.update(`${securityKey}${WebSocketServer.GUID}`);
      acceptKey = shasum.digest('base64');

      const extensionHeader = request.headers.get(WebSocketServer.SEC_WEBSOCKET_EXTENSIONS);
      if (extensionHeader === undefined) {
        // Empty set of extensions
        extensions = new ExtensionsRequest([]);
      } else {
        // Parse extensions from the header
        extensions = ExtensionsRequest.parse(extensionHeader.value);
      }

      const pathname = request.url.pathname;
      messageProcessor = this._getMessageProcessorByEndpoint(pathname);
      if (messageProcessor === null) {
        throw new Error(`Pathname ${pathname} is not supported by this server`);
      }

      // If not present, will be set to undefined
      const authToken = request.queryArgs[WebSocketServer.AUTH_TOKEN_KEY];
      session = await messageProcessor.authenticate(authToken);
      if (session === null) {
        const response = new Response(
          new StatusLine(WebSocketServer.PROTOCOL, HTTPStatusCodes.UNAUTHORIZED, 'Unauthorized')
        );

        webSocket.socket.write(response.serialize());
        webSocket.socket.end();
        return null;
      }

      extensions.getAll().forEach(extension => {
        if (extension.name in this.protocolExtensions) {
          // Extension is available
          const protocolExtensionClass = this.protocolExtensions[extension.name];
          try {
            const protocolExtension = protocolExtensionClass.createInstance(extension);
            appliedExtensions.push(protocolExtension);
          } catch(e) {
            if (e instanceof ExtensionOptionsNotSupported) {
              // Continue to the next extension, this one will not be supported
              return;
            }

            throw e;
          }
        }
      });
    } catch(e) {
      if (this.verbose) {
        console.debug(`${webSocket.getLogHeader()}Handshake failed:\n${e}`);
      } else {
        console.error(`${webSocket.getLogHeader()}Handshake failed`);
      }
      webSocket.socket.destroy();

      if (!(
        e instanceof ParseError ||
        e instanceof ValidationError
      )) {
        throw e;
      }

      return null;
    }

    const headers = new Headers();
    headers.add(new Header('Upgrade', 'websocket'));
    headers.add(new Header('Connection', 'Upgrade'));
    headers.add(new Header(WebSocketServer.SEC_WEBSOCKET_ACCEPT, acceptKey));

    const extensionHeaderValue = appliedExtensions.map(extension => extension.serialize()).join('; ');
    if (extensionHeaderValue.length > 0) {
      headers.add(new Header(WebSocketServer.SEC_WEBSOCKET_EXTENSIONS, extensionHeaderValue));
    }

    const response = new Response(
      new StatusLine(WebSocketServer.PROTOCOL, HTTPStatusCodes.SWITCHING_PROTOCOLS, 'SWITCHING_PROTOCOLS'),
      headers,
    );

    const serializedResponse = response.serialize();
    if (this.verbose) {
      console.log(`${webSocket.getLogHeader()}Server sending handshake response`);
      console.log(serializedResponse);
    }
    webSocket.socket.write(serializedResponse);

    // Add this client to the message processor mapping in order to faciliate message processor-wide
    // broadcasts to clients
    this.clientIdsByMessageProcessorEndpoint[messageProcessor.endpoint].add(webSocket.id);

    return [
      request,
      appliedExtensions,
      session,
      messageProcessor,
    ];
  }

  isExtensionSupported(name) {
    return (name in protocolExtensions);
  }

  cleanup(webSocket) {
    if (this.verbose === true) {
      console.debug(`${webSocket.getLogHeader()}Was cleaned from the server`);
    }
    delete this.clientById[webSocket.id];

    // If the message processor is null, it means that it has not yet been assigned one due to
    // processing error during the handshake, etc.
    if (webSocket.messageProcessor !== null) {
      const messageProcessor = webSocket.messageProcessor;
      this.clientIdsByMessageProcessorEndpoint[messageProcessor.endpoint].delete(webSocket.id);
    }
  }

  getSocket(id) {
    if (id in this.clientById) {
      return this.clientById[id];
    }

    return null;
  }

  /**
   * Returns an array of WebSocket instances interacting with the supplied message processor.
   *
   * @param {*} messageProcessor
   * @returns
   * @memberof WebSocketServer
   */
  getSocketsByMessageProcessor(messageProcessor) {
    assert(messageProcessor.endpoint in this.clientIdsByMessageProcessorEndpoint);
    return [...this.clientIdsByMessageProcessorEndpoint[messageProcessor.endpoint].values()].map(id => {
      return this.clientById[id];
    });
  }

  _getMessageProcessorByEndpoint(endpoint) {
    if (!(endpoint in this.messageProcessorsByEndpoint)) {
      return null;
    }

    return this.messageProcessorsByEndpoint[endpoint];
  }

  /**
   * Handler which executes when the server receives a new inbound connection.
   *
   * @param {*} socket
   * @memberof WebSocketServer
   */
  _onConnection(socket) {
    const id = this.idCounter ++;
    this.clientById[id] = new WebSocket(this, socket, id, this.verbose);

    if (this.verbose === true) {
      console.debug(`${this.clientById[id].getLogHeader()}Connected to the server`);
    }
  }

  listen(port) {
    const host = '0.0.0.0';
    this.server.listen({
      host,
      port,
    });

    if (this.verbose === true) {
      console.debug(`Server is listening on ${host}:${port}`);
    }
  }
}

WebSocketServer.AUTH_TOKEN_KEY = 'auth_token';
WebSocketServer.SEC_WEBSOCKET_KEY = 'Sec-WebSocket-Key';
WebSocketServer.SEC_WEBSOCKET_EXTENSIONS = 'Sec-WebSocket-Extensions';
WebSocketServer.SEC_WEBSOCKET_ACCEPT = 'Sec-WebSocket-Accept';

WebSocketServer.GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
WebSocketServer.PROTOCOL = 'HTTP/1.1';

module.exports = WebSocketServer;
