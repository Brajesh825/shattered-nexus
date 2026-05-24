
function computeStats(ch, cls) {
  const b = ch.base_stats, m = cls.stat_multipliers, bon = ch.stat_bonuses || {};
  const g = cls.growthPerLevel || {};
  const lv = ch.lv || 1;
  const out = {};

  ['hp', 'mp', 'atk', 'def', 'spd', 'mag', 'lck', 'mdef'].forEach(k => {
    // Unified Formula: (Base + (Lv-1)*Growth + Bonus) * ClassMultiplier
    const baseWithGrowth = b[k] + (lv - 1) * (g[k] || 0);
    out[k] = Math.floor((baseWithGrowth + (bon[k] || 0)) * (m[k] || 1));
  });

  // Apply weapon stats
  const weaponId = ch.equippedWeapon;
  const weapons = window.WEAPONS_DATA || [];
  const weaponDef = weapons.find(w => w.id === weaponId);
  // Validation guard: warn if a weapon ID is set but not found in WEAPONS_DATA.
  // Prevents silent stat loss from typos, renamed weapons, or stale saves.
  if (weaponId && !weaponDef && typeof IS_DEV !== 'undefined' && IS_DEV) {
    console.warn(`[Party] computeStats: equippedWeapon "${weaponId}" not found in WEAPONS_DATA for ${ch.name || ch.id}. Weapon stats skipped.`);
  }
  if (weaponDef && weaponDef.stats) {
    const _G = typeof G !== 'undefined' ? G : (typeof global !== 'undefined' && global.G ? global.G : null);
    const tier = (_G && _G.weaponsUpgrades && _G.weaponsUpgrades[weaponId]) || weaponDef.rarity || 'rare';
    const level = (_G && _G.weaponsLevels && _G.weaponsLevels[weaponId]) || 1;
    
    // Rarity and level growth mapping (vivid_hybrid_weapon_system.md roadmap)
    const growth = { hp: 8, mp: 2, atk: 4, def: 2, spd: 1, mag: 3, lck: 1, mdef: 2 };

    ['hp', 'mp', 'atk', 'def', 'spd', 'mag', 'lck', 'mdef'].forEach(k => {
      if (weaponDef.stats[k] !== undefined) {
        let val = weaponDef.stats[k];
        // Apply level growth
        if (growth[k]) {
          val += growth[k] * (level - 1);
        }
        // Apply tier breakthrough multipliers
        if (tier === 'epic') val = Math.floor(val * 1.25);
        if (tier === 'legendary') val = Math.floor(val * 1.5);
        
        out[k] += val;
      }
    });
  }

  return out;
}

function _getArchiveMasteryBuffs() {
  if (typeof Archive === 'undefined' || typeof Archive.getMasteryBuffs !== 'function') {
    return null;
  }
  return Archive.getMasteryBuffs();
}

function applyArchiveMasteryToMember(member, mastery = _getArchiveMasteryBuffs()) {
  if (!member || !mastery) return;
  member.atk += mastery.atk || 0;
  member.def += mastery.def || 0;
  member.mag += mastery.mag || 0;
  member.spd += mastery.spd || 0;
  member.lck += mastery.lck || 0;
}

/**
 * Recomputes all derived combat stats for a single party member in-place.
 *
 * @param {object} member   - A live party member object from G.party.
 * @param {object} [options]
 * @param {string} [options.resourceStrategy='clamp']
 *   Controls how current HP/MP are adjusted when maxHp/maxMp changes:
 *   - 'clamp'  (default) — Keeps current HP/MP, but clamps it to the new maximum.
 *                          Use after equipment changes or relic equips where the
 *                          player's bar should not refill.
 *   - 'delta'  — Adjusts current HP/MP by the same delta as the max changed.
 *                          Use when stats are boosted mid-battle so the member
 *                          feels the gain proportionally (e.g. a buff that raises maxHp).
 *   - 'full'   — Sets current HP/MP to the new maximum (full heal).
 *                          Use when rebuilding a party at camp after a full rest,
 *                          or when entering a new arc.
 * @param {number} [options.hp]  Override source HP before clamping (used on save-load).
 * @param {number} [options.mp]  Override source MP before clamping (used on save-load).
 */
