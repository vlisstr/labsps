'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  CreateItemCommandHandler,
} = require('../../../src/application/commands/create_item/CreateItemCommandHandler');
const {
  CreateItemCommand,
} = require('../../../src/application/commands/create_item/CreateItemCommand');
const { ItemFactory } = require('../../../src/domain/item/ItemFactory');
const { InMemoryAuditLogger } = require('../../../src/audit/InMemoryAuditLogger');
const { InProcessEventBus } = require('../../../src/infrastructure/event_bus/InProcessEventBus');
const {
  registerAuditSubscribers,
} = require('../../../src/audit/subscribers/registerAuditSubscribers');
const {
  FakeItemRepository,
  CapturingEventBus,
  FailingAuditLogger,
} = require('../../_helpers/fakes');

const silent = { error: () => {} };

test('SYNC mode: handler напряму викликає auditLogger', async () => {
  const items = new FakeItemRepository();
  const itemFactory = new ItemFactory({ items });
  const auditLogger = new InMemoryAuditLogger();

  const handler = new CreateItemCommandHandler({
    items, itemFactory, mode: 'sync', auditLogger,
  });

  await handler.handle(new CreateItemCommand({ name: 'Pen', ownerId: 1 }));

  const entries = await auditLogger.findAll();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].action, 'item.created');
  assert.equal(entries[0].entityId, 1);
});

test('SYNC mode: збій audit НЕ зриває основну операцію', async () => {
  const items = new FakeItemRepository();
  const itemFactory = new ItemFactory({ items });
  const handler = new CreateItemCommandHandler({
    items,
    itemFactory,
    mode: 'sync',
    auditLogger: new FailingAuditLogger(),
  });

  const origError = console.error;
  console.error = () => {};
  try {
    const id = await handler.handle(new CreateItemCommand({ name: 'Pen', ownerId: 1 }));
    assert.equal(id, 1);
    assert.ok(await items.findById(1), 'item все одно збережено');
  } finally {
    console.error = origError;
  }
});

test('ASYNC mode: handler публікує подію (не торкається audit)', async () => {
  const items = new FakeItemRepository();
  const itemFactory = new ItemFactory({ items });
  const eventBus = new CapturingEventBus();
  const auditLogger = new InMemoryAuditLogger();

  const handler = new CreateItemCommandHandler({
    items, itemFactory, mode: 'async', eventBus,
  });

  await handler.handle(new CreateItemCommand({ name: 'Pen', ownerId: 1 }));

  assert.equal(eventBus.published.length, 1);
  assert.equal(eventBus.published[0].type, 'ItemCreated');
  assert.equal(eventBus.published[0].itemId, 1);
  assert.equal(auditLogger.size(), 0,
    'у async без підписника audit не торкається');
});

test('ASYNC mode end-to-end: підписник пише в audit', async () => {
  const items = new FakeItemRepository();
  const itemFactory = new ItemFactory({ items });
  const auditLogger = new InMemoryAuditLogger();
  const eventBus = new InProcessEventBus({ logger: silent });
  registerAuditSubscribers({ eventBus, auditLogger });

  const handler = new CreateItemCommandHandler({
    items, itemFactory, mode: 'async', eventBus,
  });

  await handler.handle(new CreateItemCommand({ name: 'Pen', ownerId: 1 }));

  const entries = await auditLogger.findAll();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].action, 'item.created');
});

test('ASYNC mode: збій підписника не зриває основну операцію', async () => {
  const items = new FakeItemRepository();
  const itemFactory = new ItemFactory({ items });
  const eventBus = new InProcessEventBus({ logger: silent });
  eventBus.subscribe('ItemCreated', () => {
    throw new Error('subscriber broken');
  });

  const handler = new CreateItemCommandHandler({
    items, itemFactory, mode: 'async', eventBus,
  });

  const id = await handler.handle(new CreateItemCommand({ name: 'Pen', ownerId: 1 }));
  assert.equal(id, 1);
  assert.ok(await items.findById(1));
});

test('ASYNC mode: декілька підписників на одну подію', async () => {
  const items = new FakeItemRepository();
  const itemFactory = new ItemFactory({ items });
  const eventBus = new InProcessEventBus({ logger: silent });

  const calls = [];
  eventBus.subscribe('ItemCreated', (e) => calls.push(['audit', e.itemId]));
  eventBus.subscribe('ItemCreated', (e) => calls.push(['analytics', e.itemId]));
  eventBus.subscribe('ItemCreated', (e) => calls.push(['notification', e.itemId]));

  const handler = new CreateItemCommandHandler({
    items, itemFactory, mode: 'async', eventBus,
  });

  await handler.handle(new CreateItemCommand({ name: 'Pen', ownerId: 1 }));
  assert.equal(calls.length, 3, 'pub/sub: одна подія → N підписників');
});
