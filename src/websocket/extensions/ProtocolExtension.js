class ProtocolExtension {

  constructor(name) {
    this.name = name;
  }

  static createInstance(extension) {
    throw new Error("Not implemented");
  }

  onWrite(data) {
    return data;
  }

  onRead(data) {
    return data;
  }
}

module.exports = ProtocolExtension;