function rebuildMemberCombatStats(member, options = {}) {
  if (!member?.char || !member.cls) return;

  const resourceStrategy = options.resourceStrategy || 'clamp';
  const base = computeStats(member.char, member.cls);
  const relicMult = _getRelicStatMult();
  const prevMaxHp = member.maxHp ?? base.hp;
  const prevMaxMp = member.maxMp ?? base.mp;
  const nextMaxHp = Math.floor(base.hp * relicMult.hp);
  const nextMaxMp = Math.floor(base.mp * relicMult.mp);

  member.maxHp = nextMaxHp;
  member.maxMp = nextMaxMp;
  member.atk = Math.floor(base.atk * relicMult.atk);
  member.def = Math.floor(base.def * relicMult.def);
  member.mag = Math.floor(base.mag * relicMult.mag);
  member.spd = Math.floor(base.spd * relicMult.spd);
  member.lck = Math.floor(base.lck * relicMult.lck);
  member.mdef = Math.floor(base.mdef * relicMult.mdef);

  const weapons = window.WEAPONS_DATA || [];
  member.equippedWeapon = weapons.find(w => w.id === member.char.equippedWeapon) || null;

  applyArchiveMasteryToMember(member);

  if (resourceStrategy === 'delta') {
    member.hp = Math.min((member.hp ?? prevMaxHp) + (nextMaxHp - prevMaxHp), nextMaxHp);
    member.mp = Math.min((member.mp ?? prevMaxMp) + (nextMaxMp - prevMaxMp), nextMaxMp);
    return;
  }

  if (resourceStrategy === 'full') {
    member.hp = nextMaxHp;
    member.mp = nextMaxMp;
    return;
  }

  const hpSource = options.hp !== undefined ? options.hp : member.hp;
  const mpSource = options.mp !== undefined ? options.mp : member.mp;
  member.hp = Math.min(Math.max(hpSource ?? nextMaxHp, 0), nextMaxHp);
  member.mp = Math.min(Math.max(mpSource ?? nextMaxMp, 0), nextMaxMp);
}

/* ============================================================
   PARTY & ENEMY BUILDING
   ============================================================ */
function buildParty() {
  G.party = [];
  const charIds = G.selectedChars.length >= 4
    ? G.selectedChars
    : G.chars.slice(0, 4).map(c => c.id);
  charIds.forEach(charId => {
    const ch = G.chars.find(c => c.id === charId); if (!ch) return;
    const _resolvedLeader = G.selectedChar || G.selectedChars[0] || null;
    const isPlayer = charId === _resolvedLeader;
    // Each character always uses their specific class affinity
    const classId = ch.class_affinity[0] || G.classes[0].id;
    const cls = G.classes.find(c => c.id === classId) || G.classes[0];
    const s = computeStats(ch, cls);
    G.party.push({
      charId, classId,
      name: `${ch.name} / ${cls.name}`,
      displayName: ch.alias || ch.name,
      // Restore saved MP if available so it carries between battles; cap to max
      mp: (ch.mp !== undefined ? Math.min(ch.mp, s.mp) : s.mp), maxMp: s.mp,
      // Restore saved HP if available; otherwise start at max
      hp: (ch.hp !== undefined ? Math.min(ch.hp, s.hp) : s.hp), maxHp: s.hp,
      atk: s.atk, def: s.def, spd: s.spd, mag: s.mag, lck: s.lck, mdef: s.mdef,
      accuracy: cls.stat_multipliers.accuracy || 0.95,
      critRate: cls.stat_multipliers.critRate || 0.05,
      lv: ch.lv || 1, exp: ch.exp || 0, gold: ch.gold || 0,
      char: ch, cls: cls,
      equippedWeapon: (() => {
        const wDef = (window.WEAPONS_DATA || []).find(w => w.id === ch.equippedWeapon) || null;
        if (ch.equippedWeapon && !wDef && typeof IS_DEV !== 'undefined' && IS_DEV) {
          console.warn(`[Party] buildParty: equippedWeapon "${ch.equippedWeapon}" not found in WEAPONS_DATA for ${ch.name || charId}. Equipped weapon set to null.`);
        }
        return wDef;
      })(),
      passive: ch.passive,
      abilities: cls.abilities,
      isPlayer,
      isKO: ch.hp === 0 || !!ch.isKO,
      regenTurns: 0, stunned: false, frozen: 0,
      statuses: [],
      cooldowns: {},
      _dragonLeapTurns: 0,
      _reviveOnceFired: false,
    });
  });

  // --- DIAMOND FORMATION AUTO-SORTING ---
  const ROLE_WEIGHTS = { 'Paladin': 10, 'Knight': 8, 'Warrior': 6, 'Ranger': 4, 'Mage': 2, 'Healer': 0 };

  // 1. Sort by weight descending (Tankiest first)
  const sorted = [...G.party].sort((a, b) => {
    const wA = ROLE_WEIGHTS[a.cls.role] ?? 5;
    const wB = ROLE_WEIGHTS[b.cls.role] ?? 5;
    return wB - wA;
  });

  // 2. Re-map to physical Diamond slots:
  // Slot 2: Highest weight (Front/Vanguard)
  // Slot 1: Lowest weight (Back/Rearguard)
  // Slot 0 & 3: The middle guys (Flanks)
  if (sorted.length >= 4) {
    const finalParty = [];
    finalParty[2] = sorted[0]; // Front (highest score)
    finalParty[1] = sorted[3]; // Back (lowest score)
    finalParty[0] = sorted[1]; // Flank
    finalParty[3] = sorted[2]; // Flank
    G.party = finalParty;
  }

  applyRelicBonuses();
  const mastery = _getArchiveMasteryBuffs();
  G.party.forEach(m => applyArchiveMasteryToMember(m, mastery));
  applyBondRewards();
}

