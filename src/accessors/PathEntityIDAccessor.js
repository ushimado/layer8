const Accessor = require('./Accessor');
const ValidationError = require('../errors/ValidationError');

class PathEntityIDAccessor extends Accessor {

  constructor(key, isRequired=true, defaultValue=undefined) {
    super(key, isRequired, defaultValue, false);
  }

  validate(body) {
    let rawValue = super.validate(body);
    if (typeof rawValue !== "string") {
      throw new ValidationError(
        this.keyName,
        `Path entity ID at "${this.keyName}" must be a string representation of a numeric value`,
      );
    }

    rawValue = parseInt(rawValue);
    if (isNaN(rawValue)) {
      throw new ValidationError(
        this.keyName,
        `The value at "${this.keyName}" is not an integer`,
      );
    }

    if (rawValue < 1) {
      throw new ValidationError(
        this.keyName,
        `Entity ID at "${this.keyName}" must be > 0`,
      )
    }

    return rawValue;
  }

}

module.exports = PathEntityIDAccessor;
