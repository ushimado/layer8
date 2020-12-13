const WebSocketEchoClient = require('./WebSocketEchoClient');
const sleep = require('./Sleep');

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
      this.start(async () => {
        console.log("Waiting 3 seconds for inbound data to finalize");
        await sleep(3);

        for (let client of this.clients) {
          await client.close();
        }
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
    this.startTime = new Date().getTime();
    setTimeout(
      () => {
        console.log("Beginning to write")
        this.timer = setInterval(() => this.onTimer(), LoadTest.TIMER_INTERVAL);
      },
      1000
    );
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

        const text = "hello world";
        client.write(Buffer.from(text))

        messagesSent ++;
      }
    }
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
    console.log(`Avg. transfer ${(sent / this.duration).toFixed(2)} per second`);
    if (sent !== received) {
      console.error("Sent did not equal received, loss must be investigated!")
    }
  }

}

module.exports = LoadTest;
