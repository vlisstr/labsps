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

maybeTest('повний цикл items: create → list → update → delete', async () => {
  const { request, close, registerAndLogin } = await makeFixture();
  try {
    const aliceTok = await registerAndLogin('alice', 'secret123');

    const c = await request('POST', '/items', {
      body: { name: 'Pen', description: 'blue' },
      token: aliceTok,
    });
    assert.equal(c.status, 201);
    assert.equal(c.body.name, 'Pen');
    const id = c.body.id;

    const l = await request('GET', '/items');
    assert.equal(l.status, 200);
    assert.equal(l.body.length, 1);

    const g = await request('GET', `/items/${id}`);
    assert.equal(g.status, 200);
    assert.equal(g.body.id, id);

    const u = await request('PUT', `/items/${id}`, {
      body: { name: 'Pencil' },
      token: aliceTok,
    });
    assert.equal(u.status, 200);
    assert.equal(u.body.name, 'Pencil');

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
    const bobTok = await registerAndLogin('bob', 'secret123');

    const c = await request('POST', '/items', {
      body: { name: 'Pen' },
      token: aliceTok,
    });
    const id = c.body.id;

    const r = await request('PUT', `/items/${id}`, {
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
    const bobTok = await registerAndLogin('bob', 'secret123');

    const c = await request('POST', '/items', {
      body: { name: 'Pen' },
      token: aliceTok,
    });
    const id = c.body.id;

    const r = await request('DELETE', `/items/${id}`, { token: bobTok });
    assert.equal(r.status, 403);
  } finally {
    await close();
  }
});

maybeTest('POST /items з порожньою назвою → 422', async () => {
  const { request, close, registerAndLogin } = await makeFixture();
  try {
    const tok = await registerAndLogin('alice', 'secret123');
    const r = await request('POST', '/items', {
      body: { name: '' },
      token: tok,
    });
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
