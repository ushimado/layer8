const StringAccessor = require('./StringAccessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / Retrieves a list of strings from a string, delimited by character.  Example:
 *
 * "hello,world,how,are,you"
 *
 * Would be an example of a list of strings, delimited by comma.  The data returned would be:
 *
 * ["hello", "world", "how", "are", "you"]
 *
 * @class DelimitedStringListAccessor
 * @extends {StringAccessor}
 */
class DelimitedStringListAccessor extends StringAccessor {

  constructor(key, delimiter, isRequired=true, defaultValue=undefined) {
    super(key, isRequired, defaultValue);

    this.delimiter = delimiter;
  }

  validate(body) {
    const rawValue = super.validate(body);

    let parts = rawValue.split(this.delimiter);
    if (this.__trimItems === true) {
      parts = parts.map(part => part.trim());
    }

    if (this.__removeEmptyItems === true) {
      parts = parts.filter(part => part.length > 0);
    }

    if (this.__minItems !== undefined) {
      if (parts.length < this.__minItems) {
        throw new ValidationError(
          this.keyName,
          `A minimum of ${this.__minItems} element${this.__minItems > 1 ? 's' : ''} ${this.__minItems > 1 ? 'are' : 'is'} required`,
        )
      }
    }

    if (this.__maxItems !== undefined) {
      if (parts.length > this.__maxItems) {
        throw new ValidationError(
          this.keyName,
          `A maximum of ${this.__maxItems} element${this.__maxItems > 1 ? 's' : ''} ${this.__maxItems > 1 ? 'are' : 'is'} allowed`,
        )
      }
    }

    if (this.__length !== undefined) {
      if (parts.length !== this.__length) {
        throw new ValidationError(
          this.keyName,
          `Must contain exactly of ${this.__length} element${this.__length > 1 ? 's' : ''}`,
        )
      }
    }

    return parts;
  }

  trimItems() {
    this.__trimItems = true;

    return this;
  }

  removeEmptyItems() {
    this.__removeEmptyItems = true;
    return this;
  }

  minItems(value) {
    this.__minItems = value;
    return this;
  }

  maxItems(value) {
    this.__maxItems = value;
    return this;
  }

  length(value) {
    this.__length = value;
    return this;
  }
}

module.exports = DelimitedStringListAccessor;
