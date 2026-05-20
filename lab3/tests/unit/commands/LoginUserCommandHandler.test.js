'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  RegisterUserCommandHandler,
} = require('../../../src/application/commands/register_user/RegisterUserCommandHandler');
const {
  RegisterUserCommand,
} = require('../../../src/application/commands/register_user/RegisterUserCommand');
const {
  LoginUserCommandHandler,
} = require('../../../src/application/commands/login_user/LoginUserCommandHandler');
const {
  LoginUserCommand,
} = require('../../../src/application/commands/login_user/LoginUserCommand');
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
  await new RegisterUserCommandHandler({ users, userFactory }).handle(
    new RegisterUserCommand({ username: 'alice', password: 'secret123' })
  );
  return { handler: new LoginUserCommandHandler({ users, hasher, tokens }) };
}

test('LoginUser handler видає токен при правильних даних', async () => {
  const { handler } = await setupWithUser();
  const token = await handler.handle(
    new LoginUserCommand({ username: 'alice', password: 'secret123' })
  );
  assert.equal(typeof token, 'string');
  assert.ok(token.startsWith('tok::1::alice'));
});

test('LoginUser handler: невірний пароль → AuthenticationError', async () => {
  const { handler } = await setupWithUser();
  await assert.rejects(
    () => handler.handle(new LoginUserCommand({ username: 'alice', password: 'wrong' })),
    AuthenticationError
  );
});

test('LoginUser handler: невідомий username → AuthenticationError', async () => {
  const { handler } = await setupWithUser();
  await assert.rejects(
    () => handler.handle(new LoginUserCommand({ username: 'bob42', password: 'whatever123' })),
    AuthenticationError
  );
});

test('LoginUser handler ховає валідаційну помилку username', async () => {
  const { handler } = await setupWithUser();
  await assert.rejects(
    () => handler.handle(new LoginUserCommand({ username: '!!!', password: 'secret123' })),
    AuthenticationError
  );
});
