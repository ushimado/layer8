const assert = require('assert');
const {
  ValidationError,
  AbstractType
} = require('ensuredata');

class Endpoint {

  /**
   * Creates an instance of Endpoint.
   *
   * @param {string} relativePath - Path relative to the controller's path
   * @param {string} method - One of Endpoint.METHODS
   * @memberof Endpoint
   */
  constructor(relativePath, method) {
    this.__queryArgs = null;
    this.__queryArgsLower = null;
    this.__urlParams = null;
    this.__middlewares = [];

    this.__relativePath = relativePath;
    this.__method = method;
  }

  get processingMethods() {
    return this.__middlewares;
  }

  get relativePath() {
    return this.__relativePath;
  }

  get method() {
    return this.__method;
  }

  processQueryArgs(obj) {
    if (this.__queryArgs === null) {
      return {};
    }

    return this.__processArgs(this.__queryArgs, obj, this.__queryArgsLower);
  }

  processUrlParams(obj) {
    if (this.__urlParams === null) {
      return {};
    }

    return this.__processArgs(this.__urlParams, obj);
  }

  queryArgs(definition) {
    assert(this.__queryArgs === null);

    const queryArgsLower = {};
    for (let key in definition) {
      const dataType = definition[key];
      assert(dataType instanceof AbstractType);
      queryArgsLower[key] = key.toLowerCase();
    }

    this.__queryArgs = definition;
    this.__queryArgsLower = queryArgsLower;

    return this;
  }

  urlParams(definition) {
    assert(this.__urlParams === null);

    for (let key in definition) {
      const dataType = definition[key];
      assert(dataType instanceof AbstractType);
    }

    this.__urlParams = definition;

    return this;
  }

  middlewares(middlewares) {
    assert(Array.isArray(middlewares));
    assert(middlewares.length > 0);
    assert(this.__middlewares.length === 0);

    this.__middlewares = middlewares;

    return this;
  }

  __processArgs(definition, obj, caselessLookup=null) {
    const target = {};
    for (let key in definition) {
      const dataType = definition[key];
      let value;

      let caseLessKey = caselessLookup === null ? key : caselessLookup[key];
      if (!(caseLessKey in obj)) {
        if (dataType.defaultVal === undefined) {
          throw new ValidationError(key, 'argument is required');
        }

        value = dataType.defaultVal;
      } else {
        value = dataType.fromString(obj[caseLessKey]);
      }

      dataType.test(value, this.method === Endpoint.POST);
      target[key] = value;
    }

    return target;
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

Endpoint.METHODS_WITHOUT_PAYLOAD = new Set([
  Endpoint.INDEX,
  Endpoint.GET,
  Endpoint.DELETE,
]);

module.exports = Endpoint;
