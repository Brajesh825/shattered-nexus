/**
 * game.js — Shattered Nexus
 * Full party battle engine: player controls all 4 members,
 * selectable enemy targets, individual levelling, party menu.
 */

/* ── Viewport height setter ──────────────────────────────────
   Sets #game height to the real viewport height on every resize
   or orientation change. CSS media queries handle all layout
   and sizing — no transform/scale is applied here, which was
   previously causing double-shrink on mobile (CSS already made
   #game responsive, then scale() squished it further to ~37%).
   ──────────────────────────────────────────────────────────── */
function scaleGame() {
  const el = document.getElementById('game');
  if (!el) return;
  // Clear any stale transform from older code
  el.style.transform = '';
  el.style.transformOrigin = '';
  el.style.marginLeft = '';
  document.body.style.justifyContent = '';
  // Fill the real viewport height — CSS handles width and layout
  el.style.height = `${window.innerHeight}px`;
}
window.addEventListener('resize', scaleGame);
window.addEventListener('orientationchange', () => setTimeout(scaleGame, 150));

/* ============================================================
   ELEMENT TYPE CHART
   Defines how attack elements interact with defender class elements.
   strong → 1.5× damage   weak → 0.5× damage   (neutral → 1.0×)
   ============================================================ */
const TYPE_CHART = {
  fire: { strong: ['ice', 'earth'], weak: ['water', 'fire'] },
  ice: { strong: ['water', 'wind'], weak: ['fire', 'ice'] },
  water: { strong: ['fire', 'earth'], weak: ['ice', 'water'] },
  wind: { strong: ['ice', 'earth'], weak: ['wind'] },
  earth: { strong: ['water', 'wind'], weak: ['earth', 'physical'] },
  holy: { strong: ['shadow'], weak: ['holy'] },
  shadow: { strong: ['holy'], weak: ['shadow'] },
  physical: { strong: [], weak: ['physical'] },
};

/* ============================================================
   BATTLE ENGINE (math helpers)
   ============================================================ */
