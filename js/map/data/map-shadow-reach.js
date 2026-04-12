/**
 * map-shadow-reach.js
 * SIZE: 100x100
 * DESIGN: Dense Spine & Wings
 * FIX: Floor-first logic to guarantee wide, non-stuck paths.
 */

MAP_DEFS.shadow_reach = (function() {
    const width = 100;
    const height = 100;
    const tiles = [];

    // 1. VOID INITIALIZATION
    for (let y = 0; y < height; y++) {
        tiles.push(new Array(width).fill(3));
    }

    const h = {
        set: function(x, y, tile) {
            if (y >= 0 && y < height && x >= 0 && x < width) tiles[y][x] = tile;
        },
        // Carves perfectly straight wide halls
        carveHall: function(x, y, w, h_len, floorTile) {
            for (let iy = y; iy < y + h_len; iy++) {
                for (let ix = x; ix < x + w; ix++) {
                    this.set(ix, iy, floorTile);
                }
            }
        },
        // Carves square rooms
        carveRoom: function(cx, cy, size, floorTile) {
            const start = Math.floor(size / 2);
            for (let iy = cy - start; iy <= cy + start; iy++) {
                for (let ix = cx - start; ix <= cx + start; ix++) {
                    this.set(ix, iy, floorTile);
                }
            }
        },
        // Adds boundary walls ONLY on water touching floor
        addWalls: function() {
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

    // 2. THE SPINE (Main Vertical Path)
    h.carveHall(46, 10, 8, 80, 9); 

    // 3. THE WINGS (Rooms & Corridors)
    // Top Left
    h.carveHall(20, 20, 26, 6, 9);
    h.carveRoom(20, 23, 12, 0); 

    // Top Right
    h.carveHall(54, 35, 26, 6, 9);
    h.carveRoom(80, 38, 12, 0);

    // Bottom Left
    h.carveHall(20, 60, 26, 6, 9);
    h.carveRoom(20, 63, 12, 0);

    // Bottom Right
    h.carveHall(54, 75, 26, 6, 9);
    h.carveRoom(80, 78, 12, 0);

    // Final Boss Room (Portal)
    h.carveRoom(50, 90, 18, 86); 

    // 4. APPLY BOUNDARIES
    h.addWalls();

    return {
        id: 'shadow_reach',
        name: 'Shadow Reach',
        arcId: 5,
        width: width,
        height: height,
        playerStart: { x: 50, y: 15 },
        bgColor: '#05020c',
        ambientLight: 'rgba(80,20,140,0.08)',
        enemyLevelRange: [14, 18],
        encounterTemplates: [
          { weight: 3, enemies: ['ghost'] },
          { weight: 2, enemies: ['vampire'] },
          { weight: 2, enemies: ['ghost', 'ghost'] },
          { weight: 2, enemies: ['orc', 'orc'] },
          { weight: 2, enemies: ['vampire', 'ghost'] },
          { weight: 1, enemies: ['orc', 'witch', 'ghost'] },
          { weight: 1, enemies: ['gargoyle', 'ghost', 'vampire'] },
          { weight: 1, enemies: ['vampire', 'orc', 'ghost', 'witch'] },
        ],
        tiles: tiles,
        enemies: [
            // SPINE STALKERS
            { id: 'ghost',    x: 50, y: 25, patrol: 'vertical',   range: 10, speed: 1.4 },
            { id: 'vampire',  x: 50, y: 45, patrol: 'vertical',   range: 10, speed: 1.2 },
            { id: 'ghost',    x: 50, y: 65, patrol: 'vertical',   range: 10, speed: 1.4 },
            { id: 'vampire',  x: 50, y: 80, patrol: 'vertical',   range: 10, speed: 1.2 },

            // WING GUARDIANS (Top Left)
            { id: 'orc',      x: 20, y: 23, patrol: 'random',     range: 5,  speed: 0.9 },
            { id: 'witch',    x: 30, y: 20, patrol: 'horizontal', range: 6,  speed: 1.1 },

            // WING GUARDIANS (Top Right)
            { id: 'witch',    x: 80, y: 38, patrol: 'random',     range: 5,  speed: 1.0 },
            { id: 'gargoyle', x: 70, y: 35, patrol: 'horizontal', range: 6,  speed: 1.1 },

            // WING GUARDIANS (Bottom Left)
            { id: 'orc',      x: 20, y: 63, patrol: 'random',     range: 5,  speed: 0.9 },
            { id: 'ghost',    x: 30, y: 60, patrol: 'horizontal', range: 8,  speed: 1.3 },

            // WING GUARDIANS (Bottom Right)
            { id: 'gargoyle', x: 80, y: 78, patrol: 'random',     range: 5,  speed: 1.1 },
            { id: 'vampire',  x: 70, y: 75, patrol: 'horizontal', range: 6,  speed: 1.2 },

            // BOSS GATEKEEPERS
            { id: 'witch',    x: 42, y: 90, patrol: 'random',     range: 4,  speed: 1.2 },
            { id: 'witch',    x: 58, y: 90, patrol: 'random',     range: 4,  speed: 1.2 },
            { id: 'orc',      x: 50, y: 95, patrol: 'horizontal', range: 5,  speed: 1.0 }
        ],

        npcs: [
          { id: 'essabella', x: 50, y: 60, dialogueKey: 'shadow_reach' },
        ],

        objective: {
          type: 'reach',
          target: { x: 50, y: 90 },
          label: 'Find the Shadow Gate',
          completeMsg: '✦ You stand at the gate — the Fallen Angel stirs beyond it.',
        },

        fog: { delay: 5, peak: 60, max: 0.92, vision: 2.2 },

        voiceLines: {
          ambient: [
            { char:'Rei',   color:'#4ade80', text:'Even I cannot sense the edges of this dark.' },
            { char:'Tao',  color:'#ef4444', text:'The shadow here thinks. I can feel it.' },
            { char:'Aya',  color:'#7dd3fc', text:'Valdris\'s power saturates this place.' },
            { char:'Lulu',  color:'#2dd4bf', text:'Something watches from the black. Don\'t stop moving.' },
          ],
          fogRising: [
            { char:'Rei',   color:'#4ade80', text:'The shadow closes in. Do not separate.' },
            { char:'Aya',  color:'#7dd3fc', text:'I can barely see my own hands.' },
            { char:'Tao',  color:'#ef4444', text:'This is a very committed darkness.' },
            { char:'Lulu',  color:'#2dd4bf', text:'It\'s not just dark — it\'s alive.' },
          ],
          encounter: [
            { char:'Rei',   color:'#4ade80', text:'The shadow moves — they\'re here!' },
            { char:'Tao',  color:'#ef4444', text:'Came from the dark itself!' },
            { char:'Aya',  color:'#7dd3fc', text:'They were part of the shadow—' },
            { char:'Lulu',  color:'#2dd4bf', text:'We couldn\'t see them at all!' },
          ],
        },
    };
})();