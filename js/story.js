/**
 * story.js — Shattered Nexus Story Engine
 * Drives cutscenes, battles, events and arc progression from story.json
 */

/* ── Speaker colours ──────────────────────────────────────────────────────── */
const SPEAKER_COLOR = {
  Aya:   '#7dd3fc',
  Tao:   '#ef4444',
  Lulu:  '#2dd4bf',
  Rei:   '#4ade80',
  Ria:   '#a78bfa',
  Valka: '#e879f9',
  Drake: '#0ea5e9',
  Rex:   '#fbbf24',
};

/* ── Alias → charId mapping for image file lookups ──────────────────────── */
const ALIAS_TO_CHARID = {
  aya:   'ayaka',
  tao:   'hutao',
  lulu:  'nilou',
  rei:   'xiao',
  ria:   'rydia',
  valka: 'lenneth',
  drake: 'kain',
  rex:   'leon',
};

function _charIdForSpeaker(name) {
  return ALIAS_TO_CHARID[name.toLowerCase()] || name.toLowerCase();
}

/* ── Speaker portrait images ─────────────────────────────────────────────── */
const SPEAKER_IMG = {
  Aya:   'images/characters/spirits/ayaka_spirit.png',
  Tao:   'images/characters/spirits/hutao_spirit.png',
  Lulu:  'images/characters/spirits/nilou_spirit.png',
  Rei:   'images/characters/spirits/xiao_spirit.png',
  Ria:   'images/characters/spirits/rydia_spirit.png',
  Valka: 'images/characters/spirits/lenneth_spirit.png',
  Drake: 'images/characters/spirits/kain_spirit.png',
  Rex:   'images/characters/spirits/leon_spirit.png',
};

/* ── Speaker portrait emojis (narrator fallback) ────────────────────────── */
const SPEAKER_PORTRAIT = {
  narrator: '📖',
};

/* ══════════════════════════════════════════════════════════════════════════
   STORY ENGINE
══════════════════════════════════════════════════════════════════════════ */
/* ── World map node positions (820×300 SVG space, 2D geography) ─────────── */
const MAP_POSITIONS = [
  { x: 110, y: 245 },  // Arc 1: Summoning Grounds  (south-west, forest)
  { x: 270, y: 220 },  // Arc 2: Ember Wastes        (south-centre, desert)
  { x: 150, y: 155 },  // Arc 3: Sunken Temple        (west, coastal)
  { x: 370, y: 175 },  // Arc 4: Shadow Reach         (centre)
  { x: 500, y: 135 },  // Arc 5: Inner Sanctum        (centre-east)
  { x: 600, y:  95 },  // Arc 6: Fortress Gates       (north-east)
  { x: 680, y:  60 },  // Arc 7: Fortress Inner       (north)
  { x: 750, y:  30 },  // Arc 8: Eternal Void         (apex)
];
const MAP_ICONS   = ['🌲','🔥','🌊','👁','💎','🏰','🌑','⭐'];
const MAP_COLORS  = ['#1a4010','#7a2808','#083868','#300860','#481068','#201838','#100820','#060008'];

/* Explore map linked to each arc (index = arcIdx 0-based) */
const ARC_MAP_ID  = [
  'verdant_vale',      // Arc 1
  'crystal_cavern',    // Arc 2
  'ember_wastes',      // Arc 3
  'sunken_temple',     // Arc 4
  'shadow_reach',      // Arc 5
  'void_citadel',      // Arc 6
  'fortress_ramparts', // Arc 7
  'eternal_void',      // Arc 8
];

/* Short lore shown in the region revisit panel */
const ARC_LORE = [
  'The ruins still echo with the shouts of confusion — four strangers, summoned against their will, finding purpose in chaos.',
  'Ashveil burned for three days. The sands swallowed what the flames didn\'t claim. The survivors remember a sky made of embers.',
  'The Ember Wastes do not cool. The ground remembers the fire. Something in the spiral still turns.',
  'The Sunken Temple holds its breath. Water fills every crack, every corridor — and still the guardians patrol, loyal to a god already drowned.',
  'The Shadow Reach was the first place they felt truly afraid. Not of the monsters — but of the silence between them.',
  'Beyond the Gates, the darkness spoke. It offered rest, oblivion, an end to the weight of a world that wasn\'t theirs to save.',
  'The inner sanctum smells of ozone and old grief. Every torch is cold. Every door opens inward.',
  'Here, the void does not press against you. It waits inside you, patient as the end of all things.',
];

