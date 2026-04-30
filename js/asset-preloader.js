/**
 * asset-preloader.js — Preload sprites and audio before game starts
 * Displays loading screen with progress bar
 */
const AssetPreloader = (() => {
  const cache = {
    images: {},
    audio: {}
  };

  // ── [EXPANSION PACKS] ──────────────────────────
  const MILITARY_ASSETS = ['military_tent', 'training_ring', 'supply_crate', 'watchtower', 'barracks'];
  const CIVILIAN_ASSETS = ['windmill', 'granary', 'well_house', 'blacksmith', 'merchant_store', 'cottage', 'workshop', 'bakery', 'fisherman_hut', 'village_hall'];
  const NOBLE_ASSETS    = ['estate_manor', 'conservatory', 'noble_villa', 'gazebo', 'triumphal_arch'];

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
    ],
    ui: [
      'world_map_bg'
    ],
    environment: [
      'oak', 'pine', 'shrub', 'boulder', 'mushroom', 'flower', 'crystal', 'lily', 'dead_tree', 'well', 'market', 'chest', 'statue',
      'fountain', 'obelisk', 'tombstone', 'pillar_broken', 'wagon', 'tent', 'campfire', 'signpost', 'street_lamp', 'archway',
      'void_rift', 'cursed_idol', 'skeleton', 'floating_crystal', 'ancient_pillar', 'withered_vine', 'sacrificial_altar', 'void_spires', 'iron_maiden', 'magic_circle', 'tower', 'castle', 'noble_house', 'ruined_tower', 'ruined_castle', 'shattered_throne', 'broken_knight', 'cursed_well', 'withered_tree',
      'royal_table', 'wooden_chair', 'stone_bench', 'throne_gold', 'alchemy_table', 'bookshelf', 'fireplace', 'armor_stand', 'weapon_rack', 'bed_fancy',
      'knight_statue', 'iron_gate', 'training_dummy', 'catapult', 'hanging_cage', 'royal_banner', 'castle_wall', 'drawbridge', 'gallows', 'archery_target',
      'archery_range', 'stable', 'tavern', 'chapel', 'wall_section', 'healer_hut', 'farmhouse', 'library',
      ...MILITARY_ASSETS,
      ...CIVILIAN_ASSETS,
      ...NOBLE_ASSETS
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
      ASSETS.bgm.length +
      ASSETS.ui.length +
      ASSETS.environment.length;

    let loaded = 0;
    const update = () => {
      loaded++;
      if (onProgress) onProgress(loaded, total);
    };

    // Helper to run a batch in parallel
    const loadBatch = async (items, loaderFunc, cacheKeyPrefix, pathFunc, isAudio = false) => {
      const promises = items.map(async (item) => {
        try {
          const path = pathFunc(item);
          const asset = await loaderFunc(path);
          if (isAudio) cache.audio[item] = asset;
          else cache.images[`${cacheKeyPrefix}${item}`] = asset;
        } catch (e) {
          console.warn(`⚠️ Failed to preload ${cacheKeyPrefix}: ${item}`, e);
        } finally {
          update();
        }
      });
      return Promise.all(promises);
    };

    // Run all batches simultaneously
    const isLowQuality = (localStorage.getItem('spriteQuality') || 'normal') === 'low';
    
    await Promise.all([
      // 1. Spirits
      loadBatch(ASSETS.spirits, loadImage, 'spirit_', (id) => {
        const charId = id.toLowerCase();
        const fileName = isLowQuality ? `${charId}_sprite_low.webp` : `${charId}_sprite.png`;
        return `images/characters/spirits/${fileName}`;
      }),
      // 2. Enemies
      loadBatch(ASSETS.enemies, loadImage, 'enemy_', (id) => `images/enemies/${id}.png`),
      // 3. BGM
      loadBatch(ASSETS.bgm, loadAudio, '', (id) => `audio/bgm/${id}.mp3`, true),
      // 4. UI
      loadBatch(ASSETS.ui, loadImage, 'ui_', (id) => `images/ui/${id}.png`),
      // 5. Environment (SVGs)
      loadBatch(ASSETS.environment, loadImage, 'env_', (id) => {
        const extension = [
          'oak', 'pine', 'shrub', 'boulder', 'mushroom', 'flower', 'crystal', 'lily', 'dead_tree', 'well', 'market', 'chest', 'statue',
          'fountain', 'obelisk', 'tombstone', 'pillar_broken', 'wagon', 'tent', 'campfire', 'signpost', 'street_lamp', 'archway',
          'void_rift', 'cursed_idol', 'skeleton', 'floating_crystal', 'ancient_pillar', 'withered_vine', 'sacrificial_altar', 'void_spires', 'iron_maiden', 'magic_circle', 'tower', 'castle', 'noble_house', 'ruined_tower', 'ruined_castle', 'shattered_throne', 'broken_knight', 'cursed_well', 'withered_tree',
          'royal_table', 'wooden_chair', 'stone_bench', 'throne_gold', 'alchemy_table', 'bookshelf', 'fireplace', 'armor_stand', 'weapon_rack', 'bed_fancy',
          'knight_statue', 'iron_gate', 'training_dummy', 'catapult', 'hanging_cage', 'royal_banner', 'castle_wall', 'drawbridge', 'gallows', 'archery_target',
          'archery_range', 'stable', 'tavern', 'chapel', 'wall_section', 'healer_hut', 'farmhouse', 'library',
          ...MILITARY_ASSETS,
          ...CIVILIAN_ASSETS,
          ...NOBLE_ASSETS
        ].includes(id) ? 'svg' : 'png';
        return extension === 'svg' ? `images/environment/svg/${id}.svg` : `images/environment/${id}.png`;
      })
    ]);

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
    },
    async loadManifest() {
      try {
        const resp = await fetch('../images/environment/sprites.json');
        return await resp.json();
      } catch (e) {
        console.warn("Failed to load environment manifest", e);
        return null;
      }
    }
  };
})();