const Battle = {
  // Returns 1.5 (weak), 0.5 (resist), or 1.0 (neutral) based on ability element vs target's arrays
  elemMult(abilityElement, target) {
    if (!abilityElement || abilityElement === 'physical') return 1.0;
    // Mutant trait overrides — check immune (0×) and shatter (2.0×) first
    const traits = target?.mutantTraits || [];
    for (const t of traits) {
      if (t.type === 'immune' && t.element === abilityElement) return 0;
      if (t.type === 'shatter' && t.element === abilityElement) return 2.0;
    }
    const weak = target?.weakTo || [];
    const resist = target?.resistTo || [];
    if (weak.includes(abilityElement)) return 1.5;
    if (resist.includes(abilityElement)) return 0.5;
    return 1.0;
  },
  // NEW: Dynamic Stat Resolver. Computes final combat stats by applying all active modifiers.
  // Formula: (m[stat] + Sum(FlatModifiers)) * Product(Multipliers)
  getStat(m, stat) {
    let base = m[stat];
    if (base === undefined || base === null) {
      if (stat === 'accuracy') base = 0.95;
      else if (stat === 'critRate') base = 0.05;
      else base = 0;
    }

    if (!m.statuses || !m.statuses.length) return base;

    let mult = 1.0;
    let flat = 0;
    m.statuses.forEach(s => {
      if (s.stat === stat) {
        if (s.type === 'mult') mult *= s.value;
        else if (s.type === 'flat') flat += s.value;
      }
    });

    // Safety cap: stats cannot be buffed beyond 3.0x base
    const finalMult = Math.min(3.0, mult);
    return (stat === 'accuracy' || stat === 'critRate')
      ? (base + flat) * finalMult
      : Math.floor((base + flat) * finalMult);
  },
  // Adds a status to an actor, handling duration refreshing for identical IDs
  addStatus(m, config) {
    if (!m.statuses) m.statuses = [];
    const existing = m.statuses.find(s => s.id === config.id);
    if (existing) {
      // Refresh: keep the highest duration and strongest multiplier
      existing.turns = Math.max(existing.turns, config.turns);
      if (config.type === 'mult') existing.value = Math.max(existing.value, config.value);
      return;
    }
    m.statuses.push({
      id: config.id,
      label: config.label || config.id,
      icon: config.icon || '✨',
      stat: config.stat,
      type: config.type || 'mult',
      value: config.value || 1.0,
      turns: config.turns || 3,
      color: config.color || 'var(--amber)'
    });
  },
  // Returns 'weak'|'resist'|'immune'|'shatter'|null for UI display
  elemResult(abilityElement, target) {
    if (!abilityElement || abilityElement === 'physical') return null;
    const traits = target?.mutantTraits || [];
    for (const t of traits) {
      if (t.type === 'immune' && t.element === abilityElement) return 'immune';
      if (t.type === 'shatter' && t.element === abilityElement) return 'shatter';
    }
    const weak = target?.weakTo || [];
    const resist = target?.resistTo || [];
    if (weak.includes(abilityElement)) return 'weak';
    if (resist.includes(abilityElement)) return 'resist';
    return null;
  },
  // Returns multiplier for enemy attacks vs party member (based on member's class element)
  // null element (Summoner) = no affinity, always neutral
  playerElemMult(attackElement, partyMember) {
    if (!attackElement || attackElement === 'physical') return 1.0;
    const clsElem = partyMember?.cls?.element;
    if (!clsElem) return 1.0; // element-neutral (Summoner)
    const row = TYPE_CHART[attackElement];
    if (!row) return 1.0;
    if (row.strong.includes(clsElem)) return 1.5;
    if (row.weak.includes(clsElem)) return 0.5;
    return 1.0;
  },
  // Returns 'weak'|'resist'|null for UI feedback when enemy attacks a party member
  playerElemResult(attackElement, partyMember) {
    if (!attackElement || attackElement === 'physical') return null;
    const clsElem = partyMember?.cls?.element;
    if (!clsElem) return null; // element-neutral (Summoner)
    const row = TYPE_CHART[attackElement];
    if (!row) return null;
    if (row.strong.includes(clsElem)) return 'weak';
    if (row.weak.includes(clsElem)) return 'resist';
    return null;
  },
  // Rolls for a hit based on attacker accuracy and defender evasion
  rollHit(attacker, defender) {
    const acc = this.getStat(attacker, 'accuracy');
    const eva = defender.evasion || 0; // evasion is currently treated as a flat 0-1 chance
    const chance = acc - eva;
    if (window.LogDebug) window.LogDebug(`[HitRoll] ${attacker.displayName || attacker.name} vs ${defender.displayName || defender.name}: ${Math.round(chance * 100)}% chance`, 'info');
    return Math.random() < chance;
  },
  // Rolls for a critical hit based on attacker's critRate and LCK
  // Every 10 LCK adds +1% crit rate
  rollCrit(attacker) {
    const baseCrit = this.getStat(attacker, 'critRate');
    const lckBonus = (this.getStat(attacker, 'lck') || 0) * 0.001;
    const chance = baseCrit + lckBonus;
    const isCrit = Math.random() < chance;
    if (isCrit && window.LogDebug) window.LogDebug(`[CritRoll] ${attacker.displayName || attacker.name} CRITICAL! (${Math.round(chance * 100)}% chance)`, 'buff');
    return isCrit;
  },

  /* ── CATALYST & SYNERGY SYSTEM (PHASE 4) ────────────────── */

  // Applies or overwrites an elemental aura on the target, respecting immunities
  applyAura(target, element) {
    if (!element || element === 'physical' || element === 'holy' || element === 'shadow') return;

    // Check Immunity
    if (this.elemResult(element, target) === 'immune') {
      if (window.LogDebug) window.LogDebug(`[Aura] ${target.displayName || target.name} is immune to ${element}; priming failed.`, 'dmg');
      return;
    }

    // Auras last 2 turns (resisted = 1 turn)
    const mult = this.elemMult(element, target);
    const duration = mult < 1.0 ? 1 : 2;

    const auraTable = {
      fire: { id: 'aura_fire', label: 'Fire Aura', icon: '🔥', color: '#ff4400' },
      ice: { id: 'aura_ice', label: 'Ice Aura', icon: '❄️', color: '#00ccff' },
      water: { id: 'aura_water', label: 'Water Aura', icon: '💧', color: '#0066ff' },
      nature: { id: 'aura_nature', label: 'Nature Aura', icon: '🌿', color: '#22cc44' },
      lightning: { id: 'aura_lightning', label: 'Spark Aura', icon: '⚡', color: '#ffcc00' }
    };

    const config = auraTable[element];
    if (!config) return;

    // Remove any existing aura before applying new one (One Aura Rule)
    target.statuses = (target.statuses || []).filter(s => !s.id.startsWith('aura_'));

    this.addStatus(target, {
      ...config,
      stat: 'aura', // placeholder stat
      type: 'aura',
      value: 1.0,
      turns: duration,
      color: config.color || '#ffcc00'
    });

    if (window.LogDebug) window.LogDebug(`[Aura] Applied ${config.label} to ${target.displayName || target.name}`, 'buff');
  },

  // Checks for an elemental reaction based on existing aura and incoming detonator
  // Returns reaction object or null
  triggerReaction(target, detonator) {
    if (!target.statuses || !target.statuses.length) return null;
    const aura = target.statuses.find(s => s.id.startsWith('aura_'));
    if (!aura) return null;

    const auraType = aura.id.replace('aura_', '');
    let reaction = null;

    // DETERMINISTIC PRIORITY TABLE
    // 1. Ice Aura reactions
    if (auraType === 'ice') {
      if (detonator === 'physical' || detonator === 'earth') reaction = { id: 'shatter', label: 'SHATTER', color: '#00ccff', dmgMult: 1.5, debuff: 'def' };
      else if (detonator === 'fire') reaction = { id: 'melt', label: 'MELT', color: '#ffaa00', dmgMult: 2.0 };
    }
    // 2. Fire Aura reactions
    else if (auraType === 'fire') {
      if (detonator === 'nature') reaction = { id: 'conflagration', label: 'CONFLAGRATION', color: '#ff4400', dmgMult: 1.25, isAOE: true };
      else if (detonator === 'water') reaction = { id: 'vaporize', label: 'VAPORIZE', color: '#55aaff', dmgMult: 2.0 };
      else if (detonator === 'ice') reaction = { id: 'melt', label: 'MELT', color: '#ffaa00', dmgMult: 1.5 };
    }
    // 3. Water Aura reactions
    else if (auraType === 'water') {
      if (detonator === 'lightning') reaction = { id: 'conductive', label: 'CONDUCTIVE', color: '#ffcc00', dmgMult: 1.3, stun: true };
    }
    // 4. Nature Aura reactions
    else if (auraType === 'nature') {
      if (detonator === 'fire') reaction = { id: 'burn', label: 'BURNING', color: '#ee4400', dmgMult: 1.2, dot: true };
    }

    if (reaction) {
      // Consume the aura upon reaction
      target.statuses = target.statuses.filter(s => s !== aura);

      // Affect reaction effectiveness by Resist/Weakness
      const m = this.elemMult(detonator, target);
      if (m < 1.0) { // Resist
        reaction.dmgMult = (reaction.dmgMult - 1) * 0.5 + 1; // Half the bonus
        reaction.isDampened = true;
      } else if (m > 1.0) { // Weakness
        reaction.dmgMult *= 1.5;
        reaction.isViolent = true;
      }
    }

    return reaction;
  },
  physDmg(atk, def, mult = 1, atkLevel = 1, defLevel = 1, defPen = 0, source = 'Actor', target = 'Target', isCrit = false) {
    // NEW: heavier level-weighting + stronger defense factor (0.75x)
    const scaledAtk = atk + (atkLevel * 1.2);
    // defPen: reduces effectiveness of enemy defense (e.g. 0.2 removes 20% of DEF)
    const effectiveDef = def * (1 - Math.min(0.9, defPen));
    const scaledDef = effectiveDef + (defLevel * 0.6);
    const base = Math.max(1, scaledAtk - scaledDef * 0.75);
    const critMult = isCrit ? 2.0 : 1.0;
    const final = Math.max(1, Math.floor(base * (0.85 + Math.random() * 0.3) * mult * critMult));

    if (window.LogDebug) {
      window.LogDebug(`[${source} ➔ ${target}] PhysCalc: Atk(${atk})+LvBonus(${Math.round(atkLevel * 1.2)}) - [Def(${def})*Pen(${Math.round(defPen * 100)}%)+LvBonus(${Math.round(defLevel * 0.6)})]*0.75 = ${Math.round(base)} (Final: ${final})`, 'dmg');
    }
    return final;
  },
  // targetMag / targetMagLv = Spirit Defense (SDEF) — high-MAG targets resist magic
  magicDmg(mag, mult = 1, passiveBonus = 1, magLevel = 1, targetMag = 0, targetMagLv = 1, source = 'Actor', target = 'Target', isCrit = false) {
    const scaledMag = mag + (magLevel * 0.8);
    const magMitigation = (targetMag + targetMagLv * 0.3) * 0.4;
    const base = Math.max(1, scaledMag - magMitigation);
    const critMult = isCrit ? 2.0 : 1.0;
    const final = Math.max(1, Math.floor(base * (0.9 + Math.random() * 0.2) * mult * passiveBonus * critMult));

    if (window.LogDebug) {
      window.LogDebug(`[${source} ➔ ${target}] MagCalc: Mag(${mag})+LvBonus(${Math.round(magLevel * 0.8)}) - [T.Mag(${targetMag})+T.LvBonus(${Math.round(targetMagLv * 0.3)})]*0.4 = ${Math.round(base)} (Final: ${final})`, 'dmg');
    }
    return final;
  },
  pickAbility(actor, target) {
    const abilities = actor.abilities || actor.abilityDefs;
    if (!abilities || !abilities.length) return null;

    // Phase 5: Synergy-Aware Weighting
    const aura = target?.statuses?.find(s => s.id.startsWith('aura_'));
    const auraType = aura ? aura.id.replace('aura_', '') : null;

    const weightedAbilities = abilities.map(ab => {
      let weight = ab.weight || 50;
      const element = ab.effect?.element || actor.element || 'physical';

      // If we have an aura and this move triggers a reaction, boost weight significantly
      if (auraType) {
        if (this._willReact(auraType, element)) {
          weight *= 3; // Prioritize reactions!
          if (window.LogDebug) window.LogDebug(`[AI-Synergy] Weight boosted for ${ab.name} (Element: ${element} vs Aura: ${auraType})`, 'hi');
        }
      }
      return { ...ab, _tempWeight: weight };
    });

    const total = weightedAbilities.reduce((s, a) => s + a._tempWeight, 0);
    let r = Math.random() * total;
    for (const a of weightedAbilities) {
      r -= a._tempWeight;
      if (r <= 0) return a;
    }
    return weightedAbilities[0];
  },

  // Helper for AI to check if reaction is possible
  _willReact(auraType, detonator) {
    if (auraType === 'ice' && (detonator === 'physical' || detonator === 'earth' || detonator === 'fire')) return true;
    if (auraType === 'fire' && (detonator === 'nature' || detonator === 'water' || detonator === 'ice')) return true;
    if (auraType === 'water' && detonator === 'lightning') return true;
    if (auraType === 'nature' && detonator === 'fire') return true;
    return false;
  },
  alive(m) { return m && !m.isKO && m.hp > 0; },

  // Handles turn-start maintenance: ticking down buffs/debuffs/cooldowns
  // and reporting active status to the debug log.
  tickActorStatus(m, isEnemy = false) {
    if (!m || !this.alive(m)) return;

    // 1. Report Active Status
    if (window.LogDebug) {
      const activeEffects = [];
      const summary = activeEffects.length > 0 ? activeEffects.join(', ') : 'None';
      window.LogDebug(`[Turn Start] ${m.displayName || m.name}: Active Status: ${summary}`, 'info');
    }

    // 2. Resource Regen (Players only)
    if (!isEnemy) {
      // Base MP regen + Relic bonus
      const mpRegenAmt = 3 + Math.floor((m._mpRegenBonus || 0) * m.maxMp);
      m.mp = Math.min(m.maxMp, m.mp + mpRegenAmt);

      // Nature's Grace (Passive)
      if (m.passive?.id === 'natures_grace' && m.hp < m.maxHp) {
        m.hp = Math.min(m.maxHp, m.hp + 5);
        if (window.LogDebug) window.LogDebug(`[Passive] ${m.displayName}: Nature's Grace (+5 HP)`, 'passive');
      }

      // Divine Blessing (Aura)
      const _hasDivBless = G.party.some(p => this.alive(p) && p.passive?.id === 'divine_blessing');
      if (_hasDivBless && m.hp < m.maxHp) {
        const _dbAmt = Math.max(1, Math.floor(m.maxHp * 0.15));
        m.hp = Math.min(m.maxHp, m.hp + _dbAmt);
        if (window.LogDebug) window.LogDebug(`[Passive] ${m.displayName}: Divine Blessing aura (+${_dbAmt} HP)`, 'passive');
      }
    }

    // 3. Status Ticks
    // (Status effects now tracked exclusively in m.statuses, ticked below)

    if (m.healBoostTurns > 0) {
      m.healBoostTurns--;
      if (m.healBoostTurns <= 0) m.healBoost = 1.0;
    }

    if (m.cooldowns) {
      for (const id in m.cooldowns) if (m.cooldowns[id] > 0) m.cooldowns[id]--;
    }

    // NEW: Centralized Status Ticking
    if (m.statuses && m.statuses.length) {
      for (let i = m.statuses.length - 1; i >= 0; i--) {
        const s = m.statuses[i];
        s.turns--;
        if (s.turns <= 0) {
          if (window.LogDebug) window.LogDebug(`[Status] ${m.displayName || m.name}: ${s.label} expired`, 'info');
          m.statuses.splice(i, 1);
        }
      }
    }

    // Regen Ticks (Consolidate into legacy check for now to avoid breaking existing logic)
    if (m.regenTurns > 0) {
      m.regenTurns--;
      const amt = m.hpRegenAmt || 8;
      m.hp = Math.min(m.maxHp, m.hp + amt);
      if (window.LogDebug) window.LogDebug(`[Status] ${m.displayName || m.name}: Regen tick (+${amt} HP) - ${m.regenTurns} turns left`, 'buff');
    }
  }
};

