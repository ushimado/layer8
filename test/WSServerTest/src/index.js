const LoadTest = require('./LoadTest');

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

  const loadTest = new LoadTest(2, 10, 25);
  loadTest.start();
})();
