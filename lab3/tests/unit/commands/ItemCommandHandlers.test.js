'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ItemFactory } = require('../../../src/domain/item/ItemFactory');
const {
  CreateItemCommandHandler,
} = require('../../../src/application/commands/create_item/CreateItemCommandHandler');
const {
  CreateItemCommand,
} = require('../../../src/application/commands/create_item/CreateItemCommand');
const {
  UpdateItemCommandHandler,
} = require('../../../src/application/commands/update_item/UpdateItemCommandHandler');
const {
  UpdateItemCommand,
} = require('../../../src/application/commands/update_item/UpdateItemCommand');
const {
  DeleteItemCommandHandler,
} = require('../../../src/application/commands/delete_item/DeleteItemCommandHandler');
const {
  DeleteItemCommand,
} = require('../../../src/application/commands/delete_item/DeleteItemCommand');
const {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} = require('../../../src/domain/errors/DomainError');
const { FakeItemRepository } = require('../../_helpers/fakes');

function setup() {
  const items = new FakeItemRepository();
  const itemFactory = new ItemFactory({ items });
  return {
    items,
    create: new CreateItemCommandHandler({ items, itemFactory }),
    update: new UpdateItemCommandHandler({ items }),
    del: new DeleteItemCommandHandler({ items }),
  };
}

test('CreateItem handler повертає лише ID', async () => {
  const { create } = setup();
  const id = await create.handle(
    new CreateItemCommand({ name: 'Pen', description: 'blue', ownerId: 1 })
  );
  assert.equal(typeof id, 'number');
  assert.equal(id, 1);
});

test('UpdateItem: тільки власник', async () => {
  const { create, update } = setup();
  await create.handle(new CreateItemCommand({ name: 'Pen', ownerId: 1 }));
  await assert.rejects(
    () => update.handle(new UpdateItemCommand({ id: 1, actorId: 999, name: 'X' })),
    ForbiddenError
  );
  await update.handle(new UpdateItemCommand({ id: 1, actorId: 1, name: 'Pencil' }));
});

test('UpdateItem: валідація нової назви', async () => {
  const { create, update } = setup();
  await create.handle(new CreateItemCommand({ name: 'Pen', ownerId: 1 }));
  await assert.rejects(
    () => update.handle(new UpdateItemCommand({ id: 1, actorId: 1, name: '' })),
    ValidationError
  );
});

test('UpdateItem: відсутній → NotFound', async () => {
  const { update } = setup();
  await assert.rejects(
    () => update.handle(new UpdateItemCommand({ id: 99, actorId: 1, name: 'X' })),
    NotFoundError
  );
});

test('DeleteItem: тільки власник', async () => {
  const { create, del, items } = setup();
  await create.handle(new CreateItemCommand({ name: 'Pen', ownerId: 1 }));
  await assert.rejects(
    () => del.handle(new DeleteItemCommand({ id: 1, actorId: 999 })),
    ForbiddenError
  );
  await del.handle(new DeleteItemCommand({ id: 1, actorId: 1 }));
  assert.equal(await items.findById(1), null);
});

test('Item commands заморожені', () => {
  const c = new CreateItemCommand({ name: 'X', ownerId: 1 });
  assert.throws(() => {
    c.name = 'Y';
  });
});
