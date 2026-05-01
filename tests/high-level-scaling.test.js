const assert = require('node:assert/strict');
const { test } = require('./test-harness.js');

global.NexusScaling = require('../js/scaling-config.js');
global.CombatEngine = require('../js/battle/combat-engine.js');

test('CombatEngine respects stat caps (2.5x Passive, 8.0x Absolute)', () => {
  // Status multipliers stack additively: base 1.0 + sBonus.
  // Three x2.0 statuses: sBonus = 3.0 → finalMult = 1.0 + 3.0 = 4.0x → 400.
  const superUnit = {
    atk: 100,
    statuses: [
      { stat: 'atk', type: 'mult', value: 2.0 },
      { stat: 'atk', type: 'mult', value: 2.0 },
      { stat: 'atk', type: 'mult', value: 2.0 }
    ]
  };
  assert.equal(CombatEngine.getStat(superUnit, 'atk'), 400);

  // A fourth buff raises the total — no 4.0x status cap, only the 8.0x absolute cap.
  // sBonus = 3.0 + 0.5 = 3.5 → finalMult = 4.5 → 450.
  superUnit.statuses.push({ stat: 'atk', type: 'mult', value: 1.5 });
  assert.equal(CombatEngine.getStat(superUnit, 'atk'), 450);

  // Verify the 8.0x absolute cap: pile on enough buffs to exceed 8.0x.
  // sBonus = 3.5 + 1.0*5 = 8.5 → uncapped finalMult = 9.5 → clamped to 8.0 → 800.
  for (let i = 0; i < 5; i++) superUnit.statuses.push({ stat: 'atk', type: 'mult', value: 2.0 });
  assert.equal(CombatEngine.getStat(superUnit, 'atk'), 800);
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
