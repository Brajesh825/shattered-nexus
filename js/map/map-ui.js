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
        const clockEl = document.getElementById('explore-hud-clock');
        if (clockEl) {
          const phase = ChronosEngine.getPhase();
          const label = (typeof ChronosEngine.getPhaseLabel === 'function')
            ? ChronosEngine.getPhaseLabel()
            : phase;
          clockEl.textContent = `🕰️ ${ChronosEngine.formatTime()} — ${label}`;
          clockEl.dataset.phase = phase;
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

  let _selectedWeaponsCharId = null;
  let _selectedWeaponToUpgrade = null;

  function campWeapons() {
    const campEl = document.getElementById('camp-menu');
    if (campEl) campEl.style.display = 'none';
    
    if (!_selectedWeaponsCharId && G.party.length > 0) {
      _selectedWeaponsCharId = G.party[0].charId;
    }
    
    _renderWeaponsPanel();
    const panel = document.getElementById('weapons-panel');
    if (panel) panel.style.display = 'flex';
  }

  function closeWeapons() {
    const panel = document.getElementById('weapons-panel');
    if (panel) panel.style.display = 'none';
    const campEl = document.getElementById('camp-menu');
    if (campEl) campEl.style.display = 'flex';
    if (typeof Focus !== 'undefined') {
      Focus.setContext('camp-menu');
    }
  }

  function _renderWeaponsPanel() {
    const weapons = window.WEAPONS_DATA || [];
    const party = G.party || [];
    
    // Update live currency indicators
    const goldCountEl = document.getElementById('wp-gold-count');
    const voidCountEl = document.getElementById('wp-void-count');
    if (goldCountEl) goldCountEl.textContent = (G.gold || 0).toLocaleString();
    if (voidCountEl) voidCountEl.textContent = (G.voidFragments || 0).toString();

    const selectorEl = document.getElementById('weapon-char-selector');
    if (selectorEl) {
      selectorEl.innerHTML = '';
      party.forEach(m => {
        const tab = document.createElement('div');
        const isSelected = m.charId === _selectedWeaponsCharId;
        tab.className = isSelected ? 'weapon-char-tab active' : 'weapon-char-tab';
        
        const avatar = m.char?.icon || '👥';
        tab.innerHTML = `
          <span style="font-size: 20px; margin-right: 8px;">${avatar}</span>
          <span>${m.displayName}</span>
        `;
        
        tab.addEventListener('click', () => {
          _selectedWeaponsCharId = m.charId;
          _selectedWeaponToUpgrade = null; // reset to equipped
          if (typeof SFX !== 'undefined') SFX.click();
          _renderWeaponsPanel();
        });
        selectorEl.appendChild(tab);
      });
    }

    const member = party.find(m => m.charId === _selectedWeaponsCharId);
    if (!member) return;

    const equippedId = member.char.equippedWeapon;
    const equippedDef = weapons.find(w => w.id === equippedId);

    // Initialize or fallback selected upgrade weapon
    if (!_selectedWeaponToUpgrade) {
      _selectedWeaponToUpgrade = equippedDef || weapons.find(w => w.resonance?.charId === member.charId) || weapons[0];
    } else {
      const stillExists = weapons.find(w => w.id === _selectedWeaponToUpgrade.id);
      if (stillExists) _selectedWeaponToUpgrade = stillExists;
    }

    // Dynamic stats computation helper based on level/tier
    const getUpgradedStats = (wDef) => {
      if (!G.weaponsLevels) G.weaponsLevels = {};
      if (!G.weaponsUpgrades) G.weaponsUpgrades = {};
      const level = G.weaponsLevels[wDef.id] || 1;
      const tier = G.weaponsUpgrades[wDef.id] || wDef.rarity || 'rare';
      const growth = { hp: 8, mp: 2, atk: 4, def: 2, spd: 1, mag: 3, lck: 1 };
      
      const upgraded = {};
      Object.entries(wDef.stats || {}).forEach(([s, baseVal]) => {
        let val = baseVal;
        if (growth[s]) {
          val += growth[s] * (level - 1);
        }
        if (tier === 'epic') val = Math.floor(val * 1.25);
        if (tier === 'legendary') val = Math.floor(val * 1.5);
        upgraded[s] = val;
      });
      return upgraded;
    };

    const equippedSection = document.getElementById('weapon-equipped-section');
    if (equippedSection) {
      equippedSection.innerHTML = '';
      
      if (equippedDef) {
        const activeStats = getUpgradedStats(equippedDef);
        const statsHtml = Object.entries(activeStats).map(([s, val]) => `
          <div class="wp-stat-chip">
            <span style="opacity:0.6">${s.toUpperCase()}</span> <span>+${val}</span>
          </div>
        `).join('');

        const eqLvl = G.weaponsLevels[equippedDef.id] || 1;
        const eqTier = G.weaponsUpgrades[equippedDef.id] || equippedDef.rarity || 'rare';
        
        equippedSection.innerHTML = `
          <div class="relic-card ${eqTier} equipped" style="width: 100%; max-width: 400px; cursor: pointer;">
            <div class="active-tag">Equipped</div>
            <div class="relic-icon">${equippedDef.icon}</div>
            <div class="relic-name">${equippedDef.name}</div>
            <div style="font-size:10px; font-weight:800; color:#38bdf8; margin-top:-6px; margin-bottom:8px; text-transform:uppercase;">Lv. ${eqLvl} Refined ${eqTier}</div>
            <div class="relic-desc">
              <div style="opacity:0.85; margin-bottom:10px; font-size:12px;">${equippedDef.description}</div>
              
              <div class="wp-stats-row">${statsHtml}</div>
              
              <div class="wp-passive-box">
                <span class="wp-passive-title">✨ PASSIVE: ${equippedDef.passive.name}</span>
                <span>${equippedDef.passive.description}</span>
              </div>
              
              ${equippedDef.resonance ? `
                <div class="wp-resonance-box active">
                  <span class="wp-resonance-title">💖 RESONANCE: ${member.displayName}</span>
                  <span>${equippedDef.resonance.description}</span>
                </div>
              ` : ''}
            </div>
            <div class="wp-action-hint unequip">Click to Unequip</div>
          </div>
        `;
        
        equippedSection.querySelector('.relic-card').addEventListener('click', (e) => {
          _selectedWeaponToUpgrade = equippedDef;
          const isUnequipClick = e.target.classList.contains('unequip') || e.target.textContent.includes('Unequip');
          if (isUnequipClick) {
            member.char.equippedWeapon = null;
            member.equippedWeapon = null;
            if (typeof rebuildMemberCombatStats !== 'undefined') {
              rebuildMemberCombatStats(member, { resourceStrategy: 'clamp' });
            }
          }
          if (typeof SFX !== 'undefined') SFX.click();
          _renderWeaponsPanel();
          _updatePartyHUD();
        });
      } else {
        equippedSection.innerHTML = `
          <div class="relic-card" style="width: 100%; max-width: 400px; padding: 40px; text-align: center; border: 2px dashed rgba(255,255,255,0.06); background: rgba(0,0,0,0.15); display:flex; flex-direction:column; justify-content:center; align-items:center; border-radius:16px; height:100%;">
            <div style="font-size: 36px; opacity: 0.15; margin-bottom: 12px; filter: grayscale(100%);">⚔️</div>
            <div style="font-size: 13px; color: rgba(255,255,255,0.3); font-weight:500;">No Weapon Equipped</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.2); margin-top:4px;">Select an armament below to equip</div>
          </div>
        `;
      }
    }

    // CAMPFIRE FORGE LOGIC (Integrated Level Up & Ascension Breakthrough)
    const forgeEl = document.getElementById('weapon-forge-section');
    if (forgeEl) {
      forgeEl.innerHTML = '';
      if (!_selectedWeaponToUpgrade) {
        forgeEl.innerHTML = `<div style="font-size:11px;color:rgba(255,255,255,0.3);display:flex;align-items:center;height:100%;">Select an armament from the grid to upgrade/reforge at the campfire forge.</div>`;
      } else {
        const w = _selectedWeaponToUpgrade;
        if (!G.weaponsLevels) G.weaponsLevels = {};
        if (!G.weaponsUpgrades) G.weaponsUpgrades = {};
        
        const level = G.weaponsLevels[w.id] || 1;
        const rarity = G.weaponsUpgrades[w.id] || w.rarity || 'rare';
        
        const getElementalMaterial = (elem, lvl) => {
          const isTier2 = lvl >= 10;
          if (elem === 'ice') {
            return isTier2 ? { id: 'glacial_prism', name: 'Glacial Prism', icon: '💎' } : { id: 'ice_shard', name: 'Ice Shard', icon: '❄️' };
          } else if (elem === 'fire') {
            return isTier2 ? { id: 'phoenix_hearth', name: 'Phoenix Hearth', icon: '❤️' } : { id: 'ember_shard', name: 'Ember Shard', icon: '🔥' };
          } else if (elem === 'wind') {
            return isTier2 ? { id: 'tornado_core', name: 'Tornado Core', icon: '🌀' } : { id: 'gale_feather', name: 'Gale Feather', icon: '🪶' };
          } else if (elem === 'water') {
            return isTier2 ? { id: 'oceanic_pearl', name: 'Oceanic Pearl', icon: '🦪' } : { id: 'tide_shell', name: 'Tide Shell', icon: '🐚' };
          } else {
            return isTier2 ? { id: 'void_catalyst', name: 'Void Catalyst', icon: '🔮' } : { id: 'void_dust', name: 'Void Dust', icon: '🌫️' };
          }
        };

        const getInventoryQty = (itemId) => {
          const stack = G.inventory ? G.inventory.find(i => i.itemId === itemId) : null;
          return stack ? stack.qty : 0;
        };

        // Level Up Cost calculations
        const refGoldCost = level < 10 ? level * 50 : 500 + (level - 10) * 150;
        const refMat = getElementalMaterial(w.element || 'void', level);
        const refMatCost = level < 10 ? level * 2 : (level - 10) * 2;
        
        const hasRefGold = (G.gold || 0) >= refGoldCost;
        const hasRefMat = getInventoryQty(refMat.id) >= refMatCost;
        const isLevelLocked = (level === 10 && rarity === 'rare');
        const isLevelMaxed = level >= 20;
        const canLevelUp = hasRefGold && hasRefMat && !isLevelLocked && !isLevelMaxed;
        
        // Ascension Breakthrough calculations
        const ascGoldCost = 2500;
        const ascFragsCost = rarity === 'rare' ? 3 : 5;
        const ascMat = getElementalMaterial(w.element || 'void', rarity === 'rare' ? 1 : 10);
        const ascMatCost = 25;
        
        const hasAscGold = (G.gold || 0) >= ascGoldCost;
        const hasAscFrags = (G.voidFragments || 0) >= ascFragsCost;
        const hasAscMat = getInventoryQty(ascMat.id) >= ascMatCost;
        const isAscEligible = (level === 10 && rarity === 'rare') || (level === 20 && rarity === 'epic');
        const canAscend = hasAscGold && hasAscFrags && hasAscMat && isAscEligible;

        const nextRarity = rarity === 'rare' ? 'epic' : 'legendary';

        let actionHtml = '';
        
        if (rarity === 'legendary' && level >= 20) {
          actionHtml = `
            <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; width:100%;">
              <div style="font-size:24px; margin-bottom:6px;">${w.icon}</div>
              <div style="font-weight:700; color:#fbbf24; font-size:12px; margin-bottom:4px;">${w.name}</div>
              <div style="font-size:10px; color:#f472b6; text-shadow:0 0 10px rgba(244,114,182,0.4); font-weight:700; letter-spacing:1.5px; margin-bottom:6px;">✦ ZENITH TIER REACHED ✦</div>
              <div style="font-size:10px; color:rgba(255,255,255,0.4); text-align:center;">This weapon has been forged to its absolute peak capability (Lv. 20 Legendary).</div>
            </div>
          `;
        } else {
          const goldColorRef = hasRefGold ? '#fbbf24' : '#ef4444';
          const matColorRef = hasRefMat ? '#4ade80' : '#ef4444';
          
          const goldColorAsc = hasAscGold ? '#fbbf24' : '#ef4444';
          const fragColorAsc = hasAscFrags ? '#c084fc' : '#ef4444';
          const matColorAsc = hasAscMat ? '#4ade80' : '#ef4444';

          actionHtml = `
            <div style="width:100%; display:flex; flex-direction:column; gap:12px; box-sizing:border-box; padding:6px 0;">
              <div style="text-align:center; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:8px; margin-bottom:2px; display:flex; justify-content:center; align-items:center; gap:8px;">
                <span style="font-size:11px; font-weight:700; color:#cbd5e1;">REFORGING TARGET: </span>
                <span style="color:#00ddff; font-weight:700; font-size:11px;">${w.name}</span>
                <span style="font-size:9px; padding:2px 8px; border-radius:10px; font-weight:800; background:rgba(255,255,255,0.08); color:#f472b6; border:1px solid rgba(244,114,182,0.2); text-transform:uppercase;">
                  Lv. ${level} · ${rarity}
                </span>
              </div>
              
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; width:100%;">
                
                <!-- LEVEL UP COLUMN -->
                <div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.04); border-radius:12px; padding:10px; display:flex; flex-direction:column; justify-content:space-between; align-items:center; text-align:center; min-height:165px; box-sizing:border-box;">
                  <div style="width:100%;">
                    <div style="font-size:10px; font-weight:800; color:#38bdf8; letter-spacing:1px; margin-bottom:8px; text-shadow:0 0 8px rgba(56,189,248,0.2);">🔨 WEAPON REFINING</div>
                    ${isLevelMaxed ? `
                      <div style="font-size:11px; color:#a855f7; font-weight:700; margin:30px 0;">MAX LEVEL REACHED</div>
                    ` : isLevelLocked ? `
                      <div style="font-size:9px; color:#ef4444; font-weight:700; margin:16px 0; background:rgba(239,68,68,0.08); padding:6px; border-radius:6px; border:1px solid rgba(239,68,68,0.2); line-height:1.3;">
                        🔒 LEVEL 10 LOCKED<br><span style="font-size:8px; opacity:0.8; font-weight:500;">ASCENSION REQUIRED TO UNLOCK</span>
                      </div>
                    ` : `
                      <div style="font-size:13px; font-weight:800; color:#fff; margin-bottom:8px;">
                        Lv. ${level} <span style="color:#38bdf8; font-size:11px;">➔</span> Lv. ${level + 1}
                      </div>
                      <div style="display:flex; flex-direction:column; gap:4px; font-size:9px; width:100%; text-align:left; background:rgba(0,0,0,0.25); padding:6px 8px; border-radius:8px; box-sizing:border-box; border:1px solid rgba(255,255,255,0.02)">
                        <div style="display:flex; justify-content:space-between; color:${goldColorRef}; font-weight:700;">
                          <span>💰 Gold Cost:</span>
                          <span>${refGoldCost} / ${G.gold || 0}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; color:${matColorRef}; font-weight:700;">
                          <span>${refMat.icon} ${refMat.name}:</span>
                          <span>${refMatCost} / ${getInventoryQty(refMat.id)}</span>
                        </div>
                      </div>
                    `}
                  </div>
                  
                  <button class="camp-btn" id="btn-forge-level" style="margin:8px 0 0 0; padding:6px 10px; font-size:9px; border-radius:20px; width:100%; background:${canLevelUp ? 'linear-gradient(135deg, #0ea5e9, #2563eb)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${canLevelUp ? '#38bdf8' : 'rgba(255,255,255,0.08)'}; color:${canLevelUp ? '#fff' : 'rgba(255,255,255,0.2)'}; ${canLevelUp ? 'cursor:pointer' : 'cursor:not-allowed'}; font-weight:800; height:28px;" ${canLevelUp ? '' : 'disabled'}>
                    REFINE WEAPON
                  </button>
                </div>
                
                <!-- ASCENSION COLUMN -->
                <div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.04); border-radius:12px; padding:10px; display:flex; flex-direction:column; justify-content:space-between; align-items:center; text-align:center; min-height:165px; box-sizing:border-box;">
                  <div style="width:100%;">
                    <div style="font-size:10px; font-weight:800; color:#c084fc; letter-spacing:1px; margin-bottom:8px; text-shadow:0 0 8px rgba(192,132,252,0.2);">🔮 VOID ASCENSION</div>
                    ${rarity === 'legendary' ? `
                      <div style="font-size:11px; color:#fbbf24; font-weight:700; margin:30px 0;">MAX TIER REACHED</div>
                    ` : !isAscEligible ? `
                      <div style="font-size:9px; color:rgba(255,255,255,0.35); font-weight:500; margin:22px 0; line-height:1.4; padding:0 4px;">
                        🔒 Breakthrough unlocks at Level ${rarity === 'rare' ? '10' : '20'}.
                      </div>
                    ` : `
                      <div style="font-size:10px; font-weight:800; color:#e2e8f0; margin-bottom:8px; text-transform:uppercase;">
                        ${rarity} <span style="color:#c084fc; font-size:10px;">➔</span> <span style="color:#f472b6; font-weight:900;">${nextRarity}</span>
                      </div>
                      <div style="display:flex; flex-direction:column; gap:4px; font-size:9px; width:100%; text-align:left; background:rgba(0,0,0,0.25); padding:6px 8px; border-radius:8px; box-sizing:border-box; border:1px solid rgba(255,255,255,0.02)">
                        <div style="display:flex; justify-content:space-between; color:${goldColorAsc}; font-weight:700;">
                          <span>💰 Gold:</span>
                          <span>${ascGoldCost} / ${G.gold || 0}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; color:${fragColorAsc}; font-weight:700;">
                          <span>🔮 Fragments:</span>
                          <span>${ascFragsCost} / ${G.voidFragments || 0}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; color:${matColorAsc}; font-weight:700;">
                          <span>${ascMat.icon} ${ascMat.name}:</span>
                          <span>${ascMatCost} / ${getInventoryQty(ascMat.id)}</span>
                        </div>
                      </div>
                    `}
                  </div>
                  
                  <button class="camp-btn" id="btn-forge-ascend" style="margin:8px 0 0 0; padding:6px 10px; font-size:9px; border-radius:20px; width:100%; background:${canAscend ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${canAscend ? '#f472b6' : 'rgba(255,255,255,0.08)'}; color:${canAscend ? '#fff' : 'rgba(255,255,255,0.2)'}; ${canAscend ? 'cursor:pointer' : 'cursor:not-allowed'}; font-weight:800; height:28px;" ${canAscend ? '' : 'disabled'}>
                    ASCEND TIER
                  </button>
                </div>
                
              </div>
            </div>
          `;
        }

        forgeEl.innerHTML = actionHtml;

        // Wire level-up handler
        const btnLevel = forgeEl.querySelector('#btn-forge-level');
        if (btnLevel && canLevelUp) {
          btnLevel.addEventListener('click', () => {
            G.gold -= refGoldCost;
            if (G.party) G.party.forEach(m => m.gold = G.gold);
            removeFromInventory(refMat.id, refMatCost);
            
            G.weaponsLevels[w.id] = level + 1;

            // Recompute combat stats
            const eqMember = G.party.find(m => m.char.equippedWeapon === w.id);
            if (eqMember) {
              eqMember.equippedWeapon = w;
              if (typeof rebuildMemberCombatStats !== 'undefined') {
                rebuildMemberCombatStats(eqMember, { resourceStrategy: 'clamp' });
              }
            }

            if (typeof SFX !== 'undefined' && SFX.victory) SFX.victory();
            MapUI.showMsg(`✦ Refined ${w.name} to Level ${level + 1}! ✦`, 2200);
            
            _renderWeaponsPanel();
            _updatePartyHUD();
          });
        }

        // Wire ascend breakthrough handler
        const btnAscend = forgeEl.querySelector('#btn-forge-ascend');
        if (btnAscend && canAscend) {
          btnAscend.addEventListener('click', () => {
            G.gold -= ascGoldCost;
            if (G.party) G.party.forEach(m => m.gold = G.gold);
            G.voidFragments -= ascFragsCost;
            removeFromInventory(ascMat.id, ascMatCost);
            
            G.weaponsUpgrades[w.id] = nextRarity;
            w.rarity = nextRarity; // Keep backwards compatibility

            // Recompute combat stats
            const eqMember = G.party.find(m => m.char.equippedWeapon === w.id);
            if (eqMember) {
              eqMember.equippedWeapon = w;
              if (typeof rebuildMemberCombatStats !== 'undefined') {
                rebuildMemberCombatStats(eqMember, { resourceStrategy: 'clamp' });
              }
            }

            if (typeof SFX !== 'undefined' && SFX.victory) SFX.victory();
            MapUI.showMsg(`✦ ASCENDED ${w.name} to ${nextRarity.toUpperCase()} Tier! ✦`, 2800);
            
            _renderWeaponsPanel();
            _updatePartyHUD();
          });
        }
      }
    }

    const listEl = document.getElementById('weapon-list');
    if (listEl) {
      listEl.innerHTML = '';
      listEl.className = 'relic-grid';
      
      const currentEquippedId = member.char.equippedWeapon;
      
      // Filter list so only unlocked weapons are visible in Beta 1.0
      const unlockedWeapons = weapons.filter(w => {
        const isEquippedHere = w.id === currentEquippedId;
        const isEquippedByOther = party.some(m => m.charId !== member.charId && m.char.equippedWeapon === w.id);
        const hasLevel = G.weaponsLevels && G.weaponsLevels[w.id] !== undefined;
        const belongsToRecruit = G.chars && G.chars.some(c => c.equippedWeapon === w.id && (G.unlockedChars || []).includes(c.id));
        return isEquippedHere || isEquippedByOther || hasLevel || belongsToRecruit;
      });

      if (!unlockedWeapons.length) {
        listEl.innerHTML = '<div style="font-size:11px;color:rgba(144,128,255,0.4);text-align:center;padding:40px;grid-column:1/-1">No weapons acquired yet. Keep exploring or complete bosses to find signature armaments!</div>';
        return;
      }
      
      unlockedWeapons.forEach(w => {
        const isEquippedHere = w.id === currentEquippedId;
        const isEquippedByOther = party.some(m => m.charId !== member.charId && m.char.equippedWeapon === w.id);
        const owner = isEquippedByOther ? party.find(m => m.char.equippedWeapon === w.id) : null;
        const isResonant = w.resonance && w.resonance.charId === member.charId;
        
        const activeStats = getUpgradedStats(w);
        const statsHtml = Object.entries(activeStats).map(([s, val]) => `
          <div class="wp-stat-chip">
            <span style="opacity:0.6">${s.toUpperCase()}</span> <span>+${val}</span>
          </div>
        `).join('');
        
        const wLvl = G.weaponsLevels[w.id] || 1;
        const wTier = G.weaponsUpgrades[w.id] || w.rarity || 'rare';

        const card = document.createElement('div');
        card.className = `relic-card ${wTier}${isEquippedHere ? ' equipped' : ''}`;
        if (isEquippedByOther) card.style.opacity = '0.45';
        
        card.innerHTML = `
          ${isEquippedHere ? '<div class="active-tag">Equipped</div>' : ''}
          ${isEquippedByOther ? `<div class="active-tag" style="background:#5ccfff; color:#050510">${owner.displayName}</div>` : ''}
          <div class="relic-icon">${w.icon}</div>
          <div class="relic-name">${w.name}</div>
          <div style="font-size:9px; font-weight:800; color:#38bdf8; margin-top:-6px; margin-bottom:8px; text-transform:uppercase;">Lv. ${wLvl} · ${wTier}</div>
          <div class="relic-desc">
            <div style="opacity:0.85; margin-bottom:10px; font-size:12px;">${w.description}</div>
            
            <div class="wp-stats-row">${statsHtml}</div>
            
            <div class="wp-passive-box">
              <span class="wp-passive-title">✨ PASSIVE: ${w.passive.name || 'Signature'}</span>
              <span>${w.passive.description}</span>
            </div>
            
            ${w.resonance && isResonant ? `
              <div class="wp-resonance-box active">
                <span class="wp-resonance-title">💖 RESONANCE ACTIVE</span>
                <span>${w.resonance.description}</span>
              </div>
            ` : w.resonance ? `
              <div class="wp-resonance-box" style="opacity:0.6">
                <span class="wp-resonance-title" style="color:#94a3b8">💖 RESONANCE BOUND</span>
                <span style="font-size:10px">Only unlocks for ${party.find(m => m.charId === w.resonance.charId)?.displayName || w.resonance.charId.toUpperCase()}</span>
              </div>
            ` : ''}
          </div>
          ${!isEquippedHere && !isEquippedByOther ? '<div class="wp-action-hint equip">Click to Equip</div>' : ''}
        `;
        
        card.addEventListener('click', () => {
          _selectedWeaponToUpgrade = w; // Set as forge target
          if (isEquippedHere) {
            member.char.equippedWeapon = null;
            member.equippedWeapon = null;
            if (typeof rebuildMemberCombatStats !== 'undefined') {
              rebuildMemberCombatStats(member, { resourceStrategy: 'clamp' });
            }
            if (typeof SFX !== 'undefined') SFX.click();
          } else if (!isEquippedByOther) {
            member.char.equippedWeapon = w.id;
            member.equippedWeapon = w;
            if (typeof rebuildMemberCombatStats !== 'undefined') {
              rebuildMemberCombatStats(member, { resourceStrategy: 'clamp' });
            }
            if (typeof SFX !== 'undefined') SFX.click();
          }
          _renderWeaponsPanel();
          _updatePartyHUD();
        });
        
        listEl.appendChild(card);
      });
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

  /* ── Weapon Acquisition Cinematic Overlay ─────────────────────── */
  let _waoCallback = null;

  function showWeaponAcquisition(weaponId, characterId, cb) {
    const overlay = document.getElementById('weapon-acquisition-overlay');
    if (!overlay) { if (cb) cb(); return; }

    _waoCallback = cb || null;

    // Resolve weapon data
    const wData = (window.WEAPONS_DATA || []).find(w => w.id === weaponId);
    if (!wData) { if (cb) cb(); return; }

    // Element theming
    const elem = (wData.element || 'void').toLowerCase();
    const elemColors = {
      wind: '#22d3ee', water: '#38bdf8', fire: '#fb923c', ice: '#7dd3fc',
      lightning: '#facc15', void: '#a78bfa', physical: '#e2e8f0'
    };
    const accentColor = elemColors[elem] || elemColors.void;
    const elemIcons = {
      wind: '🌀', water: '💧', fire: '🔥', ice: '❄️', lightning: '⚡', void: '🌑', physical: '⚔️'
    };

    // Populate: icon
    const iconEl = document.getElementById('wao-icon');
    if (iconEl) iconEl.textContent = wData.icon || elemIcons[elem] || '⚔️';

    // Name
    const nameEl = document.getElementById('wao-weapon-name');
    if (nameEl) nameEl.textContent = wData.name || weaponId;

    // Element badge
    const elemEl = document.getElementById('wao-weapon-element');
    if (elemEl) { elemEl.textContent = `${elemIcons[elem] || ''} ${elem.toUpperCase()} WEAPON`; elemEl.style.color = accentColor; }

    // Description
    const descEl = document.getElementById('wao-weapon-desc');
    if (descEl) descEl.textContent = wData.description || wData.desc || '';

    // Stats
    const statsEl = document.getElementById('wao-stats-grid');
    if (statsEl) {
      const stats = [];
      if (wData.atk   !== undefined) stats.push({ label: 'ATK',  value: `+${wData.atk}`  });
      if (wData.mag   !== undefined) stats.push({ label: 'MAG',  value: `+${wData.mag}`  });
      if (wData.def   !== undefined) stats.push({ label: 'DEF',  value: `+${wData.def}`  });
      if (wData.spd   !== undefined) stats.push({ label: 'SPD',  value: `+${wData.spd}`  });
      if (wData.hp    !== undefined) stats.push({ label: 'HP',   value: `+${wData.hp}`   });
      if (wData.mp    !== undefined) stats.push({ label: 'MP',   value: `+${wData.mp}`   });
      statsEl.innerHTML = stats.map(s =>
        `<div class="wao-stat-chip"><div class="label">${s.label}</div><div class="value" style="color:${accentColor}">${s.value}</div></div>`
      ).join('');
    }

    // Passive
    const passiveEl = document.getElementById('wao-passive-block');
    if (passiveEl) {
      const passive = wData.passive || wData.passiveSkill;
      if (passive) {
        passiveEl.style.display = '';
        passiveEl.innerHTML = `<div class="wao-passive-label">✦ PASSIVE SKILL</div><div class="wao-passive-text" style="color:hsl(275,60%,82%)">${passive.name || ''}: ${passive.desc || passive.description || ''}</div>`;
      } else {
        passiveEl.style.display = 'none';
      }
    }

    // Resonance
    const resonEl = document.getElementById('wao-resonance-block');
    if (resonEl) {
      const reson = wData.resonance || wData.characterResonance;
      if (reson) {
        resonEl.style.display = '';
        resonEl.innerHTML = `<div class="wao-resonance-label">✦ CHARACTER RESONANCE</div><div class="wao-resonance-text">${reson.name || ''}: ${reson.desc || reson.description || ''}</div>`;
      } else {
        resonEl.style.display = 'none';
      }
    }

    // Owner badge
    const ownerEl = document.getElementById('wao-owner-badge');
    if (ownerEl) {
      const charNames = { aya: 'Aya', tao: 'Tao', lulu: 'Lulu', rei: 'Rei', ria: 'Ria', valka: 'Valka', drake: 'Drake', rex: 'Rex', sera: 'Sera' };
      ownerEl.textContent = `⚔ EQUIPPED ON ${(charNames[characterId] || characterId).toUpperCase()}`;
    }

    // Set element attribute for colour overrides
    const card = overlay.querySelector('.wao-card');
    if (card) card.dataset.element = elem;

    // Show
    overlay.style.display = 'flex';
    if (typeof SFX !== 'undefined' && SFX.victory) SFX.victory();
  }

  function closeWeaponAcquisition() {
    const overlay = document.getElementById('weapon-acquisition-overlay');
    if (overlay) overlay.style.display = 'none';
    const cb = _waoCallback;
    _waoCallback = null;
    if (cb) cb();
  }

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
    campWeapons,
    closeWeapons,
    openBondPanel,
    closeBondPanel,
    triggerBanter: _showBanter,
    showWeaponAcquisition,
    closeWeaponAcquisition,
  };
})();
