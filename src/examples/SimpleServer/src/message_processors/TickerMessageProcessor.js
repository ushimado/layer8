const { JSONMessageProcessor } = require("layer8");
const SessionService = require('../services/SessionService');

class TickerMessageProcessor extends JSONMessageProcessor {
  constructor() {
    super('/ticker', 'accountId', true);

    setInterval(
      () => {
        const index = Math.floor(Math.random() * TickerMessageProcessor.RANDOM_MESSAGES.length);
        this.broadcast(
          {
            message: TickerMessageProcessor.RANDOM_MESSAGES[index]
          }
        );
      },
      3000
    );
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

TickerMessageProcessor.RANDOM_MESSAGES = [
  "Hello there, Layer8 says have a happy day",
  "Today is going to be a great day",
  "It's me, Layer8",
  "Big news, Layer8 rocks!",
  "Some sarcastic message about how these messages are lame...",
  "More energetic positivity from the server!!!",
  "Wow, I can't believe I'm writing all these",
  "This just in, masked winged creature spotted over got ham city",
  "Look at the moon, it looks like cheese!",
  "Can you spot the rabbit in the moon?",
  "I'm going to visit a cow farm today, how about you?",
]

module.exports = TickerMessageProcessor;
