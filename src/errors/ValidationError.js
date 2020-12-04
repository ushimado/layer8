class ValidationError extends Error {
  constructor(key, message, value=undefined) {
    super(message);

    this.key = key;
    this.value = value;
  }
}

module.exports = ValidationError;
