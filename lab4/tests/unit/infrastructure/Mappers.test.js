'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Item } = require('../../../src/domain/item/Item');
const { ItemName } = require('../../../src/domain/item/ItemName');
const { ItemDescription } = require('../../../src/domain/item/ItemDescription');
const { ItemMapper } = require('../../../src/infrastructure/persistence/mappers/ItemMapper');
const { User } = require('../../../src/domain/user/User');
const { Username } = require('../../../src/domain/user/Username');
const { PasswordHash } = require('../../../src/domain/user/PasswordHash');
const { UserMapper } = require('../../../src/infrastructure/persistence/mappers/UserMapper');

test('ItemMapper: domain ↔ record round-trip', () => {
  const item = new Item({
    id: 5,
    name: new ItemName('Pen'),
    description: new ItemDescription('blue'),
    ownerId: 9,
  });
  const r = ItemMapper.toRecord(item);
  assert.equal(r.name, 'Pen');
  assert.equal(r.owner_id, 9);
  const back = ItemMapper.toDomain(r);
  assert.equal(back.name.value, 'Pen');
  assert.equal(back.description.value, 'blue');
  assert.equal(back.ownerId, 9);
});

test('ItemMapper: порожній опис зберігається як NULL', () => {
  const item = new Item({
    id: 1,
    name: new ItemName('X'),
    description: new ItemDescription(''),
    ownerId: 1,
  });
  const r = ItemMapper.toRecord(item);
  assert.equal(r.description, null);
  const back = ItemMapper.toDomain(r);
  assert.equal(back.description.value, '');
});

test('UserMapper: round-trip', () => {
  const user = new User({
    id: 3,
    username: new Username('alice'),
    passwordHash: new PasswordHash('$2a$10$abcdefghijklmnopqrstuv'),
  });
  const r = UserMapper.toRecord(user);
  assert.equal(r.username, 'alice');
  assert.equal(r.password_hash, '$2a$10$abcdefghijklmnopqrstuv');
  const back = UserMapper.toDomain(r);
  assert.equal(back.username.value, 'alice');
  assert.equal(back.passwordHash.value, '$2a$10$abcdefghijklmnopqrstuv');
});
