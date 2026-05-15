const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { test } = require('./test-harness.js');

const ROOT = path.resolve(__dirname, '..');

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function loadMapDefs() {
  const sandbox = {
    MAP_DEFS: {},
    console,
    Math,
    window: {},
    G: {},
    MapEngine: {}
  };
  vm.createContext(sandbox);

  const mapDir = path.join(ROOT, 'js', 'map', 'data');
  fs.readdirSync(mapDir)
    .filter(file => file.endsWith('.js') && file.startsWith('map-'))
    .forEach(file => {
      const src = fs.readFileSync(path.join(mapDir, file), 'utf8');
      vm.runInContext(src, sandbox, { filename: file });
    });

  return sandbox.MAP_DEFS;
}

function loadTileDefs() {
  const sandbox = { TILE_DEFS: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, 'js', 'map', 'data', 'tile-defs.js'), 'utf8'),
    sandbox,
    { filename: 'tile-defs.js' }
  );
  return sandbox.TILE_DEFS;
}

test('all json data files parse', () => {
  const bad = [];

  function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.json')) {
        try {
          JSON.parse(fs.readFileSync(full, 'utf8'));
        } catch (error) {
          bad.push(path.relative(ROOT, full));
        }
      }
    });
  }

  walk(path.join(ROOT, 'data'));
  walk(path.join(ROOT, 'js', 'map', 'data'));
  assert.deepStrictEqual(bad, []);
});

test('core content ids are unique and cross-reference existing records', () => {
  const chars = readJson('data/characters.json');
  const classes = readJson('data/classes.json');
  const enemies = readJson('data/enemies.json');
  const items = readJson('data/items.json');
  const relics = readJson('data/relics.json');

  function assertUnique(label, rows) {
    const seen = new Set();
    const dupes = [];
    rows.forEach(row => {
      if (seen.has(row.id)) dupes.push(row.id);
      seen.add(row.id);
    });
    assert.deepStrictEqual(dupes, [], `${label} duplicate ids`);
  }

  assertUnique('characters', chars);
  assertUnique('classes', classes);
  assertUnique('enemies', enemies);
  assertUnique('items', items);
  assertUnique('relics', relics);

  const classIds = new Set(classes.map(cls => cls.id));
  const missingAffinities = [];
  chars.forEach(char => {
    (char.class_affinity || []).forEach(classId => {
      if (!classIds.has(classId)) missingAffinities.push(`${char.id}:${classId}`);
    });
  });
  assert.deepStrictEqual(missingAffinities, [], 'missing character class affinities');
});

test('story arc files and boss/recruit references are valid', () => {
  const chars = new Set(readJson('data/characters.json').map(char => char.id));
  const enemies = new Set(readJson('data/enemies.json').map(enemy => enemy.id));
  const storyIndex = readJson('data/story/index.json');
  const missing = [];

  storyIndex.arcs.forEach(arcRef => {
    if (!fileExists(arcRef.file)) {
      missing.push(`${arcRef.id}: missing ${arcRef.file}`);
      return;
    }

    const arc = readJson(arcRef.file);
    if (arc.boss_enemy && !enemies.has(arc.boss_enemy)) missing.push(`${arc.id}: boss_enemy ${arc.boss_enemy}`);

    const events = [
      ...(arc.boss_chapter?.onVictory || []),
      ...(arc.onVictory || [])
    ];
    events.forEach(event => {
      if (event.type === 'recruit' && !chars.has(event.charId)) {
        missing.push(`${arc.id}: recruit ${event.charId}`);
      }
    });
  });

  assert.deepStrictEqual(missing, []);
});

test('map enemy references and jsonFile references are valid', () => {
  const enemyIds = new Set(readJson('data/enemies.json').map(enemy => enemy.id));
  const mapDefs = loadMapDefs();
  const missing = [];

  Object.entries(mapDefs).forEach(([mapId, map]) => {
    if (map.jsonFile && !fileExists(map.jsonFile)) missing.push(`${mapId}: jsonFile ${map.jsonFile}`);

    (map.encounterTemplates || []).forEach((template, idx) => {
      (template.enemies || []).forEach(enemyId => {
        if (!enemyIds.has(enemyId)) missing.push(`${mapId}: encounterTemplates[${idx}] ${enemyId}`);
      });
    });

    (map.enemies || []).forEach((enemy, idx) => {
      if (enemy.id && !enemyIds.has(enemy.id)) missing.push(`${mapId}: enemies[${idx}] ${enemy.id}`);
    });

    (map.triggers || []).forEach((trigger, idx) => {
      (trigger.encounter || []).forEach(enemyId => {
        if (!enemyIds.has(enemyId)) missing.push(`${mapId}: triggers[${idx}] ${enemyId}`);
      });
    });
  });

  assert.deepStrictEqual(missing, []);
});

