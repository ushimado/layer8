const StringType = require('../types/StringType');
const ValidationError = require('../errors/ValidationError');

class PasswordType extends StringType {

  constructor(defaultVal=undefined) {
    super(defaultVal);

    this.__mustContain = [];
  }

  mustContain(type, number) {
    assert(PasswordAccessor.VALUES.has(type));
    this.__mustContain.push([type, number]);

    return this;
  }

  test(value, isCreate) {
    value = super.test(value, isCreate);

    if (this.__mustContain.length > 0) {
      const char_to_type = PasswordType._CHAR_TO_TYPE;
      [...value].forEach(char => {
        if (char in char_to_type) {
          const type = char_to_type[char];
          counts[type] ++;
        }
      });

      this.__mustContain.forEach(requirement => {
        const [type, number] = requirement;

        if (counts[type] < number) {
          throw new ValidationError(
            null,
            `must contain at least ${number} ${type}`,
            value,
          )
        }
      })
    }

    return value;
  }

  get description() {
    const description = [
      super.description
    ];

    if (this.__mustContain.length > 0) {
      const contain = ['Contain<br/>'];
      contain.push('<ul>');
      this.__mustContain.forEach(requirement => {
        const [type, number] = requirement;
        contain.push(`<li>${number} ${type}</li>`)
      })
      contain.push('</ul>');
      description.push(contain.join(''));
    }

    return description.join('<br/>');
  }
}

PasswordType.NUMBERS = 'numbers';
PasswordType.CAPITAL_LETTERS = 'capital letters'
PasswordType.LOWERCASE_LETTERS = 'lowercase letters'
PasswordType.SPECIAL_CHARACTERS = 'special characters'

PasswordType.VALUES = new Set([
  PasswordType.NUMBERS,
  PasswordType.CAPITAL_LETTERS,
  PasswordType.LOWERCASE_LETTERS,
  PasswordType.SPECIAL_CHARACTERS,
]);

PasswordType._CHAR_TO_TYPE = {};

PasswordType._STRING_NUMBERS = '1234567890';
PasswordType._STRING_CAPITALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
PasswordType._STRING_LOWERCASE = PasswordType._STRING_CAPITALS.toLowerCase();
PasswordType._STRING_SPECIAL_CHARACTERS = '!@#$%^&*()[]:;,.';

PasswordType._SET_NUMBERS = new Set();
[...PasswordType._STRING_NUMBERS].forEach(char => {
  PasswordType._SET_NUMBERS.add(char);
  PasswordType._CHAR_TO_TYPE[char] = PasswordType.NUMBERS;
});

PasswordType._SET_CAPITALS = new Set();
[...PasswordType._STRING_CAPITALS].forEach(char => {
  PasswordType._SET_CAPITALS.add(char);
  PasswordType._CHAR_TO_TYPE[char] = PasswordType.CAPITAL_LETTERS;
});

PasswordType._SET_LOWERCASE = new Set();
[...PasswordType._STRING_LOWERCASE].forEach(char => {
  PasswordType._SET_LOWERCASE.add(char);
  PasswordType._CHAR_TO_TYPE[char] = PasswordType.LOWERCASE_LETTERS;
});

PasswordType._SET_SPECIAL_CHARACTERS = new Set();
[...PasswordType._STRING_SPECIAL_CHARACTERS].forEach(char => {
  PasswordType._SET_SPECIAL_CHARACTERS.add(char)
  PasswordType._CHAR_TO_TYPE[char] = PasswordType.SPECIAL_CHARACTERS;
});

PasswordType._TYPE_MAPPING = {};
PasswordType._TYPE_MAPPING[PasswordType.NUMBERS] = PasswordType._SET_NUMBERS;
PasswordType._TYPE_MAPPING[PasswordType.CAPITAL_LETTERS] = PasswordType._SET_CAPITALS;
PasswordType._TYPE_MAPPING[PasswordType.LOWERCASE_LETTERS] = PasswordType._SET_LOWERCASE;
PasswordType._TYPE_MAPPING[PasswordType.SPECIAL_CHARACTERS] = PasswordType._SET_SPECIAL_CHARACTERS;

PasswordType._TYPE_COUNTS = {};
PasswordType._TYPE_COUNTS[PasswordType.NUMBERS] = 0;
PasswordType._TYPE_COUNTS[PasswordType.CAPITAL_LETTERS] = 0;
PasswordType._TYPE_COUNTS[PasswordType.LOWERCASE_LETTERS] = 0;
PasswordType._TYPE_COUNTS[PasswordType.SPECIAL_CHARACTERS] = 0;


module.exports = PasswordType;
