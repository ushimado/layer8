const assert = require('assert');
const Header = require('./Header');

class Headers {

  constructor() {
    this.__headerByName = {};
    this.__headers = [];
  }

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

  get(key) {
    const lowerKey = key.toLowerCase();
    if (lowerKey in this.__headerByName) {
      return this.__headerByName[lowerKey];
    }

    return undefined;
  }

  serialize() {
    return this.__headers.map(header => header.serialize()).join('');
  }
}

module.exports = Headers;
