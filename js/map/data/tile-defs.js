/**
 * tile-defs.js — Tile palette definitions.
 */

const TILE_DEFS = {
  // ── CORE TERRAIN ──────────────────────────────────────────────
  0: { name: 'void', walkable: false, color: '#0d0a18', hi: '#1a1428', shadow: '#000000' },
  1: { name: 'grass', walkable: true, color: '#2d5a1e', hi: '#3d7028', shadow: '#1d4012', anim: true },
  2: { name: 'path', walkable: true, color: '#8a7050', hi: '#9d8060', shadow: '#6a5438' },
  3: { name: 'water', walkable: false, color: '#1a4580', hi: '#2a5898', shadow: '#0f2d50', anim: true },
  4: { name: 'bridge', walkable: true, color: '#8d6d48', hi: '#a07d58', shadow: '#6a5030' },
  5: { name: 'forest', walkable: false, color: '#1a3d15', hi: '#285020', shadow: '#0f2810', svgAsset: 'oak' },
  6: { name: 'mountain', walkable: false, color: '#5d5773', hi: '#706a88', shadow: '#403d50' },
  7: { name: 'cave-floor', walkable: true, color: '#3a2850', hi: '#4d3865', shadow: '#251838' },
  8: { name: 'cave-wall', walkable: false, color: '#241a35', hi: '#322848', shadow: '#15101e' },
  9: { name: 'dungeon', walkable: true, color: '#2d2240', hi: '#3d3050', shadow: '#1a1528' },
  10: { name: 'sand', walkable: true, color: '#a58860', hi: '#b89870', shadow: '#806845' },
  11: { name: 'flower', walkable: true, color: '#2d5a1e', hi: '#3d7028', shadow: '#1d4012', detail: 'flower', anim: true, svgAsset: 'flower' },
  12: { name: 'town-floor', walkable: true, color: '#654830', hi: '#755838', shadow: '#4a3520', detail: 'cobble' },
  13: { name: 'lava-floor', walkable: true, color: '#c54520', hi: '#e55828', shadow: '#8d3018', anim: true, slow: true },
  14: { name: 'scorched-earth', walkable: true, color: '#4d3020', hi: '#603d28', shadow: '#301d10' },
  15: { name: 'cracked-stone', walkable: true, color: '#6a5d70', hi: '#7d7085', shadow: '#4d4558', detail: 'crack' },
  16: { name: 'ember-pit', walkable: false, color: '#a53815', hi: '#c54a20', shadow: '#6a2008', anim: true },
  17: { name: 'obsidian-wall', walkable: false, color: '#1a1628', hi: '#2a2438', shadow: '#0d0a12' },
  18: { name: 'shallow-water', walkable: true, color: '#4e86b0', hi: '#6e96c0', shadow: '#2e5680', anim: true },
  19: { name: 'frozen-snow', walkable: true, color: '#e0f7fa', hi: '#ffffff', shadow: '#b2ebf2', detail: 'frost' },
  22: { name: 'rapids', walkable: false, color: '#a0c0ff', hi: '#ffffff', shadow: '#70a0ff', anim: true },

  // ── VEGETATION ────────────────────────────────────────────────
  33: { name: 'ash-field', walkable: true, color: '#302820', hi: '#403828', shadow: '#1a1410' },
  36: { name: 'dense-jungle', walkable: false, color: '#154520', hi: '#1e5828', shadow: '#0a2d12', svgAsset: 'pine' },
  37: { name: 'shrub', walkable: true, color: '#3a5828', hi: '#4a6835', shadow: '#283d18', detail: 'shrub', anim: true, svgAsset: 'shrub' },
  38: { name: 'dead-tree', walkable: false, color: '#4a3828', hi: '#5a4830', shadow: '#301e15', detail: 'dead-tree', svgAsset: 'dead_tree' },
  39: { name: 'mushroom-patch', walkable: true, color: '#4d3850', hi: '#5d4860', shadow: '#302038', detail: 'mushroom', svgAsset: 'mushroom' },
  40: { name: 'tall-grass', walkable: true, color: '#2d5a1e', hi: '#3d7028', shadow: '#1d4012', anim: true, detail: 'tall-grass' },

  // ── UNDERGROUND / DUNGEON ─────────────────────────────────────
  59: { name: 'crystal-cave', walkable: true, color: '#302858', hi: '#403870', shadow: '#1e1838', glows: '#8860ff60', detail: 'crystal', svgAsset: 'crystal' },
  68: { name: 'stone-wall', walkable: false, color: '#4a4a4a', hi: '#5a5a5a', shadow: '#2a2a2a' },
  73: { name: 'ruin-floor', walkable: true, color: '#5a5a6a', hi: '#6a6a7a', shadow: '#3a3a4a', detail: 'stone' },

  // ── TOWN / CIVILISATION ───────────────────────────────────────
  74: { name: 'well', walkable: false, color: '#686860', hi: '#787870', shadow: '#484840', detail: 'well', interactive: true, svgAsset: 'well', footprint: [[0, 0], [1, 0]] },
  75: { name: 'market-stall', walkable: false, color: '#904830', hi: '#a05840', shadow: '#681e14', detail: 'stall', svgAsset: 'market', footprint: [[0, 0], [1, 0]] },
  86: { name: 'portal', walkable: true, color: '#6200ea', hi: '#b388ff', shadow: '#311b92', anim: true },
  80: { name: 'throne', walkable: true, color: '#fbbf24', hi: '#fef3c7', shadow: '#d97706', detail: 'gold' },
  88: { name: 'altar', walkable: false, color: '#484060', hi: '#585070', shadow: '#2d2840', detail: 'altar', interactive: true, svgAsset: 'statue' },
  110: { name: 'rubble', walkable: true, color: '#4a4a5a', hi: '#5a5a6a', shadow: '#2a2a3a', detail: 'debris' },
  111: { name: 'chest', walkable: true, color: '#8d6e63', svgAsset: 'chest' },
  112: { name: 'mossy-stone', walkable: true, color: '#2d4a1e', hi: '#3d5a28', shadow: '#1d2a12' }
};

