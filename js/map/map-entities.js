/**
 * map-entities.js — MapPlayer, MapEnemies, MapInput.
 */

/* ── MapInput ────────────────────────────────────────── */
const MapInput = (() => {
  const keys = {};
  let _canvas = null;

  function init(canvasEl) {
    _canvas = canvasEl;
    window.addEventListener('keydown', e => {
      keys[e.key] = true;
      // Suppress arrow key scrolling while map is active
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key) &&
          MapEngine && MapEngine.isRunning && MapEngine.isRunning()) {
        e.preventDefault();
      }
      // Tab — cycle active party member
      if (e.key === 'Tab' && MapEngine && MapEngine.isRunning && MapEngine.isRunning()) {
        e.preventDefault();
        if (typeof MapUI !== 'undefined') MapUI.cycleCharacter();
      }
    });
    window.addEventListener('keyup', e => { keys[e.key] = false; });
  }

  // Returns {dx, dy} based on held keys — called each frame
  function poll() {
    return {
      left:  keys['ArrowLeft']  || keys['a'] || keys['A'],
      right: keys['ArrowRight'] || keys['d'] || keys['D'],
      up:    keys['ArrowUp']    || keys['w'] || keys['W'],
      down:  keys['ArrowDown']  || keys['s'] || keys['S'],
    };
  }

  function isKey(k) { return !!keys[k]; }

  return { init, poll, isKey };
})();

