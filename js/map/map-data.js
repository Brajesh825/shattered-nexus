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
 *   map-verdant-vale.js      Arc 1   Lv 1-8
 *   map-crystal-cavern.js    Arc 2   Lv 7-15
 *   map-ember-wastes.js      Arc 3   Lv 12-20
 *   map-sunken-temple.js     Arc 4   Lv 17-25
 *   map-shadow-reach.js      Arc 5   Lv 22-30
 *   map-void-citadel.js      Arc 6   Lv 27-35
 *   map-fortress-ramparts.js Arc 7   Lv 32-40
 *   map-eternal-void.js      Arc 8   Lv 37-45
 *
 * Expansion Regions:
 *   map-southern-isles.js      Exp 1   Lv 10-18
 *   map-riverlands-crossing.js Exp 2   Lv 10-18
 *   map-ashen-foothills.js     Exp 3   Lv 20-28
 *   map-lighthouse-isles.js    Exp 4   Lv 25-33
 *   map-eastern-wetlands.js    Exp 5   Lv 30-38
 *   map-northern-highlands.js  Exp 6   Lv 35-43
 *   map-sky-ruins.js           Exp 7   Lv 35-43
 *
 * Each map file registers itself via MAP_DEFS.<id> = { ... }
 */

// Populated by the individual map data files below.
const MAP_DEFS = {};
