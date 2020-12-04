const IntType = require('../src/types/IntType');
const ValidationError = require('../src/errors/ValidationError');
const assert = require('assert');

describe("Test IntType", () => {

  it('Must not fail during construction with all limits set, or with values in tolerance', () => {
    const intType = new IntType().from(-5).to(7);
    intType.test(-5);
    intType.test(-4);
    intType.test(2);
    intType.test(7);
  });

  it('Must fail if below lower limit', () => {
    try {
      new IntType().from(-5).test(-6);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if above upper limit', () => {
    try {
      new IntType().to(-5).test(-4);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if a float type', () => {
    try {
      new IntType().test(0.5);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if a string type', () => {
    try {
      new IntType().test("5");
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if an object type', () => {
    try {
      new IntType().test({});
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if an array type', () => {
    try {
      new IntType().test([]);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must return the same value as the input', () => {
    assert(new IntType().test(1) === 1);
  });

  it('Must fail when no value and default not specified', () => {
    try {
      new IntType().test(undefined);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must return default when no value received', () => {
    assert(new IntType(2).test(undefined) === 2);
  });

  it('From string method must work properly', () => {
    const type = new IntType();
    const x = type.test(type.fromString('123'));
    assert(x === 123);
  });
});
