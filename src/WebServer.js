const Koa = require('koa');
const Router = require('koa-router');
const Endpoint = require('./Endpoint');
const assert = require('assert');
const ValidationError = require('./errors/ValidationError');
const ResponseObject = require('./responseTypes/ResponseObject');
const JSONResponse = require('./responseTypes/JSONResponse');

class WebServer {

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
    verbose=false,
  ) {
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
        let routerMethodName, controllerValidateMethodName, controllerExecuteMethodName;
        if (endpoint.method === Endpoint.INDEX) {
          routerMethodName = 'get';
          controllerExecuteMethodName = 'index';
        } else if (endpoint.method === Endpoint.GET) {
          routerMethodName = 'get';
          controllerExecuteMethodName = 'get';
        } else if (endpoint.method === Endpoint.POST) {
          routerMethodName = 'post';
          controllerExecuteMethodName = 'post';
        } else if (endpoint.method === Endpoint.PUT) {
          routerMethodName = 'put';
          controllerExecuteMethodName = 'put';
        } else {
          assert(endpoint.method === Endpoint.DELETE, endpoint.method);
          routerMethodName = 'delete';
          controllerExecuteMethodName = 'delete';
        }

        router[routerMethodName](
          endpoint.relativePath, ...endpoint.processingMethods, async (ctx) => {
            const session = ctx.state.session === undefined ? null : ctx.state.session;

            let args;
            try {
              queryArgs = endpoint.processQueryArgs(ctx.request.query);
              urlParams = endpoint.processUrlParams(ctx.params);

              if (!Endpoint.METHODS_WITHOUT_PAYLOAD.has(endpoint.method)) {
                // There could be a payload
                let body = ctx.request.body;
                if (!Array.isArray(body)) {
                  body = [body];

                }

                let items;
                if (controller.dataDefinition === null) {
                  items = null;
                } else {
                  items = body.map(item => controller.dataDefinition.test(item));
                }
                args = [session, urlParams, queryArgs, items];
              } else {
                args = [session, urlParams, queryArgs];
              }
            } catch(e) {
              if (e instanceof ValidationError) {
                this._createErrorResponse(ctx, 400, 'ValidationError', e.message);
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

            let responseBody = await controller[controllerExecuteMethodName](
              ...args
            ).catch(async e => {
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

  listen(port) {
    assert(this.__isListening === false);
    this.__isListening = true;

    this.__middlewares.forEach(middleware => {
      this.__server.use(middleware);
    });

    this.__server.listen(port);
  }

  get verbose() {
    return this.__verbose;
  }

  middlewares(middlewares) {
    assert(this.__isListening === false, WebServer.PRIOR_TO_LISTEN_ERROR);
    assert(this.__middlewares.length === 0);
    assert(middlewares.length > 0);
    this.__middlewares = middlewares;

    return this;
  }

  onExecutionBegin(callback) {
    assert(this.__isListening === false, WebServer.PRIOR_TO_LISTEN_ERROR);
    assert(this.__onExecutionBegin === null);
    this.__onExecutionBegin = callback;

    return this;
  }

  onExecutionSuccess(callback) {
    assert(this.__isListening === false, WebServer.PRIOR_TO_LISTEN_ERROR);
    assert(this.__onExecutionSuccess === null);
    this.__onExecutionSuccess = callback;

    return this;
  }

  onExecutionFail(callback) {
    assert(this.__isListening === false, "define prior to invoking listen");
    assert(this.__onExecutionFail === null);
    this.__onExecutionFail = callback;

    return this;
  }

  /**
   * Sets error response on the context
   *
   * @param {*} ctx - Koa context
   * @param {number} statusCode - HTTP status code
   * @param {string} type - Error code / class
   * @param {string} message - Error message
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

WebServer.PRIOR_TO_LISTEN_ERROR = "define prior to invoking listen";

module.exports = WebServer;
