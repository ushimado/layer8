const MessageProcessor = require('./MessageProcessor');
const assert = require('assert');

class JSONMessageProcessor extends MessageProcessor {

  async _onRead(session, socket, data) {
    assert(data instanceof Buffer);
    const jsonString = data.toString();
    const jsonData = JSON.parse(jsonString);

    return this.onRead(session, socket, jsonData);
  }

  async _onWrite(data) {
    assert(data instanceof Object);
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString);
  }

}

module.exports = JSONMessageProcessor;
