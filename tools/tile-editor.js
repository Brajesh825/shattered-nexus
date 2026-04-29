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
            isMouseDown: false
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
    }

    async init() {
        this.manifest = await AssetPreloader.loadManifest();
        this.loadCache();
        this.initMap();
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
        if (this.manifest && this.manifest.assets) {
            Object.keys(this.manifest.assets).forEach(key => {
                if (!this.cache[key]) this.cache[key] = new Image();
                this.cache[key].src = `../images/environment/svg/${key}.svg`;
                this.cache[key].onload = () => this.render();
                this.cache[key].onerror = () => console.warn(`Failed to load SVG: ${key}`);
            });
        }

        this.cache.spritesheet.onerror = () => {
            console.warn("Spritesheet missing, continuing with SVGs only.");
            this.render();
        };
        this.cache.spritesheet.src = '../images/environment/sprites.png';
        this.cache.spritesheet.onload = () => this.render();
    }

    initMap() {
        for (let l = 0; l < 3; l++) {
            const layer = [];
            for (let y = 0; y < this.config.height; y++) {
                layer[y] = new Array(this.config.width).fill(0);
            }
            this.state.map[l] = layer;
        }
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
                document.querySelectorAll('.tool-btn').forEach(el => el.classList.remove('active'));
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
        });
    }

    setTool(tool) {
        document.querySelector(`.tool-btn[data-tool="${tool}"]`)?.click();
    }

    initPalette() {
        const terrainIds = Object.keys(TILE_DEFS).filter(id => id < 200);
        terrainIds.forEach(id => {
            const def = TILE_DEFS[id];
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            if (id == this.state.currentTile) swatch.classList.add('active');
            
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            this.drawPreview(canvas.getContext('2d'), id, 32);
            
            swatch.appendChild(canvas);
            swatch.innerHTML += `<div class="swatch-label">${def.name}</div>`;
            swatch.onclick = () => {
                this.state.currentTile = id;
                this.state.currentStamp = null;
                document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
            };
            this.elements.palette.appendChild(swatch);
        });
    }

    initAssets() {
        this.elements.assets.innerHTML = '';
        if (!this.manifest || !this.manifest.assets) return;

        Object.keys(this.manifest.assets).forEach(key => {
            const asset = this.manifest.assets[key];
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            
            const img = document.createElement('img');
            img.src = `../images/environment/svg/${key}.svg`;
            
            swatch.appendChild(img);
            swatch.innerHTML += `<div class="swatch-label">${asset.name}</div>`;
            swatch.onclick = () => {
                this.state.currentTile = asset.id;
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
            };
        });
    }

    initEvents() {
        const c = this.elements.canvas;
        c.onmousedown = (e) => {
            this.state.isMouseDown = true;
            this.handleAction(e);
        };
        window.onmouseup = () => this.state.isMouseDown = false;
        c.onmousemove = (e) => {
            this.updateCoords(e);
            if (this.state.isMouseDown) this.handleAction(e);
            this.updateBrushPreview(e);
        };

        // Zoom/Pan
        window.onwheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                this.config.zoom = Math.max(0.1, Math.min(5, this.config.zoom - e.deltaY * 0.001));
                this.render();
            }
        };
    }

    updateCoords(e) {
        const rect = this.elements.canvas.getBoundingClientRect();
        const s = this.config.tileSize * this.config.zoom;
        const x = Math.floor((e.clientX - rect.left) / s);
        const y = Math.floor((e.clientY - rect.top) / s);
        this.elements.coords.innerText = `X: ${x}, Y: ${y}`;
    }

    updateBrushPreview(e) {
        const rect = this.elements.canvas.getBoundingClientRect();
        const s = this.config.tileSize * this.config.zoom;
        const x = Math.floor((e.clientX - rect.left) / s);
        const y = Math.floor((e.clientY - rect.top) / s);

        const bp = this.elements.brushPreview;
        bp.style.left = (rect.left + x * s) + 'px';
        bp.style.top = (rect.top + y * s) + 'px';
        
        if (this.state.currentStamp) {
            bp.style.width = (this.state.currentStamp.size.w * s) + 'px';
            bp.style.height = (this.state.currentStamp.size.h * s) + 'px';
        } else {
            bp.style.width = s + 'px';
            bp.style.height = s + 'px';
        }
        bp.classList.remove('hidden');
    }

    handleAction(e) {
        const rect = this.elements.canvas.getBoundingClientRect();
        const s = this.config.tileSize * this.config.zoom;
        const x = Math.floor((e.clientX - rect.left) / s);
        const y = Math.floor((e.clientY - rect.top) / s);

        if (x < 0 || y < 0 || x >= this.config.width || y >= this.config.height) return;

        if (this.state.currentTool === 'eyedropper') {
            const id = this.state.map[this.state.currentLayer][y][x];
            if (id !== undefined) {
                this.state.currentTile = id;
                this.state.currentStamp = null;
                // Update UI selection
                this.setTool('brush');
            }
            return;
        }

        if (this.state.currentTool === 'fill') {
            this.floodFill(x, y, this.state.currentTile);
            this.render();
            return;
        }

        if (this.state.currentStamp) {
            this.applyStamp(x, y, this.state.currentStamp);
        } else {
            this.state.map[this.state.currentLayer][y][x] = parseInt(this.state.currentTile);
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
        
        ctx.fillStyle = def.color || '#000';
        ctx.fillRect(0, 0, size, size);

        if (def.svgAsset && this.cache[def.svgAsset]) {
            ctx.drawImage(this.cache[def.svgAsset], 0, 0, size, size);
        } else if (def.spriteIdx !== undefined && this.cache.spritesheet.complete && this.cache.spritesheet.width > 0) {
            const sIdx = def.spriteIdx;
            const gw = 6;
            const sw = this.cache.spritesheet.width / gw;
            const sh = this.cache.spritesheet.height / gw;
            ctx.drawImage(this.cache.spritesheet, (sIdx % gw) * sw, Math.floor(sIdx / gw) * sh, sw, sh, 0, 0, size, size);
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
        const c = this.elements.canvas;
        const s = this.config.tileSize * this.config.zoom;
        c.width = this.config.width * s;
        c.height = this.config.height * s;
        
        this.ctx.clearRect(0, 0, c.width, c.height);

        for (let l = 0; l < 3; l++) {
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
        this.updateMinimap();
    }

    drawTile(ctx, id, x, y, s) {
        const def = TILE_DEFS[id];
        if (!def) return;

        if (def.svgAsset && this.cache[def.svgAsset]) {
            ctx.drawImage(this.cache[def.svgAsset], x, y, s, s);
        } else if (def.spriteIdx !== undefined && this.cache.spritesheet.complete && this.cache.spritesheet.width > 0) {
            const sIdx = def.spriteIdx;
            const gw = 6;
            const sw = this.cache.spritesheet.width / gw;
            const sh = this.cache.spritesheet.height / gw;
            ctx.drawImage(this.cache.spritesheet, (sIdx % gw) * sw, Math.floor(sIdx / gw) * sh, sw, sh, x, y, s, s);
        } else {
            ctx.fillStyle = def.color || '#333';
            ctx.fillRect(x, y, s, s);
        }
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
}

const editor = new TileEditor();
