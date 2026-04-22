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
  let TILE = 64;

  function _calcTileSize() {
    const w = _canvas.width, h = _canvas.height;
    // Landscape phones or narrow portrait: use 48px tiles so more map is visible
    if (h <= 420 || w <= 600) return 48;
    return 64;
  }

  let _canvas = null, _ctx = null;
  let _map = null;
  let _rafId = null, _lastTs = 0, _running = false;
  let _time = 0;
  let _footstepCooldown = 0; // prevents footstep spam
  let _dayCycleTime = 300; // 5 minute full day cycle
  let _campUnlocked = false, _atCamp = false;
  let _fogTime = 0;
  let _fogCanvas = null, _fogCtx = null;
  let _fogMilestone = 0; // 0=none, 1=30%, 2=60%, 3=90%
  let _ambientTimer = 0, _ambientInterval = 60; // seconds between ambient lines
  // Speech bubble queue: [{char, color, text, life, maxLife}]
  const _bubbles = [];

  // Track player tile to detect entry (not just presence)
  let _lastPlayerTx = -1, _lastPlayerTy = -1;

  // Objective state for current map session
  let _objState = {
    done: false,          // objective complete this session
    collected: [],        // for 'collect' type — which artifact indices grabbed
  };

  /* ── Camera ─────────────────────────────────────────── */
  const cam = { x: 0, y: 0 };
  let _stepBobTime = 0;   // seconds remaining for step-landing bob
  let _prevMoving = false; // tracks MapPlayer.moving last frame

  function _updateCamera(dt) {
    if (!_map) return;
    const cw = _canvas.width, ch = _canvas.height;
    const maxX = _map.width * TILE - cw;
    const maxY = _map.height * TILE - ch;

    const targetX = Math.max(0, Math.min(maxX || 0, MapPlayer.px - cw / 2 + TILE / 2));
    const targetY = Math.max(0, Math.min(maxY || 0, MapPlayer.py - ch / 2 + TILE / 2));

    if (!dt) {
      cam.x = targetX; cam.y = targetY;
    } else {
      // Dynamic lerp: fast catch-up when far, gentle settle when close
      const dist = Math.hypot(targetX - cam.x, targetY - cam.y);
      const lerp = dist > TILE * 3 ? 0.14 : dist < TILE * 0.5 ? 0.04 : 0.08;
      cam.x += (targetX - cam.x) * lerp;
      cam.y += (targetY - cam.y) * lerp;

    }

    if (_shakeTime > 0) {
      if (dt) _shakeTime -= dt;
      const mag = Math.round(_shakeTime * 10);
      cam.x += (Math.random() - 0.5) * mag;
      cam.y += (Math.random() - 0.5) * mag;
    }
  }

  /* ── Tile offscreen cache ───────────────────────────── */
  const _tileCache = {};
  const _animCache = {}; // animated tile cache: key = `${tileId}_${bucket}`

  function _invalidateCache() {
    Object.keys(_tileCache).forEach(k => delete _tileCache[k]);
    Object.keys(_animCache).forEach(k => delete _animCache[k]);
    _shadowAbove = null; _shadowLeft = null;
  }

  function _getTileCanvas(tileId) {
    if (_tileCache[tileId]) return _tileCache[tileId];
    const c = document.createElement('canvas');
    c.width = TILE; c.height = TILE;
    _paintTile(c.getContext('2d'), TILE_DEFS[tileId] || TILE_DEFS[0], 0, 0, TILE, TILE, 0);
    _tileCache[tileId] = c;
    return c;
  }

  // Animated tiles cached at 10 fps — drawn at 60 fps via drawImage
  function _getAnimTileCanvas(tileId, t) {
    const bucket = (t * 10) | 0;
    const key = tileId + '_' + bucket;
    if (_animCache[key]) return _animCache[key];
    // Evict previous bucket for this tile
    const prefix = tileId + '_';
    for (const k in _animCache) { if (k.startsWith(prefix)) delete _animCache[k]; }
    const c = document.createElement('canvas');
    c.width = TILE; c.height = TILE;
    _paintTile(c.getContext('2d'), TILE_DEFS[tileId] || TILE_DEFS[0], 0, 0, TILE, TILE, t);
    _animCache[key] = c;
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
    
    // Procedural water ripples (sx/sy are 0 when rendering to offscreen cache)
    let ofx = 0;
    if (def.name === 'deep water' || def.name === 'lava-floor') {
      ofx = Math.sin(t * 2.2) * 1.5;
    }

    const fn = typeof TILE_RENDERS !== 'undefined' && TILE_RENDERS[def.name];
    if (fn) fn(ctx, def, sx + ofx, sy, tw, th, t);
    else _defaultRender(ctx, def, sx + ofx, sy, tw, th);
  }

  // Pre-baked shadow sprites — created once, reused every frame via drawImage
  let _shadowAbove = null, _shadowLeft = null;

  function _bakeShadowSprites() {
    const shadowH = Math.round(TILE * 0.36);
    const shadowW = Math.round(TILE * 0.28);

    const a = document.createElement('canvas');
    a.width = TILE; a.height = shadowH;
    const actx = a.getContext('2d');
    const ga = actx.createLinearGradient(0, 0, 0, shadowH);
    ga.addColorStop(0, 'rgba(0,0,0,0.44)');
    ga.addColorStop(1, 'rgba(0,0,0,0)');
    actx.fillStyle = ga;
    actx.fillRect(0, 0, TILE, shadowH);
    _shadowAbove = a;

    const l = document.createElement('canvas');
    l.width = shadowW; l.height = TILE;
    const lctx = l.getContext('2d');
    const gl = lctx.createLinearGradient(0, 0, shadowW, 0);
    gl.addColorStop(0, 'rgba(0,0,0,0.30)');
    gl.addColorStop(1, 'rgba(0,0,0,0)');
    lctx.fillStyle = gl;
    lctx.fillRect(0, 0, shadowW, TILE);
    _shadowLeft = l;
  }

  function _drawTileShadow(sx, sy, c, r, tiles) {
    if (!_shadowAbove) _bakeShadowSprites();
    const aboveId = tiles[r-1]?.[c];
    if (aboveId !== undefined && TILE_DEFS[aboveId] && !TILE_DEFS[aboveId].walkable) {
      _ctx.drawImage(_shadowAbove, sx, sy);
    }
    const leftId = tiles[r]?.[c-1];
    if (leftId !== undefined && TILE_DEFS[leftId] && !TILE_DEFS[leftId].walkable) {
      _ctx.drawImage(_shadowLeft, sx, sy);
    }
  }

  /* ── Tile rendering ─────────────────────────────────── */
  function _renderTiles(layerIdx = 0) {
    const layers = _map.layers || [_map.tiles];
    const tiles = layers[layerIdx];
    if (!tiles) return;

    const startC = Math.max(0, Math.floor(cam.x / TILE) - 1);
    const startR = Math.max(0, Math.floor(cam.y / TILE) - 1);
    const endC = Math.min(_map.width - 1, Math.ceil((cam.x + _canvas.width) / TILE) + 1);
    const endR = Math.min(_map.height - 1, Math.ceil((cam.y + _canvas.height) / TILE) + 1);

    for (let r = startR; r <= endR; r++) {
      for (let c = startC; c <= endC; c++) {
        const row = tiles[r];
        if (!row) continue;
        const tileId = row[c];
        if (tileId === undefined || tileId === null || tileId === -1) continue;

        const def = TILE_DEFS[tileId] || TILE_DEFS[0];
        const sx = c * TILE - cam.x;
        const sy = r * TILE - cam.y;

        if (def.anim) {
          _ctx.drawImage(_getAnimTileCanvas(tileId, _time), sx, sy);
        } else {
          _ctx.drawImage(_getTileCanvas(tileId), sx, sy);
        }

        if (layerIdx === 0 && def.walkable) _drawTileShadow(sx, sy, c, r, tiles);
      }
    }
  }

  /* ── Objective system ───────────────────────────────── */

  function _objCfg() { return _map && _map.objective; }

  // Returns true if this map's objective is already marked cleared in G
  function _objAlreadyCleared() {
    if (!G || !_map) return false;
    if (!Array.isArray(G.clearedMaps)) G.clearedMaps = [];
    return G.clearedMaps.includes(_map.id);
  }

  function _markObjectiveCleared() {
    if (!_map || _objState.done) return;
    _objState.done = true;
  }

  function _checkObjective() {
    if (!_map || !_map.objective || _objState.done) return;
    const obj = _map.objective;

    if (obj.type === 'kill_all') {
      if (MapEntities.allCleared()) _completeObjective();

    } else if (obj.type === 'reach') {
      if (MapPlayer.tx === obj.target.x && MapPlayer.ty === obj.target.y) {
        _completeObjective();
      }

    } else if (obj.type === 'collect') {
      // Check each artifact tile
      (obj.artifacts || []).forEach((art, i) => {
        if (_objState.collected.includes(i)) return;
        if (MapPlayer.tx === art.x && MapPlayer.ty === art.y) {
          _objState.collected.push(i);
          MapUI.showMsg(art.pickupMsg || `✦ Item collected! (${_objState.collected.length}/${obj.artifacts.length})`, 1800);
        }
      });
      if (_objState.collected.length >= (obj.artifacts || []).length) _completeObjective();

    } else if (obj.type === 'survive') {
      if (_time >= obj.duration) _completeObjective();

    } else if (obj.type === 'kill_all') {
      if (MapEntities.allCleared()) _completeObjective();
    }
  }

  function _completeObjective() {
    _markObjectiveCleared();
    const obj = _objCfg();
    const msg = (obj && obj.completeMsg) ? obj.completeMsg : '✦ Objective complete!';
    stop(); // pause engine while message shows
    MapUI.showMsg(msg, 2200, () => {
      if (typeof Story !== 'undefined' && Story.active && G.mode === 'story_explore') {
        Story.onExploreComplete();
      } else {
        resume(); // free explore — just resume
      }
    });
  }

  // Render objective markers on the map canvas
  function _renderObjectiveMarkers() {
    if (!_map || !_map.objective) return;
    const obj = _map.objective;
    const pulse = 0.5 + 0.5 * Math.sin(_time * 3.0);

    _ctx.save();
    if (obj.type === 'reach' && obj.target) {
      const sx = obj.target.x * TILE - cam.x;
      const sy = obj.target.y * TILE - cam.y;
      // Gold glow ring
      _ctx.globalAlpha = 0.3 + 0.2 * pulse;
      _ctx.fillStyle = '#fbbf24';
      _ctx.beginPath();
      _ctx.arc(sx + TILE / 2, sy + TILE / 2, TILE * 0.48, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.globalAlpha = 1;
      _ctx.font = `${Math.round(TILE * 0.48)}px serif`;
      _ctx.textAlign = 'center'; _ctx.textBaseline = 'middle';
      _ctx.fillText('🎯', sx + TILE / 2, sy + TILE / 2 + 2);

    } else if (obj.type === 'collect') {
      (obj.artifacts || []).forEach((art, i) => {
        if (_objState.collected.includes(i)) return;
        const sx = art.x * TILE - cam.x;
        const sy = art.y * TILE - cam.y;
        _ctx.globalAlpha = 0.35 + 0.2 * pulse;
        _ctx.fillStyle = '#a78bfa';
        _ctx.beginPath();
        _ctx.arc(sx + TILE / 2, sy + TILE / 2, TILE * 0.4, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.globalAlpha = 1;
        _ctx.font = `${Math.round(TILE * 0.44)}px serif`;
        _ctx.textAlign = 'center'; _ctx.textBaseline = 'middle';
        _ctx.fillText(art.icon || '💎', sx + TILE / 2, sy + TILE / 2 + 2);
      });

    } else if (obj.type === 'kill_all') {
      // No marker needed — enemies are the targets
    }
    _ctx.restore();
  }

  // Render objective HUD strip at bottom of canvas
  function _renderObjectiveHUD() {
    if (!_map || !_map.objective) return;
    const obj = _map.objective;
    const w = _canvas.width;
    const bh = 22, by = _canvas.height - bh - 4, bx = 8;
    const bw = Math.min(360, w - 16);

    let statusText = '';
    if (_objState.done || _objAlreadyCleared()) {
      statusText = '✔ ' + (obj.label || 'Objective complete');
    } else if (obj.type === 'kill_all') {
      const remaining = (typeof MapEntities !== 'undefined') ? MapEntities.remaining() : 0;
      statusText = `☠ ${obj.label || 'Defeat all enemies'} — ${remaining} remaining`;
    } else if (obj.type === 'reach') {
      statusText = `🎯 ${obj.label || 'Reach the destination'}`;
    } else if (obj.type === 'collect') {
      statusText = `💎 ${obj.label || 'Collect artifacts'} — ${_objState.collected.length}/${(obj.artifacts || []).length}`;
    } else if (obj.type === 'survive') {
      const left = Math.max(0, Math.ceil(obj.duration - _time));
      statusText = `⏱ ${obj.label || 'Survive'} — ${left}s remaining`;
    }

    _ctx.save();
    _ctx.globalAlpha = 0.82;
    _ctx.fillStyle = '#06030f';
    _ctx.beginPath();
    if (_ctx.roundRect) _ctx.roundRect(bx, by, bw, bh, 4);
    else _ctx.rect(bx, by, bw, bh);
    _ctx.fill();
    _ctx.globalAlpha = 1;
    _ctx.font = '10px monospace';
    _ctx.fillStyle = (_objState.done || _objAlreadyCleared()) ? '#4ade80' : '#d8c860';
    _ctx.textAlign = 'left';
    _ctx.textBaseline = 'middle';
    _ctx.fillText(statusText, bx + 8, by + bh / 2);
    _ctx.restore();
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

  /* ── Atmosphere (Day/Night + Dynamic Lighting) ── */
  function _getAtmosphereColor() {
    const ratio = (_time % _dayCycleTime) / _dayCycleTime;
    // 0.0-0.2: Night, 0.2-0.3: Dawn, 0.3-0.7: Day, 0.7-0.8: Dusk, 0.8-1.0: Night
    if (ratio < 0.2 || ratio > 0.8) return { c: 'rgba(12, 14, 50, 0.48)', isNight: true };
    if (ratio >= 0.2 && ratio < 0.3) {
      const p = (ratio - 0.2) / 0.1;
      return { c: `rgba(${12 + p * 150}, ${14 + p * 80}, ${50 - p * 20}, ${0.48 - p * 0.48})`, isNight: false };
    }
    if (ratio >= 0.3 && ratio < 0.7) return { c: 'rgba(0,0,0,0)', isNight: false };
    if (ratio >= 0.7 && ratio <= 0.8) {
      const p = (ratio - 0.7) / 0.1;
      return { c: `rgba(${162 - p * 150}, ${94 - p * 80}, ${30 + p * 20}, ${p * 0.48})`, isNight: true };
    }
    return { c: 'rgba(0,0,0,0)', isNight: false };
  }

  // Parse ambientLight string → {r,g,b} for vignette tinting
  function _ambientRGB() {
    const m = _map && _map.ambientLight && _map.ambientLight.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3] } : { r: 0, g: 0, b: 0 };
  }

  function _renderAtmosphere() {
    const cw = _canvas.width, ch = _canvas.height;
    const px = MapPlayer.px - cam.x + TILE / 2;
    const py = MapPlayer.py - cam.y + TILE / 2;

    const atmo = _getAtmosphereColor();
    _ctx.fillStyle = atmo.c;
    _ctx.fillRect(0, 0, cw, ch);

    if (_map.ambientLight) {
      _ctx.fillStyle = _map.ambientLight;
      _ctx.fillRect(0, 0, cw, ch);
    }

    // Vignette — lighter during day, lantern radius at night
    // Colored edge tint derived from map's ambient palette
    const rgb = _ambientRGB();
    const edgeR = (rgb.r * 0.18) | 0;
    const edgeG = (rgb.g * 0.18) | 0;
    const edgeB = (rgb.b * 0.18) | 0;

    if (atmo.isNight) {
      // Night: tight lantern pool with deep darkness at edges
      const innerR = TILE * 1.6;
      const outerR = TILE * 4.2;
      const vg = _ctx.createRadialGradient(px, py, innerR, px, py, outerR);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(0.6, `rgba(${edgeR},${edgeG},${edgeB},0.55)`);
      vg.addColorStop(1,   `rgba(${edgeR},${edgeG},${edgeB},0.82)`);
      _ctx.fillStyle = vg;
      _ctx.fillRect(0, 0, cw, ch);

      // Cut a bright core circle so the player can see around them
      _ctx.save();
      _ctx.globalCompositeOperation = 'destination-out';
      const core = _ctx.createRadialGradient(px, py, 0, px, py, TILE * 2.4);
      core.addColorStop(0, 'rgba(0,0,0,1)');
      core.addColorStop(1, 'rgba(0,0,0,0)');
      _ctx.fillStyle = core;
      _ctx.fillRect(0, 0, cw, ch);
      _ctx.restore();

    } else {
      // Day: soft, wide vignette — just gentle edge darkening, not oppressive
      const innerR = Math.max(cw, ch) * 0.38;
      const outerR = Math.max(cw, ch) * 1.05;
      const vg = _ctx.createRadialGradient(px, py, innerR, px, py, outerR);
      vg.addColorStop(0,   'rgba(0,0,0,0)');
      vg.addColorStop(0.5, `rgba(${edgeR},${edgeG},${edgeB},0.06)`);
      vg.addColorStop(1,   `rgba(${edgeR},${edgeG},${edgeB},0.20)`);
      _ctx.fillStyle = vg;
      _ctx.fillRect(0, 0, cw, ch);
    }
  }

  /* ── Minimap ─────────────────────────────────────────── */
  const MM_W = 96, MM_H = 60;
  let _minimapBg = null; // cached static tile background

  function _bakeMinimapBg() {
    const c = document.createElement('canvas');
    c.width = MM_W; c.height = MM_H;
    const mctx = c.getContext('2d');
    const tw = MM_W / _map.width, th = MM_H / _map.height;
    mctx.fillStyle = '#06040e';
    mctx.fillRect(0, 0, MM_W, MM_H);
    for (let r = 0; r < _map.height; r++) {
      for (let c2 = 0; c2 < _map.width; c2++) {
        const tid = _map.tiles[r]?.[c2] ?? 0;
        mctx.fillStyle = (TILE_DEFS[tid] || TILE_DEFS[0]).color;
        mctx.fillRect(c2 * tw, r * th, Math.max(tw, 1), Math.max(th, 1));
      }
    }
    _minimapBg = c;
  }

  function _renderMinimap() {
    const mc = document.getElementById('explore-minimap');
    if (!mc || !_map) return;
    if (mc.width !== MM_W) { mc.width = MM_W; mc.height = MM_H; }
    if (!_minimapBg) _bakeMinimapBg();

    const mctx = mc.getContext('2d');
    const tw = MM_W / _map.width, th = MM_H / _map.height;

    // Blit cached background — single drawImage instead of thousands of fillRects
    mctx.drawImage(_minimapBg, 0, 0);

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
    mctx.lineWidth = 0.5;
    mctx.strokeRect(
      cam.x / TILE * tw,
      cam.y / TILE * th,
      (_canvas.width / TILE) * tw,
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
    const t = _fogProgress();
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
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.95)');
    grad.addColorStop(0.80, 'rgba(0,0,0,0.35)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
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
    _bubbles.push({
      char: line.char, color: line.color, text: line.text,
      life: BUBBLE_LIFE, maxLife: BUBBLE_LIFE
    });
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
      const fadeIn = Math.min(b.maxLife - b.life, 0.4) / 0.4;
      const fadeOut = Math.min(b.life, 0.5) / 0.5;
      const alpha = fadeIn * fadeOut;

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
      _ctx.lineWidth = 1;
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
    const p = _fogProgress();

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
    
    // 1. Base + Overlay
    _renderTiles(0);
    if (_map.layers && _map.layers[1]) _renderTiles(1);
    
    _renderObjectiveMarkers();
    _renderCampMarker();
    
    // 2. Entities
    MapEntities.renderEnemies(_ctx, cam, TILE, _map, _inVision.bind(null));
    MapEntities.renderNPCs(_ctx, cam, TILE, _time);
    MapPlayer.render(_ctx, cam, TILE);

    // 3. Fringe (Overhead)
    if (_map.layers && _map.layers[2]) _renderTiles(2);
    
    _renderAtmosphere();
    _renderFog();
    _renderObjectiveHUD();
    _renderBubbles();
    
    if (typeof WeatherEngine !== 'undefined') WeatherEngine.draw(_ctx);
    
    _renderMinimap();
  }

  /* ── Tile → footstep surface type ───────────────────── */
  const _SURFACE_GRASS  = new Set([1,11,37,40,41,42,44]);
  const _SURFACE_STONE  = new Set([2,6,7,8,9,15,26,30,51,52,61,62,68,73,110,111,112,115]);
  const _SURFACE_WOOD   = new Set([4,63,77,78,104]);
  const _SURFACE_WATER  = new Set([3,18,22,56,97,103]);
  const _SURFACE_SAND   = new Set([10,21,24,101]);
  const _SURFACE_ICE    = new Set([20,46,47,50]);

  function _tileToSurface(id) {
    if (_SURFACE_GRASS.has(id))  return 'grass';
    if (_SURFACE_STONE.has(id))  return 'stone';
    if (_SURFACE_WOOD.has(id))   return 'wood';
    if (_SURFACE_WATER.has(id))  return 'water';
    if (_SURFACE_SAND.has(id))   return 'sand';
    if (_SURFACE_ICE.has(id))    return 'ice';
    return 'default';
  }

  /* ── Update ──────────────────────────────────────────── */
  function _update(dt) {
    if (!_map) return;
    _time += dt;
    _fogTime += dt;
    MapInput.poll();
    MapPlayer.update(dt, _map);
    MapEntities.updateEnemies(dt, _map);

    // Detect step landing → footstep SFX
    if (_prevMoving && !MapPlayer.moving) {
      if (_footstepCooldown <= 0 && typeof SFX !== 'undefined') {
        SFX.footstep(_tileToSurface(_map.tiles[MapPlayer.ty]?.[MapPlayer.tx] ?? 0));
        _footstepCooldown = 0.14;
      }
    }
    _prevMoving = MapPlayer.moving;
    if (_footstepCooldown > 0) _footstepCooldown -= dt;

    _updateCamera(dt);


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

    // NPC interaction check — only fire when player just moved onto an adjacent tile
    const ptx = MapPlayer.tx, pty = MapPlayer.ty;
    const justMoved = !MapPlayer.moving && (ptx !== _lastPlayerTx || pty !== _lastPlayerTy);
    if (justMoved) {
      _lastPlayerTx = ptx; _lastPlayerTy = pty;
      // Check player tile AND all 4 adjacent tiles for an NPC
      const checks = [
        { x: ptx, y: pty },
        { x: ptx + 1, y: pty }, { x: ptx - 1, y: pty },
        { x: ptx, y: pty + 1 }, { x: ptx, y: pty - 1 },
      ];
      for (const pos of checks) {
        const npc = MapEntities.checkNPCAt(pos.x, pos.y);
        // Allow talking multiple times, but with a cooldown to avoid spam
        if (npc && !npc._dialogueOpen && (!npc._talkCooldown || npc._talkCooldown <= 0)) {
          npc._dialogueOpen = true;
          npc._talkCooldown = 30; // 30 second cooldown before re-talking automatically
          stop();
          _openNPCDialogue(npc);
          break;
        }
      }
    }

    // Objective check each frame
    _checkObjective();

    // Fog dialogue + ambient voice lines
    _updateFogDialogue(dt);

    // Tick speech bubbles and NPC cooldowns
    for (let i = _bubbles.length - 1; i >= 0; i--) {
      _bubbles[i].life -= dt;
      if (_bubbles[i].life <= 0) _bubbles.splice(i, 1);
    }
    
    // NPC talk cooldowns
    if (typeof MapEntities !== 'undefined' && MapEntities.getNPCs) {
        MapEntities.getNPCs().forEach(n => {
            if (n._talkCooldown > 0) n._talkCooldown -= dt;
        });
    }

    if (typeof WeatherEngine !== 'undefined') WeatherEngine.update(dt);

    // Delegate HUD + minimap refresh to MapUI
    if (typeof MapUI !== 'undefined') MapUI.update(dt);
  }

  /* ── Encounter ───────────────────────────────────────── */
  let _shakeTime = 0; // seconds remaining for camera shake

  function _triggerEncounter(enc) {
    const enemyId = enc.enemies && enc.enemies[0];
    const raw = G && G.enemies && enemyId && G.enemies.find(e => e.id === enemyId);
    const baseName = raw ? raw.name : (enemyId || '?');
    const mut = enc.mutation;
    const name = mut === 'mutant' ? `Mutant ${baseName}`
      : mut === 'corrupted' ? `Corrupted ${baseName}`
        : baseName;
    const isAmbush = _fogAlpha() > 0.15;
    enc.ambush = isAmbush;

    // 1. Stop movement immediately
    stop();

    // 2. Screen shake — stronger for mutated enemies
    _shakeTime = mut ? (isAmbush ? 0.85 : 0.60) : (isAmbush ? 0.55 : 0.35);

    // 3. Edge flash — purple for corrupted, green for mutant
    const flashEl = document.getElementById('explore-flash');
    if (flashEl) {
      flashEl.classList.remove('corrupted-flash', 'mutant-flash');
      if (mut === 'corrupted') flashEl.classList.add('corrupted-flash');
      else if (mut === 'mutant') flashEl.classList.add('mutant-flash');
      flashEl.classList.add('show');
      setTimeout(() => {
        flashEl.classList.remove('show', 'corrupted-flash', 'mutant-flash');
      }, mut ? 750 : isAmbush ? 600 : 380);
    }

    // 4. Dramatic canvas voice line
    if (_map && _map.voiceLines && _map.voiceLines.encounter) {
      _sayLine(_randomLine(_map.voiceLines.encounter));
    }

    // 5. Banner message
    if (typeof MapUI !== 'undefined') {
      const prefix = mut === 'mutant' ? '☣ MUTANT — '
        : mut === 'corrupted' ? '✦ CORRUPTED — '
          : isAmbush ? '💀 AMBUSH — '
            : '⚔ ';
      const suffix = mut || isAmbush ? '!' : ' appeared!';
      MapUI.showMsg(`${prefix}${name}${suffix}`, 2200);
    }

    // 6. Brief dramatic pause, then transition
    MapEntities.removeEncountered();
    const delay = (mut || isAmbush) ? 750 : 480;
    if (typeof MapEngine !== 'undefined' && typeof MapEngine.onEncounterStart === 'function') {
      setTimeout(() => MapEngine.onEncounterStart(enc, _map), delay);
    }
  }

  function onBattleComplete(victory) {
    if (!victory) {
      G.mode = 'free';
      if (typeof Story !== 'undefined' && Story.active) Story.onBattleLost();
      else showScreen('title-screen');
      MapEntities.clear();
      return;
    }
    MapEntities.removeEncountered();
    showScreen('explore-screen');
    resume();
    // Objective check runs next frame via _update → _checkObjective
    if (typeof MapUI !== 'undefined') MapUI.showMsg('Victory!', 1200);
  }

  /* ── Game loop ───────────────────────────────────────── */
  function _loop(ts) {
    if (!_running) return;
    const dt = Math.min((ts - _lastTs) / 1000, 0.05);
    _lastTs = ts;
    _update(dt);
    _render();
    _rafId = requestAnimationFrame(_loop);
  }

  /* ── Public API ──────────────────────────────────────── */
  function init(canvasEl) {
    _canvas = canvasEl;
    _ctx = canvasEl.getContext('2d');
    _canvas.width = canvasEl.offsetWidth || window.innerWidth;
    _canvas.height = canvasEl.offsetHeight || window.innerHeight;
    TILE = _calcTileSize();
    MapInput.init(canvasEl);
    window.addEventListener('resize', () => {
      _canvas.width = _canvas.offsetWidth || window.innerWidth;
      _canvas.height = _canvas.offsetHeight || window.innerHeight;
      const newTile = _calcTileSize();
      if (newTile !== TILE) {
        TILE = newTile;
        if (typeof MapPlayer !== 'undefined') MapPlayer.rescale();
      }
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
    _lastPlayerTx = -1; _lastPlayerTy = -1;
    _fogTime = 0; _fogCanvas = null;
    _fogMilestone = 0;
    _minimapBg = null;
    // Ensure we always start in daytime (ratio 0.4 = solidly mid-day in the 0.3-0.7 day band)
    _time = _dayCycleTime * 0.4;
    _bubbles.length = 0;
    _ambientTimer = 20 + Math.random() * 30; // first ambient line after 20-50s
    _objState = { done: _objAlreadyCleared(), collected: [] };
    MapEntities.init(_map);
    MapEntities.initNPCs(_map);
    cam.x = 0; cam.y = 0;
    _updateCamera();
    
    if (typeof WeatherEngine !== 'undefined') {
      WeatherEngine.setWeather(_map.weather || null);
    }
    if (typeof AmbientEngine !== 'undefined') {
      AmbientEngine.setMap(_map.id);
    }
  }

  function start(mapId) {
    if (mapId) loadMap(mapId);
    if (_running) return;
    _running = true;
    _lastTs = performance.now();
    _rafId = requestAnimationFrame(_loop);
  }

  function stop() {
    _running = false;
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  }

  function resume() {
    if (_running) return;
    _running = true;
    _lastTs = performance.now();
    _rafId = requestAnimationFrame(_loop);
  }

  function getMap() { return _map; }
  function getCam() { return cam; }
  function getTile() { return TILE; }
  function isRunning() { return _running; }

  function resetFog() { _fogTime = 0; _fogCanvas = null; _fogMilestone = 0; _bubbles.length = 0; }

  /* ── NPC dialogue ────────────────────────────────────── */
  let _npcLines = [], _npcLineIdx = 0, _npcCurrent = null;

  function _openNPCDialogue(npc) {
    _npcCurrent = npc;
    _npcLines = npc.dialogue || [];
    _npcLineIdx = 0;
    _showNPCLine();
  }

  function _showNPCLine() {
    const el = document.getElementById('npc-dialogue');
    if (!el) return;
    if (_npcLineIdx >= _npcLines.length) {
      _closeNPCDialogue();
      return;
    }
    const line = _npcLines[_npcLineIdx];
    // Portrait — party speakers use face images; NPC uses sheet canvas crop
    const portrait = document.getElementById('npc-dialogue-portrait');
    const speaker = line.speaker || '';
    const speakerLower = speaker.toLowerCase().replace(/\s+/g, '_');
    const PARTY_IDS = ['aya', 'tao', 'lulu', 'rei', 'ria', 'rydia', 'lenneth', 'kain', 'leon'];
    const isParty = PARTY_IDS.some(id => speakerLower.includes(id));

    if (portrait) {
      const size = 52;
      portrait.width = size;
      portrait.height = size;
      portrait.style.display = '';
      const pctx = portrait.getContext('2d');
      pctx.clearRect(0, 0, size, size);

      if (isParty) {
        // Use face image same as story cutscenes
        const faceImg = new Image();
        faceImg.onload = () => {
          pctx.clearRect(0, 0, size, size);
          pctx.drawImage(faceImg, 0, 0, size, size);
        };
        faceImg.src = `images/characters/faces/${speakerLower}_face.png`;
      } else if (_npcCurrent.sprite) {
        // NPC: draw frame 0 front strip, top 30% crop
        const img = new Image();
        img.onload = () => {
          const frameW = img.naturalWidth / 6;
          const frameH = img.naturalHeight / 2;
          const cropH = frameH * 0.50;
          pctx.imageSmoothingEnabled = false;
          pctx.clearRect(0, 0, size, size);
          pctx.drawImage(img, 0, 0, frameW, cropH, 0, 0, size, size);
        };
        img.src = _npcCurrent.sprite;
      }
    }
    document.getElementById('npc-dialogue-name').textContent =
      (line.speaker || _npcCurrent.name || '').toUpperCase();
    document.getElementById('npc-dialogue-text').textContent = line.text || '';
    const btn = document.getElementById('npc-dialogue-next');
    if (btn) btn.textContent = (_npcLineIdx >= _npcLines.length - 1) ? '✔ CLOSE' : '▶ CONTINUE';
    el.style.display = 'flex';

    if (typeof Focus !== 'undefined') {
      Focus.setContext('npc-dialogue');
    }
  }

  function npcDialogueNext() {
    _npcLineIdx++;
    if (_npcLineIdx >= _npcLines.length) {
      _closeNPCDialogue();
    } else {
      _showNPCLine();
    }
  }

  function _closeNPCDialogue() {
    const el = document.getElementById('npc-dialogue');
    if (el) el.style.display = 'none';
    if (typeof Focus !== 'undefined') {
      Focus.setContext(null);
    }
    if (_npcCurrent) {
      MapEntities.markNPCTalked(_npcCurrent.id);
      _npcCurrent._dialogueOpen = false;
      _npcCurrent = null;
    }
    resume();
  }

  // 0..1 — how far fog has progressed (used by entities to scale aggro/speed)
  function fogProgress() { return _fogProgress(); }

  return {
    init, loadMap, start, stop, resume, onBattleComplete,
    getMap, getCam, getTile, isRunning, resetFog, fogProgress, npcDialogueNext,
    // Optional callback — wire this up after init to handle encounter transitions:
    // MapEngine.onEncounterStart = function(enc) { ... }
    onEncounterStart: null,
  };
})();