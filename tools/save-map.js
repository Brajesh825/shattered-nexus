const fs = require('fs');
const path = require('path');

/**
 * ARCHITECT PRO: Save & Overwrite System
 * Usage: node tools/save-map.js <path-to-json> <raw-json-content>
 * Or: node tools/save-map.js <path-to-json> --from-file <path-to-temp-data>
 */

const targetPath = process.argv[2];
let jsonContent = process.argv[3];

if (!targetPath) {
    console.error("Error: Missing target map path.");
    process.exit(1);
}

// 1. Resolve content
if (process.argv[3] === '--from-file' && process.argv[4]) {
    jsonContent = fs.readFileSync(process.argv[4], 'utf8');
}

if (!jsonContent) {
    console.error("Error: No map data provided.");
    process.exit(1);
}

try {
    const data = JSON.parse(jsonContent);
    const absolutePath = path.resolve(targetPath);
    
    // 2. Create Backup
    if (fs.existsSync(absolutePath)) {
        const backupPath = absolutePath + '.bak';
        fs.copyFileSync(absolutePath, backupPath);
        console.log(`🛡️ Backup created: ${backupPath}`);
    }

    // 3. Format as Elite Grid Array
    let output = "[\n";
    data.forEach((layer, lIdx) => {
        output += "  [\n";
        layer.forEach((row, rIdx) => {
            output += "    [" + row.join(",") + "]";
            if (rIdx < layer.length - 1) output += ",";
            output += "\n";
        });
        output += "  ]";
        if (lIdx < data.length - 1) output += ",";
        output += "\n";
    });
    output += "]";

    // 4. Overwrite
    fs.writeFileSync(absolutePath, output);
    console.log(`✅ Successfully overwritten: ${targetPath}`);
    console.log(`💎 Format: Elite Grid Array (Plain)`);

} catch (e) {
    console.error("❌ Save Failed:", e.message);
}
