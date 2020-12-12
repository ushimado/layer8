const assert = require('assert');
const BitUtils = require('../utils/BitUtils');
const ParseError = require('../errors/ParseError');
const IncompleteFrameError = require('../errors/IncompleteFrameError');

/**
 * Represents a websocket protocol frame.
 *
 * @class Frame
 */
class Frame {
  /**
   * Creates a Frame instance from the specified payload and options.
   *
   * @static
   * @param {?Buffer} payload
   * @param {Boolean} rsv1 - Reserved bit 1
   * @param {Boolean} rsv2 - Reserved bit 2
   * @param {Boolean} rsv3 - Reserved bit 3
   * @param {Number} opcode - Operation code
   * @param {?Buffer} mask - Mask
   * @param {Boolean} isFin - Frame represents the final data frame in a message
   * @returns
   * @memberof Frame
   */
  static create(payload, rsv1, rsv2, rsv3, opcode, mask, isFin) {
    let length;
    let byte1 = 0;
    let byte2 = 0;

    if (payload instanceof Buffer) {
      length = payload.length;
    } else {
      assert(payload === null);
      length = 0;
    }

    if (mask !== null) {
      // Set the mask bit
      byte2 += 128;
    }

    let headerSizeBytes = 1;
    if (length < 126) {
      byte2 += length;
      headerSizeBytes += 1;
    } else if (length <= Frame.MAX_SIZE_16_BIT) {
      byte2 += 126;
      headerSizeBytes += 3;   // 2 plus the first one
    } else {
      byte2 += 127;
      headerSizeBytes += 9;   // 8 plus the first one
    }

    let maskOffset = null;
    if (mask instanceof Buffer) {
      assert(mask.length === 4);
      maskOffset = headerSizeBytes;
      headerSizeBytes += 4;
    } else {
      assert(mask === null);
    }

    const header = Buffer.alloc(headerSizeBytes);
    if (isFin) {
      byte1 += 1 << Frame.FIN_BIT;
    }

    if (rsv1) {
      byte1 += 1 << Frame.RSV1_BIT;
    }

    if (rsv2) {
      byte1 += 1 << Frame.RSV2_BIT;
    }

    if (rsv3) {
      byte1 += 1 << Frame.RSV3_BIT;
    }

    byte1 += opcode;

    header[0] = byte1;
    header[1] = byte2;

    if (mask !== null) {
      for (let i = 0; i < mask.length; i++) {
        header[maskOffset+i] = mask[i];
      }

      // Apply the mask
      const l = mask.length;
      for (let i = 0; i < payload.length; i++) {
        payload[i] ^= mask[i % l];
      }
    }

    if ((byte2 & 126) === 126) {
      // 16 bit payload length
      BitUtils.hton(header, 2, 2, length);
    } else if ((byte2 & 127) === 127) {
      // 64 bit payload length
      BitUtils.hton(header, 2, 8, length)
    }

    if (payload === null) {
      assert(mask === null);
      return new Frame(header);
    }

    if (mask === null) {
      return new Frame(Buffer.concat([header, payload]));
    }

    return Buffer.concat([header, payload]);
  }

  /**
   * Creates an instance of Frame from a buffer which represents a complete websocket protocol
   * frame.
   *
   * @param {Buffer} buffer
   * @returns {Frame}
   * @memberof Frame
   */
  constructor(buffer) {
    assert(buffer instanceof Buffer);
    if (buffer.length < 2) {
      throw new IncompleteFrameError();
    }

    const byte1 = buffer[0];
    this.isFin = BitUtils.isBitSet(byte1, Frame.FIN_BIT);
    this.rsv1 = BitUtils.isBitSet(byte1, Frame.RSV1_BIT);
    this.rsv2 = BitUtils.isBitSet(byte1, Frame.RSV2_BIT);
    this.rsv3 = BitUtils.isBitSet(byte1, Frame.RSV3_BIT);
    this.opcode = BitUtils.getValue(byte1, Frame.OPCODE_LOW_BIT, Frame.OPCODE_MASK);

    const byte2 = buffer[1];

    let payloadOffset = 2;

    this.isMasked = BitUtils.isBitSet(byte2, Frame.MASK_BIT);
    if (this.isMasked === true) {
      // 32 bit mask
      payloadOffset += 4;
    }

    const firstPayloadSize = BitUtils.getValue(
      byte2, Frame.PAYLOAD_SIZE_LOW_BIT, Frame.PAYLOAD_SIZE_MASK
    );

    if (firstPayloadSize === Frame.PAYLOAD_SIZE_EXT_SMALLER) {
      if (buffer.length < 4) {
        throw new IncompleteFrameError();
      }
      this.payloadSize = BitUtils.ntoh(buffer, 2, 2);
      // 16 bits of payload size
      payloadOffset += 2;
    } else if (firstPayloadSize === Frame.PAYLOAD_SIZE_EXT_LARGER) {
      // 64 bits of payload size
      if (buffer.length < 10) {
        throw new IncompleteFrameError();
      }
      payloadOffset += 8;
      this.payloadSize = BitUtils.ntoh(buffer, 2, 8);
    } else {
      this.payloadSize = firstPayloadSize;
    }

    this.__payload = buffer.slice(payloadOffset, payloadOffset + this.payloadSize);
    if (this.__payload.length < this.payloadSize) {
      throw new IncompleteFrameError();
    }

    if (this.isMasked === true) {
      const keyLength = 4;
      const maskingKey = buffer.slice(payloadOffset-keyLength, payloadOffset);

      for (let i = 0; i < this.__payload.length; i++) {
        const maskIndex = i % keyLength;
        this.__payload[i] ^= maskingKey[maskIndex];
      }
    }

    this.buffer = buffer;
    this.totalFrameSize = payloadOffset;
  }

  /**
   * Returns the underlying payload as a slice of the entire frame buffer.  Does not return a copy.
   *
   * @readonly
   * @memberof Frame
   */
  get payload() {
    return this.__payload;
  }

}

Frame.FIN_BIT = 7;
Frame.RSV1_BIT = 6;
Frame.RSV2_BIT = 5;
Frame.RSV3_BIT = 4;

Frame.OPCODE_LOW_BIT = 0;
Frame.OPCODE_HIGH_BIT = 3;
Frame.OPCODE_MASK = BitUtils.makeMask(Frame.OPCODE_LOW_BIT, Frame.OPCODE_HIGH_BIT);

Frame.MASK_BIT = 7;
Frame.PAYLOAD_SIZE_LOW_BIT = 0;
Frame.PAYLOAD_SIZE_HIGH_BIT = 6;
Frame.PAYLOAD_SIZE_MASK = BitUtils.makeMask(Frame.PAYLOAD_SIZE_LOW_BIT, Frame.PAYLOAD_SIZE_HIGH_BIT);

Frame.PAYLOAD_SIZE_EXT_SMALLER = 126;
Frame.PAYLOAD_SIZE_EXT_LARGER = 127;

Frame.MAX_SIZE_16_BIT = (1 << 16) - 1;

Frame.OPCODE_CONTINUATION_FRAME = 0;
Frame.OPCODE_TEXT_FRAME = 1;
Frame.OPCODE_BINARY_FRAME = 2;
Frame.OPCODE_PING_FRAME = 9;
Frame.OPCODE_PONG_FRAME = 0x0A;

Frame.DATA_FRAME_OPCODES = new Set([
  Frame.OPCODE_CONTINUATION_FRAME,
  Frame.OPCODE_TEXT_FRAME,
  Frame.OPCODE_BINARY_FRAME,
]);

module.exports = Frame;
