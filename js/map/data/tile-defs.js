/**
 * tile-defs.js — Tile palette definitions.
 */

const TILE_DEFS = {
  // ── CORE TERRAIN ──────────────────────────────────────────────
  0:  { name: 'void',           walkable: false, color: '#0d0a18', hi: '#1a1428', shadow: '#000000' },
  1:  { name: 'grass',          walkable: true,  color: '#2d5a1e', hi: '#3d7028', shadow: '#1d4012', anim: true },
  2:  { name: 'path',           walkable: true,  color: '#8a7050', hi: '#9d8060', shadow: '#6a5438' },
  3:  { name: 'water',          walkable: false, color: '#1a4580', hi: '#2a5898', shadow: '#0f2d50', anim: true },
  4:  { name: 'bridge',         walkable: true,  color: '#8d6d48', hi: '#a07d58', shadow: '#6a5030' },
  5:  { name: 'forest',         walkable: false, color: '#1a3d15', hi: '#285020', shadow: '#0f2810', svgAsset: 'oak' },
  6:  { name: 'mountain',       walkable: false, color: '#5d5773', hi: '#706a88', shadow: '#403d50' },
  7:  { name: 'cave-floor',     walkable: true,  color: '#3a2850', hi: '#4d3865', shadow: '#251838' },
  8:  { name: 'cave-wall',      walkable: false, color: '#241a35', hi: '#322848', shadow: '#15101e' },
  9:  { name: 'dungeon',        walkable: true,  color: '#2d2240', hi: '#3d3050', shadow: '#1a1528' },
  10: { name: 'sand',           walkable: true,  color: '#a58860', hi: '#b89870', shadow: '#806845' },
  11: { name: 'flower',         walkable: true,  color: '#2d5a1e', hi: '#3d7028', shadow: '#1d4012', detail: 'flower', anim: true, svgAsset: 'flower' },
  12: { name: 'town-floor',     walkable: true,  color: '#654830', hi: '#755838', shadow: '#4a3520', detail: 'cobble' },
  13: { name: 'lava-floor',     walkable: true,  color: '#c54520', hi: '#e55828', shadow: '#8d3018', anim: true, slow: true },
  14: { name: 'scorched-earth', walkable: true,  color: '#4d3020', hi: '#603d28', shadow: '#301d10' },
  15: { name: 'cracked-stone',  walkable: true,  color: '#6a5d70', hi: '#7d7085', shadow: '#4d4558', detail: 'crack' },
  16: { name: 'ember-pit',      walkable: false, color: '#a53815', hi: '#c54a20', shadow: '#6a2008', anim: true },
  17: { name: 'obsidian-wall',  walkable: false, color: '#1a1628', hi: '#2a2438', shadow: '#0d0a12' },
  18: { name: 'shallow-water',  walkable: true,  color: '#4e86b0', hi: '#6e96c0', shadow: '#2e5680', anim: true },
  22: { name: 'rapids',         walkable: false, color: '#a0c0ff', hi: '#ffffff', shadow: '#70a0ff', anim: true },

  // ── VEGETATION ────────────────────────────────────────────────
  33: { name: 'ash-field',      walkable: true,  color: '#302820', hi: '#403828', shadow: '#1a1410' },
  36: { name: 'dense-jungle',   walkable: false, color: '#154520', hi: '#1e5828', shadow: '#0a2d12', svgAsset: 'pine' },
  37: { name: 'shrub',          walkable: true,  color: '#3a5828', hi: '#4a6835', shadow: '#283d18', detail: 'shrub', anim: true, svgAsset: 'shrub' },
  38: { name: 'dead-tree',      walkable: false, color: '#4a3828', hi: '#5a4830', shadow: '#301e15', detail: 'dead-tree', svgAsset: 'dead_tree' },
  39: { name: 'mushroom-patch', walkable: true,  color: '#4d3850', hi: '#5d4860', shadow: '#302038', detail: 'mushroom', svgAsset: 'mushroom' },
  40: { name: 'tall-grass',     walkable: true,  color: '#2d5a1e', hi: '#3d7028', shadow: '#1d4012', anim: true, detail: 'tall-grass' },
  
  // ── UNDERGROUND / DUNGEON ─────────────────────────────────────
  59: { name: 'crystal-cave',   walkable: true,  color: '#302858', hi: '#403870', shadow: '#1e1838', glows: '#8860ff60', detail: 'crystal', svgAsset: 'crystal' },
  68: { name: 'stone-wall',     walkable: false, color: '#4a4a4a', hi: '#5a5a5a', shadow: '#2a2a2a' },
  73: { name: 'ruin-floor',     walkable: true,  color: '#5a5a6a', hi: '#6a6a7a', shadow: '#3a3a4a', detail: 'stone' },

  // ── TOWN / CIVILISATION ───────────────────────────────────────
  74: { name: 'well',           walkable: false, color: '#686860', hi: '#787870', shadow: '#484840', detail: 'well', interactive: true, svgAsset: 'well' },
  75: { name: 'market-stall',   walkable: false, color: '#904830', hi: '#a05840', shadow: '#681e14', detail: 'stall', svgAsset: 'market' },
  86: { name: 'portal',         walkable: true,  color: '#6200ea', hi: '#b388ff', shadow: '#311b92', anim: true },
  80: { name: 'throne',         walkable: true,  color: '#fbbf24', hi: '#fef3c7', shadow: '#d97706', detail: 'gold' },
  88: { name: 'altar',          walkable: false, color: '#484060', hi: '#585070', shadow: '#2d2840', detail: 'altar', interactive: true, svgAsset: 'statue' },
  110: { name: 'rubble',         walkable: true,  color: '#4a4a5a', hi: '#5a5a6a', shadow: '#2a2a3a', detail: 'debris' },
  111: { name: 'chest',          walkable: true,  color: '#8d6e63', svgAsset: 'chest' },
  112: { name: 'mossy-stone',    walkable: true,  color: '#2d4a1e', hi: '#3d5a28', shadow: '#1d2a12' }
};

