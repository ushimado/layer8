const Accessor = require('./Accessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves a string
 *
 * @class StringAccessor
 * @extends {Accessor}
 */
class StringAccessor extends Accessor {

  /**
   * Sets the length range for valid strings.
   *
   * @param {number} minLength
   * @param number} maxLength
   * @memberof StringAccessor
   */
  range(minLength=undefined, maxLength=undefined) {
    this.minLength = minLength;
    this.maxLength = maxLength;

    return this;
  }

  validate(body) {
    const rawValue = super.validate(body);

    if (rawValue === undefined || rawValue !== rawValue.toString()) {
      throw new ValidationError(
        this.keyName,
        `The value${this.keyPositionStr()}is not a string`);
    }

    if (this.minLength !== undefined && rawValue < this.minLength) {
      throw new ValidationError(
        this.keyName,
        `The string${this.keyPositionStr()}must be at least ${this.minLength} characters long`
      );
    }

    if (this.maxLength !== undefined && rawValue.length > this.maxLength) {
      throw new ValidationError(
        this.keyName,
        `The string${this.keyPositionStr()}exceeds the maximum length of ${this.maxLength} characters`
      );
    }

    return rawValue;
  }

}

module.exports = StringAccessor;
