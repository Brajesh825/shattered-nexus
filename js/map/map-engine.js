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

  /* ── Party HUD — delegated to MapUI ─────────────────── */
  // MapUI.update(dt) handles party HUD rebuilds to avoid
  // duplicating DOM logic here.

  /* ── Render ──────────────────────────────────────────── */
  function _render() {
    if (!_ctx || !_canvas || !_map) return;
    _ctx.fillStyle = _map.bgColor || '#080606';
    _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
    _renderTiles();
    _renderAtmosphere();
    MapEntities.renderEnemies(_ctx, cam, TILE, _map);
    MapPlayer.render(_ctx, cam, TILE);
    _renderMinimap();
  }

  /* ── Update ──────────────────────────────────────────── */
  function _update(dt) {
    if (!_map) return;
    _time += dt;
    MapInput.poll();
    MapPlayer.update(dt, _map);
    MapEntities.updateEnemies(dt, _map);
    _updateCamera();


    // Encounter check
    const enc = MapEntities.checkEncounter(_map);
    if (enc) {
      _triggerEncounter(enc);
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

    // Use MapUI.showMsg so the banner uses the correct #explore-notif element
    if (typeof MapUI !== 'undefined') {
      MapUI.showMsg(`⚔ ${name} appeared!`, 2200);
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
    MapPlayer.reset(_map.playerStart.x, _map.playerStart.y);
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

  return {
    init, loadMap, start, stop, resume, onBattleComplete,
    getMap, getCam, getTile, isRunning,
    // Optional callback — wire this up after init to handle encounter transitions:
    // MapEngine.onEncounterStart = function(enc) { ... }
    onEncounterStart: null,
  };
})();