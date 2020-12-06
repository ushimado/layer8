const InstantMessageDef = require("./InstantMessageDef");
const InstantMessageEnumDef = require('./InstantMessageEnumDef');
const { DefinitionRegistry } = require('ensuredata');

class TextMessageDef extends InstantMessageDef {

  get typeName() {
    return InstantMessageEnumDef.TEXT_MESSAGE;
  }

}

DefinitionRegistry.register(TextMessageDef);

module.exports = TextMessageDef;
