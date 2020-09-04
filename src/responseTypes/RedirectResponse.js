const ResponseObject = require('./ResponseObject');
const HTTPStatusCodes = require('../HTTPStatusCodes');

class RedirectResponse extends ResponseObject {

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
