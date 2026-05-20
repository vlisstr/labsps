'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ListItemsQueryHandler,
} = require('../../../src/application/queries/list_items/ListItemsQueryHandler');
const {
  ListItemsQuery,
} = require('../../../src/application/queries/list_items/ListItemsQuery');
const {
  GetItemQueryHandler,
} = require('../../../src/application/queries/get_item/GetItemQueryHandler');
const {
  GetItemQuery,
} = require('../../../src/application/queries/get_item/GetItemQuery');
const { NotFoundError } = require('../../../src/domain/errors/DomainError');
const { FakeItemReadRepository } = require('../../_helpers/fakes');

function rows() {
  return [
    { id: 1, name: 'Pen', description: 'blue', ownerId: 10, ownerUsername: 'alice' },
    { id: 2, name: 'Pad', description: '', ownerId: 10, ownerUsername: 'alice' },
    { id: 3, name: 'Cup', description: 'coffee', ownerId: 20, ownerUsername: 'bob42' },
  ];
}

test('ListItems query повертає DTO зі денормалізованим ownerUsername', async () => {
  const repo = new FakeItemReadRepository();
  repo.seed(rows());
  const handler = new ListItemsQueryHandler({ itemsRead: repo });
  const result = await handler.handle(new ListItemsQuery());
  assert.equal(result.length, 3);
  assert.equal(result[0].name, 'Pen');
  assert.equal(result[0].ownerUsername, 'alice');
  assert.equal(result[2].ownerUsername, 'bob42');
});

test('Read DTO не містить методів доменної моделі', async () => {
  const repo = new FakeItemReadRepository();
  repo.seed(rows());
  const handler = new ListItemsQueryHandler({ itemsRead: repo });
  const [first] = await handler.handle(new ListItemsQuery());
  assert.equal(typeof first.rename, 'undefined');
  assert.equal(typeof first.ensureCanBeDeletedBy, 'undefined');
});

test('GetItem query повертає DTO', async () => {
  const repo = new FakeItemReadRepository();
  repo.seed(rows());
  const handler = new GetItemQueryHandler({ itemsRead: repo });
  const dto = await handler.handle(new GetItemQuery({ id: 2 }));
  assert.equal(dto.id, 2);
  assert.equal(dto.name, 'Pad');
  assert.equal(dto.ownerUsername, 'alice');
});

test('GetItem відсутній → NotFoundError', async () => {
  const repo = new FakeItemReadRepository();
  repo.seed(rows());
  const handler = new GetItemQueryHandler({ itemsRead: repo });
  await assert.rejects(
    () => handler.handle(new GetItemQuery({ id: 99 })),
    NotFoundError
  );
});

test('Query DTO не мутує стан', async () => {
  const repo = new FakeItemReadRepository();
  repo.seed(rows());
  const handler = new ListItemsQueryHandler({ itemsRead: repo });
  await handler.handle(new ListItemsQuery());
  await handler.handle(new ListItemsQuery());
  await handler.handle(new ListItemsQuery());
  const result = await handler.handle(new ListItemsQuery());
  assert.equal(result.length, 3);
});
