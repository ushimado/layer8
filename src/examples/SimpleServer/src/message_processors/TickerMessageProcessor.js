const { JSONMessageProcessor } = require("layer8");
const SessionService = require('../services/SessionService');

class TickerMessageProcessor extends JSONMessageProcessor {
  constructor() {
    super('/ticker', 'accountId', true);

    setInterval(() => this.br)
  }

  async onConnect(session, socket) {
    console.log(`Client ${session.user.email} joined via websocket`)
  }

  async onDisconnect(session, socket) {
    console.log(`Client ${session.user.email} disconnected from websocket server`)
  }

  async onRead(session, socket, data) {
    console.log(`Client ${session.user.email} sent a message`)
    console.log(data);
  }

  async authenticate(token) {
    // Will return null if the token is not authenticated
    return SessionService.getByToken(token)
  }
}

module.exports = TickerMessageProcessor;
