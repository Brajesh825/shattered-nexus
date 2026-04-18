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

  function _toggleDpad(show) {
    const dpad = document.getElementById('joystick-container');
    if (!dpad) return;
    // Only toggle if we are actually on a touch device
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
      clearTimeout(_notifTimer);
      _notifTimer = setTimeout(() => {
        el.classList.remove('show');
        if (cb) cb();
      }, durationMs || 1200);
    } else {
      // Element not found — still fire callback so story progression isn't lost
      if (cb) setTimeout(cb, durationMs || 1200);
    }
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
    showMsg(`▶ ${G.hero?.displayName || G.hero?.charId || '?'}`, 900);
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
        const tid = map.tiles[r]?.[c] ?? 0;
        mctx.fillStyle = (TILE_DEFS[tid] || TILE_DEFS[0]).color;
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

  /* ── Map select overlay ──────────────────────────────── */
  function buildMapSelectOverlay() {
    const overlay = document.getElementById('map-select-overlay');
    if (!overlay) return;

    // Find or create the inner container (HTML has .map-sel-inner)
    let inner = overlay.querySelector('.map-sel-inner');
    if (!inner) { inner = overlay; }

    // Remove any previously injected buttons
    inner.querySelectorAll('.map-sel-btn').forEach(b => b.remove());

    Object.values(MAP_DEFS).forEach(m => {
      const btn = document.createElement('button');
      btn.className   = 'map-sel-btn';
      btn.textContent = m.name;
      btn.onclick = () => {
        overlay.style.display = 'none';
        MapEngine.start(m.id);   // loadMap inside start() updates #explore-map-name
        showMsg(`Entering ${m.name}…`, 1800);
      };
      inner.appendChild(btn);
    });
  }

  /* ── Pause Menu ─────────────────────────────────────── */
  const CHAR_COLOR_MAP = {
    ayaka:'#7dd3fc', hutao:'#ef4444', nilou:'#2dd4bf', xiao:'#4ade80',
    rydia:'#a78bfa', lenneth:'#e879f9', kain:'#0ea5e9', leon:'#fbbf24'
  };

  function openPauseMenu() {
    if (MapEngine.isRunning()) MapEngine.stop();
    _toggleDpad(false);
    _renderPauseCards();
    _renderPauseInventory();
    const el = document.getElementById('map-pause-menu');
    if (el) el.style.display = 'flex';
    // Only show save button in story mode
    const saveBtn = document.querySelector('#map-pause-menu .save-btn');
    if (saveBtn) saveBtn.style.display = (typeof Story !== 'undefined' && Story.active) ? '' : 'none';
  }

  function closePauseMenu() {
    const el = document.getElementById('map-pause-menu');
    if (el) el.style.display = 'none';
    _toggleDpad(true);
    MapEngine.resume();
  }

  function pauseSave() {
    if (typeof Story !== 'undefined' && Story.active) {
      Story._doSave();
      showMsg('💾 Progress saved!', 1800);
    } else {
      // Free explore — save minimal state to slot 0
      if (typeof Save !== 'undefined' && G.party.length) {
        const partyStats = G.party.map(m => ({
          charId: m.charId, classId: m.classId,
          lv: m.lv || 1, exp: m.exp || 0, gold: m.gold || 0,
        }));
        Save.write({
          arcIdx: 0, chapIdx: -1,
          arcName: 'Free Explore',
          selectedChars: G.selectedChars || [],
          partyStats,
          hero: { lv: G.hero?.lv || 1, exp: G.hero?.exp || 0, gold: G.hero?.gold || 0 },
          unlockedChars: G.unlockedChars || [],
          inventory: G.inventory || [],
        }, 0);
        showMsg('💾 Progress saved!', 1800);
      }
    }
  }

  function _renderPauseCards() {
    const container = document.getElementById('pause-party-cards');
    if (!container || !G || !G.party.length) return;
    container.innerHTML = '';

    G.party.forEach((m, i) => {
      if (!m) return;
      const col     = CHAR_COLOR_MAP[m.charId] || '#a090d0';
      const isKO    = !m.hp || m.isKO;
      const isActive = i === G.activePartyIdx;
      const hpPct   = Math.max(0, m.hp / m.maxHp * 100);
      const mpPct   = Math.max(0, m.mp / m.maxMp * 100);
      const hpCol   = hpPct > 50 ? '#4ade80' : hpPct > 25 ? '#eab308' : '#ef4444';
      const expNext = 30 * m.lv;

      const card = document.createElement('div');
      card.className = `pause-member${isKO ? ' ko-member' : ''}${isActive ? ' active-member' : ''}`;
      card.style.borderColor = isActive ? col : '';
      card.innerHTML = `
        <div class="pm-header">
          <span class="pm-name" style="color:${col}">${m.displayName}</span>
          <span class="pm-lv">LV ${m.lv}</span>
        </div>
        <div style="font-size:8px;color:#6060a0;margin-bottom:2px">
          ${m.cls?.name || ''} · EXP ${m.exp}/${expNext}
        </div>
        <div class="pm-hp-bar-bg">
          <div class="pm-hp-bar-fill" style="width:${hpPct}%;background:${hpCol}"></div>
        </div>
        <div style="font-size:8px;color:#a0a0c0;text-align:right">${m.hp}/${m.maxHp} HP</div>
        <div class="pm-mp-bar-bg">
          <div class="pm-mp-bar-fill" style="width:${mpPct}%"></div>
        </div>
        <div style="font-size:8px;color:#6080c0;text-align:right">${m.mp}/${m.maxMp} MP</div>
        <div class="pm-stats">
          <div>ATK <span>${m.atk}</span></div>
          <div>DEF <span>${m.def}</span></div>
          <div>MAG <span>${m.mag}</span></div>
          <div>SPD <span>${m.spd}</span></div>
          <div>Gold <span>${m.gold || 0}</span></div>
          ${isKO ? '<div style="color:#ef4444">FALLEN</div>' : '<div style="color:#4ade80">OK</div>'}
        </div>
        ${m.passive ? `<div class="pm-passive">★ ${m.passive.name}: ${m.passive.description}</div>` : ''}
      `;
      container.appendChild(card);
    });
  }

  function _renderPauseInventory() {
    const grid = document.getElementById('pause-inv-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!G.inventory || !G.inventory.length) {
      grid.innerHTML = '<div class="pause-inv-empty">No items in bag.</div>';
      return;
    }

    G.inventory.forEach(stack => {
      const def = G.items?.find(i => i.id === stack.itemId);
      if (!def) return;
      const isMapUsable = def.usable_in && def.usable_in.includes('map');
      const slot = document.createElement('div');
      slot.className = 'pause-inv-slot' + (isMapUsable ? ' map-usable' : '');
      slot.title = def.description;
      slot.innerHTML = `${def.icon} ${def.name} <span class="pi-qty">×${stack.qty}</span>`;
      if (isMapUsable) {
        slot.onclick = () => _onMapItemClick(def);
      }
      grid.appendChild(slot);
    });
  }

  function _onMapItemClick(def) {
    // Remove any existing picker first
    const existing = document.getElementById('map-item-picker');
    if (existing) existing.remove();

    const effects = def.effects || [];
    const needsTarget = effects.some(e => e.target === 'single');

    if (!needsTarget) {
      // Apply to all party members immediately
      _applyMapItem(def, null);
    } else {
      _showMapItemTargetPicker(def);
    }
  }

  function _showMapItemTargetPicker(def) {
    const grid = document.getElementById('pause-inv-grid');
    if (!grid) return;

    const picker = document.createElement('div');
    picker.id = 'map-item-picker';
    picker.className = 'map-item-picker';
    picker.innerHTML = `<div class="mip-title">Use ${def.icon} ${def.name} on:</div>`;

    G.party.forEach((m, i) => {
      if (!m) return;
      const col = CHAR_COLOR_MAP[m.charId] || '#a090d0';
      const isKO = !m.hp || m.isKO;
      const hpPct = Math.max(0, m.hp / m.maxHp * 100);

      // For phoenix_down-type items, only show KO'd members; for others, only alive
      const isReviveItem = (def.effects || []).some(e => e.stat === 'revive');
      if (isReviveItem && !isKO) return;
      if (!isReviveItem && isKO) return;

      const btn = document.createElement('button');
      btn.className = 'mip-member-btn';
      btn.style.borderColor = col;
      btn.innerHTML = `<span style="color:${col}">${m.displayName}</span> <span class="mip-hp">${m.hp}/${m.maxHp} HP</span>`;
      btn.onclick = () => {
        picker.remove();
        _applyMapItem(def, i);
      };
      picker.appendChild(btn);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'mip-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => picker.remove();
    picker.appendChild(cancelBtn);

    // Insert after the grid
    grid.parentNode.insertBefore(picker, grid.nextSibling);
  }

  function _applyMapItem(def, memberIdx) {
    const effects = def.effects || [];
    const targets = memberIdx !== null
      ? [G.party[memberIdx]]
      : G.party.filter(m => m && !m.isKO && m.hp > 0);

    let used = false;
    effects.forEach(e => {
      targets.forEach(m => {
        if (!m) return;
        if (e.stat === 'hp' && e.amount) {
          if (m.isKO || m.hp <= 0) return; // skip KO'd for heal
          const heal = e.percent
            ? Math.floor(m.maxHp * e.amount / 100)
            : e.amount;
          m.hp = Math.min(m.maxHp, m.hp + heal);
          used = true;
        } else if (e.stat === 'mp' && e.amount) {
          if (m.isKO) return;
          const restore = e.percent
            ? Math.floor(m.maxMp * e.amount / 100)
            : e.amount;
          m.mp = Math.min(m.maxMp, m.mp + restore);
          used = true;
        } else if (e.stat === 'revive') {
          if (!m.isKO && m.hp > 0) return;
          m.isKO = false;
          m.hp = e.amount
            ? Math.min(m.maxHp, e.percent ? Math.floor(m.maxHp * e.amount / 100) : e.amount)
            : 1;
          if (m.char) m.char.isKO = false;
          used = true;
        } else if (e.stat === 'debuff') {
          if (m.statuses) {
            m.statuses = m.statuses.filter(s =>
              !s.id.includes('debuff') && s.type !== 'control' && s.type !== 'dot'
            );
          }
          used = true;
        }
      });
    });

    if (!used) return;

    // Consume one from inventory
    const stack = G.inventory.find(s => s.itemId === def.id);
    if (stack) {
      stack.qty--;
      if (stack.qty <= 0) {
        G.inventory = G.inventory.filter(s => s.itemId !== def.id);
      }
    }

    // Sync char HP/MP so it carries between battles
    G.party.forEach(m => {
      if (m && m.char) {
        m.char.hp = m.hp;
        m.char.mp = m.mp;
        m.char.isKO = m.isKO;
      }
    });

    showMsg(`Used ${def.icon} ${def.name}!`, 1400);
    _renderPauseCards();
    _renderPauseInventory();
  }

  /* ── Periodic HUD / minimap refresh (called by engine each frame) ── */
  let _hudTick = 0;
  function update(dt) {
    _hudTick++;
    if (_hudTick % 6 === 0) {   // ~10×/s at 60fps
      _updatePartyHUD();
      _renderMinimap();
    }
  }

  /* ── Camp Menu ──────────────────────────────────────── */
  function openCampMenu() {
    if (MapEngine.isRunning()) MapEngine.stop();
    _toggleDpad(false);
    const el = document.getElementById('camp-menu');
    if (!el) return;
    // World Map locked until arc 1 boss is defeated (arcIdx > 0)
    const worldMapBtn = el.querySelector('.camp-btn-worldmap');
    if (worldMapBtn) {
      // Unlocked once arc 1 boss is beaten: arcIdx > 0, OR arcIdx===0 but in arc_end/world_map phase
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
  }

  function closeCampMenu() {
    const el = document.getElementById('camp-menu');
    if (el) el.style.display = 'none';
    _toggleDpad(true);
    MapEngine.resume();
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
    if (typeof Story !== 'undefined' && Story._doSave) Story._doSave();
    if (typeof Story !== 'undefined' && Story._showWorldMap) Story._showWorldMap();
    else showScreen('map-screen');
  }

  function campChangeParty() {
    // Hide camp menu without resuming the engine — party swap takes over
    const el = document.getElementById('camp-menu');
    if (el) el.style.display = 'none';
    if (typeof openPartySwap === 'function') openPartySwap();
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
        if (typeof Story !== 'undefined' && Story._doSave) Story._doSave();
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

  // Escape key closes pause menu
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const el = document.getElementById('map-pause-menu');
      if (el && el.style.display !== 'none') { closePauseMenu(); e.preventDefault(); }
    }
  });

  return {
    showMsg,
    showMapBanner,
    triggerDanger,
    handleTouch,
    buildMapSelectOverlay,
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
    campHeal,
    campRelics,
    closeRelics,
  };
})();