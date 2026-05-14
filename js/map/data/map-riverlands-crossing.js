/**
 * map-riverlands-crossing.js — Riverlands Crossing side map data.
 */

MAP_DEFS.riverlands_crossing = {
    id: 'riverlands_crossing',
    name: 'Riverlands Crossing',
    width: 80,
    height: 40,
    playerStart: { x: 6, y: 27 },
    bgColor: '#020f12',
    bgm: 'riverlands_explore',
    battleBgm: 'riverlands_battle',
    battleBg: 'riverlands',
    ambientLight: 'rgba(50,150,180,0.1)',
    weather: 'rain',
    safeZones: [
        { xMin: 0, xMax: 10, yMin: 20, yMax: 35, name: 'Western Ledge Camp' }
    ],
    enemyLevelRange: [10, 20],
    encounterTemplates: [
        // Groups of 4 (Rare/Hard Encounters)
        { weight: 1, enemies: ['bandit', 'bandit', 'bandit', 'bandit'] },
        { weight: 1, enemies: ['merman', 'merman', 'wisp', 'harpy'] },
        { weight: 1, enemies: ['bandit', 'bandit', 'wisp', 'wisp'] },
        
        // Groups of 3
        { weight: 2, enemies: ['bandit', 'bandit', 'bandit'] },
        { weight: 1, enemies: ['merman', 'merman', 'wisp'] },
        { weight: 1, enemies: ['bandit', 'harpy', 'wisp'] },
        
        // Groups of 2
        { weight: 4, enemies: ['bandit', 'bandit'] },
        { weight: 3, enemies: ['merman', 'merman'] },
        { weight: 2, enemies: ['bandit', 'wisp'] },
        { weight: 2, enemies: ['merman', 'wisp'] },
        { weight: 1, enemies: ['wisp', 'wisp'] },
        { weight: 1, enemies: ['harpy', 'bandit'] },
        { weight: 1, enemies: ['merman', 'harpy'] },
        
        // Groups of 1
        { weight: 3, enemies: ['wisp'] },
        { weight: 2, enemies: ['harpy'] }
    ],
    enemies: [
        // --- BRIDGE SENTINELS ---
        { id: 'bandit', x: 11, y: 25,  patrol: 'horizontal', range: 4,  speed: 1.0 },
        { id: 'bandit', x: 70, y: 29,  patrol: 'random',     range: 3,  speed: 1.1 },
        // --- WATERFALL PATROL ---
        { id: 'wisp',   x: 24, y: 26,  patrol: 'vertical',   range: 8,  speed: 1.5 },
        { id: 'merman', x: 27, y: 28,  patrol: 'horizontal', range: 6,  speed: 1.2 },
        // --- CANYON CLIFFS ---
        { id: 'harpy',  x: 60, y: 25,  patrol: 'random',     range: 5,  speed: 1.4 },
        // --- MAP BOSS ---
        { id: 'river_king', x: 40, y: 27, patrol: 'stationary', isBoss: true, level: 20, label: 'River King' }
    ],
    jsonFile: 'js/map/data/map-riverlands-crossing.json',
    npcs: [
        { id: 'isle_merchant', x: 15, y: 25, dialogueKey: 'riverlands_crossing', behavior: 'stationary' },
        { id: 'old_guard', x: 9, y: 25, dialogueKey: 'riverlands_crossing', behavior: 'stationary' },
        { id: 'ghost_soldier', x: 75, y: 27, dialogueKey: 'riverlands_crossing', behavior: 'wander', range: 2 },
        { id: 'toll_bridge_marker', x: 34, y: 26, dialogueKey: 'riverlands_crossing', behavior: 'stationary' },
        { id: 'guilt_ridden_merchant', x: 30, y: 25, dialogueKey: 'riverlands_crossing', behavior: 'stationary', giveQuest: 'price_of_neutrality' },
        { id: 'cursed_idol', x: 22, y: 25, dialogueKey: 'riverlands_crossing', behavior: 'stationary' }
    ],
    triggers: [
        {
            id: 'exit_riverlands',
            x: 0, y: 26, w: 1, h: 4,
            type: 'teleport',
            targetMap: 'verdant_vale',
            targetX: 30, targetY: 50
        },
        {
            id: 'bridge_inspect',
            x: 35, y: 26, w: 10, h: 3,
            type: 'dialogue',
            lines: [
                { speaker: 'Aya', text: 'The Great Bridge spans the entire gorge. The roar of the waterfall is deafening.' },
                { speaker: 'Tao', text: 'If we fall, we\'re food for the Kraken. Stay center.' },
                { speaker: 'Rei', text: 'The River King sits on the keystone ahead. Nowhere to run.' }
            ]
        },
        {
            id: 'waterfall_roar',
            x: 20, y: 21, w: 40, h: 6,
            type: 'dialogue',
            lines: [
                { speaker: 'narrator', text: 'The deafening roar of the Great Cascade vibrates through the very bridge beneath your feet.' },
                { speaker: 'Lulu', text: 'It\'s beautiful... but one slip and we\'re history.' }
            ]
        },
        {
            id: 'river_king_approach',
            x: 38, y: 26, w: 4, h: 2,
            type: 'dialogue',
            lines: [
                { speaker: 'Aya', text: 'The Old Guard said it tried to stay neutral. That the corruption took it through the deal itself, not the malice.' },
                { speaker: 'Rex', text: 'A lesson for all of us. The choice to avoid choosing is still a choice.' },
                { speaker: 'Rei', text: 'Then we end what that choice made. And we remember why it went wrong.' }
            ]
        }
    ],
    objective: {
        type: 'reach',
        target: { x: 77, y: 27 },
        label: 'Cross the Great Expanse',
        completeMsg: '✦ The River King sinks back into the water. The crossing is quiet for the first time in years. The river sounds different without it.',
    },
    voiceLines: {
        ambient: [
            { char: 'Lulu', color: '#2dd4bf', text: 'The river sounds angry today. Can you hear the spirits?' },
            { char: 'Rei', color: '#4ade80', text: 'Ambush spots everywhere. Eyes open.' }
        ]
    }
};

