/**
 * map-northern-highlands.js — Northern Highlands side map data.
 */

MAP_DEFS.northern_highlands = {
    id: 'northern_highlands',
    name: 'Northern Highlands',
    width: 30,
    height: 30,
    playerStart: { x: 15, y: 25 },
    bgColor: '#101a10',
    ambientLight: 'rgba(180,180,180,0.05)',
    weather: 'mist',
    enemyLevelRange: [25, 35],
    encounterTemplates: [
        { weight: 3, enemies: ['wolf'] },
        { weight: 2, enemies: ['harpy'] },
        { weight: 1, enemies: ['wolf', 'wolf'] }
    ],
    enemies: [
        { id: 'wolf',   x: 5,  y: 5,  patrol: 'random', range: 5, speed: 1.4 },
        { id: 'wolf',   x: 25, y: 25, patrol: 'random', range: 5, speed: 1.4 },
        { id: 'harpy',  x: 10, y: 15, patrol: 'vertical', range: 6, speed: 1.6 },
        { id: 'harpy',  x: 20, y: 10, patrol: 'horizontal', range: 4, speed: 1.5 },
        { id: 'wyvern', x: 15, y: 5,  patrol: 'stationary', isBoss: true, label: 'Sky-Drake' }
    ],
    tiles: (function () {
        const rows = [];
        const W = 30, H = 30;
        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(1); // Grass
            for (let x = 0; x < W; x++) {
                // 1. Mountain Ranges
                if (x < 5 || x > 25 || y < 5) {
                    if (Math.random() < 0.7) row[x] = 6; // Mountain
                    continue;
                }

                // 2. Ancient Watchtowers
                if ((x === 6 && y === 10) || (x === 24 && y === 18)) {
                    row[x] = 68; // Stone wall
                    continue;
                }

                // 3. Flower Patches (Alpine Flora)
                if (Math.random() < 0.08) row[x] = 11;

                // 4. Central Climbing Path
                if (x >= 14 && x <= 16) {
                    row[x] = 2; // Dirt path
                    continue;
                }
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'highland_monk', x: 13, y: 12, dialogueKey: 'monk_wisdom', behavior: 'stationary' },
        { id: 'fallen_climber', x: 22, y: 20, dialogueKey: 'climber_ghost', behavior: 'stationary' }
    ],
    triggers: [
        {
            id: 'thin_air_trigger',
            x: 14, y: 20, w: 3, h: 2,
            type: 'dialogue',
            lines: [
                { speaker: 'Rei', text: 'My lungs... they feel like they\'re burning. The air is too thin.' },
                { speaker: 'Lulu', text: 'Breathe slowly. The mountain doesn\'t want us here.' }
            ]
        },
        {
            id: 'shrine_discovery',
            x: 15, y: 10, w: 2, h: 2,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'You discover a small, weathered shrine dedicated to the spirits of the wind.' },
                { speaker: 'Aya', text: 'A Highland Shrine. If we offer a prayer, the elements might favor us.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 15, y: 4 },
        label: 'Slay the Sky-Drake',
        completeMsg: '✦ The Sky-Drake has been grounded. The highlands are yours.',
    },
    voiceLines: {
        ambient: [
            { char: 'Rei', color: '#4ade80', text: 'I can see the entire world from here. And all its scars.' },
            { char: 'Drake', color: '#60a5fa', text: 'The wind speaks of ancient battles fought in these clouds.' }
        ]
    }
};

