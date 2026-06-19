/**
 * asset-preloader.js — Preload sprites and audio before game starts
 * Displays loading screen with progress bar
 */
const AssetPreloader = (() => {
  const cache = {
    images: {},
    audio: {}
  };
  const _loading = new Set();

  // ── [EXPANSION PACKS] ──────────────────────────
  const MILITARY_ASSETS = ['military_tent', 'training_ring', 'supply_crate', 'watchtower', 'barracks'];
  const CIVILIAN_ASSETS = ['windmill', 'granary', 'well_house', 'blacksmith', 'merchant_store', 'cottage', 'workshop', 'bakery', 'fisherman_hut', 'village_hall'];
  const NOBLE_ASSETS    = ['estate_manor', 'conservatory', 'noble_villa', 'gazebo', 'triumphal_arch'];

  const ASSETS = {
    // Character spirit portraits
    spirits: [
      'aya', 'tao', 'lulu', 'rei',
      'ria', 'valka', 'drake', 'rex', 'sera'
    ],
    // Enemies (prioritize common/boss enemies)
    enemies: [
      'goblin', 'bat', 'rat', 'slime',
      'orc', 'skeleton', 'bandit', 'wolf',
      'golem', 'dragon', 'lich', 'demon_lord',
      'basilisk'
    ],
    // BGM tracks: Only preload title; others load on demand
    bgm: ['title'],
    ui: ['world_map_bg'],
    // Environment: Only preload CORE assets needed for the first area
    environmentCore: [
      'oak', 'pine', 'shrub', 'boulder', 'mushroom', 'flower', 'crystal', 'lily', 'dead_tree', 'well', 'market', 'chest', 'statue', 'hole', 'staircase'
    ],
    // Extended assets are loaded on-demand by the engines
    environmentExtended: [
      'fountain', 'obelisk', 'tombstone', 'pillar_broken', 'wagon', 'tent', 'campfire', 'signpost', 'street_lamp', 'archway',
      'void_rift', 'cursed_idol', 'skeleton', 'floating_crystal', 'ancient_pillar', 'withered_vine', 'sacrificial_altar', 'void_spires', 'iron_maiden', 'magic_circle', 'tower', 'castle', 'noble_house', 'ruined_tower', 'ruined_castle', 'shattered_throne', 'broken_knight', 'cursed_well', 'withered_tree',
      'royal_table', 'wooden_chair', 'stone_bench', 'throne_gold', 'alchemy_table', 'bookshelf', 'fireplace', 'armor_stand', 'weapon_rack', 'bed_fancy',
      'knight_statue', 'iron_gate', 'training_dummy', 'catapult', 'hanging_cage', 'royal_banner', 'castle_wall', 'drawbridge', 'gallows', 'archery_target',
      'archery_range', 'stable', 'tavern', 'chapel', 'wall_section', 'healer_hut', 'farmhouse', 'library',
      'apple_tree', 'palm_tree', 'cherry_blossom', 'giant_mushroom', 'cactus', 'bamboo', 'vine_cluster',
      'rune_stone', 'bone_pile', 'dark_altar', 'cursed_tree', 'spectral_flame', 'soul_lantern', 'eldritch_eye',
      'barrel', 'hay_bale', 'water_trough', 'fence_section', 'notice_board', 'flower_pot', 'market_cart',
      'stalactite', 'dungeon_door', 'cell_bars', 'spike_trap', 'poison_mushroom',
      'cannon', 'bonfire', 'dock_post', 'rowboat', 'lighthouse', 'fishing_net',
      'arcane_pedestal', 'crystal_orb', 'spell_rune',
      'large_castle', 'large_fishman_hut', 'large_noble_villa', 'large_military_tent',
      'frozen_house', 'ice_castle', 'labyrinth_gate', 'market_cart_frozen', 'pine_frozen', 'notice_board_frozen', 'well_frozen',
      'stilt_house', 'mangrove_root', 'tide_bell', 'rope_bridge', 'broken_bridge', 'waterfall_shrine',
      'cascade_rocks', 'mist_vent', 'river_marker', 'waterlogged_cart', 'grotto_entrance', 'keystone_obelisk',
      'coral_formation', 'shipwreck', 'ancient_column',
      ...MILITARY_ASSETS, ...CIVILIAN_ASSETS, ...NOBLE_ASSETS
    ],
    backgrounds: [
      'verdant_vale', 'forest_path', 'galdor_garden', 'oracle_chamber', 
      'sacred_ruins_boss', 'summoning_ruins', 'aethalguard_ruins',
      'cavern_f1', 'cavern_f2', 'cavern_f3', 'ember_wastes',
      'riverlands', 'sunken_temple', 'shadow_reach', 'void_citadel',
      'eternal_void', 'guardian_arena', 'demon_lord_arena'
    ]
  };

  function loadImage(src) {
    if (cache.images[src]) return Promise.resolve(cache.images[src]);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load: ${src}`));
      img.src = src;
      cache.images[src] = img; // basic internal cache
    });
  }

  function loadAudio(src) {
    if (cache.audio[src]) return Promise.resolve(cache.audio[src]);
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = () => reject(new Error(`Failed to load: ${src}`));
      audio.src = src;
      cache.audio[src] = audio;
    });
  }

  async function preloadAssets(onProgress) {
    // Robustly calculate total with fallbacks to avoid TypeErrors
    const total =
      (ASSETS.spirits?.length || 0) +
      (ASSETS.enemies?.length || 0) +
      (ASSETS.bgm?.length || 0) +
      (ASSETS.ui?.length || 0) +
      (ASSETS.environmentCore?.length || 0) +
      (ASSETS.backgrounds?.length || 0);

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
    const quality = typeof Settings !== 'undefined'
      ? Settings.getQuality()
      : (G.settings?.graphicsQuality || G.graphics || 'auto');
    const isLowQuality = quality === 'low' || (quality === 'auto' && window.innerWidth < 800);

    await Promise.all([
      // 1. Spirits
      loadBatch(ASSETS.spirits, loadImage, 'spirit_', (id) => {
        if (typeof SpriteRenderer !== 'undefined' && SpriteRenderer.getSpritePath) {
          return SpriteRenderer.getSpritePath(id);
        }
        const charId = id.toLowerCase();
        const fileName = isLowQuality ? `${charId}_sprite_low.webp` : `${charId}_sprite.png`;
        return `images/characters/spirits/${fileName}`;
      }),
      // 2. Enemies (Core Arc 1 only)
      loadBatch(ASSETS.enemies, loadImage, 'enemy_', (id) => `images/enemies/${id}.webp`),
      // 3. BGM (Title only)
      loadBatch(ASSETS.bgm, loadAudio, '', (id) => `audio/bgm/${id}.webm`, true),
      // 4. UI
      loadBatch(ASSETS.ui, loadImage, 'ui_', (id) => `images/ui/${id}.png`),
      // 5. Environment (CORE ONLY)
      loadBatch(ASSETS.environmentCore, loadImage, 'env_', (id) => `images/environment/svg/${id}.svg`),
      // 6. Backgrounds (Starting area only)
      loadBatch(ASSETS.backgrounds, loadImage, 'bg_', (id) => `images/backgrounds/${id}.webp`)
    ]);

    // Note: environmentExtended and secondary enemies will load on-demand
    // when the MapEngine or BattleUI requests them via browser fetch.

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
      const img = cache.images[key];
      if (img) return img;

      // Smart On-Demand Loader: If asset is missing, fetch it in background
      if (_loading.has(key)) return null;

      let path = null;
      if (key.startsWith('env_')) {
        path = `images/environment/svg/${key.replace('env_', '')}.svg`;
      } else if (key.startsWith('enemy_')) {
        path = `images/enemies/${key.replace('enemy_', '')}.webp`;
      } else if (key.startsWith('bg_')) {
        path = `images/backgrounds/${key.replace('bg_', '')}.webp`;
      }

      if (path) {
        _loading.add(key);
        const tempImg = new Image();
        tempImg.onload = () => {
          cache.images[key] = tempImg;
          _loading.delete(key);
          // Request a re-render if we're in the MapEngine
          if (typeof MapEngine !== 'undefined' && MapEngine.isRunning && MapEngine.isRunning()) {
            // The next RAF will pick up the new image
          }
        };
        tempImg.onerror = () => {
          _loading.delete(key);
          console.warn(`⚠️ Failed to lazy-load asset: ${path}`);
        };
        tempImg.src = path;
      }

      return null;
    },

    getAudio(key) {
      return cache.audio[key] || null;
    }
  };
})();
window.AssetPreloader = AssetPreloader;
