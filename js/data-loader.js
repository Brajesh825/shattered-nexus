/**
 * data-loader.js
 *
 * Async loader for all game data.
 * All content lives in /data/ — edit the JSON files there, not here.
 *
 * Files loaded:
 *   data/characters.json      — playable character definitions & lore
 *   data/classes.json         — combat class abilities & stat multipliers
 *   data/enemies.json         — enemy definitions, abilities & palettes
 *   data/items.json           — consumable item definitions
 *   data/relics.json          — relic (equipment) definitions
 *   data/move-animations.json — per-ability animation timing config
 */

async function loadAllGameData() {
  const load = url => fetch(url).then(r => {
    if (!r.ok) throw new Error(`[data-loader] ${r.status} loading ${url}`);
    return r.json();
  });

  const [chars, classes, enemies, items, relics, moveAnims, loreFrags] = await Promise.all([
    load('data/characters.json'),
    load('data/classes.json'),
    load('data/enemies.json'),
    load('data/items.json'),
    load('data/relics.json'),
    load('data/move-animations.json'),
    load('data/lore_fragments.json'),
  ]);

  window.CHARACTERS_DATA  = chars;
  window.CLASSES_DATA     = classes;
  window.ENEMIES_DATA     = enemies;
  window.ITEMS_DATA       = items;
  window.RELICS_DATA      = relics;
  window.MOVE_ANIMATIONS  = moveAnims;
  window.LORE_FRAGMENTS   = loreFrags;
}
