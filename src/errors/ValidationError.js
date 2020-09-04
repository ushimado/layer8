class ValidationError extends Error {
  constructor(key, message) {
    super(message);

    this.key = key;
  }
}

module.exports = ValidationError;
