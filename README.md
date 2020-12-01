# Layer8
An organized yet versatile framework for RESTful web services and websocket services.

## Key features
- Designed around RESTful endpoints
- Built in authentication and password hashing
- Thorough input data validation
- Organized routing/controller setup
- Pre/post execution hooks for transaction code
- Authenticate and service websocket clients
- Convenient JSON based protocol/framework for websocket messaging
- Broadcast data to all connected websocket clients

## Philosophy
When designing Layer8, the goal was to standardize the process of adding RESTful endpoints while eliminating a lot of the boilerplate necessary to accomplish this with frameworks such as Koa or Express.  Extending web services should be easy, with as little boilerplate as possible, allowing the developer to focus on business logic rather than framework.  Additionally, robust data validation is crucial to maintaining a secure and stable environment.  Layer8 aims to provide an excellent data validation framework for both web and websocket services, alleviating the burden on the developer to come up with a solution.

## Example application
Most of the functionality provided in Layer8 is demonstrated in the [example application](https://github.com/hashibuto/layer8/tree/master/src/examples/SimpleServer).  The application is NOT meant to be realistic from a best practices standpoint (serving static assets within the web application), but rather a full demonstration of what Layer8 is capable of, with working examples.

# Web services

## The web server
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
- EnumAccessor - used to validate an item as a member of a known collection of items
- IntAccessor - used to validate integers
- NumericAccessor - used to validate any numeric data
- PasswordAccessor - used to validate passwords with varying complexity
- PathEntityIDAccessor - used to validate entity IDs which may be represented as strings, as part of the URL path, etc.
- PositiveIntAccessor - used to validate positive integers
- PositiveNumericAccessor - used to validate positive numeric values
- StringAccessor - used to validate strings

Accessors make it very easy to define endpoint inputs and their respective data types and ranges.  They are crucial as a first line of defense against bad client data, ensuring that only expected data is passed to the server.

In the [example application's accessors](https://github.com/hashibuto/layer8/tree/master/src/examples/SimpleServer/src/api), one set of accessors has been defined per endpoint (where validation is present).

The [SignupAccessor](https://github.com/hashibuto/layer8/blob/master/src/examples/SimpleServer/src/api/SignupAccessors.js) provides an excellent illustration of using both the canned accessor objects, as well as implementing a new one for a custom validation job.

In the example:
```
SignupAccessors.FIRST_NAME = new StringAccessor('first_name').range(1, 50).trim().noSpaces();
SignupAccessors.LAST_NAME = new StringAccessor('last_name').range(1, 50).trim().noSpaces();
SignupAccessors.EMAIL = new EmailAccessor('email').trim();
SignupAccessors.PASSWORD = new StringAccessor('password').range(8, 200);
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

## Headers and cookies
Request headers and cookies are available on the Koa context object, please consult the Koa documentation for their use.  Setting response headers and cookies are carried out through the `ResponseObject`.  Headers are set by passing a javascript object (key value pairs) to the respective `ResponseObject` subclass's constructor method.  Cookies are set by passing an array of one or more `Cookie` objects to the `ResponseObject`.  Below illustrates through example, how this would be accomplished with a `JSONResponse` object.

```
  const {
    Cookie,
    JSONResponse
  } = require('layer8');

  const myResponse = new JSONResponse(
    {                                         // The response body
      message: 'hello world'
    },
    {                                         // Response headers
      'User-Agent', 'my cool client',
    },
    [                                         // Response cookies
      new Cookie(
        'session',
        'some serialized data',
        new Date(new Date().getTime + (1000 * 60 * 60 * 24)),
        'mydomain.com',
      )
    ],
  )
```

## Helper utilities
Layer8 comes with one basic set of helper utilities used to facilitate authentication and secure password storage.  These are the `HashUtils`.  See both the [SessionService](https://github.com/hashibuto/layer8/blob/master/src/examples/SimpleServer/src/services/SessionService.js) and [UserService](https://github.com/hashibuto/layer8/blob/master/src/examples/SimpleServer/src/services/UserService.js) in the example application for examples on using the `HashUtils` for password hash and salting as well as verification, and session token creation.

# Websocket services

## Websocket server

The websocket server is designed to be flexible and support multiple endpoints.  Below is a sample of the server's invocation:

```
const { WebSocketServer } = require('layer8');

const webSocketServer = new WebSocketServer(
  [
    new MovementMessageProcessor(),

  ],
  [
    PerMessageDeflateExtension,
  ],
  true,
);
webSocketServer.listen(9999);
```

Let's break down the invocation above:

```
constructor(messageProcessors, protocolExtensions=null, verbose=false)
```

Message processors can be though of as similar to controllers.  They service a given endpoint and expose a standard interface for bidirectional communication.  We'll get more into the specifics of message processors below.

Protocol extensions are extensions to the websocket protocol which behave as middleware, operating at the websocket frame level, potentially bidirectionally.  In this example we've added the `PerMessageDeflateExtension` which allows for compression and decompression of websocket frames (supported by default by most web browsers).  Supplying this extension will allow the server to use it, if it is requested by the client, but only if the client also supports it.  Extensions work on an agreement basis, meaning that both sides must support the extension in order for it to be used.

The `verbose` flag is useful for debugging in that it will generate a lot of useful debug log messages.

After construction, we invoke the `listen` method on the server, which binds to a given port (in this case `9999`) and listens for incoming connections.

## Message processors
A message processor is similar to a web service controller, in that it services a given endpoint.  In the web browser, when initiating a websocket connection, an endpoint is provided in the request.  This endpoint indicates to the websocket server, which message processor to pair the connection with.  If the endpoint is not mapped to a message processor the call will be rejected, otherwise all subsequent data will be received by the message processor matching the endpoint.

In Layer8, we have 3 basic types of message processor, which can be subclassed by the developer when implementing their own message processor.

- `MessageProcessor` - The most basic type of processor which is used to transmit unstructured messages (each message is a `Buffer` of data)
- `JSONMessageProcessor` - An unstructured JSON message processor whereby the server can send and receive JSON data.  From the developer's perspective, a message is just a JSON object (this processor will take care of (de)serialization)
- `EnumeratedMessageProcessor` - A structured message processor which provides a framework for message type enumeration over an underlying JSON based transport system.  This is the preferred (Layer8) way of developing websocket services and an example will be outlined below.

The `MessageProcessor` which is the base class for all message processors must be constructed as follows:
```
constructor(endpoint, sessionKey=null, kickDuplicateSessionKey=false)
```

Whereby the `endpoint` dictates what endpoint the message processor will service (connecting clients will be directed based on requested endpoint).
`sessionKey` if provided, allows the software to reference a connected socket by a mappable value on the session.  For instance, if a client connects and authenticates, it may have a session that looks like this:

```
{
  username: foo@bar.com,
  accountId: 129393,
  firstName: 'Fern',
  lastName: 'Oobleck',
  token: 'skjleoieijolkJFJklew32kjldfs'
}
```

Providing a `sessionKey` of `"accountId"`, will create a mapping between the connected socket for this user, and the users's account ID (`129393`).  With this mapping, instead of referencing the `WebSocket` instance directly, the message processor can write messages to `129393`, and the corresponding socket will automatically be looked up by that value on the session.  This can be very convenient for decoupling the actual socket from the user within the application.

Lastly `kickDuplicateSessionKey` is a boolean which, when set, indicates that any duplicate authenticating user (based on `sessionKey`), will cause a previously connected socket to be disconnected.  This may or may not be desirable depending on the specific use case.  If multiple authenticated users are connected and messages are sent based on `sessionKey`, they will all receive the same message.  Developers who wish to allow multiple connections by the same user, and maintain individuality concerning messaging, must always reference the socket directly, as opposed to the `sessionKey`.

When implementing a `JSONMessageProcessor` or `MessageProcessor`, the developer would subclass either base class, and implement the following methods:

```
  async onConnect(session, socket) {
  }

  async onDisconnect(session, socket) {
  }

  async onRead(session, socket, data) {
  }
```

Handler methods in the message processor will only be invoked once a websocket handshake has successfully taken place.  Clients that abort during handshake will not be directed to the message processor, thus there will always be a corresponding `onDisconnect` for a given `onConnect`.

`onConnect` will be called once a client has established a connection and completed handshake.  It bears the arguments `session` and `socket` which correspond to the developer defined session (which is an empty `{}` if no authentication is specified), and `WebSocket` instance, used for direct communication.

`onDisconnect` is called whenever a client disconnects (regardless of which side initiated the disconnection), and `onRead` is called whenever a complete data message is received.  Fragmented messages are buffered until complete and then forwarded to the message processor.  See `FrameBuffer` for maximum buffering restrictions.

The `EnumeratedMessageProcessor` is implemented slightly differently  The constructor and `onConnect` and `onDisconnect` signatures are the same, but the way messages are handled differs slightly.  Observe the following example taken partially from the example server:

```
const {
  EnumeratedMessageProcessor,
  EnumeratedMessage
} = require("layer8");
const SessionService = require('../services/SessionService');

class TickerMessageProcessor extends EnumeratedMessageProcessor {
  constructor() {
    super('/ticker', 'accountId', true);
  }

  static onTextMessage(session, socket, body) {
    console.log(`Client ${session.user.email} received a text message:\n${body.text}`)
  }

  async onConnect(session, socket) {
    console.log(`Client ${session.user.email} joined via websocket`)
  }

  async onDisconnect(session, socket) {
    console.log(`Client ${session.user.email} disconnected from websocket server`)
  }

  async authenticate(token) {
    // Will return null if the token is not authenticated
    return SessionService.getByToken(token)
  }

  get messageHandlerMapping() {
    return TickerMessageProcessor.MESSAGE_HANDLER_MAPPING;
  }
}

TickerMessageProcessor.MESSAGE_HANDLER_MAPPING = {
  TEXT_MESSAGE: TickerMessageProcessor.onTextMessage,
};

module.exports = TickerMessageProcessor;
```

You will notice the property `messageHandlerMapping` which returns `TickerMessageProcessor.MESSAGE_HANDLER_MAPPING`.  This property returns a mapping between any given message type, and corresponding handler.  In this example we only have one registered message type, but a more sophisticated message processor may need to support multiple message types originating from the client.  This mapping allows the message processor to easily pick a handler method for a given message type.  Consider the following JSON payload:

```
{
  "type": "TEXT_MESSAGE",
  "body": {
    "text": "Hello there server"
  }
}
```

This message would automatically be deserialized to a `EnumeratedMessage` object, which has a couple of standard properties, such as `type`, and `body`.  The `EnumeratedMessageProcessor` uses the `type` property in order to determine to which handler to route the message.  In the case above, the `body` portion is then routed to the static handler `TickerMessageProcessor.onTextMessage`.

Handlers can be synchronous or asynchronous.  The `EnumeratedMessageProcessor` will always attempt to wait on an asynchronous handler.

```
static async onTextMessage(session, socket, body) {
}
```

Similar to the `MessageProcessor`'s `onRead` method, each handler receives a `session`, `socket`, and instead of `data`, `body` represents the `body` portion of the `EnumeratedMessage` which will be automatically deserialized from a JSON string.

## Authentication
Authentication is handled using the `async authenticate(token)` method.  The client would provide an authentication token in the endpoint as a query argument.  Specifically `?auth_token={authentication token}`.  The `authenticate` method will then receive this token and authentication must be implemented by the developer.  A `null` return value indicates failed authentication and the connection will be closed by the server.

## Protocol extensions

At present, Layer8 only ships with `PerMessageDeflateExtension` which is used to support the `per_message_deflate` extension, enabling frame compression.  Additional extensions can be authored by the developer by subclassing the `ProtocolExtension` class.
