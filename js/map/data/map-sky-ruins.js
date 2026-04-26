/**
 * map-sky-ruins.js — Sky Ruins side map data.
 */

MAP_DEFS.sky_ruins = {
    id: 'sky_ruins',
    name: 'Sky Ruins',
    width: 80,
    height: 40,
    playerStart: { x: 40, y: 38 },
    bgColor: '#04020a',
    ambientLight: 'rgba(150,50,250,0.12)',
    weather: 'mist',
    enemyLevelRange: [35, 43],
    encounterTemplates: [
        { weight: 2, enemies: ['void_knight'], mutation: 'corrupted' },
        { weight: 1, enemies: ['lich'], mutation: 'corrupted' },
        { weight: 1, enemies: ['dark_knight'], mutation: 'corrupted' }
    ],
    enemies: [
        // Roaming Guardians (Wide patrol, 100% walkable)
        { id: 'void_knight', x: 20, y: 20, patrol: 'random', range: 10, speed: 1.3, mutation: 'corrupted' },
        { id: 'void_knight', x: 60, y: 20, patrol: 'random', range: 10, speed: 1.3, mutation: 'corrupted' },
        { id: 'lich',        x: 40, y: 20, patrol: 'random', range: 8,  speed: 1.1, mutation: 'corrupted' },
        
        // THE FOUR BOSSES (In separate chambers, on walkable stone)
        { id: 'lich',        x: 10, y: 10, patrol: 'stationary', isBoss: true, label: 'The Pale King', mutation: 'corrupted' },
        { id: 'dark_knight', x: 70, y: 10, patrol: 'stationary', isBoss: true, label: 'The Ebon Champion', mutation: 'corrupted' },
        { id: 'bone_dragon', x: 40, y: 30, patrol: 'stationary', isBoss: true, label: 'The Skeletal Maw', mutation: 'corrupted' },
        { id: 'void_knight', x: 40, y: 5,  patrol: 'stationary', isBoss: true, label: 'Storm Sentinel', mutation: 'corrupted' }
    ],
    tiles: (function () {
        const rows = [];
        const W = 80, H = 40;
        const entityLocs = [
            {x:20,y:20},{x:60,y:20},{x:40,y:20}, // Nexus + roamers
            {x:10,y:10},{x:70,y:10},{x:40,y:30},{x:40,y:5}, // Bosses
            {x:40,y:38} // Spawn
        ];

        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(0); // The Void
            for (let x = 0; x < W; x++) {
                // 0. SAFETY ZONE (Cracked Stone - Always Walkable)
                const isSafe = entityLocs.some(loc => Math.abs(loc.x - x) <= 1 && Math.abs(loc.y - y) <= 1);
                if (isSafe) {
                    row[x] = 15;
                    continue;
                }

                // 1. THE FIVE CITADELS (Nexus + 4 Chambers)
                const chambers = [
                    {x: 40, y: 20, r: 12}, // CENTRAL NEXUS
                    {x: 10, y: 10, r: 12}, // WEST CHAMBER
                    {x: 70, y: 10, r: 12}, // EAST CHAMBER
                    {x: 40, y: 30, r: 10}, // SOUTH CHAMBER
                    {x: 40, y: 5,  r: 10}  // NORTH CHAMBER
                ];
                let inChamber = false;
                for (const ch of chambers) {
                    const d = Math.sqrt((x - ch.x) ** 2 + (y - ch.y) ** 2);
                    const jagged = Math.sin(x/4) * 1.5;
                    if (d < ch.r + jagged) {
                        row[x] = 15; // Cracked Stone (Main Floor)
                        if (d > ch.r + jagged - 2) row[x] = 106; // Cloud Edge
                        inChamber = true;
                        break;
                    }
                }
                if (inChamber) continue;

                // 2. THE ETHEREAL CORRIDORS (Spine)
                const isSpine = (
                    (Math.abs(x - 40) < 2 && y < 38) || // N-S Spine
                    (Math.abs(y - 20) < 2 && x > 10 && x < 70) || // Mid Horizontal
                    (Math.abs(y - 10) < 2 && x > 10 && x < 70) || // Top Horizontal
                    (Math.abs(x - 10) < 2 && y > 10 && y < 20) || // West connector
                    (Math.abs(x - 70) < 2 && y > 10 && y < 20)    // East connector
                );

                if (isSpine) {
                    row[x] = 4; // Wooden Bridge (Clean path)
                    continue;
                }
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'archivist', x: 42, y: 20, dialogueKey: 'archivist_lore', behavior: 'stationary' },
        { id: 'sentinel', x: 38, y: 38, dialogueKey: 'sentinel_oath', behavior: 'stationary' }
    ],
    triggers: [
        {
            id: 'citadel_nexus',
            x: 35, y: 18, w: 10, h: 4,
            type: 'dialogue',
            lines: [
                { speaker: 'Aya', text: 'This nexus... it connects to four separate chambers. I can feel a legendary presence in each.' },
                { speaker: 'Rex', text: 'A gauntlet of kings. We have to clear them all to reach the Aerolith.' }
            ]
        },
        {
            id: 'crystal_align',
            x: 38, y: 3, w: 4, h: 4,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'The Aerolith Crystal hums with power as the four kings fall. The sky begins to stabilize.' },
                { speaker: 'Lulu', text: 'The corruption is receding. We\'ve actually done it!' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 40, y: 5 },
        label: 'Defeat the Storm Sentinel',
        completeMsg: '✦ The Gauntlet is over. The Sky Ruins have been reclaimed.',
    },
    voiceLines: {
        ambient: [
            { char: 'Aya', color: '#7dd3fc', text: 'The four chambers... they each feel like a different era of history.' },
            { char: 'Rex', color: '#fbbf24', text: 'Focus. Don\'t let the champions catch you off guard in the corridors.' }
        ]
    }
};
