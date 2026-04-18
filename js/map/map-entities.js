/**
 * map-entities.js — MapPlayer, MapEnemies, MapInput.
 */

/* ── MapInput ────────────────────────────────────────── */
const MapInput = (() => {
  const keys = {};
  let _canvas = null;
  let _vec = { dx: 0, dy: 0 };

  function init(canvasEl) {
    _canvas = canvasEl;
    window.addEventListener('keydown', e => {
      keys[e.key] = true;
      const isMapRunning = (typeof MapEngine !== 'undefined' && MapEngine.isRunning && MapEngine.isRunning());
      
      // Prevent scrolling / focus shift for game keys
      if (isMapRunning && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.key)) {
        if (e.key === 'Tab' && e.repeat) return; // Prevent flickering on held Tab
        e.preventDefault();
        
        // Character cycle on Tab
        if (e.key === 'Tab' && typeof MapUI !== 'undefined') {
          MapUI.cycleCharacter();
        }
      }
    });
    window.addEventListener('keyup', e => { keys[e.key] = false; });
  }

  function setVector(dx, dy) {
    _vec.dx = dx;
    _vec.dy = dy;
  }

  function poll() {
    return {
      left:  keys['ArrowLeft']  || keys['a'] || keys['A'] || _vec.dx < -0.3,
      right: keys['ArrowRight'] || keys['d'] || keys['D'] || _vec.dx > 0.3,
      up:    keys['ArrowUp']    || keys['w'] || keys['W'] || _vec.dy < -0.3,
      down:  keys['ArrowDown']  || keys['s'] || keys['S'] || _vec.dy > 0.3,
    };
  }

  function isKey(k) { return !!keys[k]; }

  return { init, poll, isKey, setVector };
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
    if (!(TILE_DEFS[tid] || TILE_DEFS[0]).walkable) return false;
    // Block on NPCs
    if (MapEntities.checkNPCAt && MapEntities.checkNPCAt(nx, ny)) return false;
    // Block on alive enemies
    if (MapEntities.hasEnemyAt && MapEntities.hasEnemyAt(nx, ny)) return false;
    return true;
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
    const isLow   = G.settings.graphicsQuality === 'low' || (G.settings.graphicsQuality === 'auto' && window.innerWidth < 800);
    const resExt  = isLow ? '_low.webp' : '.png';
    const variant = _variantMap[charId] || '';
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

    if (variant) {
      tryLoad(`${base}${variant}${resExt}`, () =>
        tryLoad(`${base}${resExt}`, loadStaticFallback)
      );
    } else {
      tryLoad(`${base}${resExt}`, loadStaticFallback);
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

  function rescale() {
    const T = MapEngine.getTile();
    px = tx * T;
    py = ty * T;
  }

  return {
    get tx() { return tx; },
    get ty() { return ty; },
    get px() { return px; },
    get py() { return py; },
    get moving() { return moving; },
    reset, update, render, dpad, pickVariants, rescale,
  };
})();

