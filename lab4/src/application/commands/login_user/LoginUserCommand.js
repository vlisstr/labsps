'use strict';

class LoginUserCommand {
  constructor({ username, password }) {
    this.username = username;
    this.password = password;
    Object.freeze(this);
  }
}

module.exports = { LoginUserCommand };
