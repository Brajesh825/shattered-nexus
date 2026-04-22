const assert = require('node:assert/strict');
const { test } = require('./test-harness.js');

// Global Mocks
global.NexusScaling = require('../js/scaling-config.js');
global.PassiveSystem = require('../js/battle/passive-system.js');
global.ReactionEffects = require('../js/battle/reaction-effects.js');
global.CombatEngine = require('../js/battle/combat-engine.js');
global.FormationRules = require('../js/battle/formation-rules.js');

global.StatusSystem = require('../js/battle/status-system.js');

global.BattleUI = {
  addLog: () => {},
  popEnemy: () => {},
  popParty: () => {},
  popReaction: () => {},
  renderEnemyRow: () => {},
  renderPartyRow: () => {},
  renderPartyStatus: () => {},
  flash: () => {},
  createEffectOverlay: () => {},
  shakeEnemy: () => {},
  setSpriteFrame: () => {},
  getSprite: () => ({ classList: { add: () => {}, remove: () => {} } }),
  setLog: () => {},
  btns: () => {},
  _getBuffReport: () => ''
};

global.Battle = {
  rollHit: (a, d, b) => global.CombatEngine.rollHit(a, d, b),
  rollCrit: (a) => global.CombatEngine.rollCrit(a),
  triggerReaction: (u, d) => global.StatusSystem.triggerReaction(u, d),
  elemMult: (e, t) => global.CombatEngine.elemMult(e, t, {}),
  playerElemMult: (e, t) => 1.0,
  getStat: (u, s) => global.CombatEngine.getStat(u, s),
  setKO: (u, isEnemy) => { u.isKO = true; u.hp = 0; },
  elemResult: () => 'normal',
  playerElemResult: () => 'normal',
  alive: (u) => u && u.hp > 0 && !u.isKO,
  addStatus: (u, s) => global.StatusSystem.add(u, s),
  applyAura: (u, a) => global.StatusSystem.applyAura(u, a),
  physDmg: (atk, def, mult, opts) => global.CombatEngine.physDmg(atk, def, mult, opts),
  magicDmg: (mag, mdef, mult, opts) => global.CombatEngine.magicDmg(mag, mdef, mult, opts)
};

global.Archive = { recordWeakness: () => {}, recordKill: () => {} };
global.SFX = { 
  shatter: () => {}, melt: () => {}, swirl: () => {}, magic: () => {}, 
  crit: () => {}, ultimate: () => {}, attack: () => {}, enemyHit: () => {}, 
  heal: () => {} 
};
global.TurnManager = { advance: () => {} };
global.G = { 
  enemyGroup: [], 
  party: [], 
  activeMemberIdx: 0, 
  targetEnemyIdx: 0, 
  busy: false 
};
global.window = { LogDebug: () => {} };

// Load the module
const { 
  ActionHandler, 
  ActionEngine, 
  resolveOffensiveAction, 
  resolveEnemyOffensiveAction 
} = require('../js/battle/action-handler.js');

global.ActionHandler = ActionHandler;
global.ActionEngine = ActionEngine;
global.resolveOffensiveAction = resolveOffensiveAction;
global.resolveEnemyOffensiveAction = resolveEnemyOffensiveAction;

test('resolveOffensiveAction applies STAB (Same Type Ability Bonus)', () => {
  global.Archive = { recordWeakness: () => {}, recordKill: () => {} };
  const actor = {
    displayName: 'Hero',
    cls: { element: 'fire' },
    atk: 20,
    lv: 1,
    hp: 100,
    maxHp: 100
  };
  const target = { name: 'Slime', def: 10, hp: 100, maxHp: 100, level: 1 };
  
  // 1. Same element (Fire move on Fire hero)
  const actionFire = { name: 'Fire Slash', type: 'physical' };
  const dmgFire = resolveOffensiveAction(actor, target, 0, actionFire, 'fire');
  
  // 2. Different element (Water move on Fire hero)
  const actionWater = { name: 'Water Slash', type: 'physical' };
  const dmgWater = resolveOffensiveAction(actor, target, 0, actionWater, 'water');
  
  // Fire dmg should be ~25% higher than water dmg (STAB = 1.25)
  // Base dmg is randomized so we need to be careful, but we can mock random or just check ratio
  // Actually physDmg uses Math.random(). Let's mock Math.random to be consistent.
  const oldRandom = Math.random;
  Math.random = () => 0.5; // Mid-roll
  const oldPhys = global.Battle.physDmg;
  const oldReact = global.Battle.triggerReaction;
  const oldElem = global.Battle.elemMult;
  
  global.Battle.physDmg = () => 100;
  global.Battle.triggerReaction = () => null;
  global.Battle.elemMult = () => 1.0;
  
  const d1 = resolveOffensiveAction(actor, { ...target }, 0, actionFire, 'fire');
  const d2 = resolveOffensiveAction(actor, { ...target }, 0, actionWater, 'water');
  
  global.Battle.physDmg = oldPhys;
  global.Battle.triggerReaction = oldReact;
  global.Battle.elemMult = oldElem;
  Math.random = oldRandom;
  
  assert.equal(d1, 125, `Expected 125 for Fire STAB, got ${d1}`);
  assert.equal(d2, 100, `Expected 100 for Water (no STAB), got ${d2}`);
});

