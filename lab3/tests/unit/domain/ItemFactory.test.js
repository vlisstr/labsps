'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ItemFactory } = require('../../../src/domain/item/ItemFactory');
const { ValidationError } = require('../../../src/domain/errors/DomainError');
const { FakeItemRepository } = require('../../_helpers/fakes');

test('ItemFactory будує валідний Item', async () => {
  const items = new FakeItemRepository();
  const factory = new ItemFactory({ items });
  const item = await factory.create({ name: 'Pen', description: 'blue', ownerId: 7 });
  assert.equal(item.name.value, 'Pen');
  assert.equal(item.description.value, 'blue');
  assert.equal(item.ownerId, 7);
  assert.equal(item.id, 1);
});

test('ItemFactory дозволяє порожній опис', async () => {
  const factory = new ItemFactory({ items: new FakeItemRepository() });
  const item = await factory.create({ name: 'Pen', ownerId: 7 });
  assert.equal(item.description.value, '');
  assert.ok(item.description.isEmpty());
});

test('ItemFactory відмовляє у порожній назві', async () => {
  const factory = new ItemFactory({ items: new FakeItemRepository() });
  await assert.rejects(
    () => factory.create({ name: '   ', ownerId: 7 }),
    ValidationError
  );
});

test('ItemFactory відмовляє при невалідному ownerId', async () => {
  const factory = new ItemFactory({ items: new FakeItemRepository() });
  await assert.rejects(
    () => factory.create({ name: 'Pen', ownerId: 0 }),
    ValidationError
  );
});
