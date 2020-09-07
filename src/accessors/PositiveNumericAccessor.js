const NumericAccessor = require('./NumericAccessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves a positive number (can be floating point or integer)
 *
 * @class PositiveNumericAccessor
 * @extends {NumericAccessor}
 */
class PositiveNumericAccessor extends NumericAccessor {

  /**
   * Sets whether or not zero is allowed.  By default zero is allowed.
   *
   * @param {*} [allow=undefined]
   * @memberof PositiveIntAccessor
   */
  allowZero(allow=undefined) {
    this.allowZero = allow;

    return this;
  }

  validate(body) {
    const rawValue = super.validate(body);
    if (rawValue < (this.allowZero === false ? 1 : 0)) {
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
