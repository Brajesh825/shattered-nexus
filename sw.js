const CACHE_NAME = 'nexus-cache-v8.32';

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
  './css/party-menu.css',
  './css/item-menu.css',
  './css/sprite-battle-ui.css',
  './css/story-ui.css',
  './css/style.css',
  './css/title.css',
  './css/ui-overlays.css',
  // Core JS
  './js/game.js',
  './js/utils.js',
  './js/systems/settings-manager.js',
  './js/asset-preloader.js',
  './js/ambient.js',
  './js/bgm.js',
  './js/data-loader.js',
  './js/release-config.js',
  './js/save.js',
  './js/scaling-config.js',
  './js/sfx.js',
  './js/startup-check.js',
  './js/sprites.js',
  './js/story.js',
  './js/svg-animations.js',
  './js/tts.js',
  './js/cutscene.js',
  // Battle
  './js/battle/action-handler.js',
  './js/battle/combat-engine.js',
  './js/battle/enemy-scaling.js',
  './js/battle/formation-rules.js',
  './js/battle/passive-system.js',
  './js/battle/reaction-effects.js',
  './js/battle/status-system.js',
  './js/battle/turn-state.js',
  './js/battle/turn-manager.js',
  // UI
  './js/ui/archive-ui.js',
  './js/ui/battle-ui.js',
  './js/ui/boss-gauntlet.js',
  './js/ui/control-hints.js',
  './js/ui/credits-screen.js',
  './js/ui/home-engine.js',
  './js/ui/input-settings.js',
  './js/ui/menu-manager.js',
  './js/ui/quest-ui.js',
  './js/ui/result-ui.js',
  './js/ui/weather-engine.js',
  './js/ui/world-explorer.js',
  // Systems
  './js/systems/archive.js',
  './js/systems/focus-manager.js',
  './js/systems/input-manager.js',
  './js/systems/inventory.js',
  './js/systems/party.js',
  './js/systems/quest-system.js',
  './js/systems/save-contract.js',
  './js/systems/settings-manager.js',
  // Map
  './js/map/map-data.js',
  './js/map/data/tile-defs.js',
  './js/map/data/tile-renders.js',
  './js/map/data/map-verdant-vale.js',
  './js/map/data/map-crystal-cavern-f1.js',
  './js/map/data/map-crystal-cavern-f2.js',
  './js/map/data/map-crystal-cavern-f3.js',
  './js/map/data/map-ember-wastes.js',
  './js/map/data/map-sunken-temple.js',
  './js/map/data/map-shadow-reach.js',
  './js/map/data/map-void-citadel.js',
  './js/map/data/map-fortress-ramparts.js',
  './js/map/data/map-eternal-void.js',
  './js/map/data/map-riverlands-crossing.js',
  './js/map/data/map-ashen-foothills.js',
  './js/map/data/map-northern-highlands.js',
  './js/map/data/map-lighthouse-isles.js',
  './js/map/data/map-southern-isles.js',
  './js/map/data/map-eastern-wetlands.js',
  './js/map/data/map-sky-ruins.js',
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
  './data/quests.json',
  './data/npcs.js',
  './data/relics.json',
  './data/story/index.json',
  './data/story/arc_1.json',
  './data/story/arc_2.json',
  './data/story/arc_3.json',
  './data/story/arc_4.json',
  './data/story/arc_5.json',
  './data/story/arc_6.json',
  './data/story/arc_7.json',
  './data/story/arc_8.json',
  './js/map/data/map-verdant-vale.json',
  './js/map/data/map-crystal-cavern-f1.json',
  './js/map/data/map-crystal-cavern-f2.json',
  './js/map/data/map-crystal-cavern-f3.json',
  './js/map/data/map-riverlands-crossing.json',
  './js/map/data/map-southern-isles.json',
  // UI Assets
  './images/ui/world_map_bg.png',
  // Essential Arc 1 Enemies (Lazy-load the rest)
  './images/enemies/goblin.webp',
  './images/enemies/wolf.webp',
  './images/enemies/bat.webp',
  './images/enemies/rat.webp',
  './images/enemies/slime.webp',
  './images/enemies/void_knight.webp',
  // Backgrounds (Arc 1)
  './images/backgrounds/verdant_vale.webp',
  './images/backgrounds/forest_path.webp',
  './images/environment/png/offering_point.png',
];

// Normal quality character sprites (~37 MB total)
const SPRITES_NORMAL = [
  './images/characters/spirits/aya_sprite.png',
  './images/characters/spirits/drake_sprite.png',
  './images/characters/spirits/lulu_sprite.png',
  './images/characters/spirits/rei_sprite.png',
  './images/characters/spirits/rex_sprite.png',
  './images/characters/spirits/ria_sprite.png',
  './images/characters/spirits/sera_sprite.png',
  './images/characters/spirits/tao_sprite.png',
  './images/characters/spirits/valka_sprite.png',
  './images/characters/map/sheets/aya_sheet.png',
  './images/characters/map/sheets/drake_sheet.png',
  './images/characters/map/sheets/lulu_sheet.png',
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
  './images/characters/spirits/sera_sprite_low.webp',
  './images/characters/spirits/tao_sprite_low.webp',
  './images/characters/spirits/valka_sprite_low.webp',
  './images/characters/map/sheets/aya_sheet_low.webp',
  './images/characters/map/sheets/drake_sheet_low.webp',
  './images/characters/map/sheets/lulu_sheet_low.webp',
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
