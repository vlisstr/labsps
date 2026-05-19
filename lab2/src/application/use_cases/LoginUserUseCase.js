'use strict';

const { Username } = require('../../domain/user/Username');
const { AuthenticationError } = require('../../domain/errors/DomainError');

class LoginUserUseCase {

  constructor({ users, hasher, tokens }) {
    this._users = users;
    this._hasher = hasher;
    this._tokens = tokens;
  }

  async execute({ username, password }) {
    let usernameVo;
    try {
      usernameVo = new Username(username);
    } catch (_err) {

      throw new AuthenticationError('invalid credentials', 'INVALID_CREDENTIALS');
    }

    const user = await this._users.findByUsername(usernameVo);
    if (!user) {
      throw new AuthenticationError('invalid credentials', 'INVALID_CREDENTIALS');
    }

    const ok = await this._hasher.verify(password ?? '', user.passwordHash.value);
    if (!ok) {
      throw new AuthenticationError('invalid credentials', 'INVALID_CREDENTIALS');
    }

    const token = this._tokens.issue({ sub: user.id, username: user.username.value });
    return { token };
  }
}

module.exports = { LoginUserUseCase };
