/**
 * map-riverlands-crossing.js — Riverlands Crossing side map data.
 */

MAP_DEFS.riverlands_crossing = {
    id: 'riverlands_crossing',
    name: 'Riverlands Crossing',
    width: 30,
    height: 30,
    playerStart: { x: 5, y: 15 },
    bgColor: '#051a1a',
    ambientLight: 'rgba(60,180,180,0.05)',
    weather: 'rain',
    enemyLevelRange: [25, 35],
    encounterTemplates: [
        { weight: 3, enemies: ['bandit'] },
        { weight: 2, enemies: ['wisp'] },
        { weight: 1, enemies: ['bandit', 'bandit', 'bandit'] }
    ],
    enemies: [
        { id: 'bandit', x: 10, y: 8,  patrol: 'horizontal', range: 4, speed: 1.0 },
        { id: 'bandit', x: 22, y: 18, patrol: 'random', range: 3, speed: 1.1 },
        { id: 'wisp',   x: 14, y: 4,  patrol: 'vertical', range: 5, speed: 1.5 },
        { id: 'bandit', x: 25, y: 22, patrol: 'random', range: 4, speed: 1.0 },
        { id: 'wisp',   x: 18, y: 26, patrol: 'horizontal', range: 6, speed: 1.6 },
        { id: 'wyvern', x: 14, y: 14, patrol: 'stationary', isBoss: true, label: 'River King' }
    ],
    tiles: (function () {
        const rows = [];
        const W = 30, H = 30;
        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(1); // Grass
            for (let x = 0; x < W; x++) {
                // 1. Forest Borders
                if (x < 3 || x > 27 || y < 3 || y > 27) {
                    if (Math.random() < 0.6) row[x] = 5; // Forest
                    continue;
                }

                // 2. The Great River (Vertical)
                if (x >= 12 && x <= 17) {
                    // River Banks
                    if (x === 12 || x === 17) {
                        row[x] = 10; // Sand
                    } else {
                        // The Bridge
                        if (y >= 13 && y <= 16) {
                            if (Math.random() < 0.1) row[x] = 111; // Rubble on bridge
                            else row[x] = 4; // Bridge surface
                        } else {
                            row[x] = 3; // Water
                        }
                    }
                    continue;
                }

                // 3. Paths
                if (y >= 14 && y <= 15) {
                    if (x < 12 || x > 17) row[x] = 2; // Dirt road
                    continue;
                }

                // 4. Scattered Rocks and Flowers
                if (Math.random() < 0.05) row[x] = 11; // Flowers
                if (Math.random() < 0.02) row[x] = 6;  // Small boulders
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'merchant', x: 8, y: 13, dialogueKey: 'river_merchant', behavior: 'stationary' },
        { id: 'old_guard', x: 11, y: 14, dialogueKey: 'bridge_guard', behavior: 'stationary' },
        { id: 'ghost_soldier', x: 18, y: 15, dialogueKey: 'ghost_chat', behavior: 'wander', range: 2 }
    ],
    triggers: [
        {
            id: 'bridge_inspect',
            x: 12, y: 13, w: 1, h: 4,
            type: 'dialogue',
            lines: [
                { speaker: 'Aya', text: 'The structural integrity is failing. The Void has eaten into the stone itself.' },
                { speaker: 'Tao', text: 'And that... "thing" guarding the center doesn\'t look like it wants visitors.' },
                { speaker: 'Rei', text: 'The River King. A guardian of the old crossing, now just a vessel for shadow.' }
            ]
        },
        {
            id: 'hidden_cache',
            x: 27, y: 4, w: 2, h: 2,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'You find an old supply crate hidden beneath the roots of a massive tree.' },
                { speaker: 'Lulu', text: 'Still sealed. Let\'s see what\'s inside.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 28, y: 15 },
        label: 'Secure the Crossing',
        completeMsg: '✦ The River King has been pacified. The crossing is secure.',
    },
    voiceLines: {
        ambient: [
            { char: 'Lulu', color: '#2dd4bf', text: 'The river sounds angry today. Can you hear the spirits?' },
            { char: 'Rei', color: '#4ade80', text: 'Ambush spots everywhere. Eyes open.' }
        ]
    }
};

