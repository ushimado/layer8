const ParseError = require('../errors/ParseError');
const DelimitedStringListAccessor = require('../accessors/DelimitedStringListAccessor');
const assert = require('assert');

/**
 * Client extension request
 *
 * @class ExtensionRequest
 */
class ExtensionRequest {

  /**
   * Parses an extension request from the extension header and returns an ExtensionRequest instance
   *
   * @static
   * @param {String} extensionRequest
   * @returns {ExtensionRequest}
   * @throws {ParseError} - If request cannot be parsed
   * @memberof ExtensionRequest
   */
  static parse(extensionRequest) {
    const parts = ExtensionRequest.OPTIONS_ACCESSOR.validate(extensionRequest);

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
            throw new ParseError(`Invalid extension option ${extensionRequest}`);
          }
          let optionPart1 = optionParts[1].trim();
          if (optionPart1.startsWith('"') && optionPart1.endsWith('"')) {
            // Perform unquoting
            if (optionPart1.length < 3) {
              throw new ParseError(`Bad or empty quoting in ${extensionRequest}`);
            }

            optionPart1 = optionPart1.slice(1, -1);
          }

          options[optionPart0] = optionPart1;
        }
      }
    });

    return new ExtensionRequest(name, options);
  }

  /**
   * Creates an instance of ExtensionRequest.
   *
   * @param {String} name - The name of the extension from the request header
   * @param {Object} options - The requested options from the request header
   * @memberof ExtensionRequest
   */
  constructor(name, options) {
    this.name = name;
    this.options = options;
  }

}

ExtensionRequest.OPTIONS_ACCESSOR = new DelimitedStringListAccessor(null, ';').trimItems().removeEmptyItems().minItems(0);

module.exports = ExtensionRequest;
