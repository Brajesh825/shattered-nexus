# Concept: Memoria Shards — Collectible World Flashbacks
**Domain**: The Chronicler (Story) + Atlas (World) + Vivid (Visual)
**Status**: Concept — Not Yet Implemented
**Priority**: MEDIUM

---

## Overview

The Shattered Nexus is a broken world — civilizations, people, and entire timelines were violently interrupted when Valdris tore the world open. **Memoria Shards** are crystallized fragments of that lost past, scattered across the world like emotional debris. Finding one does not give the player an item. It gives them a *memory that is not theirs.*

---

## Shard Locations

There are **40 Memoria Shards** total, distributed across all 8 arcs. They are hidden in:

- **Behind false walls** — specific tile interactions on the exploration map
- **Inside breakable environmental objects** — cracked urns, collapsed pillars on specific tiles
- **As rare Elite enemy drops** — named Elites only, not standard enemies
- **As Rumor Board investigation rewards** — 5 shards tied to Rumor resolutions

---

## What Happens When You Find One

Finding a Shard triggers a **15–25 second cinematic flashback** — a black-and-white dialogue cutscene showing a moment from *before the Rift*. No UI. No health bars. Just two characters in a world that no longer exists.

These are not main story scenes. They are **quiet, human moments**:

- *A scholar and his student arguing about the nature of ley lines, laughing.*
- *A soldier writing a letter home, describing the smell of the Verdant Vale before the ash came.*
- *Vermithrax, still half-human, watching the mountain dragons fly at sunrise, alone on the peak.*
- *General Vane eating dinner with his soldiers the night before Valdris arrived at the gate.*
- *The Architect, full-bodied and alive, watching a thunderstorm from the sky fortress balcony.*

---

## Lore-to-Boss Connection

Finding a Memoria Shard tied to a specific boss *before* fighting that boss unlocks a unique pre-battle dialogue:

| Shard | Boss | Unique Pre-Battle Line |
|---|---|---|
| Architect's Shard | The Storm Sentinel | Aya: *"I think I understand what you tried to do now. I'm sorry it came to this."* |
| Vane's Shard | The Ebon Champion | Rei: *"I can feel your anger inside the armor. Hold on a little longer. We'll free you."* |
| Kaelen's Shard | The Pale King | Tao: *"You were actually kind, once. I saw it. Let me give that back to you."* |
| Vermithrax's Shard | The Skeletal Maw | Drake: *"I know what you sacrificed. I will not let it have been for nothing."* |

---

## Mechanical Rewards

Collecting Shards rewards a **flat, party-wide passive bonus**:

| Milestone | Reward |
|---|---|
| 5 Shards | +2 SPD (party) |
| 10 Shards | +2 LCK (party) |
| 15 Shards | +2 MAG (party) |
| 20 Shards | +10 HP (party) |
| 25 Shards | +5 MP (party) |
| 30 Shards | +2 DEF (party) |
| 35 Shards | +2 ATK (party) |
| 40/40 Shards | **Memoria Seal** relic (+5 to ALL stats, unique, non-craftable) |

---

## Visual Treatment

- Shards appear as a **single shimmer of color** in the environment — visible only during specific Chronos windows:
  - **Dawn**: Gold shards pulse faintly
  - **Midnight**: Void shards emit a soft indigo glow
- The flashback uses `filter: grayscale(1) contrast(1.2)` with a subtle film-grain CSS animation
- Shard collection triggers a brief **freeze-frame spiral** particle effect before the cutscene begins

---

## Implementation Path

1. `data/memoria.json` — shard definitions, trigger conditions, dialogue lines
2. `js/map/map-entities.js` — shard pickup trigger + collision
3. `js/cutscene.js` — flashback renderer (extend existing cutscene logic)
4. `js/game.js` — `G.memoriaShards` Set (collection state, persisted in save)
5. `js/battle/combat-engine.js` — pre-battle dialogue hook for boss shard check
6. `css/map.css` — shard shimmer particle animation
