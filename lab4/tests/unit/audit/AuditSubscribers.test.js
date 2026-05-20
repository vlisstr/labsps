'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { InProcessEventBus } = require('../../../src/infrastructure/event_bus/InProcessEventBus');
const { InMemoryAuditLogger } = require('../../../src/audit/InMemoryAuditLogger');
const {
  registerAuditSubscribers,
} = require('../../../src/audit/subscribers/registerAuditSubscribers');
const { UserRegistered } = require('../../../src/application/events/UserRegistered');
const { ItemCreated } = require('../../../src/application/events/ItemCreated');
const { ItemDeleted } = require('../../../src/application/events/ItemDeleted');

const silent = { error: () => {} };

test('Subscribers перетворюють події в записи аудиту', async () => {
  const auditLogger = new InMemoryAuditLogger();
  const eventBus = new InProcessEventBus({ logger: silent });
  registerAuditSubscribers({ eventBus, auditLogger });

  await eventBus.publish(new UserRegistered({
    userId: 1, username: 'alice', occurredAt: '2026-05-20T10:00:00.000Z',
  }));
  await eventBus.publish(new ItemCreated({
    itemId: 1, name: 'Pen', ownerId: 1, occurredAt: '2026-05-20T10:01:00.000Z',
  }));
  await eventBus.publish(new ItemDeleted({
    itemId: 1, actorId: 1, occurredAt: '2026-05-20T10:02:00.000Z',
  }));

  const entries = await auditLogger.findAll();
  assert.equal(entries.length, 3);
  assert.equal(entries[0].action, 'user.registered');
  assert.equal(entries[0].details.username, 'alice');
  assert.equal(entries[1].action, 'item.created');
  assert.equal(entries[2].action, 'item.deleted');
});

test('Двічі доставлена подія дає один запис (ідемпотентність)', async () => {
  const auditLogger = new InMemoryAuditLogger();
  const eventBus = new InProcessEventBus({ logger: silent });
  registerAuditSubscribers({ eventBus, auditLogger });

  const event = new ItemCreated({
    itemId: 5, name: 'X', ownerId: 1, occurredAt: '2026-05-20T10:00:00.000Z',
  });
  await eventBus.publish(event);
  await eventBus.publish(event);
  await eventBus.publish(event);

  const entries = await auditLogger.findAll();
  assert.equal(entries.length, 1);
});
