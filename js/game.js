/**
 * game.js — Shattered Nexus
 */

// --- DIAGNOSTIC LOGGING ---
window.LogDebug = function (msg, type = 'info') {
  if (typeof ReleaseConfig !== 'undefined' && !ReleaseConfig.IS_DEV) return;
  const colors = {
    hi: '#4ecfff',
    dmg: '#ff4d4d',
    regen: '#00ff6a',
    passive: '#ffcf5c',
    info: '#7a90a8'
  };
  console.log(`%c[DEBUG] ${msg}`, `color: ${colors[type] || colors.info}; font-weight: bold; background: #050412; padding: 2px 5px; border-radius: 3px;`);
};

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
  summoning: { strong: [], weak: [] },
};

/* ============================================================
   BATTLE ENGINE (math helpers)
   ============================================================ */
const Battle = {
  // Returns 1.5 (weak), 0.5 (resist), or 1.0 (neutral) based on ability element vs target's arrays
  elemMult(abilityElement, target) {
    const mult = CombatEngine.elemMult(abilityElement, target, window.TYPE_CHART);
    // Record discovered weakness in the Archive
    if (mult > 1.0 && target && target.id && typeof Archive !== 'undefined') {
      Archive.recordWeakness(target.id, abilityElement);
    }
    return mult;
  },
  // Dynamic Stat Resolver. Computes final combat stats by applying all active modifiers.
  getStat(m, stat) {
    return CombatEngine.getStat(m, stat);
  },
  // Adds a status to an actor, handling duration refreshing for identical IDs.
  // Relic: Drowned Sigil — statusResist gives a chance to block debuff/control effects.
  addStatus(m, config) {
    const def = typeof config === 'string' ? StatusSystem.DEFS[config] : config;
    if (def && m._statusResist && (def.type === 'control' || def.type === 'dot' || def.type === 'dot_percent')) {
      if (Math.random() < m._statusResist) {
        if (typeof BattleUI !== 'undefined') BattleUI.addLog(`🌊 ${m.displayName} resisted ${def.label}!`, 'hi');
        return;
      }
    }
    StatusSystem.add(m, config);
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
  // Mark a unit as KO. For party members, checks reviveOnce relic and logs the fall.
  // Pass isEnemy=true to skip party-specific logic.
  setKO(unit, isEnemy = false) {
    unit.isKO = true;
    if (!isEnemy) {
      if (typeof _checkReviveOnce === 'function') _checkReviveOnce(unit);
      const idx = G.party.indexOf(unit);
      if (unit.isKO && typeof BattleUI !== 'undefined') {
        BattleUI.addLog(`${unit.displayName} has fallen!`, 'dmg');
        if (idx !== -1) BattleUI.setSpriteFrame(idx, 'fallen');
      }
    } else {
      // Record victory in the Archive automatically for every enemy KO
      if (typeof Archive !== 'undefined') {
        Archive.recordKill(unit.id);
      }
    }
    if (window.LogDebug) window.LogDebug(`[KO] ${unit.displayName || unit.name} knocked out`, 'dmg');
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
    return CombatEngine.rollHit(attacker, defender);
  },
  // Rolls for a critical hit based on attacker's critRate and LCK
  // Every 1 LCK adds +1% crit rate (handled inside CombatEngine.rollCrit)
  rollCrit(attacker) {
    const isCrit = CombatEngine.rollCrit(attacker);
    if (isCrit && window.LogDebug) window.LogDebug(`[CritRoll] ${attacker.displayName || attacker.name} CRITICAL!`, 'buff');
    return isCrit;
  },

  /* ── CATALYST & SYNERGY SYSTEM (PHASE 4) ────────────────── */

  // Applies or overwrites an elemental aura on the target, respecting immunities
  applyAura(target, element) { StatusSystem.applyAura(target, element); },

  // Checks for an elemental reaction based on existing aura and incoming detonator
  triggerReaction(target, detonator) { return StatusSystem.triggerReaction(target, detonator); },
  physDmg(atk, def, mult = 1, options = {}) {
    const final = CombatEngine.physDmg(atk, def, mult, options);
    if (window.LogDebug) {
      const source = options.source || 'Actor';
      const target = options.target || 'Target';
      window.LogDebug(`[${source} ➔ ${target}] PhysCalc (Engine): Atk(${atk}) vs Def(${def}) = Final: ${final}`, 'dmg');
    }
    return final;
  },
  // targetMag / targetMagLv = Spirit Defense (SDEF) — high-MAG targets resist magic
  magicDmg(mag, mdef, mult = 1, options = {}) {
    const final = CombatEngine.magicDmg(mag, mdef, mult, options);
    if (window.LogDebug) {
      const source = options.source || 'Actor';
      const target = options.target || 'Target';
      window.LogDebug(`[${source} ➔ ${target}] MagCalc (Engine): Mag(${mag}) vs T.Mag(${mdef}) = Final: ${final}`, 'dmg');
    }
    return final;
  },
  pickAbility(actor, target) {
    const abilities = actor.abilities || actor.abilityDefs;
    if (!abilities || !abilities.length) return null;

    // --- SEQUENCED AI (Fixed Rotation) ---
    if (actor.aiType === 'sequenced') {
      const step = actor.aiStep || 0;
      const ab = abilities[step % abilities.length];
      actor.aiStep = step + 1;
      if (window.LogDebug) window.LogDebug(`[AI-Sequenced] ${actor.name} following rotation (Step ${step}) -> ${ab.name}`, 'hi');
      return ab;
    }

    // Synergy-Aware Weighting
    const aura = target?.statuses?.find(s => s.id.startsWith('aura_'));
    const auraType = aura ? aura.id.replace('aura_', '') : null;

    // Predator vanguard-bypass: if a vanguard is alive, physical singles will be
    // intercepted — predator AI prefers non-physical moves to reach the real target
    const vanguardAlive = actor.aiRole === 'predator' &&
      typeof G !== 'undefined' && G.party?.[2] && !G.party[2].isKO && G.party[2].hp > 0;

    const weightedAbilities = abilities.map(ab => {
      let weight = ab.weight || 50;
      const element = ab.effect?.element || actor.element || 'physical';

      // Synergy: boost moves that trigger a reaction on the target's aura
      if (auraType && this._willReact(auraType, element)) {
        weight *= 3;
        if (window.LogDebug) window.LogDebug(`[AI-Synergy] Weight boosted for ${ab.name} (Element: ${element} vs Aura: ${auraType})`, 'hi');
      }

      // Predator bypass: heavily favour non-physical moves when vanguard blocks physicals
      if (vanguardAlive && ab.type === 'physical') {
        weight *= 0.2; // 80% reduction — almost never wastes a physical into vanguard
        if (window.LogDebug) window.LogDebug(`[AI-Predator] ${ab.name} suppressed — vanguard blocks physical reach`, 'hi');
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
  tickActorStatus(m, isEnemy = false) { StatusSystem.tick(m, isEnemy); }
};

/* ============================================================
   GAME STATE
   Single source of truth for all runtime state.
   Only serialisable fields (lv, exp, gold, hp, mp, isKO) are
   persisted — everything else is recomputed on load.
   ============================================================ */

/**
 * @typedef {Object} PartyMember
 * @property {string}   id           — Character ID (e.g. 'aya')
 * @property {string}   displayName  — UI name
 * @property {number}   lv           — Current level
 * @property {number}   hp           — Current HP
 * @property {number}   maxHp        — Computed max HP
 * @property {number}   mp           — Current MP
 * @property {number}   maxMp        — Computed max MP
 * @property {number}   atk          — Computed ATK
 * @property {number}   def          — Computed DEF
 * @property {number}   spd          — Computed SPD
 * @property {number}   mag          — Computed MAG
 * @property {boolean}  isKO         — Knocked-out flag
 * @property {Array}    statuses     — Active status effects
 * @property {Object}   cooldowns    — { abilityId: turnsRemaining }
 * @property {Object}   cls          — Class definition (from classes.json)
 */

/**
 * @typedef {Object} EnemyUnit
 * @property {string}   id           — Enemy ID (must match enemies.json)
 * @property {string}   name         — Display name
 * @property {number}   level        — Spawn level
 * @property {number}   hp           — Current HP
 * @property {number}   maxHp        — Max HP
 * @property {number}   atk          — ATK stat
 * @property {number}   def          — DEF stat
 * @property {number}   mag          — MAG stat
 * @property {number}   spd          — SPD stat
 * @property {boolean}  isKO         — Knocked-out flag
 * @property {Array}    statuses     — Active status effects
 * @property {string}   [element]    — Primary element (optional)
 * @property {string}   [aiRole]     — 'attacker'|'tactician'|'predator'|'support'
 */

/**
 * @typedef {Object} TurnEntry
 * @property {'party'|'enemy'} type
 * @property {number} idx   — Index into G.party or G.enemyGroup
 * @property {number} spd   — Speed value used to build the queue
 */

/** @type {{ chars: Array, classes: Array, enemies: Array, items: Array, inventory: Array, relics: Array, ownedRelics: string[], activeRelics: string[], selectedChar: string|null, selectedClass: string|null, selectedChars: string[], unlockedChars: string[], clearedMaps: string[], npcTalked: Object, party: PartyMember[], enemyGroup: EnemyUnit[], turnQueue: TurnEntry[], turnIdx: number, activeMemberIdx: number, targetEnemyIdx: number, busy: boolean, mode: string, activePartyIdx: number, settings: Object }} */
const G = {
  /** @type {Array} Loaded character definitions (from characters.json) */
  chars: [],
  /** @type {Array} Loaded class definitions (from classes.json) */
  classes: [],
  /** @type {Array} Loaded enemy definitions (from enemies.json) */
  enemies: [],
  /** @type {Array} Loaded item definitions (from items.json) */
  items: [],
  /** @type {Array} Loaded merchant catalogs (from merchants.json) */
  merchants: [],
  /** @type {Array<{itemId:string, qty:number}>} Party inventory — max 20 stacks */
  inventory: [],
  /** @type {Array} Loaded relic definitions (from relics.json) */
  relics: [],
  /** @type {string[]} Relic IDs the party has collected */
  ownedRelics: [],
  /** @type {string[]} Relic IDs currently equipped (max 3) */
  activeRelics: [],
  selectedChar: null,
  selectedClass: null,
  /** @type {string[]} Ordered array of up to 4 character IDs */
  selectedChars: [],
  /** @type {string[]} Character IDs available for selection */
  unlockedChars: ['aya', 'tao', 'lulu', 'rei'],
  /** @type {string[]} Map IDs whose objective has been completed */
  clearedMaps: [],
  /** @type {Object.<string, string[]>} { mapId: [npcId, ...] } — persisted across sessions */
  npcTalked: {},
  /** @type {Object.<string, number>} { pairId: tierIndex } — Character Resonance levels */
  bondProgress: {},
  /** @type {Array<{pairId: string, reward: object}>} Accumulated bond tier rewards */
  earnedBondRewards: [],
  /** @type {Set<string>} IDs of banter shown in the current session (not persisted to save) */
  shownBanter: new Set(),

  /** @type {PartyMember[]} Active party — up to 4 members */
  party: [],
  /** @type {EnemyUnit[]} Current enemy encounter — 1–3 enemies */
  enemyGroup: [],
  /** Centralized battle turn/session state. Mirrored to legacy fields during migration. */
  turn: null,
  /** @type {TurnEntry[]} Sorted turn queue for the current battle round */
  turnQueue: [],
  /** Current index into turnQueue — advances each time a unit acts. @type {number} */
  turnIdx: 0,
  /** Index of the party member whose turn it currently is. @type {number} */
  activeMemberIdx: 0,
  /** Index of the enemy currently selected as the attack target. @type {number} */
  targetEnemyIdx: 0,
  /** Global action lock — true while an action animation is in flight. @type {boolean} */
  busy: false,
  /** @type {'free'|'story'|'explore'} Current screen context */
  mode: 'free',

  /** Index of the party member controlling the map avatar. @type {number} */
  activePartyIdx: 0,
  settings: {
    /** @type {'auto'|'high'|'low'} */
    graphicsQuality: typeof Settings !== 'undefined' ? Settings.getQuality() : 'auto'
  },

  /** The map-walking party member. Falls back through activePartyIdx → isPlayer → index 0. */
  get hero() {
    return this.party[this.activePartyIdx] || this.party.find(m => m.isPlayer) || this.party[0] || null;
  },
  /** The currently targeted enemy; auto-falls back to first alive enemy. */
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
// --- Standard escapeHtml now provided by utils.js ---

window.escapeHtml = escapeHtml;

const CHAR_COLOR = {
  aya: '#7dd3fc', tao: '#ef4444', lulu: '#2dd4bf', rei: '#4ade80',
  ria: '#a78bfa', valka: '#e879f9', drake: '#0ea5e9', rex: '#fbbf24'
};

/** Character ID Migration Mapping */
const LEGACY_ID_MAP = {
  ayaka: 'aya',
  hutao: 'tao',
  nilou: 'lulu',
  xiao: 'rei',
  aria: 'ria'
};

function migrateCharId(id) {
  if (!id) return id;
  const lower = id.toLowerCase();
  return LEGACY_ID_MAP[lower] || lower;
}

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

function showScreen(id) {
  // Clear gauntlet flag when returning to title or explore
  if (id === 'title-screen' || id === 'explore-screen') {
    G.isGauntletMode = false;
  }

  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = '';
  });
  document.getElementById(id).classList.add('active');

  // Set focus context for keyboard/controller navigation
  if (typeof Focus !== 'undefined') {
    // Mapping screens to their primary focus containers where needed
    const contextMap = {
      'title-screen': 'title-screen',
      'battle-screen': 'cmd-grid-main',
      'char-screen': 'char-grid',
      'class-screen': 'class-grid',
      'result-screen': 'result-screen',
      'game-over-screen': 'game-over-screen',
      'story-screen': null,
      'explore-screen': null
    };
    const targetCtx = contextMap.hasOwnProperty(id) ? contextMap[id] : id;
    Focus.setContext(targetCtx);
  }

  requestAnimationFrame(scaleGame);
  const steps = { 'char-screen': 1, 'battle-screen': 2, 'result-screen': 2 };
  const cur = steps[id] || 0;
  document.querySelectorAll('.step').forEach(s => {
    const n = +s.dataset.step;
    s.classList.toggle('active', n === cur);
    s.classList.toggle('done', n < cur);
  });

  // Hide story dialogue when leaving story screen
  const dialogue = document.getElementById('s-dialogue');
  if (id !== 'story-screen' && dialogue) dialogue.style.display = 'none';

  // Step-bar visibility
  const bar = document.getElementById('step-bar');
  if (bar) bar.style.display = ['char-screen'].includes(id) ? 'flex' : 'none';

  if (typeof SFX !== 'undefined') SFX.click();

  // Control hints context
  if (typeof ControlHints !== 'undefined') {
    const hintCtx =
      id === 'battle-screen'  ? 'battle'   :
      id === 'explore-screen' ? 'explore'  :
      id === 'map-screen'     ? 'worldmap' : 'menu';
    ControlHints.setContext(hintCtx);
  }

  // BGM is now handled specifically by specialized managers:
  // - Story battles: story.js -> _launchStoryBattle
  // - Map battles: menu-manager.js -> MapEngine.onEncounterStart
  // - Title/Explore/Story: Managed by their respective entry points
  // This prevents showScreen('battle-screen') from resetting boss themes to 'battle'.
}

/* ============================================================
   PARTY MENU — Paginated single-character viewer
   ============================================================ */
const PartyMenu = (() => {
  let _idx = 0;
  let _fromPause = false;

  const CHAR_COLOR = {
    aya:'#7dd3fc', tao:'#ef4444', lulu:'#2dd4bf', rei:'#4ade80',
    rydia:'#a78bfa', lenneth:'#e879f9', kain:'#0ea5e9', leon:'#fbbf24',
    drake:'#fb923c', rex:'#94a3b8'
  };

  function open() {
    if (typeof UI !== 'undefined') UI.hideAllOverlays();

    _idx = 0;
    const overlay = document.getElementById('party-menu');
    if (overlay) overlay.style.display = 'flex';
    _renderCurrent();

    if (typeof Focus !== 'undefined') Focus.setContext('party-menu');
  }

  function close() {
    const overlay = document.getElementById('party-menu');
    if (overlay) overlay.style.display = 'none';

    // Intelligent restore: only return to system menu if we are actually paused
    if (typeof MapEngine !== 'undefined' && !MapEngine.isRunning()) {
      const pauseEl = document.getElementById('map-pause-menu');
      if (pauseEl) pauseEl.style.display = 'flex';
      if (typeof Focus !== 'undefined') Focus.setContext('map-pause-menu');
    } else {
      if (typeof Focus !== 'undefined') Focus.setContext(null);
    }
  }

  function back() {
    close();
  }

  function next() {
    if (!G.party.length) return;
    _idx = (_idx + 1) % G.party.length;
    _renderCurrent();
  }

  function prev() {
    if (!G.party.length) return;
    _idx = (_idx - 1 + G.party.length) % G.party.length;
    _renderCurrent();
  }

  function _renderCurrent() {
    const navLabel   = document.getElementById('pm-nav-label');
    const showcase   = document.getElementById('pms-showcase');
    const spriteEl   = document.getElementById('pms-sprite');
    const badge      = document.getElementById('pms-char-badge');
    const particles  = document.getElementById('pms-particles');
    const infoPanel  = document.getElementById('pms-info');

    if (!infoPanel || !G.party.length) return;

    const m = G.party[_idx];
    if (!m) return;

    const col     = CHAR_COLOR[m.charId] || '#c0b8e8';
    const hpPct   = Math.max(0, m.hp / m.maxHp * 100);
    const mpPct   = Math.max(0, m.mp / m.maxMp * 100);
    const hpCol   = hpPct > 50 ? '#4ade80' : hpPct > 25 ? '#eab308' : '#ef4444';
    const expNext = typeof getExpThreshold === 'function' ? getExpThreshold(m.lv) : (5 * m.lv * m.lv + 25 * m.lv);
    const expPct  = Math.min(100, (m.exp / expNext) * 100);

    // ── Nav label ──────────────────────────────────────────
    if (navLabel) navLabel.textContent = `${m.displayName}  ·  ${_idx + 1} / ${G.party.length}`;

    // ── Showcase: character colour theming ─────────────────
    if (showcase) {
      showcase.style.setProperty('--char-col', col);
    }

    // ── Badge ──────────────────────────────────────────────
    if (badge) {
      badge.textContent = m.displayName;
      badge.style.color = col;
    }

    // ── Particles: respawn on character switch ─────────────
    if (particles) {
      particles.innerHTML = '';
      [20, 35, 52, 68, 82].forEach((left, i) => {
        const p = document.createElement('span');
        p.className = 'pms-ptcl';
        p.style.cssText = `left:${left}%;animation-delay:${i * 0.7}s;animation-duration:${2.5 + i * 0.4}s;background:${col};`;
        particles.appendChild(p);
      });
    }

    // ── Sprite ─────────────────────────────────────────────
    if (spriteEl && showcase && typeof SpriteRenderer !== 'undefined') {
      const showcaseH = showcase.clientHeight || 200;
      const targetH = Math.floor(showcaseH * 0.7); // 70% height as requested
      SpriteRenderer.setFrame(spriteEl, m.charId, 'idle', targetH);
      // Force 45% width to maintain your desired look
      spriteEl.style.width = '45%';
    }

    // ── Info panel ─────────────────────────────────────────
    const abRows = (m.abilities || []).map(a =>
      `<div class="pms-ability" onclick="this.classList.toggle('pms-ab-open');this.nextElementSibling.style.display=this.classList.contains('pms-ab-open')?'block':'none'">
        <span class="pms-ab-icon">${a.icon || '⚡'}</span>
        <span class="pms-ab-name">${a.name}</span>
        <span class="pms-ab-mp">${a.mp}MP</span>
        <span class="pms-ab-toggle">▾</span>
      </div>
      <div class="pms-ab-desc" style="display:none">${a.description || 'No description.'}</div>`
    ).join('');

    infoPanel.innerHTML = `
      <!-- Identity -->
      <div class="pms-id">
        <span class="pms-fullname" style="color:${col}">${m.displayName}${m.isKO ? ' <span class="pm-ko-badge">KO</span>' : ''}</span>
        <span class="pms-lv-badge" style="border-color:${col}60">LV ${m.lv}</span>
      </div>
      <div class="pms-class">${m.cls?.name || ''}</div>

      <!-- EXP bar -->
      <div class="pms-exp-row">
        <span class="pms-exp-label">EXP</span>
        <div class="pms-exp-bg"><div class="pms-exp-fill" style="width:${expPct}%;background:${col}"></div></div>
        <span class="pms-exp-val">${m.exp}/${expNext}</span>
      </div>

      <div class="pms-divider"></div>

      <!-- HP / MP -->
      <div class="pms-bar-row">
        <span class="pms-bar-label">HP</span>
        <div class="pms-bar-bg"><div class="pms-bar-fill" style="width:${hpPct}%;background:${hpCol}"></div></div>
        <span class="pms-bar-val">${Math.max(0,m.hp)}/${m.maxHp}</span>
      </div>
      <div class="pms-bar-row">
        <span class="pms-bar-label">MP</span>
        <div class="pms-bar-bg"><div class="pms-bar-fill" style="width:${mpPct}%;background:#5060ff"></div></div>
        <span class="pms-bar-val">${m.mp}/${m.maxMp}</span>
      </div>

      <div class="pms-divider"></div>

      <!-- Stats -->
      <div class="pms-stats">
        <div class="pms-stat"><div class="pms-stat-label">ATK</div><div class="pms-stat-val">${m.atk}</div></div>
        <div class="pms-stat"><div class="pms-stat-label">DEF</div><div class="pms-stat-val">${m.def}</div></div>
        <div class="pms-stat"><div class="pms-stat-label">MAG</div><div class="pms-stat-val">${m.mag}</div></div>
        <div class="pms-stat"><div class="pms-stat-label">SPD</div><div class="pms-stat-val">${m.spd}</div></div>
      </div>

      ${m.passive ? `
      <div class="pms-passive" style="border-left-color:${col}80">
        <span style="color:var(--gold)">★ ${m.passive.name}:</span>
        <span style="color:var(--text-dim)"> ${m.passive.description}</span>
      </div>` : ''}

      <div class="pms-section-title">ABILITIES</div>
      <div class="pms-abilities">${abRows || '<div style="color:var(--text-dim);font-size:0.82rem">No abilities.</div>'}</div>
    `;
  }

  function renderCurrent() { _renderCurrent(); }
  return { open, close, back, next, prev, renderCurrent };
})();

// Legacy shims for any code still calling the old functions
function openPartyMenu() { PartyMenu.open(); }
function closePartyMenu() { PartyMenu.close(); }
function renderPartyMenu() { PartyMenu.renderCurrent(); }

function buildEnemyGroup(defs, spawnLevel = 1, isBoss = false) {
  G.enemyGroup = defs.slice(0, 4).map(def => {
    const entry = EnemyScaling.buildEnemyEntry(def, spawnLevel, isBoss, defs.length, NexusScaling);
    if (typeof Archive !== 'undefined') Archive.recordSeen(def.id);
    return entry;
  });
  if (typeof TurnState !== 'undefined') TurnState.setTargetEnemyIdx(0);
  else G.targetEnemyIdx = 0;
}


/**
 * Unlock a character for recruitment
 * @param {string} charId - Character ID (e.g., 'rydia', 'lenneth', 'kain', 'leon')
 * @returns {boolean} true if unlocked, false if already unlocked
 */
function unlockCharacter(charId) {
  if (!G.unlockedChars.includes(charId)) {
    G.unlockedChars.push(charId);
    return true;
  }
  return false;
}

function buildTurnQueue() { return TurnManager.buildQueue(); }

/**
 * hoverTarget — Phase 3 mouse hover. Updates target indicator + keyboard cursor sync.
 * No-op outside targeting mode (pointer-events CSS already blocks the call,
 * but this guard is the JS safety net).
 */
function hoverTarget(enemyIdx) {
  const scene = document.getElementById('battle-scene');
  if (!scene?.classList.contains('targeting-active')) return;
  if (!Battle.alive(G.enemyGroup[enemyIdx])) return;

  if (typeof TurnState !== 'undefined') TurnState.setTargetEnemyIdx(enemyIdx);
  else G.targetEnemyIdx = enemyIdx;
  document.querySelectorAll('.enemy').forEach((e, i) => {
    e.dataset.target = (i === enemyIdx) ? 'true' : 'false';
  });
  BattleUI.addLog(`Target → ${G.enemyGroup[enemyIdx].name}`, 'hi');

  // Keep keyboard cursor in sync so CONFIRM always targets what the mouse previewed
  const enemyEl = document.querySelectorAll('.enemy')[enemyIdx];
  if (typeof Focus !== 'undefined' && enemyEl) Focus.syncHover(enemyEl);
}

/**
 * selectTarget — Phase 3 confirm. Executes the pending action against the chosen enemy.
 */
function selectTarget(enemyIdx) {
  if (!Battle.alive(G.enemyGroup[enemyIdx])) return;

  if (typeof TurnState !== 'undefined') {
    TurnState.setTargetEnemyIdx(enemyIdx);
    TurnState.setTargetEnemy(G.enemyGroup[enemyIdx]);
  } else {
    G.targetEnemyIdx = enemyIdx;
    G.enemy = G.enemyGroup[enemyIdx];
  }

  document.querySelectorAll('.enemy').forEach((e, i) => {
    e.dataset.target = (i === enemyIdx) ? 'true' : 'false';
  });
  BattleUI.renderEnemyRow();
  if (typeof SFX !== 'undefined') SFX.click();

  // Execute the pending action that entered Phase 3
  const pendingAction = typeof TurnState !== 'undefined' ? TurnState.getPendingAction() : G.pendingAction;
  if (pendingAction) {
    const action = pendingAction;
    if (typeof TurnState !== 'undefined') TurnState.clearPendingAction();
    else G.pendingAction = null;
    if (typeof Focus !== 'undefined') Focus.setTargeting(false);

    if (typeof TurnState !== 'undefined') TurnState.beginPendingExecution();
    else G._executingPending = true;
    if (action.type === 'attack')  heroAttack();
    else if (action.type === 'ability') heroAbility(action.ab);
    if (typeof TurnState !== 'undefined') TurnState.endPendingExecution();
    else G._executingPending = false;
  }
}

/* ============================================================
   START BATTLE
   ============================================================ */
function showPreBattle() {
  if (G.selectedChars.length < 4) return;

  showScreen('pre-battle-screen');
  const roster = document.getElementById('pre-battle-roster');
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

async function startBattle() {
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
  await _initBattle();
  const names = G.enemyGroup.map(e => e.name).join(' & ');
  BattleUI.setLog([`${names} appear!`, `Party to battle stations!`], ['hi', '']);
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
  BattleUI.popEnemy(enemyIdx, heal, 'regen');
}

async function _initBattle() {
  const queue = TurnManager.buildQueue();
  if (typeof TurnState !== 'undefined') TurnState.resetBattle(queue);
  else {
    G.turnQueue = queue;
    G.turnIdx = 0;
    G.activeMemberIdx = 0;
    G.busy = false;
  }
  // Reset Auto-Battle each fresh encounter (player opts in per-battle)
  if (typeof AutoBattle !== 'undefined') AutoBattle.reset();
  buildAbilityMenu();
  showScreen('battle-screen');
  BattleUI.render();

  // Trigger cinematic intro for boss encounters
  const boss = G.enemyGroup.find(e => e.isBoss);
  if (boss) {
    G.busy = true;
    await BattleUI.showBossIntro(boss.id, boss.name);
    G.busy = false;
  }

  // 4. Apply Initial Weather Auras
  if (typeof MapEngine !== 'undefined') {
    const weather = MapEngine.getWeather();
    const wConf = NexusScaling.weather?.[weather];
    if (wConf && wConf.aura) {
      G.party.forEach(m => StatusSystem.add(m, wConf.aura));
      G.enemyGroup.forEach(e => StatusSystem.add(e, wConf.aura));
      if (typeof BattleUI !== 'undefined') {
        BattleUI.addLog(`✦ Atmosphere: ${wConf.label}`, 'hi');
      }
    }
  }

  // Right-click anywhere on the battle scene = BACK (cancel targeting / close sub-menu)
  const scene = document.getElementById('battle-scene');
  if (scene && !scene._ctxBound) {
    scene._ctxBound = true;
    scene.addEventListener('contextmenu', e => {
      e.preventDefault();
      if (typeof Focus !== 'undefined') Focus.cancelTargeting();
    });
  }
}

function buildAbilityMenu() {
  const activeIdx = typeof TurnState !== 'undefined' ? TurnState.getActivePartyIdx() : G.activeMemberIdx;
  const actor = G.party[activeIdx] || G.hero;
  if (!actor) return;
  const menu = document.getElementById('ability-sub');
  if (!menu) return;
  menu.innerHTML = '';

  actor.abilities.forEach(ab => {
    const icon = ab.icon || '';
    const type = ab.type || 'physical';
    
    const mpCost = Math.ceil(ab.mp * PassiveSystem.val(actor, 'MP_COST_MULT', 1.0));
    const canAfford = actor.mp >= mpCost;
    const cdLeft = (actor.cooldowns || {})[ab.id] || 0;
    const onCD = cdLeft > 0;
    const disabled = !canAfford || onCD;

    const row = document.createElement('div');
    row.className = 'ab-row';

    const b = document.createElement('button');
    b.className = `cmd-btn ability-btn ab-type-${type}${disabled ? ' disabled' : ''}`;
    b.disabled = disabled;

    const cdBadge = onCD
      ? `<span class="ab-cd-badge">⏳ ${cdLeft}t</span>`
      : '';

    b.innerHTML = `
      <span class="ab-icon">${icon}</span>
      <div class="ab-content">
        <span class="ab-name">${ab.name}</span>
        <span class="ab-meta">${mpCost} MP</span>
      </div>
      ${cdBadge}
    `;
    b.onclick = () => heroAbility(ab);
    b.onmouseenter = () => BattleUI.showAbilityDesc(ab);
    b.onfocus = () => BattleUI.showAbilityDesc(ab);

    const eye = document.createElement('span');
    eye.className = 'ab-info-eye';
    eye.textContent = '👁️';
    eye.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      BattleUI.showAbilityDesc(ab);
    }, true); 

    row.appendChild(b);
    row.appendChild(eye);
    menu.appendChild(row);
  });

  const back = document.createElement('button');
  back.className = 'cmd-btn dim';
  back.textContent = '← BACK';
  back.onclick = () => BattleUI.openSub(null);
  menu.appendChild(back);
}


/* ============================================================
   TURN MANAGEMENT
   ============================================================ */
function processCurrentTurn() { TurnManager.process(); }

function advanceTurn() { TurnManager.advance(); }

function heroTurn() { TurnManager.beginHeroTurn(); }

/* ============================================================
   VISUAL EFFECTS
   ============================================================ */
function heroRun() {
  const isBusy = typeof TurnState !== 'undefined' ? TurnState.isBusy() : G.busy;
  if (isBusy) return;

  // ── BLOCK FLEE FOR BOSSES & STORY CHAPTERS ─────────────────
  const isBoss = G.enemyGroup.some(e => e.isBoss);
  const isStory = (typeof Story !== 'undefined' && Story.active && Story._skirmishArcIdx === undefined);
  
  if (isBoss || isStory) {
    BattleUI.setLog(['Cannot flee from this battle!'], ['dmg']);
    if (typeof SFX !== 'undefined') SFX.error();
    return;
  }

  if (typeof TurnState !== 'undefined') TurnState.setBusy(true);
  else G.busy = true;
  BattleUI.btns(false);
  BattleUI.openSub(null);
  if (Math.random() < 0.6) {
    BattleUI.setLog(['The party escapes!'], ['hi']);
    setTimeout(() => showResult('escaped'), 900);
  } else {
    const _isMutant = G.enemyGroup.some(e => e.mutantTraits && Battle.alive(e));
    BattleUI.setLog([_isMutant ? '⚠ Escape failed! The Mutant strikes!' : 'Could not escape!'], ['dmg']);
    setTimeout(advanceTurn, 800);
  }
}

function checkBattleEnd() {
  const allEnemiesDead = G.enemyGroup.every(e => !Battle.alive(e));
  const allPartyDown = G.party.every(m => !Battle.alive(m));

  if (allEnemiesDead) {
    // Victory: calculate rewards
    let totalExp = 0;
    let totalGold = 0;
    let leveledNames = [];
    let allDrops = [];
    let relicDrop = null;

    if (G.isGauntletMode) {
      BattleUI.addLog("❄️ Simulation Complete: Stress Test finished.", "hi");
    } else {
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

      // Split EXP among alive members — fewer survivors means more EXP each
      const aliveCount = G.party.filter(m => Battle.alive(m)).length || 1;
      const splitExp = Math.floor(totalExp / aliveCount);
      const splitGold = Math.floor(totalGold / aliveCount);

      // Award EXP and gold to all alive members; loop level-ups until threshold not met
      G.party.forEach(m => {
        // Award EXP and gold only to surviving members
        if (Battle.alive(m)) {
          // Level-gap penalty: scale exp down as member outlevels enemies.
          // At +3 levels above enemy: 0 exp. Linear ramp from gap 0 → gap 3.
          const gap = (m.lv || 1) - avgEnemyLv;
          const expScale = gap >= 3 ? 0 : gap <= 0 ? 1 : 1 - (gap / 3);
          const earnedExp = Math.floor(splitExp * expScale);
          m.exp += earnedExp;
          m.gold += splitGold;
          while (checkMemberLevel(m)) {
            if (!leveledNames.includes(m.displayName)) leveledNames.push(m.displayName);
          }
        }
        // Always sync progression back to G.chars regardless of KO state
        // so level/exp are never lost between battles
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
    }

    // Only show reward logs if not in Gauntlet mode
    if (!G.isGauntletMode) {
      const dropMsg = allDrops.length
        ? allDrops.map(id => { const d = G.items.find(i => i.id === id); return d ? `${d.icon}${d.name}` : id; }).join(', ')
        : null;
      const relicMsg = relicDrop ? `✦ Relic found: ${relicDrop.icon} ${relicDrop.name}!` : null;
      BattleUI.setLog([
        `Enemies defeated! +${totalExp} EXP +${totalGold} Gold`,
        dropMsg ? `Drops: ${dropMsg}` : '',
        relicMsg || ''
      ].filter(Boolean), ['hi', 'hi', 'hi']);
    }

    BattleUI.renderPartyStatus();
    BattleUI.updateStats();

    // Quest kill tracking — must run here so all game modes (explore, story, direct) are covered
    if (!G.isGauntletMode && typeof QuestSystem !== 'undefined') {
      G.enemyGroup.forEach(en => {
        QuestSystem.onKill(en.id, !!(en.mutantTraits && en.mutantTraits.length));
      });
    }

    setTimeout(() => {
      if (leveledNames.length) {
        BattleUI.addLog(`★ LEVEL UP: ${leveledNames.join(', ')}!`, 'hi');
        if (typeof SFX !== 'undefined') SFX.levelUp();
        BattleUI.renderPartyStatus();
      }
      setTimeout(() => {
        _clearBattleAtmosphere();
        // Wipe all battle statuses from party — buffs/debuffs must not carry over between fights
        G.party.forEach(m => { m.statuses = []; });
        if (G.mode === 'explore' || G.mode === 'story_explore') { MapEngine.onBattleComplete(true); }
        else if (typeof Story !== 'undefined' && Story.active) Story.onBattleWon();
        else showResult('victory');
      }, leveledNames.length ? 1400 : 500);
    }, 1100);
    return true;
  }

  if (allPartyDown) {
    BattleUI.setLog(['The party has fallen...'], ['dmg']);
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

/* ============================================================
   RESULT SCREEN
   ============================================================ */
function showResult(type) {
  _clearBattleAtmosphere();
  closePartyMenu();
  G.party.forEach(m => { m.statuses = []; });

  ResultUI.show(type, G.party);
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
    m.statuses = [];
  });
  const level = G.enemyGroup[0]?.level || 1;
  const defs = G.enemyGroup.map(e => G.enemies.find(r => r.id === e.id)).filter(Boolean);
  buildEnemyGroup(defs, level);
  const queue = buildTurnQueue();
  if (typeof TurnState !== 'undefined') TurnState.resetBattle(queue);
  else {
    G.turnQueue = queue;
    G.turnIdx = 0;
    G.busy = false;
  }
  showScreen('battle-screen');
  BattleUI.render();
  processCurrentTurn();
}

/* ============================================================
   EXPLORE MODE
   ============================================================ */
/* Move mute/TTS/zoom into the explore header so they don't clash */
function _dockPersistentBtns(dock) {
  // Deprecated: persistent buttons reside natively inside .explore-header-right as standard static flex items.
}

function leaveExplore() {
  MapEngine.stop();
  _dockPersistentBtns(false);
  if (typeof Story !== 'undefined' && Story.active && G.mode === 'story_explore') {
    Story.onExploreComplete();
  } else {
    G.mode = 'free';
    showScreen('title-screen');
  }
}

function startExplore(skipAutoStart = false) {
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

  // ── Guard: if ALL party members are KO'd (e.g. lost a battle),
  //    revive them all to full HP so the map always has a walker.
  const allKO = G.party.length > 0 && G.party.every(m => m.isKO || m.hp <= 0);
  if (allKO) {
    G.party.forEach(m => {
      m.hp = m.maxHp;
      m.mp = m.maxMp;
      m.isKO = false;
      m.statuses = [];
      m.cooldowns = {};
    });
    // Sync back to G.chars so the revive persists
    G.party.forEach(m => {
      const ch = G.chars.find(c => c.id === m.charId);
      if (ch) { ch.hp = m.hp; ch.mp = m.mp; ch.isKO = false; }
    });
  }

  G.mode = 'explore';
  showScreen('explore-screen');
  _dockPersistentBtns(true);

  // Size canvas to its container
  const wrap = document.getElementById('explore-canvas-wrap');
  const canvas = document.getElementById('explore-canvas');
  canvas.width = wrap.clientWidth || 360;
  canvas.height = wrap.clientHeight || 480;

  if (!canvas._mapInited) {
    canvas._mapInited = true;
    MapEngine.init(canvas);
  }
  if (typeof MapTouch !== 'undefined' && !canvas._mapTouchInited) {
    canvas._mapTouchInited = true;
    MapTouch.init();
  }

  // D-pad touch support
  if (!canvas._exploreInputBound) {
    canvas._exploreInputBound = true;
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      Array.from(e.changedTouches).forEach(t => MapUI.handleTouch(t.clientX, t.clientY, canvas));
    }, { passive: false });
    canvas.addEventListener('mousedown', e => {
      MapUI.handleTouch(e.clientX, e.clientY, canvas);
    });
  }

  // Launch the engine
  if (!MapEngine.getMap() && !skipAutoStart) {
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

window.G = G;
