const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const SW_PATH = path.join(BASE_DIR, 'sw.js');

let errors = 0;

function log(msg, type = 'info') {
  const prefixes = { info: 'ℹ️ ', error: '❌ ', warn: '⚠️ ', success: '✅ ' };
  console.log(`${prefixes[type] || ''}${msg}`);
}

log('Starting Cache Manifest Verification...', 'info');

if (!fs.existsSync(SW_PATH)) {
  log('sw.js not found!', 'error');
  process.exit(1);
}

const swContent = fs.readFileSync(SW_PATH, 'utf8');

function extractArray(content, arrayName) {
  const regex = new RegExp(`const\\s+${arrayName}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
  const match = content.match(regex);
  if (!match) return [];
  const assetsRaw = match[1];
  return (assetsRaw.match(/['"](.*?)['"]/g) || []).map(s => s.replace(/['"]/g, ''));
}

const shell = extractArray(swContent, 'SHELL_ASSETS');
const normal = extractArray(swContent, 'SPRITES_NORMAL');
const low = extractArray(swContent, 'SPRITES_LOW');

const allAssets = [...shell, ...normal, ...low];

log(`Found ${allAssets.length} total assets in sw.js. Verifying...`, 'info');

allAssets.forEach(asset => {
  // Clean URL (remove ./ and query params)
  const cleanPath = asset.replace('./', '').split('?')[0];
  if (cleanPath === '/' || cleanPath === '') return; // Skip root

  const fullPath = path.join(BASE_DIR, cleanPath);
  if (!fs.existsSync(fullPath)) {
    log(`Missing cache asset: ${cleanPath}`, 'error');
    errors++;
  }
});

console.log('\n--- CACHE VERIFICATION RESULTS ---');
if (errors === 0) {
  log('All cache assets verified on disk.', 'success');
  process.exit(0);
} else {
  log(`Found ${errors} missing assets in sw.js. Please update the manifest.`, 'error');
  process.exit(1);
}
