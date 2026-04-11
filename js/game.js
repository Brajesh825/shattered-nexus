/**
 * game.js — Shattered Nexus
 * Full party battle engine: player controls all 4 members,
 * selectable enemy targets, individual levelling, party menu.
 */

/* ── Mobile viewport scaler ─────────────────────────────────
   Scales #game via CSS transform so it fits any screen size
   without touching pixel values elsewhere in the codebase.
   Called on load, resize, orientation change, and screen switch.
   ──────────────────────────────────────────────────────────── */
function scaleGame() {
  const el = document.getElementById('game');
  if (!el) return;
  el.style.transform       = '';
  el.style.height          = '';
  el.style.transformOrigin = '';
  document.body.style.justifyContent = '';

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw >= 1000) {
    el.style.height = `${vh}px`;
    return;
  }

  const scale = vw / 1000;
  // Anchor to top-left so body overflow:hidden doesn't clip the right side
  el.style.transform       = `scale(${scale})`;
  el.style.transformOrigin = 'top left';
  el.style.height          = `${vh / scale}px`;
  document.body.style.justifyContent = 'flex-start';
}
window.addEventListener('resize', scaleGame);
window.addEventListener('orientationchange', () => setTimeout(scaleGame, 150));

/* ============================================================
   BATTLE ENGINE (math helpers)
   ============================================================ */
