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

const { execSync } = require('child_process');

function log(msg, type = 'info') {
  const prefixes = { info: 'ℹ️ ', success: '✅ ', error: '❌ ', warning: '⚠️ ' };
  console.log(`${prefixes[type] || ''}${msg}`);
}

async function build() {
  log('Starting production build pipeline...', 'info');

  try {
    // 1. Pre-build Integrity Gating
    log('Running pre-build integrity checks...', 'info');
    execSync('node tools/integrity-check.js', { stdio: 'inherit' });
    log('Integrity verified.', 'success');

    // 2. RAG Index Synchronization
    log('Synchronizing RAG index cache...', 'info');
    execSync('node tools/sync-rag.mjs', { stdio: 'inherit' });
    log('RAG index synchronized.', 'success');

    // 3. Clean/Create dist folder
    if (fs.existsSync(DIST_DIR)) {
      log('Cleaning existing dist folder...', 'info');
      try {
        // Try to delete the folder first
        fs.rmSync(DIST_DIR, { recursive: true, force: true });
        fs.mkdirSync(DIST_DIR);
      } catch (e) {
        log('Warning: Could not remove dist folder directly. Emptying contents instead.', 'warn');
        const files = fs.readdirSync(DIST_DIR);
        for (const file of files) {
          fs.rmSync(path.join(DIST_DIR, file), { recursive: true, force: true });
        }
      }
    } else {
      fs.mkdirSync(DIST_DIR);
    }

    // 4. Copy Directories
    INCLUDE_DIRS.forEach(dir => {
      const src = path.join(BASE_DIR, dir);
      const dest = path.join(DIST_DIR, dir);
      if (fs.existsSync(src)) {
        log(`Copying ${dir}/...`, 'info');
        fs.cpSync(src, dest, { recursive: true });
      }
    });

    // 5. Copy Root Files
    INCLUDE_FILES.forEach(file => {
      const src = path.join(BASE_DIR, file);
      const dest = path.join(DIST_DIR, file);
      if (fs.existsSync(src)) {
        log(`Copying ${file}...`, 'info');
        fs.copyFileSync(src, dest);
      }
    });

    // 6. Production Config Injection
    log('Injecting production configuration...', 'info');
    const configPath = path.join(DIST_DIR, 'js', 'release-config.js');
    if (fs.existsSync(configPath)) {
      let configContent = fs.readFileSync(configPath, 'utf8');
      // Force IS_DEV to false and IS_BETA based on current logic
      configContent = configContent.replace(/IS_DEV:\s*true/g, 'IS_DEV: false');
      fs.writeFileSync(configPath, configContent);
      log('Production flags set: IS_DEV = false.', 'success');
    }

    // 7. Verify Cache Manifest
    log('Verifying distribution cache manifest...', 'info');
    execSync('node tools/verify-cache.js', { stdio: 'inherit' });

    log('Build complete! Distribution package is ready in the dist/ folder.', 'success');
  } catch (err) {
    log(`Build failed during gated step: ${err.message}`, 'error');
    process.exit(1);
  }
}

build().catch(err => {
  log(`Build failed: ${err.message}`, 'error');
  process.exit(1);
});
