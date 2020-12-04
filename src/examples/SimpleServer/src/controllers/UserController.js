const {
  Controller,
  Endpoint,
 } = require('layer8');
const UserService = require('../services/UserService');
const AutheticatedController = require('./AuthenticatedController');

class UserController extends AutheticatedController {

  constructor() {
    super(
      null,
      '/api/user',
      [
        new Endpoint('/', Endpoint.INDEX),
      ],
    );
  }

  async index(session, urlParams, queryArgs) {
    const userId = session.user.id;
    const user = UserService.getUserById(userId);

    return user;
  }

}

module.exports = UserController;
