import os
import json
import base64
import shutil
import http.server
import socketserver
from urllib.parse import urlparse

# Configuration
PORT = 8080
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 
IMAGE_DIRS = [
    os.path.join("images", "characters", "map", "sheets"),
    os.path.join("images", "characters", "map", "sheets", "npc")
]

class SpriteWorkshopHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == "/api/list":
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            sprites = []
            for d in IMAGE_DIRS:
                full_path = os.path.join(ROOT_DIR, d)
                if not os.path.exists(full_path): continue
                for f in os.listdir(full_path):
                    if f.endswith(".png"):
                        sprites.append({
                            "name": f,
                            "path": os.path.join(d, f).replace("\\", "/"),
                            "folder": d
                        })
            self.wfile.write(json.dumps(sprites).encode())
            return

        if parsed_path.path.startswith("/images/"):
            file_path = os.path.join(ROOT_DIR, parsed_path.path.lstrip("/"))
            if os.path.exists(file_path):
                self.send_response(200)
                ext = os.path.splitext(file_path)[1].lower()
                mime = "image/webp" if ext == ".webp" else "image/png"
                self.send_header('Content-type', mime)
                self.end_headers()
                with open(file_path, 'rb') as f: self.wfile.write(f.read())
                return

        self.send_response(200); self.send_header('Content-type', 'text/html'); self.end_headers()
        self.wfile.write(HTML_CONTENT.encode())

    def do_POST(self):
        if self.path == "/api/save":
            content_length = int(self.headers['Content-Length'])
            data = json.loads(self.rfile.read(content_length).decode('utf-8'))
            rel_path, img_b64 = data.get("path"), data.get("image")
            if not rel_path or not img_b64: self.send_response(400); self.end_headers(); return
            full_path = os.path.join(ROOT_DIR, rel_path.replace("/", os.sep))
            bak_path = full_path + ".bak"
            if not os.path.exists(bak_path): shutil.copy2(full_path, bak_path)
            header, encoded = img_b64.split(",", 1)
            with open(full_path, "wb") as f: f.write(base64.b64decode(encoded))
            self.send_response(200); self.send_header('Content-type', 'application/json'); self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode())

