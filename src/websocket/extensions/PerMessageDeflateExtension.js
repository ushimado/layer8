const ProtocolExtension = require("./ProtocolExtension");
const Extension = require("../Extension");
const ValidationError = require('../../errors/ValidationError');
const PositiveIntAccessor = require("../../accessors/PositiveIntAccessor");

class PerMessageDeflateExtension extends ProtocolExtension {

  static createInstance(extension) {
    assert(extension instanceof Extension);
    assert(extension.name === this.name);

    const options = {};
    validateServerNoContextTakeoverOption(extension, options);
    validateClientNoContextTakeoverOption(extension, options);
    validateServerMaxWindowBitsOption(extension, options);
    validateClientMaxWindowBitsOption(extension, options);
  }

  static validateServerNoContextTakeoverOption(extension, options) {
    if (PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION in extension.options) {
      const option = extension.options[PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION];
      if (option !== true) {
        throw new ValidationError(
          PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION,
          'Only a value of True is permitted if this option is provided',
        )
      }

      options[PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION] = option;
    } else {
      options[PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION] = false;
    }
  }

  static validateClientNoContextTakeoverOption(extension, options) {
    if (PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION in extension.options) {
      const option = extension.options[PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION];
      if (option !== true) {
        throw new ValidationError(
          PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION,
          'Only a value of True is permitted if this option is provided',
        )
      }

      options[PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION] = option;
    } else {
      options[PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION] = false;
    }
  }

  static validateServerMaxWindowBitsOption(extension, options) {
    if (PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS in extension.options) {
      const option = extension.options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS];
      if (option !== true) {
        const value = PerMessageDeflateExtension.MAX_WINDOW_BITS_ACCESSOR.validate(option);
        options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS] = value
      } else {
        options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS] = true;
      }
    } else {
      options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS] = false;
    }
  }

  static validateClientMaxWindowBitsOption(extension, options) {
    if (PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS in extension.options) {
      const option = extension.options[PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS];
      if (option !== true) {
        const value = PerMessageDeflateExtension.MAX_WINDOW_BITS_ACCESSOR.validate(option);
        options[PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS] = value
      } else {
        options[PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS] = true;
      }
    } else {
      options[PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS] = false;
    }
  }

  constructor(options) {
    super('permessage-deflate');


  }
}

PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION = 'server_no_context_takeover';
PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION = 'client_no_context_takeover';
PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS = 'server_max_window_bits';
PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS = 'client_max_window_bits';

PerMessageDeflateExtension.MAX_WINDOW_BITS_ACCESSOR = new PositiveIntAccessor(null).fromString().range(8, 15);

module.exports = PerMessageDeflateExtension;
