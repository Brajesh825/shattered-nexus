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

    const count = G.enemyGroup.length;
    container.dataset.count = count;

    const vw = window.innerWidth;
    const VP_SCALE = vw >= 1800 ? 1.35 : 1.0;
    const TIER_BASE_W = { 1: Math.round(130 * VP_SCALE), 2: Math.round(180 * VP_SCALE), 3: Math.round(240 * VP_SCALE) };
    const COUNT_SCALE = { 1: 1.00, 2: 0.87, 3: 0.75, 4: 0.64 };
    const MUTATION_MULT = { normal: 1.00, corrupted: 1.12, mutant: 1.28 };
    const ASPECT = 1.23;

    // Surgical update: check if we need to rebuild the entire row
    const existingEnemies = container.querySelectorAll('.enemy');
    if (existingEnemies.length !== count) {
      container.innerHTML = '';
    }

    G.enemyGroup.forEach((e, i) => {
      const alive = Battle.alive(e);
      const pct = Math.max(0, e.hp / e.maxHp * 100);
      
      let enemy = existingEnemies[i];
      let spr, hpBar, info, indicator;

      if (!enemy) {
        enemy = document.createElement('div');
        enemy.dataset.idx = i;
        container.appendChild(enemy);

        spr = document.createElement('img');
        spr.id = 'espr-' + i;
        spr.className = 'enemy-sprite';
        enemy.appendChild(spr);

        const hpBg = document.createElement('div');
        hpBg.className = 'enemy-hp-bar-bg';
        enemy.appendChild(hpBg);

        hpBar = document.createElement('div');
        hpBar.className = 'enemy-hp-bar-fill';
        hpBg.appendChild(hpBar);

        info = document.createElement('div');
        info.className = 'enemy-info';
        enemy.appendChild(info);
      } else {
        spr = enemy.querySelector('.enemy-sprite');
        hpBar = enemy.querySelector('.enemy-hp-bar-fill');
        info = enemy.querySelector('.enemy-info');
        indicator = enemy.querySelector('.target-indicator');
      }

      // Update State
      enemy.className = 'enemy' + (!alive ? ' ko-enemy' : '');
      enemy.dataset.target = i === G.targetEnemyIdx ? 'true' : 'false';
      enemy.onclick = () => typeof selectTarget === 'function' ? selectTarget(i) : null;
      
      // Ensure unit is anchored to DOM (Fix for disappearing units)
      if (enemy.parentElement !== container) container.appendChild(enemy);

      const tierW = TIER_BASE_W[e.tier || 1] || TIER_BASE_W[1];
      const cScale = COUNT_SCALE[count] ?? 0.64;
      const mMult = MUTATION_MULT[e.mutation || 'normal'] || 1.0;
      const sprW = Math.round(tierW * cScale * mMult);
      const sprH = Math.round(sprW * ASPECT);

      // Animation-Safe Class Update
      spr.classList.add('enemy-sprite');
      spr.classList.toggle('enemy-mutant', e.mutation === 'mutant');
      spr.classList.toggle('enemy-corrupted', e.mutation === 'corrupted');
      const isFrozen = (typeof StatusSystem !== 'undefined' && StatusSystem.has(e, 'status_frozen'));
      spr.classList.toggle('frozen-sprite', isFrozen);
      
      spr.style.width = sprW + 'px';
      spr.style.height = sprH + 'px';
      spr.id = 'espr-' + i; // Force correct ID for coordinate math
      
      // Only redraw if src is different or missing
      if (!spr.src || spr.dataset.lastId !== e.id || spr.dataset.lastPal !== JSON.stringify(e.palette)) {
        if (typeof SpriteRenderer !== 'undefined') SpriteRenderer.drawEnemy(spr, e.id, e.palette);
        spr.dataset.lastId = e.id;
        spr.dataset.lastPal = JSON.stringify(e.palette);
      }

      // HP Update (Triggers CSS transition)
      hpBar.style.width = pct + '%';
      hpBar.style.background = pct > 50 ? '#4ade80' : pct > 25 ? '#eab308' : '#ef4444';

      let traitHtml = '';
      if (e.mutantTraits?.length) {
        traitHtml = `<div class="enemy-traits">${e.mutantTraits.map(t => `<span class="trait-pill">${t.label}</span>`).join('')}</div>`;
      }
      const newInfo = `<div class="enemy-name">${e.name}</div><div class="enemy-level">Lv ${e.level}</div>${traitHtml}`;
      if (info.innerHTML !== newInfo) info.innerHTML = newInfo;

      // Indicator
      if (i === G.targetEnemyIdx && alive) {
        if (!indicator) {
          indicator = document.createElement('div');
          indicator.className = 'target-indicator';
          indicator.textContent = '◀';
          enemy.appendChild(indicator);
        }
      } else if (indicator) {
        indicator.remove();
      }
    });
  },

  /* ── Party sprites ─────────────────────────────────── */
  renderPartyRow() {
    const container = this.el('party-container');
    if (!container) return;

    const existingMembers = container.querySelectorAll('.party-member');
    if (existingMembers.length !== G.party.length) {
      container.innerHTML = '';
    }

    G.party.forEach((m, i) => {
      if (!m) return;
      const alive = Battle.alive(m);
      const pct = Math.max(0, m.hp / m.maxHp * 100);
      
      let member = existingMembers[i];
      let spr, hpBar, info;

      if (!member) {
        member = document.createElement('div');
        member.id = 'pmember-' + i;
        member.dataset.idx = i;
        container.appendChild(member);

        spr = document.createElement('div');
        spr.id = 'pspr-' + i;
        spr.className = 'party-sprite';
        member.appendChild(spr);

        const hpBg = document.createElement('div');
        hpBg.className = 'party-hp-bar-bg';
        member.appendChild(hpBg);

        hpBar = document.createElement('div');
        hpBar.className = 'party-hp-bar-fill';
        hpBg.appendChild(hpBar);

        info = document.createElement('div');
        info.className = 'party-info';
        member.appendChild(info);
      } else {
        spr = member.querySelector('.party-sprite');
        hpBar = member.querySelector('.party-hp-bar-fill');
        info = member.querySelector('.party-info');
      }

      // Update State
      member.className = 'party-member' + (!alive ? ' ko-member' : '');
      const col = CHAR_COLOR[m.charId] || '#c0b8e8';
      member.style.color = col;
      
      // Ensure member is anchored to DOM (Fix for disappearing units)
      if (member.parentElement !== container) container.appendChild(member);

      // Update Info only if content changed
      const traitHtml = ''; // Reserved for future party traits
      const newInfo = `<div class="party-name">${m.displayName}</div><div class="party-level">Lv ${m.lv}</div>${traitHtml}`;
      if (info.innerHTML !== newInfo) {
        info.innerHTML = newInfo;
        info.style.color = col;
      }

      // Statuses (Updated surgically)
      let strip = member.querySelector('.portrait-status-strip');
      if (m.statuses && m.statuses.length > 0) {
        if (!strip) {
          strip = document.createElement('div');
          strip.className = 'portrait-status-strip';
          member.appendChild(strip);
        }
        const newStatusHtml = this._renderPSCStatuses(m);
        if (strip.innerHTML !== newStatusHtml) strip.innerHTML = newStatusHtml;
      } else if (strip) {
        strip.remove();
      }

      // KO Badge
      let koBadge = member.querySelector('.ko-badge');
      if (!alive) {
        if (!koBadge) {
          koBadge = document.createElement('div');
          koBadge.className = 'ko-badge';
          koBadge.textContent = 'KO';
          member.appendChild(koBadge);
        }
      } else if (koBadge) {
        koBadge.remove();
      }

      // HP Update
      if (hpBar) {
        hpBar.style.width = pct + '%';
        hpBar.style.background = pct > 50 ? 'var(--hp-hi)' : pct > 25 ? 'var(--hp-mid)' : 'var(--hp-lo)';
      }

      // Draw/Update Sprite
      if (spr) {
        spr.classList.add('party-sprite', 'party-sprite-animated');
        spr.id = 'pspr-' + i; // Force correct ID for coordinate math
        spr.dataset.charId = m.charId;

        // Only redraw if character/class changed or first time
        if (spr.dataset.lastId !== m.charId || spr.dataset.lastClass !== m.classId) {
          if (typeof SpriteRenderer !== 'undefined') SpriteRenderer.drawHero(spr, m.charId, m, m.cls);
          spr.dataset.lastId = m.charId;
          spr.dataset.lastClass = m.classId;
        }
      }
    });

    // Final pass: Initialize high-res frames
    G.party.forEach((m, i) => {
      // Frame Sticky: Only auto-set idle if not currently acting or busy
      const isActing = G.busy && G.activeMemberIdx === i;
      if (!isActing) {
        this.setSpriteFrame(i, Battle.alive(m) ? 'idle' : 'fallen');
      }
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

  /**
   * Robust coordinate helper for combat popups.
   * Calculates the unscaled center of a unit's container relative to the scene.
   */
  _getAnchor(idx, type = 'enemy') {
    const s = this.el('battle-scene');
    if (!s) return { x: 200, y: 200 };
    
    // Find by DOM data-idx for stability
    const selector = type === 'enemy' ? `.enemy[data-idx="${idx}"]` : `.party-member[data-idx="${idx}"]`;
    const container = s.querySelector(selector);
    const sprite = this.el((type === 'enemy' ? 'espr-' : 'pspr-') + idx);
    const target = sprite || container; // Prefer sprite, fallback to slot

    if (!target) return { x: type === 'enemy' ? 150 : 450, y: 150 };

    const sceneRect = s.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    
    // Calculate the REAL scale applied to the scene (CSS scale or zoom)
    const sceneScale = sceneRect.width / s.offsetWidth || 1;

    return {
      x: (targetRect.left - sceneRect.left + (targetRect.width / 2)) / sceneScale,
      y: (targetRect.top - sceneRect.top + (targetRect.height / 3)) / sceneScale
    };
  },

  popEnemy(idx, text, type = 'dmg', element = 'physical') {
    const pos = this._getAnchor(idx, 'enemy');
    this._pop(text, pos.x, pos.y, type, element);
  },

  popParty(idx, text, type = 'dmg', element = 'physical') {
    const pos = this._getAnchor(idx, 'party');
    this._pop(text, pos.x, pos.y, type, element);
  },

  popAI(idx, txt) {
    const pos = this._getAnchor(idx, 'enemy');
    const s = this.el('battle-scene');
    if (!s) return;

    const d = document.createElement('div');
    d.className = 'pop-text ai-pop';
    d.textContent = txt;
    d.style.left = pos.x + 'px';
    d.style.top = (pos.y - 60) + 'px';
    
    s.appendChild(d);
    setTimeout(() => d.remove(), 2500);
  },

  popReaction(idx, label, type = 'enemy') {
    const pos = this._getAnchor(idx, type);
    const s = this.el('battle-scene');
    if (!s) return;
    const sprId = type === 'enemy' ? `espr-${idx}` : `pspr-${idx}`;
    const spr = this.el(sprId);
    if (!spr) return;

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
      
      let xOffset = targetType === 'party' ? -20 : 8;
      let yOffset = targetType === 'party' ? -40 : -10;

      if (rect.width > 0) {
        overlay.style.left = ((rect.left - sceneRect.left + xOffset) / gameScale) + 'px';
        overlay.style.top = ((rect.top - sceneRect.top + yOffset) / gameScale) + 'px';
      } else {
        const parent = spr.parentElement?.getBoundingClientRect();
        if (parent) {
          overlay.style.left = ((parent.left - sceneRect.left + xOffset) / gameScale) + 'px';
          overlay.style.top = ((parent.top - sceneRect.top + yOffset) / gameScale) + 'px';
        } else {
          overlay.style.left = '50%';
          overlay.style.top = '100px';
        }
      }
    }

    this.el('battle-scene').appendChild(overlay);
    setTimeout(() => overlay.remove(), duration);
  }
};
