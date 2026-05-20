'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { InProcessEventBus } = require('../../../src/shared/event_bus/InProcessEventBus');
const {
  InMemoryUserStatsRepository,
  InMemoryDailyMetricsRepository,
} = require('../../../src/modules/analytics/infrastructure/persistence/InMemoryAnalyticsRepositories');
const {
  registerAnalyticsSubscribers,
} = require('../../../src/modules/analytics/application/handlers/AnalyticsEventHandler');
const {
  CoreEventTranslator,
} = require('../../../src/modules/analytics/infrastructure/acl/CoreEventTranslator');
const {
  GetSummaryQueryHandler,
  GetUserStatsQueryHandler,
  GetDailyMetricsQueryHandler,
} = require('../../../src/modules/analytics/application/queries/AnalyticsQueries');

const silent = { error: () => {} };

function setup() {
  const userStats = new InMemoryUserStatsRepository();
  const dailyMetrics = new InMemoryDailyMetricsRepository();
  const eventBus = new InProcessEventBus({ logger: silent });
  registerAnalyticsSubscribers({ eventBus, userStats, dailyMetrics });
  return { userStats, dailyMetrics, eventBus };
}

test('ACL: UserRegistered → UserStats з ініціалізованим username', async () => {
  const { eventBus, userStats } = setup();
  await eventBus.publish({
    type: 'UserRegistered', userId: 1, username: 'alice',
    occurredAt: '2026-05-20T10:00:00.000Z',
  });
  const s = await userStats.findById(1);
  assert.equal(s.username, 'alice');
  assert.equal(s.itemsCreated, 0);
});

test('ACL: ItemCreated інкрементує статистику власника', async () => {
  const { eventBus, userStats } = setup();
  await eventBus.publish({
    type: 'UserRegistered', userId: 1, username: 'alice',
    occurredAt: '2026-05-20T10:00:00.000Z',
  });
  await eventBus.publish({
    type: 'ItemCreated', itemId: 1, name: 'Pen', ownerId: 1,
    occurredAt: '2026-05-20T10:01:00.000Z',
  });
  await eventBus.publish({
    type: 'ItemCreated', itemId: 2, name: 'Pad', ownerId: 1,
    occurredAt: '2026-05-20T10:02:00.000Z',
  });
  const s = await userStats.findById(1);
  assert.equal(s.itemsCreated, 2);
  assert.equal(s.activeItems, 2);
});

test('ACL: ItemDeleted зменшує activeItems але не itemsCreated', async () => {
  const { eventBus, userStats } = setup();
  await eventBus.publish({ type: 'UserRegistered', userId: 1, username: 'alice', occurredAt: '2026-05-20T10:00:00Z' });
  await eventBus.publish({ type: 'ItemCreated', itemId: 1, name: 'X', ownerId: 1, occurredAt: '2026-05-20T10:01:00Z' });
  await eventBus.publish({ type: 'ItemCreated', itemId: 2, name: 'Y', ownerId: 1, occurredAt: '2026-05-20T10:02:00Z' });
  await eventBus.publish({ type: 'ItemDeleted', itemId: 1, actorId: 1, occurredAt: '2026-05-20T10:03:00Z' });
  const s = await userStats.findById(1);
  assert.equal(s.itemsCreated, 2);
  assert.equal(s.itemsDeleted, 1);
  assert.equal(s.activeItems, 1);
});

test('Daily metrics агрегуються по даті', async () => {
  const { eventBus, dailyMetrics } = setup();
  await eventBus.publish({ type: 'UserRegistered', userId: 1, username: 'a', occurredAt: '2026-05-20T10:00:00Z' });
  await eventBus.publish({ type: 'ItemCreated', itemId: 1, name: 'X', ownerId: 1, occurredAt: '2026-05-20T11:00:00Z' });
  await eventBus.publish({ type: 'ItemCreated', itemId: 2, name: 'Y', ownerId: 1, occurredAt: '2026-05-21T10:00:00Z' });
  const all = await dailyMetrics.findAll();
  assert.equal(all.length, 2);
  assert.equal(all[0].date, '2026-05-20');
  assert.equal(all[0].registrations, 1);
  assert.equal(all[0].itemsCreated, 1);
  assert.equal(all[1].date, '2026-05-21');
  assert.equal(all[1].itemsCreated, 1);
});

