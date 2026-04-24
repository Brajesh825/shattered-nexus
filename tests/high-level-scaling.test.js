const assert = require('node:assert/strict');
const { test } = require('./test-harness.js');

global.NexusScaling = require('../js/scaling-config.js');
global.CombatEngine = require('../js/battle/combat-engine.js');

test('CombatEngine respects split caps (2.5x Base, 4.0x Total)', () => {
  const superUnit = {
    atk: 100,
    statuses: [
      { stat: 'atk', type: 'mult', value: 2.0 },
      { stat: 'atk', type: 'mult', value: 2.0 }, // Status bonus = +100% + 100% = +200% (3.0x)
      { stat: 'atk', type: 'mult', value: 2.0 }  // Status bonus = +300% (4.0x total)
    ]
  };

  const finalAtk = CombatEngine.getStat(superUnit, 'atk');
  
  // Base 1.0 + Bonuses (1.0 + 1.0 + 1.0) = 4.0x.
  // 100 * 4.0 = 400. 
  assert.equal(finalAtk, 400);

  // Add another buff — should stay at 4.0x cap
  superUnit.statuses.push({ stat: 'atk', type: 'mult', value: 1.5 });
  const cappedAtk = CombatEngine.getStat(superUnit, 'atk');
  assert.equal(cappedAtk, 400);
});

test('CombatEngine respects the 0.75 evasion cap', () => {
  const godUnit = { evasion: 0.99 };
  const hitter = { accuracy: 1.0 };
  
  const oldRandom = Math.random;
  // If random is 0.8, and chance is 1.0 - 0.75 = 0.25. 0.8 < 0.25 is false.
  // If evasion was 0.99, chance would be 0.01.
  
  Math.random = () => 0.20; // 20% roll
  const hitResult = CombatEngine.rollHit(hitter, godUnit);
  Math.random = oldRandom;
  
  // 0.20 < (1.0 - 0.75) => 0.20 < 0.25 is true. It should HIT.
  assert.equal(hitResult, true);
});

test('CombatEngine respects the 0.85 crit rate cap', () => {
  const luckyUnit = { critRate: 0.5, lck: 100 }; // 0.5 + 1.0 = 1.5?
  
  const oldRandom = Math.random;
  Math.random = () => 0.84; // Just under the cap
  const crit1 = CombatEngine.rollCrit(luckyUnit);
  
  Math.random = () => 0.86; // Just over the cap
  const crit2 = CombatEngine.rollCrit(luckyUnit);
  Math.random = oldRandom;
  
  assert.equal(crit1, true);
  assert.equal(crit2, false);
});

test('CombatEngine respects the max stat and HP caps', () => {
  const ultraUnit = {
    hp: 10000,
    maxHp: 20000,
    atk: 5000,
    def: 5000
  };
  
  assert.equal(CombatEngine.getStat(ultraUnit, 'maxHp'), 9999);
  assert.equal(CombatEngine.getStat(ultraUnit, 'atk'), 999);
  assert.equal(CombatEngine.getStat(ultraUnit, 'def'), 999);
});

test('CombatEngine enforces minimum 10% accuracy', () => {
  const blindUnit = { accuracy: 0.01 };
  const normalUnit = { evasion: 0 };
  
  const oldRandom = Math.random;
  Math.random = () => 0.09; // Under the 10% min
  const hit = CombatEngine.rollHit(blindUnit, normalUnit);
  Math.random = oldRandom;
  
  assert.equal(hit, true);
});
