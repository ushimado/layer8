const Frame = require('./Frame');
const ParseError = require('../errors/ParseError');
const assert = require('assert');

/**
 * Represents a buffer for fragmented frame data.  Fragmented frame data does not imply that the
 * frame structure is split across multiple messages, instead it implies that multiple frames are
 * used to carry a single message, the final frame of which will have the "fin" bit set, indicating
 * that it is the final frame in the sequence.
 *
 * @class FrameBuffer
 */
class FrameBuffer {

  /**
   * Creates an instance of FrameBuffer.
   *
   * @memberof FrameBuffer
   */
  constructor(maxLength=FrameBuffer.DEFAULT_MAX_LENGTH) {
    this.buffers = [];
    this.length = 0;
    this.maxLength = maxLength;
  }

  /**
   * Ingests a frame and returns either a completely buffered message, or null if the message is
   * incomplete.  The frame buffer is practical for carrying medium length messages which have been
   * split across multiple frames.  It is not considered practical for large pieces of data which
   * should be streamed directly to disk, etc.
   *
   * @param {Frame} frame
   * @returns {Buffer} - Complete message buffer or null if the message is incomplete.
   * @memberof FrameBuffer
   */
  ingest(frame) {
    assert(frame instanceof Frame);

    this.length += frame.payload.length;
    if (this.length > this.maxLength) {
      // Granted, this hasn't been buffered yet and may be the last frame, we want to impose a
      // hard limit on the size of the messages we allow through the system.
      throw new ParseError("Maximum buffered frame size exceeded");
    }

    if (frame.isFin === true) {
      if (this.buffers.length === 0) {
        this.length = 0;
        return frame.payload;
      }

      const result = Buffer.concat([...this.buffers, frame.payload]);
      this.buffers = [];
      this.length = 0;
      return result;
    }

    this.buffers.push(frame.payload);
    return null;
  }

}

FrameBuffer.DEFAULT_MAX_LENGTH = 1024 * 64;

module.exports = FrameBuffer;
