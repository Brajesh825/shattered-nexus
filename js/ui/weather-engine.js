/**
 * WeatherEngine Module
 * Handles atmospheric particle systems (Rain, Ash, Snow, Petals) for screens.
 */
const WeatherEngine = (() => {
  const particles = [];
  let currentType = null;
  let active = false;

  const CONFIG = {
    rain: { count: 60, color: '#6fb0ff', speed: 800, length: 15, width: 1, angle: 75 },
    ash: { count: 30, color: '#aaaaaa', speed: 80, length: 3, width: 3, angle: 90, drift: 20 },
    petal: { count: 15, color: '#ffb7c5', speed: 60, length: 6, width: 4, angle: 110, drift: 40 },
    snow: { count: 50, color: '#ffffff', speed: 100, length: 3, width: 3, angle: 90, drift: 10 }
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
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -20,
      s: cfg.speed * (0.8 + Math.random() * 0.4),
      l: cfg.length * (0.8 + Math.random() * 0.4),
      w: cfg.width,
      o: 0.3 + Math.random() * 0.5,
      d: (cfg.drift || 0) * (Math.random() - 0.5)
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

      if (p.y > h + 20 || p.x > w + 20 || p.x < -20) {
        particles[i] = _createParticle();
      }
    }
  }

  function draw(ctx) {
    if (!active || !particles.length) return;
    const cfg = CONFIG[currentType];
    
    ctx.save();
    particles.forEach(p => {
      ctx.globalAlpha = p.o;
      ctx.fillStyle = cfg.color;
      const rad = (cfg.angle || 90) * Math.PI / 180;
      
      if (currentType === 'rain') {
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = p.w;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(rad) * p.l, p.y + Math.sin(rad) * p.l);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.w, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  return { setWeather, update, draw };
})();
