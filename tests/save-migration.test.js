const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { test } = require('./test-harness.js');

const ROOT = path.resolve(__dirname, '..');

function createSandbox() {
  const sandbox = {
    console,
    localStorage: {
      _data: {},
      setItem(k, v) { this._data[k] = String(v); },
      getItem(k) { return this._data[k] || null; },
      removeItem(k) { delete this._data[k]; }
    },
    document: {
      createElement(tag) {
        return { 
          tagName: tag.toUpperCase(),
          style: {},
          classList: { add: () => {}, remove: () => {} },
          appendChild: () => {},
          click: () => {}
        };
      },
      getElementById: () => null
    },
    window: {},
    addEventListener: () => {},
    URL: { createObjectURL: () => '', revokeObjectURL: () => '' },
    Blob: function() {},
    FileReader: function() {
      this.readAsText = (file) => {
        setTimeout(() => {
          this.onload({ target: { result: file._content } });
        }, 10);
      };
    },
    alert: (msg) => { console.log('ALERT:', msg); }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);

  // Load utilities first
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'utils.js'), 'utf8'), sandbox);
  // Load Game for migrateCharId
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'game.js'), 'utf8'), sandbox);
  // Load SaveContract dependency
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'systems', 'save-contract.js'), 'utf8'), sandbox);
  // Load Save System
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'save.js'), 'utf8'), sandbox);

  return sandbox;
}

test('escapeHtml handles malicious input', () => {
  const { escapeHtml } = createSandbox();
  
  assert.strictEqual(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.strictEqual(escapeHtml('A & B'), 'A &amp; B');
  assert.strictEqual(escapeHtml('"quoted"'), '&quot;quoted&quot;');
  assert.strictEqual(escapeHtml("'single'"), '&#039;single&#039;');
  assert.strictEqual(escapeHtml(null), '');
  assert.strictEqual(escapeHtml(undefined), '');
  assert.strictEqual(escapeHtml(123), '123');
});

test('Save.read migrates legacy character IDs', () => {
  const sb = createSandbox();
  const { Save, localStorage } = sb;

  const legacyData = JSON.parse(JSON.stringify({
    arcIdx: 0,
    selectedChar: 'Ayaka',
    selectedChars: ['Ayaka', 'Hutao', 'Nilou', 'Xiao'],
    partyStats: [
      { charId: 'Ayaka', lv: 10 },
      { charId: 'Hutao', lv: 10 }
    ]
  }));

  localStorage.setItem('cc_save_v2_s0', JSON.stringify(legacyData));

  const migrated = Save.read(0);
  assert.strictEqual(migrated.selectedChar, 'aya');
  assert.strictEqual(migrated.selectedChars[0], 'aya');
  assert.strictEqual(migrated.selectedChars[1], 'tao');
  assert.strictEqual(migrated.selectedChars[2], 'lulu');
  assert.strictEqual(migrated.selectedChars[3], 'rei');
  assert.strictEqual(migrated.partyStats[0].charId, 'aya');
});

test('Save.validateAndImport blocks invalid saves', () => {
  const sb = createSandbox();
  const { Save, localStorage } = sb;

  // Invalid JSON
  const result1 = Save.validateAndImport('not-json', 1);
  assert.strictEqual(result1, false);

  // Missing mandatory fields (arcIdx)
  const result2 = Save.validateAndImport(JSON.stringify({ some: 'data' }), 1);
  assert.strictEqual(result2, false);

  // Valid save
  const result3 = Save.validateAndImport(JSON.stringify({ arcIdx: 1, selectedChars: [] }), 1);
  assert.strictEqual(result3, true);
  assert.ok(localStorage.getItem('cc_save_v2_s1'));
});
