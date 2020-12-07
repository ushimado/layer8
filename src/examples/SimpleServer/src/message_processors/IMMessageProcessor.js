const {
  EnumeratedMessageProcessor,
} = require("layer8");
const SessionService = require('../services/SessionService');
const InstantMessageDef = require('../api/InstantMessageDef');
const InstantMessageEnumDef = require('../api/InstantMessageEnumDef');

class IMMessageProcessor extends EnumeratedMessageProcessor {
  constructor() {
    super('/ticker', InstantMessageDef, 'accountId', true);

    setInterval(
      () => {
        const index = Math.floor(Math.random() * IMMessageProcessor.RANDOM_MESSAGES.length);
        this.broadcast({
          type: InstantMessageEnumDef.TEXT_MESSAGE,
          text: IMMessageProcessor.RANDOM_MESSAGES[index]
        });
      },
      3000
    );
  }

  static onTextMessage(session, socket, data) {
    console.log(`Client ${session.user.email} received a text message:\n${data.text}`)
  }

  static onTextBroadcast(session, socket, data) {
    console.log(`Client ${session.user.email} sent a broadcast message:\n${data.text}`)
    this.broadcast(data);
  }

  async onConnect(session, socket) {
    console.log(`Client ${session.user.email} joined via websocket`)
  }

  async onDisconnect(session, socket) {
    console.log(`Client ${session.user.email} disconnected from websocket server`)
  }

  async authenticate(token) {
    // Will return null if the token is not authenticated
    return SessionService.getByToken(token)
  }

  get messageHandlerMapping() {
    return IMMessageProcessor.MESSAGE_HANDLER_MAPPING;
  }
}

IMMessageProcessor.RANDOM_MESSAGES = [
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
];

IMMessageProcessor.MESSAGE_HANDLER_MAPPING = Object.fromEntries([
  [InstantMessageEnumDef.TEXT_MESSAGE, IMMessageProcessor.onTextMessage],
  [InstantMessageEnumDef.TEXT_BROADCAST, IMMessageProcessor.onTextBroadcast],
]);

module.exports = IMMessageProcessor;
