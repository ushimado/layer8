const Accessor = require('./Accessor');
const ValidationError = require('../errors/ValidationError');

class NumericAccessor extends Accessor {

  validate(body) {
    const rawValue = super.validate(body);

    if (
      Array.isArray(rawValue) ||
      (parseFloat(rawValue) !== rawValue)
    ) {
      throw new ValidationError(
        this.keyName,
        `The value at "${this.keyName}" is not numeric`,
      )
    }

    return rawValue;
  }

}

module.exports = NumericAccessor;
