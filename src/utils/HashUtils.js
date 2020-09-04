const crypto = require('crypto');

class HashUtils {

  /**
   * Generates a SHA256 hash of a password and salt.
   *
   * @static
   * @param {string} password
   * @param {string} salt
   * @returns
   * @memberof HashUtils
   */
  static generatePasswordHash(password, salt) {
    const hash = crypto.createHash('sha256');
    hash.update(`${password}${salt}`);

    return hash.digest('base64');
  }

  /**
   * Returns a cryptographically strong salt for use in generating salted passwords for hashing.
   *
   * @static
   * @returns {Promise} - Once resolved, a 128 character hex string suitable for salting passwords
   * prior to hashing.
   * @memberof HashUtils
   */
  static generateSalt(nBytes=64) {
    return HashUtils.generateRandomToken(nBytes);
  }

  /**
   * Returns a long random session token.
   *
   * @static
   * @returns {Promise}
   * @memberof HashUtils
   */
  static generateSessionToken(nBytes=128) {
    return HashUtils.generateRandomToken(nBytes);
  }

  /**
   * Generates a random token nBytes long, which is then returned as a hex string.
   * Since a byte is represented by a 2 byte hex string, the output string will be a total of
   * 2 * nBytes characters long.
   *
   * @static
   * @param {*} nBytes - Number of bytes of random data in the token.
   * @memberof HashUtils
   */
  static generateRandomToken(nBytes) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(nBytes, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          resolve(buf.toString('hex'));
        }
      });
    })
  }
}

module.exports = HashUtils;
