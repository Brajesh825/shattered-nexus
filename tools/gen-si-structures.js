/**
 * gen-si-structures.js
 * Adds Layer 1 structures and a Layer 0 jungle treeline boundary
 * to the existing map-southern-isles.json
 *
 * Run from rpg+ root:  node tools/gen-si-structures.js
 */

const fs = require('fs');

const mapPath = 'js/map/data/map-southern-isles.json';
const raw = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const W = 120, H = 80;
let [layer0, layer1, layer2] = raw;

// ── TILE IDs ──────────────────────────────────────────────────────────────
const G      = 1;    // grass
const JUNGLE = 36;   // dense-jungle (walkable:false) — treeline boundary
const HUT    = 252;  // Giant Fishman Hut      — community hall
const TENT   = 225;  // Tent                   — shelters
const ESTATE = 242;  // Noble Estate           — ruined port master's house
const STALL  = 75;   // Market Stall           — haunted empty stall
const TOWER  = 243;  // Ruined Tower           — lookout watchtower
// Bell Tower (BT=243) is already placed at layer1[14][57]

// ─────────────────────────────────────────────────────────────────────────
// LAYER 1 — Structures
// Each is placed at [row][col] = tile.
// The SVG anchor is bottom-left, so the visual extends upward and rightward.
// ─────────────────────────────────────────────────────────────────────────

function place(layer, y, x, tile) {
  if (y < 0 || y >= H || x < 0 || x >= W) return;
  layer[y][x] = tile;
}

// ── Community Hall (Giant Fishman Hut) — Elder at (55,45)
// Placed at (53,42) so Elder stands just in front of the door
place(layer1, 42, 53, HUT);

// ── Family Shelters (Tents) flanking the hall — Healer at (62,46)
place(layer1, 46, 46, TENT);   // west shelter
place(layer1, 46, 65, TENT);   // east shelter

// ── Old Port Master's Ruined Estate — west of center
// Deliberately left slightly decayed (use Noble Estate tile)
place(layer1, 40, 36, ESTATE);

// ── Abandoned Market Stall — Market Ghost at (60,52)
place(layer1, 51, 58, STALL);

// ── Lookout's Watchtower — Lookout NPC at (85,40)
place(layer1, 38, 83, TOWER);

// ── Child's Family Tent — near dock ruins (50,58)
place(layer1, 56, 48, TENT);

// ── Fisherman's Rough Shelter — west beach (22,48)
place(layer1, 47, 20, TENT);

// ─────────────────────────────────────────────────────────────────────────
// LAYER 0 — Dense-Jungle Treeline Boundary
//
// We paint a ring of tile 36 (dense-jungle, walkable:false) on the
// inner edge of the grass zone to create a natural village perimeter.
//
// Two gaps are left open:
//   NORTH GAP: x=50-70  (dock path → lagoon → boss)
//   SOUTH GAP: x=48-72  (player entry from beach)
//
// Only paints over existing grass (tile 1) to avoid touching water/sand.
// ─────────────────────────────────────────────────────────────────────────

const NORTH_GAP = [50, 70];  // x range kept clear (dock path north)
const SOUTH_GAP = [48, 72];  // x range kept clear (player entry south)

function inNorthGap(x) { return x >= NORTH_GAP[0] && x <= NORTH_GAP[1]; }
function inSouthGap(x) { return x >= SOUTH_GAP[0] && x <= SOUTH_GAP[1]; }

function paintJungle(y, x) {
  if (y < 0 || y >= H || x < 0 || x >= W) return;
  if (layer0[y][x] === G) layer0[y][x] = JUNGLE;  // only replace grass
}

// Compute approximate island boundaries for each row (mirrors gen script logic)
function islandBounds(y) {
  if (y < 36 || y > 62) return null;
  const t = y - 36;
  const expansion = Math.min(t, 13, 26 - t);
  const islandL = 12 - Math.floor(expansion * 0.5);
  const islandR = 108 + Math.floor(expansion * 0.5);
  // Grass starts ~8 tiles inside from the outer island edge
  const grassL = islandL + 8;
  const grassR = islandR - 8;
  return { grassL, grassR };
}

// ── VERTICAL treelines (left and right sides) ──────────────────────────
for (let y = 38; y <= 60; y++) {
  const b = islandBounds(y);
  if (!b) continue;

  // Left treeline: 3 tiles wide just inside the grass edge
  for (let x = b.grassL; x <= b.grassL + 3; x++) {
    if (!inNorthGap(x) && !inSouthGap(x)) paintJungle(y, x);
  }

  // Right treeline: 3 tiles wide just inside the grass edge
  for (let x = b.grassR - 3; x <= b.grassR; x++) {
    if (!inNorthGap(x) && !inSouthGap(x)) paintJungle(y, x);
  }
}

// ── TOP horizontal treeline (y=38-41) — north island edge with dock gap ─
for (let y = 38; y <= 41; y++) {
  const b = islandBounds(y);
  if (!b) continue;
  for (let x = b.grassL; x <= b.grassR; x++) {
    if (!inNorthGap(x)) paintJungle(y, x);
  }
}

// ── BOTTOM horizontal treeline (y=58-61) — south edge with entry gap ───
for (let y = 58; y <= 61; y++) {
  const b = islandBounds(y);
  if (!b) continue;
  for (let x = b.grassL; x <= b.grassR; x++) {
    if (!inSouthGap(x)) paintJungle(y, x);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Write output
// ─────────────────────────────────────────────────────────────────────────
fs.writeFileSync(mapPath, JSON.stringify([layer0, layer1, layer2], null, 2), 'utf8');

console.log('[GEN] Structures placed on Layer 1:');
console.log('       (53,42) Giant Fishman Hut — Community Hall');
console.log('       (46,46) Tent — West Family Shelter');
console.log('       (65,46) Tent — East Family Shelter');
console.log('       (36,40) Noble Estate — Ruined Port Master House');
console.log('       (58,51) Market Stall — Haunted Empty Market');
console.log('       (83,38) Ruined Tower — Lookout Watchtower');
console.log('       (48,56) Tent — Child Family Tent');
console.log('       (20,47) Tent — Fisherman Shelter');
console.log('[GEN] Dense-jungle boundary ring written to Layer 0');
console.log('       North gap: x=50-70 (dock path open)');
console.log('       South gap: x=48-72 (player entry open)');
