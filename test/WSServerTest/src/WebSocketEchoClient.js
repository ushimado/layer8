const WebSocketClient = require('../../../src/WebSocketClient');
const WebSocket = require('../../../src/websocket/WebSocket');

class WebSocketEchoClient extends WebSocketClient {

  constructor() {
    const options = {};
    options[WebSocket.OPTION_EXTENSIONS] = [];
    super(options);

    this.sent = 0;
    this.received = 0;
  }

  async write(buffer) {
    this.sent ++;

    return super.write(buffer);
  }

  async onData(data) {
    this.received ++;
  }

}

module.exports = WebSocketEchoClient;
