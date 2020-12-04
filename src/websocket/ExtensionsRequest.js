const ExtensionRequest = require('./ExtensionRequest');
const ParseError = require('../errors/ParseError');
const assert = require('assert');

/**
 * Encapsulates all extensions and their respective options, being requested by the client
 *
 * @class ExtensionsRequest
 */
class ExtensionsRequest {

  static parse(data) {
    const parts = data.split(',').map(part => part.trim()).filter(part => part.length > 0);
    if (parts.length === 0) {
      throw new ParseError('Request must contain at least one extension');
    }

    return new ExtensionsRequest(parts.map(part => ExtensionRequest.parse(part)));
  }

  /**
   * Creates an instance of ExtensionsRequest.
   *
   * @param {Array} extensions - Extension objects to be added to the collection
   * @memberof ExtensionsRequest
   */
  constructor(extensions) {
    assert(Array.isArray(extensions));

    const extensionsByName = {};
    this.__extensions = extensions;
    extensions.forEach(extension => {
      const name = extension.name;
      if (!(name in extensionsByName)) {
        extensionsByName[extension.name] = [];
      }
      extensionsByName[extension.name].push(extension);
    });

    this.__extensionByName = extensionsByName;
  }

  /**
   * Returns an array of available extensions, in the order that they were requested.
   *
   * @returns {Array} - Array of Extension instances
   * @memberof ExtensionsRequest
   */
  getAll() {
    return this.__extensions;
  }

}

module.exports = ExtensionsRequest;
