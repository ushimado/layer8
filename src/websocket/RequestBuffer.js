const ParseError = require('../errors/ParseError');
const assert = require('assert');

/**
 * Buffers a fragmented HTTP request
 *
 * @class RequestBuffer
 */
class RequestBuffer {

  /**
   * Creates an instance of RequestBuffer.
   *
   * @param {Number} [maxLength=RequestBuffer.DEFAULT_MAX_LENGTH] - Establishes the maximum length
   * of the request which will be buffered.
   * @memberof RequestBuffer
   */
  constructor(maxLength=RequestBuffer.DEFAULT_MAX_LENGTH) {
    this.maxLength = maxLength;
    this.data = [];
    this.length = 0;
  }

  /**
   * Ingests a buffer and returns either a completed Request object or null if the terminating
   * sequences has not been encountered.
   *
   * @param {Buffer} buffer
   * @returns
   * @memberof RequestBuffer
   */
  ingest(buffer) {
    assert(buffer instanceof Buffer);

    this.data.push(buffer);
    this.length += buffer.length;

    if (this.length > this.maxLength) {
      throw new ParseError('Request message too long');
    }

    let bufferIndex = this.data.length - 1;
    let currentBufferIndex = this.data[bufferIndex].length - 1;
    let found = true;
    for (let r = RequestBuffer.REQUEST_TERMINATOR.length - 1; r >= 0; r--) {
      if (this.data[bufferIndex][currentBufferIndex] !== RequestBuffer.REQUEST_TERMINATOR[r]) {
        found = false;
        break;
      }

      if (currentBufferIndex === 0) {
        if (bufferIndex === 0) {
          found = false;
          break;
        } else {
          bufferIndex --;
          currentBufferIndex = this.data[bufferIndex].length - 1;
        }
      } else {
        currentBufferIndex --;
      }
    }

    if (found === true) {
      const result = Buffer.concat(this.data).toString();

      this.data = [];
      this.length = 0;

      return result;
    }

    return null;
  }

}

RequestBuffer.DEFAULT_MAX_LENGTH = 1024 * 10;   // 10 Kb buffer
RequestBuffer.REQUEST_TERMINATOR = [0x0D, 0x0A, 0x0D, 0x0A];

module.exports = RequestBuffer;
