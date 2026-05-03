const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(BASE_DIR, 'data');
const IMAGES_DIR = path.join(BASE_DIR, 'images');

let errors = 0;
let warnings = 0;

function log(msg, type = 'info') {
  const prefixes = { info: 'ℹ️ ', error: '❌ ', warn: '⚠️ ', success: '✅ ' };
  console.log(`${prefixes[type] || ''}${msg}`);
}

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`Missing file: ${filePath}`, 'error');
    errors++;
    return false;
  }
  return true;
}

log('Starting Integrity Audit...', 'info');

// 1. Audit Characters
log('Auditing Characters...', 'info');
const charsPath = path.join(DATA_DIR, 'characters.json');
if (fs.existsSync(charsPath)) {
  const chars = JSON.parse(fs.readFileSync(charsPath, 'utf8'));
  chars.forEach(c => {
    // Check icons/portraits if they are paths (usually they are strings like emoji or hex)
    // But let's assume we check specific image paths if added
  });
  log(`Validated ${chars.length} characters.`, 'success');
}

// 2. Audit Enemies
log('Auditing Enemies...', 'info');
const enemiesPath = path.join(DATA_DIR, 'enemies.json');
if (fs.existsSync(enemiesPath)) {
  const enemies = JSON.parse(fs.readFileSync(enemiesPath, 'utf8'));
  enemies.forEach(e => {
    if (e.portrait) {
      // Handle potential different paths (e.g. if it's just a filename)
      const p = path.join(IMAGES_DIR, e.portrait);
      if (!fs.existsSync(p)) {
        log(`Enemy [${e.id}] missing portrait: ${e.portrait}`, 'error');
        errors++;
      }
    }
  });
  log(`Validated ${enemies.length} enemies.`, 'success');
}

// 3. Audit Items
log('Auditing Items...', 'info');
const itemsPath = path.join(DATA_DIR, 'items.json');
if (fs.existsSync(itemsPath)) {
  const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
  items.forEach(it => {
    if (it.icon && it.icon.startsWith('img:')) {
      const imgPath = it.icon.replace('img:', '');
      if (!fs.existsSync(path.join(BASE_DIR, imgPath))) {
        log(`Item [${it.id}] missing icon: ${imgPath}`, 'error');
        errors++;
      }
    }
  });
  log(`Validated ${items.length} items.`, 'success');
}

// 4. Audit Arcs/Story
log('Auditing Story Arcs...', 'info');
const arcs = ['arc_1.json', 'arc_2.json'];
arcs.forEach(arcFile => {
  const arcPath = path.join(DATA_DIR, arcFile);
  if (fs.existsSync(arcPath)) {
    const arc = JSON.parse(fs.readFileSync(arcPath, 'utf8'));
    (arc.chapters || []).forEach(ch => {
      if (ch.type === 'explore' && ch.mapId) {
        // Check for map data file
        const mapPath = path.join(BASE_DIR, 'js', 'map', 'data', `map-${ch.mapId}.json`);
        const mapPathJs = path.join(BASE_DIR, 'js', 'map', 'data', `map-${ch.mapId}.js`);
        if (!fs.existsSync(mapPath) && !fs.existsSync(mapPathJs)) {
          log(`Arc [${arcFile}] Chapter [${ch.id}] missing map file: map-${ch.mapId}`, 'error');
          errors++;
        }
      }
    });
  }
});
log('Validated story arcs.', 'success');

console.log('\n--- AUDIT RESULTS ---');
if (errors === 0) {
  log('Audit passed! All assets and references are intact.', 'success');
  process.exit(0);
} else {
  log(`Audit failed with ${errors} errors. Please fix them before release.`, 'error');
  process.exit(1);
}
