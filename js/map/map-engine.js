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
    // Landscape-only: height is the constraining dimension
    const h = Math.min(_canvas.height, _canvas.width); // shortest side = landscape height
    if (h <= 375) return 32; // iPhone SE
    if (h <= 390) return 36; // iPhone 12/13/14 Pro
    if (h <= 414) return 40; // iPhone XR/11
    if (h <= 500) return 48; // small tablets / large phones
    return 64;               // desktop / large tablets
  }

  function _isBlocked(tx, ty) {
    if (!_map) return true;
    if (tx < 0 || ty < 0 || tx >= _map.width || ty >= _map.height) return true;

    const layers = MapData.getLayers(_map);
    if (!layers || !layers[0] || !Array.isArray(layers[0])) return true; // Map data not ready
    
    // 1. Direct Hit Check (Layer-by-layer)
    for (const layer of layers) {
      if (!layer) continue;
      const tid = layer?.[ty]?.[tx] ?? 0;
      if (tid !== 0) {
        const def = TILE_DEFS[tid] || TILE_DEFS[0];
        if (!def.walkable) return true;
      }
    }

    // 2. Footprint / Mask Check (Scan neighbors for large assets)
    const R = 4; // Slightly larger scan for big assets
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        const nx = tx + dx, ny = ty + dy;
        if (nx < 0 || ny < 0 || nx >= (_map?.width || 0) || ny >= (_map?.height || 0)) continue;

        for (const layer of layers) {
          const tid = layer?.[ny]?.[nx];
          if (!tid) continue;
          const def = TILE_DEFS[tid];
          if (!def) continue;

          // A: Standard Footprint List
          if (def.footprint && !def.walkable) {
            for (const [fx, fy] of def.footprint) {
              if (nx + fx === tx && ny + fy === ty) return true;
            }
          }

          // B: Granular Collision Mask
          if (def.collisionMask) {
            const mask = def.collisionMask;
            const h = mask.length;
            const w = mask[0].length;
            const anchor = def.anchor || 'bottom-center';

            // Calculate relative offset of (tx, ty) from the anchor (nx, ny)
            let relX = tx - nx;
            let relY = ty - ny;

            // Adjust relative coords based on anchor type
            if (anchor === 'bottom-center') {
              relX += Math.floor(w / 2);
            }
            // Bottom-Left: relX is already correct (0 is left)
            
            // Invert relY because mask[0] is the top row, but ty is the bottom anchor
            // relY is negative for tiles above the anchor
            const maskY = (h - 1) + relY; 
            const maskX = relX;

            if (maskY >= 0 && maskY < h && maskX >= 0 && maskX < w) {
              if (mask[maskY][maskX] === 'X') return true;
            }
          }
        }
      }
    }
    return false;
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

  // Region triggers already fired this session
  const _firedTriggers = new Set();

  // ── Cinematic Scene State ──────────────────────────────
  let _sceneRunning      = false; // blocks encounters, triggers, and player movement
  let _playerLocked      = false; // skips MapPlayer.update() during scene walk/dialogue
  let _playerFacingOverride = null; // {dx,dy} or null
  let _marchEnemies      = [];    // [{id,tx,ty,px,py,targetTx,targetTy,img,alpha}] marching in
  let _sceneAmbushActive = false;
  let _sceneAmbushCallback = null;

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
      // Frame-rate independent smoothing
      // 0.99 catch-up per 100ms
      const catchUp = 1 - Math.pow(0.01, dt);
      cam.x += (targetX - cam.x) * catchUp;
      cam.y += (targetY - cam.y) * catchUp;
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
  function _defaultRender(ctx, def, sx, sy, tw, th, t = 0) {
    const color = def.color || '#1a1a2e';
    const hi = def.hi || color;
    const shadow = def.shadow || color;

    ctx.fillStyle = color;
    ctx.fillRect(sx, sy, tw, th);

    // Add Premium Procedural Details (Ported from Architect Pro)
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, tw, th);
    ctx.clip();

    const name = (def.name || "").toLowerCase();

    if (name.includes('grass')) {
        ctx.fillStyle = hi;
        for(let i=0; i<3; i++) {
            ctx.fillRect(sx + (i*tw/3) + 2, sy + 4, 2, th/3);
            ctx.fillRect(sx + (i*tw/3) + 6, sy + th/2, 2, th/4);
        }
    } else if (name.includes('water')) {
        ctx.strokeStyle = hi;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const wave = Math.sin(t * 2 + sx/10) * 3;
        ctx.moveTo(sx + 2, sy + th/3 + wave);
        ctx.bezierCurveTo(sx + tw/3, sy + 2 + wave, sx + 2*tw/3, sy + th/3 + wave, sx + tw - 2, sy + 2 + wave);
        ctx.stroke();
    } else if (name.includes('stone') || name.includes('wall') || name.includes('mountain')) {
        ctx.fillStyle = shadow;
        ctx.fillRect(sx, sy + th - 4, tw, 4);
        ctx.fillStyle = hi;
        ctx.fillRect(sx, sy, tw, 2);
    } else if (name.includes('path') || name.includes('sand')) {
        ctx.fillStyle = hi;
        // Deterministic random-ish dots based on position
        const seed = sx * 13 + sy * 7;
        for(let i=0; i<5; i++) {
            const rx = ((seed + i * 17) % 100) / 100 * tw;
            const ry = ((seed + i * 31) % 100) / 100 * th;
            ctx.beginPath();
            ctx.arc(sx + rx, sy + ry, 1.2, 0, Math.PI*2);
            ctx.fill();
        }
    }

    ctx.restore();
  }

  function _paintTile(ctx, def, sx, sy, tw, th, t) {
    if (!def || def.hidden) return;
    
    // 1. SVG Asset Support (High Fidelity Scaling)
    // Note: Most SVGs are handled in _renderRow for dynamic scaling, 
    // but some small 1x1 ones might be baked here.
    if (def.svgAsset && !def.vScale) {
      const svg = AssetPreloader.getImage(`env_${def.svgAsset}`);
      if (svg) {
        ctx.drawImage(svg, sx, sy, tw, th);
        return;
      }
    }

    // 2. Sprite Support
    if (def.sprite || def.spriteIdx !== undefined) {
      const sheet = AssetPreloader.getImage('env_sprites');
      if (sheet) {
        let sw, sh, sx_src, sy_src, frames;

        if (def.spriteIdx !== undefined) {
          const idx = def.spriteIdx;
          const gridW = 6;
          const cellW = sheet.width / gridW;
          const cellH = sheet.height / gridW;
          sx_src = (idx % gridW) * cellW;
          sy_src = Math.floor(idx / gridW) * cellH;
          sw = cellW;
          sh = cellH;
          frames = def.spriteFrames || 1;
        } else {
          sx_src = def.sprite.x;
          sy_src = def.sprite.y;
          sw = def.sprite.w || 128;
          sh = def.sprite.h || 128;
          frames = def.sprite.frames || 1;
        }

        const frame = def.anim ? (Math.floor(t * 6) % frames) : 0;
        ctx.drawImage(
          sheet, 
          sx_src + (frame * sw), sy_src, sw, sh,
          sx, sy, tw, th
        );
        return;
      }
    }

    // 3. Procedural / Procedural-Fallback
    let ofx = 0;
    if (def.name === 'deep water' || def.name === 'lava-floor') {
      ofx = Math.sin(t * 2.2) * 1.5;
    }

    const fn = typeof TILE_RENDERS !== 'undefined' && TILE_RENDERS[def.name];
    if (fn) fn(ctx, def, sx + ofx, sy, tw, th, t);
    else _defaultRender(ctx, def, sx + ofx, sy, tw, th, t);
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
    const layers = MapData.getLayers(_map);
    // Check current layer AND decoration layer (1) for shadow-casters
    const checkShadow = (tx, ty) => {
      for (let l = layers.length - 1; l >= 0; l--) {
        const id = layers[l]?.[ty]?.[tx];
        if (id && TILE_DEFS[id] && !TILE_DEFS[id].walkable) return true;
      }
      return false;
    };

    if (checkShadow(c, r - 1)) {
      _ctx.drawImage(_shadowAbove, sx, sy);
    }
    if (checkShadow(c - 1, r)) {
      _ctx.drawImage(_shadowLeft, sx, sy);
    }
  }

  /* ── Tile rendering ─────────────────────────────────── */
  function _renderRow(layerIdx, r) {
    const layers = MapData.getLayers(_map);
    const tiles = layers[layerIdx];
    if (!tiles || !tiles[r]) return;

    const startC = Math.max(0, Math.floor(cam.x / TILE) - 1);
    const endC = Math.min(_map.width - 1, Math.ceil((cam.x + _canvas.width) / TILE) + 1);

    const row = tiles[r];
    for (let c = startC; c <= endC; c++) {
      const tileId = row[c];
      if (!tileId || tileId === -1) continue;

      const def = TILE_DEFS[tileId] || TILE_DEFS[0];
      const sx = c * TILE - cam.x;
      const sy = r * TILE - cam.y;

      if (def.vScale) {
          // 1. Draw base terrain first (Matching Editor rule)
          if (layerIdx === 0) {
              _ctx.drawImage(_getTileCanvas(tileId), sx, sy);
          }

          const scale = def.vScale || 1.0;
          const ox = (def.vOffset?.x || 0);
          const oy = (def.vOffset?.y || 0);
          const dw = TILE * scale;
          
          if (def.svgAsset) {
              const img = AssetPreloader.getImage(`env_${def.svgAsset}`);
              if (img) {
                  // Preserve Aspect Ratio (Matching Editor rule)
                  const sh = dw * (img.height / img.width || 1);
                  
                  // Always Bottom-Center (Matching Editor rule - ignoring def.anchor)
                  const dx = sx + (TILE - dw) / 2 + ox;
                  const dy = sy + TILE - sh + oy;

                  // Draw Glow
                  if (def.glows) {
                      const pulse = 0.8 + 0.2 * Math.sin(_time * 2.5);
                      const grad = _ctx.createRadialGradient(dx + dw/2, dy + sh/2, 0, dx + dw/2, dy + sh/2, dw * 0.8 * pulse);
                      grad.addColorStop(0, def.glows);
                      grad.addColorStop(1, 'rgba(0,0,0,0)');
                      _ctx.save();
                      _ctx.globalCompositeOperation = 'screen';
                      _ctx.fillStyle = grad;
                      _ctx.fillRect(dx - dw/2, dy - sh/2, dw * 2, sh * 2);
                      _ctx.restore();
                  }

                  _ctx.drawImage(img, dx, dy, dw, sh);
              }
          }
      } else {
          if (def.anim) {
              _ctx.drawImage(_getAnimTileCanvas(tileId, _time), sx, sy);
          } else {
              _ctx.drawImage(_getTileCanvas(tileId), sx, sy);
          }
      }
      if (layerIdx === 0 && def.walkable) _drawTileShadow(sx, sy, c, r, tiles);
    }
  }

  function _renderTiles(layerIdx = 0) {
    const layers = MapData.getLayers(_map);
    const tiles = layers[layerIdx];
    if (!tiles) return;

    const startR = Math.max(0, Math.floor(cam.y / TILE) - 1);
    const endR = Math.min(_map.height - 1, Math.ceil((cam.y + _canvas.height) / TILE) + 1);

    for (let r = startR; r <= endR; r++) {
      _renderRow(layerIdx, r);
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
    } else if (obj.type === 'kill_boss') {
      if (MapEntities.bossCleared()) _completeObjective();
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
    const el = document.getElementById('explore-loc');
    if (!el) return;

    const obj = _map.objective;
    const isDone = _objState.done || _objAlreadyCleared();
    
    let statusText = '';
    if (isDone) {
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

    if (el.textContent !== statusText) {
      el.textContent = statusText;
      el.classList.toggle('complete', isDone);
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

    // --- VOID CORRUPTION VISUALS ---
    // Apply CSS filter to the canvas based on exploration time (Infection)
    const wrap = _canvas.parentElement;
    if (wrap) {
      const fogT = _fogProgress(); // 0..1
      if (fogT > 0.05) {
        const hue = Math.round(fogT * 60); // subtle shift towards purple
        const sepia = (fogT * 0.4).toFixed(2);
        const bright = (1.0 - fogT * 0.15).toFixed(2);
        wrap.style.filter = `hue-rotate(${hue}deg) sepia(${sepia}) brightness(${bright})`;
      } else {
        wrap.style.filter = '';
      }
    }

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

    // ── PREMIUM ATMOSPHERE: Clouds & God Rays ──
    if (!atmo.isNight) {
      _ctx.save();
      // 1. God Rays (Shafts of light)
      const rayTime = _time * 0.15;
      _ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 3; i++) {
        const rayX = (rayTime + i * 0.4) % 1;
        const g = _ctx.createLinearGradient(cw * rayX, 0, cw * (rayX - 0.2), ch);
        g.addColorStop(0, 'rgba(255, 250, 220, 0.08)');
        g.addColorStop(0.5, 'rgba(255, 250, 220, 0.03)');
        g.addColorStop(1, 'rgba(255, 250, 220, 0)');
        _ctx.fillStyle = g;
        _ctx.fillRect(0, 0, cw, ch);
      }

      // 2. Drifting Ambient Clouds
      const cloudTime = _time * 0.02;
      _ctx.globalCompositeOperation = 'source-over';
      _ctx.globalAlpha = 0.12;
      for (let i = 0; i < 2; i++) {
        const ox = (cloudTime * (1 + i * 0.5) + i * 0.3) % 1.5 - 0.25;
        const oy = Math.sin(_time * 0.1 + i) * 0.05 + 0.1 * i;
        const g = _ctx.createRadialGradient(cw * ox, ch * oy, 0, cw * ox, ch * oy, cw * 0.6);
        g.addColorStop(0, 'rgba(180, 160, 255, 0.4)');
        g.addColorStop(1, 'rgba(180, 160, 255, 0)');
        _ctx.fillStyle = g;
        _ctx.fillRect(0, 0, cw, ch);
      }
      _ctx.restore();
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
        const tid = MapData.getTileAt(_map, c2, r);
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
    
    // 1. Ground Layer (Always below)
    _renderTiles(0);
    
    // 2. Interleaved Y-Sorting
    const layers = MapData.getLayers(_map);
    const startR = Math.max(0, Math.floor(cam.y / TILE) - 1);
    const endR = Math.min(_map.height - 1, Math.ceil((cam.y + _canvas.height) / TILE) + 1);

    if (typeof MapEntities !== 'undefined' && MapEntities.prepareBuckets) {
      MapEntities.prepareBuckets(startR, endR);
    }

    for (let r = startR; r <= endR; r++) {
      // Draw Decor row
      if (layers[1]) _renderRow(1, r);
      
      // Draw entities that are on this row (Y-Sorting)
      if (typeof MapEntities !== 'undefined') {
        if (MapEntities.renderEnemiesForRow) MapEntities.renderEnemiesForRow(_ctx, cam, TILE, r, _inVision.bind(null));
        if (MapEntities.renderNPCsForRow) MapEntities.renderNPCsForRow(_ctx, cam, TILE, r, _inVision.bind(null));
      }
      if (MapPlayer.ty === r) MapPlayer.render(_ctx, cam, TILE);

      // Draw Overhead row
      if (layers[2]) _renderRow(2, r);
    }
    
    _renderObjectiveMarkers();
    _renderCampMarker();
    _renderMarchEnemies(_ctx);

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
    if (!_playerLocked) MapPlayer.update(dt, _map);
    MapEntities.updateEnemies(dt, _map);
    if (_marchEnemies.length) _updateMarchEnemies(dt);

    // Detect step landing → footstep SFX
    if (_prevMoving && !MapPlayer.moving) {
      if (_footstepCooldown <= 0 && typeof SFX !== 'undefined') {
        const tid = MapData.getTileAt(_map, MapPlayer.tx, MapPlayer.ty);
        SFX.footstep(_tileToSurface(tid));
        _footstepCooldown = 0.14;
      }
    }
    _prevMoving = MapPlayer.moving;
    if (_footstepCooldown > 0) _footstepCooldown -= dt;

    _updateCamera(dt);


    // Encounter check — blocked while a scene is running
    if (!_sceneRunning) {
      const enc = MapEntities.checkEncounter(_map);
      if (enc) _triggerEncounter(enc);
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

    // Manual Interaction check (Space/Enter)
    if (MapInput.isKey(' ') || MapInput.isKey('Enter')) {
      interact();
    }

    // Objective check each frame
    _checkObjective();

    // Region triggers and scene triggers
    if (!_sceneRunning) _checkRegionTriggers();
    _checkScenes();

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

  /* ── Region Triggers ────────────────────────────────── */

  function _checkRegionTriggers() {
    if (!_map || !_map.triggers || MapPlayer.moving) return;
    const tx = MapPlayer.tx, ty = MapPlayer.ty;

    _map.triggers.forEach(trig => {
      const id = trig.id || `${trig.x},${trig.y}`;
      if (_firedTriggers.has(id)) return;

      // Check if player is inside the trigger rect
      const inside = (tx >= trig.x && tx < (trig.x + (trig.w || 1))) &&
                     (ty >= trig.y && ty < (trig.y + (trig.h || 1)));

      if (inside) {
        _firedTriggers.add(id);
        if (trig.type === 'dialogue' && trig.lines) {
          _openGenericDialogue(trig.lines);
        } else if (trig.type === 'msg' && trig.msg) {
          MapUI.showMsg(trig.msg, 1500);
        } else if (trig.type === 'teleport' && trig.targetMapId) {
          // loadMap is async (fetches JSON). All post-load work must run inside
          // .then() — otherwise loadMap's own MapPlayer.reset(playerStart) fires
          // last and stomps whatever targetX/targetY we set.
          loadMap(trig.targetMapId).then(() => {
            if (trig.targetX !== undefined && trig.targetY !== undefined) {
              MapPlayer.reset(trig.targetX, trig.targetY);
            }
            if (trig.msg) MapUI.showMsg(trig.msg, 1500);
            if (G.mode === 'story_explore' && typeof Story !== 'undefined') {
              Story.onMapTeleport(trig.targetMapId);
            }
          });
        } else if (trig.type === 'encounter' && trig.enemies) {
          // Trigger a direct encounter / boss fight from a map zone
          // Optional: show a pre-battle message before launching
          const launch = () => _triggerEncounter({
            enemies: trig.enemies,
            isBoss: trig.isBoss || false,
            mutation: trig.mutation || null,
          });
          if (trig.preMsg) {
            MapUI.showMsg(trig.preMsg, 2200);
            setTimeout(launch, 2400);
          } else {
            launch();
          }
        }
      }
    });
  }

  /* ── Cinematic Scene Runner ─────────────────────────────── */

  // Scenes fired this session (also persisted in G.firedScenes across sessions)
  const _firedScenes = new Set();

  function _checkScenes() {
    if (_sceneRunning || !_map || !_map.scenes || MapPlayer.moving) return;
    const tx = MapPlayer.tx, ty = MapPlayer.ty;

    for (const scene of _map.scenes) {
      if (!scene.once || _firedScenes.has(scene.id)) continue;
      const g = G.firedScenes;
      if (g && g.has && g.has(scene.id)) { _firedScenes.add(scene.id); continue; }

      const r = scene.trigger;
      if (!r) continue;
      const inside = tx >= r.x && tx < r.x + (r.w || 1) &&
                     ty >= r.y && ty < r.y + (r.h || 1);
      if (inside) {
        _firedScenes.add(scene.id);
        _runScene(scene);
        break; // only one scene per tick
      }
    }
  }

  function _runScene(scene) {
    _sceneRunning = true;
    _playerLocked = true;

    const acts = scene.acts || [];
    let i = 0;

    function next() {
      if (i >= acts.length) { _endScene(scene); return; }
      const act = acts[i++];
      _execAct(act, scene.npcId, next);
    }

    next();
  }

  function _endScene(scene) {
    _sceneRunning = false;
    _playerLocked = false;
    _playerFacingOverride = null;
    _marchEnemies = [];

    // Clean up any lingering scene state on the NPC so it resumes normal behaviour
    if (scene.npcId && typeof MapEntities !== 'undefined') {
      const npcs = MapEntities.getNPCs();
      const n = npcs && npcs.find(x => x.id === scene.npcId);
      if (n) {
        n._sceneWalkTarget  = null;
        n._sceneExitTarget  = null;
        n.facingOverride    = null;
        n.moving            = false;
        // Snap pixel position to tile so there's no drift
        n.px = n.tx * TILE;
        n.py = n.ty * TILE;
        n.prevTx = n.tx; n.prevTy = n.ty;
      }
    }

    // Persist the "seen" flag immediately so it survives before next camp save
    if (!G.firedScenes) G.firedScenes = new Set();
    G.firedScenes.add(scene.id);
    const slot = (G.currentSaveSlot !== undefined) ? G.currentSaveSlot : 0;
    if (typeof Save !== 'undefined') {
      Save.patch({ firedScenes: Array.from(G.firedScenes) }, slot);
    }

    resume();
  }

  function _execAct(act, defaultNpcId, done) {
    const npcId = act.npcId || defaultNpcId;
    switch (act.type) {
      case 'npc_walk':   return _actNpcWalk(npcId, act, done);
      case 'dialogue':   return _actDialogue(act.lines, done);
      case 'ambush':     return _actAmbush(act, done);
      case 'npc_exit':   return _actNpcExit(npcId, act, done);
      case 'face':       return _actFace(npcId, act, done);
      case 'wait':       return _actWait(act.ms || 600, done);
      case 'msg':
        if (typeof MapUI !== 'undefined') MapUI.showMsg(act.text, act.ms || 1800);
        setTimeout(done, act.ms || 1800);
        return;
      default: done();
    }
  }

  function _actNpcWalk(npcId, act, done) {
    // Walk NPC to 1 tile away from the player (face-to-face).
    // The arrival block in map-entities.js already sets n.facing toward the player.
    if (typeof MapEntities !== 'undefined') {
      MapEntities.setNPCSceneWalk(npcId, () => {
        // Face the player toward the NPC so they look at each other
        const npcs = MapEntities.getNPCs();
        const n = npcs && npcs.find(x => x.id === npcId);
        if (n) {
          _playerFacingOverride = { dx: Math.sign(n.tx - MapPlayer.tx), dy: Math.sign(n.ty - MapPlayer.ty) };
        }
        done();
      });
    } else {
      done();
    }
  }

  function _actDialogue(lines, done) {
    _openGenericDialogue(lines, () => {
      _playerFacingOverride = null;
      done();
    });
  }

  function _actAmbush(act, done) {
    const marchMs = act.marchMs || 1200;
    const dir = act.dir || 'right';

    // Face both player and NPC toward the threat
    _playerFacingOverride = _dirVec(dir);
    if (act.npcId && typeof MapEntities !== 'undefined') {
      MapEntities.setNPCFacing(act.npcId, _dirVec(dir));
    }

    if (typeof MapUI !== 'undefined') MapUI.showMsg(act.preMsg || '⚔ Incoming!', 1800);

    // Restart the loop so march silhouettes animate (dialogue act stops it)
    resume();

    const previewIds = act.waves
      ? act.waves.reduce((a, w) => a.concat(w.enemies || []), []).slice(0, 4)
      : (act.enemies || []).slice(0, 4);
    _marchEnemies = _buildMarchEntities(previewIds, dir);

    setTimeout(() => {
      _marchEnemies = [];
      if (act.waves) {
        // Multi-wave: hand off to startWaves; done() fires via onAllClear
        startWaves({
          waves: act.waves,
          allClearMsg: act.allClearMsg || '✦ All waves cleared!',
          onAllClear: () => done(),
        });
      } else {
        // Single encounter: intercept onBattleComplete
        _sceneAmbushActive = true;
        _sceneAmbushCallback = (victory) => {
          _sceneRunning = true;
          _playerLocked = true;
          done(victory);
        };
        _triggerEncounter({ enemies: act.enemies || [], isBoss: act.isBoss || false, mutation: act.mutation || null });
      }
    }, marchMs);
  }

  function _actNpcExit(npcId, act, done) {
    if (typeof MapEntities === 'undefined') { done(); return; }
    const target = act.target;
    if (!target) { done(); return; }
    // Ensure loop is running so the NPC can animate out
    if (!_running) resume();
    MapEntities.setNPCExitWalk(npcId, target, () => {
      if (act.despawn) MapEntities.despawnNPC(npcId);
      done();
    });
  }

  function _actFace(npcId, act, done) {
    if (npcId && typeof MapEntities !== 'undefined') {
      MapEntities.setNPCFacing(npcId, _dirVec(act.dir));
    }
    if (act.playerDir) _playerFacingOverride = _dirVec(act.playerDir);
    done();
  }

  function _actWait(ms, done) {
    setTimeout(done, ms);
  }

  function _dirVec(dir) {
    if (dir && typeof dir === 'object') return dir; // already {dx,dy}
    switch (dir) {
      case 'up':    return {dx:  0, dy: -1};
      case 'down':  return {dx:  0, dy:  1};
      case 'left':  return {dx: -1, dy:  0};
      default:      return {dx:  1, dy:  0}; // 'right'
    }
  }

  // Build visual march-in entities (silhouettes that slide in from off-screen)
  function _buildMarchEntities(enemyIds, dir) {
    if (!_map) return [];
    const canvas = _canvas;
    const viewTilesX = Math.ceil(canvas.width / TILE);
    const viewTilesY = Math.ceil(canvas.height / TILE);
    
    const startX = Math.floor(cam.x / TILE);
    const startY = Math.floor(cam.y / TILE);

    const entries = [];
    enemyIds.forEach((id, i) => {
      const raw = G && G.enemies && G.enemies.find(e => e.id === id);
      const sprite = raw ? (raw.sprite || `images/enemies/${id}.webp`) : `images/enemies/${id}.webp`;
      
      // Spawn just outside the current screen view
      const startTx = dir === 'left'  ? startX + viewTilesX + 2 + i
                    : dir === 'right' ? startX - 2 - i
                    : startX + Math.floor(viewTilesX / 2);
      
      const startTy = (dir === 'up' || dir === 'down') 
                    ? (dir === 'up' ? startY + viewTilesY + 2 + i : startY - 2 - i)
                    : startY + Math.floor(viewTilesY / 2) + (i - enemyIds.length/2);

      // Target: move into the screen toward the player
      const targetTx = dir === 'left'  ? MapPlayer.tx + 4 + i
                     : dir === 'right' ? MapPlayer.tx - 4 - i
                     : startTx;
      
      const targetTy = dir === 'up'    ? MapPlayer.ty + 4 + i
                     : dir === 'down'  ? MapPlayer.ty - 4 - i
                     : startTy;

      const img = new Image(); img.src = sprite;
      entries.push({ id, tx: startTx, ty: startTy, px: startTx * TILE, py: startTy * TILE, targetTx, targetTy, img, alpha: 0.7 });
    });
    return entries;
  }

  function _updateMarchEnemies(dt) {
    const SPEED = 4; // tiles per second
    _marchEnemies.forEach(m => {
      const dx = Math.sign(m.targetTx - m.tx);
      const dy = Math.sign(m.targetTy - m.ty);
      m.px += dx * SPEED * TILE * dt;
      m.py += dy * SPEED * TILE * dt;
      m.tx = m.px / TILE;
      m.ty = m.py / TILE;
    });
  }

  function _renderMarchEnemies(ctx) {
    if (!_marchEnemies.length) return;
    _marchEnemies.forEach(m => {
      const sx = Math.round(m.px - cam.x);
      const sy = Math.round(m.py - cam.y);
      ctx.save();
      ctx.globalAlpha = m.alpha;
      // Silhouette filter
      ctx.filter = 'brightness(0) invert(0)';
      if (m.img.complete && m.img.naturalWidth) {
        ctx.drawImage(m.img, sx, sy, TILE, Math.round(TILE * 1.6));
      } else {
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(sx + 8, sy + 8, TILE - 16, TILE - 16);
      }
      ctx.restore();
    });
  }

  function _openGenericDialogue(lines, onComplete) {
    _npcNextLast = 0;
    _npcCurrent = { id: 'system', name: '', sprite: null, isTalked: false, onDialogueComplete: onComplete || null };
    _npcLines = lines;
    _npcLineIdx = 0;
    stop();
    _showNPCLine();
  }

  /* ── Encounter ───────────────────────────────────────── */
  let _shakeTime = 0; // seconds remaining for camera shake
  let _waveState = null; // { waves, waveIdx, allClearMsg, onAllClear } — set by startWaves()

  function _launchWave() {
    if (!_waveState || _waveState.waveIdx >= _waveState.waves.length) return;
    const wave = _waveState.waves[_waveState.waveIdx];
    const delay = wave.preMsg ? 2200 : 500;
    if (wave.preMsg) MapUI.showMsg(wave.preMsg, 2000);
    setTimeout(() => _triggerEncounter({ enemies: wave.enemies, mutation: wave.mutation || null }), delay);
  }

  function startWaves(cfg) {
    _waveState = { waves: cfg.waves || [], waveIdx: 0, allClearMsg: cfg.allClearMsg || null, onAllClear: cfg.onAllClear || null };
    _launchWave();
  }

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
    if (typeof BGM !== 'undefined') BGM.playMap(_map);

    // Scene ambush intercept — hand control back to the scene runner
    if (_sceneAmbushActive) {
      _sceneAmbushActive = false;
      showScreen('explore-screen');
      MapPlayer.setCooldown(4);
      resume();
      const cb = _sceneAmbushCallback;
      _sceneAmbushCallback = null;
      if (cb) cb(victory);
      return;
    }

    if (!victory) {
      _waveState = null; // abort any active wave sequence on defeat
      _sceneRunning = false;
      _playerLocked = false;
      _playerFacingOverride = null;
      // Respawn at map start — restore party to half HP, clear statuses, reset position
      if (_map && _map.playerStart) {
        G.party.forEach(m => {
          if (!m) return;
          m.hp     = Math.max(1, Math.floor(m.maxHp * 0.5));
          m.mp     = Math.floor(m.maxMp * 0.5);
          m.isKO   = false;
          m.statuses = [];
        });
        MapEntities.clear();
        MapPlayer.reset(_map.playerStart.x, _map.playerStart.y);
        _campUnlocked = false; _atCamp = false;
        showScreen('explore-screen');
        MapPlayer.setCooldown(8); // Grace period
        resume();
        if (typeof MapUI !== 'undefined') MapUI.showMsg('💀 Defeated — returned to camp.', 2400);
      } else {
        // Fallback: no map loaded, hand off to story or title
        G.mode = 'free';
        if (typeof Story !== 'undefined' && Story.active) Story.onBattleLost();
        else showScreen('title-screen');
        MapEntities.clear();
      }
      return;
    }

    // ── Wave sequence handling ───────────────────────────
    if (_waveState) {
      const interMsg = _waveState.waves[_waveState.waveIdx] && _waveState.waves[_waveState.waveIdx].interWaveMsg;
      _waveState.waveIdx++;
      showScreen('explore-screen');
      MapPlayer.setCooldown(4);

      if (_waveState.waveIdx < _waveState.waves.length) {
        // More waves — brief pause then next
        if (interMsg) {
          MapUI.showMsg(interMsg, 2000, () => _launchWave());
        } else {
          setTimeout(() => _launchWave(), 800);
        }
      } else {
        // All waves cleared
        const msg = _waveState.allClearMsg || '✦ All waves cleared!';
        const cb  = _waveState.onAllClear;
        _waveState = null;
        MapUI.showMsg(msg, 2200, () => { if (cb) cb(); else resume(); });
      }
      return;
    }

    // ── Normal battle complete ───────────────────────────
    MapEntities.removeEncountered();
    showScreen('explore-screen');
    MapPlayer.setCooldown(8);
    resume();
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
    if (typeof MapInput !== 'undefined') MapInput.init(canvasEl);

    // ── NATIVE MOBILE CONTROLS (JOYSTICK + BUTTONS) ──
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch) {
      const dpad = document.getElementById('joystick-container');
      if (dpad) dpad.style.display = 'none';
      return;
    }

    const joyBase = document.getElementById('joy-base');
    const joyKnob = document.getElementById('joy-knob');
    const btnX = document.getElementById('btn-x');
    const btnY = document.getElementById('btn-y');

    let _joyActive = false;

    if (joyBase && joyKnob) {
      const radius = 50; // Use 50px for normalization to feel snappier

      const _handleJoy = (e) => {
        const touch = e.touches[0];
        const rect = joyBase.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const limit = 60; // Physical limit for visual
        if (dist > limit) {
          dx = (dx / dist) * limit;
          dy = (dy / dist) * limit;
        }

        joyKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        
        // Normalize vector for MapInput (cap at 1.0)
        const normX = Math.min(1.0, Math.max(-1.0, dx / radius));
        const normY = Math.min(1.0, Math.max(-1.0, dy / radius));
        MapInput.setVector(normX, normY);
      };

      joyBase.addEventListener('touchstart', e => {
        _joyActive = true;
        _handleJoy(e);
        if (e.cancelable) e.preventDefault();
      }, { passive: false });

      window.addEventListener('touchmove', e => {
        if (_joyActive) {
          _handleJoy(e);
          if (e.cancelable) e.preventDefault();
        }
      }, { passive: false });

      window.addEventListener('touchend', () => {
        if (_joyActive) {
          _joyActive = false;
          joyKnob.style.transform = `translate(-50%, -50%)`;
          MapInput.setVector(0, 0);
        }
      }, { passive: false });
    }

    if (btnX) {
      btnX.addEventListener('touchstart', e => {
        MapEngine.interact();
        if (e.cancelable) e.preventDefault();
      }, { passive: false });
    }
    if (btnY) {
      btnY.addEventListener('touchstart', e => {
        if (typeof MapUI !== 'undefined') MapUI.openPauseMenu();
        if (e.cancelable) e.preventDefault();
      }, { passive: false });
    }

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

  function _showLoader() {
    let loader = document.getElementById('map-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'map-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <div class="loader-text">MANIFESTING THE VALE...</div>
            </div>
        `;
        document.body.appendChild(loader);
        
        const style = document.createElement('style');
        style.id = 'map-loader-style';
        style.textContent = `
            #map-loader {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(10, 26, 5, 0.95);
                display: flex; align-items: center; justify-content: center;
                z-index: 9999; color: #4ade80; font-family: 'Outfit', sans-serif;
                transition: opacity 0.5s ease;
            }
            .loader-content { text-align: center; }
            .loader-spinner {
                width: 50px; height: 50px; border: 3px solid rgba(74, 222, 128, 0.1);
                border-top-color: #4ade80; border-radius: 50%;
                animation: spin 1s linear infinite; margin: 0 auto 20px;
            }
            .loader-text { letter-spacing: 4px; font-size: 14px; font-weight: 600; text-shadow: 0 0 10px rgba(74, 222, 128, 0.5); }
            @keyframes spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }
    loader.style.opacity = '1';
    loader.style.display = 'flex';
  }

  function _hideLoader() {
    const loader = document.getElementById('map-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
  }

  async function loadMap(mapId) {
    _showLoader();
    _map = MAP_DEFS[mapId] || MAP_DEFS['verdant_vale'];
    
    if (!_map) {
      console.warn(`⚠️ Map definition not found: ${mapId}. Falling back to default.`);
      _map = Object.values(MAP_DEFS)[0]; 
      if (!_map) return;
    }

    // Support External JSON Data
    if (_map.jsonFile) {
        try {
            const response = await fetch(_map.jsonFile);
            const jsonData = await response.json();
            _map.data = jsonData;
            console.log(`[MapEngine] Successfully fetched JSON data for: ${_map.name}`);
        } catch (e) {
            console.error(`❌ Failed to fetch map JSON: ${_map.jsonFile}`, e);
        }
    }

    // Initialize layers: handle both raw arrays and Architect Pro wrappers
    if (_map.generate && typeof _map.generate === 'function') {
      _map.generate();
    } else if (_map.data) {
      const layers = Array.isArray(_map.data) ? _map.data : (_map.data.data || _map.data.layers);
      if (layers && Array.isArray(layers)) {
          _map.layers = layers;
      }
    }
    
    // Support new Architect Pro Metadata
    if (_map.metadata && _map.metadata.dimensions) {
      _map.width = _map.metadata.dimensions.width;
      _map.height = _map.metadata.dimensions.height;
    }

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
    _firedTriggers.clear();
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
    if (typeof BGM !== 'undefined') {
      BGM.playMap(_map);
    }
    _hideLoader();
    // Emergency Force Hide: ensures game is never stuck even if assets 404
    setTimeout(_hideLoader, 1000);
  }

  function getLayers(map) {
    const data = map.data || map;
    if (Array.isArray(data) && Array.isArray(data[0]) && Array.isArray(data[0][0])) return data;
    if (data.layers && Array.isArray(data.layers)) return data.layers;
    return [data.r0, data.r1, data.r2];
  }

  async function start(mapId) {
    if (mapId) await loadMap(mapId);

    // Notify Story Engine of map change to handle continuous progression
    if (G.mode === 'story_explore' && typeof Story !== 'undefined') {
      Story.onMapTeleport(mapId);
    }

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
  let _npcQuestFlow = false; // true when dialogue came from quest priority path

  const _NPC_PARTY_IDS = ['aya', 'tao', 'lulu', 'rei', 'ria', 'rydia', 'lenneth', 'kain', 'leon', 'sera'];

  function _isPartySpeaker(name) {
    const sl = (name || '').toLowerCase().replace(/\s+/g, '_');
    return _NPC_PARTY_IDS.some(id => sl.includes(id));
  }

  // Chibi height — 70% visible above panel, ~30% of panel width on mobile
  function _npcSceneCharH() {
    const vh = window.innerHeight;
    const landscape = window.innerWidth > vh && vh <= 500;
    if (landscape) return Math.min(100, Math.max(80, Math.round(vh * 0.22)));
    return Math.min(160, Math.max(140, Math.round(vh * 0.20)));
  }

  // Render map sprite-sheet frame 0 via CSS background — browser-native scaling, no DPR issues
  function _drawNPCSceneSprite(el, src, targetH) {
    const img = new Image();
    img.onload = () => {
      const frameW = img.naturalWidth / 6;
      const frameH = img.naturalHeight / 2;
      const scale  = targetH / frameH;
      el.style.width           = Math.round(frameW * scale) + 'px';
      el.style.height          = targetH + 'px';
      el.style.backgroundImage = `url('${src}')`;
      el.style.backgroundSize  = `${Math.round(img.naturalWidth * scale)}px ${Math.round(img.naturalHeight * scale)}px`;
      el.style.backgroundPosition = '0 0';
      el.style.backgroundRepeat   = 'no-repeat';
    };
    img.src = src;
  }

  // Find a sprite path for any named speaker by scanning NPC_DEFS
  function _getSpeakerSprite(speakerName) {
    if (typeof NPC_DEFS === 'undefined') return null;
    for (const id in NPC_DEFS) {
      if (NPC_DEFS[id].name === speakerName && NPC_DEFS[id].sprite) return NPC_DEFS[id].sprite;
    }
    return null;
  }

  // Speaker → { src, side } map, built once per dialogue session
  let _npcSceneSpeakerMap = {};

  // Scan all lines and build the speaker→sprite map.
  // Skips build entirely if this NPC has already been talked to (one-time scene).
  function _buildNPCSceneLayer() {
    // Quest-flow dialogues always render scene sprites regardless of isTalked.
    // Plain repeat visits (non-quest) keep the compact panel-only look.
    if (_npcCurrent && _npcCurrent.isTalked && !_npcQuestFlow) return;
    _npcSceneSpeakerMap = {};
    _npcLines.forEach(l => {
      if (!l.speaker) return;
      const key = l.speaker.toLowerCase().replace(/\s+/g, '_');
      if (_npcSceneSpeakerMap[key]) return;
      if (_isPartySpeaker(l.speaker)) {
        const charId = l.speaker.toLowerCase().replace(/\s+/g, '_');
        _npcSceneSpeakerMap[key] = { src: `images/characters/map/sheets/${charId}_sheet.png`, side: 'left' };
      } else {
        const src = (_npcCurrent && _npcCurrent.sprite) || _getSpeakerSprite(l.speaker);
        if (src) _npcSceneSpeakerMap[key] = { src, side: 'right' };
      }
    });
  }

  // Rebuild scene layer with only the active speaker — one chibi, correct side
  function _updateNPCSceneLayer(speaker) {
    const layer = document.getElementById('npc-scene-layer');
    if (!layer) return;
    layer.innerHTML = '';
    if (!speaker) return; // narrator line — no sprite
    const sl = speaker.toLowerCase().replace(/\s+/g, '_');
    const info = _npcSceneSpeakerMap[sl];
    if (!info) return;
    const charEl = document.createElement('div');
    charEl.className = `npc-scene-char npc-side-${info.side}`;
    const spriteEl = document.createElement('div');
    spriteEl.className = 'npc-scene-sprite';
    _drawNPCSceneSprite(spriteEl, info.src, _npcSceneCharH());
    charEl.appendChild(spriteEl);
    layer.appendChild(charEl);
  }

  function _getQuestDef(id) {
    return (typeof window !== 'undefined' && window.QUESTS_DATA)
      ? (window.QUESTS_DATA.find(q => q.id === id) || null)
      : null;
  }

  function _openNPCDialogue(npc) {
    _npcCurrent = npc;
    _npcNextLast = 0;
    _npcQuestFlow = false;
    _hideQuestChoices();

    const def      = (typeof NPC_DEFS !== 'undefined') ? NPC_DEFS[npc.id] : null;
    const questIds = (def && def.quests) || [];

    // ── Quest priority flow ──────────────────────────────────────────
    if (questIds.length && typeof QuestSystem !== 'undefined') {

      // 1. Ready to submit — highest priority
      const readyId = questIds.find(id => QuestSystem.isReadyToSubmit(id));
      if (readyId) {
        const qd = _getQuestDef(readyId);
        const lines = (qd && qd.submitDialogue) || [{ speaker: npc.name || npc.id, text: 'Thank you for your help.' }];
        _npcLines = [...lines, { _type: 'submit', _questId: readyId }];
        _npcQuestFlow = true;
        _npcLineIdx = 0;
        _showNPCLine();
        return;
      }

      // 2. Quest in progress — brief check-in
      const activeId = questIds.find(id => QuestSystem.isActive(id));
      if (activeId) {
        const qd = _getQuestDef(activeId);
        const lines = (qd && qd.activeDialogue) || [{ speaker: npc.name || npc.id, text: '...' }];
        _npcLines = lines;
        _npcQuestFlow = true;
        _npcLineIdx = 0;
        _showNPCLine();
        return;
      }

      // 3. Quest available to accept
      const availableId = questIds.find(id => QuestSystem.canAccept(id));
      if (availableId) {
        const qd = _getQuestDef(availableId);
        const lines = (qd && qd.acceptDialogue) || [{ speaker: npc.name || npc.id, text: 'I could use your help...' }];
        _npcLines = [...lines, { _type: 'choice', _questId: availableId }];
        _npcQuestFlow = true;
        _npcLineIdx = 0;
        _showNPCLine();
        return;
      }
    }

    // ── Fallback: normal / repeat dialogue ───────────────────────────
    const key = npc.isTalked ? (npc.dialogueKey + '_return') : npc.dialogueKey;
    _npcLines = (def && def.dialogues && (def.dialogues[key] || def.dialogues[npc.dialogueKey]))
      || [{ speaker: npc.name || npc.id, text: '...' }];
    _npcLineIdx = 0;
    _showNPCLine();
  }

  function _hideQuestChoices() {
    const choicesEl = document.getElementById('npc-dialogue-choices');
    const nextBtn   = document.getElementById('npc-dialogue-next');
    if (choicesEl) { choicesEl.style.display = 'none'; choicesEl.innerHTML = ''; }
    if (nextBtn)   nextBtn.style.display = '';
  }

  function _showQuestChoices(line) {
    const choicesEl = document.getElementById('npc-dialogue-choices');
    const nextBtn   = document.getElementById('npc-dialogue-next');
    if (!choicesEl) return;
    if (nextBtn) nextBtn.style.display = 'none';

    const opts = line._type === 'submit'
      ? [{ label: '✔ Collect Reward', action: 'submit',  questId: line._questId, primary: true },
         { label: '✗ Not yet',        action: 'dismiss' }]
      : [{ label: '✔ Accept',         action: 'accept',  questId: line._questId, primary: true },
         { label: '✗ Maybe later',    action: 'dismiss' }];

    choicesEl.innerHTML = '';
    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'npc-choice-btn' + (opt.primary ? ' primary' : '');
      btn.textContent = opt.label;
      btn.onclick = () => _handleQuestChoice(opt);
      choicesEl.appendChild(btn);
    });
    choicesEl.style.display = 'flex';
  }

  function _handleQuestChoice(opt) {
    _hideQuestChoices();
    if (opt.action === 'accept' && opt.questId && typeof QuestSystem !== 'undefined') {
      QuestSystem.accept(opt.questId);
    } else if (opt.action === 'submit' && opt.questId && typeof QuestSystem !== 'undefined') {
      QuestSystem.submit(opt.questId);
      if (typeof SFX !== 'undefined' && SFX.buff) SFX.buff();
    }
    // dismiss — just close
    _closeNPCDialogue();
  }

  function _showNPCLine() {
    const el = document.getElementById('npc-dialogue');
    if (!el) return;
    if (_npcLineIdx >= _npcLines.length) { _closeNPCDialogue(); return; }

    // Build scene layer once on first line.
    // Quest-flow dialogues always get scene sprites, even on repeat visits.
    if (_npcLineIdx === 0) _buildNPCSceneLayer();

    const line = _npcLines[_npcLineIdx];

    // Synthetic entries — render choice UI instead of advancing text
    if (line._type === 'choice' || line._type === 'submit') {
      _showQuestChoices(line);
      el.style.display = 'flex';
      return;
    }

    const speaker = line.speaker || null;
    const isNarrator = !speaker;

    // Speaker name + color
    const nameEl = document.getElementById('npc-dialogue-name');
    if (nameEl) {
      if (isNarrator) {
        nameEl.textContent = '📖';
        nameEl.style.color = '#8070b0';
      } else {
        nameEl.textContent = speaker.toUpperCase();
        const color = (typeof Cutscene !== 'undefined' && Cutscene.SPEAKER_COLOR && Cutscene.SPEAKER_COLOR[speaker])
          || (_npcCurrent && _npcCurrent.color)
          || '#c4b5fd';
        nameEl.style.color = color;
      }
    }

    // Typewriter
    const textEl = document.getElementById('npc-dialogue-text');
    if (textEl) {
      if (typeof Cutscene !== 'undefined') Cutscene._typewrite(textEl, line.text || '');
      else textEl.textContent = line.text || '';
    }

    // Button label
    const btn = document.getElementById('npc-dialogue-next');
    if (btn) btn.textContent = (_npcLineIdx >= _npcLines.length - 1) ? '✔ CLOSE' : '▶ CONTINUE';

    // Scene layer active speaker
    _updateNPCSceneLayer(speaker);

    el.style.display = 'flex';
    if (typeof Focus !== 'undefined') Focus.setContext('npc-dialogue');
  }

  let _npcNextLast = 0;
  function npcDialogueNext() {
    const now = Date.now();
    if (now - _npcNextLast < 150) return;
    _npcNextLast = now;
    // First tap skips typewriter; second tap advances
    if (typeof Cutscene !== 'undefined' && !Cutscene._tw.done) {
      Cutscene._skipTw();
      return;
    }
    _npcLineIdx++;
    if (_npcLineIdx >= _npcLines.length) _closeNPCDialogue();
    else _showNPCLine();
  }

  function _closeNPCDialogue() {
    _hideQuestChoices();
    // Capture before reset — used below to suppress legacy giveQuest when the new
    // choice system already handled (or deliberately dismissed) a quest interaction.
    const wasQuestFlow = _npcQuestFlow;
    _npcQuestFlow = false;

    const el = document.getElementById('npc-dialogue');
    if (el) el.style.display = 'none';
    const layer = document.getElementById('npc-scene-layer');
    if (layer) layer.innerHTML = '';
    if (typeof Cutscene !== 'undefined') Cutscene._skipTw();
    if (typeof Focus !== 'undefined') Focus.setContext(null);

    // Only fire legacy completeCb / giveQuest on the very first interaction.
    // Skip giveQuest entirely when the new choice system handled this session —
    // accept/dismiss was already processed by _handleQuestChoice.
    const firstTime  = _npcCurrent && !_npcCurrent.isTalked;
    const completeCb = firstTime && _npcCurrent.onDialogueComplete;
    const giveQuest  = firstTime && !wasQuestFlow && _npcCurrent.giveQuest;
    if (_npcCurrent) {
      MapEntities.markNPCTalked(_npcCurrent.id);
      _npcCurrent._dialogueOpen = false;
      _npcCurrent = null;
    }
    // Legacy map-file giveQuest (still works for NPCs that predate the new system)
    if (giveQuest && typeof QuestSystem !== 'undefined') QuestSystem.accept(giveQuest);
    if (completeCb) completeCb();
    else resume();
  }

  // 0..1 — how far fog has progressed (used by entities to scale aggro/speed)
  function fogProgress() { return _fogProgress(); }

  function interact() {
    if (MapPlayer.moving) return;
    const ptx = MapPlayer.tx, pty = MapPlayer.ty;
    const face = MapPlayer.getFacing();
    
    // 1. Try Facing Tile
    const targetX = ptx + face.dx, targetY = pty + face.dy;
    let npc = MapEntities.checkNPCAt(targetX, targetY);

    // 2. Proximity Fallback (if facing empty tile)
    if (!npc) {
      const npcs = MapEntities.getNPCs ? MapEntities.getNPCs() : [];
      const interactDist = 1.8;
      let minDist = Infinity;
      npcs.forEach(n => {
        const dx = n.tx - ptx, dy = n.ty - pty;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < interactDist && d < minDist && !n._dialogueOpen) {
          minDist = d;
          npc = n;
        }
      });
    }

    if (npc && !npc._dialogueOpen) {
      npc._dialogueOpen = true;
      stop();
      _openNPCDialogue(npc);
    }
  }

  return {
    init, loadMap, start, stop, resume, onBattleComplete,
    getMap, getCam, getTile, isRunning, resetFog, fogProgress, npcDialogueNext,
    interact,
    isBlocked: _isBlocked,
    getFogTime: () => _fogTime,
    openDialogue: _openGenericDialogue,
    hasTriggerFired: id => _firedTriggers.has(id),
    triggerEncounter: enc => _triggerEncounter(enc),
    startWaves,
    // Scene runner API
    runScene: (scene) => _runScene(scene),
    isSceneRunning: () => _sceneRunning,
    hasFiredScene: (id) => _firedScenes.has(id) || !!(G.firedScenes && G.firedScenes.has && G.firedScenes.has(id)),
    // Optional callback — wire this up after init to handle encounter transitions:
    // MapEngine.onEncounterStart = function(enc) { ... }
    onEncounterStart: null,
  };
})();
window.MapEngine = MapEngine;