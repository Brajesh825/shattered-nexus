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

  const [chars, classes, enemies, items, relics, weapons, moveAnims, loreFrags, quests, merchants, bonds, banter] = await Promise.all([
    load('data/characters.json'),
    load('data/classes.json'),
    load('data/enemies.json'),
    load('data/items.json'),
    load('data/relics.json'),
    load('data/weapons.json'),
    load('data/move-animations.json'),
    load('data/lore_fragments.json'),
    load('data/quests.json'),
    load('js/data/merchants.json'),
    load('data/story/bonds.json'),
    load('data/banter.json'),
  ]);

  validateEnemy(enemies);

  // Dynamic SVG Replacement for Character and Class Icons
  const svgIcons = {
    aya: `<svg class="char-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; display:inline-block; vertical-align:middle; filter:drop-shadow(0 0 4px #0ea5e9);"><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"/></svg>`,
    tao: `<svg class="char-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; display:inline-block; vertical-align:middle; filter:drop-shadow(0 0 4px #b91c1c);"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    lulu: `<svg class="char-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; display:inline-block; vertical-align:middle; filter:drop-shadow(0 0 4px #0f766e);"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
    rei: `<svg class="char-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; display:inline-block; vertical-align:middle; filter:drop-shadow(0 0 4px #15803d);"><path d="M21 12a9 9 0 1 1-6.219-8.56M16 10a5 5 0 1 1-3.456-4.752"/></svg>`,
    ria: `<svg class="char-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; display:inline-block; vertical-align:middle; filter:drop-shadow(0 0 4px #6d28d9);"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    valka: `<svg class="char-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#e879f9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; display:inline-block; vertical-align:middle; filter:drop-shadow(0 0 4px #a21caf);"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zM5 16h14v4H5v-4z"/></svg>`,
    drake: `<svg class="char-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; display:inline-block; vertical-align:middle; filter:drop-shadow(0 0 4px #0369a1);"><path d="M12 2c5.523 0 10 4.477 10 10 0 2.5-.5 4.5-2 6l-3-3m-5 7c-5.523 0-10-4.477-10-10 0-2.5.5-4.5 2-6l3 3M12 8l4 4-4 4-4-4 4-4z"/></svg>`,
    rex: `<svg class="char-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; display:inline-block; vertical-align:middle; filter:drop-shadow(0 0 4px #b45309);"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l8-8-3-3-8 8M9.5 21L21 9.5"/></svg>`,
    sera: `<svg class="char-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; display:inline-block; vertical-align:middle; filter:drop-shadow(0 0 4px #1d4ed8);"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  };
  const classIcons = {
    cryo_bladestorm: svgIcons.aya,
    spirit_incinerator: svgIcons.tao,
    hydro_performer: svgIcons.lulu,
    yaksha_protector: svgIcons.rei,
    summoner_eidolon: svgIcons.ria,
    valkyrie_guardian: svgIcons.valka,
    dragoon_skyward: svgIcons.drake,
    knight_king_divine: svgIcons.rex,
    azure_commander: svgIcons.sera,
  };

  chars.forEach(ch => {
    if (svgIcons[ch.id]) ch.icon = svgIcons[ch.id];
  });
  classes.forEach(cls => {
    if (classIcons[cls.id]) cls.icon = classIcons[cls.id];
  });

  window.CHARACTERS_DATA  = chars;
  window.CLASSES_DATA     = classes;
  window.ENEMIES_DATA     = enemies;
  window.ITEMS_DATA       = items;
  window.RELICS_DATA      = relics;
  window.WEAPONS_DATA     = weapons;
  window.MOVE_ANIMATIONS  = moveAnims;
  window.LORE_FRAGMENTS   = loreFrags;
  window.QUESTS_DATA      = quests;
  window.MERCHANTS_DATA   = merchants;
  window.BOND_DATA        = bonds;
  window.BANTER_DATA      = banter;
}
