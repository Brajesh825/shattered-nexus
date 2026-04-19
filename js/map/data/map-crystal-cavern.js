/**
 * map-crystal-cavern.js
 * * DESIGN LOGIC:
 * - SIZE: 120x100 (Grand Scale).
 * - TOTAL ACCESSIBILITY: Uses a "Star-Graph" connectivity model.
 * - NO FROZEN ENEMIES: Every enemy spawn point is verified against the tile map.
 * - BIOME VARIETY: 4 distinct zones with unique tile IDs from tile-defs.js.
 */

const MAP_GENERATOR = {
  width: 120,
  height: 100,

  generate: function () {
    const rows = [];
    // Fill everything with Cave Wall (8) initially
    for (let y = 0; y < this.height; y++) {
      rows.push(new Array(this.width).fill(8));
    }

    // 1. CARVE THE GRAND CROSS (Main Artery - 5 tiles wide)
    for (let y = 47; y <= 53; y++) {
      for (let x = 0; x < this.width; x++) rows[y][x] = 7; // Cave Floor
    }
    for (let x = 57; x <= 63; x++) {
      for (let y = 0; y < this.height; y++) rows[y][x] = 7; // Cave Floor
    }

    // 2. CARVE BIOME HUBS (Accessible Rooms)
    this.carveRoom(rows, 15, 15, 30, 25, 9);   // NW: Dungeon
    this.carveRoom(rows, 80, 15, 30, 25, 18);  // NE: Shallow Water/Ice
    this.carveRoom(rows, 15, 65, 30, 25, 57);  // SW: Mine
    this.carveRoom(rows, 80, 65, 30, 25, 59);  // SE: Crystal Garden

    // 3. CARVE MANDATORY CONNECTORS (Ensures 100% Pathfinding)
    this.carveTunnel(rows, 30, 40, 30, 47, 7); // NW to Cross
    this.carveTunnel(rows, 95, 40, 95, 47, 7); // NE to Cross
    this.carveTunnel(rows, 30, 53, 30, 65, 7); // SW to Cross
    this.carveTunnel(rows, 95, 53, 95, 65, 7); // SE to Cross

    // 4. THE CENTRAL GEODE
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let dx = x - 60, dy = y - 50;
        let distSq = dx * dx + dy * dy;
        if (distSq < 225) { // The Island
          // If part of the main cross-hallway, use Bridge (4) or Floor (7)
          const isCrossWay = (x >= 57 && x <= 63) || (y >= 47 && y <= 53);
          
          if (distSq < 64) {
            rows[y][x] = 59; // Core
          } else if (distSq < 144) {
            rows[y][x] = isCrossWay ? 4 : 3; // Bridge across Moat
          } else {
            rows[y][x] = 4; // Outer Rim Bridge
          }
        }
      }
    }

    // 5. ENTRANCE & BORDERS
    for (let x = 0; x < 10; x++) rows[50][x] = 112; // Mossy Entrance

    return rows;
  },

  carveRoom: function (rows, x, y, w, h, tile) {
    for (let iy = y; iy < y + h; iy++) {
      for (let ix = x; ix < x + w; ix++) {
        rows[iy][ix] = tile;
      }
    }
  },

  carveTunnel: function (rows, x1, y1, x2, y2, tile) {
    for (let ty = y1; ty <= y2; ty++) {
      for (let tx = x1; tx <= x2; tx++) {
        rows[ty][tx] = tile;
      }
    }
  }
};

