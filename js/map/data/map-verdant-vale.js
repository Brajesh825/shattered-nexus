/**
 * map-verdant-vale.js — Verdant Vale map data.
 * UPGRADED: Architect Pro 3-Layer Format
 * This version preserves all original procedural logic but organizes it into L0 (Floor), L1 (Decor), and L2 (Overhead).
 */

MAP_DEFS.verdant_vale = {
    id: 'verdant_vale',
    name: 'Verdant Vale',
    arcId: 1,
    width: 60,
    height: 60,
    safeZones: [
        { xMin: 0, xMax: 30, yMin: 0, yMax: 60, name: "Sacred West" }
    ],
    playerStart: { x: 7, y: 10 },
    bgColor: '#0a1a05',
    bgm: 'vale_explore',
    battleBgm: 'vale_battle',
    battleBg: 'verdant_vale',
    ambientLight: 'rgba(60,180,60,0.04)',
    weather: 'leaves',
    enemyLevelRange: [3, 8],
    mutationConfig: {
        corruptThreshold: 90,
        mutantThreshold: 180,
        corruptChance: 0.020,
        mutantChance: 0.010,
    },

    encounterTemplates: [
        { weight: 3, enemies: ['goblin'] },
        { weight: 3, enemies: ['wolf'] },
        { weight: 2, enemies: ['zombie_soldier'] },
        { weight: 2, enemies: ['bat', 'bat'] },
        { weight: 2, enemies: ['zombie_soldier', 'wolf'] },
        { weight: 2, enemies: ['spider', 'spider'] },
        { weight: 1, enemies: ['goblin', 'goblin', 'zombie_soldier'] },
        { weight: 1, enemies: ['wolf', 'spider', 'bat'] },
        { weight: 1, enemies: ['zombie_soldier', 'zombie_soldier', 'wolf'] },
    ],

    enemies: [
        { id: 'bat', x: 34, y: 13, patrol: 'vertical', range: 3, speed: 1.8 },
        { id: 'wolf', x: 42, y: 22, patrol: 'random', range: 4, speed: 1.4 },
        { id: 'zombie_soldier', x: 40, y: 18, patrol: 'horizontal', range: 3, speed: 0.8 },
        { id: 'goblin', x: 48, y: 6, patrol: 'random', range: 2, speed: 1.1 },
        { id: 'galdor_king', x: 52, y: 54, patrol: 'horizontal', range: 2, speed: 0.9, isBoss: true, level: 6 }
    ],

    jsonFile: 'js/map/data/map-verdant-vale.json',

    npcs: [
        {
            id: 'azure_commander', x: 29, y: 13, dialogueKey: 'verdant_vale',
            behavior: 'stationary', hideIfUnlocked: 'sera',
            hideAfterScene: 'azure_intro',
        },
        {
            id: 'azure_commander', x: 29, y: 13, dialogueKey: 'verdant_vale_return',
            behavior: 'stationary', hideIfUnlocked: 'sera',
            showAfterScene: 'azure_intro',
        },
        { id: 'essabella', x: 44, y: 22, dialogueKey: 'verdant_vale', behavior: 'wander', range: 3, activePhases: ['dawn', 'noon', 'dusk'] },
        { id: 'elder_maren', x: 6, y: 8, dialogueKey: 'verdant_vale', behavior: 'stationary', giveQuest: 'goblin_menace', activePhases: ['dawn', 'noon', 'dusk'] },
        { id: 'soldier_1', x: 23, y: 8, dialogueKey: 'verdant_vale', behavior: 'patrol', waypoints: [{ x: 23, y: 8 }, { x: 26, y: 10 }] },
        { id: 'soldier_2', x: 15, y: 6, dialogueKey: 'verdant_vale', behavior: 'stationary' },
        { id: 'soldier_3', x: 17, y: 15, dialogueKey: 'verdant_vale', behavior: 'patrol', waypoints: [{ x: 17, y: 15 }, { x: 17, y: 12 }] },
        { id: 'lira', x: 8, y: 7, dialogueKey: 'verdant_vale', behavior: 'wander', range: 2, activePhases: ['dawn', 'noon', 'dusk'] },
        { id: 'ruin_closure', x: 53, y: 29, dialogueKey: 'verdant_vale', showIfMapCleared: 'verdant_vale', behavior: 'stationary' },
        { id: 'dying_royal_guard', x: 46, y: 15, dialogueKey: 'verdant_vale', behavior: 'stationary', giveQuest: 'the_hollow_guard' },
        { id: 'galdor_decree_stone', x: 50, y: 50, dialogueKey: 'verdant_vale', behavior: 'stationary' },
        { id: 'squad_insignia', x: 36, y: 38, dialogueKey: 'verdant_vale', behavior: 'stationary', showOnlyDuringQuest: 'the_hollow_guard' },
        { id: 'squad_insignia', x: 34, y: 53, dialogueKey: 'verdant_vale', behavior: 'stationary', showOnlyDuringQuest: 'the_hollow_guard' },
        { id: 'squad_insignia', x: 45, y: 54, dialogueKey: 'verdant_vale', behavior: 'stationary', showOnlyDuringQuest: 'the_hollow_guard' },
        { id: 'squad_insignia', x: 52, y: 46, dialogueKey: 'verdant_vale', behavior: 'stationary', showOnlyDuringQuest: 'the_hollow_guard' },
        { id: 'silver_locket', x: 55, y: 18, dialogueKey: 'verdant_vale', behavior: 'stationary', showOnlyDuringQuest: 'locket_lost' }
    ],

    scenes: [
        {
            id: 'azure_intro',
            once: true,
            npcId: 'azure_commander',
            trigger: { x: 24, y: 12, w: 4, h: 5 },
            acts: [
                { type: 'wait', ms: 400 },
                { type: 'npc_walk', facePlayer: true },
                { type: 'wait', ms: 280 },
                {
                    type: 'dialogue',
                    lines: [
                        { speaker: 'Azure Commander', text: 'Hold.' },
                        { speaker: 'Aya', text: 'Who—' },
                        { speaker: 'Azure Commander', text: 'You carry no banner. That means you are either very brave or very lost.' },
                        { speaker: 'Tao', text: 'We are looking for the ruins. To the east.' },
                        { speaker: 'Azure Commander', text: 'I know. I have been watching you since you crossed the river bend.' },
                        { speaker: 'Azure Commander', text: 'The eastern road is not—' },
                    ]
                },
                {
                    type: 'ambush',
                    npcId: 'azure_commander',
                    dir: 'right',
                    preMsg: '⚔ Void-touched pour from the eastern wood!',
                    marchMs: 1400,
                    waves: [
                        {
                            enemies: ['zombie_soldier', 'zombie_soldier', 'goblin'],
                            preMsg: '⚔ Wave 1 — Void-touched surge toward the bridge!',
                            interWaveMsg: '✦ First wave broken — more incoming!',
                        },
                        {
                            enemies: ['zombie_soldier', 'zombie_soldier', 'wolf', 'bat'],
                        },
                    ],
                    allClearMsg: '✦ The bridge holds.',
                },
                {
                    type: 'dialogue',
                    lines: [
                        { speaker: 'Azure Commander', text: 'That was not the worst they can send.' },
                        { speaker: 'Aya', text: 'No. But it is the worst they sent tonight.' },
                        { speaker: 'Azure Commander', text: 'You fight well for people who do not know the Vale. I owe you the rest of what I know about the eastern road.' },
                        { speaker: 'Azure Commander', text: 'The ruins lie ahead, but do not look to the southern groves. King Galdor has fallen to the Void-Gild. The south is lost to his greed.' },
                        { speaker: 'Azure Commander', text: 'When you are ready for the ruins — I will be here.' },
                    ]
                },
                { type: 'npc_exit', target: { x: 29, y: 13 }, despawn: false },
            ],
        },
    ],

    triggers: [
        {
            id: 'azure_commander_ruins_gate',
            x: 48, y: 27, w: 4, h: 5,
            type: 'dialogue',
            lines: [
                { speaker: 'Azure Commander', text: 'Wait.' },
                { speaker: 'Azure Commander', text: 'The knight inside those ruins — before you face him, understand what you are ending. Six centuries of vigil. The last act of a man who chose silence over surrender.' },
                { speaker: 'Rei', text: 'You sound like you are asking us to stop.' },
                { speaker: 'Azure Commander', text: 'No. I am asking you to remember his name when it is over. Arren. He was called Arren.' },
                { speaker: 'Aya', text: 'We will remember.' },
                { speaker: 'Azure Commander', text: 'Then go. The road after this one is mine to walk.' },
            ]
        },
        {
            id: 'aethelgard_mystery',
            x: 36, y: 34, w: 4, h: 2,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'The grass gives way to jagged stone—not natural formations, but the bones of a city swallowed by the earth.' },
                { speaker: 'Lulu', text: 'It feels... heavy here. Like the air is made of lead.' },
                { speaker: 'narrator', text: 'A stifling weight of ancient gold hangs over the ruins. Somewhere within the labyrinth of stone, a rhythmic clinking of coins echoes against the wind.' },
                { speaker: 'Rei', text: 'I don\'t like this. These ruins shouldn\'t be here. They aren\'t on any map.' },
                { speaker: 'Aya', text: 'Stay close. Whatever lived here once... it hasn\'t left.' }
            ]
        }
    ],

    objective: {
        type: 'reach',
        target: { x: 53, y: 29 },
        label: 'Reach the Eastern Cave',
        completeMsg: '✦ You have reached the cave — the Seal Fragment awaits inside.',
    },

    fog: { delay: 30, peak: 150, max: 0.72, vision: 3.8 },

    voiceLines: {
        ambient: [
            { char: 'Aya', color: '#7dd3fc', text: 'The vale feels larger at dusk.' },
            { char: 'Tao', color: '#ef4444', text: 'Something rustles. Maybe just the wind.' },
            { char: 'Lulu', color: '#2dd4bf', text: 'I can hear the river somewhere ahead.' },
            { char: 'Rei', color: '#4ade80', text: 'Stay alert. This place is not as peaceful as it looks.' },
            { char: 'Azure Commander', color: '#3b82f6', text: 'The ruins breathe differently at night. Stay on the road.' },
            { char: 'Azure Commander', color: '#3b82f6', text: 'We have kept watch here for six generations. You are the first outsiders in years.' },
        ],
        fogRising: [
            { char: 'Rei', color: '#4ade80', text: 'A mist is rising. Keep moving.' },
            { char: 'Tao', color: '#ef4444', text: 'Oh good, ominous fog. My favorite.' },
            { char: 'Aya', color: '#7dd3fc', text: 'The light is fading. Stay together.' },
            { char: 'Lulu', color: '#2dd4bf', text: 'I can barely see past the treeline.' },
            { char: 'Azure Commander', color: '#3b82f6', text: 'The mist here is not natural. The void breathes it out. Move east.' },
        ],
        encounter: [
            { char: 'Rei', color: '#4ade80', text: 'Enemy — don\'t let them surround us!' },
            { char: 'Tao', color: '#ef4444', text: 'They came out of nowhere!' },
            { char: 'Aya', color: '#7dd3fc', text: 'Ambush — form up!' },
            { char: 'Lulu', color: '#2dd4bf', text: 'The fog — they were hiding in it!' },
        ],
    },
};
