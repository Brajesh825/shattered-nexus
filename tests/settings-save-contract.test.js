const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { test } = require('./test-harness.js');

const ROOT = path.resolve(__dirname, '..');

function makeStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    _dump() {
      return { ...store };
    }
  };
}

function loadSettings(initialStorage) {
  const localStorage = makeStorage(initialStorage);
  const sandbox = {
    console,
    localStorage,
    window: {},
    document: {
      addEventListener() {},
      getElementById() { return null; }
    },
    navigator: {}
  };
  vm.createContext(sandbox);
  const src = fs.readFileSync(path.join(ROOT, 'js', 'systems', 'settings-manager.js'), 'utf8');
  vm.runInContext(`${src}\nglobalThis.__Settings = Settings;`, sandbox, { filename: 'settings-manager.js' });
  return { Settings: sandbox.__Settings, localStorage };
}

function loadSave(initialStorage) {
  const localStorage = makeStorage(initialStorage);
  const sandbox = {
    console,
    localStorage,
    ReleaseConfig: { SAVE_VERSION: 'test', IS_DEV: false },
    CHARACTERS_DATA: [{ id: 'aya' }, { id: 'lulu' }],
    MAP_DEFS: { verdant_vale: { width: 20, height: 20 } },
    document: {
      getElementById() { return null; },
      createElement() { return { className: '', textContent: '', classList: { add() {}, remove() {} } }; },
      body: { appendChild() {} }
    },
    setTimeout(fn) { fn(); return 0; },
    URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
    Blob: function Blob() {}
  };
  vm.createContext(sandbox);
  
  // Load SaveContract dependency first
  const contractSrc = fs.readFileSync(path.join(ROOT, 'js', 'systems', 'save-contract.js'), 'utf8');
  vm.runInContext(contractSrc, sandbox);
  
  const src = fs.readFileSync(path.join(ROOT, 'js', 'save.js'), 'utf8');
  vm.runInContext(`${src}\nglobalThis.__Save = Save;`, sandbox, { filename: 'save.js' });
  return { Save: sandbox.__Save, localStorage };
}

test('Settings migrates legacy spriteQuality to canonical quality', () => {
  const { Settings, localStorage } = loadSettings({ spriteQuality: 'normal' });

  Settings.init();

  assert.strictEqual(Settings.getQuality(), 'high');
  assert.strictEqual(Settings.hasQualityPreference(), true);
  assert.strictEqual(JSON.parse(localStorage.getItem('cc_settings_v1')).quality, 'high');
});

test('Settings migrates sn_graphics_quality before falling back to defaults', () => {
  const { Settings } = loadSettings({ sn_graphics_quality: 'low' });

  Settings.init();

  assert.strictEqual(Settings.getQuality(), 'low');
  assert.strictEqual(Settings.hasQualityPreference(), true);
});

test('Settings tracks no explicit quality preference on a fresh install', () => {
  const { Settings } = loadSettings();

  Settings.init();

  assert.strictEqual(Settings.getQuality(), 'auto');
  assert.strictEqual(Settings.hasQualityPreference(), false);
});

test('Save migrates legacy slot 0 save and preserves corrupt slot safety', () => {
  const legacy = JSON.stringify({ selectedChars: ['aya'], arcIdx: 0 });
  const { Save, localStorage } = loadSave({ cc_save_v1: legacy, cc_save_v2_s1: '{not-json' });

  const migrated = Save.read(0);
  const corrupt = Save.read(1);

  assert.strictEqual(JSON.stringify(migrated.selectedChars), JSON.stringify(['aya']));
  assert.strictEqual(localStorage.getItem('cc_save_v1'), null);
  assert.strictEqual(localStorage.getItem('cc_save_v2_s0'), legacy);
  assert.strictEqual(JSON.stringify(corrupt), JSON.stringify({ slot: 1, corrupt: true }));
});

test('Save.validateAndImport rejects invalid or malicious JSON', () => {
  const { Save, localStorage } = loadSave({ cc_save_v2_s0: 'original' });

  // Invalid structure
  const res1 = Save.validateAndImport('{"random":"data"}', 0);
  assert.strictEqual(res1, false);
  assert.strictEqual(localStorage.getItem('cc_save_v2_s0'), 'original');

  // Corrupt JSON
  const res2 = Save.validateAndImport('{{corrupt', 0);
  assert.strictEqual(res2, false);
  assert.strictEqual(localStorage.getItem('cc_save_v2_s0'), 'original');

  // Valid structure
  const res3 = Save.validateAndImport('{"arcIdx": 5, "selectedChars": ["aya"]}', 0);
  assert.strictEqual(res3, true);
  assert.notStrictEqual(localStorage.getItem('cc_save_v2_s0'), 'original');
});

test('Save.validateAndImport rejects impossible progression and map references', () => {
  const { Save, localStorage } = loadSave({ cc_save_v2_s0: 'original' });

  const invalidArc = Save.validateAndImport(JSON.stringify({ arcIdx: 99, selectedChars: ['aya'] }), 0);
  assert.strictEqual(invalidArc, false);
  assert.strictEqual(localStorage.getItem('cc_save_v2_s0'), 'original');

  const invalidChar = Save.validateAndImport(JSON.stringify({ arcIdx: 1, selectedChars: ['missing'] }), 0);
  assert.strictEqual(invalidChar, false);
  assert.strictEqual(localStorage.getItem('cc_save_v2_s0'), 'original');

  const invalidMap = Save.validateAndImport(JSON.stringify({ arcIdx: 1, selectedChars: ['aya'], mapId: 'missing_map' }), 0);
  assert.strictEqual(invalidMap, false);
  assert.strictEqual(localStorage.getItem('cc_save_v2_s0'), 'original');

  const invalidCoords = Save.validateAndImport(JSON.stringify({ arcIdx: 1, selectedChars: ['aya'], mapId: 'verdant_vale', mapX: 99, mapY: 0 }), 0);
  assert.strictEqual(invalidCoords, false);
  assert.strictEqual(localStorage.getItem('cc_save_v2_s0'), 'original');
});

test('Save preserves party HP/MP and KO state', () => {
  const partyStats = [
    { charId: 'aya', hp: 50, mp: 20, isKO: false },
    { charId: 'lulu', hp: 0, mp: 10, isKO: true }
  ];
  const state = { arcIdx: 1, selectedChars: ['aya', 'lulu'], partyStats };
  const { Save, localStorage } = loadSave();

  Save.write(state, 0);
  const loaded = Save.read(0);

  assert.strictEqual(loaded.partyStats[0].hp, 50);
  assert.strictEqual(loaded.partyStats[1].isKO, true);
  assert.strictEqual(loaded.partyStats[1].hp, 0);
});
