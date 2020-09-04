const assert = require('assert');
const HTTPStatusCodes = require('../HTTPStatusCodes');

class ResponseObject {
  constructor(body, headers=null, cookies=null, statusCode=HTTPStatusCodes.OK) {
    this.body = body;
    this.headers = headers;
    this.cookies = cookies;
    this.statusCode = statusCode;
  }

  serialize(ctx) {
    ctx.set('Content-Type', 'text/html');
    ctx.status = this.statusCode;

    if (this.headers !== null) {
      for (let header in this.headers) {
        const value = this.headers[header];
        ctx.set(header, value);
      }
    }

    if (this.cookies !== null) {
      assert(Array.isArray(this.cookies));

      for (let cookie of this.cookies) {
        ctx.cookies.set(
          cookie.key,
          cookie.value,
          {
            expires: cookie.expires,
            domain: cookie.domain,
            path: cookie.path,
            secure: cookie.secure,
            overwrite: cookie.overwrite,
            httpOnly: cookie.httpOnly,
          },
        )
      }
    }

    if (this.body !== null) {
      ctx.body = this.body;
    }
  }
}

module.exports = ResponseObject;
