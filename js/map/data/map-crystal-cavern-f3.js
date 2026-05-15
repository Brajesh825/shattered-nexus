/**
 * map-crystal-cavern-f3.js
 * FLOOR 3: THE FROZEN CORE
 * --- LORE: THE SUNKEN SANCTUM (FINAL FLOOR) ---
 * The absolute heart of the Ashveil Kingdom. The temperature here is sub-zero, 
 * kept frozen by the 'Resonance' that has turned to pure ice.
 * 
 * Sections:
 * 1. THE RUINED STACKS: The entry stacks, now guarded by the SPECTRAL GUARDIAN (South West).
 * 2. THE SUNKEN COMMONS: Ruined estates where the High Scholars lived.
 * 3. THE IMPERIAL SANCTUM: The Royal Palace.
 * 4. THE CRYSTAL HEART: The exit rift that leads to the Eastern Wilds.
 * 
 * Narrative: The Guardian holds the key to the deeper resonance, positioned in the South West to bar the path to the inner sanctum.
 */

MAP_DEFS.crystal_cavern_f3 = {
  id: 'crystal_cavern_f3',
  name: 'The Frozen Core',
  arcId: 2,
  width: 60,
  height: 60,
  playerStart: { x: 7, y: 30 },
  bgColor: '#010002',
  ambientLight: 'rgba(200, 150, 255, 0.1)', // Cold, imperial violet
  weather: 'fog',
  enemyLevelRange: [15, 18],
  jsonFile: 'js/map/data/map-crystal-cavern-f3.json',
  
  bgm: 'ice_paradise',
  battleBgm: 'icy_ruins',
  battleBg: 'cavern_f3',

  mutationConfig: {
    corruptThreshold: 100,
    mutantThreshold: 200,
    corruptChance: 0.05,
    mutantChance: 0.025,
  },

  // --- SEGMENTATION: LORE-DRIVEN REGIONS ---
  safeZones: [
    { xMin: 0,  xMax: 15, yMin: 20, yMax: 40, name: "The Ruined Stacks" },    // Entry area
    { xMin: 48, xMax: 60, yMin: 20, yMax: 40, name: "The Crystal Heart" }    // Post-boss exit
  ],

  encounterTemplates: [
    { weight: 4, enemies: ['skeleton', 'skeleton', 'ghost'], activePhases: ['midnight', 'dawn'] },    // Royal Phalanx
    { weight: 3, enemies: ['crystal_shard', 'crystal_shard', 'ghost'], activePhases: ['noon', 'dusk'] }, // Resonant Pests
    { weight: 2, enemies: ['shadow_wraith', 'ghost', 'wisp'], activePhases: ['midnight'] },           // Core Terrors
    { weight: 2, enemies: ['crystal_golem', 'crystal_shard'], activePhases: ['noon', 'midnight'] },    // Prismatic Sentinels
    { weight: 1, enemies: ['basilisk'], activePhases: ['midnight'] },                                // Rare Ambush
    { weight: 2, enemies: ['troll', 'troll'], activePhases: ['dusk', 'midnight'] },                  // Core Stalkers
    { weight: 2, enemies: ['skeleton', 'skeleton', 'skeleton', 'skeleton'], activePhases: ['midnight', 'dawn'] }, // Heavy Guard
    { weight: 1, enemies: ['gem_mimic', 'gem_mimic'], activePhases: ['midnight'] },                  // Cursed Treasury
  ],

  objective: {
    type: 'kill_boss',
    label: 'Defeat the Spectral Guardian',
    completeMsg: '✦ THE GUARDIAN FALLS ✦\nThe resonance lock shatters. The path through the frozen core is clear—the resonance artifact in the South West is yours.'
  },

  enemies: [
    { id: 'spectral_guardian', x: 8,  y: 51, isBoss: true, level: 20, patrol: 'random', range: 2, speed: 0.9 },
    { id: 'ghost',             x: 20,  y: 20, patrol: 'random', range: 5, speed: 2.5, activePhases: ['dusk', 'midnight', 'dawn'] },
    { id: 'skeleton',          x: 20,  y: 40, patrol: 'random', range: 5, speed: 2.5, activePhases: ['midnight'] },
    { id: 'shadow_wraith',      x: 38,  y: 19, patrol: 'random', range: 8, speed: 1.4, activePhases: ['midnight'] },
    { id: 'crystal_golem',      x: 52,  y: 45, patrol: 'stationary' },
    { id: 'basilisk',           x: 35,  y: 45, patrol: 'random', range: 4 },
    { id: 'troll',              x: 34,  y: 25, patrol: 'random', range: 6 },
  ],

  npcs: [
    { id: 'scholar_vane', x: 12, y: 32, dialogueKey: 'crystal_cavern_f3_vane' },
    { id: 'ghost_soldier', x: 5, y: 28, dialogueKey: 'crystal_cavern_f3_soldier' },
    { id: 'essabella', x: 40, y: 30, dialogueKey: 'crystal_cavern_f3' },
    { id: 'spectral_collector', x: 11, y: 41, dialogueKey: 'crystal_cavern_f3_toll' },
  ],

  triggers: [
    // --- REGION ANNOUNCEMENTS ---
    {
      id: 'f3_seg_1', x: 0, y: 0, w: 15, h: 60,
      type: 'msg', msg: '✦ Entering: The Ruined Stacks'
    },
    {
      id: 'f3_seg_2', x: 16, y: 0, w: 15, h: 60,
      type: 'msg', msg: '✦ Entering: The Sunken Commons'
    },
    {
      id: 'f3_seg_3', x: 32, y: 0, w: 15, h: 60,
      type: 'msg', msg: '✦ Entering: The Imperial Sanctum'
    },
    {
      id: 'f3_seg_4', x: 48, y: 0, w: 12, h: 60,
      type: 'msg', msg: '✦ Entering: The Crystal Heart'
    },
    // --- TELEPORT ---
    {
      id: 'exit_f3',
      x: 2, y: 30, w: 1, h: 1,
      type: 'teleport',
      targetMapId: 'crystal_cavern_f2',
      targetX: 51, targetY: 31,
      msg: '✦ Retreating to the Resonant Depths...'
    },
    // --- SPECTRAL TOLLS & LORE ---
    {
      id: 'f3_resonance_lock', x: 20, y: 28, w: 2, h: 4,
      type: 'msg', msg: '✦ RESONANCE LOCK: The path is barred by a wall of pure frozen logic. You must circulate your inner light to proceed.'
    },
    {
      id: 'f3_toll_1', x: 28, y: 30, w: 2, h: 2,
      type: 'dialogue',
      lines: [
        { speaker: 'narrator', text: 'An invisible weight presses against your chest. The air itself feels like it is demanding a record of your existence.' },
        { speaker: 'Aya', text: 'It\'s the Archive\'s security... it\'s looking for our library cards.' },
        { speaker: 'Tao', text: 'I didn\'t bring mine. Think it will take gold instead?' },
        { speaker: 'narrator', text: '✦ SPECTRAL TOLL GRANTED: Your party\'s resonance satisfies the ancient guardians.' }
      ]
    },
    {
      id: 'f3_lore_palace', x: 38, y: 30, w: 2, h: 2,
      type: 'msg', msg: '✦ The Frozen Palace looms ahead. Once the seat of the Fire King, now a tomb of ice and lost memories.'
    },
  ],

  fog: { delay: 5, peak: 80, max: 0.9, vision: 3.0 },

  voiceLines: {
    ambient: [
      { char: 'Aya', color: '#7dd3fc', text: 'This is it. The nexus point of Arc 2.' },
      { char: 'Rei', color: '#4ade80', text: 'Draw your weapons. The Guardian is close.' },
    ],
  },
};
