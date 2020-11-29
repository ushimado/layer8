const RequestBuffer = require('../src/websocket/RequestBuffer');
const ParseError = require('../src/errors/ParseError');
const assert = require('assert');

describe("Test request buffer", () => {

  it('Must correctly identify the conclusion of a request', () => {
    const buffer = new Buffer.from([
      'test: test',
      'something: something else'
    ].join('\r\n') + '\r\n');
    const finalBuffer = new Buffer.from([
      'test: test',
      'something: something else'
    ].join('\r\n') + '\r\n\r\n');

    const requestBuffer = new RequestBuffer();
    let result;
    result = requestBuffer.ingest(buffer);
    assert(result === null);
    result = requestBuffer.ingest(buffer);
    assert(result === null);
    result = requestBuffer.ingest(finalBuffer);
    assert(result !== null);
  });

  it('Must fail if the request is too large before terminating', () => {
    const buffer = new Buffer.from([
      'test: test',
      'something: something else'
    ].join('\r\n') + '\r\n');

    const requestBuffer = new RequestBuffer();
    let result;

    try {
      for (let i = 0; i < 1000; i++) {
        result = requestBuffer.ingest(buffer);
        assert(result === null);
      }
    } catch(e) {
      assert(e instanceof ParseError);
      return;
    }

    throw Error('Buffer did not oppose overfilling');
  });
});
