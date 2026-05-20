'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { Username } = require('../../../src/modules/core/domain/user/Username');
const { Item } = require('../../../src/modules/core/domain/item/Item');
const { ItemName } = require('../../../src/modules/core/domain/item/ItemName');
const { ItemDescription } = require('../../../src/modules/core/domain/item/ItemDescription');
const {
  ValidationError,
  ForbiddenError,
} = require('../../../src/modules/core/domain/errors/DomainError');

test('Username — Value Object з інваріантами', () => {
  assert.equal(new Username('Alice').value, 'alice');
  assert.throws(() => new Username('ab'), ValidationError);
  assert.throws(() => new Username('with space'), ValidationError);
});

test('Item: лише власник може перейменувати', () => {
  const item = new Item({
    id: 1,
    name: new ItemName('Pen'),
    description: new ItemDescription(''),
    ownerId: 10,
  });
  assert.throws(() => item.rename(new ItemName('X'), 99), ForbiddenError);
  item.rename(new ItemName('Pencil'), 10);
  assert.equal(item.name.value, 'Pencil');
});

test('Item: інваріант видалення', () => {
  const item = new Item({
    id: 1, name: new ItemName('X'),
    description: new ItemDescription(''),
    ownerId: 10,
  });
  assert.throws(() => item.ensureCanBeDeletedBy(99), ForbiddenError);
  assert.doesNotThrow(() => item.ensureCanBeDeletedBy(10));
});
