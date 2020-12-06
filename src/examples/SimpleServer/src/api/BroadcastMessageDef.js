const InstantMessageDef = require("./InstantMessageDef");
const InstantMessageEnumDef = require('./InstantMessageEnumDef');
const { DefinitionRegistry } = require('ensuredata');

class BroadcastMessageDef extends InstantMessageDef {

  get typeName() {
    return InstantMessageEnumDef.TEXT_BROADCAST;
  }

}

DefinitionRegistry.register(BroadcastMessageDef);

module.exports = BroadcastMessageDef;
