const assert = require('assert');
const Header = require('./Header');

/**
 * Represents a collection of HTTP headers
 *
 * @class Headers
 */
class Headers {

  /**
   * Creates an instance of Headers.
   *
   * @memberof Headers
   */
  constructor() {
    this.__headerByName = {};
    this.__headers = [];
  }

  /**
   * Adds a Header instance to the collection
   *
   * @param {Header} header
   * @memberof Headers
   */
  add(header) {
    assert(header instanceof Header);
    const headerKey = header.key.toLowerCase();

    if (headerKey in this.__headerByName) {
      let prevHeader = this.__headerByName[headerKey];

      // This bundling may be non-standard, but it works well for the extensions
      prevHeader.value = [prevHeader.value, header.value].join(', ')
    } else {
      this.__headerByName[headerKey] = header;
      this.__headers.push(header);
    }
  }

  /**
   * Returns a Header instance referenced by case-insensitive name, or undefined if not found.
   *
   * @param {String} key - Case insensitive header name
   * @returns
   * @memberof Headers
   */
  get(key) {
    const lowerKey = key.toLowerCase();
    if (lowerKey in this.__headerByName) {
      return this.__headerByName[lowerKey];
    }

    return undefined;
  }

  /**
   * Serializes headers to a string for use in an HTTP response
   *
   * @returns {String}
   * @memberof Headers
   */
  serialize() {
    return this.__headers.map(header => header.serialize()).join('');
  }
}

module.exports = Headers;
