'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..', 'src');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && p.endsWith('.js')) out.push(p);
  }
  return out;
}

function moduleOf(file) {
  const rel = path.relative(ROOT, file);
  const parts = rel.split(path.sep);
  if (parts[0] === 'modules') return parts[1];
  return null;
}

test('Modular monolith: жодний модуль не імпортує внутрішні класи іншого', () => {
  const files = walk(ROOT);
  const violations = [];
  for (const file of files) {
    const mod = moduleOf(file);
    if (!mod) continue;
    const src = fs.readFileSync(file, 'utf8');
    const matches = src.match(/require\(['"][^'"]+['"]\)/g) || [];
    for (const m of matches) {
      const importedPath = m.match(/require\(['"]([^'"]+)['"]\)/)[1];
      if (!importedPath.startsWith('.')) continue;
      const absImported = path.normalize(path.join(path.dirname(file), importedPath));
      const targetMod = moduleOf(absImported);
      if (targetMod && targetMod !== mod) {
        violations.push(`${path.relative(ROOT, file)} → modules/${targetMod}/`);
      }
    }
  }
  assert.deepEqual(violations, [], `Cross-module imports found: ${violations.join(', ')}`);
});

test('Composition root — єдиний, хто знає про всі модулі', () => {
  const root = fs.readFileSync(path.join(ROOT, 'composition_root.js'), 'utf8');
  assert.ok(/modules\/core\/module/.test(root));
  assert.ok(/modules\/audit\/module/.test(root));
  assert.ok(/modules\/analytics\/module/.test(root));
});

test('Core domain не імпортує нічого ззовні (правило з lab 2)', () => {
  const coreDomain = path.join(ROOT, 'modules', 'core', 'domain');
  const files = walk(coreDomain);
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const matches = src.match(/require\(['"]([^'"]+)['"]\)/g) || [];
    for (const m of matches) {
      const imp = m.match(/require\(['"]([^'"]+)['"]\)/)[1];
      assert.ok(imp.startsWith('.'), `${file} imports external "${imp}"`);
    }
  }
});

test('Analytics має власний домен (не імпортує Core domain)', () => {
  const analyticsDir = path.join(ROOT, 'modules', 'analytics');
  const files = walk(analyticsDir);
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    assert.equal(src.includes('core/domain'), false, `${file} imports core/domain`);
  }
});
