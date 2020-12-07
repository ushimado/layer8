const InstantMessageDef = require("./InstantMessageDef");
const InstantMessageEnumDef = require('./InstantMessageEnumDef');

class TextMessageDef extends InstantMessageDef {

  get typeName() {
    return InstantMessageEnumDef.TEXT_MESSAGE;
  }

}

module.exports = TextMessageDef;
