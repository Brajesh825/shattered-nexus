/**
 * asset-preloader.js — Preload sprites and audio before game starts
 * Displays loading screen with progress bar
 */
const AssetPreloader = (() => {
  const cache = {
    images: {},
    audio: {}
  };

  const ASSETS = {
    // Character spirit portraits
    spirits: [
      'aya', 'tao', 'lulu', 'rei',
      'ria', 'valka', 'drake', 'rex'
    ],
    // Enemies (prioritize common/boss enemies)
    enemies: [
      'goblin', 'bat', 'rat', 'slime',
      'orc', 'skeleton', 'bandit', 'wolf',
      'golem', 'dragon', 'lich', 'demon_lord',
      'basilisk', 'dark_knight', 'bone_dragon', 'shadow_emperor'
    ],
    // BGM tracks (all of them)
    bgm: [
      'title', 'story', 'exploration', 'battle'
    ]
  };

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load: ${src}`));
      img.src = src;
    });
  }

  function loadAudio(src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = () => reject(new Error(`Failed to load: ${src}`));
      audio.src = src;
    });
  }

  async function preloadAssets(onProgress) {
    const total =
      ASSETS.spirits.length +
      ASSETS.enemies.length +
      ASSETS.bgm.length;

    let loaded = 0;

    // Preload spirits
    for (const charId of ASSETS.spirits) {
      try {
        const id = charId.toLowerCase();
        // The entire roster now uses high-res sprite sheets
        const fileName = `${id}_sprite.png`;
        const img = await loadImage(`images/characters/spirits/${fileName}`);
        cache.images[`spirit_${charId}`] = img;
        loaded++;
        if (onProgress) onProgress(loaded, total);
      } catch (e) {
        console.warn(`⚠️ Failed to preload spirit: ${charId}`, e);
        loaded++;
        if (onProgress) onProgress(loaded, total);
      }
    }

    // Preload enemies (optional - only if you use them)
    for (const enemyId of ASSETS.enemies) {
      try {
        const img = await loadImage(`images/enemies/${enemyId}.png`);
        cache.images[`enemy_${enemyId}`] = img;
        loaded++;
        if (onProgress) onProgress(loaded, total);
      } catch (e) {
        console.warn(`⚠️ Failed to preload enemy: ${enemyId}`, e);
        loaded++;
        if (onProgress) onProgress(loaded, total);
      }
    }

    // Preload BGM (only preload metadata, not full download)
    for (const trackName of ASSETS.bgm) {
      try {
        const audio = await loadAudio(`audio/bgm/${trackName}.mp3`);
        cache.audio[trackName] = audio;
        loaded++;
        if (onProgress) onProgress(loaded, total);
      } catch (e) {
        console.warn(`⚠️ Failed to preload BGM: ${trackName}`, e);
        loaded++;
        if (onProgress) onProgress(loaded, total);
      }
    }

    return cache;
  }

  return {
    async init() {
      const loadingScreen = document.getElementById('loading-screen');
      const loadingBar = document.getElementById('loading-bar');
      const loadingText = document.getElementById('loading-text');

      if (!loadingScreen) {
        console.warn('⚠️ No loading screen found. Assets preloading skipped.');
        return cache;
      }

      loadingScreen.style.display = 'flex';

      try {
        await preloadAssets((loaded, total) => {
          const percent = Math.round((loaded / total) * 100);
          if (loadingBar) loadingBar.style.width = percent + '%';
          if (loadingText) loadingText.textContent = `Loading... ${percent}%`;
        });

        // Fade out loading screen
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      } catch (error) {
        console.error('❌ Asset preloading failed:', error);
        if (loadingText) loadingText.textContent = 'Error loading assets';
      }

      return cache;
    },

    getImage(key) {
      return cache.images[key] || null;
    },

    getAudio(key) {
      return cache.audio[key] || null;
    }
  };
})();
