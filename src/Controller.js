const NotImplementedError = require('./errors/NotImplementedError');
const Endpoint = require('./Endpoint');
const assert = require('assert');

class Controller {

  /**
   * Creates an instance of Controller.
   *
   * @param {string} basePath
   * @param {Array} endpoints
   * @param {Array} middlewares - An array of middlewares to apply to the controller. (Optional)
   * @memberof Controller
   */
  constructor(basePath, endpoints, middlewares) {
    assert(Array.isArray(endpoints), 'Argument must be an array of endpoint objects');
    assert(endpoints.length > 0, 'A controller must expose at least one endpoint');

    const methods = new Set();
    endpoints.forEach(endpoint => {
      assert(endpoint instanceof Endpoint, 'Each endpoint must be an Endpoint object instance');
      assert(
        !methods.has(endpoint.method),
        `Controller cannot expose ${endpoint.method} more than once`
      );
      methods.add(endpoint.method)
    });

    this.basePath = basePath;
    this.endpoints = endpoints;

    if (middlewares === undefined)
      this.middlewares = [];
    else
      this.middlewares = middlewares;
  }

  /**
   * Validates a GET index request and returns an array of validated data.
   *
   * @param ctx - The Koa context object.
   * @param {Session} session - Session object or null if no session exists.
   * @memberof Controller
   * @returns {Array} - Validated arguments which will be passed to the execute method.
   */
  async validateIndex(ctx, session) {
    throw new NotImplementedError('The validateIndex method is not implemented');
  }

  /**
   * Executes the GET index request using the arguments provided by the validation method.
   *
   * @param {Session} session
   * @param {*} args - Arguments returned by the validation method.
   * @memberof Controller
   */
  async executeIndex(session, ...args) {
    throw new NotImplementedError('The executeIndex method is not implemented');
  }

  /**
   * Validates a GET request and returns an array of validated data.
   *
   * @param ctx - The Koa context object.
   * @param {Session} session - Session object or null if no session exists.
   * @memberof Controller
   * @returns {Array} - Validated arguments which will be passed to the execute method.
   */
  async validateGet(ctx, session) {
    throw new NotImplementedError('The validateGet method is not implemented');
  }

  /**
   * Executes the GET request using the arguments provided by the validation method.
   *
   * @param {Session} session
   * @param {*} args - Arguments returned by the validation method.
   * @memberof Controller
   */
  async executeGet(session, ...args) {
    throw new NotImplementedError('The executeGet method is not implemented');
  }

  /**
   * Validates a POST request and returns an array of validated data.
   *
   * @param ctx - The Koa context object.
   * @param {Session} session - Session object or null if no session exists.
   * @memberof Controller
   * @returns {Array} - Validated arguments which will be passed to the execute method.
   */
  async validatePost(ctx, session) {
    throw new NotImplementedError('The validatePost method is not implemented');
  }

  /**
   * Executes the POST request using the arguments provided by the validation method.
   *
   * @param {Session} session
   * @param {*} args - Arguments returned by the validation method.
   * @memberof Controller
   */
  async executePost(session, ...args) {
    throw new NotImplementedError('The executePost method is not implemented');
  }

  /**
   * Validates a PUT request and returns an array of validated data.
   *
   * @param ctx - The Koa context object.
   * @param {Session} session - Session object or null if no session exists.
   * @memberof Controller
   * @returns {Array} - Validated arguments which will be passed to the execute method.
   */
  async validatePut(ctx, session) {
    throw new NotImplementedError('The validatePut method is not implemented');
  }

  /**
   * Executes the PUT request using the arguments provided by the validation method.
   *
   * @param {Session} session
   * @param {*} args - Arguments returned by the validation method.
   * @memberof Controller
   */
  async executePut(session, ...args) {
    throw new NotImplementedError('The executePut method is not implemented');
  }

  /**
   * Validates a DELETE request and returns an array of validated data.
   *
   * @param ctx - The Koa context object.
   * @param {Session} session - Session object or null if no session exists.
   * @memberof Controller
   * @returns {Array} - Validated arguments which will be passed to the execute method.
   */
  async validateDelete(ctx, session) {
    throw new NotImplementedError('The validateDelete method is not implemented');
  }

  /**
   * Executes the DELETE request using the arguments provided by the validation method.
   *
   * @param {Session} session
   * @param {*} args - Arguments returned by the validation method.
   * @memberof Controller
   */
  async executeDelete(session, ...args) {
    throw new NotImplementedError('The executeDelete method is not implemented');
  }

}

module.exports = Controller;
