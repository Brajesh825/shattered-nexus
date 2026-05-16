const assert = require('node:assert/strict');
const { test } = require('./test-harness.js');

/* ── Stubs ───────────────────────────────────────────────
 * AutoBattle depends on a small surface: PassiveSystem.val,
 * Battle.alive + Battle.pickAbility, G, and DOM lookup. Stub them.
 */

global.PassiveSystem = {
  val: (unit, key, fallback) => fallback,  // pass through fallback
  hasTrait: () => false,
};

global.Battle = {
  alive: (u) => !!u && !u.isKO && u.hp > 0,
  pickAbility: (actor, target) => {
    // Simulate "pick first affordable" — actor.abilities was already filtered
    return actor.abilities && actor.abilities[0] || null;
  },
};

// Minimal document stub for _setBannerVisible
global.document = {
  getElementById: () => ({
    style: {}, classList: { toggle: () => {}, add: () => {}, remove: () => {} }
  }),
};

global.G = { party: [], enemyGroup: [] };
global.window = {};

// Avoid `setTimeout` actually firing
global.setTimeout = (fn, ms) => 0;
global.clearTimeout = () => {};

const AutoBattle = require('../js/battle/auto-battle.js');
const { isAffordable, pickTarget, chooseAction } = AutoBattle._internal;

function makeActor(over = {}) {
  return {
    displayName: 'Test Hero',
    mp: 50,
    cls: { element: 'fire' },
    abilities: [],
    cooldowns: {},
    isKO: false,
    hp: 100,
    ...over,
  };
}

function makeEnemy(over = {}) {
  return {
    name: 'Mob',
    hp: 100, maxHp: 100,
    weakTo: [], resistTo: [],
    isBoss: false, isKO: false,
    ...over,
  };
}

/* ── isAffordable ────────────────────────────────────── */

test('AutoBattle.isAffordable rejects when actor lacks MP', () => {
  const actor = makeActor({ mp: 10 });
  const ab = { id: 'fireball', mp: 20 };
  assert.strictEqual(isAffordable(actor, ab), false);
});

test('AutoBattle.isAffordable accepts when MP is sufficient', () => {
  const actor = makeActor({ mp: 30 });
  const ab = { id: 'fireball', mp: 20 };
  assert.strictEqual(isAffordable(actor, ab), true);
});

test('AutoBattle.isAffordable accepts exactly when MP equals cost', () => {
  const actor = makeActor({ mp: 20 });
  const ab = { id: 'fireball', mp: 20 };
  assert.strictEqual(isAffordable(actor, ab), true);
});

test('AutoBattle.isAffordable rejects when ability is on cooldown', () => {
  const actor = makeActor({ mp: 100, cooldowns: { fireball: 2 } });
  const ab = { id: 'fireball', mp: 20 };
  assert.strictEqual(isAffordable(actor, ab), false);
});

test('AutoBattle.isAffordable returns false for null ability (basic attack should bypass)', () => {
  const actor = makeActor();
  assert.strictEqual(isAffordable(actor, null), false);
});

test('AutoBattle.isAffordable honors MP_COST_MULT passive', () => {
  // Override the passive multiplier just for this test
  const originalVal = PassiveSystem.val;
  PassiveSystem.val = (_u, key, fb) => (key === 'MP_COST_MULT' ? 0.5 : fb);
  try {
    const actor = makeActor({ mp: 11 });
    const ab = { id: 'fireball', mp: 20 }; // effective cost = ceil(20*0.5) = 10
    assert.strictEqual(isAffordable(actor, ab), true);
  } finally {
    PassiveSystem.val = originalVal;
  }
});

/* ── pickTarget ──────────────────────────────────────── */

test('AutoBattle.pickTarget returns null when no enemies are alive', () => {
  global.G.enemyGroup = [makeEnemy({ isKO: true, hp: 0 })];
  const actor = makeActor();
  assert.strictEqual(pickTarget(actor, null), null);
});

test('AutoBattle.pickTarget prefers the lowest-HP target', () => {
  global.G.enemyGroup = [
    makeEnemy({ name: 'Full',  hp: 100, maxHp: 100 }),
    makeEnemy({ name: 'Hurt',  hp: 20,  maxHp: 100 }),
    makeEnemy({ name: 'Mid',   hp: 60,  maxHp: 100 }),
  ];
  const actor = makeActor();
  const pick = pickTarget(actor, null);
  assert.strictEqual(pick.e.name, 'Hurt');
});

test('AutoBattle.pickTarget boosts weakness matches', () => {
  global.G.enemyGroup = [
    makeEnemy({ name: 'Tank', hp: 50, maxHp: 100, weakTo: [] }),
    makeEnemy({ name: 'WeakToFire', hp: 100, maxHp: 100, weakTo: ['fire'] }),
  ];
  const actor = makeActor({ cls: { element: 'fire' } });
  const ab = { id: 'fireball', type: 'magic_damage', effect: { element: 'fire' } };
  const pick = pickTarget(actor, ab);
  // weakness bonus (+60) beats lower-HP bonus (Tank is at 50%, gets +50)
  assert.strictEqual(pick.e.name, 'WeakToFire');
});