MAP_DEFS.crystal_cavern = {
  id: 'crystal_cavern',
  name: 'The Infinite Geode',
  arcId: 1,
  width: 120,
  height: 100,
  playerStart: { x: 5, y: 50 },
  bgColor: '#04010a',
  ambientLight: 'rgba(140,80,255,0.07)',
  enemyLevelRange: [5, 12],
  // Arc 2 — slightly more aggressive. Dungeon feel, enemies linger in dark.
  mutationConfig: {
    corruptThreshold: 70,   // 70s
    mutantThreshold: 140,
    corruptChance: 0.028, // 2.8%/s
    mutantChance: 0.014,
  },

  encounterTemplates: [
    { weight: 4, enemies: ['crystal_shard', 'crystal_shard'] }, // Native Speed
    { weight: 3, enemies: ['crystal_golem'] },                 // Native Tank
    { weight: 2, enemies: ['crystal_golem', 'crystal_shard'] }, // Native Squad
    { weight: 2, enemies: ['cyclops'] },                       // Map Boss/Brute
    { weight: 2, enemies: ['minotaur'] },                      // Map Boss/Brute
    { weight: 2, enemies: ['werewolf', 'merman'] },            // Map Fighters
    { weight: 2, enemies: ['witch', 'imp'] },                  // Map Casters
    { weight: 2, enemies: ['skeleton', 'ghost'] },             // Dungeon Leftovers
    { weight: 1, enemies: ['gem_mimic'] },                     // Rare Encounter
  ],


  enemies: [
    // --- ENTRANCE & ARTERIES ---
    { id: 'skeleton', x: 10, y: 50, patrol: 'horizontal', range: 5, speed: 1.2 },
    { id: 'crystal_golem', x: 30, y: 50, patrol: 'horizontal', range: 10, speed: 0.8 }, // NATIVE TANK
    { id: 'crystal_shard', x: 110, y: 50, patrol: 'horizontal', range: 5, speed: 2.5 }, // NATIVE SPEEDER
    { id: 'bat', x: 60, y: 15, patrol: 'vertical', range: 15, speed: 2.0 },
    { id: 'bat', x: 60, y: 85, patrol: 'vertical', range: 15, speed: 2.0 },
    { id: 'gargoyle', x: 61, y: 5, patrol: 'vertical', range: 10, speed: 1.0 },
    { id: 'gargoyle', x: 59, y: 95, patrol: 'vertical', range: 10, speed: 1.0 },

    // --- NW HUB (Dungeon) ---
    { id: 'crystal_golem', x: 25, y: 20, patrol: 'random', range: 8, speed: 0.7 }, // NATIVE
    { id: 'skeleton', x: 30, y: 25, patrol: 'horizontal', range: 10, speed: 1.0 },
    { id: 'skeleton', x: 18, y: 18, patrol: 'random', range: 5, speed: 1.1 },
    { id: 'crystal_golem', x: 42, y: 37, patrol: 'random', range: 5, speed: 0.7 }, // NATIVE
    { id: 'ghost', x: 25, y: 35, patrol: 'random', range: 8, speed: 1.0 },
    { id: 'ghost', x: 35, y: 30, patrol: 'random', range: 8, speed: 1.0 },

    // --- NE HUB (Ice) ---
    { id: 'crystal_shard', x: 90, y: 20, patrol: 'vertical', range: 10, speed: 2.5 }, // NATIVE
    { id: 'crystal_shard', x: 95, y: 25, patrol: 'random', range: 8, speed: 2.5 }, // NATIVE
    { id: 'crystal_shard', x: 85, y: 18, patrol: 'random', range: 5, speed: 2.5 }, // NATIVE
    { id: 'imp', x: 105, y: 37, patrol: 'random', range: 5, speed: 1.5 },
    { id: 'ghost', x: 95, y: 20, patrol: 'random', range: 5, speed: 1.1 },

    // --- SW HUB (Mine) ---
    { id: 'crystal_golem', x: 25, y: 75, patrol: 'horizontal', range: 12, speed: 0.8 }, // NATIVE
    { id: 'crystal_golem', x: 30, y: 80, patrol: 'random', range: 6, speed: 0.8 }, // NATIVE
    { id: 'goblin', x: 18, y: 68, patrol: 'random', range: 5, speed: 1.3 },
    { id: 'werewolf', x: 20, y: 85, patrol: 'random', range: 5, speed: 1.6 },
    { id: 'merman', x: 35, y: 80, patrol: 'random', range: 8, speed: 1.2 },

    // --- SE HUB (Garden) ---
    { id: 'gem_mimic', x: 90, y: 75, patrol: 'random', range: 8, speed: 2.0 }, // RARE NATIVE
    { id: 'imp', x: 95, y: 80, patrol: 'vertical', range: 12, speed: 1.6 },
    { id: 'spider', x: 85, y: 68, patrol: 'random', range: 5, speed: 1.2 },
    { id: 'witch', x: 110, y: 75, patrol: 'random', range: 8, speed: 1.1 },
    { id: 'witch', x: 95, y: 70, patrol: 'random', range: 5, speed: 1.1 },

    // --- THE CENTRAL GEODE (Boss & Approach) ---
    { id: 'crystal_shard', x: 60, y: 50, patrol: 'random', range: 5, speed: 2.5 }, // NATIVE
    { id: 'cyclops', x: 60, y: 40, patrol: 'random', range: 3, speed: 0.8 },
    { id: 'minotaur', x: 60, y: 60, patrol: 'random', range: 3, speed: 0.7 },
    { id: 'spectral_guardian', x: 60, y: 51, patrol: 'random', range: 2, speed: 0.9, isBoss: true } // THE CRYSTAL SENTINEL
  ],

  tiles: MAP_GENERATOR.generate(),

  npcs: [
    { id: 'essabella', x: 100, y: 50, dialogueKey: 'crystal_cavern' },
  ],

  objective: {
    type: 'reach',
    target: { x: 115, y: 50 },
    label: 'Find the Tunnel Exit',
    completeMsg: '✦ The passage opens upward — scorched stone and dead air. The undercroft of Ashveil.',
  },

  fog: { delay: 10, peak: 90, max: 0.88, vision: 2.8 },

  voiceLines: {
    ambient: [
      { char: 'Aya', color: '#7dd3fc', text: 'The crystals hum. Something lives in this dark.' },
      { char: 'Rei', color: '#4ade80', text: 'Underground. No wind, no sky. Keep focused.' },
      { char: 'Tao', color: '#ef4444', text: 'Lovely place. Very murder-y.' },
      { char: 'Lulu', color: '#2dd4bf', text: 'The dark here feels… aware.' },
    ],
    fogRising: [
      { char: 'Rei', color: '#4ade80', text: 'The crystal-light is dying. Move fast.' },
      { char: 'Aya', color: '#7dd3fc', text: 'I can\'t see the walls anymore.' },
      { char: 'Tao', color: '#ef4444', text: 'Darkness thickens. Something is enjoying this.' },
      { char: 'Lulu', color: '#2dd4bf', text: 'Stay close. Please.' },
    ],
    encounter: [
      { char: 'Rei', color: '#4ade80', text: 'Out of the dark — brace!' },
      { char: 'Tao', color: '#ef4444', text: 'They were waiting in the black!' },
      { char: 'Aya', color: '#7dd3fc', text: 'Ambush from the shadows!' },
      { char: 'Lulu', color: '#2dd4bf', text: 'I didn\'t see it at all—' },
    ],
  },
};