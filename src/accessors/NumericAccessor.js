const Accessor = require('./Accessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves a number
 *
 * @class NumericAccessor
 * @extends {Accessor}
 */
class NumericAccessor extends Accessor {

  validate(body) {
    const rawValue = super.validate(body);

    if (
      Array.isArray(rawValue) ||
      (parseFloat(rawValue) !== rawValue)
    ) {
      throw new ValidationError(
        this.keyName,
        `The value${this.keyPositionStr()}is not numeric`,
      )
    }

    return rawValue;
  }

}

module.exports = NumericAccessor;
