'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { InProcessEventBus } = require('../../../src/shared/event_bus/InProcessEventBus');
const { InMemoryAuditLogger } = require('../../../src/modules/audit/infrastructure/InMemoryAuditLogger');
const {
  registerAuditSubscribers,
} = require('../../../src/modules/audit/application/subscribers/registerAuditSubscribers');
const { AuditEntry } = require('../../../src/modules/audit/domain/AuditEntry');

const silent = { error: () => {} };

function setup() {
  const eventBus = new InProcessEventBus({ logger: silent });
  const auditLogger = new InMemoryAuditLogger();
  registerAuditSubscribers({ eventBus, auditLogger });
  return { eventBus, auditLogger };
}

test('Audit module реагує на події Core', async () => {
  const { eventBus, auditLogger } = setup();

  await eventBus.publish({
    type: 'UserRegistered', userId: 1, username: 'alice',
    occurredAt: '2026-05-20T10:00:00.000Z',
  });
  await eventBus.publish({
    type: 'ItemCreated', itemId: 5, name: 'Pen', ownerId: 1,
    occurredAt: '2026-05-20T10:01:00.000Z',
  });
  await eventBus.publish({
    type: 'ItemDeleted', itemId: 5, actorId: 1,
    occurredAt: '2026-05-20T10:02:00.000Z',
  });

  const entries = await auditLogger.findAll();
  assert.equal(entries.length, 3);
  assert.equal(entries[0].action, 'user.registered');
  assert.equal(entries[1].action, 'item.created');
  assert.equal(entries[2].action, 'item.deleted');
});

test('Audit: подвійна доставка → один запис (ідемпотентність)', async () => {
  const { eventBus, auditLogger } = setup();

  const event = {
    type: 'ItemCreated', itemId: 1, name: 'X', ownerId: 1,
    occurredAt: '2026-05-20T10:00:00.000Z',
  };
  await eventBus.publish(event);
  await eventBus.publish(event);
  await eventBus.publish(event);

  const entries = await auditLogger.findAll();
  assert.equal(entries.length, 1);
});

test('AuditEntry — immutable VO з валідацією action', () => {
  const e = new AuditEntry({
    action: 'item.created', entityType: 'item', entityId: 1,
    occurredAt: '2026-05-20T10:00:00Z',
  });
  assert.throws(() => { e.action = 'changed'; });
  assert.throws(() => new AuditEntry({
    action: '', entityType: 'item', entityId: 1, occurredAt: 'x',
  }));
});
