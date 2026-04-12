/**
 * tile-renders.js — Per-tile pixel-art render functions.
 *
 * Each entry: TILE_RENDERS['tile-name'] = (ctx, def, sx, sy, tw, th, t) => { ... }
 *   ctx  — CanvasRenderingContext2D
 *   def  — tile definition from TILE_DEFS (color, hi, shadow, …)
 *   sx,sy — screen pixel position of tile top-left
 *   tw,th — tile width/height in pixels (usually 64)
 *   t    — elapsed seconds (for animation, use Math.sin(t * speed + offset))
 *
 * Tiles with no entry fall back to the engine's _defaultRender (flat fill + bevel).
 */

const TILE_RENDERS = (() => {

  /* ── Shared helpers ────────────────────────────────────────── */
  // Hash a tile position to a stable pseudo-random 0-1 float
  const _h = (sx, sy, tw) => ((((sx / tw | 0) * 7 + (sy / tw | 0) * 13) & 0xfff) / 0xfff);

  /* ── CORE TERRAIN ─────────────────────────────────────────── */

  function void_(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Subtle deep cracks
    ctx.strokeStyle = def.hi;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(sx + 8,  sy + 4);  ctx.lineTo(sx + 20, sy + 28);
    ctx.moveTo(sx + 40, sy + 10); ctx.lineTo(sx + 52, sy + 40);
    ctx.moveTo(sx + 18, sy + 44); ctx.lineTo(sx + 38, sy + 58);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function grass(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 2);
    ctx.fillRect(sx, sy, 2, th);
    const seed = (sx / tw) | 0;
    ctx.fillStyle = 'rgba(40,100,20,0.3)';
    for (let i = 0; i < 4; i++) {
      const bx = sx + ((seed * 7 + i * 13) % tw);
      ctx.fillRect(bx, sy + th - 8, 2, 8);
      ctx.fillRect(bx + 1, sy + th - 12, 1, 6);
    }
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy + th - 2, tw, 2);
    ctx.fillRect(sx + tw - 2, sy, 2, th);
  }

  function path(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.hi;    ctx.fillRect(sx, sy, tw, 2);
    ctx.fillStyle = def.shadow; ctx.fillRect(sx, sy + th - 2, tw, 2);
    const pebbles = [[6,8,2],[18,14,1.5],[28,6,2],[10,22,1.5],[24,20,2]];
    pebbles.forEach(([px, py, r]) => {
      ctx.fillStyle = 'rgba(90,66,30,0.5)';
      ctx.beginPath(); ctx.arc(sx + px, sy + py, r + 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = def.shadow;
      ctx.beginPath(); ctx.arc(sx + px, sy + py, r, 0, Math.PI * 2); ctx.fill();
    });
  }

  function water(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = '#081828';
    ctx.fillRect(sx, sy, tw, th);
    const s = (Math.sin(t * 1.8 + sx * 0.04) + 1) * 0.5;
    const r = (8  + s * 6)  | 0;
    const g = (40 + s * 30) | 0;
    ctx.fillStyle = `rgba(${r},${g},160,0.35)`;
    ctx.fillRect(sx, sy, tw, th);
    for (let i = 0; i < 3; i++) {
      const wy = sy + th * 0.2 + i * (th * 0.25) + Math.sin(t * 1.1 + sx * 0.08 + i) * 3;
      ctx.fillStyle = `rgba(60,120,220,${0.15 + s * 0.2})`;
      ctx.fillRect(sx + 3, wy, tw - 6, 2);
    }
    ctx.fillStyle = `rgba(180,220,255,${0.3 * s})`;
    ctx.beginPath(); ctx.arc(sx + tw * 0.3, sy + th * 0.3, 2, 0, Math.PI * 2); ctx.fill();
  }

  function bridge(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.shadow;
    for (let bx = sx + 4; bx < sx + tw - 4; bx += 9) ctx.fillRect(bx, sy + 2, 7, th - 4);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy + 3, tw, 5);
    ctx.fillRect(sx, sy + th - 8, tw, 5);
    ctx.fillStyle = '#9a7a48';
    for (let bx = sx + 4; bx < sx + tw; bx += 8) {
      ctx.fillRect(bx, sy + 1, 3, 4);
      ctx.fillRect(bx, sy + th - 5, 3, 4);
    }
  }

  function forest(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = '#061404';
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = '#2a1606';
    ctx.fillRect(sx + tw / 2 - 3, sy + th - 14, 6, 14);
    [
      { bx: tw/2-8, by:0,  r:9,  c:'#0a2006' },
      { bx: tw/2+1, by:-2, r:8,  c:'#0d2808' },
      { bx: tw/2-4, by:6,  r:10, c:'#122e0a' },
      { bx: tw/2,   by:2,  r:7,  c:'#183808' },
    ].forEach(b => {
      ctx.fillStyle = b.c;
      ctx.beginPath(); ctx.arc(sx + b.bx + 8, sy + b.by + 8, b.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = 'rgba(60,120,20,0.15)';
    ctx.beginPath(); ctx.arc(sx + tw/2 - 2, sy + 6, 6, 0, Math.PI * 2); ctx.fill();
  }

  function mountain(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = '#383048';
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.hi;
    ctx.beginPath();
    ctx.moveTo(sx + tw/2, sy + 3); ctx.lineTo(sx + tw-3, sy + th-3); ctx.lineTo(sx + 3, sy + th-3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8e0f8';
    ctx.beginPath();
    ctx.moveTo(sx + tw/2, sy + 3); ctx.lineTo(sx + tw/2+8, sy + 15); ctx.lineTo(sx + tw/2-8, sy + 15);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.moveTo(sx + tw/2, sy + 3); ctx.lineTo(sx + tw-3, sy + th-3); ctx.lineTo(sx + tw/2, sy + th-3);
    ctx.closePath(); ctx.fill();
  }

  function caveFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    ctx.strokeRect(sx + 2, sy + 2, tw - 4, th - 4);
    ctx.strokeRect(sx + 5, sy + 5, tw - 10, th - 10);
  }

  function dungeon(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    ctx.strokeRect(sx + 2, sy + 2, tw - 4, th - 4);
    ctx.strokeRect(sx + 5, sy + 5, tw - 10, th - 10);
    ctx.fillStyle = 'rgba(160,80,220,0.2)';
    [[6,8],[20,6],[tw-8,th-7]].forEach(([fx, fy]) => {
      ctx.beginPath(); ctx.arc(sx + fx, sy + fy, 1.5, 0, Math.PI * 2); ctx.fill();
    });
  }

  function caveWall(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = '#0c0818';
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx + 4, sy + 4, 10, 10);
    ctx.fillRect(sx + tw - 14, sy + th - 14, 10, 10);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx+4,sy+4); ctx.lineTo(sx+tw-4,sy+th-4); ctx.stroke();
  }

  function sand(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 2); ctx.fillRect(sx, sy, 2, th);
    ctx.fillStyle = 'rgba(180,160,80,0.15)';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(sx + ((i*17)%tw), sy + ((i*11)%th), 3, 1);
    }
  }

  function flower(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = 'rgba(40,90,20,0.15)';
    ctx.fillRect(sx, sy, tw, 2); ctx.fillRect(sx, sy, 2, th);
    const petals = ['#ff7070','#ff90ff','#ffff80','#70c0ff'];
    const gx = sx/tw|0, gy = sy/tw|0;
    const fx = sx + 8 + (gx*7) % (tw-16);
    const fy = sy + 8 + (gy*5) % (th-16);
    const pc = petals[(gx + gy) % 4];
    for (let a = 0; a < 4; a++) {
      ctx.fillStyle = pc;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(a*Math.PI/2)*4, fy + Math.sin(a*Math.PI/2)*4, 2.5, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffffa0';
    ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI*2); ctx.fill();
  }

  function townFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    const cw = tw/4, ch = th/4;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        ctx.fillStyle = (row+col)%2===0 ? def.shadow : def.hi;
        ctx.fillRect(sx + col*cw+1, sy + row*ch+1, cw-2, ch-2);
      }
    }
    ctx.fillStyle = '#281006';
    for (let i = 1; i < 4; i++) {
      ctx.fillRect(sx + i*cw, sy, 1, th);
      ctx.fillRect(sx, sy + i*ch, tw, 1);
    }
  }

  function lavaFloor(ctx, def, sx, sy, tw, th, t) {
    // Dark base
    ctx.fillStyle = '#1a0800';
    ctx.fillRect(sx, sy, tw, th);
    // Flowing lava layer
    const wave = (Math.sin(t * 1.5 + sx * 0.05 + sy * 0.03) + 1) * 0.5;
    const r = (160 + wave * 80) | 0;
    const g = (40  + wave * 40) | 0;
    ctx.fillStyle = `rgba(${r},${g},0,0.7)`;
    ctx.fillRect(sx, sy, tw, th);
    // Glowing cracks
    ctx.strokeStyle = `rgba(255,${180 + (wave*60)|0},0,0.9)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx+8,  sy+4);  ctx.lineTo(sx+24, sy+28); ctx.lineTo(sx+14, sy+48);
    ctx.moveTo(sx+36, sy+8);  ctx.lineTo(sx+52, sy+32); ctx.lineTo(sx+44, sy+58);
    ctx.moveTo(sx+16, sy+36); ctx.lineTo(sx+36, sy+50);
    ctx.stroke();
    // Hot glow spots
    ctx.fillStyle = `rgba(255,220,0,${0.3 + wave * 0.4})`;
    [[12,20],[44,38],[28,10]].forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(sx+px, sy+py, 3+wave*2, 0, Math.PI*2); ctx.fill();
    });
  }

  function scorchedEarth(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Ash streaks
    ctx.fillStyle = 'rgba(80,60,40,0.4)';
    [[4,8,20,2],[16,22,18,2],[8,38,24,2],[32,14,16,2],[28,46,20,2]].forEach(([x,y,w,h]) => {
      ctx.fillRect(sx+x, sy+y, w, h);
    });
    // Char spots
    ctx.fillStyle = def.shadow;
    [[10,12],[34,28],[20,44],[48,16],[42,50]].forEach(([px,py]) => {
      ctx.beginPath(); ctx.arc(sx+px, sy+py, 3, 0, Math.PI*2); ctx.fill();
    });
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1); ctx.fillRect(sx, sy, 1, th);
  }

  function crackedStone(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    // Major cracks
    ctx.beginPath();
    ctx.moveTo(sx+tw/2, sy+0);  ctx.lineTo(sx+tw/2-8, sy+th*0.4); ctx.lineTo(sx+tw/2+4, sy+th);
    ctx.moveTo(sx+0, sy+th/2);  ctx.lineTo(sx+tw*0.4, sy+th/2+6);  ctx.lineTo(sx+tw, sy+th/2-4);
    ctx.stroke();
    // Bevel
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 2); ctx.fillRect(sx, sy, 2, th);
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2); ctx.fillRect(sx+tw-2, sy, 2, th);
  }

  function emberPit(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = '#0a0400';
    ctx.fillRect(sx, sy, tw, th);
    // Pulsing glow core
    const pulse = (Math.sin(t * 2.5 + sx * 0.07) + 1) * 0.5;
    const grd = ctx.createRadialGradient(sx+tw/2, sy+th/2, 2, sx+tw/2, sy+th/2, tw*0.45);
    grd.addColorStop(0, `rgba(255,${120+(pulse*80)|0},0,${0.7+pulse*0.3})`);
    grd.addColorStop(0.5, `rgba(180,40,0,${0.5+pulse*0.2})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(sx, sy, tw, th);
    // Flying embers
    for (let i = 0; i < 5; i++) {
      const ex = sx + ((i*17+sx)%tw);
      const ey = sy + th - ((t*30 + i*th*0.2) % th);
      ctx.fillStyle = `rgba(255,${160+(i*20)%80},0,${0.5+pulse*0.5})`;
      ctx.beginPath(); ctx.arc(ex, ey, 1.5, 0, Math.PI*2); ctx.fill();
    }
    // Rim
    ctx.strokeStyle = `rgba(200,80,0,${0.4+pulse*0.4})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(sx+3, sy+3, tw-6, th-6);
  }

  function obsidianWall(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Glassy block segments
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx+2,  sy+2,  tw/2-3, th/2-3);
    ctx.fillRect(sx+tw/2+1, sy+th/2+1, tw/2-3, th/2-3);
    // Specular highlight
    ctx.fillStyle = 'rgba(180,160,255,0.12)';
    ctx.beginPath();
    ctx.moveTo(sx+4, sy+4); ctx.lineTo(sx+14, sy+4); ctx.lineTo(sx+4, sy+14);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2); ctx.fillRect(sx+tw-2, sy, 2, th);
  }

  /* ── WATER / WETLANDS ──────────────────────────────────────── */

  function shallowWater(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy, tw, th);
    const s = (Math.sin(t * 1.4 + sx * 0.05) + 1) * 0.5;
    ctx.fillStyle = `rgba(42,109,181,${0.5 + s * 0.3})`;
    ctx.fillRect(sx, sy, tw, th);
    for (let i = 0; i < 2; i++) {
      const wy = sy + th*0.25 + i*(th*0.4) + Math.sin(t*0.9 + sx*0.06 + i)*2;
      ctx.fillStyle = `rgba(160,210,255,${0.2+s*0.2})`;
      ctx.fillRect(sx+4, wy, tw-8, 2);
    }
    // Sandy bottom showing through
    ctx.fillStyle = 'rgba(160,140,80,0.15)';
    ctx.fillRect(sx+tw*0.3, sy+th*0.6, tw*0.4, th*0.3);
  }

  function swamp(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Murky blobs
    ctx.fillStyle = 'rgba(20,30,10,0.4)';
    [[8,10,8],[28,24,6],[44,12,7],[16,40,9],[38,44,5]].forEach(([px,py,r]) => {
      ctx.beginPath(); ctx.arc(sx+px, sy+py, r, 0, Math.PI*2); ctx.fill();
    });
    // Reed stalks
    ctx.fillStyle = '#3a5020';
    [[12,4],[20,6],[44,4],[50,6]].forEach(([px,py]) => {
      ctx.fillRect(sx+px, sy+py, 2, 18);
      ctx.fillStyle = '#4a6028';
      ctx.fillRect(sx+px-2, sy+py, 5, 4);
      ctx.fillStyle = '#3a5020';
    });
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function ice(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Diagonal shine lines
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = -th; i < tw + th; i += 12) {
      ctx.moveTo(sx + i, sy); ctx.lineTo(sx + i + th, sy + th);
    }
    ctx.stroke();
    // Crack detail
    ctx.strokeStyle = 'rgba(120,180,220,0.5)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(sx+10, sy+20); ctx.lineTo(sx+30, sy+35); ctx.lineTo(sx+24, sy+54);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(sx, sy, tw, 1);
  }

  function waterfall(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy, tw, th);
    // Falling streams
    for (let i = 0; i < 4; i++) {
      const wx = sx + 8 + i * (tw/4);
      const offset = (t * 60 + i * 15) % th;
      const alpha = 0.4 + (i%2)*0.2;
      ctx.fillStyle = `rgba(80,160,240,${alpha})`;
      ctx.fillRect(wx, sy + offset - th, 6, th);
      ctx.fillRect(wx, sy + offset, 6, th);
      ctx.fillStyle = `rgba(180,220,255,${alpha*0.5})`;
      ctx.fillRect(wx+1, sy + offset - th, 2, th);
      ctx.fillRect(wx+1, sy + offset, 2, th);
    }
    // Mist at base
    ctx.fillStyle = 'rgba(180,210,255,0.12)';
    ctx.fillRect(sx, sy+th-12, tw, 12);
  }

  function riverBank(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Wet edge
    ctx.fillStyle = 'rgba(42,80,140,0.25)';
    ctx.fillRect(sx, sy+th-8, tw, 8);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 2); ctx.fillRect(sx, sy, 2, th);
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2);
  }

  /* ── NATURAL TERRAIN ───────────────────────────────────────── */

  function mud(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.shadow;
    [[10,8,5],[28,20,4],[42,12,6],[16,36,5],[38,44,4],[52,30,3]].forEach(([px,py,r]) => {
      ctx.beginPath(); ctx.arc(sx+px, sy+py, r, 0, Math.PI*2); ctx.fill();
    });
    ctx.fillStyle = 'rgba(80,50,20,0.2)';
    ctx.fillRect(sx+8, sy+26, tw-16, 4);
    ctx.fillRect(sx+4, sy+40, tw-12, 3);
  }

  function gravel(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.shadow;
    for (let i = 0; i < 12; i++) {
      const gx = sx + ((i*17+sx/tw*3|0)*11) % tw;
      const gy = sy + ((i*13+sy/tw*5|0)*7)  % th;
      ctx.beginPath(); ctx.arc(gx, gy, 1.5+i%3, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function snow(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Sparkle crystals
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    const seed = (sx/tw|0)*7 + (sy/tw|0)*13;
    for (let i = 0; i < 6; i++) {
      const px = sx + ((seed*7+i*17) % tw);
      const py = sy + ((seed*3+i*11) % th);
      ctx.fillRect(px, py, 2, 2);
    }
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 2);
    ctx.fillStyle = 'rgba(180,210,230,0.3)';
    ctx.fillRect(sx, sy+th*0.6, tw, th*0.4);
  }

  function tundra(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.shadow;
    // Frozen crust lines
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    ctx.beginPath();
    [[0,th/3,tw,th/3],[0,th*2/3,tw,th*2/3]].forEach(([x1,y1,x2,y2]) => {
      ctx.moveTo(sx+x1, sy+y1); ctx.lineTo(sx+x2, sy+y2);
    });
    ctx.stroke();
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function marsh(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = 'rgba(20,50,15,0.5)';
    [[6,10,14,3],[20,28,12,4],[36,16,10,3],[10,42,16,3],[40,44,12,3]].forEach(([x,y,w,h]) => {
      ctx.fillRect(sx+x, sy+y, w, h);
    });
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function cliff(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy, tw, 8);
    ctx.strokeStyle = def.hi; ctx.lineWidth = 1;
    ctx.beginPath();
    [[4,10],[8,24],[4,38],[16,14],[20,32],[12,50]].forEach(([x,y], i) => {
      if (i%2===0) { ctx.moveTo(sx+x, sy+y); } else { ctx.lineTo(sx+x, sy+y); }
    });
    ctx.stroke();
  }

  function ashField(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Ash drift ripples
    ctx.strokeStyle = 'rgba(90,80,90,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath();
    [th*0.25, th*0.5, th*0.75].forEach(y => {
      ctx.moveTo(sx+2, sy+y); ctx.bezierCurveTo(sx+tw*0.3, sy+y-4, sx+tw*0.7, sy+y+4, sx+tw-2, sy+y);
    });
    ctx.stroke();
    ctx.fillStyle = 'rgba(60,50,60,0.3)';
    [[8,12,5],[30,36,4],[50,20,3],[20,50,4]].forEach(([px,py,r]) => {
      ctx.beginPath(); ctx.arc(sx+px, sy+py, r, 0, Math.PI*2); ctx.fill();
    });
  }

  function tarPit(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = '#0e0c12';
    ctx.fillRect(sx, sy, tw, th);
    // Slow bubble
    const bPhase = (t * 0.4 + sx * 0.02) % 1;
    const br = bPhase * tw * 0.3;
    const ba = bPhase < 0.8 ? bPhase / 0.8 : (1 - bPhase) / 0.2;
    ctx.strokeStyle = `rgba(40,35,50,${ba * 0.8})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sx + tw*0.4, sy + th*0.5, br, 0, Math.PI*2); ctx.stroke();
    // Sheen
    ctx.fillStyle = 'rgba(60,50,80,0.3)';
    ctx.fillRect(sx+4, sy+th*0.2, tw-8, th*0.15);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function quicksand(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Sink vortex rings
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 0.8;
    [8,16,24].forEach(r => {
      ctx.globalAlpha = 0.4 + (24-r)/24 * 0.4;
      ctx.beginPath(); ctx.arc(sx+tw/2, sy+th/2, r, 0, Math.PI*2); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  /* ── VEGETATION ────────────────────────────────────────────── */

  function denseJungle(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = '#040e02';
    ctx.fillRect(sx, sy, tw, th);
    // Multiple layered trunks
    ctx.fillStyle = '#1a0c04';
    [tw/3-2, tw*2/3-2].forEach(bx => ctx.fillRect(sx+bx, sy+th-12, 5, 12));
    // Dense overlapping canopy
    [
      {bx:4,   by:2,  r:12, c:'#0a2006'},
      {bx:tw/2,by:-2, r:11, c:'#0c2808'},
      {bx:tw-8,by:4,  r:10, c:'#0e2a08'},
      {bx:8,   by:14, r:9,  c:'#112e0a'},
      {bx:tw/2,by:10, r:12, c:'#133008'},
    ].forEach(b => {
      ctx.fillStyle = b.c;
      ctx.beginPath(); ctx.arc(sx+b.bx, sy+b.by+8, b.r, 0, Math.PI*2); ctx.fill();
    });
  }

  function shrub(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = '#1e3810';
    ctx.fillRect(sx+tw/2-2, sy+th-8, 4, 8);
    ctx.fillStyle = '#2e5020';
    ctx.beginPath(); ctx.arc(sx+tw/2, sy+th*0.45, 14, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3a6028';
    ctx.beginPath(); ctx.arc(sx+tw/2-4, sy+th*0.4, 9, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function deadTree(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = '#2a1808';
    ctx.fillRect(sx+tw/2-3, sy+6, 6, th-6);
    // Bare branches
    ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx+tw/2, sy+16); ctx.lineTo(sx+tw/2-14, sy+8);
    ctx.moveTo(sx+tw/2, sy+24); ctx.lineTo(sx+tw/2+16, sy+14);
    ctx.moveTo(sx+tw/2, sy+32); ctx.lineTo(sx+tw/2-10, sy+26);
    ctx.stroke();
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function mushroomPatch(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    [[10,44,6,14,'#c03828'],[28,40,5,12,'#d04030'],[44,44,6,14,'#a83020']].forEach(([cx,cy,r,h,cap]) => {
      ctx.fillStyle = '#ead8c0';
      ctx.fillRect(sx+cx-2, sy+cy, 4, h);
      ctx.fillStyle = cap;
      ctx.beginPath(); ctx.arc(sx+cx, sy+cy, r+1, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#f0e0d0';
      ctx.beginPath(); ctx.arc(sx+cx-2, sy+cy, 2, Math.PI, 0); ctx.fill();
    });
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function tallGrass(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.hi;
    const seed = (sx/tw|0)*5 + (sy/tw|0)*3;
    for (let i = 0; i < 8; i++) {
      const bx = sx + ((seed*7+i*9) % tw);
      ctx.fillRect(bx, sy+th*0.15, 2, th*0.7);
      ctx.fillRect(bx-1, sy+th*0.1, 1, th*0.25);
      ctx.fillRect(bx+2, sy+th*0.12, 1, th*0.2);
    }
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2);
  }

  function sacredGrove(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Soft glow rings
    const grd = ctx.createRadialGradient(sx+tw/2, sy+th/2, 4, sx+tw/2, sy+th/2, tw*0.5);
    grd.addColorStop(0, 'rgba(64,255,136,0.18)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(sx, sy, tw, th);
    // Rune marks
    ctx.strokeStyle = 'rgba(80,255,160,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx+tw/2, sy+8); ctx.lineTo(sx+tw/2, sy+th-8);
    ctx.moveTo(sx+8, sy+th/2); ctx.lineTo(sx+tw-8, sy+th/2);
    ctx.stroke();
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function thornBush(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = '#2a3010';
    ctx.beginPath(); ctx.arc(sx+tw/2, sy+th/2, 20, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#606820'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let a = 0; a < 8; a++) {
      const angle = a * Math.PI / 4;
      ctx.moveTo(sx+tw/2, sy+th/2);
      ctx.lineTo(sx+tw/2 + Math.cos(angle)*18, sy+th/2 + Math.sin(angle)*18);
    }
    ctx.stroke();
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  /* ── ARCTIC / ALPINE ───────────────────────────────────────── */

  function frozenLake(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy, tw, th);
    // Subtle shimmer
    const s = (Math.sin(t * 0.8 + sx * 0.04) + 1) * 0.5;
    ctx.fillStyle = `rgba(160,220,240,${0.15 + s * 0.1})`;
    ctx.fillRect(sx, sy, tw, th);
    // Ice crack lines
    ctx.strokeStyle = 'rgba(140,200,230,0.5)'; ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx+4, sy+20); ctx.lineTo(sx+28, sy+36); ctx.lineTo(sx+20, sy+56);
    ctx.moveTo(sx+36, sy+8); ctx.lineTo(sx+52, sy+28);
    ctx.stroke();
    // Highlight sweep
    ctx.fillStyle = `rgba(255,255,255,${0.2 + s * 0.15})`;
    ctx.fillRect(sx, sy, tw, 2);
  }

  function glacier(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = 'rgba(140,180,200,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = -th; i < tw+th; i += 16) {
      ctx.moveTo(sx+i, sy); ctx.lineTo(sx+i+th, sy+th);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(sx, sy, tw, 2);
  }

  function iceCave(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Icicle hints
    ctx.fillStyle = def.hi;
    [8,18,30,42,52].forEach(px => {
      const h = 6 + ((px*7)%12);
      ctx.fillRect(sx+px, sy, 4, h);
      ctx.fillStyle = 'rgba(200,235,255,0.5)';
      ctx.fillRect(sx+px+1, sy, 1, h-2);
      ctx.fillStyle = def.hi;
    });
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2);
  }

  function snowdrift(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Drift mounds
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(sx+tw*0.25, sy+th*0.6, tw*0.22, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx+tw*0.7,  sy+th*0.7, tw*0.2,  0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(sx, sy, tw, 2);
  }

  function alpineRock(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.hi;
    ctx.beginPath();
    ctx.moveTo(sx+8, sy+th-4); ctx.lineTo(sx+tw/2-4, sy+12); ctx.lineTo(sx+tw-10, sy+th-4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(sx+tw/2-4, sy+12); ctx.lineTo(sx+tw-10, sy+th-4); ctx.lineTo(sx+tw/2+4, sy+th-4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(sx, sy, tw, 1);
  }

  /* ── UNDERGROUND / DUNGEON ──────────────────────────────────── */

  function dungeonWall(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Stone block pattern
    ctx.fillStyle = def.hi;
    [[2,2,tw/2-4,th/2-4],[tw/2+2,th/2+2,tw/2-4,th/2-4]].forEach(([x,y,w,h]) => {
      ctx.fillRect(sx+x, sy+y, w, h);
    });
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2); ctx.fillRect(sx+tw-2, sy, 2, th);
    ctx.fillRect(sx+tw/2, sy, 1, th); ctx.fillRect(sx, sy+th/2, tw, 1);
  }

  function catacombFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    ctx.strokeRect(sx+2, sy+2, tw-4, th-4);
    // Bone fragment hints
    ctx.fillStyle = 'rgba(200,190,170,0.2)';
    [[10,20,16,3],[24,40,14,3],[40,14,12,3]].forEach(([x,y,w,h]) => {
      ctx.fillRect(sx+x, sy+y, w, h);
    });
  }

  function catacombWall(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.hi;
    [[2,2,tw-4,6],[2,th/2,tw-4,6]].forEach(([x,y,w,h]) => ctx.fillRect(sx+x, sy+y, w, h));
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2); ctx.fillRect(sx+tw-2, sy, 2, th);
  }

  function sewerFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    ctx.strokeRect(sx+3, sy+3, tw-6, th-6);
    // Center drain
    ctx.beginPath(); ctx.arc(sx+tw/2, sy+th/2, 6, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = def.shadow;
    ctx.beginPath(); ctx.arc(sx+tw/2, sy+th/2, 4, 0, Math.PI*2); ctx.fill();
  }

  function sewerWater(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = '#0a1208';
    ctx.fillRect(sx, sy, tw, th);
    const s = (Math.sin(t * 0.8 + sx * 0.06) + 1) * 0.5;
    ctx.fillStyle = `rgba(30,80,30,${0.5+s*0.2})`;
    ctx.fillRect(sx, sy, tw, th);
    for (let i = 0; i < 2; i++) {
      const wy = sy + th*0.3 + i*th*0.35 + Math.sin(t*0.6+sx*0.05+i)*2;
      ctx.fillStyle = `rgba(40,120,40,${0.2+s*0.15})`;
      ctx.fillRect(sx+4, wy, tw-8, 2);
    }
    // Toxic sheen
    ctx.fillStyle = `rgba(80,200,60,${0.05+s*0.08})`;
    ctx.fillRect(sx, sy, tw, th);
  }

  function mineFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    // Rail track
    ctx.beginPath();
    ctx.moveTo(sx+tw*0.35, sy); ctx.lineTo(sx+tw*0.35, sy+th);
    ctx.moveTo(sx+tw*0.65, sy); ctx.lineTo(sx+tw*0.65, sy+th);
    ctx.stroke();
    ctx.strokeStyle = def.hi;
    for (let ty = sy+6; ty < sy+th; ty += 12) {
      ctx.beginPath(); ctx.moveTo(sx+tw*0.32, ty); ctx.lineTo(sx+tw*0.68, ty); ctx.stroke();
    }
  }

  function mineWall(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx+2, sy+2, tw/2-3, th/2-3);
    ctx.fillRect(sx+tw/2+1, sy+th/2+1, tw/2-3, th/2-3);
    // Mineral vein
    ctx.strokeStyle = 'rgba(160,140,80,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx+8, sy+th/2); ctx.lineTo(sx+tw-8, sy+th/2-8); ctx.stroke();
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2); ctx.fillRect(sx+tw-2, sy, 2, th);
  }

  function crystalCave(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Crystal spikes
    const crystals = [[10,th,6,22,'#7060d0'],[24,th,5,18,'#9060e0'],[40,th,7,26,'#6050c0'],[52,th,5,16,'#8070d0']];
    crystals.forEach(([cx,cy,w,h,col]) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(sx+cx, sy+cy); ctx.lineTo(sx+cx-w/2, sy+cy-h); ctx.lineTo(sx+cx+w/2, sy+cy-h+4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(180,160,255,0.5)';
      ctx.beginPath();
      ctx.moveTo(sx+cx-1, sy+cy); ctx.lineTo(sx+cx-w/2, sy+cy-h); ctx.lineTo(sx+cx, sy+cy-h+6);
      ctx.closePath(); ctx.fill();
    });
    // Ambient crystal glow
    const grd = ctx.createRadialGradient(sx+tw/2, sy+th/2, 0, sx+tw/2, sy+th/2, tw*0.5);
    grd.addColorStop(0, 'rgba(136,96,255,0.15)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.fillRect(sx, sy, tw, th);
  }

  function trapFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Pressure plate outline
    ctx.strokeStyle = '#6a3a6a'; ctx.lineWidth = 1.5;
    ctx.strokeRect(sx+8, sy+8, tw-16, th-16);
    ctx.strokeStyle = '#4a2a4a';
    ctx.strokeRect(sx+12, sy+12, tw-24, th-24);
    // Center mark
    ctx.fillStyle = 'rgba(180,60,180,0.3)';
    ctx.beginPath(); ctx.arc(sx+tw/2, sy+th/2, 6, 0, Math.PI*2); ctx.fill();
  }

  /* ── TOWN / CIVILISATION ────────────────────────────────────── */

  function stoneRoad(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    [[0,th/3,tw,th/3],[0,th*2/3,tw,th*2/3]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(sx+x1, sy+y1); ctx.lineTo(sx+x2, sy+y2); ctx.stroke();
    });
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function brickFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.shadow;
    for (let row = 0; row < 4; row++) {
      const bh = th/4;
      const offset = row%2===0 ? 0 : tw/4;
      for (let col = 0; col < 5; col++) {
        ctx.fillRect(sx + col*(tw/2) - offset + 1, sy + row*bh + 1, tw/2-2, bh-2);
      }
    }
    ctx.fillStyle = '#3a1810';
    for (let i = 0; i < 4; i++) ctx.fillRect(sx, sy+i*th/4, tw, 1);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function woodFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.shadow;
    const pw = tw/3;
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(sx + i*pw + pw-1, sy, 1, th);
      ctx.fillStyle = 'rgba(80,40,20,0.2)';
      ctx.fillRect(sx + i*pw + 2, sy + th*0.3, pw-4, th*0.06);
      ctx.fillRect(sx + i*pw + 2, sy + th*0.7, pw-4, th*0.06);
      ctx.fillStyle = def.shadow;
    }
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function tileFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    ctx.strokeRect(sx+tw/4, sy+th/4, tw/2, th/2);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1); ctx.fillRect(sx, sy, 1, th);
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-1, tw, 1); ctx.fillRect(sx+tw-1, sy, 1, th);
  }

  function carpet(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Woven pattern
    ctx.strokeStyle = 'rgba(180,60,60,0.5)'; ctx.lineWidth = 2;
    for (let y = sy+4; y < sy+th; y += 8) {
      ctx.beginPath(); ctx.moveTo(sx+2, y); ctx.lineTo(sx+tw-2, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(200,80,80,0.3)'; ctx.lineWidth = 1;
    for (let x = sx+4; x < sx+tw; x += 8) {
      ctx.beginPath(); ctx.moveTo(x, sy+2); ctx.lineTo(x, sy+th-2); ctx.stroke();
    }
    // Border
    ctx.strokeStyle = '#c07050'; ctx.lineWidth = 2;
    ctx.strokeRect(sx+2, sy+2, tw-4, th-4);
  }

  function marbleFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Vein lines
    ctx.strokeStyle = 'rgba(160,148,136,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx+4, sy+8); ctx.bezierCurveTo(sx+20, sy+20, sx+36, sy+12, sx+tw-4, sy+28);
    ctx.moveTo(sx+8, sy+32); ctx.bezierCurveTo(sx+24, sy+44, sx+40, sy+38, sx+tw-4, sy+50);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(sx, sy, tw, 2);
  }

  function woodWall(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.shadow;
    const pw = tw/3;
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(sx + i*pw + pw-1, sy, 1, th);
      ctx.fillStyle = 'rgba(40,20,8,0.3)';
      ctx.fillRect(sx + i*pw + 2, sy+4, pw-4, 3);
      ctx.fillRect(sx + i*pw + 2, sy+th-8, pw-4, 3);
      ctx.fillStyle = def.shadow;
    }
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 2);
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2);
  }

  function stoneWall(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Brick-like blocks
    ctx.fillStyle = def.hi;
    [[2,2,tw/2-3,th/2-3],[tw/2+1,2,tw/2-3,th/2-3],
     [2,th/2+1,tw-4,th/2-3]].forEach(([x,y,w,h]) => ctx.fillRect(sx+x,sy+y,w,h));
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2); ctx.fillRect(sx+tw-2, sy, 2, th);
    ctx.fillRect(sx, sy+th/2, tw, 1); ctx.fillRect(sx+tw/2, sy, 1, th/2);
  }

  function woodDoor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Door panels
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx+6, sy+4, tw/2-8, th/2-8);
    ctx.fillRect(sx+tw/2+2, sy+4, tw/2-8, th/2-8);
    ctx.fillRect(sx+6, sy+th/2+4, tw-12, th/2-8);
    // Knob
    ctx.fillStyle = '#c8a840';
    ctx.beginPath(); ctx.arc(sx+tw-10, sy+th/2, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2);
  }

  function ironDoor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Metal reinforcement bars
    ctx.fillStyle = def.hi;
    [sy+8, sy+th/2-2, sy+th-12].forEach(y => ctx.fillRect(sx+2, y, tw-4, 4));
    // Rivets
    ctx.fillStyle = '#808898';
    [[8,14],[tw-12,14],[8,th-16],[tw-12,th-16]].forEach(([px,py]) => {
      ctx.beginPath(); ctx.arc(sx+px, sy+py, 2.5, 0, Math.PI*2); ctx.fill();
    });
    // Lock
    ctx.fillStyle = '#a0a8b0';
    ctx.fillRect(sx+tw/2-4, sy+th/2-4, 8, 8);
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2);
  }

  function window_(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = '#604030';
    ctx.fillRect(sx, sy, tw, th);
    // Glass panes
    ctx.fillStyle = def.color;
    ctx.fillRect(sx+4, sy+4, tw/2-6, th-8);
    ctx.fillRect(sx+tw/2+2, sy+4, tw/2-6, th-8);
    // Light glint
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(sx+5, sy+5, 4, th-10);
    ctx.fillRect(sx+tw/2+3, sy+5, 4, th-10);
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(sx+tw/2-1, sy, 2, th);
    ctx.fillRect(sx, sy+th/2-1, tw, 2);
  }

  function rooftop(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Roof tiles
    const rtw = tw/4, rth = th/4;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const ox = row%2===0 ? 0 : rtw/2;
        ctx.fillStyle = (col+row)%2===0 ? def.shadow : def.hi;
        ctx.beginPath();
        ctx.arc(sx + col*rtw + ox + rtw/2, sy + row*rth + rth/2, rtw*0.45, 0, Math.PI*2);
        ctx.fill();
      }
    }
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2);
  }

  function well(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Well opening
    ctx.fillStyle = '#0a0a18';
    ctx.beginPath(); ctx.arc(sx+tw/2, sy+th/2+4, 16, 0, Math.PI*2); ctx.fill();
    // Stone rim
    ctx.strokeStyle = def.hi; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(sx+tw/2, sy+th/2+4, 18, 0, Math.PI*2); ctx.stroke();
    // Posts & crossbar
    ctx.fillStyle = '#7a5030';
    ctx.fillRect(sx+tw/2-16, sy+4, 4, th/2);
    ctx.fillRect(sx+tw/2+12, sy+4, 4, th/2);
    ctx.fillRect(sx+tw/2-18, sy+4, 36, 4);
  }

  function marketStall(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Awning
    ctx.fillStyle = '#c84020';
    ctx.fillRect(sx+2, sy+4, tw-4, 12);
    ctx.fillStyle = '#e05030';
    for (let x = sx+2; x < sx+tw-2; x += 10) ctx.fillRect(x, sy+4, 5, 12);
    // Counter
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx+4, sy+th/2, tw-8, th/2-4);
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx+4, sy+th-4, tw-8, 2);
  }

  function fountain(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy, tw, th);
    // Basin
    ctx.strokeStyle = def.hi; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(sx+tw/2, sy+th*0.65, tw*0.38, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#1a3a5a';
    ctx.beginPath(); ctx.arc(sx+tw/2, sy+th*0.65, tw*0.32, 0, Math.PI*2); ctx.fill();
    // Water jet arcs
    const wPulse = (Math.sin(t * 2.2) + 1) * 0.5;
    ctx.strokeStyle = `rgba(100,180,240,${0.5+wPulse*0.4})`; ctx.lineWidth = 2;
    for (let a = 0; a < 4; a++) {
      const angle = a * Math.PI/2 + t*0.5;
      const ex = sx+tw/2 + Math.cos(angle)*(8+wPulse*4);
      const ey = sy+th*0.45 + Math.sin(angle)*4;
      ctx.beginPath();
      ctx.moveTo(sx+tw/2, sy+th*0.45);
      ctx.quadraticCurveTo(sx+tw/2+Math.cos(angle)*18, sy+th*0.35, ex, ey);
      ctx.stroke();
    }
    // Center pillar
    ctx.fillStyle = def.hi;
    ctx.beginPath(); ctx.arc(sx+tw/2, sy+th*0.45, 6, 0, Math.PI*2); ctx.fill();
  }

  /* ── INTERIOR ───────────────────────────────────────────────── */

  function innFloor(ctx, def, sx, sy, tw, th) {
    woodFloor(ctx, def, sx, sy, tw, th);
    // Warm overlay
    ctx.fillStyle = 'rgba(180,100,40,0.06)';
    ctx.fillRect(sx, sy, tw, th);
  }

  function libraryFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Dark wood panels
    ctx.fillStyle = def.shadow;
    const pw = tw/4;
    for (let i = 1; i < 4; i++) ctx.fillRect(sx+i*pw, sy, 1, th);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function churchFloor(ctx, def, sx, sy, tw, th) {
    marbleFloor(ctx, def, sx, sy, tw, th);
    // Cross inlay
    ctx.fillStyle = 'rgba(160,148,180,0.3)';
    ctx.fillRect(sx+tw/2-2, sy+4, 4, th-8);
    ctx.fillRect(sx+4, sy+th*0.35-2, tw-8, 4);
  }

  function throneRoom(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Gold tile pattern
    const ts = tw/4;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        ctx.fillStyle = (row+col)%2===0 ? '#c8a000' : '#b89000';
        ctx.fillRect(sx+col*ts+1, sy+row*ts+1, ts-2, ts-2);
      }
    }
    ctx.fillStyle = 'rgba(255,210,0,0.15)';
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = '#e0c020';
    ctx.fillRect(sx, sy, tw, 1);
  }

  function prisonFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    ctx.strokeRect(sx+4, sy+4, tw-8, th-8);
    ctx.fillStyle = 'rgba(40,50,40,0.3)';
    [[10,20,tw-20,4],[10,36,tw-20,4]].forEach(([x,y,w,h]) => ctx.fillRect(sx+x, sy+y, w, h));
  }

  function cryptFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    ctx.strokeRect(sx+2, sy+2, tw-4, th-4);
    // Faint skull/rune
    ctx.fillStyle = 'rgba(160,140,180,0.1)';
    ctx.beginPath(); ctx.arc(sx+tw/2, sy+th/2-4, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(160,140,180,0.15)';
    ctx.fillRect(sx+tw/2-4, sy+th/2+6, 8, 6);
  }

  /* ── SPECIAL / MAGICAL ──────────────────────────────────────── */

  function warpTile(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    const pulse = (Math.sin(t * 2.5) + 1) * 0.5;
    // Concentric rings
    for (let i = 3; i >= 0; i--) {
      const r = 8 + i * 7 + pulse * 4;
      const a = 0.15 + (3-i)*0.08 + pulse*0.1;
      ctx.strokeStyle = `rgba(64,128,255,${a})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx+tw/2, sy+th/2, r, 0, Math.PI*2); ctx.stroke();
    }
    // Center glyph
    ctx.fillStyle = `rgba(100,180,255,${0.4+pulse*0.4})`;
    ctx.beginPath(); ctx.arc(sx+tw/2, sy+th/2, 4, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = `rgba(200,220,255,${0.3+pulse*0.3})`; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx+tw/2-10, sy+th/2); ctx.lineTo(sx+tw/2+10, sy+th/2);
    ctx.moveTo(sx+tw/2, sy+th/2-10); ctx.lineTo(sx+tw/2, sy+th/2+10);
    ctx.stroke();
  }

  function magicCircle(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    const cx = sx+tw/2, cy = sy+th/2;
    // Rotating outer ring
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.6);
    ctx.strokeStyle = 'rgba(160,80,255,0.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, tw*0.44, 0, Math.PI*2); ctx.stroke();
    // Star points
    ctx.strokeStyle = 'rgba(180,100,255,0.5)'; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = i*Math.PI/3;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*tw*0.4, Math.sin(a)*tw*0.4); ctx.stroke();
    }
    ctx.restore();
    // Inner glow
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, tw*0.3);
    grd.addColorStop(0, 'rgba(180,80,255,0.25)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = 'rgba(220,140,255,0.6)';
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2); ctx.fill();
  }

  function runeFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Rune glyph
    ctx.strokeStyle = 'rgba(96,80,192,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx+tw/2, sy+8); ctx.lineTo(sx+tw/2+12, sy+th/2); ctx.lineTo(sx+tw/2, sy+th-8);
    ctx.lineTo(sx+tw/2-12, sy+th/2); ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx+8, sy+th/3); ctx.lineTo(sx+tw-8, sy+th*2/3); ctx.stroke();
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function altar(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Stone slab
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx+4, sy+th*0.3, tw-8, th*0.55);
    // Top surface
    ctx.fillStyle = '#686080';
    ctx.fillRect(sx+4, sy+th*0.3, tw-8, 6);
    // Candles
    ctx.fillStyle = '#e0c060';
    [[12, sy+th*0.2],[tw-16, sy+th*0.2]].forEach(([px,py]) => {
      ctx.fillRect(sx+px, py, 4, 14);
      ctx.fillStyle = 'rgba(255,200,80,0.6)';
      ctx.beginPath(); ctx.arc(sx+px+2, py, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e0c060';
    });
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2);
  }

  function portal(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = '#050210';
    ctx.fillRect(sx, sy, tw, th);
    const cx = sx+tw/2, cy = sy+th/2;
    // Vortex rings
    for (let i = 4; i >= 0; i--) {
      const r = 4 + i * 7;
      const angle = t * (i%2===0 ? 1.2 : -0.9) + i;
      const a = 0.1 + (4-i)*0.12;
      ctx.strokeStyle = `rgba(${160+i*10},${30+i*8},255,${a})`; ctx.lineWidth = 2.5 - i*0.3;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
      ctx.beginPath(); ctx.ellipse(0, 0, r, r*0.6, 0, 0, Math.PI*2);
      ctx.restore(); ctx.stroke();
    }
    // Core glow
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
    grd.addColorStop(0, `rgba(200,80,255,${0.5+Math.sin(t*3)*0.2})`);
    grd.addColorStop(0.5, 'rgba(100,0,200,0.3)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.fillRect(sx, sy, tw, th);
  }

  function cursedGround(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    const grd = ctx.createRadialGradient(sx+tw/2, sy+th/2, 0, sx+tw/2, sy+th/2, tw*0.5);
    grd.addColorStop(0, 'rgba(255,0,0,0.12)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = 'rgba(160,0,0,0.25)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx+tw/2, sy+6); ctx.lineTo(sx+tw/2+10, sy+th*0.6); ctx.lineTo(sx+tw/2-8, sy+th-6);
    ctx.moveTo(sx+8, sy+th/2); ctx.lineTo(sx+tw-8, sy+th/2+8);
    ctx.stroke();
  }

  function holyGround(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    const grd = ctx.createRadialGradient(sx+tw/2, sy+th/2, 0, sx+tw/2, sy+th/2, tw*0.5);
    grd.addColorStop(0, 'rgba(255,255,160,0.2)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = 'rgba(220,210,120,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx+tw/2, sy+6); ctx.lineTo(sx+tw/2, sy+th-6);
    ctx.moveTo(sx+6, sy+th/2); ctx.lineTo(sx+tw-6, sy+th/2);
    ctx.stroke();
  }

  function mirage(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Heat shimmer bands
    for (let i = 0; i < 4; i++) {
      const y = sy + (i/4)*th + Math.sin(t*1.5 + i*1.2)*3;
      const a = 0.1 + Math.sin(t*0.8+i)*0.05;
      ctx.fillStyle = `rgba(200,230,255,${a})`;
      ctx.fillRect(sx, y, tw, 4);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(sx, sy, tw, 2);
  }

  function voidRift(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = '#020008';
    ctx.fillRect(sx, sy, tw, th);
    const cx = sx+tw/2, cy = sy+th/2;
    // Dark tear shape
    ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.ellipse(cx, cy, 18, 26, 0, 0, Math.PI*2); ctx.fill();
    // Purple glow rim
    const pulse = (Math.sin(t * 2.0) + 1) * 0.5;
    ctx.strokeStyle = `rgba(${80+pulse*40},0,${180+pulse*60},${0.5+pulse*0.3})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, 18, 26, 0, 0, Math.PI*2); ctx.stroke();
    // Energy tendrils
    ctx.strokeStyle = `rgba(120,0,255,${0.2+pulse*0.2})`; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI*2/5 + t*0.4;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a)*22, cy + Math.sin(a)*28); ctx.stroke();
    }
  }

  function astralPlane(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Drifting stars
    const seed = (sx/tw|0)*7 + (sy/tw|0)*13;
    for (let i = 0; i < 8; i++) {
      const px = sx + ((seed*7+i*17) % tw);
      const py = sy + (((seed*3+i*11) + (t*4+i*8)|0) % th);
      const bright = (Math.sin(t*2.5+i*1.3)+1)*0.5;
      ctx.fillStyle = `rgba(180,200,255,${0.3+bright*0.5})`;
      ctx.fillRect(px, py, 2, 2);
    }
    // Nebula glow
    const grd = ctx.createRadialGradient(sx+tw*0.4, sy+th*0.4, 0, sx+tw*0.4, sy+th*0.4, tw*0.4);
    grd.addColorStop(0, 'rgba(160,192,255,0.08)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.fillRect(sx, sy, tw, th);
  }

  /* ── HAZARD / DAMAGE ────────────────────────────────────────── */

  function spikePit(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy, tw, th);
    // Pit shadow
    ctx.fillStyle = '#0a0808';
    ctx.fillRect(sx+6, sy+6, tw-12, th-12);
    // Spikes
    ctx.fillStyle = '#808090';
    [[10,8],[20,5],[30,9],[40,6],[50,8],
     [14,5],[26,8],[38,5],[48,7]].forEach(([px,len]) => {
      ctx.beginPath();
      ctx.moveTo(sx+px, sy+th-4);
      ctx.lineTo(sx+px-4, sy+th-4-len);
      ctx.lineTo(sx+px+4, sy+th-4-len);
      ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = 'rgba(160,0,0,0.15)';
    ctx.fillRect(sx+6, sy+th-8, tw-12, 6);
  }

  function poisonGas(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    const pulse = (Math.sin(t * 1.8) + 1) * 0.5;
    // Gas cloud blobs
    [
      {x:tw*0.3, y:th*0.4, r:14},
      {x:tw*0.6, y:th*0.55, r:12},
      {x:tw*0.5, y:th*0.3, r:10},
    ].forEach(({x,y,r}) => {
      const grd = ctx.createRadialGradient(sx+x, sy+y, 0, sx+x, sy+y, r+pulse*4);
      grd.addColorStop(0, `rgba(0,200,0,${0.15+pulse*0.1})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.fillRect(sx, sy, tw, th);
    });
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function acidPool(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = '#162010';
    ctx.fillRect(sx, sy, tw, th);
    const s = (Math.sin(t*1.6 + sx*0.04) + 1) * 0.5;
    ctx.fillStyle = `rgba(60,160,40,${0.6+s*0.2})`;
    ctx.fillRect(sx, sy, tw, th);
    // Bubbles
    for (let i = 0; i < 4; i++) {
      const bPhase = (t*0.7 + i*0.25) % 1;
      if (bPhase > 0.7) {
        const bx = sx + ((i*17+sx)%tw);
        const by = sy + th - bPhase*(th*1.2);
        const br = 2+i%3;
        const ba = (bPhase-0.7)/0.3;
        ctx.strokeStyle = `rgba(120,220,80,${ba*0.8})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI*2); ctx.stroke();
      }
    }
    ctx.fillStyle = `rgba(160,240,80,${0.1+s*0.08})`;
    ctx.fillRect(sx, sy, tw, th);
  }

  function electricFloor(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Metal plate base
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx+4, sy+4, tw-8, th-8);
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    [[tw/2,0,tw/2,th],[0,th/2,tw,th/2]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(sx+x1,sy+y1); ctx.lineTo(sx+x2,sy+y2); ctx.stroke();
    });
    // Electric arc
    const spark = (Math.sin(t * 8 + sx) + 1) * 0.5;
    if (spark > 0.6) {
      ctx.strokeStyle = `rgba(128,200,255,${spark*0.9})`; ctx.lineWidth = 1.5;
      ctx.beginPath();
      const pts = [[tw/2,6],[tw/2-8,th/3],[tw/2+6,th*0.55],[tw/2-4,th-6]];
      ctx.moveTo(sx+pts[0][0], sy+pts[0][1]);
      pts.slice(1).forEach(([px,py]) => ctx.lineTo(sx+px, sy+py));
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(80,160,255,${0.05+spark*0.08})`;
    ctx.fillRect(sx, sy, tw, th);
  }

  function webFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Web radials from corner
    ctx.strokeStyle = 'rgba(200,200,210,0.35)'; ctx.lineWidth = 0.8;
    const ox = sx+4, oy = sy+4;
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI/6;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(a)*tw*0.85, oy + Math.sin(a)*th*0.85); ctx.stroke();
    }
    // Concentric arcs
    [10,20,32,46].forEach(r => {
      ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI/2); ctx.stroke();
    });
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function windCurrent(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Flowing wind lines
    for (let i = 0; i < 4; i++) {
      const yOff = (t*30 + i*th*0.25) % th;
      const curve = Math.sin(i*1.3)*8;
      ctx.strokeStyle = `rgba(200,230,255,${0.25+i*0.06})`; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy+yOff);
      ctx.bezierCurveTo(sx+tw*0.25, sy+yOff+curve, sx+tw*0.75, sy+yOff-curve, sx+tw, sy+yOff);
      ctx.stroke();
    }
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  /* ── COASTAL / BEACH ────────────────────────────────────────── */

  function wetSand(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Wet patches
    ctx.fillStyle = 'rgba(60,80,100,0.2)';
    [[6,8,14,8],[28,24,12,6],[40,14,10,8],[10,36,18,6]].forEach(([x,y,w,h]) => {
      ctx.fillRect(sx+x, sy+y, w, h);
    });
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function coral(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = '#0a1820';
    ctx.fillRect(sx, sy, tw, th);
    // Coral branches
    [[12,th-4,'#c06040'],[28,th-4,'#d07050'],[44,th-4,'#b05030']].forEach(([cx,cy,col]) => {
      ctx.fillStyle = col;
      ctx.fillRect(sx+cx-2, sy+cy-28, 4, 28);
      ctx.fillRect(sx+cx-10, sy+cy-20, 4, 14);
      ctx.fillRect(sx+cx+6, sy+cy-22, 4, 16);
      // Branch tips
      ctx.beginPath(); ctx.arc(sx+cx, sy+cy-28, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx+cx-8, sy+cy-20, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx+cx+8, sy+cy-22, 3, 0, Math.PI*2); ctx.fill();
    });
  }

  function rockPool(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = '#1a2828';
    ctx.fillRect(sx, sy, tw, th);
    // Pool water
    const s = (Math.sin(t*0.9+sx*0.03)+1)*0.5;
    ctx.fillStyle = `rgba(45,104,104,${0.7+s*0.2})`;
    ctx.beginPath(); ctx.ellipse(sx+tw/2, sy+th/2, tw*0.38, th*0.32, 0, 0, Math.PI*2); ctx.fill();
    // Rock rim
    ctx.strokeStyle = '#2a3830'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(sx+tw/2, sy+th/2, tw*0.4, th*0.35, 0, 0, Math.PI*2); ctx.stroke();
    // Shimmer
    ctx.fillStyle = `rgba(80,160,160,${s*0.2})`;
    ctx.fillRect(sx+tw*0.2, sy+th*0.35, tw*0.3, 2);
  }

  function docks(ctx, def, sx, sy, tw, th) {
    woodFloor(ctx, def, sx, sy, tw, th);
    // Rope coil hint
    ctx.strokeStyle = '#8a6030'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sx+tw*0.75, sy+th*0.7, 8, 0, Math.PI*2); ctx.stroke();
  }

  /* ── SKY / AERIAL ───────────────────────────────────────────── */

  function cloud(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = '#c0d0e0';
    ctx.fillRect(sx, sy, tw, th);
    // Cloud puffs
    const drift = Math.sin(t*0.4)*3;
    ctx.fillStyle = def.color;
    [[tw/2,th/2,20],[tw/2-12,th/2+4,14],[tw/2+14,th/2+3,13],
     [tw/2-6,th/2-8,12],[tw/2+8,th/2-6,11]].forEach(([cx,cy,r]) => {
      ctx.beginPath(); ctx.arc(sx+cx+drift, sy+cy, r, 0, Math.PI*2); ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(sx+tw/2-4+drift, sy+th/2-4, 8, 0, Math.PI*2); ctx.fill();
  }

  function stormCloud(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = '#202830';
    ctx.fillRect(sx, sy, tw, th);
    // Dark billowing masses
    ctx.fillStyle = def.color;
    [[tw/2,th/2,22],[tw/2-14,th/2+4,15],[tw/2+16,th/2+3,14]].forEach(([cx,cy,r]) => {
      ctx.beginPath(); ctx.arc(sx+cx, sy+cy, r, 0, Math.PI*2); ctx.fill();
    });
    // Lightning flash
    const flash = Math.sin(t*7+sx);
    if (flash > 0.85) {
      ctx.strokeStyle = `rgba(200,220,255,${(flash-0.85)/0.15})`; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx+tw/2, sy+th*0.4);
      ctx.lineTo(sx+tw/2-6, sy+th*0.65);
      ctx.lineTo(sx+tw/2+4, sy+th*0.65);
      ctx.lineTo(sx+tw/2-2, sy+th*0.9);
      ctx.stroke();
    }
  }

  function skyFloor(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Moving cloud wisps
    const drift = (t*10) % (tw*2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    [20,50].forEach(y => {
      ctx.fillRect(sx + (drift%tw) - tw, sy+y, tw*0.6, 6);
    });
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 2);
    ctx.fillStyle = 'rgba(80,150,220,0.2)';
    ctx.fillRect(sx, sy+th*0.7, tw, th*0.3);
  }

  function windPlatform(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Platform edge
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 4);
    ctx.fillRect(sx, sy+th-4, tw, 4);
    // Speed stripes
    ctx.fillStyle = 'rgba(200,230,255,0.3)';
    for (let i = 0; i < 4; i++) ctx.fillRect(sx + i*(tw/4)+4, sy+8, tw/4-8, th-16);
  }

  /* ── RUINS / ANCIENT ────────────────────────────────────────── */

  function ruinFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Rubble chunks
    ctx.fillStyle = def.shadow;
    [[6,10,14,8],[28,30,10,10],[44,12,12,8],[10,46,16,8],[38,48,10,8]].forEach(([x,y,w,h]) => {
      ctx.fillRect(sx+x, sy+y, w, h);
    });
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function ruinWall(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Crumbling blocks
    ctx.fillStyle = def.hi;
    [[2,2,tw-8,th/3-2],[4,th/3+2,tw-10,th/3-2]].forEach(([x,y,w,h]) => ctx.fillRect(sx+x,sy+y,w,h));
    // Cracks
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx+tw*0.4, sy+2); ctx.lineTo(sx+tw*0.4+6, sy+th*0.5); ctx.lineTo(sx+tw*0.35, sy+th);
    ctx.stroke();
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy+th-2, tw, 2);
  }

  function mossyStone(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Moss patches
    ctx.fillStyle = 'rgba(30,70,25,0.5)';
    [[4,6,18,10],[28,20,14,12],[8,36,20,10],[38,40,16,10]].forEach(([x,y,w,h]) => {
      ctx.fillRect(sx+x, sy+y, w, h);
    });
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function overgrown(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Path under growth
    ctx.fillStyle = 'rgba(120,100,60,0.3)';
    ctx.fillRect(sx+4, sy+4, tw-8, th-8);
    // Vine overlay
    ctx.strokeStyle = 'rgba(30,60,15,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx, sy+th/3); ctx.bezierCurveTo(sx+tw/3, sy+th/3-8, sx+tw*2/3, sy+th/3+8, sx+tw, sy+th/3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx, sy+th*2/3); ctx.bezierCurveTo(sx+tw/3, sy+th*2/3+6, sx+tw*2/3, sy+th*2/3-6, sx+tw, sy+th*2/3); ctx.stroke();
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function brokenFloor(ctx, def, sx, sy, tw, th) {
    crackedStone(ctx, def, sx, sy, tw, th);
    // Danger fill at cracks
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.moveTo(sx+tw/2, sy+0); ctx.lineTo(sx+tw/2-8, sy+th*0.4); ctx.lineTo(sx+tw/2+4, sy+th); ctx.lineTo(sx+tw/2+8, sy+th); ctx.lineTo(sx+tw/2, sy+0);
    ctx.fill();
  }

  /* ── INDUSTRIAL / STEAMPUNK ─────────────────────────────────── */

  function metalFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Plate seams
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    [[tw/2,0,tw/2,th],[0,th/2,tw,th/2]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(sx+x1,sy+y1); ctx.lineTo(sx+x2,sy+y2); ctx.stroke();
    });
    // Rivet corners
    ctx.fillStyle = def.hi;
    [[4,4],[tw-8,4],[4,th-8],[tw-8,th-8]].forEach(([px,py]) => {
      ctx.beginPath(); ctx.arc(sx+px, sy+py, 2, 0, Math.PI*2); ctx.fill();
    });
  }

  function grateFloor(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = '#181820';
    ctx.fillRect(sx, sy, tw, th);
    ctx.strokeStyle = def.hi; ctx.lineWidth = 2;
    for (let x = sx+6; x < sx+tw; x += 8) {
      ctx.beginPath(); ctx.moveTo(x, sy); ctx.lineTo(x, sy+th); ctx.stroke();
    }
    for (let y = sy+6; y < sy+th; y += 8) {
      ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx+tw, y); ctx.stroke();
    }
    ctx.strokeStyle = def.shadow; ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, tw, th);
  }

  function pipe(ctx, def, sx, sy, tw, th) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Cylindrical pipe body
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx+4, sy+tw*0.2, tw-8, th*0.6);
    // Joint ring
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx+tw*0.35, sy, tw*0.3, th);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx+tw*0.38, sy+2, tw*0.24, th-4);
    // Specular
    ctx.fillStyle = 'rgba(200,210,220,0.2)';
    ctx.fillRect(sx+4, sy+tw*0.22, tw-8, th*0.12);
  }

  function machineFloor(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    metalFloor(ctx, def, sx, sy, tw, th);
    // Rotating gear indicator
    ctx.save(); ctx.translate(sx+tw/2, sy+th/2); ctx.rotate(t * 0.8);
    ctx.strokeStyle = 'rgba(100,120,140,0.5)'; ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI/4;
      ctx.beginPath(); ctx.moveTo(Math.cos(a)*6, Math.sin(a)*6); ctx.lineTo(Math.cos(a)*12, Math.sin(a)*12); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  }

  function oilSlick(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Rainbow iridescence
    const shift = t * 0.5;
    const colors = ['rgba(200,0,100,0.08)','rgba(0,100,200,0.08)','rgba(0,200,100,0.08)','rgba(200,200,0,0.08)'];
    colors.forEach((c, i) => {
      const x = sx + ((shift*20 + i*(tw/4)) % (tw*1.5)) - tw*0.5;
      ctx.fillStyle = c;
      ctx.fillRect(x, sy, tw*0.5, th);
    });
    ctx.fillStyle = 'rgba(40,50,60,0.3)';
    ctx.fillRect(sx, sy, tw, th);
    ctx.fillStyle = def.hi;
    ctx.fillRect(sx, sy, tw, 1);
  }

  function conveyor(ctx, def, sx, sy, tw, th, t) {
    ctx.fillStyle = def.color;
    ctx.fillRect(sx, sy, tw, th);
    // Moving belt stripes
    const offset = (t * 40) % 16;
    ctx.fillStyle = def.hi;
    for (let x = sx - 16 + offset; x < sx + tw; x += 16) {
      ctx.fillRect(x, sy+4, 8, th-8);
    }
    // Rails
    ctx.fillStyle = def.shadow;
    ctx.fillRect(sx, sy, tw, 4);
    ctx.fillRect(sx, sy+th-4, tw, 4);
    // Arrow hint
    ctx.strokeStyle = 'rgba(200,220,240,0.25)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx+8, sy+th/2); ctx.lineTo(sx+tw-8, sy+th/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx+tw-14, sy+th/2-5); ctx.lineTo(sx+tw-8, sy+th/2); ctx.lineTo(sx+tw-14, sy+th/2+5); ctx.stroke();
  }

  /* ── Export ──────────────────────────────────────────────────── */
  return {
    'void':           void_,
    'grass':          grass,
    'path':           path,
    'water':          water,
    'bridge':         bridge,
    'forest':         forest,
    'mountain':       mountain,
    'cave-floor':     caveFloor,
    'cave-wall':      caveWall,
    'dungeon':        dungeon,
    'sand':           sand,
    'flower':         flower,
    'town-floor':     townFloor,
    'lava-floor':     lavaFloor,
    'scorched-earth': scorchedEarth,
    'cracked-stone':  crackedStone,
    'ember-pit':      emberPit,
    'obsidian-wall':  obsidianWall,
    'shallow-water':  shallowWater,
    'swamp':          swamp,
    'ice':            ice,
    'shore':          riverBank,
    'waterfall':      waterfall,
    'river-bank':     riverBank,
    'mud':            mud,
    'gravel':         gravel,
    'snow':           snow,
    'tundra':         tundra,
    'marsh':          marsh,
    'cliff':          cliff,
    'ash-field':      ashField,
    'tar-pit':        tarPit,
    'quicksand':      quicksand,
    'dense-jungle':   denseJungle,
    'shrub':          shrub,
    'dead-tree':      deadTree,
    'mushroom-patch': mushroomPatch,
    'tall-grass':     tallGrass,
    'sacred-grove':   sacredGrove,
    'thorn-bush':     thornBush,
    'frozen-lake':    frozenLake,
    'glacier':        glacier,
    'ice-cave':       iceCave,
    'snowdrift':      snowdrift,
    'alpine-rock':    alpineRock,
    'dungeon-wall':   dungeonWall,
    'catacomb-floor': catacombFloor,
    'catacomb-wall':  catacombWall,
    'sewer-floor':    sewerFloor,
    'sewer-water':    sewerWater,
    'mine-floor':     mineFloor,
    'mine-wall':      mineWall,
    'crystal-cave':   crystalCave,
    'trap-floor':     trapFloor,
    'stone-road':     stoneRoad,
    'brick-floor':    brickFloor,
    'wood-floor':     woodFloor,
    'tile-floor':     tileFloor,
    'carpet':         carpet,
    'marble-floor':   marbleFloor,
    'wood-wall':      woodWall,
    'stone-wall':     stoneWall,
    'wood-door':      woodDoor,
    'iron-door':      ironDoor,
    'window':         window_,
    'rooftop':        rooftop,
    'courtyard':      townFloor,
    'well':           well,
    'market-stall':   marketStall,
    'fountain':       fountain,
    'inn-floor':      innFloor,
    'library-floor':  libraryFloor,
    'church-floor':   churchFloor,
    'throne-room':    throneRoom,
    'prison-floor':   prisonFloor,
    'crypt-floor':    cryptFloor,
    'warp-tile':      warpTile,
    'magic-circle':   magicCircle,
    'rune-floor':     runeFloor,
    'altar':          altar,
    'portal':         portal,
    'cursed-ground':  cursedGround,
    'holy-ground':    holyGround,
    'mirage':         mirage,
    'void-rift':      voidRift,
    'astral-plane':   astralPlane,
    'spike-pit':      spikePit,
    'poison-gas':     poisonGas,
    'acid-pool':      acidPool,
    'electric-floor': electricFloor,
    'web-floor':      webFloor,
    'wind-current':   windCurrent,
    'wet-sand':       wetSand,
    'coral':          coral,
    'rock-pool':      rockPool,
    'docks':          docks,
    'cloud':          cloud,
    'storm-cloud':    stormCloud,
    'sky-floor':      skyFloor,
    'wind-platform':  windPlatform,
    'ruin-floor':     ruinFloor,
    'ruin-wall':      ruinWall,
    'mossy-stone':    mossyStone,
    'overgrown-path': overgrown,
    'broken-floor':   brokenFloor,
    'metal-floor':    metalFloor,
    'grate-floor':    grateFloor,
    'pipe':           pipe,
    'machine-floor':  machineFloor,
    'oil-slick':      oilSlick,
    'conveyor':       conveyor,
  };
})();