/* ============================================================
   GAME STATE
   ============================================================ */
const G = {
  chars: [],
  classes: [],
  enemies: [],
  items: [],          // item definitions from ITEMS_DATA
  inventory: [],          // [{ itemId, qty }] — party's bag (max 20 stacks)
  relics: [],       // relic definitions from RELICS_DATA
  ownedRelics: [],       // relic IDs the party has collected
  activeRelics: [],       // relic IDs currently equipped (max 3)
  selectedChar: null,
  selectedClass: null,
  selectedChars: [],   // ordered array of up to 4 char IDs
  unlockedChars: ['ayaka', 'hutao', 'nilou', 'xiao'],  // Characters available for selection
  clearedMaps: [],   // map IDs whose objective has been completed
  npcTalked: {},   // { mapId: [npcId, ...] } — persisted across sessions

  party: [],   // 4 party members (all player-controlled)
  enemyGroup: [],   // 1–3 enemies
  turnQueue: [],   // [{type:'party'|'enemy', idx, spd}]
  turnIdx: 0,
  activeMemberIdx: 0,    // which party member is currently acting
  targetEnemyIdx: 0,    // which enemy is selected as attack target
  busy: false,
  mode: 'free', // 'free' | 'story' | 'explore'

  activePartyIdx: 0,   // which party member walks the map

  // Backward-compat accessors for story.js
  get hero() {
    return this.party[this.activePartyIdx] || this.party.find(m => m.isPlayer) || this.party[0] || null;
  },
  get enemy() {
    const e = this.enemyGroup[this.targetEnemyIdx];
    if (e && Battle.alive(e)) return e;
    return this.enemyGroup.find(e => Battle.alive(e)) || this.enemyGroup[0] || null;
  },
  enemyIdx: 0,
};

/* ============================================================
   UI HELPERS
   ============================================================ */
const CHAR_COLOR = {
  ayaka: '#7dd3fc', hutao: '#ef4444', nilou: '#2dd4bf', xiao: '#4ade80',
  rydia: '#a78bfa', lenneth: '#e879f9', kain: '#0ea5e9', leon: '#fbbf24'
};
const ENEMY_POP_X = [580, 720, 860, 650]; // 4th is between 1st and 2nd for diamond layout
const PARTY_POP_X = [42, 108, 174, 240];
const TYPE_ICONS = {
  physical: '🗡️',
  magic_damage: '🔮',
  heal: '💚',
  buff: '🛡️',
  debuff: '☣️',
  regen: '🌿'
};

/* ============================================================
   MOVE ANIMATION MAPPINGS
   Each move has actor duration, overlay duration, and ultimate flag
   ============================================================ */
// Loaded from data/move-animations.json via loadAllGameData()
// Edit timing values there, not here.
let moveAnimations = {};

