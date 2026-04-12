/**
 * tile-defs.js — Tile palette definitions.
 *
 * ── CORE TERRAIN ────────────────────────────────────────────────
 *   0  void            1  grass           2  path/dirt
 *   3  deep-water      4  bridge          5  forest
 *   6  mountain        7  cave-floor      8  cave-wall
 *   9  dungeon        10  sand           11  flower
 *  12  town-floor     13  lava-floor     14  scorched-earth
 *  15  cracked-stone  16  ember-pit      17  obsidian-wall
 *
 * ── WATER / WETLANDS ────────────────────────────────────────────
 *  18  shallow-water  19  swamp          20  ice             21  shore
 *  22  waterfall      23  reef           24  river-bank
 *
 * ── NATURAL TERRAIN ─────────────────────────────────────────────
 *  25  mud            26  gravel         27  snow            28  tundra
 *  29  marsh          30  cliff          31  plateau         32  ravine
 *  33  ash-field      34  tar-pit        35  quicksand
 *
 * ── VEGETATION ──────────────────────────────────────────────────
 *  36  dense-jungle   37  shrub          38  dead-tree       39  mushroom-patch
 *  40  tall-grass     41  crop-field     42  orchard         43  hedge
 *  44  sacred-grove   45  thorn-bush
 *
 * ── ARCTIC / ALPINE ─────────────────────────────────────────────
 *  46  frozen-lake    47  glacier        48  ice-cave        49  snowdrift
 *  50  frozen-path    51  alpine-rock
 *
 * ── UNDERGROUND / DUNGEON ───────────────────────────────────────
 *  52  dungeon-wall   53  catacomb-floor 54  catacomb-wall   55  sewer-floor
 *  56  sewer-water    57  mine-floor     58  mine-wall       59  crystal-cave
 *  60  trap-floor
 *
 * ── TOWN / CIVILISATION ─────────────────────────────────────────
 *  61  stone-road     62  brick-floor    63  wood-floor      64  tile-floor
 *  65  carpet         66  marble-floor   67  wood-wall       68  stone-wall
 *  69  wood-door      70  iron-door      71  window          72  rooftop
 *  73  courtyard      74  well           75  market-stall    76  fountain
 *
 * ── INTERIOR ────────────────────────────────────────────────────
 *  77  inn-floor      78  library-floor  79  church-floor    80  throne-room
 *  81  prison-floor   82  armory-floor   83  kitchen-floor   84  crypt-floor
 *
 * ── SPECIAL / MAGICAL ───────────────────────────────────────────
 *  85  warp-tile      86  magic-circle   87  rune-floor      88  altar
 *  89  portal         90  cursed-ground  91  holy-ground     92  mirage
 *  93  void-rift      94  astral-plane
 *
 * ── HAZARD / DAMAGE ─────────────────────────────────────────────
 *  95  spike-pit      96  poison-gas     97  acid-pool       98  electric-floor
 *  99  web-floor     100  wind-current
 *
 * ── COASTAL / BEACH ─────────────────────────────────────────────
 * 101  wet-sand      102  coral          103  rock-pool       104  docks
 * 105  sea-floor
 *
 * ── SKY / AERIAL ────────────────────────────────────────────────
 * 106  cloud          107  storm-cloud    108  sky-floor       109  wind-platform
 *
 * ── RUINS / ANCIENT ─────────────────────────────────────────────
 * 110  ruin-floor    111  ruin-wall      112  mossy-stone     113  overgrown-path
 * 114  broken-floor
 *
 * ── INDUSTRIAL / STEAMPUNK ──────────────────────────────────────
 * 115  metal-floor   116  grate-floor    117  pipe            118  machine-floor
 * 119  oil-slick     120  conveyor
 */

