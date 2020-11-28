const Frame = require('./Frame');
const assert = require('assert');

class FrameBuffer {

  constructor() {
    this.buffer = null;
  }

  ingest(frame) {
    assert(frame instanceof Frame);

    if (this.buffer === null) {
      this.buffer = frame.payload;
    } else {
      this.buffer = Buffer.concat(this.buffer, frame.payload);
    }

    if (frame.isFin === true) {
      const buffer = this.buffer;
      this.buffer = null;
      return buffer;
    }

    return null;
  }

}

module.exports = FrameBuffer;
