const JSONResponse = require('./JSONResponse');

class ErrorResponse extends JSONResponse {

  /**
   * Creates an instance of ErrorResponse.
   *
   * @param {string} message - Error message
   * @param {string} errorCode - Error code / class
   * @param {number} statusCode - HTTP status code
   * @param {Object|null} [headers=null] - Optional headers
   * @param {Array|null} [cookies=null] - Optional cookies
   * @memberof ErrorResponse
   */
  constructor(message, errorCode, statusCode, headers=null, cookies=null) {
    super(
      {
        message,
        errorCode,
      },
      headers,
      cookies,
      statusCode,
    );
  }

}

module.exports = ErrorResponse;
