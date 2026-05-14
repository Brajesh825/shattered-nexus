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
    // Validate Tiered Sprite Assets (Spirit Combat PNGs and Exploration Map Sheets)
    const spiritPath = path.join(IMAGES_DIR, 'characters', 'spirits', `${c.id}_sprite.png`);
    const sheetPath = path.join(IMAGES_DIR, 'characters', 'map', 'sheets', `${c.id}_sheet.png`);
    if (!fs.existsSync(spiritPath)) {
      log(`Character [${c.id}] missing primary combat spirit asset: ${spiritPath}`, 'error');
      errors++;
    }
    if (!fs.existsSync(sheetPath)) {
      log(`Character [${c.id}] missing exploration map sheet asset: ${sheetPath}`, 'error');
      errors++;
    }
  });
  log(`Validated ${chars.length} characters and their companion Tiered sprite packages.`, 'success');
}

// 2. Audit Enemies
log('Auditing Enemies...', 'info');
const enemiesPath = path.join(DATA_DIR, 'enemies.json');
if (fs.existsSync(enemiesPath)) {
  const enemies = JSON.parse(fs.readFileSync(enemiesPath, 'utf8'));
  enemies.forEach(e => {
    // Validate custom PWA WebP target format guarantee natively inside images/enemies/
    const webpSprite = path.join(IMAGES_DIR, 'enemies', `${e.id}.webp`);
    if (!fs.existsSync(webpSprite)) {
      log(`Enemy [${e.id}] missing standard lossy/lossless WebP rendering delivery asset: ${webpSprite}`, 'error');
      errors++;
    }
    if (e.portrait) {
      const p = path.join(IMAGES_DIR, e.portrait);
      if (!fs.existsSync(p)) {
        log(`Enemy [${e.id}] missing legacy metadata portrait: ${e.portrait}`, 'error');
        errors++;
      }
    }
    if (e.bgm) {
      const bgmPath = path.join(process.cwd(), 'audio', 'bgm', `${e.bgm}.webm`);
      if (!fs.existsSync(bgmPath)) {
        log(`Enemy [${e.id}] missing assigned BGM audio asset: ${bgmPath}`, 'error');
        errors++;
      }
    }
  });
  log(`Validated ${enemies.length} enemies against core Void Knight Standard WebP delivery packages.`, 'success');
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
