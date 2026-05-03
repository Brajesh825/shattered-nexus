/**
 * story.js — Shattered Nexus Story Engine
 * Drives cutscenes, battles, events and arc progression from story.json
 */

/* ── Helpers migrated to cutscene.js ── */
function _charIdForSpeaker(name) {
  return Cutscene.ALIAS_TO_CHARID[name.toLowerCase()] || name.toLowerCase();
}


/* ══════════════════════════════════════════════════════════════════════════
   STORY ENGINE
══════════════════════════════════════════════════════════════════════════ */
/* World map places in 1024x1024 image space. The first three are the fixed route. */
const MAP_PLACES = [
  { x: 306, y: 632, label: 'Verdant Vale', arcIdx: 0, color: '#1f6a2c' },
  { x: 506, y: 574, label: 'Crystal Cavern F1', arcIdx: 1, color: '#5c7ee8' },
  { x: 708, y: 704, label: 'Ember Wastes', arcIdx: 2, color: '#c56820' },
  { x: 208, y: 360, label: 'Sunken Temple', arcIdx: 3, color: '#1e8ac0' },
  { x: 610, y: 446, label: 'Shadow Reach', arcIdx: 4, color: '#5630a8' },
  { x: 756, y: 214, label: 'Void Citadel', arcIdx: 5, color: '#31245c' },
  { x: 818, y: 162, label: 'Fortress Ramparts', arcIdx: 6, color: '#4c3a78' },
  { x: 875, y: 108, label: 'Eternal Void', arcIdx: 7, color: '#080014' },
  { x: 145, y: 145, label: 'Lighthouse Isles', color: '#36a7c8', lore: 'Mist-shrouded islands featuring a spectral lighthouse. Critical: Obtain the Navigator\'s Compass and defeat the Sea Kraken.' },
  { x: 450, y: 214, label: 'Northern Highlands', color: '#8c8f52', lore: 'Desolate, high-altitude plateau with ancient watchtowers. Critical: Discover the Highland Shrine and face the Sky-Drake guardian.' },
  { x: 575, y: 650, label: 'Ashen Foothills', color: '#8f6040', lore: 'Volcanic transition zone where lava meets ash. Critical: Navigate the Basalt Labyrinth and defeat the Molten Golem.' },
  { x: 835, y: 512, label: 'Eastern Wetlands', color: '#3b8f6a', lore: 'Poisonous, neon-lit marshland with bioluminescent flora. Critical: Collect Glow-Spore Essence and survive the Swamp Horror\'s ambush.' },
  { x: 930, y: 175, label: 'Sky Ruins', color: '#7750c8', lore: 'Crumbling floating islands suspended in a perpetual storm. Critical: Align the Aerolith Crystals and defeat the Storm Sentinel.' },
  { x: 160, y: 780, label: 'Southern Isles', color: '#2c8a72', lore: 'Tropical archipelago masking a deep-sea trench. Critical: Use the Tide-Caller Shell and face the Sunken Leviathan.' },
  { x: 470, y: 492, label: 'Riverlands Crossing', color: '#4c9fc0', lore: 'A strategic junction of rushing rivers and crumbling bridges. Critical: Repair the Great Stone Bridge and defeat the River King.' },
];

const MAP_MAIN_ROUTE = [0, 1, 2, 3, 4, 5, 6, 7];
const MAP_SIDE_ROUTES = [
  [0, 13], [0, 14], // After Arc 1: Southern Isles, Riverlands
  [2, 10],         // After Arc 3: Ashen Foothills
  [3, 8],          // After Arc 4: Lighthouse Isles
  [4, 11],         // After Arc 5: Eastern Wetlands
  [5, 9], [5, 12], // After Arc 6: Northern Highlands, Sky Ruins
];

