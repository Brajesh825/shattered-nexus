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
  el.style.transform       = '';
  el.style.transformOrigin = '';
  el.style.marginLeft      = '';
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
  fire:     { strong: ['ice','earth'],    weak: ['water','fire']    },
  ice:      { strong: ['water','wind'],   weak: ['fire','ice']      },
  water:    { strong: ['fire','earth'],   weak: ['ice','water']     },
  wind:     { strong: ['ice','earth'],    weak: ['wind']            },
  earth:    { strong: ['water','wind'],   weak: ['earth','physical']},
  holy:     { strong: ['shadow'],         weak: ['holy']            },
  shadow:   { strong: ['holy'],           weak: ['shadow']          },
  physical: { strong: [],                 weak: ['physical']        },
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
      if (t.type === 'immune'  && t.element === abilityElement) return 0;
      if (t.type === 'shatter' && t.element === abilityElement) return 2.0;
    }
    const weak   = target?.weakTo   || [];
    const resist = target?.resistTo || [];
    if (weak.includes(abilityElement))   return 1.5;
    if (resist.includes(abilityElement)) return 0.5;
    return 1.0;
  },
  // Returns 'weak'|'resist'|'immune'|'shatter'|null for UI display
  elemResult(abilityElement, target) {
    if (!abilityElement || abilityElement === 'physical') return null;
    const traits = target?.mutantTraits || [];
    for (const t of traits) {
      if (t.type === 'immune'  && t.element === abilityElement) return 'immune';
      if (t.type === 'shatter' && t.element === abilityElement) return 'shatter';
    }
    const weak   = target?.weakTo   || [];
    const resist = target?.resistTo || [];
    if (weak.includes(abilityElement))   return 'weak';
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
    if (row.weak.includes(clsElem))   return 0.5;
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
    if (row.weak.includes(clsElem))   return 'resist';
    return null;
  },
  physDmg(atk, def, mult = 1, atkLevel = 1, defLevel = 1, defPen = 0) {
    // NEW: heavier level-weighting + stronger defense factor (0.75x)
    const scaledAtk = atk + (atkLevel * 1.2);
    // defPen: reduces effectiveness of enemy defense (e.g. 0.2 removes 20% of DEF)
    const effectiveDef = def * (1 - Math.min(0.9, defPen));
    const scaledDef = effectiveDef + (defLevel * 0.6);
    const base = Math.max(1, scaledAtk - scaledDef * 0.75);
    return Math.max(1, Math.floor(base * (0.85 + Math.random() * 0.3) * mult));
  },
  // targetMag / targetMagLv = Spirit Defense (SDEF) — high-MAG targets resist magic
  magicDmg(mag, mult = 1, passiveBonus = 1, magLevel = 1, targetMag = 0, targetMagLv = 1) {
    const scaledMag      = mag + (magLevel * 0.8);
    const magMitigation  = (targetMag + targetMagLv * 0.3) * 0.4;
    const base = Math.max(1, scaledMag - magMitigation);
    return Math.max(1, Math.floor(base * (0.9 + Math.random() * 0.2) * mult * passiveBonus));
  },
  pickAbility(abilities) {
    if (!abilities || !abilities.length) return null;
    const total = abilities.reduce((s, a) => s + (a.weight || 50), 0);
    let r = Math.random() * total;
    for (const a of abilities) { r -= (a.weight || 50); if (r <= 0) return a; }
    return abilities[0];
  },
  alive(m) { return m && !m.isKO && m.hp > 0; },
};

/* ============================================================
   GAME STATE
   ============================================================ */
const G = {
  chars:   [],
  classes: [],
  enemies: [],
  items:     [],          // item definitions from ITEMS_DATA
  inventory: [],          // [{ itemId, qty }] — party's bag (max 20 stacks)
  relics:       [],       // relic definitions from RELICS_DATA
  ownedRelics:  [],       // relic IDs the party has collected
  activeRelics: [],       // relic IDs currently equipped (max 3)
  selectedChar:  null,
  selectedClass: null,
  selectedChars: [],   // ordered array of up to 4 char IDs
  unlockedChars: ['ayaka', 'hutao', 'nilou', 'xiao'],  // Characters available for selection
  clearedMaps:   [],   // map IDs whose objective has been completed
  npcTalked:     {},   // { mapId: [npcId, ...] } — persisted across sessions

  party:           [],   // 4 party members (all player-controlled)
  enemyGroup:      [],   // 1–3 enemies
  turnQueue:       [],   // [{type:'party'|'enemy', idx, spd}]
  turnIdx:         0,
  activeMemberIdx: 0,    // which party member is currently acting
  targetEnemyIdx:  0,    // which enemy is selected as attack target
  busy:            false,
  mode:            'free', // 'free' | 'story' | 'explore'

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
  ayaka:'#7dd3fc', hutao:'#ef4444', nilou:'#2dd4bf', xiao:'#4ade80',
  rydia:'#a78bfa', lenneth:'#e879f9', kain:'#0ea5e9', leon:'#fbbf24'
};
const ENEMY_POP_X = [580, 720, 860, 650]; // 4th is between 1st and 2nd for diamond layout
const PARTY_POP_X = [42, 108, 174, 240];

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
    const steps = { 'char-screen':1, 'battle-screen':2, 'result-screen':2 };
    const cur = steps[id] || 0;
    document.querySelectorAll('.step').forEach(s => {
      const n = +s.dataset.step;
      s.classList.toggle('active', n === cur);
      s.classList.toggle('done', n < cur);
    });
  },

  log: ['','',''],
  setLog(lines, cls = []) {
    this.log = [...lines].slice(-3);
    while (this.log.length < 3) this.log.unshift('');
    ['log0','log1','log2'].forEach((id, i) => {
      const el = this.el(id);
      el.textContent = this.log[i] || '';
      el.className = 'log-line ' + (cls[i] || '');
    });
  },
  addLog(txt, cl = '') {
    this.log = [...this.log.slice(-2), txt];
    this.setLog(this.log, ['','', cl]);
  },

  // Backward compat (story.js)
  updateBars() { this.renderPartyStatus(); this.renderEnemyRow(); },

  updateStats() {
    const h = G.party[G.activeMemberIdx] || G.hero;
    if (!h) return;
    this.el('stat-lv').textContent  = h.lv;
    this.el('stat-atk').textContent = h.atk;
    this.el('stat-def').textContent = h.def;
    this.el('stat-exp').textContent = h.exp;
  },

  pop(x, y, val, type = '', element = 'physical') {
    const s = this.el('battle-scene');
    if (!s) return;
    const d = document.createElement('div');
    d.className = 'dmg-pop ' + type + ' element-' + element;
    d.textContent = (type === 'heal' || type === 'regen') ? '+' + val : '-' + Math.abs(val);
    d.style.left = x + 'px'; d.style.top = y + 'px';
    s.appendChild(d);
    setTimeout(() => d.remove(), 1100);
  },
  popEnemy(idx, val, type, element = 'physical') { this.pop(ENEMY_POP_X[idx] || 580, 80, val, type, element); },
  popParty(idx, val, type, element = 'light') { this.pop(PARTY_POP_X[idx] || 42, 210, val, type, element); },

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
      const unit  = t.type === 'party' ? G.party[t.idx] : G.enemyGroup[t.idx];
      if (!unit) return;
      const isEnemy = t.type === 'enemy';
      const color   = isEnemy ? '#ff7070' : (CHAR_COLOR[unit.charId] || '#c0b8e8');
      const label   = (unit.displayName || unit.name || '?')[0].toUpperCase();
      const tok = document.createElement('div');
      tok.className = 'tb-tok' +
        (i === G.turnIdx    ? ' active-tok' : '') +
        (isEnemy            ? ' enemy-tok'  : '') +
        (!Battle.alive(unit)? ' dead-tok'   : '');
      tok.style.borderColor = Battle.alive(unit) ? color : '#333';
      tok.style.color       = Battle.alive(unit) ? color : '#444';
      tok.textContent = label;
      tok.title       = (unit.displayName || unit.name || '') + (Battle.alive(unit) ? ` (HP ${unit.hp}/${unit.maxHp})` : ' [KO]');
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
    const TIER_BASE_W   = { 1: Math.round(130 * VP_SCALE),
                             2: Math.round(180 * VP_SCALE),
                             3: Math.round(240 * VP_SCALE) };
    const COUNT_SCALE   = { 1: 1.00, 2: 0.87, 3: 0.75, 4: 0.64 };
    const MUTATION_MULT = { normal: 1.00, corrupted: 1.12, mutant: 1.28 };
    const ASPECT        = 1.23; // height = width × aspect

    G.enemyGroup.forEach((e, i) => {
      const alive = Battle.alive(e);
      const pct   = Math.max(0, e.hp / e.maxHp * 100);

      // Compute this enemy's individual sprite size
      const tierW  = TIER_BASE_W[e.tier || 1] || TIER_BASE_W[1];
      const cScale = COUNT_SCALE[count] || COUNT_SCALE[4];
      const mMult  = MUTATION_MULT[e.mutation || 'normal'] || 1.0;
      const sprW   = Math.round(tierW * cScale * mMult);
      const sprH   = Math.round(sprW * ASPECT);

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
      spr.style.width  = sprW + 'px';
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
      const col   = CHAR_COLOR[m.charId] || '#c0b8e8';
      const alive = Battle.alive(m);
      const pct   = Math.max(0, m.hp / m.maxHp * 100);

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
      const col   = CHAR_COLOR[m.charId] || '#c0b8e8';
      const hpPct = Math.max(0, m.hp / m.maxHp * 100);
      const mpPct = Math.max(0, m.mp / m.maxMp * 100);
      const hpCol = hpPct > 50 ? 'var(--hp-hi)' : hpPct > 25 ? 'var(--hp-mid)' : 'var(--hp-lo)';
      const isActive = G.turnQueue[G.turnIdx]?.type === 'party' && G.turnQueue[G.turnIdx]?.idx === i;
      const card = document.createElement('div');
      card.className = 'psc' + (m.isKO ? ' ko-psc' : '') + (isActive ? ' active-psc' : '');
      card.style.borderColor = isActive ? col : col + '50';
      card.innerHTML = `
        <div class="psc-name" style="color:${col}">${m.displayName} <span class="psc-lv">LV${m.lv}</span></div>
        <div class="psc-hp-bg"><div class="psc-hp-bar" style="width:${hpPct}%;background:${hpCol}"></div></div>
        <div class="psc-hp-txt">${Math.max(0,m.hp)}/${m.maxHp} HP · ${m.mp}/${m.maxMp} MP</div>
        <div class="psc-mp-bg"><div class="psc-mp-bar" style="width:${mpPct}%"></div></div>`;
      bar.appendChild(card);
    });
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
    const m   = G.party[t.idx];
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
        `<div class="pm-ab"><span class="pm-ab-icon">${a.icon||'⚡'}</span><span class="pm-ab-name">${a.name}</span><span class="pm-ab-mp">${a.mp}MP</span></div>`
      ).join('');

      card.innerHTML = `
        <div class="pm-card-top" style="border-bottom-color:${col}40">
          <div class="pm-portrait-wrap"></div>
          <div class="pm-card-head">
            <div class="pm-card-name" style="color:${col}">${m.displayName}</div>
            <div class="pm-card-class">${m.cls.name} ${m.isKO ? '<span class="pm-ko-badge">KO</span>' : ''}</div>
            <div class="pm-card-lv">LEVEL <span style="color:${col}">${m.lv}</span>
              · EXP <span style="color:var(--gold)">${m.exp}</span>/<span style="color:var(--text-dim)">${30*m.lv}</span></div>
          </div>
        </div>
        <div class="pm-bars">
          <div class="pm-bar-row">HP
            <div class="pm-bar-bg"><div class="pm-bar-fill" style="width:${hpPct}%;background:${hpCol}"></div></div>
            <span>${Math.max(0,m.hp)}/${m.maxHp}</span>
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

/* ============================================================
   PARTY MENU
   ============================================================ */
function openPartyMenu() {
  const overlay = UI.el('party-menu');
  if (!overlay) return;
  UI.renderPartyMenu();
  overlay.style.display = 'flex';
}
function closePartyMenu() {
  const overlay = UI.el('party-menu');
  if (overlay) overlay.style.display = 'none';
}

/* ============================================================
   INIT
   ============================================================ */
window.addEventListener('DOMContentLoaded', async () => {
  await loadAllGameData();
  moveAnimations = window.MOVE_ANIMATIONS || {};
  G.chars   = window.CHARACTERS_DATA || [];
  G.classes = window.CLASSES_DATA    || [];
  G.enemies = window.ENEMIES_DATA    || [];
  G.items   = window.ITEMS_DATA      || [];
  G.relics  = window.RELICS_DATA     || [];
  window._origEnemies = G.enemies.slice();
  initStars();
  scaleGame();
  UI.show('title-screen');
});

function initStars() {
  const c = UI.el('stars');
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*2}s;animation-duration:${1+Math.random()*2}s`;
    c.appendChild(s);
  }
}

