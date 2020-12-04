const AbstractDataDefinition = require('../src/AbstractDataDefinition');
const StringType = require('../src/types/StringType');
const IntType = require('../src/types/IntType');
const ArrayType = require('../src/types/ArrayType');
const EnumType = require('../src/types/EnumType');

class PetEnumDef extends EnumType {
  static COLLECTION = [
    'dog',
    'cat',
    'bird',
  ];

  get collection() {
    return PetEnumDef.COLLECTION;
  }
}

class PetDef extends AbstractDataDefinition {
  static DEFINITION = {
    id: new IntType().from(1).onlyAfterCreate(),
    name: new StringType().maxLength(25),
    type: new PetEnumDef(),
  }

  get definition() {
    return PetDef.DEFINITION;
  }
}

class PersonDef extends AbstractDataDefinition {
  static DEFINITION = {
    id: new IntType().from(1).onlyAfterCreate(),
    firstName: new StringType().maxLength(25),
    lastName: new StringType().maxLength(25),
    pet: new PetDef().nullable(),
  }

  get definition() {
    return PersonDef.DEFINITION;
  }
}

class GroupDef extends AbstractDataDefinition {
  static DEFINITION = {
    id: new IntType().from(1).onlyAfterCreate(),
    name: new StringType('unnamed').maxLength(25),
    members: new ArrayType().maxLength(5).ofType(new PersonDef())
  }

  get definition() {
    return GroupDef.DEFINITION;
  }
}

describe("Test validation of user defined data", () => {

  it('Nested objects must validate properly', () => {
    const x = 8321384;
    const bytes = [
      (x & (0xFF << 16)) >> 16,
      (x & (0xFF << 8)) >> 8,
      (x & (0xFF << 0)) >> 0,
    ]

    const buffer = new Buffer.alloc(3);
    BitUtils.hton(buffer, 0, 3, x);

    for (let i = 0; i < bytes; i++) {
      assert(bytes[i] === buffer[0]);
    }
  });

});
