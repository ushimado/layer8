
const _ = require('lodash');
const assert = require('assert');
const NotImplementedError = require('../errors/NotImplementedError');
const ValidationError = require('../errors/ValidationError');

class AbstractType {

  constructor(defaultVal=undefined) {
    this._lowerBound = null;
    this._upperBound = null;
    this._isNullable = false;

    this.__defaultVal = defaultVal;
    this.__afterCreate = false;
  }

  test(value, isCreate) {
    if (value === undefined) {
      if (this.defaultVal === undefined) {
        throw new ValidationError(null, 'value is required', value);
      } else {
        value = this.defaultVal;
      }
    }

    return value;
  }

  onlyAfterCreate() {
    assert(this.__afterCreate === false);
    this.__afterCreate = true;

    return this;
  }

  nullable() {
    assert(this._isNullable === false);
    this._isNullable = true;

    return this;
  }

  get description() {
    throw new NotImplementedError();
  }

  get name() {
    return this.constructor.name;
  }

  get isOnlyAfterCreate() {
    return this.__afterCreate;
  }

  get defaultVal() {
    if (this.__defaultVal instanceof Object) {
      // Always make a clone of a default value, unless it's an immutable type such as a string or
      // number
      return _.cloneDeep(this.__defaultVal);
    }

    return this.__defaultVal;
  }

  fromString(value) {
    return value;
  }
}

module.exports = AbstractType;