test('Summary query', async () => {
  const { eventBus, userStats, dailyMetrics } = setup();
  await eventBus.publish({ type: 'UserRegistered', userId: 1, username: 'a', occurredAt: '2026-05-20T10:00:00Z' });
  await eventBus.publish({ type: 'UserRegistered', userId: 2, username: 'b', occurredAt: '2026-05-20T10:01:00Z' });
  await eventBus.publish({ type: 'ItemCreated', itemId: 1, name: 'X', ownerId: 1, occurredAt: '2026-05-20T11:00:00Z' });
  await eventBus.publish({ type: 'ItemCreated', itemId: 2, name: 'Y', ownerId: 1, occurredAt: '2026-05-20T11:01:00Z' });
  await eventBus.publish({ type: 'ItemDeleted', itemId: 1, actorId: 1, occurredAt: '2026-05-20T12:00:00Z' });

  const handler = new GetSummaryQueryHandler({ userStats, dailyMetrics });
  const r = await handler.handle();
  assert.equal(r.totalUsers, 2);
  assert.equal(r.totalItemsCreated, 2);
  assert.equal(r.totalItemsDeleted, 1);
  assert.equal(r.totalActiveItems, 1);
});

test('Top users query сортує за activeItems', async () => {
  const { eventBus, userStats } = setup();
  await eventBus.publish({ type: 'UserRegistered', userId: 1, username: 'alice', occurredAt: '2026-05-20T10:00:00Z' });
  await eventBus.publish({ type: 'UserRegistered', userId: 2, username: 'bob42', occurredAt: '2026-05-20T10:01:00Z' });
  await eventBus.publish({ type: 'ItemCreated', itemId: 1, name: 'X', ownerId: 2, occurredAt: '2026-05-20T11:00:00Z' });
  await eventBus.publish({ type: 'ItemCreated', itemId: 2, name: 'Y', ownerId: 2, occurredAt: '2026-05-20T11:01:00Z' });
  await eventBus.publish({ type: 'ItemCreated', itemId: 3, name: 'Z', ownerId: 1, occurredAt: '2026-05-20T11:02:00Z' });

  const handler = new GetUserStatsQueryHandler({ userStats });
  const rows = await handler.handle();
  assert.equal(rows[0].username, 'bob42');
  assert.equal(rows[0].activeItems, 2);
  assert.equal(rows[1].username, 'alice');
  assert.equal(rows[1].activeItems, 1);
});

test('CoreEventTranslator: невідомий тип — null', () => {
  assert.equal(CoreEventTranslator.toUserStatsUpdate({ type: 'Unknown' }), null);
  assert.equal(CoreEventTranslator.toDailyMetricUpdate({ type: 'Unknown' }), null);
});

test('Daily metrics query', async () => {
  const { eventBus, dailyMetrics } = setup();
  await eventBus.publish({ type: 'ItemCreated', itemId: 1, name: 'X', ownerId: 1, occurredAt: '2026-05-20T10:00:00Z' });
  await eventBus.publish({ type: 'ItemCreated', itemId: 2, name: 'Y', ownerId: 1, occurredAt: '2026-05-21T10:00:00Z' });

  const handler = new GetDailyMetricsQueryHandler({ dailyMetrics });
  const rows = await handler.handle();
  assert.equal(rows.length, 2);
  assert.equal(rows[0].date, '2026-05-20');
  assert.equal(rows[1].date, '2026-05-21');
});
