/**
 * home-engine.js — Shattered Nexus Advanced Home Screen Engine
 * Controls cosmic particles, essence drift, and title screen parallax.
 */

const HomeEngine = {
  _active: false,
  _essenceInterval: null,
  _parallaxX: 0,
  _parallaxY: 0,

  init() {
    this._active = true;
    console.log("[HomeEngine] Initializing Advanced Home Screen...");
    
    // 1. Kick off essence particles
    this._startEssenceSystem();
    
    // 2. Spawn environment debris
    this._spawnEnvironmentDebris();
    
    // 3. Initial parallax setup
    window.addEventListener('mousemove', e => this._handleParallax(e));
    window.addEventListener('resize', () => this._initializeSilhouettes());
    
    // 4. Dynamic Sprite Extraction
    this._initializeSilhouettes();
    
    // 5. Subtle drift for hero silhouettes
    this._startSilhouetteDrift();

    // 6. Inject version from ReleaseConfig
    const vTag = document.getElementById('game-version-tag');
    if (vTag && typeof ReleaseConfig !== 'undefined') {
      vTag.textContent = ReleaseConfig.VERSION;
    }
  },

  /** Uses SpriteRenderer to extract iconic Idle poses */
  _initializeSilhouettes() {
    if (typeof SpriteRenderer === 'undefined') return;

    const sils = document.querySelectorAll('.hero-sil');

    // Dynamic height based on viewport (matching 55vh in CSS)
    const targetH = Math.max(300, window.innerHeight * 0.55);

    sils.forEach(el => {
      if (window.getComputedStyle(el).display === 'none') return;
      const id = el.dataset.hero;
      SpriteRenderer.setFrame(el, id, 'idle', targetH);
    });
  },

  /** Spawns floating crystal shards in the background */
  _spawnEnvironmentDebris() {
    const container = document.getElementById('env-debris');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 15; i++) {
      const shard = document.createElement('div');
      shard.className = 'debris-shard';
      
      const sizeW = Math.random() * 20 + 10;
      const sizeH = sizeW * (Math.random() * 2 + 1);
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const delay = Math.random() * 10;
      const dur = 15 + Math.random() * 20;

      shard.style.cssText = `
        width: ${sizeW}px; height: ${sizeH}px;
        left: ${startX}%; top: ${startY}%;
        opacity: ${Math.random() * 0.3 + 0.1};
        transform: rotate(${Math.random() * 360}deg);
        animation: debrisFloat ${dur}s linear infinite;
        animation-delay: -${delay}s;
        position: absolute; pointer-events: none;
      `;
      container.appendChild(shard);
    }
    // Note: debrisFloat keyframes are defined in title.css
  },

  /** Creates floating 'essence' motes that drift upward */
  _startEssenceSystem() {
    const container = document.querySelector('.title-visual-context');
    if (!container) return;

    this._essenceInterval = setInterval(() => {
      if (!this._active) return;
      if (document.hidden) return; // Save perf when tab is backgrounded
      
      const mote = document.createElement('div');
      mote.className = 'essence-mote';
      
      const size = Math.random() * 3 + 1;
      const startX = Math.random() * 100;
      const duration = 10 + Math.random() * 20;
      
      mote.style.cssText = `
        position: absolute;
        bottom: -10px;
        left: ${startX}%;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, #fff, transparent);
        border-radius: 50%;
        opacity: ${Math.random() * 0.5 + 0.2};
        pointer-events: none;
        z-index: 1;
        filter: blur(1px);
        box-shadow: 0 0 10px rgba(255,255,255,0.3);
        animation: essenceFloat ${duration}s linear forwards;
      `;
      
      container.appendChild(mote);
      setTimeout(() => mote.remove(), duration * 1000);
    }, 800);
    // Note: essenceFloat keyframes are defined in title.css
  },

  /** Handles subtle mouse parallax for depth */
  _handleParallax(e) {
    if (!this._active) return;
    
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    
    const context = document.querySelector('.title-visual-context');
    if (context) {
      // Parallax star layers
      const l1 = document.getElementById('stars-l1');
      const l2 = document.getElementById('stars-l2');
      if (l1) l1.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
      if (l2) l2.style.transform = `translate(${x * 1.2}px, ${y * 1.2}px)`;
      
      // Hero silhouettes move even less for stability
      const sils = document.querySelector('.hero-silhouettes');
      if (sils) sils.style.transform = `translate(${-x * 0.3}px, ${-y * 0.3}px)`;
    }
  },

  /** Adding a slow 'breathing' transform to silhouettes */
  _startSilhouetteDrift() {
    const sils = document.querySelectorAll('.hero-sil');
    sils.forEach((sil, i) => {
      sil.style.transition = `transform ${15 + i * 2}s ease-in-out`;
      setInterval(() => {
        if (!this._active) return;
        const drift = Math.random() * 15 - 7;
        const scale = 1 + Math.random() * 0.05;
        sil.style.transform = `translateY(${drift}px) scale(${scale})`;
      }, 5000 + i * 1000);
    });
  },

  stop() {
    this._active = false;
    clearInterval(this._essenceInterval);
  }
};

// Auto-init when title screen is shown
document.addEventListener('DOMContentLoaded', () => {
  // If we start on title screen (default), init immediately
  if (document.getElementById('title-screen').classList.contains('active')) {
    HomeEngine.init();
  }
});

// Hook into the screen system (Observer pattern)
const _originalShowScreen = window.showScreen;
window.showScreen = function(id) {
  if (id === 'title-screen') HomeEngine.init();
  else HomeEngine.stop();
  
  if (typeof _originalShowScreen === 'function') {
    _originalShowScreen.apply(this, arguments);
  }
};