test('environment tile svg assets and character sprites exist', () => {
  const tileDefs = loadTileDefs();
  const unlocks = readJson('data/character-unlocks.json');
  const missing = [];

  Object.values(tileDefs).forEach(def => {
    if (def.svgAsset && !fileExists(`images/environment/svg/${def.svgAsset}.svg`)) {
      missing.push(`tile svg ${def.svgAsset}`);
    }
  });

  const spriteRequiredIds = [
    ...(unlocks.unlocked_by_default || []),
    ...(unlocks.recruitable || []).map(entry => entry.id)
  ];

  spriteRequiredIds.forEach(id => {
    // Check Baseline
    [`images/characters/spirits/${id}_sprite.png`, `images/characters/spirits/${id}_sprite_low.webp`]
      .forEach(spritePath => {
        if (!fileExists(spritePath)) missing.push(spritePath);
      });
    
    // Check Illustrious (Optional, only if the character is a primary spirit)
    // Primary spirits are those in unlocked_by_default or recruitable
    // We expect them to have _1 versions eventually, but for now we only check if they exist
    // Actually, the plan says to check for them. Let's make it mandatory for a subset or just check if the file exists when expected.
    // For now, let's just check the ones we KNOW should have it (Aya, Lulu, Rei, Tao, Valka, Drake, Rex)
    const primarySpirits = ['aya', 'lulu', 'rei', 'tao', 'valka', 'drake', 'rex', 'sera', 'ria'];
    if (primarySpirits.includes(id)) {
      [`images/characters/spirits/${id}_sprite_1.png`, `images/characters/spirits/${id}_sprite_1_low.webp`]
        .forEach(spritePath => {
          if (!fileExists(spritePath)) missing.push(`Missing Illustrious: ${spritePath}`);
        });
    }
  });

  assert.deepStrictEqual(missing, []);
});

test('item and relic effect fields are supported', () => {
  const items = readJson('data/items.json');
  const relics = readJson('data/relics.json');
  const missing = [];

  const validItemStats = ['hp', 'mp', 'both', 'revive', 'debuff', 'atk', 'def', 'exp', 'none', 'escape'];
  const validRelicBonuses = [
    'spd', 'firstStrike', 'atk', 'fireResist', 'def', 'hp', 
    'statusResist', 'eliteResist', 'mag', 'mpRegen', 'reviveOnce', 
    'healAmp', 'mp', 'critRate'
  ];

  items.forEach(item => {
    if (item.effect) {
      if (!validItemStats.includes(item.effect.stat)) {
        missing.push(`item ${item.id}: unsupported stat ${item.effect.stat}`);
      }
    }
  });

  relics.forEach(relic => {
    if (relic.bonus) {
      Object.keys(relic.bonus).forEach(key => {
        if (!validRelicBonuses.includes(key)) {
          missing.push(`relic ${relic.id}: unsupported bonus ${key}`);
        }
      });
    }
  });

  assert.deepStrictEqual(missing, []);
});

test('story arc chapter encounters and enemy references are valid', () => {
  const enemyIds = new Set(readJson('data/enemies.json').map(enemy => enemy.id));
  const storyIndex = readJson('data/story/index.json');
  const missing = [];

  storyIndex.arcs.forEach(arcRef => {
    if (!fileExists(arcRef.file)) return; // Already caught by previous test
    const arc = readJson(arcRef.file);

    // Deep search for enemy/encounter references
    function checkNode(node, path) {
      if (!node || typeof node !== 'object') return;

      if (node.type === 'encounter' || node.type === 'battle') {
        const eid = node.enemyId || node.enemy;
        if (eid && !enemyIds.has(eid)) missing.push(`${arcRef.id} [${path}]: missing enemy ${eid}`);
      }

      Object.entries(node).forEach(([key, val]) => {
        if (key === 'enemyId' || key === 'enemy' || key === 'boss_enemy') {
          if (val && !enemyIds.has(val)) missing.push(`${arcRef.id} [${path}.${key}]: missing enemy ${val}`);
        }
        if (typeof val === 'object') checkNode(val, `${path}.${key}`);
      });
    }

    checkNode(arc, 'root');
  });

  assert.deepStrictEqual(missing, []);
});

