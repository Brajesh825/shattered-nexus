const assert = require('node:assert/strict');
const { test } = require('./test-harness.js');

global.NexusScaling = require('../js/scaling-config.js');
NexusScaling = global.NexusScaling;

global.PassiveSystem = require('../js/battle/passive-system.js');
PassiveSystem = global.PassiveSystem;

const CombatEngine = require('../js/battle/combat-engine.js');

test('CombatEngine.getStat applies flat passive boosts, multipliers, and low-HP boosts correctly', () => {
  const unit = {
    atk: 10,
    hp: 40,
    maxHp: 100,
    passive: {
      traits: [
        { type: 'STAT_BOOST', stat: 'atk', value: 2 },
        { type: 'STAT_BOOST', stat: 'atk', value: 1.5 },
        { type: 'LOW_HP_STAT_BOOST', stat: 'atk', value: 1.2, threshold: 0.5 }
      ]
    }
  };

  assert.equal(CombatEngine.getStat(unit, 'atk'), 21);

  unit.hp = 80;
  assert.equal(CombatEngine.getStat(unit, 'atk'), 18);
});

test('PassiveSystem query helpers return expected values and fallbacks', () => {
  const unit = {
    hp: 20,
    maxHp: 100,
    passive: {
      traits: [
        { type: 'HEAL_AMP', value: 1.4 },
        { type: 'FIRST_STRIKE', value: true },
        { type: 'LOW_HP_STAT_BOOST', stat: 'atk', value: 1.3, threshold: 0.5 }
      ]
    }
  };

  assert.equal(PassiveSystem.hasTrait(unit, 'FIRST_STRIKE'), true);
  assert.equal(PassiveSystem.hasTrait(unit, 'REFLECT'), false);
  assert.equal(PassiveSystem.val(unit, 'HEAL_AMP', 1.0), 1.4);
  assert.equal(PassiveSystem.val(unit, 'REFLECT', 0), 0);
  assert.equal(PassiveSystem.val(unit, 'LOW_HP_STAT_BOOST', 1.0), 1.3);

  unit.hp = 90;
  assert.equal(PassiveSystem.val(unit, 'LOW_HP_STAT_BOOST', 1.0), 1.0);
});
