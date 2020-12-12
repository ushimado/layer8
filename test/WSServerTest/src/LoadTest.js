const WebSocketEchoClient = require('./WebSocketEchoClient');

class LoadTest {

  static TIMER_INTERVAL = 50;
  static INTERVALS_PER_SECOND = 1000 / 50;

  constructor(numClients, messagesPerSecondPerClient, duration) {
    this.numClients = numClients;
    this.messagesPerSecondPerClient = messagesPerSecondPerClient;
    this.duration = duration;
    this.clients = [];

    this.messagesPerIterationPerClient = Math.ceil(messagesPerSecondPerClient / LoadTest.INTERVALS_PER_SECOND);
    this.messagesPerSecond = this.clients * this.messagesPerIteration * LoadTest.INTERVALS_PER_SECOND;
    this.startTime = null;
    this.timer = null;
    this.onDone = null;
  }

  run() {
    return new Promise((resolve, reject) => {
      this.start(() => {
        resolve();
      })
    })
  }

  start(onDone) {
    this.onDone = onDone;
    console.log("Connecting clients");
    for (let i = 0; i < this.numClients; i++) {
      const client = new WebSocketEchoClient();
      client.connect('ws://localhost:9999/echo');
      this.clients.push(client);
    }
    console.log(`All clients connected, writing for ${this.duration} seconds`);

    this.startTime = new Date().getTime();
    this.timer = setInterval(() => this.onTimer(), LoadTest.TIMER_INTERVAL);
  }

  onTimer() {
    const startTime = new Date().getTime();
    if ((startTime - this.startTime) / 1000 > this.duration) {
      clearInterval(this.timer);
      this.onDone();
    }

    let messagesSent = 0;
    for (let i = 0; i < this.messagesPerIterationPerClient; i++) {
      for (let client of this.clients) {
        const currentTime = new Date().getTime();
        if (currentTime - startTime > LoadTest.INTERVALS_PER_SECOND) {
          return;
        }

        client.write(Buffer.from('hello world'))

        messagesSent ++;
      }
    }
  }

  disconnect() {
    this.clients.forEach(client => client.close());
  }

  reportStats() {
    let sent = 0;
    let received = 0;
    this.clients.forEach(client => {
      sent += client.sent;
      received += client.received;
    });

    console.log(`Total messages sent ${sent}`);
    console.log(`Total messages received ${received}`);
  }

}

module.exports = LoadTest;
