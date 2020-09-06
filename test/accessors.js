const ArrayAccessor = require('../src/accessors/ArrayAccessor');
const StringAccessor = require('../src/accessors/StringAccessor');
const ValidationError = require('../src/errors/ValidationError');
const EmailAccessor = require('../src/accessors/EmailAccessor');
const IntAccessor = require('../src/accessors/IntAccessor');
const NumericAccessor = require('../src/accessors/NumericAccessor');
const PathEntityIDAccessor = require('../src/accessors/PathEntityIDAccessor');
const assert = require('assert');

const mostlyStringArray = ['abc', 'def', 8, 'ghi'];
const allStringArray = ['abc', '123', 'def'];
const body = {
  mostlyStringArray,
  str: 'hello',
  allStringArray,
}

const validate = (accessor, body) => {
  try {
    accessor.validate(body);
    throw new Error("Accessor didn't throw when encountering bad data")
  } catch(e) {
    if (e instanceof ValidationError) {
      return;
    }
    throw e;
  }
}

describe("Test array accessor", () => {
  it('Should fail due to presence of int', () => {
    const arrayAccessor = new ArrayAccessor('mostlyStringArray', new StringAccessor(null), true);
    validate(arrayAccessor, body);
  })

  it('Should fail when the target is not an array', () => {
    const arrayAccessor = new ArrayAccessor('str', new StringAccessor(null), true);
    validate(arrayAccessor, body);
  })

  it('Should not fail when target is an array of strings', () => {
    const arrayAccessor = new ArrayAccessor('allStringArray', new StringAccessor(null), true);
    arrayAccessor.validate(body);
  })
})

describe("Test email accessor", () => {
  const emailAccessor = new EmailAccessor(null);
  it('Should fail with invalid emails', () => {
    validate(emailAccessor, 'test_email.com');
  })

  it('Should not fail with valid emails', () => {
    const email = 'good@email.com'
    const value = emailAccessor.validate(email);
    assert(value === email);
  })
})

describe("Test int accessor", () => {
  const intAccessor = new IntAccessor(null);
  it('Should fail with string data', () => {
    validate(intAccessor, 'abc');
  });

  it('Should fail with array data', () => {
    validate(intAccessor, [1]);
  });

  it('Should fail with object data', () => {
    validate(intAccessor, {'x': 1});
  });

  it('Should not fail with positive integer data', () => {
    intAccessor.validate(0);
  });

  it('Should not fail with negative integer data', () => {
    intAccessor.validate(-6);
  });

  it('Should fail when below specified range', () => {
    const rangeAccessor = new IntAccessor(null).range(33, 88);
    validate(rangeAccessor, 22);
  });

  it('Should fail when above specified range', () => {
    const rangeAccessor = new IntAccessor(null).range(33, 88);
    validate(rangeAccessor, 89);
  });

  it('Should not fail when within specified range', () => {
    const rangeAccessor = new IntAccessor(null).range(33, 88);
    rangeAccessor.validate(88);
  });
})

describe("Test numeric accessor", () => {
  numericAccessor = new NumericAccessor(null);
  it('Should fail with string data', () => {
    validate(numericAccessor, 'abc');
  });

  it('Should not fail with integer data', () => {
    numericAccessor.validate(-1);
  });

  it('Should not fail with float data', () => {
    numericAccessor.validate(-1.3);
  });
})
