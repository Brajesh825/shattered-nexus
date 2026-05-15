# Concept: Chronos-Gated Events & The Nexus Calendar
**Domain**: Atlas (Worldbuilder) + The Chronicler (Story) + Vivid (Visual)
**Status**: Concept — Not Yet Implemented
**Priority**: MEDIUM (extends existing ChronosEngine)

> [!NOTE]
> This concept extends the existing `js/systems/chronos-engine.js` and `G.nexusTime` (0.0–24.0) global state. It does **not** replace or conflict with the existing 24-hour atmospheric cycle.

---

## Overview

The `ChronosEngine` already tracks a real-world 24-minute day cycle. But the Nexus world has *bigger rhythms* — tidal cycles, celestial alignments, and the corrupted echoes of ancient calendars. The **Nexus Calendar** introduces a **7-day in-game week** (one Nexus Day = one real-world play session start), each with a distinct name, atmospheric shift, and mechanical modifier. On **Day 7**, a rare wandering merchant appears — *the Drifter* — carrying goods unavailable anywhere else in the world.

---

## The Nexus Week

| Day | Name | Atmospheric Shift | Mechanical Effect |
|---|---|---|---|
| 1 | **The Waking** | Clear skies, warm golden noon | +10% EXP from all battle victories |
| 2 | **The Ember Day** | Permanent red-orange dusk filter | Fire element enemies +15% encounter rate; Fire abilities +10% damage |
| 3 | **The Still** | Heavy, oppressive fog overlay | All enemy SPD −3; patrol NPCs move 50% slower; sneaking is easier |
| 4 | **The Tide** | Persistent rain; Chronos shifts wetter | All water/hydro abilities +20% power; Rumor Board has 2 bonus entries |
| 5 | **The Void Day** | World corruption baseline +10% | Dark Altar pre-unlocked for the session; Void enemies +20% material drop rate |
| 6 | **The Bright** | Permanent blazing white noon; no night | All healing +15%; Bond event criteria minLevel reduced by −2 for today only |
| 7 | **The Silence** | Starfield visible through the ground; no music | **The Drifter** appears at all campfire safe zones; ambient track replaces BGM |

---

## Nexus Day Tracking

- `G.nexusDay` (1–7, stored in save state) increments each time the game is loaded fresh (new session).
- A small **constellation icon** in the top HUD changes daily, indicating the current day.
- The day name appears as a brief notification on session load: *"✦ The Silence — Day 7"*
- Day resets to 1 after Day 7.

---

## The Drifter (Day 7 NPC)

On **The Silence**, a mysterious traveler materializes at all campfire safe zones — no explanation, no lore introduction. He simply says: *"I carry what the world forgot. Take what you need."*

### Exclusive Stock (Rotating)
| Item Type | Details |
|---|---|
| 1× Void-Touched ★★★★★ Weapon | Rotating — different weapon each Silence. Cannot be found elsewhere. |
| 2× Rare Synthesis Catalyst | At 50% of standard gold cost |
| 1× "Yesterday's Goods" | A random cheap item with a 10% hidden chance of being a very rare relic |
| Memoria Shard Clue | A vague poem that hints at the location of 1 uncollected Memoria Shard |

### The Drifter's Personality
He never answers direct questions about himself. His dialogue is brief, cryptic, and warm — the opposite of threatening. He exists outside the story. Even Rex cannot place him.

> *"You've come far. The Silence tends to find those who are ready for what comes next."*

---

## Visual Treatment

### Day 7 — The Silence
- The explore canvas background shifts to show a slow **upward-drifting star-field** particle layer.
- Background music stops entirely, replaced by a soft ambient track (`ambient_silence.mp3`).
- The Drifter NPC uses a unique sprite: a cloaked figure with a gently pulsing golden outline.
- His campfire-side appearance is preceded by a **single golden light particle** that descends from the sky to his spawn tile.

### Daily HUD Indicator
A small icon in the top-left of the explore screen displays:
- Day 1–6: A constellation shape that evolves each day
- Day 7: A starfield fragment that slowly rotates

---

## Implementation Path

1. `js/systems/chronos-engine.js` — extend with `nexusDay` tracking; increment on session load
2. `js/game.js` — `G.nexusDay` state (persisted in save)
3. `data/npcs.js` — The Drifter NPC definition; conditional spawn `if (G.nexusDay === 7)`
4. `js/map/map-engine.js` — Day 7 ambient BGM swap; star-field particle layer
5. `js/map/map-ui.js` — HUD day indicator widget
6. `css/map.css` — per-day atmospheric CSS variable overrides; star-field animation
7. `data/drifter_stock.json` — Drifter's rotating inventory (7 entries, one per Silence cycle)
