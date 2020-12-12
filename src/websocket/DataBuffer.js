const Frame = require('./Frame');
const IncompleteFrame = require('../errors/IncompleteFrameError');

class DataBuffer {

  static MAX_SIZE = 128 * 1024;

  constructor() {
    this.__buffer = null;
  }

  ingest(buffer) {
    if (this.__buffer === null) {
      this.__buffer = buffer;
    } else {
      this.__buffer = Buffer.concat([this.__buffer, buffer]);
    }

    if (this.__buffer.length > DataBuffer.MAX_SIZE) {
      throw new ParseError("Buffer limit exceeded");
    }
  }

  getFrames() {
    const frames = [];
    let consumed = 0;
    while(consumed < this.__buffer.length) {
      try {
        const frame = new Frame(this.__buffer);
        frames.push(frame);
        consumed += frame.totalFrameSize;
        if (this.__buffer.length > consumed) {
          this.__buffer = this.__buffer.slice(consumed);
        }
      } catch(e) {
        if (e instanceof IncompleteFrame) {
          return frames;
        }
      }
    }

    if (this.__buffer.length === 0) {
      this.__buffer = null;
    }
    return frames;
  }
}

module.exports = DataBuffer;