/* ── MapPlayer ───────────────────────────────────────── */
const MapPlayer = (() => {
  const SPEED = 5; // tiles per second
  let tx = 0, ty = 0;    // tile position (integer)
  let px = 0, py = 0;    // pixel position (interpolated)
  let moving = false;
  let moveTimer = 0;
  const MOVE_DURATION = 0.15; // seconds per tile step

  // Queued direction while moving
  let _queuedDir = null;
  let _stepDir   = null; // {dx,dy} of current step

  // Last known facing direction (persists when idle)
  let _facing = { dx: 0, dy: 1 }; // default: facing down

  // Sprite frame for walk cycle
  let _frame = 0;
  let _frameTimer = 0;
  const FRAME_COUNT = 3;
  const FRAME_DUR   = 0.12;

  function reset(startX, startY) {
    tx = startX; ty = startY;
    px = tx * MapEngine.getTile();
    py = ty * MapEngine.getTile();
    moving = false; moveTimer = 0;
    _queuedDir = null; _stepDir = null;
    _frame = 0; _frameTimer = 0;
  }

  function _canMove(nx, ny, map) {
    if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) return false;
    const tid = map.tiles[ny]?.[nx] ?? 0;
    return (TILE_DEFS[tid] || TILE_DEFS[0]).walkable;
  }

  function update(dt, map) {
    const TILE = MapEngine.getTile();

    if (moving) {
      moveTimer += dt;
      const t = Math.min(moveTimer / MOVE_DURATION, 1);
      const prevPx = (tx - _stepDir.dx) * TILE;
      const prevPy = (ty - _stepDir.dy) * TILE;
      px = prevPx + (tx * TILE - prevPx) * t;
      py = prevPy + (ty * TILE - prevPy) * t;

      _frameTimer += dt;
      if (_frameTimer >= FRAME_DUR) { _frameTimer = 0; _frame = (_frame + 1) % FRAME_COUNT; }

      if (moveTimer >= MOVE_DURATION) {
        px = tx * TILE; py = ty * TILE;
        moving = false; moveTimer = 0;
        // Apply queued direction immediately
        if (_queuedDir) {
          const d = _queuedDir; _queuedDir = null;
          _tryMove(d.dx, d.dy, map);
        }
      }
    } else {
      const dir = MapInput.poll();
      let dx = 0, dy = 0;
      if      (dir.left)  dx = -1;
      else if (dir.right) dx =  1;
      else if (dir.up)    dy = -1;
      else if (dir.down)  dy =  1;
      if (dx !== 0 || dy !== 0) _tryMove(dx, dy, map);
    }
  }

  function _tryMove(dx, dy, map) {
    if (moving) { _queuedDir = {dx, dy}; return; }
    const nx = tx + dx, ny = ty + dy;
    if (_canMove(nx, ny, map)) {
      _stepDir = {dx, dy};
      _facing  = {dx, dy}; // update facing when actually moving
      tx = nx; ty = ny;
      moving = true; moveTimer = 0;
    }
  }

  // Called from MapUI d-pad
  function dpad(dx, dy) {
    if (!MapEngine.isRunning()) return; // ignore d-pad while map is stopped
    const map = MapEngine.getMap();
    if (!map) return;
    _tryMove(dx, dy, map);
  }

  // Spritesheet layout — 2×2 grid of directions, 3 frames each.
  // Supports any resolution (4K=4096×2048, 2K=2048×1024, 1K=1024×512, etc.)
  // Dimensions are derived from the loaded image at runtime.
  //
  // Grid layout (column × row):
  //   front  col:0, row:0 → [idle, walk1, walk2]   animate 0→1→2
  //   left   col:1, row:0 → [walk2, walk1, idle]   animate REVERSED
  //   right  col:0, row:1 → [idle, walk1, walk2]   animate 0→1→2
  //   back   col:1, row:1 → [idle, walk1, walk2]   animate 0→1→2
  //
  // Computed per-sheet: frameW = imgW/6, frameH = imgH/2
  // Strip offsets:  front=(0,0), left=(imgW/2,0), right=(0,imgH/2), back=(imgW/2,imgH/2)

  function _getSheetDims(img) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const frameW = w / 6;        // 3 frames across half the sheet width
    const frameH = h / 2;        // strip height = half the sheet height
    return {
      frameW, frameH,
      dirs: {
        front: { cx: 0,      cy: 0,      rev: false },
        left:  { cx: w / 2,  cy: 0,      rev: true  },
        right: { cx: 0,      cy: h / 2,  rev: false },
        back:  { cx: w / 2,  cy: h / 2,  rev: false },
      },
    };
  }

  // charId → chosen variant suffix for this map session e.g. '_3' or ''
  const _variantMap = {};
  const MAX_VARIANTS = 20;

  // Called once per map load — picks a random variant for every party member
  function pickVariants() {
    Object.keys(_variantMap).forEach(k => delete _variantMap[k]);
    // Clear cache so new variants are loaded fresh
    Object.keys(_heroImgCache).forEach(k => delete _heroImgCache[k]);
    if (!G || !G.party) return;
    G.party.forEach(m => {
      if (!m || !m.charId) return;
      const n = Math.floor(Math.random() * MAX_VARIANTS) + 1; // 1–20
      _variantMap[m.charId] = `_${n}`;
    });
  }

  // Cache: charId → { sheet, loaded, staticFallback }
  const _heroImgCache = {};

  function _loadHeroImgs(charId, hero) {
    if (_heroImgCache[charId]) return _heroImgCache[charId];

    const entry = { sheet: null, loaded: false, staticFallback: null };
    _heroImgCache[charId] = entry;

    const suffix  = _variantMap[charId] || '';
    const base    = `images/characters/map/sheets/${charId}_sheet`;

    // Attempt load order: variant → base sheet → static png → pixel fallback
    function tryLoad(src, onFail) {
      const img = new Image();
      img.onload  = () => { entry.sheet = img; entry.loaded = true; };
      img.onerror = onFail;
      img.src = src;
    }

    function loadStaticFallback() {
      entry.loaded = true;
      const fb = new Image();
      fb.onload  = () => { entry.staticFallback = fb; };
      fb.onerror = () => {
        entry.staticFallback = SpriteRenderer.drawHeroToCanvas(charId, hero.char, hero.cls);
      };
      fb.src = `images/characters/map/${charId}.png`;
    }

    if (suffix) {
      // Try variant first, fall back to base sheet, then static
      tryLoad(`${base}${suffix}.png`, () =>
        tryLoad(`${base}.png`, loadStaticFallback)
      );
    } else {
      tryLoad(`${base}.png`, loadStaticFallback);
    }

    return entry;
  }

  // Returns { sheet, dims, cx, cy, rev, flipX } — cx/cy are the top-left of the direction strip
  function _getSpriteInfo(charId, hero) {
    const c = _loadHeroImgs(charId, hero);

    if (c.sheet) {
      const dims = _getSheetDims(c.sheet);
      let dir;
      if      (_facing.dy < 0) dir = dims.dirs.back;
      else if (_facing.dx < 0) dir = dims.dirs.left;
      else if (_facing.dx > 0) dir = dims.dirs.right;
      else                      dir = dims.dirs.front;
      return { sheet: c.sheet, dims, ...dir, flipX: false };
    }

    // Static fallback
    return { sheet: null, staticImg: c.staticFallback, flipX: false };
  }

  function render(ctx, cam, TILE) {
    const sx = px - cam.x;
    const sy = py - cam.y;
    const bounce = moving ? Math.sin(_frame / FRAME_COUNT * Math.PI * 2) * 2 : 0;

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(sx + TILE / 2, sy + TILE - 3, TILE * 0.38, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const hero = G && G.hero;
    const info = hero ? _getSpriteInfo(hero.charId, hero) : null;

    const dw = Math.round(TILE * 1.2);
    const dh = Math.round(TILE * 2.0);
    const ox = Math.round((TILE - dw) / 2);
    const oy = Math.round(TILE - dh);       // anchor bottom of sprite to tile bottom

    if (info && info.sheet) {
      // Left strip is stored reversed (walk2,walk1,idle), so mirror the index
      const frameIdx = info.rev ? (FRAME_COUNT - 1 - _frame) : _frame;
      const srcX = info.cx + frameIdx * info.dims.frameW;
      const srcY = info.cy;

      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      if (info.flipX) {
        ctx.translate(sx + TILE / 2, sy);
        ctx.scale(-1, 1);
        ctx.drawImage(info.sheet, srcX, srcY, info.dims.frameW, info.dims.frameH, -dw / 2, oy + bounce, dw, dh);
      } else {
        ctx.drawImage(info.sheet, srcX, srcY, info.dims.frameW, info.dims.frameH, sx + ox, sy + oy + bounce, dw, dh);
      }
      ctx.restore();
    } else if (info && info.staticImg) {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(info.staticImg, sx + ox, sy + oy + bounce, dw, dh);
      ctx.restore();
    } else {
      // Fallback: simple colored square
      ctx.fillStyle = '#a080ff';
      ctx.fillRect(sx + 6, sy + 6 + bounce, TILE - 12, TILE - 12);
    }

    // Name tag
    if (!moving) {
      if (hero) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(sx + 1, sy - 12, TILE - 2, 10);
        ctx.fillStyle = '#e0d0ff';
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText((hero.displayName || '?').slice(0, 6), sx + TILE / 2, sy - 4);
        ctx.textAlign = 'left';
      }
    }
  }

  return {
    get tx() { return tx; },
    get ty() { return ty; },
    get px() { return px; },
    get py() { return py; },
    get moving() { return moving; },
    reset, update, render, dpad, pickVariants,
  };
})();

