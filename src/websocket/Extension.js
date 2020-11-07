const ParseError = require('../errors/ParseError');
const DelimitedStringListAccessor = require('../accessors/DelimitedStringListAccessor');

class Extension {

  static parse(extension) {
    const parts = Extension.OPTIONS_ACCESSOR.validate(extension);

    let name;
    const options = {};
    parts.forEach((part, index) => {
      if (index === 0) {
        name = part;
      } else {
        const optionParts = part.split('=');
        if (optionParts.length === 1) {
          options[optionParts[0]] = true;
        } else {
          if (optionParts.length > 2) {
            throw new ParseError(`Invalid extension option ${extension}`);
          }
          options[optionParts[0]] = optionParts[1];
        }
      }
    });

    return new Extension(name, options);
  }

  constructor(name, options) {
    this.name = name;
    this.options = options;
  }

  serialize() {
    const options = [this.name];
    for (let key in this.options) {
      const value = this.options[key];

      if (value === null) {
        options.push(key);
      } else {
        options.push(`${key}=${value}`);
      }
    }

    return options.join('; ');
  }

}

Extension.OPTIONS_ACCESSOR = new DelimitedStringListAccessor(null, ';').trim().removeEmptyItems().minItems(0);

module.exports = Extension;
