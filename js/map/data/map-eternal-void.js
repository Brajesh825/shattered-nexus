/**
 * map-eternal-void.js
 * SIZE: 100x100
 * DESIGN: Fractal Islands & Light-Bridges
 * FIX: Destructive carving to ensure bridges are wide enough for pathfinding.
 */

MAP_DEFS.eternal_void = (function() {
    const width = 100;
    const height = 100;
    const tiles = [];

    // 1. INITIALIZE: The Total Void (3)
    for (let y = 0; y < height; y++) {
        tiles.push(new Array(width).fill(3));
    }

    const h = {
        set: function(x, y, tile) {
            if (y >= 0 && y < height && x >= 0 && x < width) tiles[y][x] = tile;
        },
        // Carves a circular or diamond-shaped island
        carveIsland: function(cx, cy, radius, tile) {
            for (let iy = cy - radius; iy <= cy + radius; iy++) {
                for (let ix = cx - radius; ix <= cx + radius; ix++) {
                    const dist = Math.sqrt(Math.pow(cx - ix, 2) + Math.pow(cy - iy, 2));
                    if (dist <= radius) this.set(ix, iy, tile);
                }
            }
        },
        // Carves wide bridges (9) to ensure no sticking
        carveBridge: function(x1, y1, x2, y2, thickness) {
            const half = Math.floor(thickness / 2);
            if (x1 === x2) { // Vertical
                for (let iy = Math.min(y1, y2); iy <= Math.max(y1, y2); iy++) {
                    for (let ix = x1 - half; ix <= x1 + half; ix++) this.set(ix, iy, 9);
                }
            } else if (y1 === y2) { // Horizontal
                for (let ix = Math.min(x1, x2); ix <= Math.max(x1, x2); ix++) {
                    for (let iy = y1 - half; iy <= y1 + half; iy++) this.set(ix, iy, 9);
                }
            }
        }
    };

    // 2. THE GEOMETRY
    // Central Hub (The Nexus)
    h.carveIsland(50, 50, 12, 12); 

    // Four Cardinal Islands
    h.carveIsland(50, 15, 8, 12);  // North (Start)
    h.carveIsland(50, 85, 10, 86); // South (The End/Portal)
    h.carveIsland(15, 50, 8, 0);   // West
    h.carveIsland(85, 50, 8, 0);   // East

    // Connecting Bridges (6 tiles wide for smooth enemy movement)
    h.carveBridge(50, 15, 50, 50, 6); // N to Hub
    h.carveBridge(50, 50, 50, 85, 6); // Hub to S
    h.carveBridge(15, 50, 50, 50, 6); // W to Hub
    h.carveBridge(50, 50, 85, 50, 6); // Hub to E

    // 3. NO WALLS: In the Eternal Void, the "Wall" is the bottomless pit (Tile 3).
    // However, to prevent players from walking off-map, we place a boundary.
    for (let i = 0; i < width; i++) {
        h.set(i, 0, 8); h.set(i, height - 1, 8);
        h.set(0, i, 8); h.set(width - 1, i, 8);
    }

    return {
        id: 'eternal_void',
        name: 'Eternal Void',
        arcId: 8,
        width: width,
        height: height,
        playerStart: { x: 50, y: 15 },
        bgColor: '#000000',
        ambientLight: 'rgba(40,10,80,0.12)',
        enemyLevelRange: [26, 30],
        encounterTemplates: [
          { weight: 2, enemies: ['shadow_wraith'] },
          { weight: 2, enemies: ['necromancer'] },
          { weight: 2, enemies: ['shadow_wraith', 'shadow_wraith'] },
          { weight: 2, enemies: ['necromancer', 'shadow_wraith'] },
          { weight: 1, enemies: ['dark_phoenix'] },
          { weight: 1, enemies: ['necromancer', 'shadow_wraith', 'shadow_wraith'] },
          { weight: 1, enemies: ['dark_phoenix', 'necromancer', 'shadow_wraith', 'shadow_wraith'] },
        ],
        tiles: tiles,
        enemies: [
            // NEXUS DEFENDERS (Central)
            { id: 'shadow_wraith', x: 50, y: 50, patrol: 'random',     range: 8,  speed: 1.5 },
            { id: 'necromancer',   x: 45, y: 45, patrol: 'horizontal', range: 5,  speed: 0.9 },
            { id: 'necromancer',   x: 55, y: 55, patrol: 'horizontal', range: 5,  speed: 0.9 },

            // BRIDGE STALKERS
            { id: 'dark_phoenix',  x: 50, y: 32, patrol: 'vertical',   range: 10, speed: 1.4 },
            { id: 'dark_phoenix',  x: 50, y: 68, patrol: 'vertical',   range: 10, speed: 1.4 },
            { id: 'shadow_wraith', x: 32, y: 50, patrol: 'horizontal', range: 10, speed: 1.5 },
            { id: 'shadow_wraith', x: 68, y: 50, patrol: 'horizontal', range: 10, speed: 1.5 },

            // WING GUARDIANS
            { id: 'dark_phoenix',  x: 15, y: 50, patrol: 'random',     range: 6,  speed: 1.3 },
            { id: 'dark_phoenix',  x: 85, y: 50, patrol: 'random',     range: 6,  speed: 1.3 },

            // FINAL GATEKEEPERS (South Island)
            { id: 'shadow_wraith', x: 42, y: 85, patrol: 'random',     range: 4,  speed: 1.6 },
            { id: 'shadow_wraith', x: 58, y: 85, patrol: 'random',     range: 4,  speed: 1.6 },
            { id: 'necromancer',   x: 50, y: 90, patrol: 'horizontal', range: 8,  speed: 1.0 }
        ],

        npcs: [
          { id: 'essabella', x: 50, y: 50, dialogueKey: 'eternal_void' },
        ],

        objective: {
          type: 'reach',
          target: { x: 50, y: 85 },
          label: 'Cross to the Final Shore',
          completeMsg: '✦ The last threshold. Beyond this — only him.',
        },

        fog: { delay: 3, peak: 40, max: 0.96, vision: 1.8 },

        voiceLines: {
          ambient: [
            { char:'Rei',   color:'#4ade80', text:'There is no ground beneath us. Only intent.' },
            { char:'Tao',  color:'#ef4444', text:'The void is looking back. Rude.' },
            { char:'Aya',  color:'#7dd3fc', text:'We are at the end of everything. Move quickly.' },
            { char:'Lulu',  color:'#2dd4bf', text:'I can\'t tell where I end and the dark begins.' },
          ],
          fogRising: [
            { char:'Rei',   color:'#4ade80', text:'The void consumes. Don\'t stop.' },
            { char:'Tao',  color:'#ef4444', text:'Even darkness has an end. This does not.' },
            { char:'Aya',  color:'#7dd3fc', text:'I cannot see. But I know forward.' },
            { char:'Lulu',  color:'#2dd4bf', text:'Something is in the void with us.' },
          ],
          encounter: [
            { char:'Rei',   color:'#4ade80', text:'They exist between the dark — fight!' },
            { char:'Tao',  color:'#ef4444', text:'Born from nothing. Back to nothing.' },
            { char:'Aya',  color:'#7dd3fc', text:'Void creatures — they were invisible!' },
            { char:'Lulu',  color:'#2dd4bf', text:'I couldn\'t see them, I couldn\'t sense them—' },
          ],
        },
    };
})();