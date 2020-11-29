const ExtensionRequest = require('./ExtensionRequest');
const DelimitedStringListAccessor = require('../accessors/DelimitedStringListAccessor');
const assert = require('assert');

/**
 * Encapsulates all extensions and their respective options, being requested by the client
 *
 * @class ExtensionsRequest
 */
class ExtensionsRequest {

  static parse(data) {
    const parts = ExtensionsRequest.EXTENSION_ACCESSOR.validate(data)
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

ExtensionsRequest.EXTENSION_ACCESSOR = new DelimitedStringListAccessor(null, ',').trim().removeEmptyItems().minItems(0);

module.exports = ExtensionsRequest;
