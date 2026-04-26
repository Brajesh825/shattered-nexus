/**
 * map-eastern-wetlands.js — Eastern Wetlands side map data.
 */

MAP_DEFS.eastern_wetlands = {
    id: 'eastern_wetlands',
    name: 'Eastern Wetlands',
    width: 80,
    height: 40,
    playerStart: { x: 5, y: 20 },
    bgColor: '#0a100a',
    ambientLight: 'rgba(100,255,100,0.08)',
    weather: 'mist',
    enemyLevelRange: [30, 38],
    encounterTemplates: [
        { weight: 3, enemies: ['mushroom'] },
        { weight: 2, enemies: ['spider'] },
        { weight: 1, enemies: ['mushroom', 'spider'] }
    ],
    enemies: [
        { id: 'mushroom', x: 20, y: 15, patrol: 'random', range: 5, speed: 0.8 },
        { id: 'spider',   x: 40, y: 25, patrol: 'horizontal', range: 12, speed: 1.4 },
        { id: 'spider',   x: 60, y: 15, patrol: 'random', range: 5, speed: 1.2 },
        { id: 'mushroom', x: 25, y: 30, patrol: 'random', range: 6, speed: 0.9 },
        { id: 'abomination', x: 65, y: 10, patrol: 'stationary', isBoss: true, label: 'Flesh Abomination' }
    ],
    tiles: (function () {
        const rows = [];
        const W = 80, H = 40;
        const entityLocs = [
            {x:20,y:15},{x:40,y:25},{x:60,y:15},{x:25,y:30},{x:65,y:10},
            {x:10,y:20},{x:50,y:20}
        ];

        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(25); // Mud Base
            for (let x = 0; x < W; x++) {
                // 0. SAFETY ZONE (Always Gravel)
                const isSafe = entityLocs.some(loc => Math.abs(loc.x - x) <= 1 && Math.abs(loc.y - y) <= 1);
                if (isSafe) {
                    row[x] = 26; // Gravel
                    continue;
                }

                // 1. ORGANIC BORDERS (The Dense Thicket)
                if (x < 4 || x > W-5 || y < 4 || y > H-5) {
                    row[x] = 36; // Dense Jungle
                    if (Math.random() < 0.2) row[x] = 38; // Dead Trees
                    continue;
                }

                // 2. THE SHATTERED HIGHWAY (Gothic Winding Road)
                // A broken road that winds through the mire
                const pathY = 20 + Math.sin(x / 8) * 5 + Math.cos(x / 12) * 3;
                if (Math.abs(y - pathY) < 3) {
                    row[x] = 26; // Gravel base
                    if (Math.random() < 0.3) row[x] = 112; // Mossy stone
                    if (Math.random() < 0.1) row[x] = 114; // Broken floor
                    continue;
                }

                // 3. THE MIRE BLOBS (Toxic Pool Clusters)
                // We define specific coordinates for large, cohesive pools
                const poolCenters = [
                    {x: 25, y: 12, r: 9},
                    {x: 55, y: 28, r: 11},
                    {x: 40, y: 18, r: 7},
                    {x: 65, y: 10, r: 10} // Boss Pool
                ];
                let inPool = false;
                for (const pool of poolCenters) {
                    const dist = Math.sqrt((x - pool.x) ** 2 + (y - pool.y) ** 2);
                    if (dist < pool.r) {
                        row[x] = 19; // Swamp water
                        if (dist > pool.r - 2) row[x] = 39; // Glow spores at edge
                        inPool = true;
                        break;
                    }
                }
                if (inPool) continue;

                // 4. CLUSTERED DECOR (Variation)
                const clusterNoise = Math.sin(x/4) * Math.cos(y/4);
                if (clusterNoise > 0.5) row[x] = 28; // Tundra clusters
                if (clusterNoise < -0.6) row[x] = 112; // Scattered ruin clusters
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'mire_witch', x: 10, y: 20, dialogueKey: 'witch_alchemy', behavior: 'stationary' },
        { id: 'lost_soul', x: 50, y: 20, dialogueKey: 'ghost_plea', behavior: 'wander', range: 4 }
    ],
    triggers: [
        {
            id: 'spore_dialogue',
            x: 15, y: 15, w: 50, h: 10,
            type: 'dialogue',
            lines: [
                { speaker: 'Lulu', text: 'Don\'t breathe too deep. The spores... they make my head spin.' },
                { speaker: 'Tao', text: 'Already on it. I\'ve been holding my breath since we crossed the border.' }
            ]
        },
        {
            id: 'abomination_rise',
            x: 55, y: 5, w: 20, h: 10,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'A massive shape rises from the black mud. Stitched flesh groans with every movement.' },
                { speaker: 'Aya', text: 'It\'s... it\'s a nightmare made real. Get back!' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 65, y: 10 },
        label: 'Slay the Flesh Abomination',
        completeMsg: '✦ The Abomination has been put to rest. The mire is silent.',
    },
    voiceLines: {
        ambient: [
            { char: 'Tao', color: '#ef4444', text: 'Something just touched my leg. I\'m not looking down.' },
            { char: 'Valka', color: '#fcd34d', text: 'The spirits of the marsh are quiet. Too quiet.' }
        ]
    }
};

