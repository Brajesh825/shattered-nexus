/**
 * turn-state.js
 * Centralized adapter for battle turn/session state.
 *
 * During migration this mirrors the legacy G.* fields so older call sites keep
 * working while new code has one explicit API.
 */
const TurnState = (() => {
  const defaults = () => ({
    queue: [],
    idx: 0,
    busy: false,
    activePartyIdx: 0,
    targetEnemyIdx: 0,
    pendingAction: null,
    executingPending: false,
    phase: 'idle'
  });

  function state() {
    if (typeof G === 'undefined') return defaults();
    if (!G.turn) {
      G.turn = defaults();
      syncFromLegacy();
    }
    return G.turn;
  }

  function syncLegacy() {
    if (typeof G === 'undefined' || !G.turn) return;
    G.turnQueue = G.turn.queue;
    G.turnIdx = G.turn.idx;
    G.busy = G.turn.busy;
    G.activeMemberIdx = G.turn.activePartyIdx;
    G.targetEnemyIdx = G.turn.targetEnemyIdx;
    G.pendingAction = G.turn.pendingAction;
    G._executingPending = G.turn.executingPending;
  }

  function syncFromLegacy() {
    if (typeof G === 'undefined' || !G.turn) return;
    G.turn.queue = Array.isArray(G.turnQueue) ? G.turnQueue : G.turn.queue;
    G.turn.idx = Number.isInteger(G.turnIdx) ? G.turnIdx : G.turn.idx;
    G.turn.busy = typeof G.busy === 'boolean' ? G.busy : G.turn.busy;
    G.turn.activePartyIdx = Number.isInteger(G.activeMemberIdx) ? G.activeMemberIdx : G.turn.activePartyIdx;
    G.turn.targetEnemyIdx = Number.isInteger(G.targetEnemyIdx) ? G.targetEnemyIdx : G.turn.targetEnemyIdx;
    G.turn.pendingAction = G.pendingAction || null;
    G.turn.executingPending = !!G._executingPending;
    syncLegacy();
  }

  function setQueue(queue) {
    state().queue = Array.isArray(queue) ? queue : [];
    syncLegacy();
  }

  function setIndex(idx) {
    state().idx = Math.max(0, Number.isInteger(idx) ? idx : 0);
    syncLegacy();
  }

  function advanceIndex() {
    state().idx++;
    syncLegacy();
  }

  function setBusy(value) {
    state().busy = !!value;
    syncLegacy();
  }

  function setActivePartyIdx(idx) {
    state().activePartyIdx = Math.max(0, Number.isInteger(idx) ? idx : 0);
    syncLegacy();
  }

  function setTargetEnemyIdx(idx) {
    state().targetEnemyIdx = Math.max(0, Number.isInteger(idx) ? idx : 0);
    syncLegacy();
  }

  function setTargetEnemy(enemy) {
    if (typeof G === 'undefined' || !Array.isArray(G.enemyGroup)) return;
    const idx = G.enemyGroup.indexOf(enemy);
    if (idx >= 0) setTargetEnemyIdx(idx);
  }

  function clearTargetEnemy() {
    setTargetEnemyIdx(0);
  }

  function setPendingAction(action) {
    state().pendingAction = action || null;
    syncLegacy();
  }

  function beginPendingExecution() {
    state().executingPending = true;
    syncLegacy();
  }

  function endPendingExecution() {
    state().executingPending = false;
    syncLegacy();
  }

  function setPhase(phase) {
    state().phase = phase || 'idle';
    syncLegacy();
  }

  function resetBattle(queue = []) {
    if (typeof G === 'undefined') return;
    G.turn = defaults();
    G.turn.queue = Array.isArray(queue) ? queue : [];
    syncLegacy();
  }

  return {
    state,
    syncLegacy,
    syncFromLegacy,
    getQueue: () => state().queue,
    setQueue,
    getIndex: () => state().idx,
    setIndex,
    advanceIndex,
    isBusy: () => state().busy,
    setBusy,
    getActivePartyIdx: () => state().activePartyIdx,
    setActivePartyIdx,
    getTargetEnemyIdx: () => state().targetEnemyIdx,
    setTargetEnemyIdx,
    getTargetEnemy: () => (typeof G !== 'undefined' ? G.enemy : null),
    setTargetEnemy,
    clearTargetEnemy,
    getPendingAction: () => state().pendingAction,
    setPendingAction,
    clearPendingAction: () => setPendingAction(null),
    isExecutingPending: () => state().executingPending,
    beginPendingExecution,
    endPendingExecution,
    getPhase: () => state().phase,
    setPhase,
    resetBattle
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TurnState;
}