/* ============================================================
   MAP ENCOUNTER HANDLER (global setup)
   ============================================================ */
MapEngine.onEncounterStart = (enc, map) => {
  const enemyIds   = enc.enemies      || [];
  const mutation   = enc.mutation     || null; // null | 'corrupted' | 'mutant'
  const mutantTraits = enc.mutantTraits || null; // array of trait objects, mutant only
  G.battleZone = map?.id || null; // store zone for battle background

  const enemyDefs = enemyIds
    .map(id => G.enemies.find(e => e.id === id))
    .filter(Boolean);

  if (enemyDefs.length === 0) return;

  // Get enemy level range from map; mutated enemies spawn at higher end
  const [minLevel, maxLevel] = map?.enemyLevelRange || [1, 1];
  const baseLevel  = minLevel + Math.floor(Math.random() * (maxLevel - minLevel + 1));
  const spawnLevel = mutation === 'mutant'    ? maxLevel + 3
                   : mutation === 'corrupted' ? maxLevel + 1
                   : baseLevel;

  // Apply mutation: rename enemies and tag for stat boost in buildEnemyGroup
  const mutatedDefs = mutation ? enemyDefs.map(def => ({
    ...def,
    name:     mutation === 'mutant' ? `Mutant ${def.name}` : `Corrupted ${def.name}`,
    mutation, // carried into the built enemy object
  })) : enemyDefs;

  buildEnemyGroup(mutatedDefs, spawnLevel, false, mutation);

  // Apply mutation stat multipliers on top of built group
  if (mutation) {
    const mult = mutation === 'mutant' ? 1.55 : 1.28;
    G.enemyGroup.forEach(e => {
      e.hp    = Math.floor(e.hp    * mult); e.maxHp = e.hp;
      e.atk   = Math.floor(e.atk   * mult);
      e.def   = Math.floor(e.def   * mult);
      e.mag   = Math.floor(e.mag   * mult);
      e.exp   = Math.floor(e.exp   * (mutation === 'mutant' ? 2.2 : 1.5));
      e.gold  = Math.floor(e.gold  * (mutation === 'mutant' ? 2.0 : 1.4));
      e.mutation = mutation;

      // ── Apply mutant traits ──────────────────────────────
      if (mutation === 'mutant' && mutantTraits?.length) {
        e.mutantTraits = mutantTraits; // attach for elemMult immune/shatter checks
        e._enragedTurns = 0;          // counter for Enraged trait

        for (const t of mutantTraits) {
          if (t.type === 'stat') {
            if      (t.stat === 'atk') e.atk = Math.floor(e.atk * t.mult);
            else if (t.stat === 'def') e.def = Math.floor(e.def * t.mult);
            // spd: tag on object, affects AI tickRate in engine (not modelled here, just flavor)
          }
          // vampiric / regenerating / enraged flags are checked at runtime in battle resolution
        }
      }
    });
  }

  _initBattle();

  // ── Apply zone + mutation atmosphere to the battle scene ────
  const scene = document.getElementById('battle-scene');
  if (scene) {
    // Remove all zone and mutation classes first
    scene.classList.remove('battle-corrupted', 'battle-mutant');
    scene.className = scene.className
      .split(' ')
      .filter(c => !c.startsWith('battle-zone-'))
      .join(' ');
    // Apply zone background
    if (G.battleZone) scene.classList.add(`battle-zone-${G.battleZone}`);
    // Apply mutation overlay on top
    if (mutation === 'corrupted') scene.classList.add('battle-corrupted');
    if (mutation === 'mutant')    scene.classList.add('battle-mutant');
  }

  const prefix = mutation === 'mutant'    ? '☣ MUTANT '
               : mutation === 'corrupted' ? '✦ CORRUPTED '
               : '';
  const names = G.enemyGroup.map(e => e.name).join(' & ');
  UI.setLog([`${prefix}⚔ ${names} appeared!`, `Party to battle stations!`], ['hi','']);
  processCurrentTurn();
};

/* ============================================================
   CHARACTER SELECT
   ============================================================ */
function goCharSelect() {
  G.selectedChars = [];
  G.selectedChar  = null;

  // If not in story mode, this is free battle mode — unlock all characters
  if (G.mode !== 'story') {
    G.mode = 'free';
    G.unlockedChars = G.chars.map(c => c.id);
  }

  UI.show('char-screen');
  _renderCharGrid();
  UI.el('char-detail').innerHTML = 'Click characters to add them to your party.';
  _updateCharConfirmBtn();
}

function goArcCharSelect() {
  try {
    console.log('[goArcCharSelect] Starting arc character selection');
    G.selectedChars = [];
    G.selectedChar  = null;
    G.mode = 'story';

    // Show char-screen (this will hide all other screens via CSS)
    UI.show('char-screen');
    _renderCharGrid();
    console.log('[goArcCharSelect] Grid rendered, available chars:', G.chars.filter(ch => G.unlockedChars.includes(ch.id)).map(c => c.name));

    const detailEl = UI.el('char-detail');
    if (detailEl) {
      detailEl.innerHTML = 'Select 4 characters for this arc. They will be your party throughout.';
    }

    // Change confirm button text for arc selection
    const btn = UI.el('char-confirm');
    if (btn) {
      console.log('[goArcCharSelect] Setting up button handler');
      btn.textContent = 'LOCK IN PARTY';

      // Remove old onclick and add new event listener
      btn.onclick = null;
      btn.removeEventListener('click', window._arcCharSelectHandler);
      window._arcCharSelectHandler = () => {
        console.log('[goArcCharSelect] Button clicked, selectedChars:', G.selectedChars);
        if (G.selectedChars.length < 4) {
          console.log('[goArcCharSelect] Not enough characters selected');
          return;
        }
        // Build party from selected characters
        buildParty();
        console.log('[goArcCharSelect] Party built:', G.party.map(m => m.name));
        // Proceed to story after selection
        if (typeof Story !== 'undefined' && Story.active) {
          console.log('[goArcCharSelect] Calling Story._nextChapter()');
          Story._nextChapter();
          console.log('[goArcCharSelect] Story._nextChapter() returned');
        }
      };
      btn.addEventListener('click', window._arcCharSelectHandler);
      _updateCharConfirmBtn();
    }
  } catch (e) {
    console.error('[goArcCharSelect] Error:', e);
  }
}

/* ============================================================
   PARTY SWAP (World Map overlay)
   ============================================================ */
let _partySwapSelection = [];

function openPartySwap() {
  // Start selection from current active party
  _partySwapSelection = [...(G.selectedChars.length ? G.selectedChars : G.unlockedChars.slice(0, 4))];
  _renderPartySwapGrid();
  const overlay = document.getElementById('party-swap-overlay');
  if (overlay) overlay.classList.add('open');
}

function closePartySwap() {
  const overlay = document.getElementById('party-swap-overlay');
  if (overlay) overlay.classList.remove('open');
  // Resume map engine if we're in explore mode
  if (G.mode === 'story_explore' && typeof MapEngine !== 'undefined' && !MapEngine.isRunning()) {
    MapEngine.resume();
  }
}

function confirmPartySwap() {
  if (_partySwapSelection.length !== 4) return;
  G.selectedChars = [..._partySwapSelection];
  G.selectedChar  = G.selectedChars[0];
  buildParty();
  // Auto-save the new party composition
  if (typeof Story !== 'undefined' && Story.active) Story._doSave();
  closePartySwap();
  // Show brief confirmation toast
  if (typeof Save !== 'undefined') Save._showToast('Party updated');
}

function _renderPartySwapGrid() {
  const grid    = document.getElementById('party-swap-grid');
  const counter = document.getElementById('party-swap-counter');
  const confirm = document.getElementById('party-swap-confirm');
  if (!grid) return;

  grid.innerHTML = '';
  const unlocked = G.chars.filter(ch => G.unlockedChars.includes(ch.id));

  unlocked.forEach(ch => {
    const slotIdx  = _partySwapSelection.indexOf(ch.id);
    const isActive = slotIdx !== -1;

    const card = document.createElement('div');
    card.className = 'swap-card' + (isActive ? ' active' : '');
    card.dataset.charid = ch.id;

    card.innerHTML =
      (isActive ? `<div class="swap-card-badge">${slotIdx + 1}</div>` : '') +
      `<div class="swap-icon" style="background:${ch.portrait_color}20;border-color:${ch.portrait_color}50">${ch.icon}</div>` +
      `<div class="swap-info">` +
        `<div class="swap-name">${ch.alias || ch.name}</div>` +
        `<div class="swap-title">${ch.title}</div>` +
        `<div class="swap-stats">ATK ${ch.base_stats.atk + (ch.stat_bonuses.atk||0)} · SPD ${ch.base_stats.spd + (ch.stat_bonuses.spd||0)}</div>` +
      `</div>`;

    card.addEventListener('click', () => {
      const idx = _partySwapSelection.indexOf(ch.id);
      if (idx !== -1) {
        // Deselect
        _partySwapSelection.splice(idx, 1);
      } else {
        if (_partySwapSelection.length >= 4) return; // already full
        _partySwapSelection.push(ch.id);
      }
      _renderPartySwapGrid();
    });

    grid.appendChild(card);
  });

  const count = _partySwapSelection.length;
  if (counter) counter.textContent = `${count} / 4 selected`;
  if (confirm) confirm.disabled = count !== 4;
}

