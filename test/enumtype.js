const EnumType = require('../src/types/EnumType');
const ValidationError = require('../src/errors/ValidationError');
const assert = require('assert');

class JobsEnumDef extends EnumType {

  static COLLECTION = [
    'doctor',
    'lawyer',
    'mechanic',
    'farmer',
  ];

  get collection() {
    return JobsEnumDef.COLLECTION;
  }

}

class PositionsEnumDef extends EnumType {

  static COLLECTION = [
    1,
    2,
    3,
  ];

  get collection() {
    return PositionsEnumDef.COLLECTION;
  }

}


describe("Test EnumType", () => {

  it('Must fail if value outside of enum (strange type)', () => {
    try {
      new JobsEnumDef().test({});
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if value outside of enum (strange type 2)', () => {
    try {
      new JobsEnumDef().test([]);
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must fail if value outside of enum', () => {
    try {
      new JobsEnumDef().test('slacker');
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
    }

    throw Error('Did not catch bad input');
  });

  it('Must not fail if within enum', () => {
    assert (new JobsEnumDef().test('farmer') === 'farmer');
  });

  it('From string method must work properly (1)', () => {
    const type = new JobsEnumDef();
    assert(type.test(type.fromString('lawyer')) === 'lawyer');
  });

});
