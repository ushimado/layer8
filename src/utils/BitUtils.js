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
      const shift = (bytes - b - 1) * 8;
      // Can't use bitwise shifts due to Javascript's size limitations
      const test = 0xFF * (2 ** shift);
      const reduced = (value & test) / (2 ** shift);
      buffer[offset + b] = reduced
    }
  }

  static getBits(value) {
    let bit = 1;
    const bits = [];
    while (bit <= value) {
      bits.unshift((value & bit) === bit);
      bit *= 2;
    }

    return bits.map(bit => (bit === true ? '1' : '0')).join('');
  }
}

module.exports = BitUtils;
