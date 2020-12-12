const assert = require('assert');
const StatusLine = require('./StatusLine');
const Headers = require('./Headers');
const Header = require('./Header');

/**
 * Represents a websocket server handshake response object.
 *
 * @class Response
 */
class Response {

  static parse(httpResponse) {
    assert(typeof httpResponse === 'string');

    let responseParts = httpResponse.split('\r\n');
    responseParts = responseParts.map(part => part.trim());
    responseParts = responseParts.filter(part => part.length > 0);

    if (responseParts.length === 0) {
      throw new ParseError("Response doesn't include any response data");
    }

    let statusLine;
    const headers = new Headers();
    responseParts.forEach((line, index) => {
      if (index === 0) {
        // First part of the response is the status line
        statusLine = StatusLine.parse(line);
      } else {
        // All headers after the request line
        const header = Header.parse(line);
        headers.add(header);
      }
    });

    return new Response(statusLine, headers);
  }

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
