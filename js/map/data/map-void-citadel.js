/**
 * map-void-citadel.js
 * SIZE: 120x120
 * DESIGN: Quad-Wing Intersection
 * FIX: Floor-first "Double-Carve" to ensure wide paths and zero snags.
 */

MAP_DEFS.void_citadel = (function() {
    const width = 120;
    const height = 120;
    const tiles = [];

    // 1. INITIALIZE: Start with "The Void" (3)
    for (let y = 0; y < height; y++) {
        tiles.push(new Array(width).fill(3));
    }

    const h = {
        set: function(x, y, tile) {
            if (y >= 0 && y < height && x >= 0 && x < width) tiles[y][x] = tile;
        },
        // Carves high-clearance hallways
        carveHall: function(x1, y1, x2, y2, floorTile) {
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
        // Carves large fortified chambers
        carveChamber: function(cx, cy, size, floorTile) {
            const start = Math.floor(size / 2);
            for (let iy = cy - start; iy <= cy + start; iy++) {
                for (let ix = cx - start; ix <= cx + start; ix++) {
                    this.set(ix, iy, floorTile);
                }
            }
        },
        // Final Wall Pass: Uses Void Wall (Tile 8)
        finalize: function() {
            const walls = [];
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    if (tiles[y][x] === 3) {
                        let adj = false;
                        for(let dy=-1; dy<=1; dy++) {
                            for(let dx=-1; dx<=1; dx++) {
                                if (tiles[y+dy][x+dx] !== 3) { adj = true; break; }
                            }
                        }
                        if (adj) walls.push({x, y});
                    }
                }
            }
            walls.forEach(w => tiles[w.y][w.x] = 8);
        }
    };

    // 2. THE CENTRAL HUB (Core of the Citadel)
    h.carveChamber(60, 60, 24, 12); // Tile 12 (Void Floor)

    // 3. THE FOUR WINGS (Highways to Trial Rooms)
    // North Wing (Entrance)
    h.carveHall(60, 10, 60, 60, 9);
    h.carveChamber(60, 15, 12, 9); // Entry Plaza

    // South Wing (The Portal)
    h.carveHall(60, 60, 60, 110, 9);
    h.carveChamber(60, 105, 20, 86); // Final Portal Room

    // West Wing (Necromancer's Lab)
    h.carveHall(15, 60, 60, 60, 9);
    h.carveChamber(15, 60, 16, 0);

    // East Wing (Dragon's Roost)
    h.carveHall(60, 60, 105, 60, 9);
    h.carveChamber(105, 60, 16, 0);

    // 4. GENERATE FINAL STRUCTURE
    h.finalize();

    return {
        id: 'void_citadel',
        name: 'Void Citadel',
        arcId: 5,
        width: width,
        height: height,
        playerStart: { x: 60, y: 15 },
        bgColor: '#040210',
        ambientLight: 'rgba(60,20,160,0.1)',
        enemyLevelRange: [18, 22],
        encounterTemplates: [
          { weight: 3, enemies: ['void_knight'] },
          { weight: 2, enemies: ['void_knight', 'void_knight'] },
          { weight: 2, enemies: ['necromancer'] },
          { weight: 2, enemies: ['void_knight', 'necromancer'] },
          { weight: 1, enemies: ['void_knight', 'void_knight', 'necromancer'] },
          { weight: 1, enemies: ['bone_dragon'] },
          { weight: 1, enemies: ['necromancer', 'void_knight', 'void_knight', 'void_knight'] },
        ],
        tiles: tiles,
        enemies: [
            // HUB DEFENDERS
            { id: 'void_knight', x: 55, y: 60, patrol: 'random', range: 8, speed: 1.1 },
            { id: 'void_knight', x: 65, y: 60, patrol: 'random', range: 8, speed: 1.1 },
            { id: 'necromancer', x: 60, y: 55, patrol: 'horizontal', range: 10, speed: 0.8 },

            // WEST WING (Lab)
            { id: 'necromancer', x: 15, y: 60, patrol: 'random', range: 5, speed: 0.8 },
            { id: 'void_knight', x: 30, y: 60, patrol: 'vertical', range: 10, speed: 1.0 },

            // EAST WING (Dragon Roost)
            { id: 'bone_dragon', x: 105, y: 60, patrol: 'random', range: 7, speed: 0.9 },
            { id: 'void_knight', x: 80, y: 60, patrol: 'vertical', range: 10, speed: 1.0 },

            // SOUTH WING (Portal Guard)
            { id: 'bone_dragon', x: 60, y: 90, patrol: 'horizontal', range: 15, speed: 0.9 },
            { id: 'necromancer', x: 50, y: 105, patrol: 'random', range: 5, speed: 0.8 },
            { id: 'necromancer', x: 70, y: 105, patrol: 'random', range: 5, speed: 0.8 }
        ]
    };
})();