/**
 * map-crystal-cavern-f2.js
 * FLOOR 2: THE RESONANT DEPTHS
 * --- LORE: THE ECHOING ARCHIVES (FLOOR 2) ---
 * Once the intellectual sanctuary of Ashveil, this floor houses the Royal Library. 
 * Massive crystals here were used to harvest 'Resonance'—a method of storing memories in stone.
 * Scholars died at their desks when the void broke through, and their spirits still patrol the stacks.
 * 
 * Geometry: Grand stone halls overtaken by crystalline 'memory leaks'.
 * Layers: L0 (Marble/Crystals), L1 (Bookshelves/Large Statues), L2 (Spectral Fog).
 */

MAP_DEFS.crystal_cavern_f2 = {
  id: 'crystal_cavern_f2',
  name: 'The Echoing Archives',
  arcId: 2,
  width: 60,
  height: 60,
  playerStart: { x: 7, y: 30 },
  bgColor: '#020005',
  ambientLight: 'rgba(100, 150, 255, 0.15)', // Cooler, scholarly blue
  weather: 'fog',
  enemyLevelRange: [12, 15],
  jsonFile: 'js/map/data/map-crystal-cavern-f2.json',
  
  bgm: 'cavern_explore',
  battleBgm: 'cavern_battle',
  battleBg: 'cavern_f2',

  mutationConfig: {
    corruptThreshold: 85,
    mutantThreshold: 170,
    corruptChance: 0.05,
    mutantChance: 0.025,
  },

  // --- SEGMENTATION: LORE-DRIVEN REGIONS ---
  safeZones: [
    { xMin: 6, xMax: 15, yMin: 25, yMax: 35, name: "The Archivist's Landing" }  // Entry safe point
  ],

  encounterTemplates: [
    { weight: 4, enemies: ['ghost', 'ghost'], activePhases: ['midnight', 'dawn'] },       // Spectral Scholars
    { weight: 3, enemies: ['lich', 'ghost'], activePhases: ['midnight'] },               // Archive Overseers
    { weight: 2, enemies: ['crystal_shard', 'bat'], activePhases: ['noon', 'dusk'] },   // Natural pests
    { weight: 2, enemies: ['rat', 'rat'], activePhases: ['midnight', 'dawn'] },          // Scavengers
    { weight: 1, enemies: ['gem_mimic'], activePhases: ['midnight'] },                  // Cursed scrolls
  ],

  objective: null,

  enemies: [
    { id: 'ghost', x: 20, y: 15, patrol: 'random', range: 5, speed: 1.2, activePhases: ['midnight', 'dawn'] },        // Top corridor phantom
    { id: 'skeleton', x: 45, y: 55, patrol: 'horizontal', range: 8, speed: 1.0, activePhases: ['midnight'] },         // Bottom workshop knight
    { id: 'rat', x: 25, y: 12, patrol: 'random', range: 6, speed: 1.5, activePhases: ['midnight', 'dawn'] },
  ],

  npcs: [
    { id: 'ghost_knight', x: 34, y: 32, dialogueKey: 'crystal_cavern_f2' },
    { id: 'scholar_vane', x: 10, y: 28, dialogueKey: 'crystal_cavern_f2' },
  ],

  triggers: [
    // --- REGION ANNOUNCEMENTS ---
    {
      id: 'f2_seg_center', x: 22, y: 17, w: 26, h: 28,
      type: 'msg', msg: '✦ Entering: The Forbidden Scriptum'
    },
    {
      id: 'f2_seg_north', x: 15, y: 5, w: 40, h: 10,
      type: 'msg', msg: 'The Great Stacks — Centuries of lost history surround you.'
    },
    {
      id: 'f2_seg_south', x: 15, y: 48, w: 40, h: 10,
      type: 'msg', msg: 'Resonance Labs — The air hums with unstable magic.'
    },
    {
      id: 'f2_exit_warning', x: 50, y: 30, w: 10, h: 10,
      type: 'msg', msg: 'The resonance from the well is deafening...'
    },
    // --- TELEPORT ---
    {
      x: 2, y: 30, w: 1, h: 1,
      type: 'teleport',
      targetMapId: 'crystal_cavern_f1',
      targetX: 7, targetY: 10,
      msg: '✦ Returning to the Azure Entrance...'
    },
    {
      x: 53, y: 31, w: 1, h: 1,
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
