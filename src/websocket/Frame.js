const assert = require('assert');
const BitUtils = require('../utils/BitUtils');

class Frame {

  static create(payload, rsv1, rsv2, rsv3, opCode, isFin) {
    assert(data instanceof Buffer);

    const length = data.length;
    let payloadSizeBytes, payloadByte1;
    if (length < 126) {
      payloadByte1 = length;
      payloadSizeBytes = 1;
    } else if (length <= Frame.MAX_SIZE_16_BIT) {
      payloadByte1 = 126;
      payloadSizeBytes = 3;   // 2 plus the first one
    } else {
      payloadByte1 = 127;
      payloadSizeBytes = 9;   // 8 plus the first one
    }

    const header = Buffer.alloc(payloadSizeBytes + 1);
    let byte1 = 0;
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

    byte1 += opCode;

    header[0] = byte1;
    header[1] = payloadByte1;

    if (payloadByte1 === 126) {
      // 16 bit payload length
      BitUtils.hton(header, 2, 2, length);
    } else if (payloadByte1 === 127) {
      // 64 bit payload length
      BitUtils.hton(header, 2, 8, length)
    }

    return new Frame(Buffer.concat([header, payload]));
  }

  constructor(buffer) {
    assert(buffer instanceof Buffer);
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
      this.payloadSize = BitUtils.ntoh(buffer, 2, 2);
      // 16 bits of payload size
      payloadOffset += 2;
    } else if (firstPayloadSize === Frame.PAYLOAD_SIZE_EXT_LARGER) {
      // 64 bits of payload size
      payloadOffset += 8;
      this.payloadSize = BitUtils.ntoh(buffer, 2, 8);
    } else {
      this.payloadSize = firstPayloadSize;
    }

    this.__payload = buffer.slice(payloadOffset);

    if (this.isMasked === true) {
      const keyLength = 4;
      const maskingKey = buffer.slice(payloadOffset-keyLength, payloadOffset);

      for (let i = 0; i < this.__payload.length; i++) {
        const maskIndex = i % keyLength;
        this.__payload[i] ^= maskingKey[maskIndex];
      }
    }
  }

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

module.exports = Frame;
