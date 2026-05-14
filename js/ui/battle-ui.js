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

  getSprite(idx, type = 'enemy') {
    return this.el((type === 'enemy' ? 'espr-' : 'pspr-') + idx);
  },

  /**
   * Data-driven registry for boss-specific aesthetics and transitions.
   * Add new bosses here to avoid if/else logic bloat.
   */
  BOSS_CONFIG: {
    'galdor_king': {
      theme: 'king-galdor',
      flash: '#4ade80',
      fx: 'petalDrift',
      bg: 'galdor_garden'
    },
    'spectral_guardian': {
      theme: 'guardian',
      flash: '#a5f3fc',
      fx: 'frostShatter',
      bg: 'guardian_arena'
    },
    'demon_lord': {
      theme: 'demon-lord',
      flash: '#f97316',
      fx: 'obsidianMelt',
      bg: 'demon_lord_arena'
    },
    'void_knight': {
      theme: 'void-knight',
      flash: '#c084fc',
      fx: 'nullInversion',
      bg: 'eternal_void'
    },
    'river_king': {
      theme: 'river-king',
      flash: '#38bdf8',
      fx: 'tidalSurge',
      bg: 'riverlands'
    },
    'sunken_leviathan': {
      theme: 'sunken-leviathan',
      flash: '#818cf8',
      fx: 'abyssalCurrent',
      bg: 'stage_submerged_market'
    }
  },

  /**
   * Modular Intro Effects Factory
   */
  INTRO_EFFECTS: {
    async frostShatter(ctx, canvas) {
      const shards = [];
      const rows = 4, cols = 6;
      const w = canvas.width / cols;
      const h = canvas.height / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          shards.push({
            x: c * w, y: r * h,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 1.0) * 10,
            angle: 0, vAngle: (Math.random() - 0.5) * 0.2,
            opacity: 1
          });
        }
      }
      return new Promise(resolve => {
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let alive = false;
          shards.forEach(s => {
            s.x += s.vx; s.y += s.vy; s.vy += 0.4;
            s.angle += s.vAngle; s.opacity -= 0.015;
            if (s.opacity > 0) {
              alive = true;
              ctx.save();
              ctx.translate(s.x + w/2, s.y + h/2);
              ctx.rotate(s.angle);
              ctx.fillStyle = `rgba(165, 243, 252, ${s.opacity * 0.4})`;
              ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity * 0.8})`;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(-w/2, -h/2); ctx.lineTo(w/2, -h/3); ctx.lineTo(w/2, h/2); ctx.lineTo(-w/3, h/2);
              ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
            }
          });
          if (alive) requestAnimationFrame(animate); else resolve();
        };
        animate();
      });
    },

    async petalDrift(ctx, canvas) {
      const petals = [];
      for (let i = 0; i < 40; i++) {
        petals.push({
          x: Math.random() * canvas.width, y: -20,
          vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 3,
          angle: Math.random() * Math.PI, vAngle: (Math.random() - 0.5) * 0.1,
          opacity: 1
        });
      }
      return new Promise(resolve => {
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let alive = false;
          petals.forEach(p => {
            p.x += p.vx + Math.sin(p.y * 0.01) * 2;
            p.y += p.vy; p.angle += p.vAngle;
            if (p.y > canvas.height) p.opacity -= 0.05;
            if (p.opacity > 0) {
              alive = true;
              ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
              ctx.fillStyle = `rgba(74, 222, 128, ${p.opacity})`;
              ctx.beginPath(); ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
              ctx.fill(); ctx.restore();
            }
          });
          if (alive) requestAnimationFrame(animate); else resolve();
        };
        animate();
      });
    },

    async obsidianMelt(ctx, canvas) {
      const drips = [];
      const dripCount = 25;
      for (let i = 0; i < dripCount; i++) {
        drips.push({
          x: (i / dripCount) * canvas.width, y: 0,
          w: (canvas.width / dripCount) + 2, h: 0,
          vh: 8 + Math.random() * 15, opacity: 1
        });
      }
      return new Promise(resolve => {
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let alive = false;
          drips.forEach(d => {
            d.h += d.vh;
            if (d.h > canvas.height) d.opacity -= 0.08;
            if (d.opacity > 0) {
              alive = true;
              ctx.fillStyle = `rgba(40, 20, 10, ${d.opacity})`;
              ctx.fillRect(d.x, 0, d.w, d.h);
              ctx.fillStyle = `rgba(249, 115, 22, ${d.opacity})`;
              ctx.fillRect(d.x, d.h - 5, d.w, 10);
            }
          });
          if (alive) requestAnimationFrame(animate); else resolve();
        };
        animate();
      });
    },

    async nullInversion(ctx, canvas) {
      return new Promise(resolve => {
        let radius = 0;
        const maxRadius = Math.max(canvas.width, canvas.height);
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          radius += 40;
          ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2, radius, 0, Math.PI * 2); ctx.fill();
          if (radius < maxRadius) requestAnimationFrame(animate); else resolve();
        };
        animate();
      });
    },

    async tidalSurge(ctx, canvas) {
      const ripples = [];
      for (let i = 0; i < 5; i++) {
        ripples.push({
          radius: i * 40,
          speed: 12 + i * 2,
          alpha: 1.0 - (i * 0.15)
        });
      }
      return new Promise(resolve => {
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let alive = false;
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          
          ctx.save();
          ripples.forEach(r => {
            r.radius += r.speed;
            r.alpha -= 0.018;
            if (r.alpha > 0) {
              alive = true;
              ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha})`;
              ctx.lineWidth = 12;
              ctx.beginPath();
              ctx.arc(cx, cy, r.radius, 0, Math.PI * 2);
              ctx.stroke();
              
              // Internal subtle fill
              ctx.fillStyle = `rgba(14, 165, 233, ${r.alpha * 0.15})`;
              ctx.fill();
            }
          });
          ctx.restore();
          if (alive) requestAnimationFrame(animate); else resolve();
        };
        animate();
      });
    },

    async abyssalCurrent(ctx, canvas) {
      const bubbles = [];
      for (let i = 0; i < 60; i++) {
        bubbles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 200,
          radius: 4 + Math.random() * 16,
          speed: 4 + Math.random() * 8,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.05 + Math.random() * 0.05,
          alpha: 0.8 + Math.random() * 0.2
        });
      }
      let wipeProgress = 0;
      return new Promise(resolve => {
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let alive = false;
          
          // Render deep sea ambient gradient pressure overlay
          wipeProgress = Math.min(1.0, wipeProgress + 0.02);
          ctx.save();
          const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          grad.addColorStop(0, `rgba(15, 23, 42, ${wipeProgress * 0.7})`);
          grad.addColorStop(1, `rgba(49, 46, 129, ${wipeProgress * 0.95})`);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();

          // Render ascending dynamic pressure bubbles
          ctx.save();
          bubbles.forEach(b => {
            b.y -= b.speed;
            b.wobble += b.wobbleSpeed;
            const actualX = b.x + Math.sin(b.wobble) * 15;
            b.alpha -= 0.012;
            
            if (b.alpha > 0) {
              alive = true;
              ctx.fillStyle = `rgba(129, 140, 248, ${b.alpha * 0.4})`;
              ctx.strokeStyle = `rgba(199, 210, 254, ${b.alpha * 0.9})`;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(actualX, b.y, b.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              
              // Bubble highlight
              ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.8})`;
              ctx.beginPath();
              ctx.arc(actualX - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
              ctx.fill();
            }
          });
          ctx.restore();

          if (alive) requestAnimationFrame(animate); else resolve();
        };
        animate();
      });
    }
  },

  /**
   * Switches the sprite frame for an animated unit.
   */
  async showBossIntro(bossId, bossName, onComplete) {
    const layer = this.el('battle-intro-layer');
    const canvas = this.el('intro-canvas');
    const titleCard = this.el('intro-title-card');
    const nameEl = this.el('intro-boss-name');
    
    if (!layer || !canvas || !titleCard) {
      if (onComplete) onComplete();
      return;
    }

    const config = this.BOSS_CONFIG[bossId] || {};
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Reset and Setup
    nameEl.textContent = bossName;
    titleCard.className = ''; 
    layer.style.display = 'flex';
    layer.style.opacity = '1';
    layer.className = config.theme ? `theme--${config.theme}` : '';

    // Specialized Logic for Void Knight Inversion
    if (bossId === 'void_knight') {
      document.body.classList.add('theme--void-knight-active');
      setTimeout(() => document.body.classList.remove('theme--void-knight-active'), 2500);
    }

    // 1. Play Thematic FX from Registry
    if (config.flash) this.flash(config.flash, 600);
    
    const fxHandler = this.INTRO_EFFECTS[config.fx];
    if (fxHandler) {
      await fxHandler(ctx, canvas);
    } else {
      await new Promise(r => setTimeout(r, 800)); // Default pause
    }

    // 2. Show Title Card
    titleCard.classList.add('visible');
    await new Promise(r => setTimeout(r, 2200));
    
    // 3. Cleanup
    layer.style.transition = 'opacity 1s ease-out';
    layer.style.opacity = '0';
    setTimeout(() => {
      layer.style.display = 'none';
      layer.style.opacity = '1';
      layer.className = '';
      if (onComplete) onComplete();
    }, 1000);
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

    // Helper to apply High-Fidelity background
    const setHFBg = (bgName) => {
      if (!bgName) return false;
      const extMatch = bgName.match(/\.(png|jpg|webp|jpeg)$/i);
      const ext = extMatch ? extMatch[0] : '.webp';
      const cleanName = bgName.replace(/\.(png|jpg|webp|jpeg)$/i, '');
      scene.style.backgroundImage = `url('images/backgrounds/${cleanName}${ext}')`;
      scene.style.backgroundSize = 'cover';
      scene.style.backgroundPosition = 'center bottom';
      scene.classList.add('hf-bg-active');
      return true;
    };

    // Reset state
    scene.classList.remove('hf-bg-active');
    scene.style.backgroundImage = '';

    // 1. Check for Boss Background Override
    if (typeof G !== 'undefined' && G.enemyGroup) {
      const boss = G.enemyGroup.find(e => e.isBoss);
      if (boss) {
        const config = this.BOSS_CONFIG[boss.id];
        if (config && config.bg) {
          if (setHFBg(config.bg)) return;
        }
      }
    }

    // 2. Check if this is an Arc Boss fight (Story Mode)
    if (typeof Story !== 'undefined' && Story.active && Story.currentChap === Story.arc?.boss_chapter) {
      if (setHFBg(Story.currentChap.background)) return;
    }

    // 2. Check if a specific encounter background was passed
    if (typeof G !== 'undefined' && G.encounterBg) {
      if (setHFBg(G.encounterBg)) return;
    }

    // 3. Check if we are in a map encounter
    const curMap = (typeof MapEngine !== 'undefined') ? MapEngine.getMap() : null;
    if (curMap && curMap.battleBg) {
      if (setHFBg(curMap.battleBg)) return;
    }

    // 4. Fallback: Story arc gradient classes (Don't clear entire className)
    if (typeof Story !== 'undefined' && Story.active) {
      // Remove any existing arc-bg classes
      scene.className = scene.className.split(' ').filter(c => !c.startsWith('arc-bg-')).join(' ');
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
    const activeIdx = typeof TurnState !== 'undefined' ? TurnState.getActivePartyIdx() : G.activeMemberIdx;
    const h = G.party[activeIdx] || G.hero;
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

    // Clear log and prepare for descriptions when sub-menu is open
    const log = document.querySelector('.battle-log');
    if (log && id) {
      log.innerHTML = '<p class="log-line" style="color:var(--text-dim);font-style:italic">Choose an action...</p>';
    } else if (log) {
      this.refreshLog(); 
    }

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
    const queue = typeof TurnState !== 'undefined' ? TurnState.getQueue() : G.turnQueue;
    const turnIdx = typeof TurnState !== 'undefined' ? TurnState.getIndex() : G.turnIdx;
    queue.forEach((t, i) => {
      const unit = t.type === 'party' ? G.party[t.idx] : G.enemyGroup[t.idx];
      if (!unit) return;
      const isEnemy = t.type === 'enemy';
      const color = isEnemy ? '#ff4060' : (CHAR_COLOR[unit.charId] || '#c0b8e8');
      
      const tok = document.createElement('div');
      tok.className = 'tb-tok' +
        (i === turnIdx ? ' active-tok' : '') +
        (isEnemy ? ' enemy-tok' : '') +
        (!Battle.alive(unit) ? ' dead-tok' : '');
      
      // Enemy: sprite image. Party: colored initial badge.
      if (isEnemy) {
        const img = document.createElement('img');
        img.src = `images/enemies/${unit.id}.webp`;
        img.onerror = () => { img.style.opacity = '0.4'; };
        tok.appendChild(img);
      } else {
        const badge = document.createElement('div');
        badge.className = 'tb-tok-badge';
        badge.textContent = (unit.displayName || unit.charId || '?')[0].toUpperCase();
        badge.style.color = color;
        badge.style.borderColor = color;
        tok.appendChild(badge);
      }
      const hpRatio = unit.maxHp > 0 ? unit.hp / unit.maxHp : 1;
      const lowHp = Battle.alive(unit) && hpRatio <= 0.25;
      const defaultBorder = lowHp ? '#ff4444' : (Battle.alive(unit) ? color : '#333');
      tok.style.borderColor = (i === turnIdx) ? 'var(--gold)' : defaultBorder;
      if (lowHp && i !== turnIdx) tok.style.animation = 'cdPulse 1s ease-in-out infinite';
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

        const hpDrain = document.createElement('div');
        hpDrain.className = 'enemy-hp-bar-drain';
        hpDrain.id = 'ehpd-' + i;
        hpBg.appendChild(hpDrain);

        hpBar = document.createElement('div');
        hpBar.className = 'enemy-hp-bar-fill';
        hpBar.id = 'ehpb-' + i;
        hpBg.appendChild(hpBar);

        info = document.createElement('div');
        info.className = 'enemy-info';
        enemy.appendChild(info);
      } else {
        spr = enemy.querySelector('.enemy-sprite');
        hpBar = enemy.querySelector('.enemy-hp-bar-fill');
        info = enemy.querySelector('.enemy-info');
      }

      // Update State
      enemy.className = 'enemy' + (!alive ? ' ko-enemy' : '');
      const targetEnemyIdx = typeof TurnState !== 'undefined' ? TurnState.getTargetEnemyIdx() : G.targetEnemyIdx;
      enemy.dataset.target = i === targetEnemyIdx ? 'true' : 'false';
      enemy.onclick     = () => typeof selectTarget  === 'function' ? selectTarget(i)  : null;
      enemy.onmouseenter = () => typeof hoverTarget   === 'function' ? hoverTarget(i)   : null;
      
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
      
      const drain = this.el('ehpd-' + i);
      if (drain) {
        setTimeout(() => { drain.style.width = pct + '%'; }, 300);
      }

      const hpTxt = alive ? `<div class="enemy-hp-txt">${Math.max(0, e.hp)}/${e.maxHp}</div>` : '';
      const esc = (typeof escapeHtml === 'function') ? escapeHtml : (v) => v;
      const traitHtml = (e.mutantTraits || []).map(t => `<span class="trait-pill">${esc(t.label)}</span>`).join('');
      const newInfo = `<div class="enemy-name">${esc(e.name)}</div><div class="enemy-level">Lv ${e.level}</div>${hpTxt}<div class="enemy-traits">${traitHtml}</div>`;
      if (info.innerHTML !== newInfo) info.innerHTML = newInfo;

      // Indicator logic removed - handled by CSS ground rings
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

        const anchor = document.createElement('div');
        anchor.className = 'party-visual-anchor';
        member.appendChild(anchor);

        const shadow = document.createElement('div');
        shadow.className = 'party-shadow';
        anchor.appendChild(shadow);

        spr = document.createElement('div');
        spr.id = 'pspr-' + i;
        spr.className = 'party-sprite';
        anchor.appendChild(spr);

        const hpBg = document.createElement('div');
        hpBg.className = 'party-hp-bar-bg';
        member.appendChild(hpBg);

        const hpDrain = document.createElement('div');
        hpDrain.className = 'party-hp-bar-drain';
        hpDrain.id = 'phpd-' + i;
        hpBg.appendChild(hpDrain);

        hpBar = document.createElement('div');
        hpBar.className = 'party-hp-bar-fill';
        hpBar.id = 'phpb-' + i;
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
      const esc = (typeof escapeHtml === 'function') ? escapeHtml : (v) => v;
      const traitHtml = ''; // Reserved for future party traits
      const newInfo = `<div class="party-name">${esc(m.displayName)}</div><div class="party-level">Lv ${m.lv}</div>${traitHtml}`;
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
        
        const drain = this.el('phpd-' + i);
        if (drain) {
          setTimeout(() => { drain.style.width = pct + '%'; }, 300);
        }
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
      const isBusy = typeof TurnState !== 'undefined' ? TurnState.isBusy() : G.busy;
      const activeIdx = typeof TurnState !== 'undefined' ? TurnState.getActivePartyIdx() : G.activeMemberIdx;
      const isActing = isBusy && activeIdx === i;
      if (!isActing) {
        this.setSpriteFrame(i, Battle.alive(m) ? 'idle' : 'fallen');
      }
    });

    this.highlightActiveMember();
  },

  highlightActiveMember() {
    const queue = typeof TurnState !== 'undefined' ? TurnState.getQueue() : G.turnQueue;
    const turnIdx = typeof TurnState !== 'undefined' ? TurnState.getIndex() : G.turnIdx;
    const t = queue[turnIdx];
    document.querySelectorAll('.party-member').forEach((w, i) => {
      const isActive = t && t.type === 'party' && t.idx === i;
      w.classList.toggle('active-member', isActive);


      // Use box-shadow via CSS class instead of dynamic filter to prevent blurring

    });
  },

  /* ── Party status cards ────────────────────────────── */
  renderPartyStatus() {
    const bar = this.el('party-status-bar');
    if (!bar) return;
    if (!this._pscPrevHp) this._pscPrevHp = {};

    bar.innerHTML = '';
    G.party.forEach((m, i) => {
      if (!m) return;
      const col = CHAR_COLOR[m.charId] || '#c0b8e8';
      const hpPct = Math.max(0, m.hp / m.maxHp * 100);
      const mpPct = Math.max(0, m.mp / m.maxMp * 100);
      const hpCol = hpPct > 50 ? 'var(--hp-hi)' : hpPct > 25 ? 'var(--hp-mid)' : 'var(--hp-lo)';
      const queue = typeof TurnState !== 'undefined' ? TurnState.getQueue() : G.turnQueue;
      const turnIdx = typeof TurnState !== 'undefined' ? TurnState.getIndex() : G.turnIdx;
      const isActive = queue[turnIdx]?.type === 'party' && queue[turnIdx]?.idx === i;

      // Ghost drain: start drain at previous HP, bar at current HP
      const prevHpPct = this._pscPrevHp[i] ?? hpPct;
      const drainStart = hpPct < prevHpPct ? prevHpPct : hpPct;
      this._pscPrevHp[i] = hpPct;

      const card = document.createElement('div');
      card.className = 'psc' + (m.isKO ? ' ko-psc' : '') + (isActive ? ' active-psc' : '');
      card.style.borderColor = isActive ? col : col + '50';

      const statusHtml = this._renderPSCStatuses(m);
      const esc = (typeof escapeHtml === 'function') ? escapeHtml : (v) => v;

      card.innerHTML = `
        <div class="psc-header">
          <div class="psc-name" style="color:${col}">${esc(m.displayName)} <span class="psc-lv">L${m.lv}</span></div>
          <div class="psc-statuses">${statusHtml}</div>
        </div>
        <div class="psc-hp-bg">
          <div class="psc-hp-drain" id="pscd-${i}" style="width:${drainStart}%"></div>
          <div class="psc-hp-bar" id="pscb-${i}" style="width:${hpPct}%;background:${hpCol}"></div>
        </div>
        <div class="psc-hp-txt">${Math.max(0, m.hp)}/${m.maxHp} HP · ${m.mp}/${m.maxMp} MP</div>
        <div class="psc-mp-bg"><div class="psc-mp-bar" style="width:${mpPct}%"></div></div>`;
      bar.appendChild(card);
    });

    // Animate ghost drain to current HP on next frame (triggers CSS transition)
    requestAnimationFrame(() => {
      G.party.forEach((m, i) => {
        if (!m) return;
        const drain = this.el('pscd-' + i);
        if (drain) drain.style.width = Math.max(0, m.hp / m.maxHp * 100) + '%';
      });
    });
  },

  _renderPSCStatuses(m) {
    const tokens = [];
    const esc = (typeof escapeHtml === 'function') ? escapeHtml : (v) => v;
    const push = (icon, turns, cl = '') => {
      if (turns === undefined || turns === null || turns === '-') tokens.push(`<div class="psct ${cl}">${icon}</div>`);
      else tokens.push(`<div class="psct ${cl}">${icon}<span class="psct-cnt">${esc(String(turns))}</span></div>`);
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
    const queue = typeof TurnState !== 'undefined' ? TurnState.getQueue() : G.turnQueue;
    const turnIdx = typeof TurnState !== 'undefined' ? TurnState.getIndex() : G.turnIdx;
    const t = queue[turnIdx];
    if (!t || t.type !== 'party') {
      bar.innerHTML = '<span style="color:#5a527a">Enemy acting…</span>';
      return;
    }
    const m = G.party[t.idx];
    const col = CHAR_COLOR[m.charId] || '#c0b8e8';
    const isSmall = window.innerWidth < 600;
    const classInfo = isSmall ? `LV ${m.lv}` : `${m.cls.name} · LV ${m.lv}`;
    const mpInfo = isSmall ? `MP ${m.mp}` : `MP ${m.mp}/${m.maxMp}`;
    
    const esc = (typeof escapeHtml === 'function') ? escapeHtml : (v) => v;
    bar.innerHTML =
      `<div class="amb-portrait" style="color:${col};border-color:${col}">${esc((m.displayName||m.charId||'?')[0].toUpperCase())}</div>` +
      `<span class="amb-arrow" style="color:${col}">▶</span>` +
      `<span class="amb-name" style="color:${col}">${esc(m.displayName)}</span>` +
      `<span class="amb-class">${esc(classInfo)}</span>` +
      `<span class="amb-mp" style="color:#6080ff">${esc(mpInfo)}</span>`;
    
    // Auto-focus the action menu for keyboard/controller
    if (typeof Focus !== 'undefined') {
      Focus.setContext('cmd-grid-main');
    }

    // --- FLEE RESTRICTION UI ---
    const isBoss = G.enemyGroup.some(e => e.isBoss);
    const isStory = (typeof Story !== 'undefined' && Story.active && Story._skirmishArcIdx === undefined);
    const runBtn = document.querySelector('.cmd-btn[onclick="heroRun()"]');
    if (runBtn) {
      const disabled = isBoss || isStory;
      runBtn.disabled = disabled;
      runBtn.style.opacity = disabled ? '0.4' : '1';
      runBtn.style.pointerEvents = disabled ? 'none' : 'auto';
      runBtn.title = disabled ? 'Cannot flee from this battle' : '';
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
    
    // Add random jitter to x/y so multiple hits arc differently
    const ox = (Math.random() - 0.5) * 40;
    const oy = (Math.random() - 0.5) * 20;

    d.className = `pop-text pop-${type} elem-${element}`;
    d.textContent = text;
    d.style.left = (x + ox) + 'px';
    d.style.top = (y + oy) + 'px';
    s.appendChild(d);
    setTimeout(() => d.remove(), 1200);
  },

  showAbilityDesc(ab) {
    const log = document.querySelector('.battle-log');
    if (!log || !ab) return;
    log.innerHTML = `<p class="log-line" style="color:var(--gold);font-weight:bold">${escapeHtml(ab.name)}</p>` +
                    `<p class="log-line" style="font-size:12px;color:#fff">${escapeHtml(ab.description)}</p>`;
  },

  clearAbilityDesc() {
    // Optional
  },

  refreshLog() {
    // For now combat messages repopulate on next turn action.
  },

  /**
   * Renders a cinematic dialogue overlay mid-battle.
   * Freezes the action UI and renders lines one-by-one.
   * Calls onComplete() when all lines have been advanced through.
   * @param {object} event - The battleEvent object from enemies.json
   * @param {function} onComplete - Callback to resume the turn queue
   */
  showBattleEvent(event, onComplete) {
    // Remove any existing overlay first
    this.closeBattleEvent();

    const scene = this.el('battle-scene');
    if (!scene) { onComplete?.(); return; }

    const lines = event.lines || [];
    let lineIdx = 0;

    const overlay = document.createElement('div');
    overlay.id = 'battle-event-overlay';
    overlay.style.cssText = `
      position: absolute; inset: 0; z-index: 800;
      display: flex; flex-direction: column; justify-content: flex-end;
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%);
      padding: 0 0 12px 0;
      animation: fadeIn 0.35s ease-out;
    `;

    const box = document.createElement('div');
    box.id = 'battle-event-box';
    box.style.cssText = `
      margin: 0 16px;
      background: rgba(5,2,18,0.92);
      border: 1px solid rgba(255,215,0,0.35);
      border-radius: 10px;
      padding: 14px 18px 12px;
      box-shadow: 0 0 24px rgba(255,215,0,0.12), inset 0 0 20px rgba(0,0,0,0.5);
      cursor: pointer;
      user-select: none;
    `;

    const speakerEl = document.createElement('div');
    speakerEl.style.cssText = `
      font-size: 13px; font-weight: 700; letter-spacing: 0.08em;
      color: #ffd700; margin-bottom: 6px; text-transform: uppercase;
    `;

    const textEl = document.createElement('div');
    textEl.style.cssText = `
      font-size: 14px; line-height: 1.55; color: #e8e0ff;
    `;

    const hint = document.createElement('div');
    hint.style.cssText = `
      text-align: right; font-size: 10px; color: rgba(255,215,0,0.45);
      margin-top: 8px; letter-spacing: 0.05em;
    `;
    hint.textContent = '▶ TAP TO CONTINUE';

    box.appendChild(speakerEl);
    box.appendChild(textEl);
    box.appendChild(hint);
    overlay.appendChild(box);
    scene.appendChild(overlay);

    const showLine = () => {
      if (lineIdx >= lines.length) {
        this.closeBattleEvent();
        onComplete?.();
        return;
      }
      const line = lines[lineIdx++];
      // Color-code known speakers
      const SPEAKER_COLORS = {
        'Aya': '#7dd3fc', 'Tao': '#ef4444', 'Rei': '#4ade80',
        'Lulu': '#2dd4bf', 'Rex': '#fcd34d', 'Ria': '#a78bfa',
        'narrator': '#a0a0c0'
      };
      speakerEl.textContent = line.speaker || '';
      speakerEl.style.color = SPEAKER_COLORS[line.speaker] || '#ffd700';
      textEl.textContent = line.text || '';
      hint.textContent = lineIdx >= lines.length ? '▶ CLOSE' : '▶ TAP TO CONTINUE';
    };

    // Advance on click
    box.addEventListener('click', showLine);

    // Also advance on Space/Enter for keyboard players
    const keyHandler = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        showLine();
      }
    };
    document.addEventListener('keydown', keyHandler);
    overlay._keyHandler = keyHandler; // Store for cleanup

    showLine(); // Render first line immediately
  },

  /**
   * Removes the mid-battle event overlay from the scene.
   */
  closeBattleEvent() {
    const ov = this.el('battle-event-overlay');
    if (!ov) return;
    if (ov._keyHandler) document.removeEventListener('keydown', ov._keyHandler);
    ov.remove();
  },

  /**
   * Full lunge sequence: idle → prepare → jump → attack (hit) → hold → return → idle.
   * onHit fires at the attack peak. onComplete fires when fully back at idle.
   * Falls back gracefully if the DOM element is missing.
   */
  lunge(partyIdx, enemyIdx, onHit, onComplete) {
    const src = this._getAnchor(partyIdx, 'party');
    const dst = this._getAnchor(enemyIdx, 'enemy');
    const member = this.el('pmember-' + partyIdx);

    // Fallback: no element found — fire callbacks immediately and bail
    if (!member || !src || !dst) {
      onHit?.();
      setTimeout(() => onComplete?.(), 100);
      return;
    }

    const dx = (dst.x - src.x) * 0.65;
    const dy = (dst.y - src.y) * 0.65;

    // t=0 — prepare frame already set by caller; hold in place briefly

    // t=150 — snap forward (fast, snappy ease-in)
    setTimeout(() => {
      member.style.transition = 'transform 0.2s cubic-bezier(0.3, 0, 0.7, 1)';
      member.style.transform  = `translate(${dx}px, ${dy}px) scale(1.1)`;
      member.style.zIndex     = '50';
    }, 150);

    // t=350 — peak: switch to attack frame, fire damage
    setTimeout(() => {
      this.setSpriteFrame(partyIdx, 'attack');
      onHit?.();
    }, 350);

    // t=600 — hold felt; now return smoothly
    setTimeout(() => {
      member.style.transition = 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)';
      member.style.transform  = '';
      member.style.zIndex     = '';
    }, 600);

    // t=880 — landing: brief prepare recovery pose
    setTimeout(() => {
      this.setSpriteFrame(partyIdx, 'prepare');
    }, 880);

    // t=980 — settle into idle, signal turn advance
    setTimeout(() => {
      if (Battle.alive(G.party[partyIdx])) this.setSpriteFrame(partyIdx, 'idle');
      onComplete?.();
    }, 980);
  },

  /**
   * Enemy attack animation sequence. Branches on moveType:
   *   'physical' — charge wind-up → lunge left → return
   *   'magic'    — float up + glow → effect overlay → settle
   *   'debuff'   — hue-rotate pulse, no movement
   * onHit fires at impact peak. onComplete fires when fully settled.
   */
  enemyStrike(enemyIdx, moveType, targetPartyIdx, element, onHit, onComplete) {
    const enemyEl = document.querySelector(`.enemy[data-idx="${enemyIdx}"]`);
    const spr     = this.el('espr-' + enemyIdx);

    // Fallback: no element — fire callbacks and bail
    if (!enemyEl) {
      setTimeout(() => onHit?.(), 280);
      setTimeout(() => onComplete?.(), 900);
      return;
    }

    const _cleanup = () => {
      enemyEl.classList.remove('enemy-anim-charge', 'enemy-anim-lunge',
                               'enemy-anim-cast', 'enemy-anim-debuff');
      if (spr) spr.classList.remove(...Array.from(spr.classList)
        .filter(c => c.startsWith('element-')));
    };

    const _flashParty = () => {
      const pmember = this.el('pmember-' + targetPartyIdx);
      if (pmember) {
        pmember.classList.add('party-hit-flash');
        setTimeout(() => pmember.classList.remove('party-hit-flash'), 240);
      }
    };

    if (moveType === 'physical') {
      // t=0   charge wind-up
      enemyEl.classList.add('enemy-anim-charge');
      setTimeout(() => {
        // t=120 swap to lunge
        enemyEl.classList.remove('enemy-anim-charge');
        enemyEl.classList.add('enemy-anim-lunge');
        if (spr) spr.classList.add(`element-${element}`);
      }, 120);

      // t=280 impact — hit, flash, shake
      setTimeout(() => {
        _flashParty();
        this.triggerScreenShake(180);
        onHit?.();
      }, 280);

      // t=750 settled — cleanup + complete
      setTimeout(() => {
        _cleanup();
        onComplete?.();
      }, 750);

    } else if (moveType === 'magic_damage' || moveType === 'magic') {
      // t=0 float + glow
      enemyEl.classList.add('enemy-anim-cast');
      if (spr) spr.classList.add(`element-${element}`);

      // t=200 effect overlay fires from enemy toward party
      setTimeout(() => {
        this.createEffectOverlay(targetPartyIdx, element, 'party');
      }, 200);

      // t=280 damage resolves
      setTimeout(() => {
        _flashParty();
        onHit?.();
      }, 280);

      // t=920 settled
      setTimeout(() => {
        _cleanup();
        onComplete?.();
      }, 920);

    } else {
      // debuff / heal / status — pulse in place, no movement
      enemyEl.classList.add('enemy-anim-debuff');

      // t=280 effect applies
      setTimeout(() => {
        onHit?.();
      }, 280);

      // t=880 done
      setTimeout(() => {
        _cleanup();
        onComplete?.();
      }, 880);
    }
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
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      overlay.style.left = ((rect.left - sceneRect.left + centerX) / gameScale) + 'px';
      overlay.style.top = ((rect.top - sceneRect.top + centerY) / gameScale) + 'px';
      overlay.style.transform = 'translate(-50%, -50%)';
    } else {
      overlay.style.left = '50%';
      overlay.style.top = '140px';
      overlay.style.transform = 'translateX(-50%)';
    }

    this.el('battle-scene').appendChild(overlay);
    setTimeout(() => overlay.remove(), duration);
  }
};
window.BattleUI = BattleUI;
