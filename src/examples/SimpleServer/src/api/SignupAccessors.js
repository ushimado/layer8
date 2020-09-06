const {
  StringAccessor,
  EmailAccessor,
  ValidationError,
} = require('layer8');

class SignupAccessors {};

SignupAccessors.FIRST_NAME = new StringAccessor('first_name').range(1, 50);
SignupAccessors.LAST_NAME = new StringAccessor('last_name').range(1, 50);
SignupAccessors.EMAIL = new EmailAccessor('email');
SignupAccessors.PASSWORD = new StringAccessor('password').range(8, 200);

class RepeatPasswordAccessor extends StringAccessor {

  constructor() {
    super('password_repeat');
    this.range(8, 200);
  }

  validate(body) {
    const passwordRepeat = super.validate(body);
    try {
      const password = SignupAccessors.PASSWORD.validate(body);

      // Only throw if there's already a valid password, otherwise just throw on the password
      // validator
      if (password !== passwordRepeat) {
        throw new ValidationError(this.keyName, 'Repeat password confirmation failed');
      }
    } catch(e) {
      return passwordRepeat;
    }

    return passwordRepeat;
  }

}

SignupAccessors.PASSWORD_REPEAT = new RepeatPasswordAccessor();

module.exports = SignupAccessors;
