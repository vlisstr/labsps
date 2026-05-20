'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  RegisterUserCommandHandler,
} = require('../../../src/application/commands/register_user/RegisterUserCommandHandler');
const {
  RegisterUserCommand,
} = require('../../../src/application/commands/register_user/RegisterUserCommand');
const { UserFactory } = require('../../../src/domain/user/UserFactory');
const { ConflictError, ValidationError } = require('../../../src/domain/errors/DomainError');
const { FakePasswordHasher, FakeUserRepository } = require('../../_helpers/fakes');

function setup() {
  const users = new FakeUserRepository();
  const hasher = new FakePasswordHasher();
  const userFactory = new UserFactory({ users, hasher });
  const handler = new RegisterUserCommandHandler({ users, userFactory });
  return { users, handler };
}

test('RegisterUser handler повертає лише ID', async () => {
  const { users, handler } = setup();
  const id = await handler.handle(
    new RegisterUserCommand({ username: 'alice', password: 'secret123' })
  );
  assert.equal(typeof id, 'number');
  assert.equal(id, 1);
  const stored = await users.findById(1);
  assert.ok(stored);
  assert.equal(stored.username.value, 'alice');
});

test('RegisterUser handler: дубль → ConflictError', async () => {
  const { handler } = setup();
  await handler.handle(new RegisterUserCommand({ username: 'alice', password: 'secret123' }));
  await assert.rejects(
    () =>
      handler.handle(new RegisterUserCommand({ username: 'ALICE', password: 'other-pass' })),
    ConflictError
  );
});

test('RegisterUser handler: невалідний username → ValidationError', async () => {
  const { handler } = setup();
  await assert.rejects(
    () => handler.handle(new RegisterUserCommand({ username: '!', password: 'secret123' })),
    ValidationError
  );
});

test('Command — заморожений (immutable)', () => {
  const cmd = new RegisterUserCommand({ username: 'alice', password: 'secret123' });
  assert.throws(() => {
    cmd.username = 'eve';
  });
});