const UI = {
  el: id => document.getElementById(id),

  show(id) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = ''; // Clear inline display style
    });
    this.el(id).classList.add('active');
    requestAnimationFrame(scaleGame); // re-measure after new screen content renders
    const steps = { 'char-screen': 1, 'battle-screen': 2, 'result-screen': 2 };
    const cur = steps[id] || 0;
    document.querySelectorAll('.step').forEach(s => {
      const n = +s.dataset.step;
      s.classList.toggle('active', n === cur);
      s.classList.toggle('done', n < cur);
    });
  },

  log: ['', '', ''],
  setLog(lines, cls = []) {
    this.log = [...lines].slice(-3);
    while (this.log.length < 3) this.log.unshift('');
    ['log0', 'log1', 'log2'].forEach((id, i) => {
      const el = this.el(id);
      el.textContent = this.log[i] || '';
      el.className = 'log-line ' + (cls[i] || '');
    });
  },
  addLog(txt, cl = '') {
    this.log = [...this.log.slice(-2), txt];
    this.setLog(this.log, ['', '', cl]);
  },

  // Backward compat (story.js)
  updateBars() { this.renderPartyStatus(); this.renderEnemyRow(); },

  updateStats() {
    const h = G.party[G.activeMemberIdx] || G.hero;
    if (!h) return;
    this.el('stat-lv').textContent = h.lv;
    this.el('stat-atk').textContent = Battle.getStat(h, 'atk');
    this.el('stat-def').textContent = Battle.getStat(h, 'def');
    this.el('stat-lck').textContent = Battle.getStat(h, 'lck');
    this.el('stat-exp').textContent = h.exp;
  },

  pop(x, y, val, type = '', element = 'physical') {
    const s = this.el('battle-scene');
    if (!s) return;
    const d = document.createElement('div');
    d.className = 'dmg-pop ' + type + ' element-' + element;
    if (type === 'crit') {
      d.textContent = 'CRITICAL!';
      d.style.color = '#ffbf00';
      d.style.fontWeight = '900';
      d.style.fontSize = '20px';
      d.style.textShadow = '0 0 8px rgba(255,191,0,0.8)';
    } else if (type === 'miss') {
      d.textContent = 'MISS';
      d.style.color = '#aaaaaa';
    } else {
      d.textContent = (type === 'heal' || type === 'regen') ? '+' + val : '-' + Math.abs(val);
    }
    d.style.left = x + 'px'; d.style.top = y + 'px';
    s.appendChild(d);
    setTimeout(() => d.remove(), 1100);
  },
  popEnemy(idx, val, type, element = 'physical') { this.pop(ENEMY_POP_X[idx] || 580, 80, val, type, element); },
  popParty(idx, val, type, element = 'light') { this.pop(PARTY_POP_X[idx] || 42, 210, val, type, element); },
  popAI(idx, txt) {
    const s = this.el('battle-scene');
    if (!s) return;
    const d = document.createElement('div');
    d.className = 'dmg-pop ai-pop';
    d.textContent = txt;
    // Position slightly above the enemy
    d.style.left = (ENEMY_POP_X[idx] || 580) + 'px';
    d.style.top = '30px';
    d.style.color = '#00f2ff';
    d.style.fontSize = '12px';
    d.style.fontFamily = 'var(--px)';
    d.style.textShadow = '0 0 10px #00f2ff80';
    d.style.background = 'rgba(0,30,50,0.8)';
    d.style.padding = '4px 8px';
    d.style.borderRadius = '5px';
    d.style.border = '1px solid #00f2ff';
    d.style.whiteSpace = 'nowrap';
    d.style.zIndex = '100';
    s.appendChild(d);
    setTimeout(() => d.remove(), 1500);
  },

  btns(on) { document.querySelectorAll('.cmd-btn').forEach(b => b.disabled = !on); },

  openSub(id) {
    document.querySelectorAll('.sub-menu').forEach(m => m.classList.remove('open'));
    if (id) this.el(id).classList.add('open');
    this.el('cmd-grid-main').style.display = id ? 'none' : 'grid';
  },

  /* ── Full battle UI render ──────────────────────────── */
  renderBattleUI() {
    this.renderTurnBar();
    this.renderEnemyRow();
    this.renderPartyRow();
    this.renderPartyStatus();
    this.renderActiveMemberBar();
    this.updateStats();
  },

  /* ── Turn order tokens ──────────────────────────────── */
  renderTurnBar() {
    const bar = this.el('turn-bar');
    if (!bar) return;
    bar.innerHTML = '';
    G.turnQueue.forEach((t, i) => {
      const unit = t.type === 'party' ? G.party[t.idx] : G.enemyGroup[t.idx];
      if (!unit) return;
      const isEnemy = t.type === 'enemy';
      const color = isEnemy ? '#ff7070' : (CHAR_COLOR[unit.charId] || '#c0b8e8');
      const label = (unit.displayName || unit.name || '?')[0].toUpperCase();
      const tok = document.createElement('div');
      tok.className = 'tb-tok' +
        (i === G.turnIdx ? ' active-tok' : '') +
        (isEnemy ? ' enemy-tok' : '') +
        (!Battle.alive(unit) ? ' dead-tok' : '');
      tok.style.borderColor = Battle.alive(unit) ? color : '#333';
      tok.style.color = Battle.alive(unit) ? color : '#444';
      tok.textContent = label;
      tok.title = (unit.displayName || unit.name || '') + (Battle.alive(unit) ? ` (HP ${unit.hp}/${unit.maxHp})` : ' [KO]');
      bar.appendChild(tok);
    });
  },

  /* ── Enemy sprites (Pyramid on RIGHT side) ─────────── */
  renderEnemyRow() {
    const container = this.el('enemy-container');
    if (!container) return;
    container.innerHTML = '';

    const count = G.enemyGroup.length; // 1–4
    container.dataset.count = count;

    // ── Per-enemy sprite size: tier base × count scale × mutation bonus ──────
    // Tier sets the "class" of the creature (goblin vs demon).
    // Count scale keeps sprites from crushing each other in crowded groups.
    // Mutation bonus makes corrupted/mutant visually bulkier.
    // Viewport scale: at ≥1600px tier-1 base matches party sprite height (~180px).
    const vw = window.innerWidth;
    const VP_SCALE = vw >= 1800 ? 1.35 : 1.0;
    const TIER_BASE_W = {
      1: Math.round(130 * VP_SCALE),
      2: Math.round(180 * VP_SCALE),
      3: Math.round(240 * VP_SCALE)
    };
    const COUNT_SCALE = { 1: 1.00, 2: 0.87, 3: 0.75, 4: 0.64 };
    const MUTATION_MULT = { normal: 1.00, corrupted: 1.12, mutant: 1.28 };
    const ASPECT = 1.23; // height = width × aspect

    G.enemyGroup.forEach((e, i) => {
      const alive = Battle.alive(e);
      const pct = Math.max(0, e.hp / e.maxHp * 100);

      // Compute this enemy's individual sprite size
      const tierW = TIER_BASE_W[e.tier || 1] || TIER_BASE_W[1];
      const cScale = COUNT_SCALE[count] || COUNT_SCALE[4];
      const mMult = MUTATION_MULT[e.mutation || 'normal'] || 1.0;
      const sprW = Math.round(tierW * cScale * mMult);
      const sprH = Math.round(sprW * ASPECT);

      // Enemy wrapper
      const enemy = document.createElement('div');
      enemy.className = 'enemy' + (!alive ? ' ko-enemy' : '');
      enemy.dataset.idx = i;
      enemy.dataset.target = i === G.targetEnemyIdx ? 'true' : 'false';
      enemy.onclick = () => selectTarget(i);

      // Sprite — sized by tier + count + mutation
      const spr = document.createElement('img');
      const _mutCls = e.mutation === 'mutant' ? ' enemy-mutant'
        : e.mutation === 'corrupted' ? ' enemy-corrupted' : '';
      spr.className = 'enemy-sprite' + _mutCls;
      spr.id = 'espr-' + i;
      spr.style.width = sprW + 'px';
      spr.style.height = sprH + 'px';
      SpriteRenderer.drawEnemy(spr, e.id, e.palette);
      enemy.appendChild(spr);

      // HP bar background
      const hpBg = document.createElement('div');
      hpBg.className = 'enemy-hp-bar-bg';
      enemy.appendChild(hpBg);

      // HP bar fill
      const hpBar = document.createElement('div');
      hpBar.className = 'enemy-hp-bar-fill';
      hpBar.style.width = pct + '%';
      hpBar.style.background = pct > 50 ? '#4ade80' : pct > 25 ? '#eab308' : '#ef4444';
      hpBg.appendChild(hpBar);

      // Enemy info (name + level + mutation traits)
      const info = document.createElement('div');
      info.className = 'enemy-info';
      let traitHtml = '';
      if (e.mutantTraits?.length) {
        traitHtml = `<div class="enemy-traits">${e.mutantTraits.map(t =>
          `<span class="trait-pill">${t.label}</span>`
        ).join('')}</div>`;
      }
      info.innerHTML = `<div class="enemy-name">${e.name}</div><div class="enemy-level">Lv ${e.level}</div>${traitHtml}`;
      enemy.appendChild(info);

      // Target indicator
      if (i === G.targetEnemyIdx && alive) {
        const indicator = document.createElement('div');
        indicator.className = 'target-indicator';
        indicator.textContent = '◀';
        enemy.appendChild(indicator);
      }

      container.appendChild(enemy);
    });
  },

  /* ── Party sprites (2x2 grid at bottom) ────────────── */
  renderPartyRow() {
    const container = this.el('party-container');
    if (!container) return;
    container.innerHTML = '';

    G.party.forEach((m, i) => {
      const col = CHAR_COLOR[m.charId] || '#c0b8e8';
      const alive = Battle.alive(m);
      const pct = Math.max(0, m.hp / m.maxHp * 100);

      // Party member wrapper
      const member = document.createElement('div');
      member.className = 'party-member' + (!alive ? ' ko-member' : '');
      member.dataset.idx = i;
      member.style.color = col;

      // Sprite
      const spr = document.createElement('img');
      spr.className = 'party-sprite';
      spr.id = 'pspr-' + i;
      SpriteRenderer.drawHero(spr, m.charId, m.char, m.cls);
      member.appendChild(spr);

      // HP bar background
      const hpBg = document.createElement('div');
      hpBg.className = 'party-hp-bar-bg';
      member.appendChild(hpBg);

      // HP bar fill
      const hpBar = document.createElement('div');
      hpBar.className = 'party-hp-bar-fill';
      hpBar.style.width = pct + '%';
      hpBar.style.background = pct > 50 ? '#4ade80' : pct > 25 ? '#eab308' : '#ef4444';
      hpBg.appendChild(hpBar);

      // Party member info (name + level)
      const info = document.createElement('div');
      info.className = 'party-info';
      info.style.color = col;
      info.innerHTML = `<div class="party-name">${m.displayName}</div><div class="party-level">Lv ${m.lv}</div>`;
      member.appendChild(info);

      // KO indicator
      if (!alive) {
        const koLbl = document.createElement('div');
        koLbl.className = 'ko-badge';
        koLbl.textContent = 'KO';
        member.appendChild(koLbl);
      }

      container.appendChild(member);
    });
    this._highlightActiveMember();
  },

  _highlightActiveMember() {
    const t = G.turnQueue[G.turnIdx];
    document.querySelectorAll('.party-member').forEach((w, i) => {
      const isActive = t && t.type === 'party' && t.idx === i;
      w.classList.toggle('active-member', isActive);
      const col = CHAR_COLOR[G.party[i]?.charId] || '#c0b8e8';
      w.style.borderColor = isActive ? col + '50' : 'transparent';
      w.style.filter = isActive ? `drop-shadow(0 0 6px ${col}80)` : 'none';
    });
  },

  /* ── Party status cards (bottom bar) ────────────────── */
  renderPartyStatus() {
    const bar = this.el('party-status-bar');
    if (!bar) return;
    bar.innerHTML = '';
    G.party.forEach((m, i) => {
      const col = CHAR_COLOR[m.charId] || '#c0b8e8';
      const hpPct = Math.max(0, m.hp / m.maxHp * 100);
      const mpPct = Math.max(0, m.mp / m.maxMp * 100);
      const hpCol = hpPct > 50 ? 'var(--hp-hi)' : hpPct > 25 ? 'var(--hp-mid)' : 'var(--hp-lo)';
      const isActive = G.turnQueue[G.turnIdx]?.type === 'party' && G.turnQueue[G.turnIdx]?.idx === i;

      const card = document.createElement('div');
      card.className = 'psc' + (m.isKO ? ' ko-psc' : '') + (isActive ? ' active-psc' : '');
      card.style.borderColor = isActive ? col : col + '50';

      const statusHtml = this._renderPSCStatuses(m);

      card.innerHTML = `
        <div class="psc-header">
          <div class="psc-name" style="color:${col}">${m.displayName} <span class="psc-lv">L${m.lv}</span></div>
          <div class="psc-statuses">${statusHtml}</div>
        </div>
        <div class="psc-hp-bg"><div class="psc-hp-bar" style="width:${hpPct}%;background:${hpCol}"></div></div>
        <div class="psc-hp-txt">${Math.max(0, m.hp)}/${m.maxHp} HP · ${m.mp}/${m.maxMp} MP</div>
        <div class="psc-mp-bg"><div class="psc-mp-bar" style="width:${mpPct}%"></div></div>`;
      bar.appendChild(card);
    });
  },

  _renderPSCStatuses(m) {
    const tokens = [];
    const push = (icon, turns, cl = '') => {
      if (turns === undefined || turns === null || turns === '-') tokens.push(`<div class="psct ${cl}">${icon}</div>`);
      else tokens.push(`<div class="psct ${cl}">${icon}<span class="psct-cnt">${turns}</span></div>`);
    };

    // Render from the new centralized status system
    if (m.statuses) {
      m.statuses.forEach(s => {
        let cls = s.id.includes('debuff') || s.type === 'debuff' ? 'debuff' : 'buff';
        if (s.type === 'aura') cls = 'aura';
        push(s.icon, s.turns, cls);
      });
    }

    // Keep legacy checks for statuses not yet migrated (frozen, stunned, etc.)
    if (m.regenTurns > 0) push('🌿', m.regenTurns, 'regen');
    if (m.healBoostTurns > 0) push('💖', m.healBoostTurns, 'buff');
    if (m.guardMarkTurns > 0) push('🛡️', m.guardMarkTurns, 'guard');
    if (m.guardianTurns > 0) push('🛡️', m.guardianTurns, 'guard');
    if (m.dmgReduction < 1) push('💎', '-', 'buff');
    if (m.frozen > 0) push('❄️', m.frozen, 'debuff');
    if (m.stunned) push('💫', '1', 'debuff');

    return tokens.join('');
  },

  _getBuffReport(m) {
    if (!m) return '';
    const parts = [];
    const _fmt = v => (v >= 1) ? `+${Math.round((v - 1) * 100)}%` : `-${Math.round((1 - v) * 100)}%`;

    if (m.statuses) {
      m.statuses.forEach(s => {
        if (s.type === 'mult') parts.push(`${s.label} ${_fmt(s.value)}`);
        else parts.push(`${s.label} +${s.value}`);
      });
    }

    // Keep legacy checks for non-migrated statuses
    if (m.dmgReduction < 1) parts.push(`Shield ${Math.round((1 - m.dmgReduction) * 100)}%`);
    if (m.regenTurns > 0) parts.push(`Regen`);
    if (m.guardMark) parts.push(`Guard`);
    if (m.frozen > 0) parts.push(`Frozen`);
    if (m.stunned) parts.push(`Stunned`);

    return parts.length ? ` (${parts.join(', ')})` : '';
  },

  /* ── Active member action bar ───────────────────────── */
  renderActiveMemberBar() {
    const bar = this.el('active-member-bar');
    if (!bar) return;
    const t = G.turnQueue[G.turnIdx];
    if (!t || t.type !== 'party') {
      bar.innerHTML = '<span style="color:#5a527a">Enemy acting…</span>';
      return;
    }
    const m = G.party[t.idx];
    const col = CHAR_COLOR[m.charId] || '#c0b8e8';
    bar.innerHTML =
      `<span class="amb-arrow" style="color:${col}">▶</span>` +
      `<span class="amb-name" style="color:${col}">${m.displayName}</span>` +
      `<span class="amb-class">${m.cls.name} · LV ${m.lv}</span>` +
      `<span class="amb-mp" style="color:#6080ff">MP ${m.mp}/${m.maxMp}</span>`;
  },

  /* ── Party profile menu ─────────────────────────────── */
  renderPartyMenu() {
    const cards = this.el('pm-cards');
    if (!cards) return;
    cards.innerHTML = '';
    G.party.forEach((m, i) => {
      const col = CHAR_COLOR[m.charId] || '#c0b8e8';
      const hpPct = Math.max(0, m.hp / m.maxHp * 100);
      const mpPct = Math.max(0, m.mp / m.maxMp * 100);
      const hpCol = hpPct > 50 ? 'var(--hp-hi)' : hpPct > 25 ? 'var(--hp-mid)' : 'var(--hp-lo)';
      const card = document.createElement('div');
      card.className = 'pm-card';
      card.style.borderColor = col + '80';

      // Portrait + name header
      const img = document.createElement('img');
      img.className = 'pm-portrait'; img.alt = m.displayName;
      SpriteRenderer.drawHero(img, m.charId, m.char, m.cls);

      const abHtml = (m.abilities || []).map(a =>
        `<div class="pm-ab"><span class="pm-ab-icon">${a.icon || '⚡'}</span><span class="pm-ab-name">${a.name}</span><span class="pm-ab-mp">${a.mp}MP</span></div>`
      ).join('');

      card.innerHTML = `
        <div class="pm-card-top" style="border-bottom-color:${col}40">
          <div class="pm-portrait-wrap"></div>
          <div class="pm-card-head">
            <div class="pm-card-name" style="color:${col}">${m.displayName}</div>
            <div class="pm-card-class">${m.cls.name} ${m.isKO ? '<span class="pm-ko-badge">KO</span>' : ''}</div>
            <div class="pm-card-lv">LEVEL <span style="color:${col}">${m.lv}</span>
              · EXP <span style="color:var(--gold)">${m.exp}</span>/<span style="color:var(--text-dim)">${30 * m.lv}</span></div>
          </div>
        </div>
        <div class="pm-bars">
          <div class="pm-bar-row">HP
            <div class="pm-bar-bg"><div class="pm-bar-fill" style="width:${hpPct}%;background:${hpCol}"></div></div>
            <span>${Math.max(0, m.hp)}/${m.maxHp}</span>
          </div>
          <div class="pm-bar-row">MP
            <div class="pm-bar-bg"><div class="pm-bar-fill" style="width:${mpPct}%;background:#5060ff"></div></div>
            <span>${m.mp}/${m.maxMp}</span>
          </div>
        </div>
        <div class="pm-stats">
          <div class="pm-stat"><span>ATK</span><span style="color:var(--gold)">${m.atk}</span></div>
          <div class="pm-stat"><span>DEF</span><span style="color:var(--gold)">${m.def}</span></div>
          <div class="pm-stat"><span>MAG</span><span style="color:var(--gold)">${m.mag}</span></div>
          <div class="pm-stat"><span>SPD</span><span style="color:var(--gold)">${m.spd}</span></div>
        </div>
        <div class="pm-passive">
          <span class="pm-passive-tag">★ ${m.passive?.name || 'Passive'}</span>
          <span class="pm-passive-desc">${m.passive?.description || ''}</span>
        </div>
        <div class="pm-abilities">${abHtml}</div>`;

      // Insert portrait image
      card.querySelector('.pm-portrait-wrap').appendChild(img);
      cards.appendChild(card);
    });
  },
};
function buildEnemyGroup(defs, spawnLevel = 1, isBoss = false) {
  // Tier-based growth rates
  const tierGrowth = {
    // NEW growth rates — ensures enemies scale as threats through Lv40
    1: { hp: 5, atk: 1.2, def: 0.5, spd: 0.5, mag: 0.3, statMult: 1.0, expMult: 1.0 },
    2: { hp: 10, atk: 2.5, def: 1.0, spd: 0.8, mag: 0.5, statMult: 1.3, expMult: 1.5 },
    3: { hp: 18, atk: 4.5, def: 1.8, spd: 1.2, mag: 0.8, statMult: 1.7, expMult: 2.5 },
  };

  // Boss multiplier: solo boss gets beefed-up base stats on top of higher level.
  // 1.3x keeps bosses clearly stronger than normal T3 encounters without one-shotting
  // glass cannons at the party level that enters each arc.
  const bossMult = isBoss ? 1.3 : 1.0;

  // Horde scaling: 3+ enemies get reduced individual stats so they're dangerous
  // but not overwhelming. Scales down as group grows.
  const hordeScale = defs.length >= 4 ? 0.65 : defs.length === 3 ? 0.78 : 1.0;

  G.enemyGroup = defs.slice(0, 4).map(def => {
    const tier = def.tier || 1;
    const growth = tierGrowth[tier] || tierGrowth[1];

    const calcStat = (baseStat, statKey) => {
      const base = baseStat * growth.statMult * hordeScale * bossMult;
      const levelBonus = growth[statKey] * (spawnLevel - 1) * hordeScale * bossMult;
      return Math.max(1, Math.floor(base + levelBonus));
    };

    const finalHp = calcStat(def.stats.hp, 'hp');
    const finalAtk = calcStat(def.stats.atk, 'atk');
    const finalDef = calcStat(def.stats.def, 'def');
    const finalSpd = calcStat(def.stats.spd, 'spd');
    const finalMag = calcStat(def.stats.mag, 'mag');
    // EXP/gold scale by count so total reward is fair
    const finalExp = Math.floor(def.reward.exp * growth.expMult * hordeScale);
    const finalGold = Math.floor(def.reward.gold * growth.expMult * hordeScale);

    return {
      id: def.id, name: def.name,
      level: spawnLevel,
      hp: finalHp, maxHp: finalHp,
      atk: finalAtk, atk_orig: finalAtk,
      def: finalDef, spd: finalSpd, mag: finalMag,
      exp: finalExp, gold: finalGold,
      abilityDefs: def.abilities || [],
      palette: def.palette,
      subtitle: def.subtitle || '',
      element: def.element || 'physical',
      weakTo: def.weakTo || [],
      resistTo: def.resistTo || [],
      tier: tier,
      isKO: false, stunned: false, debuff: null,
      statuses: [],
    };
  });
  G.targetEnemyIdx = 0;
}

