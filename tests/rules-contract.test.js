const assert = require('node:assert/strict');
const fs = require('node:fs');
const { test } = require('./test-harness.js');

global.NexusScaling = require('../js/scaling-config.js');
NexusScaling = global.NexusScaling;

const EnemyScaling = require('../js/battle/enemy-scaling.js');
const FormationRules = require('../js/battle/formation-rules.js');
const SaveContract = require('../js/systems/save-contract.js');

test('EnemyScaling uses the AGENTS stat formula without horde stat reduction', () => {
  const def = {
    id: 'void_knight',
    name: 'Void Knight',
    tier: 3,
    isBoss: true,
    stats: { hp: 240, atk: 32, def: 22, spd: 12, mag: 26 },
    reward: { exp: 240, gold: 150 },
    abilities: []
  };

  const entrySolo = EnemyScaling.buildEnemyEntry(def, 5, true, 1, NexusScaling);
  const entryHorde = EnemyScaling.buildEnemyEntry(def, 5, true, 4, NexusScaling);

  assert.equal(entrySolo.hp, Math.floor(((240 * 1.3) + (4 * 22)) * 4.5));
  assert.equal(entrySolo.atk, Math.floor(((32 * 1.3) + (4 * 3.0)) * 1.3));
  assert.equal(entrySolo.def, Math.floor(((22 * 1.3) + (4 * 2.0)) * 1.3));
  assert.equal(entrySolo.mag, Math.floor(((26 * 1.3) + (4 * 0.6)) * 1.3));

  assert.equal(entryHorde.hp, entrySolo.hp);
  assert.equal(entryHorde.atk, entrySolo.atk);
  assert.ok(entryHorde.exp < entrySolo.exp);
});

test('FormationRules applies rearguard evasion only to physical attacks on slot 1', () => {
  assert.equal(FormationRules.getRearguardEvasionBonus(1, false, NexusScaling), 0.3);
  assert.equal(FormationRules.getRearguardEvasionBonus(1, true, NexusScaling), 0);
  assert.equal(FormationRules.getRearguardEvasionBonus(2, false, NexusScaling), 0);
});

test('FormationRules redirects single-target physical attacks to the vanguard', () => {
  const flank = { id: 'flank' };
  const back = { id: 'back' };
  const vanguard = { id: 'tank' };
  const other = { id: 'other' };
  const party = [flank, back, vanguard, other];

  let result = FormationRules.resolveVanguardInterception(
    party,
    back,
    1,
    { type: 'physical' },
    unit => unit === vanguard
  );
  assert.equal(result.intercepted, true);
  assert.equal(result.target, vanguard);
  assert.equal(result.targetIdx, 2);

  result = FormationRules.resolveVanguardInterception(
    party,
    back,
    1,
    { type: 'magic_damage' },
    () => true
  );
  assert.equal(result.intercepted, false);
  assert.equal(result.target, back);

  result = FormationRules.resolveVanguardInterception(
    party,
    back,
    1,
    { type: 'physical' },
    () => false
  );
  assert.equal(result.intercepted, false);
  assert.equal(result.target, back);
});

test('SaveContract free-explore payload includes hp, mp, and isKO for each member', () => {
  const state = SaveContract.buildFreeExploreSaveState({
    selectedChars: ['hero', 'mage'],
    party: [
      { charId: 'hero', classId: 'knight', lv: 7, exp: 42, gold: 15, hp: 91, mp: 11, isKO: false },
      { charId: 'mage', classId: 'mage', lv: 6, exp: 12, gold: 8, hp: 0, mp: 4, isKO: true }
    ],
    hero: { lv: 7, exp: 42, gold: 15 },
    unlockedChars: ['hero', 'mage'],
    inventory: [{ id: 'potion', qty: 2 }]
  });

  assert.deepEqual(state.partyStats[0], {
    charId: 'hero',
    classId: 'knight',
    lv: 7,
    exp: 42,
    gold: 15,
    hp: 91,
    mp: 11,
    isKO: false
  });
  assert.equal(state.partyStats[1].hp, 0);
  assert.equal(state.partyStats[1].mp, 4);
  assert.equal(state.partyStats[1].isKO, true);
});

test('SaveContract free-explore payload preserves weaponsLevels, weaponsUpgrades, and voidFragments', () => {
  const state = SaveContract.buildFreeExploreSaveState({
    selectedChars: ['aya'],
    party: [
      { charId: 'aya', char: { equippedWeapon: 'winters_last_petal' } }
    ],
    weaponsLevels: { winters_last_petal: 12 },
    weaponsUpgrades: { winters_last_petal: 'epic' },
    voidFragments: 4
  });

  assert.deepEqual(state.weaponsLevels, { winters_last_petal: 12 });
  assert.deepEqual(state.weaponsUpgrades, { winters_last_petal: 'epic' });
  assert.equal(state.voidFragments, 4);
});

test('Production code is wired to the shared scaling and save-contract helpers', () => {
  const gameSource = fs.readFileSync('./js/game.js', 'utf8');
  const mapUiSource = fs.readFileSync('./js/map/map-ui.js', 'utf8');

  assert.match(gameSource, /EnemyScaling\.buildEnemyEntry/);
  assert.match(mapUiSource, /SaveContract\.buildFreeExploreSaveState/);
});