function _renderCharGrid() {
  const grid = UI.el('char-grid');
  grid.innerHTML = '';
  // Only show characters that are unlocked
  G.chars.filter(ch => G.unlockedChars.includes(ch.id)).forEach(ch => {
    const selIdx    = G.selectedChars.indexOf(ch.id);
    const isSelected = selIdx !== -1;
    const d = document.createElement('div');
    d.className = 'char-card' + (isSelected ? ' selected' : '');
    d.dataset.char = ch.id;
    d.innerHTML = `
      ${isSelected ? `<div class="char-sel-badge">${selIdx + 1}</div>` : ''}
      <div class="char-portrait" style="background:${ch.portrait_color}20;border-color:${ch.portrait_color}50">
        <span>${ch.icon}</span>
      </div>
      <div class="char-info">
        <div class="char-name">${ch.alias || ch.name}</div>
        <div class="char-title">${ch.title}</div>
        <div class="char-aff">Affinity: ${ch.class_affinity.join(', ')}</div>
      </div>`;
    d.onclick = () => selectChar(ch.id);
    grid.appendChild(d);
  });
}

function _updateCharConfirmBtn() {
  const n   = G.selectedChars.length;
  const btn = UI.el('char-confirm');
  const counter = UI.el('char-counter');
  btn.disabled  = n < 4;
  btn.textContent = n < 4 ? `SELECT ${4 - n} MORE →` : '▶ ENTER BATTLE →';
  if (counter) counter.innerHTML = `Party: <span>${n}</span> / 4`;
}

function selectChar(id) {
  const idx = G.selectedChars.indexOf(id);
  if (idx !== -1) {
    G.selectedChars.splice(idx, 1);          // deselect
  } else {
    if (G.selectedChars.length >= 4) return; // already full
    G.selectedChars.push(id);
  }
  G.selectedChar = G.selectedChars[0] || null;
  _renderCharGrid();
  _updateCharConfirmBtn();

  // Show details for the clicked character
  const ch = G.chars.find(c => c.id === id);
  if (!ch) return;
  const s = ch.base_stats;
  UI.el('char-detail').innerHTML = `
    <strong style="color:${ch.portrait_color}">${ch.icon} ${ch.alias || ch.name}</strong> — <em style="color:var(--text-dim)">${ch.personality}</em><br>
    ${ch.description}<br>
    <div class="stat-row">
      <span class="stat-chip">HP <span>${s.hp}</span></span>
      <span class="stat-chip">MP <span>${s.mp}</span></span>
      <span class="stat-chip">ATK <span>${s.atk}</span></span>
      <span class="stat-chip">DEF <span>${s.def}</span></span>
      <span class="stat-chip">SPD <span>${s.spd}</span></span>
      <span class="stat-chip">MAG <span>${s.mag}</span></span>
    </div>
    <span class="passive-tag">★ ${ch.passive.name}: ${ch.passive.description}</span>`;
}

/* ============================================================
   CLASS SELECT
   ============================================================ */
function goClassSelect() {
  if (!G.selectedChar) return;
  UI.show('class-screen');
  const ch   = G.chars.find(c => c.id === G.selectedChar);
  const grid = UI.el('class-grid');
  grid.innerHTML = '';
  G.classes.forEach(cls => {
    const affinity = ch.class_affinity.includes(cls.id);
    const d = document.createElement('div');
    d.className = 'class-card' + (affinity ? ' affinity-match' : '');
    d.innerHTML = `
      <div class="class-header">
        <span class="class-icon">${cls.icon}</span>
        <div>
          <div class="class-name">${cls.name}</div>
          <div class="class-tag">${cls.tag}</div>
        </div>
      </div>
      <div style="font-size:13px;color:var(--text-dim)">${cls.description}</div>`;
    d.onclick = () => selectClass(cls.id);
    grid.appendChild(d);
  });
  UI.el('class-detail').innerHTML = 'Select a class to preview combined stats.';
  UI.el('combined-preview').style.display = 'none';
  UI.el('class-confirm').disabled = true;
}

function selectClass(id) {
  G.selectedClass = id;
  document.querySelectorAll('.class-card').forEach((c, i) => {
    c.classList.toggle('selected', G.classes[i].id === id);
  });
  const ch  = G.chars.find(c => c.id === G.selectedChar);
  const cls = G.classes.find(c => c.id === id);

  UI.el('class-detail').innerHTML = `
    <strong style="color:${cls.color}">${cls.icon} ${cls.name}</strong><br>
    Abilities: ${cls.abilities.map(a => `<span style="color:var(--blue)">${a.icon} ${a.name}</span>`).join(', ')}`;

  const combined = computeStats(ch, cls);
  const maxStat = 150;
  const labels = ['HP','MP','ATK','DEF','SPD','MAG'];
  const keys   = ['hp','mp','atk','def','spd','mag'];
  const colors = ['#22cc44','#4466ff','#ff8040','#60b0ff','#50e0d0','#b070ff'];
  UI.el('combined-bars').innerHTML = keys.map((k,i) => {
    const val = combined[k];
    const pct = Math.min(100, val / maxStat * 100);
    return `<div class="pbar-item">
      <span class="pbar-label">${labels[i]}</span><span class="pbar-val">${val}</span>
      <div class="pbar-bg"><div class="pbar-fill" style="width:${pct}%;background:${colors[i]}"></div></div>
    </div>`;
  }).join('');
  UI.el('combined-preview').style.display = 'block';
  UI.el('class-confirm').disabled = false;
}

function computeStats(ch, cls) {
  const b = ch.base_stats, m = cls.stat_multipliers, bon = ch.stat_bonuses || {};
  const out = {};
  ['hp','mp','atk','def','spd','mag'].forEach(k => {
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
    const ch       = G.chars.find(c => c.id === charId); if (!ch) return;
    const isPlayer = charId === G.selectedChar;
    // Each character always uses their specific class affinity
    const classId  = ch.class_affinity[0] || G.classes[0].id;
    const cls      = G.classes.find(c => c.id === classId) || G.classes[0];
    const s        = computeStats(ch, cls);
    G.party.push({
      charId, classId,
      name: `${ch.name} / ${cls.name}`,
      displayName: ch.alias || ch.name,
      hp: s.hp, maxHp: s.hp,
      // Restore saved MP if available so it carries between battles; cap to max
      mp: (ch.mp !== undefined ? Math.min(ch.mp, s.mp) : s.mp), maxMp: s.mp,
      atk: s.atk, def: s.def, spd: s.spd, mag: s.mag,
      lv: ch.lv || 1, exp: ch.exp || 0, gold: ch.gold || 0,
      char: ch, cls: cls,
      passive: ch.passive,
      abilities: cls.abilities,
      isPlayer,
      isKO: false,
      buff: null, debuff: null, regenTurns: 0, stunned: false, frozen: 0,
      _dragonLeapTurns: 0,
    });
    // Passive stat bonuses applied at battle build
    const _m = G.party[G.party.length - 1];
    if (_m.passive?.id === 'divine_authority') _m.def = Math.floor(_m.def * 1.2);
    if (_m.passive?.id === 'yakshas_valor')    _m.atk = Math.floor(_m.atk * 1.15);
  });
  applyRelicBonuses();
}

// Apply active relic bonuses as multipliers on top of base party stats
function applyRelicBonuses() {
  const active = G.activeRelics || [];
  if (!active.length) return;
  const defs = G.relics || [];

  // Aggregate bonuses from all active relics
  const bonus = { hp: 1, mp: 1, atk: 1, def: 1, spd: 1, mag: 1, healAmp: 1, mpRegen: 0, eliteResist: 0 };
  active.forEach(id => {
    const r = defs.find(d => d.id === id);
    if (!r || !r.bonus) return;
    if (r.bonus.hp)          bonus.hp          += r.bonus.hp;
    if (r.bonus.mp)          bonus.mp          += r.bonus.mp;
    if (r.bonus.atk)         bonus.atk         += r.bonus.atk;
    if (r.bonus.def)         bonus.def         += r.bonus.def;
    if (r.bonus.spd)         bonus.spd         += r.bonus.spd;
    if (r.bonus.mag)         bonus.mag         += r.bonus.mag;
    if (r.bonus.healAmp)     bonus.healAmp     += r.bonus.healAmp;
    if (r.bonus.mpRegen)     bonus.mpRegen     += r.bonus.mpRegen;
    if (r.bonus.eliteResist) bonus.eliteResist += r.bonus.eliteResist; // Tarnished Wing
  });

  G.party.forEach(m => {
    m.maxHp  = Math.floor(m.maxHp  * bonus.hp);
    m.hp     = Math.min(m.hp, m.maxHp);
    m.maxMp  = Math.floor(m.maxMp  * bonus.mp);
    m.mp     = Math.min(m.mp, m.maxMp);
    m.atk    = Math.floor(m.atk    * bonus.atk);
    m.def    = Math.floor(m.def    * bonus.def);
    m.spd    = Math.floor(m.spd    * bonus.spd);
    m.mag    = Math.floor(m.mag    * bonus.mag);
    m._healAmpRelic  = bonus.healAmp;    // used by healing logic
    m._mpRegenBonus  = bonus.mpRegen;    // extra % of maxMp per turn
    m._eliteResist   = bonus.eliteResist; // fraction of damage reduction vs Corrupted/Mutant
  });
}

