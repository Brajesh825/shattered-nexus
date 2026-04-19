/**
 * BattleUI Module
 * Handles all DOM manipulation and rendering specific to the combat scene.
 */
const BattleUI = {
  // Helpers
  el(id) { return document.getElementById(id); },

  /**
   * Triggers a momentary full-screen color overlay for impact.
   */
  flash(color = '#ffffff', duration = 300) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: ${color}; z-index: 9999; pointer-events: none;
      transition: opacity ${duration}ms ease-out;
      opacity: 0.6;
    `;
    document.body.appendChild(overlay);
    
    // Force reflow
    overlay.getBoundingClientRect();
    
    // Start fade out
    overlay.style.opacity = '0';
    
    setTimeout(() => overlay.remove(), duration);
  },

  /**
   * Central helper to retrieve unit sprites by index and type.
   */
  getSprite(idx, type = 'enemy') {
    return this.el((type === 'enemy' ? 'espr-' : 'pspr-') + idx);
  },

  /**
   * Switches the sprite frame for an animated unit.
   */
  setSpriteFrame(idx, frameName) {
    const spr = this.getSprite(idx, 'party');
    if (!spr || !spr.classList.contains('party-sprite-animated')) return;
    
    const charId = spr.dataset.charId;
    
    if (typeof SpriteRenderer !== 'undefined' && SpriteRenderer.setFrame) {
      SpriteRenderer.setFrame(spr, charId, frameName, 96);
    } else {
      // Fallback if SpriteRenderer is not available
      const frameMap = { 'idle': [0, 0], 'prepare': [1, 0], 'attack': [2, 0], 'magic': [0, 1], 'hurt': [1, 1], 'fallen': [2, 1] };
      const [col, row] = frameMap[frameName] || [0, 0];
      spr.style.width = '96px';
      spr.style.height = '96px';
      spr.style.backgroundSize = '300% 200%';
      spr.style.backgroundPosition = `${col * 50}% ${row * 100}%`;
    }
    
    const frames = ['frame-idle', 'frame-prepare', 'frame-attack', 'frame-magic', 'frame-hurt', 'frame-fallen'];
    frames.forEach(f => spr.classList.remove(f));
    spr.classList.add('frame-' + frameName);
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
    
    // Apply atmosphere based on Arc
    this._applyArcAtmosphere();
    // Start weather loop for battle canvas if active
    this._initBattleWeather();
  },

  _applyArcAtmosphere() {
    const scene = this.el('battle-scene');
    if (!scene) return;
    // Sync parallax layers to current Arc if available
    if (typeof Story !== 'undefined' && Story.active) {
      scene.classList.add(`arc-bg-${Story.arcIdx % 8}`);
    }
  },

  _initBattleWeather() {
    if (this._weatherLoopActive) return;
    const canvas = this.el('battle-effects-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    this._weatherLoopActive = true;
    let lastTs = performance.now();
    
    const loop = (ts) => {
      if (!this._weatherLoopActive || !this.el('battle-screen').classList.contains('active')) return;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      
      if (typeof WeatherEngine !== 'undefined') {
        WeatherEngine.update(dt);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        WeatherEngine.draw(ctx);
      }
      
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
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

    // Switch focus context to the sub-menu or back to main
    if (typeof Focus !== 'undefined') {
      Focus.setContext(id || 'cmd-grid-main');
    }
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
      const _frozenCls = (typeof StatusSystem !== 'undefined' && StatusSystem.has(e, 'status_frozen')) ? ' frozen-sprite' : '';
      spr.className = 'enemy-sprite' + _mutCls + _frozenCls;
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

      const spId = m.charId.toLowerCase();
      const manifest = (typeof SpriteRenderer !== 'undefined' && SpriteRenderer.SPRITE_MANIFEST) 
        ? SpriteRenderer.SPRITE_MANIFEST[spId] : null;

      if (manifest) {
        // Create high-res div instead of img
        const div = document.createElement('div');
        div.id = 'pspr-' + i;
        div.className = 'party-sprite party-sprite-animated';
        const fileBase = manifest.baseId || spId;
        const suffix = (typeof SpriteRenderer !== 'undefined' && SpriteRenderer.getSuffix) ? SpriteRenderer.getSuffix() : '_sprite.png';
        div.style.backgroundImage = `url(images/characters/spirits/${fileBase}${suffix})`;
        div.dataset.charId = spId;
        member.appendChild(div);
      } else {
        // Fallback to standard spirit img
        const spr = document.createElement('img');
        spr.className = 'party-sprite';
        spr.id = 'pspr-' + i;
        if (typeof SpriteRenderer !== 'undefined') SpriteRenderer.drawHero(spr, m.charId, m.char, m.cls);
        member.appendChild(spr);
      }

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

    // Final pass: Initialize high-res frames now that elements are in the live DOM
    G.party.forEach((m, i) => {
      this.setSpriteFrame(i, Battle.alive(m) ? 'idle' : 'fallen');
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
    
    // Auto-focus the action menu for keyboard/controller
    if (typeof Focus !== 'undefined') {
      Focus.setContext('cmd-grid-main');
    }
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

  showTutorial(txt) {
    const s = this.el('battle-scene');
    if (!s || this._tutShown) return;
    this._tutShown = true;
    
    const d = document.createElement('div');
    d.id = 'battle-tutorial-overlay';
    d.className = 'tutorial-overlay';
    d.innerHTML = `<div>${txt}</div><button class="tutorial-close" onclick="document.getElementById('battle-tutorial-overlay').remove(); if(typeof Focus!=='undefined')Focus.setContext('cmd-grid-main');">GOT IT</button>`;
    s.appendChild(d);
    
    if (typeof Focus !== 'undefined') {
      Focus.setContext('battle-tutorial-overlay');
    }
    setTimeout(() => { if(d.parentNode) { d.remove(); if(typeof Focus!=='undefined')Focus.setContext('cmd-grid-main'); } }, 12000);
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

  popReaction(idx, label, type = 'enemy') {
    const s = this.el('battle-scene');
    const spr = this.el((type === 'enemy' ? 'espr-' : 'pspr-') + idx);
    if (!s || !spr) return;
    const rect = spr.getBoundingClientRect();
    const sceneRect = s.getBoundingClientRect();
    const gameEl = this.el('game');
    const scaleMatch = gameEl?.style.transform.match(/scale\(([\d.]+)\)/);
    const gameScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    
    const d = document.createElement('div');
    d.className = 'pop-text reaction-pop';
    d.innerHTML = `⚡ ${label.toUpperCase()}!`;
    d.style.left = ((rect.left - sceneRect.left + rect.width / 2) / gameScale) + 'px';
    d.style.top = ((rect.top - sceneRect.top + rect.height / 4) / gameScale) + 'px';
    s.appendChild(d);
    
    // Add a secondary burst effect
    setTimeout(() => d.classList.add('pop-burst'), 50);
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
