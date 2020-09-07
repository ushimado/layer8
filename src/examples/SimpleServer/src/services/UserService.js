const { HashUtils } = require('layer8');
const assert = require('assert');

class UserService {

  /**
   * Mock database service to add a new user.  In this case we're just adding it to a dictionary.
   *
   * @static
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} email
   * @param {string} password
   * @memberof UserService
   */
  static async addUser(firstName, lastName, email, password) {
    const salt = await HashUtils.generateSalt();
    const saltedHash = await HashUtils.generatePasswordHash(password, salt);

    const data = {
      id: UserService.SEQUENCE ++,
      firstName,
      lastName,
      email,
      saltedHash,
      salt,
    }

    if (email in UserService.USERS_BY_EMAIL) {
      throw new Error('Unique constraint violation');
    }

    UserService.USERS_BY_ID[data.id] = data;
    UserService.USERS_BY_EMAIL[email] = data;

    return data;
  }

  static getUserById(userId) {
    assert(userId in UserService.USERS_BY_ID);

    return {
      ...UserService.USERS_BY_ID[userId],
    };
  }

  static getUserByEmail(email) {
    if (!(email in UserService.USERS_BY_EMAIL)) {
      return null;
    }

    return {
      ...UserService.USERS_BY_EMAIL[email],
    }
  }

}

UserService.SEQUENCE = 1;
UserService.USERS_BY_ID = {};
UserService.USERS_BY_EMAIL = {};

module.exports = UserService;
