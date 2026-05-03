/**
 * gen-southern-isles-map.js — v2
 * Generates the Southern Isles base terrain for a 120x80 map.
 *
 * TILE IDs (Layer 0 — terrain):
 *   1  = grass
 *   3  = deep water
 *   10 = sand
 *   18 = shallow water
 *
 * TILE IDs (Layer 1 — objects):
 *   0   = empty
 *   243 = Ruined Tower (Bell Tower ruin, anchored bottom-left)
 *
 * MAP GEOGRAPHY (y=0 is top/north, y=79 is bottom/south):
 *
 *   y  0-10  : ABYSSAL TRENCH — deep ocean, boss arena, bell tower ruin at center
 *   y 11-16  : OPEN DEEP WATER — rocky fringe, narrow shallows on edges
 *   y 17-25  : LAGOON RING — shallow water belt with sand atoll chains
 *   y 26-35  : INNER LAGOON — mixed sand/grass platforms, stilt village zone
 *   y 36-62  : MAIN ISLAND — large, wide landmass (27 rows) grass + sand interior
 *   y 63-70  : SOUTHERN BEACH — sand peninsula, player arrival
 *   y 71-79  : OPEN SOUTH OCEAN — deep water approach from sea
 */

const fs = require('fs');

const W = 120;
const H = 80;

// Tile IDs
const G   = 1;    // grass
const DW  = 3;    // deep water
const S   = 10;   // sand
const SW  = 18;   // shallow water
const BT  = 243;  // Ruined Tower (Bell Tower)

// Build an empty W-wide row
function emptyRow(tile = 0) { return Array(W).fill(tile); }

