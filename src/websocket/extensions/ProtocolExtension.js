const NotImplementedError = require('../../errors/NotImplementedError');

/**
 * Base class and interface for a protocol extension.
 *
 * @class ProtocolExtension
 */
class ProtocolExtension {

  static name = null;

  /**
   * Creates an instance of ProtocolExtension.
   *
   * @param {String} name - The name of the protocol extension as supplied in the header
   * @param {*} options
   * @memberof ProtocolExtension
   */
  constructor(name, options) {
    this.name = name;
    this.options = options;
  }

  /**
   * Creates an instance of ProtocolExtension using an Extension object.  Extension object
   * encapsulates a client's extension request and options from the handshake.
   *
   * @static
   * @param {*} extension
   * @memberof ProtocolExtension
   * @returns {ProtocolExtension}
   */
  static createInstance(extension) {
    throw new NotImplementedError();
  }

  /**
   * Callback handler for when a frame is to be written to the client.
   *
   * @param {Frame} frame - The frame being written to the client.
   * @memberof ProtocolExtension
   * @returns {Frame} - If the input frame is to be modified, this must return a new Frame instance
   */
  async onWrite(frame) {
    throw new NotImplementedError();
  }

  /**
   * Callback handler for when a frame is being read from the client.
   *
   * @param {*} frame
   * @memberof ProtocolExtension
   * @returns {Frame} - If the input frame is to be modified, this must return a new Frame instance
   */
  async onRead(frame) {
    throw new NotImplementedError();
  }

  /**
   * Serializes the extension configuration for passing back to the client during handshake.
   *
   * @returns
   * @memberof ProtocolExtension
   * @returns {String}
   */
  serialize() {
    const serOptions = this._serializeOptions();
    if (serOptions.length === 0) {
      return this.name;
    }

    return `${this.name}; ${serOptions}`;
  }

  /**
   * Serializes the protocol extension specific options for passing back to the client during
   * handshake.
   *
   * @memberof ProtocolExtension
   * @returns {String}
   */
  _serializeOptions() {
    throw new NotImplementedError();
  }
}

module.exports = ProtocolExtension;
