/**
 * cutscene.js — Shattered Nexus Cutscene & Dialogue Engine
 * Extracted from story.js to manage rendering, typewriter, and scene characters.
 */

const Cutscene = {
  /* ── Constants ──────────────────────────────────────────────────────────── */
  SPEAKER_COLOR: {
    Aya: '#7dd3fc',
    Tao: '#ef4444',
    Lulu: '#2dd4bf',
    Rei: '#4ade80',
    Ria: '#a78bfa',
    Valka: '#e879f9',
    Drake: '#0ea5e9',
    Rex: '#fbbf24',
    Sera: '#93c5fd',
    'Demon Lord': '#f97316',
    Valdris: '#c084fc',
  },

  ALIAS_TO_CHARID: {
    aya: 'aya',
    tao: 'tao',
    lulu: 'lulu',
    rei: 'rei',
    ria: 'ria',
    valka: 'valka',
    drake: 'drake',
    rex: 'rex',
    sera: 'sera',
    'king_galdor': 'galdor_king',
    'void_knight': 'void_knight',
    'demon_lord': 'demon_lord',
    'valdris': 'shadow_emperor'
  },

  SPEAKER_PORTRAIT: {
    narrator: '📖',
  },

  /* ── State ──────────────────────────────────────────────────────────────── */
  _activeLines: [],
  _onLinesDone: null,
  _lineIdx: 0,
  _tw: { timer: null, full: '', done: true },
  _charAppeared: {},
  _charPositions: {},
  _posCounter: 0,
  _twDelay: 22,

  /* ── Public API ─────────────────────────────────────────────────────────── */

  init() {
    this.clear();
  },

  /** 
   * Start a sequence of lines. 
   * @param {Array} lines - Array of { speaker, text, emotion } objects.
   * @param {Function} onDone - Callback when lines are finished.
   */
  start(lines, onDone) {
    const flat = [];
    (lines || []).forEach(l => {
      if (l.is_narration || (!l.speaker && l.narration)) {
        flat.push({ speaker: null, text: l.narration || l.text, emotion: l.emotion });
      } else {
        flat.push({ speaker: l.speaker, text: l.text, emotion: l.emotion });
      }
    });

    this._activeLines = flat;
    this._onLinesDone = onDone;
    this._lineIdx = 0;
    this._charAppeared = {};
    this._charPositions = {};
    this._posCounter = 0;

    // Wipe any sprites from the previous cutscene segment. Without this, each
    // consecutive start() call (pre_dialogue → post_dialogue → character_moment,
    // etc.) stacks fresh DOM sprites on top of the old ones since _charAppeared
    // was just reset to {} but the layer still held the prior chapter's cast.
    this._clearSceneLayer();

    if (flat.length === 0) {
      onDone && onDone();
      return;
    }

    this._renderActiveLine();
    this._showSection('s-dialogue');
    this._setContinue('▶ CONTINUE');
  },

  /** Advance to next line or skip typewriter */
  advance() {
    // Skip typewriter first if still running
    if (!this._tw.done) {
      this._skipTw();
      return;
    }

    this._lineIdx++;
    if (this._lineIdx < this._activeLines.length) {
      this._renderActiveLine();
    } else if (this._onLinesDone) {
      const cb = this._onLinesDone;
      this._onLinesDone = null;
      cb();
    }
  },

  /** Full skip of all pending lines */
  skip() {
    this._skipTw();
    this._lineIdx = 999;
    if (this._onLinesDone) {
      const cb = this._onLinesDone;
      this._onLinesDone = null;
      cb();
    }
  },

  clear() {
    this._activeLines = [];
    this._onLinesDone = null;
    this._lineIdx = 0;
    this._charAppeared = {};
    this._clearSceneLayer();
    
    const dialogue = this.el('s-dialogue');
    if (dialogue) {
      dialogue.style.display = 'none';
      this.el('s-speaker').textContent = '';
      this.el('s-text').textContent = '';
    }
  },

  /* ── Rendering Internal ─────────────────────────────────────────────────── */

  _renderActiveLine() {
    const l = this._activeLines[this._lineIdx];
    if (!l) return;
    
    this._renderLine(l.speaker || null, l.text || '', l.emotion || null);
    this._setContinue('▶ CONTINUE');
  },

  _renderLine(speaker, text, emotion) {
    const box = this.el('s-dialogue');
    const spkEl = this.el('s-speaker');
    const txtEl = this.el('s-text');
    const emojiEl = this.el('s-portrait-emoji');
    if (!box) return;

    box.style.display = '';
    if (typeof SFX !== 'undefined' && SFX.dialogue) SFX.dialogue();

    // Render scene characters if chapter cast exists
    if (window.Story && window.Story.currentChap && window.Story.currentChap.cast) {
      this._renderSceneCharacters(speaker, emotion);
    }

    if (speaker) {
      spkEl.textContent = speaker.toUpperCase();
      spkEl.style.color = this.SPEAKER_COLOR[speaker] || '#f0f0f8';
      spkEl.style.display = 'block';
      box.dataset.speaker = speaker.toLowerCase();

      if (emojiEl) {
        emojiEl.style.display = 'block';
        emojiEl.textContent = '💬';
      }
    } else {
      spkEl.style.display = 'none';
      box.dataset.speaker = 'narrator';
      if (emojiEl) {
        emojiEl.style.display = 'block';
        emojiEl.textContent = this.SPEAKER_PORTRAIT.narrator;
      }
    }

    this._typewrite(txtEl, text || '');
  },

  _typewrite(el, text) {
    if (this._tw.timer) clearTimeout(this._tw.timer);
    this._tw.full = text;
    this._tw.done = false;
    this._tw.el = el;
    let idx = 0;
    el.textContent = '';

    const baseDelay = this._twDelay;
    let isPaused = 0;

    const tick = () => {
      if (isPaused > 0) {
        isPaused--;
      } else {
        idx = Math.min(idx + 1, text.length);
        const char = text.charAt(idx - 1);
        el.textContent = text.slice(0, idx);

        if (char === '.' || char === '!' || char === '?') {
          isPaused = 12;
        } else if (char === ',') {
          isPaused = 6;
        }

        if (idx >= text.length) {
          this._tw.done = true;
          this._tw.timer = null;
          return;
        }
      }
      this._tw.timer = setTimeout(tick, baseDelay);
    };

    this._tw.timer = setTimeout(tick, baseDelay);
  },

  _skipTw() {
    if (this._tw.timer) clearTimeout(this._tw.timer);
    this._tw.done = true;
    const el = this._tw.el || this.el('s-text');
    if (el) el.textContent = this._tw.full;
  },

  _renderSceneCharacters(speaker, emotion) {
    if (!window.Story || !window.Story.currentChap) return;
    if (!window.Story.currentChap.cast) window.Story.currentChap.cast = [];

    const layer = this.el('s-scene-layer');
    if (!layer) return;

    const cast = window.Story.currentChap.cast;

    // Dynamically inject active party members into cast
    if (window.G && G.party) {
      G.party.forEach(m => {
        if (!m) return;
        const nameMap = {
          aya: 'Aya', tao: 'Tao', lulu: 'Lulu', rei: 'Rei', ria: 'Ria', valka: 'Valka', drake: 'Drake', rex: 'Rex', sera: 'Sera'
        };
        const standardName = nameMap[m.charId];
        if (standardName && !cast.includes(standardName)) {
          cast.push(standardName);
        }
      });
    }

    // Dynamically inject current speaker if not already in cast (excluding off-screen voices)
    const offScreenSpeakers = ['valdris'];
    if (speaker && speaker.toLowerCase() !== 'narrator' && !offScreenSpeakers.includes(speaker.toLowerCase()) && !cast.includes(speaker)) {
      cast.push(speaker);
    }

    // Surface the cast count on the layer so CSS can scale dimmed siblings tighter
    // when the scene is crowded (e.g. 5-cast boss intros: 4 heroes + boss enemy).
    if (layer.dataset.castCount !== String(cast.length)) {
      layer.dataset.castCount = String(cast.length);
    }

    // Separate into heroes and enemies to calculate position offsets
    const playableIds = ['aya', 'tao', 'lulu', 'rei', 'ria', 'valka', 'drake', 'rex', 'sera'];
    const categorized = cast.map((charName, index) => {
      const charId = this._charIdForSpeaker(charName);
      const isPlayable = playableIds.includes(charId);
      return { charName, index, charId, isPlayable };
    });

    const heroesList = categorized.filter(c => c.isPlayable);
    const enemiesList = categorized.filter(c => !c.isPlayable);
    const hasMix = heroesList.length > 0 && enemiesList.length > 0;

    cast.forEach((charName, idx) => {
      if (!charName) return;

      const charId = this._charIdForSpeaker(charName);
      const isPlayable = playableIds.includes(charId);

      if (!this._charAppeared[charName]) {
        this._charAppeared[charName] = true;

        const charEl = document.createElement('div');
        charEl.className = 's-scene-char';
        if (!isPlayable) {
          charEl.classList.add('s-enemy');
        }
        charEl.id = `s-scene-char-${charName.toLowerCase().replace(/ /g, '_')}`;

        // Calculate horizontal offset based on character type
        let leftPct = 50;
        if (hasMix) {
          if (isPlayable) {
            const heroIdx = heroesList.findIndex(h => h.charName === charName);
            if (heroesList.length === 1) {
              leftPct = 25;
            } else {
              leftPct = Math.round(8 + (heroIdx / (heroesList.length - 1)) * 46);
            }
          } else {
            const enemyIdx = enemiesList.findIndex(e => e.charName === charName);
            if (enemiesList.length === 1) {
              leftPct = 82;
            } else {
              leftPct = Math.round(72 + (enemyIdx / (enemiesList.length - 1)) * 20);
            }
          }
        } else {
          if (cast.length === 2) {
            leftPct = idx === 0 ? 25 : 75;
          } else if (cast.length === 3) {
            leftPct = idx === 0 ? 15 : idx === 1 ? 50 : 85;
          } else if (cast.length === 4) {
            leftPct = [12, 38, 62, 88][idx];
          } else if (cast.length === 5) {
            leftPct = [8, 28, 50, 72, 92][idx];
          } else if (cast.length > 5) {
            leftPct = Math.round(8 + (idx / (cast.length - 1)) * 84);
          }
        }
        charEl.style.left = `${leftPct}%`;

        const spriteEl = document.createElement('div');
        spriteEl.className = 's-scene-sprite';
        const speakerCharId = this._charIdForSpeaker(charName);
        const isLandscape = window.innerWidth > window.innerHeight;
        const portraitHeight = isLandscape ? '80vh' : '55vh';
        
        if (typeof SpriteRenderer !== 'undefined') {
          SpriteRenderer.setFrame(spriteEl, speakerCharId, 'idle', portraitHeight);
        }

        const nameEl = document.createElement('div');
        nameEl.className = 's-scene-char-name';
        nameEl.textContent = charName;

        charEl.appendChild(spriteEl);
        charEl.appendChild(nameEl);
        layer.appendChild(charEl);
      }

      const charEl = this.el(`s-scene-char-${charName.toLowerCase().replace(/ /g, '_')}`);
      if (charEl) {
        const spriteEl = charEl.querySelector('.s-scene-sprite');
        if (speaker && speaker.toLowerCase() === charName.toLowerCase()) {
          charEl.classList.add('active');
          charEl.classList.remove('dimmed');
          if (spriteEl) spriteEl.dataset.emotion = emotion ? emotion.toLowerCase() : 'neutral';
        } else {
          charEl.classList.remove('active');
          charEl.classList.add('dimmed');
          if (spriteEl) spriteEl.dataset.emotion = 'neutral';
        }
      }
    });
  },

  _clearSceneLayer() {
    const layer = this.el('s-scene-layer');
    if (layer) layer.innerHTML = '';
  },

  /* ── Helpers ────────────────────────────────────────────────────────────── */

  _charIdForSpeaker(name) {
    if (!name) return '';
    const clean = name.toLowerCase().replace(/ /g, '_');
    return this.ALIAS_TO_CHARID[clean] || clean;
  },

  _spiritSrc(name) {
    if (typeof SpriteRenderer !== 'undefined' && SpriteRenderer.getSpritePath) {
      return SpriteRenderer.getSpritePath(name);
    }
    return `images/characters/spirits/${name.toLowerCase()}_sprite.png`;
  },

  el: id => document.getElementById(id),

  _showSection(id) {
    ['s-arc-intro', 's-dialogue', 's-event', 's-arc-end', 's-epilogue'].forEach(sid => {
      const e = this.el(sid);
      if (e) e.style.display = sid === id ? '' : 'none';
    });
  },

  _setContinue(label) {
    const btn = this.el('s-continue');
    if (btn) {
      btn.textContent = label;
      btn.style.display = 'inline-block';
    }
  },

  _hideContinue() {
    const btn = this.el('s-continue');
    if (btn) btn.style.display = 'none';
  }
};

// Global export
window.Cutscene = Cutscene;
