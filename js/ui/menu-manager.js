/* ============================================================
   PARTY MENU
   ============================================================ */
function openPartyMenu() {
  const overlay = document.getElementById('party-menu');
  if (!overlay) return;
  renderPartyMenu();
  overlay.style.display = 'flex';
}
function closePartyMenu() {
  const overlay = document.getElementById('party-menu');
  if (overlay) overlay.style.display = 'none';
}

/* ============================================================
   INIT
   ============================================================ */
window.addEventListener('DOMContentLoaded', async () => {
  await loadAllGameData();
  moveAnimations = window.MOVE_ANIMATIONS || {};
  G.chars   = window.CHARACTERS_DATA || [];
  G.classes = window.CLASSES_DATA    || [];
  G.enemies = window.ENEMIES_DATA    || [];
  G.items   = window.ITEMS_DATA      || [];
  G.relics  = window.RELICS_DATA     || [];
  window._origEnemies = G.enemies.slice();
  initStars();
  scaleGame();
  showScreen('title-screen');
});

function initStars() {
  const containers = ['stars', 'stars-l1', 'stars-l2'].map(id => document.getElementById(id)).filter(Boolean);
  if (containers.length === 0) return;

  containers.forEach(c => {
    const count = c.id === 'stars' ? 70 : 40; // Fewer stars for layered backgrounds
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*2}s;animation-duration:${1+Math.random()*2}s`;
      c.appendChild(s);
    }
  });
}

/* ============================================================
   MAP ENCOUNTER HANDLER (global setup)
   ============================================================ */
MapEngine.onEncounterStart = (enc, map) => {
  const enemyIds   = enc.enemies      || [];
  const mutation   = enc.mutation     || null; // null | 'corrupted' | 'mutant'
  const mutantTraits = enc.mutantTraits || null; // array of trait objects, mutant only
  G.battleZone = map?.id || null; // store zone for battle background

  const enemyDefs = enemyIds
    .map(id => G.enemies.find(e => e.id === id))
    .filter(Boolean);

  if (enemyDefs.length === 0) return;

  // Get enemy level range from map; mutated enemies spawn at higher end
  const [minLevel, maxLevel] = map?.enemyLevelRange || [1, 1];
  const baseLevel  = minLevel + Math.floor(Math.random() * (maxLevel - minLevel + 1));
  const spawnLevel = mutation === 'mutant'    ? maxLevel + 3
                   : mutation === 'corrupted' ? maxLevel + 1
                   : baseLevel;

  // Apply mutation: rename enemies and tag for stat boost in buildEnemyGroup
  const mutatedDefs = mutation ? enemyDefs.map(def => ({
    ...def,
    name:     mutation === 'mutant' ? `Mutant ${def.name}` : `Corrupted ${def.name}`,
    mutation, // carried into the built enemy object
  })) : enemyDefs;

  const isBossEncounter = enc.isBoss || false;
  buildEnemyGroup(mutatedDefs, spawnLevel, isBossEncounter);

  // Record encountered enemies in Archive
  if (typeof Archive !== 'undefined') {
    enemyIds.forEach(id => Archive.recordSeen(id));
  }

  // Apply mutation stat multipliers on top of built group per NexusScaling
  if (mutation) {
    const mutDef = NexusScaling.mutation[mutation];
    const statMult = mutDef ? mutDef.statMult : 1.0;
    const hpMult = mutDef ? (mutDef.hpMult || mutDef.statMult) : 1.0;
    
    G.enemyGroup.forEach(e => {
      // --- SAFETY CHECK: NO MUTATED BOSSES (Still enforced for Boss-flagged legends) ---
      if (e.isBoss) {
        e.mutation = null;
        e.mutantTraits = null;
        return;
      }

      e.hp    = Math.floor(e.hp    * hpMult); e.maxHp = e.hp;
      e.atk   = Math.floor(e.atk   * statMult);
      e.def   = Math.floor(e.def   * statMult);
      e.mag   = Math.floor(e.mag   * statMult);
      e.exp   = Math.floor(e.exp   * (mutation === 'mutant' ? NexusScaling.mutation.mutant.expMult : NexusScaling.mutation.corrupted.expMult));
      e.gold  = Math.floor(e.gold  * (mutation === 'mutant' ? NexusScaling.mutation.mutant.goldMult : NexusScaling.mutation.corrupted.goldMult));
      e.mutation = mutation;

      // ── Apply mutant traits ──────────────────────────────
      if (mutation === 'mutant' && mutantTraits?.length) {
        e.mutantTraits = mutantTraits; // attach for elemMult immune/shatter checks
        e._enragedTurns = 0;          // counter for Enraged trait

        for (const t of mutantTraits) {
          if (t.type === 'stat') {
            if      (t.stat === 'atk') e.atk = Math.floor(e.atk * t.mult);
            else if (t.stat === 'def') e.def = Math.floor(e.def * t.mult);
            // spd: tag on object, affects AI tickRate in engine (not modelled here, just flavor)
          }
          // vampiric / regenerating / enraged flags are checked at runtime in battle resolution
        }
      }
    });
  }

  _initBattle();

  // ── Apply zone + mutation atmosphere to the battle scene ────
  const scene = document.getElementById('battle-scene');
  if (scene) {
    // Remove all zone and mutation classes first
    scene.classList.remove('battle-corrupted', 'battle-mutant');
    scene.className = scene.className
      .split(' ')
      .filter(c => !c.startsWith('battle-zone-'))
      .join(' ');
    // Apply zone background
    if (G.battleZone) scene.classList.add(`battle-zone-${G.battleZone}`);
    // Apply mutation overlay on top
    if (mutation === 'corrupted') scene.classList.add('battle-corrupted');
    if (mutation === 'mutant')    scene.classList.add('battle-mutant');
  }

  const prefix = mutation === 'mutant'    ? '☣ MUTANT '
               : mutation === 'corrupted' ? '✦ CORRUPTED '
               : '';
  const names = G.enemyGroup.map(e => e.name).join(' & ');
  BattleUI.setLog([`${prefix}⚔ ${names} appeared!`, `Party to battle stations!`], ['hi','']);
  processCurrentTurn();
};

/* ============================================================
   CHARACTER SELECT
   ============================================================ */
function goCharSelect() {
  G.selectedChars = [];
  G.selectedChar  = null;

  // If not in story mode, this is free battle mode — unlock all characters
  if (G.mode !== 'story') {
    G.mode = 'free';
    G.unlockedChars = G.chars.map(c => c.id);
  }

  showScreen('char-screen');
  _renderCharGrid();
  document.getElementById('char-detail').innerHTML = 'Click characters to add them to your party.';
  _updateCharConfirmBtn();
}

function goArcCharSelect() {
  try {
    console.log('[goArcCharSelect] Starting arc character selection');
    G.selectedChars = [];
    G.selectedChar  = null;
    G.mode = 'story';

    // Show char-screen (this will hide all other screens via CSS)
    showScreen('char-screen');
    _renderCharGrid();
    console.log('[goArcCharSelect] Grid rendered, available chars:', G.chars.filter(ch => G.unlockedChars.includes(ch.id)).map(c => c.name));

    const detailEl = document.getElementById('char-detail');
    if (detailEl) {
      detailEl.innerHTML = 'Select 4 characters for this arc. They will be your party throughout.';
    }

    // Change confirm button text for arc selection
    const btn = document.getElementById('char-confirm');
    if (btn) {
      console.log('[goArcCharSelect] Setting up button handler');
      btn.textContent = 'LOCK IN PARTY';

      // Remove old onclick and add new event listener
      btn.onclick = null;
      btn.removeEventListener('click', window._arcCharSelectHandler);
      window._arcCharSelectHandler = () => {
        console.log('[goArcCharSelect] Button clicked, selectedChars:', G.selectedChars);
        if (G.selectedChars.length < 4) {
          console.log('[goArcCharSelect] Not enough characters selected');
          return;
        }
        // Build party from selected characters
        buildParty();
        console.log('[goArcCharSelect] Party built:', G.party.map(m => m.name));
        // Proceed to story after selection
        if (typeof Story !== 'undefined' && Story.active) {
          console.log('[goArcCharSelect] Calling Story._nextChapter()');
          Story._nextChapter();
          console.log('[goArcCharSelect] Story._nextChapter() returned');
        }
      };
      btn.addEventListener('click', window._arcCharSelectHandler);
      _updateCharConfirmBtn();
    }
  } catch (e) {
    console.error('[goArcCharSelect] Error:', e);
  }
}

/* ============================================================
   PARTY SWAP (World Map overlay)
   ============================================================ */
let _partySwapSelection = [];

function openPartySwap() {
  // Start selection from current active party
  _partySwapSelection = [...(G.selectedChars.length ? G.selectedChars : G.unlockedChars.slice(0, 4))];
  _renderPartySwapGrid();
  const overlay = document.getElementById('party-swap-overlay');
  if (overlay) overlay.classList.add('open');
}

function closePartySwap() {
  const overlay = document.getElementById('party-swap-overlay');
  if (overlay) overlay.classList.remove('open');
  // Resume map engine if we're in explore mode
  if (G.mode === 'story_explore' && typeof MapEngine !== 'undefined' && !MapEngine.isRunning()) {
    MapEngine.resume();
  }
}

function confirmPartySwap() {
  if (_partySwapSelection.length !== 4) return;
  G.selectedChars = [..._partySwapSelection];
  G.selectedChar  = G.selectedChars[0];
  buildParty();
  // Auto-save the new party composition
  if (typeof Story !== 'undefined' && Story.active) Story._doSave();
  closePartySwap();
  // Show brief confirmation toast
  if (typeof Save !== 'undefined') Save._showToast('Party updated');
}

function _renderPartySwapGrid() {
  const grid    = document.getElementById('party-swap-grid');
  const counter = document.getElementById('party-swap-counter');
  const confirm = document.getElementById('party-swap-confirm');
  if (!grid) return;

  grid.innerHTML = '';
  const unlocked = G.chars.filter(ch => G.unlockedChars.includes(ch.id));

  unlocked.forEach(ch => {
    const slotIdx  = _partySwapSelection.indexOf(ch.id);
    const isActive = slotIdx !== -1;

    const card = document.createElement('div');
    card.className = 'swap-card' + (isActive ? ' active' : '');
    card.dataset.charid = ch.id;

    const spriteId = `swap-sprite-${ch.id}`;
    card.innerHTML =
      (isActive ? `<div class="swap-card-badge">${slotIdx + 1}</div>` : '') +
      `<div class="swap-icon" style="background:${ch.portrait_color}20;border-color:${ch.portrait_color}50">
        <div id="${spriteId}" class="ui-sprite-swap"></div>
      </div>` +
      `<div class="swap-info">` +
        `<div class="swap-name">${ch.alias || ch.name}</div>` +
        `<div class="swap-title">${ch.title}</div>` +
        `<div class="swap-stats">ATK ${ch.base_stats.atk + (ch.stat_bonuses.atk||0)} · SPD ${ch.base_stats.spd + (ch.stat_bonuses.spd||0)}</div>` +
      `</div>`;

    card.addEventListener('click', () => {
      const idx = _partySwapSelection.indexOf(ch.id);
      if (idx !== -1) {
        // Deselect
        _partySwapSelection.splice(idx, 1);
      } else {
        if (_partySwapSelection.length >= 4) return; // already full
        _partySwapSelection.push(ch.id);
      }
      _renderPartySwapGrid();
    });

    grid.appendChild(card);

    // Initialize high-res sprite
    if (typeof SpriteRenderer !== 'undefined') {
      const sprEl = document.getElementById(spriteId);
      if (sprEl) SpriteRenderer.setFrame(sprEl, ch.id, 'idle', 64);
    }
  });

  const count = _partySwapSelection.length;
  if (counter) counter.textContent = `${count} / 4 selected`;
  if (confirm) confirm.disabled = count !== 4;
}

function _renderCharGrid() {
  const grid = document.getElementById('char-grid');
  grid.innerHTML = '';
  // Only show characters that are unlocked
  G.chars.filter(ch => G.unlockedChars.includes(ch.id)).forEach(ch => {
    const selIdx    = G.selectedChars.indexOf(ch.id);
    const isSelected = selIdx !== -1;
    const d = document.createElement('div');
    d.className = 'char-card' + (isSelected ? ' selected' : '');
    d.dataset.char = ch.id;
    const spriteId = `char-grid-sprite-${ch.id}`;
    d.innerHTML = `
      ${isSelected ? `<div class="char-sel-badge">${selIdx + 1}</div>` : ''}
      <div class="char-portrait" style="background:${ch.portrait_color}20;border-color:${ch.portrait_color}50">
        <div id="${spriteId}" class="ui-sprite-char-grid"></div>
      </div>
      <div class="char-info">
        <div class="char-name">${ch.alias || ch.name}</div>
        <div class="char-title">${ch.title}</div>
        <div class="char-aff">Affinity: ${ch.class_affinity.join(', ')}</div>
      </div>`;
    d.onclick = () => selectChar(ch.id);
    grid.appendChild(d);

    // Initialize high-res sprite
    if (typeof SpriteRenderer !== 'undefined') {
      const sprEl = document.getElementById(spriteId);
      if (sprEl) SpriteRenderer.setFrame(sprEl, ch.id, 'idle', 72);
    }
  });
}

function _updateCharConfirmBtn() {
  const n   = G.selectedChars.length;
  const btn = document.getElementById('char-confirm');
  const counter = document.getElementById('char-counter');
  btn.disabled  = n < 4;
  btn.textContent = n < 4 ? `SELECT ${4 - n} MORE →` : '▶ ENTER BATTLE →';
  if (counter) counter.innerHTML = `Party: <span>${n}</span> / 4`;
}

function selectChar(id) {
  const ch = G.chars.find(c => c.id === id);
  if (!ch) return;

  const idx = G.selectedChars.indexOf(id);
  if (idx !== -1) {
    G.selectedChars.splice(idx, 1);          // deselect
  } else {
    if (G.selectedChars.length >= 4) return; // already full
    G.selectedChars.push(id);
  }
  G.selectedChar = G.selectedChars[0] || null;
  _renderCharGrid();
  _updateCharConfirmBtn();

  // Use the master formula to show actual level-scaled stats in the details view
  const classId = ch.class_affinity[0] || G.classes[0].id;
  const cls = G.classes.find(c => c.id === classId) || G.classes[0];
  const s = computeStats(ch, cls);

  const detailEl = document.getElementById('char-detail');
  const spriteId = `char-detail-sprite-${id}`;
  detailEl.innerHTML = `
    <div class="char-detail-layout">
      <div class="char-detail-visual">
         <div id="${spriteId}" class="ui-sprite-char-detail"></div>
      </div>
      <div class="char-detail-text">
        <strong style="color:${ch.portrait_color}">${ch.icon} ${ch.alias || ch.name}</strong> — <em style="color:var(--text-dim)">${ch.personality}</em><br>
        ${ch.description}<br>
        <div class="stat-row">
          <span class="stat-chip">HP <span>${s.hp}</span></span>
          <span class="stat-chip">MP <span>${s.mp}</span></span>
          <span class="stat-chip">ATK <span>${s.atk}</span></span>
          <span class="stat-chip">DEF <span>${s.def}</span></span>
          <span class="stat-chip">SPD <span>${s.spd}</span></span>
          <span class="stat-chip">MAG <span>${s.mag}</span></span>
        </div>
        <span class="passive-tag">★ ${ch.passive.name}: ${ch.passive.description}</span>
      </div>
    </div>`;

  if (typeof SpriteRenderer !== 'undefined') {
    const sprEl = document.getElementById(spriteId);
    if (sprEl) SpriteRenderer.setFrame(sprEl, id, 'idle', 140);
  }
}

/* ============================================================
   CLASS SELECT
   ============================================================ */
function goClassSelect() {
  if (!G.selectedChar) return;
  showScreen('class-screen');
  const ch   = G.chars.find(c => c.id === G.selectedChar);
  const grid = document.getElementById('class-grid');
  grid.innerHTML = '';
  G.classes.forEach(cls => {
    const affinity = ch.class_affinity.includes(cls.id);
    const d = document.createElement('div');
    d.className = 'class-card' + (affinity ? ' affinity-match' : '');
    d.innerHTML = `
      <div class="class-header">
        <span class="class-icon">${cls.icon}</span>
        <div>
          <div class="class-name">${cls.name}</div>
          <div class="class-tag">${cls.tag}</div>
        </div>
      </div>
      <div style="font-size:13px;color:var(--text-dim)">${cls.description}</div>`;
    d.onclick = () => selectClass(cls.id);
    grid.appendChild(d);
  });
  document.getElementById('class-detail').innerHTML = 'Select a class to preview combined stats.';
  document.getElementById('combined-preview').style.display = 'none';
  document.getElementById('class-confirm').disabled = true;
}

function selectClass(id) {
  G.selectedClass = id;
  document.querySelectorAll('.class-card').forEach((c, i) => {
    c.classList.toggle('selected', G.classes[i].id === id);
  });
  const ch  = G.chars.find(c => c.id === G.selectedChar);
  const cls = G.classes.find(c => c.id === id);

  document.getElementById('class-detail').innerHTML = `
    <strong style="color:${cls.color}">${cls.icon} ${cls.name}</strong><br>
    Abilities: ${cls.abilities.map(a => `<span style="color:var(--blue)">${a.icon} ${a.name}</span>`).join(', ')}`;

  const combined = computeStats(ch, cls);
  const maxStat = 150;
  const labels = ['HP','MP','ATK','DEF','SPD','MAG'];
  const keys   = ['hp','mp','atk','def','spd','mag'];
  const colors = ['#22cc44','#4466ff','#ff8040','#60b0ff','#50e0d0','#b070ff'];
  document.getElementById('combined-bars').innerHTML = keys.map((k,i) => {
    const val = combined[k];
    const pct = Math.min(100, val / maxStat * 100);
    return `<div class="pbar-item">
      <span class="pbar-label">${labels[i]}</span><span class="pbar-val">${val}</span>
      <div class="pbar-bg"><div class="pbar-fill" style="width:${pct}%;background:${colors[i]}"></div></div>
    </div>`;
  }).join('');
  document.getElementById('combined-preview').style.display = 'block';
  document.getElementById('class-confirm').disabled = false;
}

/* ============================================================
   DEBUG QUICK BATTLE
   ============================================================ */
window.openDebugBattleMenu = function() {
  const overlay = document.getElementById('debug-battle-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';

  // Populate Characters
  const charOptions = G.chars.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  document.getElementById('debug-p1').innerHTML = charOptions;
  document.getElementById('debug-p2').innerHTML = charOptions;
  document.getElementById('debug-p3').innerHTML = charOptions;
  document.getElementById('debug-p4').innerHTML = charOptions;

  // Set defaults
  const defaultChars = G.unlockedChars && G.unlockedChars.length >= 4 
    ? G.unlockedChars 
    : G.chars.slice(0, 4).map(c => c.id);
  document.getElementById('debug-p1').value = defaultChars[0] || G.chars[0].id;
  document.getElementById('debug-p2').value = defaultChars[1] || G.chars[1].id;
  document.getElementById('debug-p3').value = defaultChars[2] || G.chars[2].id;
  document.getElementById('debug-p4').value = defaultChars[3] || G.chars[3].id;

  // Populate Enemies
  const enemyOptions = `<option value="">-- None --</option>` + G.enemies.map(e => `<option value="${e.id}">${e.name} (Lv.${e.lv || 1})</option>`).join('');
  document.getElementById('debug-e1').innerHTML = enemyOptions;
  document.getElementById('debug-e2').innerHTML = enemyOptions;
  document.getElementById('debug-e3').innerHTML = enemyOptions;
  document.getElementById('debug-e4').innerHTML = enemyOptions;

  if (G.enemies.length > 0) document.getElementById('debug-e1').value = G.enemies[0].id;
};

window.closeDebugBattleMenu = function() {
  const overlay = document.getElementById('debug-battle-overlay');
  if (overlay) overlay.style.display = 'none';
};

window.startDebugBattle = function() {
  const p1 = document.getElementById('debug-p1').value;
  const p2 = document.getElementById('debug-p2').value;
  const p3 = document.getElementById('debug-p3').value;
  const p4 = document.getElementById('debug-p4').value;
  const lv = parseInt(document.getElementById('debug-party-lv').value, 10) || 10;

  const e1 = document.getElementById('debug-e1').value;
  const e2 = document.getElementById('debug-e2').value;
  const e3 = document.getElementById('debug-e3').value;
  const e4 = document.getElementById('debug-e4').value;

  const enemies = [e1, e2, e3, e4].filter(Boolean);
  if (enemies.length === 0) {
    alert("Please select at least one enemy!");
    return;
  }

  // 1. Setup Party
  G.selectedChars = [p1, p2, p3, p4];
  G.selectedChar = p1;
  
  // Force level up party members
  G.selectedChars.forEach(id => {
    const ch = G.chars.find(c => c.id === id);
    if (ch) {
      ch.lv = lv;
      ch.hp = undefined;
      ch.mp = undefined;
      ch.exp = 0;
    }
  });

  if (typeof buildParty !== 'undefined') buildParty();

  // 2. Setup Enemy Group
  const enemyDefs = enemies.map(id => G.enemies.find(e => e.id === id)).filter(Boolean);
  buildEnemyGroup(enemyDefs, lv, false);

  // 3. Launch Battle
  closeDebugBattleMenu();
  if (typeof _initBattle === 'function') _initBattle();
};
