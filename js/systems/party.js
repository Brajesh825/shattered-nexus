
function computeStats(ch, cls) {
  const b = ch.base_stats, m = cls.stat_multipliers, bon = ch.stat_bonuses || {};
  const g = cls.growthPerLevel || {};
  const lv = ch.lv || 1;
  const out = {};

  ['hp', 'mp', 'atk', 'def', 'spd', 'mag', 'lck'].forEach(k => {
    // Unified Formula: (Base + (Lv-1)*Growth + Bonus) * ClassMultiplier
    const baseWithGrowth = b[k] + (lv - 1) * (g[k] || 0);
    out[k] = Math.floor((baseWithGrowth + (bon[k] || 0)) * (m[k] || 1));
  });
  return out;
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
      atk: s.atk, def: s.def, spd: s.spd, mag: s.mag, lck: s.lck,
      accuracy: cls.stat_multipliers.accuracy || 0.95,
      critRate: cls.stat_multipliers.critRate || 0.05,
      lv: ch.lv || 1, exp: ch.exp || 0, gold: ch.gold || 0,
      char: ch, cls: cls,
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

  // Apply Warden's Archive Mastery Buffs (Track 2)
  if (typeof Archive !== 'undefined') {
    const mastery = Archive.getMasteryBuffs();
    G.party.forEach(m => {
      m.atk += mastery.atk;
      m.def += mastery.def;
      m.mag += mastery.mag;
      m.spd += mastery.spd;
      m.lck += mastery.lck;
    });
  }

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
}

// Apply active relic bonuses as multipliers on top of base party stats
function applyRelicBonuses() {
  const active = G.activeRelics || [];
  if (!active.length) return;
  const defs = G.relics || [];

  // Aggregate bonuses from all active relics
  const bonus = { 
    hp: 1, mp: 1, atk: 1, def: 1, spd: 1, mag: 1, lck: 1, 
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
function _getRelicStatMult() {
  const mult = { hp: 1, mp: 1, atk: 1, def: 1, spd: 1, mag: 1, lck: 1 };
  const active = G.activeRelics || [];
  if (!active.length) return mult;
  const defs = G.relics || [];
  active.forEach(id => {
    const r = defs.find(d => d.id === id);
    if (!r || !r.bonus) return;
    ['hp', 'mp', 'atk', 'def', 'spd', 'mag', 'lck'].forEach(k => {
      if (r.bonus[k]) mult[k] += r.bonus[k];
    });
  });
  return mult;
}

function checkMemberLevel(m) {
  const threshold = getExpThreshold(m.lv);
  if (!m || m.exp < threshold) return false;

  // Subtract the 'spent' experience points
  m.exp -= threshold;

  // Persist level increase to the source character data
  if (m.char) {
    m.char.lv = (m.char.lv || 1) + 1;
    m.lv = m.char.lv;
  } else {
    m.lv++;
  }

  // Recompute base stats for the new level
  const s = computeStats(m.char, m.cls);

  // Re-apply any active relic multipliers so bonuses aren't lost mid-battle
  const relicMult = _getRelicStatMult();

  const newMaxHp = Math.floor(s.hp * relicMult.hp);
  const newMaxMp = Math.floor(s.mp * relicMult.mp);
  m.hp    = Math.min(m.hp + (newMaxHp - m.maxHp), newMaxHp);
  m.mp    = Math.min(m.mp + (newMaxMp - m.maxMp), newMaxMp);
  m.maxHp = newMaxHp;
  m.maxMp = newMaxMp;
  m.atk   = Math.floor(s.atk * relicMult.atk);
  m.def   = Math.floor(s.def * relicMult.def);
  m.mag   = Math.floor(s.mag * relicMult.mag);
  m.spd   = Math.floor(s.spd * relicMult.spd);
  m.lck   = Math.floor(s.lck * relicMult.lck);

  return true;
}

