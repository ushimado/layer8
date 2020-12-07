const InstantMessageEnumDef = require('./InstantMessageEnumDef');
const { EnumeratedMessageDefinition } = require("layer8");
const {
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

module.exports = InstantMessageDef;
