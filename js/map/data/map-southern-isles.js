/**
 * map-southern-isles.js — Southern Isles side map data.
 */

MAP_DEFS.southern_isles = {
    id: 'southern_isles',
    name: 'Southern Isles',
    width: 30,
    height: 30,
    playerStart: { x: 15, y: 5 },
    bgColor: '#0a1a1a',
    ambientLight: 'rgba(60,200,180,0.05)',
    weather: 'rain',
    enemyLevelRange: [25, 35],
    encounterTemplates: [
        { weight: 3, enemies: ['crab'] },
        { weight: 2, enemies: ['merman'] },
        { weight: 1, enemies: ['crab', 'merman'] }
    ],
    enemies: [
        { id: 'crab',   x: 10, y: 15, patrol: 'random', range: 4, speed: 0.6 },
        { id: 'merman', x: 20, y: 20, patrol: 'horizontal', range: 5, speed: 1.2 },
        { id: 'void_warden', x: 15, y: 15, patrol: 'random', range: 6, speed: 1.5, isBoss: true, label: 'Sunken Leviathan' },
        { id: 'merman', x: 5,  y: 25, patrol: 'vertical', range: 4, speed: 1.3 },
        { id: 'crab',   x: 25, y: 5,  patrol: 'random', range: 5, speed: 0.7 }
    ],
    tiles: (function () {
        const rows = [];
        const W = 30, H = 30;
        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(3); // Deep Water
            for (let x = 0; x < W; x++) {
                // 1. Coral Reefs (Central Area)
                const distToCenter = Math.sqrt((x - 15) ** 2 + (y - 15) ** 2);
                if (distToCenter < 6) {
                    if (Math.random() < 0.3) row[x] = 11; // Coral (using flower tile)
                    else if (Math.random() < 0.2) row[x] = 10; // Sand bank
                    continue;
                }

                // 2. The Abyssal Gate (Deep South)
                if (x >= 14 && x <= 16 && y >= 24 && y <= 26) {
                    row[x] = 17; // Obsidian Wall
                    if (x === 15 && y === 25) row[x] = 0; // The Gate opening (Void)
                    continue;
                }

                // 3. Starting Island & Bridge (Walkable)
                if (x >= 14 && x <= 16 && y <= 15) {
                    row[x] = 18; // Shallow water path
                    if (y <= 6) row[x] = 10; // Starting sand bank
                    continue;
                }

                // 4. Scattered Islands
                if (Math.random() < 0.08) row[x] = 10; // Sand
                if (Math.random() < 0.04) row[x] = 1;  // Grass
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'survivor', x: 5, y: 5, dialogueKey: 'survivor_plea', behavior: 'stationary' },
        { id: 'guardian', x: 15, y: 12, dialogueKey: 'guardian_test', behavior: 'stationary' }
    ],
    triggers: [
        {
            id: 'trench_dialogue',
            x: 12, y: 22, w: 6, h: 2,
            type: 'dialogue',
            lines: [
                { speaker: 'Lulu', text: 'The water... it\'s turning black. I can\'t see the bottom anymore.' },
                { speaker: 'Rex', text: 'The Abyssal Trench. This is where the world forgets its name.' }
            ]
        },
        {
            id: 'shell_find',
            x: 5, y: 25, w: 2, h: 2,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'Half-buried in the sand, you find a massive, spiraling shell that hums with the rhythm of the tides.' },
                { speaker: 'Ria', text: 'The Tide-Caller Shell. With this, we can command the gateway to open.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 15, y: 25 },
        label: 'Open the Abyssal Gate',
        completeMsg: '✦ The Abyssal Gate has resonated. The depths await.',
    },
    voiceLines: {
        ambient: [
            { char: 'Ria', color: '#a78bfa', text: 'The eidolons of the deep are restless.' },
            { char: 'Rex', color: '#fcd34d', text: 'A king rules the land, but only a fool tries to rule the sea.' }
        ]
    }
};