function spawnEnemy(def) { buildEnemyGroup([def]); } // legacy compat

/**
 * Unlock a character for recruitment
 * @param {string} charId - Character ID (e.g., 'rydia', 'lenneth', 'kain', 'leon')
 * @returns {boolean} true if unlocked, false if already unlocked
 */
function unlockCharacter(charId) {
  if (!G.unlockedChars.includes(charId)) {
    G.unlockedChars.push(charId);
    // Save the updated unlocked characters state
    if (typeof Story !== 'undefined' && Story.active) Story._doSave();
    return true;
  }
  return false;
}

function buildTurnQueue() {
  const q = [];
  G.party.forEach((m, i) => { if (Battle.alive(m)) q.push({ type: 'party', idx: i, spd: m.spd }); });
  G.enemyGroup.forEach((e, i) => { if (Battle.alive(e)) q.push({ type: 'enemy', idx: i, spd: e.spd }); });
  q.sort((a, b) => b.spd - a.spd);
  return q;
}

function selectTarget(enemyIdx) {
  if (!Battle.alive(G.enemyGroup[enemyIdx])) return;
  G.targetEnemyIdx = enemyIdx;
  // Update target indicator on enemies
  document.querySelectorAll('.enemy').forEach((e, i) => {
    e.dataset.target = i === enemyIdx ? 'true' : 'false';
  });
  UI.renderEnemyRow();
  if (typeof SFX !== 'undefined') SFX.click();
}

