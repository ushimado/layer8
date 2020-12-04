const Controller = require('../src/Controller');
const Endpoint = require('../src/Endpoint');
const { AssertionError } = require('assert')

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
  })

});
