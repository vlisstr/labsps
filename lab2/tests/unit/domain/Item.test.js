'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Item } = require('../../../src/domain/item/Item');
const { ItemName } = require('../../../src/domain/item/ItemName');
const { ItemDescription } = require('../../../src/domain/item/ItemDescription');
const {
  ValidationError,
  ForbiddenError,
} = require('../../../src/domain/errors/DomainError');

function makeItem(overrides = {}) {
  return new Item({
    id: overrides.id ?? 1,
    name: new ItemName(overrides.name ?? 'Pen'),
    description: new ItemDescription(overrides.description ?? 'blue ink'),
    ownerId: overrides.ownerId ?? 10,
  });
}

test('Item конструктор перевіряє типи', () => {
  assert.throws(
    () =>
      new Item({
        id: 1,
        name: 'raw string',
        description: new ItemDescription(''),
        ownerId: 1,
      }),
    ValidationError
  );
});

test('Item: лише власник може перейменувати', () => {
  const item = makeItem({ ownerId: 10 });
  assert.throws(() => item.rename(new ItemName('New'), 99), ForbiddenError);
  item.rename(new ItemName('New'), 10);
  assert.equal(item.name.value, 'New');
});

test('Item: лише власник може змінити опис', () => {
  const item = makeItem({ ownerId: 10 });
  assert.throws(
    () => item.changeDescription(new ItemDescription('hacked'), 99),
    ForbiddenError
  );
  item.changeDescription(new ItemDescription('updated'), 10);
  assert.equal(item.description.value, 'updated');
});

test('Item: лише власник може видалити', () => {
  const item = makeItem({ ownerId: 10 });
  assert.throws(() => item.ensureCanBeDeletedBy(99), ForbiddenError);
  assert.doesNotThrow(() => item.ensureCanBeDeletedBy(10));
});

test('ItemName / ItemDescription мають інваріанти', () => {
  assert.throws(() => new ItemName(''), ValidationError);
  assert.throws(() => new ItemName('x'.repeat(200)), ValidationError);
  assert.throws(() => new ItemDescription('x'.repeat(3000)), ValidationError);
  assert.equal(new ItemDescription().value, '');
});

test('Item рівність — за ID', () => {
  const a = makeItem({ id: 7, name: 'A' });
  const b = makeItem({ id: 7, name: 'B' });
  const c = makeItem({ id: 8 });
  assert.ok(a.equals(b));
  assert.ok(!a.equals(c));
});