function buildEnemyGroup(defs, spawnLevel = 1, isBoss = false) {
  // Tier-based growth rates
  const tierGrowth = {
    // NEW growth rates — ensures enemies scale as threats through Lv40
    1: { hp: 5,  atk: 1.2, def: 0.5, spd: 0.5, mag: 0.3, statMult: 1.0, expMult: 1.0 },
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
    const tier   = def.tier || 1;
    const growth = tierGrowth[tier] || tierGrowth[1];

    const calcStat = (baseStat, statKey) => {
      const base       = baseStat * growth.statMult * hordeScale * bossMult;
      const levelBonus = growth[statKey] * (spawnLevel - 1) * hordeScale * bossMult;
      return Math.max(1, Math.floor(base + levelBonus));
    };

    const finalHp   = calcStat(def.stats.hp,  'hp');
    const finalAtk  = calcStat(def.stats.atk, 'atk');
    const finalDef  = calcStat(def.stats.def, 'def');
    const finalSpd  = calcStat(def.stats.spd, 'spd');
    const finalMag  = calcStat(def.stats.mag, 'mag');
    // EXP/gold scale by count so total reward is fair
    const finalExp  = Math.floor(def.reward.exp  * growth.expMult * hordeScale);
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
      element:  def.element  || 'physical',
      weakTo:   def.weakTo   || [],
      resistTo: def.resistTo || [],
      tier:     tier,
      isKO: false, stunned: false, debuff: null,
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
  G.party.forEach((m, i)      => { if (Battle.alive(m)) q.push({ type:'party', idx:i, spd:m.spd }); });
  G.enemyGroup.forEach((e, i) => { if (Battle.alive(e)) q.push({ type:'enemy', idx:i, spd:e.spd }); });
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
  const pool  = G.enemies.slice();
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
  UI.setLog([`${names} appear!`, `Party to battle stations!`], ['hi','']);
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
  G.turnQueue      = buildTurnQueue();
  G.turnIdx        = 0;
  G.activeMemberIdx = 0;
  G.busy           = false;
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
    b.className = 'cmd-btn';
    b.innerHTML = `${ab.icon||''} ${ab.name} <span style="color:var(--text-dim);font-size:13px">(${ab.mp}MP)</span>`;
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
    const t    = G.turnQueue[G.turnIdx];
    const unit = t.type === 'party' ? G.party[t.idx] : G.enemyGroup[t.idx];
    if (Battle.alive(unit)) break;
    G.turnIdx++;
  }
  // New round if exhausted
  if (G.turnIdx >= G.turnQueue.length) {
    G.turnQueue = buildTurnQueue();
    G.turnIdx   = 0;
    if (!G.turnQueue.length) return;
  }

  const t = G.turnQueue[G.turnIdx];
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
function createEffectOverlay(targetIdx, element, targetType = 'enemy', abilityId = null) {
  if (targetIdx === undefined || targetIdx === null) return;

  // Try to get SVG animation from SVGAnimations factory
  let overlay = null;
  let duration = 600;

  if (abilityId && SVGAnimations && SVGAnimations[abilityId]) {
    // Use SVG animation factory
    overlay = SVGAnimations[abilityId].create(targetIdx, targetType);
    duration = SVGAnimations[abilityId].duration;
  } else if (abilityId && moveAnimations[abilityId]) {
    // Fallback to CSS overlay animation from moveAnimations
    overlay = document.createElement('div');
    overlay.className = `effect-overlay overlay-${abilityId}`;
    duration = moveAnimations[abilityId].overlayDuration;
  } else {
    // Fallback to element-based CSS animation
    overlay = document.createElement('div');
    overlay.className = `effect-overlay element-${element}`;
    const durations = {
      'ice': 600, 'fire': 650, 'wind': 600, 'electric': 500,
      'water': 600, 'light': 700, 'dark': 650, 'physical': 500
    };
    duration = durations[element] || 600;
  }

  if (!overlay) return;

  // Position overlay on target sprite (enemy right side or party left side)
  const sprId = targetType === 'enemy' ? `espr-${targetIdx}` : `pspr-${targetIdx}`;
  const spr = document.getElementById(sprId);
  if (spr) {
    const rect = spr.getBoundingClientRect();
    const sceneRect = document.getElementById('battle-scene').getBoundingClientRect();
    // getBoundingClientRect() returns screen pixels; divide by game scale so the
    // overlay lands correctly inside the scaled #game coordinate space.
    const gameEl = document.getElementById('game');
    const scaleMatch = gameEl?.style.transform.match(/scale\(([\d.]+)\)/);
    const gameScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    overlay.style.left = ((rect.left - sceneRect.left + 8) / gameScale) + 'px';
    overlay.style.top  = ((rect.top  - sceneRect.top  - 10) / gameScale) + 'px';
  }

  document.getElementById('battle-scene').appendChild(overlay);
  setTimeout(() => overlay.remove(), duration);
}

/* ============================================================
   HERO / PARTY ACTIONS  (actor = current party member)
   ============================================================ */
function heroAttack() {
  if (G.busy) return;
  UI.openSub(null);
  G.busy = true; UI.btns(false);

  const actor = G.party[G.activeMemberIdx];
  const enemy = G.enemy;
  if (!actor || !enemy) { G.busy = false; return; }

  // Basic attack carries the character's class element
  const _atkElem = actor.cls?.element || 'physical';
  const actorSpr = document.getElementById('pspr-' + G.activeMemberIdx);
  if (actorSpr) {
    actorSpr.classList.add('anim-slash');
    actorSpr.classList.add(`element-${_atkElem}`);
    setTimeout(() => {
      actorSpr.classList.remove('anim-slash');
      actorSpr.classList.remove(`element-${_atkElem}`);
    }, 460);
  }

  UI.setLog([`${actor.displayName} attacks ${enemy.name}!`], ['hi']);

  setTimeout(() => {
    if (typeof SFX !== 'undefined') { SFX.attack(); setTimeout(() => SFX.enemyHit(), 80); }
    const _em   = Battle.elemMult(_atkElem, enemy);
    const _bb   = actor.passive?.id === 'blood_blossom' && actor.hp / actor.maxHp < 0.5 ? 1.35 : 1.0;
    const _stab = actor.cls?.element ? 1.25 : 1.0; // no element = no STAB on basic attack
    const dmg   = Math.floor(Battle.physDmg(actor.atk, enemy.def, 1, actor.lv || 1, enemy.level || 1) * _em * _stab * _bb);
    enemy.hp  = Math.max(0, enemy.hp - dmg);
    if (enemy.hp <= 0) enemy.isKO = true;
    const _er = Battle.elemResult(_atkElem, enemy);
    if (_er === 'shatter') UI.addLog('⚡ SHATTER!', 'magic');
    else if (_er === 'weak')   UI.addLog('✦ WEAK!', 'magic');
    else if (_er === 'resist') UI.addLog('▸ Resist', 'regen');
    else if (_er === 'immune') UI.addLog('■ IMMUNE — no effect!', 'regen');
    UI.addLog('◈ STAB!', 'magic');

    UI.popEnemy(G.targetEnemyIdx, dmg, 'dmg', _atkElem);
    createEffectOverlay(G.targetEnemyIdx, _atkElem, 'enemy');

    const enemySpr = document.getElementById('espr-' + G.targetEnemyIdx);
    if (enemySpr) {
      enemySpr.classList.add('sprite-damage-flash');
      setTimeout(() => enemySpr.classList.remove('sprite-damage-flash'), 200);
    }

    shakeEnemy(G.targetEnemyIdx);
    _applyVampiric(enemy, dmg, G.targetEnemyIdx);
    UI.addLog(`Dealt ${dmg} damage!`, 'dmg');
    _checkDragonLeap(actor);
    UI.renderEnemyRow();
    setTimeout(advanceTurn, 700);
  }, 460);
}

function heroAbility(ab) {
  if (G.busy) return;
  const actor = G.party[G.activeMemberIdx];
  if (!actor) return;
  const _mpCost = actor.passive?.id === 'eidolon_bond' ? Math.ceil(ab.mp * 0.85) : ab.mp;
  if (actor.mp < _mpCost) { UI.setLog(['Not enough MP!'], ['dmg']); UI.openSub(null); return; }
  UI.openSub(null);
  G.busy = true; UI.btns(false);

  const e   = ab.effect || {};
  const element = e.element || 'physical';

  // Get move-specific animation config or use defaults
  const moveConfig = moveAnimations[ab.id] || { actorDuration: 560, overlayDuration: 600, isUltimate: false };
  const animDuration = moveConfig.actorDuration;

  const spr = document.getElementById('pspr-' + G.activeMemberIdx);
  if (spr) {
    spr.classList.add(`anim-${ab.id}`);
    spr.classList.add(`element-${element}`);
    setTimeout(() => {
      spr.classList.remove(`anim-${ab.id}`);
      spr.classList.remove(`element-${element}`);
    }, animDuration);
  }
  UI.setLog([`${actor.displayName} uses ${ab.name}!`], ['magic']);
  actor.mp = Math.max(0, actor.mp - _mpCost);

  // HP Sacrifice (Hu Tao mechanics)
  if (e.hpCostPercent) {
    const cost = Math.floor(actor.hp * e.hpCostPercent);
    actor.hp = Math.max(1, actor.hp - cost);
    UI.popParty(G.activeMemberIdx, cost, 'dmg', 'dark');
    UI.addLog(`${actor.displayName} sacrifices vitality for power!`, 'dmg');
  }

  // Ultimates with 3-second channel animation before damage lands
  const ultimateChannels = {
    'cryoclasm':         'channels ice blades...',
    'spirit_soother':    'channels soul fire...',
    'hajras_hymn':       'channels star blessing...',
    'mastery_of_pain':   'channels karmic winds...'
  };
  const isUltimate = ultimateChannels.hasOwnProperty(ab.id);

  setTimeout(() => {
    const enemy = G.enemy;

    if (isUltimate) {
      UI.addLog(`${actor.displayName} ${ultimateChannels[ab.id]}`, 'magic');
      createEffectOverlay(G.targetEnemyIdx, element, 'enemy', ab.id);
    }

    if (ab.type === 'physical') {
      const isOnCD = actor.cooldowns && actor.cooldowns[ab.id] > 0;
      if (isOnCD) { UI.addLog(`${ab.name} is on cooldown for ${actor.cooldowns[ab.id]} turns!`, 'dmg'); G.busy = false; UI.btns(true); return; }

      if (typeof SFX !== 'undefined') SFX.attack();
      const _stab = actor.passive?.id === 'eidolon_bond' ? 1.25 : (element === actor.cls?.element || (element === 'wind' && actor.cls?.element === 'anemo') || (element === 'anemo' && actor.cls?.element === 'wind')) ? 1.25 : 1.0;
      const _bb   = actor.passive?.id === 'blood_blossom' && actor.hp / actor.maxHp < 0.5 ? 1.35 : 1.0;
      
      // Balanced HP Scaling (10%) vs Standard Stat Scaling (50%)
      const _scaleCoeff = (e.statScale === 'hp' || e.statScale === 'maxHp') ? 0.1 : 0.5;
      const _scaleStat = e.statScale ? Math.floor((actor[e.statScale] || 0) * _scaleCoeff) : 0;
      const _effectiveAtk = actor.atk + _scaleStat;

      // Desperation Bonus: Hits harder with lower health
      const _hpPercent = actor.hp / actor.maxHp;
      const _lowHpMult = 1 + (1 - _hpPercent) * (e.lowHpDmgBonus || 0);

      const targets = e.aoe
        ? G.enemyGroup.map((en, i) => ({ en, i })).filter(({ en }) => Battle.alive(en))
        : [{ en: enemy, i: G.targetEnemyIdx }];

      let totalDmg = 0;
      targets.forEach(({ en: tgt, i: tIdx }) => {
        const _em = Battle.elemMult(element, tgt);
        // Elemental Amps
        const _amp = (element === 'fire' ? actor.fireAmp || 1.0 : 1.0);
        const dmg = Math.floor(Battle.physDmg(_effectiveAtk, tgt.def, e.dmgMultiplier || 1, actor.lv || 1, tgt.level || 1, e.defPen || 0) * _em * _stab * _bb * _amp * _lowHpMult);
        tgt.hp = Math.max(0, tgt.hp - dmg);
        if (tgt.hp <= 0) tgt.isKO = true;
        totalDmg += dmg;

        // Cryoclasm reset logic
        if (ab.id === 'cryoclasm' && tgt.frozen > 0) {
          actor._cryoReset = true;
        }

        const _er = Battle.elemResult(element, tgt);
        if (_er === 'shatter') UI.addLog('⚡ SHATTER!', 'dmg');
        else if (_er === 'weak') UI.addLog('✦ WEAK!', 'dmg');
        else if (_er === 'resist') UI.addLog('▸ Resist', 'regen');
        else if (_er === 'immune') UI.addLog('■ IMMUNE!', 'regen');

        UI.popEnemy(tIdx, dmg, 'dmg', element);
        createEffectOverlay(tIdx, element, 'enemy', ab.id);
        const eSpr = document.getElementById('espr-' + tIdx);
        if (eSpr) { eSpr.classList.add('sprite-damage-flash'); setTimeout(() => eSpr.classList.remove('sprite-damage-flash'), 200); }
        shakeEnemy(tIdx);
        _applyVampiric(tgt, dmg, tIdx);
        UI.addLog(`${actor.displayName} strikes ${tgt.name} for ${dmg}!`, 'dmg');
      });

      if (_stab > 1) UI.addLog('◈ STAB!', 'magic');
      if (_bb > 1)   UI.addLog('🔥 Blood Blossom!', 'magic');
      if (_scaleStat > 0) UI.addLog(`💠 Scales +${_scaleStat} ATK from ${e.statScale.toUpperCase()}!`, 'magic');

      // Set cooldown
      if (e.cooldown) {
        actor.cooldowns[ab.id] = e.cooldown + 1; // +1 because decrement happens immediately/next turn
      }
      if (actor._cryoReset) {
        actor.cooldowns[ab.id] = 0;
        UI.addLog('❄ Cryoclasm Reset! Strike again!', 'regen');
        delete actor._cryoReset;
      }

      // Handle LifeSteal
      if (e.lifeSteal && totalDmg > 0) {
        let lMult = e.lifeSteal;
        // Low HP Bonus Healing (Hu Tao ultimate)
        if (e.healLowMult && actor.hp / actor.maxHp < 0.5) lMult *= e.healLowMult;
        
        const healAmt = Math.floor(totalDmg * lMult);
        if (e.aoe) {
          G.party.forEach((m, idx) => {
            if (!Battle.alive(m)) return;
            m.hp = Math.min(m.maxHp, m.hp + healAmt);
            UI.popParty(idx, healAmt, 'heal', 'light');
          });
          UI.addLog(`💖 ${ab.name}: Party restored ${healAmt} HP!`, 'heal');
        } else {
          actor.hp = Math.min(actor.maxHp, actor.hp + healAmt);
          UI.popParty(G.activeMemberIdx, healAmt, 'heal', 'light');
          UI.addLog(`💖 ${ab.name}: ${actor.displayName} restored ${healAmt} HP!`, 'heal');
        }
      }

      // Handle Secondary Buffs on self
      if (e.spdBuff) {
        actor.spd += e.spdBuff;
        UI.addLog(`${actor.displayName}'s SPD raised!`, 'heal');
      }

      _checkDragonLeap(actor);
      UI.renderEnemyRow(); UI.renderPartyStatus();
      setTimeout(advanceTurn, targets.length > 1 ? 1000 : 600);

    } else if (ab.type === 'magic_damage') {
      if (typeof SFX !== 'undefined') SFX.magic();
      const _stab = actor.passive?.id === 'eidolon_bond' ? 1.25 : (element === actor.cls?.element || (element === 'wind' && actor.cls?.element === 'anemo') || (element === 'anemo' && actor.cls?.element === 'wind')) ? 1.25 : 1.0;
      const passiveBonus = actor.passive?.id === 'arcane_surge' ? 1.15
                         : actor.passive?.id === 'eidolon_bond'  ? 1.2 : 1.0;

      const _scaleCoeff = (e.statScale === 'hp' || e.statScale === 'maxHp') ? 0.1 : 0.5;
      const _scaleStat = e.statScale ? Math.floor((actor[e.statScale] || 0) * _scaleCoeff) : 0;
      const _effectiveMag = actor.mag + _scaleStat;

      const _hpPercent = actor.hp / actor.maxHp;
      const _lowHpMult = 1 + (1 - _hpPercent) * (e.lowHpDmgBonus || 0);

      if (isUltimate) {
        const _em = Battle.elemMult(element, enemy);
        const _er = Battle.elemResult(element, enemy);
        createEffectOverlay(G.targetEnemyIdx, element, 'enemy', ab.id);
        UI.addLog(`${actor.displayName} ${ultimateChannels[ab.id]}`, 'magic');
        setTimeout(() => {
          const dmg = Math.floor(Battle.magicDmg(_effectiveMag, e.dmgMultiplier || 1.5, passiveBonus, actor.lv || 1) * _em * _stab);
          if (_scaleStat > 0) UI.addLog(`💠 Karmic scales +${_scaleStat} from ${e.statScale.toUpperCase()}!`, 'magic');
          enemy.hp  = Math.max(0, enemy.hp - dmg);
          if (enemy.hp <= 0) enemy.isKO = true;
          if (_er === 'shatter') UI.addLog('⚡ SHATTER!', 'magic');
          else if (_er === 'weak')   UI.addLog('✦ WEAK!', 'magic');
          else if (_er === 'resist') UI.addLog('▸ Resist', 'regen');
          else if (_er === 'immune') UI.addLog('■ IMMUNE — no effect!', 'regen');
          if (_stab > 1) UI.addLog('◈ STAB!', 'magic');
          UI.popEnemy(G.targetEnemyIdx, dmg, 'magic', element);
          const eSpr = document.getElementById('espr-' + G.targetEnemyIdx);
          if (eSpr) { eSpr.classList.add('sprite-damage-flash'); setTimeout(() => eSpr.classList.remove('sprite-damage-flash'), 200); }
          shakeEnemy(G.targetEnemyIdx);
          _applyVampiric(enemy, dmg, G.targetEnemyIdx);
          UI.addLog(`${enemy.name} took ${dmg} magic damage!`, 'magic');
          UI.renderEnemyRow(); UI.renderPartyStatus();
          setTimeout(advanceTurn, 750);
        }, 3000);
      } else {
        // Normal magic damage — supports AoE
        const _magTargets = e.aoe
          ? G.enemyGroup.map((en, i) => ({ en, i })).filter(({ en }) => Battle.alive(en))
          : [{ en: enemy, i: G.targetEnemyIdx }];
        let totalDmg = 0;
        _magTargets.forEach(({ en: tgt, i: tIdx }) => {
          const _em = Battle.elemMult(element, tgt);
          // Amps
          const _amp = (element === 'fire' ? actor.fireAmp || 1.0 : 1.0);
          const dmg = Math.floor(Battle.magicDmg(_effectiveMag, e.dmgMultiplier || 1.5, passiveBonus, actor.lv || 1, tgt.mag, tgt.lv || 1) * _em * _stab * _amp * _lowHpMult);
          tgt.hp = Math.max(0, tgt.hp - dmg);
          if (tgt.hp <= 0) tgt.isKO = true;
          totalDmg += dmg;

          const _er = Battle.elemResult(element, tgt);
          if (_er === 'shatter') UI.addLog('⚡ SHATTER!', 'magic');
          else if (_er === 'weak')   UI.addLog('✦ WEAK!', 'magic');
          else if (_er === 'resist') UI.addLog('▸ Resist', 'regen');
          else if (_er === 'immune') UI.addLog('■ IMMUNE — no effect!', 'regen');
          UI.popEnemy(tIdx, dmg, 'magic', element);
          createEffectOverlay(tIdx, element, 'enemy', ab.id);
          const eSpr = document.getElementById('espr-' + tIdx);
          if (eSpr) { eSpr.classList.add('sprite-damage-flash'); setTimeout(() => eSpr.classList.remove('sprite-damage-flash'), 200); }
          shakeEnemy(tIdx);
          _applyVampiric(tgt, dmg, tIdx);
          UI.addLog(`${tgt.name} took ${dmg} magic damage!`, 'magic');
        });

        // LifeSteal for Magic (Lulu's Water Wheel)
        if (e.lifeSteal && totalDmg > 0) {
          const healAmt = Math.floor(totalDmg * e.lifeSteal);
          G.party.forEach((m, idx) => {
            if (!Battle.alive(m)) return;
            m.hp = Math.min(m.maxHp, m.hp + healAmt);
            UI.popParty(idx, healAmt, 'heal', 'light');
          });
          UI.addLog(`💖 ${ab.name}: Party restored ${healAmt} HP from spell!`, 'heal');
        }

        if (_stab > 1) UI.addLog('◈ STAB!', 'magic');
        _checkDragonLeap(actor);
      }

    } else if (ab.type === 'heal') {
      if (typeof SFX !== 'undefined') SFX.heal();
      const _healAmp = (actor.passive?.id === 'dance_of_haftkarsvar' ? 1.3 : 1.0) * (actor.healBoost || 1.0);
      const getHealAmt = (m) => {
        if (e.healPercent) return Math.floor(m.maxHp * e.healPercent);
        const base = e.healBase || 20;
        const rand = e.healRandom || 15;
        const magBonus = Math.floor(actor.mag * 1.5);
        return Math.floor((base + Math.random() * rand + magBonus) * _healAmp);
      };

      const targets = e.aoe ? G.party.filter(m => Battle.alive(m)) : [G.party[G.activeMemberIdx]];
      targets.forEach(m => {
        const amt = getHealAmt(m);
        m.hp = Math.min(m.maxHp, m.hp + amt);
        const pIdx = G.party.indexOf(m);
        UI.popParty(pIdx, amt, 'heal', 'light');
        
        if (e.cleanse) {
          m.debuff = null;
          m.stunned = false;
          m.frozen = 0;
          UI.addLog(`✨ ${m.displayName} Cleansed!`, 'heal');
        }
      });
      createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
      
      if (e.healBoost) {
        actor.healBoost = e.healBoost;
        actor.healBoostTurns = e.duration || 3;
        UI.addLog(`🌿 ${actor.displayName}'s healing power surged!`, 'heal');
      }
      if (e.spdBuff) {
        actor.spd = Math.floor(actor.spd * e.spdBuff);
        actor._spdBuffVal = e.spdBuff;
        UI.addLog(`💨 ${actor.displayName}'s SPD raised!`, 'heal');
      }

      UI.renderPartyStatus();
      setTimeout(advanceTurn, 800);

    } else if (ab.type === 'regen') {
      actor.regenTurns = e.duration || 3;
      createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
      UI.addLog(`${actor.displayName}: Regen for ${actor.regenTurns} turns!`, 'regen');

    } else if (ab.type === 'buff') {
      const applyBuff = (m, idx) => {
        if (!Battle.alive(m)) return;
        // Primary stat buff
        if (e.stat) {
          if (m.buff) m[m.buff.stat] = m.buff.origVal;
          m.buff = { stat: e.stat, origVal: m[e.stat], turns: e.duration || 2 };
          m[e.stat] = Math.floor(m[e.stat] * (e.multiplier || 1.3));
        }
        
        // Multi-stat secondary boosters
        if (e.atkBuff) { m.atk = Math.floor(m.atk * e.atkBuff); m._atkBuffVal = e.atkBuff; }
        if (e.defBuff) { m.def = Math.floor(m.def * e.defBuff); m._defBuffVal = e.defBuff; }
        if (e.spdBuff && !m._spdBuffVal) { m.spd = Math.floor(m.spd * e.spdBuff); m._spdBuffVal = e.spdBuff; }
        if (e.magBuff) { m.mag = Math.floor(m.mag * e.magBuff); m._magBuffVal = e.magBuff; }
        
        // Special status effects
        if (e.damageReduction) m.dmgReduction = (1 - e.damageReduction);
        if (e.evasion) m.evasion = e.evasion;
        if (e.reflect) m.reflect = e.reflect;
        if (e.guardMark) { m.guardMark = true; m.guardMarkTurns = e.duration || 3; }
        if (e.fireAmp) m.fireAmp = e.fireAmp;
        if (e.absorb) m.absorbElement = e.absorb;

        createEffectOverlay(idx, element, 'party', ab.id);
      };

      if (e.aoe) {
        G.party.forEach((m, i) => applyBuff(m, i));
        UI.addLog(`${actor.displayName}: ${ab.name} shields the entire party!`, 'heal');
      } else {
        applyBuff(actor, G.activeMemberIdx);
        UI.addLog(`${actor.displayName} gained a temporary boost!`, 'heal');
      }

    } else if (ab.type === 'debuff') {
      if (!enemy.debuff && e.stat) {
        enemy.debuff = { stat: e.stat, origVal: enemy[e.stat], turns: e.duration || 2 };
        enemy[e.stat] = Math.floor(enemy[e.stat] * (e.multiplier || 0.7));
        UI.addLog(`${enemy.name}'s ${e.stat.toUpperCase()} lowered!`, 'magic');
      } else if (e.stat) {
        UI.addLog(`${enemy.name} is already debuffed!`, '');
      }
      // Freeze secondary effect (e.g. Permafrost)
      if (e.freezeChance && !enemy.frozen && Math.random() < e.freezeChance) {
        enemy.frozen = 2;
        UI.addLog(`❄ ${enemy.name} is Frozen for 2 turns!`, 'magic');
      }

    } else if (ab.type === 'stun') {
      enemy.stunned = Math.random() < (e.stunChance || 0.5);
      UI.addLog(enemy.stunned ? `${enemy.name} is stunned!` : 'Had no effect!', enemy.stunned ? 'magic' : '');

    } else if (ab.type === 'steal') {
      const ok = Math.random() < (e.stealChance || 0.5);
      if (ok) {
        const gold = 5 + Math.floor(Math.random() * 10);
        actor.gold += gold;
        UI.addLog(`Stole ${gold} gold from ${enemy.name}!`, 'steal');
      } else {
        UI.addLog('Steal failed!', '');
      }

    } else if (ab.type === 'run') {
      if (e.guaranteedRun || Math.random() < 0.6) {
        UI.addLog('Escaped successfully!', 'hi');
        setTimeout(() => showResult('escaped'), 1000);
        return;
      }
      UI.addLog('Could not escape!', 'dmg');
      UI.renderEnemyRow(); UI.renderPartyStatus();
      setTimeout(advanceTurn, 800);
      return;
    }

    // Skip normal render/turn for all ultimates (handled in special timing)
    const ultimateIds = ['cryoclasm', 'guide_to_afterlife', 'hajras_hymn', 'mastery_of_pain'];
    if (ab.type === 'magic_damage' && ultimateIds.includes(ab.id)) {
      return;
    }

    UI.renderEnemyRow(); UI.renderPartyStatus();
    setTimeout(advanceTurn, moveConfig.isUltimate ? 900 : 750);
  }, animDuration);
}

/* ============================================================
   INVENTORY SYSTEM
   ============================================================ */
const MAX_INVENTORY_STACKS = 20;
const MAX_STACK_QTY        = 99;

function addToInventory(itemId, qty = 1) {
  const def = G.items.find(i => i.id === itemId);
  if (!def) return false;
  const existing = G.inventory.find(s => s.itemId === itemId);
  if (existing) {
    existing.qty = Math.min(MAX_STACK_QTY, existing.qty + qty);
  } else {
    if (G.inventory.length >= MAX_INVENTORY_STACKS) return false; // bag full
    G.inventory.push({ itemId, qty: Math.min(MAX_STACK_QTY, qty) });
  }
  return true;
}

function removeFromInventory(itemId, qty = 1) {
  const idx = G.inventory.findIndex(s => s.itemId === itemId);
  if (idx < 0) return false;
  G.inventory[idx].qty -= qty;
  if (G.inventory[idx].qty <= 0) G.inventory.splice(idx, 1);
  return true;
}

// Open the item submenu in battle
function heroItem() {
  if (G.busy) return;
  UI.openSub(null);
  _buildItemMenu();
}

function _buildItemMenu() {
  const menu = UI.el('item-sub');
  if (!menu) return;
  menu.innerHTML = '';

  const battleItems = G.inventory.filter(s => {
    const def = G.items.find(i => i.id === s.itemId);
    return def && def.usable_in.includes('battle');
  });

  if (!battleItems.length) {
    const empty = document.createElement('div');
    empty.className = 'item-empty';
    empty.textContent = 'No items available.';
    menu.appendChild(empty);
    const back = document.createElement('button');
    back.className = 'cmd-btn dim';
    back.textContent = '← BACK';
    back.onclick = () => UI.openSub(null);
    menu.appendChild(back);
    UI.openSub('item-sub');
    return;
  }

  battleItems.forEach(stack => {
    const def = G.items.find(i => i.id === stack.itemId);
    if (!def) return;
    const needsTarget = def.effect.target === 'single';
    const btn = document.createElement('button');
    btn.className = 'cmd-btn item-btn';
    btn.innerHTML = `<span class="item-icon">${def.icon}</span> ${def.name} <span class="item-qty">×${stack.qty}</span>`;
    btn.title = def.description;
    btn.onclick = () => {
      if (needsTarget) {
        _buildItemTargetMenu(def);
      } else {
        _useItem(def, -1);
      }
    };
    menu.appendChild(btn);
  });

  const back = document.createElement('button');
  back.className = 'cmd-btn dim';
  back.textContent = '← BACK';
  back.onclick = () => UI.openSub(null);
  menu.appendChild(back);
  UI.openSub('item-sub');
}

function _buildItemTargetMenu(def) {
  const menu = UI.el('item-sub');
  menu.innerHTML = '';

  // Filter valid targets based on item subtype
  const isRevive = def.subtype === 'revive';
  const targets  = G.party.filter((m, i) => isRevive ? m.isKO : Battle.alive(m));

  targets.forEach(m => {
    const idx = G.party.indexOf(m);
    const col = CHAR_COLOR[m.charId] || '#aaa';
    const btn = document.createElement('button');
    btn.className = 'cmd-btn';
    btn.style.borderLeftColor = col;
    btn.innerHTML = `<span style="color:${col}">${m.displayName}</span> <span class="item-qty">${m.hp}/${m.maxHp} HP</span>`;
    btn.onclick = () => _useItem(def, idx);
    menu.appendChild(btn);
  });

  const back = document.createElement('button');
  back.className = 'cmd-btn dim';
  back.textContent = '← BACK';
  back.onclick = () => _buildItemMenu();
  menu.appendChild(back);
}

function _useItem(def, targetIdx) {
  if (G.busy) return;
  G.busy = true; UI.btns(false);
  UI.openSub(null);

  const e = def.effect;

  // Escape item
  if (def.subtype === 'escape') {
    removeFromInventory(def.id);
    UI.setLog(['The party vanishes in a cloud of smoke!'], ['hi']);
    setTimeout(() => showResult('escaped'), 900);
    return;
  }

  const targets = e.target === 'all'
    ? G.party.filter(m => def.subtype === 'revive' ? m.isKO : Battle.alive(m))
    : [G.party[targetIdx]];

  targets.forEach((m, i) => {
    const pIdx = G.party.indexOf(m);

    if (e.stat === 'hp') {
      const amt = e.percent ? Math.floor(m.maxHp * e.amount / 100) : e.amount;
      m.hp = Math.min(m.maxHp, m.hp + amt);
      UI.popParty(pIdx, amt, 'heal');

    } else if (e.stat === 'mp') {
      const amt = e.percent ? Math.floor(m.maxMp * e.amount / 100) : e.amount;
      m.mp = Math.min(m.maxMp, m.mp + amt);
      UI.popParty(pIdx, amt, 'regen');

    } else if (e.stat === 'both') {
      m.hp = m.maxHp; m.mp = m.maxMp;
      UI.popParty(pIdx, 0, 'heal');

    } else if (e.stat === 'revive') {
      m.isKO = false;
      m.hp   = Math.max(1, Math.floor(m.maxHp * e.amount / 100));
      UI.popParty(pIdx, m.hp, 'heal');

    } else if (e.stat === 'debuff') {
      if (m.debuff) { m[m.debuff.stat] = m.debuff.origVal; m.debuff = null; }
      UI.popParty(pIdx, 0, 'regen');

    } else if (e.stat === 'atk' || e.stat === 'def') {
      const origVal = m[e.stat];
      const boost   = Math.floor(origVal * e.amount / 100);
      m[e.stat]     = origVal + boost;
      m.buff        = { stat: e.stat, origVal, turns: e.turns || 3 };
      UI.popParty(pIdx, boost, 'hi');
    }
  });

  removeFromInventory(def.id);

  const tName = e.target === 'all' ? 'the party' : targets[0]?.displayName || '?';
  UI.setLog([`Used ${def.icon} ${def.name} on ${tName}!`], ['hi']);
  UI.renderPartyStatus();

  setTimeout(advanceTurn, 800);
}

// Award drops from a defeated enemy def
function _awardDrops(enemyDef) {
  if (!enemyDef.drops || !enemyDef.drops.length) return [];
  const awarded = [];
  enemyDef.drops.forEach(drop => {
    const roll = Math.random() * 100;
    if (roll <= (drop.chance || 20)) {
      addToInventory(drop.itemId, drop.qty || 1);
      awarded.push(drop.itemId);
    }
  });
  return awarded;
}

// Attempt to drop a random common/uncommon relic from enemies
// elite flag raises the chance
function _tryRelicDrop(isElite) {
  const chance = isElite ? 25 : 8;
  if (Math.random() * 100 > chance) return null;
  const pool = (G.relics || []).filter(r =>
    (r.rarity === 'common' || r.rarity === 'uncommon') &&
    !G.ownedRelics.includes(r.id)
  );
  if (!pool.length) return null;
  const relic = pool[Math.floor(Math.random() * pool.length)];
  G.ownedRelics.push(relic.id);
  // Auto-equip if a slot is free
  if (G.activeRelics.length < 3) G.activeRelics.push(relic.id);
  return relic;
}

// Award a specific boss relic by ID (called after arc boss victory)
function awardBossRelic(relicId) {
  if (!relicId || G.ownedRelics.includes(relicId)) return null;
  const relic = (G.relics || []).find(r => r.id === relicId);
  if (!relic) return null;
  G.ownedRelics.push(relicId);
  if (G.activeRelics.length < 3) G.activeRelics.push(relicId);
  return relic;
}

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
  UI.addLog(`${actor?.displayName}'s turn — choose action!`, 'hi');
  UI.updateStats();
}

