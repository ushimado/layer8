const zlib = require('zlib');
const ProtocolExtension = require("./ProtocolExtension");
const Extension = require("../Extension");
const ValidationError = require('../../errors/ValidationError');
const PositiveIntAccessor = require("../../accessors/PositiveIntAccessor");
const assert = require('assert');
const Frame = require('../Frame');

class PerMessageDeflateExtension extends ProtocolExtension {

  static name = "permessage-deflate";

  static createInstance(extension) {
    assert(extension instanceof Extension);
    assert(extension.name === this.name);

    const options = {};
    PerMessageDeflateExtension.validateServerNoContextTakeoverOption(extension, options);
    PerMessageDeflateExtension.validateClientNoContextTakeoverOption(extension, options);
    PerMessageDeflateExtension.validateServerMaxWindowBitsOption(extension, options);
    PerMessageDeflateExtension.validateClientMaxWindowBitsOption(extension, options);

    return new PerMessageDeflateExtension(options);
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
    super(
      PerMessageDeflateExtension.name,
      options,
    );

    let clientMaxWindowBits = zlib.Z_DEFAULT_WINDOWBITS;
    const clientMaxWindowBitsOption = options[PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS];
    if (typeof(clientMaxWindowBitsOption) !== PerMessageDeflateExtension.__BOOLEAN) {
      clientMaxWindowBits = clientMaxWindowBitsOption;
    }

    let serverMaxWindowBits = zlib.Z_DEFAULT_WINDOWBITS;
    const serverMaxWindowBitsOption = options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS];
    if (typeof(serverMaxWindowBitsOption) !== PerMessageDeflateExtension.__BOOLEAN) {
      serverMaxWindowBits = servertMaxWindowBitsOption;
    }

    this.clientMaxWindowBits = clientMaxWindowBits;
    this.serverMaxWindowBits = serverMaxWindowBits;
    this.__rawInflate = null;
    this.__rawDeflate = null;
  }

  async onWrite(frame) {
    // This will require creation of a new frame, since payload information, size, etc. will change

    if (this.__rawDeflate === null) {
      this.__rawDeflate = zlib.createDeflateRaw({
        windowBits: this.serverMaxWindowBits,
      });
    }

    const p = new Promise((resolve, reject) => {
      // Apply the callback handler each time, to account for the new promise object
      this.__rawInflate.on('data', (data) => {
        const deflatedFrame = Frame.create(
          data,
          true,
          frame.rsv2,
          frame.rsv3,
          frame.opcode,
          frame.isFin,
        )
        resolve(deflatedFrame);
      });
      this.__rawInflate.on('error', () => {
        reject();
      });

      this.__rawDeflate.write(frame.payload);
      this.__rawDeflate.flush(zlib.Z_SYNC_FLUSH, () => {
        if (!this.__rawDeflate) {
          return;
        }

        if (frame.isFin && this.options[PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION]) {
          this.__rawDeflate.close();
          this.__rawDeflate = null;
        }

      });
    });

    return p;
  }

  async onRead(frame) {
    // RSV1 is designated as the compression bit, if set, compression has been applied.
    if (frame.rsv1 === true) {
      if (this.__rawInflate === null) {
        this.__rawInflate = zlib.createInflateRaw({
          windowBits: this.clientMaxWindowBits,
        });
      }

      const p = new Promise((resolve, reject) => {
        // Apply the callback handler each time, to account for the new promise object
        this.__rawInflate.on('data', (data) => {
          const inflatedFrame = Frame.create(
            data,
            frame.rsv1,
            frame.rsv2,
            frame.rsv3,
            frame.opcode,
            frame.isFin,
          )
          resolve(inflatedFrame);
        });
        this.__rawInflate.on('error', () => {
          reject();
        });

        this.__rawInflate.write(frame.payload);
        if (frame.isFin === true) {
          this.__rawInflate.write(PerMessageDeflateExtension.FLUSH_PATTERN);
        }

        this.__rawInflate.flush(() => {
          if (frame.isFin && this.options[PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION]) {
            this.__rawInflate.close();
            this.__rawInflate = null;
          }
        });

      })

      return p;
    }
  }

  _serializeOptions() {
    const options = this.options;
    const optionsList = [];
    if (options[PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION] === true) {
      optionsList.push(PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION);
    }

    if (options[PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION] === true) {
      optionsList.push(PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION);
    }

    if (typeof(options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS]) !== PerMessageDeflateExtension.__BOOLEAN) {
      optionsList.push(
        `${PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS}=${options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS]}`
      );
    }

    if (typeof(options[PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS]) !== PerMessageDeflateExtension.__BOOLEAN) {
      optionsList.push(
        `${PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS}=${options[PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS]}`
      );
    }

    return optionsList.join(', ');
  }
}

PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION = 'server_no_context_takeover';
PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION = 'client_no_context_takeover';
PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS = 'server_max_window_bits';
PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS = 'client_max_window_bits';

PerMessageDeflateExtension.MAX_WINDOW_BITS_ACCESSOR = new PositiveIntAccessor(null).fromString().range(8, 15);

PerMessageDeflateExtension.FLUSH_PATTERN = Buffer.from([0, 0, 0xFF, 0xFF])

PerMessageDeflateExtension.__BOOLEAN = 'boolean';

module.exports = PerMessageDeflateExtension;