// Apply active relic bonuses as multipliers on top of base party stats
function applyRelicBonuses() {
  const active = G.activeRelics || [];
  if (!active.length) return;
  const defs = G.relics || [];

  // Aggregate bonuses from all active relics
  const bonus = { 
    hp: 1, mp: 1, atk: 1, def: 1, spd: 1, mag: 1, lck: 1, mdef: 1,
    healAmp: 1, mpRegen: 0, eliteResist: 0, fireResist: 0, 
    statusResist: 0, firstStrike: false, reviveOnce: false 
  };
  active.forEach(id => {
    const r = defs.find(d => d.id === id);
    if (!r || !r.bonus) return;
    if (r.bonus.hp) bonus.hp += r.bonus.hp;
    if (r.bonus.mp) bonus.mp += r.bonus.mp;
    if (r.bonus.atk) bonus.atk += r.bonus.atk;
    if (r.bonus.def) bonus.def += r.bonus.def;
    if (r.bonus.spd) bonus.spd += r.bonus.spd;
    if (r.bonus.mag) bonus.mag += r.bonus.mag;
    if (r.bonus.lck) bonus.lck += r.bonus.lck;
    if (r.bonus.mdef) bonus.mdef += r.bonus.mdef;
    if (r.bonus.healAmp) bonus.healAmp += r.bonus.healAmp;
    if (r.bonus.mpRegen) bonus.mpRegen += r.bonus.mpRegen;
    if (r.bonus.eliteResist) bonus.eliteResist += r.bonus.eliteResist;
    if (r.bonus.fireResist) bonus.fireResist += r.bonus.fireResist;   // Cinder of Ashveil
    if (r.bonus.statusResist) bonus.statusResist += r.bonus.statusResist; // Drowned Sigil
    if (r.bonus.firstStrike) bonus.firstStrike = true;                // Echo of the Unmade
    if (r.bonus.reviveOnce) bonus.reviveOnce = true;                  // Rampart Oath
  });

  G.party.forEach(m => {
    m.maxHp = Math.floor(m.maxHp * bonus.hp);
    m.hp = Math.min(m.hp, m.maxHp);
    m.maxMp = Math.floor(m.maxMp * bonus.mp);
    m.mp = Math.min(m.mp, m.maxMp);
    m.atk = Math.floor(m.atk * bonus.atk);
    m.def = Math.floor(m.def * bonus.def);
    m.spd = Math.floor(m.spd * bonus.spd);
    m.mag = Math.floor(m.mag * bonus.mag);
    m.lck = Math.floor(m.lck * bonus.lck);
    m.mdef = Math.floor(m.mdef * bonus.mdef);
    m._healAmpRelic = bonus.healAmp;     // used by healing logic
    m._mpRegenBonus = bonus.mpRegen;     // extra % of maxMp per turn
    m._eliteResist = bonus.eliteResist; // fraction of damage reduction vs Corrupted/Mutant
    m._fireResist = bonus.fireResist;  // fraction of fire damage reduction
    m._statusResist = bonus.statusResist; // chance (0–1) to resist debuff application
    m._reviveOnceRelic = bonus.reviveOnce; // flag for Rampart Oath
  });

  // firstStrike: flag on G so TurnManager can guarantee party acts first in round 1
  G._firstStrikeRelic = bonus.firstStrike;
  if (bonus.firstStrike) G._firstStrikeUsed = false;
}