// Deep-clone a row and apply patches [{x, tile}] or [{start, end, tile}]
function patch(base, patches) {
  const r = [...base];
  for (const p of patches) {
    if (p.x !== undefined) {
      r[p.x] = p.tile;
    } else {
      for (let x = p.start; x <= p.end; x++) r[x] = p.tile;
    }
  }
  return r;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build terrain layer
// ─────────────────────────────────────────────────────────────────────────────
const layer0 = [];

for (let y = 0; y < H; y++) {

  // ── ZONE 1: Abyssal Trench  (y 0-10)
  if (y <= 10) {
    const t = y; // 0-10
    if (t <= 4) {
      // Pure deep trench, no edges
      layer0.push(emptyRow(DW));
    } else {
      // Very thin shallow fringe widens slightly as we go south
      const fringe = t - 4;          // 1-6
      layer0.push(patch(emptyRow(DW), [
        { start: 0, end: fringe - 1, tile: SW },
        { start: W - fringe, end: W - 1, tile: SW },
      ]));
    }
    continue;
  }

  // ── ZONE 2: Open Deep Water fringe  (y 11-16)
  if (y <= 16) {
    const t = y - 11; // 0-5
    const fringe = 5 + t;
    layer0.push(patch(emptyRow(DW), [
      { start: 0, end: fringe, tile: SW },
      { start: W - fringe - 1, end: W - 1, tile: SW },
    ]));
    continue;
  }

  // ── ZONE 3: Lagoon Ring  (y 17-25)
  if (y <= 25) {
    const t = y - 17; // 0-8
    const r = [];
    // Outer shallow belt grows inward
    const outerShallow = 10 + t;
    // Deep channel narrows as we go south
    const deepStart = outerShallow + 10;
    const deepEnd   = W - deepStart - 1;

    for (let x = 0; x < W; x++) {
      if (x < outerShallow || x > W - outerShallow - 1) {
        r.push(SW);
      } else if (deepStart < deepEnd && x >= deepStart && x <= deepEnd) {
        r.push(DW);
      } else {
        r.push(SW);
      }
    }

    // Sand atoll islands — two groups, east and west of the deep channel
    const sandPatches = [
      { start: outerShallow + 2, end: outerShallow + 8 + t, tile: S },      // west atoll
      { start: outerShallow + 12 + t, end: outerShallow + 18 + t, tile: S },// west inner
      { start: W - outerShallow - 9 - t, end: W - outerShallow - 3, tile: S }, // east atoll
      { start: W - outerShallow - 19 - t, end: W - outerShallow - 13 - t, tile: S }, // east inner
    ];
    layer0.push(patch(r, sandPatches));
    continue;
  }

  // ── ZONE 4: Inner Lagoon / Stilt Zone  (y 26-35)
  if (y <= 35) {
    const t = y - 26; // 0-9
    const r = [];
    // Island is starting to form — large central shallow/sand area
    const islandL = 18 - t;
    const islandR = W - 18 + t;

    for (let x = 0; x < W; x++) {
      if (x < islandL - 4 || x > islandR + 4) {
        r.push(DW);  // outer deep water
      } else if (x < islandL || x > islandR) {
        r.push(SW);  // shallow approach
      } else {
        r.push(SW);  // inner lagoon still shallow
      }
    }
    // Grass + sand platforms across the center (stilt village platforms)
    const cL = islandL + 3;
    const cR = islandR - 3;
    const platforms = [
      { start: cL, end: cL + 12 + t, tile: S },
      { start: cL + 14 + t, end: cL + 24 + t, tile: G },
      { start: cL + 26 + t, end: cR - 26 - t, tile: G },
      { start: cR - 24 - t, end: cR - 14 - t, tile: G },
      { start: cR - 12 - t, end: cR, tile: S },
    ].filter(p => p.start <= p.end && p.start >= 0 && p.end < W);

    layer0.push(patch(r, platforms));
    continue;
  }

  // ── ZONE 5: MAIN ISLAND  (y 36-62) — big, wide, walkable landmass
  if (y <= 62) {
    const t = y - 36; // 0-26
    const r = [];

    // The island expands wide in the middle then contracts at south end
    // Peak width around y 47-50
    const midPoint   = 13; // t=13 → y=49
    const expansion  = Math.min(t, midPoint, 26 - t); // 0..13..0
    const islandL    = 12 - Math.floor(expansion * 0.5);
    const islandR    = W - 12 + Math.floor(expansion * 0.5);

    for (let x = 0; x < W; x++) {
      if (x < islandL - 5 || x > islandR + 5) {
        r.push(DW);  // open ocean flanks
      } else if (x < islandL - 1 || x > islandR + 1) {
        r.push(SW);  // shallow surf
      } else if (x < islandL + 3 || x > islandR - 3) {
        r.push(S);   // sandy shore
      } else if (x < islandL + 8 || x > islandR - 8) {
        r.push(S);   // beach buffer
      } else {
        r.push(G);   // grass interior
      }
    }
    layer0.push(r);
    continue;
  }

  // ── ZONE 6: Southern Beach / Player Arrival  (y 63-70)
  if (y <= 70) {
    const t = y - 63; // 0-7
    const r = [];
    // Peninsula narrows going south
    const beachL = 32 + t * 3;
    const beachR = W - beachL;

    for (let x = 0; x < W; x++) {
      if (x < beachL - 8 || x > beachR + 8) {
        r.push(DW);
      } else if (x < beachL - 3 || x > beachR + 3) {
        r.push(SW);
      } else if (x < beachL + 2 || x > beachR - 2) {
        r.push(S);
      } else {
        r.push(t < 4 ? G : S);
      }
    }
    layer0.push(r);
    continue;
  }

  // ── ZONE 7: Open South Ocean  (y 71-79)
  {
    const t = y - 71; // 0-8
    const r = [];
    const trailW = Math.max(0, 10 - t * 2);
    const tL = Math.floor((W - trailW) / 2);
    const tR = tL + trailW;

    for (let x = 0; x < W; x++) {
      if (trailW > 0 && x >= tL && x < tR) {
        r.push(t <= 2 ? S : SW);  // fading sand trail
      } else if (trailW > 0 && (x >= tL - 4 && x < tL || x >= tR && x < tR + 4)) {
        r.push(SW);  // surf
      } else {
        r.push(DW);
      }
    }
    layer0.push(r);
    continue;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Build object layer (layer 1)
// Bell Tower ruin — placed at the top of the submerged ruins (y=8, x=57)
// The tower SVG is anchored bottom-left and is 3 tiles wide (XXX footprint)
// ─────────────────────────────────────────────────────────────────────────────
const layer1 = Array.from({ length: H }, () => emptyRow(0));
// Place the Bell Tower ruin at the edge of the deep trench
// It sits ON sand/shallow at y=13 (just south of the deepest trench)
// The visual extends upward over the trench — creepy sunken ruin effect
layer1[14][57] = BT;  // Ruined Tower tile (3-wide, anchored bottom-left)

const layer2 = Array.from({ length: H }, () => emptyRow(0));

// ─────────────────────────────────────────────────────────────────────────────
// Write output
// ─────────────────────────────────────────────────────────────────────────────
const output = [layer0, layer1, layer2];
const outPath = 'js/map/data/map-southern-isles.json';
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`[GEN] Southern Isles map written: ${W}x${H}`);
console.log(`[GEN] Bell Tower ruin placed at layer1[14][57]`);
console.log(`[GEN] Update map-southern-isles.js:`);
console.log(`        width: ${W}, height: ${H}`);
console.log(`        playerStart: { x: 60, y: 65 }    // southern beach`);
console.log(`        boss (sunken_leviathan): { x: 60, y: 4 }  // deep trench`);
console.log(`        Bell Tower visual anchor: x=57, y=14`);
