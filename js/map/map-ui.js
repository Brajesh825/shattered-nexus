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

  function _updatePartyHUD() {
    const hud = document.getElementById('explore-party-hud');
    if (!hud || !G || !G.party || !G.party.length) return;
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
      const slot = document.createElement('div');
      slot.className = 'pause-inv-slot';
      slot.title = def.description;
      slot.innerHTML = `${def.icon} ${def.name} <span class="pi-qty">×${stack.qty}</span>`;
      grid.appendChild(slot);
    });
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
    if (typeof Story !== 'undefined' && Story._showWorldMap) Story._showWorldMap();
    else if (typeof UI !== 'undefined') UI.show('map-screen');
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
  };
})();