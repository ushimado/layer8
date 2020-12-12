// Importing not from the referenced module because this is not a supported component
const WebSocketClient = require('../../../WebSocketClient');

class MyWebsocketClient extends WebSocketClient {

  async onConnect() {
    console.log("Connected to server");
  }

  async onDisconnect(hadError) {
    console.log("Disconnected from server");
  }

  async onData(data) {
    console.log("Received message");
    console.log(data.toString());
  }

}

module.exports = MyWebsocketClient;
