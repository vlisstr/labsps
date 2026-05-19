'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ItemFactory } = require('../../../src/domain/item/ItemFactory');
const {
  CreateItemUseCase,
} = require('../../../src/application/use_cases/CreateItemUseCase');
const {
  UpdateItemUseCase,
} = require('../../../src/application/use_cases/UpdateItemUseCase');
const {
  DeleteItemUseCase,
} = require('../../../src/application/use_cases/DeleteItemUseCase');
const {
  GetItemUseCase,
} = require('../../../src/application/use_cases/GetItemUseCase');
const {
  ListItemsUseCase,
} = require('../../../src/application/use_cases/ListItemsUseCase');
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
    create: new CreateItemUseCase({ items, itemFactory }),
    update: new UpdateItemUseCase({ items }),
    del: new DeleteItemUseCase({ items }),
    get: new GetItemUseCase({ items }),
    list: new ListItemsUseCase({ items }),
  };
}

test('CreateItem повертає DTO без VO', async () => {
  const { create } = setup();
  const v = await create.execute({ name: 'Pen', description: 'blue', ownerId: 1 });
  assert.deepEqual(v, { id: 1, name: 'Pen', description: 'blue', ownerId: 1 });
});

test('UpdateItem: тільки власник може оновити', async () => {
  const { create, update } = setup();
  await create.execute({ name: 'Pen', ownerId: 1 });
  await assert.rejects(
    () => update.execute({ id: 1, actorId: 999, name: 'Hacked' }),
    ForbiddenError
  );
  const v = await update.execute({ id: 1, actorId: 1, name: 'Pencil' });
  assert.equal(v.name, 'Pencil');
});

test('UpdateItem валідує нову назву', async () => {
  const { create, update } = setup();
  await create.execute({ name: 'Pen', ownerId: 1 });
  await assert.rejects(
    () => update.execute({ id: 1, actorId: 1, name: '' }),
    ValidationError
  );
});

test('UpdateItem: NotFound на неіснуючий id', async () => {
  const { update } = setup();
  await assert.rejects(
    () => update.execute({ id: 42, actorId: 1, name: 'Pencil' }),
    NotFoundError
  );
});

test('DeleteItem: тільки власник може видалити', async () => {
  const { create, del, items } = setup();
  await create.execute({ name: 'Pen', ownerId: 1 });
  await assert.rejects(() => del.execute({ id: 1, actorId: 999 }), ForbiddenError);
  await del.execute({ id: 1, actorId: 1 });
  assert.equal(await items.findById(1), null);
});

test('GetItem: NotFound', async () => {
  const { get } = setup();
  await assert.rejects(() => get.execute({ id: 99 }), NotFoundError);
});

test('ListItems повертає масив DTO', async () => {
  const { create, list } = setup();
  await create.execute({ name: 'A', ownerId: 1 });
  await create.execute({ name: 'B', ownerId: 1 });
  const all = await list.execute();
  assert.equal(all.length, 2);
  assert.equal(all[0].name, 'A');
});
