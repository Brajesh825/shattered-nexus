/**
 * settings-manager.js — Shattered Nexus Global Settings
 * Manages volume, text speed, graphics quality, and persistence.
 */
const Settings = {
  _KEY: 'cc_settings_v1',
  data: {
    bgm: 50,
    sfx: 50,
    textSpeed: 3, // 1=Slow, 3=Normal, 5=Fast
    quality: 'auto',
  },

  init() {
    const saved = localStorage.getItem(this._KEY);
    if (saved) {
      try {
        this.data = { ...this.data, ...JSON.parse(saved) };
      } catch(e) { console.warn('Settings load failed:', e); }
    }
    this.apply();
  },

  apply() {
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
    this.data[key] = val;
    this.apply();
  },

  open() {
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
  }
};

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => Settings.init());
