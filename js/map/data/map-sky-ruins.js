/**
 * map-sky-ruins.js — Sky Ruins side map data.
 */

MAP_DEFS.sky_ruins = {
    id: 'sky_ruins',
    name: 'Sky Ruins',
    width: 30,
    height: 30,
    playerStart: { x: 15, y: 19 },
    bgColor: '#1a1a2a',
    ambientLight: 'rgba(180,100,250,0.07)',
    weather: 'ash', // Or storm if available
    enemyLevelRange: [30, 40],
    encounterTemplates: [
        { weight: 3, enemies: ['wisp'] },
        { weight: 2, enemies: ['void_knight'] },
        { weight: 1, enemies: ['wisp', 'void_knight'] }
    ],
    enemies: [
        { id: 'wisp',        x: 10, y: 10, patrol: 'random', range: 6, speed: 1.8 },
        { id: 'void_knight', x: 20, y: 5,  patrol: 'horizontal', range: 4, speed: 1.2 },
        { id: 'void_knight', x: 15, y: 15, patrol: 'stationary', isBoss: true, label: 'Storm Sentinel' },
        { id: 'wisp',        x: 5,  y: 25, patrol: 'vertical', range: 5, speed: 1.7 },
        { id: 'void_knight', x: 25, y: 20, patrol: 'random', range: 4, speed: 1.3 }
    ],
    tiles: (function () {
        const rows = [];
        const W = 30, H = 30;
        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(0); // Void
            for (let x = 0; x < W; x++) {
                // 1. Floating Islands (Island logic)
                const distToCenter = Math.sqrt((x - 15) ** 2 + (y - 15) ** 2);
                const distToNW = Math.sqrt((x - 7) ** 2 + (y - 7) ** 2);
                const distToSE = Math.sqrt((x - 23) ** 2 + (y - 23) ** 2);

                if (distToCenter < 5 || distToNW < 4 || distToSE < 4) {
                    row[x] = 15; // Cracked Stone
                    if (Math.random() < 0.2) row[x] = 9; // Dungeon tile
                    continue;
                }

                // 2. Fragmented Bridges (Guaranteed on main axis)
                if ((y === 15 && x > 7 && x < 23) || (x === 15 && y > 7 && y < 23)) {
                    row[x] = 15; // Solid path
                    continue;
                }
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'archivist', x: 7, y: 7, dialogueKey: 'archivist_lore', behavior: 'stationary' },
        { id: 'sentinel', x: 23, y: 23, dialogueKey: 'sentinel_oath', behavior: 'stationary' }
    ],
    triggers: [
        {
            id: 'wind_dialogue',
            x: 12, y: 15, w: 6, h: 2,
            type: 'dialogue',
            lines: [
                { speaker: 'Aya', text: 'The wind... it\'s trying to pull us off the edge.' },
                { speaker: 'Rei', text: 'Then we push back. We didn\'t come this far to fall now.' }
            ]
        },
        {
            id: 'crystal_align',
            x: 15, y: 16, w: 1, h: 1,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'You place your hand on the central Aerolith Crystal. It hums, and the floating islands begin to stabilize.' },
                { speaker: 'Lulu', text: 'The path is steadying. The Citadel is within reach.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 15, y: 5 },
        label: 'Defeat the Storm Sentinel',
        completeMsg: '✦ The Sentinel has fallen. The path to the Void Citadel is clear.',
    },
    voiceLines: {
        ambient: [
            { char: 'Aya', color: '#7dd3fc', text: 'The silence here... it feels heavy.' },
            { char: 'Rei', color: '#4ade80', text: 'Don\'t look down. Just look ahead.' }
        ]
    }
};

