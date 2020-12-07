const InstantMessageDef = require("./InstantMessageDef");
const InstantMessageEnumDef = require('./InstantMessageEnumDef');

class BroadcastMessageDef extends InstantMessageDef {

  get typeName() {
    return InstantMessageEnumDef.TEXT_BROADCAST;
  }

}

module.exports = BroadcastMessageDef;
