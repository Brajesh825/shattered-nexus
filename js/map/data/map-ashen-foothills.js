/**
 * map-ashen-foothills.js — Ashen Foothills side map data.
 */

MAP_DEFS.ashen_foothills = {
    id: 'ashen_foothills',
    name: 'Ashen Foothills',
    width: 30,
    height: 30,
    playerStart: { x: 15, y: 28 },
    bgColor: '#1a1005',
    ambientLight: 'rgba(200,80,40,0.06)',
    weather: 'ash',
    enemyLevelRange: [25, 35],
    encounterTemplates: [
        { weight: 3, enemies: ['imp'] },
        { weight: 2, enemies: ['zombie'] },
        { weight: 1, enemies: ['imp', 'imp'] }
    ],
    enemies: [
        { id: 'imp',    x: 8,  y: 22, patrol: 'random', range: 4, speed: 1.2 },
        { id: 'zombie', x: 22, y: 15, patrol: 'horizontal', range: 5, speed: 0.8 },
        { id: 'imp',    x: 15, y: 12, patrol: 'vertical', range: 3, speed: 1.3 },
        { id: 'fire_elemental', x: 25, y: 8, patrol: 'random', range: 4, speed: 1.1 },
        { id: 'dark_knight',  x: 15, y: 5,  patrol: 'stationary', isBoss: true, label: 'Molten Golem' }
    ],
    tiles: (function () {
        const rows = [];
        const W = 30, H = 30;
        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(14); // Scorched Earth
            for (let x = 0; x < W; x++) {
                // 1. Lava Rivers (Horizontal/Curved)
                if (y === 10 && x < 25) { row[x] = 13; continue; }
                if (y === 20 && x > 5)  { row[x] = 13; continue; }

                // 2. Basalt Labyrinth Walls
                const isWall = (x % 6 === 0 && y % 4 !== 0) || (y % 6 === 0 && x % 4 !== 0);
                if (isWall && x > 2 && x < 28 && y > 2 && y < 28) {
                    if (Math.random() < 0.8) row[x] = 17; // Obsidian Wall
                    continue;
                }

                // 3. Ember Pits
                if (Math.random() < 0.03) { row[x] = 16; continue; }

                // 4. Central Path
                if (x >= 14 && x <= 16) {
                    row[x] = 15; // Cracked Stone Path
                    continue;
                }
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'cursed_miner', x: 5, y: 25, dialogueKey: 'miner_chat', behavior: 'stationary' },
        { id: 'flame_spirit', x: 25, y: 5, dialogueKey: 'spirit_lore', behavior: 'wander', range: 3 }
    ],
    triggers: [
        {
            id: 'heat_warning',
            x: 14, y: 20, w: 3, h: 2,
            type: 'dialogue',
            lines: [
                { speaker: 'Tao', text: 'My boots are melting. Literally.' },
                { speaker: 'Aya', text: 'The air itself is burning. Stay away from the lava flows.' }
            ]
        },
        {
            id: 'labyrinth_entry',
            x: 14, y: 10, w: 3, h: 2,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'The path narrows into a jagged labyrinth of cooling obsidian.' },
                { speaker: 'Rei', text: 'Perfect. A maze made of volcanic glass. Just what we needed.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 15, y: 4 },
        label: 'Defeat the Molten Golem',
        completeMsg: '✦ The Golem has crumbled. The path to the wastes is clear.',
    },
    voiceLines: {
        ambient: [
            { char: 'Tao', color: '#ef4444', text: 'I smell sulfur. And regret.' },
            { char: 'Valka', color: '#fcd34d', text: 'The flames here hold memories of the old forge.' }
        ]
    }
};

