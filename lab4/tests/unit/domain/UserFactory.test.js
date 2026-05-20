'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { UserFactory } = require('../../../src/domain/user/UserFactory');
const {
  ConflictError,
  ValidationError,
} = require('../../../src/domain/errors/DomainError');
const {
  FakePasswordHasher,
  FakeUserRepository,
} = require('../../_helpers/fakes');

function setup() {
  const users = new FakeUserRepository();
  const hasher = new FakePasswordHasher();
  return { users, hasher, factory: new UserFactory({ users, hasher }) };
}

test('UserFactory створює користувача з хешованим паролем', async () => {
  const { factory } = setup();
  const user = await factory.create({ username: 'Alice', password: 'secret123' });
  assert.equal(user.username.value, 'alice');
  assert.ok(user.passwordHash.value.startsWith('hashed::secret123::'));
  assert.equal(typeof user.id, 'number');
});

test('UserFactory кидає ConflictError якщо username вже існує', async () => {
  const { factory, users } = setup();
  const first = await factory.create({ username: 'alice', password: 'secret123' });
  await users.save(first);

  await assert.rejects(
    () => factory.create({ username: 'ALICE', password: 'other-pass' }),
    ConflictError
  );
});

test('UserFactory кидає ValidationError на поганий username', async () => {
  const { factory } = setup();
  await assert.rejects(
    () => factory.create({ username: 'a', password: 'secret123' }),
    ValidationError
  );
});

test('UserFactory кидає ValidationError на короткий пароль', async () => {
  const { factory } = setup();
  await assert.rejects(
    () => factory.create({ username: 'alice', password: 'x' }),
    ValidationError
  );
});

test('UserFactory: послідовність ID', async () => {
  const { factory } = setup();
  const u1 = await factory.create({ username: 'alice', password: 'secret123' });
  const u2 = await factory.create({ username: 'bob42', password: 'secret123' });
  assert.equal(u1.id, 1);
  assert.equal(u2.id, 2);
});
