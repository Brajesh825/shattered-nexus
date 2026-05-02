/**
 * map-southern-isles.js — Southern Isles side map data.
 */

MAP_DEFS.southern_isles = {
    id: 'southern_isles',
    name: 'Southern Isles',
    width: 80,
    height: 40,
    playerStart: { x: 40, y: 36 },
    bgColor: '#081a08',
    ambientLight: 'rgba(50,200,100,0.1)',
    weather: 'rain',
    enemyLevelRange: [10, 18],
    encounterTemplates: [
        { weight: 4, enemies: ['naga', 'naga'] },
        { weight: 3, enemies: ['crab'] },
        { weight: 2, enemies: ['naga', 'crab'] },
        { weight: 2, enemies: ['merman'] },
        { weight: 1, enemies: ['naga', 'naga', 'crab'] },
        { weight: 1, enemies: ['crab', 'merman'] },
        { weight: 1, enemies: ['merman', 'merman'] }
    ],
    enemies: [
        // --- STILT VILLAGE SENTINELS ---
        { id: 'naga',   x: 20, y: 30, patrol: 'random',     range: 5,  speed: 1.2 },
        { id: 'naga',   x: 60, y: 30, patrol: 'random',     range: 5,  speed: 1.2 },
        // --- DOCK GUARDIANS ---
        { id: 'crab',   x: 40, y: 25, patrol: 'horizontal', range: 10, speed: 0.6 },
        { id: 'naga',   x: 15, y: 15, patrol: 'vertical',   range: 8,  speed: 1.3 },
        // --- MAP BOSS ---
        { id: 'sunken_leviathan', x: 40, y: 8,  patrol: 'stationary', isBoss: true, label: 'Sunken Leviathan' }
    ],
    tiles: 'js/map/data/map-southern-isles.json',
    npcs: [
        { id: 'survivor', x: 45, y: 36, dialogueKey: 'southern_isles', behavior: 'stationary' },
        { id: 'guardian', x: 40, y: 18, dialogueKey: 'southern_isles', behavior: 'stationary' }
    ],
    triggers: [
        {
            id: 'trench_dialogue',
            x: 10, y: 22, w: 60, h: 4,
            type: 'dialogue',
            lines: [
                { speaker: 'Lulu', text: 'The swamp is breathing... I can hear the Naga singing in the reeds.' },
                { speaker: 'Rex', text: 'Steady. The Leviathan sleeps below. Don\'t wake the master of the trench.' }
            ]
        },
        {
            id: 'leviathan_wake',
            x: 35, y: 12, w: 10, h: 4,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'The wooden platforms groan as the Sunken Leviathan begins to surface.' },
                { speaker: 'Ria', text: 'Get ready! The Abyssal Gate is opening!' }
            ]
        },
        {
            id: 'leviathan_approach',
            x: 36, y: 9, w: 8, h: 4,
            type: 'dialogue',
            lines: [
                { speaker: 'Rex', text: 'The Survivor said there is still a bell tower down there that rings at high tide. Something in the architecture remembers what it was for.' },
                { speaker: 'Rei', text: 'The Leviathan was drawn by that resonance. Not by malice.' },
                { speaker: 'Lulu', text: 'A creature that came to a place because it felt like home. And then got trapped there by someone who needed an anchor.' },
                { speaker: 'Rex', text: 'Let\'s free it. And give the bell something to ring for.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 40, y: 8 },
        label: 'Open the Abyssal Gate',
        completeMsg: '✦ From far below, faint and clear through the water, a bell rings. The sound carries up through the stilts and into your chest.',
    },
    voiceLines: {
        ambient: [
            { char: 'Ria', color: '#a78bfa', text: 'The eidolons of the deep are restless.' },
            { char: 'Rex', color: '#fcd34d', text: 'A king rules the land, but only a fool tries to rule the sea.' }
        ]
    }
};