// ── SVG ASSET MAPPING (IDs 200+) ─────────────────────────────
TILE_DEFS[200] = { name: 'SVG Oak', walkable: false, svgAsset: 'oak', color: '#2d5a1e' };
TILE_DEFS[201] = { name: 'SVG Pine', walkable: false, svgAsset: 'pine', color: '#153010' };
TILE_DEFS[202] = { name: 'SVG Shrub', walkable: true, svgAsset: 'shrub', color: '#3d6825' };
TILE_DEFS[203] = { name: 'SVG Boulder', walkable: false, svgAsset: 'boulder', color: '#666' };
TILE_DEFS[204] = { name: 'SVG Mushroom', walkable: true, svgAsset: 'mushroom', color: '#ff5252' };
TILE_DEFS[205] = { name: 'SVG Flower', walkable: true, svgAsset: 'flower', color: '#ff4081' };
TILE_DEFS[206] = { name: 'SVG Crystal', walkable: true, svgAsset: 'crystal', color: '#6200ea' };
TILE_DEFS[207] = { name: 'SVG Lily', walkable: true, svgAsset: 'lily', color: '#2e7d32' };
TILE_DEFS[208] = { name: 'SVG Dead Tree', walkable: false, svgAsset: 'dead_tree', color: '#3e2723' };
TILE_DEFS[209] = { name: 'SVG Well', walkable: false, svgAsset: 'well', color: '#787068' };
TILE_DEFS[210] = { name: 'SVG Market', walkable: false, svgAsset: 'market', color: '#8d6e63' };
TILE_DEFS[211] = { name: 'SVG Chest', walkable: true, svgAsset: 'chest', color: '#ffd700' };
TILE_DEFS[212] = { name: 'SVG Statue', walkable: false, svgAsset: 'statue', color: '#78909c' };

// ── EXPANDED SVG LIBRARY (IDs 220+) ──────────────────────────
TILE_DEFS[220] = { name: 'SVG Fountain', walkable: false, svgAsset: 'fountain', color: '#718096', vScale: 2.5, footprint: [[0, 0], [1, 0], [0, 1], [1, 1]] };
TILE_DEFS[221] = { name: 'SVG Obelisk', walkable: false, svgAsset: 'obelisk', color: '#4a5568', vScale: 2.0 };
TILE_DEFS[222] = { name: 'SVG Tombstone', walkable: true, svgAsset: 'tombstone', color: '#718096' };
TILE_DEFS[223] = { name: 'SVG Pillar Br', walkable: false, svgAsset: 'pillar_broken', color: '#a0aec0', vScale: 1.5 };
TILE_DEFS[224] = { name: 'SVG Wagon', walkable: false, svgAsset: 'wagon', color: '#8d6e63', vScale: 2.5, vOffset: { x: 0, y: 5 }, anchor: 'bottom-left', collisionMask: ['XXX'] };
TILE_DEFS[225] = { name: 'SVG Tent', walkable: false, svgAsset: 'tent', color: '#90caf9', vScale: 3.5, vOffset: { x: 0, y: 10 }, anchor: 'bottom-left', collisionMask: ['.X.', 'XXX', 'X.X'] };
TILE_DEFS[226] = { name: 'SVG Campfire', walkable: true, svgAsset: 'campfire', color: '#ff9800', anim: true, vScale: 1.5, vOffset: { x: 0, y: 5 } };
TILE_DEFS[227] = { name: 'SVG Signpost', walkable: true, svgAsset: 'signpost', color: '#8d6e63', vScale: 1.8 };
TILE_DEFS[228] = { name: 'SVG Lamp', walkable: true, svgAsset: 'street_lamp', color: '#2d3748', anim: true, vScale: 2.0 };
TILE_DEFS[229] = { name: 'SVG Archway', walkable: true, svgAsset: 'archway', color: '#718096', vScale: 3.0, anchor: 'bottom-left', collisionMask: ['X.X'] };

