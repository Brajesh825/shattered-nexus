/**
 * map-crystal-cavern-f1.js
 * FLOOR 1: THE WHISPERING HALL (Ashveil Kingdom Entrance)
 * --- EXTREME PREMIUM UPGRADE ---
 * Geometry: Grand imperial foyer and residential chambers carved into the mountain.
 * Content: 
 * - The Whispering Hall: The grand entrance where guests and scholars were received.
 * - Garrison Alcoves: Ruined chambers to the west where the mountain guard once resided.
 * - The Archive Annex: Scholar's work area on the northern edge.
 * - The Prismatic Core: A central island where the first major resonance point is located.
 */

MAP_DEFS.crystal_cavern_f1 = {
  id: 'crystal_cavern_f1',
  name: 'The Azure Entrance',
  arcId: 2,
  width: 60,
  height: 60,
  playerStart: { x: 7, y: 10 },
  bgColor: '#04010a',
  ambientLight: 'rgba(140,80,255,0.08)',
  weather: 'sparks',
  enemyLevelRange: [10, 13],
  jsonFile: 'js/map/data/map-crystal-cavern-f1.json',  
  bgm: 'cavern_explore',
  battleBgm: 'cavern_battle',
  battleBg: 'cavern_f1',

  mutationConfig: {
    corruptThreshold: 60,
    mutantThreshold: 120,
    corruptChance: 0.03,
    mutantChance: 0.015,
  },

  // --- SEGMENTATION: LORE-DRIVEN REGIONS ---
  // Safe zones prevent random encounters in narrative-heavy areas
  safeZones: [
    { xMin: 6, xMax: 19, yMin: 8, yMax: 15, name: "The Whispering Hall" }, // Entry area
    { xMin: 45, xMax: 60, yMin: 8, yMax: 15, name: "The Descent Gate" }    // Exit area
  ],

  encounterTemplates: [
    { weight: 2, enemies: ['rat', 'rat'], activePhases: ['noon', 'dusk', 'midnight', 'dawn'] },
    { weight: 4, enemies: ['crystal_shard', 'crystal_shard'], activePhases: ['noon', 'dusk'] },
    { weight: 3, enemies: ['skeleton', 'skeleton', 'bat'], activePhases: ['dusk', 'midnight', 'dawn'] },
    { weight: 2, enemies: ['rat', 'rat', 'rat','rat'], activePhases: ['midnight', 'dawn'] },
    { weight: 1, enemies: ['gem_mimic'], activePhases: ['midnight'] },
  ],

  objective: null,

  enemies: [
    { id: 'skeleton', x: 10, y: 30, patrol: 'random', range: 4, speed: 1.0, activePhases: ['midnight', 'dawn'] },
    { id: 'bat', x: 45, y: 45, patrol: 'vertical', range: 6, speed: 1.8, activePhases: ['dusk', 'midnight'] },
    { id: 'crystal_shard', x: 30, y: 30, patrol: 'random', range: 5, speed: 2.0, activePhases: ['noon', 'dusk'] },
    { id: 'rat', x: 22, y: 35, patrol: 'random', range: 4, speed: 1.5, activePhases: ['midnight', 'dawn'] },
  ],

  npcs: [
    { id: 'the_archivist', x: 12, y: 15, dialogueKey: 'crystal_cavern_f1', giveQuest: 'bones_of_the_fallen' },
    { id: 'holographic_log_orb', x: 25, y: 2, dialogueKey: 'crystal_cavern_f1', behavior: 'stationary' },
    { id: 'bone_shard', x: 15, y: 22, dialogueKey: 'crystal_cavern_f1', behavior: 'stationary', showOnlyDuringQuest: 'bones_of_the_fallen' },
    { id: 'bone_shard', x: 28, y: 40, dialogueKey: 'crystal_cavern_f1', behavior: 'stationary', showOnlyDuringQuest: 'bones_of_the_fallen' },
    { id: 'bone_shard', x: 50, y: 53, dialogueKey: 'crystal_cavern_f1', behavior: 'stationary', showOnlyDuringQuest: 'bones_of_the_fallen' }
  ],

  triggers: [
    // --- RETURN TO SURFACE ---
    {
      x: 1, y: 10, w: 1, h: 1,
      type: 'teleport',
      targetMapId: 'verdant_vale',
      targetX: 52, targetY: 29,
      msg: '✦ Returning to the surface...'
    },
    // --- REGION ANNOUNCEMENTS ---
    {
      id: 'f1_seg_1', x: 6, y: 8, w: 13, h: 7,
      type: 'msg', msg: '✦ Entering: The Whispering Hall'
    },
    {
      id: 'f1_seg_2', x: 20, y: 0, w: 24, h: 60,
      type: 'msg', msg: '✦ Entering: The Resonant Spire'
    },
    {
      id: 'f1_seg_3', x: 45, y: 8, w: 15, h: 7,
      type: 'msg', msg: '✦ Entering: The Descent Gate'
    },
    // --- NARRATIVE TRIGGERS ---
    {
      x: 15, y: 20, w: 2, h: 2,
      type: 'msg', msg: '✦ You notice a pile of weathered bones. "These travelers never made it to the core... the crystals grew right through them."'
    },
    // --- TELEPORT ---
    {
      x: 55, y: 10, w: 1, h: 1,
      type: 'teleport',
      targetMapId: 'crystal_cavern_f2',
      targetX: 7, targetY: 30,
      msg: '✦ Descending into the Resonant Depths...'
    }
  ],

  fog: { delay: 10, peak: 50, max: 0.75, vision: 4.0 },

  voiceLines: {
    ambient: [
      { char: 'Aya', color: '#7dd3fc', text: 'The air grows cold. We are going deep.' },
      { char: 'Rei', color: '#4ade80', text: 'Steady your breathing. The shadows are heavy here.' },
    ],
  },
};
