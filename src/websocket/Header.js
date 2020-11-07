const ParseError = require("../errors/ParseError");

class Header {

  static parse(string) {
    const colonPosition = string.indexOf(':');

    if (colonPosition === -1) {
      throw new ParseError("Missing colon in header string");
    }

    const key = string.slice(0, colonPosition).trim();
    const value = string.slice(colonPosition+1).trim();

    return new Header(key, value);
  }

  serialize() {
    return `${this.key}: ${this.value}\r\n`;
  }

  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}

module.exports = Header;
