const zlib = require('zlib');
const ProtocolExtension = require("./ProtocolExtension");
const ExtensionRequest = require("../ExtensionRequest");
const {
  ValidationError,
  IntType,
} = require('ensuredata');
const assert = require('assert');
const Frame = require('../Frame');
const ParseError = require('../../errors/ParseError');

/**
 * Implements the "permessage-deflate" websocket protocol extension.
 *
 * @class PerMessageDeflateExtension
 * @extends {ProtocolExtension}
 */
class PerMessageDeflateExtension extends ProtocolExtension {

  static name = "permessage-deflate";

  /**
   * Implements the createInstance interface.
   *
   * @static
   * @param {ExtensionRequest} extension - Client supplied extension request
   * @returns {PerMessageDeflateExtension}
   * @memberof PerMessageDeflateExtension
   */
  static createInstance(extension) {
    assert(extension instanceof ExtensionRequest);
    assert(extension.name === this.name);

    const options = {};
    PerMessageDeflateExtension.validateServerNoContextTakeoverOption(extension, options);
    PerMessageDeflateExtension.validateClientNoContextTakeoverOption(extension, options);
    PerMessageDeflateExtension.validateServerMaxWindowBitsOption(extension, options);
    PerMessageDeflateExtension.validateClientMaxWindowBitsOption(extension, options);

    return new PerMessageDeflateExtension(options);
  }

  /**
   * Validates the "server_no_context_takeover" option from a client supplied extension request.
   *
   * @static
   * @param {ExtensionRequest} extension - Client supplied extension request
   * @param {Object} options
   * @memberof PerMessageDeflateExtension
   */
  static validateServerNoContextTakeoverOption(extension, options) {
    if (PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION in extension.options) {
      const option = extension.options[PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION];
      if (option !== true) {
        throw new ValidationError(
          PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION,
          'Only a value of True is permitted if this option is provided',
          option
        );
      }

      options[PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION] = option;
    } else {
      options[PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION] = false;
    }
  }

  /**
   * Validates the "client_no_context_takeover" option from a client supplied extension request.
   *
   * @static
   * @param {ExtensionRequest} extension - Client supplied extension request
   * @param {Object} options
   * @memberof PerMessageDeflateExtension
   */
  static validateClientNoContextTakeoverOption(extension, options) {
    if (PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION in extension.options) {
      const option = extension.options[PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION];
      if (option !== true) {
        throw new ValidationError(
          PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION,
          'Only a value of True is permitted if this option is provided',
          option,
        )
      }

      options[PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION] = option;
    } else {
      options[PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION] = false;
    }
  }

