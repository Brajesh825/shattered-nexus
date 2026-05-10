const assert = require('assert');
const { test } = require('./test-harness.js');

function loadTurnState() {
  delete require.cache[require.resolve('../js/battle/turn-state.js')];
  return require('../js/battle/turn-state.js');
}

test('TurnState resetBattle initializes canonical and legacy fields', () => {
  global.G = {};
  const TurnState = loadTurnState();
  const queue = [{ type: 'party', idx: 0, spd: 10 }];

  TurnState.resetBattle(queue);

  assert.strictEqual(TurnState.getQueue(), queue);
  assert.strictEqual(global.G.turn.queue, queue);
  assert.strictEqual(global.G.turnQueue, queue);
  assert.strictEqual(global.G.turnIdx, 0);
  assert.strictEqual(global.G.busy, false);
  assert.strictEqual(global.G.activeMemberIdx, 0);
});

test('TurnState setters keep legacy battle fields mirrored', () => {
  global.G = {};
  const TurnState = loadTurnState();

  TurnState.resetBattle([]);
  TurnState.setIndex(2);
  TurnState.setBusy(true);
  TurnState.setActivePartyIdx(3);
  TurnState.setTargetEnemyIdx(1);
  TurnState.setPendingAction({ type: 'attack' });
  TurnState.beginPendingExecution();

  assert.strictEqual(global.G.turnIdx, 2);
  assert.strictEqual(global.G.busy, true);
  assert.strictEqual(global.G.activeMemberIdx, 3);
  assert.strictEqual(global.G.targetEnemyIdx, 1);
  assert.deepStrictEqual(global.G.pendingAction, { type: 'attack' });
  assert.strictEqual(global.G._executingPending, true);

  TurnState.clearPendingAction();
  TurnState.endPendingExecution();

  assert.strictEqual(global.G.pendingAction, null);
  assert.strictEqual(global.G._executingPending, false);
});

test('TurnState can hydrate from legacy fields during migration', () => {
  global.G = {
    turnQueue: [{ type: 'enemy', idx: 0, spd: 4 }],
    turnIdx: 1,
    busy: true,
    activeMemberIdx: 2,
    targetEnemyIdx: 3,
    pendingAction: { type: 'ability' },
    _executingPending: true
  };
  const TurnState = loadTurnState();

  TurnState.state();

  assert.strictEqual(TurnState.getQueue(), global.G.turnQueue);
  assert.strictEqual(TurnState.getIndex(), 1);
  assert.strictEqual(TurnState.isBusy(), true);
  assert.strictEqual(TurnState.getActivePartyIdx(), 2);
  assert.strictEqual(TurnState.getTargetEnemyIdx(), 3);
  assert.deepStrictEqual(TurnState.getPendingAction(), { type: 'ability' });
  assert.strictEqual(TurnState.isExecutingPending(), true);
});

test('TurnState setTargetEnemy resolves the index from G.enemyGroup', () => {
  const first = { id: 'first' };
  const second = { id: 'second' };
  global.G = { enemyGroup: [first, second] };
  const TurnState = loadTurnState();

  TurnState.resetBattle([]);
  TurnState.setTargetEnemy(second);

  assert.strictEqual(TurnState.getTargetEnemyIdx(), 1);
  assert.strictEqual(global.G.targetEnemyIdx, 1);
});
