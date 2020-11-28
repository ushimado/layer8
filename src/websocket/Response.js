const assert = require('assert');
const StatusLine = require('./StatusLine');

class Response {

  constructor(statusLine, headers=null) {
    assert(statusLine instanceof StatusLine);
    this.statusLine = statusLine;
    this.headers = headers;
  }

  serialize() {
    const ser = [];
    ser.push(this.statusLine.serialize())
    if (this.headers !== null) {
      ser.push(this.headers.serialize());
    }

    return ser.join('') + '\r\n';
  }
}

module.exports = Response;
