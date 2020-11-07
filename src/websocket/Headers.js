const assert = require('assert');
const Header = require('./Header');

class Headers {

  constructor() {
    this.__headerByName = {};
    this.__headers = [];
  }

  add(header) {
    assert(header instanceof Header);
    this.__headerByName[header.key.toLowerCase()] = header;
    this.__headers.push(header);
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
