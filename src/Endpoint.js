class Endpoint {

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
