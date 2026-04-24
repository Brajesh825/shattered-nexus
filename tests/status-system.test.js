const assert = require('node:assert/strict');
const { test } = require('./test-harness.js');

global.NexusScaling = require('../js/scaling-config.js');
NexusScaling = global.NexusScaling;

// Robust Mocks
global.Battle = { 
  elemMult: () => 1.0,
  alive: () => true,
  setKO: (unit) => { unit.isKO = true; }
};

// Use real PassiveSystem but ensure it exists
try {
  global.PassiveSystem = require('../js/battle/passive-system.js');
} catch (e) {
  global.PassiveSystem = {
    val: (unit, key, fallback) => unit.passives?.[key] ?? fallback,
    getStatMultiplier: () => 1.0,
    getStatBonus: () => 0
  };
}

global.window = { LogDebug: () => {} };

// Ensure G has the expected arrays
function resetG() {
  global.G = { 
    party: [], 
    enemyGroup: [],
    selectedChars: [],
    chars: [],
    classes: []
  };
}
resetG();

const StatusSystem = require('../js/battle/status-system.js');

test('applyAura enforces the one-aura rule', () => {
  const target = {
    name: 'Slime',
    statuses: [{ id: 'aura_fire', label: 'Fire Aura', type: 'aura', turns: 2 }]
  };

  StatusSystem.applyAura(target, 'water');

  assert.equal(target.statuses.length, 1);
  assert.equal(target.statuses[0].id, 'aura_water');
});

test('triggerReaction resolves core AGENTS reactions and consumes the aura', () => {
  const shatterTarget = { statuses: [{ id: 'aura_ice', turns: 2 }], weakTo: [], resistTo: [] };
  const shatter = StatusSystem.triggerReaction(shatterTarget, 'physical');
  assert.equal(shatter.id, 'shatter');
  assert.equal(shatter.debuff, 'def');
  assert.equal(shatter.dmgMult, NexusScaling.reactions.shatter);
  assert.equal(shatterTarget.statuses.length, 0);

  const meltTarget = { statuses: [{ id: 'aura_ice', turns: 2 }], weakTo: [], resistTo: [] };
  const melt = StatusSystem.triggerReaction(meltTarget, 'fire');
  assert.equal(melt.id, 'melt');
  assert.equal(melt.dmgMult, NexusScaling.reactions.melt_fire_on_ice);

  const vaporizeTarget = { statuses: [{ id: 'aura_fire', turns: 2 }], weakTo: [], resistTo: [] };
  const vaporize = StatusSystem.triggerReaction(vaporizeTarget, 'water');
  assert.equal(vaporize.id, 'vaporize');
  assert.equal(vaporize.dmgMult, NexusScaling.reactions.vaporize_water_on_fire);

  const conductiveTarget = { statuses: [{ id: 'aura_water', turns: 2 }], weakTo: [], resistTo: [] };
  const conductive = StatusSystem.triggerReaction(conductiveTarget, 'lightning');
  assert.equal(conductive.id, 'conductive');
  assert.equal(conductive.stun, true);
  assert.equal(conductive.dmgMult, NexusScaling.reactions.conductive);

  const swirlTarget = { statuses: [{ id: 'aura_fire', turns: 2 }], weakTo: [], resistTo: [] };
  const swirl = StatusSystem.triggerReaction(swirlTarget, 'wind');
  assert.equal(swirl.id, 'swirl');
  assert.equal(swirl.swirlAura, 'fire');
  assert.equal(swirl.dmgMult, NexusScaling.reactions.swirl);
});

test('triggerReaction applies affinity bonus when the detonator hits weakness', () => {
  const target = {
    statuses: [{ id: 'aura_water', turns: 2 }],
    weakTo: ['fire'],
    resistTo: []
  };

  const oldElemMult = global.Battle.elemMult;
  global.Battle.elemMult = () => 1.5;
  const reaction = StatusSystem.triggerReaction(target, 'fire');

  assert.equal(reaction.id, 'vaporize');
  assert.equal(
    reaction.dmgMult,
    NexusScaling.reactions.vaporize_fire_on_water * NexusScaling.reactions.affinityBonus
  );
  global.Battle.elemMult = oldElemMult;
});

test('tick decrements turns and removes expired statuses', () => {
  resetG();
  const unit = {
    hp: 100,
    statuses: [
      { id: 's1', turns: 2 },
      { id: 's2', turns: 1 }
    ]
  };

  StatusSystem.tick(unit, true); // isEnemy=true

  assert.equal(unit.statuses.length, 1);
  assert.equal(unit.statuses[0].id, 's1');
  assert.equal(unit.statuses[0].turns, 1);
});

