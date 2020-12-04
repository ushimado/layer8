const StringType = require('../src/types/StringType');
const ValidationError = require('../src/errors/ValidationError');
const assert = require('assert');

describe("Test StringType", () => {

  it('Must not fail during construction with all limits set, or with values in tolerance', () => {
    const stringType = new StringType().minLength(3).maxLength(7).trim();
    stringType.test('hel');
    stringType.test('hello');
    stringType.test('hello w');
    stringType.test('     hello      ');    // Trim comes before length evaluation
  });

  it('Must fail if below lower limit', () => {
    try {
      new StringType().minLength(3).test('df');
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if above upper limit', () => {
    try {
      new StringType().maxLength(3).test('sdfdsf');
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if not a string type', () => {
    try {
      new StringType().test(32);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if not a string type (2)', () => {
    try {
      new StringType().test([2, 2]);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must return the same value as the input', () => {
    assert(new StringType().test('hello') === 'hello');
  });

  it('Must fail when no value and default not specified', () => {
    try {
      new StringType().test(undefined);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must return default when no value received', () => {
    assert(new StringType('hello').test(undefined) === 'hello');
  });

  it('From string method must work properly', () => {
    const type = new StringType();
    assert(type.test(type.fromString('hello')) === 'hello');
  });
});
