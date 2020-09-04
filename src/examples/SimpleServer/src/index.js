const { Server } = require('layer8');
const SignupController = require('./controllers/SignupController');
const IndexController = require('./controllers/IndexController');
const LoginController = require('./controllers/LoginController');
const AppController = require('./controllers/AppController');
const UserController = require('./controllers/UserController');
const HobbyController = require('./controllers/HobbyController');

const port = 8888;

const appServer = new Server(
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

console.log(`Listening on port ${port}`);
appServer.server.listen(port);
