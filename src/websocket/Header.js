const ParseError = require("../errors/ParseError");

/**
 * Represents a request header
 *
 * @class Header
 */
class Header {

  /**
   * Returns a new Header instance from a header string.
   *
   * @static
   * @param {String} string
   * @returns {Header}
   * @throws {ParseError}
   * @memberof Header
   */
  static parse(string) {
    const colonPosition = string.indexOf(':');

    if (colonPosition === -1) {
      throw new ParseError("Missing colon in header string");
    }

    const key = string.slice(0, colonPosition).trim();
    const value = string.slice(colonPosition+1).trim();

    return new Header(key, value);
  }

  /**
   * Serializes header for use in HTTP response.
   *
   * @returns
   * @memberof Header
   */
  serialize() {
    return `${this.key}: ${this.value}\r\n`;
  }

  /**
   * Creates an instance of Header.
   *
   * @param {String} key
   * @param {String} value
   * @memberof Header
   */
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}

module.exports = Header;
