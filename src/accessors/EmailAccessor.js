const StringAccessor = require('./StringAccessor');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates / retrieves an email address
 *
 * @class EmailAccessor
 * @extends {StringAccessor}
 */
class EmailAccessor extends StringAccessor {

  constructor(key, isRequired=true, defaultValue=undefined) {
    super(key, isRequired, defaultValue);
  }

  validate(body) {
    const rawValue = super.validate(body);

    if (!EmailAccessor.RE_EMAIL_ADDRESS.test(rawValue)) {
      throw new ValidationError(
        this.keyName,
        `The value at "${this.keyName}" is not a valid email address`,
      );
    }

    return rawValue;
  }

}

// This regular expression was borrowed from:
// https://www.w3resource.com/javascript/form/email-validation.php
EmailAccessor.RE_EMAIL_ADDRESS = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

module.exports = EmailAccessor;
