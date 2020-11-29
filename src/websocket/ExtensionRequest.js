const ParseError = require('../errors/ParseError');
const DelimitedStringListAccessor = require('../accessors/DelimitedStringListAccessor');
const assert = require('assert');

/**
 * Represents
 *
 * @class ExtensionRequest
 */
class ExtensionRequest {

  static parse(extension) {
    const parts = ExtensionRequest.OPTIONS_ACCESSOR.validate(extension);

    let name;
    const options = {};
    parts.forEach((part, index) => {
      if (index === 0) {
        name = part;
      } else {
        const optionParts = part.split('=');
        let optionPart0 = optionParts[0].trim();
        if (optionParts.length === 1) {
          options[optionPart0] = true;
        } else {
          if (optionParts.length > 2) {
            throw new ParseError(`Invalid extension option ${extension}`);
          }
          let optionPart1 = optionParts[1].trim();
          if (optionPart1.startsWith('"') && optionPart1.endsWith('"')) {
            // Perform unquoting
            assert(optionPart1.length > 2);

            optionPart1 = optionPart1.slice(1, -1);
          }

          options[optionPart0] = optionPart1;
        }
      }
    });

    return new ExtensionRequest(name, options);
  }

  constructor(name, options) {
    this.name = name;
    this.options = options;
  }

}

ExtensionRequest.OPTIONS_ACCESSOR = new DelimitedStringListAccessor(null, ';').trimItems().removeEmptyItems().minItems(0);

module.exports = ExtensionRequest;
