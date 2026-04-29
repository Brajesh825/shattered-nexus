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
          if (def.footprint) {
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
  function _defaultRender(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color; ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 2); ctx.fillRect(sx, sy, 2, th);
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy + th - 2, tw, 2); ctx.fillRect(sx + tw - 2, sy, 2, th);
  }

  function _paintTile(ctx, def, sx, sy, tw, th, t) {
    if (!def || def.hidden) return;
    
    // 1. Sprite Support (High Fidelity)
    if (def.svgAsset) {
      const svg = AssetPreloader.getImage(`env_${def.svgAsset}`);
      if (svg) {
        ctx.drawImage(svg, sx, sy, tw, th);
        return;
      }
    }

    if (def.sprite || def.spriteIdx !== undefined) {
      const sheet = AssetPreloader.getImage('env_sprites');
      if (sheet) {
        let sw, sh, sx_src, sy_src, frames;

        if (def.spriteIdx !== undefined) {
          // Standard 6x6 grid calculation
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

    // 2. Procedural / Procedural-Fallback
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
          const scale = def.vScale || 1.0;
          const ox = (def.vOffset?.x || 0);
          const oy = (def.vOffset?.y || 0);
          const dw = TILE * scale;
          const dh = TILE * scale;
          
          let dx = sx + ox;
          const dy = sy + (TILE - dh) + oy;

          // Default to Bottom-Center if not specified as Bottom-Left
          if (def.anchor !== 'bottom-left') {
              dx += (TILE - dw) / 2;
          }

          if (def.svgAsset) {
              const img = AssetPreloader.getImage(`env_${def.svgAsset}`);
              if (img) _ctx.drawImage(img, dx, dy, dw, dh);
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
        const tid = MapData.getTileAt(_map, MapPlayer.tx, MapPlayer.ty);
        SFX.footstep(_tileToSurface(tid));
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

    // Manual Interaction check (Space/Enter)
    if (MapInput.isKey(' ') || MapInput.isKey('Enter')) {
      interact();
    }

    // Objective check each frame
    _checkObjective();

    // Region triggers check
    _checkRegionTriggers();

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
        }
      }
    });
  }

  function _openGenericDialogue(lines) {
    _npcCurrent = { id: 'system', name: '', sprite: null };
    _npcLines = lines;
    _npcLineIdx = 0;
    stop();
    _showNPCLine();
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
    MapEntities.removeEncountered();
    showScreen('explore-screen');
    MapPlayer.setCooldown(8); // Grace period
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
        if (typeof MapUI !== 'undefined') MapUI.cycleCharacter();
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
    const def = (typeof NPC_DEFS !== 'undefined') ? NPC_DEFS[npc.id] : null;
    _npcLines = (def && def.dialogues && def.dialogues[npc.dialogueKey]) || [{ speaker: npc.name || npc.id, text: '...' }];
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
      } else if (_npcCurrent && _npcCurrent.sprite) {
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
      } else {
        portrait.style.display = 'none';
      }
    }
    document.getElementById('npc-dialogue-name').textContent =
      (line.speaker || (_npcCurrent && _npcCurrent.name) || '').toUpperCase();
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
    openDialogue: _openGenericDialogue,
    hasTriggerFired: id => _firedTriggers.has(id),
    // Optional callback — wire this up after init to handle encounter transitions:
    // MapEngine.onEncounterStart = function(enc) { ... }
    onEncounterStart: null,
  };
})();