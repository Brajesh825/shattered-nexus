/**
 * map-ember-wastes.js
 * * SIZE: 100x80
 * * TYPE: Spiral Organic
 * * CONNECTIVITY: 100% Walkable single-path flow.
 */

MAP_DEFS.ember_wastes = (function() {
    const width = 100;
    const height = 80;
    const tiles = [];

    // Initialize with Obsidian Walls (17)
    for (let y = 0; y < height; y++) {
        tiles.push(new Array(width).fill(17));
    }

    const h = {
        // Carve function uses your tile definitions (15, 14, 16, 13)
        carve: function(x, y, rad, tile) {
            for(let iy = Math.floor(y - rad); iy <= y + rad; iy++) {
                for(let ix = Math.floor(x - rad); ix <= x + rad; ix++) {
                    if (iy >= 0 && iy < height && ix >= 0 && ix < width) {
                        let d = Math.sqrt((ix - x)**2 + (iy - y)**2);
                        if (d <= rad) tiles[iy][ix] = tile;
                    }
                }
            }
        }
    };

    // 1. SPIRAL GENERATION
    const centerX = 50;
    const centerY = 40;
    const totalSteps = 22; // Controls length of the spiral
    
    for (let t = 0; t < totalSteps; t += 0.05) {
        // Spiral formula: r = a + bt
        let r = 44 * (1 - t / (totalSteps + 2)); 
        let x = centerX + r * Math.cos(t);
        let y = centerY + r * Math.sin(t);
        
        // Progressive Biome logic
        let tile = 15; // Cracked Stone (Start)
        if (t > 16)      tile = 16; // Ember Pit (Center)
        else if (t > 8)  tile = 33; // Ash Field (Mid)
        
        h.carve(x, y, 3.5, tile);

        // Add small Lava Pools (13) on the outer edges of the path
        if (Math.floor(t * 10) % 60 === 0) {
            let lx = centerX + (r + 6) * Math.cos(t);
            let ly = centerY + (r + 6) * Math.sin(t);
            h.carve(lx, ly, 3, 13);
        }
    }

    // 2. ENTRANCE GATEWAY
    for(let x = 0; x < 15; x++) h.carve(x, 40, 4, 15);

    // 3. THE HEART (Tile 59: Crystal Cave floor for the goal)
    h.carve(centerX, centerY, 6, 59); 

    return {
        id: 'ember_wastes',
        name: 'The Scorched Spiral',
        arcId: 4,
        width: width,
        height: height,
        playerStart: { x: 5, y: 40 },
        bgColor: '#150500',
        ambientLight: 'rgba(255,80,0,0.12)',
        enemyLevelRange: [10, 15],
        encounterTemplates: [
          { weight: 3, enemies: ['harpy'] },
          { weight: 3, enemies: ['imp', 'imp'] },
          { weight: 2, enemies: ['zombie', 'zombie'] },
          { weight: 2, enemies: ['harpy', 'imp'] },
          { weight: 2, enemies: ['werewolf'] },
          { weight: 1, enemies: ['zombie', 'imp', 'imp'] },
          { weight: 1, enemies: ['harpy', 'harpy', 'ghost'] },
          { weight: 1, enemies: ['imp', 'imp', 'zombie', 'harpy'] },
        ],
        tiles: tiles,
        enemies: [
            // Enemies placed specifically on the spiral arc
            { id: 'harpy',    x: 20, y: 55, patrol: 'random',     range: 4, speed: 1.8 },
            { id: 'zombie',   x: 50, y: 5,  patrol: 'horizontal', range: 10,speed: 0.9 },
            { id: 'werewolf', x: 85, y: 25, patrol: 'vertical',   range: 12,speed: 1.5 },
            { id: 'ghost',    x: 70, y: 65, patrol: 'horizontal', range: 8, speed: 1.2 },
            { id: 'imp',      x: 30, y: 30, patrol: 'random',     range: 5, speed: 1.6 },
            
            // Central Guardians
            { id: 'werewolf', x: 50, y: 45, patrol: 'random',     range: 3, speed: 1.8 },
            { id: 'imp',      x: 55, y: 40, patrol: 'random',     range: 3, speed: 1.7 }
        ],

        fog: { delay: 15, peak: 100, max: 0.82, vision: 3.0 },

        voiceLines: {
          ambient: [
            { char:'Ayaka',  color:'#7dd3fc', text:'The ash makes it hard to breathe.' },
            { char:'Hutao',  color:'#ef4444', text:'Smells like the inside of a cremation urn. Lovely.' },
            { char:'Nilou',  color:'#2dd4bf', text:'The heat here is suffocating.' },
            { char:'Xiao',   color:'#4ade80', text:'The wastes distort sound. Something could be anywhere.' },
          ],
          fogRising: [
            { char:'Hutao',  color:'#ef4444', text:'Ash cloud rising. Classic bad omen.' },
            { char:'Xiao',   color:'#4ade80', text:'Smoke and ash — perfect cover for ambush.' },
            { char:'Ayaka',  color:'#7dd3fc', text:'I can\'t see the path. Stay close.' },
            { char:'Nilou',  color:'#2dd4bf', text:'The smoke is getting into everything.' },
          ],
          encounter: [
            { char:'Hutao',  color:'#ef4444', text:'Out of the smoke — of course!' },
            { char:'Xiao',   color:'#4ade80', text:'They used the ash as cover. Smart.' },
            { char:'Ayaka',  color:'#7dd3fc', text:'Incoming — from the smoke!' },
            { char:'Nilou',  color:'#2dd4bf', text:'I couldn\'t see them at all!' },
          ],
        },
    };
})();