/* ============================================================
   START BATTLE
   ============================================================ */
function showPreBattle() {
  if (G.selectedChars.length < 4) return;

  UI.show('pre-battle-screen');
  const roster = UI.el('pre-battle-roster');
  roster.innerHTML = '';

  // Show current party
  G.selectedChars.slice(0, 4).forEach((charId, idx) => {
    const ch = G.chars.find(c => c.id === charId);
    if (!ch) return;
    const d = document.createElement('div');
    d.className = 'pre-battle-char';
    d.innerHTML = `
      <div style="font-size:28px;margin-bottom:8px">${ch.icon}</div>
      <div style="font-weight:bold;font-size:14px">${ch.alias || ch.name}</div>
      <div style="font-size:12px;color:var(--text-dim)">${ch.title}</div>`;
    roster.appendChild(d);
  });
}

function startBattle() {
  if (G.selectedChars.length < 4) return;

  buildParty();

  if (typeof Story !== 'undefined' && Story.active) {
    Story.onHeroReady();
    return;
  }

  // Free battle: 2–3 random enemies, scaled to party level
  const pool = G.enemies.slice();
  const count = 2 + Math.floor(Math.random() * 2);
  const picks = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  // Scale to hero level (minimum 1)
  const spawnLevel = Math.max(1, G.hero?.lv || 1);
  buildEnemyGroup(picks, spawnLevel);
  _initBattle();
  const names = G.enemyGroup.map(e => e.name).join(' & ');
  UI.setLog([`${names} appear!`, `Party to battle stations!`], ['hi', '']);
  processCurrentTurn();
}

// ── Battle atmosphere cleanup ──────────────────────────────────────────────
// Removes mutation scene classes so the next battle starts clean.
function _clearBattleAtmosphere() {
  const scene = document.getElementById('battle-scene');
  if (!scene) return;
  scene.classList.remove('battle-corrupted', 'battle-mutant');
  scene.className = scene.className
    .split(' ')
    .filter(c => !c.startsWith('battle-zone-'))
    .join(' ');
  G.battleZone = null;
}

// ── Mutant trait: Vampiric ─────────────────────────────────────────────────
// Call after any damage lands on an enemy that has the Vampiric trait.
// Heals the enemy for 25% of the damage dealt (visual pop shown).
function _applyVampiric(enemy, dmg, enemyIdx) {
  if (!enemy.mutantTraits) return;
  const isVampiric = enemy.mutantTraits.some(t => t.id === 'vampiric');
  if (!isVampiric || dmg <= 0) return;
  const heal = Math.max(1, Math.floor(dmg * 0.25));
  enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal);
  UI.popEnemy(enemyIdx, heal, 'regen');
}

