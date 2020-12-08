const Controller = require('../src/Controller');
const Endpoint = require('../src/Endpoint');
const { AssertionError } = require('assert')
const {
  AbstractDataDefinition,
  IntType,
  StringType,
  ValidationError,
} = require('ensuredata');
const assert = require('assert');

class TestEntityDef extends AbstractDataDefinition {

  static DEFINITION = {
    id: new IntType().from(1).onlyAfterCreate(),
    name: new StringType(),
  }

  get definition() {
    return TestEntityDef.DEFINITION;
  }

}

const indexEndpoint = new Endpoint('/', Endpoint.INDEX);
const postEndpoint = new Endpoint('/', Endpoint.POST);

class TestController extends Controller {
  constructor() {
    super(
      TestEntityDef,
      '/',
      [
        indexEndpoint,
        postEndpoint,
      ]
    )
  }

  async index(session, queryArgs, urlParams) {

  }

  async post(session, queryArgs, urlParams, items) {
    return items;
  }
}

describe("Test controller", () => {

  it('Should fail if attempting to expose the same method twice', () => {
    try {
      new Controller(
        null,
        '/',
        [
          new Endpoint('/', Endpoint.GET),
          new Endpoint('/:id', Endpoint.GET),
        ]
      );
      throw Error('Method should have failed with AssertionError')
    } catch(e) {
      if (!(e instanceof AssertionError)) {
        throw e;
      }
    }
  });

  it('Should not fail if receiving unique endpoint methods', () => {
    new Controller(
      null,
      '/',
      [
        new Endpoint('/', Endpoint.GET),
        new Endpoint('/:id', Endpoint.POST),
        new Endpoint('/:id', Endpoint.PUT),
      ]
    );
  });

  it('Must fail if data is not present', () => {
    const ctx = {
      state: {
      },
      method: 'POST',
      request: {
        query: {
        }
      }
    }

    const testController = new TestController();
    try {
      testController.prepareArguments(ctx, postEndpoint);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }

      throw e;
    }

    throw new Error("prepareArguments didn't catch the bad data");
  });

  it('Single element must be wrapped in array', async () => {
    const ctx = {
      state: {
      },
      method: 'POST',
      request: {
        query: {
        },
        body: {
          id: null,
          name: 'hello there'
        }
      }
    }
    const testController = new TestController();
    const args = testController.prepareArguments(ctx, postEndpoint);
    const result = await testController.invokeHandler(postEndpoint, args);
    assert(Array.isArray(result));
    assert(result.length === 1);
    const item = result[0];
    assert(item.name === 'hello there');
    assert(item.id === undefined);
  });
});
