/**
 * ambient.js — Procedural ambient soundscape engine.
 * Pure Web Audio API synthesis, no audio files required.
 * Piggybacks on SFX._get() for shared AudioContext.
 */
const AmbientEngine = (() => {
  const TARGET_VOL = 0.07;
  let _masterGain = null;
  let _nodes = [];
  let _currentMap = null;

  function _ctx() {
    if (typeof SFX === 'undefined') return null;
    return SFX._get();
  }

  function _ensureGain(ctx) {
    if (!_masterGain || _masterGain.context !== ctx) {
      _masterGain = ctx.createGain();
      _masterGain.connect(ctx.destination);
      _masterGain.gain.value = 0;
    }
    return _masterGain;
  }

  /* ── Node pool helpers ──────────────────────────────── */
  function _track(node) { _nodes.push(node); return node; }

  function _noise(ctx, secs = 3) {
    const len = Math.floor(ctx.sampleRate * secs);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  }

  function _osc(ctx, type, freq) {
    const o = ctx.createOscillator();
    o.type = type; o.frequency.value = freq; return o;
  }

  function _filt(ctx, type, freq, q) {
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq;
    if (q) f.Q.value = q; return f;
  }

  function _gain(ctx, val) {
    const g = ctx.createGain(); g.gain.value = val; return g;
  }

  /* ── Preset builders ────────────────────────────────── */

  // Verdant Vale — gentle wind through leaves
  function _forest(ctx, out) {
    // Brown-ish wind rumble
    const wind = _track(_noise(ctx, 4));
    const lp   = _filt(ctx, 'lowpass', 160);
    const wg   = _gain(ctx, 0.55);
    wind.connect(lp); lp.connect(wg); wg.connect(out);
    wind.start();

    // Breeze howl — bandpass sweep via slow LFO
    const howl  = _track(_noise(ctx, 3));
    const bp    = _filt(ctx, 'bandpass', 300, 5);
    const lfo   = _track(_osc(ctx, 'sine', 0.07));
    const lfoG  = _gain(ctx, 130);
    const hg    = _gain(ctx, 0.20);
    lfo.connect(lfoG); lfoG.connect(bp.frequency);
    howl.connect(bp); bp.connect(hg); hg.connect(out);
    howl.start(); lfo.start();

    // Distant bird chirp ping (subtle high sine blip on slow LFO)
    const bird  = _track(_osc(ctx, 'sine', 1800));
    const bTrem = _track(_osc(ctx, 'sine', 0.12));
    const bTG   = _gain(ctx, 0.018);
    const bg    = _gain(ctx, 0.018);
    bTrem.connect(bTG); bTG.connect(bird.frequency);
    bird.connect(bg); bg.connect(out);
    bird.start(); bTrem.start();
  }

  // Ember Wastes — volcanic low rumble + crackle
  function _lava(ctx, out) {
    // Sub rumble
    const rumble = _track(_noise(ctx, 2));
    const lp     = _filt(ctx, 'lowpass', 80);
    const rg     = _gain(ctx, 0.70);
    rumble.connect(lp); lp.connect(rg); rg.connect(out);
    rumble.start();

    // Deep drone pitch-shifted by slow LFO
    const drone = _track(_osc(ctx, 'sine', 46));
    const lfo   = _track(_osc(ctx, 'sine', 0.18));
    const lfoG  = _gain(ctx, 6);
    const dg    = _gain(ctx, 0.45);
    lfo.connect(lfoG); lfoG.connect(drone.frequency);
    drone.connect(dg); dg.connect(out);
    drone.start(); lfo.start();

    // Mid crackle — bandpass mid noise
    const crack = _track(_noise(ctx, 1.5));
    const bp    = _filt(ctx, 'bandpass', 320, 3);
    const cLfo  = _track(_osc(ctx, 'sine', 0.6));
    const cLfoG = _gain(ctx, 0.18);
    const cg    = _gain(ctx, 0.20);
    cLfo.connect(cLfoG); cLfoG.connect(cg.gain);
    crack.connect(bp); bp.connect(cg); cg.connect(out);
    crack.start(); cLfo.start();
  }

  // Crystal Cavern — ethereal chorus drone
  function _crystal(ctx, out) {
    // Three slightly detuned sines = chorus effect
    [219.5, 220.8, 221.9].forEach((f, i) => {
      const o  = _track(_osc(ctx, 'sine', f));
      const og = _gain(ctx, 0.10);
      o.connect(og); og.connect(out);
      o.start();
    });

    // High shimmer with slow vibrato
    const hi   = _track(_osc(ctx, 'sine', 1760));
    const lfo  = _track(_osc(ctx, 'sine', 0.28));
    const lfoG = _gain(ctx, 0.032);
    const hg   = _gain(ctx, 0.020);
    lfo.connect(lfoG); lfoG.connect(hi.frequency);
    hi.connect(hg); hg.connect(out);
    hi.start(); lfo.start();

    // Subsonic cave resonance
    const cave = _track(_noise(ctx, 2));
    const bp   = _filt(ctx, 'bandpass', 95, 6);
    const cavG = _gain(ctx, 0.20);
    cave.connect(bp); bp.connect(cavG); cavG.connect(out);
    cave.start();
  }

  // Shadow Reach — oppressive ominous hum with tremolo
  function _shadow(ctx, out) {
    const osc  = _track(_osc(ctx, 'sawtooth', 55));
    const lp   = _filt(ctx, 'lowpass', 190);
    const lfo  = _track(_osc(ctx, 'sine', 0.13));
    const lfoG = _gain(ctx, 0.35);
    const g    = _gain(ctx, 0.42);
    lfo.connect(lfoG); lfoG.connect(g.gain);
    osc.connect(lp); lp.connect(g); g.connect(out);
    osc.start(); lfo.start();

    // Dissonant fifth
    const osc2 = _track(_osc(ctx, 'sine', 82));
    const g2   = _gain(ctx, 0.18);
    osc2.connect(g2); g2.connect(out);
    osc2.start();
  }

  // Void Citadel / Eternal Void — pulsing sub-bass void
  function _void_(ctx, out) {
    const sub  = _track(_osc(ctx, 'sine', 28));
    const lfo  = _track(_osc(ctx, 'sine', 0.22));
    const lfoG = _gain(ctx, 0.65);
    const sg   = _gain(ctx, 0.65);
    lfo.connect(lfoG); lfoG.connect(sg.gain);
    sub.connect(sg); sg.connect(out);
    sub.start(); lfo.start();

    // High-frequency void hiss
    const hiss = _track(_noise(ctx, 2));
    const hp   = _filt(ctx, 'highpass', 3200);
    const hg   = _gain(ctx, 0.12);
    hiss.connect(hp); hp.connect(hg); hg.connect(out);
    hiss.start();
  }

  // Sunken Temple / dungeon drip hum
  function _dungeon(ctx, out) {
    const n  = _track(_noise(ctx, 2));
    const bp = _filt(ctx, 'bandpass', 110, 3);
    const g  = _gain(ctx, 0.38);
    n.connect(bp); bp.connect(g); g.connect(out);
    n.start();

    // Water resonance ping
    const ping = _track(_osc(ctx, 'sine', 440));
    const lfo  = _track(_osc(ctx, 'sine', 0.05));
    const lfoG = _gain(ctx, 0.015);
    const pg   = _gain(ctx, 0.012);
    lfo.connect(lfoG); lfoG.connect(ping.frequency);
    ping.connect(pg); pg.connect(out);
    ping.start(); lfo.start();
  }

  // Fortress Ramparts — dark battle-worn wind
  function _fortress(ctx, out) {
    const wind = _track(_noise(ctx, 3));
    const bp   = _filt(ctx, 'bandpass', 200, 2);
    const lfo  = _track(_osc(ctx, 'sine', 0.09));
    const lfoG = _gain(ctx, 100);
    const wg   = _gain(ctx, 0.40);
    lfo.connect(lfoG); lfoG.connect(bp.frequency);
    wind.connect(bp); bp.connect(wg); wg.connect(out);
    wind.start(); lfo.start();

    const drone = _track(_osc(ctx, 'sawtooth', 38));
    const dlp   = _filt(ctx, 'lowpass', 150);
    const dg    = _gain(ctx, 0.30);
    drone.connect(dlp); dlp.connect(dg); dg.connect(out);
    drone.start();
  }

  const PRESETS = {
    verdant_vale:      _forest,
    ember_wastes:      _lava,
    crystal_cavern:    _crystal,
    shadow_reach:      _shadow,
    void_citadel:      _void_,
    eternal_void:      _void_,
    sunken_temple:     _dungeon,
    fortress_ramparts: _fortress,
  };

  /* ── Fade helpers ───────────────────────────────────── */
  function _fadeTo(targetVol, duration) {
    if (!_masterGain) return;
    const ctx = _masterGain.context;
    const now = ctx.currentTime;
    _masterGain.gain.cancelScheduledValues(now);
    _masterGain.gain.setValueAtTime(_masterGain.gain.value, now);
    _masterGain.gain.linearRampToValueAtTime(targetVol, now + duration);
  }

  function _cleanNodes() {
    _nodes.forEach(n => { try { n.stop ? n.stop(0) : n.disconnect(); } catch(e) {} });
    _nodes = [];
  }

  function _build(mapId) {
    const ctx = _ctx();
    if (!ctx) return;
    const builder = PRESETS[mapId];
    if (!builder) return;
    const out = _ensureGain(ctx);
    try {
      builder(ctx, out);
      _fadeTo(TARGET_VOL, 2.5);
    } catch(e) {}
  }

  /* ── Public API ─────────────────────────────────────── */
  function setMap(mapId) {
    if (_currentMap === mapId) return;
    _currentMap = mapId;

    if (_nodes.length > 0) {
      _fadeTo(0, 0.8);
      setTimeout(() => { _cleanNodes(); _build(mapId); }, 900);
    } else {
      _build(mapId);
    }
  }

  function stop() {
    _currentMap = null;
    _fadeTo(0, 0.6);
    setTimeout(_cleanNodes, 700);
  }

  return { setMap, stop };
})();
