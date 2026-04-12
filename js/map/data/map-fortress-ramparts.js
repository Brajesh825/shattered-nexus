/**
 * map-fortress-ramparts.js
 * SIZE: 100x80
 * DESIGN: Zig-Zag Battlements
 * FIX: Rectangular carve logic to ensure 0% player/enemy sticking.
 */

MAP_DEFS.fortress_ramparts = (function() {
    const width = 100;
    const height = 80;
    const tiles = [];

    // 1. INITIALIZE: Start with "The Abyss" (Tile 3)
    for (let y = 0; y < height; y++) {
        tiles.push(new Array(width).fill(3));
    }

    const h = {
        set: function(x, y, tile) {
            if (y >= 0 && y < height && x >= 0 && x < width) tiles[y][x] = tile;
        },
        // Carves wide horizontal ramparts
        carveRampart: function(x, y, w, h_thick, tile) {
            for (let iy = y; iy < y + h_thick; iy++) {
                for (let ix = x; ix < x + w; ix++) {
                    this.set(ix, iy, tile);
                }
            }
        },
        // Carves square fortress towers
        carveTower: function(cx, cy, size, tile) {
            const r = Math.floor(size / 2);
            for (let iy = cy - r; iy <= cy + r; iy++) {
                for (let ix = cx - r; ix <= cx + r; ix++) {
                    this.set(ix, iy, tile);
                }
            }
        },
        // Final Wall Pass: Uses Stone Wall (Tile 8)
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

    // 2. THE RAMPARTS (Z-Pattern Flow)
    // Tier 1 (Top)
    h.carveRampart(10, 10, 80, 8, 12); 
    h.carveTower(15, 14, 12, 12); // Start Tower

    // Vertical Connector 1
    h.carveRampart(82, 10, 8, 25, 12);

    // Tier 2 (Middle)
    h.carveRampart(10, 30, 80, 8, 12);
    h.carveTower(50, 34, 14, 9); // Central Outpost

    // Vertical Connector 2
    h.carveRampart(10, 30, 8, 25, 12);

    // Tier 3 (Bottom)
    h.carveRampart(10, 50, 80, 8, 12);
    
    // Final Boss Bastion
    h.carveTower(90, 60, 20, 86); 
    h.carveRampart(82, 50, 8, 20, 12); // Connection to Boss

    // 3. GENERATE
    h.finalize();

    return {
        id: 'fortress_ramparts',
        name: 'Fortress Ramparts',
        arcId: 7,
        width: width,
        height: height,
        playerStart: { x: 15, y: 14 },
        bgColor: '#080610',
        ambientLight: 'rgba(40,30,80,0.08)',
        enemyLevelRange: [22, 26],
        encounterTemplates: [
          { weight: 3, enemies: ['fallen_angel'] },
          { weight: 2, enemies: ['shadow_wraith', 'shadow_wraith'] },
          { weight: 2, enemies: ['fallen_angel', 'shadow_wraith'] },
          { weight: 2, enemies: ['dark_phoenix'] },
          { weight: 1, enemies: ['fallen_angel', 'fallen_angel', 'shadow_wraith'] },
          { weight: 1, enemies: ['dark_phoenix', 'shadow_wraith', 'shadow_wraith'] },
          { weight: 1, enemies: ['fallen_angel', 'dark_phoenix', 'shadow_wraith', 'shadow_wraith'] },
        ],
        tiles: tiles,
        enemies: [
            // TIER 1 PATROLS
            { id: 'fallen_angel', x: 40, y: 14, patrol: 'horizontal', range: 15, speed: 1.0 },
            { id: 'dark_phoenix', x: 70, y: 14, patrol: 'random',     range: 6,  speed: 1.3 },

            // CONNECTOR 1
            { id: 'shadow_wraith', x: 86, y: 20, patrol: 'vertical',   range: 8,  speed: 1.2 },

            // TIER 2 PATROLS (The Hub)
            { id: 'fallen_angel',  x: 50, y: 34, patrol: 'random',     range: 10, speed: 1.1 },
            { id: 'dark_phoenix',  x: 30, y: 34, patrol: 'horizontal', range: 12, speed: 1.4 },
            { id: 'dark_phoenix',  x: 70, y: 34, patrol: 'horizontal', range: 12, speed: 1.4 },

            // CONNECTOR 2
            { id: 'shadow_wraith', x: 14, y: 40, patrol: 'vertical',   range: 8,  speed: 1.2 },

            // TIER 3 PATROLS
            { id: 'fallen_angel',  x: 40, y: 54, patrol: 'horizontal', range: 20, speed: 1.0 },
            { id: 'shadow_wraith', x: 60, y: 54, patrol: 'vertical',   range: 5,  speed: 1.2 },

            // BASTION GUARDIANS
            { id: 'dark_phoenix',  x: 85, y: 65, patrol: 'random',     range: 5,  speed: 1.5 },
            { id: 'fallen_angel',  x: 95, y: 65, patrol: 'random',     range: 5,  speed: 1.5 },
            { id: 'shadow_wraith', x: 90, y: 55, patrol: 'horizontal', range: 8,  speed: 1.3 }
        ],

        fog: { delay: 10, peak: 70, max: 0.88, vision: 2.4 },

        voiceLines: {
          ambient: [
            { char:'Ayaka',  color:'#7dd3fc', text:'The ramparts stretch further than I can see.' },
            { char:'Hutao',  color:'#ef4444', text:'Fortress of the dead. Architecture checks out.' },
            { char:'Xiao',   color:'#4ade80', text:'They built this to last. Unfortunately.' },
            { char:'Nilou',  color:'#2dd4bf', text:'The wind here sounds like voices.' },
          ],
          fogRising: [
            { char:'Ayaka',  color:'#7dd3fc', text:'A shroud over the battlements. We\'re exposed.' },
            { char:'Xiao',   color:'#4ade80', text:'The fortress uses the fog. Expect contact.' },
            { char:'Hutao',  color:'#ef4444', text:'Dark fortresses get darker. Makes sense.' },
            { char:'Nilou',  color:'#2dd4bf', text:'I can\'t tell where the walls end.' },
          ],
          encounter: [
            { char:'Xiao',   color:'#4ade80', text:'From the rampart shadows — move!' },
            { char:'Hutao',  color:'#ef4444', text:'Dropped on us from above!' },
            { char:'Ayaka',  color:'#7dd3fc', text:'They waited in the dark!' },
            { char:'Nilou',  color:'#2dd4bf', text:'Didn\'t see them at all—' },
          ],
        },
    };
})();