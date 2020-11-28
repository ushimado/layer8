const Controller = require('../src/utils/BitUtils');
const BitUtils = require('../src/utils/BitUtils');

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

});