function _initBattle() {
  G.turnQueue = buildTurnQueue();
  G.turnIdx = 0;
  G.activeMemberIdx = 0;
  G.busy = false;
  buildAbilityMenu();
  UI.show('battle-screen');
  UI.renderBattleUI();
}

function buildAbilityMenu() {
  const actor = G.party[G.activeMemberIdx] || G.hero;
  if (!actor) return;
  const menu = UI.el('ability-sub');
  if (!menu) return;
  menu.innerHTML = '';
  actor.abilities.forEach(ab => {
    const b = document.createElement('button');
    const icon = ab.icon || '';
    const type = ab.type || 'physical';
    const tIcon = TYPE_ICONS[type] || '🗡️';

    const mpCost = actor.passive?.id === 'eidolon_bond' ? Math.ceil(ab.mp * 0.85) : ab.mp;

    b.className = `cmd-btn ability-btn ab-type-${type}`;
    b.innerHTML = `
      <span class="ab-type-icon">${tIcon}</span>
      <span class="ab-icon">${icon}</span>
      <span class="ab-name">${ab.name}</span>
      <span class="ab-cost">(${mpCost}MP)</span>
    `;
    b.onclick = () => heroAbility(ab);
    menu.appendChild(b);
  });
  const back = document.createElement('button');
  back.className = 'cmd-btn dim';
  back.textContent = '← BACK';
  back.onclick = () => UI.openSub(null);
  menu.appendChild(back);
}

/* ============================================================
   TURN MANAGEMENT
   ============================================================ */
function processCurrentTurn() {
  // Skip dead units
  while (G.turnIdx < G.turnQueue.length) {
    const t = G.turnQueue[G.turnIdx];
    const unit = t.type === 'party' ? G.party[t.idx] : G.enemyGroup[t.idx];
    if (Battle.alive(unit)) break;
    G.turnIdx++;
  }

  // New round if exhausted
  if (G.turnIdx >= G.turnQueue.length) {
    G.turnQueue = buildTurnQueue();
    G.turnIdx = 0;
    if (!G.turnQueue.length) return;
  }

  const t = G.turnQueue[G.turnIdx];
  const unit = t.type === 'party' ? G.party[t.idx] : G.enemyGroup[t.idx];

  // CONTROL CHECK (Phase 5 Refinement: Unified Status System)
  const stun = unit.statuses?.find(s => s.id === 'status_stunned');
  const frozen = unit.statuses?.find(s => s.id === 'status_frozen');

  if (stun || frozen) {
    const label = stun ? 'stunned' : 'frozen';
    const icon = stun ? '💫' : '❄️';
    UI.addLog(`${icon} ${unit.displayName || unit.name} is ${label} and skips their turn!`, 'regen');

    // Remove stun/freeze immediately upon the turn skip.
    if (stun) unit.statuses = unit.statuses.filter(s => s.id !== 'status_stunned');
    if (frozen) unit.statuses = unit.statuses.filter(s => s.id !== 'status_frozen');

    setTimeout(advanceTurn, 1000);
    return;
  }

  UI.renderTurnBar();
  UI._highlightActiveMember();
  UI.renderActiveMemberBar();

  if (t.type === 'party') {
    G.activeMemberIdx = t.idx;
    heroTurn();
  } else {
    G.busy = true;
    UI.btns(false);
    setTimeout(() => enemyAct(G.enemyGroup[t.idx], t.idx), 700);
  }
}

function advanceTurn() {
  G.turnIdx++;
  if (!checkBattleEnd()) processCurrentTurn();
}

/* ============================================================
   VISUAL EFFECTS
   ============================================================ */
function heroRun() {
  if (G.busy) return;
  G.busy = true; UI.btns(false);
  UI.openSub(null);
  if (Math.random() < 0.6) {
    UI.setLog(['The party escapes!'], ['hi']);
    setTimeout(() => showResult('escaped'), 900);
  } else {
    const _isMutant = G.enemyGroup.some(e => e.mutantTraits && Battle.alive(e));
    UI.setLog([_isMutant ? '⚠ Escape failed! The Mutant strikes!' : 'Could not escape!'], ['dmg']);
    setTimeout(advanceTurn, 800);
  }
}

function heroTurn() {
  G.busy = false;
  // Auto-select first alive enemy if current target is dead
  if (!Battle.alive(G.enemyGroup[G.targetEnemyIdx])) {
    const aliveIdx = G.enemyGroup.findIndex(e => Battle.alive(e));
    if (aliveIdx >= 0) G.targetEnemyIdx = aliveIdx;
  }
  buildAbilityMenu();
  UI.renderEnemyRow();    // refresh target indicator
  UI.renderActiveMemberBar();
  UI.btns(true);
  const actor = G.party[G.activeMemberIdx];

  // NEW: Start-of-Turn maintenance (tick buffs/regen)
  Battle.tickActorStatus(actor);

  UI.addLog(`${actor?.displayName}'s turn — choose action!`, 'hi');
  UI.updateStats();
}

function checkBattleEnd() {
  const allEnemiesDead = G.enemyGroup.every(e => !Battle.alive(e));
  const allPartyDown = G.party.every(m => !Battle.alive(m));

  if (allEnemiesDead) {
    let totalExp = 0, totalGold = 0;
    const allDrops = [];
    let relicDrop = null;
    G.enemyGroup.forEach(e => {
      totalExp += e.exp;
      totalGold += e.gold;
      const rawDef = G.enemies.find(r => r.id === e.id);
      if (rawDef) _awardDrops(rawDef).forEach(id => allDrops.push(id));
      // One relic drop attempt per encounter (elite enemies have higher chance)
      if (!relicDrop) relicDrop = _tryRelicDrop(rawDef?.elite || false);
    });

    // Average enemy level for the encounter
    const avgEnemyLv = G.enemyGroup.length
      ? G.enemyGroup.reduce((s, e) => s + (e.level || 1), 0) / G.enemyGroup.length
      : 1;

    // Award EXP and gold to all alive members; loop level-ups until threshold not met
    const leveledNames = [];
    G.party.forEach(m => {
      if (!Battle.alive(m)) return;
      // Level-gap penalty: scale exp down as member outlevels enemies.
      // At +3 levels above enemy: 0 exp. Linear ramp from gap 0 → gap 3.
      const gap = (m.lv || 1) - avgEnemyLv;
      const expScale = gap >= 3 ? 0 : gap <= 0 ? 1 : 1 - (gap / 3);
      const earnedExp = Math.floor(totalExp * expScale);
      m.exp += earnedExp;
      m.gold += totalGold;
      while (checkMemberLevel(m)) {
        if (!leveledNames.includes(m.displayName)) leveledNames.push(m.displayName);
      }
      // Sync stats back to character data for persistence across battles
      const ch = G.chars.find(c => c.id === m.charId);
      if (ch) {
        ch.lv = m.lv;
        ch.exp = m.exp;
        ch.gold = m.gold;
        ch.mp = m.mp;   // persist MP so it carries between battles
        ch.hp = m.hp;   // persist HP
        ch.isKO = m.isKO; // persist KO state
      }
    });

    const dropMsg = allDrops.length
      ? allDrops.map(id => { const d = G.items.find(i => i.id === id); return d ? `${d.icon}${d.name}` : id; }).join(', ')
      : null;
    const relicMsg = relicDrop ? `✦ Relic found: ${relicDrop.icon} ${relicDrop.name}!` : null;
    UI.setLog([
      `Enemies defeated! +${totalExp} EXP +${totalGold} Gold`,
      dropMsg ? `Drops: ${dropMsg}` : '',
      relicMsg || ''
    ].filter(Boolean), ['hi', 'hi', 'hi']);
    UI.renderPartyStatus();
    UI.updateStats();

    setTimeout(() => {
      if (leveledNames.length) {
        UI.addLog(`★ LEVEL UP: ${leveledNames.join(', ')}!`, 'hi');
        if (typeof SFX !== 'undefined') SFX.levelUp();
        UI.renderPartyStatus();
      }
      setTimeout(() => {
        _clearBattleAtmosphere();
        if (G.mode === 'explore' || G.mode === 'story_explore') { MapEngine.onBattleComplete(true); }
        else if (typeof Story !== 'undefined' && Story.active) Story.onBattleWon();
        else showResult('victory');
      }, leveledNames.length ? 1400 : 500);
    }, 1100);
    return true;
  }

  if (allPartyDown) {
    UI.setLog(['The party has fallen...'], ['dmg']);
    setTimeout(() => {
      _clearBattleAtmosphere();
      if (G.mode === 'explore' || G.mode === 'story_explore') { MapEngine.onBattleComplete(false); }
      else if (typeof Story !== 'undefined' && Story.active) Story.onBattleLost();
      else showResult('defeat');
    }, 1200);
    return true;
  }

  return false;
}

