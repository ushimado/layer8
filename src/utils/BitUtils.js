const assert = require('assert');

class BitUtils {

  /**
   * Returns a bit mask for lowBit, or the range of bits between lowBit and highBit if highBit
   * is not null.  The lowest bit # in a byte is 0 (1) and the highest is 7 (128).
   *
   * @static
   * @param {*} lowBit
   * @param {*} [highBit=null]
   * @param {number} [totalBits=8]
   * @returns
   * @memberof BitUtils
   */
  static makeMask(lowBit, highBit=null) {
    if (highBit === null) {
      highBit = lowBit;
    }

    assert(lowBit <= highBit);
    let mask = 0;
    for (let i = lowBit; i <= highBit; i++) {
      mask += 1 << i;
    }

    return mask;
  }

  static getValue(data, lowBit, mask) {
    return (data & mask) >> lowBit;
  }

  static isBitSet(data, bitIndex) {
    const bitValue = 1 << bitIndex;
    return (data & bitValue) === bitValue;
  }

  static ntoh(buffer, offset, bytes) {
    let acc = 0;
    for (let b = 0; b < bytes; b++) {
      acc += buffer[offset + b] << (bytes - (b + 1)) * 8;
    }

    return acc;
  }

  static hton(buffer, offset, bytes, value) {
    for (let b = 0; b < bytes; b++) {
      buffer[offset + b] = value & (0xFF << ((bytes - b - 1) * 8))
    }
  }
}

module.exports = BitUtils;
