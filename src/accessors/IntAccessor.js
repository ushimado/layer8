const Accessor = require('./Accessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves an integer
 *
 * @class IntAccessor
 * @extends {Accessor}
 */
class IntAccessor extends Accessor {

  validate(body) {
    const rawValue = super.validate(body);

    if (
      Array.isArray(rawValue) ||
      (parseInt(rawValue) !== rawValue)
    ) {
      throw new ValidationError(
        this.keyName,
        `The value${this.keyPositionStr()}is not an integer`,
      )
    }

    return rawValue;
  }

}

module.exports = IntAccessor;
