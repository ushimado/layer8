const WebSocketClient = require('../../../src/WebSocketClient');

class WebSocketEchoClient extends WebSocketClient {

  static counter = 0;

  constructor() {
    super();

    this.sent = 0;
    this.received = 0;
    this.myId = ++WebSocketEchoClient.counter;
  }

  async write(buffer) {
    this.sent ++;

    return super.write(buffer);
  }

  async onData(data) {

    this.received ++;
  }

  async onConnect() {
    console.log(`${this.myId} Connected`);
  }

}

module.exports = WebSocketEchoClient;
