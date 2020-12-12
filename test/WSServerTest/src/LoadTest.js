const WebSocketEchoClient = require('./WebSocketEchoClient');

class LoadTest {

  constructor(numClients, messagesPerSecondPerClient, duration) {
    this.numClients = numClients;
    this.messagesPerSecondPerClient = messagesPerSecondPerClient;
    this.duration = duration;
    this.clients = [];

    this.messagesPerIterationPerClient = Math.ceil(messagesPerSecondPerClient / (1000 / 50));
    this.messagesPerSecond = this.clients * this.messagesPerIteration * (1000 / 50);
    this.startTime = null;
    this.timer = null;
  }

  start() {
    console.log("Connecting clients");
    for (let i = 0; i < this.numClients; i++) {
      const client = new WebSocketEchoClient();
      client.connect('ws://localhost:9999/echo');
      this.clients.push(client);
    }
    console.log("All clients connected");

    this.startTime = new Date().getTime();
    this.timer = setInterval(() => this.onTimer(), 50);
  }

  onTimer() {
    const startTime = new Date().getTime();
    if ((startTime - this.startTime) / 1000 > this.duration) {
      clearInterfval(this.timer);
    }

    let messagesSent = 0;
    for (let i = 0; i < this.messagesPerIterationPerClient; i++) {
      for (let client of this.clients) {
        const currentTime = new Date().getTime();
        if (currentTime - startTime > (1000 / 50)) {
          console.log(`Wrote ${messagesSent} before stopping due to time expiration`)
          return;
        }

        client.write(Buffer.from('hello world'))

        messagesSent ++;
      }
    }

    console.log(`Wrote ${messagesSent}!`)
  }

}

module.exports = LoadTest;
