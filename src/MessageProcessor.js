const assert = require('assert');

class MessageProcessor {

  constructor(endpoint, messageTypes) {
    assert(Array.isArray(messageTypes));

    this.endpoint = endpoint;

    messageTypes.forEach(messageType => {
      assert(messageType.toUpperCase().split('_').join('_') === messageType);
    })
    this.messageTypes = new Set(messageTypes);
  }

  async authenticate(token) {
    return {};
  }

  async onConnect(session, socket) {

  }

  async onDisconnect(session, socket) {

  }

  __process(message) {
    const type = message.type;
    if (!this.messageTypes.has(type)) {
      return false;
    }
  }
}

module.exports = MessageProcessor;
