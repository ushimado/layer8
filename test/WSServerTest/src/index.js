const sleep = require('./Sleep');
const LoadTest = require('./LoadTest');

const {
  WebSocketServer,
} = require('layer8');
const EchoMessageProcessor = require('./EchoMessageProcessor');

(async () => {
  const webSocketServer = new WebSocketServer(
    [
      new EchoMessageProcessor(),
    ],
    [],
    false,
  );

  await webSocketServer.listen(9999);

  const loadTest = new LoadTest(100, 100, 10);
  await loadTest.run();
  loadTest.reportStats();
  console.log(`Server received ${webSocketServer.messageProcessorsByEndpoint['/echo'].received}`);
  await sleep(2);
  process.exit(0);
})();
