const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * ARCHITECT PRO: Live Sync Bridge
 * This server allows the browser editor to save files directly to your workspace.
 */

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Enable CORS so the browser can talk to us
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/sync') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { path: targetPath, data } = JSON.parse(body);
                const absolutePath = path.join(__dirname, '..', targetPath);

                // 1. Create Backup
                if (fs.existsSync(absolutePath)) {
                    fs.copyFileSync(absolutePath, absolutePath + '.bak');
                }

                // 2. Save File
                fs.writeFileSync(absolutePath, data);

                console.log(`[SYNC] Successfully updated: ${targetPath}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', path: targetPath }));
            } catch (e) {
                console.error(`[SYNC ERROR] Failed: ${e.message}`);
                res.writeHead(500);
                res.end(e.message);
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`\n💎 ARCHITECT PRO: LIVE SYNC BRIDGE`);
    console.log(`📡 Listening on http://localhost:${PORT}`);
    console.log(`🚀 Click SYNC in the editor to update your files automatically!\n`);
});
