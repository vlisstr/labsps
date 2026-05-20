'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

let canRun = true;
try { require('express'); } catch { canRun = false; }

const { InProcessEventBus } = canRun
  ? require('../../src/shared/event_bus/InProcessEventBus') : {};
const { buildAuditModule } = canRun
  ? require('../../src/modules/audit/module') : {};
const { buildAnalyticsModule } = canRun
  ? require('../../src/modules/analytics/module') : {};

const maybeTest = canRun ? test : test.skip;
const silent = { error: () => {} };

maybeTest('Eventual consistency: одна подія оновлює і Audit, і Analytics', async () => {
  const eventBus = new InProcessEventBus({ logger: silent });
  const audit = buildAuditModule({ eventBus });
  const analytics = buildAnalyticsModule({ eventBus });

  await eventBus.publish({
    type: 'UserRegistered', userId: 1, username: 'alice',
    occurredAt: '2026-05-20T10:00:00.000Z',
  });

  const auditEntries = await audit.auditLogger.findAll();
  assert.equal(auditEntries.length, 1);
  assert.equal(auditEntries[0].action, 'user.registered');

  const userStats = await analytics.userStats.findAll();
  assert.equal(userStats.length, 1);
  assert.equal(userStats[0].username, 'alice');
});

maybeTest('Збій audit-підписника не зриває Analytics', async () => {
  const eventBus = new InProcessEventBus({ logger: silent });
  eventBus.subscribe('UserRegistered', () => {
    throw new Error('audit broken');
  });
  const analytics = buildAnalyticsModule({ eventBus });

  await eventBus.publish({
    type: 'UserRegistered', userId: 1, username: 'alice',
    occurredAt: '2026-05-20T10:00:00.000Z',
  });

  const stats = await analytics.userStats.findAll();
  assert.equal(stats.length, 1);
});

maybeTest('Модулі не залежать одне від одного', async () => {
  const eventBus = new InProcessEventBus({ logger: silent });
  const analytics = buildAnalyticsModule({ eventBus });

  await eventBus.publish({
    type: 'ItemCreated', itemId: 1, name: 'Pen', ownerId: 1,
    occurredAt: '2026-05-20T10:00:00.000Z',
  });

  const summary = await analytics.queries.summary.handle();
  assert.equal(summary.totalItemsCreated, 1);
});
