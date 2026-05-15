# Concept: Dynamic Overworld Banter
**Domain**: The Chronicler (Story) + Atlas (World)
**Status**: Concept — Not Yet Implemented
**Priority**: MEDIUM (High narrative value, low implementation complexity)

---

## Overview

The overworld is currently silent between NPC interactions. The party moves through ruins, volcanic wastes, and flooded temples without ever commenting on where they are, what just happened, or each other. **Dynamic Overworld Banter** makes the party feel *alive* — characters spontaneously deliver short 1–3 line exchanges that play in the existing dialogue box **without pausing gameplay**, triggered by the world around them.

---

## Trigger Conditions

Banter events fire based on a priority queue — only one fires at a time, and a minimum of **45 seconds** must pass between any two banter events.

| Trigger Type | Condition | Priority |
|---|---|---|
| `MAP_ENTER` | Player enters a new map region (mapId changes) | High |
| `CAMP_CLOSE` | Camp menu is closed after resting | High |
| `BOSS_DEFEATED` | A boss story flag is set | High |
| `TILE_NEAR` | Player steps within 3 tiles of a specific POI tile | Medium |
| `TIME_WINDOW` | Specific Chronos time bracket (e.g., midnight) | Medium |
| `CORRUPTION_HIGH` | World corruption > 50% | Medium |
| `IDLE` | Player has not moved for 20+ seconds | Low |

---

## Delivery System

- Banter is **non-blocking** — it appears in the dialogue box overlay for **4 seconds** with `pointer-events: none`.
- If the player interacts with anything during a banter line, it **instantly dismisses**.
- No button press is required to advance or close it.
- Speaker name appears in the dialogue panel header. Lines do not use the NPC portrait system — they are text only.

---

## Data Structure

All banter lives in `data/banter.json`. The system keys banter groups by trigger:

```json
{
  "map_enter_ember_wastes": [
    {
      "id": "banter_ember_001",
      "speakers": ["tao", "aya"],
      "lines": [
        { "speaker": "Tao", "text": "Oh, now THIS is more my speed. Everything's on fire." },
        { "speaker": "Aya", "text": "Everything is ash. Speed and ash are not the same thing, Tao." }
      ]
    }
  ],
  "time_midnight_crystal_cavern": [
    {
      "id": "banter_midnight_001",
      "speakers": ["rei"],
      "lines": [
        { "speaker": "Rei", "text": "The crystals remember the old world's light. They have been waiting, alone, for a very long time." }
      ]
    }
  ]
}
```

The engine picks a **random unused group** for each trigger key. After all groups in a key have fired, they become eligible again.
`G.shownBanter` (a `Set`) tracks which banter IDs have been shown this session to prevent immediate repeats.

---

## Example Banter Library

### Map Entry — Ember Wastes
> **Tao**: *"Oh, now THIS is more my speed. Everything's on fire."*
> **Aya**: *"Everything is ash. Speed and ash are not the same thing, Tao."*

### Midnight — Crystal Caverns
> **Rei**: *"The crystals remember the old world's light. They have been waiting, alone, for a very long time."*

### After any boss defeat
> **Drake**: *"Every time we win, it feels less like victory and more like... paying a debt I didn't know I owed."*

### Camp rest close — general
> **Lulu**: *"I used to dance for audiences of thousands. Now my audience is just you all, and the fire. I think I prefer it."*

### Map entry — Void Citadel
> **Rex**: *"I have walked through the halls of gods. This place... this place does not feel like gods were here. It feels like gods were defeated here."*

### Corruption > 50% — general
> **Sera**: *"The air is wrong. Stay close. If we lose anyone to the Void now, we won't be able to pull them back."*

### Entering Shadow Reach — Tao
> **Tao**: *"The ghosts here are different. They don't want to talk. They just want to be seen."*

### Approaching the Sunken Temple altar — Lulu + Rei
> **Lulu**: *"Something about this place feels like home. Is that strange?"*
> **Rei**: *"No. The water remembers those who belong to it."*

### Idle — Drake
> **Drake**: *"...Somewhere out there, the stars of my world are still in the same place. That thought is either comforting or terrifying. I can never decide which."*

### Entering Northern Highlands — Valka
> **Valka**: *"These peaks. This cold. Even a thousand years ago, the air here tasted like judgment."*

---

## Banter Availability Conditions

Some banter is **character-conditional** — it only fires if that character is in the active party:

```json
{
  "id": "banter_highlands_001",
  "requires_party": ["valka"],
  "lines": [...]
}
```

This ensures banter always feels relevant. Aya's reaction to the Ember Wastes does not fire if Aya is not in the party.

---

## Implementation Path

1. `data/banter.json` — new file, all banter groups indexed by trigger key
2. `js/map/map-engine.js` — trigger hooks: `MAP_ENTER`, `TIME_WINDOW`, `TILE_NEAR`, `CORRUPTION_HIGH`
3. `js/map/map-ui.js` — banter overlay renderer (`_showBanter(lines, duration)`) — non-blocking, auto-dismiss
4. `js/game.js` — `G.shownBanter` Set (session-scoped deduplication)
5. `js/map/map-ui.js` — camp close hook to fire `CAMP_CLOSE` banter
6. `js/story.js` — boss defeated hook to fire `BOSS_DEFEATED` banter
