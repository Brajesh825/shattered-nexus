/**
 * map-southern-isles.js — Southern Isles side map data.
 */

MAP_DEFS.southern_isles = {
    id: 'southern_isles',
    name: 'Southern Isles',
    width: 120,
    height: 80,
    playerStart: { x: 60, y: 65 },
    bgColor: '#081a08',
    ambientLight: 'rgba(50,200,100,0.1)',
    weather: 'rain',
    safeZones: [
        { xMin: 21, xMax: 103, yMin: 36, yMax: 56, name: 'Survivor Settlement' }
    ],
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
        { id: 'naga',   x: 30, y: 32, patrol: 'random',     range: 7,  speed: 1.2 },
        { id: 'naga',   x: 90, y: 32, patrol: 'random',     range: 7,  speed: 1.2 },
        { id: 'naga',   x: 55, y: 28, patrol: 'random',     range: 5,  speed: 1.1 },
        // --- DOCK GUARDIANS ---
        { id: 'crab',   x: 60, y: 30, patrol: 'horizontal', range: 18, speed: 0.6 },
        { id: 'naga',   x: 18, y: 20, patrol: 'vertical',   range: 10, speed: 1.3 },
        { id: 'naga',   x: 102, y: 20, patrol: 'vertical',  range: 10, speed: 1.3 },
        // --- MAP BOSS ---
        { id: 'sunken_leviathan', x: 60, y: 4,  patrol: 'stationary', isBoss: true, label: 'Sunken Leviathan' }
    ],
    jsonFile: 'js/map/data/map-southern-isles.json',
    
    bgm: 'isles_explore',
    battleBgm: 'isles_battle',
    bossBgm: 'leviathan_theme',
    
    npcs: [
        // ── PRIMARY STORY CONTACT ─────────────────────────────────
        { id: 'survivor',     x: 65, y: 65, dialogueKey: 'southern_isles',         behavior: 'stationary', name: 'Survivor' },

        // ── SETTLEMENT NPCs ───────────────────────────────────────
        { id: 'si_elder',     x: 55, y: 45, dialogueKey: 'southern_isles',         behavior: 'stationary', giveQuest: 'naga_threat' },
        { id: 'si_healer',    x: 62, y: 46, dialogueKey: 'southern_isles',         behavior: 'stationary' },
        { id: 'si_builder',   x: 48, y: 50, dialogueKey: 'southern_isles',         behavior: 'stationary' },
        { id: 'market_ghost', x: 60, y: 52, dialogueKey: 'southern_isles',         behavior: 'stationary' },

        // ── SCATTERED SURVIVORS (same NPC_DEFS entry, different dialogueKey + name label) ──
        { id: 'survivor',     x: 22, y: 48, dialogueKey: 'southern_isles_fisher',  behavior: 'stationary', name: 'Fisherman' },
        { id: 'survivor',     x: 85, y: 40, dialogueKey: 'southern_isles_lookout', behavior: 'stationary', name: 'Lookout' },
        { id: 'survivor',     x: 50, y: 58, dialogueKey: 'southern_isles_child',   behavior: 'stationary', name: 'Child' },

        // ── GATE KEEPER ───────────────────────────────────────────
        { id: 'guardian',     x: 60, y: 15, dialogueKey: 'southern_isles',         behavior: 'stationary' }
    ],
    triggers: [
        {
            id: 'trench_dialogue',
            x: 10, y: 28, w: 100, h: 4,
            type: 'dialogue',
            lines: [
                { speaker: 'Lulu', text: 'The swamp is breathing... I can hear the Naga singing in the reeds.' },
                { speaker: 'Rex', text: 'Steady. The Leviathan sleeps below. Don\'t wake the master of the trench.' }
            ]
        },
        {
            id: 'leviathan_wake',
            x: 45, y: 18, w: 30, h: 5,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'The wooden platforms groan as the Sunken Leviathan begins to surface.' },
                { speaker: 'Ria', text: 'Get ready! The Abyssal Gate is opening!' }
            ]
        },
        {
            id: 'leviathan_approach',
            x: 50, y: 10, w: 20, h: 5,
            type: 'dialogue',
            lines: [
                { speaker: 'Rex', text: 'The Survivor said there is still a bell tower down there that rings at high tide. Something in the architecture remembers what it was for.' },
                { speaker: 'Rei', text: 'The Leviathan was drawn by that resonance. Not by malice.' },
                { speaker: 'Lulu', text: 'A creature that came to a place because it felt like home. And then got trapped there by someone who needed an anchor.' },
                { speaker: 'Rex', text: 'Let\'s free it. And give the bell something to ring for.' }
            ]
        },
        {
            // ── BOSS TRIGGER: Abyssal Gate ──────────────────────────
            // Player steps ON the Abyssal Gate tile (402) at y=12 → fight launches.
            // Trigger rect sits at y=11-13, centered on x=55-64 (gate footprint).
            id: 'abyssal_gate_boss',
            x: 54, y: 11, w: 12, h: 3,
            type: 'encounter',
            isBoss: true,
            enemies: ['sunken_leviathan'],
            preMsg: '⚠ The Abyssal Gate trembles. Something vast stirs below…'
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 60, y: 4 },
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

