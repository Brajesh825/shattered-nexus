/**
 * WeatherEngine Module
 * Handles atmospheric particle systems (Rain, Ash, Snow, Petals) for screens.
 */
const WeatherEngine = (() => {
  const particles = [];
  let currentType = null;
  let active = false;

  const CONFIG = {
    rain:   { count: 60, color: '#6fb0ff', speed: 800, length: 15, width: 1,   angle: 75,  drift: 0  },
    ash:    { count: 35, color: '#b0a8a0', speed: 70,  length: 3,  width: 3,   angle: 90,  drift: 25,
              colors: ['#b0a8a0','#989088','#c0b8b0','#807870'] },
    petal:  { count: 45, color: '#ffb7c5', speed: 60,  length: 6,  width: 4,   angle: 110, drift: 40 },
    verdant_petal: { count: 60, color: '#4ade80', speed: 60, length: 6, width: 4, angle: 110, drift: 40,
              colors: ['#4ade80', '#22c55e', '#86efac'] },
    snow:   { count: 50, color: '#ffffff', speed: 100, length: 3,  width: 3,   angle: 90,  drift: 10 },
    leaves: { count: 28, color: '#5b8a3e', speed: 85,  length: 9,  width: 5,   angle: 98,  drift: 70,
              colors: ['#5b8a3e','#7ab830','#c8a820','#b85010','#d4622a','#4d7832'] },
    embers: { count: 32, color: '#ff6a00', speed: 105, length: 4,  width: 2.5, angle: 84,  drift: 40, glow: true,
              colors: ['#ff6a00','#ff3800','#ffb200','#ff4a00','#ff8800'] },
    sparks: { count: 40, color: '#00d4ff', speed: 130, length: 2,  width: 2,   angle: 90,  drift: 25, twinkle: true,
              colors: ['#00d4ff','#a060ff','#ffffff','#80d0ff','#c080ff'] }
  };

  function setWeather(type) {
    if (currentType === type) return;
    currentType = type;
    particles.length = 0;
    active = !!type;
    
    if (active && CONFIG[type]) {
      const cfg = CONFIG[type];
      for (let i = 0; i < cfg.count; i++) {
        particles.push(_createParticle(true));
      }
    }
  }

  function _createParticle(randomY = false) {
    const cfg = CONFIG[currentType];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const colors = cfg.colors;
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -20,
      s: cfg.speed * (0.7 + Math.random() * 0.6),
      l: cfg.length * (0.7 + Math.random() * 0.6),
      w: cfg.width * (0.8 + Math.random() * 0.4),
      o: 0.25 + Math.random() * 0.55,
      d: (cfg.drift || 0) * (Math.random() - 0.5),
      phase: Math.random() * Math.PI * 2,
      color: colors ? colors[Math.floor(Math.random() * colors.length)] : cfg.color,
    };
  }

  function update(dt) {
    if (!active) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cfg = CONFIG[currentType];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const rad = (cfg.angle || 90) * Math.PI / 180;
      p.x += Math.cos(rad) * p.s * dt + (p.d || 0) * dt;
      p.y += Math.sin(rad) * p.s * dt;
      p.phase += dt * 3.5;

      if (p.y > h + 20 || p.x > w + 20 || p.x < -20) {
        particles[i] = _createParticle();
      }
    }
  }

  function draw(ctx) {
    if (!active || !particles.length) return;
    const cfg = CONFIG[currentType];
    
    ctx.save();
    const rad = (cfg.angle || 90) * Math.PI / 180;
    particles.forEach(p => {
      const pColor = p.color || cfg.color;

      if (currentType === 'rain') {
        ctx.globalAlpha = p.o;
        ctx.strokeStyle = pColor;
        ctx.lineWidth = p.w;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(rad) * p.l, p.y + Math.sin(rad) * p.l);
        ctx.stroke();

      } else if (currentType === 'leaves') {
        ctx.save();
        ctx.globalAlpha = p.o;
        ctx.fillStyle = pColor;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.phase * 0.5 + Math.sin(p.phase * 0.3) * 0.6);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w, p.l * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        // Leaf vein highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(-p.w * 0.8, 0); ctx.lineTo(p.w * 0.8, 0);
        ctx.stroke();
        ctx.restore();

      } else if (currentType === 'embers') {
        const flicker = 0.6 + 0.4 * Math.sin(p.phase * 2.8);
        ctx.globalAlpha = p.o * flicker;
        ctx.fillStyle = pColor;
        ctx.shadowBlur = 8 + flicker * 6;
        ctx.shadowColor = pColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.w * (0.7 + flicker * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

      } else if (currentType === 'sparks') {
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(p.phase * 3.2));
        ctx.globalAlpha = p.o * twinkle;
        ctx.fillStyle = pColor;
        ctx.shadowBlur = 10 * twinkle;
        ctx.shadowColor = pColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.w * twinkle, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

      } else if (currentType === 'petal' || currentType === 'verdant_petal') {
        ctx.save();
        ctx.globalAlpha = p.o;
        ctx.fillStyle = pColor;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.phase * 0.4);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w, p.l * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (currentType === 'ash') {
        ctx.globalAlpha = p.o * (0.5 + 0.5 * Math.sin(p.phase * 0.8));
        ctx.fillStyle = pColor;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.phase * 0.2);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w * 0.6, p.w, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else {
        ctx.globalAlpha = p.o;
        ctx.fillStyle = pColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.w, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();

    // Screen-level colour tint for immersive weather feel
    if (currentType === 'rain') {
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = '#3858a0';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    } else if (currentType === 'ash') {
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = '#707070';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }

  return { setWeather, update, draw, getType: () => currentType };
})();
