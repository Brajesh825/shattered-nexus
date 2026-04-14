/**
 * TurnManager Module
 * Orchestrates the flow of combat: queue generation, turn processing, and transitions.
 */
const TurnManager = {
  
  /**
   * Generates a new turn order based on current unit speeds.
   */
  buildQueue() {
    const q = [];
    G.party.forEach((m, i) => { 
      if (Battle.alive(m)) q.push({ type: 'party', idx: i, spd: Battle.getStat(m, 'spd') }); 
    });
    G.enemyGroup.forEach((e, i) => { 
      if (Battle.alive(e)) q.push({ type: 'enemy', idx: i, spd: Battle.getStat(e, 'spd') }); 
    });
    
    // Higher speed units act first
    q.sort((a, b) => b.spd - a.spd);
    return q;
  },

  /**
   * Main entry point for resolving the current turn in the queue.
   */
  process() {
    // 1. Skip units that were KO'd before their turn
    while (G.turnIdx < G.turnQueue.length) {
      const t = G.turnQueue[G.turnIdx];
      const unit = t.type === 'party' ? G.party[t.idx] : G.enemyGroup[t.idx];
      if (Battle.alive(unit)) break;
      G.turnIdx++;
    }

    // 2. New round if current queue is exhausted
    if (G.turnIdx >= G.turnQueue.length) {
      G.turnQueue = this.buildQueue();
      G.turnIdx = 0;
      if (!G.turnQueue.length) return; // Critical state: no one alive
    }

    const t = G.turnQueue[G.turnIdx];
    const unit = t.type === 'party' ? G.party[t.idx] : G.enemyGroup[t.idx];

    // 3. Status/Control Check (Stun/Frozen)
    const stun = StatusSystem.has(unit, 'status_stunned');
    const frozen = StatusSystem.has(unit, 'status_frozen');

    if (stun || frozen) {
      const label = stun ? 'stunned' : 'frozen';
      const icon = stun ? '💫' : '❄️';
      BattleUI.addLog(`${icon} ${unit.displayName || unit.name} is ${label} and skips their turn!`, 'regen');

      // Removal of turn-skipping effects
      if (stun) StatusSystem.remove(unit, 'status_stunned');
      if (frozen) StatusSystem.remove(unit, 'status_frozen');

      setTimeout(() => this.advance(), 1000);
      return;
    }

    // 4. Update UI visuals for the active turn
    BattleUI.renderTurnBar();
    BattleUI.highlightActiveMember();
    BattleUI.renderActiveMemberBar();

    // 5. Delegate Action
    if (t.type === 'party') {
      G.activeMemberIdx = t.idx;
      this.beginHeroTurn();
    } else {
      G.busy = true;
      BattleUI.btns(false);
      // enemyAct is defined in action-handler.js
      setTimeout(() => {
        if (typeof enemyAct === 'function') {
          enemyAct(G.enemyGroup[t.idx], t.idx);
        } else {
          console.error("enemyAct not found! Advancing turn to prevent hang.");
          this.advance();
        }
      }, 700);
    }
  },

  /**
   * Increments the turn index and triggers the next turn resolution.
   */
  advance() {
    G.turnIdx++;
    // checkBattleEnd is defined in game.js
    if (typeof checkBattleEnd === 'function' && !checkBattleEnd()) {
      this.process();
    }
  },

  /**
   * Prepares the interface for a player character's turn.
   */
  beginHeroTurn() {
    G.busy = false;
    const actor = G.party[G.activeMemberIdx];
    if (!actor) { this.advance(); return; }

    // Target Selection Maintenance
    if (!Battle.alive(G.enemyGroup[G.targetEnemyIdx])) {
      const aliveIdx = G.enemyGroup.findIndex(e => Battle.alive(e));
      if (aliveIdx >= 0) G.targetEnemyIdx = aliveIdx;
    }
    
    // UI Refresh (buildAbilityMenu is in game.js)
    if (typeof buildAbilityMenu === 'function') buildAbilityMenu();
    
    BattleUI.renderEnemyRow();
    BattleUI.renderActiveMemberBar();
    BattleUI.btns(true);
    
    // Start-of-Turn maintenance
    StatusSystem.tick(actor); 
    
    BattleUI.addLog(`${actor.displayName}'s turn — choose action!`, 'hi');
    BattleUI.updateStats();
  }
};
