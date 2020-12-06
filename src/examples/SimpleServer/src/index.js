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

const IMMessageProcessor = require('./message_processors/IMMessageProcessor');

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
  true,
).onExecutionBegin(async (ctx, session) => {
  console.log(`Executing ${ctx.method} ${ctx.path}`);

  // Typically you'd start a database transaction here, the database connection object would live
  // on the session object.  You may just filter on ctx.method for non-readonly methods
  // when transacting (eg. no transaction on a GET/INDEX method)
}).onExecutionSuccess(async (ctx, session) => {
  console.log(`Completed ${ctx.method} ${ctx.path}`);

  // Typically you'd commit a transaction here if one was begun
}).onExecutionFail(async (ctx, session, error) => {
  console.log(`Failed ${ctx.method} ${ctx.path}`);
  console.error(error.stack);

  // Typically you'd roll back a transaction here if one was begun
});

console.log(`Application server listening on port ${AS_PORT}`);
appServer.listen(AS_PORT);

console.log(`WebSocket server listening on port ${WS_PORT}`);
const webSocketServer = new WebSocketServer(
  [
    new IMMessageProcessor(),
  ],
  [
    PerMessageDeflateExtension,
  ],
  true,
);
webSocketServer.listen(WS_PORT);
