# Concept: Dynamic Overworld Banter
**Domain**: The Chronicler (Story) + Atlas (World)
**Status**: Concept — Detailed Implementation Plan Ready
**Priority**: MEDIUM (High narrative value, LOW implementation complexity)
**Arc Scope**: Arc 1+ (Available from session 1)

---

## Overview

The overworld is silent between NPC interactions. The party moves through ruins, volcanic wastes, and flooded temples without ever commenting on where they are, what just happened, or each other. **Dynamic Overworld Banter** makes the party feel *alive* — characters deliver short 1–3 line exchanges in the existing notification banner, **without pausing gameplay**, triggered by the world around them.

---

## Pre-Implementation Audit

| System | Exists? | Detail |
|---|---|---|
| `MapUI.showMsg(text, durationMs, cb)` | ✅ **Yes** | `map-ui.js:41` — renders into `#explore-notif` with auto-dismiss. **Perfect base for banter.** |
| `#explore-notif` DOM element | ✅ **Yes** | `index.html:916`. Already styled in `map.css:1220`. Gold notification banner inside canvas wrap. |
| Multi-line speaker dialogue on map | ❌ **None** | Must be built, but layered on top of existing `showMsg` via chained callbacks. |
| Existing banter/idle dialogue | ❌ **None** | Zero instances of `banter` keyword found anywhere in the codebase. |

**Conclusion**: `showMsg` + `#explore-notif` are the foundation. No new DOM required.

---

## Trigger System

A banter event fires when one of these conditions is met. A minimum **45-second cooldown** between any two events prevents spam.

| Trigger Key | Condition | Priority |
|---|---|---|
| `map_enter_{mapId}` | `mapId` changes (new region entered) | High |
| `camp_close_general` | Camp menu is closed after resting | High |
| `boss_defeated_{bossId}` | A boss story flag is set in `story.js` | High |
| `tile_near_{tileId}` | Player steps within 3 tiles of a POI tile | Medium |
| `time_midnight_general` | Chronos time window: 22:00–02:00 | Medium |
| `corruption_high` | `G.corruption > 50%` | Medium |
| `idle_general` | Player has not moved for 20+ seconds | Low |

---

## Data Structure — `data/banter.json`

```json
{
  "map_enter_verdant_vale": [
    {
      "id": "banter_vale_001",
      "requires_party": [],
      "lines": [
        { "speaker": "Tao", "text": "So this is the Verdant Vale. Or... what's left of it." },
        { "speaker": "Aya", "text": "It smelled like cherry blossoms once. The lore says so." }
      ]
    },
    {
      "id": "banter_vale_002",
      "requires_party": ["rei"],
      "lines": [
        { "speaker": "Rei", "text": "These ruins are old. Older than the Rift. Whatever was here... it chose to stay." }
      ]
    }
  ],
  "camp_close_general": [
    {
      "id": "banter_camp_001",
      "requires_party": ["lulu"],
      "lines": [
        { "speaker": "Lulu", "text": "I used to dance for audiences of thousands. Now my audience is just you all, and the fire. I think I prefer it." }
      ]
    },
    {
      "id": "banter_camp_002",
      "requires_party": ["rei"],
      "lines": [
        { "speaker": "Rei", "text": "Rest when you can. The next path will not rest for you." }
      ]
    }
  ],
  "boss_defeated_void_knight": [
    {
      "id": "banter_void_knight_001",
      "requires_party": [],
      "lines": [
        { "speaker": "Tao", "text": "...He was just a soldier. Someone's soldier." },
        { "speaker": "Rei", "text": "All the worst things in this world were, once." }
      ]
    }
  ],
  "boss_defeated_demon_lord": [
    {
      "id": "banter_demon_lord_001",
      "requires_party": [],
      "lines": [
        { "speaker": "Aya", "text": "He was searching for something, until the very end. I could see it." },
        { "speaker": "Tao", "text": "Knowledge. The Void took what he loved most and made it his cage." }
      ]
    }
  ]
}
```

**Arc 1–2 minimum entries to write:**
- `map_enter_verdant_vale` — 2 groups
- `map_enter_crystal_cavern` — 2 groups
- `camp_close_general` — 3 groups (Lulu, Rei solo, Tao)
- `boss_defeated_void_knight` — 1 group
- `boss_defeated_demon_lord` — 1 group
- `time_midnight_general` — 1 group (Rei)
- `idle_general` — 2 groups (Drake, Aya)

---

## Implementation Path

### Step 1 — `js/data-loader.js`
Fetch `data/banter.json` → `window.BANTER_DATA` alongside existing data assets.

### Step 2 — `js/game.js`
```javascript
G.shownBanter = new Set(); // session-scoped, not save-persisted
```

### Step 3 — `js/map/map-ui.js` — Core Functions
Add below existing `showMsg`:

```javascript
let _banterCooldown = false;
let _idleTimer = 0;

function _showBanter(groupKey) {
  if (!window.BANTER_DATA || _banterCooldown) return;
  const groups = window.BANTER_DATA[groupKey] || [];
  const eligible = groups.filter(g => {
    if (G.shownBanter.has(g.id)) return false;
    if (g.requires_party?.length)
      return g.requires_party.every(id => G.party.some(m => m.id === id));
    return true;
  });
  if (!eligible.length) return;
  const group = eligible[Math.floor(Math.random() * eligible.length)];
  G.shownBanter.add(group.id);
  _banterCooldown = true;
  _playBanterLines(group.lines, 0);
}

function _playBanterLines(lines, idx) {
  if (idx >= lines.length) {
    setTimeout(() => { _banterCooldown = false; }, 45000); // 45s cooldown
    return;
  }
  const line = lines[idx];
  showMsg(`${line.speaker}: "${line.text}"`, 4000, () => _playBanterLines(lines, idx + 1));
}
```

### Step 4 — Wire Triggers

**`map_enter_*`** — in map-load callback (after `mapId` change):
```javascript
setTimeout(() => MapUI._showBanter(`map_enter_${currentMapId}`), 2000);
```

**`camp_close_general`** — end of `closeCampMenu()`:
```javascript
setTimeout(() => MapUI._showBanter('camp_close_general'), 500);
```

**`boss_defeated_*`** — in `js/story.js` post-boss callback:
```javascript
if (typeof MapUI !== 'undefined') MapUI._showBanter(`boss_defeated_${bossId}`);
```

**`idle_general`** — in `MapUI.update(dt)`:
```javascript
_idleTimer += dt;
if (_idleTimer > 20) { _idleTimer = 0; MapUI._showBanter('idle_general'); }
// Reset _idleTimer = 0 on any player movement
```

### Step 5 — `sw.js`
- Add `./data/banter.json` to `SHELL_ASSETS`
- Bump `CACHE_NAME`

---

## Files Modified

| File | Change |
|---|---|
| `data/banter.json` | **NEW** — all banter groups |
| `js/data-loader.js` | Fetch BANTER_DATA |
| `js/map/map-ui.js` | `_showBanter`, `_playBanterLines`, `_idleTimer`, trigger hooks in `closeCampMenu` |
| `js/story.js` | Post-boss `_showBanter` call |
| `js/game.js` | `G.shownBanter` initialization |
| `sw.js` | SHELL_ASSETS + CACHE_NAME bump |