// ── SVG ASSET MAPPING (IDs 200+) ─────────────────────────────
TILE_DEFS[200] = { name: 'SVG Oak',       walkable: false, svgAsset: 'oak',   color: '#2d5a1e' };
TILE_DEFS[201] = { name: 'SVG Pine',      walkable: false, svgAsset: 'pine',  color: '#153010' };
TILE_DEFS[202] = { name: 'SVG Shrub',     walkable: true,  svgAsset: 'shrub', color: '#3d6825' };
TILE_DEFS[203] = { name: 'SVG Boulder',   walkable: false, svgAsset: 'boulder', color: '#666' };
TILE_DEFS[204] = { name: 'SVG Mushroom',  walkable: true,  svgAsset: 'mushroom', color: '#ff5252' };
TILE_DEFS[205] = { name: 'SVG Flower',    walkable: true,  svgAsset: 'flower', color: '#ff4081' };
TILE_DEFS[206] = { name: 'SVG Crystal',   walkable: true,  svgAsset: 'crystal', color: '#6200ea' };
TILE_DEFS[207] = { name: 'SVG Lily',      walkable: true,  svgAsset: 'lily', color: '#2e7d32' };
TILE_DEFS[208] = { name: 'SVG Dead Tree', walkable: false, svgAsset: 'dead_tree', color: '#3e2723' };
TILE_DEFS[209] = { name: 'SVG Well',      walkable: false, svgAsset: 'well', color: '#787068' };
TILE_DEFS[210] = { name: 'SVG Market',    walkable: false, svgAsset: 'market', color: '#8d6e63' };
TILE_DEFS[211] = { name: 'SVG Chest',     walkable: true,  svgAsset: 'chest', color: '#ffd700' };
TILE_DEFS[212] = { name: 'SVG Statue',    walkable: false, svgAsset: 'statue', color: '#78909c' };

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

for(let i=0; i<36; i++) {
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
  'svg_oak':   { name: 'Premium Oak',   size: { w: 1, h: 1 }, layers: { 1: [[200]] } },
  'svg_pine':  { name: 'Premium Pine',  size: { w: 1, h: 1 }, layers: { 1: [[201]] } },
  'svg_shrub': { name: 'Premium Shrub', size: { w: 1, h: 1 }, layers: { 1: [[202]] } },
  'svg_rock':  { name: 'Premium Rock',  size: { w: 1, h: 1 }, layers: { 1: [[203]] } },
  'svg_mush':  { name: 'Premium Mush',  size: { w: 1, h: 1 }, layers: { 1: [[204]] } },
  'svg_flow':  { name: 'Premium Flow',  size: { w: 1, h: 1 }, layers: { 1: [[205]] } },
  'svg_crys':  { name: 'Premium Crys',  size: { w: 1, h: 1 }, layers: { 1: [[206]] } },
  'svg_lily':  { name: 'Premium Lily',  size: { w: 1, h: 1 }, layers: { 0: [[207]] } },
  'svg_dead':  { name: 'Premium Dead',  size: { w: 1, h: 1 }, layers: { 1: [[208]] } }
};