/**
 * map-lighthouse-isles.js — Lighthouse Isles side map data.
 */

MAP_DEFS.lighthouse_isles = {
    id: 'lighthouse_isles',
    name: 'Lighthouse Isles',
    width: 80,
    height: 40,
    playerStart: { x: 10, y: 35 },
    bgColor: '#051020',
    ambientLight: 'rgba(50,150,255,0.1)',
    weather: 'mist',
    enemyLevelRange: [25, 33],
    encounterTemplates: [
        { weight: 4, enemies: ['crab', 'crab'] },
        { weight: 3, enemies: ['merman'] },
        { weight: 2, enemies: ['crab', 'merman'] },
        { weight: 2, enemies: ['wisp'] },
        { weight: 1, enemies: ['merman', 'merman'] },
        { weight: 1, enemies: ['crab', 'crab', 'merman'] },
        { weight: 1, enemies: ['wisp', 'merman'] }
    ],
    enemies: [
        // --- COASTAL SENTINELS ---
        { id: 'crab',   x: 10, y: 30, patrol: 'random',     range: 5,  speed: 0.6 },
        { id: 'merman', x: 40, y: 30, patrol: 'horizontal', range: 10, speed: 1.2 },
        // --- OUTER ISLE PATROL ---
        { id: 'crab',   x: 70, y: 20, patrol: 'random',     range: 5,  speed: 0.6 },
        { id: 'merman', x: 20, y: 15, patrol: 'vertical',   range: 8,  speed: 1.3 },
        // --- MAP BOSS ---
        { id: 'abyssal_kraken', x: 40, y: 12, patrol: 'stationary', isBoss: true, label: 'Abyssal Kraken' }
    ],
    tiles: (function () {
        const rows = [];
        const W = 80, H = 40;
        const entityLocs = [
            {x:10,y:30},{x:40,y:30},{x:70,y:20},{x:20,y:15},{x:40,y:12}, // Enemies
            {x:12,y:36},{x:60,y:25} // NPCs
        ];

        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(3); // Deep Water (Background)
            for (let x = 0; x < W; x++) {
                // 0. SAFETY ZONE
                const isSafe = entityLocs.some(loc => Math.abs(loc.x - x) <= 1 && Math.abs(loc.y - y) <= 1);
                if (isSafe) {
                    row[x] = 10; // Sand
                    continue;
                }

                // 1. GENERATE ISLANDS (Clusters)
                const islands = [
                    {x: 10, y: 35, r: 8}, // Starting Isle
                    {x: 70, y: 20, r: 10}, // East Isle
                    {x: 15, y: 15, r: 9},  // West Isle
                    {x: 40, y: 12, r: 12}  // Central Lighthouse Isle
                ];

                let onIsland = false;
                for (const isle of islands) {
                    const dist = Math.sqrt((x - isle.x) ** 2 + (y - isle.y) ** 2);
                    if (dist < isle.r) {
                        row[x] = 10; // Sand
                        if (dist < isle.r * 0.7) row[x] = 1; // Grass
                        if (dist < isle.r * 0.4 && Math.random() < 0.2) row[x] = 68; // Ruins
                        onIsland = true;
                        break;
                    }
                }
                if (onIsland) continue;

                // 2. CONNECTING BRIDGES & SHALLOWS (The Maritime Spine)
                // We need a path that hits every island center
                // 10,35 (Start) -> 40,35 -> 40,12 (Center)
                // 15,15 (West) -> 40,15
                // 70,20 (East) -> 40,20

                // A. Main Vertical Access (The Meridian)
                if (Math.abs(x - 40) < 3 && y >= 10 && y <= 35) {
                    row[x] = (y < 25) ? 4 : 18; // Bridge to the north, sand to the south
                }

                // B. Path to Start (10,35)
                if (Math.abs(y - 35) < 3 && x >= 10 && x <= 40) {
                    row[x] = 18; // Sandbar to start
                }

                // C. Path to West (15,15)
                if (Math.abs(y - 15) < 3 && x >= 15 && x <= 40) {
                    row[x] = 21; // Shore/Boardwalk to West
                }

                // D. Path to East (70,20)
                if (Math.abs(y - 20) < 3 && x >= 40 && x <= 70) {
                    row[x] = 4; // Bridge to East
                }

                // E. Connecting Shallows for Sea Spirit (60, 25)
                if (Math.abs(x - 60) < 4 && y >= 20 && y <= 25) {
                    row[x] = 18;
                }

                // 3. REEF & DECOR
                if (Math.random() < 0.05) row[x] = 18; // Random shallow patches
                if (Math.random() < 0.01) row[x] = 22; // Foam/Reef
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'old_mariner', x: 12, y: 36, dialogueKey: 'lighthouse_isles', behavior: 'stationary' },
        { id: 'sea_spirit', x: 60, y: 25, dialogueKey: 'lighthouse_isles', behavior: 'wander', range: 3 }
    ],
    triggers: [
        {
            id: 'mist_dialogue',
            x: 5, y: 28, w: 70, h: 4,
            type: 'dialogue',
            lines: [
                { speaker: 'Aya', text: 'The mist is so thick... I can\'t even see the stars.' },
                { speaker: 'Old Mariner', text: 'That ain\'t mist, lass. That\'s the breath of the drowned.' }
            ]
        },
        {
            id: 'kraken_shadow',
            x: 35, y: 18, w: 10, h: 5,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'A massive shadow passes beneath the bridge. The ocean itself seems to breathe.' },
                { speaker: 'Tao', text: 'Please tell me that was a very large dolphin. A VERY large dolphin.' }
            ]
        },
        {
            id: 'abyssal_kraken_approach',
            x: 36, y: 13, w: 8, h: 5,
            type: 'dialogue',
            lines: [
                { speaker: 'Lulu', text: 'Oremis. The Sea Spirit told us — he wanted to heal people using the deep water\'s knowledge. That was real. That desire was real.' },
                { speaker: 'Aya', text: 'What is real does not stop being dangerous.' },
                { speaker: 'Lulu', text: 'No. But it means we owe it a clean ending, not just a fast one.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 40, y: 10 },
        label: 'Storm the Lighthouse',
        completeMsg: '✦ The lighthouse pulses once — bright, clear, and steady. For the first time in years, it is guiding something home.',
    },
    voiceLines: {
        ambient: [
            { char: 'Aya', color: '#7dd3fc', text: 'Listen... the waves are singing.' },
            { char: 'Tao', color: '#ef4444', text: 'I really, really hate boats. And water. And things that live in water.' }
        ]
    }
};

