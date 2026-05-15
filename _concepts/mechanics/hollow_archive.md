# Concept: The Hollow Archive — In-Game Lore Codex
**Domain**: The Chronicler (Story) + Vivid (Visual)
**Status**: Concept — Not Yet Implemented
**Priority**: LOW-MEDIUM

---

## Overview

The game already holds `lore_fragments.json` — 68KB of world-building content. The existing `archive-ui.js` provides a framework, but lore is currently collected and then sits inert. The **Hollow Archive** transforms lore collection into an act of *world reconstruction* — a premium in-game codex that gives players a reason to seek out every Lore Fragment, Memoria Shard, and defeated boss.

---

## Access Point

Accessible from the **Camp Menu** via a new `[📖 THE ARCHIVE]` button (appears after the party collects their first Lore Fragment or Memoria Shard — it is hidden before then).

---

## The Three Sections

### 1. Bestiary
Every enemy type the party has encountered populates a new entry. The entry fills in progressively with more detail the more times that enemy type is defeated:

| Kill Count | Entry Detail |
|---|---|
| 1st Kill | Name, element, approximate HP range |
| 5th Kill | Weakness, passive trait (if any), drop table |
| 15th Kill | Full lore paragraph. Flavor quote. |
| 25th Kill | "Mastered" badge. Entry highlighted in gold. |

### 2. Codex of Worlds
Lore Fragments organized by region. Each region starts as a blank page with a faded illustration and a `0 / X Fragments` counter. As fragments are collected, text entries fill in organically.

Each region's Codex has a **% Completion Bar**. At 100%, the page glows and a **Completionist Reward** unlocks.

### 3. Memories
Every Memoria Shard collected appears here as a titled, timestamped entry. The player can **replay** the flashback cutscene from this panel at any time. Entries are organized chronologically by in-world era (pre-Rift → Rift Event → Present).

---

## Completionist Rewards (Per Region)

| Region | 100% Codex | Reward |
|---|---|---|
| Verdant Vale | Full regional history | +10% EXP gain in Verdant Vale |
| Crystal Caverns | Full engineering schematics | Hazard tiles in the Caverns no longer affect the party |
| Ember Wastes | Full volcanic lore | Fire damage enemies deal −10% damage to party in this region |
| Sunken Temple | Full Archpriest history | Lulu gains +15% healing effectiveness in the Temple |
| Void Citadel | Full Valdris analysis | Boss gives 1 turn of warning before their Phase transition attack |

---

## Visual Treatment (Vivid's Domain)

- **Overall Aesthetic**: A cracked ancient tome. Pages are partially burnt at the edges, with golden ink.
- **Typography**: `font-family: 'Cinzel', serif` for region headers. `'Crimson Pro', Georgia, serif` for body text.
- **Parchment Texture**: `background: radial-gradient(ellipse at center, #f5e6c8, #d4b483)`
- **Entry Reveal Animation**: New entries animate in with an **ink-bleed wipe** — a masked reveal that looks like ink soaking into the page from left to right. Duration: 800ms, `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Completion Glow**: Completed region pages gain a gold border shimmer: `box-shadow: 0 0 20px rgba(245, 208, 96, 0.4), inset 0 0 10px rgba(245, 208, 96, 0.1)`
- **Bestiary Portrait**: Each enemy entry shows a stylized silhouette that fills in with color on the 5th kill.

---

## Integration with Existing Systems

- **`lore_fragments.json`**: Already exists. Fragments are already collectible. They simply need routing into the Codex UI.
- **`js/ui/archive-ui.js`**: Already exists. This concept *extends* it rather than replacing it.
- **Memoria Shards**: Feed directly into the Memories section.
- **Boss Soul Echoes**: Defeating an Echo deposits a `Soul Relic` lore item into the Codex of Worlds as a unique boss sub-entry.

---

## Data Requirements

```json
// New file: data/bestiary.json
{
  "goblin": {
    "name": "Goblin Scout",
    "element": "physical",
    "lore_tier_1": "A low-ranking Void-touched creature...",
    "lore_tier_2": "Their hierarchy is built on fear and proximity to the Rift...",
    "lore_tier_3": "Ancient records suggest goblins were once industrious miners...",
    "flavor_quote": "\"They don't fight for the Void. They fight because they forgot how to do anything else.\""
  }
}
```

---

## Implementation Path

1. `data/bestiary.json` — new file, enemy lore entries at 3 tiers
2. `js/game.js` — `G.archiveProgress` object (enemy kill counts, codex %, shards viewed)
3. `js/ui/archive-ui.js` — extend with three-section tabbed UI
4. `js/map/map-engine.js` — enemy kill tracker hook (increment `G.archiveProgress.kills[enemyId]`)
5. `css/ui-overlays.css` — parchment texture, ink-bleed animation, completion glow
6. `js/map/map-ui.js` — Archive button in camp menu
