'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

let canRun = true;
try {
  require('express');
  require('cors');
} catch {
  canRun = false;
}

const { buildContainer } = canRun
  ? require('../../src/infrastructure/config/container')
  : {};
const { buildApp } = canRun ? require('../../src/presentation/app') : {};
const { startApp } = canRun ? require('../_helpers/httpClient') : {};
const { FakePasswordHasher, FakeTokenService } = canRun
  ? require('../_helpers/fakes')
  : {};

const maybeTest = canRun ? test : test.skip;

async function makeFixture() {
  const container = buildContainer({
    persistence: 'memory',
    hasher: new FakePasswordHasher(),
    tokens: new FakeTokenService(),
  });
  const { request, close } = await startApp(buildApp(container));

  async function registerAndLogin(username, password) {
    await request('POST', '/auth/register', { body: { username, password } });
    const r = await request('POST', '/auth/login', { body: { username, password } });
    return r.body.token;
  }
  return { request, close, registerAndLogin };
}

maybeTest('CQS-цикл items: create(id) → list(DTO) → get(DTO) → update(204) → delete(204)', async () => {
  const { request, close, registerAndLogin } = await makeFixture();
  try {
    const aliceTok = await registerAndLogin('alice', 'secret123');

    const c = await request('POST', '/items', {
      body: { name: 'Pen', description: 'blue' },
      token: aliceTok,
    });
    assert.equal(c.status, 201);
    assert.ok(typeof c.body.id === 'number', 'Command повертає лише ID');
    assert.equal(c.body.name, undefined, 'Command не повертає повну модель');
    const id = c.body.id;

    const l = await request('GET', '/items');
    assert.equal(l.status, 200);
    assert.equal(l.body.length, 1);
    assert.equal(l.body[0].ownerUsername, 'alice', 'Read DTO має ownerUsername');

    const g = await request('GET', `/items/${id}`);
    assert.equal(g.status, 200);
    assert.equal(g.body.id, id);
    assert.equal(g.body.name, 'Pen');
    assert.equal(g.body.ownerUsername, 'alice');

    const u = await request('PUT', `/items/${id}`, {
      body: { name: 'Pencil' },
      token: aliceTok,
    });
    assert.equal(u.status, 204, 'PUT — команда, без тіла відповіді');

    const g2 = await request('GET', `/items/${id}`);
    assert.equal(g2.body.name, 'Pencil');

    const d = await request('DELETE', `/items/${id}`, { token: aliceTok });
    assert.equal(d.status, 204);

    const after = await request('GET', `/items/${id}`);
    assert.equal(after.status, 404);
  } finally {
    await close();
  }
});

maybeTest('POST /items без токена → 401', async () => {
  const { request, close } = await makeFixture();
  try {
    const r = await request('POST', '/items', { body: { name: 'X' } });
    assert.equal(r.status, 401);
  } finally {
    await close();
  }
});

maybeTest('PUT /items чужого → 403', async () => {
  const { request, close, registerAndLogin } = await makeFixture();
  try {
    const aliceTok = await registerAndLogin('alice', 'secret123');
    const bobTok = await registerAndLogin('bob42', 'secret123');
    const c = await request('POST', '/items', { body: { name: 'Pen' }, token: aliceTok });
    const r = await request('PUT', `/items/${c.body.id}`, {
      body: { name: 'Hacked' },
      token: bobTok,
    });
    assert.equal(r.status, 403);
    assert.equal(r.body.code, 'ITEM_FORBIDDEN');
  } finally {
    await close();
  }
});

maybeTest('DELETE /items чужого → 403', async () => {
  const { request, close, registerAndLogin } = await makeFixture();
  try {
    const aliceTok = await registerAndLogin('alice', 'secret123');
    const bobTok = await registerAndLogin('bob42', 'secret123');
    const c = await request('POST', '/items', { body: { name: 'Pen' }, token: aliceTok });
    const r = await request('DELETE', `/items/${c.body.id}`, { token: bobTok });
    assert.equal(r.status, 403);
  } finally {
    await close();
  }
});

maybeTest('POST /items з порожньою назвою → 422', async () => {
  const { request, close, registerAndLogin } = await makeFixture();
  try {
    const tok = await registerAndLogin('alice', 'secret123');
    const r = await request('POST', '/items', { body: { name: '' }, token: tok });
    assert.equal(r.status, 422);
    assert.equal(r.body.code, 'ITEM_NAME_INVALID');
  } finally {
    await close();
  }
});

maybeTest('GET /items/:id не знайдено → 404', async () => {
  const { request, close } = await makeFixture();
  try {
    const r = await request('GET', '/items/999');
    assert.equal(r.status, 404);
  } finally {
    await close();
  }
});

maybeTest('Read DTO відрізняється від доменної моделі (немає методів)', async () => {
  const { request, close, registerAndLogin } = await makeFixture();
  try {
    const tok = await registerAndLogin('alice', 'secret123');
    const c = await request('POST', '/items', { body: { name: 'Pen' }, token: tok });
    const g = await request('GET', `/items/${c.body.id}`);
    const keys = Object.keys(g.body).sort();
    assert.deepEqual(keys, ['description', 'id', 'name', 'ownerId', 'ownerUsername']);
  } finally {
    await close();
  }
});