function shakeEnemy(idx) {
  const spr = document.getElementById('espr-' + idx);
  if (!spr) return;
  spr.classList.add('anim-shake');
  setTimeout(() => spr.classList.remove('anim-shake'), 380);
}

/* ============================================================
   PASSIVE HELPERS
   ============================================================ */
// Dragon's Leap: every 3rd hero action fires a free bonus aerial strike
function _checkDragonLeap(actor) {
  if (actor.passive?.id !== 'dragon_leap') return;
  actor._dragonLeapTurns = (actor._dragonLeapTurns || 0) + 1;
  if (actor._dragonLeapTurns % 3 !== 0) return;
  const tgt = G.enemy;
  if (!tgt || !Battle.alive(tgt)) return;
  const dmg = Math.floor(Battle.physDmg(actor.atk, tgt.def, 1.6, actor.lv || 1, tgt.level || 1) * Battle.elemMult('wind', tgt));
  tgt.hp = Math.max(0, tgt.hp - dmg);
  if (tgt.hp <= 0) tgt.isKO = true;
  UI.popEnemy(G.targetEnemyIdx, dmg, 'dmg', 'wind');
  UI.addLog(`🐉 Dragon's Leap! Bonus aerial strike for ${dmg}!`, 'magic');
  UI.renderEnemyRow();
}

