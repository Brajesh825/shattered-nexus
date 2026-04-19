/**
 * game.js — Shattered Nexus
 */

// --- DIAGNOSTIC LOGGING ---
window.LogDebug = function (msg, type = 'info') {
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
  tickActorStatus(m, isEnemy = false) { StatusSystem.tick(m, isEnemy); }
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
  settings: {
    graphicsQuality: localStorage.getItem('sn_graphics_quality') || 'auto' // 'auto'|'high'|'low'
  },

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
      'story-screen': null,
      'explore-screen': null
    };
    Focus.setContext(contextMap[id] || id);
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

  // BGM — fade out current track then play the next one
  if (typeof BGM !== 'undefined') {
    const _next =
      id === 'title-screen' ? 'title' :
        id === 'battle-screen' ? 'battle' :
          id === 'explore-screen' ? 'exploration' :
            id === 'story-screen' ? 'story' : null;
    BGM.fadeOut(600, () => { if (_next) BGM.play(_next); });
  }
}

function renderPartyMenu() {
  const cards = document.getElementById('pm-cards');
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

    const img = document.createElement('img');
    img.className = 'pm-portrait'; img.alt = m.displayName;
    if (typeof SpriteRenderer !== 'undefined') SpriteRenderer.drawHero(img, m.charId, m.char, m.cls);

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
            · EXP <span style="color:var(--gold)">${m.exp}</span>/<span style="color:var(--text-dim)">${getExpThreshold(m.lv)}</span></div>
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

    card.querySelector('.pm-portrait-wrap').appendChild(img);
    cards.appendChild(card);
  });
}
function buildEnemyGroup(defs, spawnLevel = 1, isBoss = false) {
  // Use centralized scaling configuration
  const tierGrowth = NexusScaling.tierGrowth;

  // Horde scaling: pulling from NexusScaling.horde
  const hordeScale = defs.length >= 4 ? NexusScaling.horde[4] : defs.length === 3 ? NexusScaling.horde[3] : 1.0;

  G.enemyGroup = defs.slice(0, 4).map(def => {
    const tier = def.tier || 1;
    // Fallback: if Tier is higher than 3, use Tier 3 stats as the baseline. 
    // This prevents high-tier enemies from defaulting to Tier 1 strength.
    let growth = tierGrowth[tier];
    if (!growth) {
      growth = tier > 3 ? tierGrowth[3] : tierGrowth[1];
    }

    const calcStat = (baseStat, statKey) => {
      // Apply split boss multipliers if applicable
      const bMult = isBoss ? (NexusScaling.boss[statKey] || NexusScaling.boss.atk) : 1.0;

      const base = baseStat * growth.statMult * hordeScale * bMult;
      const levelBonus = growth[statKey] * (spawnLevel - 1) * hordeScale * bMult;
      return Math.max(1, Math.floor(base + levelBonus));
    };

    const finalHp = calcStat(def.stats.hp, 'hp');
    const finalAtk = calcStat(def.stats.atk, 'atk');
    const finalDef = calcStat(def.stats.def, 'def');
    const finalSpd = calcStat(def.stats.spd, 'spd');
    const finalMag = calcStat(def.stats.mag, 'mag');
    // EXP/gold scale by count so total reward is fair.
    // Level scaling: +10% EXP for each level above 1.
    const levelScale = 1 + (spawnLevel - 1) * 0.1;
    const bExpMult = isBoss ? NexusScaling.boss.exp : 1.0;
    const finalExp = Math.floor(def.reward.exp * growth.expMult * hordeScale * levelScale * bExpMult);
    const bGoldMult = isBoss ? (NexusScaling.boss.gold || 1.0) : 1.0;
    const finalGold = Math.floor(def.reward.gold * growth.expMult * hordeScale * bGoldMult);

    const entry = {
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
      isBoss: isBoss, // Only a boss if explicitly flagged
      aiRole: def.aiRole || 'attacker',
      aiType: def.aiType || 'random',
      aiStep: 0,
      isKO: false,
      statuses: [],
    };
    if (typeof Archive !== 'undefined') Archive.recordSeen(def.id);
    return entry;
  });
  G.targetEnemyIdx = 0;
}


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

function buildTurnQueue() { return TurnManager.buildQueue(); }

function selectTarget(enemyIdx) {
  if (!Battle.alive(G.enemyGroup[enemyIdx])) return;
  G.targetEnemyIdx = enemyIdx;
  G.enemy = G.enemyGroup[enemyIdx]; // Sync global enemy reference

  // Update target indicator on enemies
  document.querySelectorAll('.enemy').forEach((e, i) => {
    e.dataset.target = i === enemyIdx ? 'true' : 'false';
  });
  BattleUI.renderEnemyRow();
  if (typeof SFX !== 'undefined') SFX.click();

  // If we were in a targeting phase (keyboard/controller), execute the pending action
  if (G.pendingAction) {
    const action = G.pendingAction;
    G.pendingAction = null;

    if (typeof Focus !== 'undefined') Focus.setTargeting(false);

    // Set a flag so the action handler knows we are executing AFTER targeting
    G._executingPending = true;
    if (action.type === 'attack') heroAttack();
    else if (action.type === 'ability') heroAbility(action.ab);
    G._executingPending = false;
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

function _initBattle() {
  G.turnQueue = TurnManager.buildQueue();
  G.turnIdx = 0;
  G.activeMemberIdx = 0;
  G.busy = false;
  buildAbilityMenu();
  showScreen('battle-screen');
  BattleUI.render();
}

function buildAbilityMenu() {
  const actor = G.party[G.activeMemberIdx] || G.hero;
  if (!actor) return;
  const menu = document.getElementById('ability-sub');
  if (!menu) return;
  menu.innerHTML = '';
  actor.abilities.forEach(ab => {
    const b = document.createElement('button');
    const icon = ab.icon || '';
    const type = ab.type || 'physical';
    const tIcon = TYPE_ICONS[type] || '🗡️';

    const mpCost = Math.ceil(ab.mp * PassiveSystem.val(actor, 'MP_COST_MULT', 1.0));
    const canAfford = actor.mp >= mpCost;

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
  if (G.busy) return;
  G.busy = true; BattleUI.btns(false);
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
        if (typeof Archive !== 'undefined') Archive.recordKill(e.id);
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

    setTimeout(() => {
      if (leveledNames.length) {
        BattleUI.addLog(`★ LEVEL UP: ${leveledNames.join(', ')}!`, 'hi');
        if (typeof SFX !== 'undefined') SFX.levelUp();
        BattleUI.renderPartyStatus();
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
  G.turnQueue = buildTurnQueue();
  G.turnIdx = 0;
  G.busy = false;
  showScreen('battle-screen');
  BattleUI.render();
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
    showScreen('title-screen');
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
  showScreen('explore-screen');
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
