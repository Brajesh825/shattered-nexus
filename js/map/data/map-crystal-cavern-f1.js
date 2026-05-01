/**
 * map-crystal-cavern-f1.js
 * FLOOR 1: THE AZURE ENTRANCE
 * --- EXTREME PREMIUM UPGRADE ---
 * Geometry: Winding crystal path over a void abyss.
 * Layers: L0 (Path/Void), L1 (Crystals/Walls), L2 (Overhead Stalactites).
 */

MAP_DEFS.crystal_cavern_f1 = {
  id: 'crystal_cavern_f1',
  name: 'The Azure Entrance',
  arcId: 2,
  width: 60,
  height: 60,
  playerStart: { x: 7, y: 30 },
  bgColor: '#04010a',
  ambientLight: 'rgba(140,80,255,0.08)',
  weather: 'sparks',
  enemyLevelRange: [8, 12],
  jsonFile: 'js/map/data/map-crystal-cavern-f1.json',

  mutationConfig: {
    corruptThreshold: 60,
    mutantThreshold: 120,
    corruptChance: 0.03,
    mutantChance: 0.015,
  },

  // --- SEGMENTATION: LORE-DRIVEN REGIONS ---
  // Safe zones prevent random encounters in narrative-heavy areas
  safeZones: [
    { xMin: 0,  xMax: 15, yMin: 0, yMax: 60, name: "The Whispering Hall" }, // Entry area
    { xMin: 46, xMax: 60, yMin: 0, yMax: 60, name: "The Descent Gate" }    // Exit area
  ],

  encounterTemplates: [
    { weight: 4, enemies: ['crystal_shard', 'crystal_shard'] },
    { weight: 3, enemies: ['skeleton', 'skeleton', 'bat'] },
    { weight: 1, enemies: ['gem_mimic'] },
  ],

  objective: {
    type: 'reach',
    target: { x: 55, y: 30 },
    label: 'Descent to Floor 2',
    completeMsg: '✦ THE PASSAGE OPENS ✦\nThe cavern floor shifts as you descend deeper into the Resonant Depths.'
  },

  enemies: [
    { id: 'skeleton',        x: 15,  y: 15, patrol: 'random',     range: 4, speed: 1.0 },
    { id: 'bat',             x: 45,  y: 45, patrol: 'vertical',   range: 6, speed: 1.8 },
    { id: 'crystal_shard',  x: 30,  y: 30, patrol: 'random',     range: 5, speed: 2.0 },
  ],

  npcs: [
    { id: 'the_archivist', x: 12, y: 15, dialogueKey: 'crystal_cavern_f1' },
  ],

  triggers: [
    // --- REGION ANNOUNCEMENTS ---
    {
      id: 'f1_seg_1', x: 0, y: 0, w: 15, h: 60,
      type: 'msg', msg: '✦ Entering: The Whispering Hall'
    },
    {
      id: 'f1_seg_2', x: 16, y: 0, w: 30, h: 60,
      type: 'msg', msg: '✦ Entering: The Resonant Spire'
    },
    {
      id: 'f1_seg_3', x: 46, y: 0, w: 14, h: 60,
      type: 'msg', msg: '✦ Entering: The Descent Gate'
    },
    // --- NARRATIVE TRIGGERS ---
    {
      x: 15, y: 20, w: 2, h: 2,
      type: 'msg', msg: '✦ You notice a pile of weathered bones. "These travelers never made it to the core... the crystals grew right through them."'
    },
    // --- TELEPORT ---
    {
      x: 55, y: 30, w: 1, h: 1,
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
