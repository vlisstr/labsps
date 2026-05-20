'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

let canRun = true;
try {
  require('express');
  require('cors');
  require('bcryptjs');
  require('jsonwebtoken');
} catch {
  canRun = false;
}

const { buildSystem } = canRun ? require('../../src/composition_root') : {};
const { startApp } = canRun ? require('../_helpers/httpClient') : {};

const maybeTest = canRun ? test : test.skip;

maybeTest('Full system: Core → events → Audit + Analytics', async () => {
  const { app } = buildSystem({ jwtSecret: 'test-secret' });
  const { request, close } = await startApp(app);
  try {
    const reg = await request('POST', '/auth/register', {
      body: { username: 'alice', password: 'secret123' },
    });
    assert.equal(reg.status, 201);

    const login = await request('POST', '/auth/login', {
      body: { username: 'alice', password: 'secret123' },
    });
    const token = login.body.token;
    assert.ok(token);

    const created1 = await request('POST', '/items', {
      body: { name: 'Pen', description: 'blue' }, token,
    });
    assert.equal(created1.status, 201);
    const item1 = created1.body.id;

    const created2 = await request('POST', '/items', {
      body: { name: 'Pad' }, token,
    });
    const item2 = created2.body.id;

    await request('PUT', `/items/${item1}`, { body: { name: 'Pencil' }, token });
    await request('DELETE', `/items/${item2}`, { token });

    const audit = await request('GET', '/audit');
    assert.equal(audit.status, 200);
    const actions = audit.body.map((e) => e.action);
    assert.deepEqual(actions, [
      'user.registered',
      'item.created',
      'item.created',
      'item.updated',
      'item.deleted',
    ]);

    const summary = await request('GET', '/analytics/summary');
    assert.equal(summary.status, 200);
    assert.equal(summary.body.totalUsers, 1);
    assert.equal(summary.body.totalItemsCreated, 2);
    assert.equal(summary.body.totalItemsDeleted, 1);
    assert.equal(summary.body.totalActiveItems, 1);

    const users = await request('GET', '/analytics/users');
    assert.equal(users.body[0].username, 'alice');
    assert.equal(users.body[0].itemsCreated, 2);
    assert.equal(users.body[0].activeItems, 1);

    const daily = await request('GET', '/analytics/daily');
    assert.ok(daily.body.length >= 1);
    const today = daily.body[daily.body.length - 1];
    assert.equal(today.registrations, 1);
    assert.equal(today.itemsCreated, 2);
    assert.equal(today.itemsUpdated, 1);
    assert.equal(today.itemsDeleted, 1);
  } finally {
    await close();
  }
});

maybeTest('Core помилка валідації НЕ публікує подію (нема ефекту на модулі-споживачі)', async () => {
  const { app } = buildSystem({ jwtSecret: 'test-secret' });
  const { request, close } = await startApp(app);
  try {
    const r = await request('POST', '/auth/register', {
      body: { username: '!', password: 'secret123' },
    });
    assert.equal(r.status, 422);

    const audit = await request('GET', '/audit');
    assert.equal(audit.body.length, 0);

    const summary = await request('GET', '/analytics/summary');
    assert.equal(summary.body.totalUsers, 0);
  } finally {
    await close();
  }
});

maybeTest('Чужий PUT → 403, Core не публікує подію (інваріант домену + ізоляція модулів)', async () => {
  const { app } = buildSystem({ jwtSecret: 'test-secret' });
  const { request, close } = await startApp(app);
  try {
    async function registerAndLogin(u, p) {
      await request('POST', '/auth/register', { body: { username: u, password: p } });
      const r = await request('POST', '/auth/login', { body: { username: u, password: p } });
      return r.body.token;
    }
    const alice = await registerAndLogin('alice', 'secret123');
    const bob = await registerAndLogin('bob42', 'secret123');

    const c = await request('POST', '/items', { body: { name: 'Pen' }, token: alice });
    const r = await request('PUT', `/items/${c.body.id}`,
      { body: { name: 'Hacked' }, token: bob });
    assert.equal(r.status, 403);

    const audit = await request('GET', '/audit');
    const actions = audit.body.map((e) => e.action);
    assert.deepEqual(actions, ['user.registered', 'user.registered', 'item.created']);

    const users = await request('GET', '/analytics/users');
    const alicestats = users.body.find((u) => u.username === 'alice');
    assert.equal(alicestats.itemsCreated, 1);
  } finally {
    await close();
  }
});
