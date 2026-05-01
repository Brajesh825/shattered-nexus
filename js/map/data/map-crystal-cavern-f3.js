/**
 * map-crystal-cavern-f3.js
 * FLOOR 3: THE FROZEN CORE
 * --- EXTREME PREMIUM UPGRADE ---
 * Geometry: Frozen lake arena with starlit reflections.
 * Layers: L0 (Frozen Lake), L1 (Crystal Outcrops/Boss Circle), L2 (Glow).
 */

MAP_DEFS.crystal_cavern_f3 = {
  id: 'crystal_cavern_f3',
  name: 'The Frozen Core',
  arcId: 2,
  width: 60,
  height: 60,
  playerStart: { x: 7, y: 30 },
  bgColor: '#010002',
  ambientLight: 'rgba(220,150,255,0.15)',
  weather: 'fog',
  enemyLevelRange: [14, 16],
  jsonFile: 'js/map/data/map-crystal-cavern-f3.json',

  mutationConfig: {
    corruptThreshold: 100,
    mutantThreshold: 200,
    corruptChance: 0.05,
    mutantChance: 0.025,
  },

  // --- SEGMENTATION: LORE-DRIVEN REGIONS ---
  // Safe zones prevent random encounters in narrative-heavy areas
  safeZones: [
    { xMin: 0,  xMax: 20, yMin: 0, yMax: 60, name: "The Starlit Vault" },   // Prep area
    { xMin: 46, xMax: 60, yMin: 0, yMax: 60, name: "The Undercroft Passage" } // Post-boss
  ],

  encounterTemplates: [
    { weight: 4, enemies: ['skeleton', 'ghost'] },
    { weight: 2, enemies: ['cyclops', 'minotaur'] },
    { weight: 1, enemies: ['spectral_guardian'] },
  ],

  objective: {
    type: 'kill_boss',
    label: 'Defeat the Spectral Guardian',
    completeMsg: '✦ THE CORE IS REACHED ✦\nThe Spectral Guardian falls. The path to Ashveil lies ahead.'
  },

  enemies: [
    { id: 'spectral_guardian', x: 30,  y: 30, isBoss: true, patrol: 'random', range: 2, speed: 0.9 },
    { id: 'ghost',             x: 20,  y: 20, patrol: 'random', range: 5, speed: 2.5 },
    { id: 'skeleton',          x: 20,  y: 40, patrol: 'random', range: 5, speed: 2.5 },
  ],

  npcs: [
    { id: 'essabella', x: 40, y: 30, dialogueKey: 'crystal_cavern_f3' },
  ],

  triggers: [
    // --- REGION ANNOUNCEMENTS ---
    {
      id: 'f3_seg_1', x: 0, y: 0, w: 20, h: 60,
      type: 'msg', msg: '✦ Entering: The Starlit Vault'
    },
    {
      id: 'f3_seg_2', x: 21, y: 0, w: 24, h: 60,
      type: 'msg', msg: '✦ Entering: The Guardian\'s Path'
    },
    {
      id: 'f3_seg_3', x: 46, y: 0, w: 14, h: 60,
      type: 'msg', msg: '✦ Entering: The Undercroft Passage'
    },
    // --- TELEPORT ---
    {
      x: 5, y: 30, w: 1, h: 1,
      type: 'teleport',
      targetMapId: 'crystal_cavern_f2',
      targetX: 53, targetY: 30,
      msg: '✦ Retreating to the Resonant Depths...'
    }
  ],

  fog: { delay: 5, peak: 80, max: 0.9, vision: 3.0 },

  voiceLines: {
    ambient: [
      { char: 'Aya', color: '#7dd3fc', text: 'This is it. The nexus point of Arc 2.' },
      { char: 'Rei', color: '#4ade80', text: 'Draw your weapons. The Guardian is close.' },
    ],
  },
};
