/**
 * sprites.js — Shattered Nexus
 * Hand-crafted pixel art renderer for all characters and enemies.
 * Uses canvas 2D API with a 3px-per-pixel grid system.
 */
const SpriteRenderer = (() => {

  function p(ctx, x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x * 3, y * 3, w * 3, h * 3);
  }

  // ─── HERO SPRITES ──────────────────────────────────────────────
  // Canvas: 48x57  (16×19 grid @ 3px)
  // char: character data,  cls: class data

  const HEROES = {

    aya(ctx, char, cls) {
      const sc = char.skin_color, hc = char.hair_color, ac = cls ? cls.color : char.armor_color;
      // Hair (long, flowing)
      p(ctx, 4, 0, 8, 4, hc);
      p(ctx, 2, 3, 2, 10, hc);  // left side hair
      p(ctx, 12, 3, 2, 10, hc);  // right side hair
      p(ctx, 3, 0, 1, 2, hc);
      // Head
      p(ctx, 4, 2, 8, 5, sc);
      // Eyes (almond shaped)
      p(ctx, 5, 4, 2, 1, '#301010');
      p(ctx, 9, 4, 2, 1, '#301010');
      p(ctx, 5, 4, 1, 1, '#e06070');  // iris left
      p(ctx, 9, 4, 1, 1, '#e06070');  // iris right
      p(ctx, 6, 3, 1, 1, '#ffffff');  // glint l
      p(ctx, 10, 3, 1, 1, '#ffffff');  // glint r
      // Small nose / lips
      p(ctx, 7, 5, 1, 1, '#d09080');
      p(ctx, 7, 6, 2, 1, '#e08080');
      // Scarf / neck
      p(ctx, 4, 7, 8, 2, '#d04060');
      // Torso (light armor)
      p(ctx, 4, 9, 8, 5, ac);
      p(ctx, 3, 9, 1, 5, '#ffffff');  // chest trim
      // Belt
      p(ctx, 3, 13, 10, 2, '#7a3010');
      p(ctx, 5, 14, 2, 1, '#f0c040');  // buckle
      // Sleeves
      p(ctx, 2, 9, 2, 6, ac);
      p(ctx, 12, 9, 2, 6, sc);   // bare right arm
      // Glove
      p(ctx, 2, 14, 2, 2, '#c03040');
      // Legs
      p(ctx, 4, 15, 3, 4, '#301830');
      p(ctx, 9, 15, 3, 4, '#301830');
      // Boots
      p(ctx, 3, 17, 4, 2, '#401020');
      p(ctx, 9, 17, 4, 2, '#401020');
      // Dagger (right hip)
      p(ctx, 13, 10, 1, 8, '#c0c0c0');
      p(ctx, 12, 12, 3, 1, '#804010');
      p(ctx, 13, 9, 1, 2, '#e0e0e0');
    }
  };

  // ─── ENEMY SPRITES ─────────────────────────────────────────────
  // Canvas: 72x84  (24×28 grid @ 3px)

  const ENEMIES = {
    slime(ctx, pal) {
      // Body (round blob shape)
      p(ctx, 7, 8, 10, 4, pal.body);
      p(ctx, 5, 7, 14, 6, pal.body);
      p(ctx, 4, 6, 16, 8, pal.body);
      p(ctx, 3, 5, 18, 10, pal.body);
      p(ctx, 4, 15, 16, 3, pal.body);
      p(ctx, 5, 17, 14, 2, pal.body);
      p(ctx, 7, 18, 10, 2, pal.body);
      // Dark underside (ground shadow)
      p(ctx, 5, 15, 14, 2, pal.dark);
      p(ctx, 7, 17, 10, 2, pal.dark);
      p(ctx, 8, 18, 8, 1, pal.dark);
      // Shine top-left
      p(ctx, 7, 6, 4, 2, pal.shine);
      p(ctx, 6, 7, 2, 3, pal.shine);
      p(ctx, 8, 5, 3, 2, pal.shine);
      // Bubble highlights
      p(ctx, 14, 7, 2, 2, pal.shine);
      p(ctx, 17, 9, 2, 2, pal.shine);
      // Eyes (cute)
      p(ctx, 8, 9, 3, 4, pal.eye);
      p(ctx, 13, 9, 3, 4, pal.eye);
      p(ctx, 9, 10, 2, 2, pal.pupil);
      p(ctx, 14, 10, 2, 2, pal.pupil);
      // Eye glints
      p(ctx, 9, 9, 1, 1, '#ffffff');
      p(ctx, 14, 9, 1, 1, '#ffffff');
      // Mouth (grin)
      p(ctx, 9, 14, 6, 1, pal.dark);
      p(ctx, 10, 15, 4, 1, pal.dark);
      p(ctx, 9, 15, 1, 1, pal.dark);
      p(ctx, 14, 15, 1, 1, pal.dark);
      // Drips
      p(ctx, 6, 18, 2, 3, pal.body);
      p(ctx, 7, 20, 1, 2, pal.dark);
      p(ctx, 16, 17, 2, 4, pal.body);
      p(ctx, 16, 20, 1, 2, pal.dark);
    }
  };

  // ─── PUBLIC API ────────────────────────────────────────────────

  const SHEET_COLS = 3;
  const SHEET_ROWS = 2;

  const FRAME_MAP = {
    idle: [0, 0],
    prepare: [1, 0],
    attack: [2, 0],
    magic: [0, 1],
    hurt: [1, 1],
    fallen: [2, 1]
  };

  const ROSTER_CONFIG = {
    aya: ['aya'],
    tao: ['tao'],
    lulu: ['lulu'],
    rei: ['rei'],
    ria: ['ria'],
    valka: ['valka'],
    drake: ['drake'],
    rex: ['rex'],
    sera: ['sera'],
    lyra: ['lyra']
  };

  const SPRITE_MANIFEST = {};
  const ANIMATED_SEARCH_INDEX = [];

  Object.entries(ROSTER_CONFIG).forEach(([baseId, data]) => {
    const config = {
      baseId: baseId,
      cols: SHEET_COLS,
      rows: SHEET_ROWS
    };

    const forms = Array.isArray(data) ? data : data.forms;
    forms.forEach(f => {
      SPRITE_MANIFEST[f] = config;
      ANIMATED_SEARCH_INDEX.push(f);
    });
  });

  function drawHero(imgEl, charId, charData, classData) {
    const id = charId.toLowerCase();
    const config = SPRITE_MANIFEST[id];
    const isAnimated = !!config;

    // Always use the baseId for the filename
    const fileBase = isAnimated ? config.baseId : id;
    const fileName = isAnimated ? `${fileBase}_sprite.png` : `${fileBase}_spirit.png`;
    const pngPath = `images/characters/spirits/${fileName}`;

    if (isAnimated) {
      imgEl.dataset.animated = 'true';
      imgEl.dataset.spriteSheet = pngPath;
      imgEl.dataset.charId = id;
      imgEl.classList.add('party-sprite-animated');
    }

    const test = new Image();
    test.onload = () => {
      if (!isAnimated) {
        imgEl.style.backgroundImage = `url(${pngPath})`;
        imgEl.style.backgroundSize = 'contain';
        imgEl.style.backgroundPosition = 'bottom center';
        imgEl.style.backgroundRepeat = 'no-repeat';
      }
    };
    test.onerror = () => {
      if (!isAnimated) {
        // Fallback: render via canvas → dataURL
        const canvas = document.createElement('canvas');
        canvas.width = 48; canvas.height = 57;
        const ctx = canvas.getContext('2d');
        HEROES['aya'](ctx, charData, classData);
        imgEl.style.backgroundImage = `url(${canvas.toDataURL()})`;
        imgEl.style.backgroundSize = 'contain';
        imgEl.style.backgroundPosition = 'bottom center';
        imgEl.style.backgroundRepeat = 'no-repeat';
      }
    };
    test.src = pngPath;
  }

  function drawEnemy(imgEl, enemyId, palette) {
    const webpPath = `images/enemies/${enemyId}.webp`;
    const test = new Image();
    test.onload = () => { imgEl.src = webpPath; };
    test.onerror = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 72; canvas.height = 84;
      const ctx = canvas.getContext('2d');
      ENEMIES['slime'](ctx, palette);
      imgEl.src = canvas.toDataURL();
    };
    test.src = webpPath;
  }

  function drawHeroToCanvas(charId, charData, classData) {
    const canvas = document.createElement('canvas');
    canvas.width = 48; canvas.height = 57;
    const ctx = canvas.getContext('2d');
    HEROES['aya'](ctx, charData, classData);
    return canvas;
  }

  function drawEnemyToCanvas(enemyId, palette) {
    const canvas = document.createElement('canvas');
    canvas.width = 72; canvas.height = 84;
    const ctx = canvas.getContext('2d');
    ENEMIES['slime'](ctx, palette);
    return canvas;
  }

  function setFrame(el, charId, frameNameOrCoords, customHeight = 0) {
    if (!el) return;
    const id = charId.toLowerCase();
    const manifest = SPRITE_MANIFEST[id];

    if (!manifest) {
      el.style.backgroundImage = `url(images/characters/spirits/${id}_sprite.png)`;
      el.style.backgroundSize = 'contain';
      el.style.backgroundPosition = 'bottom center';
      el.style.backgroundRepeat = 'no-repeat';
      return;
    }

    const coords = Array.isArray(frameNameOrCoords) ? frameNameOrCoords : (FRAME_MAP[frameNameOrCoords] || FRAME_MAP.idle);
    const col = Math.max(0, Math.min(manifest.cols - 1, coords[0] || 0));
    const row = Math.max(0, Math.min(manifest.rows - 1, coords[1] || 0));
    const posX = manifest.cols === 1 ? 0 : (col / (manifest.cols - 1)) * 100;
    const posY = manifest.rows === 1 ? 0 : (row / (manifest.rows - 1)) * 100;

    el.style.backgroundImage = `url(${getSpritePath(manifest.baseId)})`;
    if (typeof customHeight === 'string') {
      el.style.width = customHeight;
      el.style.height = customHeight;
    } else {
      const baseHeight = customHeight || (el.offsetHeight > 0 ? el.offsetHeight : 128);
      el.style.width = `${baseHeight}px`;
      el.style.height = `${baseHeight}px`;
    }
    el.style.backgroundSize = `${manifest.cols * 100}% ${manifest.rows * 100}%`;
    el.style.backgroundPosition = `${posX}% ${posY}%`;
    el.style.backgroundRepeat = 'no-repeat';

    if (typeof frameNameOrCoords === 'string') {
      const frames = ['frame-idle', 'frame-prepare', 'frame-attack', 'frame-magic', 'frame-hurt', 'frame-fallen'];
      frames.forEach(f => el.classList.remove(f));
      el.classList.add('frame-' + frameNameOrCoords);
    }
  }

  function getSuffix() {
    const qual = (typeof Settings !== 'undefined' ? Settings.getQuality() : (G.settings?.graphicsQuality || 'high'));
    const style = (typeof Settings !== 'undefined' ? Settings.getStyle() : (G.settings?.style || 'illustrious'));

    const isIllustrious = style === 'illustrious';
    const isLow = qual === 'low' || (qual === 'auto' && window.innerWidth < 800);

    if (isIllustrious) return isLow ? '_sprite_1_low.webp' : '_sprite_1.png';
    return isLow ? '_sprite_low.webp' : '_sprite.png';
  }

  function getSpritePath(charId) {
    const id = charId.toLowerCase();
    const manifest = SPRITE_MANIFEST[id];
    const baseId = manifest ? manifest.baseId : id;
    return `images/characters/spirits/${baseId}${getSuffix()}`;
  }

  function registerHero(id, fn) { HEROES[id] = fn; }
  function registerEnemy(id, fn) { ENEMIES[id] = fn; }

  function refreshGlobalSprites() {
    console.log('[SpriteRenderer] Global refresh triggered.');
    document.querySelectorAll('.party-sprite').forEach(el => {
      el.dataset.lastId = '';
      el.dataset.lastClass = '';
    });
    if (window.BattleUI && BattleUI.render) BattleUI.render();
    if (window.MapEntities && MapEntities.refresh) MapEntities.refresh();
    if (window.MapPlayer && MapPlayer.refresh) MapPlayer.refresh();
  }

  return { drawHero, drawEnemy, registerHero, registerEnemy, drawHeroToCanvas, drawEnemyToCanvas, SPRITE_MANIFEST, setFrame, getSuffix, getSpritePath, FRAME_MAP, refreshGlobalSprites };
})();
window.SpriteRenderer = SpriteRenderer;
