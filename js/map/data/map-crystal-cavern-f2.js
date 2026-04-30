/**
 * map-crystal-cavern-f2.js
 * FLOOR 2: THE RESONANT DEPTHS
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

  encounterTemplates: [
    { weight: 4, enemies: ['imp', 'imp', 'skeleton'] },
    { weight: 3, enemies: ['crystal_golem', 'bat'] },
    { weight: 2, enemies: ['witch', 'skeleton'] },
    { weight: 1, enemies: ['cyclops'] },
  ],

  enemies: [
    { id: 'crystal_golem',  x: 30,  y: 10, patrol: 'random',     range: 6, speed: 0.7 },
    { id: 'skeleton',       x: 30,  y: 50, patrol: 'horizontal', range: 8, speed: 1.2 },
  ],

  npcs: [
    { id: 'ghost_knight', x: 12, y: 15, dialogueKey: 'crystal_cavern_f2' },
  ],

  triggers: [
    {
      x: 5, y: 30, w: 1, h: 1,
      type: 'teleport',
      targetMapId: 'crystal_cavern_f1',
      targetX: 53, targetY: 30,
      msg: '✦ Returning to the Azure Entrance...'
    },
    {
      x: 55, y: 30, w: 1, h: 1,
      type: 'teleport',
      targetMapId: 'crystal_cavern_f3',
      targetX: 7, targetY: 30,
      msg: '✦ Approaching the Frozen Core...'
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
