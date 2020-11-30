const JSONMessageProcessor = require('./JSONMessageProcessor');
const ParseError = require('../errors/ParseError');
const EnumeratedMessage = require('./EnumeratedMessage');
const assert = require('assert');

/**
 * Layer8's preferred super class for message processing.  It requires registration of a specific
 * handler method on a per message type basis.  Message handlers should be static and stateless,
 * thus allowing them to be predefined and mapped at development time.
 *
 * @class EnumeratedMessageProcessor
 * @extends {JSONMessageProcessor}
 */
class EnumeratedMessageProcessor extends JSONMessageProcessor {

  /**
   * Processes incoming data into a EnumeratedMessage and returns it.
   *
   * @param {Object} session
   * @param {WebSocket} socket
   * @param {Buffer} data
   * @returns
   * @memberof EnumeratedMessageProcessor
   */
  async _onRead(session, socket, data) {
    data = await super._onRead(session, socket, data);
    if (!(EnumeratedMessageProcessor.TYPE_KEY in data)) {
      throw new ParseError('Missing message type key')
    }
    if (!(EnumeratedMessageProcessor.BODY_KEY in data)) {
      throw new ParseError('Missing message body')
    }

    return new EnumeratedMessage(
      data.type,
      data.body,
    );
  }

  /**
   * Processes a EnumeratedMessage into a JSON object suitable for string serialization.
   *
   * @param {EnumeratedMessage} data
   * @returns
   * @memberof EnumeratedMessageProcessor
   */
  async _onWrite(data) {
    assert(data instanceof EnumeratedMessage);
    const payload = {};
    payload[EnumeratedMessageProcessor.TYPE_KEY] = data.type;
    payload[EnumeratedMessageProcessor.BODY_KEY] = data.body;
    payload[EnumeratedMessageProcessor.STATUS_KEY] = data.status;

    return super._onWrite(payload);
  }

  /**
   * Implements the onRead interface and invokes the appropriate message handler based on message
   * type.
   *
   * @param {Object} session
   * @param {WebSocket} socket
   * @param {EnumeratedMessage} data
   * @memberof EnumeratedMessageProcessor
   */
  async onRead(session, socket, data) {
    assert(data instanceof EnumeratedMessage);

    const messageMapping = this.messageHandlerMapping;
    if (!(data.type in messageMapping)) {
      throw new ParseError(`Message type "${data.type}" is not a supported by this message processor`)
    }

    await messageMapping[data.type](session, socket, data.body);
  }

  /**
   * Returns a mapping between message type (string) and processing method.  Each processing method
   * receives 3 arguments.
   *
   *  - session
   *  - socket (a WebSocket instance)
   *  - body (the EnumeratedMessage body)
   *
   * @readonly
   * @returns {Object} - Mapping from message type to handler
   * @memberof EnumeratedMessageProcessor
   */
  get messageHandlerMapping() {
    throw Error('Not implemented');
  }
}

EnumeratedMessageProcessor.TYPE_KEY = 'type';
EnumeratedMessageProcessor.BODY_KEY = 'body';
EnumeratedMessageProcessor.STATUS_KEY = 'status';

module.exports = EnumeratedMessageProcessor;
