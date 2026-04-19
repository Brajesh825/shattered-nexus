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
      if (Battle.alive(e)) {
        q.push({ type: 'enemy', idx: i, spd: Battle.getStat(e, 'spd') });
        
        // --- SOLO BOSS DOUBLE ACTION ---
        const isSolo = G.enemyGroup.filter(en => Battle.alive(en)).length === 1;
        if (e.isBoss && isSolo) {
          q.push({ type: 'enemy', idx: i, spd: Math.floor(Battle.getStat(e, 'spd') * 0.6) });
        }
      }
    });

    // Higher speed units act first
    q.sort((a, b) => b.spd - a.spd);

    // Relic: Echo of the Unmade — firstStrike guarantees the fastest party member
    // acts first on the opening round of each battle (fires once per battle).
    if (G._firstStrikeRelic && !G._firstStrikeUsed) {
      G._firstStrikeUsed = true;
      const partyEntries = q.filter(t => t.type === 'party');
      if (partyEntries.length) {
        const fastest = partyEntries.reduce((a, b) => a.spd >= b.spd ? a : b);
        const idx = q.indexOf(fastest);
        if (idx > 0) { q.splice(idx, 1); q.unshift(fastest); }
        BattleUI.addLog(`🌑 First Strike! ${G.party[fastest.idx].displayName} moves first!`, 'hi');
      }
    }

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
      
      // Tick statuses (decrement duration) even when incapacitated
      StatusSystem.tick(unit, t.type === 'enemy');
      
      BattleUI.addLog(`${icon} ${unit.displayName || unit.name} is ${label} and skips their turn!`, 'regen');

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
