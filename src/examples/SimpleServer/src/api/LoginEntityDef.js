const {
  AbstractDataDefinition,
  EmailType,
  StringType,
} = require('layer8');


class LoginEntityDef extends AbstractDataDefinition {

  static DEFINITION = {
    email: new EmailType().trim(),
    password: new StringType().maxLength(200),
  }

  get definition() {
    return SignupEntityDef.DEFINITION;
  }

}

module.exports = LoginEntityDef;
