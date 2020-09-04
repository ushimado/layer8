const JSONResponse = require('./JSONResponse');

class ErrorResponse extends JSONResponse {

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