const TILE_DEFS = {

  // ── CORE TERRAIN ──────────────────────────────────────────────
  0:  { name: 'void',           walkable: false, color: '#0d0a18', hi: '#1a1428', shadow: '#000000' },
  1:  { name: 'grass',          walkable: true,  color: '#2d5a1e', hi: '#3d7028', shadow: '#1d4012' },
  2:  { name: 'path',           walkable: true,  color: '#8a7050', hi: '#9d8060', shadow: '#6a5438' },
  3:  { name: 'water',          walkable: false, color: '#1a4580', hi: '#2a5898', shadow: '#0f2d50', anim: true },
  4:  { name: 'bridge',         walkable: true,  color: '#8d6d48', hi: '#a07d58', shadow: '#6a5030' },
  5:  { name: 'forest',         walkable: false, color: '#1a3d15', hi: '#285020', shadow: '#0f2810' },
  6:  { name: 'mountain',       walkable: false, color: '#5d5773', hi: '#706a88', shadow: '#403d50' },
  7:  { name: 'cave-floor',     walkable: true,  color: '#3a2850', hi: '#4d3865', shadow: '#251838' },
  8:  { name: 'cave-wall',      walkable: false, color: '#241a35', hi: '#322848', shadow: '#15101e' },
  9:  { name: 'dungeon',        walkable: true,  color: '#2d2240', hi: '#3d3050', shadow: '#1a1528' },
  10: { name: 'sand',           walkable: true,  color: '#a58860', hi: '#b89870', shadow: '#806845' },
  11: { name: 'flower',         walkable: true,  color: '#2d5a1e', hi: '#3d7028', shadow: '#1d4012', detail: 'flower' },
  12: { name: 'town-floor',     walkable: true,  color: '#654830', hi: '#755838', shadow: '#4a3520', detail: 'cobble' },
  13: { name: 'lava-floor',     walkable: true,  color: '#c54520', hi: '#e55828', shadow: '#8d3018', anim: true },
  14: { name: 'scorched-earth', walkable: true,  color: '#4d3020', hi: '#603d28', shadow: '#301d10' },
  15: { name: 'cracked-stone',  walkable: true,  color: '#6a5d70', hi: '#7d7085', shadow: '#4d4558', detail: 'crack' },
  16: { name: 'ember-pit',      walkable: false, color: '#a53815', hi: '#c54a20', shadow: '#6a2008', anim: true },
  17: { name: 'obsidian-wall',  walkable: false, color: '#1a1628', hi: '#2a2438', shadow: '#0d0a12' },

  // ── WATER / WETLANDS ──────────────────────────────────────────
  18: { name: 'shallow-water',  walkable: true,  color: '#2a6db5', hi: '#3a80cc', shadow: '#1a4d85', anim: true, slow: true },
  19: { name: 'swamp',          walkable: true,  color: '#2d4a1a', hi: '#3d5d28', shadow: '#1a3010', slow: true, detail: 'swamp' },
  20: { name: 'ice',            walkable: true,  color: '#a8d8e8', hi: '#c0e8f8', shadow: '#7ab0c8', slippery: true },
  21: { name: 'shore',          walkable: true,  color: '#b8a070', hi: '#cbb080', shadow: '#908050', detail: 'shore' },
  22: { name: 'waterfall',      walkable: false, color: '#3870b0', hi: '#4888cc', shadow: '#204870', anim: true },
  23: { name: 'reef',           walkable: false, color: '#1d6870', hi: '#2d8088', shadow: '#104548', detail: 'reef' },
  24: { name: 'river-bank',     walkable: true,  color: '#7a6040', hi: '#8d7050', shadow: '#5a4428' },

  // ── NATURAL TERRAIN ───────────────────────────────────────────
  25: { name: 'mud',            walkable: true,  color: '#5a4030', hi: '#6a5038', shadow: '#3d2a18', slow: true, detail: 'mud' },
  26: { name: 'gravel',         walkable: true,  color: '#7a7068', hi: '#8d8070', shadow: '#5a5248', detail: 'gravel' },
  27: { name: 'snow',           walkable: true,  color: '#d8e8f0', hi: '#eef6fc', shadow: '#a8c0cc', slow: true },
  28: { name: 'tundra',         walkable: true,  color: '#8090a0', hi: '#90a0b0', shadow: '#607080' },
  29: { name: 'marsh',          walkable: true,  color: '#3d5830', hi: '#4d6840', shadow: '#283d20', slow: true },
  30: { name: 'cliff',          walkable: false, color: '#6d6568', hi: '#807880', shadow: '#504850' },
  31: { name: 'plateau',        walkable: true,  color: '#7d7060', hi: '#908070', shadow: '#5d5040' },
  32: { name: 'ravine',         walkable: false, color: '#302830', hi: '#403848', shadow: '#1e181e' },
  33: { name: 'ash-field',      walkable: true,  color: '#706870', hi: '#808088', shadow: '#504850' },
  34: { name: 'tar-pit',        walkable: false, color: '#1a1820', hi: '#282530', shadow: '#0d0b10', anim: true },
  35: { name: 'quicksand',      walkable: true,  color: '#a09060', hi: '#b0a070', shadow: '#706840', slow: true, hazard: 'sink' },

  // ── VEGETATION ────────────────────────────────────────────────
  36: { name: 'dense-jungle',   walkable: false, color: '#154520', hi: '#1e5828', shadow: '#0a2d12' },
  37: { name: 'shrub',          walkable: true,  color: '#3a5828', hi: '#4a6835', shadow: '#283d18', detail: 'shrub' },
  38: { name: 'dead-tree',      walkable: false, color: '#4a3828', hi: '#5a4830', shadow: '#301e15', detail: 'dead-tree' },
  39: { name: 'mushroom-patch', walkable: true,  color: '#4d3850', hi: '#5d4860', shadow: '#302038', detail: 'mushroom' },
  40: { name: 'tall-grass',     walkable: true,  color: '#3d6825', hi: '#4d7830', shadow: '#2a4818', slow: true, detail: 'tall-grass' },
  41: { name: 'crop-field',     walkable: true,  color: '#6a8030', hi: '#7a9040', shadow: '#4a5d18', detail: 'crop' },
  42: { name: 'orchard',        walkable: true,  color: '#2d5020', hi: '#3d6028', shadow: '#1d3815', detail: 'orchard' },
  43: { name: 'hedge',          walkable: false, color: '#1e4515', hi: '#285520', shadow: '#102d08' },
  44: { name: 'sacred-grove',   walkable: true,  color: '#1d5030', hi: '#286040', shadow: '#0f3520', glows: '#40ff8880' },
  45: { name: 'thorn-bush',     walkable: false, color: '#3d4d20', hi: '#4d5d28', shadow: '#283015', hazard: 'damage' },

  // ── ARCTIC / ALPINE ───────────────────────────────────────────
  46: { name: 'frozen-lake',    walkable: true,  color: '#88c0d8', hi: '#a8d8f0', shadow: '#5890a8', slippery: true, anim: true },
  47: { name: 'glacier',        walkable: true,  color: '#b0d0e0', hi: '#d0eef8', shadow: '#80a8b8', slow: true },
  48: { name: 'ice-cave',       walkable: true,  color: '#5888a0', hi: '#70a0b8', shadow: '#386070' },
  49: { name: 'snowdrift',      walkable: true,  color: '#e0eef8', hi: '#f4faff', shadow: '#b0c8d8', slow: true },
  50: { name: 'frozen-path',    walkable: true,  color: '#98b8c8', hi: '#b0d0e0', shadow: '#688898', slippery: true },
  51: { name: 'alpine-rock',    walkable: false, color: '#787080', hi: '#888090', shadow: '#585060' },

  // ── UNDERGROUND / DUNGEON ─────────────────────────────────────
  52: { name: 'dungeon-wall',   walkable: false, color: '#282030', hi: '#352840', shadow: '#181018' },
  53: { name: 'catacomb-floor', walkable: true,  color: '#302838', hi: '#403048', shadow: '#1e1820' },
  54: { name: 'catacomb-wall',  walkable: false, color: '#1e1828', hi: '#2a2035', shadow: '#100e15' },
  55: { name: 'sewer-floor',    walkable: true,  color: '#384838', hi: '#485848', shadow: '#202820' },
  56: { name: 'sewer-water',    walkable: false, color: '#284828', hi: '#386038', shadow: '#182818', anim: true, hazard: 'poison' },
  57: { name: 'mine-floor',     walkable: true,  color: '#4a4038', hi: '#5a5048', shadow: '#302820' },
  58: { name: 'mine-wall',      walkable: false, color: '#302820', hi: '#40352a', shadow: '#1e1810' },
  59: { name: 'crystal-cave',   walkable: true,  color: '#302858', hi: '#403870', shadow: '#1e1838', glows: '#8860ff60', detail: 'crystal' },
  60: { name: 'trap-floor',     walkable: true,  color: '#3d2d3d', hi: '#4d3d4d', shadow: '#251828', hazard: 'trap', detail: 'trap' },

  // ── TOWN / CIVILISATION ───────────────────────────────────────
  61: { name: 'stone-road',     walkable: true,  color: '#787068', hi: '#888078', shadow: '#585048', detail: 'road' },
  62: { name: 'brick-floor',    walkable: true,  color: '#804840', hi: '#905848', shadow: '#5d3028', detail: 'brick' },
  63: { name: 'wood-floor',     walkable: true,  color: '#805038', hi: '#906040', shadow: '#5d3820', detail: 'wood-plank' },
  64: { name: 'tile-floor',     walkable: true,  color: '#a09088', hi: '#b0a098', shadow: '#706860', detail: 'tile' },
  65: { name: 'carpet',         walkable: true,  color: '#7d2828', hi: '#8d3838', shadow: '#5a1818', detail: 'carpet' },
  66: { name: 'marble-floor',   walkable: true,  color: '#c8c0b8', hi: '#ddd8d0', shadow: '#989088', detail: 'marble' },
  67: { name: 'wood-wall',      walkable: false, color: '#603820', hi: '#704828', shadow: '#3e2210' },
  68: { name: 'stone-wall',     walkable: false, color: '#686068', hi: '#787078', shadow: '#484048' },
  69: { name: 'wood-door',      walkable: true,  color: '#7a4828', hi: '#8a5838', shadow: '#502e14', detail: 'door', interactive: true },
  70: { name: 'iron-door',      walkable: true,  color: '#505860', hi: '#606870', shadow: '#303838', detail: 'iron-door', interactive: true },
  71: { name: 'window',         walkable: false, color: '#88b8d8', hi: '#a8d0f0', shadow: '#507088', transparent: true },
  72: { name: 'rooftop',        walkable: true,  color: '#803828', hi: '#904838', shadow: '#5a2418', detail: 'roof-tile' },
  73: { name: 'courtyard',      walkable: true,  color: '#8a8070', hi: '#9a9080', shadow: '#605848', detail: 'cobble' },
  74: { name: 'well',           walkable: false, color: '#686860', hi: '#787870', shadow: '#484840', detail: 'well', interactive: true },
  75: { name: 'market-stall',   walkable: false, color: '#904830', hi: '#a05840', shadow: '#681e14', detail: 'stall' },
  76: { name: 'fountain',       walkable: false, color: '#5888b0', hi: '#68a0c8', shadow: '#386078', anim: true, detail: 'fountain', interactive: true },

  // ── INTERIOR ──────────────────────────────────────────────────
  77: { name: 'inn-floor',      walkable: true,  color: '#7a5838', hi: '#8a6848', shadow: '#523a20', detail: 'wood-plank' },
  78: { name: 'library-floor',  walkable: true,  color: '#5d4030', hi: '#6d5038', shadow: '#3e2818', detail: 'dark-wood' },
  79: { name: 'church-floor',   walkable: true,  color: '#9890a0', hi: '#a8a0b0', shadow: '#686070', detail: 'marble' },
  80: { name: 'throne-room',    walkable: true,  color: '#b0900a', hi: '#c8a818', shadow: '#806600', detail: 'gold-tile' },
  81: { name: 'prison-floor',   walkable: true,  color: '#404840', hi: '#505850', shadow: '#282e28' },
  82: { name: 'armory-floor',   walkable: true,  color: '#505850', hi: '#606860', shadow: '#303530' },
  83: { name: 'kitchen-floor',  walkable: true,  color: '#908878', hi: '#a09888', shadow: '#686058' },
  84: { name: 'crypt-floor',    walkable: true,  color: '#282038', hi: '#302848', shadow: '#180f20' },

  // ── SPECIAL / MAGICAL ─────────────────────────────────────────
  85: { name: 'warp-tile',      walkable: true,  color: '#204080', hi: '#2858a8', shadow: '#102050', anim: true, glows: '#4080ff80', interactive: true },
  86: { name: 'magic-circle',   walkable: true,  color: '#302068', hi: '#402888', shadow: '#1c1040', anim: true, glows: '#8040ff80', detail: 'magic-circle' },
  87: { name: 'rune-floor',     walkable: true,  color: '#282248', hi: '#383060', shadow: '#181530', glows: '#6050c040', detail: 'rune' },
  88: { name: 'altar',          walkable: false, color: '#484060', hi: '#585070', shadow: '#2d2840', detail: 'altar', interactive: true },
  89: { name: 'portal',         walkable: true,  color: '#180d30', hi: '#281845', shadow: '#0a0618', anim: true, glows: '#a020ff90', interactive: true },
  90: { name: 'cursed-ground',  walkable: true,  color: '#280d0d', hi: '#381818', shadow: '#180808', glows: '#ff000030', hazard: 'curse' },
  91: { name: 'holy-ground',    walkable: true,  color: '#e8e0c0', hi: '#f0ecd0', shadow: '#c0b888', glows: '#ffff8840' },
  92: { name: 'mirage',         walkable: false, color: '#90c0d8', hi: '#b0d8f0', shadow: '#607080', anim: true },
  93: { name: 'void-rift',      walkable: false, color: '#080510', hi: '#100a1c', shadow: '#000000', anim: true, glows: '#6000ff90', hazard: 'instant-death' },
  94: { name: 'astral-plane',   walkable: true,  color: '#1a0840', hi: '#280c58', shadow: '#0c0420', anim: true, glows: '#a0c0ff50' },

  // ── HAZARD / DAMAGE ───────────────────────────────────────────
  95: { name: 'spike-pit',      walkable: false, color: '#302828', hi: '#403838', shadow: '#1c1818', hazard: 'damage', detail: 'spikes' },
  96: { name: 'poison-gas',     walkable: true,  color: '#304830', hi: '#406040', shadow: '#1c2e1c', anim: true, glows: '#00ff0030', hazard: 'poison' },
  97: { name: 'acid-pool',      walkable: false, color: '#386830', hi: '#488840', shadow: '#204820', anim: true, hazard: 'damage' },
  98: { name: 'electric-floor', walkable: true,  color: '#304858', hi: '#406070', shadow: '#1c2d38', anim: true, glows: '#80c0ff70', hazard: 'electric' },
  99: { name: 'web-floor',      walkable: true,  color: '#686070', hi: '#787080', shadow: '#484050', slow: true, detail: 'web' },
  100:{ name: 'wind-current',   walkable: true,  color: '#b0d0e8', hi: '#c8e8f8', shadow: '#88a8c0', anim: true, effect: 'push' },

  // ── COASTAL / BEACH ───────────────────────────────────────────
  101:{ name: 'wet-sand',       walkable: true,  color: '#9a8858', hi: '#aa9868', shadow: '#706040', slow: true },
  102:{ name: 'coral',          walkable: false, color: '#c06840', hi: '#d07850', shadow: '#905030', detail: 'coral' },
  103:{ name: 'rock-pool',      walkable: true,  color: '#2d6868', hi: '#3d7878', shadow: '#1c4848', anim: true },
  104:{ name: 'docks',          walkable: true,  color: '#705038', hi: '#806040', shadow: '#4e3820', detail: 'wood-plank' },
  105:{ name: 'sea-floor',      walkable: false, color: '#1a3d58', hi: '#2a4d68', shadow: '#0f2538' },

  // ── SKY / AERIAL ──────────────────────────────────────────────
  106:{ name: 'cloud',          walkable: true,  color: '#d8e8f8', hi: '#eef6ff', shadow: '#a8c0d8', slow: true, anim: true },
  107:{ name: 'storm-cloud',    walkable: true,  color: '#505868', hi: '#606878', shadow: '#303848', anim: true, hazard: 'lightning' },
  108:{ name: 'sky-floor',      walkable: true,  color: '#5898d8', hi: '#70b0e8', shadow: '#3870a8', anim: true },
  109:{ name: 'wind-platform',  walkable: true,  color: '#88a8c8', hi: '#98b8d8', shadow: '#608098', effect: 'boost' },

  // ── RUINS / ANCIENT ───────────────────────────────────────────
  110:{ name: 'ruin-floor',     walkable: true,  color: '#686070', hi: '#787080', shadow: '#484050', detail: 'rubble' },
  111:{ name: 'ruin-wall',      walkable: false, color: '#585060', hi: '#686070', shadow: '#383040' },
  112:{ name: 'mossy-stone',    walkable: true,  color: '#4a5848', hi: '#5a6858', shadow: '#303830', detail: 'moss' },
  113:{ name: 'overgrown-path', walkable: true,  color: '#4a5d30', hi: '#5a6d40', shadow: '#303d18', slow: true },
  114:{ name: 'broken-floor',   walkable: true,  color: '#5a5260', hi: '#6a6270', shadow: '#3a3240', detail: 'crack', hazard: 'damage' },

  // ── INDUSTRIAL / STEAMPUNK ────────────────────────────────────
  115:{ name: 'metal-floor',    walkable: true,  color: '#505860', hi: '#606870', shadow: '#303840', detail: 'metal-plate' },
  116:{ name: 'grate-floor',    walkable: true,  color: '#484850', hi: '#585860', shadow: '#282830', transparent: true, detail: 'grate' },
  117:{ name: 'pipe',           walkable: false, color: '#686878', hi: '#787888', shadow: '#484858', detail: 'pipe' },
  118:{ name: 'machine-floor',  walkable: true,  color: '#383d45', hi: '#484d55', shadow: '#202428', anim: true, detail: 'machinery' },
  119:{ name: 'oil-slick',      walkable: true,  color: '#181c24', hi: '#20263a', shadow: '#0d1018', slippery: true, anim: true },
  120:{ name: 'conveyor',       walkable: true,  color: '#4a5058', hi: '#5a6068', shadow: '#2d3038', anim: true, effect: 'convey' },
};