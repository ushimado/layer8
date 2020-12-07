const InstantMessageDef = require('./InstantMessageDef');
const TextMessageDef = require('./TextMessageDef');
const BroadcastMessageDef = require('./BroadcastMessageDef');
const { DefinitionRegistry } = require('ensuredata');

class ValidatorRegistration {

  static DEFINITIONS = [
    InstantMessageDef,
    TextMessageDef,
    BroadcastMessageDef,
  ]

  static register() {
    console.log('Validators registered');
    ValidatorRegistration.DEFINITIONS.forEach(definition => DefinitionRegistry.register(definition));
  }

}

module.exports = ValidatorRegistration;
