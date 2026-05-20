'use strict';

const { Username } = require('../../../domain/user/Username');
const { AuthenticationError } = require('../../../domain/errors/DomainError');

class LoginUserCommandHandler {
  constructor({ users, hasher, tokens }) {
    this._users = users;
    this._hasher = hasher;
    this._tokens = tokens;
  }

  async handle(command) {
    let usernameVo;
    try {
      usernameVo = new Username(command.username);
    } catch (_err) {
      throw new AuthenticationError('invalid credentials', 'INVALID_CREDENTIALS');
    }

    const user = await this._users.findByUsername(usernameVo);
    if (!user) {
      throw new AuthenticationError('invalid credentials', 'INVALID_CREDENTIALS');
    }

    const ok = await this._hasher.verify(command.password ?? '', user.passwordHash.value);
    if (!ok) {
      throw new AuthenticationError('invalid credentials', 'INVALID_CREDENTIALS');
    }

    return this._tokens.issue({ sub: user.id, username: user.username.value });
  }
}

module.exports = { LoginUserCommandHandler };
