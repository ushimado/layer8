const sleep = require('./Sleep');
const LoadTest = require('./LoadTest');
const WebSocket = require('../../../src/websocket/WebSocket');
const WebSocketEchoClient = require('./WebSocketEchoClient');

const {
  WebSocketServer,
  PerMessageDeflateExtension
} = require('layer8');
const EchoMessageProcessor = require('./EchoMessageProcessor');

(async () => {
  const webSocketServer = new WebSocketServer(
    [
      new EchoMessageProcessor(),
    ],
    [
      PerMessageDeflateExtension,
    ],
    false,
  );

  await webSocketServer.listen(9999);

  const loadTest = new LoadTest(100, 10, 10);
  await loadTest.run();
  loadTest.reportStats();
  console.log(`Server received ${webSocketServer.messageProcessorsByEndpoint['/echo'].received}`);
  console.log(`${loadTest.bytesSent} bytes sent`);
  console.log(`${WebSocket.bytesRead} bytes received`);
  await sleep(2);
  process.exit(0);
})();
