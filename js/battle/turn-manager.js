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

    // --- PASSIVE TRAIT: FIRST STRIKE ---
    if (typeof PassiveSystem !== 'undefined') {
      G.party.forEach((m, i) => {
        if (Battle.alive(m) && PassiveSystem.hasTrait(m, 'FIRST_STRIKE')) {
          const entry = q.find(t => t.type === 'party' && t.idx === i);
          if (entry) {
            const qIdx = q.indexOf(entry);
            if (qIdx > 0) {
              q.splice(qIdx, 1);
              q.unshift(entry);
            }
          }
        }
      });
    }

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
    TurnState.syncFromLegacy();
    let queue = TurnState.getQueue();
    let idx = TurnState.getIndex();

    // 1. Skip units that were KO'd before their turn
    while (idx < queue.length) {
      const t = queue[idx];
      const unit = t.type === 'party' ? G.party[t.idx] : G.enemyGroup[t.idx];
      if (Battle.alive(unit)) break;
      idx++;
      TurnState.setIndex(idx);
    }

    // 2. New round if current queue is exhausted
    if (idx >= queue.length) {
      queue = this.buildQueue();
      TurnState.setQueue(queue);
      TurnState.setIndex(0);
      idx = 0;
      if (!queue.length) return; // Critical state: no one alive
    }

    const t = queue[idx];
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

    // 4b. Mid-Battle Event Check — intercept before delegation
    const pendingEvent = this._checkBattleEvents();
    if (pendingEvent) {
      // Pause the queue and hand off to the cinematic system
      TurnState.setBusy(true);
      BattleUI.btns(false);
      BattleUI.showBattleEvent(pendingEvent, () => {
        // onComplete: apply effects and resume
        const effect = pendingEvent.onComplete;
        if (effect) {
          if (effect.screenShake) BattleUI.triggerScreenShake(500);
          if (effect.flash) BattleUI.flash(effect.flash, 500);
          if (effect.logMsg) BattleUI.addLog(effect.logMsg, 'hi');
          if (effect.addStatus) {
            // Apply the status to all enemies that fired this event
            G.enemyGroup.forEach(e => {
              if (Battle.alive(e) && e._lastFiredEvent === pendingEvent.id) {
                if (typeof StatusSystem !== 'undefined') {
                  StatusSystem.add(e, effect.addStatus);
                }
                delete e._lastFiredEvent;
              }
            });
          }
        }
        TurnState.setBusy(false);
        // Re-enter process() to delegate the actual turn
        setTimeout(() => this.process(), 200);
      });
      return;
    }

    // 5. Delegate Action
    if (t.type === 'party') {
      TurnState.setActivePartyIdx(t.idx);
      this.beginHeroTurn();
    } else {
      TurnState.setBusy(true);
      TurnState.setPhase('enemy');
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
   * Scans all living enemies for unfired battleEvents whose trigger conditions are met.
   * Marks the event as fired and tags the source enemy. Returns the first pending event found.
   */
  _checkBattleEvents() {
    for (const enemy of G.enemyGroup) {
      if (!Battle.alive(enemy) || !enemy.battleEvents) continue;
      for (const ev of enemy.battleEvents) {
        if (ev.fired) continue;
        if (ev.trigger.type === 'hp') {
          const hpRatio = enemy.hp / enemy.maxHp;
          if (hpRatio <= ev.trigger.threshold) {
            ev.fired = true;
            enemy._lastFiredEvent = ev.id;
            return ev;
          }
        }
      }
    }
    return null;
  },

  /**
   * Increments the turn index and triggers the next turn resolution.
   */
  advance() {
    TurnState.advanceIndex();
    // checkBattleEnd is defined in game.js
    if (typeof checkBattleEnd === 'function' && !checkBattleEnd()) {
      this.process();
    }
  },

  /**
   * Prepares the interface for a player character's turn.
   */
  beginHeroTurn() {
    TurnState.setBusy(false);
    TurnState.setPhase('hero');
    const actor = G.party[TurnState.getActivePartyIdx()];
    if (!actor) { this.advance(); return; }

    // Target Selection Maintenance
    if (!Battle.alive(G.enemyGroup[TurnState.getTargetEnemyIdx()])) {
      const aliveIdx = G.enemyGroup.findIndex(e => Battle.alive(e));
      if (aliveIdx >= 0) TurnState.setTargetEnemyIdx(aliveIdx);
    }
    
    // UI Refresh (buildAbilityMenu is in game.js)
    if (typeof buildAbilityMenu === 'function') buildAbilityMenu();
    
    BattleUI.renderEnemyRow();
    BattleUI.renderActiveMemberBar();
    BattleUI.btns(true);

    // Force focus reset to Action Menu (Attack button)
    if (typeof Focus !== 'undefined') {
      // TurnState.clearTargetEnemy(); // STICKY TARGETING: Removed forced clear
      Focus.setContext('cmd-grid-main');
    }
    
    // Start-of-Turn maintenance
    StatusSystem.tick(actor); 
    
    BattleUI.addLog(`${actor.displayName}'s turn — choose action!`, 'hi');
    BattleUI.updateStats();
  }
};
