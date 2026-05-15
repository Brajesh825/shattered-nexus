# Concept: Party Formation Presets
**Domain**: Aethon (Architect) + Aegis (Combat Systems)
**Status**: Concept — Detailed Implementation Plan Ready
**Priority**: LOW (Quality of Life)
**Arc Scope**: Arc 1+ (Available from session 1, no gating)

---

## Overview

By mid-game, players manage 5–6 characters and frequently reorganize their Diamond Formation for different situations. **Formation Presets** save, name, and instantly recall up to 4 party configurations ("Battle Doctrines"). Available from the first Camp visit. Works with as few as 2 characters.

---

## Pre-Implementation Audit

| System | Exists? | Detail |
|---|---|---|
| `G.party[]` source of truth | ✅ **Yes** | Array of active party member objects. Setting it and calling `Party.buildParty()` fully reconfigures the party. |
| `party.js#buildParty()` | ✅ **Yes** | `party.js:74` — rebuilds all party stats and relics from `G.party`. This is the "load" action. |
| `map-ui.js#campChangeParty()` | ✅ **Yes** | `map-ui.js:358` — opens party change menu. Presets can sit beside it in the camp panel. |
| `G.formationPresets` | ❌ **Missing** | Does not exist. Must add to `G` initializer and save serialization. |
| Preset save/load functions | ❌ **Missing** | No functions in `party.js` for preset operations. |
| Formations overlay UI | ❌ **Missing** | No DOM element. Must build. |

---

## The Diamond Formation Positions (Reference)

```
       [1] Front — +30% physical evasion
      /                              \
  [2] Vanguard                  [3] Flank
  (Intercepts single-target)    (Flanking bonus on some skills)
      \                              /
          [4] Rear — Protected
```

Slot positions 1–4 are stored per preset. Loading a preset sets both *who* is in the party and *where* they stand.

---

## Data Structure

```javascript
// G.formationPresets — stored in save file
G.formationPresets = [
  {
    name: "Boss Killer",
    party: [
      { charId: "aya",   slot: 1 },
      { charId: "rei",   slot: 2 },
      { charId: "tao",   slot: 3 },
      { charId: "drake", slot: 4 }
    ]
  },
  null, // empty slot
  null,
  null
];
```

---

## Implementation Path

### Step 1 — `js/game.js`

```javascript
G.formationPresets = [null, null, null, null];
```
Add `formationPresets` to `Save.patch` serialization and to save-load restore.

### Step 2 — `js/systems/party.js` — New Functions

```javascript
function saveFormationPreset(slotIndex, name) {
  if (slotIndex < 0 || slotIndex > 3) return;
  G.formationPresets[slotIndex] = {
    name: name || G.formationPresets[slotIndex]?.name || `Doctrine ${slotIndex + 1}`,
    party: G.party.map((m, idx) => ({ charId: m.id, slot: idx + 1 }))
  };
  if (typeof Save !== 'undefined') Save.patch({ formationPresets: G.formationPresets });
}

function loadFormationPreset(slotIndex) {
  const preset = G.formationPresets[slotIndex];
  if (!preset) return false;
  const chars = window.CHAR_DATA || [];
  const rebuilt = preset.party.map(p => {
    const base = chars.find(c => c.id === p.charId);
    return base ? { ...base } : null;
  }).filter(Boolean);
  if (!rebuilt.length) return false;
  G.party = rebuilt;
  buildParty();
  return true;
}
```

Export both in the `return` block.

### Step 3 — `index.html` — Formations Overlay DOM

```html
<div id="formations-overlay" style="display:none; position:fixed; inset:0;
     background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center;">
  <div class="formations-panel glassmorphic">
    <div class="formations-title">⚙️ BATTLE DOCTRINES</div>
    <div id="formations-slots"></div>
    <button class="camp-btn" onclick="MapUI.closeFormations()" style="margin-top:16px;">✕ CLOSE</button>
  </div>
</div>
```

Add `[⚙️ FORMATIONS]` button inside the existing camp panel, below `[CHANGE PARTY]`:
```html
<button id="camp-btn-formations" class="camp-btn" onclick="MapUI.openFormations()">⚙️ FORMATIONS</button>
```

### Step 4 — `js/map/map-ui.js` — UI Functions

