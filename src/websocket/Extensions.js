const Extension = require('./Extension');
const DelimitedStringListAccessor = require('../accessors/DelimitedStringListAccessor');

class Extensions {

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
    this.__extensions = [];
  }

  static parse(data) {
    const parts = Extensions.EXTENSION_ACCESSOR.validate(data)
    return new Extensions(parts.map(part => Extension.parse(part)));
  }

  serialize(supportedNames) {
    assert(supportedNames instanceof Set);
    const serialized = extensions.filter(extension => extension.name in supportedNames).map(extension.serialize());
    return serialized.join(', ')
  }

  /**
   * Returns a list of extensions by this name.  Since clients can send multiple fallback variants
   * of the same extension request, this method will always return a list, even if a single
   * extension was requested by a given name.
   *
   * @param {*} name
   * @returns
   * @memberof Extensions
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

Extensions.EXTENSION_ACCESSOR = new DelimitedStringListAccessor(null, ',').trim().removeEmptyItems().minItems(0);

module.exports = Extensions;
