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

In this example, a controller with 2 methods is illustrated:
```
const {
  Controller,
  Endpoint,
  ResponseObject,
  RedirectResponse,
  Accessor,
} = require('layer8');
const body = require('koa-body');
const TestAccessors = require('../api/TestAccessors');

class TestController extends Controller {

  constructor() {
    super(
      '/test',
      [
        new Endpoint('/', Endpoint.INDEX),
        new Endpoint('/', Endpoint.POST, [body()]),
      ]
    );
  }

  async validateIndex(ctx, session) {
    // Since there is no input data, there is nothing to validate
    return [];
  }

  async executeIndex(session) {
    // Execution goes in here.  Each execute method should return a subclass
    // of the ResponseObject.  In this case we'll return a simple hello world

    return new ResponseObject("Hello world")
  }

  async validatePost(ctx, session) {
    // Validates the input data parsed from the form data

    return Accessor.validateAll(
      ctx.request.body,
      [
        TestAccessors.FIRST_NAME,
        TestAccessors.LAST_NAME,
        TestAccessors.EMAIL,
      ]
    );
  }

  async executePost(session, firstName, lastName, email) {
    // Do something with the data, then return a response (in this case a redirect)

    return RedirectResponse("/thank_you");
  }

}

module.exports = TestController;
```

When writing a new controller, we first subclass the `Controller` class, which provides the basic interface for building our own controllers.  Here we've supplied implementations for 2 methods (`INDEX` and `POST`), by providing those `Endpoint` objects in the constructor, and then overriding the respective base methods to perform both validation and execution.

Let's take a closer look at the constructor:

```
  constructor() {
    super(
      '/test',
      [
        new Endpoint('/', Endpoint.INDEX),
        new Endpoint('/', Endpoint.POST, [body()]),
      ]
    );
  }
```

Here, we're invoking the base class constructor and passing the endpoint's base path as the first argument.  In this case `/test`.  We then supply 2 endpoints, each of which has its own path suffix, and method.  In this case, both path suffixes are `/`, which means there is no additional appendage to the `/test` path.  Effectively we are supporting the `INDEX` and `POST` methods when a vistor hits the `/test` endpoint.

In the case of
```
new Endpoint('/', Endpoint.POST, [body()])
```

We are supplying an array of middlewares, in this case, the `koa-body` body parser, which will automatically extract supplied form data and make it available on the koa context as `ctx.request.body`.  We then perform validation in the `validatePost` method, using 3 accessors, each of which defines a piece of data to be validated, and the validation technique.  We'll get more into accessors later.

Once the controller is written, its routings get added to the server by instantiating the controller and passing in into the `Server` constructor in the array of controllers.  In this example we would do:

```
  const { Server } = require('layer8');
  const TestController = require('./controllers/TestController`)

  const appServer = new Server(
    [
      new TestController(),
    ],
  );

  appServer.server.listen(8888);
```

## Endpoints
The `Endpoint` class defines an endpoint's path extension, HTTP method, and any middlewares to execute when a visitor visits that specific endpoint.  Endpoint instances are passed to the `Controller` at the time of instantiation and determine which routings are available to the controller.

The `Endpoint` constructor takes the following arguments:

```
  @param {string} relativePath - The path of the endpoint relative to the controller's path.
  @param {string} method - The HTTP method which the endpoint accepts (See Endpoint.METHODS)
  @param {Array|null} [middlewares=null] - An array of middlewares to apply to the endpoint (or null for none)
```

Here are a few example endpoints to illustrate their construction:

```
/* An endpoint with no change relative to the controller's path, allowing the HTTP GET method */

new Endpoint('/', Endpoint.GET);
```

```
/* An endpoint with no change relative to the controller's path, allowing the HTTP GET method, receiving a path argument representing an entity ID.
*/

new Endpoint('/:id', Endpoint.GET);
```

```
/* An endpoint with /user appended to the controller's path, allowing the HTTP PUT method, receiving a path argument representing an entity ID */

new Endpoint('/user/:id', Endpoint.PUT);
```

```
/* An endpoint with /user appended to the controller's path, allowing the HTTP POST method, receiving multiple path arguments */

new Endpoint(':parent/user/:id', Endpoint.POST);
```

In the examples above, you can see that arguments can be defined in the URL path by prefixing a name with a `:`.  The names can be anything you like, and these path arguments will be exposed on the koa context as `ctx.params`.  They can be validated just like any other input data using the accessors.

Endpoints are added to a `Controller` via its constructor as seen below:

```
  constructor() {
    super(
      '/example',
      [
        new Endpoint('/', Endpoint.INDEX),
        new Endpoint('/:id', Endpoint.GET),
        new Endpoint('/:id', Endpoint.PUT),
        new Endpoint('/:id', Endpoint.POST),
      ]
    );
  }
