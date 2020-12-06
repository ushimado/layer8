const {
  AbstractDataDefinition,
  StringType,
  EmailType,
  PasswordType,
  ValidationError,
} = require('ensuredata');

class SignupEntityDef extends AbstractDataDefinition {

  static DEFINITION = {
    firstName: new StringType().trim().maxLength(50),
    lastName: new StringType().trim().maxLength(50),
    email: new EmailType().trim(),
    password: new PasswordType().minLength(8).maxLength(200),
    passwordRepeat: new PasswordType().minLength(8).maxLength(200),
  }

  test(value, isCreate) {
    // This is an example of how one would perform some cross-field validation, such as in this case,
    // ensuring that the two password fields match.

    value = super.test(value, isCreate);

    if (value.password !== value.passwordRepeat) {
      throw new ValidationError('password', 'passwords must match', value.password1);
    }

    return value;
  }

  get definition() {
    return SignupEntityDef.DEFINITION;
  }

}

module.exports = SignupEntityDef;
