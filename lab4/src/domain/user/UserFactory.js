'use strict';

const { User } = require('./User');
const { Username } = require('./Username');
const { PasswordHash, RawPassword } = require('./PasswordHash');
const { ConflictError } = require('../errors/DomainError');

class UserFactory {

  constructor({ users, hasher }) {
    this._users = users;
    this._hasher = hasher;
  }

  async create({ username, password }) {

    const usernameVo = new Username(username);
    const rawPassword = new RawPassword(password);

    if (await this._users.existsByUsername(usernameVo)) {
      throw new ConflictError(
        `user with username "${usernameVo.value}" already exists`,
        'USER_ALREADY_EXISTS'
      );
    }

    const hashed = await this._hasher.hash(rawPassword.value);
    const passwordHash = new PasswordHash(hashed);

    const id = await this._users.nextId();

    return new User({ id, username: usernameVo, passwordHash });
  }
}

module.exports = { UserFactory };
