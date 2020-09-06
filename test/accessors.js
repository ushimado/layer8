const ArrayAccessor = require('../src/accessors/ArrayAccessor');
const StringAccessor = require('../src/accessors/StringAccessor');
const ValidationError = require('../src/errors/ValidationError');

const mostlyStringArray = ['abc', 'def', 8, 'ghi'];
const allStringArray = ['abc', '123', 'def'];
const body = {
  mostlyStringArray,
  str: 'hello',
  allStringArray,
}

describe("Test array accessor", () => {
  it('Should fail due to presence of int', () => {
    const arrayAccessor = new ArrayAccessor('mostlyStringArray', new StringAccessor(null), true);
    try {
      arrayAccessor.validate(body);
      throw new Error("ArrayAccessor didn't throw when encountering bad type")
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
      throw e;
    }
  })

  it('Should fail when the target is not an array', () => {
    const arrayAccessor = new ArrayAccessor('str', new StringAccessor(null), true);
    try {
      arrayAccessor.validate(body)
      throw new Error("ArrayAccessor didn't throw when encountering bad type")
    } catch(e) {
      if (e instanceof ValidationError) {
        return;
      }
      throw e;
    }
  })

  it('Should not fail when target is an array of strings', () => {
    const arrayAccessor = new ArrayAccessor('allStringArray', new StringAccessor(null), true);
    arrayAccessor.validate(body);
  })
})
