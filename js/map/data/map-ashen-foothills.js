/**
 * map-ashen-foothills.js — Ashen Foothills side map data.
 */

MAP_DEFS.ashen_foothills = {
    id: 'ashen_foothills',
    name: 'Ashen Foothills',
    width: 80,
    height: 40,
    playerStart: { x: 40, y: 37 },
    bgColor: '#120b02',
    ambientLight: 'rgba(200,60,20,0.1)',
    weather: 'ash',
    enemyLevelRange: [20, 28],
    encounterTemplates: [
        { weight: 3, enemies: ['imp'] },
        { weight: 2, enemies: ['fire_elemental'] },
        { weight: 1, enemies: ['imp', 'fire_elemental'] }
    ],
    enemies: [
        { id: 'imp',    x: 20, y: 35, patrol: 'random', range: 4, speed: 1.2 },
        { id: 'imp',    x: 60, y: 35, patrol: 'random', range: 4, speed: 1.2 },
        { id: 'fire_elemental', x: 40, y: 25, patrol: 'horizontal', range: 10, speed: 1.1 },
        { id: 'imp',    x: 12, y: 15, patrol: 'vertical', range: 5, speed: 1.3 },
        { id: 'fire_elemental', x: 68, y: 10, patrol: 'random', range: 4, speed: 1.1 },
        { id: 'molten_golem',  x: 40, y: 6,  patrol: 'stationary', isBoss: true, label: 'Molten Golem' }
    ],
    tiles: (function () {
        const rows = [];
        const W = 80, H = 40;
        const entityLocs = [
            {x:20,y:35},{x:60,y:35},{x:40,y:25},{x:12,y:15},{x:68,y:10},{x:40,y:6}, // Enemies
            {x:42,y:36},{x:40,y:8} // NPCs
        ];

        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(14); // Scorched Earth
            for (let x = 0; x < W; x++) {
                // 0. SAFETY ZONE (Always walkable near entities)
                const isSafe = entityLocs.some(loc => Math.abs(loc.x - x) <= 1 && Math.abs(loc.y - y) <= 1);
                if (isSafe) {
                    row[x] = 14; 
                    continue;
                }

                // 1. THE VOLCANO CANYON WALLS (Hard Boundary - Impassable)
                if (x < 10 || x > 70) {
                    row[x] = 17; // Solid Obsidian Wall
                    continue;
                }

                // 2. THE VOLCANO RIM (Northern Peak)
                if (y <= 5) {
                    if (x < 35 || x > 45) {
                        row[x] = 6; // Solid Mountain
                        continue;
                    }
                }

                // 3. THE OBSIDIAN SPINE (Winding Path)
                const pathX = 40 + Math.sin(y / 4) * 15;
                if (Math.abs(x - pathX) < 3) {
                    row[x] = 15; // Cracked Stone Path (Primary Road)
                    continue;
                }

                // 4. THE SHATTERED CHASM (Void Gaps & Scorched Earth)
                if (y > 5 && y < 35) {
                    const noise = Math.sin(x / 2.5) * Math.cos(y / 2.5);
                    if (noise > 0.4) {
                        row[x] = 0; // VOID (Holes)
                    } else if (noise > 0.1) {
                        row[x] = 13; // SMALL LAVA PATCH
                    } else if (noise > -0.3) {
                        row[x] = 14; // Scorched Earth (Main Land)
                    } else {
                        row[x] = 33; // Ash islands
                    }
                }

                // 5. Random Ember Pits (Impassable Hazards)
                if (row[x] === 14 || row[x] === 33) {
                   if (Math.random() < 0.05) row[x] = 16; // Ember Pit (Blocking)
                }
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'cursed_miner', x: 42, y: 36, dialogueKey: 'ashen_foothills', behavior: 'stationary' },
        { id: 'flame_spirit', x: 40, y: 8, dialogueKey: 'ashen_foothills', behavior: 'wander', range: 3 }
    ],
    triggers: [
        {
            id: 'heat_warning',
            x: 10, y: 32, w: 60, h: 3,
            type: 'dialogue',
            lines: [
                { speaker: 'Tao', text: 'The ground is glowing. My boots are actually smoking.' },
                { speaker: 'Aya', text: 'The Molten Core is ahead. Stay on the obsidian paths or we\'ll be ash in seconds.' }
            ]
        },
        {
            id: 'labyrinth_entry',
            x: 10, y: 15, w: 60, h: 5,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'The heat becomes unbearable as the path winds through the shattered canyon.' },
                { speaker: 'Rei', text: 'Look at the center. The Molten Golem is absorbing the core\'s energy.' }
            ]
        },
        {
            id: 'molten_golem_approach',
            x: 30, y: 10, w: 20, h: 6,
            type: 'dialogue',
            lines: [
                { speaker: 'Aya', text: 'The hammering is louder here. Whatever is at the center... it has been working without stopping.' },
                { speaker: 'Rei', text: 'The Flame Spirit told us the Forge Lords made something that could not be unmade. This is what permanent looks like without a purpose left to justify it.' },
                { speaker: 'Tao', text: 'We end it. Gently if we can. It is not the Golem\'s fault it outlasted everything it was built for.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 40, y: 5 },
        label: 'Storm the Molten Spire',
        completeMsg: '✦ The hammering has stopped. For the first time in centuries, the Ashen Foothills are quiet.',
    },
    voiceLines: {
        ambient: [
            { char: 'Tao', color: '#ef4444', text: 'I smell sulfur. And regret.' },
            { char: 'Valka', color: '#fcd34d', text: 'The flames here hold memories of the old forge.' }
        ]
    }
};

