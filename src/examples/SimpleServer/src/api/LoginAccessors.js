const {
  StringAccessor,
  EmailAccessor,
} = require('layer8');

class LoginAccessors {};

LoginAccessors.EMAIL = new EmailAccessor('email');
LoginAccessors.PASSWORD = new StringAccessor('password');

module.exports = LoginAccessors;
