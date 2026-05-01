const fs = require('fs');
const path = require('path');

function formatGrid(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Custom stringify to put each row on one line
  let json = "[\n";
  data.forEach((layer, lIdx) => {
    json += "  [\n";
    layer.forEach((row, rIdx) => {
      json += "    [" + row.join(",") + "]";
      if (rIdx < layer.length - 1) json += ",";
      json += "\n";
    });
    json += "  ]";
    if (lIdx < data.length - 1) json += ",";
    json += "\n";
  });
  json += "]";
  
  fs.writeFileSync(filePath, json);
  console.log(`Formatted ${filePath}`);
}

const files = ['map-crystal-cavern-f1.json', 'map-crystal-cavern-f2.json', 'map-crystal-cavern-f3.json'];
files.forEach(f => {
  const p = path.join(__dirname, '..', '..', '..', 'js', 'map', 'data', f);
  if (fs.existsSync(p)) formatGrid(p);
});
