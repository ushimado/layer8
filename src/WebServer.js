const Koa = require('koa');
const Router = require('koa-router');
const Endpoint = require('./Endpoint');
const assert = require('assert');
const { ValidationError } = require('ensuredata');
const ResponseObject = require('./responseTypes/ResponseObject');
const JSONResponse = require('./responseTypes/JSONResponse');
const WebSocket = require('./websocket/WebSocket');

class WebServer {

  static PRIOR_TO_LISTEN_ERROR = "must be defined define prior to invoking listen";

  /**
   * Creates an instance of WebServer.
   *
   * @param {Array} controllers - Array of controller instances which will be managed by this
   * server.
   * @param {boolean} verbose - If true, verbose output is enabled
   * @memberof WebServer
   */
  constructor(
    controllers,
    options=null,
  ) {
    if (options === null) {
      options = {};
    }

    if (WebSocket.OPTION_VERBOSE in options) {
      verbose = options[WebSocket.OPTION_VERBOSE];
    } else {
      verbose = false;
    }

    const server = new Koa();

    if (verbose === true) {
      console.debug("Creating routings")
    }

    controllers.forEach(controller => {
      const router = new Router();
      router.prefix(controller.basePath);
      controller.controllerProcessors.forEach(middleware => {
        router.use(middleware);
      });

      controller.endpoints.forEach(endpoint => {
        if (verbose === true) {
          console.debug(`${controller.basePath} ${endpoint.method}`);
        }
        let routerMethodName;
        if (endpoint.method === Endpoint.INDEX) {
          routerMethodName = 'get';
        } else {
          routerMethodName = endpoint.method.toLowerCase();
        }

        router[routerMethodName](
          endpoint.relativePath, ...endpoint.processingMethods, async (ctx) => {

            let args;
            try {
              args = controller.prepareArguments(ctx, endpoint);
            } catch(e) {
              if (e instanceof ValidationError) {
                this._createErrorResponse(
                  ctx,
                  400,
                  'ValidationError',
                  {
                    key: e.key,
                    message: e.message,
                    value: e.value,
                  }
                );
              } else {
                console.error(e.stack);
                this._createErrorResponse(
                  ctx,
                  500,
                  'UnexpectedError',
                  'An unexpected error occurred while validating the request'
                );
              }

              return;
            }

            const session = args[0];
            if (this.__onExecutionBegin !== null) {
              if (
                await this.__onExecutionBegin(ctx, session)
                .then(() => {
                  return true;
                })
                .catch(e => {
                  console.log(e);

                  this._createErrorResponse(
                    ctx,
                    500,
                    'UnexpectedError',
                    'An unexpected error occurred',
                  );

                  return false;
                }) === false
              ) return;
            }

            let responseBody = await controller.invokeHandler(endpoint, args).catch(async e => {
              this._createErrorResponse(
                ctx,
                500,
                'UnexpectedError',
                'An unexpected error occurred while executing the request'
              );

              if (this.__onExecutionFail !== null) {
                await this.__onExecutionFail(ctx, session, e)
                .catch(e => {
                  console.error(e);
                });
              }

              return null;
            });

            if (responseBody === null) {
              // Null indicates an error occurred, abort further processing
              return;
            }

            if (responseBody instanceof ResponseObject) {
              responseBody.serialize(ctx);
            } else {
              // By default, wrap this in a JSONResponse object
              if (responseBody === undefined) {
                responseBody = {};
              }
              const wrappedResponse = new JSONResponse(responseBody);
              wrappedResponse.serialize(ctx);
            }

            if (this.__onExecutionSuccess !== null) {
              if (
                await this.__onExecutionSuccess(ctx, session)
                .then(() => {
                  return true;
                })
                .catch(e => {
                  console.log(e);

                  this._createErrorResponse(
                    ctx,
                    500,
                    'UnexpectedError',
                    'An unexpected error occurred',
                  );

                  return false;
                }) === false
              ) return;
            }
          }
        )

        server.use(
          router.routes()
          ).use(
            router.allowedMethods(
              {
                throw: true,
              }
            )
          );
      });

    });

    this.__server = server;
    this.__verbose = verbose;

    this.__middlewares = [];
    this.__onExecutionBegin = null;
    this.__onExecutionSuccess = null;
    this.__onExecutionFail = null;
    this.__isListening = false;
  }

  /**
   * Initiates the server listening on the specified port.
   *
   * @param {Number} port
   * @memberof WebServer
   */
  listen(port) {
    assert(this.__isListening === false);
    this.__isListening = true;

    this.__middlewares.forEach(middleware => {
      this.__server.use(middleware);
    });

    this.__server.listen(port);
  }

  close() {
    assert(this.__isListening === true);
    this.server.close();
  }

  /**
   * Specifies an array of middlewares to wrap every endpoint exposed by the server.
   *
   * @param {Array} middlewares - Array of middlewares
   * @returns
   * @memberof WebServer
   */
  middlewares(middlewares) {
    assert(Array.isArray(middlewares));
    assert(middlewares.length > 0);
    assert(this.__isListening === false, WebServer.PRIOR_TO_LISTEN_ERROR);
    assert(this.__middlewares.length === 0);
    assert(middlewares.length > 0);
    this.__middlewares = middlewares;

    return this;
  }

  /**
   * Sets an execution begin handler.  This handler is invoked when an endpoint's handler method
   * is invoked.  This invocation happens after data validation is successful.  If data validation
   * fails, this method does not get invoked.
   *
   * @param {*} callback
   * @returns
   * @memberof WebServer
   */
  onExecutionBegin(callback) {
    assert(this.__isListening === false, WebServer.PRIOR_TO_LISTEN_ERROR);
    assert(this.__onExecutionBegin === null);
    this.__onExecutionBegin = callback;

    return this;
  }

  /**
   * Sets an execution success handler.  This handler is invoked when an endpoint's handler method
   * successfully returns.
   *
   * @param {*} callback
   * @returns
   * @memberof WebServer
   */
  onExecutionSuccess(callback) {
    assert(this.__isListening === false, WebServer.PRIOR_TO_LISTEN_ERROR);
    assert(this.__onExecutionSuccess === null);
    this.__onExecutionSuccess = callback;

    return this;
  }

  /**
   * Sets an execution failure handler.  This handler is invoked when an endpoint's handler method
   * throws an exception.
   *
   * @param {*} callback
   * @returns
   * @memberof WebServer
   */
  onExecutionFail(callback) {
    assert(this.__isListening === false, WebServer.PRIOR_TO_LISTEN_ERROR);
    assert(this.__onExecutionFail === null);
    this.__onExecutionFail = callback;

    return this;
  }

  /**
   * Returns true if the server is operating in verbose mode.
   *
   * @readonly
   * @memberof WebServer
   */
  get verbose() {
    return this.__verbose;
  }

  /**
   * Sets error response on the context
   *
   * @param {Object} ctx - Koa context
   * @param {Number} statusCode - HTTP status code
   * @param {String} type - Error code / class
   * @param {String} message - Error message
   * @memberof WebServer
   */
  _createErrorResponse(ctx, statusCode, type, message) {
    ctx.status = statusCode;
    ctx.set('Content-Type', 'application/json');

    ctx.response.body = JSON.stringify({
      type,
      message,
    });
  }

}

module.exports = WebServer;
