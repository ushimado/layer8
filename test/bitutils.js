const BitUtils = require('../src/utils/BitUtils');
const assert = require('assert');

describe("Test bit utils", () => {

  it('Host to network buffer write must match test criterion', () => {
    const x = 8321384;
    const bytes = [
      (x & (0xFF << 16)) >> 16,
      (x & (0xFF << 8)) >> 8,
      (x & (0xFF << 0)) >> 0,
    ]

    const buffer = new Buffer.alloc(3);
    BitUtils.hton(buffer, 0, 3, x);

    for (let i = 0; i < bytes; i++) {
      assert(bytes[i] === buffer[0]);
    }
  });

  it('Host to network for large number of bytes', () => {
    const x = 8321384;
    const buffer = new Buffer.alloc(8);
    BitUtils.hton(buffer, 0, 8, x);
    assert(BitUtils.ntoh(buffer, 0, 8) === x);
  })

  it('Network to host must match test criterion', () => {
    const buffer = Buffer.alloc(2);
    const byte1 = 12;
    const byte2 = 221;
    buffer[0] = byte1;
    buffer[1] = byte2;

    const total = (byte1 << 8) + byte2;
    assert(BitUtils.ntoh(buffer, 0, 2) === total);
  });

});
