/**
 * map-crystal-cavern-f2.js
 * FLOOR 2: THE RESONANT DEPTHS
 * --- EXTREME PREMIUM UPGRADE ---
 * Geometry: Obsidian ravines leading to the Ruined Archive.
 * Layers: L0 (Ravine/Ruin), L1 (Obsidian Walls/Pillars), L2 (Fog).
 */

MAP_DEFS.crystal_cavern_f2 = {
  id: 'crystal_cavern_f2',
  name: 'The Resonant Depths',
  arcId: 2,
  width: 60,
  height: 60,
  playerStart: { x: 7, y: 30 },
  bgColor: '#020005',
  ambientLight: 'rgba(180,80,255,0.12)',
  weather: 'fog',
  enemyLevelRange: [12, 16],
  jsonFile: 'js/map/data/map-crystal-cavern-f2.json',

  mutationConfig: {
    corruptThreshold: 80,
    mutantThreshold: 160,
    corruptChance: 0.04,
    mutantChance: 0.02,
  },

  // --- SEGMENTATION: LORE-DRIVEN REGIONS ---
  // Safe zones prevent random encounters in narrative-heavy areas
  safeZones: [
    { xMin: 21, xMax: 40, yMin: 0, yMax: 60, name: "The Prismatic Archive" } // Lore hub
  ],

  encounterTemplates: [
    { weight: 4, enemies: ['skeleton', 'skeleton'] },
    { weight: 3, enemies: ['ghost', 'ghost', 'bat'] },
    { weight: 1, enemies: ['gem_mimic'] },
  ],
  
  objective: {
    type: 'reach',
    target: { x: 53, y: 30 },
    label: 'Descent to the Frozen Core',
    completeMsg: '✦ THE COLD DEEPENS ✦\nThe resonance is deafening here. The Frozen Core lies just ahead.'
  },

  enemies: [
    { id: 'ghost',    x: 15, y: 15, patrol: 'random', range: 5, speed: 1.5 },
    { id: 'skeleton', x: 45, y: 45, patrol: 'random', range: 5, speed: 1.2 },
  ],

  npcs: [
    { id: 'ghost_knight', x: 25, y: 25, dialogueKey: 'crystal_cavern_f2' },
  ],

  triggers: [
    // --- REGION ANNOUNCEMENTS ---
    {
      id: 'f2_seg_1', x: 0, y: 0, w: 20, h: 60,
      type: 'msg', msg: '✦ Entering: The Echoing Ravine'
    },
    {
      id: 'f2_seg_2', x: 21, y: 0, w: 20, h: 60,
      type: 'msg', msg: '✦ Entering: The Prismatic Archive'
    },
    {
      id: 'f2_seg_3', x: 41, y: 0, w: 19, h: 60,
      type: 'msg', msg: '✦ Entering: The Frozen Threshold'
    },
    // --- TELEPORT ---
    {
      x: 5, y: 30, w: 1, h: 1,
      type: 'teleport',
      targetMapId: 'crystal_cavern_f1',
      targetX: 53, targetY: 30,
      msg: '✦ Returning to the Azure Entrance...'
    },
    {
      x: 53, y: 30, w: 1, h: 1,
      type: 'teleport',
      targetMapId: 'crystal_cavern_f3',
      targetX: 7, targetY: 30,
      msg: '✦ Descending into the Frozen Core...'
    }
  ],

  fog: { delay: 10, peak: 60, max: 0.8, vision: 3.5 },

  voiceLines: {
    ambient: [
      { char: 'Tao', color: '#ef4444', text: 'I hear... singing? No, it\'s the crystals. They\'re vibrating.' },
      { char: 'Lulu', color: '#2dd4bf', text: 'Stay focused. The resonance is getting stronger.' },
    ],
  },
};
