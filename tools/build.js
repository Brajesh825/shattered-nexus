const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(BASE_DIR, 'dist');

const INCLUDE_DIRS = [
  'css',
  'js',
  'data',
  'images',
  'audio',
];

const INCLUDE_FILES = [
  'index.html',
  'manifest.json',
  'sw.js',
  'icon-192.png',
  'icon-512.png',
];

function log(msg, type = 'info') {
  const prefixes = { info: 'ℹ️ ', success: '✅ ', error: '❌ ' };
  console.log(`${prefixes[type] || ''}${msg}`);
}

async function build() {
  log('Starting production build...', 'info');

  // 1. Clean/Create dist folder
  if (fs.existsSync(DIST_DIR)) {
    log('Cleaning existing dist folder...', 'info');
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR);

  // 2. Copy Directories
  INCLUDE_DIRS.forEach(dir => {
    const src = path.join(BASE_DIR, dir);
    const dest = path.join(DIST_DIR, dir);
    if (fs.existsSync(src)) {
      log(`Copying ${dir}/...`, 'info');
      fs.cpSync(src, dest, { recursive: true });
    }
  });

  // 3. Copy Root Files
  INCLUDE_FILES.forEach(file => {
    const src = path.join(BASE_DIR, file);
    const dest = path.join(DIST_DIR, file);
    if (fs.existsSync(src)) {
      log(`Copying ${file}...`, 'info');
      fs.copyFileSync(src, dest);
    }
  });

  // 4. Post-processing: Minification placeholder
  // In a real pipeline, we'd run Terser here. 
  // For now, we've already gated debug logs in the source.
  log('Minification skipped (handled by source-level gating).', 'info');

  log('Build complete! Contents are in the dist/ folder.', 'success');
}

build().catch(err => {
  log(`Build failed: ${err.message}`, 'error');
  process.exit(1);
});
