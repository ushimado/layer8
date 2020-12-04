const FloatType = require('../src/types/FloatType');
const ValidationError = require('../src/errors/ValidationError');
const assert = require('assert');

describe("Test FloatType", () => {

  it('Must not fail during construction with all limits set, or with values in tolerance', () => {
    const floatType = new FloatType().from(-5.3).to(7.5);
    floatType.test(-5.3);
    floatType.test(-4);
    floatType.test(2.3);
    floatType.test(7.5);
  });

  it('Must fail if below lower limit', () => {
    try {
      new FloatType().from(-5).test(-6);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if above upper limit', () => {
    try {
      new FloatType().to(5.6).test(5.7);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if a string type', () => {
    try {
      new FloatType().test("5.2");
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if an object type', () => {
    try {
      new FloatType().test({});
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if an array type', () => {
    try {
      new FloatType().test([]);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must return the same value as the input', () => {
    assert(new FloatType().test(1.2) === 1.2);
  });

  it('Must fail when no value and default not specified', () => {
    try {
      new FloatType().test(undefined);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must return default when no value received', () => {
    assert(new FloatType(2.24).test(undefined) === 2.24);
  });

  it('From string method must work properly', () => {
    const type = new FloatType();
    const x = type.test(type.fromString('123.2'));
    assert(x === 123.2);
  });
});
