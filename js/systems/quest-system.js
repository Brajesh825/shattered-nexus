/**
 * quest-system.js — Echo Quest Tracking
 * Handles side-objectives like Hunt, Gather, and Special encounters.
 * Quest definitions live in data/quests.json (loaded as window.QUESTS_DATA).
 */
const QuestSystem = (() => {
  let _active = [];     // [{ id, type, target, count, current, label, rewards, complete }]
  let _completed = [];  // [id, id...]

  function _getDef(id) {
    if (typeof window !== 'undefined' && window.QUESTS_DATA) {
      return window.QUESTS_DATA.find(q => q.id === id) || null;
    }
    return null;
  }

  function _grantRewards(q) {
    const r = q.rewards;
    if (!r) return;

    if (r.exp && typeof G !== 'undefined' && G.party) {
      const alive = G.party.filter(m => m && !m.isKO);
      const share = Math.floor(r.exp / Math.max(alive.length, 1));
      alive.forEach(m => { m.exp = (m.exp || 0) + share; });
    }

    if (r.gold && typeof G !== 'undefined' && G.hero) {
      G.hero.gold = (G.hero.gold || 0) + r.gold;
    }

    if (r.item && typeof addToInventory === 'function') {
      addToInventory(r.item, 1);
    }

    _completed.push(q.id);
    _active = _active.filter(a => a.id !== q.id);
  }

  function init(savedQuests) {
    if (savedQuests) {
      _active = savedQuests.active || [];
      _completed = savedQuests.completed || [];
    } else {
      _active = [];
      _completed = [];
      // Auto-accept arc-0 quests (no giver — available from the start)
      if (typeof window !== 'undefined' && window.QUESTS_DATA) {
        window.QUESTS_DATA
          .filter(q => q.arc === 0 && !q.giver)
          .forEach(q => accept(q.id));
      }
    }
  }

  function accept(id) {
    if (_completed.includes(id) || _active.find(q => q.id === id)) return;
    const def = _getDef(id);
    if (def) {
      _active.push({ ...def, current: 0, complete: false });
      if (typeof MapUI !== 'undefined') MapUI.showMsg(`✦ NEW ECHO: ${def.label}`, 2000);
    }
  }

  function onArcAdvance(arcIdx) {
    if (!window.QUESTS_DATA) return;
    window.QUESTS_DATA
      .filter(q => q.arc === arcIdx && !q.giver)
      .forEach(q => accept(q.id));
  }

  function onKill(enemyId, isMutant = false) {
    const toComplete = [];
    _active.forEach(q => {
      if (q.complete) return;

      let progress = false;
      if (q.type === 'hunt' && q.target === enemyId) {
        q.current++;
        progress = true;
      } else if (q.type === 'mutant_kill' && isMutant) {
        q.current++;
        progress = true;
      }

      if (progress && q.current >= q.count) {
        q.complete = true;
        toComplete.push(q);
        if (typeof MapUI !== 'undefined') MapUI.showMsg(`✔ ECHO COMPLETE: ${q.label} — Return to ${q.giver ? 'the quest giver' : 'collect your reward'}!`, 2500);
      }
    });
    // Giver quests wait for NPC submission; no-giver quests auto-grant
    toComplete.filter(q => !q.giver).forEach(_grantRewards);
  }

  function onGather(itemId) {
    const toComplete = [];
    _active.forEach(q => {
      if (q.complete || q.type !== 'gather') return;
      if (q.target === itemId) {
        q.current++;
        if (q.current >= q.count) {
          q.complete = true;
          toComplete.push(q);
          if (typeof MapUI !== 'undefined') MapUI.showMsg(`✔ ECHO COMPLETE: ${q.label} — Return to ${q.giver ? 'the quest giver' : 'collect your reward'}!`, 2500);
        }
      }
    });
    toComplete.filter(q => !q.giver).forEach(_grantRewards);
  }

  function getActive()    { return [..._active]; }
  function getCompleted() { return _completed; }

  /* ── Query helpers used by NPC indicator and dialogue system ── */

  // True if quest is accepted and not yet complete
  function isActive(id) {
    return !!_active.find(q => q.id === id && !q.complete);
  }

  // True if quest progress is done but rewards not yet claimed
  function isReadyToSubmit(id) {
    return !!_active.find(q => q.id === id && q.complete);
  }

  // True if the player can pick this quest up right now
  function canAccept(id) {
    return !_completed.includes(id) && !_active.find(q => q.id === id);
  }

  // Called by the dialogue choice handler after the player clicks "Collect Reward"
  function submit(id) {
    const q = _active.find(q => q.id === id && q.complete);
    if (q) _grantRewards(q);
  }

  function save() {
    return { active: _active, completed: _completed };
  }

  return { init, accept, onArcAdvance, onKill, onGather,
           getActive, getCompleted, isActive, isReadyToSubmit, canAccept, submit, save };
})();
