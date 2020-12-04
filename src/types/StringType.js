const ValidationError = require('../errors/ValidationError');
const ArrayType = require('./ArrayType');
const assert = require('assert');

class StringType extends ArrayType {

  constructor(defaultVal=undefined) {
    super(defaultVal);

    this.__trim = false;
  }

  test(value, isCreate) {
    value = super.test(value, isCreate);

    if (this._isNullable === true && value === null) {
      return;
    }

    if (
      typeof value !== 'string'
    ) {
      throw new ValidationError(null, 'value must be a string', value);
    }

    if (this.__trim === true) {
      value = value.trim();
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
      throw new ValidationError(null, `must contain at least ${this._lowerBound} characters`, value);
    }

    if (
      this._upperBound !== null &&
      value.length > this._upperBound
    ) {
      throw new ValidationError(null, `must contain at most ${this._upperBound} characters`, value);
    }

    return value;
  }

  trim() {
    assert(this.__trim === false);
    this.__trim = true;

    return this;
  }

  get description() {
    const description = [
      this.name()
    ];

    if (this._lowerBound === null) {
      description.push('which cannot be empty')
    }

    if (this._lowerBound !== null && this._upperBound !== null) {
      description.push(`between ${this._lowerBound} and ${this._upperBound} characters inclusive`);
    } else if (this._lowerBound !== null) {
      description.push(`of at least ${this._lowerBound} characters`);
    } else if (this._upperBound !== null) {
      description.push(`of at most ${this._upperBound} characters`);
    }

    return description.join(' ');
  }

}

module.exports = StringType;