// ── DARK FANTASY POI (IDs 230+) ──────────────────────────────
TILE_DEFS[230] = { name: 'Void Rift', walkable: true, svgAsset: 'void_rift', color: '#4a148c', anim: true, glows: '#6a1b9a60', vScale: 4.0, anchor: 'bottom-left', collisionMask: ['.X.', 'X.X', '.X.'] };
TILE_DEFS[231] = { name: 'Cursed Idol', walkable: false, svgAsset: 'cursed_idol', color: '#263238', interactive: true, vScale: 1.5 };
TILE_DEFS[232] = { name: 'Skeleton', walkable: true, svgAsset: 'skeleton', color: '#e0e0e0', vScale: 1.2 };
TILE_DEFS[233] = { name: 'Float Crystal', walkable: false, svgAsset: 'floating_crystal', color: '#b388ff', anim: true, glows: '#7c4dff40', vScale: 2.2 };
TILE_DEFS[234] = { name: 'Ancient Col', walkable: false, svgAsset: 'ancient_pillar', color: '#546e7a', vScale: 2.8, vOffset: { x: 0, y: -20 } };
TILE_DEFS[235] = { name: 'Wither Vine', walkable: true, svgAsset: 'withered_vine', color: '#3e2723', vScale: 1.5 };
TILE_DEFS[236] = { name: 'Sac Altar', walkable: false, svgAsset: 'sacrificial_altar', color: '#37474f', interactive: true, vScale: 2.5, anchor: 'bottom-left', collisionMask: ['XXX'] };
TILE_DEFS[237] = { name: 'Void Spires', walkable: false, svgAsset: 'void_spires', color: '#1a1a1a', vScale: 3.5, footprint: [[0, 0], [0, -1]] };
TILE_DEFS[238] = { name: 'Iron Maiden', walkable: false, svgAsset: 'iron_maiden', color: '#263238', vScale: 1.8 };
TILE_DEFS[239] = { name: 'Magic Circle', walkable: true, svgAsset: 'magic_circle', color: '#7b1fa2', anim: true, glows: '#ba68c830', vScale: 4.5, footprint: [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] };
TILE_DEFS[240] = { name: 'Stone Tower', walkable: false, svgAsset: 'tower', color: '#2d3748', vScale: 4.5, anchor: 'bottom-left', collisionMask: ['XXX', 'XXX'] };
TILE_DEFS[241] = { name: 'Royal Castle', walkable: false, svgAsset: 'castle', color: '#4a5568', vScale: 6.0, anchor: 'bottom-left', collisionMask: ['XXXXX', 'XXXXX'] };
TILE_DEFS[242] = { name: 'Noble Estate', walkable: false, svgAsset: 'noble_house', color: '#e2e8f0', vScale: 4.0, anchor: 'bottom-left', collisionMask: ['XXXX', 'XXXX'] };
TILE_DEFS[243] = { name: 'Ruined Tower', walkable: false, svgAsset: 'ruined_tower', color: '#2d3748', vScale: 4.5, anchor: 'bottom-left', collisionMask: ['XXX', 'XXX'] };
TILE_DEFS[244] = { name: 'Ruined Castle', walkable: false, svgAsset: 'ruined_castle', color: '#4a5568', vScale: 6.0, anchor: 'bottom-left', collisionMask: ['XXXXX', 'XXXXX'] };
TILE_DEFS[245] = { name: 'Shattered Throne', walkable: false, svgAsset: 'shattered_throne', color: '#fbbf24', vScale: 3.5, anchor: 'bottom-left', collisionMask: ['XXX', 'XXX'] };
TILE_DEFS[246] = { name: 'Broken Knight', walkable: false, svgAsset: 'broken_knight', color: '#718096', vScale: 2.5 };
TILE_DEFS[247] = { name: 'Cursed Well', walkable: false, svgAsset: 'cursed_well', color: '#6a1b9a', vScale: 2.2, anchor: 'bottom-left', collisionMask: ['XXX'] };
TILE_DEFS[248] = { name: 'Withered Tree', walkable: false, svgAsset: 'withered_tree', color: '#e2e8f0', vScale: 4.0 };
TILE_DEFS[249] = { name: 'Grand Castle', walkable: false, svgAsset: 'large_castle', color: '#6b7280', vScale: 9.0, anchor: 'bottom-left', collisionMask: ['XXXXXXXXXX', 'XXXXXXXXXX', 'XXXXXXXXXX'] };
TILE_DEFS[252] = { name: 'Giant Fishman Hut', walkable: false, svgAsset: 'large_fishman_hut', color: '#795548', vScale: 5.0, anchor: 'bottom-left', collisionMask: ['XXXXX', 'XXXXX'] };
TILE_DEFS[253] = { name: 'Grand Noble Villa', walkable: false, svgAsset: 'large_noble_villa', color: '#eceff1', vScale: 5.0, anchor: 'bottom-left', collisionMask: ['XXXXX', 'XXXXX'] };
TILE_DEFS[254] = { name: 'Imperial Command Tent', walkable: false, svgAsset: 'large_military_tent', color: '#546e7a', vScale: 3.0, anchor: 'bottom-left', collisionMask: ['XXX', 'XXX'] };
TILE_DEFS[250] = { name: 'Crystal Stairs Down', walkable: true, svgAsset: 'void_rift', color: '#6200ea', glows: 'rgba(100, 200, 255, 0.4)', vScale: 3.5, anchor: 'bottom-left' };
TILE_DEFS[251] = { name: 'Crystal Stairs Up', walkable: true, svgAsset: 'void_rift', color: '#ff9800', glows: 'rgba(255, 200, 100, 0.4)', vScale: 3.5, anchor: 'bottom-left' };

