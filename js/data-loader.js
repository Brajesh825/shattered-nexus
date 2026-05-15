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

/** Required top-level fields every enemy definition must have. */
const ENEMY_REQUIRED_FIELDS = ['id', 'name'];

/** Required fields inside each enemy's nested stats object. */
const ENEMY_STATS_FIELDS = ['hp', 'atk', 'def'];

/**
 * Validates a loaded enemy array and console.errors any entry missing required fields.
 * Runs at startup so JSON typos surface immediately, not mid-battle.
 * Enemies use a nested stats object: { stats: { hp, atk, def, ... } }
 * @param {Array} enemies
 */
function validateEnemy(enemies) {
  if (!Array.isArray(enemies)) {
    console.error('[data-loader] enemies.json did not parse as an array');
    return;
  }
  enemies.forEach((e, i) => {
    // Check top-level required fields
    ENEMY_REQUIRED_FIELDS.forEach(field => {
      if (e[field] == null) {
        console.error(`[data-loader] enemies[${i}] (id="${e.id || '?'}") is missing required field: "${field}"`);
      }
    });
    // Check nested stats object
    ENEMY_STATS_FIELDS.forEach(field => {
      if (!e.stats || e.stats[field] == null) {
        console.error(`[data-loader] enemies[${i}] (id="${e.id || '?'}") is missing stats.${field}`);
      }
    });
  });
}

async function loadAllGameData() {
  const load = url => fetch(url).then(r => {
    if (!r.ok) throw new Error(`[data-loader] ${r.status} loading ${url}`);
    return r.json();
  });

  const [chars, classes, enemies, items, relics, moveAnims, loreFrags, quests, merchants, bonds, banter] = await Promise.all([
    load('data/characters.json'),
    load('data/classes.json'),
    load('data/enemies.json'),
    load('data/items.json'),
    load('data/relics.json'),
    load('data/move-animations.json'),
    load('data/lore_fragments.json'),
    load('data/quests.json'),
    load('js/data/merchants.json'),
    load('data/story/bonds.json'),
    load('data/banter.json'),
  ]);

  validateEnemy(enemies);

  window.CHARACTERS_DATA  = chars;
  window.CLASSES_DATA     = classes;
  window.ENEMIES_DATA     = enemies;
  window.ITEMS_DATA       = items;
  window.RELICS_DATA      = relics;
  window.MOVE_ANIMATIONS  = moveAnims;
  window.LORE_FRAGMENTS   = loreFrags;
  window.QUESTS_DATA      = quests;
  window.MERCHANTS_DATA   = merchants;
  window.BOND_DATA        = bonds;
  window.BANTER_DATA      = banter;
}
