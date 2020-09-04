const Authenticator = require('./Authenticator');
const HTTPStatusCodes = require('../HTTPStatusCodes');
const ErrorResponse = require('../responseTypes/ErrorResponse');

class TokenAuthenticator extends Authenticator {

  constructor(settings=TokenAuthenticator.DEFAULT_SETTINGS) {
    super();
    this.settings = settings;
  }

  async authenticate(ctx, next) {
    const authTokenInfo = ctx.get('Authorization');
    if (authTokenInfo !== undefined) {
      const tokenParts = authTokenInfo.split(' ');
      if (tokenParts.length === 2) {
        const [tokenType, authToken] = tokenParts;
        if (tokenType === 'Bearer') {
          const session = await this._doAuthentication(authToken);
          if (session !== null && session !== undefined) {
            ctx.state.session = session;

            await next();
            return;
          }
        }
      }
    }

    this.settings.failureResponse.serialize(ctx);
  }

  /**
   * Checks auth token against cache, database, etc.  This must be implemented in the concrete
   * implementation of this class.
   *
   * @param {string} authToken
   * @returns Returns null if authentication failed, or the session object if succeded.  Session
   * must be a mapping type object.
   * @memberof TokenAuthenticator
   */
  async _doAuthentication(authToken) {
    throw new NotImplementedError('This must be implemented by the user in a subclass');
  }

}

TokenAuthenticator.DEFAULT_SETTINGS = {
  failureResponse: new ErrorResponse(
    'Authentication failed',
    'AuthenticationError',
    HTTPStatusCodes.UNAUTHORIZED,
  ),
}

module.exports = TokenAuthenticator;
