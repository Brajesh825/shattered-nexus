# Concept: Environmental Hazard Tiles
**Domain**: Atlas (Worldbuilder) + Aegis (Combat Balance)
**Status**: Concept — Not Yet Implemented
**Priority**: MEDIUM

---

## Overview

Every region of the Shattered Nexus has a distinct environmental identity, but that identity is currently **visual only** — standing in the Ember Wastes' lava fields feels identical to standing in the Verdant Vale's flower fields. **Environmental Hazard Tiles** make the world *dangerous to inhabit*, and give elemental characters a meaningful geographic advantage that rewards thoughtful party composition.

---

## How It Works

Specific map tiles carry a `hazard` property in their tile definition (`tile-defs.js`). When the player is **on or adjacent to** a hazard tile, a **tick-based status effect** is applied to the entire party every ~15 seconds of real time (one exploration "turn").

Characters with a **matching elemental immunity** are unaffected. The immunity is checked via the character's `class_affinity` field against a new `HAZARD_IMMUNITY_MAP`.

---

## Hazard Type Registry

| Tile / Region | Hazard ID | Status Effect | Immune Characters |
|---|---|---|---|
| Lava Floor — Ember Wastes | `BURN_FIELD` | 5% max HP fire damage per tick | Tao (Fire) |
| Ice Vents — Crystal Caverns | `FREEZE_FIELD` | −3 SPD to all party members | Aya (Ice) |
| Toxic Bogs — Eastern Wetlands | `POISON_FIELD` | 2% max HP poison drip per tick | Characters with `POISON_IMMUNITY` passive trait |
| Void Static — Void Citadel | `STATIC_FIELD` | −3 MP per tick | Rei (Void-neutral) |
| Lightning Arcs — Sky Ruins | `SHOCK_FIELD` | 10% chance to Paralyze 1 party member per tick | Aya post-Ascension (Storm-Rime Sovereign) |
| Deep Water — Sunken Temple | `SUBMERGED` | ATK −4, MAG +4 (water conducts magic) | Lulu (Water) |
| Ash Dunes — Northern Highlands | `ASH_DRIFT` | LCK −5, enemy encounter rate +15% per tile | Drake (Dragoon — trained in harsh terrain) |

---

## Strategic Depth

### Avoidance
Players can route around hazard tiles using careful navigation, especially once they understand the map layout. This makes exploration feel like problem-solving.

### Elemental Party Value
Having Tao in the party makes the Ember Wastes significantly safer. This creates a genuine reason to tailor party composition to the region being explored — not just the boss at the end.

### Locked Hidden Areas
Several **Rumor Board** locations and hidden shard chambers are **only accessible by crossing a hazard zone**. A party without the immune character must manage the damage carefully, or acquire a resistance relic first.

### Boss Arena Design
Every region boss arena should include that region's native hazard tile around its edges, making elemental-matched parties significantly more comfortable in endurance fights.

---

## Resistance Relics

New relics (craftable via Relic Synthesis) can grant partial or full hazard resistance:

| Relic | Effect |
|---|---|
| *Ember Ward* | Reduces BURN_FIELD damage by 60% |
| *Glacial Insole* | Immune to FREEZE_FIELD SPD penalty |
| *Void Anchor* | Reduces STATIC_FIELD MP drain to 0 |
| *Wetland Cloak* | Full immunity to POISON_FIELD |

---

## Visual Treatment

- Hazard tiles have a **persistent looping particle system**:
  - `BURN_FIELD`: Ember motes drifting upward, soft orange glow
  - `FREEZE_FIELD`: Ice crystal shimmer, blue tint
  - `POISON_FIELD`: Slow green spore mist
  - `STATIC_FIELD`: Purple crackling energy veins on the floor
- When the party **enters** a hazard zone, a small elemental status icon (🔥 / ❄️ / ☠️ / ⚡) appears in the party HUD strip at the bottom-left of the explore screen
- Immune characters' HUD portrait has a faint **golden immunity ring** while in the hazard zone

---

## Implementation Path

1. `js/map/data/tile-defs.js` — add `hazard: 'BURN_FIELD'` property to relevant tile IDs
2. `js/map/map-engine.js` — tick-based hazard check loop (every 15s, check player tile + adjacent)
3. `js/battle/passive-system.js` — `HAZARD_IMMUNITY_MAP` lookup + immunity check
4. `js/map/map-ui.js` — HUD status icon + immunity ring rendering
5. `css/map.css` — particle animation styles per hazard type
6. `data/relics.json` — new resistance relic definitions

---

## Open Questions

> [!NOTE]
> **Adjacency range**: Does the hazard apply only if the player is *on* the tile, or within 1 tile? 1-tile adjacency creates more tension and better reflects "standing near the lava."

> [!NOTE]
> **Camp clearing**: Should resting at camp clear any hazard-applied status effects? Recommendation: yes — it's consistent with the corruption rest mechanic.
