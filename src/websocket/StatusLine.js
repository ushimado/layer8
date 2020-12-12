const assert = require('assert');
const ParseError = require('../errors/ParseError');

class StatusLine {

  static parse(line) {
    assert(typeof(line) === 'string');
    const parts = line.split(' ');
    if (parts.length < 3) {
      throw new ParseError("Malformed status line");
    }

    const protocol = parts[0]
    const statusCode = parseInt(parts[1]);
    const statusMessage = parts.slice(2).join(' ');

    return new StatusLine(protocol, statusCode, statusMessage);
  }

  constructor(protocol, statusCode, statusMessage) {
    assert(statusCode >= 100);
    assert(statusCode <= 599);

    this.protocol = protocol;
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }

  serialize() {
    return `${this.protocol} ${this.statusCode} ${this.statusMessage}\r\n`;
  }
}

module.exports = StatusLine;
