const JSONMessageProcessor = require('./JSONMessageProcessor');
const ParseError = require('../errors/ParseError');
const NotImplementedError = require('../errors/NotImplementedError');
const assert = require('assert');
const EnumeratedMessageDefinition = require('./EnumeratedMessageDefinition');

/**
 * Layer8's preferred super class for message processing.  It requires registration of a specific
 * handler method on a per message type basis.  Message handlers should be static and stateless,
 * thus allowing them to be predefined and mapped at development time.
 *
 * @class EnumeratedMessageProcessor
 * @extends {JSONMessageProcessor}
 */
class EnumeratedMessageProcessor extends JSONMessageProcessor {

  constructor(endpoint, dataDefinition, sessionKey=null, kickDuplicateSessionKey=false) {
    super(endpoint, sessionKey, kickDuplicateSessionKey);

    const dataDefinitionInst = new dataDefinition();
    assert(dataDefinitionInst instanceof EnumeratedMessageDefinition);
    this.endpoint = endpoint;
    this.__dataDefinition = dataDefinitionInst;

    const validTypes = dataDefinitionInst.definition.type.collection;
    const messageHandlerMappingSet = new Set(Object.keys(this.messageHandlerMapping));
    assert(
      messageHandlerMappingSet.size === validTypes.length,
      `The types enumerated in ${dataDefinitionInst.definition.type.name} must match the types in the messageHandlerMapping`
    );
    validTypes.forEach(type => {
      assert(messageHandlerMappingSet.has(type), `${type} is missing from the messageHandlerMapping`);
    })

    this.webSocketServer = null;
    this.sessionKey = sessionKey;
    this.kickDuplicateSessionKey = kickDuplicateSessionKey;
    this.sessionKeyMapping = {};
  }

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
    if (this.__dataDefinition === null) {
      return null;
    }

    data = await super._onRead(session, socket, data);
    return this.__dataDefinition.test(data);
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
    if (data === null) {
      // Processor is receiving data but was not configured to receive
      socket.socket.end();
    }
    const messageMapping = this.messageHandlerMapping;
    await messageMapping[data.type](session, socket, data);
  }

  /**
   * Returns a mapping between message type (string) and processing method.  Each processing method
   * receives 3 arguments.
   *
   *  - session
   *  - socket (a WebSocket instance)
   *  - data (the validated message)
   *
   * @readonly
   * @returns {Object} - Mapping from message type to handler
   * @memberof EnumeratedMessageProcessor
   */
  get messageHandlerMapping() {
    throw new NotImplementedError();
  }
}

module.exports = EnumeratedMessageProcessor;