test('map jsonFile content is valid and references existing enemies', () => {
  const enemyIds = new Set(readJson('data/enemies.json').map(enemy => enemy.id));
  const mapDefs = loadMapDefs();
  const missing = [];

  Object.entries(mapDefs).forEach(([mapId, map]) => {
    if (map.jsonFile && fileExists(map.jsonFile)) {
      try {
        const data = readJson(map.jsonFile);
        // Map format is [ [ [row1], [row2] ], ...layers ]
        if (!Array.isArray(data) || data.length === 0) {
          missing.push(`${mapId}: jsonFile ${map.jsonFile} invalid structure (not a layer array)`);
        } else if (!Array.isArray(data[0])) {
          missing.push(`${mapId}: jsonFile ${map.jsonFile} invalid layer 0 (not a row array)`);
        }
        
        // Check for any hardcoded enemy IDs in the JSON data if applicable
        if (data.entities) {
          data.entities.forEach((ent, i) => {
            if (ent.type === 'enemy' && ent.enemyId && !enemyIds.has(ent.enemyId)) {
              missing.push(`${mapId}: jsonFile entity[${i}] missing enemy ${ent.enemyId}`);
            }
          });
        }
      } catch (e) {
        missing.push(`${mapId}: jsonFile ${map.jsonFile} failed to parse`);
      }
    }
  });

  assert.deepStrictEqual(missing, []);
});
test('enemy and npc sprites exist', () => {
  const enemies = readJson('data/enemies.json');
  const storyIndex = readJson('data/story/index.json');
  const missing = [];

  // Check Enemy Sprites
  enemies.forEach(enemy => {
    const spritePath = `images/enemies/${enemy.id}.webp`;
    if (!fileExists(spritePath)) missing.push(`Enemy Sprite: ${spritePath}`);
  });

  // Check NPC Map Sheets referenced in story
  storyIndex.arcs.forEach(arcRef => {
    if (!fileExists(arcRef.file)) return;
    const arc = readJson(arcRef.file);

    function checkNPC(node) {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'npc' && node.sheet) {
        const sheetPath = `images/characters/map/sheets/npc/${node.sheet}_sheet.png`;
        if (!fileExists(sheetPath)) missing.push(`NPC Sheet: ${sheetPath} (arc: ${arcRef.id})`);
      }
      Object.values(node).forEach(val => {
        if (typeof val === 'object') checkNPC(val);
      });
    }
    checkNPC(arc);
  });

  assert.deepStrictEqual(missing, []);
});

test('map entities have valid Chronos phases', () => {
  const mapDefs = loadMapDefs();
  const validPhases = ['dawn', 'noon', 'dusk', 'midnight'];
  const missing = [];

  Object.entries(mapDefs).forEach(([mapId, map]) => {
    const entities = [
      ...(map.enemies || []),
      ...(map.npcs || []),
      ...(map.encounterTemplates || [])
    ];

    entities.forEach((ent, idx) => {
      // 1. Validate Phase Gating
      if (ent.activePhases) {
        if (!Array.isArray(ent.activePhases)) {
          missing.push(`${mapId} entity[${idx}]: activePhases must be an array`);
        } else {
          ent.activePhases.forEach(p => {
            if (!validPhases.includes(p)) missing.push(`${mapId} entity[${idx}]: invalid phase "${p}"`);
          });
        }
      }
      
      // 2. Validate Hour Gating
      if (ent.activeHours) {
        if (!Array.isArray(ent.activeHours) || ent.activeHours.length !== 2) {
          missing.push(`${mapId} entity[${idx}]: activeHours must be [start, end]`);
        } else {
          const [s, e] = ent.activeHours;
          if (typeof s !== 'number' || typeof e !== 'number' || s < 0 || s >= 24 || e < 0 || e >= 24) {
            missing.push(`${mapId} entity[${idx}]: activeHours ${s}-${e} out of range 0-24`);
          }
        }
      }
    });
  });

  assert.deepStrictEqual(missing, []);
});

const { run } = require('./test-harness.js');
run();
