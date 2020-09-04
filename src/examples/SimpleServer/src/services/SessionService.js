const { HashUtils } = require('layer8');
const UserService = require('./UserService');

class SessionService {

  static async create(userId) {
    let token;

    // This loop is purely precautionary.  The likelihood of an acutal collision is astronomically
    // low, but just to keep things sane, we take this precaution.
    while (1) {
      token = await HashUtils.generateSessionToken();
      if (!(token in SessionService.SESSION_BY_TOKEN)) {
        break;
      }
    }

    const user = UserService.getUserById(userId);

    const data = {
      expiresAt: new Date(
        new Date().getTime() + SessionService.ONE_HOUR
      ),
      token,
      user: user,
    }

    if (!(userId in SessionService.SESSIONS_BY_USER_ID)) {
      SessionService.SESSIONS_BY_USER_ID[userId] = [];
    }

    SessionService.SESSIONS_BY_USER_ID[userId].push(data);
    SessionService.SESSION_BY_TOKEN[token] = data;

    return data;
  }

  static getByToken(token) {
    if (!(token in SessionService.SESSION_BY_TOKEN)) {
      return null
    }

    const now = new Date();
    const session = SessionService.SESSION_BY_TOKEN[token];
    if (session.expiresAt < now) {
      const userId = session.user.id;

      // Remove the expired session
      SessionService.SESSIONS_BY_USER_ID[userId] = (
        SessionService.SESSIONS_BY_USER_ID[userId].filter(s => s.token !== token)
      );

      if (SessionService.SESSIONS_BY_USER_ID[userId].length === 0)
        delete SessionService.SESSIONS_BY_USER_ID[userId];

      delete SessionService.SESSION_BY_TOKEN[token];

      return null;
    }

    // Return a copy so that it can safely be augmented without disturbing the stored session
    return {
      ...session,
    }
  }

}

SessionService.SESSIONS_BY_USER_ID = [];
SessionService.SESSION_BY_TOKEN = {};
SessionService.ONE_HOUR = 1000 * 60 * 60;

module.exports = SessionService;