HTML_CONTENT = r"""
<!DOCTYPE html>
<html>
<head>
    <title>RPG+ Sprite Workshop</title>
    <style>
        :root { --bg: #050412; --panel: rgba(13, 10, 32, 0.72); --border: rgba(144, 128, 255, 0.3); --gold: #ffcf5c; --cyan: #00f2ff; --text: #e2e0f0; }
        body { margin: 0; background: var(--bg); color: var(--text); font-family: 'Segoe UI', sans-serif; display: flex; height: 100vh; overflow: hidden; }
        aside { width: 300px; background: var(--panel); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
        .sidebar-header { padding: 20px; border-bottom: 1px solid var(--border); }
        .sprite-list { flex: 1; overflow-y: auto; padding: 10px; }
        .sprite-item { padding: 10px; cursor: pointer; border-radius: 4px; border: 1px solid transparent; margin-bottom: 5px; opacity: 0.7; }
        .sprite-item:hover { background: rgba(255,255,255,0.05); }
        .sprite-item.active { background: rgba(96, 80, 184, 0.2); border-color: var(--border); opacity: 1; border-left: 4px solid var(--cyan); }
        main { flex: 1; position: relative; display: flex; flex-direction: column; overflow: hidden; background: radial-gradient(circle at center, #100830 0%, #050412 80%); }
        .toolbar { padding: 15px 25px; background: var(--panel); border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 20px; }
        .editor-container { flex: 1; overflow: auto; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .canvas-stack { position: relative; display: grid; }
        canvas { 
            grid-area: 1/1; border: 2px solid var(--border); box-shadow: 0 0 50px rgba(0,0,0,0.5); image-rendering: pixelated; 
            background: linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%);
            background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; 
        }
        #overlay-canvas { border-color: transparent; box-shadow: none; background: none; pointer-events: none; z-index: 5; }
        .controls { width: 320px; background: var(--panel); border-left: 1px solid var(--border); padding: 25px; display: flex; flex-direction: column; gap: 20px; }
        .btn { background: #2a1a5e; border: 1px solid var(--border); color: #fff; padding: 10px 20px; border-radius: 6px; cursor: pointer; transition: 0.2; font-size: 14px; }
        .btn:hover { background: #3a2a7e; border-color: var(--cyan); }
        .btn-save { background: #004d40; border-color: #00897b; }
        .btn-delete { background: #b71c1c; border-color: #f44336; }
        .btn-eraser.active { background: #e91e63; border-color: #f06292; box-shadow: 0 0 10px rgba(233, 30, 99, 0.4); }
        .btn-move.active { background: #673ab7; border-color: #9575cd; box-shadow: 0 0 10px rgba(103, 58, 183, 0.4); }
        .rect-tool { color: var(--gold); font-size: 13px; font-weight: bold; margin-bottom: 10px; display: block; }
        input[type=range] { width: 100%; accent-color: var(--cyan); }
        .zoom-controls { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--cyan); }
    </style>
</head>
<body>
    <aside>
        <div class="sidebar-header"><h2 style="color:var(--gold); margin:0">Sprite Workshop</h2></div>
        <div class="sprite-list" id="sprite-list"></div>
    </aside>
    <main>
        <div class="toolbar">
            <div id="status">Ready</div>
            <div style="flex:1"></div>
            <div class="zoom-controls">
                <span>Zoom:</span>
                <input type="range" id="zoom-range" min="0.1" max="8" step="0.1" value="1" style="width:120px">
                <span id="zoom-val">100%</span>
            </div>
            <div class="zoom-controls" style="margin-left:10px; color:var(--gold)">
                <input type="checkbox" id="chk-grid"> <span>6x2 Grid</span>
            </div>
            <button class="btn btn-save" id="btn-save">💾 OVERWRITE ORIGINAL</button>
        </div>
        <div class="editor-container"><div class="canvas-stack" id="canvas-stack"><canvas id="canvas"></canvas><canvas id="overlay-canvas"></canvas></div></div>
    </main>
    <div class="controls">
        <label class="rect-tool">1. Select Region</label>
        <div style="display:flex; gap:5px; margin-bottom:10px; flex-wrap: wrap;">
            <button class="btn" id="btn-copy" style="flex:1; padding:8px 4px; font-size:12px">📋 Copy</button>
            <button class="btn" id="btn-flip" style="flex:1; padding:8px 4px; font-size:12px">↔ Flip</button>
            <button class="btn btn-delete" id="btn-delete" style="flex:1; padding:8px 4px; font-size:12px">🗑 Del</button>
            <button class="btn btn-eraser" id="btn-eraser" style="flex:1; padding:8px 4px; font-size:12px">🧹 Erase</button>
            <button class="btn btn-move" id="btn-move" style="flex:1; padding:8px 4px; font-size:12px">🎯 Move</button>
        </div>
        <div id="eraser-controls" style="display:none; margin-bottom: 20px;">
            <label class="rect-tool">Eraser Size: <span id="val-ers">1</span>px</label>
            <input type="range" id="eraser-size" min="1" max="20" step="1" value="1">
        </div>
        <div id="transform-controls">
            <label class="rect-tool">2. Scale / Offset</label>
            <div>Scale Y: <span id="val-sy">1.0</span><input type="range" id="scale-y" min="0.5" max="1.5" step="0.01" value="1.0"></div>
            <div style="margin-top:10px">Offset Y: <span id="val-oy">0</span><input type="range" id="off-y" min="-40" max="40" step="1" value="0"></div>
            <button class="btn" id="btn-apply" style="margin-top:15px; width:100%">✅ Apply Scale</button>
        </div>
        <div id="stamp-controls" style="display:none; border:1px solid var(--gold); padding:10px; border-radius:8px">
            <div style="font-size:12px; color:var(--gold); margin-bottom:10px">🏠 STAMP MODE: Click to place copy</div>
            <button class="btn" id="btn-cancel-stamp" style="width:100%">Cancel</button>
        </div>
        <button class="btn" id="btn-undo" style="opacity:0.6; margin-top:20px">↩ Undo</button>
    </div>
    <script>
        let sprites = [], activeSprite = null, img = new Image();
        let canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d');
        let overlay = document.getElementById('overlay-canvas'), octx = overlay.getContext('2d');
        let selection = null, isSelecting = false, history = [], buffer = null, isStampMode = false, isEraserMode = false, isMoveMode = false, isMouseDown = false, moveBuffer = null, dragOffset = null;

        async function init() {
            const res = await fetch('/api/list');
            sprites = await res.json();
            document.getElementById('sprite-list').innerHTML = sprites.map(s => `<div class="sprite-item" onclick="loadSprite('${s.path}', this)"><b>${s.name}</b><br><small>${s.folder}</small></div>`).join('');
        }

        function loadSprite(path, el) {
            activeSprite = sprites.find(s => s.path === path);
            document.querySelectorAll('.sprite-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
            img.onload = () => {
                canvas.width = overlay.width = img.width; canvas.height = overlay.height = img.height;
                ctx.drawImage(img, 0, 0); history = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
                selection = null; isStampMode = false; toggleStampMode(false); redrawOverlay();
                document.getElementById('status').textContent = "Loaded: " + activeSprite.name;
            };
            img.src = "/" + path;
        }

        function getMousePos(e) {
            const r = canvas.getBoundingClientRect();
            const zoom = parseFloat(document.getElementById('zoom-range').value);
            return { 
                x: (e.clientX - r.left) * (canvas.width / r.width), 
                y: (e.clientY - r.top) * (canvas.height / r.height) 
            };
        }

        function toggleStampMode(on) {
            isStampMode = on;
            document.getElementById('stamp-controls').style.display = on ? 'block' : 'none';
            document.getElementById('transform-controls').style.display = on ? 'none' : 'block';
            document.getElementById('canvas').style.cursor = on ? 'crosshair' : 'default';
        }

        canvas.onmousedown = (e) => {
            if (!activeSprite) return;
            isMouseDown = true;
            const p = getMousePos(e);
            
            if (isMoveMode && selection && p.x >= selection.x && p.x <= selection.x + selection.w && p.y >= selection.y && p.y <= selection.y + selection.h) {
                // Lift selection for moving
                moveBuffer = document.createElement('canvas');
                moveBuffer.width = Math.abs(selection.w); moveBuffer.height = Math.abs(selection.h);
                moveBuffer.getContext('2d').drawImage(canvas, selection.x, selection.y, selection.w, selection.h, 0, 0, moveBuffer.width, moveBuffer.height);
                ctx.clearRect(selection.x, selection.y, selection.w, selection.h);
                dragOffset = { x: p.x - selection.x, y: p.y - selection.y };
                return;
            }

            if (isEraserMode) { applyEraser(p); return; }
            if (isStampMode) { applyStamp(p.x, p.y); return; }
            isSelecting = true; selection = { x: p.x, y: p.y, w: 0, h: 0 };
        };

        window.onmousemove = (e) => {
            if (!activeSprite) return;
            const p = getMousePos(e);
            
            if (moveBuffer && isMouseDown) {
                selection.x = p.x - dragOffset.x;
                selection.y = p.y - dragOffset.y;
                redrawOverlay(p);
            }
            else if (isEraserMode && isMouseDown) { applyEraser(p); }
            else if (isSelecting) { selection.w = p.x - selection.x; selection.h = p.y - selection.y; redrawOverlay(p); }
            else { redrawOverlay(p); }
        };

        window.onmouseup = () => { 
            if (moveBuffer) {
                ctx.drawImage(moveBuffer, selection.x, selection.y);
                history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
                moveBuffer = null;
                redrawOverlay();
            }
            if(isSelecting) { isSelecting = false; redrawOverlay(); } 
            if(isEraserMode && isMouseDown) { 
                isMouseDown = false; 
                history.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); 
            }
            isMouseDown = false;
        };

        function applyEraser(p) {
            const size = parseInt(document.getElementById('eraser-size').value);
            ctx.clearRect(p.x - size/2, p.y - size/2, size, size);
            redrawOverlay(p);
        }

        function redrawOverlay(mousePos) {
            octx.clearRect(0, 0, overlay.width, overlay.height);
            
            // ─── 6x2 ALIGNMENT GRID ─────────────────
            if (document.getElementById('chk-grid').checked) {
                octx.strokeStyle = 'rgba(0, 242, 255, 0.4)';
                octx.lineWidth = 1;
                octx.setLineDash([10, 5]);
                
                const stepX = overlay.width / 6;
                const stepY = overlay.height / 2;
                
                // Vertical Lines (6 Columns)
                for (let i = 1; i < 6; i++) {
                    octx.beginPath();
                    octx.moveTo(i * stepX, 0); octx.lineTo(i * stepX, overlay.height);
                    octx.stroke();
                }

                // Horizontal Line (Center Row)
                octx.beginPath();
                octx.moveTo(0, stepY); octx.lineTo(overlay.width, stepY);
                octx.stroke();
                
                octx.setLineDash([]);
            }

            if (moveBuffer && selection) {
                octx.globalAlpha = 0.7;
                octx.drawImage(moveBuffer, selection.x, selection.y);
                octx.globalAlpha = 1.0;
                octx.strokeStyle = '#673ab7';
                octx.strokeRect(selection.x, selection.y, selection.w, selection.h);
            }
            else if (isEraserMode && mousePos) {
                const size = parseInt(document.getElementById('eraser-size').value);
                octx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                octx.lineWidth = 1;
                octx.strokeRect(mousePos.x - size/2, mousePos.y - size/2, size, size);
            }
            if (selection && (Math.abs(selection.w) > 1 || Math.abs(selection.h) > 1)) {
                octx.strokeStyle = '#00f2ff'; octx.setLineDash([4, 4]); octx.strokeRect(selection.x, selection.y, selection.w, selection.h); octx.setLineDash([]);
            }
            if (isStampMode && buffer && mousePos) {
                octx.globalAlpha = 0.5; octx.drawImage(buffer, mousePos.x - buffer.width/2, mousePos.y - buffer.height/2); octx.globalAlpha = 1.0;
                octx.strokeStyle = 'rgba(0, 242, 255, 0.5)'; octx.beginPath(); octx.moveTo(mousePos.x-10, mousePos.y); octx.lineTo(mousePos.x+10, mousePos.y); octx.moveTo(mousePos.x, mousePos.y-10); octx.lineTo(mousePos.x, mousePos.y+10); octx.stroke();
            }
        }

        document.getElementById('btn-copy').onclick = () => {
            if (!selection) return;
            buffer = document.createElement('canvas'); buffer.width = Math.abs(selection.w); buffer.height = Math.abs(selection.h);
            buffer.getContext('2d').drawImage(canvas, selection.x, selection.y, selection.w, selection.h, 0, 0, buffer.width, buffer.height);
            selection = null; toggleStampMode(true); redrawOverlay();
        };

        document.getElementById('btn-flip').onclick = () => {
            if (selection && (Math.abs(selection.w) > 1 || Math.abs(selection.h) > 1)) {
                // Case A: Flip the pixels currently selected on the canvas
                const t = document.createElement('canvas');
                t.width = Math.abs(selection.w); t.height = Math.abs(selection.h);
                const tc = t.getContext('2d');
                tc.translate(t.width, 0); tc.scale(-1, 1);
                tc.drawImage(canvas, selection.x, selection.y, selection.w, selection.h, 0, 0, t.width, t.height);
                ctx.clearRect(selection.x, selection.y, selection.w, selection.h);
                ctx.drawImage(t, selection.x, selection.y);
                history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            } else if (buffer) {
                // Case B: Flip the stamp in the brush buffer
                const t = document.createElement('canvas'); t.width = buffer.width; t.height = buffer.height;
                const tc = t.getContext('2d'); tc.translate(t.width, 0); tc.scale(-1, 1); tc.drawImage(buffer, 0, 0);
                buffer = t;
            }
            redrawOverlay();
        };

        document.getElementById('btn-delete').onclick = () => {
            if (!selection) return;
            ctx.clearRect(selection.x, selection.y, selection.w, selection.h);
            history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            selection = null; redrawOverlay();
        };

        function applyStamp(x, y) {
            ctx.drawImage(buffer, x - buffer.width/2, y - buffer.height/2);
            history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            toggleStampMode(false); redrawOverlay();
        }

        document.getElementById('btn-apply').onclick = () => {
            if (!selection) return;
            const sy = parseFloat(document.getElementById('scale-y').value), oy = parseInt(document.getElementById('off-y').value);
            const t = document.createElement('canvas'); t.width = Math.abs(selection.w); t.height = Math.abs(selection.h);
            t.getContext('2d').drawImage(canvas, selection.x, selection.y, selection.w, selection.h, 0, 0, t.width, t.height);
            const nh = t.height * sy;
            ctx.drawImage(t, selection.x, selection.y + oy - (nh - t.height)/2, t.width, nh);
            history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            selection = null; redrawOverlay();
        };

        document.getElementById('btn-undo').onclick = () => { if (history.length > 1) { history.pop(); ctx.putImageData(history[history.length-1], 0, 0); redrawOverlay(); } };
        document.getElementById('scale-y').oninput = (e) => document.getElementById('val-sy').textContent = e.target.value;
        document.getElementById('off-y').oninput = (e) => document.getElementById('val-oy').textContent = e.target.value;
        document.getElementById('btn-cancel-stamp').onclick = () => toggleStampMode(false);
        
        document.getElementById('zoom-range').oninput = (e) => {
            const z = parseFloat(e.target.value);
            document.getElementById('zoom-val').textContent = Math.round(z * 100) + "%";
            document.getElementById('canvas-stack').style.transform = `scale(${z})`;
        };

        document.getElementById('btn-eraser').onclick = () => {
            isEraserMode = !isEraserMode;
            document.getElementById('btn-eraser').classList.toggle('active', isEraserMode);
            document.getElementById('eraser-controls').style.display = isEraserMode ? 'block' : 'none';
            if (isEraserMode) { isStampMode = false; isMoveMode = false; document.getElementById('btn-move').classList.remove('active'); toggleStampMode(false); selection = null; redrawOverlay(); }
        };

        document.getElementById('btn-move').onclick = () => {
            isMoveMode = !isMoveMode;
            document.getElementById('btn-move').classList.toggle('active', isMoveMode);
            if (isMoveMode) { isEraserMode = false; isStampMode = false; document.getElementById('btn-eraser').classList.remove('active'); document.getElementById('eraser-controls').style.display = 'none'; toggleStampMode(false); redrawOverlay(); }
        };

        document.getElementById('eraser-size').oninput = (e) => {
            document.getElementById('val-ers').textContent = e.target.value;
        };

        document.getElementById('chk-grid').onchange = () => redrawOverlay();

        document.getElementById('btn-save').onclick = async () => {
            if (!activeSprite) return;
            const res = await fetch('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: activeSprite.path, image: canvas.toDataURL('image/png') }) });
            alert("Saved! Original overwritten.");
        };
        init();
    </script>
</body>
</html>
"""

if __name__ == '__main__':
    print(f"Starting Sprite Workshop on http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), SpriteWorkshopHandler) as httpd: httpd.serve_forever()
