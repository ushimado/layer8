const {
  Controller,
  Endpoint,
  ResponseObject,
} = require('layer8');
const fs = require('fs');
const path = require('path');
const body = require('koa-body');
const SignupEntityDef = require('../api/SignupEntityDef');
const UserService = require('../services/UserService');
const assert = require('assert');

class SignupController extends Controller {

  constructor() {
    super(
      SignupEntityDef,
      '/signup',
      [
        new Endpoint('/', Endpoint.INDEX),
        new Endpoint('/', Endpoint.POST).middlewares([body()]),
      ]
    );
  }

  async index(session) {
    return new ResponseObject(
      fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'signup.html'))
    )
  }

  async post(session, urlParams, queryArgs, items) {
    assert(items.length === 1);
    item = items[0];

    await UserService.addUser(
      item.firstName,
      item.lastName,
      item.email,
      item.password,
    )

    return new ResponseObject(
      fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'thank_you.html'))
    )
  }

}

module.exports = SignupController;