/* ============================================================
   ENEMY AI
   ============================================================ */
function enemyAct(enemy, enemyIdx) {
  if (enemy.stunned || enemy.frozen > 0) {
    const isFrozen = enemy.frozen > 0;
    if (isFrozen) enemy.frozen--;
    else enemy.stunned = false;
    
    UI.setLog([`${enemy.name} is ${isFrozen?'Frozen':'Stunned'} — skips turn!`], ['magic']);
    setTimeout(advanceTurn, 700);
    return;
  }
  if (enemy.frozen > 0) {
    enemy.frozen--;
    UI.setLog([`❄ ${enemy.name} is frozen — skips turn!`], ['magic']);
    setTimeout(advanceTurn, 700);
    return;
  }

  // Tick enemy debuff
  if (enemy.debuff) {
    enemy.debuff.turns--;
    if (enemy.debuff.turns <= 0) { enemy[enemy.debuff.stat] = enemy.debuff.origVal; enemy.debuff = null; }
  }

  const alive = G.party.filter(m => Battle.alive(m));
  if (!alive.length) { advanceTurn(); return; }

  // Taunt Check: If anyone has guardMark, they are the mandatory target
  const taunterIdx = G.party.findIndex(m => Battle.alive(m) && m.guardMark);
  let target;
  if (taunterIdx !== -1) {
    target = G.party[taunterIdx];
    UI.addLog(`🛡️ Enemies focused on ${target.displayName}'s Guard Mark!`, 'regen');
  } else {
    // Pick target — bias toward lower HP ratio
    alive.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
    target = Math.random() < 0.6 ? alive[0] : alive[Math.floor(Math.random() * alive.length)];
  }
  const targetIdx = G.party.indexOf(target);

  const ab = Battle.pickAbility(enemy.abilityDefs);
  const element = enemy.element || ab?.effect?.element || 'physical';

  // Get move-specific animation config or use defaults
  const moveConfig = (ab?.id && moveAnimations[ab.id])
    ? moveAnimations[ab.id]
    : { actorDuration: 460, overlayDuration: 600, isUltimate: false };
  const animDuration = moveConfig.actorDuration;

  const enemySpr = document.getElementById('espr-' + enemyIdx);
  if (enemySpr) {
    // Use move-specific animation if available, otherwise use generic slash
    const animClass = ab?.id ? `anim-${ab.id}` : 'anim-slash';
    enemySpr.classList.add(animClass);
    enemySpr.classList.add(`element-${element}`);
    setTimeout(() => {
      enemySpr.classList.remove(animClass);
      enemySpr.classList.remove(`element-${element}`);
    }, animDuration);
  }

  setTimeout(() => {
    // Helper: apply elite resist (Tarnished Wing relic) to damage from Corrupted/Mutant
    const _isElite = !!(enemy.mutantTraits || enemy.isCorrupted);
    const _applyEliteResist = (dmg, tgt) => {
      const resist = tgt._eliteResist || 0;
      return (_isElite && resist > 0) ? Math.max(1, Math.floor(dmg * (1 - resist))) : dmg;
    };

    if (!ab || ab.type === 'physical') {
      if (typeof SFX !== 'undefined') { SFX.enemyHit(); setTimeout(() => SFX.attack(), 60); }
      
      // 1. Check Evasion
      if (target.evasion && Math.random() < target.evasion) {
        UI.addLog(`💨 ${target.displayName} dodged the attack!`, 'hi');
        UI.popParty(targetIdx, 0, 'miss');
        return;
      }

      const _pm  = Battle.playerElemMult(element, target);
      let dmg    = Math.floor(Battle.physDmg(enemy.atk, target.def, ab?.dmgMultiplier || 1, enemy.level || 1, target.lv || 1) * _pm);
      
      // Absorption Check
      if (target.absorbElement && target.absorbElement === element) {
        target.hp = Math.min(target.maxHp, target.hp + dmg);
        UI.popParty(targetIdx, dmg, 'heal');
        UI.addLog(`⭐ ${target.displayName} ABSORBED the attack!`, 'heal');
        createEffectOverlay(targetIdx, element, 'party');
        UI.renderPartyStatus();
        setTimeout(advanceTurn, 700);
        return;
      }

      // Apply passive & buff damage reductions
      if (target.passive?.id === 'yakshas_valor')    dmg = Math.floor(dmg * 0.9);
      if (target.passive?.id === 'divine_authority') dmg = Math.floor(dmg * 0.85);
      if (target.passive?.id === 'divine_blessing')  dmg = Math.floor(dmg * 0.88);
      if (target.dmgReduction) dmg = Math.floor(dmg * target.dmgReduction);

      dmg = _applyEliteResist(dmg, target); // Tarnished Wing elite resist
      target.hp  = Math.max(0, target.hp - dmg);
      UI.popParty(targetIdx, dmg, 'dmg', element);
      createEffectOverlay(targetIdx, element, 'party');
      const pspr = document.getElementById('pspr-' + targetIdx);
      if (pspr) { pspr.classList.add('anim-shake'); setTimeout(() => pspr.classList.remove('anim-shake'), 380); }
      const _pr = Battle.playerElemResult(element, target);
      UI.setLog([`${enemy.name} attacks ${target.displayName}!`, `${target.displayName} took ${dmg} damage!`], ['','dmg']);
      if (_pr === 'weak')   UI.addLog('✦ WEAK!', 'dmg');
      else if (_pr === 'resist') UI.addLog('▸ Resist', 'regen');

      // Reflect Damage (Warden's Valor / passive)
      const reflectPerc = (target.reflect || 0) + (target.passive?.id === 'divine_authority' ? 0.1 : 0);
      if (reflectPerc > 0 && dmg > 0 && Battle.alive(enemy)) {
        const reflect = Math.floor(dmg * reflectPerc);
        enemy.hp = Math.max(0, enemy.hp - reflect);
        UI.addLog(`✦ Reflected ${reflect} damage!`, 'magic');
      }

    } else if (ab.type === 'magic_damage') {
      if (typeof SFX !== 'undefined') SFX.magic();
      
      // 1. Check Evasion (can dodge magic too in this system)
      if (target.evasion && Math.random() < target.evasion) {
        UI.addLog(`💨 ${target.displayName} dodged the spell!`, 'hi');
        UI.popParty(targetIdx, 0, 'miss');
        return;
      }

      const _pm = Battle.playerElemMult(element, target);
      let dmg   = Math.floor(Battle.magicDmg(enemy.mag, ab.dmgMultiplier || 1.3, 1.0, enemy.level || 1, target.mag || 0, target.lv || 1) * _pm);
      
      // Absorption Check
      if (target.absorbElement && target.absorbElement === element) {
        target.hp = Math.min(target.maxHp, target.hp + dmg);
        UI.popParty(targetIdx, dmg, 'heal');
        UI.addLog(`⭐ ${target.displayName} ABSORBED the spell!`, 'heal');
        createEffectOverlay(targetIdx, element, 'party');
        UI.renderPartyStatus();
        setTimeout(advanceTurn, 700);
        return;
      }

      if (target.passive?.id === 'yakshas_valor')    dmg = Math.floor(dmg * 0.9);
      if (target.passive?.id === 'divine_authority') dmg = Math.floor(dmg * 0.85);
      if (target.passive?.id === 'divine_blessing')  dmg = Math.floor(dmg * 0.88);
      if (target.dmgReduction) dmg = Math.floor(dmg * target.dmgReduction);

      dmg = _applyEliteResist(dmg, target); // Tarnished Wing elite resist
      target.hp = Math.max(0, target.hp - dmg);
      UI.popParty(targetIdx, dmg, 'magic', element);
      createEffectOverlay(targetIdx, element, 'party');
      const _pr = Battle.playerElemResult(element, target);
      UI.setLog([`${enemy.name} uses ${ab.name}!`, `${target.displayName} took ${dmg} magic damage!`], ['magic','dmg']);
      if (_pr === 'weak')   UI.addLog('✦ WEAK!', 'dmg');
      else if (_pr === 'resist') UI.addLog('▸ Resist', 'regen');

      // Reflect
      const reflectPerc = (target.reflect || 0) + (target.passive?.id === 'divine_authority' ? 0.1 : 0);
      if (reflectPerc > 0 && dmg > 0 && Battle.alive(enemy)) {
        const reflect = Math.floor(dmg * reflectPerc);
        enemy.hp = Math.max(0, enemy.hp - reflect);
        UI.addLog(`✦ Reflected ${reflect} damage!`, 'magic');
      }

    } else {
      UI.setLog([`${enemy.name} uses ${ab.name}!`], ['']);
    }

    // Iron Will (Kael)
    if (target.passive?.id === 'iron_will' && !target.passive.triggered && target.hp / target.maxHp < 0.3) {
      target.def = Math.floor(target.def * 1.25);
      target.passive = { ...target.passive, triggered: true };
    }

    // Regen ticks for all party members after each enemy action
    const _hasDivBless = G.party.some(p => Battle.alive(p) && p.passive?.id === 'divine_blessing');
    G.party.forEach((m, i) => {
      if (!Battle.alive(m)) return;
      // Passive MP regen: 3 MP per turn (mpRegen relic gives bonus)
      const mpRegenAmt = 3 + Math.floor((m._mpRegenBonus || 0) * m.maxMp);
      m.mp = Math.min(m.maxMp, m.mp + mpRegenAmt);
      if (m.passive?.id === 'natures_grace' && m.hp < m.maxHp) {
        m.hp = Math.min(m.maxHp, m.hp + 5); UI.popParty(i, 5, 'regen');
      }
      if (m.regenTurns > 0) {
        m.regenTurns--; 
        const _amt = m.hpRegenAmt || 8;
        m.hp = Math.min(m.maxHp, m.hp + _amt); 
        UI.popParty(i, _amt, 'regen');
      }
      
      // Cooldown & Status decrement
      if (m.frozen > 0) m.frozen--;
      if (m.healBoostTurns > 0) {
        m.healBoostTurns--;
        if (m.healBoostTurns <= 0) m.healBoost = null;
      }
      if (m.guardMarkTurns > 0) {
        m.guardMarkTurns--;
        if (m.guardMarkTurns <= 0) m.guardMark = null;
      }

      if (m.cooldowns) {
        for (let cid in m.cooldowns) {
          if (m.cooldowns[cid] > 0) m.cooldowns[cid]--;
        }
      }

      // Divine Blessing: knight king's aura grants all allies 2% max HP regen per turn
      if (_hasDivBless && m.hp < m.maxHp) {
        const _dbAmt = Math.max(1, Math.floor(m.maxHp * 0.02));
        m.hp = Math.min(m.maxHp, m.hp + _dbAmt);
      }
      if (m.buff) { 
        m.buff.turns--; 
        if (m.buff.turns <= 0) { 
          m[m.buff.stat] = m.buff.origVal; 
          m.buff = null; 
          
          // Multi-stat cleanup
          if (m._atkBuffVal) { m.atk = Math.ceil(m.atk / m._atkBuffVal); delete m._atkBuffVal; }
          if (m._defBuffVal) { m.def = Math.ceil(m.def / m._defBuffVal); delete m._defBuffVal; }
          if (m._spdBuffVal) { m.spd = Math.ceil(m.spd / m._spdBuffVal); delete m._spdBuffVal; }
          if (m._magBuffVal) { m.mag = Math.ceil(m.mag / m._magBuffVal); delete m._magBuffVal; }

          // Reset special buff flags: Hu Tao cleanup
          m.dmgReduction = null;
          m.evasion = null;
          m.hpRegenAmt = null;
          m.reflect = null;
          m.fireAmp = null;
          m.absorbElement = null;
        } 
      }
    });

    // ── Mutant trait ticks after enemy action ─────────────────
    G.enemyGroup.forEach((e, i) => {
      if (!Battle.alive(e) || !e.mutantTraits) return;
      const traits = e.mutantTraits;

      // Regenerating: recover 5% max HP per turn end
      if (traits.some(t => t.id === 'regenerating')) {
        const healAmt = Math.max(1, Math.floor(e.maxHp * 0.05));
        e.hp = Math.min(e.maxHp, e.hp + healAmt);
        UI.popEnemy(i, healAmt, 'regen');
      }

      // Enraged: ATK grows +5% per turn, no cap — hard DPS timer
      if (traits.some(t => t.id === 'enraged')) {
        e._enragedTurns = (e._enragedTurns || 0) + 1;
        const gain = Math.max(1, Math.floor(e.atk * 0.05));
        e.atk += gain;
        if (e._enragedTurns === 1) UI.addLog(`⚡ ${e.name} is Enraged! ATK rising each turn!`, 'dmg');
      }
    });

    if (target.hp <= 0) {
      target.isKO = true;
      UI.addLog(`${target.displayName} has fallen!`, 'dmg');
    }

    UI.renderPartyStatus();
    UI.renderPartyRow();
    setTimeout(advanceTurn, 760);
  }, 580);
}

