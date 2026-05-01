const fs = require('fs');
const path = require('path');

// Mocking required structures
const MAP_GENERATOR_F1 = {
  width: 60, height: 60,
  generate: function() {
    let rows = [];
    for (let y = 0; y < 60; y++) {
      rows.push(new Array(60).fill(8)); // Cave Wall
    }
    this.carveCavern(rows);
    this.decorate(rows);
    return rows;
  },
  carveCavern: function(rows) {
    for (let y = 10; y < 50; y++) {
      for (let x = 5; x < 55; x++) {
        let dx = x - 30, dy = y - 30;
        let distSq = (dx * dx) + (dy * dy) * 1.5;
        let noise = Math.sin(x * 0.3) * 2 + Math.cos(y * 0.3) * 2;
        if (distSq < 600 + noise * 10) rows[y][x] = 7; // Cave Floor
      }
    }
    this.carveAlcove(rows, 15, 15, 10, 7);
    this.carveAlcove(rows, 45, 45, 8, 18);
  },
  carveAlcove: function(rows, cx, cy, radius, tile) {
    for (let y = cy - radius; y < cy + radius; y++) {
      for (let x = cx - radius; x < cx + radius; x++) {
        if (x < 0 || y < 0 || x >= 60 || y >= 60) continue;
        let dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy < radius * radius) rows[y][x] = tile;
      }
    }
  },
  decorate: function(rows) {
    for (let y = 0; y < 60; y++) {
      for (let x = 0; x < 60; x++) {
        if (rows[y][x] === 7 && Math.random() < 0.1) {
          rows[y][x] = 59;
        }
      }
    }
  }
};

const MAP_GENERATOR_F2 = {
  width: 60, height: 60,
  generate: function() {
    let rows = [];
    for (let y = 0; y < 60; y++) {
      rows.push(new Array(60).fill(17)); // Obsidian Wall
    }
    this.carveComplexTunnels(rows);
    this.carveAlcove(rows, 15, 10, 6, 7);
    this.carveAlcove(rows, 45, 50, 6, 18);
    return rows;
  },
  carveComplexTunnels: function(rows) {
    for (let x = 5; x < 55; x++) {
      for (let y = 28; y <= 32; y++) rows[y][x] = 7;
    }
    for (let i = 0; i < 4; i++) {
      let cx = 15 + i * 12;
      let cy = 30;
      for (let dy = -15; dy <= 15; dy++) {
        let nx = cx + Math.sin(dy * 0.2) * 4;
        let ny = cy + dy;
        if (nx >= 0 && nx < 60 && ny >= 0 && ny < 60) {
          rows[ny][Math.floor(nx)] = 7;
          rows[ny][Math.floor(nx) + 1] = 7;
        }
      }
    }
    for (let y = 0; y < 60; y++) {
      for (let x = 0; x < 60; x++) {
        if (rows[y][x] === 7 && Math.random() < 0.08) rows[y][x] = 59;
      }
    }
  },
  carveAlcove: function(rows, cx, cy, radius, tile) {
    for (let y = cy - radius; y < cy + radius; y++) {
      for (let x = cx - radius; x < cx + radius; x++) {
        if (x < 0 || y < 0 || x >= 60 || y >= 60) continue;
        let dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy < radius * radius) rows[y][x] = tile;
      }
    }
  }
};

const MAP_GENERATOR_F3 = {
  width: 60, height: 60,
  generate: function() {
    let rows = [];
    for (let y = 0; y < 60; y++) {
      rows.push(new Array(60).fill(17)); // Obsidian Wall
    }
    for (let y = 10; y < 50; y++) {
      for (let x = 10; x < 50; x++) {
        let dx = x - 30, dy = y - 30;
        let distSq = (dx * dx) + (dy * dy);
        if (distSq < 400) {
           rows[y][x] = 7;
           if (distSq > 300 && Math.random() < 0.3) rows[y][x] = 59;
        }
      }
    }
    for (let x = 5; x < 15; x++) {
      for (let y = 29; y <= 31; y++) rows[y][x] = 7;
    }
    return rows;
  }
};

function saveMap(id, tiles) {
  // Architect Pro format: [layer0, layer1, layer2]
  const data = [tiles, tiles.map(row => row.map(() => 0)), tiles.map(row => row.map(() => 0))];
  const filePath = path.join(__dirname, '..', '..', '..', 'js', 'map', 'data', `map-crystal-cavern-${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Saved ${filePath}`);
}

saveMap('f1', MAP_GENERATOR_F1.generate());
saveMap('f2', MAP_GENERATOR_F2.generate());
saveMap('f3', MAP_GENERATOR_F3.generate());
