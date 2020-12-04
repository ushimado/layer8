const AbstractType = require('./AbstractType');
const ValidationError = require('../errors/ValidationError');
const NotImplementedError = require('../errors/NotImplementedError');
const assert = require('assert');

class EnumType extends AbstractType {

  constructor(defaultVal=undefined) {
    super(defaultVal);

    const collection = this.collection;
    assert(Array.isArray(this.collection));

    collection.forEach(item => {
      assert(typeof item === 'string');
    })

    this.__lookup = new Set(this.collection);
  }

  /**
   * Must be implemented in a subclass, and should return a statically declared array.
   *
   * @readonly
   * @returns {Array}
   * @memberof EnumType
   */
  get collection() {
    throw new NotImplementedError();
  }

  test(value, isCreate) {
    value = super.test(value, isCreate);

    if (this._isNullable === true && value === null) {
      return;
    }

    if (!this.__lookup.has(value)) {
      throw new ValidationError(null, `not a member of ${this.name}`, value);
    }

    return value;
  }

  get description() {
    const description = [
      'Members include:',
      '<ul>',
    ];

    this.collection.forEach(item => {
      description.push(`<li>${item}</li>`)
    })

    description.push('</ul>');

    return description.join('');
  }

}

module.exports = EnumType;
