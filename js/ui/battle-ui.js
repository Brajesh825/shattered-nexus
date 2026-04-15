/**
 * BattleUI Module
 * Handles all DOM manipulation and rendering specific to the combat scene.
 */
const BattleUI = {
  // Helpers
  el(id) { return document.getElementById(id); },

  /**
   * Central helper to retrieve unit sprites by index and type.
   */
  getSprite(idx, type = 'enemy') {
    return this.el((type === 'enemy' ? 'espr-' : 'pspr-') + idx);
  },

  _getBuffReport(actor) {
    const stats = [];
    if (actor.statuses?.some(s => s.id === 'status_atk_boost' || s.id === 'buff_atk')) stats.push('ATK');
    if (actor.statuses?.some(s => s.id === 'status_def_boost' || s.id === 'buff_def')) stats.push('DEF');
    if (actor.statuses?.some(s => s.id === 'status_mag_boost' || s.id === 'buff_mag')) stats.push('MAG');
    if (actor.statuses?.some(s => s.id === 'status_spd_boost' || s.id === 'buff_spd')) stats.push('SPD');
    return stats.length ? ` (${stats.join(' & ')} Up!)` : '';
  },

  /**
   * Main entry point for updating the entire battle interface.
   */
  render() {
    this.renderTurnBar();
    this.renderEnemyRow();
    this.renderPartyRow();
    this.renderPartyStatus();
    this.renderActiveMemberBar();
    this.updateStats();
  },

  updateStats() {
    const h = G.party[G.activeMemberIdx] || G.hero;
    if (!h) return;
    const lv = this.el('stat-lv');
    const atk = this.el('stat-atk');
    const def = this.el('stat-def');
    const lck = this.el('stat-lck');
    const exp = this.el('stat-exp');
    if (lv) lv.textContent = h.lv;
    if (atk) atk.textContent = Battle.getStat(h, 'atk');
    if (def) def.textContent = Battle.getStat(h, 'def');
    if (lck) lck.textContent = Battle.getStat(h, 'lck');
    if (exp) exp.textContent = h.exp;
  },

  btns(on) { document.querySelectorAll('.cmd-btn').forEach(b => b.disabled = !on); },

  openSub(id) {
    document.querySelectorAll('.sub-menu').forEach(m => m.classList.remove('open'));
    if (id) {
      const el = this.el(id);
      if (el) el.classList.add('open');
    }
    const grid = this.el('cmd-grid-main');
    if (grid) grid.style.display = id ? 'none' : 'grid';
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

  /* ── Enemy sprites ─────────────────────────────────── */
  renderEnemyRow() {
    const container = this.el('enemy-container');
    if (!container) return;
    container.innerHTML = '';

    const count = G.enemyGroup.length;
    container.dataset.count = count;

    const vw = window.innerWidth;
    const VP_SCALE = vw >= 1800 ? 1.35 : 1.0;
    const TIER_BASE_W = { 1: Math.round(130 * VP_SCALE), 2: Math.round(180 * VP_SCALE), 3: Math.round(240 * VP_SCALE) };
    const COUNT_SCALE = { 1: 1.00, 2: 0.87, 3: 0.75, 4: 0.64 };
    const MUTATION_MULT = { normal: 1.00, corrupted: 1.12, mutant: 1.28 };
    const ASPECT = 1.23;

    G.enemyGroup.forEach((e, i) => {
      const alive = Battle.alive(e);
      const pct = Math.max(0, e.hp / e.maxHp * 100);

      const tierW = TIER_BASE_W[e.tier || 1] || TIER_BASE_W[1];
      const cScale = COUNT_SCALE[count] ?? 0.64;
      const mMult = MUTATION_MULT[e.mutation || 'normal'] || 1.0;
      const sprW = Math.round(tierW * cScale * mMult);
      const sprH = Math.round(sprW * ASPECT);

      const enemy = document.createElement('div');
      enemy.className = 'enemy' + (!alive ? ' ko-enemy' : '');
      enemy.dataset.idx = i;
      enemy.dataset.target = i === G.targetEnemyIdx ? 'true' : 'false';
      enemy.onclick = () => typeof selectTarget === 'function' ? selectTarget(i) : null;

      const spr = document.createElement('img');
      const _mutCls = e.mutation === 'mutant' ? ' enemy-mutant' : e.mutation === 'corrupted' ? ' enemy-corrupted' : '';
      spr.className = 'enemy-sprite' + _mutCls;
      spr.id = 'espr-' + i;
      spr.style.width = sprW + 'px';
      spr.style.height = sprH + 'px';
      if (typeof SpriteRenderer !== 'undefined') SpriteRenderer.drawEnemy(spr, e.id, e.palette);
      enemy.appendChild(spr);

      const hpBg = document.createElement('div');
      hpBg.className = 'enemy-hp-bar-bg';
      enemy.appendChild(hpBg);

      const hpBar = document.createElement('div');
      hpBar.className = 'enemy-hp-bar-fill';
      hpBar.style.width = pct + '%';
      hpBar.style.background = pct > 50 ? '#4ade80' : pct > 25 ? '#eab308' : '#ef4444';
      hpBg.appendChild(hpBar);

      const info = document.createElement('div');
      info.className = 'enemy-info';
      let traitHtml = '';
      if (e.mutantTraits?.length) {
        traitHtml = `<div class="enemy-traits">${e.mutantTraits.map(t => `<span class="trait-pill">${t.label}</span>`).join('')}</div>`;
      }
      info.innerHTML = `<div class="enemy-name">${e.name}</div><div class="enemy-level">Lv ${e.level}</div>${traitHtml}`;
      enemy.appendChild(info);

      if (i === G.targetEnemyIdx && alive) {
        const indicator = document.createElement('div');
        indicator.className = 'target-indicator';
        indicator.textContent = '◀';
        enemy.appendChild(indicator);
      }

      container.appendChild(enemy);
    });
  },

  /* ── Party sprites ─────────────────────────────────── */
  renderPartyRow() {
    const container = this.el('party-container');
    if (!container) return;
    container.innerHTML = '';

    G.party.forEach((m, i) => {
      if (!m) return;
      const col = CHAR_COLOR[m.charId] || '#c0b8e8';
      const alive = Battle.alive(m);
      const pct = Math.max(0, m.hp / m.maxHp * 100);

      const member = document.createElement('div');
      member.className = 'party-member' + (!alive ? ' ko-member' : '');
      member.dataset.idx = i;
      member.style.color = col;

      const spr = document.createElement('img');
      spr.className = 'party-sprite';
      spr.id = 'pspr-' + i;
      if (typeof SpriteRenderer !== 'undefined') SpriteRenderer.drawHero(spr, m.charId, m.char, m.cls);
      member.appendChild(spr);

      const hpBg = document.createElement('div');
      hpBg.className = 'party-hp-bar-bg';
      member.appendChild(hpBg);

      const hpBar = document.createElement('div');
      hpBar.className = 'party-hp-bar-fill';
      hpBar.style.width = pct + '%';
      hpBar.style.background = pct > 50 ? '#4ade80' : pct > 25 ? '#eab308' : '#ef4444';
      hpBg.appendChild(hpBar);

      const info = document.createElement('div');
      info.className = 'party-info';
      info.style.color = col;
      info.innerHTML = `<div class="party-name">${m.displayName}</div><div class="party-level">Lv ${m.lv}</div>`;
      member.appendChild(info);

      if (m.statuses && m.statuses.length > 0) {
        const strip = document.createElement('div');
        strip.className = 'portrait-status-strip';
        strip.innerHTML = this._renderPSCStatuses(m);
        member.appendChild(strip);
      }

      if (!alive) {
        const koLbl = document.createElement('div');
        koLbl.className = 'ko-badge';
        koLbl.textContent = 'KO';
        member.appendChild(koLbl);
      }

      container.appendChild(member);
    });
    this.highlightActiveMember();
  },

  highlightActiveMember() {
    const t = G.turnQueue[G.turnIdx];
    document.querySelectorAll('.party-member').forEach((w, i) => {
      const isActive = t && t.type === 'party' && t.idx === i;
      w.classList.toggle('active-member', isActive);
      const col = CHAR_COLOR[G.party[i]?.charId] || '#c0b8e8';
      w.style.borderColor = isActive ? col + '50' : 'transparent';
      w.style.filter = isActive ? `drop-shadow(0 0 6px ${col}80)` : 'none';
    });
  },

  /* ── Party status cards ────────────────────────────── */
  renderPartyStatus() {
    const bar = this.el('party-status-bar');
    if (!bar) return;
    bar.innerHTML = '';
    G.party.forEach((m, i) => {
      if (!m) return;
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

    if (m.statuses) {
      m.statuses.forEach(s => {
        let cls = s.id.includes('debuff') || s.type === 'debuff' || s.type === 'control' || s.type === 'dot' ? 'debuff' : 'buff';
        if (s.type === 'aura') cls = 'aura';
        if (s.type === 'reduction' || s.id === 'status_guardian') cls = 'guard';
        push(s.icon, s.turns, cls);
      });
    }

    return tokens.join('');
  },

  /* ── Active member bar ──────────────────────────────── */
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

  /* ── Floating texts & Overlays ─────────────────────── */
  log: ['', '', ''],
  setLog(lines, cls = []) {
    this.log = [...lines].slice(-3);
    while (this.log.length < 3) this.log.unshift('');
    ['log0', 'log1', 'log2'].forEach((id, i) => {
      const el = this.el(id);
      if (el) {
        el.textContent = this.log[i] || '';
        el.className = 'log-line ' + (cls[i] || '');
      }
    });
  },
  addLog(txt, cl = '') {
    this.log = [...this.log.slice(-2), txt];
    this.setLog(this.log, ['', '', cl]);
  },

  popEnemy(idx, text, type = 'dmg', element = 'physical') {
    const s = this.el('battle-scene');
    const spr = this.el('espr-' + idx);
    if (!s || !spr) return;
    const rect = spr.getBoundingClientRect();
    const sceneRect = s.getBoundingClientRect();
    const gameEl = this.el('game');
    const scaleMatch = gameEl?.style.transform.match(/scale\(([\d.]+)\)/);
    const gameScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    this._pop(text,
      (rect.left - sceneRect.left + rect.width / 2) / gameScale,
      (rect.top - sceneRect.top + rect.height / 3) / gameScale,
      type, element
    );
  },

  popParty(idx, text, type = 'dmg', element = 'physical') {
    const s = this.el('battle-scene');
    const spr = this.el('pspr-' + idx);
    if (!s || !spr) return;
    const rect = spr.getBoundingClientRect();
    const sceneRect = s.getBoundingClientRect();
    const gameEl = this.el('game');
    const scaleMatch = gameEl?.style.transform.match(/scale\(([\d.]+)\)/);
    const gameScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    this._pop(text,
      (rect.left - sceneRect.left + rect.width / 2) / gameScale,
      (rect.top - sceneRect.top + rect.height / 3) / gameScale,
      type, element
    );
  },

  popAI(idx, txt) {
    const s = this.el('battle-scene');
    if (!s) return;
    const d = document.createElement('div');
    d.className = 'pop-text ai-pop';
    d.textContent = txt;
    // Position slightly above the enemy
    const spr = this.el('espr-' + idx);
    if (spr) {
      const rect = spr.getBoundingClientRect();
      const sceneRect = s.getBoundingClientRect();
      const gameEl = this.el('game');
      const scaleMatch = gameEl?.style.transform.match(/scale\(([\d.]+)\)/);
      const gameScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
      d.style.left = ((rect.left - sceneRect.left + rect.width / 2) / gameScale) + 'px';
      d.style.top = ((rect.top - sceneRect.top) / gameScale - 30) + 'px';
    } else {
      d.style.left = '50%';
      d.style.top = '100px';
    }
    
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

  _pop(text, x, y, type, element) {
    const s = this.el('battle-scene');
    const d = document.createElement('div');
    d.className = `pop-text pop-${type} elem-${element}`;
    d.textContent = text;
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    s.appendChild(d);
    setTimeout(() => d.remove(), 1200);
  },

  shakeEnemy(idx) {
    const spr = this.el('espr-' + idx);
    if (!spr) return;
    spr.classList.add('anim-shake');
    setTimeout(() => spr.classList.remove('anim-shake'), 380);
  },

  triggerScreenShake(durationMs = 380) {
    const scene = this.el('battle-scene');
    if (!scene) return;
    scene.classList.add('battle-scene-shake');
    setTimeout(() => scene.classList.remove('battle-scene-shake'), durationMs + 50);
  },

  createEffectOverlay(targetIdx, element, targetType = 'enemy', abilityId = null, opts = {}) {
    if (targetIdx === undefined || targetIdx === null) return;
    let overlay = null;
    let duration = 600;

    if (abilityId && typeof SVGAnimations !== 'undefined' && SVGAnimations[abilityId]) {
      const _cfg = SVGAnimations[abilityId];
      if (_cfg.screenShake && !opts.suppressShake) {
        setTimeout(() => this.triggerScreenShake(_cfg.screenShake), _cfg.shakeDelay || 0);
      }
      overlay = _cfg.create(targetIdx, targetType);
      duration = _cfg.duration;
    } else if (abilityId && moveAnimations[abilityId]) {
      overlay = document.createElement('div');
      overlay.className = `effect-overlay overlay-${abilityId}`;
      duration = moveAnimations[abilityId].overlayDuration;
    } else {
      overlay = document.createElement('div');
      overlay.className = `effect-overlay element-${element}`;
      const durations = { 'ice': 600, 'fire': 650, 'wind': 600, 'electric': 500, 'water': 600, 'light': 700, 'dark': 650, 'physical': 500 };
      duration = durations[element] || 600;
    }

    if (!overlay) return;
    const sprId = targetType === 'enemy' ? `espr-${targetIdx}` : `pspr-${targetIdx}`;
    const spr = this.el(sprId);
    if (spr) {
      const rect = spr.getBoundingClientRect();
      const sceneRect = this.el('battle-scene').getBoundingClientRect();
      const gameEl = this.el('game');
      const scaleMatch = gameEl?.style.transform.match(/scale\(([\d.]+)\)/);
      const gameScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
      overlay.style.left = ((rect.left - sceneRect.left + 8) / gameScale) + 'px';
      overlay.style.top = ((rect.top - sceneRect.top - 10) / gameScale) + 'px';
    }

    this.el('battle-scene').appendChild(overlay);
    setTimeout(() => overlay.remove(), duration);
  }
};
