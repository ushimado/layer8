const StringAccessor = require("./StringAccessor");
const assert = require('assert');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves a password with definable complexity.
 *
 * @class PasswordAccessor
 * @extends {StringAccessor}
 */
class PasswordAccessor extends StringAccessor {

  /**
   * Specifies requirements for password contents.
   *
   * @param {string} type - What type of characters the string must contain (See
   *  PasswordAccessor.VALUES for enumeration of valid types).
   * @param {number} number - Number of characters which must be present (of said type)
   * @returns
   * @memberof PasswordAccessor
   */
  mustContain(type, number) {
    assert(PasswordAccessor.VALUES.has(type));

    if (this.contains === undefined) {
      this.contains = [];
    }

    this.contains.push([type, number]);

    return this;
  }

  validate(body) {
    const rawValue = super.validate(body);
    const counts = {...PasswordAccessor._TYPE_COUNTS};

    if (this.contains !== undefined) {
      const char_to_type = PasswordAccessor._CHAR_TO_TYPE;
      [...rawValue].forEach(char => {
        if (char in char_to_type) {
          const type = char_to_type[char];
          counts[type] ++;
        }
      });

      this.contains.forEach(requirement => {
        const [type, number] = requirement;

        if (counts[type] < number) {
          throw new ValidationError(
            this.keyName,
            `The value${this.keyPositionStr()}requires at least ${number} ${type}`,
          )
        }
      })
    }

    return rawValue;
  }
}

PasswordAccessor.NUMBERS = 'numbers';
PasswordAccessor.CAPITAL_LETTERS = 'capital letters'
PasswordAccessor.LOWERCASE_LETTERS = 'lowercase letters'
PasswordAccessor.SPECIAL_CHARACTERS = 'special characters'

PasswordAccessor.VALUES = new Set([
  PasswordAccessor.NUMBERS,
  PasswordAccessor.CAPITAL_LETTERS,
  PasswordAccessor.LOWERCASE_LETTERS,
  PasswordAccessor.SPECIAL_CHARACTERS,
]);

PasswordAccessor._CHAR_TO_TYPE = {};

PasswordAccessor._STRING_NUMBERS = '1234567890';
PasswordAccessor._STRING_CAPITALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
PasswordAccessor._STRING_LOWERCASE = PasswordAccessor._STRING_CAPITALS.toLowerCase();
PasswordAccessor._STRING_SPECIAL_CHARACTERS = '!@#$%^&*()[]:;,.';

PasswordAccessor._SET_NUMBERS = new Set();
[...PasswordAccessor._STRING_NUMBERS].forEach(char => {
  PasswordAccessor._SET_NUMBERS.add(char);
  PasswordAccessor._CHAR_TO_TYPE[char] = PasswordAccessor.NUMBERS;
});

PasswordAccessor._SET_CAPITALS = new Set();
[...PasswordAccessor._STRING_CAPITALS].forEach(char => {
  PasswordAccessor._SET_CAPITALS.add(char);
  PasswordAccessor._CHAR_TO_TYPE[char] = PasswordAccessor.CAPITAL_LETTERS;
});

PasswordAccessor._SET_LOWERCASE = new Set();
[...PasswordAccessor._STRING_LOWERCASE].forEach(char => {
  PasswordAccessor._SET_LOWERCASE.add(char);
  PasswordAccessor._CHAR_TO_TYPE[char] = PasswordAccessor.LOWERCASE_LETTERS;
});

PasswordAccessor._SET_SPECIAL_CHARACTERS = new Set();
[...PasswordAccessor._STRING_SPECIAL_CHARACTERS].forEach(char => {
  PasswordAccessor._SET_SPECIAL_CHARACTERS.add(char)
  PasswordAccessor._CHAR_TO_TYPE[char] = PasswordAccessor.SPECIAL_CHARACTERS;
});

PasswordAccessor._TYPE_MAPPING = {};
PasswordAccessor._TYPE_MAPPING[PasswordAccessor.NUMBERS] = PasswordAccessor._SET_NUMBERS;
PasswordAccessor._TYPE_MAPPING[PasswordAccessor.CAPITAL_LETTERS] = PasswordAccessor._SET_CAPITALS;
PasswordAccessor._TYPE_MAPPING[PasswordAccessor.LOWERCASE_LETTERS] = PasswordAccessor._SET_LOWERCASE;
PasswordAccessor._TYPE_MAPPING[PasswordAccessor.SPECIAL_CHARACTERS] = PasswordAccessor._SET_SPECIAL_CHARACTERS;

PasswordAccessor._TYPE_COUNTS = {};
PasswordAccessor._TYPE_COUNTS[PasswordAccessor.NUMBERS] = 0;
PasswordAccessor._TYPE_COUNTS[PasswordAccessor.CAPITAL_LETTERS] = 0;
PasswordAccessor._TYPE_COUNTS[PasswordAccessor.LOWERCASE_LETTERS] = 0;
PasswordAccessor._TYPE_COUNTS[PasswordAccessor.SPECIAL_CHARACTERS] = 0;

module.exports = PasswordAccessor;
