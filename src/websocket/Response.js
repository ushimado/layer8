const assert = require('assert');
const StatusLine = require('./StatusLine');

class Response {

  constructor(statusLine, headers=null) {
    assert(statusLine instanceof StatusLine);
    this.statusLine = statusLine;
    this.headers = headers;
  }

  serialize() {
    const lines = [];
    lines.push(this.statusLine.serialize())
    if (this.headers !== null) {
      this.headers.forEach(header => {
        lines.push(header.serialize())
      })
    }

    return lines.join('');
  }
}

module.exports = Response;
