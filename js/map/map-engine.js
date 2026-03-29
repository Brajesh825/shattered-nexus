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
  const TILE = 40;

  let _canvas = null, _ctx = null;
  let _map    = null;
  let _rafId  = null, _lastTs = 0, _running = false;
  let _wFrame = 0,    _wTimer = 0;
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
  function _paintTile(ctx, def, sx, sy, tw, th, wF) {
    if (!def) return;

    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);

    if (def.name === 'grass') {
      ctx.fillStyle = def.hi;
      ctx.fillRect(sx, sy, tw, 2);
      ctx.fillRect(sx, sy, 2, th);
      // Blade texture
      ctx.fillStyle = 'rgba(40,100,20,0.3)';
      const seed = (sx / tw) | 0;
      for (let i = 0; i < 4; i++) {
        const bx = sx + ((seed * 7 + i * 13) % tw);
        ctx.fillRect(bx, sy + th - 8, 2, 8);
        ctx.fillRect(bx + 1, sy + th - 12, 1, 6);
      }
      ctx.fillStyle = def.shadow;
      ctx.fillRect(sx, sy + th - 2, tw, 2);
      ctx.fillRect(sx + tw - 2, sy, 2, th);

    } else if (def.name === 'forest') {
      ctx.fillStyle = '#061404';
      ctx.fillRect(sx, sy, tw, th);
      // Trunk
      ctx.fillStyle = '#2a1606';
      ctx.fillRect(sx + tw / 2 - 3, sy + th - 14, 6, 14);
      // Layered canopy blobs
      const blobs = [
        { bx: tw / 2 - 8, by: 0,  r: 9,  c: '#0a2006' },
        { bx: tw / 2 + 1, by: -2, r: 8,  c: '#0d2808' },
        { bx: tw / 2 - 4, by: 6,  r: 10, c: '#122e0a' },
        { bx: tw / 2,     by: 2,  r: 7,  c: '#183808' },
      ];
      blobs.forEach(b => {
        ctx.fillStyle = b.c;
        ctx.beginPath();
        ctx.arc(sx + b.bx + 8, sy + b.by + 8, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      // Canopy top-light
      ctx.fillStyle = 'rgba(60,120,20,0.15)';
      ctx.beginPath();
      ctx.arc(sx + tw / 2 - 2, sy + 6, 6, 0, Math.PI * 2);
      ctx.fill();

    } else if (def.name === 'mountain') {
      ctx.fillStyle = '#383048';
      ctx.fillRect(sx, sy, tw, th);
      // Main face
      ctx.fillStyle = def.hi;
      ctx.beginPath();
      ctx.moveTo(sx + tw / 2, sy + 3);
      ctx.lineTo(sx + tw - 3, sy + th - 3);
      ctx.lineTo(sx + 3, sy + th - 3);
      ctx.closePath();
      ctx.fill();
      // Snow cap
      ctx.fillStyle = '#e8e0f8';
      ctx.beginPath();
      ctx.moveTo(sx + tw / 2, sy + 3);
      ctx.lineTo(sx + tw / 2 + 8, sy + 15);
      ctx.lineTo(sx + tw / 2 - 8, sy + 15);
      ctx.closePath();
      ctx.fill();
      // Shadow face
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.moveTo(sx + tw / 2, sy + 3);
      ctx.lineTo(sx + tw - 3, sy + th - 3);
      ctx.lineTo(sx + tw / 2, sy + th - 3);
      ctx.closePath();
      ctx.fill();

    } else if (def.name === 'water') {
      // Animated — always painted directly, never cached
      ctx.fillStyle = '#081828';
      ctx.fillRect(sx, sy, tw, th);
      const shimmer = (Math.sin(wF * 0.5 + sx * 0.03) + 1) * 0.5;
      const r = (8  + shimmer * 6)  | 0;
      const g = (40 + shimmer * 30) | 0;
      ctx.fillStyle = `rgba(${r},${g},160,0.35)`;
      ctx.fillRect(sx, sy, tw, th);
      for (let i = 0; i < 3; i++) {
        const wy = sy + th * 0.2 + i * (th * 0.25) + Math.sin(wF * 0.3 + sx * 0.08 + i) * 3;
        ctx.fillStyle = `rgba(60,120,220,${0.15 + shimmer * 0.2})`;
        ctx.fillRect(sx + 3, wy, tw - 6, 2);
      }
      // Specular glint
      ctx.fillStyle = `rgba(180,220,255,${0.3 * shimmer})`;
      ctx.beginPath();
      ctx.arc(sx + tw * 0.3, sy + th * 0.3, 2, 0, Math.PI * 2);
      ctx.fill();

    } else if (def.name === 'bridge') {
      ctx.fillStyle = def.shadow;
      for (let bx = sx + 4; bx < sx + tw - 4; bx += 9) {
        ctx.fillRect(bx, sy + 2, 7, th - 4);
      }
      ctx.fillStyle = def.hi;
      ctx.fillRect(sx, sy + 3, tw, 5);
      ctx.fillRect(sx, sy + th - 8, tw, 5);
      // Railing studs
      ctx.fillStyle = '#9a7a48';
      for (let bx = sx + 4; bx < sx + tw; bx += 8) {
        ctx.fillRect(bx, sy + 1, 3, 4);
        ctx.fillRect(bx, sy + th - 5, 3, 4);
      }

    } else if (def.name === 'cave-floor' || def.name === 'dungeon') {
      ctx.strokeStyle = def.shadow;
      ctx.lineWidth = 1;
      ctx.strokeRect(sx + 2, sy + 2, tw - 4, th - 4);
      ctx.strokeRect(sx + 5, sy + 5, tw - 10, th - 10);
      if (def.name === 'dungeon') {
        ctx.fillStyle = 'rgba(160,80,220,0.2)';
        [[6, 8], [20, 6], [tw - 8, th - 7]].forEach(([fx, fy]) => {
          ctx.beginPath(); ctx.arc(sx + fx, sy + fy, 1.5, 0, Math.PI * 2); ctx.fill();
        });
      }

    } else if (def.name === 'cave-wall') {
      ctx.fillStyle = '#0c0818';
      ctx.fillRect(sx, sy, tw, th);
      ctx.fillStyle = def.hi;
      ctx.fillRect(sx + 4, sy + 4, 10, 10);
      ctx.fillRect(sx + tw - 14, sy + th - 14, 10, 10);
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx + 4, sy + 4); ctx.lineTo(sx + tw - 4, sy + th - 4);
      ctx.stroke();

    } else if (def.detail === 'cobble') {
      const cw2 = tw / 4, ch2 = th / 4;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          ctx.fillStyle = (row + col) % 2 === 0 ? def.shadow : def.hi;
          ctx.fillRect(sx + col * cw2 + 1, sy + row * ch2 + 1, cw2 - 2, ch2 - 2);
        }
      }
      // Mortar lines
      ctx.fillStyle = '#281006';
      for (let i = 1; i < 4; i++) {
        ctx.fillRect(sx + i * cw2, sy, 1, th);
        ctx.fillRect(sx, sy + i * ch2, tw, 1);
      }

    } else if (def.detail === 'flower') {
      ctx.fillStyle = def.hi;
      ctx.fillRect(sx, sy, tw, th);
      ctx.fillStyle = 'rgba(40,90,20,0.15)';
      ctx.fillRect(sx, sy, tw, 2); ctx.fillRect(sx, sy, 2, th);
      const petals = ['#ff7070', '#ff90ff', '#ffff80', '#70c0ff'];
      const fx = sx + 8 + ((sx / TILE | 0) * 7) % (tw - 16);
      const fy = sy + 8 + ((sy / TILE | 0) * 5) % (th - 16);
      const pc = petals[((sx / TILE | 0) + (sy / TILE | 0)) % 4];
      for (let a = 0; a < 4; a++) {
        ctx.fillStyle = pc;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(a * Math.PI / 2) * 4, fy + Math.sin(a * Math.PI / 2) * 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffffa0';
      ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI * 2); ctx.fill();

    } else if (def.name === 'path') {
      ctx.fillStyle = def.hi;  ctx.fillRect(sx, sy, tw, 2);
      ctx.fillStyle = def.shadow; ctx.fillRect(sx, sy + th - 2, tw, 2);
      const pebbles = [[6,8,2],[18,14,1.5],[28,6,2],[10,22,1.5],[24,20,2]];
      pebbles.forEach(([px2, py2, r]) => {
        ctx.fillStyle = 'rgba(90,66,30,0.5)';
        ctx.beginPath(); ctx.arc(sx + px2, sy + py2, r + 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = def.shadow;
        ctx.beginPath(); ctx.arc(sx + px2, sy + py2, r, 0, Math.PI * 2); ctx.fill();
      });

    } else if (def.name === 'sand') {
      ctx.fillStyle = def.hi;  ctx.fillRect(sx, sy, tw, 2); ctx.fillRect(sx, sy, 2, th);
      ctx.fillStyle = 'rgba(180,160,80,0.15)';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(sx + ((i * 17) % tw), sy + ((i * 11) % th), 3, 1);
      }

    } else {
      // Generic fallback: bevel
      ctx.fillStyle = def.hi;
      ctx.fillRect(sx, sy, tw, 2); ctx.fillRect(sx, sy, 2, th);
      ctx.fillStyle = def.shadow;
      ctx.fillRect(sx, sy + th - 2, tw, 2); ctx.fillRect(sx + tw - 2, sy, 2, th);
    }
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
        if (tileId === 3) {
          // Water is animated — paint directly each frame
          _paintTile(_ctx, def, sx, sy, TILE, TILE, _wFrame);
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

    // Water animation ticker
    _wTimer += dt;
    if (_wTimer > 0.1) { _wTimer = 0; _wFrame = (_wFrame + 1) % 60; }

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