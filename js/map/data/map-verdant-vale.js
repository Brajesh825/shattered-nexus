/**
 * map-verdant-vale.js — Verdant Vale map data.
 * * DESIGN LOGIC:
 * - WEST (x0-27): Civilized. Contains Town, starting point, and orchard gardens.
 * - CENTER (x28-32): The Vertical River. A natural barrier with a central bridge at y14.
 * - EAST (x33-59): The Wilds. Contains the flower meadow, mountains, and the cave entrance.
 */

MAP_DEFS.verdant_vale = {
    id:          'verdant_vale',
    name:        'Verdant Vale',
    arcId:       1,
    width:       60,
    height:      40,
    playerStart: { x: 7, y: 10 }, 
    bgColor:     '#0a1a05',
    ambientLight:'rgba(60,180,60,0.04)',
    enemyLevelRange: [1, 3],

    encounterTemplates: [
      { weight: 3, enemies: ['goblin'] },
      { weight: 3, enemies: ['wolf'] },
      { weight: 2, enemies: ['goblin', 'goblin'] },
      { weight: 2, enemies: ['bat', 'bat'] },
      { weight: 2, enemies: ['goblin', 'wolf'] },
      { weight: 2, enemies: ['spider', 'spider'] },
      { weight: 1, enemies: ['goblin', 'goblin', 'bat'] },
      { weight: 1, enemies: ['wolf', 'spider', 'bat'] },
      { weight: 1, enemies: ['goblin', 'goblin', 'wolf', 'spider'] },
    ],

    enemies: [
        // --- WEST SIDE (Lower Level) ---
        { id:'goblin', x:8,  y:15, patrol:'horizontal', range:3, speed:1.0 },
        { id:'goblin', x:18, y:8,  patrol:'random',     range:2, speed:1.1 },
        { id:'wolf',   x:22, y:25, patrol:'random',     range:4, speed:1.4 },
        
        // --- THE BRIDGE GUARDS ---
        { id:'bat',    x:26, y:14, patrol:'vertical',   range:2, speed:1.8 },
        { id:'bat',    x:34, y:14, patrol:'vertical',   range:2, speed:1.8 },

        // --- EAST SIDE (The Wilds) ---
        { id:'spider', x:40, y:22, patrol:'random',     range:3, speed:0.9 }, // In flower meadow
        { id:'spider', x:48, y:28, patrol:'random',     range:3, speed:0.9 }, // Near sandy bank
        { id:'wolf',   x:45, y:10, patrol:'horizontal', range:5, speed:1.5 }, // North plateau
        { id:'goblin', x:54, y:28, patrol:'vertical',   range:2, speed:1.2 }  // Cave entrance guard
    ],

    tiles: (function() {
        const rows = [];
        for (let y = 0; y < 40; y++) {
            let row = new Array(60).fill(1); // Default to Grass (1)

            for (let x = 0; x < 60; x++) {
                // 1. Forest Borders (Top & Bottom)
                if (y < 3 || y > 36) {
                    row[x] = 5;
                    continue;
                }

                // 2. The Vertical River (x28 to x32)
                if (x >= 28 && x <= 32) {
                    // Place the Bridge (4) at y13-y15 across the river
                    if (y >= 13 && y <= 15) {
                        row[x] = 4; 
                    } else {
                        row[x] = 3; // Water
                    }
                }

                // 3. The Town (North West)
                if (x >= 5 && x <= 12 && y >= 5 && y <= 9) {
                    row[x] = 12; // Town floor
                }

                // 4. The Path (Connecting Town to Bridge to Cave)
                // Horizontal segments
                if (y === 7 && x > 12 && x < 28) row[x] = 2; // From Town to River
                if (y === 14 && x < 28) row[x] = 2;          // Main Bridge approach West
                if (y === 14 && x > 32) row[x] = 2;          // Main Bridge approach East
                // Vertical connector on West
                if (x === 18 && y > 7 && y < 14) row[x] = 2;

                // 5. The Mountains (North East)
                if (x > 45 && y < 12) {
                    row[x] = 6;
                }

                // 6. Flower Meadow (South East patch)
                if (x > 35 && x < 48 && y > 18 && y < 26) {
                    row[x] = 11;
                }

                // 7. Sandy Bank (Near South River)
                if (x >= 33 && x <= 38 && y > 26 && y < 33) {
                    row[x] = 10;
                }

                // 8. The Cave (Far East Center)
                if (x >= 55 && x <= 58 && y >= 28 && y <= 31) {
                    if (x === 55 || x === 58 || y === 28 || y === 31) {
                        row[x] = 8; // Cave Wall
                    } else {
                        row[x] = 7; // Cave Floor (The Entrance)
                    }
                }
                
                // 9. Side Borders (Deep Forest)
                if (x < 3 || x > 57) {
                    // Ensure the Cave and Path can still exist
                    if (!(x >= 55 && y >= 28 && y <= 31) && !(y === 14)) {
                        row[x] = 5;
                    }
                }
            }
            rows.push(row);
        }
        return rows;
    })(),

    fog: { delay: 30, peak: 150, max: 0.72, vision: 3.8 },

    voiceLines: {
      ambient: [
        { char:'Ayaka',  color:'#7dd3fc', text:'The vale feels larger at dusk.' },
        { char:'Hutao',  color:'#ef4444', text:'Something rustles. Maybe just the wind.' },
        { char:'Nilou',  color:'#2dd4bf', text:'I can hear the river somewhere ahead.' },
        { char:'Xiao',   color:'#4ade80', text:'Stay alert. This place is not as peaceful as it looks.' },
      ],
      fogRising: [
        { char:'Xiao',   color:'#4ade80', text:'A mist is rising. Keep moving.' },
        { char:'Hutao',  color:'#ef4444', text:'Oh good, ominous fog. My favorite.' },
        { char:'Ayaka',  color:'#7dd3fc', text:'The light is fading. Stay together.' },
        { char:'Nilou',  color:'#2dd4bf', text:'I can barely see past the treeline.' },
      ],
      encounter: [
        { char:'Xiao',   color:'#4ade80', text:'Enemy — don\'t let them surround us!' },
        { char:'Hutao',  color:'#ef4444', text:'They came out of nowhere!' },
        { char:'Ayaka',  color:'#7dd3fc', text:'Ambush — form up!' },
        { char:'Nilou',  color:'#2dd4bf', text:'The fog — they were hiding in it!' },
      ],
    },
};