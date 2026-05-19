'use strict';

const { ValidationError } = require('../errors/DomainError');

class Username {
  static MIN_LEN = 3;
  static MAX_LEN = 32;
  static PATTERN = /^[a-zA-Z0-9_.]+$/;

  constructor(value) {
    if (typeof value !== 'string') {
      throw new ValidationError('username must be a string', 'USERNAME_INVALID');
    }
    const v = value.trim();
    if (v.length < Username.MIN_LEN || v.length > Username.MAX_LEN) {
      throw new ValidationError(
        `username length must be ${Username.MIN_LEN}–${Username.MAX_LEN}`,
        'USERNAME_INVALID'
      );
    }
    if (!Username.PATTERN.test(v)) {
      throw new ValidationError(
        'username may contain only letters, digits, "_" and "."',
        'USERNAME_INVALID'
      );
    }
    this._value = v.toLowerCase();
    Object.freeze(this);
  }

  get value() {
    return this._value;
  }

  equals(other) {
    return other instanceof Username && other._value === this._value;
  }

  toString() {
    return this._value;
  }
}

module.exports = { Username };
