'use strict';

const { ValidationError } = require('../errors/DomainError');

class PasswordHash {

  constructor(hashed) {
    if (typeof hashed !== 'string' || hashed.length < 20) {
      throw new ValidationError('password hash looks invalid', 'PASSWORD_HASH_INVALID');
    }
    this._hash = hashed;
    Object.freeze(this);
  }

  get value() {
    return this._hash;
  }

  equals(other) {
    return other instanceof PasswordHash && other._hash === this._hash;
  }

  toString() {
    return '[PasswordHash]';
  }

  toJSON() {
    return '[PasswordHash]';
  }
}

class RawPassword {
  static MIN_LEN = 6;
  static MAX_LEN = 128;

  constructor(value) {
    if (typeof value !== 'string') {
      throw new ValidationError('password must be a string', 'PASSWORD_INVALID');
    }
    if (value.length < RawPassword.MIN_LEN || value.length > RawPassword.MAX_LEN) {
      throw new ValidationError(
        `password length must be ${RawPassword.MIN_LEN}–${RawPassword.MAX_LEN}`,
        'PASSWORD_INVALID'
      );
    }
    this._value = value;
    Object.freeze(this);
  }

  get value() {
    return this._value;
  }

  toString() {
    return '[RawPassword]';
  }

  toJSON() {
    return '[RawPassword]';
  }
}

module.exports = { PasswordHash, RawPassword };
