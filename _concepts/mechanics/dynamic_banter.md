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

## Character Voice Reference

Before reading the banter library, note the voice of each character. Banter should never feel expository — it should feel like something overheard between people who know each other.

| Character | Age | Voice |
|---|---|---|
| **Aya** | 19 | Quiet, precise, graceful. Notices beauty before danger. Does not over-explain. |
| **Tao** | 20 | Dry, mischievous, deeply caring underneath. Her humor is a shield. Comfortable with death in a way that makes others uneasy. |
| **Rei** | 2000 | Minimal words. Every sentence has weight. Stoic but not cold — protective in a way that takes you by surprise. |
| **Lulu** | 18 | Warm and honest. She says what she feels without embarrassment. The most straightforwardly kind person in the party. |
| **Ria** | 25 | Thoughtful. Attentive to things others overlook. Speaks with quiet wonder. |
| **Valka** | 1000 | Principled, composed. Ancient observations delivered plainly, with no arrogance. |
| **Drake** | 28 | Conflicted, loyal. Carries something he doesn't mention. Sometimes you catch him looking at the sky. |
| **Rex** | 200 | Kingly in posture but genuinely curious about ordinary things. Being mortal surprises him constantly. |
| **Sera** | 26 | Duty-bound but not joyless. She has been carrying other people's grief for so long she forgets to name her own. |

---

## Data Structure — `data/banter.json`

