const {
  AbstractDataDefinition,
  EnumType,
} = require('ensuredata');
const NotImplementedError = require('../errors/NotImplementedError');
const assert = require('assert');

class EnumeratedMessageDefinition extends AbstractDataDefinition {

  constructor() {
    super();

    const enumTypeInst = new this.enumTypeDef();
    assert(enumTypeInst instanceof EnumType);

    this.__definition = {
      type: enumTypeInst,
    }
  }

  get enumTypeDef() {
    throw new NotImplementedError();
  }

  get definition() {
    return this.__definition;
  }

  get typeKey() {
    return 'type';
  }

}

module.exports = EnumeratedMessageDefinition;
