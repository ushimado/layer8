const NotImplementedError = require('./errors/NotImplementedError');
const Endpoint = require('./Endpoint');
const AbstractDataDefinition = require('./AbstractDataDefinition');
const assert = require('assert');

class Controller {

  /**
   * Creates an instance of Controller.
   *
   * @param {class} dataDefinition - The data definition class used to validate and complete
   * data consumed by this controller.
   * @param {string} basePath
   * @param {Array} endpoints
   * @memberof Controller
   */
  constructor(dataDefinition, basePath, endpoints, middlewares) {
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
    this.__middlewares = middlewares === undefined ? [] : middlewares;
    assert(Array.isArray(this.__middlewares));
  }

  get controllerProcessors() {
    return this.__middlewares;
  }

  get dataDefinition() {
    return this.__dataDefinitionInst;
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

}

module.exports = Controller;