/* Explore map linked to each arc (index = arcIdx 0-based) */
const ARC_MAP_ID = [
  'verdant_vale',      // Arc 1
  'crystal_cavern_f3',    // Arc 2
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
  _retrying: false,


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
      const defaultChars = ['aya', 'tao', 'lulu', 'rei'];
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
    this._activeSlot = slot;
    this._pendingSave = s;
    this.init(() => {
      if (!this.data) { alert('Story data not found.'); return; }
      this.active = true;
      G.selectedChar = s.selectedChar || (G.chars[0] && G.chars[0].id);
      G.selectedClass = s.selectedClass || (G.classes[0] && G.classes[0].id);
      // Restore full party selection if saved, otherwise rebuild from hero
      if (s.selectedChars && s.selectedChars.length) {
        G.selectedChars = s.selectedChars;
      } else {
        const heroId_ = G.selectedChar;
        G.selectedChars = [heroId_, ...G.chars.map(c => c.id).filter(id => id !== heroId_)].slice(0, 4);
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

      // Guard: Validate structure before hydration
      if (typeof SaveContract !== 'undefined' && !SaveContract.validateSaveStructure(s)) {
        console.error('Save structure invalid. Aborting hydration.');
        return;
      }

      this.arcIdx = s.arcIdx || 0;
      this.chapIdx = s.chapIdx !== undefined ? s.chapIdx : -1;
      this.phase = s.phase || null;
      G.saveVersion = s.version || '1.0';
      // Restore all party member stats (new format) or fall back to hero-only (legacy)
      if (s.partyStats && s.partyStats.length && G.party.length) {
        G.party.forEach(m => {
          const saved = s.partyStats.find(p => p.charId === m.charId);
          if (saved) {
            // Restore progression
            m.lv = saved.lv || 1;
            m.exp = saved.exp || 0;
            m.gold = saved.gold || 0;
            m.isKO = saved.isKO || false;

            // Sync level back to source char so computeStats uses the right level
            if (m.char) m.char.lv = m.lv;

            rebuildMemberCombatStats(m, {
              resourceStrategy: 'clamp',
              hp: saved.hp,
              mp: saved.mp
            });
          }
        });
      } else if (s.hero && G.hero) {
        // Legacy save: only hero stats were persisted
        G.hero.lv = s.hero.lv || 1;
        G.hero.exp = s.hero.exp || 0;
        G.hero.gold = s.hero.gold || 0;
      }
      // Restore unlocked characters and inventory from save
      if (s.unlockedChars) G.unlockedChars = s.unlockedChars;
      if (s.clearedMaps) G.clearedMaps = s.clearedMaps;
      if (s.inventory) G.inventory = s.inventory;
      if (s.npcTalked) G.npcTalked = s.npcTalked;
      if (s.ownedRelics) G.ownedRelics = s.ownedRelics;
      if (s.activeRelics) G.activeRelics = s.activeRelics;
      if (s.archive) { G.archive = s.archive; if (typeof Archive !== 'undefined') Archive.init(); }

      // If saved from explore map, restore directly to that map (no overlay/selection)
      if (s.mapId) {
        const arc = this.arc;
        const chapters = arc.chapters || [];
        const savedChap = (this.chapIdx >= 0 && this.chapIdx < chapters.length) ? chapters[this.chapIdx] : null;

        if (savedChap && savedChap.type === 'explore') {
          // Normal story explore chapter — restore with proper chapter context
          this._exploreChap = savedChap;
          this._launchExploreRestore(savedChap, s.mapX, s.mapY);
          return;
        }

        // Post-boss free explore (chapIdx out of bounds or non-explore chapter):
        // player was roaming the map after clearing the arc. Restore to the map;
        // exiting will call _showWorldMap() via the camp EXIT button.
        const freeChap = { map: s.mapId, post_dialogue: [] };
        const exploreIdx = chapters.findIndex(c => c.type === 'explore');
        this._exploreChap = exploreIdx >= 0 ? chapters[exploreIdx] : freeChap;
        this._launchExploreRestore(freeChap, s.mapX, s.mapY);
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
      // If saved phase is post-boss or later, boss is already beaten — go to world map
      const _postBossPhases = ['boss_post', 'char_moment', 'arc_end', 'world_map', 'epilogue'];
      if (_postBossPhases.includes(this.phase)) {
        this._showWorldMap();
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

  /** Called by checkBattleEnd() (via TurnManager) when all enemies are defeated */
  onBattleWon() {
    if (typeof BGM !== 'undefined') BGM.crossfade('story');
    
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

  /** Called by checkBattleEnd() (via TurnManager) when the whole party falls */
  onBattleLost() {
    /* Skirmish defeat: just go back to world map, no penalty */
    if (this._skirmishArcIdx !== undefined) {
      this._skirmishArcIdx = undefined;
      this._showWorldMap();
      return;
    }

    // Roll the save back to the start of the explore chapter
    this._gameOverRollback();

    // Populate the game over screen
    const partyEl = document.getElementById('go-party');
    if (partyEl && G.party) {
      partyEl.innerHTML = G.party.map(m =>
        `<div class="go-member">
          <div class="go-member-ko">💀</div>
          <div class="go-member-name">${m.displayName || m.name || m.charId}</div>
        </div>`
      ).join('');
    }

    const arc = this.arc;
    const subEl = document.getElementById('go-subtitle');
    if (subEl) subEl.textContent = arc ? `Defeated in ${arc.name}` : 'The party has fallen...';

    _clearBattleAtmosphere();
    showScreen('game-over-screen');
    if (window.LogDebug) window.LogDebug(`[KO] Game Over — save rolled back to start of explore chapter`, 'dmg');
  },

  /** Roll the save back to the start of the current explore chapter.
   *  Party is fully healed. chapIdx rewinds to the explore chapter index.
   *  Called on every story-mode party wipe. Does NOT save — the game-over
   *  "Return to Map" button loads the last manual save instead. */
  _gameOverRollback() {
    const arc = this.arc;
    const chapters = (arc && arc.chapters) ? arc.chapters : [];

    // Find the explore chapter in this arc (or fall back to chapter 0)
    const exploreIdx = chapters.findIndex(c => c.type === 'explore');
    this.chapIdx = exploreIdx >= 0 ? exploreIdx : 0;
    this.phase = null;

    // Heal party so they're ready when the manual save is reloaded
    this._healParty();
  },

  /** Game Over screen button — reload the rollback save and re-enter the explore map */
  gameOverReturnToMap() {
    if (typeof SFX !== 'undefined' && SFX.click) SFX.click();
    // The rollback save is already written — reload it via the normal loadSave path
    const slot = this._activeSlot !== undefined ? this._activeSlot : 0;
    this.loadSave(slot);
  },

  /** Game Over screen button — return to title screen */
  gameOverTitle() {
    if (typeof SFX !== 'undefined' && SFX.click) SFX.click();
    G.mode = null;
    Story.active = false;
    showScreen('title-screen');
  },

  /* ════════════════════════════════════════════════════════════════════════
     CONTINUE BUTTON (called from HTML onclick)
  ════════════════════════════════════════════════════════════════════════ */
  handleScreenClick(e) {
    if (e.target.closest('button')) return;
    if (G.mode === 'story') {
      if (this.phase === 'arc_intro') {
        this.advance();
      } else {
        Cutscene.advance();
      }
    }
  },

  advance() {
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
    
    Cutscene.advance();
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
        m.regenTurns = 0; m.stunned = false;
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
    Cutscene.clear();

    this._setHeader(`Arc ${this.arc.number}: ${this.arc.name}`, chap.title || '');
    this._setBg(chap.background);
    console.log('[Story._loadChapter] Processing chapter type:', chap.type);

    if (chap.type === 'cutscene') {
      this.phase = 'cutscene';
      const lines = this._buildSceneLines(chap.scenes);
      Cutscene.start(lines, () => this._nextChapter());
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
      return;
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
    return lines;
  },


  /* ════════════════════════════════════════════════════════════════════════
     GENERIC LINE LIST RENDERER
  ════════════════════════════════════════════════════════════════════════ */
  _showLines(lines, onDone) {
    Cutscene.start(lines, onDone);
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
    Cutscene.clear();
    this._setHeader(`Arc ${this.arc.number}: ${this.arc.name}`, `⚔ BOSS: ${boss.title}`);
    this._setBg(boss.background);
    this._showLines(boss.pre_dialogue || [], () => this._launchBoss());
    showScreen('story-screen');
  },


  _launchBoss() {
    this.phase = 'boss_in';
    G.mode = 'story'; // reset from 'story_explore' so checkBattleEnd routes to Story.onBattleWon()
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
    if (typeof BGM !== 'undefined') {
      const chap = this.currentChap || {};
      const isBoss = (this.phase === 'boss_in');
      const track = isBoss ? (chap.bossBgm || 'boss') : (chap.battleBgm || 'battle');
      BGM.crossfade(track);
    }

    // Hide dialogue during battle
    const dialogue = this.el('s-dialogue');
    if (dialogue) dialogue.style.display = 'none';

    const raw = this._allEnemies.find(e => e.id === enemyId);
    if (!raw) { console.warn('Story: enemy not found:', enemyId); this.onBattleWon(); return; }
    const def = this._scaleEnemy(raw);

    // Build enemy group: boss is always solo
    const defs = [def];
    const isBoss = (this.phase === 'boss_in');

    // Calculate spawn level based on arc and whether this is a boss fight
    // Regular: Arc 1→1, 2→3, 3→6, 4→10, 5→14, 6→18, 7→22, 8→26
    // Boss: significantly higher — bosses should feel like a clear step up
    const arcProgression = [1, 3, 6, 10, 14, 18, 22, 26];
    const bossProgression = [6, 12, 18, 24, 30, 36, 42, 50];
    const spawnLevel = isBoss
      ? (bossProgression[this.arcIdx] || arcProgression[this.arcIdx] || 1)
      : (arcProgression[this.arcIdx] || 1);

    buildEnemyGroup(defs, spawnLevel, isBoss);

    // Reset per-battle state on party members (keep HP/MP/levels from prior battles)
    G.party.forEach(m => { m.regenTurns = 0; m.stunned = false; });

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
      const wrap = document.getElementById('explore-canvas-wrap');
      const canvas = document.getElementById('explore-canvas');
      if (!wrap || !canvas) return;

      // Size canvas to the wrap's actual rendered size
      canvas.width = wrap.offsetWidth || 360;
      canvas.height = wrap.offsetHeight || 480;

      if (!canvas._mapInited) {
        canvas._mapInited = true;
        MapEngine.init(canvas);
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

    requestAnimationFrame(() => requestAnimationFrame(async () => {
      const wrap = document.getElementById('explore-canvas-wrap');
      const canvas = document.getElementById('explore-canvas');
      if (!wrap || !canvas) return;

      canvas.width = wrap.offsetWidth || 360;
      canvas.height = wrap.offsetHeight || 480;

      if (!canvas._mapInited) {
        canvas._mapInited = true;
        MapEngine.init(canvas);
      }

      const overlay = document.getElementById('map-select-overlay');
      if (overlay) overlay.style.display = 'none';

      // CRITICAL: Await map loading so its internal default reset finishes
      // before we apply our saved restoration coordinates.
      await MapEngine.start(chap.map);

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

  /** Called by MapEngine when a teleport occurs during story_explore mode */
  onMapTeleport(newMapId) {
    if (!this.arc) return;
    const nextChap = this.arc.chapters[this.chapIdx + 1];

    // If we teleported to the map of the next chapter, advance state quietly
    if (nextChap && nextChap.map === newMapId) {
      console.log('[Story] Seamlessly advancing chapter to:', nextChap.id);
      this.chapIdx++;
      this.currentChap = nextChap;
      this._doSave();

      const lbl = document.getElementById('explore-map-name');
      const m = MapEngine.getMap();
      if (lbl && m) lbl.textContent = `✦ ${m.name.toUpperCase()} ✦`;

      // Show the new floor's objective hint so the player knows what to do next
      if (nextChap.map_hint && typeof MapUI !== 'undefined') {
        MapUI.showMsg(nextChap.map_hint, 2500);
      }
    }
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
      m.regenTurns = 0; m.stunned = false;
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
    const lines = this._buildSceneLines(arc.outro.scenes);
    Cutscene.start(lines, () => this._showArcEnd());
    showScreen('story-screen');
  },


  /* ════════════════════════════════════════════════════════════════════════
     ARC END (shard card)
  ════════════════════════════════════════════════════════════════════════ */
  _showArcEnd() {
    const arc = this.arc;
    this.phase = 'arc_end';

    this._showSection('s-arc-end');

    // Load spirit images
    const heroName = G.hero?.id || 'aya';
    const heroNameLower = (heroName || '').toLowerCase();

    // Spirit image (large, center)
    const spiritImg = this.el('s-ae-spirit');
    if (spiritImg) {
      spiritImg.style.display = 'block';
      SpriteRenderer.setFrame(spiritImg, heroNameLower, 'idle', 280);
    }

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
    // Intercept if next arc is not released yet
    if (!isArcReleased(this.arcIdx + 1)) {
      this._showBetaEndScreen();
      return;
    }

    this.arcIdx++;
    G.enemies = this._allEnemies.slice();
    if (this.arcIdx >= this.data.arcs.length) { this._beginEpilogue(); return; }

    if (G.hero) { G.hero.hp = G.hero.maxHp; G.hero.mp = G.hero.maxMp; }
    this.chapIdx = -1;
    this.phase = null;
    this._showArcIntro();
  },

  /** Handles the 'Coming Soon' state for beta releases */
  _showBetaEndScreen() {
    this.active = false;
    if (typeof TTS !== 'undefined') TTS.stop();
    G.mode = 'story_end';

    const beTitle = this.el('be-title');
    const beSub = this.el('be-subtitle');
    const beText = this.el('be-text');

    if (beTitle) beTitle.textContent = ReleaseConfig.BETA_END_TITLE || 'VERSION COMPLETE';
    if (beSub) beSub.textContent = ReleaseConfig.BETA_END_SUBTITLE || 'CONTINUING SOON';
    if (beText) beText.textContent = ReleaseConfig.BETA_END_TEXT || 'Thanks for playing!';

    showScreen('beta-end-screen');
    if (typeof SFX !== 'undefined') SFX.shardGet();
  },

  _beginEpilogue() {
    const epi = this.data.epilogue;
    this.phase = 'epilogue';

    if (epi.scenes && epi.scenes.length) {
      const lines = this._buildSceneLines(epi.scenes);
      Cutscene.start(lines, () => this._showEpilogueCards());
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
    G.enemies = this._allEnemies.slice();
    G.selectedChar = null; G.selectedClass = null;

    if (typeof Credits !== 'undefined') {
      Credits.launch();
    } else {
      showScreen('title-screen');
    }

    if (typeof refreshSaveSlots === 'function') refreshSaveSlots();
  },

  /* ════════════════════════════════════════════════════════════════════════
     SAVE HELPERS
  ════════════════════════════════════════════════════════════════════════ */
  _doSave() {
    if (!this.data || !G.hero || !G.party || !G.party.length) return;
    // On first save of a new game, clear the slot first (safe: we're about to overwrite it)
    if (this._newGameSlot !== undefined) {
      Save.clear(this._newGameSlot);
      delete this._newGameSlot;
    }
    // Save only progression + current resources — combat stats are always recomputed on load
    const partyStats = G.party.map(m => ({
      charId: m.charId,
      classId: m.classId,
      lv: m.lv || 1,
      exp: m.exp || 0,
      gold: m.gold || 0,
      hp: m.hp,
      mp: m.mp,
      isKO: m.isKO || false,
    }));
    // Capture current map location if the explore map is actively running.
    const curMap = (typeof MapEngine !== 'undefined') ? MapEngine.getMap() : null;
    const mapId = curMap?.id || null;
    const mapX = (mapId && typeof MapPlayer !== 'undefined') ? MapPlayer.tx : null;
    const mapY = (mapId && typeof MapPlayer !== 'undefined') ? MapPlayer.ty : null;

    console.log(`[Story] Saving state to slot ${this._activeSlot ?? 0}. Pos: (${mapX}, ${mapY})`);
    Save.write({
      arcIdx: this.arcIdx,
      chapIdx: this.chapIdx,
      phase: this.phase,
      lineIdx: this.lineIdx,
      arcName: `Arc ${this.arc.number}: ${this.arc.name}`,
      selectedChar: G.hero.charId || G.selectedChar,
      selectedClass: G.hero.classId || G.selectedClass,
      selectedChars: G.selectedChars || [],
      partyStats,
      // Keep legacy hero field for backward compat
      hero: { lv: G.hero.lv, exp: G.hero.exp, gold: G.hero.gold || 0 },
      unlockedChars: G.unlockedChars,
      clearedMaps: G.clearedMaps || [],
      npcTalked: G.npcTalked || {},
      inventory: G.inventory || [],
      ownedRelics: G.ownedRelics || [],
      activeRelics: G.activeRelics || [],
      archive: G.archive || {},
      mapId,
      mapX,
      mapY,
    }, this._activeSlot ?? 0);
  },

  /* ════════════════════════════════════════════════════════════════════════
     WORLD MAP
  ════════════════════════════════════════════════════════════════════════ */
  _showWorldMap() {
    this._showSection(null);
    this._closeRegionPanel();
    if (typeof MapTouch !== 'undefined') MapTouch.reset();

    const arcs = this.data.arcs;
    const nextIdx = this.arcIdx + 1;
    const area = this.el('map-area');
    if (!area) { this._startNextArc(); return; }

    /* Path layer shares the world-map image coordinate space. */
    let svgLines = '';
    const unlockedPlaces = new Set(MAP_MAIN_ROUTE); // Main route always shown (though locked)
    
    // DEV MODE BYPASS: Show everything if IS_DEV or debug URL param is set
    const urlParams = new URLSearchParams(window.location.search);
    const isDebug = (typeof ReleaseConfig !== 'undefined' && ReleaseConfig.IS_DEV) || 
                    urlParams.get('debug') === 'true' || 
                    urlParams.get('dev') === 'true';

    // Determine which side regions are unlocked
    MAP_SIDE_ROUTES.forEach(([fromIdx, toIdx]) => {
      // Side region is only considered for unlocking if its parent arc is released (or in debug mode)
      if (isArcReleased(fromIdx) || isDebug) {
        if (isDebug || fromIdx < this.arcIdx) {
          unlockedPlaces.add(toIdx);
        }
      }
    });

    for (let i = 0; i < MAP_MAIN_ROUTE.length - 1; i++) {
      const a = MAP_PLACES[MAP_MAIN_ROUTE[i]], b = MAP_PLACES[MAP_MAIN_ROUTE[i + 1]];
      if (!a || !b) continue;
      // Skip if not released AND not in debug mode
      if (!isArcReleased(b.arcIdx) && !isDebug) continue;
      const done = (b.arcIdx ?? 99) <= this.arcIdx;
      const color = done ? '#f5d060' : '#302860';
      const dash = done ? '' : 'stroke-dasharray="8,5"';
      svgLines += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
        stroke="${color}" stroke-width="4" stroke-linecap="round" ${dash}/>`;
    }
    for (const [fromIdx, toIdx] of MAP_SIDE_ROUTES) {
      if (!unlockedPlaces.has(toIdx)) continue; // Only show paths to unlocked places
      const a = MAP_PLACES[fromIdx], b = MAP_PLACES[toIdx];
      if (!a || !b) continue;
      svgLines += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
        stroke="#7d6ab8" stroke-width="2" stroke-linecap="round"
        stroke-dasharray="5,8" opacity="0.32"/>`;
    }
    area.innerHTML = `
      <svg class="map-svg" viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet">
        ${svgLines}
      </svg>`;

    /* ── Place elements ── */
    MAP_PLACES.forEach((place, placeIdx) => {
      const arcIdx = place.arcIdx;
      const arc = Number.isInteger(arcIdx) ? arcs[arcIdx] : null;
      
      // Filter out unreleased arcs (unless in debug mode)
      if (arc && !isArcReleased(arcIdx) && !isDebug) return;
      
      // Filter out locked side regions
      const isStoryPlace = !!arc;
      const isCharted = !isStoryPlace;
      if (isCharted && !unlockedPlaces.has(placeIdx)) return;

      const isDone = isStoryPlace && arcIdx < this.arcIdx;
      const isCur = isStoryPlace && arcIdx === this.arcIdx;
      const isNext = isStoryPlace && arcIdx === nextIdx;
      const isLock = isStoryPlace && arcIdx > nextIdx;
      
      const cls = [
        isDone ? 'done' : '',
        isCur ? 'current' : '',
        isNext ? 'next' : '',
        isLock ? 'locked' : '',
        isCharted ? 'charted' : '',
        place.x < 260 ? 'label-right' : '',
        place.x > 760 ? 'label-left' : '',
        place.x >= 260 && place.x <= 760 && place.y > 760 ? 'label-above' : '',
      ].filter(Boolean).join(' ');

      const node = document.createElement('div');
      node.className = `map-node ${cls}`;
      node.style.left = `${(place.x / 1024) * 100}%`;
      node.style.top = `${(place.y / 1024) * 100}%`;
      if (place.color) node.style.setProperty('--node-color', place.color);

      node.innerHTML =
        `<div class="mn-marker" aria-hidden="true"></div>` +
        (isCur ? `<div class="mn-party-indicator">🚩</div>` : '') +
        `<div class="mn-label">
          <span class="mn-status">${isCharted ? 'CHARTED' : isDone ? 'CLEARED' : isCur ? 'ACTIVE' : isNext ? 'NEXT' : 'LOCKED'}</span>
          <span class="mn-name">${place.label}</span>
        </div>`;

      /* Interaction */
      if (isDone || isCur || isNext || isCharted) {
        node.title = isStoryPlace ? `${place.label} - ${arc.location || 'Select place'}` : place.label;
        node.setAttribute('role', 'button');
        node.tabIndex = 0;
        node.addEventListener('click', () => isStoryPlace ? this._openRegionPanel(arcIdx) : this._openMapPlacePanel(placeIdx));
        node.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            isStoryPlace ? this._openRegionPanel(arcIdx) : this._openMapPlacePanel(placeIdx);
          }
        });
      } else {
        node.title = 'Locked';
        node.setAttribute('aria-disabled', 'true');
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
      proceedBtn.style.cursor = arcComplete ? '' : 'not-allowed';
      proceedBtn.title = arcComplete ? '' : '⛔ Defeat the current arc boss first';
    }
    this.el('map-arc-label').textContent = next
      ? (arcComplete ? `NEXT: ${next.name.toUpperCase()}` : `⛔ BOSS UNDEFEATED`)
      : 'JOURNEY COMPLETE';
    this.el('map-info-name').textContent = next ? next.name : '';
    this.el('map-info-loc').textContent = next ? (next.location || '') : '';

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
    const arc = this.data.arcs[arcIdx];
    const panel = document.getElementById('map-region-panel');
    const mapId = ARC_MAP_ID[arcIdx] || '';
    const lore = ARC_LORE[arcIdx] || '';
    const shard = arc.shard;
    const isDone = arcIdx < this.arcIdx;
    const isCur = arcIdx === this.arcIdx;
    const isNext = arcIdx === this.arcIdx + 1;
    const arcComplete = this.phase === 'arc_end' || this.phase === 'epilogue';

    panel.innerHTML = `
      <div class="mrp-handle"></div>
      <div class="mrp-num">ARC ${arc.number}</div>
      <div class="mrp-name">${arc.name}</div>
      <div class="mrp-loc">${arc.location || ''}</div>
      ${shard ? `<div class="mrp-shard" style="color:${shard.color || '#fff'}">🔮 ${shard.name}</div>` : ''}
      <div class="mrp-lore">${lore}</div>
      <div class="mrp-actions">
        ${isNext ? `<button class="mrp-btn primary" ${arcComplete ? '' : 'disabled'} onclick="Story.proceedFromMap()">${arcComplete ? 'TRAVEL THERE' : 'DEFEAT CURRENT BOSS'}</button>` : ''}
        ${(isDone || isCur) && mapId ? `<button class="mrp-btn primary" onclick="Story.startRegionSkirmish(${arcIdx})">⚔ SKIRMISH</button>` : ''}
        ${(isDone || isCur) && mapId ? `<button class="mrp-btn" onclick="Story._exploreRegion('${mapId}')">🗺 EXPLORE</button>` : ''}
        <button class="mrp-btn" onclick="Story._closeRegionPanel()">← BACK</button>
      </div>`;

    panel.classList.add('open');
    if (typeof MapTouch !== 'undefined') MapTouch.initPanelSwipe(panel);
  },

  _openMapPlacePanel(placeIdx) {
    const place = MAP_PLACES[placeIdx];
    const panel = document.getElementById('map-region-panel');
    if (!place || !panel) return;

    const mapId = place.label.toLowerCase().replace(/ /g, '_');
    const isPlayable = typeof MAP_DEFS !== 'undefined' && MAP_DEFS[mapId];

    panel.innerHTML = `
      <div class="mrp-handle"></div>
      <div class="mrp-num">${isPlayable ? 'SIDE REGION' : 'CHARTED PLACE'}</div>
      <div class="mrp-name">${place.label}</div>
      <div class="mrp-loc">${isPlayable ? 'Explorable Side Map' : 'Future map candidate'}</div>
      <div class="mrp-lore">${place.lore || 'This location is visible on the world map, but it is not connected to a playable region yet.'}</div>
      <div class="mrp-actions">
        ${isPlayable ? `<button class="mrp-btn primary" onclick="Story._exploreRegion('${mapId}')">🗺 EXPLORE</button>` : `<button class="mrp-btn" disabled>NOT AVAILABLE YET</button>`}
        <button class="mrp-btn" onclick="Story._closeRegionPanel()">← BACK</button>
      </div>`;

    panel.classList.add('open');
    if (typeof MapTouch !== 'undefined') MapTouch.initPanelSwipe(panel);
  },

  _closeRegionPanel() {
    const panel = document.getElementById('map-region-panel');
    if (panel) panel.classList.remove('open');
  },

  _exploreRegion(mapId) {
    if (typeof startExplore === 'undefined' || typeof MAP_DEFS === 'undefined' || !MAP_DEFS[mapId]) return;
    this._closeRegionPanel();
    // startExplore() inits the canvas and shows the explore screen
    startExplore(true);
    // Start the target map
    MapEngine.start(mapId);
    if (typeof MapUI !== 'undefined') MapUI.showMsg(`Entering ${MAP_DEFS[mapId].name}…`, 1500);
  },

  /* ── Skirmish: battle using the map's encounter templates at current party LV ─── */
  startRegionSkirmish(arcIdx) {
    if (!G.party.length) return;

    // Find the map that belongs to this arc (arcId is 1-indexed, arcIdx is 0-indexed)
    const mapDef = typeof MAP_DEFS !== 'undefined'
      ? Object.values(MAP_DEFS).find(m => m.arcId === arcIdx + 1)
      : null;
    const templates = mapDef ? (mapDef.encounterTemplates || []) : [];
    if (!templates.length) return;

    // Weighted random pick of a template
    const total = templates.reduce((s, t) => s + (t.weight || 1), 0);
    let roll = Math.random() * total;
    let template = templates[0];
    for (const t of templates) { roll -= (t.weight || 1); if (roll <= 0) { template = t; break; } }

    const partyLv = Math.max(...G.party.map(m => m.lv || 1));
    const picks = template.enemies
      .map(id => (G.enemies || []).find(e => e.id === id))
      .filter(Boolean);
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
    Cutscene.skip();
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
    Cutscene._showSection(id);
  },

  _setContinue(label) {
    Cutscene._setContinue(label);
  },

  _hideContinue() {
    Cutscene._hideContinue();
  },
};


/* ── Global entry point called from title screen button ─────────────────── */
function startStoryMode() {
  Story.begin();
}

/** Initial Release UI Setup */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof ReleaseConfig !== 'undefined') {
    const tag = document.getElementById('game-version-tag');
    if (tag) tag.textContent = ReleaseConfig.VERSION || 'v3.0';

    const arcCount = document.querySelector('.title-tagline');
    if (arcCount) {
      const releasedCount = ReleaseConfig.MAX_REACHABLE_ARC + 1;
      const arcLabel = releasedCount === 1 ? 'Released Arc' : 'Released Arcs';
      if (releasedCount < 8) {
        arcCount.innerHTML = arcCount.innerHTML.replace('8 Arcs', `${releasedCount} ${arcLabel}`);
      }
    }

    const itchBtn = document.getElementById('be-itch-btn');
    if (itchBtn) {
      itchBtn.addEventListener('click', () => {
        window.open(ReleaseConfig.ITCH_URL || 'https://itch.io', '_blank');
      });
    }
  }
});

// Explicitly export Story to window for dynamic HTML handlers
window.Story = Story;
