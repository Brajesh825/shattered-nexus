/**
 * map-data.js — Registry and tile definitions for all maps.
 *
 * Tile IDs (defined in data/tile-defs.js):
 *   0  void        1  grass      2  path/dirt   3  deep water
 *   4  bridge      5  forest     6  mountain    7  cave-floor
 *   8  cave-wall   9  dungeon   10  sand        11 flower
 *  12  town-floor 13  lava-floor 14 scorched-earth
 *  15 cracked-stone 16 ember-pit 17 obsidian-wall
 *
 * Map files loaded from data/:
 *   map-verdant-vale.js      Arc 1   Lv 1-3
 *   map-crystal-cavern.js    Arc 1-2 Lv 5-8
 *   map-ember-wastes.js      Arc 2   Lv 8-12
 *   map-sunken-temple.js     Arc 3   Lv 18-22
 *   map-shadow-reach.js      Arc 4   Lv 14-18
 *   map-void-citadel.js      Arc 5   Lv 18-22
 *   map-fortress-ramparts.js Arc 7   Lv 22-26
 *   map-eternal-void.js      Arc 8   Lv 26-30
 *
 * Each map file registers itself via MAP_DEFS.<id> = { ... }
 */

// Populated by the individual map data files below.
const MAP_DEFS = {};
