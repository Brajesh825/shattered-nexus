/**
 * tts.js — Shattered Nexus Text-to-Speech
 * Uses the Web Speech API (built into all modern browsers, no API key needed).
 * Each character gets a distinct voice profile (pitch + rate + preferred voice).
 *
 * VOICE PRIORITY STRATEGY:
 *   1. "Enhanced" / Neural OS voices  → most natural, human-sounding
 *   2. Windows 11 Neural voices       → very natural (Aria, Jenny, Guy)
 *   3. Standard named voices          → decent fallback
 *   4. Gender-keyword match           → last resort
 *
 * TIP: On macOS, go to System Settings → Accessibility → Spoken Content →
 *      System Voice → Manage Voices, and download "Enhanced" packs for the
 *      best quality. On Windows 11, Neural voices are included by default.
 */
const TTS = {
  _enabled: false,
  _voices:  [],
  _picked:  {},   // speaker key → SpeechSynthesisVoice (cached after first pick)

  /* ── Voice profiles per speaker ─────────────────────────────────────── */
  PROFILES: {
    Ayaka: {
      pitch: 1.08, rate: 0.90,
      // Calm, elegant, soft feminine voice
      prefer: [
        // macOS Enhanced (most natural)
        'Samantha (Enhanced)', 'Ava (Enhanced)', 'Allison (Enhanced)',
        // Windows 11 Neural
        'Aria', 'Jenny',
        // iOS Siri / other Apple
        'Siri', 'Kate (Enhanced)', 'Serena (Enhanced)',
        // Standard fallbacks
        'Samantha', 'Victoria', 'Karen', 'Hazel', 'Susan', 'Moira',
      ],
      wantFem: true,
    },

    Hutao: {
      pitch: 1.22, rate: 1.06,
      // Energetic, slightly higher, playful feminine voice
      prefer: [
        // macOS Enhanced
        'Nicky (Enhanced)', 'Allison (Enhanced)', 'Ava (Enhanced)',
        // Windows 11 Neural
        'Aria', 'Jenny', 'Michelle',
        // Standard fallbacks
        'Nicky', 'Salli', 'Kendra', 'Zira', 'Tessa', 'Joanna',
      ],
      wantFem: true,
    },

    Nilou: {
      pitch: 1.14, rate: 0.86,
      // Gentle, warm, slightly breathy feminine voice
      prefer: [
        // macOS Enhanced
        'Samantha (Enhanced)', 'Ava (Enhanced)', 'Kate (Enhanced)',
        // Windows 11 Neural
        'Aria', 'Jenny',
        // Standard fallbacks
        'Hazel', 'Joanna', 'Samantha', 'Kendra', 'Victoria', 'Susan',
      ],
      wantFem: true,
    },

    Xiao: {
      pitch: 0.80, rate: 0.84,
      // Low, quiet, serious masculine voice
      prefer: [
        // macOS Enhanced
        'Daniel (Enhanced)', 'Alex (Enhanced)', 'Tom (Enhanced)',
        // Windows 11 Neural
        'Guy', 'Davis', 'Jason',
        // Standard fallbacks
        'Daniel', 'David', 'Mark', 'Arthur', 'Alex', 'George',
      ],
      wantFem: false,
    },

    narrator: {
      pitch: 0.86, rate: 0.76,
      // Deep, measured, authoritative narrator voice
      prefer: [
        // macOS Enhanced
        'Daniel (Enhanced)', 'Tom (Enhanced)', 'Alex (Enhanced)',
        // Windows 11 Neural
        'Guy', 'Brian (Enhanced)', 'Davis',
        // Standard fallbacks
        'Daniel', 'George', 'Brian', 'Alex', 'Tom', 'Fred',
      ],
      wantFem: false,
    },
  },

  /* ── Keyword lists for gender-guessing when no preferred name matches ── */
  _femKw: [
    'female', 'woman', 'girl',
    // Common female voice name keywords
    'aria', 'jenny', 'michelle', 'zira', 'hazel', 'samantha', 'salli',
    'kendra', 'joanna', 'victoria', 'karen', 'moira', 'susan', 'tessa',
    'nicky', 'fiona', 'veena', 'amelie', 'ioana', 'milena', 'ava',
    'allison', 'kate', 'serena',
  ],
  _malKw: [
    'male', 'man',
    // Common male voice name keywords
    'guy', 'davis', 'jason', 'david', 'daniel', 'mark', 'alex', 'george',
    'fred', 'arthur', 'brian', 'tom', 'rishi', 'lee', 'diego', 'jorge',
    'luca', 'reed', 'aaron',
  ],

  /* ── Initialise: load voices (may be async on some browsers) ─────────── */
  init() {
    if (!window.speechSynthesis) return;
    const load = () => {
      this._voices = speechSynthesis.getVoices();
      this._picked = {};   // reset cache so voices are re-picked with full list
    };
    load();
    speechSynthesis.onvoiceschanged = load;
  },

  /* ── Pick the best voice for a speaker key ───────────────────────────── */
  _pick(speakerKey) {
    if (this._picked[speakerKey]) return this._picked[speakerKey];

    const voices = this._voices;
    if (!voices.length) return null;

    const prof = this.PROFILES[speakerKey] || this.PROFILES.narrator;

    // 1. Try preferred names — English voices first, then any locale.
    //    Also tries partial matches (e.g. "Aria" matches "Microsoft Aria Online")
    for (const name of prof.prefer) {
      const lc = name.toLowerCase();
      const v  = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes(lc))
              || voices.find(v => v.name.toLowerCase().includes(lc));
      if (v) { this._picked[speakerKey] = v; return v; }
    }

    // 2. Prefer "Enhanced" or "Neural" English voices matching desired gender
    const kwList = prof.wantFem ? this._femKw : this._malKw;
    const enhanced = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('enhanced') || v.name.toLowerCase().includes('neural')) &&
      kwList.some(kw => v.name.toLowerCase().includes(kw))
    );
    if (enhanced) { this._picked[speakerKey] = enhanced; return enhanced; }

    // 3. Any English voice matching gender keywords
    const byGender = voices.find(v =>
      v.lang.startsWith('en') && kwList.some(kw => v.name.toLowerCase().includes(kw))
    );
    if (byGender) { this._picked[speakerKey] = byGender; return byGender; }

    // 4. Any English voice
    const anyEn = voices.find(v => v.lang.startsWith('en'));
    if (anyEn) { this._picked[speakerKey] = anyEn; return anyEn; }

    // 5. Absolute fallback — whatever is available
    this._picked[speakerKey] = voices[0];
    return voices[0];
  },

  /* ── Speak a line ───────────────────────────────────────────────────── */
  speak(speakerKey, text) {
    if (!this._enabled || !window.speechSynthesis || !text) return;

    // Reload voices if they haven't arrived yet
    if (!this._voices.length) this._voices = speechSynthesis.getVoices();

    speechSynthesis.cancel();

    const utt   = new SpeechSynthesisUtterance(text);
    const prof  = this.PROFILES[speakerKey] || this.PROFILES.narrator;
    const voice = this._pick(speakerKey);

    if (voice) utt.voice = voice;
    utt.pitch  = prof.pitch;
    utt.rate   = prof.rate;
    utt.volume = 1.0;

    speechSynthesis.speak(utt);
  },

  /* ── Stop any current speech ────────────────────────────────────────── */
  stop() {
    if (window.speechSynthesis) speechSynthesis.cancel();
  },

  /* ── Toggle on/off — returns new state ──────────────────────────────── */
  toggle() {
    this._enabled = !this._enabled;
    if (!this._enabled) this.stop();
    const btn = document.getElementById('tts-btn');
    if (btn) {
      btn.textContent = this._enabled ? '🗣️' : '💬';
      btn.title       = this._enabled ? 'Voice: ON (click to mute)' : 'Voice: OFF (click to enable)';
      btn.classList.toggle('tts-active', this._enabled);
    }
    return this._enabled;
  },

  /* ── Debug helper: log all available voices to console ─────────────── */
  listVoices() {
    const voices = speechSynthesis.getVoices();
    console.group(`Available voices (${voices.length})`);
    voices.forEach((v, i) =>
      console.log(`[${i}] ${v.name} | ${v.lang} | local: ${v.localService}`)
    );
    console.groupEnd();
  },

  get supported() { return !!window.speechSynthesis; },
};