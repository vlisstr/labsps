'use strict';

class RegisterUserCommand {
  constructor({ username, password }) {
    this.username = username;
    this.password = password;
    Object.freeze(this);
  }
}

module.exports = { RegisterUserCommand };
