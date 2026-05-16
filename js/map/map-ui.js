/**
 * map-ui.js — HUD overlay: notifications, party HUD, minimap, d-pad, map-select.
 *
 * DOM targets (defined in index.html / map.css):
 *   #explore-notif        — gold notification banner (absolute inside canvas-wrap)
 *   #explore-flash        — ember vignette flash
 *   #explore-party-hud    — party HP strip (bottom-left)
 *   #explore-minimap-wrap — minimap panel (bottom-right)
 *   #explore-minimap      — <canvas> inside minimap wrap
 *   #explore-map-name     — Cinzel map title in header
 *   #explore-loc          — bottom hint bar text
 *   #map-select-overlay   — full-screen region picker
 *
 * Depends on: map-data.js, map-engine.js, map-entities.js
 * Expects globals: MAP_DEFS, MapPlayer, MapEngine, MapEntities, G
 */

const MapUI = (() => {

  /* ── Notification banner ─────────────────────────────── */
  let _notifTimer = null;
  let _banterCooldown = false;
  let _idleTimer = 0;


  function _toggleDpad(show) {
    const dpad = document.getElementById('joystick-container');
    if (!dpad) return;
    
    // Only show if we are actually on a touch device
    const isTouch = document.body.classList.contains('is-touch-device') || 
                   window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch) {
      dpad.style.display = 'none';
      return;
    }

    if (show) {
      dpad.style.removeProperty('display');
    } else {
      dpad.style.display = 'none';
    }
  }

  function showMsg(text, durationMs, cb) {
    // Prefer the explore-screen banner; fall back to canvas overlay
    const el = document.getElementById('explore-notif');
    if (el) {
      el.textContent = text;
      el.classList.add('show');
      el.style.opacity = '1';
      clearTimeout(_notifTimer);
      _notifTimer = setTimeout(() => {
        el.classList.remove('show');
        el.style.opacity = '0';
        if (cb) cb();
      }, durationMs || 1200);
    } else {
      // Element not found — still fire callback so story progression isn't lost
      if (cb) setTimeout(cb, durationMs || 1200);
    }
  }

  /* ── Dynamic Banter System ───────────────────────────── */
  
  /**
   * Triggers a banter sequence by key.
   * Logic: Checks cooldown, session-uniqueness, and requirements before playing.
   */
  function _showBanter(key) {
    if (_banterCooldown || !window.BANTER_DATA) return;
    
    // Find banter group matching the key (e.g. 'map_enter_verdant_vale')
    const groups = window.BANTER_DATA[key];
    if (!groups || !groups.length) return;

    // Filter by requirements (party members present) and session-uniqueness
    const validGroups = groups.filter(g => {
      if (G.shownBanter.has(g.id)) return false;
      const reqs = g.requires_party || g.requires;
      if (reqs && !reqs.every(id => G.party.some(m => m.charId === id))) return false;
      return true;
    });

    if (!validGroups.length) return;

    // Pick a random valid group
    const group = validGroups[Math.floor(Math.random() * validGroups.length)];
    
    // Special case: Boss defeated banter uses the full blocking dialogue UI
    if (key.startsWith('boss_defeated_') && MapEngine.openDialogue) {
      const dialogueLines = group.lines.map(l => ({ 
        speaker: l.speaker, 
        text: l.text,
        emotion: l.emotion || 'normal'
      }));
      MapEngine.openDialogue(dialogueLines);
      G.shownBanter.add(group.id);
      return;
    }

    // Standard ambient banter uses showMsg pipeline
    _banterCooldown = true;
    G.shownBanter.add(group.id);
    _playBanterLines(group.lines);

    // 45s cooldown between ambient banter events
    setTimeout(() => { _banterCooldown = false; }, 45000);
  }

  function _playBanterLines(lines) {
    if (!lines || !lines.length) return;
    const line = lines[0];
    const speaker = (G.chars || []).find(c => c.id === line.speaker)?.name || line.speaker;
    
    // Display format: "Aya: 'The breeze here is quite refreshing.'"
    showMsg(`${speaker}: "${line.text}"`, 3500, () => {
      if (lines.length > 1) {
        // Small gap between speakers
        setTimeout(() => _playBanterLines(lines.slice(1)), 800);
      }
    });
  }


  const showMapBanner = showMsg;

  /* ── Encounter flash ─────────────────────────────────── */
  function triggerDanger() {
    const fl = document.getElementById('explore-flash');
    if (!fl) return;
    fl.classList.add('show');
    setTimeout(() => fl.classList.remove('show'), 280);
  }

  /* ── Active character cycling ────────────────────────── */
  function cycleCharacter() {
    if (!G || !G.party || G.party.length < 2) return;
    G.activePartyIdx = (G.activePartyIdx + 1) % G.party.length;
    const active = G.party[G.activePartyIdx];
    showMsg(`▶ ${active?.displayName || active?.charId || '?'}`, 900);
    _updatePartyHUD();
  }

  /* ── Party HUD ───────────────────────────────────────── */
  const _avatarMap = { Mage:'🧙', Knight:'🛡', Ranger:'🏹', Warrior:'⚔', Healer:'💚' };
  let _lastHUDState = '';

  function _updatePartyHUD() {
    const hud = document.getElementById('explore-party-hud');
    if (!hud || !G || !G.party || !G.party.length) return;
    
    // Generate a lightweight "hash" of the party state to see if we NEED to re-render
    const currentState = G.party.map((m, i) => 
      `${m.charId}-${m.hp}-${m.maxHp}-${i === G.activePartyIdx}`
    ).join('|');

    if (currentState === _lastHUDState) return;
    
    // Check if we can just update existing bars instead of full innerHTML replacement
    const members = hud.querySelectorAll('.ex-hud-member');
    if (members.length === G.party.length && currentState.split('|').length === _lastHUDState.split('|').length) {
      // Partial update (much smoother, no animation restarts)
      G.party.forEach((m, i) => {
        const isActive = i === G.activePartyIdx;
        const ratio = Math.max(0, m.hp / m.maxHp);
        const col = ratio > 0.5 ? '#40d870' : ratio > 0.25 ? '#e8b030' : '#e04040';
        
        const card = members[i];
        if (card.classList.contains('ex-hud-active') !== isActive) {
           card.classList.toggle('ex-hud-active', isActive);
           const nameEl = card.querySelector('.ex-hud-name');
           if (nameEl) nameEl.innerHTML = `${(m.displayName || m.charId || '?').slice(0,8)}${isActive ? ' ◀' : ''}`;
        }
        
        const bar = card.querySelector('.ex-hud-bar-fill');
        if (bar) {
          bar.style.width = `${ratio * 100}%`;
          bar.style.background = col;
        }
        
        const text = card.querySelector('.ex-hud-hp');
        if (text) text.textContent = `${m.hp} / ${m.maxHp} HP`;
      });
      _lastHUDState = currentState;
      return;
    }

    // Full render only if composition changed (number of members or IDs)
    hud.innerHTML = '';
    G.party.forEach((m, i) => {
      if (!m) return;
      const isActive = i === G.activePartyIdx;
      const ratio    = Math.max(0, m.hp / m.maxHp);
      const col      = ratio > 0.5 ? '#40d870' : ratio > 0.25 ? '#e8b030' : '#e04040';
      const role     = m.cls?.role || m.role || '';
      const el       = document.createElement('div');
      el.className   = 'ex-hud-member' + (isActive ? ' ex-hud-active' : '');
      el.title       = 'Switch character (Tab)';
      el.innerHTML   = `
        <div class="ex-hud-avatar">${_avatarMap[role] || '⚔'}</div>
        <div class="ex-hud-info">
          <div class="ex-hud-name">${(m.displayName || m.charId || '?').slice(0,8)}${isActive ? ' ◀' : ''}</div>
          <div class="ex-hud-bar-wrap">
            <div class="ex-hud-bar-fill" style="width:${ratio*100}%;background:${col}"></div>
          </div>
          <div class="ex-hud-hp">${m.hp} / ${m.maxHp} HP</div>
        </div>`;
      el.addEventListener('click', () => {
        G.activePartyIdx = i;
        showMsg(`▶ ${m.displayName || m.charId || '?'}`, 900);
        _updatePartyHUD();
      });
      hud.appendChild(el);
    });
    _lastHUDState = currentState;
  }

  /* ── Minimap ─────────────────────────────────────────── */
  function _renderMinimap() {
    const mc  = document.getElementById('explore-minimap');
    const map = MapEngine.getMap();
    if (!mc || !map) return;

    const mw = 96, mh = 60;
    mc.width = mw; mc.height = mh;
    const mctx = mc.getContext('2d');
    const tw = mw / map.width, th = mh / map.height;

    mctx.fillStyle = '#06040e';
    mctx.fillRect(0, 0, mw, mh);

    for (let r = 0; r < map.height; r++) {
      for (let c = 0; c < map.width; c++) {
        const tid = MapData.getTileAt(map, c, r);
        const def = TILE_DEFS[tid] || TILE_DEFS[0];
        mctx.fillStyle = def.color;
        mctx.fillRect(c * tw, r * th, Math.max(tw, 1), Math.max(th, 1));
      }
    }

    // Enemy dots
    if (typeof MapEntities !== 'undefined') {
      (MapEntities._enemies || []).forEach(en => {
        if (!en.alive) return;
        mctx.fillStyle = '#e04040';
        mctx.fillRect(en.tx * tw - 0.5, en.ty * th - 0.5, 2, 2);
      });
    }

    // Player dot
    mctx.fillStyle = '#c8a4ff';
    mctx.fillRect(MapPlayer.tx * tw - 1, MapPlayer.ty * th - 1, 3, 3);

    // Camera viewport rect
    const cam = MapEngine.getCam();
    const TILE = MapEngine.getTile();
    const canvas = document.getElementById('explore-canvas');
    if (cam && canvas) {
      mctx.strokeStyle = 'rgba(200,164,90,0.5)';
      mctx.lineWidth   = 0.5;
      mctx.strokeRect(
        cam.x / TILE * tw,
        cam.y / TILE * th,
        (canvas.width  / TILE) * tw,
        (canvas.height / TILE) * th
      );
    }
  }

  /* ── Map name header ─────────────────────────────────── */
  function _updateMapNameHeader() {
    const lbl = document.getElementById('explore-map-name');
    if (!lbl) return;
    const map = MapEngine.getMap();
    lbl.textContent = map ? `✦ ${map.name.toUpperCase()} ✦` : '✦ EXPLORE ✦';
  }

  /* ── D-pad touch hit-test (canvas-based fallback) ────── */
  // The new DOM d-pad in index.html handles its own events.
  // This function remains for backwards compatibility with game.js
  // which calls MapUI.handleTouch() on canvas touchstart/mousedown.
  const DPAD = { size: 38, gap: 3, btns: null };

  function _buildDpad(cw, ch) {
    const s = DPAD.size, g = DPAD.gap;
    const bx = cw - (s * 3 + g * 2) - 10;
    const by = ch - (s * 3 + g * 2) - 10;
    DPAD.btns = [
      { dx: 0, dy:-1, x: bx + s + g,   y: by,           label:'▲' },
      { dx:-1, dy: 0, x: bx,           y: by + s + g,   label:'◀' },
      { dx: 0, dy: 0, x: bx + s + g,   y: by + s + g,   label:'·' },
      { dx: 1, dy: 0, x: bx+(s+g)*2,   y: by + s + g,   label:'▶' },
      { dx: 0, dy: 1, x: bx + s + g,   y: by+(s+g)*2,   label:'▼' },
    ];
  }

  function handleTouch(clientX, clientY, canvasEl) {
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const mx   = clientX - rect.left;
    const my   = clientY - rect.top;
    _buildDpad(canvasEl.width, canvasEl.height);
    DPAD.btns.forEach(b => {
      if (mx >= b.x && mx <= b.x + DPAD.size && my >= b.y && my <= b.y + DPAD.size) {
        MapPlayer.dpad(b.dx, b.dy);
      }
    });
  }


  /* ── Pause Menu ─────────────────────────────────────── */
  const CHAR_COLOR_MAP = {
    aya:'#7dd3fc', tao:'#ef4444', lulu:'#2dd4bf', rei:'#4ade80',
    rydia:'#a78bfa', lenneth:'#e879f9', kain:'#0ea5e9', leon:'#fbbf24'
  };

  function openPauseMenu() {
    if (typeof UI !== 'undefined') UI.hideAllOverlays();
    if (MapEngine.isRunning()) MapEngine.stop();
    _toggleDpad(false);
    const el = document.getElementById('map-pause-menu');
    if (el) el.style.display = 'flex';
    if (typeof ControlHints !== 'undefined') ControlHints.setContext('menu');
    if (typeof Focus !== 'undefined') {
      Focus.setContext('map-pause-menu');
    }
  }

  function closePauseMenu() {
    const el = document.getElementById('map-pause-menu');
    if (el) el.style.display = 'none';
    _toggleDpad(true);
    if (typeof Focus !== 'undefined') {
      Focus.setContext(null);
    }
    MapEngine.resume();
  }

  function pauseSave() {
    if (typeof Story !== 'undefined' && Story.active) {
      Story._doSave();
      showMsg('💾 Progress saved!', 1800);
    } else {
      // Free explore — save minimal state to slot 0
      if (typeof Save !== 'undefined' && G.party.length) {
        Save.write(SaveContract.buildFreeExploreSaveState(G), 0);
        showMsg('💾 Progress saved!', 1800);
      }
    }
  }





  /* ── Corruption meter ───────────────────────────────── */
  function _renderCorruptionMeter() {
    const bar   = document.getElementById('corruption-fill');
    const label = document.getElementById('corruption-label');
    const wrap  = document.getElementById('corruption-meter');
    if (!bar || !label || !wrap) return;

    const p    = (typeof MapEngine !== 'undefined') ? MapEngine.corruptionProgress() : 0;
    const safe = (typeof MapEngine !== 'undefined') && MapEngine.inSafeZone();
    const pct  = Math.round(p * 100);

    bar.style.width = `${pct}%`;

    const hue = Math.round(120 - p * 150);
    const sat = 70 + p * 20;
    const lit = 52 - p * 14;
    bar.style.background = p > 0.85
      ? `linear-gradient(90deg, #7c3aed, #a855f7)`
      : `hsl(${hue}, ${sat}%, ${lit}%)`;

    if (safe) {
      label.textContent = '◈ SAFE ZONE';
      label.style.color = '#4ade80';
      bar.style.opacity = pct > 0 ? '0.5' : '0';
      wrap.style.opacity = '1';
    } else {
      label.textContent = pct > 0 ? `☠ ${pct}%` : '☠ DANGER ZONE';
      label.style.color = p > 0.6 ? '#f87171' : p > 0.3 ? '#fbbf24' : '#ef4444';
      bar.style.opacity = '1';
      wrap.style.opacity = '1';
    }

    wrap.classList.toggle('corruption-danger', p >= 0.8);
  }

  /* ── Quest Tracker (top-right, below minimap) ───────── */
  let _lastQuestHash = '';
  function _renderQuestTracker() {
    const root = document.getElementById('quest-tracker');
    if (!root || typeof QuestSystem === 'undefined') return;

    const active = QuestSystem.getActive ? QuestSystem.getActive() : [];
    if (!active.length) {
      if (root.style.display !== 'none') root.style.display = 'none';
      _lastQuestHash = '';
      return;
    }

    // Show top 3, prioritise complete (ready-to-submit) first
    const sorted = active.slice().sort((a, b) => (b.complete ? 1 : 0) - (a.complete ? 1 : 0));
    const top = sorted.slice(0, 3);

    const hash = top.map(q => `${q.id}|${q.current}|${q.count}|${q.complete?1:0}`).join('~');
    if (hash === _lastQuestHash) return;
    _lastQuestHash = hash;

    root.style.display = '';
    const list = document.getElementById('quest-tracker-list');
    if (!list) return;
    list.innerHTML = '';

    top.forEach(q => {
      const pct = q.complete ? 100 : Math.min(100, Math.floor(((q.current || 0) / Math.max(q.count || 1, 1)) * 100));
      const label = q.label || q.id;
      const row = document.createElement('div');
      row.className = 'qt-row' + (q.complete ? ' qt-complete' : '');
      const status = q.complete
        ? '<span class="qt-progress" style="color:#b8ffc0">✔ READY — RETURN TO GIVER</span>'
        : `<div class="qt-progress">
             <span>${q.current || 0}/${q.count || 1}</span>
             <div class="qt-bar-wrap"><div class="qt-bar-fill" style="width:${pct}%"></div></div>
           </div>`;
      row.innerHTML = `<div class="qt-name">${label}</div>${status}`;
      list.appendChild(row);
    });
  }

  /* ── Periodic HUD / minimap refresh (called by engine each frame) ── */
  let _hudTick = 0;
  function update(dt) {
    _hudTick++;
    if (_hudTick % 6 === 0) {   // ~10×/s at 60fps
      _updatePartyHUD();
      _renderMinimap();
      _renderCorruptionMeter();
      _renderQuestTracker();
      if (typeof ChronosEngine !== 'undefined') {
        const hintEl = document.querySelector('.explore-map-hint');
        if (hintEl) {
          const phaseIcons = { dawn: '🌅 Dawn', noon: '☀️ Noon', dusk: '🌆 Dusk', midnight: '🌙 Midnight' };
          const phase = ChronosEngine.getPhase();
          hintEl.textContent = `↑↓←→ · WASD to move  |  🕰️ ${ChronosEngine.formatTime()} — ${phaseIcons[phase] || phase}`;
        }
      }
    }

    // 3. Movement input resets idle timer
    const input = (typeof MapInput !== 'undefined') ? MapInput.poll() : null;
    const touchActive = (typeof MapTouch !== 'undefined' && typeof MapTouch.isActive === 'function') ? MapTouch.isActive() : false;
    
    if ((input && (input.up || input.down || input.left || input.right)) || touchActive) {
      _idleTimer = 0;
    } else {
      _idleTimer += dt;
      // 20s idle trigger
      if (_idleTimer >= 20000) {
        _idleTimer = 0;
        _showBanter('idle_general');
      }
    }
  }


  /* ── Camp Menu ──────────────────────────────────────── */
  function openCampMenu() {
    if (typeof UI !== 'undefined') UI.hideAllOverlays();
    if (MapEngine.isRunning()) MapEngine.stop();
    _toggleDpad(false);
    const el = document.getElementById('camp-menu');
    if (!el) return;
    // World Map locked until arc 1 boss is defeated (arcIdx > 0)
    const worldMapBtn = el.querySelector('.camp-btn-worldmap');
    if (worldMapBtn) {
      const unlocked = typeof Story !== 'undefined' && (
        Story.arcIdx > 0 ||
        ['arc_end', 'world_map', 'epilogue'].includes(Story.phase)
      );
      worldMapBtn.disabled = !unlocked;
      worldMapBtn.title = unlocked ? '' : 'Defeat the first boss to unlock the World Map';
      worldMapBtn.style.opacity = unlocked ? '' : '0.35';
      worldMapBtn.style.cursor = unlocked ? '' : 'not-allowed';
    }
    el.style.display = 'flex';
    if (typeof Focus !== 'undefined') {
      Focus.setContext('camp-menu');
    }
    const bond = _checkBonds();
    _renderCampRoster(bond);
  }

  function closeCampMenu() {
    const el = document.getElementById('camp-menu');
    if (el) el.style.display = 'none';
    _toggleDpad(true);
    if (typeof Focus !== 'undefined') {
      Focus.setContext(null);
    }
    MapEngine.resume();
    
    // Trigger camp-close banter
    _showBanter('camp_close_general');
  }


  function campWorldMap() {
    // Locked until arc 1 boss beaten
    if (typeof Story !== 'undefined' && Story.arcIdx === 0 &&
        !['arc_end', 'world_map', 'epilogue'].includes(Story.phase)) return;
    const el = document.getElementById('camp-menu');
    if (el) el.style.display = 'none';
    // Return to world map without advancing the story chapter
    MapEngine.stop();
    if (typeof _dockPersistentBtns === 'function') _dockPersistentBtns(false);
    G.mode = 'story';
    if (typeof Story !== 'undefined' && Story._showWorldMap) Story._showWorldMap();
    else showScreen('map-screen');
  }

  function campChangeParty() {
    // Hide camp menu without resuming the engine — party swap takes over
    const el = document.getElementById('camp-menu');
    if (el) el.style.display = 'none';
    if (typeof openPartySwap === 'function') {
      // Reopen camp menu when party swap closes (confirm or ✕)
      openPartySwap(() => openCampMenu());
    }
  }

  function campHeal() {
    if (!G || !G.party) return;
    G.party.forEach(m => {
      if (!m) return;
      m.hp = m.maxHp;
      m.mp = m.maxMp;
      m.isKO = false;
    });
    _updatePartyHUD();
    MapEngine.resetFog(); // resting clears the darkness
    showMsg('💊 Party healed — darkness lifted!', 1800);
    closeCampMenu();
  }

  function campSave() {
    pauseSave();
    closeCampMenu();
  }

  function campRelics() {
    const campEl = document.getElementById('camp-menu');
    if (campEl) campEl.style.display = 'none';
    _renderRelicPanel();
    const panel = document.getElementById('relic-panel');
    if (panel) panel.style.display = 'flex';
  }

  function closeRelics() {
    const panel = document.getElementById('relic-panel');
    if (panel) panel.style.display = 'none';
    const campEl = document.getElementById('camp-menu');
    if (campEl) campEl.style.display = 'flex';
    if (typeof Focus !== 'undefined') {
      Focus.setContext('camp-menu');
    }
  }

  function _checkCriteria(criteria) {
    if (!criteria) return true;
    if (criteria.minLevel) {
      const avgLv = G.party.reduce((s, m) => s + (m.lv || 1), 0) / Math.max(1, G.party.length);
      if (avgLv < criteria.minLevel) return false;
    }
    if (criteria.mapCleared && !(G.clearedMaps || []).includes(criteria.mapCleared)) return false;
    return true;
  }

  function _checkBonds() {
    const btn = document.getElementById('camp-btn-bond');
    if (!btn || typeof BOND_DATA === 'undefined') return null;
    
    const activeIds = G.party.map(m => m.charId);
    for (const pair of BOND_DATA.pairs) {
      if (pair.chars.every(c => activeIds.includes(c))) {
        const currentTier = G.bondProgress[pair.id] || 0;
        if (currentTier < pair.tiers.length) {
          const tier = pair.tiers[currentTier];
          if (_checkCriteria(tier.criteria)) {
            btn.style.display = 'flex';
            return { pair, tier };
          }
        }
      }
    }
    btn.style.display = 'none';
    return null;
  }

  function _renderCampRoster(bondAvailable) {
    const rosterEl = document.getElementById('camp-roster');
    if (!rosterEl) return;
    rosterEl.innerHTML = '';
    
    G.party.forEach(member => {
      const char = (G.chars || []).find(c => c.id === member.charId);
      if (!char) return;
      const card = document.createElement('div');
      card.className = 'camp-char-card';
      
      const hasSpark = bondAvailable && bondAvailable.pair.chars.includes(member.charId);
      
      card.innerHTML = `
        <div class="ccc-portrait" style="background-color: ${char.portrait_color || '#333'}">
          <span class="ccc-icon">${char.icon}</span>
          ${hasSpark ? '<div class="ccc-spark pulse">✨</div>' : ''}
        </div>
        <div class="ccc-name">${char.name}</div>
      `;
      rosterEl.appendChild(card);
    });
  }

  function campTalk() {
    const bond = _checkBonds();
    if (!bond) return;

    closeCampMenu();
    const lines = bond.tier.dialogue.map(d => ({ speaker: d.speaker, text: d.text }));

    if (typeof MapEngine !== 'undefined' && MapEngine.openDialogue) {
      MapEngine.openDialogue(lines, () => {
        // Advance tier
        G.bondProgress[bond.pair.id] = (G.bondProgress[bond.pair.id] || 0) + 1;

        // Store and apply reward
        if (bond.tier.reward) {
          G.earnedBondRewards = G.earnedBondRewards || [];
          G.earnedBondRewards.push({ pairId: bond.pair.id, reward: bond.tier.reward });
          if (typeof applyBondRewards === 'function') applyBondRewards();
        }

        showMsg(`✦ Bond Resonance Up: ${bond.tier.title}!`, 2500);
        if (bond.tier.reward) showMsg(`✦ ${bond.tier.reward.label} unlocked!`, 2200);

        if (typeof Save !== 'undefined' && Save.patch) {
          Save.patch({ bondProgress: G.bondProgress, earnedBondRewards: G.earnedBondRewards });
        }

        // CRITICAL: Restart the engine loop stopped by openDialogue
        MapEngine.resume();
      });
    }
  }

  /* ── Bond Panel ─────────────────────────────────────────── */
  const _BOND_COLORS = {
    aya: '#7dd3fc', tao: '#ef4444', lulu: '#2dd4bf', rei: '#4ade80',
    ria: '#a78bfa', valka: '#e879f9', drake: '#0ea5e9', rex: '#fbbf24', sera: '#93c5fd',
  };

  function openBondPanel() {
    const campEl = document.getElementById('camp-menu');
    if (campEl) campEl.style.display = 'none';
    const panel = document.getElementById('bond-panel');
    if (!panel) return;
    _renderBondPanel();
    panel.style.display = 'flex';
    if (typeof Focus !== 'undefined') Focus.setContext('bond-panel');
  }

  function closeBondPanel() {
    const panel = document.getElementById('bond-panel');
    if (panel) panel.style.display = 'none';
    const campEl = document.getElementById('camp-menu');
    if (campEl) campEl.style.display = 'flex';
    if (typeof Focus !== 'undefined') Focus.setContext('camp-menu');
  }

  function _renderBondPanel() {
    const list = document.getElementById('bond-pairs-list');
    if (!list || typeof BOND_DATA === 'undefined') return;
    list.innerHTML = '';

    const activeIds = (G.party || []).map(m => m.charId);
    const progress = G.bondProgress || {};
    const earned = G.earnedBondRewards || [];

    BOND_DATA.pairs.forEach(pair => {
      const currentTier = progress[pair.id] || 0;
      const totalTiers = pair.tiers.length;
      const isComplete = currentTier >= totalTiers;
      const inParty = pair.chars.every(id => activeIds.includes(id));
      const nextTier = !isComplete ? pair.tiers[currentTier] : null;
      const isAvailable = !!(nextTier && inParty && _checkCriteria(nextTier.criteria));

      // Character portrait pair
      const charPair = pair.chars.map(id => {
        const ch = (G.chars || []).find(c => c.id === id);
        const col = _BOND_COLORS[id] || '#888';
        return `<div class="bp-char">
          <div class="bp-avatar" style="border-color:${col};box-shadow:0 0 8px ${col}44">
            <span style="font-size:22px">${ch?.icon || '?'}</span>
          </div>
          <div class="bp-char-name" style="color:${col}">${ch?.name || id}</div>
        </div>`;
      }).join('<div class="bp-link">✦</div>');

      // Tier pips
      const pips = Array.from({ length: totalTiers }, (_, i) =>
        `<div class="bp-pip${i < currentTier ? ' filled' : ''}"></div>`
      ).join('');

      // Earned reward tags
      const earnedForPair = earned.filter(e => e.pairId === pair.id);
      const rewardTags = earnedForPair.map(e =>
        `<span class="bp-reward">${e.reward.label}</span>`
      ).join('');

      // Next criteria line
      let nextInfo = '';
      if (nextTier && !isAvailable) {
        const c = nextTier.criteria || {};
        const parts = [];
        if (c.minLevel) parts.push(`Lv ${c.minLevel}+`);
        if (c.mapCleared) parts.push(c.mapCleared.replace(/_/g, ' '));
        nextInfo = `<div class="bp-next-req">Requires: ${parts.join(' · ')}</div>`;
      }

      const card = document.createElement('div');
      card.className = [
        'bp-card',
        isComplete  ? 'bp-complete'  : '',
        isAvailable ? 'bp-available' : '',
        !inParty    ? 'bp-inactive'  : '',
      ].filter(Boolean).join(' ');

      card.innerHTML = `
        <div class="bp-chars-row">${charPair}</div>
        <div class="bp-info">
          <div class="bp-tier-label">${isComplete ? '★ BOND COMPLETE' : `Tier ${currentTier} / ${totalTiers}`}</div>
          <div class="bp-pips">${pips}</div>
          ${nextTier ? `<div class="bp-tier-name">${isAvailable ? '✨ ' : ''}${nextTier.title}</div>` : ''}
          ${isAvailable ? '<div class="bp-cta">Ready — rest at camp!</div>' : nextInfo}
          ${rewardTags ? `<div class="bp-rewards">${rewardTags}</div>` : ''}
          ${!inParty ? '<div class="bp-absent">Not in current party</div>' : ''}
        </div>
      `;
      list.appendChild(card);
    });
  }

  function _renderRelicPanel() {
    const owned   = G.ownedRelics  || [];
    const active  = G.activeRelics || [];
    const defs    = G.relics       || [];

    // ── Slots row ──
    const slotsEl = document.getElementById('relic-slots');
    if (slotsEl) {
      slotsEl.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const slotId = active[i];
        const def    = slotId ? defs.find(r => r.id === slotId) : null;
        const slot   = document.createElement('div');
        slot.className = def ? 'relic-slot filled' : 'relic-slot';
        if (def) {
          slot.innerHTML = `<div class="relic-slot-icon">${def.icon}</div><div class="relic-slot-name">${def.name}</div>`;
          slot.title = `Unequip ${def.name}`;
          slot.addEventListener('click', () => { _unequipRelic(slotId); _renderRelicPanel(); });
        } else {
          slot.innerHTML = `<div style="font-size:18px;opacity:.3">○</div><div>empty</div>`;
        }
        slotsEl.appendChild(slot);
      }
    }

    // ── Owned list ──
    const listEl = document.getElementById('relic-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    listEl.className = 'relic-grid'; // Use the new grid layout

    if (!owned.length) {
      listEl.innerHTML = '<div style="font-size:11px;color:rgba(144,128,255,0.4);text-align:center;padding:40px;grid-column:1/-1">No relics found yet — defeat bosses and explore.</div>';
      return;
    }

    owned.forEach(id => {
      const def = defs.find(r => r.id === id);
      if (!def) return;
      const isEquipped = active.includes(id);
      const rarityClass = def.rarity || 'common';
      
      const card = document.createElement('div');
      card.className = `relic-card ${rarityClass}${isEquipped ? ' equipped' : ''}`;
      
      card.innerHTML = `
        ${isEquipped ? '<div class="active-tag">Active</div>' : ''}
        <div class="relic-icon">${def.icon}</div>
        <div class="relic-name">${def.name}</div>
        <div class="relic-desc">${def.bonusText || ''}<br><small style="opacity:0.5; font-style:italic; margin-top:4px; display:block">${def.flavour || ''}</small></div>
        ${!isEquipped && active.length < 3 ? '<div style="font-size:10px; color:var(--gold); border-top:1px solid rgba(255,255,255,0.1); padding-top:8px; margin-top:4px; cursor:pointer">Click to Equip</div>' : ''}
      `;
      
      card.addEventListener('click', () => {
        if (isEquipped) {
          _unequipRelic(id);
        } else if (active.length < 3) {
          G.activeRelics.push(id);
          if (typeof SFX !== 'undefined') SFX.click();
        }
        _renderRelicPanel();
      });
      listEl.appendChild(card);
    });
  }

  function _unequipRelic(id) {
    G.activeRelics = (G.activeRelics || []).filter(r => r !== id);
  }

  /* ── Legacy canvas overlay (no-op — DOM HUD is used) ─── */
  // Kept so any existing code calling MapUI.render() won't break.
  function render(ctx, cw, ch) { /* DOM HUD renders instead */ }

  // Escape key handled by FocusManager/Input intents now
  /*
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const el = document.getElementById('map-pause-menu');
      if (el && el.style.display !== 'none') { closePauseMenu(); e.preventDefault(); }
    }
  });
  */

  return {
    showMsg,
    showMapBanner,
    triggerDanger,
    handleTouch,
    cycleCharacter,
    update,
    render,
    openPauseMenu,
    closePauseMenu,
    pauseSave,
    openCampMenu,
    closeCampMenu,
    campWorldMap,
    campChangeParty,
    campTalk,
    campHeal,
    campSave,
    campRelics,
    closeRelics,
    openBondPanel,
    closeBondPanel,
    triggerBanter: _showBanter,
  };
})();
