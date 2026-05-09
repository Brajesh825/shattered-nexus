/**
 * settings-manager.js — Shattered Nexus Global Settings
 * Manages volume, text speed, graphics quality, and persistence.
 */
const Settings = {
  _KEY: 'cc_settings_v1',
  _LEGACY_GRAPHICS_KEY: 'sn_graphics_quality',
  _LEGACY_SPRITE_KEY: 'spriteQuality',
  _hasQualityPreference: false,
  data: {
    bgm: 50,
    sfx: 50,
    textSpeed: 3, // 1=Slow, 3=Normal, 5=Fast
    quality: 'auto',
  },

  init() {
    const saved = localStorage.getItem(this._KEY);
    let savedQuality = null;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.data = { ...this.data, ...parsed };
        savedQuality = parsed.quality;
      } catch(e) { console.warn('Settings load failed:', e); }
    }

    const migratedQuality = this._readStoredQuality(savedQuality);
    if (migratedQuality) {
      this.data.quality = migratedQuality;
      this._hasQualityPreference = true;
    }

    this.apply();
  },

  apply() {
    this.data.quality = this.normalizeQuality(this.data.quality);

    // Volume
    if (window.BGM) BGM.setVolume(this.data.bgm / 100);
    if (window.SFX) SFX.setVolume(this.data.sfx / 100);

    // Graphics Quality
    if (window.G) {
      G.graphics = this.data.quality;
      // Sync legacy setting path for sprites.js
      if (!G.settings) G.settings = {};
      G.settings.graphicsQuality = this.data.quality;
      
      const qBtn = document.getElementById('quality-btn');
      if (qBtn) qBtn.textContent = `Quality: ${this.data.quality.toUpperCase()}`;

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SET_QUALITY',
          quality: this.data.quality
        });
      }
    }

    // Text Speed (Inverts the value for interval timing)
    // textSpeed 1 = 60ms delay, 3 = 30ms delay, 5 = 10ms delay
    const delayMap = { 1: 60, 2: 45, 3: 30, 4: 20, 5: 10 };
    if (window.Story) Story._twDelay = delayMap[this.data.textSpeed] || 30;

    this.save();
  },

  save() {
    localStorage.setItem(this._KEY, JSON.stringify(this.data));
  },

  update(key, val) {
    this.data[key] = key === 'quality' ? this.normalizeQuality(val) : val;
    if (key === 'quality') this._hasQualityPreference = true;
    this.apply();
  },

  normalizeQuality(value) {
    if (value === 'normal' || value === 'high') return 'high';
    if (value === 'low') return 'low';
    return 'auto';
  },

  getQuality() {
    return this.normalizeQuality(this.data.quality);
  },

  hasQualityPreference() {
    return this._hasQualityPreference;
  },

  _readStoredQuality(savedQuality) {
    const candidates = [
      savedQuality,
      localStorage.getItem(this._LEGACY_GRAPHICS_KEY),
      localStorage.getItem(this._LEGACY_SPRITE_KEY)
    ];
    const found = candidates.find(q => q === 'auto' || q === 'high' || q === 'normal' || q === 'low');
    return found ? this.normalizeQuality(found) : null;
  },

  open() {
    if (typeof UI !== 'undefined') UI.hideAllOverlays();
    const overlay = document.getElementById('settings-overlay');
    if (!overlay) return;
    
    // Sync UI elements
    document.getElementById('settings-bgm').value = this.data.bgm;
    document.getElementById('settings-sfx').value = this.data.sfx;
    document.getElementById('settings-text').value = this.data.textSpeed;
    document.getElementById('settings-quality').value = this.data.quality;
    
    overlay.style.display = 'flex';
  },

  close() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.style.display = 'none';

    if (typeof MapEngine !== 'undefined' && !MapEngine.isRunning()) {
      const pauseMenu = document.getElementById('map-pause-menu');
      if (pauseMenu) pauseMenu.style.display = 'flex';
      if (typeof Focus !== 'undefined') Focus.setContext('map-pause-menu');
    } else {
      if (typeof Focus !== 'undefined') Focus.setContext(null);
    }
  }
};

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => Settings.init());
