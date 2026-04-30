/**
 * map-crystal-cavern-f1.js
 * FLOOR 1: THE AZURE ENTRANCE
 */

MAP_DEFS.crystal_cavern_f1 = {
  id: 'crystal_cavern_f1',
  name: 'The Azure Entrance',
  arcId: 1,
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

  encounterTemplates: [
    { weight: 4, enemies: ['crystal_shard', 'crystal_shard'] },
    { weight: 3, enemies: ['skeleton', 'skeleton', 'bat'] },
    { weight: 1, enemies: ['gem_mimic'] },
  ],

  enemies: [
    { id: 'skeleton',        x: 15,  y: 15, patrol: 'random',     range: 4, speed: 1.0 },
    { id: 'bat',             x: 45,  y: 45, patrol: 'vertical',   range: 6, speed: 1.8 },
    { id: 'crystal_shard',  x: 30,  y: 30, patrol: 'random',     range: 5, speed: 2.0 },
  ],

  npcs: [
    { id: 'the_archivist', x: 12, y: 15, dialogueKey: 'crystal_cavern_f1' },
  ],

  triggers: [
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
