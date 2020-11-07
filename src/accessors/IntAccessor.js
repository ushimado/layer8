const NumericAccessor = require('./NumericAccessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves an integer
 *
 * @class IntAccessor
 * @extends {NumericAccessor}
 */
class IntAccessor extends NumericAccessor {

  validate(body) {
    const rawValue = super.validate(body);

    if (
      Array.isArray(rawValue) ||
      (this.__fromString === undefined && parseInt(rawValue) !== rawValue) ||
      (this.__fromString === true && isNaN(parseInt(rawValue)))
    ) {
      throw new ValidationError(
        this.keyName,
        `The value${this.keyPositionStr()}is not an integer`,
      );
    }

    this._validateRange(rawValue);

    return rawValue;
  }

}

module.exports = IntAccessor;
