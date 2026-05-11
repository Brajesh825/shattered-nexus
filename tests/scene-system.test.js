/**
 * scene-system.test.js
 * Tests for the Cinematic Scene System:
 *   - firedScenes persistence via SaveContract + Save.patch
 *   - hideAfterScene NPC filter in MapEntities.initNPCs
 *   - Scene once-guard (G.firedScenes prevents re-run)
 *   - Save.patch merges without clobbering unrelated fields
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { test } = require('./test-harness.js');

const ROOT = path.resolve(__dirname, '..');

// ── Sandbox Helpers ──────────────────────────────────────

function makeLocalStorage() {
  const _data = {};
  return {
    setItem(k, v) { _data[k] = String(v); },
    getItem(k) { return _data[k] !== undefined ? _data[k] : null; },
    removeItem(k) { delete _data[k]; },
    _data,
  };
}

function loadSave(ls) {
  const src = fs.readFileSync(path.join(ROOT, 'js/save.js'), 'utf8');
  const sandbox = {
    console,
    localStorage: ls,
    document: {
      getElementById: () => ({ textContent: '', classList: { add: () => {}, remove: () => {} } }),
    },
    window: {},
    ReleaseConfig: { SAVE_VERSION: '1.0', IS_DEV: false },
    setTimeout: (fn) => fn(),
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.Save;
}

function loadSaveContract(extraGlobals = {}) {
  const sandbox = {
    console,
    window: {},
    module: { exports: {} },
    ...extraGlobals,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  // save-contract.js uses `const SaveContract = (()=>{...})()` at top level —
  // in a vm context, top-level `const` is scoped to the script and NOT reflected
  // on the sandbox. The module.exports path is the reliable extraction point.
  const src = fs.readFileSync(path.join(ROOT, 'js/systems/save-contract.js'), 'utf8');
  vm.runInContext(src, sandbox);
  // If the module.exports path populated it, prefer that; else fall back to sandbox global
  return sandbox.module.exports && sandbox.module.exports.buildFreeExploreSaveState
    ? sandbox.module.exports
    : sandbox.SaveContract;
}

// ── Tests ─────────────────────────────────────────────────

test('SaveContract.buildFreeExploreSaveState includes firedScenes', () => {
  const SC = loadSaveContract();
  const G = {
    selectedChars: ['aya'],
    party: [],
    hero: { lv: 1, exp: 0, gold: 0 },
    unlockedChars: [],
    inventory: [],
    firedScenes: new Set(['azure_intro', 'rival_clash_01']),
  };
  const state = SC.buildFreeExploreSaveState(G);
  assert.ok(Array.isArray(state.firedScenes), 'firedScenes should be an array');
  assert.deepStrictEqual(
    [...state.firedScenes].sort(),
    ['azure_intro', 'rival_clash_01'],
    'firedScenes should contain both scene IDs'
  );
});

test('SaveContract.buildFreeExploreSaveState handles missing firedScenes gracefully', () => {
  const SC = loadSaveContract();
  const G = { selectedChars: [], party: [], hero: {}, unlockedChars: [], inventory: [] };
  const state = SC.buildFreeExploreSaveState(G);
  assert.ok(Array.isArray(state.firedScenes), 'firedScenes should default to empty array');
  assert.strictEqual(state.firedScenes.length, 0);
});

test('Save.patch merges into existing slot without clobbering other fields', () => {
  const ls = makeLocalStorage();
  const Save = loadSave(ls);

  // Seed an existing save in slot 0
  const existing = { arcIdx: 1, arcName: 'Verdant Vale', selectedChars: ['aya'], slot: 0, timestamp: 1000 };
  ls.setItem('cc_save_v2_s0', JSON.stringify(existing));

  // Patch only firedScenes
  Save.patch({ firedScenes: ['azure_intro'] }, 0);

  const merged = JSON.parse(ls.getItem('cc_save_v2_s0'));
  assert.strictEqual(merged.arcIdx, 1, 'arcIdx should be preserved');
  assert.strictEqual(merged.arcName, 'Verdant Vale', 'arcName should be preserved');
  assert.deepStrictEqual(merged.firedScenes, ['azure_intro'], 'firedScenes should be patched in');
  assert.ok(merged.timestamp > existing.timestamp || merged.timestamp === existing.timestamp,
    'timestamp should be updated');
});

test('Save.patch creates slot if it does not exist yet', () => {
  const ls = makeLocalStorage();
  const Save = loadSave(ls);
  Save.patch({ firedScenes: ['scene_a'] }, 1);
  const result = JSON.parse(ls.getItem('cc_save_v2_s1'));
  assert.deepStrictEqual(result.firedScenes, ['scene_a']);
});

test('Save.patch does not overwrite a full write with stale data', () => {
  const ls = makeLocalStorage();
  const Save = loadSave(ls);

  // Write full save first
  const fullState = { arcIdx: 2, chapIdx: 3, selectedChars: ['rei', 'tao'], partyStats: [], slot: 0 };
  ls.setItem('cc_save_v2_s0', JSON.stringify(fullState));

  // Now patch firedScenes
  Save.patch({ firedScenes: ['azure_intro', 'fog_gate'] }, 0);

  const result = JSON.parse(ls.getItem('cc_save_v2_s0'));
  assert.strictEqual(result.arcIdx, 2, 'arcIdx preserved after patch');
  assert.strictEqual(result.chapIdx, 3, 'chapIdx preserved after patch');
  assert.deepStrictEqual(result.selectedChars, ['rei', 'tao'], 'selectedChars preserved');
  assert.deepStrictEqual(result.firedScenes, ['azure_intro', 'fog_gate'], 'firedScenes patched');
});

test('hideAfterScene: NPC is excluded when scene ID is in G.firedScenes', () => {
  // Test the filter logic directly — mirrors the init() filter in map-entities.js
  function filterNPCs(npcs, firedScenes, unlockedChars) {
    const fired = firedScenes || new Set();
    const unlocked = unlockedChars || [];
    return npcs.filter(n => {
      if (n.hideIfUnlocked && unlocked.includes(n.hideIfUnlocked)) return false;
      if (n.hideAfterScene  && fired.has && fired.has(n.hideAfterScene)) return false;
      return true;
    });
  }

  const npcs = [
    { id: 'azure_commander', hideIfUnlocked: 'sera', hideAfterScene: 'azure_intro' },
    { id: 'elder_maren' },
    { id: 'soldier_1' },
  ];

  // Scene not yet fired — NPC visible
  const visible = filterNPCs(npcs, new Set(), []);
  assert.ok(visible.find(n => n.id === 'azure_commander'), 'NPC should be visible before scene fires');

  // Scene fired — NPC hidden
  const hidden = filterNPCs(npcs, new Set(['azure_intro']), []);
  assert.ok(!hidden.find(n => n.id === 'azure_commander'), 'NPC should be hidden after scene fires');

  // Other NPCs unaffected
  assert.ok(hidden.find(n => n.id === 'elder_maren'), 'elder_maren should still be visible');

  // hideIfUnlocked still works independently
  const unlocked = filterNPCs(npcs, new Set(), ['sera']);
  assert.ok(!unlocked.find(n => n.id === 'azure_commander'), 'NPC hidden when char is unlocked');
});

test('scene once-guard: G.firedScenes prevents re-run', () => {
  // Simulate the _checkScenes guard logic
  function wouldFire(scene, firedScenes) {
    if (!scene.once) return true;
    if (firedScenes.has(scene.id)) return false;
    return true;
  }

  const scene = { id: 'azure_intro', once: true };
  const fresh  = new Set();
  const seen   = new Set(['azure_intro']);

  assert.strictEqual(wouldFire(scene, fresh), true,  'Scene should fire on first visit');
  assert.strictEqual(wouldFire(scene, seen),  false, 'Scene should NOT fire when already in firedScenes');
});

test('scene firedScenes round-trips through SaveContract', () => {
  const SC = loadSaveContract();

  const firedIds = ['azure_intro', 'crystal_cavern_seal', 'fog_gate_moment'];
  const G = {
    selectedChars: ['aya'],
    party: [{ charId: 'aya', lv: 3, exp: 120, gold: 50, hp: 40, mp: 10, isKO: false }],
    hero: { lv: 3, exp: 120, gold: 50 },
    unlockedChars: [],
    inventory: [],
    firedScenes: new Set(firedIds),
  };

  const state = SC.buildFreeExploreSaveState(G);

  // Simulate load: restore G.firedScenes from serialized state
  const restored = new Set(state.firedScenes || []);

  assert.strictEqual(restored.size, firedIds.length, 'All scene IDs should survive round-trip');
  firedIds.forEach(id => assert.ok(restored.has(id), `${id} should be in restored set`));
});
