/**
 * map-northern-highlands.js — Northern Highlands side map data.
 */

MAP_DEFS.northern_highlands = {
    id: 'northern_highlands',
    name: 'Northern Highlands',
    width: 80,
    height: 40,
    playerStart: { x: 40, y: 37 },
    bgColor: '#eef6fc',
    ambientLight: 'rgba(200,220,255,0.15)',
    weather: 'mist',
    enemyLevelRange: [35, 43],
    encounterTemplates: [
        { weight: 4, enemies: ['wolf', 'wolf'] },
        { weight: 3, enemies: ['harpy'] },
        { weight: 2, enemies: ['wolf', 'harpy'] },
        { weight: 2, enemies: ['cyclops'] },
        { weight: 1, enemies: ['harpy', 'harpy'] },
        { weight: 1, enemies: ['wolf', 'wolf', 'harpy'] },
        { weight: 1, enemies: ['cyclops', 'wolf'] }
    ],
    enemies: [
        // --- PEAK SENTINELS ---
        { id: 'harpy',  x: 15, y: 32, patrol: 'random',     range: 8,  speed: 1.6 },
        { id: 'harpy',  x: 65, y: 32, patrol: 'random',     range: 8,  speed: 1.6 },
        // --- PATH GUARDIANS ---
        { id: 'wolf',   x: 40, y: 35, patrol: 'random',     range: 5,  speed: 1.4 },
        { id: 'fire_elemental', x: 40, y: 15, patrol: 'vertical', range: 10, speed: 1.3, label: 'Sky-Drake' },
        // --- MAP BOSS ---
        { id: 'dragon', x: 40, y: 5,  patrol: 'stationary', isBoss: true, label: 'Shadow Dragon' }
    ],
    tiles: (function () {
        const rows = [];
        const W = 80, H = 40;
        const entityLocs = [
            {x:15,y:32},{x:65,y:32},{x:40,y:35},{x:10,y:22},{x:70,y:22},{x:40,y:15},{x:40,y:5},
            {x:35,y:36},{x:40,y:10}
        ];

        for (let y = 0; y < H; y++) {
            let row = new Array(W).fill(0); // START WITH VOID (SKY RIFTS)
            for (let x = 0; x < W; x++) {
                // 0. THE CENTRAL SPINE (Floating Land)
                // A narrow strip in the middle that winds slightly
                const spineX = 40 + Math.sin(y / 5) * 8;
                const distToSpine = Math.abs(x - spineX);
                
                if (distToSpine < 10) {
                    row[x] = 27; // Snow base
                    
                    // The Path
                    if (distToSpine < 3) row[x] = 2; // Dirt Path
                    
                    // Safety Zones
                    const isSafe = entityLocs.some(loc => Math.abs(loc.x - x) <= 1 && Math.abs(loc.y - y) <= 1);
                    if (isSafe) row[x] = 27;
                } else {
                    // 1. FLOATING SKY ELEMENTS
                    const noise = Math.sin(x / 4) * Math.cos(y / 4);
                    if (noise > 0.6) row[x] = 106; // Clouds
                    else if (noise > 0.5) row[x] = 109; // Wind Platform
                    else if (Math.random() < 0.005) row[x] = 6; // Tiny floating rock
                }

                // 2. THE SUMMIT ARENA
                if (y <= 8 && distToSpine < 15) {
                    row[x] = 27; 
                    if (distToSpine > 12) row[x] = 68; // Stone boundary
                }
            }
            rows.push(row);
        }
        return rows;
    })(),
    npcs: [
        { id: 'highland_monk', x: 42, y: 36, dialogueKey: 'northern_highlands', behavior: 'stationary' },
        { id: 'fallen_climber', x: 40, y: 10, dialogueKey: 'northern_highlands', behavior: 'stationary' }
    ],
    triggers: [
        {
            id: 'thin_air_trigger',
            x: 5, y: 25, w: 70, h: 3,
            type: 'dialogue',
            lines: [
                { speaker: 'Rei', text: 'The rifts on either side... one slip and we\'re falling forever.' },
                { speaker: 'Lulu', text: 'Breathe slowly. Don\'t look down. Just watch for the harpies.' }
            ]
        },
        {
            id: 'wind_gust',
            x: 5, y: 18, w: 70, h: 4,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'A powerful gale nearly knocks you off the Cloud-Spine.' },
                { speaker: 'Tao', text: 'Is it just me, or did the mountain just try to push us?' }
            ]
        },
        {
            id: 'shadow_dragon_approach',
            x: 30, y: 8, w: 20, h: 6,
            type: 'dialogue',
            lines: [
                { speaker: 'Rei', text: 'The Monk told us it absorbed void energy to survive when all the others faded. Six centuries of that. We need to understand what we are putting down — not just who is ordering us to do it.' },
                { speaker: 'Drake', text: 'Something that chose to endure by changing what it was. There is a kind of courage in that. Even if the result is this.' },
                { speaker: 'Aya', text: 'We acknowledge what it was. Then we end what it has become. That is all we can offer it.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 40, y: 4 },
        label: 'Slay the Shadow Dragon',
        completeMsg: '✦ The Shadow Dragon falls. The highland winds carry its passing — quieter now, and something close to settled.',
    },
    voiceLines: {
        ambient: [
            { char: 'Rei', color: '#4ade80', text: 'I can see the entire world from here. And all its scars.' },
            { char: 'Drake', color: '#60a5fa', text: 'The wind speaks of ancient battles fought in these clouds.' }
        ]
    }
};

