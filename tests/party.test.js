const assert = require('node:assert/strict');
const { test } = require('./test-harness.js');

global.NexusScaling = require('../js/scaling-config.js');
NexusScaling = global.NexusScaling;

const Party = require('../js/systems/party.js');

function createBaseStats(overrides = {}) {
  return {
    hp: 100,
    mp: 50,
    atk: 10,
    def: 8,
    spd: 6,
    mag: 4,
    lck: 3,
    mdef: 5,
    ...overrides
  };
}

function createClass(overrides = {}) {
  return {
    id: 'knight',
    role: 'Knight',
    abilities: [],
    growthPerLevel: { hp: 10, mp: 5, atk: 2, def: 1, spd: 1, mag: 0, lck: 0, mdef: 1 },
    stat_multipliers: {
      hp: 1.0,
      mp: 1.0,
      atk: 1.0,
      def: 1.0,
      spd: 1.0,
      mag: 1.0,
      lck: 1.0,
      mdef: 1.0,
      accuracy: 0.95,
      critRate: 0.05
    },
    ...overrides
  };
}

function installRuntime({ mastery = { atk: 0, def: 0, mag: 0, spd: 0, lck: 0 }, relics = [], activeRelics = [] } = {}) {
  global.Archive = { getMasteryBuffs: () => mastery };
  global.G = {
    selectedChars: ['hero'],
    selectedChar: 'hero',
    chars: [],
    classes: [],
    relics,
    activeRelics
  };
}

test('computeStats follows the AGENTS formula', () => {
  const ch = {
    base_stats: createBaseStats({ hp: 120, atk: 14, spd: 7, mdef: 6 }),
    stat_bonuses: { hp: 5, atk: 2, spd: 1, mdef: 1 },
    lv: 4
  };
  const cls = createClass({
    growthPerLevel: { hp: 12, mp: 4, atk: 3, def: 2, spd: 1, mag: 1, lck: 0, mdef: 1 },
    stat_multipliers: {
      hp: 1.2,
      mp: 1.1,
      atk: 1.5,
      def: 1.0,
      spd: 1.1,
      mag: 1.0,
      lck: 1.0,
      mdef: 1.2,
      accuracy: 0.95,
      critRate: 0.05
    }
  });

  const stats = Party.computeStats(ch, cls);

  assert.equal(stats.hp, Math.floor((120 + (4 - 1) * 12 + 5) * 1.2));
  assert.equal(stats.atk, Math.floor((14 + (4 - 1) * 3 + 2) * 1.5));
  assert.equal(stats.spd, Math.floor((7 + (4 - 1) * 1 + 1) * 1.1));
  assert.equal(stats.mdef, Math.floor((6 + (4 - 1) * 1 + 1) * 1.2));
});

test('buildParty applies relic multipliers before Archive mastery and does not stack across rebuilds', () => {
  installRuntime({
    mastery: { atk: 3, def: 0, mag: 0, spd: 0, lck: 0 },
    relics: [{ id: 'fang', bonus: { atk: 0.2, hp: 0.1 } }],
    activeRelics: ['fang']
  });

  const hero = {
    id: 'hero',
    name: 'Hero',
    alias: 'Hero',
    class_affinity: ['knight'],
    base_stats: createBaseStats({ atk: 20, hp: 120 }),
    stat_bonuses: {},
    lv: 1,
    exp: 0,
    gold: 0,
    hp: 120,
    mp: 50
  };
  const cls = createClass();
  G.chars = [hero];
  G.classes = [cls];

  Party.buildParty();
  const firstAtk = G.party[0].atk;
  const firstHp = G.party[0].maxHp;

  assert.equal(firstAtk, Math.floor(20 * 1.2) + 3);
  assert.equal(firstHp, Math.floor(120 * 1.1));

  Party.buildParty();

  assert.equal(G.party[0].atk, firstAtk);
  assert.equal(G.party[0].maxHp, firstHp);
});

test('checkMemberLevel preserves relic and Archive bonuses after recomputing stats', () => {
  installRuntime({
    mastery: { atk: 4, def: 2, mag: 0, spd: 1, lck: 0 },
    relics: [{ id: 'crest', bonus: { hp: 0.2, mp: 0.5, atk: 0.5, def: 0.25, mdef: 0.3 } }],
    activeRelics: ['crest']
  });

  const hero = {
    id: 'hero',
    name: 'Hero',
    alias: 'Hero',
    class_affinity: ['knight'],
    base_stats: createBaseStats({ hp: 100, mp: 40, atk: 10, def: 8, spd: 6, mdef: 5 }),
    stat_bonuses: {},
    lv: 1,
    exp: 0,
    gold: 0,
    hp: 100,
    mp: 40
  };
  const cls = createClass({
    growthPerLevel: { hp: 20, mp: 10, atk: 4, def: 2, spd: 1, mag: 0, lck: 0, mdef: 1 }
  });

  G.chars = [hero];
  G.classes = [cls];

  Party.buildParty();
  const member = G.party[0];
  member.hp = 60;
  member.mp = 20;
  member.exp = Party.getExpThreshold(member.lv);

  const oldMaxHp = member.maxHp;
  const oldMaxMp = member.maxMp;
  const leveled = Party.checkMemberLevel(member);

  assert.equal(leveled, true);
  assert.equal(member.lv, 2);
  assert.equal(member.exp, 0);

  const expectedBaseHp = 100 + 20;
  const expectedBaseMp = 40 + 10;
  const expectedBaseAtk = 10 + 4;
  const expectedBaseDef = 8 + 2;
  const expectedBaseSpd = 6 + 1;

  const expectedMaxHp = Math.floor(expectedBaseHp * 1.2);
  const expectedMaxMp = Math.floor(expectedBaseMp * 1.5);
  const expectedAtk = Math.floor(expectedBaseAtk * 1.5) + 4;
  const expectedDef = Math.floor(expectedBaseDef * 1.25) + 2;
  const expectedSpd = expectedBaseSpd + 1;
  const expectedMdef = Math.floor((5 + 1) * 1.3); // (base 5 + growth 1) * relic 1.3

  assert.equal(member.maxHp, expectedMaxHp);
  assert.equal(member.maxMp, expectedMaxMp);
  assert.equal(member.atk, expectedAtk);
  assert.equal(member.def, expectedDef);
  assert.equal(member.spd, expectedSpd);
  assert.equal(member.mdef, expectedMdef);
  assert.equal(member.hp, Math.min(60 + (expectedMaxHp - oldMaxHp), expectedMaxHp));
  assert.equal(member.mp, Math.min(20 + (expectedMaxMp - oldMaxMp), expectedMaxMp));
});
