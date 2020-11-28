const assert = require('assert');
const WebSocketServer = require('../WebSocketServer');
const WebSocket = require('./WebSocket');

class MessageProcessor {

  /**
   * Creates an instance of MessageProcessor.
   *
   * @param {string} endpoint - The endpoint this message processor will be servicing.
   * @param {string} [sessionKey=null] - If a session is present, this key will link the value to
   * the connected socket.  As an example: 'accountId' - this will get the value keyed by
   * 'accountId' on the session object, and associate it with the socket id.  The message processor
   * can then reference the value when writing data to the socket, instead of the socket itself.
   * This makes adds a level of convenience for the application layer, which frees it from the
   * burden of tracking sockets.
   * @param {boolean} [kickDuplicateSessionKey=false] - If true, any client which has authenticated
   * with the same ID as an already authenticated client, will force the old authenticated client's
   * socket to close.  This effectively allows for only a single user of a given ID to connect at
   * a given time.  If false (the default), a given ID can be associated with multiple sockets, and
   * thus a write operation to that ID, could involve writes to multiple sockets.
   * @memberof MessageProcessor
   */
  constructor(endpoint, sessionKey=null, kickDuplicateSessionKey=false) {
    this.endpoint = endpoint;

    this.webSocketServer = null;
    this.sessionKey = sessionKey;
    this.kickDuplicateSessionKey = kickDuplicateSessionKey;
    this.sessionKeyMapping = {};
  }

  bind(webSocketServer) {
    assert(websocketServer instanceof WebSocketServer);
    assert(
      this.webSocketServer === null,
      "This message processor is already bound to a websocket server"
    );

    this.webSocketServer = webSocketServer;
  }

  async _onRead(session, socket, data) {
    return this.onRead(session, socket, data);
  }

  async write(data, destination) {
    let socketIds = [];
    assert(data instanceof Buffer);
    if (destination instanceof WebSocket) {
      socketIds = [destination.id];
    } else {
      assert(
        this.sessionKey !== null,
        'If destination is not a WebSocket instance, it must be a value on the session and sessionKey must be defined at construction time'
      );

      // If the destination is not available, don't fail, just don't send the message
      if (destination in this.sessionKeyMapping) {
        socketIds = [...this.sessionKeyMapping[destination].values()];
      }
    }

    for (let socketId of socketIds) {
      const socket = this.webSocketServer.getSocket(socketId);
      if (socket !== null) {
        // Create the message frame, then iterate all the extensions and write to the socket
        socket.
      }
    }
  }

  async authenticate(token) {
    return {};
  }

  async onConnect(session, socket) {
  }

  async onDisconnect(session, socket) {
  }

  async onRead(session, socket, data) {
    throw new Error('Not implemented');
  }

  async _onConnect(session, socket) {
    if (this.sessionKey !== null) {
      const key = session[this.sessionKey];
      if (key in this.sessionKeyMapping) {
        if (this.kickDuplicateSessionKey === true) {
          // TODO: Disconnect the old ID

          this.sessionKeyMapping[key] = new Set([socket.id]);
        } else {
          this.sessionKeyMapping[key].add(socket.id);
        }
      } else {
        this.sessionKeyMapping[key] = new Set([socket.id]);
      }
    }

    this.onConnect(session, socket);
  }

  async _onDisconnect(session, socket) {
    if (this.sessionKey !== null) {
      const key = session[this.sessionKey];
      this.sessionKeyMapping[key].delete(socket.id);

      if (this.sessionKeyMapping[key].length === 0) {
        delete this.sessionKeyMapping[key];
      }
    }

    this.onDisconnect(session, socket);
  }

}

module.exports = MessageProcessor;
