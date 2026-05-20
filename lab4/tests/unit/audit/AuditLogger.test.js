'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { InMemoryAuditLogger } = require('../../../src/audit/InMemoryAuditLogger');
const { AuditEntry } = require('../../../src/audit/AuditEntry');

function entry(overrides = {}) {
  return new AuditEntry({
    action: 'item.created',
    entityType: 'item',
    entityId: 1,
    actorId: 7,
    details: { name: 'Pen' },
    occurredAt: '2026-05-20T10:00:00.000Z',
    ...overrides,
  });
}

test('AuditLogger зберігає записи', async () => {
  const log = new InMemoryAuditLogger();
  await log.record(entry());
  await log.record(entry({ entityId: 2, occurredAt: '2026-05-20T10:01:00.000Z' }));
  const all = await log.findAll();
  assert.equal(all.length, 2);
  assert.equal(all[0].action, 'item.created');
  assert.equal(all[0].actorId, 7);
});

test('Ідемпотентність: дубль (та сама дія + сутність + час) ігнорується', async () => {
  const log = new InMemoryAuditLogger();
  const e = entry();
  await log.record(e);
  await log.record(e);
  await log.record(e);
  assert.equal(log.size(), 1);
});

test('Різний occurredAt — НЕ дубль', async () => {
  const log = new InMemoryAuditLogger();
  await log.record(entry({ occurredAt: '2026-05-20T10:00:00.000Z' }));
  await log.record(entry({ occurredAt: '2026-05-20T10:00:01.000Z' }));
  assert.equal(log.size(), 2);
});

test('AuditEntry immutable', () => {
  const e = entry();
  assert.throws(() => { e.action = 'changed'; });
  assert.throws(() => { e.details.name = 'changed'; });
});

test('AuditEntry відмовляє у пустій action', () => {
  assert.throws(() => new AuditEntry({
    action: '',
    entityType: 'item',
    entityId: 1,
    occurredAt: 'x',
  }));
});
