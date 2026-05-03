/**
 * map-riverlands-crossing.js — Riverlands Crossing side map data.
 */

MAP_DEFS.riverlands_crossing = {
    id: 'riverlands_crossing',
    name: 'Riverlands Crossing',
    width: 80,
    height: 40,
    playerStart: { x: 2, y: 27 },
    bgColor: '#020f12',
    ambientLight: 'rgba(50,150,180,0.1)',
    weather: 'rain',
    enemyLevelRange: [10, 18],
    encounterTemplates: [
        { weight: 4, enemies: ['bandit', 'bandit'] },
        { weight: 3, enemies: ['wisp'] },
        { weight: 2, enemies: ['bandit', 'wisp'] },
        { weight: 2, enemies: ['harpy'] },
        { weight: 1, enemies: ['bandit', 'bandit', 'bandit'] },
        { weight: 1, enemies: ['wisp', 'wisp'] },
        { weight: 1, enemies: ['harpy', 'bandit'] }
    ],
    enemies: [
        // --- BRIDGE SENTINELS ---
        { id: 'bandit', x: 10, y: 25,  patrol: 'horizontal', range: 4,  speed: 1.0 },
        { id: 'bandit', x: 70, y: 29,  patrol: 'random',     range: 3,  speed: 1.1 },
        // --- WATERFALL PATROL ---
        { id: 'wisp',   x: 40, y: 15,  patrol: 'vertical',   range: 8,  speed: 1.5 },
        { id: 'wisp',   x: 60, y: 32,  patrol: 'horizontal', range: 10, speed: 1.6 },
        // --- MAP BOSS ---
        { id: 'river_king', x: 40, y: 27, patrol: 'stationary', isBoss: true, label: 'River King' }
    ],
    tiles: (function () {
        const rows = [];
        const W = 80, H = 40;
        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(1); // Grass
            for (let x = 0; x < W; x++) {
                // 1. THE NORTHERN CANYON WALLS (Solid 100% - No gaps)
                if (y < 25) {
                    if (x < 20 || x > 60) {
                        row[x] = 6; // Solid Mountain
                        continue;
                    }
                }

                // 2. Forest Borders (Only for the southern half now)
                if (y >= 37 || (y >= 25 && (x < 2 || x > 77))) {
                    if (Math.random() < 0.8) row[x] = 5; // Forest
                    continue;
                }

                // 3. THE BRIDGE (Moved South)
                if (y >= 25 && y <= 29) {
                    const isGate = (x >= 30 && x <= 33) || (x >= 47 && x <= 50);
                    if (isGate) {
                        if (y === 25 || y === 29) row[x] = 68; // Stone wall
                        else row[x] = 73; // Stone floor
                    } else {
                        row[x] = 73; // Stone bridge surface
                        // Add stone railings
                        if (y === 25 || y === 29) {
                            if (x % 2 === 0) row[x] = 68;
                        }
                    }
                    continue;
                }

                // 4. THE GREAT CASCADE & RIVER
                if (x >= 20 && x <= 60) {
                    if (y <= 3) {
                        row[x] = 3; // Upper Reservoir
                    } else if (y === 4) {
                        row[x] = 6; // THE PRECIPICE
                        if (x % 5 > 0) row[x] = 22; // Waterfall drop
                    } else if (y >= 5 && y <= 15) {
                        // THE DROP
                        row[x] = (x % 5 > 0) ? 22 : 6; 
                    } else if (y >= 16 && y <= 20) {
                        // THE BASIN (Turbulent water + rocks)
                        row[x] = 22; 
                        if (Math.random() < 0.15) row[x] = 6; // rocks
                    } else if (x === 20 || x === 60) {
                        row[x] = 6; // Canyon rock banks
                        if (Math.random() < 0.3) row[x] = 202; // Overgrown shrubs on banks
                    } else {
                        row[x] = 3; // Lower River
                        if (x > 22 && x < 58 && Math.random() < 0.05) row[x] = 207; // Lilies
                    }
                    continue;
                }

                // 5. Secondary Paths (Only on southern half)
                if (y >= 25) {
                    if (x === 19 || x === 61) row[x] = 2;
                }

                // 6. Scattered Rocks and Overgrown Detail (Southern half)
                if (row[x] === 1) {
                   if (Math.random() < 0.08) row[x] = 205; // SVG Flower
                   else if (Math.random() < 0.04) row[x] = 202; // SVG Shrub
                   else if (Math.random() < 0.02) row[x] = 6;  // Small boulders
                }
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'merchant', x: 15, y: 25, dialogueKey: 'riverlands_crossing', behavior: 'stationary' },
        { id: 'old_guard', x: 2, y: 26, dialogueKey: 'riverlands_crossing', behavior: 'stationary' },
        { id: 'ghost_soldier', x: 75, y: 27, dialogueKey: 'riverlands_crossing', behavior: 'wander', range: 2 }
    ],
    triggers: [
        {
            id: 'bridge_inspect',
            x: 35, y: 26, w: 10, h: 3,
            type: 'dialogue',
            lines: [
                { speaker: 'Aya', text: 'The Great Bridge spans the entire gorge. The roar of the waterfall is deafening.' },
                { speaker: 'Tao', text: 'If we fall, we\'re food for the Kraken. Stay center.' },
                { speaker: 'Rei', text: 'The River King sits on the keystone ahead. Nowhere to run.' }
            ]
        },
        {
            id: 'waterfall_roar',
            x: 20, y: 21, w: 40, h: 4,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'The deafening roar of the Great Cascade vibrates through the very bridge beneath your feet.' },
                { speaker: 'Lulu', text: 'It\'s beautiful... but one slip and we\'re history.' }
            ]
        },
        {
            id: 'secret_grotto',
            x: 40, y: 2, w: 1, h: 2,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'You notice a faint path behind the crashing water...' },
                { speaker: 'Rei', text: 'A hidden grotto. Classic.' }
            ]
        },
        {
            id: 'river_king_approach',
            x: 38, y: 26, w: 4, h: 2,
            type: 'dialogue',
            lines: [
                { speaker: 'Aya', text: 'The Old Guard said it tried to stay neutral. That the corruption took it through the deal itself, not the malice.' },
                { speaker: 'Rex', text: 'A lesson for all of us. The choice to avoid choosing is still a choice.' },
                { speaker: 'Rei', text: 'Then we end what that choice made. And we remember why it went wrong.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 77, y: 27 },
        label: 'Cross the Great Expanse',
        completeMsg: '✦ The River King sinks back into the water. The crossing is quiet for the first time in years. The river sounds different without it.',
    },
    voiceLines: {
        ambient: [
            { char: 'Lulu', color: '#2dd4bf', text: 'The river sounds angry today. Can you hear the spirits?' },
            { char: 'Rei', color: '#4ade80', text: 'Ambush spots everywhere. Eyes open.' }
        ]
    }
};

