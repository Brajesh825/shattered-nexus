const CACHE_NAME = 'nexus-cache-v6.3';

// Core shell — always pre-cached regardless of quality setting
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // CSS
  './css/animations.css',
  './css/base.css',
  './css/battle-juice.css',
  './css/battle-screens.css',
  './css/combat.css',
  './css/end-screens.css',
  './css/loader.css',
  './css/map.css',
  './css/sprite-battle-ui.css',
  './css/story-ui.css',
  './css/style.css',
  './css/title.css',
  './css/ui-overlays.css',
  // Core JS
  './js/game.js',
  './js/asset-preloader.js',
  './js/ambient.js',
  './js/bgm.js',
  './js/data-loader.js',
  './js/release-config.js',
  './js/save.js',
  './js/scaling-config.js',
  './js/sfx.js',
  './js/sprites.js',
  './js/story.js',
  './js/svg-animations.js',
  './js/tts.js',
  // Battle
  './js/battle/action-handler.js',
  './js/battle/combat-engine.js',
  './js/battle/enemy-scaling.js',
  './js/battle/formation-rules.js',
  './js/battle/passive-system.js',
  './js/battle/reaction-effects.js',
  './js/battle/status-system.js',
  './js/battle/turn-manager.js',
  // UI
  './js/ui/archive-ui.js',
  './js/ui/battle-ui.js',
  './js/ui/boss-gauntlet.js',
  './js/ui/credits-screen.js',
  './js/ui/home-engine.js',
  './js/ui/menu-manager.js',
  './js/ui/result-ui.js',
  './js/ui/weather-engine.js',
  // Systems
  './js/systems/archive.js',
  './js/systems/focus-manager.js',
  './js/systems/input-manager.js',
  './js/systems/inventory.js',
  './js/systems/party.js',
  './js/systems/save-contract.js',
  './js/systems/settings-manager.js',
  // Map
  './js/map/map-data.js',
  './js/map/map-engine.js',
  './js/map/map-entities.js',
  './js/map/map-ui.js',
  './js/map/map-touch.js',
  // Data
  './data/characters.json',
  './data/character-unlocks.json',
  './data/classes.json',
  './data/enemies.json',
  './data/items.json',
  './data/lore_fragments.json',
  './data/move-animations.json',
  './data/npcs.js',
  './data/relics.json',
  // Backgrounds
  './images/backgrounds/oracle_chamber.png',
  './images/backgrounds/sacred_ruins_boss.png',
  './images/backgrounds/shattered_ruins.png',
  './images/backgrounds/summoning_ruins.png',
  // UI Assets
  './images/ui/world_map_bg.png',
  // Enemies (single quality)
  './images/enemies/abomination.png',
  './images/enemies/bandit.png',
  './images/enemies/basilisk.png',
  './images/enemies/bat.png',
  './images/enemies/bone_dragon.png',
  './images/enemies/centaur.png',
  './images/enemies/chimera.png',
  './images/enemies/crab.png',
  './images/enemies/crystal_golem.png',
  './images/enemies/crystal_shard.png',
  './images/enemies/cyclops.png',
  './images/enemies/dark_knight.png',
  './images/enemies/dark_mother.png',
  './images/enemies/dark_phoenix.png',
  './images/enemies/demon_lord.png',
  './images/enemies/dragon.png',
  './images/enemies/fallen_angel.png',
  './images/enemies/fire_elemental.png',
  './images/enemies/galdor_king.png',
  './images/enemies/gargoyle.png',
  './images/enemies/gem_mimic.png',
  './images/enemies/ghost.png',
  './images/enemies/goblin.png',
  './images/enemies/goblin_elite.png',
  './images/enemies/golem.png',
  './images/enemies/harpy.png',
  './images/enemies/imp.png',
  './images/enemies/iron_golem.png',
  './images/enemies/kraken.png',
  './images/enemies/lesser_demon.png',
  './images/enemies/lich.png',
  './images/enemies/lizardman.png',
  './images/enemies/luminous_golem.png',
  './images/enemies/medusa.png',
  './images/enemies/merman.png',
  './images/enemies/minotaur.png',
  './images/enemies/mushroom.png',
  './images/enemies/naga.png',
  './images/enemies/necromancer.png',
  './images/enemies/ogre.png',
  './images/enemies/orc.png',
  './images/enemies/phantom_regent.png',
  './images/enemies/rat.png',
  './images/enemies/scarecrow.png',
  './images/enemies/shadow_emperor.png',
  './images/enemies/shadow_titan.png',
  './images/enemies/shadow_wraith.png',
  './images/enemies/skeleton.png',
  './images/enemies/slime.png',
  './images/enemies/spectral_guardian.png',
  './images/enemies/spider.png',
  './images/enemies/titan.png',
  './images/enemies/troll.png',
  './images/enemies/vampire.png',
  './images/enemies/void_knight.png',
  './images/enemies/void_warden.png',
  './images/enemies/werewolf.png',
  './images/enemies/wisp.png',
  './images/enemies/witch.png',
  './images/enemies/wolf.png',
  './images/enemies/wyvern.png',
  './images/enemies/zombie.png',
  './images/enemies/zombie_soldier.png',
];