test('resolveOffensiveAction incorporates Reaction multipliers', () => {
  global.Archive = { recordWeakness: () => {}, recordKill: () => {} };
  const actor = { atk: 30, lv: 1, hp: 100, maxHp: 100 };
  const target = { def: 10, hp: 100, maxHp: 100, level: 1 };
  
  const oldRandom = Math.random;
  Math.random = () => 0.5;
  
  // Mock a reaction (e.g. Vaporize 2.0x)
  const oldTrigger = global.Battle.triggerReaction;
  global.Battle.triggerReaction = () => ({ id: 'vaporize', dmgMult: 2.0, label: 'VAPORIZE' });
  
  const dmgWithReaction = resolveOffensiveAction(actor, target, 0, { type: 'physical' }, 'water');
  
  global.Battle.triggerReaction = () => null;
  const dmgNoReaction = resolveOffensiveAction(actor, target, 0, { type: 'physical' }, 'water');
  
  global.Battle.triggerReaction = oldTrigger;
  Math.random = oldRandom;
  
  assert.equal(dmgWithReaction, dmgNoReaction * 2);
});

test('resolveEnemyOffensiveAction applies formation evasion and elite resists', () => {
  const actor = { name: 'Boss', atk: 50, level: 10, isCorrupted: true };
  const target = { 
    displayName: 'Tank', 
    def: 20, 
    lv: 10, 
    hp: 100, 
    maxHp: 100,
    _eliteResist: 0.2, // 20% reduction against elite/corrupted
    statuses: []
  };
  
  const oldRandom = Math.random;
  Math.random = () => 0.5;
  
  // 1. Standard hit
  const dmgNormal = resolveEnemyOffensiveAction(actor, target, 0, { type: 'physical' }, 'physical');
  
  // 2. Evasion hit (Mocked to fail evasion)
  // (targetIdx 1 is rearguard, gives 0.3 bonus)
  // We need to mock Math.random to trigger evasion.
  let randomCalls = 0;
  Math.random = () => {
    randomCalls++;
    if (randomCalls === 1) return 0.9; // Trigger evasion ( > chance)
    return 0.5;
  };
  
  const result = resolveEnemyOffensiveAction(actor, target, 1, { type: 'physical' }, 'physical');
  assert.equal(result, 'evade');
  
  Math.random = oldRandom;
});

test('ActionEngine.Processors.heal handles revive and cleanse', () => {
  const actor = { mag: 20, hp: 100, maxHp: 100 };
  const target = { displayName: 'Fallen Ally', hp: 0, maxHp: 50, isKO: true, statuses: [{ id: 'debuff_poison' }] };
  global.G.party = [target];
  
  const ab = {
    id: 'mega_heal',
    type: 'heal',
    isUltimate: true, // Ultimates can revive
    effect: { cleanse: true, healBase: 50 }
  };
  
  ActionEngine.Processors.heal(actor, [target], ab, 'light', {}, false);
  
  assert.equal(target.isKO, false);
  assert.ok(target.hp > 0);
  assert.equal(target.statuses.length, 0); // Cleansed
});

test('ActionEngine.Processors.buff applies diverse status effects', () => {
  const actor = { displayName: 'Buffer', hp: 50, maxHp: 100, statuses: [] };
  const ab = {
    id: 'wind_buff',
    type: 'buff',
    effect: {
      atkBuff: 1.5,
      damageReduction: 0.3, // 30% reduction -> value 0.7
      evasion: 0.2
    }
  };
  
  ActionEngine.Processors.buff(actor, [actor], ab, 'wind', {}, false);
  
  const hasAtk = actor.statuses.find(s => s.id === 'buff_atk_wind_buff');
  const hasWard = actor.statuses.find(s => s.id === 'buff_ward_wind_buff');
  const hasEva = actor.statuses.find(s => s.id === 'buff_evasion_wind_buff');
  
  assert.ok(hasAtk, 'Should have ATK buff with source ID');
  assert.equal(hasAtk.value, 1.5);
  assert.equal(hasWard.value, 0.7);
  assert.equal(hasEva.value, 0.2);
});


test('ActionEngine.Processors.buff implements Source-Based Stacking', () => {
  const hero = { displayName: 'Hero', atk: 100, hp: 100, maxHp: 100, statuses: [] };
  global.G = { party: [hero], enemyGroup: [], activeMemberIdx: 0 };
  
  const moveA = { id: 'move_a', name: 'Move A', effect: { atkBuff: 1.2, duration: 3 } };
  const moveB = { id: 'move_b', name: 'Move B', effect: { atkBuff: 1.3, duration: 2 } };

  // 1. Apply Move A
  ActionEngine.Processors.buff(hero, [hero], moveA, 'physical', {}, false);
  assert.equal(hero.statuses.length, 1);
  assert.ok(hero.statuses[0].id.includes('move_a'));

  // 2. Apply Move B (Different move -> Should stack)
  ActionEngine.Processors.buff(hero, [hero], moveB, 'physical', {}, false);
  assert.equal(hero.statuses.length, 2);
  assert.ok(hero.statuses[1].id.includes('move_b'));

  // 3. Apply Move A again (Same move -> Should refresh, not add 3rd)
  ActionEngine.Processors.buff(hero, [hero], moveA, 'physical', {}, false);
  assert.equal(hero.statuses.length, 2);
  
  // 4. Verify math stacking (1.2 + 1.3 additive = 1.5x total)
  const finalAtk = CombatEngine.getStat(hero, 'atk');
  assert.equal(finalAtk, 150);
});
