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

maybeTest('POST /auth/register → 201, дублікат → 409', async () => {
  const container = buildContainer({
    persistence: 'memory',
    hasher: new FakePasswordHasher(),
    tokens: new FakeTokenService(),
  });
  const { request, close } = await startApp(buildApp(container));
  try {
    const r1 = await request('POST', '/auth/register', {
      body: { username: 'alice', password: 'secret123' },
    });
    assert.equal(r1.status, 201);
    assert.equal(r1.body.username, 'alice');
    assert.equal(r1.body.passwordHash, undefined);

    const r2 = await request('POST', '/auth/register', {
      body: { username: 'alice', password: 'secret123' },
    });
    assert.equal(r2.status, 409);
    assert.equal(r2.body.code, 'USER_ALREADY_EXISTS');
  } finally {
    await close();
  }
});

maybeTest('POST /auth/register з поганим username → 422', async () => {
  const container = buildContainer({
    persistence: 'memory',
    hasher: new FakePasswordHasher(),
    tokens: new FakeTokenService(),
  });
  const { request, close } = await startApp(buildApp(container));
  try {
    const r = await request('POST', '/auth/register', {
      body: { username: '!', password: 'secret123' },
    });
    assert.equal(r.status, 422);
    assert.equal(r.body.code, 'USERNAME_INVALID');
  } finally {
    await close();
  }
});

maybeTest('POST /auth/login невірний пароль → 401', async () => {
  const container = buildContainer({
    persistence: 'memory',
    hasher: new FakePasswordHasher(),
    tokens: new FakeTokenService(),
  });
  const { request, close } = await startApp(buildApp(container));
  try {
    await request('POST', '/auth/register', {
      body: { username: 'alice', password: 'secret123' },
    });
    const r = await request('POST', '/auth/login', {
      body: { username: 'alice', password: 'wrong' },
    });
    assert.equal(r.status, 401);
    assert.equal(r.body.code, 'INVALID_CREDENTIALS');
  } finally {
    await close();
  }
});

maybeTest('POST /auth/login правильно → 200 + token', async () => {
  const container = buildContainer({
    persistence: 'memory',
    hasher: new FakePasswordHasher(),
    tokens: new FakeTokenService(),
  });
  const { request, close } = await startApp(buildApp(container));
  try {
    await request('POST', '/auth/register', {
      body: { username: 'alice', password: 'secret123' },
    });
    const r = await request('POST', '/auth/login', {
      body: { username: 'alice', password: 'secret123' },
    });
    assert.equal(r.status, 200);
    assert.ok(typeof r.body.token === 'string');
  } finally {
    await close();
  }
});
