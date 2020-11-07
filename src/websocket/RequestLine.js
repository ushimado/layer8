const ParseError = require('../errors/ParseError');
const Endpoint = require('../Endpoint');
const assert = require('assert');

class RequestLine {

  static parse(data) {
    const parts = data.split(' ');
    if (parts.length !== 3) {
      throw new ParseError("Incorrect number of arguments in request line");
    }

    const [
      method,
      uri,
      protocol
    ] = parts;

    if (!Endpoint.METHODS.has(method)) {
      throw new ParseError(`Unsupported method ${method}`);
    }

    let url;
    try {
      url = new URL(uri);
    } catch(e) {
      throw new ParseError("Unable to parse request URI");
    }

    return new RequestLine(
      method,
      url,
      protocol
    );
  }

  constructor(method, url, protocol) {
    assert(Endpoint.METHODS.has(method));
    assert(url instanceof URL);

    this.method = method;
    this.url = url;
    this.protocol = protocol;
  }
}

module.exports = RequestLine;
