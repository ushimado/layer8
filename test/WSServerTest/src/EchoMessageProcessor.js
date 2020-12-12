const { MessageProcessor } = require('layer8');
const assert = require('assert');

class EchoMessageProcessor extends MessageProcessor {

  constructor() {
    super('/echo');
  }

  async onConnect(session, socket) {
  }

  async onDisconnect(session, socket) {
  }

  async onRead(session, socket, data) {
    assert(data instanceof Buffer);

    // Echo back the original message
    socket.write(data);
  }

}

module.exports = EchoMessageProcessor;