/* ============================================================
   WIN / LOSE CHECK + LEVEL UP
   ============================================================ */
function checkBattleEnd() {
  const allEnemiesDead = G.enemyGroup.every(e => !Battle.alive(e));
  const allPartyDown   = G.party.every(m => !Battle.alive(m));

  if (allEnemiesDead) {
    let totalExp = 0, totalGold = 0;
    const allDrops = [];
    let relicDrop = null;
    G.enemyGroup.forEach(e => {
      totalExp  += e.exp;
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
      const gap       = (m.lv || 1) - avgEnemyLv;
      const expScale  = gap >= 3 ? 0 : gap <= 0 ? 1 : 1 - (gap / 3);
      const earnedExp = Math.floor(totalExp * expScale);
      m.exp  += earnedExp;
      m.gold += totalGold;
      while (checkMemberLevel(m)) {
        if (!leveledNames.includes(m.displayName)) leveledNames.push(m.displayName);
      }
      // Sync stats back to character data for persistence across battles
      const ch = G.chars.find(c => c.id === m.charId);
      if (ch) {
        ch.lv   = m.lv;
        ch.exp  = m.exp;
        ch.gold = m.gold;
        ch.mp   = m.mp;   // persist MP so it carries between battles
      }
    });

    const dropMsg = allDrops.length
      ? allDrops.map(id => { const d = G.items.find(i => i.id === id); return d ? `${d.icon}${d.name}` : id; }).join(', ')
      : null;
    const relicMsg = relicDrop ? `✦ Relic found: ${relicDrop.icon} ${relicDrop.name}!` : null;
    UI.setLog([
      `Enemies defeated! +${totalExp} EXP +${totalGold} Gold`,
      dropMsg  ? `Drops: ${dropMsg}` : '',
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
function checkLevel() { return checkMemberLevel(G.hero); }

function checkMemberLevel(m) {
  if (!m || m.exp < 30 * m.lv) return false;
  m.lv++;
  const g = m.cls.growthPerLevel || {};
  m.maxHp += (g.hp  || 8);
  m.maxMp += (g.mp  || 3);
  m.hp     = m.maxHp;
  m.mp     = m.maxMp;
  m.atk   += (g.atk || 2);
  m.def   += (g.def || 1);
  m.mag   += (g.mag || 1);
  return true;
}

/* ============================================================
   RESULT SCREEN
   ============================================================ */
function showResult(type) {
  _clearBattleAtmosphere();
  closePartyMenu();
  const t       = UI.el('result-title');
  const st      = UI.el('result-stats');
  const party   = UI.el('result-party');
  const retryBtn = UI.el('result-retry-btn');
  const againBtn = UI.el('result-again-btn');

  // Party member cards — shown on all result types
  if (party && G.party.length) {
    party.innerHTML = G.party.map(m => {
      const col    = CHAR_COLOR[m.charId] || '#aaa';
      const isKO   = !Battle.alive(m);
      const hpTxt  = isKO ? '0' : m.hp;
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
    t.className   = 'result-title victory';
    const totalGold = G.party.reduce((s, m) => s + (m.gold || 0), 0);
    st.innerHTML  = `All enemies defeated!<br><span class="val">+Gold collected this run: ${totalGold}</span>`;
    if (retryBtn) retryBtn.style.display = 'none';
    if (againBtn) againBtn.textContent   = '▶ PLAY AGAIN';
  } else if (type === 'defeat') {
    if (typeof SFX !== 'undefined') SFX.defeat();
    t.textContent = '💀 GAME OVER 💀';
    t.className   = 'result-title defeat';
    st.innerHTML  = `The party has fallen...`;
    if (retryBtn) retryBtn.style.display = '';
    if (againBtn) againBtn.textContent   = '⬅ MENU';
  } else {
    t.textContent = '💨 ESCAPED!';
    t.className   = 'result-title escaped';
    st.innerHTML  = `The party fled from battle!`;
    if (retryBtn) retryBtn.style.display = 'none';
    if (againBtn) againBtn.textContent   = '▶ PLAY AGAIN';
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
    m.buff = null; m.debuff = null; m.regenTurns = 0; m.stunned = false;
  });
  const level = G.enemyGroup[0]?.level || 1;
  const defs  = G.enemyGroup.map(e => G.enemies.find(r => r.id === e.id)).filter(Boolean);
  buildEnemyGroup(defs, level);
  G.turnQueue = buildTurnQueue();
  G.turnIdx   = 0;
  G.busy      = false;
  UI.show('battle-screen');
  UI.renderBattleUI();
  processCurrentTurn();
}

/* ============================================================
   EXPLORE MODE
   ============================================================ */
/* Move mute/TTS/zoom into the explore header so they don't clash */
function _dockPersistentBtns(dock) {
  const hdrRight   = document.querySelector('.explore-header-right');
  const muteBtn    = document.getElementById('mute-btn');
  const ttsBtn     = document.getElementById('tts-btn');
  const zoomBtn    = document.getElementById('zoom-btn');
  const resetBtn   = document.getElementById('reset-zoom-btn');
  const gameEl     = document.getElementById('game');

  if (dock && hdrRight) {
    // Make them inline in the header
    [muteBtn, ttsBtn].forEach(b => {
      if (!b) return;
      b.style.position = 'static';
      b.style.width    = '28px';
      b.style.height   = '28px';
      b.style.fontSize = '13px';
      hdrRight.insertBefore(b, hdrRight.firstChild);
    });
    if (zoomBtn)  zoomBtn.style.display  = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
  } else {
    // Restore to absolute positioning
    [muteBtn, ttsBtn].forEach(b => {
      if (!b) return;
      b.style.position = 'absolute';
      b.style.width    = '';
      b.style.height   = '';
      b.style.fontSize = '';
      if (gameEl) gameEl.appendChild(b);
    });
    if (zoomBtn)  zoomBtn.style.display  = '';
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
    G.selectedChar  = G.selectedChars[0];
    // Don't set selectedClass — buildParty will use each character's class_affinity
    buildParty();
  }
  G.mode = 'explore';
  UI.show('explore-screen');
  _dockPersistentBtns(true);

  // Size canvas to its container
  const wrap   = document.getElementById('explore-canvas-wrap');
  const canvas = document.getElementById('explore-canvas');
  canvas.width  = wrap.clientWidth  || 360;
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