```javascript
function openFormations() {
  const el = document.getElementById('formations-overlay');
  if (el) { el.style.display = 'flex'; _renderFormationSlots(); }
  if (typeof Focus !== 'undefined') Focus.setContext('formations-overlay');
}

function closeFormations() {
  const el = document.getElementById('formations-overlay');
  if (el) el.style.display = 'none';
  if (typeof Focus !== 'undefined') Focus.setContext('camp-menu');
}

function _renderFormationSlots() {
  const container = document.getElementById('formations-slots');
  if (!container) return;
  container.innerHTML = '';
  G.formationPresets.forEach((preset, i) => {
    const card = document.createElement('div');
    card.className = 'doctrine-card' + (preset ? ' filled' : ' empty');
    if (preset) {
      card.innerHTML = `
        <div class="dc-name">${preset.name}</div>
        <div class="dc-chars">${preset.party.map(p => p.charId).join(' · ')}</div>
        <div class="dc-actions">
          <button class="dc-btn" onclick="Party.loadFormationPreset(${i}); MapUI._renderFormationSlots(); MapUI.showMsg('Doctrine loaded.', 1500)">LOAD</button>
          <button class="dc-btn" onclick="Party.saveFormationPreset(${i}); MapUI._renderFormationSlots(); MapUI.showMsg('Doctrine saved.', 1500)">OVERWRITE</button>
          <button class="dc-btn danger" onclick="G.formationPresets[${i}]=null; MapUI._renderFormationSlots()">✕</button>
        </div>`;
    } else {
      card.innerHTML = `
        <div class="dc-empty">Empty Doctrine</div>
        <button class="dc-btn" onclick="Party.saveFormationPreset(${i}); MapUI._renderFormationSlots(); MapUI.showMsg('Doctrine saved.', 1500)">SAVE CURRENT</button>`;
    }
    container.appendChild(card);
  });
}
```

Export `openFormations`, `closeFormations`, `_renderFormationSlots` in the return block.

### Step 5 — `css/map.css` — Doctrine Card Styles

```css
.formations-panel {
  background: rgba(5, 4, 22, 0.95);
  border: 1px solid rgba(144, 128, 224, 0.3);
  border-radius: 16px;
  padding: 24px;
  min-width: 320px;
  backdrop-filter: blur(12px);
}
.formations-title {
  font-family: var(--vt);
  color: var(--gold);
  font-size: 16px;
  letter-spacing: 3px;
  margin-bottom: 16px;
  text-align: center;
}
.doctrine-card {
  border: 1px solid rgba(144, 128, 224, 0.2);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 10px;
  background: rgba(255,255,255,0.03);
  transition: border-color 0.2s;
}
.doctrine-card.filled { border-color: rgba(245, 208, 96, 0.35); }
.dc-name { font-family: var(--vt); color: var(--gold); font-size: 13px; margin-bottom: 4px; }
.dc-chars { font-size: 11px; color: var(--text-dim); letter-spacing: 1px; margin-bottom: 8px; }
.dc-empty { color: var(--text-dim); font-style: italic; font-size: 12px; margin-bottom: 8px; }
.dc-actions { display: flex; gap: 6px; }
.dc-btn { font-family: var(--vt); font-size: 10px; padding: 4px 10px;
           border: 1px solid rgba(144,128,224,0.4); border-radius: 6px;
           background: transparent; color: var(--text); cursor: pointer;
           transition: background 0.15s; }
.dc-btn:hover { background: rgba(144,128,224,0.2); }
.dc-btn.danger { border-color: rgba(239,68,68,0.4); color: rgba(239,68,68,0.8); }
```

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Character in preset not yet unlocked | Show ❓ on that slot's charId. Disable LOAD button for that slot with tooltip. |
| Fewer than 4 chars unlocked | Preset saves with current party count. Shows `—` for empty slots. |
| Party fully KO'd in preset | Preset loads; KO'd members placed at 1HP. Game will prompt heal at next camp. |

---

## Lore Note (Rex's Doctrine Banter)

Rex's banter line `"Formation set. The doctrine holds."` fires via the **Dynamic Banter** system, triggered by `PRESET_LOADED` key — not hardcoded here. Add entry in `data/banter.json`:
```json
"preset_loaded": [
  { "id": "banter_preset_rex", "requires_party": ["rex"],
    "lines": [{ "speaker": "Rex", "text": "Formation set. The doctrine holds." }] }
]
```

---

## Files Modified

| File | Change |
|---|---|
| `js/game.js` | `G.formationPresets = [null,null,null,null]` + save serialization |
| `js/systems/party.js` | `saveFormationPreset(slot, name)`, `loadFormationPreset(slot)` |
| `js/map/map-ui.js` | `openFormations`, `closeFormations`, `_renderFormationSlots` |
| `index.html` | Formations overlay DOM + `[⚙️ FORMATIONS]` camp button |
| `css/map.css` | `.formations-panel`, `.doctrine-card`, `.dc-btn` styles |
| `data/banter.json` | `preset_loaded` banter entry for Rex/Valka |
| `sw.js` | CACHE_NAME bump |
