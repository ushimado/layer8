# Layer8
A well organized framework for web and websocket services which takes data validation very seriously.

## Key features
- Designed for RESTful endpoints
- Built in authentication and password hashing
- Exceptionally thorough data validation
- Organized routing/controller setup
- Pre/post execution hooks for transaction code

## Philosophy
Layer8 was designed with consistency in mind.  The aim was to provide a consistent way for developers develop web and websocket services, while automating some of the more challenging and/or error prone tasks such as data validation.  Web services are designed to be implicitly RESTful, and both web and websocket services take advantage of [EnsureData](https://www.npmjs.com/ensuredata), our through data validation library, making API building, a dead simple process.

## Example application
Most of the functionality provided in Layer8 is demonstrated in the [example application](https://github.com/hashibuto/layer8/tree/master/src/examples/SimpleServer).  The application is NOT meant to be realistic from a best practices standpoint (serving static assets within the web application), but rather a full demonstration of what Layer8 is capable of, with working examples of both a web, and websocket server.

# Web services

## The web server
Layer8 is built around [Koa](https://www.npmjs.com/package/koa) which has served as a reliable base for writing web services.  Below is a sample illustrating the most basic server configuration:

```
const { Server } = require('layer8');

const appServer = new Server([
    ...controllerInstances,
]);

appServer.listen(8888);
```

The basic server setup is very minimal.  The first argument is an array of controller instances.  Each controller defines its own routing.  In a more complex setup below, we can see how method execution can be wrapped in a transaction block.

```
const { Server } = require('layer8');

const appServer = new Server([
    ...controllerInstances,
]).onExecutionBegin(async (ctx, session) => {
  // Start transaction
}).onExecutionSuccess(async (ctx, session) => {
  // Commit transaction
}).onExecutionFail(async (ctx, session, error) => {
  // Roll back transaction
});

appServer.listen(8888);
```

Of course transaction management is only one factet of what these callbacks can be used for, but the point is adequately illustrated. Additionally, an array of middlewares can be attached to the `Server`, which will execute in order, on every endpoint prior to execution.

```
new Server([
  ...controllers
]).middlewares([
  ...middlewares
]);
```

This is useful for things such as endpoint timing, etc.  Middlewares take the standard form of:

```
@param {object} ctx - The Koa context object (request info, etc.)
@param {function} next - The next middleware in the stack to execute
async (ctx, next) => {
  // Insert code here

  await next();
}
```

## Endpoints
The `Endpoint` class defines an endpoint's path extension, HTTP method, and any middlewares to execute when a visitor visits that specific endpoint.  Endpoint instances are passed to the `Controller` at the time of instantiation and determine which routings are available to the controller.

The `Endpoint` constructor takes the following arguments:

```
  @param {string} relativePath - The path of the endpoint relative to the controller's path.
  @param {string} method - The HTTP method which the endpoint accepts (See Endpoint.METHODS)
```

The `Endpoint` class also provides a few additional methods, allowing for attachment of middlewares, query argument validators, and URL parameter validators.  Let's take a look at a few example endpoint initializations:

```
  new Endpoint('/', Endpoint.INDEX),
  new Endpoint('/:id', Endpoint.GET).urlParams({id: new IntType().from(1)}),
```
Here, two endpoints are exposed.  The first of the two, is exposes the `INDEX` method off the root of the controller.  The second, slightly more complicated instance exposes the `GET` method off the root of the controller, with a single url parameter `:id`.  The `.urlParams({id: new IntType().from(1)})` following, indicates that the following validator mapping will be used to validate URL arguments.

```
{
  id: new IntType().from(1),
}
```

In this case, the `id` refers to the `:id` in the URL, and the `new IntType().from(1)` indicates that it will accept instances of integers, greater than or equal to 1.  See [EnsureData](https://www.npmjs.com/ensuredata) for detailed information on defining validators.

Endpoints accept the following attachments:
- `.middlewares([...])` - Defines middlewares to be used just with this endpoint.  Middlewares take the same form of method as defined at the server level.
- `.queryArgs({...})` - Accepts an object which consists of key/validator pairs.  Each key refers to an argument (eg: `myname=`) in the query arguments.
- `.urlParams({...})` - Accepts an object which consists of key/validator pairs.  Each key refers to an argument (eg: `:myId`) in the URL path.

Any arguemnts coming from the URL path or query string must be validated, otherwise they will not be made available to the controller.

## Controllers
Controllers both define and implement the endpoint and all supported methods of said endpoint.  Layer8 controllers support the following methods / pseudomethod:

- INDEX
- GET
- POST
- PUT
- DELETE

`INDEX` is actually a `GET` method but facilitates a GET all, whereas GET would typically GET a single specific entity.  Each method has a corresponding overridable method in the controller, which will receive fully validated input, based on the validation criteria.  Below is a full featured example, consisting of a controller that creates/updates/retrieves and deletes instances of a given entity type.  To keep things organized, we'll define the entity validator first in a separate code block, using [EnsureData](https://www.npmjs.com/ensuredata)'s definition framework.

```
const {
  AbstractDataDefinition,
  IntType,
  StringType,
  EmailType
} = require('ensuredata);

class UserDef extends AbstractDataDefinition {

  static DEFINITION = {
    id: new IntType().from(1).onlyAfterCreate(),
    firstName: new String().maxLength(25).trim(),
    lastName: new String().maxLength(25).trim(),
    emailType: new EmailType(),
  }

  get definition() {
    return UserDef.DEFINITION;
  }

}
```
Above, we've defined an entity and its constraints.  This definition will be associated with the controller, and used to ensure that all input is valid.  Invalid input will trigger a `ValidationError`.  Here's how we'd implement the controller:

```
const {
  IntType
} = require('ensuredata');
const { Controller } = require('layer8');
const assert = require('assert');

class UserController extends Controller {

  static URL_PARAMS_DEF = {
    id: new IntType().from(1),
  }

  constructor() {
    super(
      UserDef,
      '/user',
      [
        new Endpoint('\', Endpoint.INDEX).queryArgs({
          pageNum: new IntType(1).from(1),
          pageSize: new IntType(25).from(1),
        }),
        new Endpoint('\:id', Endpoint.GET).urlParams(UserController.URL_PARAMS_DEF),
        new Endpoint('\:id', Endpoint.PUT).urlParams(UserController.URL_PARAMS_DEF),
        new Endpoint('\:id', Endpoint.POST),
      ],
    );
  }

  async index(session, urlParams, queryArgs) {
    const pageNum = queryArgs.pageNum;
    const pageSize = queryArgs.pageSize;

    return await UserService.getUsers(pageNum, pageSize);
  }

  async get(session, urlParams, queryArgs) {
    const id = urlParams.id;

    return await UserService.getUser(id);
  }

  async put(session, urlParams, queryArgs, items) {
    assert(items.length === 1);
    const user = items[0];

    const id = urlParams.id;
    await UserService.updateUser(id, user);
  }

  async post(session, urlParams, queryArgs, items) {
    assert(items.length === 1);
    const user = items[0];

    await UserService.createUser(user);
  }
}
```

A few things to note in the example above.  First, the arguments which contain data for each endpoint are always validated by the controller. Unvalidated data never makes it to the controller immplementation.  Second, you will notice the `.onlyAfterCreate()` which was applied to the `UserDef` definition in the code block previous to this one.  This means that the `id` key is only validated on objects which are already created.  What this means is that `PUT` and `DELETE` methods will require the key to be present, however `POST` methods will not, and will simply omit it, if it happens to be provided on the object.  In the example above, we supplied the id in the URL parameter to each of the methods that required it, but it should be noted that it must also be available on the object itself since it was added to the definition.

Lastly, you'll notice the `items` argument.  Layer8 was designed to receive one or more entities.  In the case where a single entity is received, it gets encapsulated in an array.  This makes implementing methods that need to create or edit multiple entities at once, simple.  Simply pass an array of them, and the entire array will be validated and returned as the `items` argument.  Above, we are expecting a single entity only, so we assert such.

## Controller responses

Each controller method is expected to return an instance of `ResponseObject`.  There are a few types of `ResponseObject`, each of which has a specific role.

- `ResponseObject` - The base class for all responses, expects string type data, can do things like set headers, cookies, and status code.
- `JSONResponse` - Implements `ResponseObject` for JSON type data.
- `ErrorResponse` - Implements a JSON based error response.
- `RedirectResponse` - Initiates a browser redirect.

In our controller example above, we were returning regular objects.  By default, Layer8 will wrap any response that isn't an instance of a `ResponseObject` in a `JSONResponse`.  Here's how we'd initiate a redirect in a controller method:

```
async index(session, urlParams, queryArgs) {
  return new RedirectResponse('https://www.newsite.com);
}
```
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

## Helper utilities
Layer8 comes with one basic set of helper utilities used to facilitate authentication and secure password storage.  These are the `HashUtils`.  See both the [SessionService](https://github.com/hashibuto/layer8/blob/master/src/examples/SimpleServer/src/services/SessionService.js) and [UserService](https://github.com/hashibuto/layer8/blob/master/src/examples/SimpleServer/src/services/UserService.js) in the example application for examples on using the `HashUtils` for password hash and salting as well as verification, and session token creation.

# Websocket services

## Websocket server

The websocket server is designed to be flexible and support multiple endpoints.  Below is a sample of the server's invocation:

```
const { WebSocketServer } = require('layer8');

const webSocketServer = new WebSocketServer(
  [
    new MovementMessageProcessor(Move),
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

The `EnumeratedMessageProcessor` is implemented slightly differently  The constructor and `onConnect` and `onDisconnect` signatures are the same, but the way messages are handled differs slightly.  First, we need to define the enumeration of message types this processor will accept.  We use [EnsureData](https://www.npmjs.com/ensuredata)'s `EnumType` and `AbstractDataDefinition` to accomplish this:

```
const { EnumType } = require('ensuredata');

class InstantMessageEnumDef extends EnumType {

  static TEXT_MESSAGE = "TEXT_MESSAGE";
  static TEXT_BROADCAST = "TEXT_BROADCAST";

  static COLLECTION = [
    InstantMessageEnumDef.TEXT_MESSAGE,
    InstantMessageEnumDef.TEXT_BROADCAST,
  ]

  get collection() {
    return InstantMessageEnumDef.COLLECTION;
  }

}

module.exports = InstantMessageEnumDef;
```
Above, we've enumerated the message types `TEXT_MESSAGE` and `BROADCAST_MESSAGE`.  Next, let's create a base definition that will be used to generically validate the message, and pick the appropriate concrete definition to perform full validation.

```
const InstantMessageEnumDef = require('./InstantMessageEnumDef');
const { EnumeratedMessageDefinition } = require("layer8");
const {
  StringType,
} = require('ensuredata');

class InstantMessageDef extends EnumeratedMessageDefinition {

  get enumTypeDef() {
    return InstantMessageEnumDef;
  }

  get definition() {
    return {
      ...super.definition,
      text: new StringType().maxLength(255),
    }
  }

}

module.exports = InstantMessageDef;
```
Above, we've established the common property `text`, as well as the `EnumType` used to validate the message type.  Next, we'll create one subclass for each of the available message types for this message processor.

```
const InstantMessageDef = require("./InstantMessageDef");
const InstantMessageEnumDef = require('./InstantMessageEnumDef');

class TextMessageDef extends InstantMessageDef {

  get typeName() {
    return InstantMessageEnumDef.TEXT_MESSAGE;
  }

}

module.exports = TextMessageDef;
```
and

```
const InstantMessageDef = require("./InstantMessageDef");
const InstantMessageEnumDef = require('./InstantMessageEnumDef');
const { BooleanType } = require('ensuredata');

class BroadcastMessageDef extends InstantMessageDef {

  static DEFINITION = {
    echoBack: new BooleanType(false)
  }

  get definition() {
    return {
      ...super.definition,
      ...BroadcastMessageDef.DEFINITION
    }
  }

  get typeName() {
    return InstantMessageEnumDef.TEXT_BROADCAST;
  }

}

module.exports = BroadcastMessageDef;
```
Both of the examples above extend the `InstantMessageDef` class, and implement the `typeName` property, which returns their specific type, from the enumeration of types.  Since these defintions involve inheritance, we need to register them (base must be registered first), in order for the system to know which concrete message definition is used to validate which message type.  It's convenient to do this all in one place:

```
const InstantMessageDef = require('./InstantMessageDef');
const TextMessageDef = require('./TextMessageDef');
const BroadcastMessageDef = require('./BroadcastMessageDef');
const { DefinitionRegistry } = require('ensuredata');

class ValidatorRegistration {

  static DEFINITIONS = [
    InstantMessageDef,
    TextMessageDef,
    BroadcastMessageDef,
  ]

  static register() {
    console.log('Validators registered');
    ValidatorRegistration.DEFINITIONS.forEach(definition => DefinitionRegistry.register(definition));
  }

}

module.exports = ValidatorRegistration;

...

# Before starting the server, probably in the main module...
ValidatorRegistration.register();
```

Now onto the message processor itself:


```
const {
  EnumeratedMessageProcessor,
} = require("layer8");
const SessionService = require('../services/SessionService');
const InstantMessageDef = require('../api/InstantMessageDef');
const InstantMessageEnumDef = require('../api/InstantMessageEnumDef');

class IMMessageProcessor extends EnumeratedMessageProcessor {

  constructor() {
    super('/ticker', InstantMessageDef, 'accountId', true);
  }

  static onTextMessage(session, socket, data) {
    console.log(`Client ${session.user.email} received a text message:\n${body.text}`)
  }

  static onTextBroadcast(session, socket, data) {
    console.log(`Client ${session.user.email} sent a broadcast message:\n${body.text}`)
    this.broadcast(body);
  }

  async onConnect(session, socket) {
  }

  async onDisconnect(session, socket) {
  }

  async authenticate(token) {
    // Will return null if the token is not authenticated
    return SessionService.getByToken(token)
  }

  get messageHandlerMapping() {
    return IMMessageProcessor.MESSAGE_HANDLER_MAPPING;
  }
}

IMMessageProcessor.MESSAGE_HANDLER_MAPPING = Object.fromEntries([
  [InstantMessageEnumDef.TEXT_MESSAGE, IMMessageProcessor.onTextMessage],
  [InstantMessageEnumDef.TEXT_BROADCAST, IMMessageProcessor.onTextBroadcast],
]);

module.exports = IMMessageProcessor;
```

In the example above, we provide the data definition class as `InstantMessageDef`, which is the super class for processing messages of this type.  The appropriate subclass will be chosen at runtime when the message arrives, based on the embedded message type.

You will notice the property `messageHandlerMapping` which returns `IMMessageProcessor.MESSAGE_HANDLER_MAPPING`.  This property returns a mapping between any given message type, and corresponding handler.

Handlers can be synchronous or asynchronous.  The `EnumeratedMessageProcessor` will always attempt to wait on an asynchronous handler.

```
static async onTextMessage(session, socket, data) {
}
```

## Authentication
Authentication is handled using the `async authenticate(token)` method.  The client would provide an authentication token in the endpoint as a query argument.  Specifically `?auth_token={authentication token}`.  The `authenticate` method will then receive this token and authentication must be implemented by the developer.  A `null` return value indicates failed authentication and the connection will be closed by the server.

## Protocol extensions
At present, Layer8 only ships with `PerMessageDeflateExtension` which is used to support the `per_message_deflate` extension, enabling frame compression.  Additional extensions can be authored by the developer by subclassing the `ProtocolExtension` class.
