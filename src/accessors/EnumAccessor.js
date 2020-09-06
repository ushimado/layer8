const Accessor = require('./Accessor');
const assert = require('assert');

class EnumAccessor extends Accessor {

  constructor(key, validSet, isRequired=true, defaultValue=undefined) {
    assert(validSet instanceof Set);
    super(key, isRequired, defaultValue);

    this.validSet = validSet;
  }

  validate(body) {
    const rawValue = super.validate(body);

    if (!this.validSet.has(rawValue)) {
      throw new ValidationError(
        this.keyName,
        `The value${this.keyPositionStr()}is not part of the collection`,
      );
    }

    return rawValue;
  }
}

module.exports = EnumAccessor;