/* ══════════════════════════════════════════════════════════════════════════
   STORY ENGINE
══════════════════════════════════════════════════════════════════════════ */
const Story = {
  active: false,
  data: null,
  _pendingSave: null,   // loaded save data waiting for onHeroReady

  arcIdx: 0,
  chapIdx: -1,
  phase: null,    // current phase string
  sceneIdx: 0,
  lineIdx: 0,

  currentChap: null,
  _allEnemies: [],
  _activeLines: [],   // current dialogue/narration array being rendered
  _onLinesDone: null, // callback when _activeLines exhausted
  _retrying: false,

  // Scene character management
  _charAppeared: {},  // tracks which characters have appeared: { "Ayaka": true, ... }
  _charPositions: {}, // character positions: { "Ayaka": "left", "Hutao": "center", ... }
  _posCounter: 0,     // counter for distributing positions

  // Typewriter
  _tw: { timer: null, full: '', done: true },

  /* ── Element shortcut ── */
  el: id => document.getElementById(id),

  /* ════════════════════════════════════════════════════════════════════════
     INIT & LOAD
  ════════════════════════════════════════════════════════════════════════ */
  init(callback) {
    if (this.data) { callback && callback(); return; }
    const self = this;

    // Fallback: load the old monolithic story.json
    function tryLegacy() {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'data/story.json', true);
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 0) {
          try { self.data = JSON.parse(xhr.responseText); }
          catch (e) { console.error('Story: bad JSON', e); }
        }
        callback && callback();
      };
      xhr.onerror = () => { if (window.STORY_DATA) self.data = window.STORY_DATA; callback && callback(); };
      try { xhr.send(); } catch (e) { if (window.STORY_DATA) self.data = window.STORY_DATA; callback && callback(); }
    }

    // Load a single arc file, call done(arcObj|null)
    function loadArc(file, done) {
      const ax = new XMLHttpRequest();
      ax.open('GET', file, true);
      ax.onload = () => {
        let arc = null;
        if (ax.status === 200 || ax.status === 0) {
          try { arc = JSON.parse(ax.responseText); } catch (e) { console.error('Story: bad arc JSON', file, e); }
        }
        done(arc);
      };
      ax.onerror = () => done(null);
      try { ax.send(); } catch (e) { done(null); }
    }

    // Try new multi-file format: data/story/index.json
    const ix = new XMLHttpRequest();
    ix.open('GET', 'data/story/index.json', true);
    ix.onload = () => {
      if (ix.status !== 200 && ix.status !== 0) { tryLegacy(); return; }
      let meta;
      try { meta = JSON.parse(ix.responseText); } catch (e) { tryLegacy(); return; }
      const arcRefs = meta.arcs || [];
      if (arcRefs.length === 0) { self.data = { ...meta, arcs: [] }; callback && callback(); return; }
      const arcs = new Array(arcRefs.length).fill(null);
      let remaining = arcRefs.length;
      arcRefs.forEach((ref, i) => {
        loadArc(ref.file, arc => {
          arcs[i] = arc;
          if (--remaining === 0) {
            self.data = { ...meta, arcs: arcs.filter(Boolean) };
            callback && callback();
          }
        });
      });
    };
    ix.onerror = () => tryLegacy();
    try { ix.send(); } catch (e) { tryLegacy(); }
  },

  /* ════════════════════════════════════════════════════════════════════════
     PUBLIC ENTRY POINTS
  ════════════════════════════════════════════════════════════════════════ */

  /** Called by the NEW STORY title button — slot defaults to first empty */
  begin(slot = 0) {
    this._activeSlot = slot;
    this._newGameSlot = slot; // cleared on first _doSave() write
    this.init(() => {
      if (!this.data) { alert('Story data not found.'); return; }
      this.active = true;
      this.arcIdx = 0;
      this.chapIdx = -1;
      this.phase = null;
      G.mode = 'story';

      // Load characters if not already loaded
      if (!G.chars || G.chars.length === 0) {
        if (window.CHARACTERS_DATA) {
          G.chars = window.CHARACTERS_DATA;
        }
      }

      // Set default 4 characters for story start (no selection screen)
      const defaultChars = ['ayaka', 'hutao', 'nilou', 'xiao'];
      G.selectedChar = defaultChars[0];
      G.selectedChars = defaultChars;
      G.unlockedChars = defaultChars;

      // Find and set class for first character
      const firstChar = (G.chars || []).find(c => c.id === defaultChars[0]);
      if (firstChar) G.selectedClass = firstChar.classId || 'swordsman';

      // Build the party and set up G.hero
      buildParty();

      // Call onHeroReady directly to show arc intro
      this.onHeroReady();
    });
  },

  /** Called by the CONTINUE title button — slot selects which save to load */
  loadSave(slot = 0) {
    const s = Save.read(slot);
    if (!s) { startStoryMode(); return; }
    this._activeSlot  = slot;
    this._pendingSave = s;
    this.init(() => {
      if (!this.data) { alert('Story data not found.'); return; }
      this.active = true;
      G.selectedChar  = s.selectedChar  || (G.chars[0] && G.chars[0].id);
      G.selectedClass = s.selectedClass || (G.classes[0] && G.classes[0].id);
      // Restore full party selection if saved, otherwise rebuild from hero
      if (s.selectedChars && s.selectedChars.length) {
        G.selectedChars = s.selectedChars;
      } else {
        const heroId_ = G.selectedChar;
        G.selectedChars = [heroId_, ...G.chars.map(c=>c.id).filter(id=>id!==heroId_)].slice(0,4);
      }
      startBattle();   // sets up G.hero then calls onHeroReady
    });
  },

  /** Called by game.js startBattle() when Story.active */
  onHeroReady() {
    this._allEnemies = window._origEnemies || G.enemies.slice();

    if (this._pendingSave) {
      const s = this._pendingSave;
      this._pendingSave = null;
      this.arcIdx = s.arcIdx || 0;
      this.chapIdx = s.chapIdx !== undefined ? s.chapIdx : -1;
      // Restore all party member stats (new format) or fall back to hero-only (legacy)
      if (s.partyStats && s.partyStats.length && G.party.length) {
        G.party.forEach(m => {
          const saved = s.partyStats.find(p => p.charId === m.charId);
          if (saved) {
            m.lv   = saved.lv   || 1;
            m.exp  = saved.exp  || 0;
            m.gold = saved.gold || 0;
            if (saved.hp !== undefined) m.hp = saved.hp;
            if (saved.mp !== undefined) m.mp = saved.mp;
            if (saved.maxHp !== undefined) m.maxHp = saved.maxHp;
            if (saved.maxMp !== undefined) m.maxMp = saved.maxMp;
            if (saved.atk !== undefined) m.atk = saved.atk;
            if (saved.def !== undefined) m.def = saved.def;
            if (saved.mag !== undefined) m.mag = saved.mag;
            if (saved.spd !== undefined) m.spd = saved.spd;
            if (saved.lck !== undefined) m.lck = saved.lck;
            if (saved.accuracy !== undefined) m.accuracy = saved.accuracy;
            if (saved.critRate !== undefined) m.critRate = saved.critRate;
          }
        });
      } else if (s.hero && G.hero) {
        // Legacy save: only hero stats were persisted
        G.hero.lv   = s.hero.lv   || 1;
        G.hero.exp  = s.hero.exp  || 0;
        G.hero.gold = s.hero.gold || 0;
      }
      // Restore unlocked characters and inventory from save
      if (s.unlockedChars)  G.unlockedChars  = s.unlockedChars;
      if (s.clearedMaps)    G.clearedMaps    = s.clearedMaps;
      if (s.inventory)      G.inventory      = s.inventory;
      if (s.npcTalked)      G.npcTalked      = s.npcTalked;
      if (s.ownedRelics)    G.ownedRelics    = s.ownedRelics;
      if (s.activeRelics)   G.activeRelics   = s.activeRelics;

      // If saved from explore map, restore directly to that map (no overlay/selection)
      if (s.mapId) {
        // Find the actual explore chapter so EXIT works correctly afterward
        const arc = this.arc;
        const savedChap = (this.chapIdx >= 0 && arc.chapters) ? arc.chapters[this.chapIdx] : null;
        const chap = (savedChap && savedChap.type === 'explore')
          ? savedChap
          : { id: '_restore', type: 'explore', map: s.mapId, pre_dialogue: [], post_dialogue: [] };
        this._exploreChap = chap;
        this._launchExploreRestore(chap, s.mapX, s.mapY);
        return;
      }

      // Resume at the saved chapter — skip arc intro/char-select on load
      const arc = this.arc;
      const chapters = arc.chapters || [];
      if (this.chapIdx === -1) {
        // Saved at arc start: show arc intro instead of skipping to chapter 0
        this._showArcIntro();
        return;
      }
      if (this.chapIdx < chapters.length) {
        const chap = chapters[this.chapIdx];
        this._setHeader(`Arc ${arc.number}: ${arc.name}`, chap ? chap.title : '');
        this._setBg(chap ? chap.background : `arc${arc.number}_intro`);
        if (chap) this._loadChapter(chap);
        else this._showBossChapter();
      } else {
        this._showBossChapter();
      }
      return;
    }

    this._showArcIntro();
  },

  /** Called by game.js checkEnd() when enemy defeated in a story battle */
  onBattleWon() {
    /* Skirmish: just return to world map after win */
    if (this._skirmishArcIdx !== undefined) {
      this._skirmishArcIdx = undefined;
      this._showWorldMap();
      return;
    }

    const chap = this.currentChap;
    this.lineIdx = 0;

    // Show dialogue again after battle
    this._showSection('s-dialogue');

    // Process onVictory events from boss_chapter (character recruitment + relic reward)
    if (this.phase === 'boss_in' && this.currentBossChapter && this.currentBossChapter.onVictory) {
      this.currentBossChapter.onVictory.forEach(event => {
        if (event.type === 'recruit') {
          unlockCharacter(event.charId);
        }
      });
    }

    // Award boss relic if the arc defines one
    if (this.phase === 'boss_in' && this.arc) {
      const arcRelicId = (G.relics || []).find(r => r.arcDrop === this.arc.number)?.id;
      if (arcRelicId && typeof awardBossRelic === 'function') {
        const relic = awardBossRelic(arcRelicId);
        if (relic) {
          // Relic message will show as first line of post_dialogue banner
          this._pendingRelicMsg = `✦ Relic obtained: ${relic.icon} ${relic.name} — ${relic.bonusText}`;
        }
      }
    }

    if (this.phase === 'boss_in') {
      // CLEAR MAP FOR THIS ARC ON BOSS DEFEAT
      if (!Array.isArray(G.clearedMaps)) G.clearedMaps = [];
      const mapId = ARC_MAP_ID[this.arcIdx];
      if (mapId && !G.clearedMaps.includes(mapId)) {
        G.clearedMaps.push(mapId);
      }
      this._doSave(); // Save progress after boss defeat
      
      this.phase = 'boss_post';
      const postLines = chap.post_dialogue || [];
      if (this._pendingRelicMsg) {
        const msg = this._pendingRelicMsg;
        this._pendingRelicMsg = null;
        // Prepend relic notification as a narrator line
        const relicLine = { speaker: 'narrator', emotion: 'solemn', text: msg };
        this._showLines([relicLine, ...postLines], () => this._showCharMoment());
      } else {
        this._showLines(postLines, () => this._showCharMoment());
      }
    } else {
      this.phase = 'post_battle';
      this._showLines(chap.post_dialogue || [], () => this._nextChapter());
    }
    showScreen('story-screen');
  },

  /** Called by game.js checkEnd() when hero dies in a story battle */
  onBattleLost() {
    /* Skirmish defeat: just go back to map, no penalty */
    if (this._skirmishArcIdx !== undefined) {
      this._skirmishArcIdx = undefined;
      this._showWorldMap();
      return;
    }
    this.phase = 'retry';
    this._renderLine(null, 'The party falls... but fate is not done with them yet.');
    this._showSection('s-dialogue');
    const btn = this.el('s-continue');
    btn.textContent = '↺ TRY AGAIN';
    btn.style.display = 'inline-block';
    showScreen('story-screen');
  },

  /* ════════════════════════════════════════════════════════════════════════
     CONTINUE BUTTON (called from HTML onclick)
  ════════════════════════════════════════════════════════════════════════ */
  advance() {
    // Skip typewriter first if still running
    if (!this._tw.done) { this._skipTw(); return; }

    if (this.phase === 'retry') {
      this._retryBattle(); return;
    }

    if (this.phase === 'arc_intro') {
      // For Arc 1, go directly to first chapter (no character selection)
      // For Arc 2+, show character selection
      if (this.arcIdx === 0) {
        this._nextChapter();
      } else {
        goArcCharSelect();
      }
      return;
    }

    if (this.phase === 'arc_end') {
      const isLast = this.arcIdx >= this.data.arcs.length - 1;
      if (isLast) this._startNextArc();
      else this._showWorldMap();
      return;
    }

    if (this.phase === 'epilogue_cards') {
      this._endStory(); return;
    }

    // Advance through the current active lines array
    this.lineIdx++;
    if (this.lineIdx < this._activeLines.length) {
      this._renderActiveLine();
    } else if (this._onLinesDone) {
      const cb = this._onLinesDone;
      this._onLinesDone = null;
      cb();
    }
  },

  /* ════════════════════════════════════════════════════════════════════════
     ARC INTRO
  ════════════════════════════════════════════════════════════════════════ */
  _showArcIntro() {
    const arc = this.arc;
    this.phase = 'arc_intro';
    this.chapIdx = -1;

    this._showSection('s-arc-intro');

    this.el('s-arc-num').textContent = `ARC ${arc.number}`;
    this.el('s-arc-name').textContent = arc.name.toUpperCase();
    this.el('s-arc-sub').textContent = arc.subtitle || '';
    this.el('s-arc-theme').textContent = arc.theme || '';

    const shard = arc.shard || {};
    const shardEl = this.el('s-arc-shard');
    if (shard.name) {
      shardEl.style.display = 'block';
      shardEl.style.color = shard.color || '#fff';
      this.el('s-arc-shard-name').textContent = `🔮 ${shard.name}`;
    } else {
      shardEl.style.display = 'none';
    }

    this._setHeader(`Arc ${arc.number}: ${arc.name}`, '');
    this._setBg(`arc${arc.number}_intro`);
    this._setContinue('▶ BEGIN');
    showScreen('story-screen');
  },

  /* ════════════════════════════════════════════════════════════════════════
     CHAPTER DISPATCH
  ════════════════════════════════════════════════════════════════════════ */
  get arc() { return this.data.arcs[this.arcIdx]; },

  _nextChapter() {
    console.log('[Story._nextChapter] Called, current arcIdx:', this.arcIdx, 'chapIdx:', this.chapIdx);
    this.chapIdx++;
    const arc = this.arc;
    console.log('[Story._nextChapter] After increment, chapIdx:', this.chapIdx, 'arc.chapters.length:', arc.chapters.length);
    this._doSave();
    if (this.chapIdx < arc.chapters.length) {
      console.log('[Story._nextChapter] Loading chapter:', this.chapIdx);
      this._loadChapter(arc.chapters[this.chapIdx]);
    } else {
      console.log('[Story._nextChapter] Showing boss chapter');
      this._showBossChapter();
    }
    console.log('[Story._nextChapter] Finished');
  },

  _healParty() {
    if (G.party) {
      G.party.forEach(m => {
        m.hp = m.maxHp; m.mp = m.maxMp; m.isKO = false;
        m.buff = null; m.debuff = null; m.regenTurns = 0; m.stunned = false;
        const ch = G.chars.find(c => c.id === m.charId);
        if (ch) { ch.hp = m.hp; ch.mp = m.mp; ch.isKO = false; }
      });
      BattleUI.renderPartyStatus();
    }
  },

  _loadChapter(chap) {
    console.log('[Story._loadChapter] Called with chapter:', chap.id, 'type:', chap.type);
    if (chap.type === 'battle' || chap.type === 'boss_battle') {
      this._healParty();
    }
    this.currentChap = chap;
    this.sceneIdx = 0;
    this.lineIdx = 0;
    this._charAppeared = {};  // reset character appearances
    this._charPositions = {}; // reset character positions
    this._posCounter = 0;     // reset position counter
    this._clearSceneLayer();  // clear scene characters

    // Clear dialogue content
    const dialogue = this.el('s-dialogue');
    if (dialogue) {
      dialogue.style.display = 'none';
      this.el('s-speaker').textContent = '';
      this.el('s-text').textContent = '';
      this.el('s-portrait-img').style.display = 'none';
    }

    this._setHeader(`Arc ${this.arc.number}: ${this.arc.name}`, chap.title || '');
    this._setBg(chap.background);
    console.log('[Story._loadChapter] Processing chapter type:', chap.type);

    if (chap.type === 'cutscene') {
      console.log('[Story._loadChapter] Building scene lines...');
      this.phase = 'cutscene';
      this._buildSceneLines(chap.scenes);
      console.log('[Story._loadChapter] Setting onLinesDone callback...');
      this._onLinesDone = () => this._nextChapter();
      console.log('[Story._loadChapter] Rendering active line...');
      this._renderActiveLine();
      console.log('[Story._loadChapter] Showing dialogue section...');
      this._showSection('s-dialogue');
      console.log('[Story._loadChapter] Cutscene loaded');
    } else if (chap.type === 'battle') {
      this.phase = 'pre_battle';
      this._showLines(chap.pre_dialogue || [], () => this._launchStoryBattle(chap.enemy_id));
      console.log('[Story._loadChapter] Battle loaded');
    } else if (chap.type === 'event') {
      this.phase = 'event';
      this._renderEvent(chap);
      console.log('[Story._loadChapter] Event loaded');
    } else if (chap.type === 'boss_battle') {
      this.phase = 'pre_battle';
      this._showLines(chap.pre_dialogue || [], () => this._launchStoryBattle(chap.enemy_id));
      console.log('[Story._loadChapter] Boss battle loaded');
    } else if (chap.type === 'explore') {
      this.phase = 'exploring';
      this._showLines(chap.pre_dialogue || [], () => this._launchExplore(chap));
      console.log('[Story._loadChapter] Explore loaded, returning');
      return; // _launchExplore will switch screens
    }
    showScreen('story-screen');
    console.log('[Story._loadChapter] Finished');
  },

  /* ── Flatten a scenes array into a single lines array ── */
  _buildSceneLines(scenes) {
    const lines = [];
    (scenes || []).forEach(scene => {
      if (scene.narration) lines.push({ speaker: null, text: scene.narration });
      (scene.dialogue || []).forEach(d => {
        if (d.is_narration || (!d.speaker && d.narration)) {
          lines.push({ speaker: null, text: d.narration || d.text });
        } else {
          lines.push({ speaker: d.speaker, text: d.text });
        }
      });
    });
    this._activeLines = lines;
    this._onLinesDone = null;
    this.lineIdx = 0;
  },

  /* ════════════════════════════════════════════════════════════════════════
     GENERIC LINE LIST RENDERER
  ════════════════════════════════════════════════════════════════════════ */
  _showLines(lines, onDone) {
    const flat = [];
    (lines || []).forEach(l => {
      if (l.is_narration || (!l.speaker && l.narration)) {
        flat.push({ speaker: null, text: l.narration || l.text });
      } else {
        flat.push({ speaker: l.speaker, text: l.text });
      }
    });

    this._activeLines = flat;
    this._onLinesDone = onDone;
    this.lineIdx = 0;

    if (flat.length === 0) { onDone && onDone(); return; }

    this._renderActiveLine();
    this._showSection('s-dialogue');
    this._setContinue('▶ CONTINUE');
  },

  _renderActiveLine() {
    console.log('[_renderActiveLine] lineIdx:', this.lineIdx, 'total lines:', this._activeLines.length);
    const l = this._activeLines[this.lineIdx];
    if (!l) { console.log('[_renderActiveLine] No line found, returning'); return; }
    console.log('[_renderActiveLine] Rendering line:', l.text.substring(0, 50));
    this._renderLine(l.speaker || null, l.text || '');
    this._setContinue('▶ CONTINUE');
    console.log('[_renderActiveLine] Finished');
  },

  /* ════════════════════════════════════════════════════════════════════════
     EVENT RENDERER
  ════════════════════════════════════════════════════════════════════════ */
  _renderEvent(chap) {
    this._showSection('s-event');
    this.el('s-event-title').textContent = chap.title_full || chap.title || 'EVENT';
    this.el('s-event-desc').textContent = chap.description || '';

    const btns = this.el('s-choice-btns');
    btns.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    (chap.choices || []).forEach((choice, i) => {
      const fx = choice.effect || {};
      let tag = '';
      if (fx.type === 'stat') tag = `+${fx.value} ${fx.stat}`;
      else if (fx.type === 'item') tag = `+${fx.value} ${fx.item}`;
      else if (fx.type === 'hp') tag = `${fx.value > 0 ? '+' : ''}${fx.value} HP`;
      else if (fx.type === 'mp') tag = `${fx.value > 0 ? '+' : ''}${fx.value} MP`;

      const b = document.createElement('button');
      b.className = 'story-choice-btn';
      b.innerHTML =
        `<span class="choice-letter">${letters[i]}</span>` +
        `<span class="choice-body">${choice.text}</span>` +
        (tag ? `<span class="choice-tag">${tag}</span>` : '');
      b.onclick = () => this._applyChoice(choice, chap);
      btns.appendChild(b);
    });

    this._hideContinue();
  },

  _applyChoice(choice, chap) {
    const fx = choice.effect || {};
    if (G.hero) {
      if (fx.type === 'hp') { G.hero.hp = Math.min(G.hero.maxHp, G.hero.hp + fx.value); BattleUI.renderPartyStatus(); BattleUI.renderEnemyRow(); }
      else if (fx.type === 'mp') { G.hero.mp = Math.max(0, Math.min(G.hero.maxMp, G.hero.mp + fx.value)); BattleUI.renderPartyStatus(); BattleUI.renderEnemyRow(); }
    }

    this.phase = 'post_event';
    const postLines = [];
    if (fx.description) postLines.push({ speaker: null, text: fx.description });
    (chap.post_event_dialogue || []).forEach(l => postLines.push(l));

    this._showSection('s-dialogue');
    this._showLines(postLines, () => this._nextChapter());
  },

  /* ════════════════════════════════════════════════════════════════════════
     BOSS CHAPTER
  ════════════════════════════════════════════════════════════════════════ */
  _showBossChapter() {
    this._healParty();
    const boss = this.arc.boss_chapter;
    this.currentChap = boss;
    this.currentBossChapter = boss;  // Store for onVictory event processing
    this.lineIdx = 0;
    this.phase = 'boss_pre';
    this._charAppeared = {};  // reset character appearances
    this._charPositions = {}; // reset character positions
    this._posCounter = 0;     // reset position counter
    this._clearSceneLayer();  // clear scene characters
    this._setHeader(`Arc ${this.arc.number}: ${this.arc.name}`, `⚔ BOSS: ${boss.title}`);
    this._setBg(boss.background);
    this._showLines(boss.pre_dialogue || [], () => this._launchBoss());
    showScreen('story-screen');
  },

  _launchBoss() {
    this.phase = 'boss_in';
    this._launchStoryBattle(this.arc.boss_enemy);
  },

  /* ════════════════════════════════════════════════════════════════════════
     BATTLE LAUNCHER
  ════════════════════════════════════════════════════════════════════════ */

  _scaleEnemy(def) {
    // Only use leveling for difficulty scaling (no ARC_SCALE multiplier)
    return def;
  },

  _launchStoryBattle(enemyId) {
    // Hide dialogue during battle
    const dialogue = this.el('s-dialogue');
    if (dialogue) dialogue.style.display = 'none';

    const raw = this._allEnemies.find(e => e.id === enemyId);
    if (!raw) { console.warn('Story: enemy not found:', enemyId); this.onBattleWon(); return; }
    const def = this._scaleEnemy(raw);

    // Build enemy group: boss/mid-boss is solo; regular battles add 1 weak add from arc pool
    const defs = [def];
    const isBoss = (this.phase === 'boss_in');
    if (!isBoss && this.arcIdx >= 1) {
      const pool = (this.arc.enemies_pool || []).filter(id => id !== enemyId);
      if (pool.length) {
        const addId = pool[Math.floor(Math.random() * pool.length)];
        const addRaw = this._allEnemies.find(e => e.id === addId);
        if (addRaw) defs.push(this._scaleEnemy(addRaw));
      }
    }

    // Calculate spawn level based on arc and whether this is a boss fight
    // Regular: Arc 1→1, 2→3, 3→6, 4→10, 5→14, 6→18, 7→22, 8→26
    // Boss: significantly higher — bosses should feel like a clear step up
    const arcProgression  = [1,  3,  6,  10, 14, 18, 22, 26];
    const bossProgression = [6, 12, 18,  24, 30, 36, 42, 50];
    const spawnLevel = isBoss
      ? (bossProgression[this.arcIdx] || arcProgression[this.arcIdx] || 1)
      : (arcProgression[this.arcIdx] || 1);

    buildEnemyGroup(defs, spawnLevel, isBoss);

    // Reset per-battle state on party members (keep HP/MP/levels from prior battles)
    G.party.forEach(m => { m.buff = null; m.debuff = null; m.regenTurns = 0; m.stunned = false; });

    buildAbilityMenu();
    G.turnQueue = buildTurnQueue();
    G.turnIdx = 0;
    G.busy = false;

    showScreen('battle-screen');
    BattleUI.render();
    document.getElementById('cmd-grid-main').style.display = 'grid';
    BattleUI.openSub('');
    const names = defs.map(d => d.name).join(' & ');
    BattleUI.setLog([`${names} appear!`, `${G.hero.displayName} leads the charge!`], ['hi', '']);
    processCurrentTurn();
  },

  /* ════════════════════════════════════════════════════════════════════════
     EXPLORE CHAPTER
  ════════════════════════════════════════════════════════════════════════ */
  _launchExplore(chap) {
    G.mode = 'story_explore';
    this._exploreChap = chap;

    // Make sure party is built
    if (!G.party || G.party.length === 0) buildParty();

    showScreen('explore-screen');
    if (typeof _dockPersistentBtns === 'function') _dockPersistentBtns(true);

    // Double rAF: first frame applies display change, second has real layout dimensions
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const wrap   = document.getElementById('explore-canvas-wrap');
      const canvas = document.getElementById('explore-canvas');
      if (!wrap || !canvas) return;

      // Size canvas to the wrap's actual rendered size
      canvas.width  = wrap.offsetWidth  || 360;
      canvas.height = wrap.offsetHeight || 480;

      // One-time init
      if (!canvas._mapInited) {
        canvas._mapInited = true;
        MapEngine.init(canvas);
        canvas.addEventListener('touchstart', e => {
          e.preventDefault();
          Array.from(e.changedTouches).forEach(t => MapUI.handleTouch(t.clientX, t.clientY, canvas));
        }, { passive: false });
        canvas.addEventListener('mousedown', e => MapUI.handleTouch(e.clientX, e.clientY, canvas));
      }

      const overlay = document.getElementById('map-select-overlay');
      if (overlay) overlay.style.display = 'none';

      MapEngine.start(chap.map || 'verdant_vale');
      MapUI.showMsg(chap.map_hint || 'Explore the area — find your path forward.', 2000);

      // Update header label
      const lbl = document.getElementById('explore-map-name');
      const m = MapEngine.getMap();
      if (lbl && m) lbl.textContent = `✦ ${m.name.toUpperCase()} ✦`;
    }));
  },

  /** Restore directly to a saved map position — no pre_dialogue, no map-select overlay */
  _launchExploreRestore(chap, restoreX, restoreY) {
    G.mode = 'story_explore';
    if (!G.party || G.party.length === 0) buildParty();

    showScreen('explore-screen');
    if (typeof _dockPersistentBtns === 'function') _dockPersistentBtns(true);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      const wrap   = document.getElementById('explore-canvas-wrap');
      const canvas = document.getElementById('explore-canvas');
      if (!wrap || !canvas) return;

      canvas.width  = wrap.offsetWidth  || 360;
      canvas.height = wrap.offsetHeight || 480;

      if (!canvas._mapInited) {
        canvas._mapInited = true;
        MapEngine.init(canvas);
        canvas.addEventListener('touchstart', e => {
          e.preventDefault();
          Array.from(e.changedTouches).forEach(t => MapUI.handleTouch(t.clientX, t.clientY, canvas));
        }, { passive: false });
        canvas.addEventListener('mousedown', e => MapUI.handleTouch(e.clientX, e.clientY, canvas));
      }

      const overlay = document.getElementById('map-select-overlay');
      if (overlay) overlay.style.display = 'none';

      MapEngine.start(chap.map);

      // Restore tile position — must use MapPlayer.reset() as tx/ty are read-only getters
      if (restoreX != null && restoreY != null && typeof MapPlayer !== 'undefined') {
        MapPlayer.reset(restoreX, restoreY);
      }

      MapUI.showMsg(chap.map_hint || 'Welcome back — continue your journey.', 2000);
      const lbl = document.getElementById('explore-map-name');
      const m = MapEngine.getMap();
      if (lbl && m) lbl.textContent = `✦ ${m.name.toUpperCase()} ✦`;
    }));
  },

  /** Called by MapEngine when story_explore mode battle/explore ends */
  onExploreComplete() {
    MapEngine.stop();
    G.mode = 'story';
    const chap = this._exploreChap;
    this._exploreChap = null;
    this._showLines((chap && chap.post_dialogue) || [], () => this._nextChapter());
    showScreen('story-screen');
  },

  _retryBattle() {
    this._retrying = false;
    const isBoss = this.currentChap === this.arc.boss_chapter;
    this.phase = isBoss ? 'boss_in' : 'pre_battle';
    G.party.forEach(m => {
      m.hp = m.maxHp; m.mp = m.maxMp; m.isKO = false;
      m.buff = null; m.debuff = null; m.regenTurns = 0; m.stunned = false;
    });
    BattleUI.renderPartyStatus();
    BattleUI.renderPartyRow();
    const enemyId = isBoss ? this.arc.boss_enemy : this.currentChap.enemy_id;
    if (!enemyId) { this._nextChapter(); return; }
    this._launchStoryBattle(enemyId);
  },

  /* ════════════════════════════════════════════════════════════════════════
     CHARACTER MOMENT
  ════════════════════════════════════════════════════════════════════════ */
  _showCharMoment() {
    const boss = this.currentChap;
    if (!boss.character_moment) { this._showOutro(); return; }

    this.phase = 'char_moment';
    const bg = boss.character_moment.background || boss.background;
    this._setBg(bg);

    const lines = [];
    (boss.character_moment.dialogue || []).forEach(d => {
      if (d.is_narration || (!d.speaker && d.narration)) {
        lines.push({ speaker: null, text: d.narration });
      } else {
        lines.push({ speaker: d.speaker, text: d.text });
      }
    });
    this._showLines(lines, () => this._showOutro());
    showScreen('story-screen');
  },

  /* ════════════════════════════════════════════════════════════════════════
     OUTRO
  ════════════════════════════════════════════════════════════════════════ */
  _showOutro() {
    const arc = this.arc;
    if (!arc.outro || !arc.outro.scenes || !arc.outro.scenes.length) { this._showArcEnd(); return; }

    this.phase = 'outro';
    const bg = arc.outro.background || arc.outro.scenes[0]?.background || 'default';
    this._setBg(bg);
    this._buildSceneLines(arc.outro.scenes);
    this._onLinesDone = () => this._showArcEnd();
    this._renderActiveLine();
    this._showSection('s-dialogue');
    showScreen('story-screen');
  },

  /* ════════════════════════════════════════════════════════════════════════
     ARC END (shard card)
  ════════════════════════════════════════════════════════════════════════ */
  _showArcEnd() {
    const arc = this.arc;
    this.phase = 'arc_end';

    this._showSection('s-arc-end');

    // Load face and spirit images
    const heroName = G.hero?.id || 'ayaka';
    const heroNameLower = heroName.toLowerCase();

    // Face image (small icon, left)
    const faceImg = this.el('s-ae-face');
    faceImg.src = `images/characters/faces/${heroNameLower}_face.png`;
    faceImg.style.display = 'block';
    faceImg.onerror = () => {
      faceImg.style.display = 'none';
    };

    // Spirit image (large, center)
    const spiritImg = this.el('s-ae-spirit');
    spiritImg.src = `images/characters/spirits/${heroNameLower}_spirit.png`;
    spiritImg.onerror = () => {
      spiritImg.style.display = 'none';
    };

    const shard = arc.shard || {};
    const shardEl = this.el('s-ae-shard');
    shardEl.textContent = shard.name || arc.name;
    shardEl.style.color = shard.color || '#fff';
    this.el('s-ae-desc').textContent = shard.description || '';

    const isLast = this.arcIdx >= this.data.arcs.length - 1;
    this._setContinue(isLast ? '▶ EPILOGUE' : '▶ WORLD MAP');
    this._setBg(`arc${this.arc.number}_end`);
    showScreen('story-screen');
    if (typeof SFX !== 'undefined') SFX.shardGet();
  },

  /* ════════════════════════════════════════════════════════════════════════
     NEXT ARC / EPILOGUE
  ════════════════════════════════════════════════════════════════════════ */
  _startNextArc() {
    // Guard: can only advance once current arc boss is beaten (phase === 'arc_end')
    if (this.phase !== 'arc_end' && this.phase !== 'epilogue') {
      const lbl = this.el('map-info-loc');
      if (lbl) { lbl.textContent = '⛔ Defeat this arc\'s boss first.'; lbl.style.color = '#ef4444'; setTimeout(() => { lbl.style.color = ''; }, 2500); }
      return;
    }
    this.arcIdx++;
    G.enemies = this._allEnemies.slice();
    if (this.arcIdx >= this.data.arcs.length) { this._beginEpilogue(); return; }

    if (G.hero) { G.hero.hp = G.hero.maxHp; G.hero.mp = G.hero.maxMp; }
    this.chapIdx = -1;
    this.phase = null;
    this._doSave();
    this._showArcIntro();
  },

  _beginEpilogue() {
    const epi = this.data.epilogue;
    this.phase = 'epilogue';
    this._doSave(); // save completion so CONTINUE shows the ending

    if (epi.scenes && epi.scenes.length) {
      this._buildSceneLines(epi.scenes);
      this._onLinesDone = () => this._showEpilogueCards();
      this._renderActiveLine();
      this._showSection('s-dialogue');
      this._setHeader(epi.title || 'EPILOGUE', '');
      this._setBg('epilogue');
      showScreen('story-screen');
    } else {
      this._showEpilogueCards();
    }
  },

  _showEpilogueCards() {
    const epi = this.data.epilogue;
    this.phase = 'epilogue_cards';
    this._showSection('s-epilogue');

    const container = this.el('s-epi-cards');
    container.innerHTML = '';
    (epi.character_endings || []).forEach(e => {
      const card = document.createElement('div');
      card.className = 'epi-card';
      card.dataset.char = e.character.toLowerCase();
      const icon = SPEAKER_PORTRAIT[e.character] || '';
      card.innerHTML =
        `<div class="epi-name">${icon ? icon + ' ' : ''}${e.character.toUpperCase()}</div>` +
        `<div class="epi-text">${e.text}</div>`;
      container.appendChild(card);
    });

    this._setContinue('▶ PLAY AGAIN');
    this._setBg('epilogue');
    showScreen('story-screen');
  },

  _endStory() {
    this.active = false;
    if (typeof TTS !== 'undefined') TTS.stop();
    Save.clear(this._activeSlot !== undefined ? this._activeSlot : 0);
    G.enemies = this._allEnemies.slice();
    G.selectedChar = null; G.selectedClass = null;
    showScreen('title-screen');
    if (typeof refreshSaveSlots === 'function') refreshSaveSlots();
  },

  /* ════════════════════════════════════════════════════════════════════════
     SAVE HELPERS
  ════════════════════════════════════════════════════════════════════════ */
  _doSave() {
    if (!this.data || !G.hero) return;
    // On first save of a new game, clear the slot first (safe: we're about to overwrite it)
    if (this._newGameSlot !== undefined) {
      Save.clear(this._newGameSlot);
      delete this._newGameSlot;
    }
    // Capture all 4 party members' current stats
    const partyStats = G.party.map(m => ({
      charId: m.charId,
      classId: m.classId,
      lv:      m.lv      || 1,
      exp:     m.exp     || 0,
      gold:    m.gold    || 0,
      hp:      m.hp,
      mp:      m.mp,
      maxHp:   m.maxHp,
      maxMp:   m.maxMp,
      atk:     m.atk,
      def:     m.def,
      mag:     m.mag,
      spd:     m.spd,
      lck:     m.lck     || 0,
      accuracy: m.accuracy || 0.95,
      critRate: m.critRate || 0.05,
    }));
    // Capture current map location if saving from explore screen
    const curMap = (typeof MapEngine !== 'undefined') ? MapEngine.getMap() : null;
    const mapId  = curMap?.id || null;
    const mapX   = (mapId && typeof MapPlayer !== 'undefined') ? MapPlayer.tx : null;
    const mapY   = (mapId && typeof MapPlayer !== 'undefined') ? MapPlayer.ty : null;

    Save.write({
      arcIdx:        this.arcIdx,
      chapIdx:       this.chapIdx,
      phase:         this.phase,
      lineIdx:       this.lineIdx,
      arcName:       `Arc ${this.arc.number}: ${this.arc.name}`,
      selectedChar:  G.hero.charId  || G.selectedChar,
      selectedClass: G.hero.classId || G.selectedClass,
      selectedChars: G.selectedChars || [],
      partyStats,
      // Keep legacy hero field for backward compat
      hero: { lv: G.hero.lv, exp: G.hero.exp, gold: G.hero.gold || 0 },
      unlockedChars: G.unlockedChars,
      clearedMaps:   G.clearedMaps   || [],
      npcTalked:     G.npcTalked    || {},
      inventory:     G.inventory    || [],
      ownedRelics:   G.ownedRelics  || [],
      activeRelics:  G.activeRelics || [],
      mapId,
      mapX,
      mapY,
    }, this._activeSlot !== undefined ? this._activeSlot : 0);
  },

  /* ════════════════════════════════════════════════════════════════════════
     WORLD MAP
  ════════════════════════════════════════════════════════════════════════ */
  _showWorldMap() {
    this._showSection(null);
    this._closeRegionPanel();

    const arcs    = this.data.arcs;
    const nextIdx = this.arcIdx + 1;
    const area    = this.el('map-area');
    if (!area) { this._startNextArc(); return; }

    /* ── SVG path layer (820×300 viewBox) ── */
    let svgLines = '';
    for (let i = 0; i < MAP_POSITIONS.length - 1; i++) {
      const a = MAP_POSITIONS[i], b = MAP_POSITIONS[i + 1];
      const done  = i < this.arcIdx;
      const color = done ? '#4a3898' : '#1a1060';
      const dash  = done ? '' : 'stroke-dasharray="8,5"';
      svgLines += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
        stroke="${color}" stroke-width="2.5" ${dash}/>`;
    }
    area.innerHTML = `
      <svg class="map-svg" viewBox="0 0 820 300" preserveAspectRatio="xMidYMid meet">
        ${svgLines}
      </svg>`;

    /* ── Node elements ── */
    arcs.forEach((arc, i) => {
      const pos    = MAP_POSITIONS[i];
      const isDone = i < this.arcIdx;
      const isCur  = i === this.arcIdx;
      const isNext = i === nextIdx;
      const isLock = i > nextIdx;
      const cls    = [isDone?'done':'', isCur?'current':'', isNext?'next':'', isLock?'locked':''].filter(Boolean).join(' ');

      const node = document.createElement('div');
      node.className = `map-node ${cls}`;
      node.style.left = (pos.x - 30) + 'px';
      node.style.top  = (pos.y - 44) + 'px';
      if (MAP_COLORS[i]) node.style.setProperty('--node-color', MAP_COLORS[i]);

      node.innerHTML =
        `<div class="mn-status">${isDone ? '✓ CLEARED' : isCur ? '▶ ACTIVE' : isNext ? '◈ NEXT' : ''}</div>` +
        `<div class="mn-icon">${MAP_ICONS[i]}</div>` +
        `<div class="mn-num">ARC ${arc.number}</div>` +
        `<div class="mn-name">${arc.name}</div>`;

      /* Interaction */
      if (isDone) {
        node.title = 'Click to revisit';
        node.addEventListener('click', () => this._openRegionPanel(i));
      } else if (isNext) {
        const arcComplete = this.phase === 'arc_end' || this.phase === 'epilogue';
        if (!arcComplete) {
          node.style.opacity = '0.4';
          node.style.cursor  = 'not-allowed';
          node.title = '⛔ Defeat the current arc boss first';
        }
        node.addEventListener('click', () => this._startNextArc());
      } else if (isCur) {
        node.addEventListener('click', () => this._openRegionPanel(i));
      }

      area.appendChild(node);
    });

    /* ── Bottom info bar ── */
    const next = arcs[nextIdx];
    const arcComplete = this.phase === 'arc_end' || this.phase === 'epilogue';
    const proceedBtn = document.getElementById('map-proceed-btn');
    if (proceedBtn) {
      proceedBtn.disabled = !arcComplete;
      proceedBtn.style.opacity = arcComplete ? '' : '0.35';
      proceedBtn.style.cursor  = arcComplete ? '' : 'not-allowed';
      proceedBtn.title = arcComplete ? '' : '⛔ Defeat the current arc boss first';
    }
    this.el('map-arc-label').textContent = next
      ? (arcComplete ? `NEXT: ${next.name.toUpperCase()}` : `⛔ BOSS UNDEFEATED`)
      : 'JOURNEY COMPLETE';
    this.el('map-info-name').textContent = next ? next.name        : '';
    this.el('map-info-loc').textContent  = next ? (next.location || '') : '';

    showScreen('map-screen');
    if (typeof SFX !== 'undefined') SFX.mapMove();
  },

  /** Called by the TRAVEL THERE button */
  proceedFromMap() {
    if (typeof SFX !== 'undefined') SFX.mapMove();
    this._startNextArc();
  },

  /* ── Region panel (revisit done/current nodes) ───────────────────────── */
  _openRegionPanel(arcIdx) {
    const arc     = this.data.arcs[arcIdx];
    const panel   = document.getElementById('map-region-panel');
    const mapId   = ARC_MAP_ID[arcIdx] || '';
    const lore    = ARC_LORE[arcIdx]   || '';
    const shard   = arc.shard;
    const isDone  = arcIdx < this.arcIdx;
    const isCur   = arcIdx === this.arcIdx;

    panel.innerHTML = `
      <div class="mrp-num">ARC ${arc.number}</div>
      <div class="mrp-name">${arc.name}</div>
      <div class="mrp-loc">${arc.location || ''}</div>
      ${shard ? `<div class="mrp-shard" style="color:${shard.color||'#fff'}">🔮 ${shard.name}</div>` : ''}
      <div class="mrp-lore">${lore}</div>
      <div class="mrp-actions">
        ${(isDone || isCur) && mapId ? `<button class="mrp-btn primary" onclick="Story.startRegionSkirmish(${arcIdx})">⚔ SKIRMISH</button>` : ''}
        ${mapId ? `<button class="mrp-btn" onclick="Story._exploreRegion('${mapId}')">🗺 EXPLORE</button>` : ''}
        <button class="mrp-btn" onclick="Story._closeRegionPanel()">← BACK</button>
      </div>`;

    panel.classList.add('open');
  },

  _closeRegionPanel() {
    const panel = document.getElementById('map-region-panel');
    if (panel) panel.classList.remove('open');
  },

  _exploreRegion(mapId) {
    if (typeof startExplore === 'undefined' || typeof MAP_DEFS === 'undefined' || !MAP_DEFS[mapId]) return;
    this._closeRegionPanel();
    // startExplore() inits the canvas and shows the explore screen
    startExplore();
    // Hide the map-select overlay (we're going to a specific map directly)
    const overlay = document.getElementById('map-select-overlay');
    if (overlay) overlay.style.display = 'none';
    // Start the target map
    MapEngine.start(mapId);
    if (typeof MapUI !== 'undefined') MapUI.showMsg(`Entering ${MAP_DEFS[mapId].name}…`, 1500);
  },

  /* ── Skirmish: battle using an arc's enemy pool at current party LV ─── */
  startRegionSkirmish(arcIdx) {
    const arc  = this.data.arcs[arcIdx];
    if (!arc)  return;
    const pool = arc.enemies_pool || [];
    if (!pool.length || !G.party.length) return;

    /* Pick 1-2 random enemy templates from that arc's pool */
    const count   = 1 + (Math.random() < 0.45 ? 1 : 0);
    const partyLv = Math.max(...G.party.map(m => m.lv || 1));
    const picks   = [];

    for (let i = 0; i < count; i++) {
      const id       = pool[Math.floor(Math.random() * pool.length)];
      const template = (G.enemies || []).find(e => e.id === id);
      if (template) picks.push(template);
    }
    if (!picks.length) return;

    /* buildEnemyGroup is a global function in game.js — sets G.enemyGroup */
    buildEnemyGroup(picks, partyLv);
    if (!G.enemyGroup.length) return;

    /* Restore party HP/MP before skirmish */
    G.party.forEach(m => { m.hp = m.maxHp; m.mp = m.maxMp; });

    this._skirmishArcIdx = arcIdx;
    this._closeRegionPanel();

    /* _initBattle() is a global in game.js — wires up turn queue, menu, screen */
    _initBattle();
    const names = G.enemyGroup.map(e => e.name).join(' & ');
    BattleUI.setLog([`${names} appear!`, `Skirmish — no retreat!`], ['hi', '']);
    processCurrentTurn();
  },

  /* ════════════════════════════════════════════════════════════════════════
     SKIP
  ════════════════════════════════════════════════════════════════════════ */
  skip() {
    // Skip current chapter and go to next
    this._skipTw();
    this.lineIdx = 999; // Set to high number to skip all lines
    this._onLinesDone && this._onLinesDone();
  },

  /* ════════════════════════════════════════════════════════════════════════
     UI HELPERS
  ════════════════════════════════════════════════════════════════════════ */
  _setHeader(arc, chapter) {
    const a = this.el('s-header-arc'); if (a) a.textContent = arc;
    const c = this.el('s-header-chap'); if (c) c.textContent = chapter;
  },

  _setBg(key) {
    const el = this.el('story-bg');
    if (el) el.className = 'story-bg bg--' + (key || 'default').replace(/[^a-z0-9]/gi, '_');
  },

  _showSection(id) {
    console.log('[_showSection] Showing section:', id);
    // Hide all main sections first
    ['s-arc-intro', 's-dialogue', 's-event', 's-arc-end', 's-epilogue'].forEach(sid => {
      const e = this.el(sid);
      if (e) e.style.display = sid === id ? '' : 'none';
    });
    console.log('[_showSection] Finished');
  },

  _setContinue(label) {
    console.log('[_setContinue] Setting continue button to:', label);
    const btn = this.el('s-continue');
    if (!btn) { console.log('[_setContinue] Button not found'); return; }
    btn.textContent = label;
    btn.style.display = 'inline-block';
    console.log('[_setContinue] Finished, button display:', btn.style.display);
  },

  _hideContinue() {
    const btn = this.el('s-continue');
    if (btn) btn.style.display = 'none';
  },

  _renderLine(speaker, text) {
    const box = this.el('s-dialogue');
    const spkEl = this.el('s-speaker');
    const txtEl = this.el('s-text');
    const imgEl = this.el('s-portrait-img');
    const emojiEl = this.el('s-portrait-emoji');
    const spiritsRow = this.el('s-dialogue-spirits-row');
    if (!box) return;

    box.style.display = '';
    if (typeof SFX !== 'undefined') SFX.dialogue();
    if (typeof TTS !== 'undefined') TTS.stop();

    // Render scene characters
    if (speaker && this.currentChap && this.currentChap.cast) {
      this._renderSceneCharacters(speaker);
    }

    if (speaker) {
      spkEl.textContent = speaker.toUpperCase();
      spkEl.style.color = SPEAKER_COLOR[speaker] || '#f0f0f8';
      spkEl.style.display = 'block';
      box.dataset.speaker = speaker.toLowerCase();

      // Get speaker character ID for face image path (alias → charId)
      const speakerCharId = _charIdForSpeaker(speaker);
      const faceImgSrc = `images/characters/faces/${speakerCharId}_face.png`;

      // Face image (left, small) — hide gracefully if file missing
      if (imgEl) {
        imgEl.onerror = () => {
          imgEl.style.display = 'none';
          if (emojiEl) { emojiEl.style.display = 'block'; emojiEl.textContent = '💬'; }
        };
        imgEl.src = faceImgSrc;
        imgEl.alt = speaker;
        imgEl.style.display = 'block';
        imgEl.style.borderColor = SPEAKER_COLOR[speaker] || '#5040a0';
        imgEl.style.boxShadow = `0 0 16px ${SPEAKER_COLOR[speaker]}66`;
        // pop animation on each new line
        imgEl.classList.remove('new-line');
        void imgEl.offsetWidth; // reflow to retrigger
        imgEl.classList.add('new-line');
        if (emojiEl) emojiEl.style.display = 'none';
      } else {
        if (imgEl) imgEl.style.display = 'none';
        if (emojiEl) { emojiEl.style.display = 'block'; emojiEl.textContent = '💬'; }
      }
    } else {
      spkEl.style.display = 'none';
      box.dataset.speaker = 'narrator';
      if (imgEl) imgEl.style.display = 'none';
      if (emojiEl) { emojiEl.style.display = 'block'; emojiEl.textContent = SPEAKER_PORTRAIT.narrator; }
    }
    // TTS speaks full text; typewriter shows it character-by-character in parallel
    if (typeof TTS !== 'undefined') TTS.speak(speaker || 'narrator', text || '');
    this._typewrite(txtEl, text || '');
  },

  _typewrite(el, text) {
    if (this._tw.timer) clearInterval(this._tw.timer);
    this._tw.full = text;
    this._tw.done = false;
    let idx = 0;
    el.textContent = '';
    this._tw.timer = setInterval(() => {
      idx = Math.min(idx + 2, text.length);
      el.textContent = text.slice(0, idx);
      if (idx >= text.length) {
        this._tw.done = true;
        clearInterval(this._tw.timer);
        this._tw.timer = null;
      }
    }, 22);
  },

  _skipTw() {
    if (this._tw.timer) clearInterval(this._tw.timer);
    this._tw.done = true;
    if (typeof TTS !== 'undefined') TTS.stop();
    const el = this.el('s-text');
    if (el) el.textContent = this._tw.full;
  },

  _clearSceneLayer() {
    const layer = this.el('s-scene-layer');
    if (layer) layer.innerHTML = '';
  },

  _renderSceneCharacters(speaker) {
    if (!this.currentChap || !this.currentChap.cast) return;

    const layer = this.el('s-scene-layer');
    if (!layer) return;

    const cast = this.currentChap.cast;

    cast.forEach(charName => {
      if (!charName) return;

      // First appearance - create character element
      if (!this._charAppeared[charName]) {
        this._charAppeared[charName] = true;

        const charEl = document.createElement('div');
        charEl.className = 's-scene-char';
        charEl.id = `s-scene-char-${charName.toLowerCase()}`;

        const img = document.createElement('img');
        img.src = `images/characters/spirits/${_charIdForSpeaker(charName)}_spirit.png`;
        img.alt = charName;

        const nameEl = document.createElement('div');
        nameEl.className = 's-scene-char-name';
        nameEl.textContent = charName;

        charEl.appendChild(img);
        charEl.appendChild(nameEl);
        layer.appendChild(charEl);
      }

      // Update active/dimmed state
      const charEl = this.el(`s-scene-char-${charName.toLowerCase()}`);
      if (charEl) {
        if (speaker && speaker.toLowerCase() === charName.toLowerCase()) {
          charEl.classList.add('active');
          charEl.classList.remove('dimmed');
        } else {
          charEl.classList.remove('active');
          charEl.classList.add('dimmed');
        }
      }
    });
  },
};

/* ── Global entry point called from title screen button ─────────────────── */
function startStoryMode() {
  Story.begin();
}