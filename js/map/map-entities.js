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

  // Sprite frame for walk cycle
  let _frame = 0;
  let _frameTimer = 0;
  const FRAME_COUNT = 4;
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

  // Cached hero sprite canvas — rebuilt when hero changes
  let _heroCanvas = null;
  let _heroKey    = '';

  function _getHeroCanvas() {
    const hero = G && G.hero;
    if (!hero) return null;
    const key = `${hero.charId}_${hero.cls?.id}`;
    if (_heroCanvas && _heroKey === key) return _heroCanvas;
    _heroKey   = key;
    _heroCanvas = SpriteRenderer.drawHeroToCanvas(hero.charId, hero.char, hero.cls);
    return _heroCanvas;
  }

  function render(ctx, cam, TILE) {
    const sx = px - cam.x;
    const sy = py - cam.y;
    const bounce = moving ? Math.sin(_frame / FRAME_COUNT * Math.PI * 2) * 2 : 0;

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(sx + TILE / 2, sy + TILE - 3, TILE * 0.25, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const spr = _getHeroCanvas();
    if (spr) {
      // Draw sprite scaled to fit tile (48x57 → ~28x33)
      const dw = Math.round(TILE * 0.72);
      const dh = Math.round(TILE * 0.85);
      const ox = Math.round((TILE - dw) / 2);
      const oy = Math.round((TILE - dh) / 2);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(spr, sx + ox, sy + oy + bounce, dw, dh);
    } else {
      // Fallback: simple colored square
      ctx.fillStyle = '#a080ff';
      ctx.fillRect(sx + 6, sy + 6 + bounce, TILE - 12, TILE - 12);
    }

    // Name tag
    if (!moving) {
      const hero = G && G.hero;
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
    reset, update, render, dpad,
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
        // Build encounter enemy list: the patrol enemy + maybe one extra
        const rawEnemy = G.enemies.find(e => e.id === en.id);
        const ids = rawEnemy ? [en.id] : [en.id];
        // Optionally add a second enemy from same map
        const mapEnemyIds = (map.enemies || []).map(e => e.id).filter(id => id !== en.id);
        if (mapEnemyIds.length && Math.random() < 0.4) {
          ids.push(mapEnemyIds[Math.floor(Math.random() * mapEnemyIds.length)]);
        }
        return { enemies: ids };
      }
    }
    return null;
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
    _enemies.forEach(en => {
      if (!en.alive) return;
      const sx = en.px - cam.x;
      const sy = en.py - cam.y;
      if (sx < -TILE || sy < -TILE || sx > ctx.canvas.width + TILE || sy > ctx.canvas.height + TILE) return;

      const bounce = en.moving ? Math.sin(en.frame / 4 * Math.PI * 2) * 2 : 0;

      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(sx + TILE / 2, sy + TILE - 3, TILE * 0.22, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // sprite (72x84 → scaled to ~26x30 in tile)
      const spr = _getEnemySprite(en.id);
      if (spr) {
        const dw = Math.round(TILE * 0.68);
        const dh = Math.round(TILE * 0.78);
        const ox = Math.round((TILE - dw) / 2);
        const oy = Math.round((TILE - dh) / 2);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(spr, sx + ox, sy + oy + bounce, dw, dh);
      }

      // aggro indicator (!) if within chase range
      const dist = Math.abs(en.tx - MapPlayer.tx) + Math.abs(en.ty - MapPlayer.ty);
      if (dist <= 3) {
        ctx.fillStyle = '#ffff40';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', sx + TILE / 2, sy + bounce - 2);
        ctx.textAlign = 'left';
      }

      // Enemy name tag (always visible, small)
      const raw = G && G.enemies && G.enemies.find(e => e.id === en.id);
      const label = raw ? raw.name.slice(0, 8) : en.id;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(sx, sy + TILE + 1, TILE, 9);
      ctx.fillStyle = '#ff8080';
      ctx.font = '6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, sx + TILE / 2, sy + TILE + 8);
      ctx.textAlign = 'left';
    });
  }

  function allCleared() {
    return _enemies.length === 0 || _enemies.every(e => !e.alive);
  }

  return { init, clear, updateEnemies, renderEnemies, checkEncounter, removeEncountered, allCleared };
})();
