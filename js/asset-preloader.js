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
      'ria', 'valka', 'drake', 'rex', 'sera'
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
      'title', 'story', 'exploration', 'battle',
      'riverlands_explore', 'riverlands_battle', 'river_king_theme',
      'vale_explore', 'vale_battle', 'void_knight_theme',
      'cavern_explore', 'cavern_battle', 'spectral_guardian_theme',
      'isles_explore', 'isles_battle', 'leviathan_theme'
    ],
    ui: [
      'world_map_bg'
    ],
    environment: [
      // Core (IDs 200–212)
      'oak', 'pine', 'shrub', 'boulder', 'mushroom', 'flower', 'crystal', 'lily', 'dead_tree', 'well', 'market', 'chest', 'statue', 'hole', 'staircase',
      // Expanded props (IDs 220–229)
      'fountain', 'obelisk', 'tombstone', 'pillar_broken', 'wagon', 'tent', 'campfire', 'signpost', 'street_lamp', 'archway',
      // Dark fantasy POI (IDs 230–248)
      'void_rift', 'cursed_idol', 'skeleton', 'floating_crystal', 'ancient_pillar', 'withered_vine', 'sacrificial_altar', 'void_spires', 'iron_maiden', 'magic_circle', 'tower', 'castle', 'noble_house', 'ruined_tower', 'ruined_castle', 'shattered_throne', 'broken_knight', 'cursed_well', 'withered_tree',
      // Furniture / interior (IDs 300–309)
      'royal_table', 'wooden_chair', 'stone_bench', 'throne_gold', 'alchemy_table', 'bookshelf', 'fireplace', 'armor_stand', 'weapon_rack', 'bed_fancy',
      // Castle outdoors (IDs 310–321)
      'knight_statue', 'iron_gate', 'training_dummy', 'catapult', 'hanging_cage', 'royal_banner', 'castle_wall', 'drawbridge', 'gallows', 'archery_target',
      'archery_range', 'stable', 'tavern', 'chapel', 'wall_section', 'healer_hut', 'farmhouse', 'library',
      // Nature (IDs 350–356)
      'apple_tree', 'palm_tree', 'cherry_blossom', 'giant_mushroom', 'cactus', 'bamboo', 'vine_cluster',
      // Dark fantasy extras (IDs 357–363)
      'rune_stone', 'bone_pile', 'dark_altar', 'cursed_tree', 'spectral_flame', 'soul_lantern', 'eldritch_eye',
      // Town props (IDs 364–370)
      'barrel', 'hay_bale', 'water_trough', 'fence_section', 'notice_board', 'flower_pot', 'market_cart',
      // Dungeon props (IDs 371–375)
      'stalactite', 'dungeon_door', 'cell_bars', 'spike_trap', 'poison_mushroom',
      // Combat & siege (IDs 376–377)
      'cannon', 'bonfire',
      // Coastal (IDs 378–381)
      'dock_post', 'rowboat', 'lighthouse', 'fishing_net',
      // Arcane (IDs 382–384)
      'arcane_pedestal', 'crystal_orb', 'spell_rune',
      'large_castle', 'large_fishman_hut', 'large_noble_villa', 'large_military_tent',
      'frozen_house', 'ice_castle', 'labyrinth_gate', 'market_cart_frozen', 'pine_frozen', 'notice_board_frozen', 'well_frozen',
      'stilt_house', 'mangrove_root', 'tide_bell', 'rope_bridge', 'broken_bridge', 'waterfall_shrine',
      'cascade_rocks', 'mist_vent', 'river_marker', 'waterlogged_cart', 'grotto_entrance', 'keystone_obelisk',
      // Southern Isles custom assets
      'coral_formation', 'shipwreck', 'ancient_column',
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
    await Promise.all([
      // 1. Spirits
      loadBatch(ASSETS.spirits, loadImage, 'spirit_', (id) => {
        const charId = id.toLowerCase();
        return `images/characters/spirits/${charId}_sprite.png`;
      }),
      // 2. Enemies
      loadBatch(ASSETS.enemies, loadImage, 'enemy_', (id) => `images/enemies/${id}.png`),
      // 3. BGM
      loadBatch(ASSETS.bgm, loadAudio, '', (id) => `audio/bgm/${id}.mp3`, true),
      // 4. UI
      loadBatch(ASSETS.ui, loadImage, 'ui_', (id) => `images/ui/${id}.png`),
      // 5. Environment — all assets are SVGs in images/environment/svg/
      loadBatch(ASSETS.environment, loadImage, 'env_', (id) => `images/environment/svg/${id}.svg`)
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