function checkBattleEnd_alias() { return checkBattleEnd(); }
// Legacy
function checkEnd() { return checkBattleEnd(); }
/* ============================================================
   RESULT SCREEN
   ============================================================ */
function showResult(type) {
  _clearBattleAtmosphere();
  closePartyMenu();
  const t = UI.el('result-title');
  const st = UI.el('result-stats');
  const party = UI.el('result-party');
  const retryBtn = UI.el('result-retry-btn');
  const againBtn = UI.el('result-again-btn');

  // Party member cards — shown on all result types
  if (party && G.party.length) {
    party.innerHTML = G.party.map(m => {
      const col = CHAR_COLOR[m.charId] || '#aaa';
      const isKO = !Battle.alive(m);
      const hpTxt = isKO ? '0' : m.hp;
      return `<div class="result-member${isKO ? ' ko' : ''}" style="border-color:${col}40">
        <div class="rm-name" style="color:${col}">${m.displayName}</div>
        <div class="rm-lv">LV ${m.lv}</div>
        <div class="rm-hp${isKO ? ' zero' : ''}">HP ${hpTxt}/${m.maxHp}</div>
        <div class="rm-exp" style="color:#8888bb">EXP ${m.exp}</div>
        ${isKO ? '<div style="color:var(--red);font-size:9px">FALLEN</div>' : ''}
      </div>`;
    }).join('');
  } else if (party) {
    party.innerHTML = '';
  }

  if (type === 'victory') {
    if (typeof SFX !== 'undefined') SFX.victory();
    t.textContent = '✨ VICTORY! ✨';
    t.className = 'result-title victory';
    const totalGold = G.party.reduce((s, m) => s + (m.gold || 0), 0);
    st.innerHTML = `All enemies defeated!<br><span class="val">+Gold collected this run: ${totalGold}</span>`;
    if (retryBtn) retryBtn.style.display = 'none';
    if (againBtn) againBtn.textContent = '▶ PLAY AGAIN';
  } else if (type === 'defeat') {
    if (typeof SFX !== 'undefined') SFX.defeat();
    t.textContent = '💀 GAME OVER 💀';
    t.className = 'result-title defeat';
    st.innerHTML = `The party has fallen...`;
    if (retryBtn) retryBtn.style.display = '';
    if (againBtn) againBtn.textContent = '⬅ MENU';
  } else {
    t.textContent = '💨 ESCAPED!';
    t.className = 'result-title escaped';
    st.innerHTML = `The party fled from battle!`;
    if (retryBtn) retryBtn.style.display = 'none';
    if (againBtn) againBtn.textContent = '▶ PLAY AGAIN';
  }
  UI.show('result-screen');
}

function playAgain() {
  G.selectedChar = null; G.selectedClass = null; G.selectedChars = [];
  goCharSelect();
}

// Retry the same battle: restore party and rebuild the same enemy group at the same level
function retryBattle() {
  G.party.forEach(m => {
    m.hp = m.maxHp; m.mp = m.maxMp;
    m.isKO = false;
    m.regenTurns = 0; m.stunned = false; m.frozen = 0;
    m.statuses = [];
  });
  const level = G.enemyGroup[0]?.level || 1;
  const defs = G.enemyGroup.map(e => G.enemies.find(r => r.id === e.id)).filter(Boolean);
  buildEnemyGroup(defs, level);
  G.turnQueue = buildTurnQueue();
  G.turnIdx = 0;
  G.busy = false;
  UI.show('battle-screen');
  UI.renderBattleUI();
  processCurrentTurn();
}

/* ============================================================
   EXPLORE MODE
   ============================================================ */
/* Move mute/TTS/zoom into the explore header so they don't clash */
function _dockPersistentBtns(dock) {
  const hdrRight = document.querySelector('.explore-header-right');
  const muteBtn = document.getElementById('mute-btn');
  const ttsBtn = document.getElementById('tts-btn');
  const zoomBtn = document.getElementById('zoom-btn');
  const resetBtn = document.getElementById('reset-zoom-btn');
  const gameEl = document.getElementById('game');

  if (dock && hdrRight) {
    // Make them inline in the header
    [muteBtn, ttsBtn].forEach(b => {
      if (!b) return;
      b.style.position = 'static';
      b.style.width = '28px';
      b.style.height = '28px';
      b.style.fontSize = '13px';
      hdrRight.insertBefore(b, hdrRight.firstChild);
    });
    if (zoomBtn) zoomBtn.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
  } else {
    // Restore to absolute positioning
    [muteBtn, ttsBtn].forEach(b => {
      if (!b) return;
      b.style.position = 'absolute';
      b.style.width = '';
      b.style.height = '';
      b.style.fontSize = '';
      if (gameEl) gameEl.appendChild(b);
    });
    if (zoomBtn) zoomBtn.style.display = '';
    if (resetBtn) resetBtn.style.display = '';
  }
}

function leaveExplore() {
  MapEngine.stop();
  _dockPersistentBtns(false);
  if (typeof Story !== 'undefined' && Story.active && G.mode === 'story_explore') {
    Story.onExploreComplete();
  } else {
    G.mode = 'free';
    UI.show('title-screen');
  }
}

function startExplore() {
  // Need a party first — if none, do a quick auto-build
  if (!G.party || G.party.length === 0) {
    if (!G.chars.length || !G.classes.length) {
      alert('Game data not loaded yet. Try again in a moment.');
      return;
    }
    // Auto-select all chars (each with their own class)
    G.selectedChars = G.chars.slice(0, 4).map(c => c.id);
    G.selectedChar = G.selectedChars[0];
    // Don't set selectedClass — buildParty will use each character's class_affinity
    buildParty();
  }
  G.mode = 'explore';
  UI.show('explore-screen');
  _dockPersistentBtns(true);

  // Size canvas to its container
  const wrap = document.getElementById('explore-canvas-wrap');
  const canvas = document.getElementById('explore-canvas');
  canvas.width = wrap.clientWidth || 360;
  canvas.height = wrap.clientHeight || 480;

  MapEngine.init(canvas);

  // D-pad touch support
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(t => MapUI.handleTouch(t.clientX, t.clientY, canvas));
  }, { passive: false });
  canvas.addEventListener('mousedown', e => {
    MapUI.handleTouch(e.clientX, e.clientY, canvas);
  });

  // Show map select overlay then launch
  const overlay = document.getElementById('map-select-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    MapUI.buildMapSelectOverlay();
  } else {
    MapEngine.start('verdant_vale');
    MapUI.showMsg('Entering Verdant Vale…', 1500);
  }

  // Update map name label
  _updateExploreHeader();
}

function _updateExploreHeader() {
  const lbl = document.getElementById('explore-map-name');
  if (lbl) {
    const m = MapEngine.getMap();
    lbl.textContent = m ? `✦ ${m.name.toUpperCase()} ✦` : '✦ EXPLORE ✦';
  }
}

/* ============================================================
   ZOOM & FULLSCREEN CONTROLS
   ============================================================ */
function zoomGame(scale) {
  const game = document.getElementById('game');
  if (!game) return;
  if (scale === 1) {
    game.style.transform = 'scale(1)';
    game.style.transformOrigin = 'center center';
  } else {
    game.style.transform = `scale(${scale})`;
    game.style.transformOrigin = 'center top';
  }
}

function toggleFullscreen() {
  const game = document.getElementById('game');
  if (!game) return;

  if (!document.fullscreenElement) {
    game.requestFullscreen().catch(err => {
      alert(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}
