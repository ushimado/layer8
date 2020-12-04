const assert = require('assert');
const AuthenticationService = require('../services/AuthenticationService');
const { Controller } = require('layer8');

class AuthenticatedController extends Controller {

  constructor(dataDefinition, basePath, endpoints, middlewares) {
    if (middlewares !== undefined) {
      assert(Array.isArray(middlewares));
    }

    let updatedMiddlewares = [
      ...middlewares === undefined ? [] : middlewares,
      AuthenticationService.use,
    ];

    super(dataDefinition, basePath, endpoints, updatedMiddlewares);
  }

}

module.exports = AuthenticatedController;