```json
{
  "map_enter_verdant_vale": [
    {
      "id": "banter_vale_001",
      "requires_party": ["aya"],
      "lines": [
        { "speaker": "Aya", "text": "The flowers are gone. But the soil still knows where they were." }
      ]
    },
    {
      "id": "banter_vale_002",
      "requires_party": ["sera"],
      "lines": [
        { "speaker": "Sera", "text": "My grandmother walked this road. She described it differently." },
        { "speaker": "Sera", "text": "I think she was being kind." }
      ]
    },
    {
      "id": "banter_vale_003",
      "requires_party": ["tao"],
      "lines": [
        { "speaker": "Tao", "text": "You know what bothers me? The silence. Places like this should be loud with the living." },
        { "speaker": "Tao", "text": "It isn't." }
      ]
    }
  ],

  "map_enter_crystal_cavern": [
    {
      "id": "banter_cavern_001",
      "requires_party": ["ria"],
      "lines": [
        { "speaker": "Ria", "text": "The crystals remember sound. If you listen carefully, you can almost hear them." }
      ]
    },
    {
      "id": "banter_cavern_002",
      "requires_party": ["aya"],
      "lines": [
        { "speaker": "Aya", "text": "It is cold here, but not the cold I know. This cold has grief in it." }
      ]
    },
    {
      "id": "banter_cavern_003",
      "requires_party": ["rei"],
      "lines": [
        { "speaker": "Rei", "text": "There is something buried deep in this place. Something that was once a person." },
        { "speaker": "Rei", "text": "I can smell the years on it." }
      ]
    }
  ],

  "camp_close_general": [
    {
      "id": "banter_camp_001",
      "requires_party": ["lulu"],
      "lines": [
        { "speaker": "Lulu", "text": "The fire is almost out. I don't mind." },
        { "speaker": "Lulu", "text": "I used to need an audience. I think I outgrew it." }
      ]
    },
    {
      "id": "banter_camp_002",
      "requires_party": ["rei"],
      "lines": [
        { "speaker": "Rei", "text": "You slept. Good." }
      ]
    },
    {
      "id": "banter_camp_003",
      "requires_party": ["tao"],
      "lines": [
        { "speaker": "Tao", "text": "I wrote a small poem last night. About the ash." },
        { "speaker": "Tao", "text": "It was honestly pretty good. I'm not going to share it." }
      ]
    },
    {
      "id": "banter_camp_004",
      "requires_party": ["drake"],
      "lines": [
        { "speaker": "Drake", "text": "I dreamed about my kingdom again." },
        { "speaker": "Drake", "text": "It was good. I'm glad I remembered it before waking." }
      ]
    }
  ],

  "boss_defeated_void_knight": [
    {
      "id": "banter_void_knight_001",
      "requires_party": ["tao"],
      "lines": [
        { "speaker": "Tao", "text": "He had a name before all of this." },
        { "speaker": "Tao", "text": "I hope someone still knows it." }
      ]
    },
    {
      "id": "banter_void_knight_002",
      "requires_party": ["rei"],
      "lines": [
        { "speaker": "Rei", "text": "He did not want to fight. I could feel it in each swing." },
        { "speaker": "Rei", "text": "That does not make it easier. It makes it worse." }
      ]
    }
  ],

  "boss_defeated_galdor_king": [
    {
      "id": "banter_galdor_001",
      "requires_party": ["sera"],
      "lines": [
        { "speaker": "Sera", "text": "The Azure records say he was a fair king. Once." },
        { "speaker": "Sera", "text": "I believe that. Looking at him. I believe it." }
      ]
    }
  ],

  "boss_defeated_demon_lord": [
    {
      "id": "banter_demon_lord_001",
      "requires_party": ["aya"],
      "lines": [
        { "speaker": "Aya", "text": "He never stopped reaching for it. Even at the very end." }
      ]
    },
    {
      "id": "banter_demon_lord_002",
      "requires_party": ["ria"],
      "lines": [
        { "speaker": "Ria", "text": "He wanted to know everything. There's nothing wrong with that." },
        { "speaker": "Ria", "text": "The Void just found him before wisdom did." }
      ]
    }
  ],

  "time_midnight_general": [
    {
      "id": "banter_midnight_001",
      "requires_party": ["rei"],
      "lines": [
        { "speaker": "Rei", "text": "Two thousand years. The dark always looks the same." },
        { "speaker": "Rei", "text": "And yet I am still surprised by it." }
      ]
    },
    {
      "id": "banter_midnight_002",
      "requires_party": ["valka"],
      "lines": [
        { "speaker": "Valka", "text": "The stars here are arranged wrong." },
        { "speaker": "Valka", "text": "I have been trying to name them anyway." }
      ]
    }
  ],

  "corruption_high": [
    {
      "id": "banter_corruption_001",
      "requires_party": ["tao"],
      "lines": [
        { "speaker": "Tao", "text": "The Void is talkative today." },
        { "speaker": "Tao", "text": "I'm not answering it." }
      ]
    },
    {
      "id": "banter_corruption_002",
      "requires_party": ["sera"],
      "lines": [
        { "speaker": "Sera", "text": "Stay close. The air is wrong here — I can feel it in the armor." }
      ]
    }
  ],

  "idle_general": [
    {
      "id": "banter_idle_001",
      "requires_party": ["drake"],
      "lines": [
        { "speaker": "Drake", "text": "The constellations in my world had different names." },
        { "speaker": "Drake", "text": "I've been looking for ones I recognize. Not yet." }
      ]
    },
    {
      "id": "banter_idle_002",
      "requires_party": ["aya"],
      "lines": [
        { "speaker": "Aya", "text": "..." },
        { "speaker": "Aya", "text": "The wind just changed direction. Something is moving, far away." }
      ]
    },
    {
      "id": "banter_idle_003",
      "requires_party": ["rex"],
      "lines": [
        { "speaker": "Rex", "text": "I led two hundred years of council meetings." },
        { "speaker": "Rex", "text": "Standing still like this is somehow harder." }
      ]
    }
  ],

  "preset_loaded": [
    {
      "id": "banter_preset_rex",
      "requires_party": ["rex"],
      "lines": [
        { "speaker": "Rex", "text": "Formation set. The doctrine holds." }
      ]
    },
    {
      "id": "banter_preset_valka",
      "requires_party": ["valka"],
      "lines": [
        { "speaker": "Valka", "text": "This arrangement will do." }
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
