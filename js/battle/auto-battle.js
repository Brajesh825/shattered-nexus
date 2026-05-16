/**
 * auto-battle.js — Vivid AI Takeover for player turns
 *
 * Toggle that hands player turns over to a smart AI. Filters ability list by
 * MP affordability + cooldown, falls back to basic attack when no skill is
 * usable, and picks targets the same way enemy AI does (weakness-aware, prefer
 * low-HP marks). Resets when a new battle starts so it never bleeds across
 * encounters.
 *
 * Public:
 *   AutoBattle.toggle()      — Flip the flag (called by the AUTO button)
 *   AutoBattle.isOn()        — Boolean
 *   AutoBattle.reset()       — Force OFF (called by startBattle)
 *   AutoBattle.maybeTakeOver() — Called by TurnManager.beginHeroTurn; returns
 *                              true if AI took the turn (caller should bail)
 */
const AutoBattle = (() => {
  let _on = false;
  let _scheduled = null;

  function _setBannerVisible(show) {
    const banner = document.getElementById('auto-mode-banner');
    if (banner) banner.style.display = show ? '' : 'none';
    const btn = document.getElementById('auto-battle-btn');
    if (btn) btn.classList.toggle('auto-active', show);
    const grid = document.getElementById('cmd-grid-main');
    if (grid) grid.classList.toggle('auto-thinking', show);
  }

  function isOn() { return _on; }

  function reset() {
    _on = false;
    if (_scheduled) { clearTimeout(_scheduled); _scheduled = null; }
    _setBannerVisible(false);
  }

  function toggle() {
    // Always allow toggling regardless of busy state — but don't interrupt mid-action
    _on = !_on;
    _setBannerVisible(_on);

    if (_on && typeof BattleUI !== 'undefined') {
      BattleUI.addLog('🤖 AUTO MODE — AI taking over', 'hi');
    } else if (!_on && typeof BattleUI !== 'undefined') {
      BattleUI.addLog('▶ Manual control restored', 'hi');
    }

    // If toggled ON during a hero turn that's already waiting, immediately take over
    if (_on) {
      const isHeroTurn = typeof TurnState !== 'undefined'
        && TurnState.getPhase && TurnState.getPhase() === 'hero'
        && !TurnState.isBusy();
      if (isHeroTurn) _scheduleTurn();
    } else {
      if (_scheduled) { clearTimeout(_scheduled); _scheduled = null; }
    }
  }

  /**
   * Called by TurnManager.beginHeroTurn after the UI is set up.
   * Returns true if the AI has taken over (and the manual prompt should be silent).
   */
  function maybeTakeOver() {
    if (!_on) return false;
    _setBannerVisible(true);
    _scheduleTurn();
    return true;
  }

  function _scheduleTurn() {
    if (_scheduled) clearTimeout(_scheduled);
    // Brief delay so the player can see the active member highlighted before AI acts
    _scheduled = setTimeout(() => {
      _scheduled = null;
      _executeTurn();
    }, 520);
  }

  /* ── MP / Cooldown affordability check (mirrors buildAbilityMenu logic) ── */
  function _isAffordable(actor, ab) {
    if (!ab) return false;
    const mpCost = Math.ceil((ab.mp || 0) * PassiveSystem.val(actor, 'MP_COST_MULT', 1.0));
    if (actor.mp < mpCost) return false;
    const cdLeft = (actor.cooldowns || {})[ab.id] || 0;
    if (cdLeft > 0) return false;
    return true;
  }

  /* ── Pick a target — prefer low HP, prefer weakness match ── */
  function _pickTarget(actor, ab) {
    const alive = G.enemyGroup
      .map((e, i) => ({ e, i }))
      .filter(o => Battle.alive(o.e));
    if (!alive.length) return null;

    const abElem = (ab && ab.effect && ab.effect.element)
      || (ab && ab.type === 'magic_damage' ? actor.cls?.element : null)
      || actor.cls?.element || 'physical';

    // Score: lower HP ratio = better, weakness match = big bonus, resist = penalty
    const scored = alive.map(o => {
      const ratio = o.e.hp / Math.max(o.e.maxHp, 1);
      let score = (1 - ratio) * 100;
      if (Array.isArray(o.e.weakTo) && o.e.weakTo.includes(abElem)) score += 60;
      if (Array.isArray(o.e.resistTo) && o.e.resistTo.includes(abElem)) score -= 40;
      if (o.e.isBoss) score += 25; // focus boss
      return { ...o, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0];
  }

  /* ── Choose the best action for this actor ── */
  function _chooseAction(actor) {
    const abilities = actor.abilities || [];
    const affordable = abilities.filter(ab => _isAffordable(actor, ab));

    // If nothing affordable, basic attack
    if (!affordable.length) return { kind: 'attack' };

    // Reuse the Battle.pickAbility AI weighting, but filtered to affordable moves only.
    // We swap actor.abilities temporarily so pickAbility weights only valid options.
    const originalAbilities = actor.abilities;
    actor.abilities = affordable;
    let ab;
    try {
      const previewTarget = G.enemyGroup.find(e => Battle.alive(e));
      ab = Battle.pickAbility(actor, previewTarget);
    } finally {
      actor.abilities = originalAbilities;
    }
    if (!ab) return { kind: 'attack' };
    // Sanity re-check — pickAbility shouldn't return an unaffordable move now, but guard anyway
    if (!_isAffordable(actor, ab)) return { kind: 'attack' };
    return { kind: 'ability', ab };
  }

  /* ── Execute the chosen action via existing player action functions ── */
  function _executeTurn() {
    if (!_on) return;
    if (typeof TurnState !== 'undefined' && TurnState.isBusy()) {
      // Mid-resolution — try again shortly
      _scheduled = setTimeout(_executeTurn, 200);
      return;
    }

    const activeIdx = typeof TurnState !== 'undefined'
      ? TurnState.getActivePartyIdx()
      : G.activeMemberIdx;
    const actor = G.party[activeIdx];
    if (!actor || actor.isKO) { TurnManager.advance(); return; }

    const action = _chooseAction(actor);

    // Cancel any pending targeting state (player may have started selecting)
    if (typeof TurnState !== 'undefined') {
      TurnState.setPendingAction(null);
      TurnState.setPhase('hero');
    }

    if (action.kind === 'ability') {
      const target = _pickTarget(actor, action.ab);
      if (target) {
        if (typeof TurnState !== 'undefined') TurnState.setTargetEnemy(target.e);
        else { G.targetEnemyIdx = target.i; G.enemy = target.e; }
      }
      if (window.LogDebug) window.LogDebug(`[AutoBattle] ${actor.displayName} → ${action.ab.name}`, 'hi');
      heroAbility(action.ab);
    } else {
      // Basic attack — pick target first
      const target = _pickTarget(actor, null);
      if (target) {
        if (typeof TurnState !== 'undefined') TurnState.setTargetEnemy(target.e);
        else { G.targetEnemyIdx = target.i; G.enemy = target.e; }
      }
      if (window.LogDebug) window.LogDebug(`[AutoBattle] ${actor.displayName} → Attack (no MP for skill)`, 'hi');
      heroAttack();
    }
  }

  return { toggle, isOn, reset, maybeTakeOver };
})();

if (typeof window !== 'undefined') window.AutoBattle = AutoBattle;
