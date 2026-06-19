/**
 * sprites.js — Shattered Nexus
 * Hand-crafted pixel art renderer for all characters and enemies.
 * Uses canvas 2D API with a 3px-per-pixel grid system.
 */
const SpriteRenderer = (() => {

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
        const canvas = drawHeroToCanvas(charId, charData, classData);
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
      const canvas = drawEnemyToCanvas(enemyId, palette);
      imgEl.src = canvas.toDataURL();
    };
    test.src = webpPath;
  }

  function drawHeroToCanvas(charId, charData, classData) {
    const canvas = document.createElement('canvas');
    canvas.width = 48; canvas.height = 57;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = charData?.portrait_color || '#7dd3fc';
    ctx.beginPath();
    ctx.arc(24, 28, 20, 0, Math.PI * 2);
    ctx.fill();
    return canvas;
  }

  function drawEnemyToCanvas(enemyId, palette) {
    const canvas = document.createElement('canvas');
    canvas.width = 72; canvas.height = 84;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = palette?.body || '#a04040';
    ctx.beginPath();
    ctx.arc(36, 42, 30, 0, Math.PI * 2);
    ctx.fill();
    return canvas;
  }

  function setFrame(el, charId, frameNameOrCoords, customHeight = 0) {
    if (!el) return;
    const id = charId.toLowerCase();
    const manifest = SPRITE_MANIFEST[id];

    if (!manifest) {
      const playableChars = ['aya', 'tao', 'lulu', 'rei', 'ria', 'valka', 'drake', 'rex', 'sera'];
      const isPlayable = playableChars.includes(id);
      if (!isPlayable) {
        el.style.backgroundImage = `url(images/enemies/${id}.webp)`;
      } else {
        el.style.backgroundImage = `url(images/characters/spirits/${id}_sprite.png)`;
      }
      el.style.backgroundSize = 'contain';
      el.style.backgroundPosition = 'bottom center';
      el.style.backgroundRepeat = 'no-repeat';

      if (typeof customHeight === 'string') {
        el.style.width = customHeight;
        el.style.height = customHeight;
      } else {
        const baseHeight = customHeight || (el.offsetHeight > 0 ? el.offsetHeight : 128);
        el.style.width = `${baseHeight}px`;
        el.style.height = `${baseHeight}px`;
      }
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

    if (isIllustrious) return isLow ? '_sprite_1_low.webp' : '_sprite_1.webp';
    return isLow ? '_sprite_low.webp' : '_sprite.webp';
  }

  function getSpritePath(charId) {
    const id = charId.toLowerCase();
    const manifest = SPRITE_MANIFEST[id];
    const baseId = manifest ? manifest.baseId : id;
    return `images/characters/spirits/${baseId}${getSuffix()}`;
  }

  function registerHero(id, fn) { }
  function registerEnemy(id, fn) { }

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
