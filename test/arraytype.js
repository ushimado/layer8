const ArrayType = require('../src/types/ArrayType');
const IntType = require('../src/types/IntType');
const ValidationError = require('../src/errors/ValidationError');
const AbstractDataDefinition = require('../src/AbstractDataDefinition');
const assert = require('assert');

class CoordDef extends AbstractDataDefinition {

  static DEFINITION = {
    x: new IntType(),
    y: new IntType(),
  }

  get definition() {
    return CoordDef.DEFINITION;
  }
}

describe("Test ArrayType", () => {

  it('Must not fail during construction with all limits set, or with values in tolerance', () => {
    const intType = new ArrayType().minLength(3).maxLength(7).ofType(new CoordDef()).noDuplicates();
    intType.test([
      {x: 1, y: 2},
      {x: 2, y: 4},
      {x: 8, y: 12},
    ]);
    intType.test([
      {x: 1, y: 2},
      {x: 2, y: 4},
      {x: 8, y: 12},
      {x: 1, y: 2},
      {x: 2, y: 4},
      {x: 8, y: 12},
    ]);
    intType.test([
      {x: 1, y: 2},
      {x: 2, y: 4},
      {x: 8, y: 12},
      {x: 1, y: 2},
      {x: 2, y: 4},
      {x: 8, y: 12},
      {x: 8, y: 12},
    ]);
  });

  it('Must fail if below lower limit', () => {
    try {
      new ArrayType().minLength(3).test([1, 2]);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if above upper limit', () => {
    try {
      new ArrayType().maxLength(3).test([1, 2, 3, 4]);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if not an Array type (1)', () => {
    try {
      new ArrayType().test({});
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if not an Array type (2)', () => {
    try {
      new ArrayType().test("[1, 2, 3]");
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must return the same value as the input', () => {
    const testArray = [1, 2, 3];
    const result = new ArrayType().test(testArray);
    assert(result.length === testArray.length);
    for (let i = 0; i < testArray.length; i++) {
      assert(testArray[i] === result[i]);
    }
  });

  it('Must fail when no value and default not specified', () => {
    try {
      new ArrayType().test(undefined);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must return default when no value received', () => {
    assert(new ArrayType([1, 2, 3]).test(undefined).length === 3);
  });

  it('Must fail if element is not of type', () => {
    try {
      new ArrayType().ofType(new CoordDef()).test([1, 2, 3])
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must not fail if element is of type', () => {
    new ArrayType().ofType(new CoordDef()).test([
      {x: 1, y: 2},
      {x: 2, y: 3},
    ]);
  });

  it('From string method must work properly', () => {
    const type = new ArrayType();
    const x = type.test(type.fromString('["a","b","c"]'));
    assert(x.length === 3);
    assert(x[0] === 'a');
    assert(x[1] === 'b');
    assert(x[2] === 'c');
  });

  it('Must fail if duplicate elements are present', () => {
    try {
      new ArrayType().noDuplicates().test([1, 2, 2, 3]);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });
});
