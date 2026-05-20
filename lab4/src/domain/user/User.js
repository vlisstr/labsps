'use strict';

const { Username } = require('./Username');
const { PasswordHash } = require('./PasswordHash');
const { ValidationError } = require('../errors/DomainError');

class User {

  constructor({ id, username, passwordHash }) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('user id must be a positive integer', 'USER_ID_INVALID');
    }
    if (!(username instanceof Username)) {
      throw new ValidationError('username must be a Username VO', 'USERNAME_INVALID');
    }
    if (!(passwordHash instanceof PasswordHash)) {
      throw new ValidationError('passwordHash must be a PasswordHash VO', 'PASSWORD_HASH_INVALID');
    }
    this._id = id;
    this._username = username;
    this._passwordHash = passwordHash;
  }

  get id() {
    return this._id;
  }

  get username() {
    return this._username;
  }

  get passwordHash() {
    return this._passwordHash;
  }

  changePassword(newHash) {
    if (!(newHash instanceof PasswordHash)) {
      throw new ValidationError('new password must be a PasswordHash VO', 'PASSWORD_HASH_INVALID');
    }
    this._passwordHash = newHash;
  }

  equals(other) {
    return other instanceof User && other._id === this._id;
  }
}

module.exports = { User };
