
function computeStats(ch, cls) {
  const b = ch.base_stats, m = cls.stat_multipliers, bon = ch.stat_bonuses || {};
  const out = {};
  ['hp', 'mp', 'atk', 'def', 'spd', 'mag', 'lck'].forEach(k => {
    out[k] = Math.floor((b[k] + (bon[k] || 0)) * (m[k] || 1));
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
    // Passive stat bonuses applied at battle build
    const _m = G.party[G.party.length - 1];
    if (_m.passive?.id === 'divine_authority') _m.def = Math.floor(_m.def * 1.2);
    if (_m.passive?.id === 'yakshas_valor') _m.atk = Math.floor(_m.atk * 1.15);
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
}

// Apply active relic bonuses as multipliers on top of base party stats
function applyRelicBonuses() {
  const active = G.activeRelics || [];
  if (!active.length) return;
  const defs = G.relics || [];

  // Aggregate bonuses from all active relics
  const bonus = { hp: 1, mp: 1, atk: 1, def: 1, spd: 1, mag: 1, lck: 1, healAmp: 1, mpRegen: 0, eliteResist: 0, fireResist: 0, statusResist: 0, firstStrike: false };
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
    m._healAmpRelic  = bonus.healAmp;     // used by healing logic
    m._mpRegenBonus  = bonus.mpRegen;     // extra % of maxMp per turn
    m._eliteResist   = bonus.eliteResist; // fraction of damage reduction vs Corrupted/Mutant
    m._fireResist    = bonus.fireResist;  // fraction of fire damage reduction
    m._statusResist  = bonus.statusResist; // chance (0–1) to resist debuff application
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

function checkMemberLevel(m) {
  const threshold = getExpThreshold(m.lv);
  if (!m || m.exp < threshold) return false;
  m.lv++;
  const g = m.cls.growthPerLevel || {};
  const hpGain = (g.hp || 8);
  const mpGain = (g.mp || 3);
  m.maxHp += hpGain;
  m.maxMp += mpGain;
  // NO LONGER resetting to full HP/MP on level up per user request
  // Only gain the raw amount of the stat increase
  m.hp += hpGain;
  m.mp += mpGain;
  m.atk += (g.atk || 2);
  m.def += (g.def || 1);
  m.mag += (g.mag || 1);
  m.spd += (g.spd || 1);
  m.lck += (g.lck || 1);
  return true;
}

