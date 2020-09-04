# Layer8
An organized yet versatile web services framework (built on top of Koa).

## Key features
- Designed around RESTful endpoints
- Built in authentication and password hashing
- Thorough input data validation
- Organized routing/controller setup
- Pre/post execution hooks for transaction code

## Philosophy
When designing Layer8, the goal was to standardize the process of adding RESTful endpoints while eliminating a lot of the boilerplate necessary to accomplish this with frameworks such as Koa or Express.  Extending web services should be easy, with as little boilerplate as possible, allowing the developer to focus on business logic rather than framework.

## The server
Layer8 is built around [Koa](https://www.npmjs.com/package/koa) which has served as a reliable base for writing web services.  Below is a sample illustrating the most basic server configuration:

```
const { Server } = require('layer8');

const appServer = new Server(
  [
    ...controllerInstances,
  ],
);

appServer.server.listen(8888);
```

The basic server setup is very minimal.  The first argument is an array of controller instances.  Each controller defines its own routing.  In a more complex setup below, we can see how method execution can be wrapped in a transaction block.

```
const { Server } = require('layer8');

const appServer = new Server(
  [
    ...controllerInstances,
  ],
  () => {
    // Callback for when endpoint execution begins
    // myTransaction.begin();
  },
  () => {
    // Callback for when endpoint execution completes (only if no exception is thrown)
    // myTransaction.commit();
  },
  () => {
    // Callback for when endpoint execution fails (only if exception is thrown)
    // myTransaction.rollback();
  }
);

appServer.server.listen(8888);
```

Of course transaction management is only one factet of what these callbacks can be used for, but the point is adequately illustrated. Additionally, an array of middlewares can be passed into the `Server` constructor, which will execute in order, on every endpoint prior to execution.  This is useful for things such as endpoint timing, etc.  Middlewares take the standard form of:

```
@param {object} ctx - The Koa context object (request info, etc.)
@param {function} next - The next middleware in the stack to execute
async (ctx, next) => {
  // Insert code here

  await next();
}
```

## Controllers
Controllers both define and implement the endpoint and all supported methods of said endpoint.  Layer8 controllers support the following methods / pseudomethod:

- INDEX
- GET
- POST
- PUT
- DELETE

`INDEX` is actually a `GET` method, but facilitates the common use case whereby an entity ID is not supplied and all entities are requested for the particular endpoint.

Each HTTP method is broken into two supporting methods on the controller object: one facilitates input data validation, and the other performs execution based on the validated data.