// Normal quality character sprites (~37 MB total)
const SPRITES_NORMAL = [
  './images/characters/spirits/aya_sprite.png',
  './images/characters/spirits/drake_sprite.png',
  './images/characters/spirits/lulu_sprite.png',
  './images/characters/spirits/rei_sprite.png',
  './images/characters/spirits/rex_sprite.png',
  './images/characters/spirits/ria_sprite.png',
  './images/characters/spirits/tao_sprite.png',
  './images/characters/spirits/valka_sprite.png',
  './images/characters/map/sheets/aya_sheet.png',
  './images/characters/map/sheets/drake_sheet.png',
  './images/characters/map/sheets/lulu_sheet.png',
  './images/characters/map/sheets/lulu_sheet_1.png',
  './images/characters/map/sheets/rei_sheet.png',
  './images/characters/map/sheets/rex_sheet.png',
  './images/characters/map/sheets/ria_sheet.png',
  './images/characters/map/sheets/tao_sheet.png',
  './images/characters/map/sheets/valka_sheet.png',
];

// Low quality character sprites (~1.7 MB total)
const SPRITES_LOW = [
  './images/characters/spirits/aya_sprite_low.webp',
  './images/characters/spirits/drake_sprite_low.webp',
  './images/characters/spirits/lulu_sprite_low.webp',
  './images/characters/spirits/rei_sprite_low.webp',
  './images/characters/spirits/rex_sprite_low.webp',
  './images/characters/spirits/ria_sprite_low.webp',
  './images/characters/spirits/tao_sprite_low.webp',
  './images/characters/spirits/valka_sprite_low.webp',
  './images/characters/map/sheets/aya_sheet_low.webp',
  './images/characters/map/sheets/drake_sheet_low.webp',
  './images/characters/map/sheets/lulu_sheet_low.webp',
  './images/characters/map/sheets/lulu_sheet_1_low.webp',
  './images/characters/map/sheets/rei_sheet_low.webp',
  './images/characters/map/sheets/rex_sheet_low.webp',
  './images/characters/map/sheets/ria_sheet_low.webp',
  './images/characters/map/sheets/tao_sheet_low.webp',
  './images/characters/map/sheets/valka_sheet_low.webp',
];

// Read quality preference from the SW's own storage via a message,
// or fall back to a client-readable cookie pattern.
// Simpler: SW reads the quality from the install message sent by the page.
let _quality = 'normal';

self.addEventListener('message', event => {
  if (event.data?.type === 'SET_QUALITY') {
    _quality = event.data.quality || 'normal';
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Install: pre-cache shell + quality-appropriate sprites
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('📦 [SW] Pre-caching shell assets');
      // Cache shell first (ignore individual failures so one bad asset doesn't abort)
      await Promise.allSettled(SHELL_ASSETS.map(url => cache.add(url)));
      // Sprite quality is decided at fetch time via cache-first strategy,
      // so no pre-cache needed here — they'll be cached on first actual load.
      console.log('✅ [SW] Shell pre-cache complete');
    })()
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('🧹 [SW] Removing old cache:', key);
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for media, stale-while-revalidate for code/data
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const path = url.pathname;

  // Skip non-GET and cross-origin requests
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  const isMedia = /\.(png|webp|mp3|svg|jpg|jpeg)$/.test(path);

  if (isMedia) {
    // Cache-first: serve instantly offline, cache on first fetch
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          // 206 Partial Content (range requests for audio) cannot be cached
          if (!response || response.status === 206) return response;

          // Only cache same-quality sprites — skip the other quality's files
          const isNormalSprite = SPRITES_NORMAL.some(s => path.endsWith(s.replace('./', '/')));
          const isLowSprite = SPRITES_LOW.some(s => path.endsWith(s.replace('./', '/')));
          const isCharSprite = isNormalSprite || isLowSprite;

          if (isCharSprite) {
            const shouldCache = (_quality === 'low' && isLowSprite) || (_quality !== 'low' && isNormalSprite);
            if (!shouldCache) return response;
          }

          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        }).catch(() => new Response('', { status: 503, statusText: 'Service Unavailable' }));
      })
    );
  } else {
    // Stale-while-revalidate: serve cache instantly, update in background
    event.respondWith(
      caches.match(event.request).then(cached => {
        const network = fetch(event.request).then(response => {
          if (!response || response.status === 206) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        }).catch(() => cached);
        return cached || network;
      })
    );
  }
});