  /**
   * Validates the "server_max_window_bits" option from a client supplied extension request.
   *
   * @static
   * @param {ExtensionRequest} extension - Client supplied extension request
   * @param {Object} options
   * @memberof PerMessageDeflateExtension
   */
  static validateServerMaxWindowBitsOption(extension, options) {
    if (PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS in extension.options) {
      const option = extension.options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS];
      let value;
      if (option !== true) {
        try {
          const intOption = PerMessageDeflateExtension.MAX_WINDOW_BITS_ACCESSOR.fromString(option);
          value = PerMessageDeflateExtension.MAX_WINDOW_BITS_ACCESSOR.test(intOption);
        } catch(e) {
          throw new ParseError(e.message ? e.message !== undefined : '');
        }
        options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS] = value
      } else {
        options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS] = true;
      }
    } else {
      options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS] = false;
    }
  }

  /**
   * Validates the "client_max_window_bits" option from a client supplied extension request.
   *
   * @static
   * @param {ExtensionRequest} extension - Client supplied extension request
   * @param {Object} options
   * @memberof PerMessageDeflateExtension
   */
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

  /**
   * Creates an instance of PerMessageDeflateExtension.
   *
   * @param {Object} options - Options for use with the extension as requested by the client if
   * fulfillable by the server.
   * @memberof PerMessageDeflateExtension
   */
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
      serverMaxWindowBits = serverMaxWindowBitsOption;
    }

    this.clientMaxWindowBits = clientMaxWindowBits;
    this.serverMaxWindowBits = serverMaxWindowBits;
    this.__rawInflate = null;
    this.__rawDeflate = null;
  }

  /**
   * Implements the onWrite interface, compressing the payload and returning a new, compressed frame
   *
   * @param {*} frame
   * @returns {Frame}
   * @memberof PerMessageDeflateExtension
   */
  async onWrite(frame) {
    // This will require creation of a new frame, since payload information, size, etc. will change

    if (this.__rawDeflate === null) {
      this.__rawDeflate = zlib.createDeflateRaw({
        windowBits: this.serverMaxWindowBits,
      });

      this.__rawDeflate.on('data', (data) => {
        const deflatedFrame = Frame.create(
          data.slice(0, -4),      // Truncate the flush pattern before writing the frame
          true,
          this.__rawDeflate.frame.rsv2,
          this.__rawDeflate.frame.rsv3,
          this.__rawDeflate.frame.opcode,
          null,
          this.__rawDeflate.frame.isFin,
        )
        this.__rawDeflate.resolve(deflatedFrame);
      });
      this.__rawDeflate.on('error', () => {
        this.__rawDeflate.reject();
      });
    }

    const p = new Promise((resolve, reject) => {
      // Apply the callback handler each time, to account for the new promise object
      this.__rawDeflate.resolve = resolve;
      this.__rawDeflate.reject = reject;
      this.__rawDeflate.frame = frame;
      this.__rawDeflate.write(frame.payload);
      this.__rawDeflate.flush(zlib.Z_SYNC_FLUSH, () => {
        if (!this.__rawDeflate) {
          return;
        }

        if (
          frame.isFin &&
          this.options[PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION]
        ) {
          this.__rawDeflate.close();
          this.__rawDeflate = null;
        }

      });
    });

    return p;
  }

  /**
   * Implements the onRead interface, decompressing the payload and returning a new, decompressed
   * frame
   *
   * @param {*} frame
   * @returns {Frame}
   * @memberof PerMessageDeflateExtension
   */
  async onRead(frame) {
    // RSV1 is designated as the compression bit, if set, compression has been applied.
    if (frame.rsv1 === true) {
      if (this.__rawInflate === null) {
        this.__rawInflate = zlib.createInflateRaw({
          windowBits: this.clientMaxWindowBits,
        });
        this.__rawInflate.on('data', (data) => {
          const inflatedFrame = Frame.create(
            data,
            this.__rawInflate.frame.rsv1,
            this.__rawInflate.frame.rsv2,
            this.__rawInflate.frame.rsv3,
            this.__rawInflate.frame.opcode,
            null,
            this.__rawInflate.frame.isFin,
          )
          this.__rawInflate.resolve(inflatedFrame);
        });
        this.__rawInflate.on('error', (error) => {
          this.__rawInflate.reject();
        });
      }

      const p = new Promise((resolve, reject) => {
        // Apply the callback handler each time, to account for the new promise object
        this.__rawInflate.resolve = resolve;
        this.__rawInflate.reject = reject;
        this.__rawInflate.frame = frame;
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

    // No compression on the frame, just return it as-is
    return frame;
  }

  /**
   * Implements the _serializeOptions interface and returns the options string based on the client
   * / server negotiation for the handshake response.
   *
   * @returns {String}
   * @memberof PerMessageDeflateExtension
   */
  _serializeOptions() {
    const options = this.options;
    const optionsList = [];
    if (options[PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION] === true) {
      optionsList.push(PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION);
    }

    if (options[PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION] === true) {
      optionsList.push(PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION);
    }

    if (
      PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS in options &&
      typeof(options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS]) !== PerMessageDeflateExtension.__BOOLEAN
    ) {
      optionsList.push(
        `${PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS}=${options[PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS]}`
      );
    }

    if (
      PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS in options &&
      typeof(options[PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS]) !== PerMessageDeflateExtension.__BOOLEAN
    ) {
      optionsList.push(
        `${PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS}=${options[PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS]}`
      );
    }

    return optionsList.join('; ');
  }
}

PerMessageDeflateExtension.SERVER_NO_CONTEXT_TAKEOVER_OPTION = 'server_no_context_takeover';
PerMessageDeflateExtension.CLIENT_NO_CONTEXT_TAKEOVER_OPTION = 'client_no_context_takeover';
PerMessageDeflateExtension.SERVER_MAX_WINDOW_BITS = 'server_max_window_bits';
PerMessageDeflateExtension.CLIENT_MAX_WINDOW_BITS = 'client_max_window_bits';

PerMessageDeflateExtension.MAX_WINDOW_BITS_ACCESSOR = new IntType().from(8).to(15);

PerMessageDeflateExtension.FLUSH_PATTERN = Buffer.from([0, 0, 0xFF, 0xFF])

PerMessageDeflateExtension.__BOOLEAN = 'boolean';

module.exports = PerMessageDeflateExtension;
