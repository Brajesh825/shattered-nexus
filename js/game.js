/**
 * game.js — Crystal Chronicles
 * Full party battle engine: player controls all 4 members,
 * selectable enemy targets, individual levelling, party menu.
 */

/* ============================================================
   BATTLE ENGINE (math helpers)
   ============================================================ */
const Battle = {
  physDmg(atk, def, mult = 1) {
    const base = Math.max(1, atk - def * 0.4);
    return Math.max(1, Math.floor(base * (0.85 + Math.random() * 0.3) * mult));
  },
  magicDmg(mag, mult = 1, passiveBonus = 1) {
    const base = Math.max(1, mag * 0.9);
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
  selectedChar:  null,
  selectedClass: null,
  selectedChars: [],   // ordered array of up to 4 char IDs

  party:           [],   // 4 party members (all player-controlled)
  enemyGroup:      [],   // 1–3 enemies
  turnQueue:       [],   // [{type:'party'|'enemy', idx, spd}]
  turnIdx:         0,
  activeMemberIdx: 0,    // which party member is currently acting
  targetEnemyIdx:  0,    // which enemy is selected as attack target
  busy:            false,
  mode:            'free', // 'free' | 'story' | 'explore'

  // Backward-compat accessors for story.js
  get hero()  { return this.party.find(m => m.isPlayer) || this.party[0] || null; },
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
const CHAR_COLOR = { ayaka:'#7dd3fc', hutao:'#ef4444', nilou:'#2dd4bf', xiao:'#4ade80' };
const ENEMY_POP_X = [580, 720, 860];
const PARTY_POP_X = [42, 108, 174, 240];

const UI = {
  el: id => document.getElementById(id),

  show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    this.el(id).classList.add('active');
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

  pop(x, y, val, type = '') {
    const s = this.el('battle-scene');
    if (!s) return;
    const d = document.createElement('div');
    d.className = 'dmg-pop ' + type;
    d.textContent = (type === 'heal' || type === 'regen') ? '+' + val : '-' + Math.abs(val);
    d.style.left = x + 'px'; d.style.top = y + 'px';
    s.appendChild(d);
    setTimeout(() => d.remove(), 1100);
  },
  popEnemy(idx, val, type) { this.pop(ENEMY_POP_X[idx] || 580, 80, val, type); },
  popParty(idx, val, type) { this.pop(PARTY_POP_X[idx] || 42, 210, val, type); },

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

  /* ── Enemy cards ────────────────────────────────────── */
  renderEnemyRow() {
    const row = this.el('enemy-row');
    if (!row) return;

    // Keep existing cards, only add new ones
    const existing = {};
    row.querySelectorAll('.ecrd').forEach(c => { existing[c.dataset.idx] = c; });

    G.enemyGroup.forEach((e, i) => {
      let card = existing[i];
      if (!card) {
        card = document.createElement('div');
        card.className   = 'ecrd';
        card.dataset.idx = i;
        card.onclick     = () => selectTarget(i);

        const spr = document.createElement('img');
        spr.className = 'ecrd-spr'; spr.id = 'espr-' + i;
        SpriteRenderer.drawEnemy(spr, e.id, e.palette);

        const cursor = document.createElement('div');
        cursor.className = 'ecrd-cursor';
        cursor.textContent = '▼';

        const name  = document.createElement('div'); name.className  = 'ecrd-name';
        const hpBg  = document.createElement('div'); hpBg.className  = 'ecrd-hp-bg';
        const hpBar = document.createElement('div'); hpBar.className = 'ecrd-hp-bar';
        const hpTxt = document.createElement('div'); hpTxt.className = 'ecrd-hp-txt';
        hpBg.appendChild(hpBar);

        card.appendChild(cursor);
        card.appendChild(spr);
        card.appendChild(name);
        card.appendChild(hpBg);
        card.appendChild(hpTxt);
        row.appendChild(card);
      }

      const alive = Battle.alive(e);
      const pct   = Math.max(0, e.hp / e.maxHp * 100);
      card.classList.toggle('targeted', i === G.targetEnemyIdx && alive);
      card.classList.toggle('ko-enemy', !alive);
      card.querySelector('.ecrd-name').textContent    = e.name;
      card.querySelector('.ecrd-hp-txt').textContent  = alive ? `${e.hp}/${e.maxHp}` : 'DEFEATED';
      const bar = card.querySelector('.ecrd-hp-bar');
      bar.style.width      = pct + '%';
      bar.style.background = pct > 50 ? 'var(--hp-hi)' : pct > 25 ? 'var(--hp-mid)' : 'var(--hp-lo)';
    });
  },

  /* ── Party sprites ──────────────────────────────────── */
  renderPartyRow() {
    const row = this.el('party-row');
    if (!row) return;
    row.innerHTML = '';
    G.party.forEach((m, i) => {
      const col  = CHAR_COLOR[m.charId] || '#c0b8e8';
      const wrap = document.createElement('div');
      wrap.className   = 'pmb';
      wrap.dataset.idx = i;
      if (!Battle.alive(m)) wrap.classList.add('ko-pmb');

      const spr = document.createElement('img');
      spr.className = 'pmb-spr'; spr.id = 'pspr-' + i;
      SpriteRenderer.drawHero(spr, m.charId, m.char, m.cls);

      const koLbl = document.createElement('div');
      koLbl.className = 'pmb-ko';
      koLbl.textContent = 'KO';

      wrap.style.borderColor = col + '40';
      wrap.appendChild(spr);
      wrap.appendChild(koLbl);
      row.appendChild(wrap);
    });
    this._highlightActiveMember();
  },

  _highlightActiveMember() {
    const t = G.turnQueue[G.turnIdx];
    document.querySelectorAll('.pmb').forEach((w, i) => {
      const isActive = t && t.type === 'party' && t.idx === i;
      w.classList.toggle('active-pmb', isActive);
      const col = CHAR_COLOR[G.party[i]?.charId] || '#c0b8e8';
      w.style.borderColor = isActive ? col : col + '40';
      w.style.boxShadow   = isActive ? `0 0 14px ${col}99` : 'none';
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
   CHARACTER SELECT
   ============================================================ */
function goCharSelect() {
  G.selectedChars = [];
  G.selectedChar  = null;
  UI.show('char-screen');
  _renderCharGrid();
  UI.el('char-detail').innerHTML = 'Click characters to add them to your party.';
  _updateCharConfirmBtn();
}

function _renderCharGrid() {
  const grid = UI.el('char-grid');
  grid.innerHTML = '';
  G.chars.forEach(ch => {
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
const DEFAULT_CLASS = { ayaka:'rogue', hutao:'warrior', nilou:'healer', xiao:'warrior' };

function buildParty() {
  G.party = [];
  const charIds = G.selectedChars.length >= 4
    ? G.selectedChars
    : G.chars.slice(0, 4).map(c => c.id);
  charIds.forEach(charId => {
    const ch       = G.chars.find(c => c.id === charId); if (!ch) return;
    const isPlayer = charId === G.selectedChar;
    const classId  = isPlayer ? G.selectedClass : (DEFAULT_CLASS[charId] || ch.class_affinity[0]);
    const cls      = G.classes.find(c => c.id === classId) || G.classes[0];
    const s        = computeStats(ch, cls);
    G.party.push({
      charId, classId,
      name: `${ch.name} / ${cls.name}`,
      displayName: ch.name,
      hp: s.hp, maxHp: s.hp,
      mp: s.mp, maxMp: s.mp,
      atk: s.atk, def: s.def, spd: s.spd, mag: s.mag,
      lv: 1, exp: 0, gold: 0,
      char: ch, cls: cls,
      passive: ch.passive,
      abilities: cls.abilities,
      isPlayer,
      isKO: false,
      buff: null, debuff: null, regenTurns: 0, stunned: false,
    });
  });
}

function buildEnemyGroup(defs) {
  G.enemyGroup = defs.map(def => ({
    id: def.id, name: def.name,
    hp: def.stats.hp, maxHp: def.stats.hp,
    atk: def.stats.atk, atk_orig: def.stats.atk,
    def: def.stats.def, spd: def.stats.spd,
    exp: def.reward.exp, gold: def.reward.gold,
    abilityDefs: def.abilities || [],
    palette: def.palette,
    subtitle: def.subtitle || '',
    isKO: false, stunned: false, debuff: null,
  }));
  G.targetEnemyIdx = 0;
}

function spawnEnemy(def) { buildEnemyGroup([def]); } // legacy compat

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
  UI.renderEnemyRow();
  if (typeof SFX !== 'undefined') SFX.click();
}

/* ============================================================
   START BATTLE
   ============================================================ */
function startBattle() {
  if (G.selectedChars.length < 4) return;

  buildParty();

  if (typeof Story !== 'undefined' && Story.active) {
    Story.onHeroReady();
    return;
  }

  // Free battle: 2–3 random enemies
  const pool  = G.enemies.slice();
  const count = 2 + Math.floor(Math.random() * 2);
  const picks = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  buildEnemyGroup(picks);
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
   HERO / PARTY ACTIONS  (actor = current party member)
   ============================================================ */
function heroAttack() {
  if (G.busy) return;
  UI.openSub(null);
  G.busy = true; UI.btns(false);

  const actor = G.party[G.activeMemberIdx];
  const enemy = G.enemy;
  if (!actor || !enemy) { G.busy = false; return; }

  const spr = document.getElementById('pspr-' + G.activeMemberIdx);
  if (spr) { spr.classList.add('anim-slash'); setTimeout(() => spr.classList.remove('anim-slash'), 460); }
  UI.setLog([`${actor.displayName} attacks ${enemy.name}!`], ['hi']);

  setTimeout(() => {
    if (typeof SFX !== 'undefined') { SFX.attack(); setTimeout(() => SFX.enemyHit(), 80); }
    const dmg = Battle.physDmg(actor.atk, enemy.def);
    enemy.hp  = Math.max(0, enemy.hp - dmg);
    if (enemy.hp <= 0) enemy.isKO = true;
    UI.popEnemy(G.targetEnemyIdx, dmg);
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
  const spr = document.getElementById('pspr-' + G.activeMemberIdx);
  if (spr) { spr.classList.add('anim-cast'); setTimeout(() => spr.classList.remove('anim-cast'), 560); }
  UI.setLog([`${actor.displayName} uses ${ab.name}!`], ['magic']);
  actor.mp = Math.max(0, actor.mp - ab.mp);

  setTimeout(() => {
    const enemy = G.enemy;

    if (ab.type === 'physical') {
      if (typeof SFX !== 'undefined') { SFX.attack(); setTimeout(() => SFX.enemyHit(), 80); }
      const dmg = Battle.physDmg(actor.atk, enemy.def, e.dmgMultiplier || 1);
      enemy.hp  = Math.max(0, enemy.hp - dmg);
      if (enemy.hp <= 0) enemy.isKO = true;
      UI.popEnemy(G.targetEnemyIdx, dmg);
      shakeEnemy(G.targetEnemyIdx);
      UI.addLog(`${enemy.name} took ${dmg} damage!`, 'dmg');

    } else if (ab.type === 'magic_damage') {
      if (typeof SFX !== 'undefined') SFX.magic();
      const passiveBonus = actor.passive?.id === 'arcane_surge' ? 1.15 : 1.0;
      const dmg = Battle.magicDmg(actor.mag, e.dmgMultiplier || 1.5, passiveBonus);
      enemy.hp  = Math.max(0, enemy.hp - dmg);
      if (enemy.hp <= 0) enemy.isKO = true;
      UI.popEnemy(G.targetEnemyIdx, dmg, 'magic');
      shakeEnemy(G.targetEnemyIdx);
      UI.addLog(`${enemy.name} took ${dmg} magic damage!`, 'magic');

    } else if (ab.type === 'heal') {
      if (typeof SFX !== 'undefined') SFX.heal();
      const amt = (e.healBase || 20) + Math.floor(Math.random() * (e.healRandom || 15));
      actor.hp  = Math.min(actor.maxHp, actor.hp + amt);
      UI.popParty(G.activeMemberIdx, amt, 'heal');
      UI.addLog(`${actor.displayName} restored ${amt} HP!`, 'heal');

    } else if (ab.type === 'regen') {
      actor.regenTurns = e.duration || 3;
      UI.addLog(`${actor.displayName}: Regen for ${actor.regenTurns} turns!`, 'regen');

    } else if (ab.type === 'buff') {
      if (actor.buff) actor[actor.buff.stat] = actor.buff.origVal;
      actor.buff = { stat: e.stat, origVal: actor[e.stat], turns: e.duration || 2 };
      actor[e.stat] = Math.floor(actor[e.stat] * (e.multiplier || 1.3));
      UI.addLog(`${actor.displayName}'s ${e.stat.toUpperCase()} raised!`, 'heal');

    } else if (ab.type === 'debuff') {
      if (!enemy.debuff) {
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

    UI.renderEnemyRow(); UI.renderPartyStatus();
    setTimeout(advanceTurn, 750);
  }, 560);
}

function heroItem() {
  if (G.busy) return;
  G.busy = true; UI.btns(false);
  UI.openSub(null);
  const actor = G.party[G.activeMemberIdx];
  const heal  = 25 + Math.floor(Math.random() * 15);
  actor.hp    = Math.min(actor.maxHp, actor.hp + heal);
  UI.setLog([`${actor.displayName} uses a Potion!`, `+${heal} HP restored!`], ['', 'heal']);
  UI.popParty(G.activeMemberIdx, heal, 'heal');
  UI.renderPartyStatus();
  setTimeout(advanceTurn, 800);
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

  const enemySpr = document.getElementById('espr-' + enemyIdx);
  if (enemySpr) { enemySpr.classList.add('anim-slash'); setTimeout(() => enemySpr.classList.remove('anim-slash'), 460); }

  setTimeout(() => {
    const ab = Battle.pickAbility(enemy.abilityDefs);

    if (!ab || ab.type === 'physical') {
      if (typeof SFX !== 'undefined') { SFX.enemyHit(); setTimeout(() => SFX.attack(), 60); }
      const dmg  = Battle.physDmg(enemy.atk, target.def, ab?.dmgMultiplier || 1);
      target.hp  = Math.max(0, target.hp - dmg);
      UI.popParty(targetIdx, dmg);
      const pspr = document.getElementById('pspr-' + targetIdx);
      if (pspr) { pspr.classList.add('anim-shake'); setTimeout(() => pspr.classList.remove('anim-shake'), 380); }
      UI.setLog([`${enemy.name} attacks ${target.displayName}!`, `${target.displayName} took ${dmg} damage!`], ['','dmg']);

    } else if (ab.type === 'magic_damage') {
      if (typeof SFX !== 'undefined') SFX.magic();
      const dmg = Battle.magicDmg(enemy.atk * 0.8, ab.dmgMultiplier || 1.3);
      target.hp = Math.max(0, target.hp - dmg);
      UI.popParty(targetIdx, dmg, 'magic');
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
    G.enemyGroup.forEach(e => { totalExp += e.exp; totalGold += e.gold; });

    // Award EXP and gold to all alive members; level up each
    const leveledNames = [];
    G.party.forEach(m => {
      if (!Battle.alive(m)) return;
      m.exp  += totalExp;
      m.gold += totalGold;
      if (checkMemberLevel(m)) leveledNames.push(m.displayName);
    });

    UI.setLog([`Enemies defeated! +${totalExp} EXP +${totalGold} Gold`], ['hi']);
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
  const t  = UI.el('result-title');
  const st = UI.el('result-stats');
  const hero = G.hero;
  if (type === 'victory') {
    if (typeof SFX !== 'undefined') SFX.victory();
    t.textContent = '✨ VICTORY! ✨';
    t.className   = 'result-title victory';
    const memberStats = G.party.map(m =>
      `<div style="font-size:16px;color:${CHAR_COLOR[m.charId]||'#aaa'}">${m.displayName} LV <span class="val">${m.lv}</span>  EXP <span class="val">${m.exp}</span>  Gold <span class="val">${m.gold}</span></div>`
    ).join('');
    st.innerHTML = `All enemies defeated!<br>${memberStats}`;
  } else if (type === 'defeat') {
    if (typeof SFX !== 'undefined') SFX.defeat();
    t.textContent = '💀 GAME OVER 💀';
    t.className   = 'result-title defeat';
    st.innerHTML  = `The party has fallen...<br>Leader Level: <span class="val">${hero?.lv || 1}</span>`;
  } else {
    t.textContent = '💨 ESCAPED!';
    t.className   = 'result-title escaped';
    st.innerHTML  = `The party fled from battle!`;
  }
  UI.show('result-screen');
}

function playAgain() {
  G.selectedChar = null; G.selectedClass = null; G.selectedChars = [];
  goCharSelect();
}

/* ============================================================
   EXPLORE MODE
   ============================================================ */
function startExplore() {
  // Need a party first — if none, do a quick auto-build
  if (!G.party || G.party.length === 0) {
    if (!G.chars.length || !G.classes.length) {
      alert('Game data not loaded yet. Try again in a moment.');
      return;
    }
    // Auto-select all chars + first class
    G.selectedChars = G.chars.slice(0, 4).map(c => c.id);
    G.selectedChar  = G.selectedChars[0];
    G.selectedClass = G.selectedClass || G.classes[0].id;
    buildParty();
  }
  G.mode = 'explore';
  UI.show('explore-screen');

  // Size canvas to its container
  const wrap   = document.getElementById('explore-canvas-wrap');
  const canvas = document.getElementById('explore-canvas');
  canvas.width  = wrap.clientWidth  || 360;
  canvas.height = wrap.clientHeight || 480;

  MapEngine.init(canvas);

  // Wire up encounter handler
  MapEngine.onEncounterStart = (enc) => {
    const enemyIds = enc.enemies || [];
    const enemyDefs = enemyIds
      .map(id => G.enemies.find(e => e.id === id))
      .filter(Boolean);

    if (enemyDefs.length > 0) {
      buildEnemyGroup(enemyDefs);
      _initBattle();
      const names = G.enemyGroup.map(e => e.name).join(' & ');
      UI.setLog([`⚔ ${names} appeared!`, `Party to battle stations!`], ['hi','']);
      processCurrentTurn();
    }
  };

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
