'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { PasswordHash, RawPassword } = require('../../../src/domain/user/PasswordHash');
const { ValidationError } = require('../../../src/domain/errors/DomainError');

test('RawPassword вимагає мінімальну довжину', () => {
  assert.throws(() => new RawPassword('short'), ValidationError);
  assert.doesNotThrow(() => new RawPassword('secret123'));
});

test('RawPassword не розкриває значення в JSON/toString', () => {
  const p = new RawPassword('topsecret');
  assert.equal(String(p), '[RawPassword]');
  assert.equal(JSON.stringify(p), '"[RawPassword]"');

  assert.equal(p.value, 'topsecret');
});

test('PasswordHash відмовляє у явно невалідному значенні', () => {
  assert.throws(() => new PasswordHash(''), ValidationError);
  assert.throws(() => new PasswordHash('short'), ValidationError);
  assert.throws(() => new PasswordHash(undefined), ValidationError);
});

test('PasswordHash приймає рядок, схожий на хеш', () => {
  const h = new PasswordHash('$2a$10$abcdefghijklmnopqrstuv');
  assert.equal(h.value, '$2a$10$abcdefghijklmnopqrstuv');
});

test('PasswordHash приховує значення в JSON', () => {
  const h = new PasswordHash('$2a$10$abcdefghijklmnopqrstuv');
  assert.equal(JSON.stringify(h), '"[PasswordHash]"');
});
