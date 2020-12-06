const { EnumType } = require('ensuredata');

class InstantMessageEnumDef extends EnumType {

  static TEXT_MESSAGE = "TEXT_MESSAGE";
  static TEXT_BROADCAST = "TEXT_BROADCAST";

  static COLLECTION = [
    InstantMessageEnumDef.TEXT_MESSAGE,
    InstantMessageEnumDef.TEXT_BROADCAST,
  ]

  get collection() {
    return InstantMessageEnumDef.COLLECTION;
  }

}

module.exports = InstantMessageEnumDef;
