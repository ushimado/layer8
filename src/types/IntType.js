const ValidationError = require('../errors/ValidationError');
const FloatType = require('./FloatType');
const DataTypeUtils = require('../utils/DataTypeUtils');

class IntType extends FloatType {

  test(value, isCreate) {
    value = super.test(value, isCreate);

    if (this._isNullable === true && value === null) {
      return;
    }

    super.test(value, isCreate);
    if (Math.floor(value) !== value) {
      throw new ValidationError(null, 'value must be an integer', value);
    }

    return value;
  }

  _isRightDataType(value) {
    return DataTypeUtils.isInteger(value);
  }

  fromString(value) {
    return parseInt(value);
  }
}

module.exports = IntType;
