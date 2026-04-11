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

  /* ── Periodic HUD / minimap refresh (called by engine each frame) ── */
  let _hudTick = 0;
  function update(dt) {
    _hudTick++;
    if (_hudTick % 6 === 0) {   // ~10×/s at 60fps
      _updatePartyHUD();
      _renderMinimap();
    }
  }

  /* ── Legacy canvas overlay (no-op — DOM HUD is used) ─── */
  // Kept so any existing code calling MapUI.render() won't break.
  function render(ctx, cw, ch) { /* DOM HUD renders instead */ }

  return {
    showMsg,
    showMapBanner,
    triggerDanger,
    handleTouch,
    buildMapSelectOverlay,
    cycleCharacter,
    update,
    render,
  };
})();