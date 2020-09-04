const Authenticator = require('./Authenticator');
const JSONResponse = require('../responseTypes/JSONResponse');

class CredentialAuthenticator extends Authenticator {

  /**
   * Creates an instance of CredentialAuthenticator.
   *
   * @param {*} [settings=CredentialAuthenticator.DEFAULT_SETTINGS] -A collection of settings which
   * dictate both then key names of the username and password values, as well as how to handle the
   * authentication failure response.  See CredentialAuthenticator.DEFAULT_SETTINGS for available
   * settings.  Note, when supplying a custom settings object, ALL keys must be present.  For this
   * reason it would make sense to use a spread in order to retain any unspecifed defaults:
   *
   * const customSettings = {
   *   ...CredentialAuthenticator.DEFAULT_SETTINGS,
   *   usernameKey: 'email',
   * }
   * @memberof CredentialAuthenticator
   */
  constructor(settings=CredentialAuthenticator.DEFAULT_SETTINGS) {
    this.settings = settings;
  }

  /**
   * Authenticates a POSTed username/password pair.
   *
   * @static
   * @param {*} ctx
   * @param {*} next
   * @param {*} doAuthenticate - Async callback method which performs authentication against the
   * provided arguments (username, password) and returns either an array containing
   * (authToken, sessionObject) or null if authentication failed.
   * @memberof CredentialAuthenticator
   */
  async authenticate(ctx, next) {
    const body = ctx.request.body;
    const username = body[this.settings.usernameKey];
    const password = body[this.settings.passwordKey];

    const result = await this._doAuthentication(username, password);

    if (result === null) {
      ctx.status = 401;
      this.settings.responseType.serialize(ctx);

      return;
    }

    const [authToken, session] = result;
    ctx.set('Authorization', `Bearer ${authToken}`);
    ctx.state.session = session;

    await next();
  }

  /**
   * Checks credentials against database, etc.  This must be implemented in the concrete
   * implementation of this class.
   *
   * @param {string} username
   * @param {string} password
   * @returns Returns null if authentication failed, or a 2 element Array, containing the auth token
   * and the session object (which must be a mapping type).
   * @memberof CredentialAuthenticator
   */
  async _doAuthentication(username, password) {
    throw new NotImplementedError('This must be implemented by the user in a subclass');
  }

}

CredentialAuthenticator.DEFAULT_SETTINGS = {
  usernameKey: 'username',
  passwordKey: 'password',
  responseType: new JSONResponse({
    type: 'AuthenticationError',
    message: 'Authentication failed',
  }),
}

module.exports = CredentialAuthenticator;
