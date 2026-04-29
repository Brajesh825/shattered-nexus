/**
 * tile-editor.js — Architect Pro Map Editor
 */
class TileEditor {
    constructor() {
        this.config = {
            width: 100,
            height: 100,
            tileSize: 32,
            zoom: 1.0
        };

        this.state = {
            map: [], // 3 layers
            currentLayer: 0,
            currentTile: 1,
            currentStamp: null,
            currentTool: 'brush', // brush, fill, rect, eyedropper
            panOffset: { x: 0, y: 0 },
            isMouseDown: false,
            isPanning: false,
            lastMousePos: { x: 0, y: 0 },
            showCollision: false,
            showAll: false,
            spaceDown: false,
            history: []
        };

        this.elements = {
            canvas: document.getElementById('editorCanvas'),
            minimap: document.getElementById('minimap'),
            palette: document.getElementById('palette'),
            assets: document.getElementById('assets-gallery'),
            stamps: document.getElementById('stamps-menu'),
            coords: document.getElementById('coords'),
            wrapper: document.getElementById('editor-wrapper'),
            brushPreview: document.getElementById('brush-preview')
        };

        this.ctx = this.elements.canvas.getContext('2d');
        
        // Cache for rendering
        this.cache = {
            spritesheet: new Image(),
            oak: new Image(), pine: new Image(), shrub: new Image(), boulder: new Image(),
            mushroom: new Image(), flower: new Image(), crystal: new Image(), lily: new Image(),
            dead_tree: new Image(), well: new Image(), market: new Image(), chest: new Image(),
            statue: new Image()
        };

        this.init();
        
        // Auto-load default map
        setTimeout(() => this.switchMap('verdant_vale'), 100);
    }

    async init() {
        this.initMap();
        this.loadCache();
        this.initTabs();
        this.initTools();
        this.initPalette();
        this.initAssets();
        this.initStamps();
        this.initLayerControls();
        this.initEvents();
        this.render();
    }

    loadCache() {
        // Automatically cache all unique SVGs found in tile definitions
        const uniqueSvgs = new Set();
        Object.values(TILE_DEFS).forEach(def => {
            if (def.svgAsset) uniqueSvgs.add(def.svgAsset);
        });

        uniqueSvgs.forEach(key => {
            if (!this.cache[key]) this.cache[key] = new Image();
            this.cache[key].src = `../images/environment/svg/${key}.svg`;
            this.cache[key].onload = () => this.render();
            this.cache[key].onerror = () => {
                this.cache[key].src = `../images/environment/${key}.png`;
            };
        });
        
        // Initial render to show procedural tiles
        this.render();
    }

    initMap() {
        for (let l = 0; l < 3; l++) {
            const layer = [];
            for (let y = 0; y < this.config.height; y++) {
                layer[y] = new Array(this.config.width).fill(0);
            }
            this.state.map[l] = layer;
        }

        // Center on start
        setTimeout(() => {
            const wrapper = this.elements.wrapper;
            const c = this.elements.canvas;
            wrapper.scrollLeft = (c.width + 1000 - wrapper.clientWidth) / 2;
            wrapper.scrollTop = (c.height + 1000 - wrapper.clientHeight) / 2;
        }, 100);
    }

    initTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            };
        });
    }

    initTools() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.onclick = () => {
                if (btn.dataset.tool === 'collision') {
                    this.toggleCollision();
                    return;
                }
                document.querySelectorAll('.tool-btn:not([data-tool="collision"])').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                this.state.currentTool = btn.dataset.tool;
            };
        });

        // Keybinds
        window.addEventListener('keydown', (e) => {
            if (e.key === 'b') this.setTool('brush');
            if (e.key === 'g') this.setTool('fill');
            if (e.key === 'r') this.setTool('rect');
            if (e.key === 'i') this.setTool('eyedropper');
            if (e.key === 'c') this.toggleCollision();
        });
    }

    setTool(tool) {
        document.querySelector(`.tool-btn[data-tool="${tool}"]`)?.click();
    }

    initPalette() {
        this.elements.palette.innerHTML = '';
        const terrainIds = Object.keys(TILE_DEFS).filter(id => !TILE_DEFS[id].svgAsset);
        
        terrainIds.forEach(id => {
            const def = TILE_DEFS[id];
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            if (id == this.state.currentTile) swatch.classList.add('active');
            
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            // Draw with a slight brightness boost for the UI
            this.drawPreview(ctx, id, 64);
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(0, 0, 64, 64);
            
            swatch.appendChild(canvas);
            const labelText = def.name.length > 10 ? def.name.slice(0, 8) + '..' : def.name;
            swatch.innerHTML += `<div class="swatch-label">${labelText}</div>`;
            swatch.onclick = () => {
                this.state.currentTile = id;
                this.state.currentStamp = null;
                document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                this.updateBrushPreview();
            };
            this.elements.palette.appendChild(swatch);
        });
    }

    initAssets() {
        this.elements.assets.innerHTML = '';
        const envAssets = [
            'oak', 'pine', 'shrub', 'boulder', 'mushroom', 'flower', 'crystal', 'lily', 'dead_tree', 'well', 'market', 'chest', 'statue',
            'fountain', 'obelisk', 'tombstone', 'pillar_broken', 'wagon', 'tent', 'campfire', 'signpost', 'street_lamp', 'archway',
            'void_rift', 'cursed_idol', 'skeleton', 'floating_crystal', 'ancient_pillar', 'withered_vine', 'sacrificial_altar', 'void_spires', 'iron_maiden', 'magic_circle'
        ];

        // Filter TILE_DEFS to find IDs matching these assets
        const assetMap = {};
        Object.keys(TILE_DEFS).forEach(id => {
            const def = TILE_DEFS[id];
            if (def.svgAsset) assetMap[def.svgAsset] = id;
        });

        envAssets.forEach(key => {
            const id = assetMap[key];
            if (!id) return;

            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            
            const img = document.createElement('img');
            img.src = `../images/environment/svg/${key}.svg`;
            img.onerror = () => { img.src = `../images/environment/${key}.png`; };
            
            swatch.appendChild(img);
            swatch.innerHTML += `<div class="swatch-label">${key}</div>`;
            swatch.onclick = () => {
                this.state.currentTile = id;
                this.state.currentStamp = null;
                document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
            };
            this.elements.assets.appendChild(swatch);
        });
    }

    initStamps() {
        Object.keys(OBJECT_STAMPS).forEach(key => {
            const stamp = OBJECT_STAMPS[key];
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            this.drawStampPreview(canvas.getContext('2d'), stamp, 64);
            
            swatch.appendChild(canvas);
            swatch.innerHTML += `<div class="swatch-label">${stamp.name}</div>`;
            swatch.onclick = () => {
                this.state.currentStamp = stamp;
                document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
            };
            this.elements.stamps.appendChild(swatch);
        });
    }

    initLayerControls() {
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.layer-btn').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                this.state.currentLayer = parseInt(btn.dataset.layer);
                this.state.showAll = false; // Auto-isolate when switching
                this.updateShowAllButton();
                this.render();
            };
        });
    }

    initEvents() {
        const c = this.elements.canvas;
        
        // Scroll & Zoom Handler - Using addEventListener with passive: false to prevent browser zoom
        window.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const factor = Math.pow(1.1, -e.deltaY / 100);
                const oldZoom = this.config.zoom;
                const newZoom = Math.max(0.1, Math.min(10, oldZoom * factor));
                
                if (oldZoom !== newZoom) {
                    this.config.zoom = newZoom;
                    this.render();
                    this.updateBrushPreview(e);
                }
            } else {
                // Standard Scrolling
                const wrapper = this.elements.wrapper;
                if (e.shiftKey) {
                    wrapper.scrollLeft += e.deltaY;
                } else {
                    wrapper.scrollTop += e.deltaY;
                }
                this.updateBrushPreview(e);
            }
        }, { passive: false });

        // Keybinds
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.state.spaceDown = true;
                this.elements.canvas.style.cursor = 'grab';
            }
            const keyMap = { 'b': 'brush', 'g': 'fill', 'r': 'rect', 'i': 'eyedropper', 'c': 'collision' };
            if (keyMap[e.key]) {
                if (e.key === 'c') this.toggleCollision();
                else this.setTool(keyMap[e.key]);
            }
            if (e.key === 'x' || e.key === 'Delete') {
                this.state.currentTile = 0;
                this.state.currentStamp = null;
                document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                this.updateBrushPreview();
            }
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.downloadMap();
            }
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.state.spaceDown = false;
                this.elements.canvas.style.cursor = 'crosshair';
            }
        });

        // Mouse Handlers
        c.oncontextmenu = (e) => e.preventDefault(); // Disable right-click menu

        c.onmousedown = (e) => {
            if (e.button === 1 || (e.button === 0 && this.state.spaceDown)) {
                this.state.isPanning = true;
                this.state.lastMousePos = { x: e.clientX, y: e.clientY };
                this.elements.canvas.style.cursor = 'grabbing';
                return;
            }
            if (e.button === 0 || e.button === 2) {
                this.saveHistory();
                this.state.isMouseDown = true;
                this.handleAction(e);
            }
        };

        window.onmouseup = () => {
            this.state.isMouseDown = false;
            this.state.isPanning = false;
            this.elements.canvas.style.cursor = this.state.spaceDown ? 'grab' : 'crosshair';
        };

        c.onmousemove = (e) => {
            this.updateCoords(e);
            if (this.state.isPanning) {
                const dx = e.clientX - this.state.lastMousePos.x;
                const dy = e.clientY - this.state.lastMousePos.y;
                const wrapper = this.elements.wrapper;
                wrapper.scrollLeft -= dx;
                wrapper.scrollTop -= dy;
                this.state.lastMousePos = { x: e.clientX, y: e.clientY };
                return;
            }
            if (this.state.isMouseDown) this.handleAction(e);
            this.updateBrushPreview(e);
        };
    }

    updateCoords(e) {
        if (!e) return;
        const rect = this.elements.canvas.getBoundingClientRect();
        const s = this.config.tileSize * this.config.zoom;
        const x = Math.floor((e.clientX - rect.left) / s);
        const y = Math.floor((e.clientY - rect.top) / s);
        this.elements.coords.innerText = `X: ${x}, Y: ${y}`;
    }

    updateBrushPreview(e) {
        const p = this.elements.brushPreview;
        const rect = this.elements.canvas.getBoundingClientRect();
        const s = this.config.tileSize * this.config.zoom;
        
        if (!e) {
            p.innerHTML = '';
            if (!this.state.currentStamp) {
                const canvas = document.createElement('canvas');
                canvas.width = 64; canvas.height = 64;
                canvas.style.width = '100%'; canvas.style.height = '100%';
                this.drawPreview(canvas.getContext('2d'), this.state.currentTile, 64);
                p.appendChild(canvas);
            }
            return;
        }

        const x = Math.floor(e.offsetX / s);
        const y = Math.floor(e.offsetY / s);
        p.style.left = (x * s + 500) + 'px'; // +500 for wrapper padding
        p.style.top = (y * s + 500) + 'px';

        if (this.state.currentStamp) {
            p.innerHTML = '';
            p.style.width = (this.state.currentStamp.size.w * s) + 'px';
            p.style.height = (this.state.currentStamp.size.h * s) + 'px';
        } else {
            p.style.width = s + 'px';
            p.style.height = s + 'px';
            if (!p.querySelector('canvas')) this.updateBrushPreview();
        }
        p.classList.remove('hidden');
    }

    handleAction(e) {
        const s = this.config.tileSize * this.config.zoom;
        const x = Math.floor(e.offsetX / s);
        const y = Math.floor(e.offsetY / s);

        if (x < 0 || y < 0 || x >= this.config.width || y >= this.config.height) return;

        // Right-click always erases (sets to 0)
        const activeTile = (e.buttons === 2) ? 0 : this.state.currentTile;

        if (this.state.currentTool === 'eyedropper') {
            const id = this.state.map[this.state.currentLayer][y][x];
            if (id !== undefined) {
                this.state.currentTile = id;
                this.state.currentStamp = null;
                this.setTool('brush');
            }
            return;
        }

        if (e.buttons === 2) {
            // Eraser Mode
            this.state.map[this.state.currentLayer][y][x] = 0;
        } else if (this.state.currentStamp) {
            this.applyStamp(x, y, this.state.currentStamp);
        } else if (this.state.currentTool === 'brush' || this.state.currentTool === 'rect') {
            this.state.map[this.state.currentLayer][y][x] = parseInt(activeTile);
        } else if (this.state.currentTool === 'fill') {
            this.floodFill(x, y, activeTile);
        }
        
        this.render();
    }

    floodFill(startX, startY, newId) {
        const layer = this.state.map[this.state.currentLayer];
        const oldId = layer[startY][startX];
        if (oldId === parseInt(newId)) return;

        const stack = [[startX, startY]];
        while (stack.length > 0) {
            const [x, y] = stack.pop();
            if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) continue;
            if (layer[y][x] !== oldId) continue;

            layer[y][x] = parseInt(newId);
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }

    applyStamp(startX, startY, stamp) {
        for (const [lStr, data] of Object.entries(stamp.layers)) {
            const l = parseInt(lStr);
            for (let y = 0; y < stamp.size.h; y++) {
                for (let x = 0; x < stamp.size.w; x++) {
                    const id = data[y][x];
                    if (id === 0) continue;
                    const ty = startY + y;
                    const tx = startX + x;
                    if (tx < this.config.width && ty < this.config.height) {
                        this.state.map[l][ty][tx] = id;
                    }
                }
            }
        }
    }

    drawPreview(ctx, id, size) {
        const def = TILE_DEFS[id];
        if (!def) return;
        
        ctx.clearRect(0, 0, size, size);
        this.drawTerrainTexture(ctx, id, 0, 0, size);

        if (def.svgAsset && this.cache[def.svgAsset]) {
            ctx.drawImage(this.cache[def.svgAsset], 0, 0, size, size);
        }
    }

    drawStampPreview(ctx, stamp, size) {
        const maxDim = Math.max(stamp.size.w, stamp.size.h);
        const scale = size / maxDim;
        
        ctx.clearRect(0, 0, size, size);
        for (const [l, data] of Object.entries(stamp.layers)) {
            for (let y = 0; y < stamp.size.h; y++) {
                for (let x = 0; x < stamp.size.w; x++) {
                    const id = data[y][x];
                    if (id === 0) continue;
                    ctx.save();
                    ctx.translate(x * scale, y * scale);
                    this.drawPreview(ctx, id, scale);
                    ctx.restore();
                }
            }
        }
    }

    render() {
        if (!this.state.map || !this.state.map[0]) return;
        
        const c = this.elements.canvas;
        const s = this.config.tileSize * this.config.zoom;
        c.width = this.config.width * s;
        c.height = this.config.height * s;
        
        this.ctx.clearRect(0, 0, c.width, c.height);

        for (let l = 0; l < 3; l++) {
            // LAYER ISOLATION: Only render current if not in "Show All" mode
            if (!this.state.showAll && l !== this.state.currentLayer) continue; 
            
            // If in isolation mode and on Layer 1 or 2, maybe we want a tiny hint of Layer 0?
            // For now, full transparency as requested.

            const layer = this.state.map[l];
            for (let y = 0; y < this.config.height; y++) {
                for (let x = 0; x < this.config.width; x++) {
                    const id = layer[y][x];
                    if (id === 0) {
                        if (l === 0) {
                            this.ctx.fillStyle = '#05070a';
                            this.ctx.fillRect(x * s, y * s, s, s);
                        }
                        continue;
                    }
                    this.drawTile(this.ctx, id, x * s, y * s, s);
                }
            }
        }

        if (this.state.showCollision) {
            this.renderCollisionOverlay(s);
        }

        this.updateMinimap();
    }

    renderCollisionOverlay(s) {
        this.ctx.save();
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                const isBlocked = this.isTileBlocked(x, y);
                
                const cx = x * s + s/2;
                const cy = y * s + s/2;

                if (isBlocked) {
                    // Draw Red X
                    this.ctx.strokeStyle = '#ff3333';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    const pad = s * 0.3;
                    this.ctx.moveTo(x * s + pad, y * s + pad);
                    this.ctx.lineTo((x + 1) * s - pad, (y + 1) * s - pad);
                    this.ctx.moveTo((x + 1) * s - pad, y * s + pad);
                    this.ctx.lineTo(x * s + pad, (y + 1) * s - pad);
                    this.ctx.stroke();
                } else {
                    // Draw Green Dot
                    this.ctx.fillStyle = '#33ff33';
                    this.ctx.beginPath();
                    this.ctx.arc(cx, cy, s * 0.1, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
        this.ctx.restore();
    }

    isTileBlocked(tx, ty) {
        if (tx < 0 || ty < 0 || tx >= this.config.width || ty >= this.config.height) return true;

        // 1. Direct Layer Check
        const baseTid = this.state.map[0][ty][tx];
        if (baseTid === 0) return true; // If there is no ground (Layer 0), it's blocked (Void)

        for (let l = 0; l < 3; l++) {
            const tid = this.state.map[l][ty][tx];
            if (tid === 0) continue; // Treat 0 as transparent for upper layers
            
            const def = TILE_DEFS[tid];
            if (def && !def.walkable && !def.collisionMask) return true;
        }

        // 2. Scan for Collision Masks and Footprints
        const R = 4; // Scan radius for large assets
        for (let dy = -R; dy <= R; dy++) {
            for (let dx = -R; dx <= R; dx++) {
                const nx = tx + dx;
                const ny = ty + dy;
                if (nx < 0 || ny < 0 || nx >= this.config.width || ny >= this.config.height) continue;

                for (let l = 0; l < 3; l++) {
                    const tid = this.state.map[l][ny][nx];
                    if (tid === 0) continue;
                    
                    const def = TILE_DEFS[tid];
                    if (!def) continue;

                    // Check Collision Mask
                    if (def.collisionMask) {
                        const maskY = ty - ny;
                        const maskX = tx - nx;
                        const rows = def.collisionMask.length;
                        const mY = (rows - 1) - (ty - ny);
                        const mX = tx - nx;
                        
                        if (def.collisionMask[mY] && def.collisionMask[mY][mX] === 'X') {
                            return true;
                        }
                    }

                    // Check Footprint
                    if (def.footprint) {
                        for (const [fx, fy] of def.footprint) {
                            if (nx + fx === tx && ny + fy === ty) return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    toggleShowAll() {
        this.state.showAll = !this.state.showAll;
        this.updateShowAllButton();
        this.render();
    }

    updateShowAllButton() {
        const btn = document.getElementById('toggle-all-layers');
        if (btn) {
            btn.style.background = this.state.showAll ? 'var(--accent)' : 'rgba(255,255,255,0.05)';
            btn.style.color = this.state.showAll ? '#000' : 'var(--accent)';
            btn.innerText = this.state.showAll ? '👁️ ISOLATE' : '👁️ SHOW ALL';
        }
    }

    updateCanvasSize() {
        const s = this.config.tileSize * this.config.zoom;
        this.elements.canvas.width = this.config.width * s;
        this.elements.canvas.height = this.config.height * s;
    }

    exportJSON() {
        // Custom stringifier to keep the map in a readable grid format
        const map = this.state.map;
        let json = "[\n";
        
        map.forEach((layer, lIdx) => {
            json += "  [\n";
            layer.forEach((row, rIdx) => {
                json += "    [" + row.join(",") + "]";
                if (rIdx < layer.length - 1) json += ",";
                json += "\n";
            });
            json += "  ]";
            if (lIdx < map.length - 1) json += ",";
            json += "\n";
        });
        json += "]";
        
        return json;
    }

    setZoom(val) {
        this.state.zoom = parseFloat(val);
        document.getElementById('zoom-value').innerText = Math.round(this.state.zoom * 100) + '%';
        this.updateCanvasSize();
        this.render();
    }

    async switchMap(mapId) {
        const paths = {
            'verdant_vale': '../js/map/data/map-verdant-vale.json',
            'iron_hold': '../js/map/data/map-iron-hold.json'
        };
        const path = paths[mapId];
        if (!path) return alert("Map path unknown: " + mapId);
        
        try {
            const response = await fetch(path);
            const data = await response.json();
            
            // Handle both raw arrays and object wrappers
            const layers = Array.isArray(data) ? data : (data.layers || [data.r0, data.r1, data.r2]);
            
            // Auto-detect dimensions from data
            this.config.height = layers[0].length;
            this.config.width = layers[0][0].length;
            
            this.state.map = layers;
            this.state.mapId = mapId;
            this.state.mapPath = path.replace('../', ''); // Store relative to project root
            
            this.saveHistory();
            this.updateCanvasSize();
            this.render();
            
            console.log(`🗺️ Switched to: ${mapId} (${this.state.mapPath})`);
        } catch (e) {
            console.error("Failed to load map:", e);
        }
    }

    async syncToWorkspace() {
        const json = this.exportJSON();
        const path = this.state.mapPath || 'js/map/data/map-verdant-vale.json';

        console.log("💎 ARCHITECT PRO: SYNC DATA READY");
        
        try {
            const response = await fetch('http://localhost:3000/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: path, data: json })
            });

            if (response.ok) {
                alert(`✅ SYNC SUCCESSFUL!\n\n${path} has been updated and backed up.`);
                console.log("✅ Live Sync Success!");
            } else {
                throw new Error("Server rejected request");
            }
        } catch (e) {
            console.warn("⚠️ Live Sync Bridge not detected. Falling back to Manual Sync.");
            console.log(json);
            alert(`💎 Live Sync Bridge is not running.\n\n1. Run: node tools/sync-server.js\n2. Or copy the data from the console and ask me to sync it manually!`);
        }
    }

    downloadMap() {
        const json = this.exportJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'map-verdant-vale.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    saveHistory() {
        // Deep clone the map
        const snapshot = JSON.parse(JSON.stringify(this.state.map));
        this.state.history.push(snapshot);
        if (this.state.history.length > 50) this.state.history.shift();
    }

    undo() {
        if (this.state.history.length === 0) return;
        const lastMap = this.state.history.pop();
        this.state.map = lastMap;
        this.render();
    }

    toggleCollision() {
        this.state.showCollision = !this.state.showCollision;
        document.querySelector('.tool-btn[data-tool="collision"]')?.classList.toggle('active', this.state.showCollision);
        this.render();
    }

    drawTile(ctx, id, x, y, s) {
        const def = TILE_DEFS[id];
        if (!def) return;

        // Base Terrain
        this.drawTerrainTexture(ctx, id, x, y, s);

        // Assets
        if (def.svgAsset && this.cache[def.svgAsset]) {
            const img = this.cache[def.svgAsset];
            const scale = def.scale || 1;
            const sw = s * scale;
            const sh = s * scale * (img.height / img.width || 1);
            
            // Anchor logic: Assets are usually anchored to bottom-center in VV engine
            const dx = x + (s - sw) / 2;
            const dy = y + s - sh;
            
            ctx.drawImage(img, dx, dy, sw, sh);
        }
    }

    drawTerrainTexture(ctx, id, x, y, s) {
        const def = TILE_DEFS[id];
        const color = def.color || '#1a1a2e';
        const hi = def.hi || color;
        const shadow = def.shadow || color;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, s, s);

        // Add Premium Procedural Details
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, s, s);
        ctx.clip();

        if (def.name.includes('grass')) {
            ctx.fillStyle = hi;
            for(let i=0; i<3; i++) {
                ctx.fillRect(x + (i*s/3) + 2, y + 4, 2, s/3);
                ctx.fillRect(x + (i*s/3) + 6, y + s/2, 2, s/4);
            }
        } else if (def.name.includes('water')) {
            ctx.strokeStyle = hi;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 2, y + s/3);
            ctx.bezierCurveTo(x + s/3, y + 2, x + 2*s/3, y + s/3, x + s - 2, y + 2);
            ctx.stroke();
        } else if (def.name.includes('stone') || def.name.includes('wall') || def.name.includes('mountain')) {
            ctx.fillStyle = shadow;
            ctx.fillRect(x, y + s - 4, s, 4);
            ctx.fillStyle = hi;
            ctx.fillRect(x, y, s, 2);
        } else if (def.name.includes('path') || def.name.includes('sand')) {
            ctx.fillStyle = hi;
            for(let i=0; i<5; i++) {
                ctx.beginPath();
                ctx.arc(x + Math.random()*s, y + Math.random()*s, 1.5, 0, Math.PI*2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    updateMinimap() {
        const mini = this.elements.minimap;
        const mCtx = mini.getContext('2d');
        const w = this.config.width;
        const h = this.config.height;
        mini.width = w;
        mini.height = h;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let color = '#000';
                for (let l = 2; l >= 0; l--) {
                    const id = this.state.map[l][y][x];
                    if (id !== 0) {
                        color = TILE_DEFS[id]?.color || '#333';
                        break;
                    }
                }
                mCtx.fillStyle = color;
                mCtx.fillRect(x, y, 1, 1);
            }
        }
    }

    exportMap() {
        const exportData = {
            metadata: {
                version: "1.1",
                timestamp: new Date().toISOString(),
                dimensions: {
                    width: this.config.width,
                    height: this.config.height
                },
                layers: ["ground", "decoration", "overhead"],
                engine: "Architect Pro"
            },
            palette_schema: "RPG_PLUS_V1",
            data: this.state.map
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `map_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    resetMap() {
        if (confirm('Erase entire map?')) {
            this.initMap();
            this.render();
        }
    }

    importJSON(e) {
        const file = e.target.files[0];
        if (!file) return;

        this.showLoader("Parsing Map Data...");
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const raw = JSON.parse(event.target.result);
                const mapData = Array.isArray(raw) ? raw : (raw.data || raw.layers);
                
                if (!mapData || !Array.isArray(mapData)) {
                    throw new Error("Invalid map data format.");
                }

                this.config.height = mapData[0].length;
                this.config.width  = mapData[0][0].length;
                this.state.map     = mapData;
                
                this.render();
                setTimeout(() => this.hideLoader(), 300);
            } catch (err) {
                this.hideLoader();
                alert("Error loading JSON: " + err.message);
            }
        };
        reader.readAsText(file);
    }

    showLoader(text) {
        let loader = document.getElementById('editor-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'editor-loader';
            loader.innerHTML = `
                <div class="loader-box">
                    <div class="spinner"></div>
                    <div id="loader-text"></div>
                </div>
            `;
            document.body.appendChild(loader);
            
            const style = document.createElement('style');
            style.textContent = `
                #editor-loader {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(15, 23, 42, 0.9); z-index: 10000;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Outfit', sans-serif; color: #38bdf8;
                    transition: opacity 0.3s ease;
                }
                .loader-box { text-align: center; }
                .spinner {
                    width: 40px; height: 40px; border: 3px solid rgba(56, 189, 248, 0.1);
                    border-top-color: #38bdf8; border-radius: 50%;
                    animation: spin 0.8s linear infinite; margin: 0 auto 15px;
                }
                #loader-text { letter-spacing: 2px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `;
            document.head.appendChild(style);
        }
        document.getElementById('loader-text').innerText = text;
        loader.style.opacity = '1';
        loader.style.display = 'flex';
    }

    hideLoader() {
        const loader = document.getElementById('editor-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 300);
        }
    }
}

const editor = new TileEditor();
