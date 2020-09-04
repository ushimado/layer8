const ResponseObject = require('./ResponseObject');
const HTTPStatusCodes = require('../HTTPStatusCodes');

class JSONResponse extends ResponseObject {

  constructor(body, headers=null, cookies=null, statusCode=HTTPStatusCodes.OK) {
    if (headers === null) {
      headers = {};
    }

    super(
      JSON.stringify(body),
      {
        ...headers,
        'Content-Type': 'application/json',
      },
      cookies,
      statusCode,
    );
  }

}

module.exports = JSONResponse;
