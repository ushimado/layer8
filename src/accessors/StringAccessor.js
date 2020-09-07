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
  range(minLength = undefined, maxLength = undefined) {
    this.minLength = minLength;
    this.maxLength = maxLength;

    return this;
  }

  /**
   * Trims input prior to length validation.  Returned output will be trimmed.
   *
   * @memberof StringAccessor
   */
  trim() {
    this.trimInput = true;

    return this;
  }

  /**
   * Throws ValidationError on validate if spaces are present in the input.  If used in conjunction
   * with trim, only spaces in between non-space characters will cause validate to throw.
   *
   * @memberof StringAccessor
   */
  noSpaces() {
    this.noSpaces = true;

    return this;
  }

  validate(body) {
    let rawValue = super.validate(body);

    if (rawValue === undefined || rawValue !== rawValue.toString()) {
      throw new ValidationError(
        this.keyName,
        `The value${this.keyPositionStr()}is not a string`);
    }

    if (this.trimInput === true) {
      rawValue = rawValue.trim();
    }

    if (this.minLength !== undefined && rawValue.length < this.minLength) {
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

    if (this.noSpaces === true && rawValue.includes(' ')) {
      throw new ValidationError(
        this.keyName,
        `The string${this.keyPositionStr()}must not contain any spaces`
      );
    }

    return rawValue;
  }

}

module.exports = StringAccessor;
