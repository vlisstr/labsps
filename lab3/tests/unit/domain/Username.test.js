'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Username } = require('../../../src/domain/user/Username');
const { ValidationError } = require('../../../src/domain/errors/DomainError');

test('Username нормалізує регістр і обрізає пробіли', () => {
  const u = new Username('  Alice  ');
  assert.equal(u.value, 'alice');
});

test('Username приймає валідні значення', () => {
  for (const v of ['bob', 'a.b_c', 'user_42', 'X.Y_Z']) {
    assert.doesNotThrow(() => new Username(v));
  }
});

test('Username відмовляє у некоректних значеннях', () => {
  for (const v of ['', 'a', 'ab', 'spaced name', 'кирилиця', 'no-dashes-allowed', 'x'.repeat(33)]) {
    assert.throws(() => new Username(v), ValidationError);
  }
});

test('Username незмінний (frozen)', () => {
  const u = new Username('alice');
  assert.throws(() => {
    u._value = 'eve';
  });
});

test('Username рівність — за значенням', () => {
  assert.ok(new Username('alice').equals(new Username('ALICE')));
  assert.ok(!new Username('alice').equals(new Username('bob')));
  assert.ok(!new Username('alice').equals('alice'));
});
