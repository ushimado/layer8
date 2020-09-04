const {
  Controller,
  Endpoint,
 } = require('layer8');
const fs = require('fs');
const path = require('path');
const AuthenticationService = require('../services/AuthenticationService');
const UserService = require('../services/UserService');

class UserController extends Controller {

  constructor() {
    super(
      '/api/user',
      [
        new Endpoint('/', Endpoint.INDEX),
      ],
      [
        AuthenticationService.use,
      ]
    );
  }

  /**
   * Returns user information for the currently authenticated user.
   */
  async validateIndex(ctx, session) {
    return [];
  }

  async executeIndex(session) {
    const userId = session.user.id;
    const user = UserService.getUserById(userId)

    return user;
  }

}

module.exports = UserController;
