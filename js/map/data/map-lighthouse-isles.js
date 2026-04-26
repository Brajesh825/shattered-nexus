/**
 * map-lighthouse-isles.js — Lighthouse Isles side map data.
 */

MAP_DEFS.lighthouse_isles = {
    id: 'lighthouse_isles',
    name: 'Lighthouse Isles',
    width: 30,
    height: 30,
    playerStart: { x: 8, y: 8 },
    bgColor: '#050a1a',
    ambientLight: 'rgba(60,100,200,0.05)',
    weather: 'mist',
    enemyLevelRange: [25, 35],
    encounterTemplates: [
        { weight: 3, enemies: ['crab'] },
        { weight: 2, enemies: ['wisp'] },
        { weight: 1, enemies: ['crab', 'wisp'] }
    ],
    enemies: [
        { id: 'crab',   x: 8,  y: 22, patrol: 'random', range: 3, speed: 0.5 },
        { id: 'wisp',   x: 22, y: 10, patrol: 'vertical', range: 6, speed: 1.6 },
        { id: 'shadow_wraith', x: 15, y: 15, patrol: 'horizontal', range: 5, speed: 1.2, isBoss: true, label: 'Ghost Ship' },
        { id: 'crab',   x: 5,  y: 5,  patrol: 'random', range: 4, speed: 0.6 },
        { id: 'wisp',   x: 25, y: 25, patrol: 'random', range: 5, speed: 1.4 }
    ],
    tiles: (function () {
        const rows = [];
        const W = 30, H = 30;
        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(3); // Deep Water
            for (let x = 0; x < W; x++) {
                // 1. Island Clusters
                const distToIsland1 = Math.sqrt((x - 8) ** 2 + (y - 8) ** 2);
                const distToIsland2 = Math.sqrt((x - 22) ** 2 + (y - 22) ** 2);
                const distToLighthouse = Math.sqrt((x - 15) ** 2 + (y - 15) ** 2);

                if (distToIsland1 < 4 || distToIsland2 < 4 || distToLighthouse < 3) {
                    row[x] = 10; // Sand bank
                    if (Math.random() < 0.4) row[x] = 1; // Grass patch
                    continue;
                }

                // 2. Shallow Water Bridges (Walkable)
                const onPathToLighthouse = (Math.abs(x - 15) < 2) || (Math.abs(y - 15) < 2);
                if (onPathToLighthouse) {
                    row[x] = 18; // Shallow water
                    continue;
                }
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'old_mariner', x: 7, y: 7, dialogueKey: 'mariner_tales', behavior: 'stationary' },
        { id: 'sea_spirit', x: 23, y: 23, dialogueKey: 'sea_wisdom', behavior: 'wander', range: 3 }
    ],
    triggers: [
        {
            id: 'mist_dialogue',
            x: 5, y: 15, w: 2, h: 4,
            type: 'dialogue',
            lines: [
                { speaker: 'Aya', text: 'The mist is so thick... I can\'t even see the stars.' },
                { speaker: 'Old Mariner', text: 'That ain\'t mist, lass. That\'s the breath of the drowned.' }
            ]
        },
        {
            id: 'compass_find',
            x: 15, y: 16, w: 1, h: 1,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'Tucked into a crevice of the lighthouse, you find a tarnished brass compass.' },
                { speaker: 'Aya', text: 'The Navigator\'s Compass. Now we can find our way through the storm.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 15, y: 14 },
        label: 'Enter the Lighthouse',
        completeMsg: '✦ The Lighthouse door creaks open. The path is set.',
    },
    voiceLines: {
        ambient: [
            { char: 'Aya', color: '#7dd3fc', text: 'Listen... the waves are singing.' },
            { char: 'Tao', color: '#ef4444', text: 'I really, really hate boats. And water. And things that live in water.' }
        ]
    }
};

