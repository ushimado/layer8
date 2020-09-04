class Cookie {

  constructor(
    key,
    value,
    expires,
    domain,
    path='/',
    secure=false,
    overwrite=true,
    httpOnly=true,
  ) {
    this.key = key;
    this.value = value;
    this.expires = expires;
    this.domain = domain;
    this.path = path;
    this.secure = secure;
    this.overwrite = overwrite;
    this.httpOnly = httpOnly;
  }

}

module.exports = Cookie;
