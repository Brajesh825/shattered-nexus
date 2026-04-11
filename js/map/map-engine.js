/**
 * map-engine.js — Canvas renderer, game loop, camera, tile drawing,
 *                 atmosphere/vignette, tile offscreen cache, minimap,
 *                 encounter trigger with ember flash.
 *
 * Depends on: map-data.js, map-entities.js
 * Expects globals: TILE_DEFS, MAP_DEFS, MapPlayer, MapEntities, MapInput,
 *                  G (game state), showNotif (UI helper)
 */

const MapEngine = (() => {
  const TILE = 64;

  let _canvas = null, _ctx = null;
  let _map    = null;
  let _rafId  = null, _lastTs = 0, _running = false;
  let _time   = 0;
  let _campUnlocked = false, _atCamp = false;
  let _fogTime = 0;
  let _fogCanvas = null, _fogCtx = null;
  let _fogMilestone = 0; // 0=none, 1=30%, 2=60%, 3=90%
  let _ambientTimer = 0, _ambientInterval = 60; // seconds between ambient lines
  // Speech bubble queue: [{char, color, text, life, maxLife}]
  const _bubbles = [];

  /* ── Camera ─────────────────────────────────────────── */
  const cam = { x: 0, y: 0 };

  function _updateCamera() {
    if (!_map) return;
    const cw = _canvas.width, ch = _canvas.height;
    const maxX = _map.width  * TILE - cw;
    const maxY = _map.height * TILE - ch;
    cam.x = Math.max(0, Math.min(maxX || 0, MapPlayer.px - cw / 2 + TILE / 2));
    cam.y = Math.max(0, Math.min(maxY || 0, MapPlayer.py - ch / 2 + TILE / 2));
  }

  /* ── Tile offscreen cache ───────────────────────────── */
  const _tileCache = {};

  function _invalidateCache() {
    Object.keys(_tileCache).forEach(k => delete _tileCache[k]);
  }

  function _getTileCanvas(tileId) {
    if (_tileCache[tileId]) return _tileCache[tileId];
    const c = document.createElement('canvas');
    c.width = TILE; c.height = TILE;
    _paintTile(c.getContext('2d'), TILE_DEFS[tileId] || TILE_DEFS[0], 0, 0, TILE, TILE, 0);
    _tileCache[tileId] = c;
    return c;
  }

  /* ── Tile pixel-art painter ─────────────────────────── */
  // Each tile defines its own render(ctx, sx, sy, tw, th, t) in TILE_DEFS.
  // t = elapsed seconds (for animations). Falls back to _defaultRender.
  function _defaultRender(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color; ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 2); ctx.fillRect(sx, sy, 2, th);
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy + th - 2, tw, 2); ctx.fillRect(sx + tw - 2, sy, 2, th);
  }

  function _paintTile(ctx, def, sx, sy, tw, th, t) {
    if (!def) return;
    const fn = typeof TILE_RENDERS !== 'undefined' && TILE_RENDERS[def.name];
    if (fn) fn(ctx, def, sx, sy, tw, th, t);
    else _defaultRender(ctx, def, sx, sy, tw, th);
  }

  /* ── Tile rendering ─────────────────────────────────── */
  function _renderTiles() {
    const startC = Math.max(0, Math.floor(cam.x / TILE) - 1);
    const startR = Math.max(0, Math.floor(cam.y / TILE) - 1);
    const endC   = Math.min(_map.width  - 1, Math.ceil((cam.x + _canvas.width)  / TILE) + 1);
    const endR   = Math.min(_map.height - 1, Math.ceil((cam.y + _canvas.height) / TILE) + 1);

    for (let r = startR; r <= endR; r++) {
      for (let c = startC; c <= endC; c++) {
        const tileId = _map.tiles[r]?.[c] ?? 0;
        const def    = TILE_DEFS[tileId] || TILE_DEFS[0];
        const sx     = c * TILE - cam.x;
        const sy     = r * TILE - cam.y;
        if (def.anim) {
          // Animated tiles painted directly each frame with current time
          _paintTile(_ctx, def, sx, sy, TILE, TILE, _time);
        } else {
          _ctx.drawImage(_getTileCanvas(tileId), sx, sy);
        }
      }
    }
  }

  /* ── Camp marker ────────────────────────────────────── */
  function _renderCampMarker() {
    if (!_map || !_map.playerStart) return;
    const sx = _map.playerStart.x * TILE - cam.x;
    const sy = _map.playerStart.y * TILE - cam.y;
    // Pulsing glow
    const pulse = 0.5 + 0.5 * Math.sin(_time * 2.5);
    _ctx.save();
    _ctx.globalAlpha = 0.25 + 0.15 * pulse;
    _ctx.fillStyle = '#f0a020';
    _ctx.beginPath();
    _ctx.arc(sx + TILE / 2, sy + TILE / 2, TILE * 0.42, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.globalAlpha = 1;
    _ctx.font = `${Math.round(TILE * 0.45)}px serif`;
    _ctx.textAlign = 'center';
    _ctx.textBaseline = 'middle';
    _ctx.fillText('⛺', sx + TILE / 2, sy + TILE / 2 + 2);
    _ctx.restore();
  }

  /* ── Atmosphere (vignette + ambient tint) ────────────── */
  function _renderAtmosphere() {
    const vg = _ctx.createRadialGradient(
      _canvas.width / 2, _canvas.height / 2, _canvas.height * 0.25,
      _canvas.width / 2, _canvas.height / 2, _canvas.height * 0.85
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    _ctx.fillStyle = vg;
    _ctx.fillRect(0, 0, _canvas.width, _canvas.height);

    if (_map.ambientLight) {
      _ctx.fillStyle = _map.ambientLight;
      _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
    }
  }

  /* ── Minimap ─────────────────────────────────────────── */
  function _renderMinimap() {
    const mc = document.getElementById('explore-minimap');
    if (!mc || !_map) return;
    const mw = 96, mh = 60;
    mc.width = mw; mc.height = mh;
    const mctx = mc.getContext('2d');
    const tw = mw / _map.width, th = mh / _map.height;

    mctx.fillStyle = '#06040e';
    mctx.fillRect(0, 0, mw, mh);

    for (let r = 0; r < _map.height; r++) {
      for (let c = 0; c < _map.width; c++) {
        const tid = _map.tiles[r]?.[c] ?? 0;
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
    mctx.strokeStyle = 'rgba(200,164,90,0.5)';
    mctx.lineWidth   = 0.5;
    mctx.strokeRect(
      cam.x / TILE * tw,
      cam.y / TILE * th,
      (_canvas.width  / TILE) * tw,
      (_canvas.height / TILE) * th
    );
  }

  /* ── Fog of Darkness ────────────────────────────────── */
  const FOG_COLOR = '4,2,12';

  function _fogCfg() {
    return (_map && _map.fog) || { delay: 20, peak: 180, max: 0.80, vision: 3.8 };
  }

  // Returns 0..1 progress through fog ramp
  function _fogProgress() {
    const cfg = _fogCfg();
    if (_fogTime <= cfg.delay) return 0;
    return Math.min((_fogTime - cfg.delay) / (cfg.peak - cfg.delay), 1);
  }

  function _fogAlpha() { return _fogProgress() * _fogCfg().max; }

  // Pixel radius of clear vision circle around player
  function _visionRadius() {
    const cfg = _fogCfg();
    const t   = _fogProgress();
    // Shrinks from vision+1.5 down to vision-0.5 as fog maxes
    return TILE * (cfg.vision + 1.5 - t * 2.0);
  }

  // Is the given tile position inside the player vision circle?
  function _inVision(tx, ty) {
    const dx = (tx - MapPlayer.tx) * TILE;
    const dy = (ty - MapPlayer.ty) * TILE;
    return Math.sqrt(dx * dx + dy * dy) <= _visionRadius();
  }

  function _ensureFogCanvas() {
    const w = _canvas.width, h = _canvas.height;
    if (!_fogCanvas || _fogCanvas.width !== w || _fogCanvas.height !== h) {
      _fogCanvas = document.createElement('canvas');
      _fogCanvas.width = w; _fogCanvas.height = h;
      _fogCtx = _fogCanvas.getContext('2d');
    }
  }

  function _renderFog() {
    const alpha = _fogAlpha();
    if (alpha < 0.01) return;

    _ensureFogCanvas();
    const w = _canvas.width, h = _canvas.height;
    const fc = _fogCtx;
    const px = MapPlayer.px - cam.x + TILE / 2;
    const py = MapPlayer.py - cam.y + TILE / 2;
    const visionR = _visionRadius();

    fc.clearRect(0, 0, w, h);
    fc.fillStyle = `rgba(${FOG_COLOR},${alpha})`;
    fc.fillRect(0, 0, w, h);

    fc.globalCompositeOperation = 'destination-out';
    const grad = fc.createRadialGradient(px, py, 0, px, py, visionR);
    grad.addColorStop(0,    'rgba(0,0,0,1)');
    grad.addColorStop(0.5,  'rgba(0,0,0,0.95)');
    grad.addColorStop(0.80, 'rgba(0,0,0,0.35)');
    grad.addColorStop(1,    'rgba(0,0,0,0)');
    fc.fillStyle = grad;
    fc.fillRect(0, 0, w, h);
    fc.globalCompositeOperation = 'source-over';

    _ctx.drawImage(_fogCanvas, 0, 0);
  }

  /* ── Speech bubbles (canvas) ─────────────────────────── */
  const BUBBLE_LIFE = 3.2; // seconds each bubble lives

  function _sayLine(line) {
    if (!line) return;
    // Dismiss old bubble from same char if still showing
    const existing = _bubbles.findIndex(b => b.char === line.char);
    if (existing >= 0) _bubbles.splice(existing, 1);
    _bubbles.push({ char: line.char, color: line.color, text: line.text,
                    life: BUBBLE_LIFE, maxLife: BUBBLE_LIFE });
  }

  function _randomLine(arr) {
    if (!arr || !arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function _renderBubbles() {
    if (!_bubbles.length) return;
    const w = _canvas.width;
    let y = 52; // start below the header

    _bubbles.forEach((b, idx) => {
      const fadeIn  = Math.min(b.maxLife - b.life, 0.4) / 0.4;
      const fadeOut = Math.min(b.life, 0.5) / 0.5;
      const alpha   = fadeIn * fadeOut;

      const bx = 16, bw = Math.min(420, w - 32);
      const by = y;
      const bh = 38;

      // Background pill
      _ctx.save();
      _ctx.globalAlpha = alpha * 0.88;
      _ctx.fillStyle = '#080412';
      _ctx.beginPath();
      if (_ctx.roundRect) _ctx.roundRect(bx, by, bw, bh, 6);
      else _ctx.rect(bx, by, bw, bh);
      _ctx.fill();
      _ctx.strokeStyle = b.color;
      _ctx.lineWidth   = 1;
      _ctx.stroke();
      _ctx.globalAlpha = alpha;

      // Character name
      _ctx.font = 'bold 9px monospace';
      _ctx.fillStyle = b.color;
      _ctx.fillText(b.char.toUpperCase(), bx + 10, by + 14);

      // Text
      _ctx.font = 'italic 10px serif';
      _ctx.fillStyle = '#e8e0f8';
      _ctx.fillText(`"${b.text}"`, bx + 10, by + 28);

      _ctx.restore();
      y += bh + 6;
    });
  }

  /* ── Fog milestone + ambient dialogue ───────────────── */
  function _updateFogDialogue(dt) {
    if (!_map || !_map.voiceLines) return;
    const vl = _map.voiceLines;
    const p  = _fogProgress();

    // Milestone triggers at 30 / 60 / 90 %
    if (_fogMilestone < 1 && p >= 0.30) {
      _fogMilestone = 1;
      _sayLine(_randomLine(vl.fogRising));
    } else if (_fogMilestone < 2 && p >= 0.60) {
      _fogMilestone = 2;
      _sayLine(_randomLine(vl.fogRising));
    } else if (_fogMilestone < 3 && p >= 0.90) {
      _fogMilestone = 3;
      _sayLine(_randomLine(vl.fogRising));
    }

    // Ambient idle lines
    _ambientTimer -= dt;
    if (_ambientTimer <= 0) {
      _ambientTimer = 45 + Math.random() * 45;
      if (vl.ambient && vl.ambient.length) _sayLine(_randomLine(vl.ambient));
    }
  }

  /* ── Party HUD — delegated to MapUI ─────────────────── */
  // MapUI.update(dt) handles party HUD rebuilds to avoid
  // duplicating DOM logic here.

  /* ── Render ──────────────────────────────────────────── */
  function _render() {
    if (!_ctx || !_canvas || !_map) return;
    _ctx.fillStyle = _map.bgColor || '#080606';
    _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
    _renderTiles();
    _renderCampMarker();
    _renderAtmosphere();
    MapEntities.renderEnemies(_ctx, cam, TILE, _map, _inVision.bind(null));
    MapPlayer.render(_ctx, cam, TILE);
    _renderFog();
    _renderBubbles();
    _renderMinimap();
  }

  /* ── Update ──────────────────────────────────────────── */
  function _update(dt) {
    if (!_map) return;
    _time    += dt;
    _fogTime += dt;
    MapInput.poll();
    MapPlayer.update(dt, _map);
    MapEntities.updateEnemies(dt, _map);
    _updateCamera();


    // Encounter check
    const enc = MapEntities.checkEncounter(_map);
    if (enc) {
      _triggerEncounter(enc);
    }

    // Camp node check — player returns to playerStart tile
    if (_map.playerStart && !MapPlayer.moving) {
      const atStart = MapPlayer.tx === _map.playerStart.x && MapPlayer.ty === _map.playerStart.y;
      if (!_campUnlocked && !atStart) _campUnlocked = true;
      if (_campUnlocked && atStart && !_atCamp) {
        _atCamp = true;
        if (typeof MapUI !== 'undefined') MapUI.openCampMenu();
      }
      if (!atStart) _atCamp = false;
    }

    // Fog dialogue + ambient voice lines
    _updateFogDialogue(dt);

    // Tick speech bubbles
    for (let i = _bubbles.length - 1; i >= 0; i--) {
      _bubbles[i].life -= dt;
      if (_bubbles[i].life <= 0) _bubbles.splice(i, 1);
    }

    // Delegate HUD + minimap refresh to MapUI
    if (typeof MapUI !== 'undefined') MapUI.update(dt);
  }

  /* ── Encounter ───────────────────────────────────────── */
  function _triggerEncounter(enc) {
    // Ember-red edge flash
    const flashEl = document.getElementById('explore-flash');
    if (flashEl) {
      flashEl.classList.add('show');
      setTimeout(() => flashEl.classList.remove('show'), 200);
    }
    MapEntities.removeEncountered();

    const enemyId = enc.enemies && enc.enemies[0];
    const raw  = G && G.enemies && enemyId && G.enemies.find(e => e.id === enemyId);
    const name = raw ? raw.name : (enemyId || '?');

    // Ambush? If fog is active and encounter triggered outside clear vision
    const isAmbush = _fogAlpha() > 0.15;
    enc.ambush = isAmbush;

    // Dramatic encounter dialogue on canvas
    if (_map && _map.voiceLines && _map.voiceLines.encounter) {
      _sayLine(_randomLine(_map.voiceLines.encounter));
    }

    // Banner message — ambush gets a different tone
    if (typeof MapUI !== 'undefined') {
      MapUI.showMsg(isAmbush ? `💀 AMBUSH — ${name}!` : `⚔ ${name} appeared!`, 2200);
    }

    // Delegate to host game if wired up
    if (typeof MapEngine !== 'undefined' && typeof MapEngine.onEncounterStart === 'function') {
      stop();
      setTimeout(() => MapEngine.onEncounterStart(enc, _map), 120);
    }
  }

  function onBattleComplete(victory) {
    if (!victory) {
      G.mode = 'free';
      if (typeof Story !== 'undefined' && Story.active) Story.onBattleLost();
      else if (typeof UI !== 'undefined') UI.show('title-screen');
      MapEntities.clear();
      return;
    }
    MapEntities.removeEncountered();
    if (_allEnemiesCleared()) {
      MapUI.showMsg('Area cleared!', 1000, () => {
        if (typeof Story !== 'undefined') Story.onExploreComplete();
      });
      return;
    }
    if (typeof UI !== 'undefined') UI.show('explore-screen');
    resume();
    if (typeof MapUI !== 'undefined') MapUI.showMsg('Victory! Keep exploring…', 1500);
  }

  function _allEnemiesCleared() {
    return typeof MapEntities !== 'undefined' && MapEntities.allCleared();
  }

  /* ── Game loop ───────────────────────────────────────── */
  function _loop(ts) {
    if (!_running) return;
    const dt = Math.min((ts - _lastTs) / 1000, 0.05);
    _lastTs  = ts;
    _update(dt);
    _render();
    _rafId = requestAnimationFrame(_loop);
  }

  /* ── Public API ──────────────────────────────────────── */
  function init(canvasEl) {
    _canvas = canvasEl;
    _ctx    = canvasEl.getContext('2d');
    _canvas.width  = canvasEl.offsetWidth  || window.innerWidth;
    _canvas.height = canvasEl.offsetHeight || window.innerHeight;
    MapInput.init(canvasEl);
    window.addEventListener('resize', () => {
      _canvas.width  = _canvas.offsetWidth  || window.innerWidth;
      _canvas.height = _canvas.offsetHeight || window.innerHeight;
      _invalidateCache();
    });
  }

  function loadMap(mapId) {
    _map = MAP_DEFS[mapId] || MAP_DEFS['verdant_vale'];
    const titleEl = document.getElementById('explore-map-name');
    if (titleEl) titleEl.textContent = `✦ ${_map.name.toUpperCase()} ✦`;
    _invalidateCache();
    MapPlayer.pickVariants(); // pick random sprite variant for each party member
    MapPlayer.reset(_map.playerStart.x, _map.playerStart.y);
    _campUnlocked = false; _atCamp = false;
    _fogTime = 0; _fogCanvas = null;
    _fogMilestone = 0;
    _bubbles.length = 0;
    _ambientTimer = 20 + Math.random() * 30; // first ambient line after 20-50s
    MapEntities.init(_map);
    cam.x = 0; cam.y = 0;
    _updateCamera();
  }

  function start(mapId) {
    if (mapId) loadMap(mapId);
    if (_running) return;
    _running = true;
    _lastTs  = performance.now();
    _rafId   = requestAnimationFrame(_loop);
  }

  function stop() {
    _running = false;
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  }

  function resume() {
    if (_running) return;
    _running = true;
    _lastTs  = performance.now();
    _rafId   = requestAnimationFrame(_loop);
  }

  function getMap()    { return _map; }
  function getCam()    { return cam; }
  function getTile()   { return TILE; }
  function isRunning() { return _running; }

  function resetFog() { _fogTime = 0; _fogCanvas = null; _fogMilestone = 0; _bubbles.length = 0; }

  // 0..1 — how far fog has progressed (used by entities to scale aggro/speed)
  function fogProgress() { return _fogProgress(); }

  return {
    init, loadMap, start, stop, resume, onBattleComplete,
    getMap, getCam, getTile, isRunning, resetFog, fogProgress,
    // Optional callback — wire this up after init to handle encounter transitions:
    // MapEngine.onEncounterStart = function(enc) { ... }
    onEncounterStart: null,
  };
})();