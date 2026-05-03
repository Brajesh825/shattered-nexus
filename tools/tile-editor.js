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
            history: [],
            enemies: [],
            npcs: [],
            enemyData: [],
            selection: null, // {x, y, w, h}
            clipboard: null, // {tiles: [L0, L1, L2], w, h}
            isSelecting: false,
            selectionStart: null
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

        // Registry: svgAsset key -> [{ctx, id, size}] for palette/asset swatches that need refresh
        this.svgSwatchRegistry = {};

        this.init();
        
        // Auto-load default map
        setTimeout(() => this.switchMap('verdant_vale'), 100);
    }

    async init() {
        this.initMap();
        await this.loadEnemyData();
        this.loadCache();
        this.initTabs();
        this.initTools();
        this.initPalette();
        this.initAssets();
        this.initStamps();
        this.initLayerControls();
        this.initResizeUI();
        this.initEvents();
        this.render();
    }

    initResizeUI() {
        document.getElementById('map-w').value = this.config.width;
        document.getElementById('map-h').value = this.config.height;
    }

    resizeMapFromUI() {
        const w = parseInt(document.getElementById('map-w').value);
        const h = parseInt(document.getElementById('map-h').value);
        if (isNaN(w) || isNaN(h) || w < 1 || h < 1) return;
        this.resizeMap(w, h);
    }

    resizeMap(newW, newH) {
        const oldW = this.config.width;
        const oldH = this.config.height;

        // Create new layers and copy data
        const newMap = [];
        for (let l = 0; l < 3; l++) {
            const layer = [];
            for (let y = 0; y < newH; y++) {
                layer[y] = new Array(newW).fill(0);
                if (y < oldH) {
                    for (let x = 0; x < oldW; x++) {
                        layer[y][x] = this.state.map[l][y][x];
                    }
                }
            }
            newMap[l] = layer;
        }

        this.state.map = newMap;
        this.config.width = newW;
        this.config.height = newH;
        this.updateCanvasSize();
        this.render();
        console.log(`[ArchitectPro] Map expanded to ${newW}x${newH}`);
    }

    updateCanvasSize() {
        this.elements.canvas.width = this.config.width * this.config.tileSize;
        this.elements.canvas.height = this.config.height * this.config.tileSize;
    }

    async loadEnemyData() {
        try {
            const res = await fetch('../data/enemies.json');
            this.state.enemyData = await res.json();
            console.log(`[ArchitectPro] Loaded ${this.state.enemyData.length} enemy definitions`);
        } catch (e) {
            console.error("Failed to load enemy data:", e);
        }
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
            this.cache[key].onload = () => {
                this.render();
                this._refreshSwatchesForAsset(key);
            };
            this.cache[key].onerror = () => {
                this.cache[key].src = `../images/environment/${key}.png`;
                this.cache[key].onload = () => {
                    this.render();
                    this._refreshSwatchesForAsset(key);
                };
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

    copySelectionToClipboard() {
        if (!this.state.selection) return;
        const s = this.state.selection;
        const layers = { 0: [], 1: [], 2: [] };
        
        for (let l = 0; l < 3; l++) {
            for (let y = 0; y < s.h; y++) {
                layers[l][y] = [];
                for (let x = 0; x < s.w; x++) {
                    layers[l][y][x] = this.state.map[l][s.y + y][s.x + x];
                }
            }
        }
        
        this.state.clipboard = { 
            name: "Clipboard Stamp",
            layers: layers, 
            size: { w: s.w, h: s.h } 
        };
        this.state.currentStamp = this.state.clipboard;
        console.log(`📋 Copied ${s.w}x${s.h} area to clipboard as stamp`);
        this.setTool('stamp');
    }

    pasteStamp(targetX, targetY) {
        if (!this.state.clipboard) return;
        const cb = this.state.clipboard;
        
        this.saveHistory();
        
        for (let l = 0; l < 3; l++) {
            for (let y = 0; y < cb.h; y++) {
                for (let x = 0; x < cb.w; x++) {
                    const my = targetY + y;
                    const mx = targetX + x;
                    if (my >= 0 && my < this.config.height && mx >= 0 && mx < this.config.width) {
                        this.state.map[l][my][mx] = cb.tiles[l][y][x];
                    }
                }
            }
        }
        this.render();
    }

    setTool(tool) {
        document.querySelector(`.tool-btn[data-tool="${tool}"]`)?.click();
    }

    initPalette() {
        this.elements.palette.innerHTML = '';
        // Show ALL terrain-style tiles (ID < 200 or no svgAsset)
        const terrainIds = Object.keys(TILE_DEFS).filter(id => {
            const numId = parseInt(id);
            return numId < 200 || !TILE_DEFS[id].svgAsset;
        });
        
        terrainIds.forEach(id => {
            const def = TILE_DEFS[id];
            if (def.hidden) return;

            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            if (id == this.state.currentTile) swatch.classList.add('active');
            
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');

            this.drawPreview(ctx, id, 128);

            const label = document.createElement('div');
            label.className = 'swatch-label';
            label.textContent = def.name;
            swatch.appendChild(canvas);
            swatch.appendChild(label);
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
        // Dynamically find all IDs with SVG assets
        const assetIds = Object.keys(TILE_DEFS).filter(id => TILE_DEFS[id].svgAsset);

        assetIds.forEach(id => {
            const def = TILE_DEFS[id];
            if (def.hidden) return;

            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            if (id == this.state.currentTile) swatch.classList.add('active');
            
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');

            this.drawPreview(ctx, id, 128);

            const label = document.createElement('div');
            label.className = 'swatch-label';
            label.textContent = def.name;
            swatch.appendChild(canvas);
            swatch.appendChild(label);
            swatch.onclick = () => {
                this.state.currentTile = id;
                this.state.currentStamp = null;
                document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                this.updateBrushPreview();
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
            canvas.width = 128;
            canvas.height = 128;
            this.drawStampPreview(canvas.getContext('2d'), stamp, 128);

            const label = document.createElement('div');
            label.className = 'swatch-label';
            label.textContent = stamp.name;
            swatch.appendChild(canvas);
            swatch.appendChild(label);
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
            const keyMap = { 'b': 'brush', 'g': 'fill', 'r': 'rect', 'i': 'eyedropper', 'e': 'eraser', 'c': 'collision' };
            if (keyMap[e.key]) {
                if (e.key === 'c') this.toggleCollision();
                else this.setTool(keyMap[e.key]);
            }
            if (e.key === 'x' || e.key === 'Delete' || e.key === 'Backspace') {
                if (this.state.selection) {
                    this.deleteSelection(e.shiftKey);
                } else {
                    this.state.currentTile = 0;
                    this.state.currentStamp = null;
                    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                    this.updateBrushPreview();
                }
            }
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.syncToWorkspace();
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                this.exportPNG();
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
            if (this.state.currentTool === 'select' && this.state.isSelecting) {
                this.state.isSelecting = false;
                this.copySelectionToClipboard();
                return;
            }
            this.state.isDrawing = false;
            this.elements.canvas.style.cursor = this.state.spaceDown ? 'grab' : 'crosshair';
        };

        c.onmousemove = (e) => {
            this.updateCoords(e);
            const s = this.config.tileSize * this.config.zoom;
            const tx = Math.floor(e.offsetX / s);
            const ty = Math.floor(e.offsetY / s);

            this.state.mousePos = { x: e.offsetX, y: e.offsetY };

            if (this.state.isPanning) {
                const dx = e.clientX - this.state.lastMousePos.x;
                const dy = e.clientY - this.state.lastMousePos.y;
                this.elements.wrapper.scrollLeft -= dx;
                this.elements.wrapper.scrollTop -= dy;
                this.state.lastMousePos = { x: e.clientX, y: e.clientY };
            } else if (this.state.isMouseDown) {
                if (this.state.currentTool === 'select' && this.state.isSelecting) {
                    const x1 = Math.min(this.state.selectionStart.x, tx);
                    const y1 = Math.min(this.state.selectionStart.y, ty);
                    const x2 = Math.max(this.state.selectionStart.x, tx);
                    const y2 = Math.max(this.state.selectionStart.y, ty);
                    this.state.selection = { x: x1, y: y1, w: x2 - x1 + 1, h: y2 - y1 + 1 };
                    this.render();
                } else if (this.state.currentTool === 'brush' || e.buttons === 2 || this.state.currentTool === 'eraser') {
                    this.handleAction(e);
                }
            } else if (this.state.currentTool === 'stamp') {
                this.render();
            }
            this.updateBrushPreview(e);
        };

        c.onmouseleave = () => {
            this.elements.brushPreview.classList.add('hidden');
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
        const s = this.config.tileSize * this.config.zoom;
        
        if (!e) {
            p.innerHTML = '';
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 64;
            canvas.style.width = '100%'; canvas.style.height = '100%';
            this.drawPreview(canvas.getContext('2d'), this.state.currentTile, 64);
            p.appendChild(canvas);
            return;
        }

        const x = Math.floor(e.offsetX / s);
        const y = Math.floor(e.offsetY / s);
        
        // Dynamic Positioning: Account for centered canvas and scrolling
        const c = this.elements.canvas;
        p.style.left = (x * s + c.offsetLeft) + 'px';
        p.style.top = (y * s + c.offsetTop) + 'px';

        p.innerHTML = '';
        const canvas = document.createElement('canvas');
        p.appendChild(canvas);
        const pCtx = canvas.getContext('2d');

        if (this.state.currentStamp) {
            const { w, h } = this.state.currentStamp.size;
            p.style.width = (w * s) + 'px';
            p.style.height = (h * s) + 'px';
            canvas.width = w * s;
            canvas.height = h * s;
            this.drawStampPreview(pCtx, this.state.currentStamp, Math.max(w * s, h * s));
        } else {
            const def = TILE_DEFS[this.state.currentTile];
            const scale = def ? (def.vScale || def.scale || 1) : 1;
            const visualSize = s * scale;
            
            p.style.width = s + 'px'; // Base tile size for click area
            p.style.height = s + 'px';
            canvas.width = visualSize;
            canvas.height = visualSize;
            
            // Draw scaled preview anchored to bottom
            this.drawPreview(pCtx, this.state.currentTile, visualSize);
            
            // Adjust canvas position if scaled
            canvas.style.position = 'absolute';
            canvas.style.bottom = '0';
            canvas.style.left = '50%';
            canvas.style.transform = 'translateX(-50%)';
        }
        
        p.style.opacity = '0.6';
        p.classList.remove('hidden');
    }

    handleAction(e) {
        const s = this.config.tileSize * this.config.zoom;
        const x = Math.floor(e.offsetX / s);
        const y = Math.floor(e.offsetY / s);

        if (x < 0 || y < 0 || x >= this.config.width || y >= this.config.height) return;

        // Erase if: Right-click OR Eraser tool is active
        const activeTile = (e.buttons === 2 || this.state.currentTool === 'eraser') ? 0 : this.state.currentTile;

        if (this.state.currentTool === 'select') {
            this.state.isSelecting = true;
            this.state.selectionStart = { x, y };
            this.state.selection = { x, y, w: 1, h: 1 };
            return;
        }

        if (this.state.currentTool === 'eyedropper') {
            const id = this.state.map[this.state.currentLayer][y][x];
            if (id !== undefined) {
                this.state.currentTile = id;
                this.state.currentStamp = null;
                this.setTool('brush');
            }
            return;
        }

        if (e.buttons === 2 || this.state.currentTool === 'eraser') {
            // Eraser Mode: Support Shift+Click for Global Wipe (All Layers)
            if (e.shiftKey) {
                for (let l = 0; l < 3; l++) this.state.map[l][y][x] = 0;
            } else {
                this.state.map[this.state.currentLayer][y][x] = 0;
            }
        } else if (this.state.currentStamp) {
            this.applyStamp(x, y, this.state.currentStamp);
        } else if (this.state.currentTool === 'brush' || this.state.currentTool === 'rect') {
            this.state.map[this.state.currentLayer][y][x] = parseInt(activeTile);
        } else if (this.state.currentTool === 'fill') {
            this.floodFill(x, y, activeTile);
        }
        
        this.render();
    }

    deleteSelection(isGlobal = false) {
        if (!this.state.selection) return;
        this.saveHistory();
        const s = this.state.selection;
        
        // Deep Wipe: Delete from ALL layers if Shift is held, otherwise just current
        const startLayer = isGlobal ? 0 : this.state.currentLayer;
        const endLayer = isGlobal ? 2 : this.state.currentLayer;

        for (let l = startLayer; l <= endLayer; l++) {
            for (let y = s.y; y < s.y + s.h; y++) {
                for (let x = s.x; x < s.x + s.w; x++) {
                    if (this.state.map[l][y]) this.state.map[l][y][x] = 0;
                }
            }
        }
        this.render();
        console.log(`🧹 Wiped layers ${startLayer}-${endLayer} in selection: ${s.w}x${s.h}`);
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
        if (!stamp || !stamp.layers) return;
        
        this.saveHistory();
        
        for (const [lStr, data] of Object.entries(stamp.layers)) {
            const l = parseInt(lStr);
            for (let y = 0; y < stamp.size.h; y++) {
                for (let x = 0; x < stamp.size.w; x++) {
                    const id = data[y][x];
                    if (id === 0 && l > 0) continue; // Transparency for upper layers
                    const ty = startY + y;
                    const tx = startX + x;
                    if (tx < this.config.width && ty < this.config.height) {
                        this.state.map[l][ty][tx] = id;
                    }
                }
            }
        }
        this.render();
    }

    drawPreview(ctx, id, size) {
        const def = TILE_DEFS[id];
        if (!def) return;

        ctx.clearRect(0, 0, size, size);
        ctx.imageSmoothingEnabled = true;

        // Subtle background border for contrast
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(0, 0, size, size);

        // Always draw terrain color as base
        this.drawTerrainTexture(ctx, id, 0, 0, size);

        if (def.svgAsset) {
            const img = this.cache[def.svgAsset];
            const isReady = img && img.complete && img.naturalWidth > 0;

            // Register this canvas for refresh when the SVG finishes loading
            if (!this.svgSwatchRegistry[def.svgAsset]) {
                this.svgSwatchRegistry[def.svgAsset] = [];
            }
            const already = this.svgSwatchRegistry[def.svgAsset].some(e => e.ctx === ctx);
            if (!already) {
                this.svgSwatchRegistry[def.svgAsset].push({ ctx, id, size });
            }

            if (isReady) {
                // Scale large-vScale assets to fit snugly; normal assets fill the box
                const vScale = def.vScale || 1;
                const drawW = vScale > 1.5 ? size * 0.85 : size;
                const drawH = drawW * (img.naturalHeight / img.naturalWidth);
                const dx = (size - drawW) / 2;
                const dy = Math.max(0, size - drawH); // bottom-anchor like the game engine
                
                // Safe Draw: Ensure image is not in a broken state
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, dx, dy, drawW, Math.min(drawH, size));
                }
            }
        }

        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
    }

    _refreshSwatchesForAsset(svgKey) {
        const entries = this.svgSwatchRegistry[svgKey];
        if (!entries) return;
        entries.forEach(({ ctx, id, size }) => {
            this.drawPreview(ctx, id, size);
        });
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
        
        // Match canvas dimensions to map data
        c.width = this.config.width * s;
        c.height = this.config.height * s;
        
        this.ctx.clearRect(0, 0, c.width, c.height);

        // Universal Composite: Loop through all 3 layers
        for (let l = 0; l < 3; l++) {
            const isCurrent = this.state.currentLayer === l;
            
            // Apply Opacity Masking:
            // - If showAll is ON: All layers at 100% (Game Preview)
            // - If showAll is OFF: Non-active layers at 40% (Editor Focus)
            this.ctx.globalAlpha = (this.state.showAll || isCurrent) ? 1.0 : 0.4;
            this.renderLayer(this.ctx, l, s);
        }
        
        this.ctx.globalAlpha = 1.0;

        // Overlays
        if (this.state.showCollision) {
            this.renderCollisionOverlay(this.ctx, s);
        }
        this.renderEntities(this.ctx, s);
        
        if (this.state.selection) {
            this.renderSelectionBox(s);
        }
        
        if (this.state.currentTool === 'stamp' && this.state.currentStamp) {
            this.renderStampPreview(s);
        }

        this.updateMinimap();
    }

    renderLayer(ctx, l, s) {
        const layer = this.state.map[l];
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                const id = layer[y][x];
                
                if (id === 0) {
                    // Draw base void for Layer 0
                    if (l === 0) {
                        ctx.fillStyle = '#05070a';
                        ctx.fillRect(x * s, y * s, s, s);
                    }
                    continue;
                }
                
                this.drawTile(ctx, id, x * s, y * s, s);
            }
        }
    }

    renderSelectionBox(s) {
        const sel = this.state.selection;
        this.ctx.strokeStyle = '#4ade80';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(sel.x * s, sel.y * s, sel.w * s, sel.h * s);
        this.ctx.setLineDash([]);
        
        this.ctx.fillStyle = 'rgba(74, 222, 128, 0.1)';
        this.ctx.fillRect(sel.x * s, sel.y * s, sel.w * s, sel.h * s);
    }

    renderStampPreview(s) {
        const stamp = this.state.currentStamp;
        if (!stamp || !this.state.mousePos || !stamp.layers) return;
        const tileX = Math.floor(this.state.mousePos.x / s);
        const tileY = Math.floor(this.state.mousePos.y / s);
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        
        for (let l = 0; l < 3; l++) {
            const data = stamp.layers[l];
            if (!data) continue;
            for (let y = 0; y < stamp.size.h; y++) {
                for (let x = 0; x < stamp.size.w; x++) {
                    const tileId = data[y][x];
                    if (tileId === 0 && l > 0) continue; // Don't draw empty overheads
                    this.drawTile(this.ctx, tileId, (tileX + x) * s, (tileY + y) * s, s);
                }
            }
        }
        this.ctx.restore();
        
        // Draw outline
        this.ctx.strokeStyle = '#60a5fa';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(tileX * s, tileY * s, stamp.size.w * s, stamp.size.h * s);
    }

    renderEntities(ctx, s) {
        if (!this.state.enemies && !this.state.npcs) return;

        // Render Player Start (Entry)
        if (this.state.playerStart) {
            const { x, y } = this.state.playerStart;
            const px = x * s;
            const py = y * s;
            
            ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(px + s/2, py + s/2, s * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('🏁 ENTRY', px + s/2, py - 5);
        }

        // Render Objective (Goal)
        if (this.state.objective && this.state.objective.target) {
            const { x, y } = this.state.objective.target;
            const gx = x * s;
            const gy = y * s;

            ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
            ctx.beginPath();
            ctx.arc(gx + s/2, gy + s/2, s * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 10px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('⭐ GOAL', gx + s/2, gy - 5);
        }

        // Render Safe Zones
        this.state.safeZones?.forEach(z => {
            const zx = z.xMin * s;
            const zy = z.yMin * s;
            const zw = (z.xMax - z.xMin + 1) * s;
            const zh = (z.yMax - z.yMin + 1) * s;

            ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
            ctx.fillRect(zx, zy, zw, zh);
            ctx.strokeStyle = '#22c55e';
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(zx, zy, zw, zh);
            ctx.setLineDash([]);
        });

        // Render Triggers (Portals & Messages)
        this.state.triggers?.forEach(t => {
            const tx = t.x * s;
            const ty = t.y * s;
            const tw = (t.w || 1) * s;
            const th = (t.h || 1) * s;

            const isTeleport = t.type === 'teleport';
            ctx.fillStyle = isTeleport ? 'rgba(168, 85, 247, 0.2)' : 'rgba(34, 211, 238, 0.15)';
            ctx.fillRect(tx, ty, tw, th);
            ctx.strokeStyle = isTeleport ? '#a855f7' : '#22d3ee';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.strokeRect(tx, ty, tw, th);
            ctx.setLineDash([]);

            ctx.fillStyle = isTeleport ? '#f3e8ff' : '#cffafe';
            ctx.font = 'bold 9px Outfit';
            ctx.textAlign = 'center';
            const label = isTeleport ? `🌀 ${t.targetMapId}` : `💬 MSG: ${t.id || 'Trigger'}`;
            ctx.fillText(label, tx + tw/2, ty - 4);
        });

        // Render Enemies
        this.state.enemies?.forEach(e => {
            const def = this.state.enemyData.find(d => d.id === e.id);
            if (!def) return;

            const isBoss = e.isBoss || (this.state.objective?.type === 'kill_boss' && e.id === this.state.objective.bossId);

            const canvas = SpriteRenderer.drawEnemyToCanvas(e.id, def.palette);
            const x = e.x * s;
            const y = e.y * s;
            
            ctx.strokeStyle = isBoss ? 'rgba(251, 191, 36, 0.7)' : 'rgba(255, 50, 50, 0.5)';
            ctx.lineWidth = isBoss ? 3 : 2;
            ctx.beginPath();
            ctx.arc(x + s/2, y + s/2, s * (isBoss ? 1.0 : 0.7), 0, Math.PI * 2);
            ctx.stroke();

            if (canvas) ctx.drawImage(canvas, x - s/2, y - s, s * 2, s * 2.3);
            
            ctx.fillStyle = isBoss ? '#fbbf24' : '#fff';
            ctx.font = 'bold 10px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(isBoss ? `👑 ${def.name}` : def.name, x + s/2, y - 5);
        });

        // Render NPCs
        this.state.npcs?.forEach(n => {
            const PARTY_IDS = ['aya','tao','lulu','rei','ria','valka','drake','rex'];
            const charId = n.id || 'aya';
            const isPartyChar = PARTY_IDS.includes(charId);

            // Resolve display name and color from NPC_DEFS if available
            const def = (typeof NPC_DEFS !== 'undefined') ? NPC_DEFS[charId] : null;
            const displayName = def ? def.name : (n.name || n.id);
            const npcColor   = def ? (def.color || '#4ade80') : '#4ade80';

            const x = n.x * s;
            const y = n.y * s;

            // Colored ring per NPC type
            ctx.strokeStyle = npcColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + s/2, y + s/2, s * 0.7, 0, Math.PI * 2);
            ctx.stroke();

            if (isPartyChar) {
                // Party character — draw their sprite sheet frame
                const canvas = SpriteRenderer.drawHeroToCanvas(charId, { skin_color: '#f0c0a0', hair_color: '#402010' }, null);
                if (canvas) ctx.drawImage(canvas, x - s/4, y - s/2, s * 1.5, s * 1.8);
            } else {
                // Generic NPC — colored filled circle with first letter
                ctx.fillStyle = npcColor;
                ctx.beginPath();
                ctx.arc(x + s/2, y + s/2, s * 0.45, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.font = `bold ${Math.max(8, s * 0.4)}px Outfit`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText((charId || '?')[0].toUpperCase(), x + s/2, y + s/2);
                ctx.textBaseline = 'alphabetic';
            }

            // Label above the NPC using their NPC_DEFS color
            ctx.fillStyle = npcColor;
            ctx.font = 'bold 10px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(displayName, x + s/2, y - 5);
        });
    }


    async importMapJS(file) {
        if (!file) return;
        const text = await file.text();
        
        try {
            // Very basic parser: looking for MAP_DEFS[...] = { ... }
            // We'll use a safer approach: extract the object literal string and parse it as JSON-like or eval it in a sandbox
            // For now, let's try to extract the main properties using regex or simple string manipulation
            
            const startIdx = text.indexOf('{');
            const endIdx = text.lastIndexOf('}');
            if (startIdx === -1 || endIdx === -1) throw new Error("Invalid JS Map Format");
            
            const objStr = text.substring(startIdx, endIdx + 1);
            
            // Note: Since this is JS, it might have comments, trailing commas, or function calls.
            // We'll use a trick: create a temporary function to evaluate the object
            const data = new Function(`return ${objStr}`)();
            
            if (data.layers || (data.r0 && data.r1 && data.r2)) {
                this.state.map = data.layers || [data.r0, data.r1, data.r2];
                this.config.width = data.width || this.state.map[0][0].length;
                this.config.height = data.height || this.state.map[0].length;
                this.state.enemies = data.enemies || [];
                this.state.npcs = data.npcs || [];
                
                this.updateCanvasSize();
                this.initResizeUI();
                this.render();
                alert(`✅ IMPORTED: ${data.name || file.name}\n\nEnemies: ${this.state.enemies.length}\nNPCs: ${this.state.npcs.length}`);
            } else {
                throw new Error("Missing layer data in JS file");
            }
        } catch (e) {
            console.error("Import failed:", e);
            alert("❌ FAILED TO IMPORT JS:\n" + e.message);
        }
    }

    renderCollisionOverlay(ctx, s) {
        ctx.save();
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                const isBlocked = this.isTileBlocked(x, y);
                
                const cx = x * s + s/2;
                const cy = y * s + s/2;

                if (isBlocked) {
                    // Draw Red X
                    ctx.strokeStyle = '#ff3333';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    const pad = s * 0.3;
                    ctx.moveTo(x * s + pad, y * s + pad);
                    ctx.lineTo((x + 1) * s - pad, (y + 1) * s - pad);
                    ctx.moveTo((x + 1) * s - pad, y * s + pad);
                    ctx.lineTo(x * s + pad, (y + 1) * s - pad);
                    ctx.stroke();
                } else {
                    // Draw Green Dot
                    ctx.fillStyle = '#33ff33';
                    ctx.beginPath();
                    ctx.arc(cx, cy, s * 0.1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.restore();
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
            'verdant_vale': { json: '../js/map/data/map-verdant-vale.json', js: '../js/map/data/map-verdant-vale.js' },
            'crystal_cavern_f1': { json: '../js/map/data/map-crystal-cavern-f1.json', js: '../js/map/data/map-crystal-cavern-f1.js' },
            'crystal_cavern_f2': { json: '../js/map/data/map-crystal-cavern-f2.json', js: '../js/map/data/map-crystal-cavern-f2.js' },
            'crystal_cavern_f3': { json: '../js/map/data/map-crystal-cavern-f3.json', js: '../js/map/data/map-crystal-cavern-f3.js' },
            'southern_isles': { json: '../js/map/data/map-southern-isles.json', js: '../js/map/data/map-southern-isles.js' },
            'ember_wastes': { js: '../js/map/data/map-ember-wastes.js' },
            'sunken_temple': { js: '../js/map/data/map-sunken-temple.js' },
            'shadow_reach': { js: '../js/map/data/map-shadow-reach.js' },
            'sky_ruins': { js: '../js/map/data/map-sky-ruins.js' },
            'void_citadel': { js: '../js/map/data/map-void-citadel.js' },
            'ashen_foothills': { js: '../js/map/data/map-ashen-foothills.js' },
            'northern_highlands': { js: '../js/map/data/map-northern-highlands.js' },
            'riverlands_crossing': { json: '../js/map/data/map-riverlands-crossing.json', js: '../js/map/data/map-riverlands-crossing.js' },
            'eternal_void': { js: '../js/map/data/map-eternal-void.js' }
        };
        const config = paths[mapId];
        if (!config) return alert("Map path unknown: " + mapId);
        
        try {
            let layers = null;
            let entities = { enemies: [], npcs: [], safeZones: [] };
            let name = mapId;
            
            // Reset dimensions for fresh detection from map data
            this.config.width = 0;
            this.config.height = 0;

            // 1. Handle JS-only or JS-augmented maps
            if (config.js) {
                const jsRes = await fetch(config.js);
                const text = await jsRes.text();
                
                // Robust execution: Load into a sandbox-like MAP_DEFS
                const tempMAP_DEFS = {};
                try {
                    // Create a function that exposes MAP_DEFS to the script
                    const executor = new Function('MAP_DEFS', text);
                    executor(tempMAP_DEFS);
                    
                    const data = Object.values(tempMAP_DEFS)[0];
                    if (data) {
                        let foundLayers = data.layers || (Array.isArray(data.tiles) ? data.tiles : null) || (data.r0 ? [data.r0, data.r1, data.r2] : null);
                        if (foundLayers) layers = foundLayers;
                        
                        entities.enemies = data.enemies || [];
                        entities.npcs = data.npcs || [];
                        entities.playerStart = data.playerStart || null;
                        entities.triggers = data.triggers || [];
                        entities.objective = data.objective || null;
                        entities.safeZones = data.safeZones || [];
                        name = data.name || name;
                        this.config.width = data.width || 0;
                        this.config.height = data.height || 0;
                    }
                } catch (err) {
                    console.error("Failed to execute map JS:", err);
                }
            }

            // 2. Load JSON if available (Verdant Vale fallback)
            if (!layers && config.json) {
                const response = await fetch(config.json);
                const data = await response.json();
                layers = Array.isArray(data) ? data : (data.layers || [data.r0, data.r1, data.r2]);
            }

            if (layers && layers[0]) {
                // Ensure layers is a 3-layer array
                if (layers.length > 0 && layers[0][0] !== undefined && !Array.isArray(layers[0][0])) {
                    // If single layer, wrap it
                    if (!Array.isArray(layers[0])) layers = [layers]; // 1D case (rare)
                    if (typeof layers[0][0] === 'number') layers = [layers, null, null]; // 2D case -> Layer 0
                }
                
                // Auto-detect dimensions if not already set by JS data
                if (!this.config.width || !this.config.height) {
                    this.config.height = layers[0].length;
                    this.config.width = layers[0][0].length;
                }

                // Pad missing layers
                for(let i=0; i<3; i++) {
                    if (!layers[i]) {
                        layers[i] = Array.from({length: this.config.height}, () => new Array(this.config.width).fill(0));
                    }
                }

                this.state.map = layers;
                this.state.enemies = entities.enemies;
                this.state.npcs = entities.npcs;
                this.state.playerStart = entities.playerStart;
                this.state.triggers = entities.triggers;
                this.state.objective = entities.objective;
                this.state.safeZones = entities.safeZones;
                this.state.mapId = mapId;
                this.state.mapPath = (config.js || config.json).replace('../', '');

                this.saveHistory();
                this.updateCanvasSize();
                this.initResizeUI();
                this.render();
                console.log(`🗺️ Switched to: ${name} (${this.state.mapPath})`);
            } else {
                throw new Error("Could not extract map layers from available files.");
            }
        } catch (e) {
            console.error("Failed to load map:", e);
            alert("❌ FAILED TO LOAD MAP: " + e.message);
        }
    }

    async syncToWorkspace() {
        const paths = {
            'verdant_vale': { json: 'js/map/data/map-verdant-vale.json', js: 'js/map/data/map-verdant-vale.js' },
            'crystal_cavern_f1': { json: 'js/map/data/map-crystal-cavern-f1.json', js: 'js/map/data/map-crystal-cavern-f1.js' },
            'crystal_cavern_f2': { json: 'js/map/data/map-crystal-cavern-f2.json', js: 'js/map/data/map-crystal-cavern-f2.js' },
            'crystal_cavern_f3': { json: 'js/map/data/map-crystal-cavern-f3.json', js: 'js/map/data/map-crystal-cavern-f3.js' },
            'southern_isles': { json: 'js/map/data/map-southern-isles.json', js: 'js/map/data/map-southern-isles.js' },
            'ember_wastes': { js: 'js/map/data/map-ember-wastes.js' },
            'sunken_temple': { js: 'js/map/data/map-sunken-temple.js' },
            'shadow_reach': { js: 'js/map/data/map-shadow-reach.js' },
            'sky_ruins': { js: 'js/map/data/map-sky-ruins.js' },
            'void_citadel': { js: 'js/map/data/map-void-citadel.js' },
            'ashen_foothills': { js: 'js/map/data/map-ashen-foothills.js' },
            'northern_highlands': { js: 'js/map/data/map-northern-highlands.js' },
            'riverlands_crossing': { json: 'js/map/data/map-riverlands-crossing.json', js: 'js/map/data/map-riverlands-crossing.js' },
            'eternal_void': { js: 'js/map/data/map-eternal-void.js' }
        };

        const config = paths[this.state.mapId];
        if (!config) return alert("❌ SYNC FAILED: Map path unknown for " + this.state.mapId);

        // PREFER .json for terrain data sync (Prevents overwriting JS metadata)
        const targetPath = config.json || config.js;
        let data = this.exportJSON();

        // If saving to a .js file, we MUST wrap it in the MAP_DEFS assignment
        if (targetPath.endsWith('.js')) {
            data = `MAP_DEFS.${this.state.mapId}.tiles = ${data};`;
        }

        this.showLoader(`Syncing to ${targetPath}...`);

        try {
            const response = await fetch('http://localhost:3000/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: targetPath, data })
            });

            if (response.ok) {
                console.log(`✅ SYNC SUCCESS: Updated ${targetPath}`);
                setTimeout(() => this.hideLoader(), 500);
            } else {
                const err = await response.text();
                throw new Error(err);
            }
        } catch (e) {
            this.hideLoader();
            console.error("❌ SYNC FAILED:", e);
            alert("❌ SYNC FAILED: " + e.message + "\n\nIs 'node tools/sync-server.js' running?");
        }
    }

    downloadMap() {
        const json = this.exportJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.state.mapId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportPNG() {
        this.showLoader("Generating PNG Export...");
        
        // Use a consistent tile size for high quality (32px native)
        const s = 32; 
        const w = this.config.width * s;
        const h = this.config.height * s;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tCtx = tempCanvas.getContext('2d');
        
        // Render all layers at full opacity
        for (let l = 0; l < 3; l++) {
            this.renderLayer(tCtx, l, s);
        }
        
        // Render entities (NPCs, Enemies, Objectives)
        this.renderEntities(tCtx, s);
        
        // Trigger download
        const url = tempCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `map_export_${this.state.mapId}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        this.hideLoader();
        console.log(`📸 MAP EXPORT: Saved ${w}x${h} PNG`);
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
            const scale = def.vScale || def.scale || 1;
            const sw = s * scale;
            const sh = s * scale * (img.height / img.width || 1);
            
            // Anchor logic: Assets are usually anchored to bottom-center in VV engine
            const dx = x + (s - sw) / 2;
            const dy = y + s - sh;

            // Safe Draw: Ensure image is not in a broken state
            if (img.complete && img.naturalWidth > 0) {
                ctx.drawImage(img, dx, dy, sw, sh);
            }
        }
    }

    drawTerrainTexture(ctx, id, x, y, s, t = 0) {
        const def = TILE_DEFS[id];
        if (!def) return;
        const name = (def.name || "").toLowerCase();
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
            const wave = Math.sin(t * 2 + x/10) * 3;
            ctx.moveTo(x + 2, y + s/3 + wave);
            ctx.bezierCurveTo(x + s/3, y + 2 + wave, x + 2*s/3, y + s/3 + wave, x + s - 2, y + 2 + wave);
            ctx.stroke();
        } else if (name.includes('stone') || name.includes('wall') || name.includes('mountain')) {
            ctx.fillStyle = shadow;
            ctx.fillRect(x, y + s - 4, s, 4);
            ctx.fillStyle = hi;
            ctx.fillRect(x, y, s, 2);
        } else if (name.includes('path') || name.includes('sand')) {
            ctx.fillStyle = hi;
            const seed = x * 13 + y * 7;
            for(let i=0; i<5; i++) {
                const rx = ((seed + i * 17) % 100) / 100 * s;
                const ry = ((seed + i * 31) % 100) / 100 * s;
                ctx.beginPath();
                ctx.arc(x + rx, y + ry, 1.2, 0, Math.PI*2);
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
