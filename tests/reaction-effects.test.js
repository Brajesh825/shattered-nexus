const assert = require('node:assert/strict');
const { test } = require('./test-harness.js');

global.NexusScaling = require('../js/scaling-config.js');
NexusScaling = global.NexusScaling;

const ReactionEffects = require('../js/battle/reaction-effects.js');

test('ReactionEffects applies shatter, conductive, and burning side effects', () => {
  const target = { name: 'Target', statuses: [] };
  const added = [];

  const result = ReactionEffects.applyReactionEffects({
    reaction: { debuff: 'def', stun: true, dot: true },
    target,
    damage: 50,
    addStatus: (unit, config) => {
      added.push(config.id);
      unit.statuses.push(config);
    },
    isAlive: () => true
  });

  assert.equal(result.defShattered, true);
  assert.equal(result.stunned, true);
  assert.equal(result.burning, true);
  assert.deepEqual(added, ['debuff_def_shatter', 'status_stunned', 'debuff_burn']);
  assert.equal(target.statuses[2].value, Math.floor(50 * NexusScaling.engine.burnReactionDotPercent));
});

test('ReactionEffects disperses swirl aura to other living units in the group', () => {
  const target = { id: 'target', isKO: false };
  const ally1 = { id: 'ally1', isKO: false };
  const ally2 = { id: 'ally2', isKO: true };
  const ally3 = { id: 'ally3', isKO: false };
  const applied = [];

  const result = ReactionEffects.applyReactionEffects({
    reaction: { swirlAura: 'water' },
    target,
    group: [target, ally1, ally2, ally3],
    addStatus: () => {},
    applyAura: (unit, aura) => applied.push(`${unit.id}:${aura}`),
    isAlive: unit => !unit.isKO
  });

  assert.equal(result.swirlAura, 'water');
  assert.deepEqual(result.swirlTargets, [ally1, ally3]);
  assert.deepEqual(applied, ['ally1:water', 'ally3:water']);
});
