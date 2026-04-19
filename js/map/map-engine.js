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

  function _updateCamera(dt) {
    if (!_map) return;
    const cw = _canvas.width, ch = _canvas.height;
    const maxX = _map.width * TILE - cw;
    const maxY = _map.height * TILE - ch;
    cam.x = Math.max(0, Math.min(maxX || 0, MapPlayer.px - cw / 2 + TILE / 2));
    cam.y = Math.max(0, Math.min(maxY || 0, MapPlayer.py - ch / 2 + TILE / 2));

    // Screen shake
    if (_shakeTime > 0) {
      if (dt) _shakeTime -= dt;
      const mag = Math.round(_shakeTime * 10);
      cam.x += (Math.random() - 0.5) * mag;
      cam.y += (Math.random() - 0.5) * mag;
    }
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
    const endC = Math.min(_map.width - 1, Math.ceil((cam.x + _canvas.width) / TILE) + 1);
    const endR = Math.min(_map.height - 1, Math.ceil((cam.y + _canvas.height) / TILE) + 1);

    for (let r = startR; r <= endR; r++) {
      for (let c = startC; c <= endC; c++) {
        const tileId = _map.tiles[r]?.[c] ?? 0;
        const def = TILE_DEFS[tileId] || TILE_DEFS[0];
        const sx = c * TILE - cam.x;
        const sy = r * TILE - cam.y;
        if (def.anim) {
          // Animated tiles painted directly each frame with current time
          _paintTile(_ctx, def, sx, sy, TILE, TILE, _time);
        } else {
          _ctx.drawImage(_getTileCanvas(tileId), sx, sy);
        }
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
    _renderTiles();
    _renderObjectiveMarkers();
    _renderCampMarker();
    _renderAtmosphere();
    MapEntities.renderEnemies(_ctx, cam, TILE, _map, _inVision.bind(null));
    MapEntities.renderNPCs(_ctx, cam, TILE, _time);
    MapPlayer.render(_ctx, cam, TILE);
    _renderFog();
    _renderObjectiveHUD();
    _renderBubbles();
    
    if (typeof WeatherEngine !== 'undefined') WeatherEngine.draw(_ctx);
    
    _renderMinimap();
  }

  /* ── Update ──────────────────────────────────────────── */
  function _update(dt) {
    if (!_map) return;
    _time += dt;
    _fogTime += dt;
    MapInput.poll();
    MapPlayer.update(dt, _map);
    MapEntities.updateEnemies(dt, _map);
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
        if (npc && !npc._dialogueOpen && !npc.talked) {
          npc._dialogueOpen = true;
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

    // Tick speech bubbles
    for (let i = _bubbles.length - 1; i >= 0; i--) {
      _bubbles[i].life -= dt;
      if (_bubbles[i].life <= 0) _bubbles.splice(i, 1);
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
    const PARTY_IDS = ['ayaka', 'hutao', 'nilou', 'xiao', 'rydia', 'lenneth', 'kain', 'leon'];
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