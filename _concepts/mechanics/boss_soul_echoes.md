# Concept: Boss Soul Echoes — Post-Victory Challenges
**Domain**: Aegis (Combat Balance) + The Chronicler (Story) + Vivid (Visual)
**Status**: Concept — Not Yet Implemented
**Priority**: LOW-MEDIUM (Endgame replayability)

---

## Overview

After a boss is defeated and the story has moved on, their location on the map becomes a dead zone — a cleared tile with no further purpose. **Boss Soul Echoes** transform these abandoned arenas into **optional endgame re-challenges**: ghostly, harder versions of the fight that reward deep lore and rare endgame materials.

An Echo is not the same boss. It is a **void imprint** of the fight's most intense moment — what the boss would have been capable of if the Void had not also been limiting them.

---

## Trigger

After a boss is defeated, their tile spawns a **`void_echo` interaction point** on the player's next visit to that map. This is a slow-rotating void portal — visually distinct from any other map tile. Interacting with it shows a brief description:

> *"A void imprint lingers here. Something unfinished waits inside."*
> `[ENTER THE ECHO]` / `[LEAVE]`

---

## The Echo Battle Rules

| Rule | Detail |
|---|---|
| **Stats** | Boss returns at **120% of original stats** (all stats, including HP, ATK, DEF) |
| **Phase Start** | Boss begins at **Phase 2** immediately (no Phase 1 warm-up) |
| **Mutant Traits** | **3 random mutant traits guaranteed** from the start (Vampiric, Enraged, etc.) |
| **Party Reversion** | Party's stats are **temporarily scaled down** to the level they were at during the original fight (not their current level). Restored after the Echo. |
| **No Retry** | If the party is wiped, the Echo remains available to try again. But there is no mid-Echo save. |

The party reversion is the core design principle: no power-creeping past old content. The Echo forces players to replay the original fight *at its intended difficulty*, but with the boss's difficulty ceiling raised.

---

## The Echo Roster

| Boss | Echo Name | Level Reversion | Unique Soul Relic Drop |
|---|---|---|---|
| Void Knight (Arc 1) | *Echo of the Last Gate* | Lv. 10 | *Arren's Oath* — a letter home Arren never sent |
| Spectral Guardian (Arc 2) | *Echo of the Crystal Mind* | Lv. 18 | *Shattered Resonance* — a page from a lost spell theory |
| The Pale King (Arc 6) | *Echo of Kaelen's Logic* | Lv. 40 | *Pale Logic Fragment* — key item for Eternity Loop crafting |
| The Ebon Champion (Arc 6) | *Echo of Vane's Last Stand* | Lv. 42 | *The Oath Unbroken* — Vane's final service record |
| The Skeletal Maw (Arc 6) | *Echo of Vermithrax* | Lv. 44 | *Dragon's Last Breath* — a crystalline scale infused with highland memory |
| The Storm Sentinel (Arc 6) | *Echo of the Architect* | Lv. 46 | *Storm Codex Fragment* — the Architect's weather grid blueprint |

---

## Soul Relics

Soul Relics are **not equippable combat items**. They are **lore museum pieces** that unlock a full narrative chapter in the Hollow Archive:

- *Arren's Oath* → Unlocks "A Commander's Last Letter" in the Codex of Worlds → Verdant Vale section
- *Pale Logic Fragment* → Required ingredient for the **Eternity Loop** relic (absolute endgame chase item). It has both lore and mechanical value.

---

## Visual Treatment

### The Echo Portal (Map)
- Semi-transparent, slowly counter-rotating void portal at the boss tile
- Pulsing color: `hsl(280, 80%, 30%)` — deep void purple
- Particle wisps drift inward toward the center, never outward
- `filter: blur(0px) drop-shadow(0 0 12px rgba(120, 0, 200, 0.8))`

### The Echo Boss Sprite
- The boss sprite is rendered with: `filter: grayscale(0.6) brightness(0.85) drop-shadow(0 0 15px rgba(100, 0, 180, 0.7))`
- Ghostly, washed-out, but still terrifying
- A faint void shimmer overlay animates across the sprite every 3 seconds

### Echo Pre-Battle Cinematic
A brief 3-line narration plays before the Echo fight begins:

> *"The Void does not forget. It preserves."*
> *"What you defeated was a prison. What you face now... is the prisoner."*
> *"Proceed?"*

---

## Aegis Balance Notes

- The 120% stat boost + Phase 2 start + 3 mutant traits creates a **genuinely harder fight** without inflating beyond the `8.0x` passive cap.
- Party reversion prevents any trivial cheese from power-creeping. The fight is exactly as hard as it was intended to be at that story point.
- Soul Relics have **no direct combat stats**, so they do not impact Aegis's balance framework.

---

## Implementation Path

1. `js/map/map-entities.js` — void portal spawn trigger after boss flag is set
2. `js/map/map-engine.js` — `void_echo` tile interaction handler
3. `data/enemies.json` — `echo` variant definitions for each boss (120% stats, Phase 2 start flag)
4. `js/battle/combat-engine.js` — temporary party stat reversion on Echo battle start; restore on exit
5. `js/battle/action-handler.js` — guaranteed mutant trait injection for Echo encounters
6. `data/soul_relics.json` — new file, Soul Relic lore entries and Archive unlock mappings
7. `js/ui/archive-ui.js` — Soul Relic deposit into Hollow Archive codex
8. `css/map.css` — void portal animation styles
