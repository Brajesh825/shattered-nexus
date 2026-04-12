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
        if (t > 16)      tile = 13; // Lava Floor (Center — walkable)
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
        arcId: 3,
        width: width,
        height: height,
        playerStart: { x: 5, y: 40 },
        bgColor: '#150500',
        ambientLight: 'rgba(255,80,0,0.12)',
        enemyLevelRange: [10, 15],
        encounterTemplates: [
          { weight: 3, enemies: ['imp'] },
          { weight: 3, enemies: ['imp', 'imp'] },
          { weight: 2, enemies: ['fire_elemental'] },
          { weight: 2, enemies: ['imp', 'fire_elemental'] },
          { weight: 2, enemies: ['gargoyle'] },
          { weight: 1, enemies: ['lesser_demon', 'imp', 'imp'] },
          { weight: 1, enemies: ['gargoyle', 'fire_elemental'] },
          { weight: 1, enemies: ['golem', 'imp', 'fire_elemental'] },
        ],
        tiles: tiles,
        enemies: [
            // Enemies placed specifically on the spiral arc
            { id: 'imp',            x: 20, y: 55, patrol: 'random',     range: 4, speed: 1.8 },
            { id: 'fire_elemental', x: 50, y: 5,  patrol: 'horizontal', range: 10,speed: 1.1 },
            { id: 'gargoyle',       x: 85, y: 25, patrol: 'vertical',   range: 12,speed: 1.4 },
            { id: 'lesser_demon',   x: 70, y: 65, patrol: 'horizontal', range: 8, speed: 1.2 },
            { id: 'imp',            x: 30, y: 30, patrol: 'random',     range: 5, speed: 1.6 },

            // Central Guardians
            { id: 'golem',          x: 50, y: 45, patrol: 'random',     range: 3, speed: 1.0 },
            { id: 'fire_elemental', x: 55, y: 40, patrol: 'random',     range: 3, speed: 1.3 }
        ],

        npcs: [
          { id: 'essabella', x: 80, y: 40, dialogueKey: 'ember_wastes' },
        ],

        objective: {
          type: 'reach',
          target: { x: 50, y: 40 },
          label: 'Find the Heart of the Spiral',
          completeMsg: '✦ The Dark Phoenix stirs — it has sensed you reach its lair.',
        },

        fog: { delay: 15, peak: 100, max: 0.82, vision: 3.0 },

        voiceLines: {
          ambient: [
            { char:'Aya',  color:'#7dd3fc', text:'The ash makes it hard to breathe.' },
            { char:'Tao',  color:'#ef4444', text:'Smells like the inside of a cremation urn. Lovely.' },
            { char:'Lulu',  color:'#2dd4bf', text:'The heat here is suffocating.' },
            { char:'Rei',   color:'#4ade80', text:'The wastes distort sound. Something could be anywhere.' },
          ],
          fogRising: [
            { char:'Tao',  color:'#ef4444', text:'Ash cloud rising. Classic bad omen.' },
            { char:'Rei',   color:'#4ade80', text:'Smoke and ash — perfect cover for ambush.' },
            { char:'Aya',  color:'#7dd3fc', text:'I can\'t see the path. Stay close.' },
            { char:'Lulu',  color:'#2dd4bf', text:'The smoke is getting into everything.' },
          ],
          encounter: [
            { char:'Tao',  color:'#ef4444', text:'Out of the smoke — of course!' },
            { char:'Rei',   color:'#4ade80', text:'They used the ash as cover. Smart.' },
            { char:'Aya',  color:'#7dd3fc', text:'Incoming — from the smoke!' },
            { char:'Lulu',  color:'#2dd4bf', text:'I couldn\'t see them at all!' },
          ],
        },
    };
})();