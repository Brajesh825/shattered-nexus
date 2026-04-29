
/**
 * snapshot_verdant_vale.js
 * Generates the 3-layer tile data for Verdant Vale and saves it to a JSON file.
 */
const fs = require('fs');

function generateVerdantValeData() {
    const L0 = [], L1 = [], L2 = [];
    const W = 60, H = 50;
    
    // Reproducing the procedural logic from map-verdant-vale.js
    for (let y = 0; y < H; y++) {
        const r0 = new Array(W).fill(1); // Floor (Default Grass)
        const r1 = new Array(W).fill(0); // Decor/Walls
        const r2 = new Array(W).fill(0); // Overhead

        for (let x = 0; x < W; x++) {
            // 1. Core Terrain & Borders
            if (y < 3 || y > H - 4) { r1[x] = 5; }
            else if (x < 3 || x > 57) {
                if (!(x >= 55 && y >= 28 && y <= 31) && !(y === 14)) {
                    r1[x] = 5;
                }
            }

            // 2. The Vertical River
            if (x >= 28 && x <= 32) {
                if (y >= 13 && y <= 15) {
                    if (x === 30 && y === 14) r1[x] = 110; 
                    else if (x === 31 && y === 15) r1[x] = 110;
                    else { r0[x] = 4; r1[x] = 0; } 
                }
                else { r0[x] = 3; r1[x] = 0; }
            }

            // 3. The Town (North West)
            if (x >= 5 && x <= 12 && y >= 5 && y <= 9) { 
                r0[x] = 12; r1[x] = 0;
                if (x === 8 && y === 7) r1[x] = 74;
                if (x === 12 && y === 7) r1[x] = 227;
            }

            // 4. North West Boundary
            if ((x === 3 || x === 14) && y >= 3 && y <= 11) {
                if (y === 7) { r0[x] = 2; r1[x] = 0; } 
                else { r1[x] = 68; }
            }
            if ((y === 3 || y === 11) && x >= 3 && x <= 14) { r1[x] = 68; }

            // 5. The Paths
            if (y === 7 && x > 12 && x < 28) { r0[x] = 2; r1[x] = 0; }
            if (y === 14 && x < 28) { r0[x] = 2; r1[x] = 0; }
            if (x === 27 && y === 12) { r1[x] = 88; } 
            if (y === 14 && x > 32) { 
                r0[x] = 2; r1[x] = 0; 
                if (x === 35) r1[x] = 227;
            }
            if (x === 18 && y > 7 && y < 14) { r0[x] = 2; r1[x] = 0; }

            // 6. The Mountains
            if (x > 45 && y < 12) { r1[x] = 6; }

            // 7. Tall Grass
            if (x > 35 && x < 48 && y > 18 && y < 26) { r1[x] = 40; }

            // 8. Sandy Bank
            if (x >= 33 && x <= 38 && y > 26 && y < 33) { r0[x] = 10; r1[x] = 0; }

            // 9. The Cave
            if (x >= 55 && x <= 58 && y >= 28 && y <= 31) {
                if (x === 55 || x === 58 || y === 28 || y === 31) r1[x] = 8;
                else { r0[x] = 7; r1[x] = 0; }
            }

            // 11. Ruins
            if (x < 25 && y >= 22 && y < 45 && r0[x] === 1) {
                const sWallX = (x === 5 || x === 21);
                const sWallY = (y === 24 || y === 38);
                if ((sWallX && y >= 24 && y <= 38) || (sWallY && x >= 5 && x <= 21)) {
                     if (y === 31 && x === 21) { r0[x] = 2; r1[x] = 0; } 
                     else { r1[x] = 68; }
                } else {
                    const dx = x - 13;
                    const dy = y - 31;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 5) {
                        if (d < 0.8) r1[x] = 88;    
                        else if (d < 2) r1[x] = 86; 
                        else if (d < 3.5) r1[x] = 87; 
                        else if (x === 15 && y === 33) r1[x] = 239;
                        else { r0[x] = 73; r1[x] = 0; }            
                    }
                }
            }

            // 12. Western Refugee Settlement
            if (x >= 16 && x <= 25 && y >= 16 && y <= 22 && r0[x] === 1) {
                const wWallX = (x === 16 || x === 25);
                const wWallY = (y === 16 || y === 22);
                if ((wWallX && y >= 16 && y <= 22) || (wWallY && x >= 16 && x <= 25)) {
                    if (x === 18 && y === 16) { r0[x] = 2; r1[x] = 0; } 
                    else { r1[x] = 68; }
                } else {
                    r0[x] = 12; r1[x] = 0;
                    if (x === 22 && y === 17) r1[x] = 225; // Northeast Tent
                    if (x === 22 && y === 21) r1[x] = 225; // Southeast Tent
                    if (x === 19 && y === 18) r1[x] = 226; // Central Campfire
                    if (x === 16 && y === 22) r1[x] = 224; // Southwest Wagon
                }
            }

            // 14. The Ruined Kingdom
            if (x >= 33 && x <= 58 && y >= 35 && y <= 46 && (r0[x] === 1 || r0[x] === 10)) {
                const rWallX = (x === 33 || x === 58);
                const rWallY = (y === 35 || y === 46);
                const isEntrance = (x >= 42 && x <= 44 && y === 35);
                if ((rWallX && y >= 35 && y <= 46) || (rWallY && x >= 33 && x <= 58)) {
                    if (isEntrance) { r0[x] = 2; r1[x] = 0; } 
                    else { r1[x] = 68; }
                } else {
                    const dx = x - 52;
                    const dy = y - 41;
                    const dToThrone = Math.sqrt(dx * dx + dy * dy);
                    if (dToThrone < 1.5) {
                        r1[x] = 80;
                        if (x === 52 && y === 43) r1[x] = 236;
                    } else if ((x === 38 && y === 40) || (x === 50 && y === 37)) {
                        r1[x] = 234;
                    } else {
                        r0[x] = 73; r1[x] = 0;
                    }
                }
            }

            // 15. The Eastern Corrupted Wilds
            if (x === 48 && y === 20) r1[x] = 230; 
        }
        L0.push(r0); L1.push(r1); L2.push(r2);
    }
    return [L0, L1, L2];
}

const data = generateVerdantValeData();
fs.writeFileSync('c:/Users/ASUS/VVI/rpg+/js/map/data/map-verdant-vale.json', JSON.stringify(data));
console.log('Verdant Vale snapshot saved!');
