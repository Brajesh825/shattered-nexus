/**
 * story.js — Crystal Chronicles Story Engine
 * Drives cutscenes, battles, events and arc progression from story.json
 */

/* ── Speaker colours ──────────────────────────────────────────────────────── */
const SPEAKER_COLOR = {
  Ayaka: '#7dd3fc',
  Hutao: '#ef4444',
  Nilou: '#2dd4bf',
  Xiao: '#4ade80',
};

/* ── Speaker portrait images ─────────────────────────────────────────────── */
const SPEAKER_IMG = {
  Ayaka: 'images/heroes/ayaka.png',
  Hutao: 'images/heroes/hutao.png',
  Nilou: 'images/heroes/nilou.png',
  Xiao: 'images/heroes/xiao.png',
};

/* ── Speaker portrait emojis (narrator fallback) ────────────────────────── */
const SPEAKER_PORTRAIT = {
  narrator: '📖',
};

/* ══════════════════════════════════════════════════════════════════════════
   STORY ENGINE
══════════════════════════════════════════════════════════════════════════ */
/* ── World map node positions (820×240 SVG space) ───────────────────────── */
const MAP_POSITIONS = [
  { x: 88, y: 185 },
  { x: 222, y: 95 },
  { x: 398, y: 162 },
  { x: 574, y: 72 },
  { x: 718, y: 148 },
];
const MAP_ICONS = ['🌲', '🌿', '⚔', '🌊', '💎'];

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

  /** Called by the NEW STORY title button */
  begin() {
    Save.clear();
    this.init(() => {
      if (!this.data) { alert('Story data not found.'); goCharSelect(); return; }
      this.active = true;
      this.arcIdx = 0;
      this.chapIdx = -1;
      this.phase = null;
      goCharSelect();
    });
  },

  /** Called by the CONTINUE title button */
  loadSave() {
    const s = Save.read();
    if (!s) { startStoryMode(); return; }
    this._pendingSave = s;
    this.init(() => {
      if (!this.data) { alert('Story data not found.'); return; }
      this.active = true;
      G.selectedChar  = s.selectedChar  || (G.chars[0] && G.chars[0].id);
      G.selectedClass = s.selectedClass || (G.classes[0] && G.classes[0].id);
      const heroId_ = G.selectedChar;
      G.selectedChars = [heroId_, ...G.chars.map(c=>c.id).filter(id=>id!==heroId_)].slice(0,4);
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
      if (s.hero && G.hero) {
        G.hero.lv = s.hero.lv || 1;
        G.hero.exp = s.hero.exp || 0;
        G.hero.gold = s.hero.gold || 0;
      }
      // Resume at the saved chapter (or arc intro if chapIdx === -1)
      if (this.chapIdx === -1) {
        this._showArcIntro();
      } else {
        const chap = this.arc.chapters[this.chapIdx];
        this._setHeader(`Arc ${this.arc.number}: ${this.arc.name}`, chap ? chap.title : '');
        this._setBg(chap ? chap.background : `arc${this.arc.number}_intro`);
        if (chap) this._loadChapter(chap);
        else this._showBossChapter();
      }
      return;
    }

    this._showArcIntro();
  },

  /** Called by game.js checkEnd() when enemy defeated in a story battle */
  onBattleWon() {
    const chap = this.currentChap;
    this.lineIdx = 0;

    if (this.phase === 'boss_in') {
      this.phase = 'boss_post';
      this._showLines(chap.post_dialogue || [], () => this._showCharMoment());
    } else {
      this.phase = 'post_battle';
      this._showLines(chap.post_dialogue || [], () => this._nextChapter());
    }
    UI.show('story-screen');
  },

  /** Called by game.js checkEnd() when hero dies in a story battle */
  onBattleLost() {
    this.phase = 'retry';
    this._renderLine(null, 'The party falls... but fate is not done with them yet.');
    this._showSection('s-dialogue');
    const btn = this.el('s-continue');
    btn.textContent = '↺ TRY AGAIN';
    btn.style.display = 'inline-block';
    UI.show('story-screen');
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
      this._nextChapter(); return;
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
    UI.show('story-screen');
  },

  /* ════════════════════════════════════════════════════════════════════════
     CHAPTER DISPATCH
  ════════════════════════════════════════════════════════════════════════ */
  get arc() { return this.data.arcs[this.arcIdx]; },

  _nextChapter() {
    this.chapIdx++;
    const arc = this.arc;
    this._doSave();
    if (this.chapIdx < arc.chapters.length) {
      this._loadChapter(arc.chapters[this.chapIdx]);
    } else {
      this._showBossChapter();
    }
  },

  _loadChapter(chap) {
    this.currentChap = chap;
    this.sceneIdx = 0;
    this.lineIdx = 0;
    this._setHeader(`Arc ${this.arc.number}: ${this.arc.name}`, chap.title || '');
    this._setBg(chap.background);

    if (chap.type === 'cutscene') {
      this.phase = 'cutscene';
      this._buildSceneLines(chap.scenes);
      this._onLinesDone = () => this._nextChapter();
      this._renderActiveLine();
      this._showSection('s-dialogue');
    } else if (chap.type === 'battle') {
      this.phase = 'pre_battle';
      this._showLines(chap.pre_dialogue || [], () => this._launchStoryBattle(chap.enemy_id));
    } else if (chap.type === 'event') {
      this.phase = 'event';
      this._renderEvent(chap);
    } else if (chap.type === 'boss_battle') {
      this.phase = 'pre_battle';
      this._showLines(chap.pre_dialogue || [], () => this._launchStoryBattle(chap.enemy_id));
    } else if (chap.type === 'explore') {
      this.phase = 'exploring';
      this._showLines(chap.pre_dialogue || [], () => this._launchExplore(chap));
      return; // _launchExplore will switch screens
    }
    UI.show('story-screen');
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
    const l = this._activeLines[this.lineIdx];
    if (!l) return;
    this._renderLine(l.speaker || null, l.text || '');
    this._setContinue('▶ CONTINUE');
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
      if (fx.type === 'hp') { G.hero.hp = Math.min(G.hero.maxHp, G.hero.hp + fx.value); UI.updateBars(); }
      else if (fx.type === 'mp') { G.hero.mp = Math.max(0, Math.min(G.hero.maxMp, G.hero.mp + fx.value)); UI.updateBars(); }
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
    const boss = this.arc.boss_chapter;
    this.currentChap = boss;
    this.lineIdx = 0;
    this.phase = 'boss_pre';
    this._setHeader(`Arc ${this.arc.number}: ${this.arc.name}`, `⚔ BOSS: ${boss.title}`);
    this._setBg(boss.background);
    this._showLines(boss.pre_dialogue || [], () => this._launchBoss());
    UI.show('story-screen');
  },

  _launchBoss() {
    this.phase = 'boss_in';
    this._launchStoryBattle(this.arc.boss_enemy);
  },

  /* ════════════════════════════════════════════════════════════════════════
     BATTLE LAUNCHER
  ════════════════════════════════════════════════════════════════════════ */
  // Arc difficulty multipliers (index = arcIdx 0–4)
  ARC_SCALE: [1.0, 1.25, 1.6, 2.0, 2.5],

  _scaleEnemy(def) {
    const m = this.ARC_SCALE[this.arcIdx] || 1.0;
    if (m === 1.0) return def;
    const s = def.stats;
    return {
      ...def,
      stats: {
        hp: Math.round(s.hp * m),
        atk: Math.round(s.atk * m),
        def: Math.round(s.def * m),
        spd: Math.round(s.spd * m),
        mag: Math.round(s.mag * m),
      },
      reward: {
        exp: Math.round(def.reward.exp * m),
        gold: Math.round(def.reward.gold * m),
      },
    };
  },

  _launchStoryBattle(enemyId) {
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

    buildEnemyGroup(defs);

    // Reset per-battle state on party members (keep HP/MP/levels from prior battles)
    G.party.forEach(m => { m.buff = null; m.debuff = null; m.regenTurns = 0; m.stunned = false; });

    buildAbilityMenu();
    G.turnQueue = buildTurnQueue();
    G.turnIdx = 0;
    G.busy = false;

    UI.show('battle-screen');
    UI.renderBattleUI();
    UI.el('cmd-grid-main').style.display = 'grid';
    UI.openSub('');
    const names = defs.map(d => d.name).join(' & ');
    UI.setLog([`${names} appear!`, `${G.hero.displayName} leads the charge!`], ['hi', '']);
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

    UI.show('explore-screen');

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

  /** Called by MapEngine when story_explore mode battle/explore ends */
  onExploreComplete() {
    MapEngine.stop();
    G.mode = 'story';
    const chap = this._exploreChap;
    this._exploreChap = null;
    this._showLines((chap && chap.post_dialogue) || [], () => this._nextChapter());
    UI.show('story-screen');
  },

  _retryBattle() {
    this._retrying = false;
    const isBoss = this.currentChap === this.arc.boss_chapter;
    this.phase = isBoss ? 'boss_in' : 'pre_battle';
    G.party.forEach(m => {
      m.hp = m.maxHp; m.mp = m.maxMp; m.isKO = false;
      m.buff = null; m.debuff = null; m.regenTurns = 0; m.stunned = false;
    });
    if (typeof UI.renderPartyStatus === 'function') UI.renderPartyStatus();
    if (typeof UI.renderPartyRow   === 'function') UI.renderPartyRow();
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
    UI.show('story-screen');
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
    UI.show('story-screen');
  },

  /* ════════════════════════════════════════════════════════════════════════
     ARC END (shard card)
  ════════════════════════════════════════════════════════════════════════ */
  _showArcEnd() {
    const arc = this.arc;
    this.phase = 'arc_end';

    this._showSection('s-arc-end');

    const shard = arc.shard || {};
    const shardEl = this.el('s-ae-shard');
    shardEl.textContent = shard.name || arc.name;
    shardEl.style.color = shard.color || '#fff';
    this.el('s-ae-desc').textContent = shard.description || '';

    const isLast = this.arcIdx >= this.data.arcs.length - 1;
    this._setContinue(isLast ? '▶ EPILOGUE' : '▶ WORLD MAP');
    this._setBg(`arc${this.arc.number}_end`);
    UI.show('story-screen');
    if (typeof SFX !== 'undefined') SFX.shardGet();
  },

  /* ════════════════════════════════════════════════════════════════════════
     NEXT ARC / EPILOGUE
  ════════════════════════════════════════════════════════════════════════ */
  _startNextArc() {
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

    if (epi.scenes && epi.scenes.length) {
      this._buildSceneLines(epi.scenes);
      this._onLinesDone = () => this._showEpilogueCards();
      this._renderActiveLine();
      this._showSection('s-dialogue');
      this._setHeader(epi.title || 'EPILOGUE', '');
      this._setBg('epilogue');
      UI.show('story-screen');
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
    UI.show('story-screen');
  },

  _endStory() {
    this.active = false;
    if (typeof TTS !== 'undefined') TTS.stop();
    Save.clear();
    G.enemies = this._allEnemies.slice();
    G.selectedChar = null; G.selectedClass = null;
    UI.show('title-screen');
    // Hide continue button since save is cleared
    const btn = document.getElementById('title-continue-btn');
    if (btn) btn.style.display = 'none';
    const info = document.getElementById('title-save-info');
    if (info) info.style.display = 'none';
  },

  /* ════════════════════════════════════════════════════════════════════════
     SAVE HELPERS
  ════════════════════════════════════════════════════════════════════════ */
  _doSave() {
    if (!this.data || !G.hero) return;
    Save.write({
      arcIdx: this.arcIdx,
      chapIdx: this.chapIdx,
      arcName: `Arc ${this.arc.number}: ${this.arc.name}`,
      selectedChar: G.hero.charId || G.selectedChar,
      selectedClass: G.hero.classId || G.selectedClass,
      hero: { lv: G.hero.lv, exp: G.hero.exp, gold: G.hero.gold },
    });
  },

  /* ════════════════════════════════════════════════════════════════════════
     WORLD MAP
  ════════════════════════════════════════════════════════════════════════ */
  _showWorldMap() {
    const arcs = this.data.arcs;
    const nextIdx = this.arcIdx + 1;
    const area = this.el('map-area');
    if (!area) { this._startNextArc(); return; }

    // Build SVG path
    const pts = MAP_POSITIONS.map(p => `${p.x},${p.y}`).join(' ');
    const done = MAP_POSITIONS.slice(0, this.arcIdx + 1).map(p => `${p.x},${p.y}`).join(' ');
    area.innerHTML = `
      <svg class="map-svg" viewBox="0 0 820 240" preserveAspectRatio="xMidYMid meet">
        <polyline points="${pts}" fill="none" stroke="#1a1060" stroke-width="3" stroke-dasharray="8,5"/>
        ${this.arcIdx > 0 ? `<polyline points="${done}" fill="none" stroke="#4a3898" stroke-width="3"/>` : ''}
      </svg>`;

    // Build nodes
    arcs.forEach((arc, i) => {
      const pos = MAP_POSITIONS[i];
      const isDone = i < this.arcIdx;
      const isCur = i === this.arcIdx;
      const isNext = i === nextIdx;
      const isLock = i > nextIdx;
      const cls = [isDone ? 'done' : '', isCur ? 'current' : '', isNext ? 'next' : '', isLock ? 'locked' : ''].filter(Boolean).join(' ');

      const node = document.createElement('div');
      node.className = `map-node ${cls}`;
      node.style.left = (pos.x - 28) + 'px';
      node.style.top = (pos.y - 40) + 'px';
      node.innerHTML =
        `<div class="mn-icon">${MAP_ICONS[i]}</div>` +
        `<div class="mn-num">ARC ${arc.number}</div>`;
      area.appendChild(node);
    });

    // Info bar
    const next = arcs[nextIdx];
    this.el('map-arc-label').textContent = next ? `NEXT: ${next.name.toUpperCase()}` : 'JOURNEY COMPLETE';
    this.el('map-info-name').textContent = next ? next.name : '';
    this.el('map-info-loc').textContent = next ? (next.location || '') : '';

    UI.show('map-screen');
    if (typeof SFX !== 'undefined') SFX.mapMove();
  },

  /** Called by map screen PROCEED button */
  proceedFromMap() {
    if (typeof SFX !== 'undefined') SFX.mapMove();
    this._startNextArc();
  },

  /* ════════════════════════════════════════════════════════════════════════
     SKIP
  ════════════════════════════════════════════════════════════════════════ */
  skip() {
    if (!confirm('Skip story and go to free battle?')) return;
    this.active = false;
    G.enemies = this._allEnemies.slice();
    goCharSelect();
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
    // Hide all main sections first
    ['s-arc-intro', 's-dialogue', 's-event', 's-arc-end', 's-epilogue'].forEach(sid => {
      const e = this.el(sid);
      if (e) e.style.display = sid === id ? '' : 'none';
    });
  },

  _setContinue(label) {
    const btn = this.el('s-continue');
    if (!btn) return;
    btn.textContent = label;
    btn.style.display = 'inline-block';
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
    if (!box) return;

    box.style.display = '';
    if (typeof SFX !== 'undefined') SFX.dialogue();
    if (typeof TTS !== 'undefined') TTS.stop();
    if (speaker) {
      spkEl.textContent = speaker.toUpperCase();
      spkEl.style.color = SPEAKER_COLOR[speaker] || '#f0f0f8';
      spkEl.style.display = 'block';
      box.dataset.speaker = speaker.toLowerCase();

      const imgSrc = SPEAKER_IMG[speaker];
      if (imgEl && imgSrc) {
        imgEl.src = imgSrc;
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
};

/* ── Global entry point called from title screen button ─────────────────── */
function startStoryMode() {
  Story.begin();
}