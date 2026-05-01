const fs = require('fs');
const filePath = process.argv[2];

if (!filePath) {
    console.log("Usage: node format-map.js <path-to-json>");
    process.exit(1);
}

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
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
    console.log(`Successfully formatted: ${filePath}`);
} catch (e) {
    console.error("Error formatting map:", e.message);
}