// Apply earned bond tier rewards to current party members.
// Mirrors applyRelicBonuses() — called at the end of buildParty() so rewards
// survive every stat recompute (level-up, relic swap, load from save).
function applyBondRewards() {
  const rewards = G.earnedBondRewards;
  if (!rewards || !rewards.length || typeof BOND_DATA === 'undefined') return;

  // Build pairId → charIds lookup
  const pairChars = {};
  BOND_DATA.pairs.forEach(p => { pairChars[p.id] = p.chars; });

  // Aggregate per-character flat/pct bonuses and global reaction boosts
  const charBonus = {}; // { charId: { stat: totalVal, ... } }
  const reactionBoosts = [];

  rewards.forEach(({ pairId, reward }) => {
    const chars = pairChars[pairId];
    if (!chars || !reward) return;

    if (reward.type === 'resonance') {
      chars.forEach(charId => {
        if (!charBonus[charId]) charBonus[charId] = {};
        charBonus[charId][reward.stat] = (charBonus[charId][reward.stat] || 0) + reward.val;
      });
    } else if (reward.type === 'reaction_boost') {
      reactionBoosts.push({ detonator: reward.detonator, aura: reward.aura, mult: reward.mult });
    }
  });

  // Apply to party members in the current party
  G.party.forEach(m => {
    const bonus = charBonus[m.charId];
    if (!bonus) return;

    const STAT_FIELD = { hp: 'maxHp', mp: 'maxMp', atk: 'atk', def: 'def', spd: 'spd', mag: 'mag', lck: 'lck', mdef: 'mdef' };
    Object.entries(bonus).forEach(([stat, val]) => {
      if (stat === 'critRate') {
        m.critRate = (m.critRate || 0.05) + val;
        return;
      }
      const field = STAT_FIELD[stat];
      if (!field) return;
      if (Number.isInteger(val)) {
        // Flat addition (e.g. spd +3, hp +50)
        m[field] = (m[field] || 0) + val;
        if (field === 'maxHp') m.hp = Math.min((m.hp || 0) + val, m.maxHp);
        if (field === 'maxMp') m.mp = Math.min((m.mp || 0) + val, m.maxMp);
      } else {
        // Percentage boost (e.g. atk +0.15 = +15%)
        m[field] = Math.floor((m[field] || 0) * (1 + val));
        if (field === 'maxHp') m.hp = Math.min(m.hp || 0, m.maxHp);
        if (field === 'maxMp') m.mp = Math.min(m.mp || 0, m.maxMp);
      }
    });
  });

  // Store reaction boosts on G for CombatEngine to read
  G._bondReactionBoosts = reactionBoosts;
}

function checkLevel() { return checkMemberLevel(G.hero); }

/**
 * Returns the EXP required to reach the next level from the current level.
 * Uses a quadratic formula: 5 * L^2 + 25 * L
 * @param {number} lv - Current level
 * @returns {number} EXP threshold
 */
function getExpThreshold(lv) {
  return (5 * lv * lv) + (25 * lv);
}

// Returns the aggregated relic stat multipliers without mutating any party member.
// Each stat bonus is additive across all active relics, then clamped at NexusScaling.caps.relicBonusCap (1.5×).
// Example: 3 relics each granting +0.25 atk → raw sum = 1.75, clamped to 1.5.
// This prevents relic stacking from bypassing the CombatEngine 8× safety cap in an uncontrolled way.
function _getRelicStatMult() {
  const mult = { hp: 1, mp: 1, atk: 1, def: 1, spd: 1, mag: 1, lck: 1, mdef: 1 };
  const active = G.activeRelics || [];
  if (!active.length) return mult;
  const defs = G.relics || [];
  const bonusCap = (typeof NexusScaling !== 'undefined' && NexusScaling.caps.relicBonusCap) || 1.5;
  active.forEach(id => {
    const r = defs.find(d => d.id === id);
    if (!r || !r.bonus) return;
    ['hp', 'mp', 'atk', 'def', 'spd', 'mag', 'lck', 'mdef'].forEach(k => {
      if (r.bonus[k]) mult[k] += r.bonus[k];
    });
  });
  // Enforce per-stat relic bonus cap after full aggregation
  ['hp', 'mp', 'atk', 'def', 'spd', 'mag', 'lck', 'mdef'].forEach(k => {
    mult[k] = Math.min(bonusCap, mult[k]);
  });
  return mult;
}

function checkMemberLevel(m) {
  const threshold = getExpThreshold(m.lv);
  if (!m || m.exp < threshold) return false;

  // Enforce Version Level Cap
  const maxLevel = (typeof NexusScaling !== 'undefined') ? NexusScaling.caps.maxLevel : 99;
  if (m.lv >= maxLevel) return false;

  // Subtract the 'spent' experience points
  m.exp -= threshold;

  // Persist level increase to the source character data
  if (m.char) {
    m.char.lv = (m.char.lv || 1) + 1;
    m.lv = m.char.lv;
  } else {
    m.lv++;
  }

  rebuildMemberCombatStats(m, { resourceStrategy: 'delta' });

  return true;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    computeStats,
    buildParty,
    applyRelicBonuses,
    applyBondRewards,
    getExpThreshold,
    checkLevel,
    checkMemberLevel,
    rebuildMemberCombatStats,
    applyArchiveMasteryToMember,
    _getArchiveMasteryBuffs,
    _getRelicStatMult
  };
}