test('AutoBattle.pickTarget penalises resist matches', () => {
  global.G.enemyGroup = [
    makeEnemy({ name: 'Neutral', hp: 80, maxHp: 100 }),
    makeEnemy({ name: 'Resistant', hp: 50, maxHp: 100, resistTo: ['fire'] }),
  ];
  const actor = makeActor({ cls: { element: 'fire' } });
  const ab = { effect: { element: 'fire' } };
  const pick = pickTarget(actor, ab);
  // Resistant is at 50% (+50 score) - 40 resist penalty = +10; Neutral is at 80% (+20)
  // So Resistant still wins, but check that resist did dock it
  // Better test: pin Neutral closer in HP, then resist should flip the choice
  global.G.enemyGroup = [
    makeEnemy({ name: 'Neutral', hp: 60, maxHp: 100 }),     // +40
    makeEnemy({ name: 'Resistant', hp: 50, maxHp: 100, resistTo: ['fire'] }),  // +50 - 40 = +10
  ];
  const pick2 = pickTarget(actor, ab);
  assert.strictEqual(pick2.e.name, 'Neutral');
});

test('AutoBattle.pickTarget prioritises bosses', () => {
  global.G.enemyGroup = [
    makeEnemy({ name: 'Boss', hp: 100, maxHp: 100, isBoss: true }),
    makeEnemy({ name: 'Minion', hp: 90, maxHp: 100 }),
  ];
  const actor = makeActor();
  const pick = pickTarget(actor, null);
  // Boss: 0 + 25 = 25; Minion: 10. Boss wins.
  assert.strictEqual(pick.e.name, 'Boss');
});

/* ── chooseAction ────────────────────────────────────── */

test('AutoBattle.chooseAction falls back to basic attack when no abilities are affordable', () => {
  const actor = makeActor({
    mp: 5,
    abilities: [
      { id: 'big',   mp: 50 },
      { id: 'small', mp: 10 },
    ],
  });
  global.G.enemyGroup = [makeEnemy()];
  const out = chooseAction(actor);
  assert.strictEqual(out.kind, 'attack');
});

test('AutoBattle.chooseAction picks an affordable ability when available', () => {
  const actor = makeActor({
    mp: 20,
    abilities: [
      { id: 'cheap', mp: 10 },
      { id: 'expensive', mp: 100 },
    ],
  });
  global.G.enemyGroup = [makeEnemy()];
  const out = chooseAction(actor);
  assert.strictEqual(out.kind, 'ability');
  assert.strictEqual(out.ab.id, 'cheap');
});

test('AutoBattle.chooseAction restores actor.abilities after filtering (no side effects)', () => {
  const original = [
    { id: 'cheap', mp: 5 },
    { id: 'expensive', mp: 100 },
  ];
  const actor = makeActor({ mp: 20, abilities: original });
  global.G.enemyGroup = [makeEnemy()];
  chooseAction(actor);
  // The full ability list must be intact after chooseAction returns
  assert.deepStrictEqual(actor.abilities, original);
});

test('AutoBattle.chooseAction excludes abilities on cooldown', () => {
  const actor = makeActor({
    mp: 100,
    cooldowns: { meteor: 3 },
    abilities: [
      { id: 'meteor', mp: 20 },
      { id: 'flame', mp: 10 },
    ],
  });
  global.G.enemyGroup = [makeEnemy()];
  const out = chooseAction(actor);
  assert.strictEqual(out.kind, 'ability');
  assert.strictEqual(out.ab.id, 'flame');
});

/* ── Public API ─────────────────────────────────────── */

test('AutoBattle.isOn starts false', () => {
  AutoBattle.reset();
  assert.strictEqual(AutoBattle.isOn(), false);
});

test('AutoBattle.toggle flips state', () => {
  AutoBattle.reset();
  // Stub BattleUI for the log message
  global.BattleUI = { addLog: () => {} };
  global.TurnState = { getPhase: () => 'enemy', isBusy: () => false };
  AutoBattle.toggle();
  assert.strictEqual(AutoBattle.isOn(), true);
  AutoBattle.toggle();
  assert.strictEqual(AutoBattle.isOn(), false);
});

test('AutoBattle.reset forces OFF', () => {
  AutoBattle.toggle(); // ON
  AutoBattle.reset();
  assert.strictEqual(AutoBattle.isOn(), false);
});

test('AutoBattle.maybeTakeOver returns false when OFF', () => {
  AutoBattle.reset();
  assert.strictEqual(AutoBattle.maybeTakeOver(), false);
});

test('AutoBattle.maybeTakeOver returns true when ON', () => {
  AutoBattle.reset();
  AutoBattle.toggle();
  assert.strictEqual(AutoBattle.maybeTakeOver(), true);
  AutoBattle.reset();
});

// Run the suite
const { run } = require('./test-harness.js');
run();
