const {
  WebServer,
  WebSocketServer,
  PerMessageDeflateExtension,
} = require('layer8');
const SignupController = require('./controllers/SignupController');
const IndexController = require('./controllers/IndexController');
const LoginController = require('./controllers/LoginController');
const AppController = require('./controllers/AppController');
const UserController = require('./controllers/UserController');
const HobbyController = require('./controllers/HobbyController');

const TickerMessageProcessor = require('./message_processors/TickerMessageProcessor');

const AS_PORT = 8888;
const WS_PORT = 8889;

const appServer = new WebServer(
  [
    new IndexController(),
    new SignupController(),
    new LoginController(),
    new AppController(),
    new UserController(),
    new HobbyController(),
  ],
  async (ctx, session) => {
    console.log(`Executing ${ctx.method} ${ctx.path}`);

    // Typically you'd start a database transaction here, the database connection object would live
    // on the session object
  },
  async (ctx, session) => {
    console.log(`Completed ${ctx.method} ${ctx.path}`);

    // Typically you'd commit a transaction here
  },
  async (ctx, session, error) => {
    console.log(`Failed ${ctx.method} ${ctx.path}`);
    console.error(error.stack);

    // Typically you'd roll back a transaction here
  },
  [],
  true,
);

console.log(`Application server listening on port ${AS_PORT}`);
appServer.server.listen(AS_PORT);

console.log(`WebSocket server listening on port ${WS_PORT}`);
const webSocketServer = new WebSocketServer(
  [
    new TickerMessageProcessor(),

  ],
  [
    PerMessageDeflateExtension,
  ],
  true,
);
webSocketServer.listen(WS_PORT);
