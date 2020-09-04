const { TokenAuthenticator } = require('layer8');
const SessionService = require('./SessionService');
const assert = require('assert');

class AuthenticationService extends TokenAuthenticator {

  static _instance = null;

  constructor() {
    super();

    assert(
      AuthenticationService._instance === null,
      "AuthenticationService should be a singleton instance"
    );
    AuthenticationService._instance = this;
  }

  static use(ctx, next) {
    if (AuthenticationService._instance === null) {
      new AuthenticationService();
    }

    return AuthenticationService._instance.authenticate(ctx, next)
  }

  async _doAuthentication(authToken) {
    return SessionService.getByToken(authToken);
  }

}

module.exports = AuthenticationService;
