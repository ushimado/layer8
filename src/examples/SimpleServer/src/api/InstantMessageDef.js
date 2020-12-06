const InstantMessageEnumDef = require('./InstantMessageEnumDef');
const { EnumeratedMessageDefinition } = require("layer8");
const {
  DefinitionRegistry,
  StringType,
} = require('ensuredata');

class InstantMessageDef extends EnumeratedMessageDefinition {

  get enumTypeDef() {
    return InstantMessageEnumDef;
  }

  get definition() {
    return {
      ...super.definition,
      text: new StringType().maxLength(255),
    }
  }

}

DefinitionRegistry.register(InstantMessageDef);

module.exports = InstantMessageDef;
