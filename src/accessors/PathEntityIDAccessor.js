const Accessor = require('./Accessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves an entity ID, allowing for string representations of numeric IDs to be
 * converted to integers.  Following database serials, entity IDs are assumed to start from one
 * and be positive integers.
 *
 * @class PathEntityIDAccessor
 * @extends {Accessor}
 */
class PathEntityIDAccessor extends Accessor {

  constructor(key, isRequired=true, defaultValue=undefined) {
    super(key, isRequired, defaultValue, false);
  }

  validate(body) {
    let rawValue = super.validate(body);
    if (typeof rawValue !== "string") {
      throw new ValidationError(
        this.keyName,
        `Path entity ID${this.keyPositionStr()}must be a string representation of a numeric value`,
      );
    }

    const parsed = parseInt(rawValue);
    if (
      isNaN(parsed) ||
      parsed.toString() !== rawValue.toString()
    ) {
      throw new ValidationError(
        this.keyName,
        `The value${this.keyPositionStr()}is not an integer`,
      );
    }

    if (parsed < 1) {
      throw new ValidationError(
        this.keyName,
        `Entity ID${this.keyPositionStr()}must be > 0`,
      )
    }

    return parsed;
  }

}

module.exports = PathEntityIDAccessor;
