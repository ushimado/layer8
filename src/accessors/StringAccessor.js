const Accessor = require('./Accessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves a string
 *
 * @class StringAccessor
 * @extends {Accessor}
 */
class StringAccessor extends Accessor {

  constructor(key, isRequired=true, defaultValue=undefined, minLength=0, maxLength=null) {
    super(key, isRequired, defaultValue);

    this.minLength = minLength;
    this.maxLength = maxLength;
  }

  validate(body) {
    const rawValue = super.validate(body);

    if (rawValue === undefined || rawValue !== rawValue.toString()) {
      throw new ValidationError(
        this.keyName,
        `The value at "${this.keyName}" is not a string`);
    }

    if (rawValue.length < this.minLength) {
      throw new ValidationError(
        this.keyName,
        `The string at "${this.keyName}" must be at least ${this.minLength} characters long`
      );
    }

    if (this.maxLength !== null && rawValue.length > this.maxLength) {
      throw new ValidationError(
        this.keyName,
        `The string at "${this.keyName}" exceeds the maximum length of ${this.minLength} characters`
      );
    }

    return rawValue;
  }

}

module.exports = StringAccessor;
