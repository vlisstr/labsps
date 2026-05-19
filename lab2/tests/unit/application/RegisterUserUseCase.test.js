'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  RegisterUserUseCase,
} = require('../../../src/application/use_cases/RegisterUserUseCase');
const { UserFactory } = require('../../../src/domain/user/UserFactory');
const { ConflictError } = require('../../../src/domain/errors/DomainError');
const {
  FakePasswordHasher,
  FakeUserRepository,
} = require('../../_helpers/fakes');

function setup() {
  const users = new FakeUserRepository();
  const hasher = new FakePasswordHasher();
  const userFactory = new UserFactory({ users, hasher });
  const useCase = new RegisterUserUseCase({ users, userFactory });
  return { users, useCase };
}

test('RegisterUser зберігає створеного користувача', async () => {
  const { users, useCase } = setup();
  const view = await useCase.execute({ username: 'alice', password: 'secret123' });
  assert.deepEqual(view, { id: 1, username: 'alice' });
  const stored = await users.findById(1);
  assert.ok(stored);
  assert.equal(stored.username.value, 'alice');
});

test('RegisterUser кидає Conflict на дубль', async () => {
  const { useCase } = setup();
  await useCase.execute({ username: 'alice', password: 'secret123' });
  await assert.rejects(
    () => useCase.execute({ username: 'alice', password: 'other-pass' }),
    ConflictError
  );
});

test('RegisterUser не повертає passwordHash наружу', async () => {
  const { useCase } = setup();
  const view = await useCase.execute({ username: 'alice', password: 'secret123' });
  assert.equal(view.passwordHash, undefined);
  assert.equal(view.password, undefined);
});
