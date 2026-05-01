/**
 * map-crystal-cavern-f3.js
 * FLOOR 3: THE FROZEN CORE
 * --- LORE: THE SUNKEN SANCTUM (FINAL FLOOR) ---
 * The absolute heart of the Ashveil Kingdom. The temperature here is sub-zero, 
 * kept frozen by the 'Resonance' that has turned to pure ice.
 * 
 * Sections:
 * 1. THE RUINED STACKS: The library ends here, crumbling into the residential district.
 * 2. THE SUNKEN COMMONS: Ruined estates where the High Scholars lived.
 * 3. THE IMPERIAL SANCTUM: The Royal Palace. Home to the SPECTRAL GUARDIAN.
 * 4. THE CRYSTAL HEART: The exit rift that leads to the Eastern Wilds.
 * 
 * Narrative: Defeating the Guardian triggers the "Void Ambush" narrative sequence.
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
  enemyLevelRange: [16, 20],
  jsonFile: 'js/map/data/map-crystal-cavern-f3.json',

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
    { weight: 4, enemies: ['skeleton', 'ghost'] },
    { weight: 2, enemies: ['cyclops', 'lich' ,'skeleton'] },
  ],

  objective: {
    type: 'kill_boss',
    label: 'Defeat the Spectral Guardian',
    completeMsg: '✦ THE GUARDIAN FALLS ✦\nThe crystal heart shatters. The path to the undercroft is open — the Demon Lord awaits.'
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
      x: 2, y: 30, w: 1, h: 1,
      type: 'teleport',
      targetMapId: 'crystal_cavern_f2',
      targetX: 51, targetY: 31,
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
