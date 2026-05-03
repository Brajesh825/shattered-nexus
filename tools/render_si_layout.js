const fs = require('fs');
const { createCanvas } = require('canvas');

const jsonData = JSON.parse(fs.readFileSync('./js/map/data/map-southern-isles.json', 'utf8'));
const layers = Array.isArray(jsonData) ? jsonData : jsonData.layers;

const width = layers[0][0].length;
const height = layers[0].length;
const TILE_SIZE = 8; // Small tile size for top-down preview

const canvas = createCanvas(width * TILE_SIZE, height * TILE_SIZE);
const ctx = canvas.getContext('2d');

// Basic color mapping
const COLORS = {
  // Base Terrain
  36: '#0f5e9c', // Deep Water
  17: '#1ca3ec', // Shallow Water
  3: '#f2d2a9',  // Sand
  2: '#f2d2a9',  // Sand
  19: '#2d4c1e', // Swamp Grass/Moss
  101: '#3d6c2e', // Lighter Swamp Grass
  
  // Structures & Obstacles
  63: '#8b5a2b', // Wood/Stilts
  104: '#4a4a4a', // Stone/Rock
  
  // Default
  0: 'rgba(0,0,0,0)'
};

// Background
ctx.fillStyle = '#081a08'; // Southern Isles bg color
ctx.fillRect(0, 0, canvas.width, canvas.height);

layers.forEach((layer, layerIdx) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tileId = layer[y][x];
      if (tileId > 0) {
        ctx.fillStyle = COLORS[tileId] || (layerIdx === 0 ? '#ff00ff' : 'rgba(0,0,0,0)');
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Add some texture/grid
        if (layerIdx === 0) {
           ctx.strokeStyle = 'rgba(0,0,0,0.1)';
           ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }
});

// Draw story markers
const drawMarker = (x, y, color, label) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE * 1.5, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.fillStyle = '#fff';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(label, x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE - 4);
};

// Player Start
drawMarker(40, 36, '#4ade80', 'Start');
// Boss
drawMarker(40, 8, '#ef4444', 'Leviathan');

// Triggers
ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
ctx.fillRect(10 * TILE_SIZE, 22 * TILE_SIZE, 60 * TILE_SIZE, 4 * TILE_SIZE); // trench_dialogue
ctx.fillRect(35 * TILE_SIZE, 12 * TILE_SIZE, 10 * TILE_SIZE, 4 * TILE_SIZE); // leviathan_wake
ctx.fillRect(36 * TILE_SIZE, 9 * TILE_SIZE, 8 * TILE_SIZE, 4 * TILE_SIZE); // leviathan_approach

const outBuffer = canvas.toBuffer('image/png');
fs.writeFileSync('../.gemini/antigravity/brain/ae0d83a4-00e3-4a72-a605-61c9f6f5b0a3/southern_isles_layout.png', outBuffer);
console.log('Layout generated.');
