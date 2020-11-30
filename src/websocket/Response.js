const assert = require('assert');
const StatusLine = require('./StatusLine');

/**
 * Represents a websocket server handshake response object.
 *
 * @class Response
 */
class Response {

  /**
   * Creates an instance of Response.
   *
   * @param {StatusLine} statusLine - The response status line object
   * @param {Headers} [headers=null] - Reponse headers
   * @memberof Response
   */
  constructor(statusLine, headers=null) {
    assert(statusLine instanceof StatusLine);
    this.statusLine = statusLine;
    this.headers = headers;
  }

  /**
   * Returns a serialized string representation of the response object.
   *
   * @returns
   * @memberof Response
   */
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
