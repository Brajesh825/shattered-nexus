/**
 * map-crystal-cavern-f3.js
 * FLOOR 3: THE FROZEN CORE
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
  enemyLevelRange: [16, 20],
  jsonFile: 'js/map/data/map-crystal-cavern-f3.json',

  mutationConfig: {
    corruptThreshold: 100,
    mutantThreshold: 200,
    corruptChance: 0.05,
    mutantChance: 0.025,
  },

  encounterTemplates: [
    { weight: 3, enemies: ['crystal_golem', 'imp', 'witch'] },
    { weight: 2, enemies: ['cyclops', 'minotaur'] },
    { weight: 1, enemies: ['spectral_guardian'] },
  ],

  objective: {
    type: 'reach',
    target: { x: 30, y: 30 },
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
