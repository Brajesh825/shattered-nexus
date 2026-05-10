const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IMAGE_EXT = /\.(png|webp|svg|jpg|jpeg)$/i;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const images = walk(path.join(ROOT, 'images'))
  .filter(file => IMAGE_EXT.test(file))
  .map(file => ({
    file: path.relative(ROOT, file).replace(/\\/g, '/'),
    bytes: fs.statSync(file).size
  }))
  .sort((a, b) => b.bytes - a.bytes);

const total = images.reduce((sum, item) => sum + item.bytes, 0);
const normalSpirit = images.filter(item => /images\/characters\/spirits\/.*_sprite\.png$/.test(item.file));
const lowSpirit = images.filter(item => /images\/characters\/spirits\/.*_sprite_low\.webp$/.test(item.file));
const mapSheets = images.filter(item => /images\/characters\/map\/sheets\/.*_sheet\.png$/.test(item.file));
const lowMapSheets = images.filter(item => /images\/characters\/map\/sheets\/.*_sheet_low\.webp$/.test(item.file));

function groupTotal(label, rows) {
  const bytes = rows.reduce((sum, item) => sum + item.bytes, 0);
  console.log(`${label}: ${rows.length} files, ${formatBytes(bytes)}`);
}

console.log(`Image assets: ${images.length} files, ${formatBytes(total)}`);
groupTotal('Spirit PNG sheets', normalSpirit);
groupTotal('Spirit low WebP sheets', lowSpirit);
groupTotal('Map PNG sheets', mapSheets);
groupTotal('Map low WebP sheets', lowMapSheets);

console.log('\nLargest assets:');
images.slice(0, 15).forEach(item => {
  console.log(`${formatBytes(item.bytes).padStart(9)}  ${item.file}`);
});
