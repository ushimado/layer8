const { MessageProcessor } = require("layer8");
const SessionService = require('../services/SessionService');

class TickerMessageProcessor extends MessageProcessor {
  constructor() {
    super('/ticker', []);
  }

  async authenticate(token) {
    // Will return null if the token is not authenticated
    return SessionService.getByToken(token)
  }
}

module.exports = TickerMessageProcessor;
