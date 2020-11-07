const assert = require('assert');
const querystring = require('querystring');
const crypto = require('crypto');
const { write } = require('fs');

class WebSocket {

  /**
   * Creates an instance of WebSocket.
   *
   * @param {*} socket
   * @memberof WebSocket
   */
  constructor(webSocketServer, socket, id=null, verbose=false) {
    socket.on('data', (data) => this.onData(data));
    socket.on('close', () => this.onClose());

    this.id = id;
    this.socket = socket;
    this.webSocketServer = webSocketServer;
    this.verbose = verbose;

    this.request = null;
    this.extensions = null;
    this.session = null;
  }

  async onData(data) {
    assert(data instanceof Buffer)
    if (this.request === null) {
      if (this.verbose === true) {
        console.debug(`${this.getLogHeader()}Received handshake request\n${data.toString()}`)
      }

      const result = this.webSocketServer.doHandshake(this, data);
      if (result !== null) {
        const [
          request,
          extensions,
          session,
        ] = result;

        this.request = request;
        this.extensions = extensions;
        this.session = session;

        return;
      }

      // Perform regular data processing
    }
  }

  async onClose() {
    if (this.verbose === true) {
      console.debug(`${this.getLogHeader()}Connection closed`)
    }
    this.webSocketServer.cleanup(this);
  }

  getLogHeader() {
    return `WebSocket:${this.id}: `;
  }
}

module.exports = WebSocket;
