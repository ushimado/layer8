const IntAccessor = require('./IntAccessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves a positive integer (where 0 is optionally valid)
 *
 * @class PositiveIntAccessor
 * @extends {IntAccessor}
 */
class PositiveIntAccessor extends IntAccessor {

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
        `The value${this.keyPositionStr()}is not a positive integer`
      );
    }

    this._validateRange(rawValue);

    return rawValue;
  }

}

module.exports = PositiveIntAccessor;
