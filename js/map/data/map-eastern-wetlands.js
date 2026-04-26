/**
 * map-eastern-wetlands.js — Eastern Wetlands side map data.
 */

MAP_DEFS.eastern_wetlands = {
    id: 'eastern_wetlands',
    name: 'Eastern Wetlands',
    width: 30,
    height: 30,
    playerStart: { x: 5, y: 15 },
    bgColor: '#0a101a',
    ambientLight: 'rgba(60,180,100,0.06)',
    weather: 'mist',
    enemyLevelRange: [25, 35],
    encounterTemplates: [
        { weight: 3, enemies: ['mushroom'] },
        { weight: 2, enemies: ['spider'] },
        { weight: 1, enemies: ['mushroom', 'spider'] }
    ],
    enemies: [
        { id: 'mushroom', x: 15, y: 10, patrol: 'stationary' },
        { id: 'spider',   x: 20, y: 20, patrol: 'random', range: 3, speed: 1.1 },
        { id: 'abomination', x: 15, y: 15, patrol: 'random', range: 5, speed: 1.0, isBoss: true, label: 'Swamp Horror' },
        { id: 'mushroom', x: 5,  y: 5,  patrol: 'random', range: 4, speed: 0.8 },
        { id: 'spider',   x: 25, y: 25, patrol: 'horizontal', range: 6, speed: 1.2 }
    ],
    tiles: (function () {
        const rows = [];
        const W = 30, H = 30;
        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(1); // Grass
            for (let x = 0; x < W; x++) {
                // 1. Poisonous Swamp (Scattered Pools)
                if (Math.random() < 0.25) {
                    row[x] = 3; // Water/Swamp
                    continue;
                }

                // 2. Bioluminescent Flora
                if (Math.random() < 0.1) {
                    row[x] = 11; // Glowing flowers
                    continue;
                }

                // 3. Mud Patches
                if (Math.random() < 0.05) {
                    row[x] = 14; // Mud (Scorched earth)
                    continue;
                }

                // 4. Neon-Lit Path
                if (y >= 14 && y <= 16) {
                    row[x] = 2; // Dirt path
                    continue;
                }
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'mire_witch', x: 8, y: 8, dialogueKey: 'witch_alchemy', behavior: 'stationary' },
        { id: 'lost_soul', x: 22, y: 22, dialogueKey: 'ghost_plea', behavior: 'wander', range: 4 }
    ],
    triggers: [
        {
            id: 'spore_dialogue',
            x: 10, y: 15, w: 2, h: 4,
            type: 'dialogue',
            lines: [
                { speaker: 'Lulu', text: 'Don\'t breathe too deep. The spores... they make my head spin.' },
                { speaker: 'Tao', text: 'Already on it. I\'ve been holding my breath since we crossed the border.' }
            ]
        },
        {
            id: 'essence_collect',
            x: 15, y: 16, w: 1, h: 1,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'You carefully harvest a glowing cluster of spores from the center of the marsh.' },
                { speaker: 'Aya', text: 'Glow-Spore Essence. This will keep the poison at bay.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 28, y: 15 },
        label: 'Collect Glow-Spore Essence',
        completeMsg: '✦ The Essence is yours. The mire holds no more secrets.',
    },
    voiceLines: {
        ambient: [
            { char: 'Tao', color: '#ef4444', text: 'Something just touched my leg. I\'m not looking down.' },
            { char: 'Valka', color: '#fcd34d', text: 'The spirits of the marsh are quiet. Too quiet.' }
        ]
    }
};

