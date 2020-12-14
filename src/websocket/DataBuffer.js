const Frame = require('./Frame');
const IncompleteFrame = require('../errors/IncompleteFrameError');
const assert = require('assert');

class DataBuffer {

  static MAX_SIZE = 128 * 1024;

  constructor(maxSize=DataBuffer.MAX_SIZE) {
    this.__buffer = null;
    this.__maxSize = maxSize;
  }

  ingest(buffer) {
    if (this.__buffer === null) {
      this.__buffer = buffer;
    } else {
      this.__buffer = Buffer.concat([this.__buffer, buffer]);
    }

    if (this.__buffer.length > this.__maxSize) {
      throw new ParseError("Buffer limit exceeded");
    }
  }

  getFrames() {
    const frames = [];
    while(this.__buffer !== null) {
      try {
        const frame = new Frame(this.__buffer);
        frames.push(frame);
        if (this.__buffer.length > frame.totalFrameSize) {
          this.__buffer = this.__buffer.slice(frame.totalFrameSize);
        } else {
          assert(frame.totalFrameSize === this.__buffer.length);
          this.__buffer = null;
        }
      } catch(e) {
        if (e instanceof IncompleteFrame) {
          return frames;
        }
      }
    }

    return frames;
  }
}

module.exports = DataBuffer;
