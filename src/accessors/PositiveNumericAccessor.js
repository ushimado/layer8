const NumericAccessor = require('./NumericAccessor');
const ValidationError = require('../errors/ValidationError');

class PositiveNumericAccessor extends NumericAccessor {

  constructor(key, isRequired=true, defaultValue=undefined, allowZero=true) {
    super(key, isRequired, defaultValue);
    this.allowZero = allowZero;
  }

  validate(body) {
    const rawValue = super.validate(body);
    if (rawValue < (this.allowZero ? 1 : 0)) {
      throw new ValidationError(
        this.keyName,
        `The value at "${this.keyName}" is not a positive number`
      );
    }

    return rawValue;
  }

}

module.exports = PositiveNumericAccessor;
