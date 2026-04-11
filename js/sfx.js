/**
 * sfx.js — Shattered Nexus Sound Effects
 * Pure Web Audio API synthesis — no audio files needed.
 */
const SFX = {
  _ctx:   null,
  _muted: false,

  _get() {
    if (!this._ctx) {
      try { this._ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e) { return null; }
    }
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  },

  _run(fn) {
    if (this._muted) return;
    const ctx = this._get();
    if (!ctx) return;
    try { fn(ctx); } catch(e) {}
  },

  /* ── UI ──────────────────────────────────────────────────────────────── */
  click() {
    this._run(ctx => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'square'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055);
      o.start(); o.stop(ctx.currentTime + 0.055);
    });
  },

  /* ── Dialogue tick (one per line, not per char) ──────────────────────── */
  dialogue() {
    this._run(ctx => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'square'; o.frequency.value = 680;
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      o.start(); o.stop(ctx.currentTime + 0.03);
    });
  },

  /* ── Attack (physical impact) ────────────────────────────────────────── */
  attack() {
    this._run(ctx => {
      // white noise burst
      const len = Math.floor(ctx.sampleRate * 0.13);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 2);
      const src = ctx.createBufferSource(), ng = ctx.createGain();
      src.buffer = buf; src.connect(ng); ng.connect(ctx.destination);
      ng.gain.value = 0.4; src.start();

      // low thud
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.connect(og); og.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(150, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.18);
      og.gain.setValueAtTime(0.35, ctx.currentTime);
      og.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      o.start(); o.stop(ctx.currentTime + 0.2);
    });
  },

  /* ── Enemy takes hit ────────────────────────────────────────────────── */
  enemyHit() {
    this._run(ctx => {
      const len = Math.floor(ctx.sampleRate * 0.08);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 1.5);
      const src = ctx.createBufferSource(), g = ctx.createGain();
      src.buffer = buf; src.connect(g); g.connect(ctx.destination);
      g.gain.value = 0.28; src.start();
    });
  },

  /* ── Magic cast ────────────────────────────────────────────────────── */
  magic() {
    this._run(ctx => {
      [1, 1.5, 2].forEach((ratio, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        const t = ctx.currentTime + i * 0.05;
        o.frequency.setValueAtTime(440 * ratio, t);
        o.frequency.exponentialRampToValueAtTime(900 * ratio, t + 0.28);
        g.gain.setValueAtTime(0.11, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
        o.start(t); o.stop(t + 0.36);
      });
    });
  },

  /* ── Heal ───────────────────────────────────────────────────────────── */
  heal() {
    this._run(ctx => {
      [523, 659, 784].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine'; o.frequency.value = freq;
        const t = ctx.currentTime + i * 0.09;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.14, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
        o.start(t); o.stop(t + 0.34);
      });
    });
  },

  /* ── Level up fanfare ────────────────────────────────────────────────── */
  levelUp() {
    this._run(ctx => {
      [392, 494, 587, 784].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'square'; o.frequency.value = freq;
        const t = ctx.currentTime + i * 0.12;
        g.gain.setValueAtTime(0.13, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        o.start(t); o.stop(t + 0.3);
      });
      // sparkle tail
      const o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o2.connect(g2); g2.connect(ctx.destination);
      o2.type = 'sine';
      o2.frequency.setValueAtTime(1200, ctx.currentTime + 0.38);
      o2.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.65);
      g2.gain.setValueAtTime(0.09, ctx.currentTime + 0.38);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      o2.start(ctx.currentTime + 0.38); o2.stop(ctx.currentTime + 0.7);
    });
  },

  /* ── Victory fanfare ─────────────────────────────────────────────────── */
  victory() {
    this._run(ctx => {
      [523, 659, 784, 1047, 1319].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine'; o.frequency.value = freq;
        const t = ctx.currentTime + i * 0.1;
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
        o.start(t); o.stop(t + 0.48);
      });
    });
  },

  /* ── Defeat ──────────────────────────────────────────────────────────── */
  defeat() {
    this._run(ctx => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(440, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.9);
      g.gain.setValueAtTime(0.28, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.92);
      o.start(); o.stop(ctx.currentTime + 0.92);
    });
  },

  /* ── Shard obtained ──────────────────────────────────────────────────── */
  shardGet() {
    this._run(ctx => {
      [880, 1100, 1320, 1760].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        const t = ctx.currentTime + i * 0.08;
        o.frequency.setValueAtTime(freq, t);
        o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.24);
        g.gain.setValueAtTime(0.14, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        o.start(t); o.stop(t + 0.32);
      });
    });
  },

  /* ── World map travel ────────────────────────────────────────────────── */
  mapMove() {
    this._run(ctx => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(330, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.2);
      g.gain.setValueAtTime(0.13, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.start(); o.stop(ctx.currentTime + 0.25);
    });
  },

  /* ── Toggle mute — returns new muted state ───────────────────────────── */
  toggleMute() {
    this._muted = !this._muted;
    const btn = document.getElementById('mute-btn');
    if (btn) btn.textContent = this._muted ? '🔇' : '🔊';

    // Sync BGM mute
    if (typeof BGM !== 'undefined') {
      BGM.toggleMute(this._muted);
    }

    return this._muted;
  },
};
