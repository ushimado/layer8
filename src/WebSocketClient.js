const assert = require('assert');
const Request = require('./websocket/Request');
const Response = require('./websocket/Response');
const RequestLine = require('./websocket/RequestLine');
const Endpoint = require('./Endpoint');
const Headers = require('./websocket/Headers');
const Header = require('./websocket/Header');
const crypto = require('crypto');
const net = require('net');
const tls = require('tls');
const ExtensionsRequest = require('./websocket/ExtensionsRequest');
const { ValidationError } = require('ensuredata');
const WebSocket = require('./websocket/WebSocket');
const ParseError = require('./errors/ParseError');

class WebSocketClient extends WebSocket {

  constructor(options=null) {
    const socket = new net.Socket();
    if (options === null) {
      options = {};
    }

    super(options);

    let extensions = options[WebSocket.OPTION_EXTENSIONS];
    if (extensions === undefined) {
      extensions = [];
    }

    this.__requestedExtensions = extensions;
    this.__requestedExtensionByName = {};
    this.__nonce = crypto.randomBytes(16).toString('base64');

    const shasum = crypto.createHash('sha1');
    shasum.update(`${this.__nonce}${WebSocket.GUID}`);
    this.__acceptKey = shasum.digest('base64');

    extensions.forEach(extension => {
      this.__requestedExtensionByName[extension.name] = extension;
    });

    this.__isReady = false;
    this.__handshakeComplete = false;
    this.__maxFramePayloadSize = options[WebSocket.OPTION_MAX_FRAME_PAYLOAD_SIZE] === undefined ? WebSocket.DEFAULT_MAX_FRAME_PAYLOAD_SIZE : options[WebSocket.OPTION_MAX_FRAME_PAYLOAD_SIZE];

    this.bind(socket);
    this.setSocketHandlers(socket);
  }

  setSocketHandlers(socket) {
    socket.on('ready', () => {
      this.__isReady = true;

      const headers = new Headers();
      headers.add(new Header('Host', this.__url.host));
      headers.add(new Header('Connection', 'Upgrade'));
      headers.add(new Header('Pragma', 'no-cache'));
      headers.add(new Header('Cache-Control', 'no-cache'));
      headers.add(new Header('User-Agent', 'Layer8 websocket client'));
      headers.add(new Header('Upgrade', 'websocket'));
      headers.add(new Header(WebSocket.SEC_WEBSOCKET_VERSION, WebSocketClient.WEBSOCKET_VERSION));
      headers.add(new Header(WebSocket.SEC_WEBSOCKET_KEY, this.__nonce));

      if (this.__requestedExtensions.length > 0) {
        const value = this.__requestedExtensions.map(extension => extension.serialize()).join(', ');
        headers.add(new Header(WebSocket.SEC_WEBSOCKET_EXTENSIONS, value));
      }

      const request = new Request(
        new RequestLine(Endpoint.GET, this.__url, WebSocketClient.HTTP_PROTOCOL),
        headers,
      );

      this.__socket.write(request.serialize());
    });
    socket.on('close', (hadError) => this.onDisconnect(hadError));
    socket.on('data', (data) => this._onData(data));
  }

  connect(uri) {
    const url = new URL(uri);
    assert(url.protocol in WebSocket.WS_PROTOCOLS);
    let port;
    if (url.port.length > 0) {
      port = parseInt(url.port);
    } else {
      port = WebSocket.WS_PROTOCOLS[url.protocol];
    }

    const options = {
      host: url.hostname,
      port: port,
    };

    if (url.protocol === WebSocket.TLS_PROTO) {
      const socket = tls.connect(options, () => {
      });
      this.setSocketHandlers(socket);
      this.bind(socket);
    } else {
      this.socket.connect(options);
    }

    this.__url = url;
  }

  async write(buffer) {
    if (typeof(buffer) === 'string') {
      buffer = Buffer.from(buffer);
    } else {
      assert(buffer instanceof Buffer);
    }

    return super.write(buffer, true);
  }

  async onConnect() {
  }

  async onDisconnect(hadError) {
  }

  async onData(data) {
  }

  async _onData(data) {
    if (this.__handshakeComplete === false) {
      // We expect a server handshake response here
      const request = this.requestBuffer.ingest(data);
      if (request === null) {
        if (this.__verbose === true) {
          console.debug(`Incomplete request arrived:\n${data.toString()}`);
        }
      } else {
        if (this.__verbose === true) {
          console.debug(`Complete request arrived:\n${data.toString()}`);
        }
        try {
          this.__processServerResponse(data);
        } catch(e) {
          if (e instanceof ParseError || e instanceof ValidationError) {
            this.socket.end();
            throw e;
          }

          throw e;
        }

        await this.onConnect();
      }
    } else {
      const [ messages, controlFrames ] = await this.processIncomingData(data);
      if (controlFrames.length > 0) {
        this.processControlFrames(controlFrames);
      }

      for (let message of messages) {
        if (this.__verbose === true) {
          console.debug(`Received message:\n${message}`)
        }
        await this.onData(message);
      }
    }
  }

  __processServerResponse(data) {
    assert(data instanceof Buffer);
    const response = Response.parse(data.toString());

    let extensions;
    const extensionHeader = response.headers.get(WebSocket.SEC_WEBSOCKET_EXTENSIONS);
    if (extensionHeader === undefined) {
      // Empty set of extensions
      extensions = new ExtensionsRequest([]);
    } else {
      // Parse extensions from the header
      extensions = ExtensionsRequest.parse(extensionHeader.value);
    }

    const negotiatedExtensions = [];
    extensions.getAll().forEach(extension => {
      if (!(extension.name in this.__requestedExtensionByName)) {
        throw new ValidationError(
          WebSocket.SEC_WEBSOCKET_EXTENSIONS,
          `${extension.name} is not supported by this client`
        );
      }

      const protocolExtensionInst = this.__requestedExtensionByName[extension.name];
      negotiatedExtensions.push(protocolExtensionInst.constructor.createInstance(extension));
    });

    // Verify the accept key
    const acceptHeader = response.headers.get(WebSocket.SEC_WEBSOCKET_ACCEPT);
    if (acceptHeader === undefined) {
      throw new ValidationError(
        WebSocket.SEC_WEBSOCKET_ACCEPT,
        `${WebSocket.SEC_WEBSOCKET_ACCEPT} header is required in server response`,
      );
    } else {
      if (acceptHeader.value !== this.__acceptKey) {
        throw new ValidationError(
          WebSocket.SEC_WEBSOCKET_ACCEPT,
          "Accept key was not created from the security key provided by the client",
          acceptHeader.value,
        )
      }
    }

    this.extensions = negotiatedExtensions;
    this.__handshakeComplete = true;
  }
}

module.exports = WebSocketClient;
