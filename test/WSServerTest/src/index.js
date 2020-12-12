const LoadTest = require('./LoadTest');
const sleep = require('./Sleep');

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
    true,
  );

  await webSocketServer.listen(9999);

  const loadTest = new LoadTest(2, 10, 5);
  await loadTest.run();
  console.log("Waiting 3 seconds");
  await sleep(3);
  loadTest.disconnect();
  loadTest.reportStats();
})();
