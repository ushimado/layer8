const ResponseObject = require('./ResponseObject');
const HTTPStatusCodes = require('../HTTPStatusCodes');

class RedirectResponse extends ResponseObject {

  /**
   * Creates an instance of RedirectResponse.
   *
   * @param {string} url - URL to redirect the client toward
   * @param {object|null} [headers=null] - Optional headers
   * @param {object|null} [cookies=null] - Optional cookies
   * @param {number} [statusCode=HTTPStatusCodes.MOVED_PERMANENTLY] - HTTP status code
   * @memberof RedirectResponse
   */
  constructor(url, headers=null, cookies=null, statusCode=HTTPStatusCodes.MOVED_PERMANENTLY) {
    super(null, headers, cookies, statusCode);
    this.url = url;
  }

  serialize(ctx) {
    super.serialize(ctx);
    ctx.redirect(this.url);
  }

}

module.exports = RedirectResponse;
