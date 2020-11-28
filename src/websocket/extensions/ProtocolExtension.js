class ProtocolExtension {

  static name = null;

  constructor(name, options) {
    this.name = name;
    this.options = options;
  }

  static createInstance(extension) {
    throw new Error("Not implemented");
  }

  async onWrite(frame) {
    throw new Error('Not implemented')
  }

  async onRead(frame) {
    throw new Error('Not implemented')
  }

  serialize() {
    const serOptions = this._serializeOptions();
    if (serOptions.length === 0) {
      return this.name;
    }

    return `${this.name} ${serOptions}`;
  }

  _serializeOptions() {
    throw new Error("Not implemented");
  }
}

module.exports = ProtocolExtension;