test('tick applies Regen status healing', () => {
  resetG();
  const unit = {
    hp: 50,
    maxHp: 100,
    statuses: [{ id: 'status_regen', type: 'regen', turns: 3 }]
  };
  G.enemyGroup.push(unit);

  StatusSystem.tick(unit, true);

  const expectedHeal = Math.floor(100 * NexusScaling.status.regenHP);
  assert.equal(unit.hp, 50 + expectedHeal);
});

test('tick applies DOT (Burn) and handles KO', () => {
  resetG();
  const unit = {
    hp: 5,
    statuses: [{ id: 'status_burn', type: 'dot', value: 10, turns: 3 }]
  };
  G.enemyGroup.push(unit);

  StatusSystem.tick(unit, true);

  assert.equal(unit.hp, 0);
  assert.equal(unit.isKO, true);
});

test('tick applies percentage DOT (Poison)', () => {
  resetG();
  const unit = {
    hp: 100,
    maxHp: 100,
    statuses: [{ id: 'status_poison', type: 'dot_percent', turns: 3 }]
  };
  G.enemyGroup.push(unit);

  StatusSystem.tick(unit, true);

  const expectedDmg = Math.floor(100 * NexusScaling.status.poisonHP);
  assert.equal(unit.hp, 100 - expectedDmg);
});

test('tick maintains Player MP and passive regen', () => {
  resetG();
  const unit = {
    hp: 80,
    maxHp: 100,
    mp: 10,
    maxMp: 50,
    _mpRegenBonus: 0.1, // 10% bonus
    passive: {
      traits: [{ type: 'HP_REGEN_FLAT', value: 5 }]
    }
  };
  G.party.push(unit);

  StatusSystem.tick(unit, false); // isEnemy = false

  // MP: 3 + floor(0.1 * 50) = 3 + 5 = 8
  assert.equal(unit.mp, 18);
  // HP: 80 + 5 (flat regen) = 85
  assert.equal(unit.hp, 85);
});

test('add refreshes duration and strength', () => {
  const unit = {
    statuses: [{ id: 'status_atk_boost', turns: 1, value: 1.1, type: 'mult' }]
  };

  // Add same status with higher values
  StatusSystem.add(unit, { id: 'status_atk_boost', turns: 5, value: 1.3, type: 'mult' });

  assert.equal(unit.statuses.length, 1);
  assert.equal(unit.statuses[0].turns, 5);
  assert.equal(unit.statuses[0].value, 1.3);

  // Add with lower values (should keep higher)
  StatusSystem.add(unit, { id: 'status_atk_boost', turns: 2, value: 1.2, type: 'mult' });
  assert.equal(unit.statuses[0].turns, 5);
  assert.equal(unit.statuses[0].value, 1.3);
});

test('remove and has helpers work correctly', () => {
  const unit = { statuses: [{ id: 'test_effect' }] };

  assert.strictEqual(StatusSystem.has(unit, 'test_effect'), true);
  assert.strictEqual(StatusSystem.has(unit, 'missing'), false);

  StatusSystem.remove(unit, 'test_effect');
  assert.strictEqual(StatusSystem.has(unit, 'test_effect'), false);
});

test('applyAura duration scales with elemental resistance', () => {
  const unit = { name: 'Resistant Unit', statuses: [] };

  // Mock resistance (mult < 1.0)
  const oldElemMult = global.Battle.elemMult;
  global.Battle.elemMult = (elem) => elem === 'fire' ? 0.5 : 1.0;

  StatusSystem.applyAura(unit, 'fire');
  assert.equal(unit.statuses[0].turns, 1);

  StatusSystem.applyAura(unit, 'ice'); // Normal
  
  // applyAura removes existing auras. So statuses.length should be 1.
  assert.equal(unit.statuses.length, 1);
  assert.equal(unit.statuses[0].id, 'aura_ice');
  assert.equal(unit.statuses[0].turns, 2);

  global.Battle.elemMult = oldElemMult;
});



test('tick decrements cooldowns', () => {
  resetG();
  const unit = {
    hp: 100,
    cooldowns: { 'fireball': 2, 'heal': 0 }
  };

  StatusSystem.tick(unit, true);

  assert.equal(unit.cooldowns['fireball'], 1);
  assert.equal(unit.cooldowns['heal'], 0);
});
