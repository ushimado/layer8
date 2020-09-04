const ValidationError = require('../errors/ValidationError');

class Accessor {

  constructor(key, isRequired=true, defaultValue=undefined) {
    this.keyName = key;
    this.keyParts = key.split('.');
    this.isRequired = isRequired;
    this.defaultValue = defaultValue;
  }

  read(body) {
    let currentObj = body;
    for (let keyPart of this.keyParts) {
      if (!currentObj.hasOwnProperty(keyPart)) {
        if (this.isRequired === true) {
          return undefined;
        }

        return this.defaultValue;
      }

      currentObj = body[keyPart];
    }

    return currentObj;
  }

  write(value, body=null) {
    let target = body;
    if (body === null) {
      target = {};
    }

    const root = target;

    this.keyParts.forEach((keyPart, index) => {
      if (index === this.keyParts.length - 1) {
        target[keyPart] = value;
      } else {
        target[keyPart] = {};
        target = target[keyPart];
      }
    });

    return root;
  }

  validate(body) {
    const rawValue = this.read(body);

    if (rawValue === undefined && this.isRequired === true) {
      throw new ValidationError(
        this.keyName,
        `The required key "${this.keyName}" was not present on the body`,
      );
    }

    return rawValue;
  }

  static validateAll(body, accessors) {
    const validated = [];
    accessors.forEach(accessor => {
      validated.push(accessor.validate(body));
    })

    return validated;
  }

}

module.exports = Accessor;
