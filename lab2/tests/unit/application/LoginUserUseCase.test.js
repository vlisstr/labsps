'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  RegisterUserUseCase,
} = require('../../../src/application/use_cases/RegisterUserUseCase');
const {
  LoginUserUseCase,
} = require('../../../src/application/use_cases/LoginUserUseCase');
const { UserFactory } = require('../../../src/domain/user/UserFactory');
const { AuthenticationError } = require('../../../src/domain/errors/DomainError');
const {
  FakePasswordHasher,
  FakeTokenService,
  FakeUserRepository,
} = require('../../_helpers/fakes');

async function setupWithUser() {
  const users = new FakeUserRepository();
  const hasher = new FakePasswordHasher();
  const tokens = new FakeTokenService();
  const userFactory = new UserFactory({ users, hasher });
  await new RegisterUserUseCase({ users, userFactory }).execute({
    username: 'alice',
    password: 'secret123',
  });
  const login = new LoginUserUseCase({ users, hasher, tokens });
  return { users, login };
}

test('LoginUser видає токен при правильних даних', async () => {
  const { login } = await setupWithUser();
  const out = await login.execute({ username: 'alice', password: 'secret123' });
  assert.ok(typeof out.token === 'string');
  assert.ok(out.token.startsWith('tok::1::alice'));
});

test('LoginUser кидає AuthenticationError при невірному паролі', async () => {
  const { login } = await setupWithUser();
  await assert.rejects(
    () => login.execute({ username: 'alice', password: 'wrong-password' }),
    AuthenticationError
  );
});

test('LoginUser кидає AuthenticationError при невідомому username', async () => {
  const { login } = await setupWithUser();
  await assert.rejects(
    () => login.execute({ username: 'bob', password: 'whatever123' }),
    AuthenticationError
  );
});

test('LoginUser ховає валідаційну помилку username за AuthenticationError', async () => {
  const { login } = await setupWithUser();

  await assert.rejects(
    () => login.execute({ username: '!!!', password: 'secret123' }),
    AuthenticationError
  );
});
