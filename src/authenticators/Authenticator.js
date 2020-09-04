const NotImplementedError = require('../errors/NotImplementedError');

class Authenticator {

  /**
   * Establishes the Authenticator middleware interface.  Must invoke next() or set ctx response
   * values and return in the event of authentication failure.
   *
   * @param {*} ctx
   * @param {*} next - Invokes the next method in the middleware stack.
   * @memberof Authenticator
   */
  async authenticate(ctx, next) {
    throw new NotImplementedError('Authenticator must be subclassed');
  }

  /**
   * Called when the authenticator attempts to check credentials.  This method should be overridden
   * in the subclass with any custom logic (checking cache, checking database, etc.)
   *
   * @param {*} args
   * @returns Returns null if authentication failed
   * @memberof Authenticator
   */
  async _doAuthentication(...args) {
    throw new NotImplementedError('This must be implemented by the user in a subclass');
  }

}

module.exports = Authenticator;
