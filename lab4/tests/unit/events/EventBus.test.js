'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { InProcessEventBus } = require('../../../src/infrastructure/event_bus/InProcessEventBus');
const { ItemCreated } = require('../../../src/application/events/ItemCreated');

const silentLogger = { error: () => {} };

test('InProcessEventBus доставляє подію всім підписникам', async () => {
  const bus = new InProcessEventBus({ logger: silentLogger });
  const received = [];
  bus.subscribe('ItemCreated', (e) => received.push(['A', e.itemId]));
  bus.subscribe('ItemCreated', (e) => received.push(['B', e.itemId]));

  await bus.publish(new ItemCreated({
    itemId: 1, name: 'Pen', ownerId: 1, occurredAt: '2026-05-20T00:00:00Z',
  }));

  assert.deepEqual(received, [['A', 1], ['B', 1]]);
});

test('Підписник на інший тип події не активується', async () => {
  const bus = new InProcessEventBus({ logger: silentLogger });
  const received = [];
  bus.subscribe('UserRegistered', (e) => received.push(e));

  await bus.publish(new ItemCreated({
    itemId: 1, name: 'X', ownerId: 1, occurredAt: 'x',
  }));

  assert.equal(received.length, 0);
});

test('Помилка одного підписника не зриває інших', async () => {
  const bus = new InProcessEventBus({ logger: silentLogger });
  const received = [];
  bus.subscribe('ItemCreated', () => { throw new Error('broken subscriber'); });
  bus.subscribe('ItemCreated', (e) => received.push(e.itemId));

  await bus.publish(new ItemCreated({
    itemId: 42, name: 'X', ownerId: 1, occurredAt: 'x',
  }));

  assert.deepEqual(received, [42]);
});

test('Подія без типу ігнорується', async () => {
  const bus = new InProcessEventBus({ logger: silentLogger });
  await bus.publish({});
  await bus.publish(null);
});

test('Event immutable — не можна змінити поля', () => {
  const e = new ItemCreated({ itemId: 1, name: 'X', ownerId: 1, occurredAt: 'x' });
  assert.throws(() => { e.itemId = 99; });
});