/* ── MapEntities (patrol enemies) ────────────────────── */
const MapEntities = (() => {
  let _enemies = [];  // live enemy objects
  let _encounteredIdx = -1;

  const PATROL_SPEED = {
    horizontal: 1.5, vertical: 1.5, random: 1.2, chase: 2.0,
  };
  const AGGRO_RANGE_BASE = 4; // tiles at fog=0
  const AGGRO_RANGE_MAX  = 10; // tiles at fog=1

  // Returns current aggro range scaled by fog
  function _aggroRange() {
    const fp = (typeof MapEngine !== 'undefined' && MapEngine.fogProgress) ? MapEngine.fogProgress() : 0;
    return AGGRO_RANGE_BASE + (AGGRO_RANGE_MAX - AGGRO_RANGE_BASE) * fp;
  }

  // Returns speed multiplier scaled by fog (1x → 1.8x)
  function _fogSpeedMult() {
    const fp = (typeof MapEngine !== 'undefined' && MapEngine.fogProgress) ? MapEngine.fogProgress() : 0;
    return 1.0 + 0.8 * fp;
  }

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
      tickRate:  0.8 + Math.random() * 0.6,
      dir:       { dx: 1, dy: 0 },
      alive:     true,
      frameTimer: 0,
      frame:     0,
      // Mutation state
      mapTime:        0,           // seconds alive on this map
      mutationTick:   0,           // accumulator for per-second roll
      mutation:       null,        // null | 'corrupted' | 'mutant'
      mutationPhase:  0,           // animation phase for glow pulse
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

    if (enemy.patrol === 'chase' || dist <= _aggroRange()) {
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

  // Mutation defaults — overridden per-map via map.mutationConfig
  const MUTATION_DEFAULTS = {
    corruptThreshold: 45,
    mutantThreshold:  90,
    corruptChance:    0.040,
    mutantChance:     0.025,
  };

  // ── Mutant Trait Pool ─────────────────────────────────────────
  // Each mutant rolls 1–3 random traits from this pool.
  // Stat buff traits: applied at encounter start via stat multipliers.
  // Special traits: applied at runtime during battle (vampiric/regen/enraged/immune/shatter).
  const MUTANT_TRAITS = [
    { id: 'berserker',   label: '⚔ Berserker',  type: 'stat',    stat: 'atk',  mult: 1.40 },
    { id: 'ironhide',    label: '🛡 Ironhide',    type: 'stat',    stat: 'def',  mult: 1.50 },
    { id: 'quickened',   label: '⚡ Quickened',   type: 'stat',    stat: 'spd',  mult: 1.35 },
    { id: 'vampiric',    label: '🩸 Vampiric',    type: 'special'  },
    { id: 'regenerating',label: '💚 Regenerating',type: 'special'  },
    { id: 'enraged',     label: '🔥 Enraged',     type: 'special'  },
    // Elemental immunities — grant 0 damage from that element
    { id: 'immune_fire', label: '🔴 Fire Immune',  type: 'immune', element: 'fire'    },
    { id: 'immune_ice',  label: '🔵 Ice Immune',   type: 'immune', element: 'ice'     },
    { id: 'immune_lightning',label:'⚡ Volt Immune',type:'immune',  element: 'lightning'},
    { id: 'immune_dark', label: '🟣 Dark Immune',  type: 'immune', element: 'dark'    },
    // Elemental shatter — takes 2.0× from that element (overrides existing weakness)
    { id: 'shatter_water',label:'💧 Water Shatter',type:'shatter', element: 'water'   },
    { id: 'shatter_holy', label:'✨ Holy Shatter', type:'shatter', element: 'holy'    },
    { id: 'shatter_earth',label:'🌿 Earth Shatter',type:'shatter', element: 'earth'   },
    { id: 'shatter_wind', label:'🌀 Wind Shatter', type:'shatter', element: 'wind'    },
  ];

  function _rollMutantTraits() {
    const pool = [...MUTANT_TRAITS];
    const count = 1 + Math.floor(Math.random() * 3); // 1–3 traits
    const picked = [];
    while (picked.length < count && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    return picked;
  }

  function updateEnemies(dt, map) {
    MapNPCs.update(dt, map, _enemies);
    const TILE = MapEngine.getTile();
    _enemies.forEach(en => {
      if (!en.alive) return;

      // ── Mutation timer ────────────────────────────────
      en.mapTime       += dt;
      en.mutationPhase += dt;
      en.mutationTick  += dt;
      if (en.mutationTick >= 1.0) {
        en.mutationTick -= 1.0;
        // Read per-map config, fall back to defaults
        const mc = map.mutationConfig || MUTATION_DEFAULTS;
        const corruptThreshold = mc.corruptThreshold ?? MUTATION_DEFAULTS.corruptThreshold;
        const mutantThreshold  = mc.mutantThreshold  ?? MUTATION_DEFAULTS.mutantThreshold;
        const corruptChance    = mc.corruptChance    ?? MUTATION_DEFAULTS.corruptChance;
        const mutantChance     = mc.mutantChance     ?? MUTATION_DEFAULTS.mutantChance;

        if (en.mutation === null && en.mapTime >= corruptThreshold) {
          if (Math.random() < corruptChance) en.mutation = 'corrupted';
        } else if (en.mutation === 'corrupted' && en.mapTime >= mutantThreshold) {
          if (Math.random() < mutantChance) {
            en.mutation = 'mutant';
            en.mutantTraits = _rollMutantTraits();
          }
        }
      }

      // Fog scales movement speed — recalc moveDur each frame
      en.moveDur = (1 / en.speed) / _fogSpeedMult();
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
        return { enemies: ids, mutation: en.mutation || null, mutantTraits: en.mutantTraits || null };
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

  function renderEnemies(ctx, cam, TILE, map, inVision) {
    const _edw = Math.round(TILE * 1.1);
    const _edh = Math.round(TILE * 1.6);
    const _eox = Math.round((TILE - _edw) / 2);
    const _eoy = TILE - _edh;

    _enemies.forEach(en => {
      if (!en.alive) return;
      if (typeof inVision === 'function' && !inVision(en.tx, en.ty)) return;
      const sx = en.px - cam.x;
      const sy = en.py - cam.y;
      if (sx < -TILE || sy < -TILE || sx > ctx.canvas.width + TILE || sy > ctx.canvas.height + TILE) return;

      const bounce = en.moving ? Math.sin(en.frame / 4 * Math.PI * 2) * 3 : 0;
      const mut    = en.mutation; // null | 'corrupted' | 'mutant'

      // ── Mutation scale ───────────────────────────────
      const scale  = mut === 'mutant' ? 1.65 : mut === 'corrupted' ? 1.32 : 1.0;
      const edw    = Math.round(_edw * scale);
      const edh    = Math.round(_edh * scale);
      const eox    = Math.round((TILE - edw) / 2);
      const eoy    = TILE - edh;

      // ── Glow ring for mutated enemies ────────────────
      if (mut) {
        const pulse  = 0.5 + 0.5 * Math.sin(en.mutationPhase * (mut === 'mutant' ? 4.0 : 2.5));
        const glowR  = mut === 'mutant' ? Math.round(TILE * 0.85) : Math.round(TILE * 0.60);
        const glowC  = mut === 'mutant' ? `rgba(80,255,60,${0.25 + 0.20 * pulse})`
                                        : `rgba(160,40,255,${0.22 + 0.18 * pulse})`;
        ctx.save();
        ctx.shadowColor = mut === 'mutant' ? '#50ff3c' : '#a028ff';
        ctx.shadowBlur  = 12 + 8 * pulse;
        ctx.fillStyle   = glowC;
        ctx.beginPath();
        ctx.ellipse(sx + TILE / 2, sy + TILE - 4, glowR, glowR * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Shadow ───────────────────────────────────────
      ctx.fillStyle = mut ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(sx + TILE / 2, sy + TILE - 3, TILE * 0.35 * scale, 6 * scale * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Sprite (with optional canvas filter for mutations) ──
      const spr = _getEnemySprite(en.id);
      if (spr) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        if (mut === 'corrupted') {
          ctx.filter = 'hue-rotate(220deg) saturate(2.2) brightness(0.85)';
        } else if (mut === 'mutant') {
          // Slight wobble distortion via skew on canvas transform
          const wobble = Math.sin(en.mutationPhase * 7.0) * 0.04;
          ctx.transform(1, wobble, 0, 1, 0, 0);
          ctx.filter = 'hue-rotate(100deg) saturate(3.0) brightness(1.15) contrast(1.3)';
        }
        ctx.drawImage(spr, sx + eox, sy + eoy + bounce, edw, edh);
        ctx.restore();
      }

      // ── Aggro indicator ──────────────────────────────
      const dist = Math.abs(en.tx - MapPlayer.tx) + Math.abs(en.ty - MapPlayer.ty);
      if (dist <= _aggroRange()) {
        ctx.fillStyle = mut === 'mutant' ? '#60ff40' : mut === 'corrupted' ? '#c060ff' : '#ffff40';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(mut ? '!!' : '!', sx + TILE / 2, sy + eoy + bounce - 4);
        ctx.textAlign = 'left';
      }

      // ── Name tag ─────────────────────────────────────
      const label = mut === 'mutant'    ? `⚠ ${en.name}`
                  : mut === 'corrupted' ? `✦ ${en.name}`
                  : en.name;
      const tagCol = mut === 'mutant' ? '#80ff60' : mut === 'corrupted' ? '#cc80ff' : '#ff8080';
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(sx + eox, sy + TILE + 2, edw, 11);
      ctx.fillStyle = tagCol;
      ctx.font = mut ? 'bold 8px monospace' : '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, sx + TILE / 2, sy + TILE + 11);
      ctx.textAlign = 'left';
    });
  }

  /* ── NPC system ─────────────────────────────────────── */
  const MapNPCs = (() => {
    let _npcs = [];
    let _mapId = null;
    const _imgCache = {};

    // 8 waypoints clockwise around origin — each adjacent via a single cardinal step:
    // right → down → left → left → up → up → right → right (back to start)
    function _buildCircle(ox, oy) {
      return [
        { x: ox+1, y: oy   },  // right
        { x: ox+1, y: oy+1 },  // down
        { x: ox,   y: oy+1 },  // left
        { x: ox-1, y: oy+1 },  // left
        { x: ox-1, y: oy   },  // up
        { x: ox-1, y: oy-1 },  // up
        { x: ox,   y: oy-1 },  // right
        { x: ox+1, y: oy-1 },  // right
      ];
    }

    const NPC_MOVE_DUR  = 0.38; // seconds to slide one tile (long enough for 3-frame cycle)
    const NPC_IDLE_WAIT = 0.5;  // seconds to pause between steps

    function _initWander(n) {
      const TILE = MapEngine.getTile();
      n._wanderInited = true;
      n._ox     = n.x; n._oy = n.y;
      n._circle = _buildCircle(n.x, n.y);
      n._px     = n.x * TILE; n._py = n.y * TILE;
      n._tx     = n.x; n._ty = n.y;
      n._prevTx = n.x; n._prevTy = n.y;
      n._moveTimer  = NPC_MOVE_DUR;
      n._idleTimer  = 0;
      n._moving     = false;
      n._stepIdx    = 0;
      n._frame      = 0;
      n._frameTimer = 0;
      n._facingDx   = 0; n._facingDy = 1;
    }

    function update(dt, map, enemies) {
      const TILE = MapEngine.getTile();
      _npcs.forEach(n => {
        if (!n._wanderInited) _initWander(n);

        if (n._moving) {
          n._moveTimer += dt;
          const t = Math.min(n._moveTimer / NPC_MOVE_DUR, 1);
          n._px = n._prevTx * TILE + (n._tx * TILE - n._prevTx * TILE) * t;
          n._py = n._prevTy * TILE + (n._ty * TILE - n._prevTy * TILE) * t;

          n._frameTimer += dt;
          if (n._frameTimer >= NPC_FRAME_DUR) {
            n._frameTimer = 0;
            n._frame = (n._frame + 1) % NPC_FRAME_COUNT;
          }

          if (t >= 1) {
            n._px = n._tx * TILE; n._py = n._ty * TILE;
            n.x   = n._tx;        n.y   = n._ty;
            n._moving    = false;
            n._idleTimer = 0;
            n._frame     = 0;
          }
        } else {
          n._idleTimer += dt;
          if (n._idleTimer >= NPC_IDLE_WAIT) {
            n._idleTimer = 0;
            const wp  = n._circle[n._stepIdx % n._circle.length];
            n._stepIdx++;
            const tid = map.tiles[wp.y]?.[wp.x] ?? 0;
            if ((TILE_DEFS[tid] || TILE_DEFS[0]).walkable) {
              const dx = wp.x - n.x, dy = wp.y - n.y;
              n._prevTx = n.x; n._prevTy = n.y;
               n._tx = wp.x;    n._ty = wp.y;
               n._moveTimer = 0;
               n._moving    = true;
               n._facingDx  = dx; n._facingDy = dy;
            }
          }
        }

        if (enemies) {
          enemies.forEach(en => {
            if (en.alive && en.tx === n.x && en.ty === n.y) en.alive = false;
          });
        }
      });
    }

    function _loadImg(src) {
      const isLow = G.settings.graphicsQuality === 'low' || (G.settings.graphicsQuality === 'auto' && window.innerWidth < 800);
      let resSrc = src;
      if (isLow && src.endsWith('.png')) {
        resSrc = src.replace('.png', '_low.webp');
      }

      if (_imgCache[resSrc]) return _imgCache[resSrc];
      const img = new Image();
      img.src = resSrc;
      _imgCache[resSrc] = img;
      return img;
    }

    function init(map) {
      _mapId = map.id;
      const talkedSet = (typeof G !== 'undefined' && G.npcTalked && G.npcTalked[map.id]) || [];
      _npcs = (map.npcs || []).map(ref => {
        const def = (typeof NPC_DEFS !== 'undefined' && NPC_DEFS[ref.id]) || {};
        const dialogue = (def.dialogues && ref.dialogueKey && def.dialogues[ref.dialogueKey]) || [];
        const talked = talkedSet.includes(ref.id);
        return { ...def, ...ref, dialogue, talked };
      });
    }

    function checkInteract(map) {
      const px = MapPlayer.tx, py = MapPlayer.ty;
      return _npcs.find(n => n.x === px && n.y === py) || null;
    }

    function checkAt(x, y) {
      return _npcs.find(n => n.x === x && n.y === y) || null;
    }

    function markTalked(id) {
      const n = _npcs.find(n => n.id === id);
      if (n) {
        n.talked = true;
        if (typeof G !== 'undefined' && _mapId) {
          if (!G.npcTalked[_mapId]) G.npcTalked[_mapId] = [];
          if (!G.npcTalked[_mapId].includes(id)) G.npcTalked[_mapId].push(id);
        }
      }
    }

    // Sheet layout matches party exactly (see _getSheetDims):
    //   front: cx=0,   cy=0,   rev=false
    //   left:  cx=w/2, cy=0,   rev=true
    //   right: cx=0,   cy=h/2, rev=false
    //   back:  cx=w/2, cy=h/2, rev=false
    // Each strip has 3 frames (frameW = imgW/6)
    const NPC_FRAME_DUR   = 0.14;
    const NPC_FRAME_COUNT = 3;

    function _getNPCDir(n, img) {
      const w = img.naturalWidth, h = img.naturalHeight;
      const dx = n._facingDx !== undefined ? n._facingDx : 0;
      const dy = n._facingDy !== undefined ? n._facingDy : 1;
      if      (dy > 0)  return { cx: 0,      cy: 0,      rev: false }; // front
      else if (dy < 0)  return { cx: w / 2,  cy: h / 2,  rev: false }; // back
      else if (dx < 0)  return { cx: w / 2,  cy: 0,      rev: true  }; // left
      else              return { cx: 0,       cy: h / 2,  rev: false }; // right
    }

    function _getNPCSheetDims(img) {
      const w = img.naturalWidth, h = img.naturalHeight;
      return { frameW: w / 6, frameH: h / 2 };
    }

    function render(ctx, cam, TILE, time) {
      _npcs.forEach(n => {
        const px  = n._px !== undefined ? n._px : n.x * TILE;
        const py  = n._py !== undefined ? n._py : n.y * TILE;
        const sx  = px - cam.x;
        const sy  = py - cam.y;
        if (sx < -TILE || sy < -TILE || sx > ctx.canvas.width + TILE || sy > ctx.canvas.height + TILE) return;

        const dw  = Math.round(TILE * 1.1);
        const dh  = Math.round(TILE * 1.6);
        const ox  = Math.round((TILE - dw) / 2);
        const oy  = TILE - dh;

        const isMoving = !!n._moving;
        const bounce   = isMoving
          ? Math.sin((n._frame / NPC_FRAME_COUNT) * Math.PI * 2) * 3
          : Math.sin(time * 1.6) * 1.5;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(sx + TILE / 2, sy + TILE - 3, TILE * 0.32, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sprite — directional walk cycle matching party sheet layout
        const img = _loadImg(n.sprite);
        if (img.complete && img.naturalWidth) {
          const { frameW, frameH } = _getNPCSheetDims(img);
          const dir = _getNPCDir(n, img);
          const frameIdx = dir.rev ? (NPC_FRAME_COUNT - 1 - n._frame) : n._frame;
          const srcX = dir.cx + frameIdx * frameW;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, srcX, dir.cy, frameW, frameH, sx + ox, sy + oy + bounce, dw, dh);
        } else {
          // Loading placeholder
          ctx.fillStyle = n.color || '#a78bfa';
          ctx.beginPath();
          ctx.arc(sx + TILE / 2, sy + TILE * 0.4 + bounce, TILE * 0.28, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pulsing 💬 above head when not yet talked to
        if (!n.talked) {
          const pulse = 0.7 + 0.3 * Math.sin(time * 3.5);
          ctx.save();
          ctx.globalAlpha = pulse;
          ctx.font = `${Math.round(TILE * 0.32)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText('💬', sx + TILE / 2, sy + oy + bounce - 2);
          ctx.restore();
        }

        // Name label (same style as enemies)
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(sx + ox, sy + TILE + 2, dw, 11);
        ctx.fillStyle = n.color || '#c4b5fd';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(n.name || n.id, sx + TILE / 2, sy + TILE + 3);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
      });
    }

    return { init, update, checkInteract, checkAt, markTalked, render };
  })();

  function allCleared() {
    return _enemies.length === 0 || _enemies.every(e => !e.alive);
  }

  function remaining() {
    return _enemies.filter(e => e.alive).length;
  }

  function hasEnemyAt(x, y) {
    return _enemies.some(e => e.alive && e.tx === x && e.ty === y);
  }

  function initNPCs(map) { MapNPCs.init(map); }
  function renderNPCs(ctx, cam, TILE, time) { MapNPCs.render(ctx, cam, TILE, time); }
  function checkNPCInteract(map) { return MapNPCs.checkInteract(map); }
  function checkNPCAt(x, y) { return MapNPCs.checkAt(x, y); }
  function markNPCTalked(id) { MapNPCs.markTalked(id); }

  return { init, clear, updateEnemies, renderEnemies, checkEncounter, removeEncountered, allCleared, remaining,
           hasEnemyAt, initNPCs, renderNPCs, checkNPCInteract, checkNPCAt, markNPCTalked };
})();
