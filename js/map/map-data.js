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
/**
 * Map Data Schema Explanation:
 * ----------------------------
 * Each map in MAP_DEFS uses a data-driven schema that the MapEngine and MapEntities 
 * modules consume to handle mechanics, atmosphere, and narrative.
 * 
 * CORE PROPERTIES:
 * - id: Unique string matching the key in MAP_DEFS.
 * - name: Display name for headers.
 * - arcId: Links map to Story Arc progression (1-8).
 * - enemyLevelRange: [min, max] levels for random encounter scaling.
 * 
 * SEGMENTATION & SAFETY:
 * - safeZones: Array of {xMin, xMax, yMin, yMax, name}.
 *   Used by MapEntities to suppress random encounter spawns in narrative areas.
 * - triggers: Array of region-based effects.
 *   - type 'msg': Shows MapUI notification when entered (used for segment names).
 *   - type 'dialogue': Triggers a multi-line conversation.
 *   - type 'teleport': Floor/Map transition.
 * 
 * DYNAMIC ATMOSPHERE:
 * - weather: 'leaves', 'sparks', 'fog', or null.
 * - fog: {delay, peak, max, vision} - Controls the darkness/exploration mechanic.
 */

// Populated by the individual map data files in js/map/data/
const MAP_DEFS = {};

const MapData = {
  getLayers(map) {
    if (!map) return [];
    return map.data || map.layers || [map.tiles];
  },
  getTileAt(map, x, y, preferredLayer = null) {
    if (!map) return 0;
    const layers = this.getLayers(map);
    if (preferredLayer !== null) {
      return layers[preferredLayer]?.[y]?.[x] ?? 0;
    }
    // Top-down search for first non-empty tile
    for (let i = layers.length - 1; i >= 0; i--) {
      const tid = layers[i]?.[y]?.[x] ?? 0;
      if (tid !== 0) return tid;
    }
    return 0;
  }
};
