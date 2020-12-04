const assert = require('assert');
const NotImplementedError = require('../errors/NotImplementedError');
const WebSocketServer = require('../WebSocketServer');
const WebSocket = require('./WebSocket');

class MessageProcessor {

  /**
   * Creates an instance of MessageProcessor.
   *
   * @param {String} endpoint - The endpoint this message processor will be servicing.
   * @param {String} [sessionKey=null] - If a session is present, this key will link the value to
   * the connected socket.  As an example: 'accountId' - this will get the value keyed by
   * 'accountId' on the session object, and associate it with the socket id.  The message processor
   * can then reference the value when writing data to the socket, instead of the socket itself.
   * This makes adds a level of convenience for the application layer, which frees it from the
   * burden of tracking sockets.
   * @param {Boolean} [kickDuplicateSessionKey=false] - If true, any client which has authenticated
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

  /**
   * Binds the message processor instance to the websocket server instance.  This is done
   * automatically by the websocket server when it registers the message processor.
   *
   * @param {*} webSocketServer
   * @memberof MessageProcessor
   */
  bind(webSocketServer) {
    assert(webSocketServer instanceof WebSocketServer);
    assert(
      this.webSocketServer === null,
      "This message processor is already bound to a websocket server"
    );

    this.webSocketServer = webSocketServer;
  }

  /**
   *
   *
   * @param {*} session
   * @param {*} socket
   * @param {*} data
   * @returns
   * @memberof MessageProcessor
   */
  async _onRead(session, socket, data) {
    return data;
  }

  async _onWrite(data) {
    return data;
  }

  /**
   * Broadcasts data to all connected sockets registered on this message processor's endpoint.
   *
   * @param {*} data
   * @memberof MessageProcessor
   */
  async broadcast(data) {
    const sockets = this.webSocketServer.getSocketsByMessageProcessor(this);
    for (let socket of sockets) {
      await this.write(data, socket);
    }
  }

  async write(data, destination) {
    data = await this._onWrite(data);

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
        socket.write(data);
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
    throw new NotImplementedError();
  }

  async _onConnect(session, socket) {
    if (this.sessionKey !== null) {
      const key = session[this.sessionKey];
      if (key in this.sessionKeyMapping) {
        if (this.kickDuplicateSessionKey === true) {
          const oldSocketIds = [...this.sessionKeyMapping[key].values()];
          assert(oldSocketIds.length === 1);
          const server = this.webSocketServer;
          for (let socketId of oldSocketIds) {
            const socket = this.webSocketServer.getSocket(socketId);
            if (server.verbose === true) {
              console.debug(`${socket.getLogHeader()}Client kicked because user logged in with same sessionKey`);
            }
            socket.socket.end();
          }

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
