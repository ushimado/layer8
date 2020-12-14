const net = require('net');
const sleep = require('./Sleep');
const assert = require('assert');

class IncompleteRequestTest {

  static async run() {
    console.log("Performing incomplete request test");
    const socket = new net.Socket();
    let closed = false;
    socket.on('close', () => {
      console.log("Server closed connection");
      closed = true;
    })
    socket.connect({
      host: 'localhost',
      port: 9999,
    }, () => {
      console.log("Client connected")
    });

    console.log('Waiting 5 seconds')
    await sleep(5);
    assert(closed === true);
  }

}

module.exports = IncompleteRequestTest;