```

## Accessors
Subclasses of the `Accessor` object perform data translation and validation.  They are called accessors because they are used to access data within objects.  Layer8 provides several useful accessors out of the box, but you can create new ones in order to provide any desired translation/validation by simply subclassing the `Accessor` object, or any of its subclasses, and overriding the `validate` method.

The following accessors are provided by Layer8

- ArrayAccessor - used to validate an array of data
- EmailAccessor - used to validate email addresses
- IntAccessor - used to validate integers
- NumericAccessor - used to validate any numeric data
- PathEntityIDAccessor - used to validate entity IDs which may be represented as strings, as part of the URL path, etc.
- PositiveIntAccessor - used to validate positive integers
- PositiveNumericAccessor - used to validate positive numeric values
- StringAccessor - used to validate strings

Accessors make it very easy to define endpoint inputs and their respective data types and ranges.  They are crucial as a first line of defense against bad client data, ensuring that only expected data is passed to the server.

In the [example application's accessors](https://github.com/hashibuto/layer8/tree/master/src/examples/SimpleServer/src/api), one set of accessors has been defined per endpoint (where validation is present).

The [SignupAccessor](https://github.com/hashibuto/layer8/blob/master/src/examples/SimpleServer/src/api/SignupAccessors.js) provides an excellent illustration of using both the canned accessor objects, as well as implementing a new one for a custom validation job.

In the example:
```
SignupAccessors.FIRST_NAME = new StringAccessor('first_name', true, undefined, 1, 50);
SignupAccessors.LAST_NAME = new StringAccessor('last_name', true, undefined, 1, 50);
SignupAccessors.EMAIL = new EmailAccessor('email');
SignupAccessors.PASSWORD = new StringAccessor('password', true, undefined, 8, 200);
```

We can see that 4 simple accessors are instantiated and will be reused by the controller on each request.  The accessors define the attribute where the data can be found on the target object, using a dot delimited notation, as well as other key information such as whether or not the data is required, any default value, or any length constraints, etc.  You will have to review the specific arguments of each type of accessor in order to determine its specific use.

The accessors would subsequently be used in the specific validation method on the controller.  For instance, if we were validating signup data as defined by the accessors above, we'd place them within the `validatePost` method, in order to validate the input form data, and provide output via an array to the execute method.

```
class SignupController extends Controller {

  .
  .
  .

  async validatePost(ctx, session) {
    // Validates the input data parsed from the form data

    return Accessor.validateAll(
      ctx.request.body,
      [
        SignupAccessors.FIRST_NAME,
        SignupAccessors.LAST_NAME,
        SignupAccessors.EMAIL,
        SignupAccessors.PASSWORD,
      ]
    );
  }

  async executePost(session, firstName, lastName, email, password) {
    .
    .
    .
  }
```

The `Accessor.validateAll` helper method simply takes an input object, and an array of accessors, then returns an array of validated data, in the same order that the accessors were provided.

Nested data can be accessed using `.` separated notation, such as:
```
  new PositiveNumericAccessor('user.job.salary')
```

In which case the object would be recursively traversed until the data is acquired.  Accessors can also be used directly without the `Accessor.validateAll` helper method.

```
  async validatePost(ctx, session) {
    const body = ctx.request.body;
    return [
      SignupAccessors.FIRST_NAME.validate(body),
      SignupAccessors.LAST_NAME.validate(body),
      .
      .
      .
    ]
  }
```

It is important to note, that an `Accessor` instantiated with a `null` key will attempt to validate the object directly when `validate` is invoked, rather than attempting to look up the value on a target object.  This is useful when using accessors to evaluate arrays of items, etc., where object lookup is not necessary.

## Authenticators
Layer8 provides some authentication mechanisms, in addition to some utility classes to aid in the process of authentication.  The authentication class provided out of the box is:
- TokenAuthenticator - Used to authenticate an authorization token on each access restricted request

Authenticators extend the `Authenticator` class, and each must be further extended in order to be used.  Below is an example of how the `TokenAuthenticator` is fully implemented.

```
const { TokenAuthenticator } = require('layer8');
const assert = require('assert');

class MyTokenAuthenticator extends TokenAuthenticator {

  static _instance = null;

  constructor() {
    super();

    assert(
      MyTokenAuthenticator._instance === null,
      "MyTokenAuthenticator should be a singleton instance"
    );
    MyTokenAuthenticator._instance = this;
  }

  static use(ctx, next) {
    if (MyTokenAuthenticator._instance === null) {
      new MyTokenAuthenticator();
    }

    return MyTokenAuthenticator._instance.authenticate(ctx, next)
  }

  async _doAuthentication(authToken) {
    // Here, the developer implements application specific logic to
    // authenticate the validity of the auth token.  Cache checking,
    // database checking, expiration date/time checking.

    // A valid auth token results in the returning of a session object (just
    // a regular javascript object).  An invalid auth token results in the
    // return of null.
  }

}

module.exports = MyTokenAuthenticator;
```

In the above example, there are a couple of things going on.  One, we've implemented `MyTokenAuthenticator` as a singleton.  This way, the same instance can be reused on each request.  We can also simply pass `MyTokenAuthenticator.use` as a middleware, to any endpoint / controller which requires authentication.

`TokenAuthenticator` expects a bearer token located in the `Authorization` header.  Typically the client will provide this token after initial authentication of the user's credentials have taken place and a token is created.

## Response objects
Each execution method of a controller should return a `ResponseObject`.  A `ResponseObject` is used to format and return data to the client, passing necessary headers to indicate content type, etc.  A controller method that does not return a `ResponseObject` will return an empty body.  This is acceptable when there is simply no data to return.

Layer8 implements a few subclasses of the `ResponseObject` in order to generate some of the common response types.

- `ResponseObject` - A text/html response for rendering pages, etc
- `JSONResponse` - Used to return JSON data to the client
- `RedirectResponse` - Issues a redirect to the client
- `ErrorResponse` - Indicates an error and takes the form of a JSON payload

All of the above subclasses of the `ResponseObject` can be passed headers and cookies to set on the response.  See each individual class for constructor specifics.

## Helper utilities
Layer8 comes with one basic set of helper utilities used to facilitate authentication and secure password storage.  These are the `HashUtils`.  See both the [SessionService](https://github.com/hashibuto/layer8/blob/master/src/examples/SimpleServer/src/services/SessionService.js) and [UserService](https://github.com/hashibuto/layer8/blob/master/src/examples/SimpleServer/src/services/UserService.js) in the example application for examples on using the `HashUtils` for password hash and salting as well as verification, and session token creation.
