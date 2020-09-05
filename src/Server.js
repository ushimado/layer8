const Koa = require('koa');
const Router = require('koa-router');
const Endpoint = require('./Endpoint');
const assert = require('assert');
const ValidationError = require('./errors/ValidationError');
const ResponseObject = require('./responseTypes/ResponseObject');

class Server {

  /**
   * Creates an instance of Server.
   *
   * @param {Array} controllers - Array of controller instances which will be managed by this
   * server.
   * @param {Array} middlewares - Array of top level middlewares which will be executed at the top
   * level, prior to executing controller level middleware. (Optional)
   * @param {function} onBeginExecution - Asynchronous method to be executed at the beginning
   * of REST method execution (after validation).  (Optional)
   * @param {function} onExecutionComplete - Asynchronous method to be executed after execution
   * of the REST method completes. (Optional)
   * @param {function} onExecutionFailure - Asynchronous method to be executed if the REST method
   * throws an exception. (Optional)
   * @param {Array} middlewares - An array of middlewares to use at the server level. (Optional)
   * @param {boolean} verbose - If true, verbose output is enabled
   * @memberof Server
   */
  constructor(
    controllers,
    onBeginExecution,
    onExecutionComplete,
    onExecutionFailure,
    middlewares,
    verbose=False,
  ) {
    this.server = new Koa();
    this.verbose = verbose;

    if (middlewares === undefined) {
      middlewares = [];
    }

    middlewares.forEach(middleware => {
      this.server.use(middleware);
    });

    if (this.verbose === true) {
      console.debug("Creating routings")
    }

    controllers.forEach(controller => {
      const router = new Router();
      router.prefix(controller.basePath);
      controller.middlewares.forEach(middleware => {
        router.use(middleware);
      });

      controller.endpoints.forEach(endpoint => {
        if (this.verbose === true) {
          console.debug(`${controller.basePath} ${endpoint.method}`);
        }
        let routerMethodName, controllerValidateMethodName, controllerExecuteMethodName;
        if (endpoint.method === Endpoint.INDEX) {
          routerMethodName = 'get';
          controllerValidateMethodName = 'validateIndex';
          controllerExecuteMethodName = 'executeIndex';
        } else if (endpoint.method === Endpoint.GET) {
          routerMethodName = 'get';
          controllerValidateMethodName = 'validateGet';
          controllerExecuteMethodName = 'executeGet';
        } else if (endpoint.method === Endpoint.POST) {
          routerMethodName = 'post';
          controllerValidateMethodName = 'validatePost';
          controllerExecuteMethodName = 'executePost';
        } else if (endpoint.method === Endpoint.PUT) {
          routerMethodName = 'put';
          controllerValidateMethodName = 'validatePut';
          controllerExecuteMethodName = 'executePut';
        } else {
          assert(endpoint.method === Endpoint.DELETE, endpoint.method);
          routerMethodName = 'delete';
          controllerValidateMethodName = 'validateDelete';
          controllerExecuteMethodName = 'executeDelete';
        }

        router[routerMethodName](
          endpoint.relativePath, ...endpoint.middlewares, async (ctx) => {
            const session = ctx.state.session === undefined ? null : ctx.state.session;
            const validatedArgs = await controller[controllerValidateMethodName](
              ctx,
              session,
            ).catch(e => {
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

              return null;
            })

            // null indicates that validation resulted in an error
            if (validatedArgs === null) {
              return;
            }

            if (onBeginExecution !== undefined) {
              if (
                await onBeginExecution(ctx, session)
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

            const responseBody = await controller[controllerExecuteMethodName](
              session, ...validatedArgs
            ).catch(async e => {
              this._createErrorResponse(
                ctx,
                500,
                'UnexpectedError',
                'An unexpected error occurred while executing the request'
              );

              if (onExecutionFailure !== undefined) {
                await onExecutionFailure(ctx, session, e)
                .catch(e => {
                  console.log(e);
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

              // The default status is 404, only change it to 200 if it is still the default
              // in order not to interfere with redirects.
              if (ctx.status === 404) {
                ctx.status = 200;
              }
            } else {
              if (responseBody === undefined) {
                responseBody = '';
              }
              ctx.response.body = responseBody;
            }

            if (onExecutionComplete !== undefined) {
              if (
                await onExecutionComplete(ctx, session)
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

        this.server.use(
          router.routes()
          ).use(
            router.allowedMethods(
              {
                throw: true,
              }
            )
          );
      });
    })
  }

  /**
   * Sets error response on the context
   *
   * @param {*} ctx - Koa context
   * @param {number} statusCode - HTTP status code
   * @param {string} type - Error code / class
   * @param {string} message - Error message
   * @memberof Server
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

module.exports = Server;
