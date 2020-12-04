const {
  Controller,
  Endpoint,
  ResponseObject,
  ErrorResponse,
  HashUtils,
  HTTPStatusCodes,
  JSONResponse,
  Cookie,
} = require('layer8');
const body = require('koa-body');
const UserService = require('../services/UserService');
const SessionService = require('../services/SessionService');
const ErrorCodes = require('../ErrorCodes');
const fs = require('fs');
const path = require('path');
const LoginEntityDef = require('../api/LoginEntityDef');
const assert = require('assert');

class LoginController extends Controller {

  constructor() {
    super(
      LoginEntityDef,
      '/login',
      [
        new Endpoint('/', Endpoint.INDEX),
        new Endpoint('/', Endpoint.POST).middlewares([body()]),
      ]
    );
  }

  async index(session) {
    return new ResponseObject(
      fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'login.html'))
    )
  }

  async post(session, urlParams, queryArgs, items) {
    assert(items.length === 1);
    const item = items[0];

    const user = UserService.getUserByEmail(item.email);
    if (user !== null) {
      // Check the password
      const saltedHash = HashUtils.generatePasswordHash(
        item.password,
        user.salt
      );

      if (saltedHash === user.saltedHash) {
        // User is authenticated, create the session
        const session = await SessionService.create(user.id);
        const strippedSession = {
          ...session,
        };
        delete strippedSession.user.salt;
        delete strippedSession.user.saltedHash;
        return new JSONResponse(
          strippedSession,
          null,
          [
            new Cookie(
              'application',
              'Example Layer8 app',
              new Date(new Date().getTime() + (1000 * 60 * 60)),
              'lh.test.com',    // For this to work, add 127.0.0.1 alias to /etc/hosts
            )
          ]
        );
      }
    }

    return new ErrorResponse(
      'Unable to authenticate user',
      ErrorCodes.AUTHENTICATION_ERROR,
      HTTPStatusCodes.UNAUTHORIZED,
    )
  }
}

module.exports = LoginController;
