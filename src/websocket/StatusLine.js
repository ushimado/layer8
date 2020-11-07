const assert = require('assert');

class StatusLine {

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
