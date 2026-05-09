const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { test } = require('./test-harness.js');

const ROOT = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function parseShellAssets() {
  const sw = read('sw.js');
  const match = sw.match(/const SHELL_ASSETS = \[([\s\S]*?)\];/);
  assert(match, 'sw.js must define SHELL_ASSETS');

  return new Set(
    [...match[1].matchAll(/'([^']+)'/g)]
      .map(m => m[1])
      .filter(asset => asset !== './')
  );
}

function htmlAssets() {
  const html = read('index.html');
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => `./${m[1]}`);
  const styles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => `./${m[1]}`);
  return [...new Set([...styles, ...scripts])];
}

function mapJsonAssets() {
  const mapDir = path.join(ROOT, 'js', 'map', 'data');
  return fs.readdirSync(mapDir)
    .filter(file => file.endsWith('.json'))
    .map(file => `./js/map/data/${file}`);
}

test('service worker precaches every active script, stylesheet, and map json', () => {
  const cached = parseShellAssets();
  const required = [...htmlAssets(), ...mapJsonAssets()];
  const missing = required.filter(asset => !cached.has(asset));

  assert.deepStrictEqual(missing, [], `Missing from SHELL_ASSETS: ${missing.join(', ')}`);
});

test('service worker cached assets exist on disk', () => {
  const cached = parseShellAssets();
  const missing = [...cached]
    .map(asset => asset.replace(/^\.\//, ''))
    .filter(asset => !fs.existsSync(path.join(ROOT, asset)));

  assert.deepStrictEqual(missing, [], `Cached assets missing on disk: ${missing.join(', ')}`);
});
