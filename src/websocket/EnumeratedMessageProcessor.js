const JSONMessageProcessor = require('./JSONMessageProcessor');
const NotImplementedError = require('../errors/NotImplementedError');
const assert = require('assert');
const EnumeratedMessageDefinition = require('./EnumeratedMessageDefinition');
const { DefinitionRegistry } = require('ensuredata');

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
    assert(
      DefinitionRegistry.isValidatorSuperClass(dataDefinitionInst),
      `${dataDefinition.name} does not appear to be registered with the DefinitionRegistry`
    );
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
    });

    // Ensure that each enumeration has been covered
    dataDefinitionInst.definition.type.collection.forEach(enumeration => {
      const testObj = {
        type: enumeration,
      }

      try {
        DefinitionRegistry.getValidatorInstance(dataDefinitionInst, testObj);
      } catch(e) {
        assert(
          false,
          `${enumeration} from ${dataDefinition.name} does not have a registered validator in DefinitionRegistry.  Please ensure that the corresponding subclass of ${dataDefinition.name} has been imported, and is registered.`
        );
      }
    });

    this.webSocketServer = null;
    this.sessionKey = sessionKey;
    this.kickDuplicateSessionKey = kickDuplicateSessionKey;
    this.sessionKeyMapping = {};

    // Store it
    this.__messageHandlerMapping = this.messageHandlerMapping;
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
    const messageMapping = this.__messageHandlerMapping;
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
