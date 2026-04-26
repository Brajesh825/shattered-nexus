/**
 * map-verdant-vale.js — Verdant Vale map data.
 */

MAP_DEFS.verdant_vale = {
    id: 'verdant_vale',
    name: 'Verdant Vale',
    arcId: 1,
    width: 60,
    height: 50, 
    playerStart: { x: 7, y: 10 },
    bgColor: '#0a1a05',
    ambientLight: 'rgba(60,180,60,0.04)',
    weather: 'leaves',
    enemyLevelRange: [1, 8],
    mutationConfig: {
        corruptThreshold: 90,
        mutantThreshold: 180,
        corruptChance: 0.020,
        mutantChance: 0.010,
    },

    encounterTemplates: [
        { weight: 3, enemies: ['goblin'] },
        { weight: 3, enemies: ['wolf'] },
        { weight: 2, enemies: ['zombie_soldier'] },
        { weight: 2, enemies: ['bat', 'bat'] },
        { weight: 2, enemies: ['zombie_soldier', 'wolf'] },
        { weight: 2, enemies: ['spider', 'spider'] },
        { weight: 1, enemies: ['goblin', 'goblin', 'zombie_soldier'] },
        { weight: 1, enemies: ['wolf', 'spider', 'bat'] },
        { weight: 1, enemies: ['zombie_soldier', 'zombie_soldier', 'wolf'] },
    ],

    enemies: [
        { id: 'zombie_soldier', x: 42, y: 18, patrol: 'horizontal', range: 3, speed: 0.8 },
        { id: 'goblin',         x: 48, y: 6,  patrol: 'random', range: 2, speed: 1.1 },
        { id: 'wolf',           x: 52, y: 22, patrol: 'random', range: 4, speed: 1.4 },
        { id: 'zombie_soldier', x: 40, y: 5,  patrol: 'horizontal', range: 2, speed: 0.7 }, 
        { id: 'goblin',         x: 45, y: 9,  patrol: 'vertical', range: 2, speed: 1.0 }, 
        { id: 'wolf',           x: 36, y: 24, patrol: 'random', range: 3, speed: 1.2 }, 

        { id: 'bat', x: 34, y: 13, patrol: 'vertical', range: 2, speed: 1.8 },
        { id: 'bat', x: 37, y: 15, patrol: 'vertical', range: 2, speed: 1.8 },
        { id: 'bat', x: 39, y: 4,  patrol: 'horizontal', range: 4, speed: 1.5 }, 
        { id: 'bat', x: 44, y: 27, patrol: 'horizontal', range: 3, speed: 1.6 }, 
        { id: 'rat', x: 35, y: 11, patrol: 'random', range: 2, speed: 1.2 }, 

        { id: 'zombie_soldier', x: 41, y: 21, patrol: 'random', range: 3, speed: 0.7 }, 
        { id: 'spider',         x: 49, y: 32, patrol: 'random', range: 3, speed: 0.9 }, 
        { id: 'zombie_soldier', x: 46, y: 11, patrol: 'horizontal', range: 5, speed: 0.9 }, 
        { id: 'goblin',         x: 54, y: 33, patrol: 'vertical', range: 2, speed: 1.2 }, 
        { id: 'wolf',           x: 43, y: 4,  patrol: 'random', range: 3, speed: 1.4 }, 
        { id: 'spider',         x: 46, y: 26, patrol: 'vertical', range: 3, speed: 1.0 }, 
        { id: 'spider',         x: 51, y: 14, patrol: 'horizontal', range: 4, speed: 1.1 }, 
        { id: 'zombie_soldier', x: 57, y: 10, patrol: 'random', range: 2, speed: 0.8 },
        // --- THE RUINED KINGDOM (AETHELGARD) ---
        { id: 'goblin_elite',   x: 35, y: 40, patrol: 'vertical', range: 3, speed: 0.9 },
        { id: 'goblin_elite',   x: 46, y: 36, patrol: 'horizontal', range: 2, speed: 1.0 },
        { id: 'galdor_king',    x: 52, y: 41, patrol: 'horizontal', range: 2, speed: 0.9, isBoss: true }
    ],

    tiles: (function () {
        const rows = [];
        const W = 60, H = 50;
        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(1); 

            for (let x = 0; x < W; x++) {
                // 1. Borders
                if (y < 3 || y > H - 4) { row[x] = 5; continue; }

                // 2. The Vertical River
                if (x >= 28 && x <= 32) {
                    if (y >= 13 && y <= 15) {
                        // Bridge surface
                        if (x === 30 && y === 14) row[x] = 111; // Scattered remains/rubble in middle
                        else if (x === 31 && y === 15) row[x] = 111; // More debris
                        else row[x] = 4;
                    }
                    else row[x] = 3;
                    continue;
                }

                // 3. The Town (North West)
                if (x >= 5 && x <= 12 && y >= 5 && y <= 9) { 
                    row[x] = 12; 
                    continue; 
                }

                // 4. North West Boundary (Town Wall)
                const isWallX = (x === 3 || x === 14);
                const isWallY = (y === 3 || y === 11);
                if ((isWallX && y >= 3 && y <= 11) || (isWallY && x >= 3 && x <= 14)) {
                    if (y === 7 && (x === 3 || x === 14)) {
                        row[x] = 2; 
                    } else {
                        row[x] = 68; 
                    }
                    continue;
                }

                // 5. The Path & Bridge Ward
                if (y === 7 && x > 12 && x < 28) { row[x] = 2; continue; }
                if (y === 14 && x < 28) { row[x] = 2; continue; }
                if (x === 27 && y === 12) { row[x] = 88; continue; } 
                if (y === 14 && x > 32) { row[x] = 2; continue; }
                if (x === 18 && y > 7 && y < 14) { row[x] = 2; continue; }

                // 6. The Mountains
                if (x > 45 && y < 12) { row[x] = 6; continue; }

                // 7. Tall Grass Patches (Rustling Grass)
                if (x > 35 && x < 48 && y > 18 && y < 26) { row[x] = 40; continue; }

                // 8. Sandy Bank
                if (x >= 33 && x <= 38 && y > 26 && y < 33) { row[x] = 10; continue; }

                // 9. The Cave
                if (x >= 55 && x <= 58 && y >= 28 && y <= 31) {
                    if (x === 55 || x === 58 || y === 28 || y === 31) row[x] = 8;
                    else row[x] = 7;
                    continue;
                }

                // 10. Side Borders
                if (x < 3 || x > 57) {
                    if (!(x >= 55 && y >= 28 && y <= 31) && !(y === 14)) {
                        row[x] = 5;
                        continue;
                    }
                }

                // 11. Ruins of a Glorious Kingdom (The Summoning Site)
                if (x < 25 && y >= 22 && y < 45 && row[x] === 1) {
                    const sWallX = (x === 5 || x === 21);
                    const sWallY = (y === 24 || y === 38);
                    if ((sWallX && y >= 24 && y <= 38) || (sWallY && x >= 5 && x <= 21)) {
                         if (y === 31 && x === 21) { row[x] = 2; } 
                         else { row[x] = 68; }
                         continue;
                    }
                    const d = Math.sqrt((x - 13) ** 2 + (y - 31) ** 2);
                    if (d < 5) {
                        if (d < 0.8) row[x] = 88;    
                        else if (d < 2) row[x] = 86; 
                        else if (d < 3.5) row[x] = 87; 
                        else row[x] = 73;             
                    } else if (Math.random() < 0.08) {
                        row[x] = 111; 
                    }
                }

                // 12. Western Refugee Settlement
                if (x >= 16 && x <= 25 && y >= 16 && y <= 22 && row[x] === 1) {
                    const wWallX = (x === 16 || x === 25);
                    const wWallY = (y === 16 || y === 22);
                    if ((wWallX && y >= 16 && y <= 22) || (wWallY && x >= 16 && x <= 25)) {
                        if (x === 18 && y === 16) row[x] = 2; 
                        else row[x] = 68; 
                        continue;
                    }
                    row[x] = 12;
                }

                // 13. Bridge Outpost
                if (x >= 24 && x <= 27 && y >= 13 && y <= 15 && row[x] === 1) {
                    const oWallX = (x === 24 || x === 27);
                    const oWallY = (y === 13 || y === 15);
                    if ((oWallX && y >= 13 && y <= 15) || (oWallY && x >= 24 && x <= 27)) {
                        if (x === 27 && y === 14) row[x] = 2; 
                        else row[x] = 68; 
                        continue;
                    }
                    row[x] = 12; 
                }

                // 14. The Ruined Kingdom (South East) - Touching the River Bank
                if (x >= 33 && x <= 58 && y >= 35 && y <= 46 && row[x] === 1) {
                    const rWallX = (x === 33 || x === 58);
                    const rWallY = (y === 35 || y === 46);
                    const isEntrance = (x >= 42 && x <= 44 && y === 35); // Move entrance closer to the river side

                    if ((rWallX && y >= 35 && y <= 46) || (rWallY && x >= 33 && x <= 58)) {
                        if (isEntrance) {
                            row[x] = 2; // Dirt path entrance
                        } else {
                            row[x] = 68; // Stone wall
                        }
                        continue;
                    }

                    // Internal floor & rubble
                    const dToThrone = Math.sqrt((x - 52) ** 2 + (y - 41) ** 2);
                    // Guaranteed 3-tile wide clear path from the northern entrance down and across to the throne
                    const isMainAisle = (x >= 42 && x <= 45 && y >= 35 && y <= 42) || (y >= 40 && y <= 42 && x >= 42 && x <= 52);

                    if (dToThrone < 1.5) {
                        row[x] = 80; // The Throne (Gold-Tile, Walkable)
                    } else if (!isMainAisle && Math.random() < 0.15) {
                        row[x] = 110; // Ruin Floor / Rubble (Walkable)
                    } else {
                        row[x] = 73; // Cracked stone floor
                    }
                }
            }
            rows.push(row);
        }
        return rows;
    })(),

    npcs: [
        { id: 'essabella',    x: 44, y: 22, dialogueKey: 'verdant_vale', behavior: 'wander', range: 3 },
        { id: 'elder_maren',  x: 6,  y: 8,  dialogueKey: 'elder_maren', behavior: 'stationary' },
        { id: 'soldier_1',    x: 23, y: 13, dialogueKey: 'soldier_chat', behavior: 'patrol', waypoints: [{x:23,y:13}, {x:26,y:13}] }, 
        { id: 'soldier_2',    x: 15, y: 6,  dialogueKey: 'soldier_chat', behavior: 'stationary' }, 
        { id: 'soldier_3',    x: 17, y: 15, dialogueKey: 'soldier_chat', behavior: 'patrol', waypoints: [{x:17,y:15}, {x:17,y:12}] }, 
        { id: 'lira',         x: 8,  y: 7,  dialogueKey: 'verdant_vale', behavior: 'wander', range: 2 }, 
    ],

    triggers: [
        {
            id: 'bridge_realization',
            x: 29, y: 13, w: 3, h: 3, // Cover the bridge area
            type: 'dialogue',
            lines: [
                { speaker: 'Rei',  text: 'Wait... do you feel that?' },
                { speaker: 'Tao',  text: 'The air... it\'s heavy. And look at the stone. It\'s scorched.' },
                { speaker: 'Aya',  text: 'Scorched by void, not fire. These aren\'t just ruins... everyone is already dead in here.' },
                { speaker: 'Lulu', text: 'Davan was right. The Void Knight didn\'t just pass through. He turned this place into a tomb.' },
                { speaker: 'Rei',  text: 'Keep your guard up. Whatever did this is still around, and it\'s hungry.' },
            ]
        },
        {
            id: 'aethelgard_mystery',
            x: 40, y: 34, w: 5, h: 2, // Adjusted trigger position for new entrance
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'The grass gives way to jagged stone—not natural formations, but the bones of a city swallowed by the earth.' },
                { speaker: 'Lulu',     text: 'It feels... heavy here. Like the air is made of lead.' },
                { speaker: 'narrator', text: 'A stifling weight of ancient gold hangs over the ruins. Somewhere within the labyrinth of stone, a rhythmic clinking of coins echoes against the wind.' },
                { speaker: 'Rei',      text: 'I don\'t like this. These ruins shouldn\'t be here. They aren\'t on any map.' },
                { speaker: 'Aya',      text: 'Stay close. Whatever lived here once... it hasn\'t left.' }
            ]
        }
    ],

    objective: {
        type: 'reach',
        target: { x: 53, y: 29 },
        label: 'Reach the Eastern Cave',
        completeMsg: '✦ You have reached the cave — the Seal Fragment awaits inside.',
    },

    fog: { delay: 30, peak: 150, max: 0.72, vision: 3.8 },

    voiceLines: {
        ambient: [
            { char: 'Aya', color: '#7dd3fc', text: 'The vale feels larger at dusk.' },
            { char: 'Tao', color: '#ef4444', text: 'Something rustles. Maybe just the wind.' },
            { char: 'Lulu', color: '#2dd4bf', text: 'I can hear the river somewhere ahead.' },
            { char: 'Rei', color: '#4ade80', text: 'Stay alert. This place is not as peaceful as it looks.' },
        ],
        fogRising: [
            { char: 'Rei', color: '#4ade80', text: 'A mist is rising. Keep moving.' },
            { char: 'Tao', color: '#ef4444', text: 'Oh good, ominous fog. My favorite.' },
            { char: 'Aya', color: '#7dd3fc', text: 'The light is fading. Stay together.' },
            { char: 'Lulu', color: '#2dd4bf', text: 'I can barely see past the treeline.' },
        ],
        encounter: [
            { char: 'Rei', color: '#4ade80', text: 'Enemy — don\'t let them surround us!' },
            { char: 'Tao', color: '#ef4444', text: 'They came out of nowhere!' },
            { char: 'Aya', color: '#7dd3fc', text: 'Ambush — form up!' },
            { char: 'Lulu', color: '#2dd4bf', text: 'The fog — they were hiding in it!' },
        ],
    },
};