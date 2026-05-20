'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { User } = require('../../../src/domain/user/User');
const { Username } = require('../../../src/domain/user/Username');
const { PasswordHash } = require('../../../src/domain/user/PasswordHash');
const { ValidationError } = require('../../../src/domain/errors/DomainError');

const validHash = '$2a$10$abcdefghijklmnopqrstuv';

test('User валідує власні поля', () => {
  assert.throws(
    () =>
      new User({
        id: 0,
        username: new Username('alice'),
        passwordHash: new PasswordHash(validHash),
      }),
    ValidationError
  );
  assert.throws(
    () =>
      new User({
        id: 1,
        username: 'plain-string',
        passwordHash: new PasswordHash(validHash),
      }),
    ValidationError
  );
  assert.throws(
    () =>
      new User({
        id: 1,
        username: new Username('alice'),
        passwordHash: 'plain-hash',
      }),
    ValidationError
  );
});

test('User: changePassword приймає лише PasswordHash', () => {
  const user = new User({
    id: 1,
    username: new Username('alice'),
    passwordHash: new PasswordHash(validHash),
  });
  assert.throws(() => user.changePassword('plain'), ValidationError);
  const newHash = new PasswordHash('$2a$10$NEWNEWNEWNEWNEWNEWNEWN');
  user.changePassword(newHash);
  assert.equal(user.passwordHash.value, newHash.value);
});

test('User рівність — за ID', () => {
  const a = new User({
    id: 5,
    username: new Username('alice'),
    passwordHash: new PasswordHash(validHash),
  });
  const b = new User({
    id: 5,
    username: new Username('bob42'),
    passwordHash: new PasswordHash(validHash),
  });
  const c = new User({
    id: 6,
    username: new Username('alice'),
    passwordHash: new PasswordHash(validHash),
  });
  assert.ok(a.equals(b));
  assert.ok(!a.equals(c));
});
