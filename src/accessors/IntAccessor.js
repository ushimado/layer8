const Accessor = require('./Accessor');
const ValidationError = require('../errors/ValidationError');

class IntAccessor extends Accessor {

  validate(body) {
    const rawValue = super.validate(body);

    if (
      Array.isArray(rawValue) ||
      (parseInt(rawValue) !== rawValue)
    ) {
      throw new ValidationError(
        this.keyName,
        `The value at "${this.keyName}" is not an integer`,
      )
    }

    return rawValue;
  }

}

module.exports = IntAccessor;
