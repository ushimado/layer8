const ArrayAccessor = require('../src/accessors/ArrayAccessor');
const StringAccessor = require('../src/accessors/StringAccessor');
const ValidationError = require('../src/errors/ValidationError');
const EmailAccessor = require('../src/accessors/EmailAccessor');
const IntAccessor = require('../src/accessors/IntAccessor');
const NumericAccessor = require('../src/accessors/NumericAccessor');
const PathEntityIDAccessor = require('../src/accessors/PathEntityIDAccessor');
const PositiveIntAccessor = require('../src/accessors/PositiveIntAccessor');
const PositiveNumericAccessor = require('../src/accessors/PositiveNumericAccessor');
const PasswordAccessor = require('../src/accessors/PasswordAccessor');
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

describe("Test string accessor", () => {
  it('Should fail when a minimum length constraint is present', () => {
    const stringAccessor = new StringAccessor(null).range(2);
    validate(stringAccessor, 'h');
  });

  it('Should fail when a minimum length constraint is present', () => {
    const stringAccessor = new StringAccessor(null).range(2);
    validate(stringAccessor, 'h');
  });

  it('Should fail when spaces are present if specified', () => {
    const stringAccessor = new StringAccessor(null).noSpaces();
    validate(stringAccessor, 'hello ');
  });

  it('Should not fail when spaces are present on edge if specified with trim', () => {
    const stringAccessor = new StringAccessor(null).noSpaces().trim();
    stringAccessor.validate(' hello ');
  });

  it('Should fail when spaces are present if specified in middle with trim', () => {
    const stringAccessor = new StringAccessor(null).noSpaces().trim();
    validate(stringAccessor, ' he llo ');
  });
})

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
  const numericAccessor = new NumericAccessor(null);
  it('Should fail with string data', () => {
    validate(numericAccessor, 'abc');
  });

  it('Should not fail with integer data', () => {
    numericAccessor.validate(-1);
  });

  it('Should not fail with float data', () => {
    numericAccessor.validate(-1.3);
  });

  it('Should not fail with parsed float data when string mode enabled', () => {
    const nA = new NumericAccessor(null).fromString();
    nA.validate('-1.2')
  })
})

describe("Test path entity id accessor", () => {
  const pathEntityIDAccessor = new PathEntityIDAccessor(null);
  it('Should fail with numbers below 1', () => {
    validate(pathEntityIDAccessor, 0);
  });

  it('Should fail with non-numeric strings', () => {
    validate(pathEntityIDAccessor, '1abc');
  });

  it('Should fail with out of range numeric strings', () => {
    validate(pathEntityIDAccessor, '-1');
  });

  it('Should fail with positive integers (since not string rep)', () => {
    validate(pathEntityIDAccessor, 3);
  });

  it('Should not fail with string representations of positive integers', () => {
    pathEntityIDAccessor.validate('3');
  });
})

describe("Test positive int accessor", () => {
  const positiveIntAccessor = new PositiveIntAccessor(null)
  it('Should fail with non integers', () => {
    validate(positiveIntAccessor, 2.2);
  });

  it('Should fail with negative integers', () => {
    validate(positiveIntAccessor, -5);
  });

  it('Should fail with string representations of integers', () => {
    validate(positiveIntAccessor, '5');
  });

  it('By default, zero should be ok', () => {
    positiveIntAccessor.validate(0);
  });

  it('It should fail on zero when zero is disallowed', () => {
    const pIntAccessor = new PositiveIntAccessor(null).allowZero(false)
    validate(pIntAccessor, 0);
  });

  it('It should not fail on a positive integer', () => {
    positiveIntAccessor.validate(5);
  });
})

describe("Test positive numeric accessor", () => {
  const positiveNumericAccessor = new PositiveNumericAccessor(null);

  it('Should not accept non-numeric data', () => {
    validate(positiveNumericAccessor, 'abc');
  });

  it('Should not accept negative numeric values', () => {
    validate(positiveNumericAccessor, -1.5);
  });

  it('Should not accept zero values when specified not to', () => {
    const pNumericAccessor = new PositiveIntAccessor(null).allowZero(false);
    validate(pNumericAccessor, 0);
  });

  it('Should accept positive numeric values', () => {
    positiveNumericAccessor.validate(1.4);
  });

  it('Should accept zero values by default', () => {
    positiveNumericAccessor.validate(1.4);
  });
})

describe("Test password accessor", () => {
  const passwordAccessor = (
    new PasswordAccessor(null)
    .mustContain(PasswordAccessor.CAPITAL_LETTERS, 3)
    .mustContain(PasswordAccessor.LOWERCASE_LETTERS, 3)
    .mustContain(PasswordAccessor.SPECIAL_CHARACTERS, 3)
    .mustContain(PasswordAccessor.NUMBERS, 3)
  );

  it("Should fail if any of the requirements aren't met", () => {
    validate(passwordAccessor, "simplepassword");
  });

  it("Should not fail if all of the requirements aren't met", () => {
    passwordAccessor.validate('123abcDEF.,#$');
  });

  it("Should fail if a single requirement isn't met", () => {
    validate(passwordAccessor, '123abcDEF.,');
  });
})
