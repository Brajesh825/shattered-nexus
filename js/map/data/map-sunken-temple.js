/**
 * map-sunken-temple.js
 * * SIZE: 160x160
 * * FIX: "Skeleton-First" logic. Carves all floors, then adds walls only to empty water.
 * * RESULT: 0% chance of diagonal snags.
 */

MAP_DEFS.sunken_temple = (function() {
    const width = 160;
    const height = 160;
    const tiles = [];

    // 1. INITIALIZE: Start with deep water (3)
    for (let y = 0; y < height; y++) {
        tiles.push(new Array(width).fill(3));
    }

    const h = {
        // Simple setter
        set: function(x, y, tile) {
            if (y >= 0 && y < height && x >= 0 && x < width) {
                tiles[y][x] = tile;
            }
        },

        // Carves a massive rectangular floor area
        // We use Math.floor/ceil to ensure it snaps perfectly to the grid
        carveRect: function(x1, y1, x2, y2, floorTile) {
            const xMin = Math.floor(Math.min(x1, x2) - 4);
            const xMax = Math.ceil(Math.max(x1, x2) + 4);
            const yMin = Math.floor(Math.min(y1, y2) - 4);
            const yMax = Math.ceil(Math.max(y1, y2) + 4);

            for (let iy = yMin; iy <= yMax; iy++) {
                for (let ix = xMin; ix <= xMax; ix++) {
                    this.set(ix, iy, floorTile);
                }
            }
        },

        // Carves the floor of a chamber (No walls yet!)
        carveChamberFloor: function(cx, cy, radius, floorTile) {
            for(let iy = cy - radius; iy <= cy + radius; iy++) {
                for(let ix = cx - radius; ix <= cx + radius; ix++) {
                    let d = Math.sqrt((ix - cx)**2 + (iy - cy)**2);
                    if (d <= radius) {
                        this.set(ix, iy, floorTile);
                    }
                }
            }
        },

        // Final Pass: Adds a wall (111) ONLY if a tile is currently water (3)
        // and is touching a floor tile. This prevents blocking entrances.
        applySafeWalls: function() {
            const floorTypes = [9, 59, 86, 110, 112, 114];
            const tempWalls = [];

            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    if (tiles[y][x] === 3) { // If it's water
                        // Check 8 neighbors for ANY floor
                        let hasNeighborFloor = false;
                        for(let dy = -1; dy <= 1; dy++) {
                            for(let dx = -1; dx <= 1; dx++) {
                                if (floorTypes.includes(tiles[y+dy][x+dx])) {
                                    hasNeighborFloor = true;
                                    break;
                                }
                            }
                        }
                        if (hasNeighborFloor) tempWalls.push({x, y});
                    }
                }
            }
            // Apply the walls after checking so we don't interfere with the loop
            tempWalls.forEach(w => tiles[w.y][w.x] = 111);
        }
    };

    // 2. DEFINE THE NODES (Manhattan-aligned for grid stability)
    const nodes = [
        { x: 30,  y: 30,  tile: 110 },
        { x: 80,  y: 30,  tile: 112 },
        { x: 130, y: 30,  tile: 110 },
        { x: 130, y: 80,  tile: 59  },
        { x: 130, y: 130, tile: 110 },
        { x: 80,  y: 130, tile: 114 },
        { x: 30,  y: 130, tile: 110 },
        { x: 30,  y: 80,  tile: 86  }
    ];

    // 3. EXECUTE GENERATION
    // STEP A: Carve all bridges as wide rectangles
    for (let i = 0; i < nodes.length; i++) {
        let n1 = nodes[i];
        let n2 = nodes[(i + 1) % nodes.length];
        h.carveRect(n1.x, n1.y, n2.x, n2.y, 110);
    }
    
    // Connect to center
    h.carveRect(30, 80, 80, 80, 110);

    // STEP B: Carve Chamber Floors (Radius 15)
    nodes.forEach(n => h.carveChamberFloor(n.x, n.y, 15, n.tile));
    h.carveChamberFloor(80, 80, 22, 9); // Center Hub

    // STEP C: Apply Walls safely around the floor structure
    h.applySafeWalls();

    return {
        id: 'sunken_temple',
        name: 'The Great Sunken Temple',
        arcId: 4,
        width: width,
        height: height,
        playerStart: { x: 30, y: 30 },
        bgColor: '#020c14',
        ambientLight: 'rgba(0,100,255,0.1)',
        enemyLevelRange: [15, 25],
        encounterTemplates: [
          { weight: 3, enemies: ['merman'] },
          { weight: 2, enemies: ['merman', 'merman'] },
          { weight: 2, enemies: ['ghost', 'zombie'] },
          { weight: 2, enemies: ['merman', 'ghost'] },
          { weight: 2, enemies: ['necromancer', 'merman'] },
          { weight: 1, enemies: ['merman', 'ghost', 'zombie'] },
          { weight: 1, enemies: ['bone_dragon', 'merman'] },
          { weight: 1, enemies: ['merman', 'merman', 'ghost', 'zombie'] },
        ],
        tiles: tiles,
        enemies: [
            { id: 'merman',     x: 80,  y: 30,  patrol: 'random',     range: 10, speed: 1.2 },
            { id: 'ghost',      x: 130, y: 80,  patrol: 'vertical',   range: 15, speed: 1.4 },
            { id: 'merman',     x: 130, y: 130, patrol: 'horizontal', range: 12, speed: 1.1 },
            { id: 'zombie',     x: 80,  y: 130, patrol: 'random',     range: 10, speed: 1.0 },
            { id: 'necromancer',x: 30,  y: 130, patrol: 'vertical',   range: 15, speed: 1.0 },
            { id: 'bone_dragon',x: 80,  y: 80,  patrol: 'random',     range: 12, speed: 1.3 }
        ],

        npcs: [
          { id: 'essabella', x: 120, y: 80, dialogueKey: 'sunken_temple' },
        ],

        objective: {
          type: 'reach',
          target: { x: 80, y: 80 },
          label: 'Descend to the Flooded Core',
          completeMsg: '✦ The water stirs beneath you — something vast rises from the depths.',
        },

        fog: { delay: 8, peak: 80, max: 0.86, vision: 2.5 },

        voiceLines: {
          ambient: [
            { char:'Lulu',  color:'#2dd4bf', text:'Water drips somewhere. This place is ancient.' },
            { char:'Aya',  color:'#7dd3fc', text:'The temple has been sealed for centuries. Something kept it that way.' },
            { char:'Tao',  color:'#ef4444', text:'Lots of old death here. I can tell.' },
            { char:'Rei',   color:'#4ade80', text:'Careful. The floor is not always what it appears.' },
          ],
          fogRising: [
            { char:'Lulu',  color:'#2dd4bf', text:'The mist is rising from the water. I can\'t see ahead.' },
            { char:'Aya',  color:'#7dd3fc', text:'The temple fog is thickening. Weapons ready.' },
            { char:'Tao',  color:'#ef4444', text:'Ideal ambush conditions. Wonderful.' },
            { char:'Rei',   color:'#4ade80', text:'Something moves in the murk. Not us.' },
          ],
          encounter: [
            { char:'Lulu',  color:'#2dd4bf', text:'Out of the water — look out!' },
            { char:'Rei',   color:'#4ade80', text:'From the mist — now!' },
            { char:'Tao',  color:'#ef4444', text:'Used the fog. I respect it.' },
            { char:'Aya',  color:'#7dd3fc', text:'Ambush from the temple dark!' },
          ],
        },
    };
})();