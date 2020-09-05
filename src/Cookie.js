class Cookie {

  /**
   * Creates an instance of Cookie.
   *
   * @param {string} key - Cookie key
   * @param {string} value - Cookie value
   * @param {Date} expires - Expiration date/time
   * @param {string} domain - Cookie domain
   * @param {string} [path='/'] - Cookie path
   * @param {boolean} [secure=false] - Use secure cookies
   * @param {boolean} [overwrite=true] - Overwrite existing cookie
   * @param {boolean} [serverOnly=true] - Cookie is available serverside only
   * @memberof Cookie
   */
  constructor(
    key,
    value,
    expires,
    domain,
    path='/',
    secure=false,
    overwrite=true,
    serverOnly=true,
  ) {
    this.key = key;
    this.value = value;
    this.expires = expires;
    this.domain = domain;
    this.path = path;
    this.secure = secure;
    this.overwrite = overwrite;
    this.httpOnly = serverOnly;
  }

}

module.exports = Cookie;
