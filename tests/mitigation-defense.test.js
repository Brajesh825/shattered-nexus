const assert = require('node:assert/strict');
const { test } = require('./test-harness.js');

// Cooperation with other tests: only load if not already globally available
if (!global.NexusScaling) global.NexusScaling = require('../js/scaling-config.js');
const CombatEngine = require('../js/battle/combat-engine.js');
if (!global.CombatEngine) global.CombatEngine = CombatEngine;

// Ensure Battle and PassiveSystem are complete but don't blow away existing mocks from previous files
global.Battle = global.Battle || {};
const battleOverrides = { 
  getStat: (u, s) => CombatEngine.getStat(u, s),
  physDmg: (a, d, m, o) => CombatEngine.physDmg(a, d, m, o),
  magicDmg: (a, d, m, o) => CombatEngine.magicDmg(a, d, m, o),
  alive: global.Battle.alive || ((u) => u && u.hp > 0),
  elemMult: global.Battle.elemMult || ((e, t) => CombatEngine.elemMult(e, t)),
  rollHit: global.Battle.rollHit || ((a, d) => CombatEngine.rollHit(a, d)),
  rollCrit: global.Battle.rollCrit || ((a) => CombatEngine.rollCrit(a))
};
Object.assign(global.Battle, battleOverrides);

if (!global.PassiveSystem) {
  global.PassiveSystem = { 
    val: (u, s, d) => d, 
    getStatMultiplier: () => 1.0, 
    getStatBonus: () => 0,
    hasTrait: () => false
  };
}

// Mocking ActionHandler dependency for the test
const _applyMitigation = (dmg, target) => {
    const reduction = CombatEngine.getStat(target, 'reduction');
    return Math.floor(dmg * reduction);
};

test('Mitigation: Reduction status correctly reduces physical damage', () => {
  const actor = { level: 50, atk: 200 };
  const target = { level: 50, def: 100, statuses: [
    { type: 'reduction', value: 0.5 } // 50% reduction
  ]};
  
  // Base damage (no mitigation)
  const rawDmg = CombatEngine.physDmg(200, 100, 1.0, { atkLevel: 50, defLevel: 50 });
  
  // Applied damage
  const finalDmg = _applyMitigation(rawDmg, target);
  
  assert.ok(finalDmg <= rawDmg * 0.5 + 1);
  assert.ok(finalDmg >= rawDmg * 0.5 - 1);
});

test('Mitigation: Respects the 80% hard cap', () => {
  const target = { statuses: [
    { type: 'reduction', value: 0.1 }, // 90% reduction?
    { type: 'reduction', value: 0.5 }  // Multiplicative? 0.1 * 0.5 = 0.05 (95% reduction)
  ]};
  
  const reduction = CombatEngine.getStat(target, 'reduction');
  
  // 1 - 0.8 (cap) = 0.2. It should not go below 0.2.
  assert.ok(Math.abs(reduction - 0.2) < 0.0001);
});

test('Mitigation: Baseline (no status) is 1.0', () => {
    const target = {};
    const reduction = CombatEngine.getStat(target, 'reduction');
    assert.equal(reduction, 1.0);
});
