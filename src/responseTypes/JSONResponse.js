const ResponseObject = require('./ResponseObject');
const HTTPStatusCodes = require('../HTTPStatusCodes');

class JSONResponse extends ResponseObject {

  /**
   * Creates an instance of JSONResponse.
   *
   * @param {object} body - Body as a javascript object
   * @param {object|null} [headers=null] - Optional headers
   * @param {Array|null} [cookies=null] - Optional cookies
   * @param {number} [statusCode=HTTPStatusCodes.OK] - HTTP status code
   * @memberof JSONResponse
   */
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