/* ── MapEntities (patrol enemies) ────────────────────── */
const MapEntities = (() => {
  let _enemies = [];  // live enemy objects
  let _encounteredIdx = -1;

  const PATROL_SPEED = {
    horizontal: 1.5, vertical: 1.5, random: 1.2, chase: 2.0,
  };
  const AGGRO_RANGE = 4; // tiles — chase aggro distance

  function init(map) {
    _enemies = (map.enemies || []).map((e, i) => ({
      id:      e.id,
      idx:     i,
      name:    (() => { const d = G && G.enemies && G.enemies.find(r => r.id === e.id); return d ? d.name.slice(0, 8) : e.id; })(),
      tx:      e.x,  ty:    e.y,   // current tile
      ox:      e.x,  oy:    e.y,   // origin tile
      px:      e.x * MapEngine.getTile(),
      py:      e.y * MapEngine.getTile(),
      patrol:  e.patrol || 'random',
      range:   e.range  || 3,
      speed:   e.speed  || 1.2,
      moveTimer: 0,
      moveDur:   1 / (e.speed || 1.2),
      moving:    false,
      stepDir:   { dx: 0, dy: 0 },
      tickTimer: 0,
      tickRate:  0.8 + Math.random() * 0.6, // seconds between decision
      dir:       { dx: 1, dy: 0 },
      alive:     true,
      frameTimer: 0,
      frame:     0,
    }));
    _encounteredIdx = -1;
  }

  function clear() { _enemies = []; _encounteredIdx = -1; }

  function removeEncountered() {
    if (_encounteredIdx >= 0 && _encounteredIdx < _enemies.length) {
      _enemies[_encounteredIdx].alive = false;
    }
    _encounteredIdx = -1;
  }

  function _canMoveTo(tx, ty, map) {
    if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return false;
    const tid = map.tiles[ty]?.[tx] ?? 0;
    return (TILE_DEFS[tid] || TILE_DEFS[0]).walkable;
  }

  function _decideMove(enemy, map) {
    const px = MapPlayer.tx, py2 = MapPlayer.ty;
    const dist = Math.abs(enemy.tx - px) + Math.abs(enemy.ty - py2);

    if (enemy.patrol === 'chase' || dist <= AGGRO_RANGE) {
      // Chase player
      const dx = Math.sign(px - enemy.tx);
      const dy = Math.sign(py2 - enemy.ty);
      const opts = [];
      if (dx !== 0 && _canMoveTo(enemy.tx + dx, enemy.ty, map)) opts.push({dx, dy:0});
      if (dy !== 0 && _canMoveTo(enemy.tx, enemy.ty + dy, map)) opts.push({dx:0, dy});
      if (opts.length) return opts[Math.floor(Math.random() * opts.length)];
    }

    if (enemy.patrol === 'horizontal') {
      // Move along X within range of origin
      const ndx = enemy.dir.dx || 1;
      const nx = enemy.tx + ndx;
      if (Math.abs(nx - enemy.ox) <= enemy.range && _canMoveTo(nx, enemy.ty, map)) {
        return { dx: ndx, dy: 0 };
      } else {
        enemy.dir.dx = -ndx;
        return { dx: 0, dy: 0 };
      }
    } else if (enemy.patrol === 'vertical') {
      const ndy = enemy.dir.dy || 1;
      const ny = enemy.ty + ndy;
      if (Math.abs(ny - enemy.oy) <= enemy.range && _canMoveTo(enemy.tx, ny, map)) {
        return { dx: 0, dy: ndy };
      } else {
        enemy.dir.dy = -ndy;
        return { dx: 0, dy: 0 };
      }
    } else {
      // Random patrol within range
      const dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];
      const valid = dirs.filter(d => {
        const nx2 = enemy.tx + d.dx, ny2 = enemy.ty + d.dy;
        return Math.abs(nx2 - enemy.ox) <= enemy.range
            && Math.abs(ny2 - enemy.oy) <= enemy.range
            && _canMoveTo(nx2, ny2, map);
      });
      return valid.length ? valid[Math.floor(Math.random() * valid.length)] : { dx: 0, dy: 0 };
    }
  }

  function updateEnemies(dt, map) {
    const TILE = MapEngine.getTile();
    _enemies.forEach(en => {
      if (!en.alive) return;
      if (en.moving) {
        en.moveTimer += dt;
        const t = Math.min(en.moveTimer / en.moveDur, 1);
        en.px = (en.tx - en.stepDir.dx) * TILE * (1 - t) + en.tx * TILE * t;
        en.py = (en.ty - en.stepDir.dy) * TILE * (1 - t) + en.ty * TILE * t;
        en.frameTimer += dt;
        if (en.frameTimer >= 0.15) { en.frameTimer = 0; en.frame = (en.frame + 1) % 4; }
        if (en.moveTimer >= en.moveDur) {
          en.px = en.tx * TILE; en.py = en.ty * TILE;
          en.moving = false; en.moveTimer = 0;
        }
      } else {
        en.tickTimer += dt;
        if (en.tickTimer >= en.tickRate) {
          en.tickTimer = 0;
          const d = _decideMove(en, map);
          if (d.dx !== 0 || d.dy !== 0) {
            en.stepDir = d;
            en.tx += d.dx; en.ty += d.dy;
            en.moving = true; en.moveTimer = 0;
          }
        }
      }
    });
  }

  function checkEncounter(map) {
    const ptx = MapPlayer.tx, pty = MapPlayer.ty;
    for (let i = 0; i < _enemies.length; i++) {
      const en = _enemies[i];
      if (!en.alive) continue;
      if (en.tx === ptx && en.ty === pty) {
        _encounteredIdx = i;
        const ids = _buildEncounterGroup(en.id, map);
        return { enemies: ids };
      }
    }
    return null;
  }

  // Build a 1–4 enemy encounter group from the triggered enemy + map pool
  function _buildEncounterGroup(triggerId, map) {
    const mapEnemyIds = (map.encounters || map.enemies || []).map(e => e.id);
    const pool        = mapEnemyIds.length ? mapEnemyIds : [triggerId];

    // Use encounter templates if defined on the map, else roll random group size
    if (map.encounterTemplates && map.encounterTemplates.length) {
      // Weighted random pick of a template
      const total  = map.encounterTemplates.reduce((s, t) => s + (t.weight || 1), 0);
      let roll     = Math.random() * total;
      for (const tmpl of map.encounterTemplates) {
        roll -= (tmpl.weight || 1);
        if (roll <= 0) return tmpl.enemies.slice(0, 4);
      }
    }

    // Fallback: triggered enemy is always first; roll group size 1–4
    const r = Math.random();
    let groupSize;
    if      (r < 0.25) groupSize = 1;   // 25% solo
    else if (r < 0.60) groupSize = 2;   // 35% pair
    else if (r < 0.85) groupSize = 3;   // 25% trio
    else               groupSize = 4;   // 15% quad (horde)

    const ids = [triggerId];
    while (ids.length < groupSize) {
      ids.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return ids;
  }

  // Sprite cache: enemyId → offscreen canvas
  const _spriteCache = {};

  function _getEnemySprite(id) {
    if (_spriteCache[id]) return _spriteCache[id];
    // Find palette from G.enemies
    const raw = G && G.enemies && G.enemies.find(e => e.id === id);
    const palette = (raw && raw.palette) ? raw.palette : {
      body: '#a04040', dark: '#601010', shine: '#d06060', eye: '#ffffff', pupil: '#200000',
    };
    _spriteCache[id] = SpriteRenderer.drawEnemyToCanvas(id, palette);
    return _spriteCache[id];
  }

  function renderEnemies(ctx, cam, TILE, map) {
    const _edw = Math.round(TILE * 1.1);
    const _edh = Math.round(TILE * 1.6);
    const _eox = Math.round((TILE - _edw) / 2);
    const _eoy = TILE - _edh;   // anchor bottom to tile bottom
    _enemies.forEach(en => {
      if (!en.alive) return;
      const sx = en.px - cam.x;
      const sy = en.py - cam.y;
      if (sx < -TILE || sy < -TILE || sx > ctx.canvas.width + TILE || sy > ctx.canvas.height + TILE) return;

      const bounce = en.moving ? Math.sin(en.frame / 4 * Math.PI * 2) * 3 : 0;

      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(sx + TILE / 2, sy + TILE - 3, TILE * 0.35, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      const spr = _getEnemySprite(en.id);
      if (spr) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(spr, sx + _eox, sy + _eoy + bounce, _edw, _edh);
      }

      const dist = Math.abs(en.tx - MapPlayer.tx) + Math.abs(en.ty - MapPlayer.ty);
      if (dist <= AGGRO_RANGE) {
        ctx.fillStyle = '#ffff40';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', sx + TILE / 2, sy + _eoy + bounce - 4);
        ctx.textAlign = 'left';
      }

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(sx + _eox, sy + TILE + 2, _edw, 11);
      ctx.fillStyle = '#ff8080';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(en.name, sx + TILE / 2, sy + TILE + 11);
      ctx.textAlign = 'left';
    });
  }

  function allCleared() {
    return _enemies.length === 0 || _enemies.every(e => !e.alive);
  }

  return { init, clear, updateEnemies, renderEnemies, checkEncounter, removeEncountered, allCleared };
})();
