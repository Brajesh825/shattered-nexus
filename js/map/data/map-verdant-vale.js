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
    ambientLight: 'rgba(60,180,60,0.04)',
    weather: 'leaves',
    enemyLevelRange: [1, 8],
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
        { id: 'galdor_king', x: 52, y: 54, patrol: 'horizontal', range: 2, speed: 0.9, isBoss: true }
    ],

    jsonFile: 'js/map/data/map-verdant-vale.json',

    npcs: [
        { id: 'azure_commander', x: 29, y: 13, dialogueKey: 'verdant_vale', behavior: 'stationary', hideIfUnlocked: 'sera' },
        { id: 'essabella', x: 44, y: 22, dialogueKey: 'verdant_vale', behavior: 'wander', range: 3 },
        { id: 'elder_maren', x: 6, y: 8, dialogueKey: 'elder_maren', behavior: 'stationary' },
        { id: 'soldier_1', x: 23, y: 13, dialogueKey: 'soldier_chat', behavior: 'patrol', waypoints: [{ x: 23, y: 13 }, { x: 26, y: 13 }] },
        { id: 'soldier_2', x: 15, y: 6, dialogueKey: 'soldier_chat', behavior: 'stationary' },
        { id: 'soldier_3', x: 17, y: 15, dialogueKey: 'soldier_chat', behavior: 'patrol', waypoints: [{ x: 17, y: 15 }, { x: 17, y: 12 }] },
        { id: 'lira', x: 8, y: 7, dialogueKey: 'verdant_vale', behavior: 'wander', range: 2 },
    ],

    triggers: [
        {
            id: 'azure_commander_first_sight',
            x: 22, y: 10, w: 4, h: 5,
            type: 'dialogue',
            lines: [
                { speaker: 'Azure Commander', text: 'Hold.' },
                { speaker: 'Aya', text: 'Who—' },
                { speaker: 'Azure Commander', text: 'You carry no banner. That means you are either very brave or very lost.' },
                { speaker: 'Tao', text: 'We are looking for the ruins. To the east.' },
                { speaker: 'Azure Commander', text: 'I know. I have been watching you since you crossed the river bend. The eastern road is not safe — come to me before you go further.' },
            ]
        },
        {
            id: 'bridge_realization',
            x: 29, y: 13, w: 3, h: 3,
            type: 'dialogue',
            lines: [
                { speaker: 'Rei', text: 'Wait... do you feel that?' },
                { speaker: 'Tao', text: 'The air... it\'s heavy. And look at the stone. It\'s scorched.' },
                { speaker: 'Aya', text: 'Scorched by void, not fire. These aren\'t just ruins... everyone is already dead in here.' },
                { speaker: 'Lulu', text: 'Davan was right. The Void Knight didn\'t just pass through. He turned this place into a tomb.' },
                { speaker: 'Rei', text: 'Keep your guard up. Whatever did this is still around, and it\'s hungry.' },
            ]
        },
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
            x: 40, y: 34, w: 5, h: 2,
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
