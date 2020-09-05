const Accessor = require("./Accessor");
const assert = require('assert');
const ValidationError = require('../errors/ValidationError');

class ArrayAccessor extends Accessor {

  /**
   * Creates an instance of ArrayAccessor.
   *
   * @param {string} key - Accessor key
   * @param {Accessor} [contentAccessor=null]
   * @param {boolean} [isRequired=true]
   * @param {*} [defaultValue=undefined]
   * @memberof ArrayAccessor
   */
  constructor(key, contentAccessor, isRequired=true, defaultValue=undefined) {
    super(key, isRequired, defaultValue);

    if (contentAccessor !== null) {
      assert(contentAccessor instanceof Accessor);
    }
    this.contentAccessor = contentAccessor;
  }

  validate(body) {
    const rawValue = super.validate(body);

    if (!Array.isArray(rawValue)) {
      throw new ValidationError(
        this.keyName,
        `The value at "${this.keyName}" is not an array`,
      )
    }

    let response = rawValue;

    if (this.contentAccessor !== null) {
      response = [];
      rawValue.forEach(item => {
        response.push(this.contentAccessor.validate(item));
      })
    }

    return response;
  }
}

module.exports = ArrayAccessor;
