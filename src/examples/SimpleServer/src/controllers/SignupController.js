const {
  Controller,
  Endpoint,
  ResponseObject,
  Accessor,
} = require('layer8');
const fs = require('fs');
const path = require('path');
const body = require('koa-body');
const SignupAccessors = require('../api/SignupAccessors');
const UserService = require('../services/UserService');

class SignupController extends Controller {

  constructor() {
    super(
      '/signup',
      [
        new Endpoint('/', Endpoint.INDEX),
        new Endpoint('/', Endpoint.POST, [body()]),
      ]
    );
  }

  /**
   * Returns the signup page.
   */
  async validateIndex(ctx, session) {
    return [];
  }

  async executeIndex(session) {
    return new ResponseObject(
      fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'signup.html'))
    )
  }

  async validatePost(ctx, session) {
    return Accessor.validateAll(
      ctx.request.body,
      [
        SignupAccessors.FIRST_NAME,
        SignupAccessors.LAST_NAME,
        SignupAccessors.EMAIL,
        SignupAccessors.PASSWORD,
        SignupAccessors.PASSWORD_REPEAT,
      ]
    );
  }

  async executePost(session, firstName, lastName, email, password, passwordRepeat) {
    await UserService.addUser(
      firstName,
      lastName,
      email,
      password,
    )

    return new ResponseObject(
      fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'thank_you.html'))
    )
  }

}

module.exports = SignupController;
