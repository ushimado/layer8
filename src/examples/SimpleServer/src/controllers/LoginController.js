const {
  Controller,
  Endpoint,
  ResponseObject,
  ErrorResponse,
  Accessor,
  HashUtils,
  HTTPStatusCodes,
  JSONResponse,
  Cookie,
} = require('layer8');
const body = require('koa-body');
const LoginAccessors = require('../api/LoginAccessors');
const UserService = require('../services/UserService');
const SessionService = require('../services/SessionService');
const ErrorCodes = require('../ErrorCodes');
const fs = require('fs');
const path = require('path');

class LoginController extends Controller {

  constructor() {
    super(
      '/login',
      [
        new Endpoint('/', Endpoint.INDEX),
        new Endpoint(
          '/',
          Endpoint.POST,
          [
            body(),
          ]
        ),
      ]
    );
  }

  /**
   * Returns the login page.
   */
  async validateIndex(ctx, session) {
    return [];
  }

  async executeIndex(session) {
    return new ResponseObject(
      fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'login.html'))
    )
  }

  async validatePost(ctx, session) {
    return Accessor.validateAll(
      ctx.request.body,
      [
        LoginAccessors.EMAIL,
        LoginAccessors.PASSWORD,
      ]
    );
  }

  async executePost(session, email, password) {
    const user = UserService.getUserByEmail(email);
    if (user !== null) {
      // Check the password
      const saltedHash = HashUtils.generatePasswordHash(
        password,
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