const Battle = {
  physDmg(atk, def, mult = 1, atkLevel = 1, defLevel = 1) {
    // Level scales damage: +0.5 damage per level
    const scaledAtk = atk + (atkLevel * 0.5);
    const scaledDef = def + (defLevel * 0.3);
    const base = Math.max(1, scaledAtk - scaledDef * 0.4);
    return Math.max(1, Math.floor(base * (0.85 + Math.random() * 0.3) * mult));
  },
  magicDmg(mag, mult = 1, passiveBonus = 1, magLevel = 1) {
    // Level scales magic: +0.3 damage per level (less than physical)
    const scaledMag = mag + (magLevel * 0.3);
    const base = Math.max(1, scaledMag * 0.9);
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
  selectedChar:  null,
  selectedClass: null,
  selectedChars: [],   // ordered array of up to 4 char IDs
  unlockedChars: ['ayaka', 'hutao', 'nilou', 'xiao'],  // Characters available for selection

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
const moveAnimations = {
  // Cryo Bladestorm (Ayaka)
  'frostblossom': { actorDuration: 560, overlayDuration: 600, isUltimate: false },
  'glacial_waltz': { actorDuration: 560, overlayDuration: 600, isUltimate: false },
  'permafrost': { actorDuration: 560, overlayDuration: 600, isUltimate: false },
  'cryoclasm': { actorDuration: 800, overlayDuration: 3000, isUltimate: true },

  // Spirit Incinerator (Hu Tao)
  'spirit_flame': { actorDuration: 560, overlayDuration: 600, isUltimate: false },
  'paramita_papilio': { actorDuration: 560, overlayDuration: 600, isUltimate: false },
  'blood_blossom_enhanced': { actorDuration: 560, overlayDuration: 600, isUltimate: false },
  'guide_to_afterlife': { actorDuration: 800, overlayDuration: 3000, isUltimate: true },

  // Hydro Performer (Nilou)
  'dance_of_blessing': { actorDuration: 560, overlayDuration: 600, isUltimate: false },
  'water_wheel': { actorDuration: 560, overlayDuration: 600, isUltimate: false },
  'harmony_preservation': { actorDuration: 560, overlayDuration: 600, isUltimate: false },
  'hajras_hymn': { actorDuration: 800, overlayDuration: 3000, isUltimate: true },

  // Yaksha Protector (Xiao)
  'lancing_strike': { actorDuration: 560, overlayDuration: 600, isUltimate: false },
  'yaksha_valor_active': { actorDuration: 560, overlayDuration: 600, isUltimate: false },
  'karmic_barrier': { actorDuration: 560, overlayDuration: 600, isUltimate: false },
  'mastery_of_pain': { actorDuration: 800, overlayDuration: 3000, isUltimate: true },

  // Summoner (Rydia)
  'summon_bahamut': { actorDuration: 700, overlayDuration: 2400, isUltimate: false },
  'summon_syldra': { actorDuration: 700, overlayDuration: 2200, isUltimate: false },
  'eidolon_channel': { actorDuration: 700, overlayDuration: 2100, isUltimate: false },
  'absolute_summon': { actorDuration: 850, overlayDuration: 2700, isUltimate: true },

  // Valkyrie (Lenneth)
  'valkyrie_strike': { actorDuration: 560, overlayDuration: 1800, isUltimate: false },
  'judgment_seal': { actorDuration: 560, overlayDuration: 2200, isUltimate: false },
  'transcendent_power': { actorDuration: 560, overlayDuration: 2300, isUltimate: false },
  'divine_execution': { actorDuration: 800, overlayDuration: 2600, isUltimate: true },

  // Divine Dragoon (Kain)
  'dragoon_lance': { actorDuration: 600, overlayDuration: 1900, isUltimate: false },
  'dragon_jump': { actorDuration: 650, overlayDuration: 2100, isUltimate: false },
  'divine_flight': { actorDuration: 600, overlayDuration: 2400, isUltimate: false },
  'heavens_fall': { actorDuration: 850, overlayDuration: 2700, isUltimate: true },

  // Grail Guardian (Leon)
  'holy_strike': { actorDuration: 560, overlayDuration: 1850, isUltimate: false },
  'divine_shield': { actorDuration: 560, overlayDuration: 2200, isUltimate: false },
  'grail_blessing': { actorDuration: 560, overlayDuration: 2300, isUltimate: false },
  'lionheart_ascendant': { actorDuration: 850, overlayDuration: 2900, isUltimate: true }
};

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

    G.enemyGroup.forEach((e, i) => {
      const alive = Battle.alive(e);
      const pct   = Math.max(0, e.hp / e.maxHp * 100);

      // Enemy wrapper
      const enemy = document.createElement('div');
      enemy.className = 'enemy' + (!alive ? ' ko-enemy' : '');
      enemy.dataset.idx = i;
      enemy.dataset.target = i === G.targetEnemyIdx ? 'true' : 'false';
      enemy.onclick = () => selectTarget(i);

      // Sprite
      const spr = document.createElement('img');
      spr.className = 'enemy-sprite';
      spr.id = 'espr-' + i;
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

      // Enemy info (name + level)
      const info = document.createElement('div');
      info.className = 'enemy-info';
      info.innerHTML = `<div class="enemy-name">${e.name}</div><div class="enemy-level">Lv ${e.level}</div>`;
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
window.addEventListener('DOMContentLoaded', () => {
  G.chars   = window.CHARACTERS_DATA || [];
  G.classes = window.CLASSES_DATA    || [];
  G.enemies = window.ENEMIES_DATA    || [];
  G.items   = window.ITEMS_DATA      || [];
  window._origEnemies = G.enemies.slice();
  initStars();
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
  console.log('[Encounter] Starting battle:', { enc, mode: G.mode, storyActive: typeof Story !== 'undefined' });

  const enemyIds = enc.enemies || [];
  console.log('[Encounter] Enemy IDs:', enemyIds);

  const enemyDefs = enemyIds
    .map(id => {
      const def = G.enemies.find(e => e.id === id);
      console.log(`[Encounter] Looking for enemy "${id}":`, def ? 'FOUND' : 'NOT FOUND');
      return def;
    })
    .filter(Boolean);

  console.log('[Encounter] Enemy defs count:', enemyDefs.length);
  if (enemyDefs.length === 0) {
    console.warn('[Encounter] No enemy definitions found, aborting');
    return;
  }

  // Get enemy level range from map
  const [minLevel, maxLevel] = map?.enemyLevelRange || [1, 1];
  const spawnLevel = minLevel + Math.floor(Math.random() * (maxLevel - minLevel + 1));
  console.log('[Encounter] Spawn level:', spawnLevel, 'range:', [minLevel, maxLevel]);

  // Story mode: build battle but route back to story
  if (G.mode === 'story_explore' && typeof Story !== 'undefined') {
    console.log('[Encounter] Story mode detected, launching battle');
    buildEnemyGroup(enemyDefs, spawnLevel);
    _initBattle();
    const names = G.enemyGroup.map(e => e.name).join(' & ');
    UI.setLog([`⚔ ${names} appeared!`, `Party to battle stations!`], ['hi','']);
    processCurrentTurn();
    return;
  }

  // Free explore mode: direct battle
  console.log('[Encounter] Free explore mode, launching battle');
  buildEnemyGroup(enemyDefs, spawnLevel);
  _initBattle();
  const names = G.enemyGroup.map(e => e.name).join(' & ');
  UI.setLog([`⚔ ${names} appeared!`, `Party to battle stations!`], ['hi','']);
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
        `<div class="swap-name">${ch.name}</div>` +
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
        <div class="char-name">${ch.name}</div>
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
    <strong style="color:${ch.portrait_color}">${ch.icon} ${ch.name}</strong> — <em style="color:var(--text-dim)">${ch.personality}</em><br>
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
      displayName: ch.name,
      hp: s.hp, maxHp: s.hp,
      mp: s.mp, maxMp: s.mp,
      atk: s.atk, def: s.def, spd: s.spd, mag: s.mag,
      lv: ch.lv || 1, exp: ch.exp || 0, gold: ch.gold || 0,
      char: ch, cls: cls,
      passive: ch.passive,
      abilities: cls.abilities,
      isPlayer,
      isKO: false,
      buff: null, debuff: null, regenTurns: 0, stunned: false,
    });
  });
}

function buildEnemyGroup(defs, spawnLevel = 1) {
  // Tier-based growth rates
  const tierGrowth = {
    1: { hp: 3, atk: 0.4, def: 0.2, spd: 0.3, mag: 0.2, statMult: 1.0, expMult: 1.0 },
    2: { hp: 5, atk: 0.7, def: 0.4, spd: 0.5, mag: 0.4, statMult: 1.3, expMult: 1.5 },
    3: { hp: 8, atk: 1.0, def: 0.7, spd: 0.7, mag: 0.6, statMult: 1.7, expMult: 2.5 },
  };

  // Horde scaling: 3+ enemies get reduced individual stats so they're dangerous
  // but not overwhelming. Scales down as group grows.
  const hordeScale = defs.length >= 4 ? 0.65 : defs.length === 3 ? 0.78 : 1.0;

  G.enemyGroup = defs.slice(0, 4).map(def => {
    const tier   = def.tier || 1;
    const growth = tierGrowth[tier] || tierGrowth[1];

    const calcStat = (baseStat, statKey) => {
      const base       = baseStat * growth.statMult * hordeScale;
      const levelBonus = growth[statKey] * (spawnLevel - 1) * hordeScale;
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
      <div style="font-weight:bold;font-size:14px">${ch.name}</div>
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

  // Play attack animation on party sprite
  const actorSpr = document.getElementById('pspr-' + G.activeMemberIdx);
  if (actorSpr) {
    actorSpr.classList.add('anim-slash');
    actorSpr.classList.add('element-physical');
    setTimeout(() => {
      actorSpr.classList.remove('anim-slash');
      actorSpr.classList.remove('element-physical');
    }, 460);
  }

  UI.setLog([`${actor.displayName} attacks ${enemy.name}!`], ['hi']);

  setTimeout(() => {
    if (typeof SFX !== 'undefined') { SFX.attack(); setTimeout(() => SFX.enemyHit(), 80); }
    const dmg = Battle.physDmg(actor.atk, enemy.def, 1, actor.lv || 1, enemy.level || 1);
    enemy.hp  = Math.max(0, enemy.hp - dmg);
    if (enemy.hp <= 0) enemy.isKO = true;

    // Damage number popup
    UI.popEnemy(G.targetEnemyIdx, dmg, 'dmg', 'physical');

    // Visual effect overlay on target
    createEffectOverlay(G.targetEnemyIdx, 'physical', 'enemy');

    // Enemy sprite flash
    const enemySpr = document.getElementById('espr-' + G.targetEnemyIdx);
    if (enemySpr) {
      enemySpr.classList.add('sprite-damage-flash');
      setTimeout(() => enemySpr.classList.remove('sprite-damage-flash'), 200);
    }

    shakeEnemy(G.targetEnemyIdx);
    UI.addLog(`Dealt ${dmg} damage!`, 'dmg');
    UI.renderEnemyRow();
    setTimeout(advanceTurn, 700);
  }, 460);
}

function heroAbility(ab) {
  if (G.busy) return;
  const actor = G.party[G.activeMemberIdx];
  if (!actor) return;
  if (actor.mp < ab.mp) { UI.setLog(['Not enough MP!'], ['dmg']); UI.openSub(null); return; }
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
  actor.mp = Math.max(0, actor.mp - ab.mp);

  setTimeout(() => {
    const enemy = G.enemy;

    if (ab.type === 'physical') {
      if (typeof SFX !== 'undefined') { SFX.attack(); setTimeout(() => SFX.enemyHit(), 80); }
      const dmg = Battle.physDmg(actor.atk, enemy.def, e.dmgMultiplier || 1, actor.lv || 1, enemy.level || 1);
      enemy.hp  = Math.max(0, enemy.hp - dmg);
      if (enemy.hp <= 0) enemy.isKO = true;
      UI.popEnemy(G.targetEnemyIdx, dmg, 'dmg', element);
      createEffectOverlay(G.targetEnemyIdx, element, 'enemy', ab.id);
      const enemySpr = document.getElementById('espr-' + G.targetEnemyIdx);
      if (enemySpr) {
        enemySpr.classList.add('sprite-damage-flash');
        setTimeout(() => enemySpr.classList.remove('sprite-damage-flash'), 200);
      }
      shakeEnemy(G.targetEnemyIdx);
      UI.addLog(`${enemy.name} took ${dmg} damage!`, 'dmg');

    } else if (ab.type === 'magic_damage') {
      if (typeof SFX !== 'undefined') SFX.magic();

      // Map of ultimate abilities to their channel messages
      const ultimateMessages = {
        'cryoclasm': 'channels ice blades...',
        'guide_to_afterlife': 'channels soul fire...',
        'hajras_hymn': 'channels star blessing...',
        'mastery_of_pain': 'channels karmic winds...'
      };

      // Special handling for all ultimates: delay damage until animation completes
      const isUltimate = ultimateMessages.hasOwnProperty(ab.id);

      if (isUltimate) {
        // Show animation overlay only
        createEffectOverlay(G.targetEnemyIdx, element, 'enemy', ab.id);
        UI.addLog(`${actor.displayName} ${ultimateMessages[ab.id]}`, 'magic');

        // Wait for 3000ms (animation duration) then apply damage
        setTimeout(() => {
          const passiveBonus = actor.passive?.id === 'arcane_surge' ? 1.15 : 1.0;
          const dmg = Battle.magicDmg(actor.mag, e.dmgMultiplier || 1.5, passiveBonus, actor.lv || 1);
          enemy.hp  = Math.max(0, enemy.hp - dmg);
          if (enemy.hp <= 0) enemy.isKO = true;
          UI.popEnemy(G.targetEnemyIdx, dmg, 'magic', element);
          const enemySpr = document.getElementById('espr-' + G.targetEnemyIdx);
          if (enemySpr) {
            enemySpr.classList.add('sprite-damage-flash');
            setTimeout(() => enemySpr.classList.remove('sprite-damage-flash'), 200);
          }
          shakeEnemy(G.targetEnemyIdx);
          UI.addLog(`${enemy.name} took ${dmg} magic damage!`, 'magic');
          UI.renderEnemyRow(); UI.renderPartyStatus();
          setTimeout(advanceTurn, 750);
        }, 3000);
      } else {
        // Normal magic damage: calculate immediately
        const passiveBonus = actor.passive?.id === 'arcane_surge' ? 1.15 : 1.0;
        const dmg = Battle.magicDmg(actor.mag, e.dmgMultiplier || 1.5, passiveBonus, actor.lv || 1);
        enemy.hp  = Math.max(0, enemy.hp - dmg);
        if (enemy.hp <= 0) enemy.isKO = true;
        UI.popEnemy(G.targetEnemyIdx, dmg, 'magic', element);
        createEffectOverlay(G.targetEnemyIdx, element, 'enemy', ab.id);
        const enemySpr = document.getElementById('espr-' + G.targetEnemyIdx);
        if (enemySpr) {
          enemySpr.classList.add('sprite-damage-flash');
          setTimeout(() => enemySpr.classList.remove('sprite-damage-flash'), 200);
        }
        shakeEnemy(G.targetEnemyIdx);
        UI.addLog(`${enemy.name} took ${dmg} magic damage!`, 'magic');
      }

    } else if (ab.type === 'heal') {
      if (typeof SFX !== 'undefined') SFX.heal();
      const amt = (e.healBase || 20) + Math.floor(Math.random() * (e.healRandom || 15));
      actor.hp  = Math.min(actor.maxHp, actor.hp + amt);
      UI.popParty(G.activeMemberIdx, amt, 'heal', 'light');
      createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
      UI.addLog(`${actor.displayName} restored ${amt} HP!`, 'heal');

    } else if (ab.type === 'regen') {
      actor.regenTurns = e.duration || 3;
      createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
      UI.addLog(`${actor.displayName}: Regen for ${actor.regenTurns} turns!`, 'regen');

    } else if (ab.type === 'buff') {
      if (e.stat) {
        if (actor.buff) actor[actor.buff.stat] = actor.buff.origVal;
        actor.buff = { stat: e.stat, origVal: actor[e.stat], turns: e.duration || 2 };
        actor[e.stat] = Math.floor(actor[e.stat] * (e.multiplier || 1.3));
        createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
        UI.addLog(`${actor.displayName}'s ${e.stat.toUpperCase()} raised!`, 'heal');
      } else {
        createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
        UI.addLog(`${actor.displayName} gained a temporary boost!`, 'heal');
      }

    } else if (ab.type === 'debuff') {
      if (!enemy.debuff && e.stat) {
        enemy.debuff = { stat: e.stat, origVal: enemy[e.stat], turns: e.duration || 2 };
        enemy[e.stat] = Math.floor(enemy[e.stat] * (e.multiplier || 0.7));
        UI.addLog(`${enemy.name}'s ${e.stat.toUpperCase()} lowered!`, 'magic');
      } else {
        UI.addLog(`${enemy.name} is already debuffed!`, '');
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

function heroRun() {
  if (G.busy) return;
  G.busy = true; UI.btns(false);
  UI.openSub(null);
  if (Math.random() < 0.5) {
    UI.setLog(['The party escapes!'], ['hi']);
    setTimeout(() => showResult('escaped'), 900);
  } else {
    UI.setLog(['Could not escape!'], ['dmg']);
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
   ENEMY AI
   ============================================================ */
function enemyAct(enemy, enemyIdx) {
  if (enemy.stunned) {
    enemy.stunned = false;
    UI.setLog([`${enemy.name} is stunned — skips turn!`], ['magic']);
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

  // Pick target — bias toward lower HP ratio
  alive.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
  const target    = Math.random() < 0.6 ? alive[0] : alive[Math.floor(Math.random() * alive.length)];
  const targetIdx = G.party.indexOf(target);

  const ab = Battle.pickAbility(enemy.abilityDefs);
  const element = ab?.effect?.element || 'physical';

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
    if (!ab || ab.type === 'physical') {
      if (typeof SFX !== 'undefined') { SFX.enemyHit(); setTimeout(() => SFX.attack(), 60); }
      const dmg  = Battle.physDmg(enemy.atk, target.def, ab?.dmgMultiplier || 1, enemy.level || 1, target.lv || 1);
      target.hp  = Math.max(0, target.hp - dmg);
      UI.popParty(targetIdx, dmg, 'dmg', element);
      createEffectOverlay(targetIdx, element, 'party');
      const pspr = document.getElementById('pspr-' + targetIdx);
      if (pspr) { pspr.classList.add('anim-shake'); setTimeout(() => pspr.classList.remove('anim-shake'), 380); }
      UI.setLog([`${enemy.name} attacks ${target.displayName}!`, `${target.displayName} took ${dmg} damage!`], ['','dmg']);

    } else if (ab.type === 'magic_damage') {
      if (typeof SFX !== 'undefined') SFX.magic();
      const dmg = Battle.magicDmg(enemy.atk * 0.8, ab.dmgMultiplier || 1.3, 1.0, enemy.level || 1);
      target.hp = Math.max(0, target.hp - dmg);
      UI.popParty(targetIdx, dmg, 'magic', element);
      createEffectOverlay(targetIdx, element, 'party');
      UI.setLog([`${enemy.name} uses ${ab.name}!`, `${target.displayName} took ${dmg} magic damage!`], ['magic','dmg']);

    } else {
      UI.setLog([`${enemy.name} uses ${ab.name}!`], ['']);
    }

    // Iron Will (Kael)
    if (target.passive?.id === 'iron_will' && !target.passive.triggered && target.hp / target.maxHp < 0.3) {
      target.def = Math.floor(target.def * 1.25);
      target.passive = { ...target.passive, triggered: true };
    }

    // Regen ticks for all party members after each enemy action
    G.party.forEach((m, i) => {
      if (!Battle.alive(m)) return;
      if (m.passive?.id === 'natures_grace' && m.hp < m.maxHp) {
        m.hp = Math.min(m.maxHp, m.hp + 5); UI.popParty(i, 5, 'regen');
      }
      if (m.regenTurns > 0) {
        m.regenTurns--; m.hp = Math.min(m.maxHp, m.hp + 8); UI.popParty(i, 8, 'regen');
      }
      if (m.buff) { m.buff.turns--; if (m.buff.turns <= 0) { m[m.buff.stat] = m.buff.origVal; m.buff = null; } }
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
    G.enemyGroup.forEach(e => {
      totalExp  += e.exp;
      totalGold += e.gold;
      const rawDef = G.enemies.find(r => r.id === e.id);
      if (rawDef) _awardDrops(rawDef).forEach(id => allDrops.push(id));
    });

    // Award EXP and gold to all alive members; loop level-ups until threshold not met
    const leveledNames = [];
    G.party.forEach(m => {
      if (!Battle.alive(m)) return;
      m.exp  += totalExp;
      m.gold += totalGold;
      while (checkMemberLevel(m)) {
        if (!leveledNames.includes(m.displayName)) leveledNames.push(m.displayName);
      }
      // Sync stats back to character data for persistence across arcs
      const ch = G.chars.find(c => c.id === m.charId);
      if (ch) {
        ch.lv = m.lv;
        ch.exp = m.exp;
        ch.gold = m.gold;
      }
    });

    const dropMsg = allDrops.length
      ? allDrops.map(id => { const d = G.items.find(i => i.id === id); return d ? `${d.icon}${d.name}` : id; }).join(', ')
      : null;
    UI.setLog([
      `Enemies defeated! +${totalExp} EXP +${totalGold} Gold`,
      dropMsg ? `Drops: ${dropMsg}` : ''
    ].filter(Boolean), ['hi', 'hi']);
    UI.renderPartyStatus();
    UI.updateStats();

    setTimeout(() => {
      if (leveledNames.length) {
        UI.addLog(`★ LEVEL UP: ${leveledNames.join(', ')}!`, 'hi');
        if (typeof SFX !== 'undefined') SFX.levelUp();
        UI.renderPartyStatus();
      }
      setTimeout(() => {
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
