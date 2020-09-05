class Endpoint {

  /**
   * Creates an instance of Endpoint.
   *
   * @param {string} relativePath - Path relative to the controller's path
   * @param {string} method - One of Endpoint.METHODS
   * @param {Array|null} [middlewares=null] - An array of middlewares to apply to the endpoint,
   * or null if no middlewares
   * @memberof Endpoint
   */
  constructor(relativePath, method, middlewares=null) {
    this.relativePath = relativePath;
    this.method = method;

    if (middlewares === null)
      this.middlewares = [];
    else
      this.middlewares = middlewares;
  }

}

Endpoint.INDEX = 'INDEX';
Endpoint.GET = 'GET';
Endpoint.POST = 'POST';
Endpoint.PUT = 'PUT';
Endpoint.DELETE = 'DELETE';

Endpoint.METHODS = new Set([
  Endpoint.INDEX,
  Endpoint.GET,
  Endpoint.POST,
  Endpoint.PUT,
  Endpoint.DELETE,
]);

module.exports = Endpoint;
