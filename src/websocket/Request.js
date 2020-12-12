const RequestLine = require('./RequestLine');
const Headers = require('./Headers');
const Header = require('./Header');
const querystring = require('querystring');
const assert = require('assert');

class Request {

  /**
   * Parses the request in its entirety and stores information including headers and extensions.
   *
   * @param {String} data
   * @returns {Request}
   * @memberof Request
   */
  static parse(httpRequest) {
    assert(typeof httpRequest === 'string');

    let requestParts = httpRequest.split('\r\n');
    requestParts = requestParts.map(part => part.trim());
    requestParts = requestParts.filter(part => part.length > 0);

    if (requestParts.length === 0) {
      throw new ParseError("Request doesn't include any request data");
    }

    let requestLine;
    const headers = new Headers();
    requestParts.forEach((line, index) => {
      if (index === 0) {
        // First part of the request is the request line
        requestLine = RequestLine.parse(line);
      } else {
        // All headers after the request line
        const header = Header.parse(line);
        headers.add(header);
      }
    });

    return new Request(requestLine, headers, )
  }

  /**
   * Creates an instance of Request.
   *
   * @param {RequestLine} requestLine
   * @param {Headers} headers
   * @memberof Request
   */
  constructor(requestLine, headers) {
    assert(requestLine instanceof RequestLine);
    assert(headers instanceof Headers)

    this.url = requestLine.url;
    this.method = requestLine.method;
    this.headers = headers;
    this.requestLine = requestLine;

    const queryString = requestLine.url.search;
    if (queryString.length === 0) {
      this.queryArgs = {}
    } else {
      // Parse and skip the '?' portion
      this.queryArgs = querystring.parse(queryString.slice(1));
    }

  }

  /**
   * Serializes a request to a string
   *
   * @returns {String}
   * @memberof Request
   */
  serialize() {
    const lines = [
      this.requestLine.serialize()
    ];

    const serHeaders = this.headers.serialize();
    if (serHeaders.length > 0) {
      lines.push(serHeaders);
    }

    // Final terminating CRLF
    lines.push('\r\n');

    return lines.join('');
  }

}

module.exports = Request;
