const StringType = require('../types/StringType');
const ValidationError = require('../errors/ValidationError');

class EmailType extends StringType {

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

    if (!EmailType.RE_EMAIL_ADDRESS.test(rawValue)) {
      throw new ValidationError(
        null,
        'Must constitute a valid email address',
        value,
      );
    }

    return value;
  }

  get description() {
    const description = [
      super.description,
      'Must constitute a valid email address',
    ];
    return description.join('<br/>');
  }
}

// This regular expression was borrowed from:
// https://www.w3resource.com/javascript/form/email-validation.php
EmailType.RE_EMAIL_ADDRESS = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


module.exports = EmailType;
