const ExtensionRequest = require('./ExtensionRequest');
const DelimitedStringListAccessor = require('../accessors/DelimitedStringListAccessor');
const assert = require('assert');

class ExtensionsRequest {

  constructor(extensions) {
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

  static parse(data) {
    const parts = ExtensionsRequest.EXTENSION_ACCESSOR.validate(data)
    return new ExtensionsRequest(parts.map(part => ExtensionRequest.parse(part)));
  }

  /**
   * Returns a list of extensions by this name.  Since clients can send multiple fallback variants
   * of the same extension request, this method will always return a list, even if a single
   * extension was requested by a given name.
   *
   * @param {*} name
   * @returns
   * @memberof ExtensionsRequest
   */
  get(name) {
    if (name in this.__collection) {
      return this.__collection[name];
    }

    return undefined;
  }

  getAll() {
    return this.__extensions;
  }

}

ExtensionsRequest.EXTENSION_ACCESSOR = new DelimitedStringListAccessor(null, ',').trim().removeEmptyItems().minItems(0);

module.exports = ExtensionsRequest;
