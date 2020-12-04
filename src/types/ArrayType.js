const ValidationError = require('../errors/ValidationError');
const AbstractType = require('./AbstractType');
const DataTypeUtils = require('../utils/DataTypeUtils');
const assert = require('assert');

class ArrayType extends AbstractType {

  constructor(defaultVal=undefined) {
    super(defaultVal);

    this.__ofType = null;
    this.__noDuplicates = false;
  }

  minLength(minChars) {
    assert(DataTypeUtils.isInteger(minChars));
    assert(this._lowerBound === null);
    this._lowerBound = minChars;

    return this;
  }

  maxLength(maxChars) {
    assert(DataTypeUtils.isInteger(maxChars));
    assert(this._upperBound === null);
    this._upperBound = maxChars;

    return this;
  }

  ofType(dataType) {
    assert(this.__ofType === null);
    assert(dataType instanceof AbstractType);
    this.__ofType = dataType;

    return this;
  }

  noDuplicates() {
    assert(this.__noDuplicates === false);
    this.__noDuplicates = true;

    return this;
  }

  test(value, isCreate, onlySuper=false) {
    value = super.test(value, isCreate);
    let newValue = value;

    if (onlySuper === false) {
      if (this._isNullable === true && value === null) {
        return value;
      }

      if (!Array.isArray(value)) {
        throw new ValidationError(null, 'must be an array', value);
      }

      if (
        this._lowerBound === null &&
        value.length === 0
      ) {
        throw new ValidationError(null, `cannot be empty`, value);
      } else if (
        this._lowerBound !== null &&
        value.length < this._lowerBound
      ) {
        throw new ValidationError(null, `must contain at least ${this._lowerBound} elements`, value);
      }

      if (
        this._upperBound !== null &&
        value.length > this._upperBound
      ) {
        throw new ValidationError(null, `must contain at most ${this._upperBound} elements`, value);
      }

      if (this.__ofType !== null) {
        newValue = [];
        value.forEach(element => {
          newValue.push(this.__ofType.test(element, isCreate));
        })
      } else {
        newValue = value;
      }

      if (this.__noDuplicates === true) {
        // Consume the array into a set and ensure the size matches the original size.  This is a
        // trivial comparison used for numbers and strings only.

        const set = new Set(newValue);
        if (set.size !== newValue.length) {
          throw new ValidationError(null, 'duplicate elements not allowed', value);
        }
      }
    }

    return newValue;
  }

  get description() {
    const description = [
      this.name()
    ];

    if (this._lowerBound === null) {
      description.push('which cannot be empty')
    }

    if (this._lowerBound !== null && this._upperBound !== null) {
      description.push(`between ${this._lowerBound} and ${this._upperBound} elements inclusive`);
    } else if (this._lowerBound !== null) {
      description.push(`of at least ${this._lowerBound} elements`);
    } else if (this._upperBound !== null) {
      description.push(`of at most ${this._upperBound} elements`);
    }

    return description.join(' ');
  }

  fromString(value) {
    try {
      return JSON.parse(value);
    } catch(e) {
      throw new ValidationError(null, 'could not be parsed from string', value);
    }
  }
}

module.exports = ArrayType;
