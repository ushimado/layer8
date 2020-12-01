const MessageProcessor = require('./MessageProcessor');
const assert = require('assert');
const { exception } = require('console');
const ParseError = require('../errors/ParseError');

class JSONMessageProcessor extends MessageProcessor {

  async _onRead(session, socket, data) {
    assert(data instanceof Buffer);
    const jsonString = data.toString();
    try {
      const jsonData = JSON.parse(jsonString);
      return jsonData;
    } catch(e) {
      throw new ParseError('Error during JSON deserialization');
    }
  }

  async _onWrite(data) {
    assert(data instanceof Object);
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString);
  }

}

module.exports = JSONMessageProcessor;
