const ValidationError = require('../errors/ValidationError');
const AbstractType = require('./AbstractType');
const DataTypeUtils = require('../utils/DataTypeUtils');
const assert = require('assert');

class FloatType extends AbstractType {

  from(lowerBound) {
    assert(this._lowerBound === null);
    assert(this._isRightDataType(lowerBound));
    this._lowerBound = lowerBound;

    return this;
  }

  to(upperBound) {
    assert(this._upperBound === null);
    assert(this._isRightDataType(upperBound));
    this._upperBound = upperBound;

    return this;
  }

  test(value, isCreate) {
    value = super.test(value, isCreate);

    if (this._isNullable === true && value === null) {
      return;
    }

    if (
      typeof value !== 'number'
    ) {
      throw new ValidationError(null, 'value must be a number', value);
    }

    if (
      this._lowerBound !== null &&
      value < this._lowerBound
    ) {
      throw new ValidationError(null, `value must be greater than or equal to ${this._lowerBound}`, value);
    }

    if (
      this._upperBound !== null &&
      value > this._upperBound
    ) {
      throw new ValidationError(null, `value must be less than or equal to ${this._upperBound}`, value);
    }

    return value;
  }

  get description() {
    const description = [
      this.name()
    ];

    if (this._lowerBound !== null && this._upperBound !== null) {
      description.push(`between ${this._lowerBound} and ${this._upperBound} inclusive`);
    } else if (this._lowerBound !== null) {
      description.push(`>= ${this._lowerBound}`);
    } else if (this._upperBound !== null) {
      description.push(`<= ${this._upperBound}`);
    }

    return description.join(' ');
  }

  _isRightDataType(value) {
    return DataTypeUtils.isNumber(value);
  }

  fromString(value) {
    return parseFloat(value);
  }
}

module.exports = FloatType;
