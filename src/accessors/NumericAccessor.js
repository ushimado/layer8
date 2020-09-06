const Accessor = require('./Accessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves a number
 *
 * @class NumericAccessor
 * @extends {Accessor}
 */
class NumericAccessor extends Accessor {

  /**
   * Sets the range of the accessor.  Both arguments are optional.  Since it returns the instance,
   * it can easily be used alongside the constructor when creating static instances:
   *
   * const MY_VALIDATOR = new NumericAccessor('age').range(0, 200);
   *
   * @param {*} [lower=undefined]
   * @param {*} [upper=undefined]
   * @returns
   * @memberof NumericAccessor
   */
  range(lower=undefined, upper=undefined) {
    this.lower = lower;
    this.upper = upper;

    return this;
  }

  validate(body) {
    const rawValue = super.validate(body);

    if (
      Array.isArray(rawValue) ||
      (parseFloat(rawValue) !== rawValue)
    ) {
      throw new ValidationError(
        this.keyName,
        `The value${this.keyPositionStr()}is not numeric`,
      )
    }

    this._validateRange(rawValue);

    return rawValue;
  }


  /**
   * Validates the data for range if specified.
   *
   * @param {*} value - The value to be evaluated
   * @memberof NumericAccessor
   */
  _validateRange(value) {
    if (this.lower !== undefined) {
      if (value < this.lower) {
        throw new ValidationError(
          this.keyName,
          `The value${this.keyPositionStr()} is below the specified range`,
        )
      }
    }

    if (this.upper !== undefined) {
      if (value > this.upper) {
        throw new ValidationError(
          this.keyName,
          `The value${this.keyPositionStr()} is above the specified range`,
        )
      }
    }
  }

}

module.exports = NumericAccessor;
