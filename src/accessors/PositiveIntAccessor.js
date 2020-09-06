const IntAccessor = require('./IntAccessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves a positive integer (where 0 is optionally valid)
 *
 * @class PositiveIntAccessor
 * @extends {IntAccessor}
 */
class PositiveIntAccessor extends IntAccessor {

  constructor(key, isRequired=true, defaultValue=undefined, allowZero=false) {
    super(key, isRequired, defaultValue);
    this.allowZero = allowZero;
  }

  validate(body) {
    const rawValue = super.validate(body);
    if (rawValue < (this.allowZero ? 1 : 0)) {
      throw new ValidationError(
        this.keyName,
        `The value${this.keyPositionStr()}is not a positive integer`
      );
    }

    return rawValue;
  }

}

module.exports = PositiveIntAccessor;
