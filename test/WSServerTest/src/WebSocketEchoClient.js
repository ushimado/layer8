const WebSocketClient = require('../../../src/WebSocketClient');

class WebSocketEchoClient extends WebSocketClient {

  constructor() {
    super();

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
