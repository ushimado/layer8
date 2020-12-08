const NotImplementedError = require('./errors/NotImplementedError');
const Endpoint = require('./Endpoint');
const { AbstractDataDefinition } = require('ensuredata');
const assert = require('assert');

/**
 * Implements the base for a web service controller.
 *
 * @class Controller
 */
class Controller {

  static METHOD_TO_NAME = Object.fromEntries([
    [Endpoint.INDEX, 'index'],
    [Endpoint.GET, 'get'],
    [Endpoint.POST, 'post'],
    [Endpoint.PUT, 'put'],
    [Endpoint.DELETE, 'delete'],
  ])

  /**
   * Creates an instance of Controller.
   *
   * @param {class} dataDefinition - The data definition class used to validate and complete
   * data consumed by this controller.
   * @param {string} basePath - The controller's base path in the URL.  Endpoints will begin defining
   * their specific paths from this point.
   * @param {Array} endpoints - An array of endpoint instances, serviced by the controller.
   * @param {?Array} middlewares - An array of middlewares used to wrap the endpoint method
   * @memberof Controller
   */
  constructor(dataDefinition, basePath, endpoints, middlewares=null) {
    if (typeof dataDefinition === 'function') {
      const dataDefinitionInst = new dataDefinition();
      assert(dataDefinitionInst instanceof AbstractDataDefinition);
      this.__dataDefinitionInst = dataDefinitionInst;
    } else {
      assert(dataDefinition === null);
      this.__dataDefinitionInst = null;
    }

    assert(Array.isArray(endpoints), 'Argument must be an array of endpoint objects');
    assert(endpoints.length > 0, 'A controller must expose at least one endpoint');

    const usedMethods = new Set();
    endpoints.forEach(endpoint => {
      assert(endpoint instanceof Endpoint, 'Each endpoint must be an Endpoint object instance');
      assert(
        !usedMethods.has(endpoint.method),
        `Controller cannot expose ${endpoint.method} more than once`
      );
      usedMethods.add(endpoint.method);
    });

    this.__basePath = basePath;
    this.__endpoints = endpoints;
    this.__endpointByMethod = {};
    this.__middlewares = middlewares === null ? [] : middlewares;
    assert(Array.isArray(this.__middlewares));
  }

  /**
   * Implements the GET method for any/all entities
   *
   * @param {Object} session - The session object
   * @param {Object} urlParams - Validated URL parameters
   * @param {Object} queryArgs - Validated query arguments
   * @memberof Controller
   */
  async index(session, urlParams, queryArgs) {
    throw new NotImplementedError('The index method is not implemented');
  }

  prepareArguments(ctx, endpoint) {
    const method = endpoint.method;
    assert(method in Controller.METHOD_TO_NAME);

    const queryArgs = endpoint.processQueryArgs(ctx.request.query);
    const urlParams = endpoint.processUrlParams(ctx.params);
    const session = ctx.state.session === undefined ? null : ctx.state.session;

    if (!Endpoint.METHODS_WITHOUT_PAYLOAD.has(method)) {
      let items = null;
      const dataDefinition = this.__dataDefinitionInst;
      if (dataDefinition !== null) {
        let body = ctx.request.body;
        if (!Array.isArray(body)) {
          body = [body];
        }
        items = body.map(item => dataDefinition.test(item));
      }
      return [session, urlParams, queryArgs, items];
    }

    return [session, urlParams, queryArgs];
  }

  async invokeHandler(endpoint, args) {
    const method = endpoint.method;
    assert(method in Controller.METHOD_TO_NAME);
    const handler = this[Controller.METHOD_TO_NAME[method]];
    return handler(...args);
  }

  /**
   * Implements the GET method for a single entity
   *
   * @param {Object} session - The session object
   * @param {Object} urlParams - Validated URL parameters
   * @param {Object} queryArgs - Validated query arguments
   * @memberof Controller
   */
  async get(session, urlParams, queryArgs) {
    throw new NotImplementedError('The get method is not implemented');
  }

  /**
   * Implements the POST method for one or more entities
   *
   * @param {Object} session - The session object
   * @param {Object} urlParams - Validated URL parameters
   * @param {Object} queryArgs - Validated query arguments
   * @param {Array} items - One or more items to be created
   * @memberof Controller
   */
  async post(session, urlParams, queryArgs, items) {
    throw new NotImplementedError('The post method is not implemented');
  }

  /**
   * Implements the PUT method for one or more entities
   *
   * @param {Object} session - The session object
   * @param {Object} urlParams - Validated URL parameters
   * @param {Object} queryArgs - Validated query arguments
   * @param {Array} items - One or more items to be modified
   * @memberof Controller
   */
  async put(session, urlParams, queryArgs, items) {
    throw new NotImplementedError('The put method is not implemented');
  }

  /**
   * Implements the DELETE method for a single entity
   *
   * @param {Object} session - The session object
   * @param {Object} urlParams - Validated URL parameters
   * @param {Object} queryArgs - Validated query arguments
   * @memberof Controller
   */
  async delete(session, urlParams, queryArgs) {
    throw new NotImplementedError('The delete method is not implemented');
  }

  /**
   * Returns an array of endpoints associated with the controller
   *
   * @readonly
   * @returns {Array}
   * @memberof Controller
   */
  get endpoints() {
    return this.__endpoints;
  }

  /**
   * Returns the base URL path of the controller
   *
   * @readonly
   * @returns {String}
   * @memberof Controller
   */
  get basePath() {
    return this.__basePath;
  }

  /**
   * Returns an array of middleware functions used to wrap each endpoint handler invocation
   *
   * @readonly
   * @returns {Array}
   * @memberof Controller
   */
  get controllerProcessors() {
    return this.__middlewares;
  }
}

module.exports = Controller;
