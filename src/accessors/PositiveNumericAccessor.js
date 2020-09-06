const NumericAccessor = require('./NumericAccessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves a positive number (can be floating point or integer)
 *
 * @class PositiveNumericAccessor
 * @extends {NumericAccessor}
 */
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
        `The value${this.keyPositionStr()}is not a positive number`
      );
    }

    this._validateRange(rawValue);

    return rawValue;
  }

}

module.exports = PositiveNumericAccessor;
