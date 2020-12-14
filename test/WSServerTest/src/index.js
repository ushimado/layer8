const sleep = require('./Sleep');
const LoadTest = require('./LoadTest');
const IncompleteRequestTest = require('./IncompleteRequestTest');

const {
  WebSocketServer,
} = require('layer8');
const EchoMessageProcessor = require('./EchoMessageProcessor');

(async () => {
  const webSocketServer = new WebSocketServer(
    [
      new EchoMessageProcessor(),
    ]
  );

  await webSocketServer.listen(9999);

  const loadTest = new LoadTest(100, 100, 10);
  await loadTest.run();
  loadTest.reportStats();
  await IncompleteRequestTest.run();
  await sleep(2);
  process.exit(0);
})();
