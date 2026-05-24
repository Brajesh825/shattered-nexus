/**
 * js/systems/state-manager.js
 * Encapsulates the global state object G into a reactive StateManager.
 * Prevents direct untracked modifications by proxying mutations.
 *
 * Phase 1 wiring (Aethon):
 *   • Mutation methods route ALL writes to protected root props.
 *   • Publish/Subscribe bus so UI managers can react to state changes
 *     instead of polling on every render tick.
 *   • Optional warn-only Proxy guard exposes accidental direct writes
 *     via `[STATE-DIAG]` console messages without breaking the engine.
 */
const StateManager = (() => {
  let _rawState = null;
  let _isMutating = false;

  const protectedRootProps = new Set([
    'gold',
    'inventory',
    'unlockedChars',
    'clearedMaps',
    'voidFragments',
    'weaponsLevels',
    'weaponsUpgrades',
    'openedChests',
    'firedScenes',
    'nexusTime',
    'npcTalked',
    'bondProgress',
    'earnedBondRewards'
  ]);

  // --- INVENTORY CONSTANTS (mirrors inventory.js) ---
  const MAX_INVENTORY_STACKS = 30;
  const MAX_STACK_QTY        = 99;

  function init(rawState) {
    _rawState = rawState;
  }

  function mutate(callback) {
    const wasMutating = _isMutating;
    _isMutating = true;
    try {
      return callback();
    } finally {
      _isMutating = wasMutating;
    }
  }

  function isMutating() {
    return _isMutating;
  }

  function getRawState() {
    return _rawState;
  }

  function isProtected(prop) {
    return protectedRootProps.has(prop);
  }

  /* ──────────────────────────────────────────────────────────
     EVENT BUS — Publish-Subscribe for state change notifications.
     Public: on(event, handler), off(event, handler).
     Private: emit(event, payload) — called from mutation methods.
     Handlers are invoked synchronously, after the mutation lock
     has been released, but inside an try/catch so a buggy
     subscriber cannot stall the engine.
     ────────────────────────────────────────────────────────── */
  const _subscribers = new Map(); // event -> Set<handler>

  function on(event, handler) {
    if (typeof handler !== 'function') return;
    if (!_subscribers.has(event)) _subscribers.set(event, new Set());
    _subscribers.get(event).add(handler);
  }

  function off(event, handler) {
    const set = _subscribers.get(event);
    if (set) set.delete(handler);
  }

  function emit(event, payload) {
    const set = _subscribers.get(event);
    if (!set || set.size === 0) return;
    set.forEach(h => {
      try { h(payload); }
      catch (e) {
        console.error(`[StateManager] Subscriber for "${event}" threw:`, e);
      }
    });
  }

  // --- MUTATION METHODS ---

  function addGold(amount) {
    mutate(() => {
      _rawState.gold = (_rawState.gold || 0) + amount;
      if (_rawState.party) {
        _rawState.party.forEach(m => m.gold = _rawState.gold);
      }
    });
    emit('gold_changed', { gold: _rawState.gold, delta: amount });
  }

  function spendGold(amount) {
    mutate(() => {
      _rawState.gold = Math.max(0, (_rawState.gold || 0) - amount);
      if (_rawState.party) {
        _rawState.party.forEach(m => m.gold = _rawState.gold);
      }
    });
    emit('gold_changed', { gold: _rawState.gold, delta: -amount });
  }

  function addVoidFragments(amount) {
    mutate(() => {
      _rawState.voidFragments = (_rawState.voidFragments || 0) + amount;
    });
    emit('void_fragments_changed', { voidFragments: _rawState.voidFragments, delta: amount });
  }

  function spendVoidFragments(amount) {
    mutate(() => {
      _rawState.voidFragments = Math.max(0, (_rawState.voidFragments || 0) - amount);
    });
    emit('void_fragments_changed', { voidFragments: _rawState.voidFragments, delta: -amount });
  }

  /**
   * Add `qty` of `itemId` to the inventory. Stacks on existing entries,
   * caps individual stacks at MAX_STACK_QTY, refuses past MAX_INVENTORY_STACKS.
   * Returns true on success, false if the inventory is full.
   */
  function addItemToInventory(itemId, qty = 1) {
    if (!itemId || qty <= 0) return false;
    let success = true;
    mutate(() => {
      if (!Array.isArray(_rawState.inventory)) _rawState.inventory = [];
      const existing = _rawState.inventory.find(s => s && s.itemId === itemId);
      if (existing) {
        existing.qty = Math.min(MAX_STACK_QTY, existing.qty + qty);
      } else {
        if (_rawState.inventory.length >= MAX_INVENTORY_STACKS) {
          success = false;
          return;
        }
        _rawState.inventory.push({ itemId, qty: Math.min(MAX_STACK_QTY, qty) });
      }
    });
    if (success) emit('inventory_changed', { itemId, delta: qty });
    return success;
  }

  /**
   * Remove `qty` of `itemId` from the inventory. Splices the stack when it
   * drops to 0. Returns true on success, false if the item is absent.
   */
  function removeInventoryItem(itemId, qty = 1) {
    if (!itemId || qty <= 0) return false;
    let success = false;
    mutate(() => {
      if (!Array.isArray(_rawState.inventory)) return;
      const idx = _rawState.inventory.findIndex(s => s && s.itemId === itemId);
      if (idx < 0) return;
      _rawState.inventory[idx].qty -= qty;
      if (_rawState.inventory[idx].qty <= 0) {
        _rawState.inventory.splice(idx, 1);
      }
      success = true;
    });
    if (success) emit('inventory_changed', { itemId, delta: -qty });
    return success;
  }

  function openChest(chestId) {
    mutate(() => {
      if (!_rawState.openedChests) {
        _rawState.openedChests = new Set();
      }
      _rawState.openedChests.add(chestId);
    });
    emit('chest_opened', { chestId });
  }

  function recordFiredScene(sceneId) {
    mutate(() => {
      if (!_rawState.firedScenes) {
        _rawState.firedScenes = new Set();
      }
      _rawState.firedScenes.add(sceneId);
    });
    emit('scene_fired', { sceneId });
  }

  function addClearedMap(mapId) {
    mutate(() => {
      if (!Array.isArray(_rawState.clearedMaps)) {
        _rawState.clearedMaps = [];
      }
      if (!_rawState.clearedMaps.includes(mapId)) {
        _rawState.clearedMaps.push(mapId);
      }
    });
    emit('cleared_maps_changed', { mapId, added: true });
  }

  function removeClearedMap(mapId) {
    mutate(() => {
      if (Array.isArray(_rawState.clearedMaps)) {
        _rawState.clearedMaps = _rawState.clearedMaps.filter(m => m !== mapId);
      }
    });
    emit('cleared_maps_changed', { mapId, added: false });
  }

  function advanceTime(hours) {
    mutate(() => {
      _rawState.nexusTime = (_rawState.nexusTime || 0) + hours;
      while (_rawState.nexusTime >= 24.0) _rawState.nexusTime -= 24.0;
      while (_rawState.nexusTime < 0)     _rawState.nexusTime += 24.0;
    });
    emit('nexus_time_changed', { nexusTime: _rawState.nexusTime, delta: hours });
  }

  function unlockChar(charId) {
    let added = false;
    mutate(() => {
      if (!Array.isArray(_rawState.unlockedChars)) {
        _rawState.unlockedChars = [];
      }
      if (!_rawState.unlockedChars.includes(charId)) {
        _rawState.unlockedChars.push(charId);
        added = true;
      }
    });
    if (added) emit('party_changed', { type: 'unlock', charId });
  }

  // --- NPC dialogue and state updates ---
  function addNpcTalked(npcId) {
    mutate(() => {
      if (!_rawState.npcTalked) {
        _rawState.npcTalked = {};
      }
      _rawState.npcTalked[npcId] = (_rawState.npcTalked[npcId] || 0) + 1;
    });
  }

  function setBondProgress(charId, progress) {
    mutate(() => {
      if (!_rawState.bondProgress) {
        _rawState.bondProgress = {};
      }
      _rawState.bondProgress[charId] = progress;
    });
    emit('bond_progress_changed', { charId, progress });
  }

  function addEarnedBondReward(reward) {
    mutate(() => {
      if (!Array.isArray(_rawState.earnedBondRewards)) {
        _rawState.earnedBondRewards = [];
      }
      // Bond rewards are { pairId, reward } objects — accept any payload.
      // If a primitive is passed, dedupe; otherwise always push.
      if (typeof reward === 'object' && reward !== null) {
        _rawState.earnedBondRewards.push(reward);
      } else if (!_rawState.earnedBondRewards.includes(reward)) {
        _rawState.earnedBondRewards.push(reward);
      }
    });
    emit('bond_progress_changed', { reward });
  }

  // --- CHARACTER progression & stat recalculation hooks ---
  function addExp(charId, amount) {
    mutate(() => {
      const member = _rawState.party?.find(m => m.charId === charId);
      if (member) {
        member.exp = (member.exp || 0) + amount;
        if (member.char) member.char.exp = member.exp;
      }
    });
    emit('party_changed', { type: 'exp', charId, amount });
  }

  function setMemberKO(charId, isKO) {
    mutate(() => {
      const member = _rawState.party?.find(m => m.charId === charId);
      if (member) {
        member.isKO = isKO;
        if (member.char) member.char.isKO = isKO;
      }
    });
    emit('party_changed', { type: 'ko', charId, isKO });
  }

  function setWeaponLevel(weaponId, level) {
    mutate(() => {
      if (!_rawState.weaponsLevels) {
        _rawState.weaponsLevels = {};
      }
      _rawState.weaponsLevels[weaponId] = level;
    });
    emit('weapons_changed', { weaponId, level });
  }

  function setWeaponUpgrade(weaponId, upgradeId) {
    mutate(() => {
      if (!_rawState.weaponsUpgrades) {
        _rawState.weaponsUpgrades = {};
      }
      _rawState.weaponsUpgrades[weaponId] = upgradeId;
    });
    emit('weapons_changed', { weaponId, upgradeId });
  }

  /* ──────────────────────────────────────────────────────────
     WRITE-PROTECTION (warn-only Proxy guard).
     Reports direct writes to protected root props via
     `[STATE-DIAG]` so missed migrations surface in the console.
     The write is allowed to proceed — non-fatal by design so we
     never break the engine while shaking out the last call sites.
     Whole-array re-assignments from save load / boot are tagged
     internally via mutate() so they don't trip the warning.
     ────────────────────────────────────────────────────────── */
  let _warnedKeys = new Set();
  function _diagWarn(prop) {
    // Throttle: warn at most once per (prop, callsite-hash) so the
    // console doesn't flood. The hash is the top-of-stack frame.
    const stack = (new Error()).stack || '';
    const callerLine = stack.split('\n').slice(3, 4).join('').trim() || '';
    const key = prop + '|' + callerLine;
    if (_warnedKeys.has(key)) return;
    _warnedKeys.add(key);
    const msg = `[STATE-DIAG] Direct write to G.${prop} detected — should route through StateManager.`;
    if (typeof window !== 'undefined' && typeof window.LogDebug === 'function') {
      window.LogDebug(msg, 'dmg');
    } else {
      console.warn(msg, '\n  at', callerLine);
    }
  }

  /**
   * Wrap `G` in a warn-only Proxy. Any direct assignment to a protected
   * root prop outside of `mutate()` logs a `[STATE-DIAG]` message but
   * still completes the write — non-fatal by design.
   *
   * Returns the proxied object. Callers should reassign their G ref
   * to this return value: `G = StateManager.installProxy(G)`.
   * If `G` is declared `const`, prefer pointing window.G at the proxy
   * and reading from there for diagnostics. The base `G` object remains
   * mutable so legacy code keeps working.
   */
  function installProxy(target) {
    if (typeof Proxy === 'undefined' || !target) return target;
    return new Proxy(target, {
      set(obj, prop, value) {
        if (typeof prop === 'string' && protectedRootProps.has(prop) && !_isMutating) {
          _diagWarn(prop);
        }
        obj[prop] = value;
        return true;
      }
    });
  }

  return {
    init,
    mutate,
    isMutating,
    getRawState,
    isProtected,
    // Mutations
    addGold,
    spendGold,
    addVoidFragments,
    spendVoidFragments,
    addItemToInventory,
    removeInventoryItem,
    openChest,
    recordFiredScene,
    addClearedMap,
    removeClearedMap,
    advanceTime,
    unlockChar,
    addNpcTalked,
    setBondProgress,
    addEarnedBondReward,
    addExp,
    setMemberKO,
    setWeaponLevel,
    setWeaponUpgrade,
    // Event bus
    on,
    off,
    // Write-protection
    installProxy
  };
})();

if (typeof window !== 'undefined') window.StateManager = StateManager;
if (typeof module !== 'undefined' && module.exports) module.exports = StateManager;