// ── FURNITURE & INTERIOR (IDs 300+) ──────────────────────────
TILE_DEFS[300] = { name: 'Royal Table', walkable: false, svgAsset: 'royal_table', color: '#5d4037', vScale: 2.2, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[301] = { name: 'Wooden Chair', walkable: true, svgAsset: 'wooden_chair', color: '#8d6e63', vScale: 1.5 };
TILE_DEFS[302] = { name: 'Stone Bench', walkable: false, svgAsset: 'stone_bench', color: '#b0bec5', vScale: 1.2, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[303] = { name: 'Golden Throne', walkable: false, svgAsset: 'throne_gold', color: '#fbbf24', vScale: 3.5, footprint: [[0, 0], [1, 0]], collisionMask: ['XXX'] };
TILE_DEFS[304] = { name: 'Alchemy Table', walkable: false, svgAsset: 'alchemy_table', color: '#5d4037', vScale: 2.2, footprint: [[0, 0], [1, 0]], glows: '#00bcd430' };
TILE_DEFS[305] = { name: 'Bookshelf', walkable: false, svgAsset: 'bookshelf', color: '#4e342e', vScale: 3.0, footprint: [[0, 0], [1, 0]], collisionMask: ['XXX'] };
TILE_DEFS[306] = { name: 'Fireplace', walkable: false, svgAsset: 'fireplace', color: '#37474f', vScale: 3.0, anim: true, glows: '#ff980040', footprint: [[0, 0], [1, 0]], collisionMask: ['XXX'] };
TILE_DEFS[307] = { name: 'Armor Stand', walkable: false, svgAsset: 'armor_stand', color: '#eceff1', vScale: 2.0 };
TILE_DEFS[308] = { name: 'Weapon Rack', walkable: false, svgAsset: 'weapon_rack', color: '#3e2723', vScale: 2.0, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[309] = { name: 'Fancy Bed', walkable: false, svgAsset: 'bed_fancy', color: '#ef5350', vScale: 3.5, footprint: [[0, 0], [1, 0]], collisionMask: ['XXX', 'XXX'] };

// ── CASTLE OUTDOORS (IDs 310+) ──────────────────────────────
TILE_DEFS[310] = { name: 'Knight Statue', walkable: false, svgAsset: 'knight_statue', color: '#cfd8dc', vScale: 3.5, footprint: [[0, 0]] };
TILE_DEFS[311] = { name: 'Iron Gate', walkable: false, svgAsset: 'iron_gate', color: '#37474f', vScale: 4.5, footprint: [[0, 0], [1, 0]], collisionMask: ['XX'] };
TILE_DEFS[312] = { name: 'Training Dummy', walkable: false, svgAsset: 'training_dummy', color: '#ffe082', vScale: 2.5 };
TILE_DEFS[313] = { name: 'Siege Catapult', walkable: false, svgAsset: 'catapult', color: '#4e342e', vScale: 4.0, footprint: [[0, 0], [1, 0], [0, 1], [1, 1]], collisionMask: ['XX', 'XX'] };
TILE_DEFS[314] = { name: 'Hanging Cage', walkable: true, svgAsset: 'hanging_cage', color: '#37474f', vScale: 2.8, vOffset: { x: 0, y: -20 } };
TILE_DEFS[315] = { name: 'Royal Banner', walkable: false, svgAsset: 'royal_banner', color: '#4a148c', vScale: 4.5 };
TILE_DEFS[316] = { name: 'Castle Wall', walkable: false, svgAsset: 'castle_wall', color: '#90a4ae', vScale: 3.0, footprint: [[0, 0], [1, 0]], collisionMask: ['XX'] };
TILE_DEFS[318] = { name: 'Drawbridge', walkable: true, svgAsset: 'drawbridge', color: '#5d4037', vScale: 4.0, footprint: [[0, 0], [1, 0], [0, 1], [1, 1]] };
TILE_DEFS[319] = { name: 'Archery Target', walkable: false, svgAsset: 'archery_target', color: '#ffe082', vScale: 2.2 };

// ── BUILDINGS & BARRACKS (IDs 320+) ──────────────────────────
TILE_DEFS[320] = { name: 'Soldier Barracks', walkable: false, svgAsset: 'barracks', color: '#5d4037', vScale: 4.0, footprint: [[0, 0], [1, 0], [2, 0]], collisionMask: ['XXX'] };
TILE_DEFS[321] = { name: 'Archery Range', walkable: false, svgAsset: 'archery_range', color: '#8d6e63', vScale: 3.5, footprint: [[0, 0], [1, 0], [2, 0]] };
TILE_DEFS[322] = { name: 'Blacksmith', walkable: false, svgAsset: 'blacksmith', color: '#455a64', vScale: 3.2, glows: '#ff572230', footprint: [[0, 0], [1, 0]] };
TILE_DEFS[323] = { name: 'Royal Stable', walkable: false, svgAsset: 'stable', color: '#795548', vScale: 3.8, footprint: [[0, 0], [1, 0], [2, 0]] };
TILE_DEFS[324] = { name: 'Village Tavern', walkable: false, svgAsset: 'tavern', color: '#5d4037', vScale: 4.2, footprint: [[0, 0], [1, 0], [2, 0]], collisionMask: ['XXX'] };
TILE_DEFS[325] = { name: 'Old Chapel', walkable: false, svgAsset: 'chapel', color: '#cfd8dc', vScale: 4.5, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[326] = { name: 'Watchtower', walkable: false, svgAsset: 'watchtower', color: '#5d4037', vScale: 5.0, footprint: [[0, 0]] };
TILE_DEFS[327] = { name: 'Stone Wall Seg', walkable: false, svgAsset: 'wall_section', color: '#90a4ae', vScale: 2.5, footprint: [[0, 0]] };
TILE_DEFS[328] = { name: 'Circular Granary', walkable: false, svgAsset: 'granary', color: '#b0bec5', vScale: 3.0 };
TILE_DEFS[329] = { name: 'Healer Hut', walkable: false, svgAsset: 'healer_hut', color: '#5d4037', vScale: 3.0, footprint: [[0, 0], [1, 0]] };

// ── CIVILIAN BUILDINGS (IDs 330+) ──────────────────────────
TILE_DEFS[330] = { name: 'Small Cottage', walkable: false, svgAsset: 'cottage', color: '#a1887f', vScale: 2.8, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[331] = { name: 'Large Farmhouse', walkable: false, svgAsset: 'farmhouse', color: '#8d6e63', vScale: 4.2, footprint: [[0, 0], [1, 0], [2, 0]], collisionMask: ['XXX'] };
TILE_DEFS[332] = { name: 'Village Windmill', walkable: false, svgAsset: 'windmill', color: '#cfd8dc', vScale: 5.5, footprint: [[0, 0], [1, 0], [0, 1], [1, 1]], collisionMask: ['XX', 'XX'] };
TILE_DEFS[333] = { name: 'Covered Well', walkable: false, svgAsset: 'well_house', color: '#90a4ae', vScale: 2.5 };
TILE_DEFS[334] = { name: 'Wood Workshop', walkable: false, svgAsset: 'workshop', color: '#8d6e63', vScale: 3.2, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[335] = { name: 'General Store', walkable: false, svgAsset: 'merchant_store', color: '#5d4037', vScale: 3.8, footprint: [[0, 0], [1, 0], [2, 0]], collisionMask: ['XXX'] };
TILE_DEFS[336] = { name: 'Village Library', walkable: false, svgAsset: 'library', color: '#cfd8dc', vScale: 4.8, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[337] = { name: 'Old Bakery', walkable: false, svgAsset: 'bakery', color: '#d7ccc8', vScale: 3.5, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[338] = { name: 'Fisherman Hut', walkable: false, svgAsset: 'fisherman_hut', color: '#a1887f', vScale: 3.2, footprint: [[0, 0], [1, 0], [2, 0]] };
TILE_DEFS[339] = { name: 'Village Hall', walkable: false, svgAsset: 'village_hall', color: '#cfd8dc', vScale: 5.0, footprint: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], collisionMask: ['XXX', 'XXX'] };

// ── [EXPANSION] MILITARY BARRACKS (IDs 320-329) ─────────────────
TILE_DEFS[320] = { name: 'Soldier Tent', walkable: false, svgAsset: 'military_tent', color: '#5d4037', vScale: 2.5, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[321] = { name: 'Training Ring', walkable: true, svgAsset: 'training_ring', color: '#8d6e63', vScale: 4.0 };
TILE_DEFS[322] = { name: 'Weapon Rack', walkable: false, svgAsset: 'weapon_rack', color: '#4e342e', vScale: 1.5 };
TILE_DEFS[323] = { name: 'Supply Crate', walkable: false, svgAsset: 'supply_crate', color: '#795548', vScale: 1.2 };
TILE_DEFS[324] = { name: 'Guard Tower', walkable: false, svgAsset: 'watchtower', color: '#455a64', vScale: 5.5, footprint: [[0, 0]] };
TILE_DEFS[325] = { name: 'Officer Quarters', walkable: false, svgAsset: 'barracks', color: '#37474f', vScale: 4.5, footprint: [[0, 0], [1, 0], [2, 0]] };

// ── [EXPANSION] CIVILIAN VILLAGE (IDs 330-339) ──────────────────
TILE_DEFS[330] = { name: 'Windmill', walkable: false, svgAsset: 'windmill', color: '#a1887f', vScale: 6.0, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[331] = { name: 'Granary', walkable: false, svgAsset: 'granary', color: '#8d6e63', vScale: 4.5, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[332] = { name: 'Village Well', walkable: false, svgAsset: 'well_house', color: '#b0bec5', vScale: 2.2 };
TILE_DEFS[333] = { name: 'Blacksmith', walkable: false, svgAsset: 'blacksmith', color: '#4e342e', vScale: 4.0, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[334] = { name: 'Market Stall', walkable: true, svgAsset: 'merchant_store', color: '#ffccbc', vScale: 2.5 };
TILE_DEFS[335] = { name: 'Thatch Cottage', walkable: false, svgAsset: 'cottage', color: '#d7ccc8', vScale: 3.5, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[336] = { name: 'Stone Workshop', walkable: false, svgAsset: 'workshop', color: '#90a4ae', vScale: 4.2, footprint: [[0, 0], [1, 0], [2, 0]] };
TILE_DEFS[337] = { name: 'Bakery', walkable: false, svgAsset: 'bakery', color: '#ffe0b2', vScale: 3.8, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[338] = { name: 'Fisherman Hut', walkable: false, svgAsset: 'fisherman_hut', color: '#a1887f', vScale: 3.2, footprint: [[0, 0], [1, 0], [2, 0]] };
TILE_DEFS[339] = { name: 'Village Hall', walkable: false, svgAsset: 'village_hall', color: '#cfd8dc', vScale: 5.0, footprint: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], collisionMask: ['XXX', 'XXX'] };

// ── [EXPANSION] NOBLE ESTATE (IDs 340-349) ──────────────────────
TILE_DEFS[340] = { name: 'Grand Manor', walkable: false, svgAsset: 'estate_manor', color: '#cfd8dc', vScale: 6.5, footprint: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], collisionMask: ['XXX', 'XXX'] };
TILE_DEFS[341] = { name: 'Glass Conservatory', walkable: false, svgAsset: 'conservatory', color: 'rgba(144,202,249,0.4)', vScale: 3.5, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[342] = { name: 'Guest Villa', walkable: false, svgAsset: 'noble_villa', color: '#eceff1', vScale: 3.8, footprint: [[0, 0], [1, 0], [2, 0]] };
TILE_DEFS[343] = { name: 'Garden Gazebo', walkable: true, svgAsset: 'gazebo', color: '#cfd8dc', vScale: 3.0 };
TILE_DEFS[344] = { name: 'Triumphal Arch', walkable: true, svgAsset: 'triumphal_arch', color: '#cfd8dc', vScale: 4.5, footprint: [[0, 0], [1, 0], [2, 0]], collisionMask: ['X.X'] };

// ── NATURE (IDs 350+) ────────────────────────────────────────
TILE_DEFS[350] = { name: 'Apple Tree', walkable: false, svgAsset: 'apple_tree', color: '#2e7d32', vScale: 2.5 };
TILE_DEFS[351] = { name: 'Palm Tree', walkable: false, svgAsset: 'palm_tree', color: '#33691e', vScale: 3.5 };
TILE_DEFS[352] = { name: 'Cherry Blossom', walkable: false, svgAsset: 'cherry_blossom', color: '#ad1457', vScale: 2.8 };
TILE_DEFS[353] = { name: 'Giant Mushroom', walkable: false, svgAsset: 'giant_mushroom', color: '#7f0000', vScale: 2.5 };
TILE_DEFS[354] = { name: 'Cactus', walkable: false, svgAsset: 'cactus', color: '#33691e', vScale: 2.2 };
TILE_DEFS[355] = { name: 'Bamboo', walkable: false, svgAsset: 'bamboo', color: '#558b2f', vScale: 2.8 };
TILE_DEFS[356] = { name: 'Vine Cluster', walkable: false, svgAsset: 'vine_cluster', color: '#1b5e20', vScale: 2.0 };

// ── DARK FANTASY (IDs 357+) ──────────────────────────────────
TILE_DEFS[357] = { name: 'Rune Stone', walkable: false, svgAsset: 'rune_stone', color: '#455a64', vScale: 2.5, glows: '#00e5ff30' };
TILE_DEFS[358] = { name: 'Bone Pile', walkable: true, svgAsset: 'bone_pile', color: '#bdbdbd', vScale: 1.5 };
TILE_DEFS[359] = { name: 'Dark Altar', walkable: false, svgAsset: 'dark_altar', color: '#1a1a2e', vScale: 2.8, glows: '#b71c1c40', footprint: [[0, 0], [1, 0]] };
TILE_DEFS[360] = { name: 'Cursed Tree', walkable: false, svgAsset: 'cursed_tree', color: '#1a0a00', vScale: 3.0 };
TILE_DEFS[361] = { name: 'Spectral Flame', walkable: true, svgAsset: 'spectral_flame', color: '#006064', vScale: 2.0, anim: true, glows: '#00e5ff40' };
TILE_DEFS[362] = { name: 'Soul Lantern', walkable: true, svgAsset: 'soul_lantern', color: '#1a2a2a', vScale: 2.5, anim: true, glows: '#69f0ae30' };
TILE_DEFS[363] = { name: 'Eldritch Eye', walkable: true, svgAsset: 'eldritch_eye', color: '#4a148c', vScale: 2.2, anim: true, glows: '#ff6f0040' };

// ── TOWN PROPS (IDs 364+) ────────────────────────────────────
TILE_DEFS[364] = { name: 'Barrel', walkable: false, svgAsset: 'barrel', color: '#5d4037', vScale: 1.8 };
TILE_DEFS[365] = { name: 'Hay Bale', walkable: false, svgAsset: 'hay_bale', color: '#f9a825', vScale: 1.8 };
TILE_DEFS[366] = { name: 'Water Trough', walkable: false, svgAsset: 'water_trough', color: '#0288d1', vScale: 1.5, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[367] = { name: 'Fence Section', walkable: false, svgAsset: 'fence_section', color: '#8d6e63', vScale: 1.5, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[368] = { name: 'Notice Board', walkable: false, svgAsset: 'notice_board', color: '#795548', vScale: 2.2, interactive: true };
TILE_DEFS[369] = { name: 'Flower Pot', walkable: true, svgAsset: 'flower_pot', color: '#bf360c', vScale: 1.8 };
TILE_DEFS[370] = { name: 'Market Cart', walkable: false, svgAsset: 'market_cart', color: '#e65100', vScale: 2.5, footprint: [[0, 0], [1, 0]] };

// ── DUNGEON PROPS (IDs 371+) ─────────────────────────────────
TILE_DEFS[371] = { name: 'Stalactite', walkable: false, svgAsset: 'stalactite', color: '#37474f', vScale: 2.0 };
TILE_DEFS[372] = { name: 'Dungeon Door', walkable: true, svgAsset: 'dungeon_door', color: '#1a2a30', vScale: 2.5, interactive: true };
TILE_DEFS[373] = { name: 'Cell Bars', walkable: false, svgAsset: 'cell_bars', color: '#263238', vScale: 2.0 };
TILE_DEFS[374] = { name: 'Spike Trap', walkable: true, svgAsset: 'spike_trap', color: '#455a64', vScale: 1.5 };
TILE_DEFS[375] = { name: 'Poison Mushroom', walkable: true, svgAsset: 'poison_mushroom', color: '#4a0000', vScale: 1.8, glows: '#76ff0330' };

// ── COMBAT & SIEGE (IDs 376+) ────────────────────────────────
TILE_DEFS[376] = { name: 'Iron Cannon', walkable: false, svgAsset: 'cannon', color: '#37474f', vScale: 2.5, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[377] = { name: 'Bonfire', walkable: true, svgAsset: 'bonfire', color: '#e65100', vScale: 2.2, anim: true, glows: '#ff6f0050' };

// ── COASTAL (IDs 378+) ───────────────────────────────────────
TILE_DEFS[378] = { name: 'Dock Posts', walkable: true, svgAsset: 'dock_post', color: '#4e342e', vScale: 2.0, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[379] = { name: 'Rowboat', walkable: false, svgAsset: 'rowboat', color: '#8d6e63', vScale: 2.0, footprint: [[0, 0], [1, 0]] };
TILE_DEFS[380] = { name: 'Lighthouse', walkable: false, svgAsset: 'lighthouse', color: '#cfd8dc', vScale: 4.5, anim: true, glows: '#fff17640', footprint: [[0, 0]] };
TILE_DEFS[381] = { name: 'Fishing Net', walkable: false, svgAsset: 'fishing_net', color: '#8d6e63', vScale: 2.0, footprint: [[0, 0], [1, 0]] };

// ── ARCANE (IDs 382+) ────────────────────────────────────────
TILE_DEFS[382] = { name: 'Arcane Pedestal', walkable: false, svgAsset: 'arcane_pedestal', color: '#1e1e3a', vScale: 2.5, glows: '#7c4dff40', interactive: true };
TILE_DEFS[383] = { name: 'Crystal Orb', walkable: false, svgAsset: 'crystal_orb', color: '#01579b', vScale: 2.5, anim: true, glows: '#40c4ff50', interactive: true };
TILE_DEFS[384] = { name: 'Spell Rune', walkable: true, svgAsset: 'spell_rune', color: '#4a148c', vScale: 2.0, anim: true, glows: '#ea80fc40', footprint: [[0, 0], [1, 0], [0, 1], [1, 1]] };

// ── SYSTEM TILES (IDs 250+) ──────────────────────────────────
TILE_DEFS[250] = { name: 'Blocker', walkable: false, color: 'transparent', hidden: true };

// ── VIRTUAL SPRITE IDs (1000+) ────────────────────────────────
const ENV_NAMES = [
  "Oak Tree A", "Oak Tree B", "Oak Tree C", "Oak Tree D",
  "Pine Tree A", "Pine Tree B", "Pine Tree C", "Pine Tree D",
  "Dead Oak A", "Dead Oak B", "Dead Pine A", "Dead Pine B",
  "Green Shrub A", "Green Shrub B", "Dark Shrub A", "Dark Shrub B",
  "Berry Bush A", "Berry Bush B", "Thorn Bush A", "Thorn Bush B",
  "Mossy Rock A", "Mossy Rock B", "Small Boulder A", "Small Boulder B",
  "Jagged Pillar A", "Jagged Pillar B", "Stone Spire A", "Stone Spire B",
  "Water Lily A", "Water Lily B", "Lotus Flower A", "Lotus Flower B",
  "Quartz Cluster", "Amethyst Cluster", "Emerald Cluster", "Void Crystal"
];

for (let i = 0; i < 36; i++) {
  let svg = 'shrub';
  if (i < 4) svg = 'oak';
  else if (i < 8) svg = 'pine';
  else if (i < 12) svg = 'dead_tree';
  else if (i < 20) svg = 'shrub';
  else if (i < 24) svg = 'boulder';
  else if (i < 28) svg = 'flower';
  else if (i < 32) svg = 'lily';
  else svg = 'crystal';

  TILE_DEFS[1000 + i] = {
    name: ENV_NAMES[i] || `Env Sprite ${i}`,
    walkable: i >= 20,
    svgAsset: svg,
    color: '#3d6825'
  };
}

// ── FLOOR 3 PREMIUM ASSETS (IDs 385+) ──────────────────────────
TILE_DEFS[385] = { name: 'Frozen Estate', walkable: false, svgAsset: 'frozen_house', color: '#b2ebf2', vScale: 3.5, footprint: [[0, 0], [1, 0]], collisionMask: ['XX'] };
TILE_DEFS[386] = { name: 'Ice Palace', walkable: false, svgAsset: 'ice_castle', color: '#e1f5fe', vScale: 6.5, anchor: 'bottom-left', footprint: [[0, 0], [1, 0], [2, 0]], collisionMask: ['XXX'] };
TILE_DEFS[387] = { name: 'Labyrinth Gate', walkable: true, svgAsset: 'labyrinth_gate', color: '#4dd0e1', vScale: 4.0, anchor: 'bottom-left', collisionMask: ['X.X'] };

// ── FROZEN VARIANTS (IDs 390+) ────────────────────────────────
TILE_DEFS[390] = { name: 'Frozen Cart', walkable: false, svgAsset: 'market_cart_frozen', vScale: 2.5 };
TILE_DEFS[391] = { name: 'Frozen Pine', walkable: false, svgAsset: 'pine_frozen', vScale: 4.5 };
TILE_DEFS[392] = { name: 'Frozen Notice Board', walkable: false, svgAsset: 'notice_board_frozen', vScale: 2.0 };
TILE_DEFS[393] = { name: 'Frozen Well', walkable: false, svgAsset: 'well_frozen', vScale: 2.8 };

const OBJECT_STAMPS = {
  'grand_oak': {
    name: 'Grand Oak',
    size: { w: 3, h: 3 },
    layers: {
      1: [[0, 0, 0], [0, 200, 0], [0, 0, 0]],
      2: [[202, 202, 202], [202, 0, 202], [202, 202, 202]]
    }
  },
  'market_well': {
    name: 'Market Well',
    size: { w: 3, h: 2 },
    layers: {
      1: [[210, 0, 209], [0, 0, 0]]
    }
  },
  'treasure_statue': {
    name: 'Secret Altar',
    size: { w: 3, h: 2 },
    layers: {
      1: [[212, 0, 211], [0, 0, 0]]
    }
  },
  'pine_grove': {
    name: 'Pine Grove',
    size: { w: 2, h: 2 },
    layers: {
      1: [[201, 201], [201, 201]]
    }
  },

  // ── FULL SVG LIBRARY ───────────────────────────
  'svg_oak': { name: 'Premium Oak', size: { w: 1, h: 1 }, layers: { 1: [[200]] } },
  'svg_pine': { name: 'Premium Pine', size: { w: 1, h: 1 }, layers: { 1: [[201]] } },
  'svg_shrub': { name: 'Premium Shrub', size: { w: 1, h: 1 }, layers: { 1: [[202]] } },
  'svg_rock': { name: 'Premium Rock', size: { w: 1, h: 1 }, layers: { 1: [[203]] } },
  'svg_mush': { name: 'Premium Mush', size: { w: 1, h: 1 }, layers: { 1: [[204]] } },
  'svg_flow': { name: 'Premium Flow', size: { w: 1, h: 1 }, layers: { 1: [[205]] } },
  'svg_crys': { name: 'Premium Crys', size: { w: 1, h: 1 }, layers: { 1: [[206]] } },
  'svg_lily': { name: 'Premium Lily', size: { w: 1, h: 1 }, layers: { 0: [[207]] } },
  'svg_dead': { name: 'Premium Dead', size: { w: 1, h: 1 }, layers: { 1: [[208]] } },
  'refugee_tent': {
    name: 'Refugee Tent',
    size: { w: 3, h: 2 },
    layers: {
      1: [[250, 250, 250], [250, 225, 250]]
    }
  },
  'traveler_wagon': {
    name: 'Traveler Wagon',
    size: { w: 3, h: 1 },
    layers: {
      1: [[250, 224, 250]]
    }
  },
  'royal_fountain': {
    name: 'Royal Fountain',
    size: { w: 2, h: 2 },
    layers: {
      1: [[250, 250], [220, 250]]
    }
  },
  'royal_tower': {
    name: 'Royal Tower',
    size: { w: 3, h: 3 },
    layers: {
      1: [[0, 0, 0], [0, 0, 0], [250, 240, 250]]
    }
  },
  'royal_castle': {
    name: 'High King\'s Citadel',
    size: { w: 5, h: 4 },
    layers: {
      1: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [250, 250, 241, 250, 250]
      ]
    }
  },
  'noble_estate': {
    name: 'Noble Estate',
    size: { w: 4, h: 4 },
    layers: {
      1: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [250, 250, 242, 250]
      ]
    }
  },
  'ruined_tower': {
    name: 'Ruined Watchtower',
    size: { w: 3, h: 3 },
    layers: {
      1: [[0, 0, 0], [0, 0, 0], [250, 243, 250]]
    }
  },
  'fallen_citadel': {
    name: 'Fallen Citadel',
    size: { w: 5, h: 4 },
    layers: {
      1: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [250, 250, 244, 250, 250]
      ]
    }
  },
  'shattered_throne': {
    name: 'Royal Throne Room',
    size: { w: 3, h: 3 },
    layers: {
      1: [[0, 0, 0], [0, 0, 0], [250, 245, 250]]
    }
  },
  'knight_memorial': {
    name: 'Knight\'s Memorial',
    size: { w: 1, h: 1 },
    layers: {
      1: [[246]]
    }
  },
  'cursed_well_stamp': {
    name: 'Cursed Village Well',
    size: { w: 3, h: 2 },
    layers: {
      1: [[0, 0, 0], [250, 247, 250]]
    }
  },
  'grand_imperial_castle': {
    name: 'Grand Imperial Castle',
    size: { w: 10, h: 5 },
    layers: {
      1: [[0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0], [250,250,250,250,250,250,250,250,250,250], [250,250,250,250,249,250,250,250,250,250]]
    }
  },
  'noble_grand_villa': {
    name: 'Noble Grand Villa',
    size: { w: 5, h: 3 },
    layers: {
      1: [[0,0,0,0,0], [250,250,250,250,250], [250,250,253,250,250]]
    }
  },
  'fishman_colony_hut': {
    name: 'Fishman Colony Hut',
    size: { w: 5, h: 3 },
    layers: {
      1: [[0,0,0,0,0], [250,250,250,250,250], [250,250,252,250,250]]
    }
  },
  'imperial_command_center': {
    name: 'Imperial Command Center',
    size: { w: 3, h: 2 },
    layers: {
      1: [[250,250,250], [250,254,250]]
    }
  },
  'village_windmill_poi': {
    name: 'Village Windmill',
    size: { w: 3, h: 3 },
    layers: {
      1: [[0,0,0], [0,0,0], [250, 332, 250]]
    }
  }
};