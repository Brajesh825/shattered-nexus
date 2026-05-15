# Concept: Memoria Shards — Collectible World Flashbacks
**Domain**: The Chronicler (Story) + Atlas (World) + Vivid (Visual)
**Status**: Concept — Detailed Implementation Plan Ready
**Priority**: MEDIUM
**Arc Scope**: Arc 1–2 (11 shards: 5 Verdant Vale, 6 Crystal Caverns)

---

## Overview

**Memoria Shards** are crystallized fragments of the world before the Rift — hidden collectibles that play a short black-and-white flashback when found. Finding one does not give the player an item. It gives them a *memory that is not theirs.* There are **40 total** across all 8 arcs. The Arc 1–2 set (11 shards) is the initial implementation target.

---

## Pre-Implementation Audit

| System | Exists? | Detail |
|---|---|---|
| Collectible pickup system | ❌ **None** | No shard/collectible mechanic of any kind. Must build. |
| `Archive.recordStoryFragment(id)` | ✅ **Yes** | `archive.js` — already records story entries by ID. Shards piggyback on this for Archive integration. |
| `map-engine.js:1912` NPC interaction | ✅ **Yes** | Already fires `Archive.recordStoryFragment(npc.id)` on NPC interact. Can extend for `type: 'memoria_shard'`. |
| Cutscene/dialogue system on map | ❌ **No dedicated system** | `MapUI.showMsg()` with chained callbacks is the closest. Greyscale overlay + chained messages = viable flashback. |
| `data/lore_fragments.json` pattern | ✅ **Yes** | Model for shard data structure — same `id`, `title`, `description` shape. |

**Conclusion**: The NPC interaction pipeline is the cleanest hook. Shards are defined as map NPCs with `type: 'memoria_shard'`. A new `js/systems/memoria-shards.js` handles collection + flashback playback.

---

## Data Structure — `data/memoria_shards.json`

```json
{
  "shards": [
    {
      "id": "shard_vale_001",
      "arc": 1,
      "map": "verdant_vale",
      "title": "A Soldier's Letter",
      "tileX": 14,
      "tileY": 22,
      "flashback": [
        { "speaker": "Arren", "text": "...The Vale smells like rain and pine today. I keep thinking about what you said before I left." },
        { "speaker": "Arren", "text": "That you'd wait by the eastern gate. I'll hold you to that." }
      ],
      "bossLink": "void_knight"
    },
    {
      "id": "shard_vale_002",
      "arc": 1,
      "map": "verdant_vale",
      "title": "Before the Ash",
      "tileX": 8,
      "tileY": 31,
      "flashback": [
        { "speaker": "Villager", "text": "The harvest was good this year. Better than good." },
        { "speaker": "Villager 2", "text": "Don't jinx it. Just enjoy it." }
      ],
      "bossLink": null
    },
    {
      "id": "shard_vale_003",
      "arc": 1,
      "map": "verdant_vale",
      "title": "King Galdor's Oath",
      "flashback": [
        { "speaker": "Galdor", "text": "I swore to protect this land. Every stone. Every name carved into every door." },
        { "speaker": "Galdor", "text": "I have not forgotten. I never will. Even now." }
      ],
      "bossLink": "galdor_king"
    }
  ]
}
```

**Arc 1–2 entries to write (11 total):**

| Shard ID | Map | Title | Boss Link |
|---|---|---|---|
| `shard_vale_001` | Verdant Vale | A Soldier's Letter | `void_knight` |
| `shard_vale_002` | Verdant Vale | Before the Ash | — |
| `shard_vale_003` | Verdant Vale | King Galdor's Oath | `galdor_king` |
| `shard_vale_004` | Verdant Vale | The Last Patrol | — |
| `shard_vale_005` | Verdant Vale | A Name on the Gate | `void_knight` |
| `shard_cavern_001` | Crystal Cavern F1 | The Scholar's First Day | `demon_lord` |
| `shard_cavern_002` | Crystal Cavern F1 | The Archive Agreement | — |
| `shard_cavern_003` | Crystal Cavern F2 | Before the Fusion | `demon_lord` |
| `shard_cavern_004` | Crystal Cavern F2 | What We Found | — |
| `shard_cavern_005` | Crystal Cavern F3 | The Last Entry | `spectral_guardian` |
| `shard_cavern_006` | Crystal Cavern F3 | Light from Below | — |

---

## Shard Placement in Map Data

Shards are defined as NPCs with `type: 'memoria_shard'` in the map's `npcs` array:

```javascript
// In map-verdant-vale.js, npcs array:
{
  id: 'shard_vale_001',
  type: 'memoria_shard',
  shardId: 'shard_vale_001',
  x: 14, y: 22,
  sprite: 'shard',       // new sprite entry in tile-defs or NPC sprite sheet
  name: 'Faint Memory'   // shown in explore-notif before collection
}
```

**Placement rules:**
- Not adjacent to spawn points, teleport tiles, or boss trigger zones
- At least 8 tiles from the map edge
- Hidden — behind a wall corner, inside a room corner, or in a cul-de-sac. Reward curiosity.

---

## New File: `js/systems/memoria-shards.js`

```javascript
/**
 * memoria-shards.js — Collectible Flashback Shard System
 * Handles shard collection, flashback playback, and Archive integration.
 */
const MemoriaShard = {
  collect(shardId) {
    if (!G.collectedShards) G.collectedShards = new Set();
    if (G.collectedShards.has(shardId)) return; // already collected

    G.collectedShards.add(shardId);
    if (typeof Save !== 'undefined') Save.patch({ collectedShards: [...G.collectedShards] });

    const shard = (window.MEMORIA_DATA?.shards || []).find(s => s.id === shardId);
    if (!shard) return;

    // Register in Archive (Story tab)
    if (typeof Archive !== 'undefined') Archive.recordStoryFragment(shardId);

    // Stat milestones
    this._checkMilestones();

    // Collection notification → then flashback
    if (typeof MapUI !== 'undefined') {
      MapUI.showMsg(`✦ Memoria Shard — "${shard.title}"`, 2000, () => {
        this._playFlashback(shard.flashback);
      });
    }
  },

  _playFlashback(lines) {
    const wrap = document.getElementById('explore-canvas-wrap');
    if (wrap) {
      wrap.style.transition = 'filter 0.8s';
      wrap.style.filter = 'grayscale(1) contrast(1.15) brightness(0.9)';
    }
    let idx = 0;
    const next = () => {
      if (idx >= lines.length) {
        if (wrap) {
          setTimeout(() => {
            wrap.style.filter = '';
          }, 600);
        }
        return;
      }
      const line = lines[idx++];
      if (typeof MapUI !== 'undefined') {
        MapUI.showMsg(`${line.speaker}: "${line.text}"`, 4500, next);
      }
    };
    // Brief pause before first line
    setTimeout(next, 800);
  },

  checkBossBonus(bossId) {
    // Returns true if a bossLink shard for this boss has been collected
    // Called from story.js pre-battle to inject bonus dialogue
    return (window.MEMORIA_DATA?.shards || [])
      .some(s => s.bossLink === bossId && G.collectedShards?.has(s.id));
  },

  _checkMilestones() {
    const count = G.collectedShards?.size || 0;
    const milestones = { 5: 'spd', 10: 'lck', 15: 'mag', 20: 'hp', 25: 'mp', 30: 'def', 35: 'atk' };
    const stat = milestones[count];
    if (stat) {
      G.memoriaBonus = G.memoriaBonus || {};
      G.memoriaBonus[stat] = (G.memoriaBonus[stat] || 0) + 2;
      if (typeof Party !== 'undefined') Party.buildParty(); // recompute with bonus
      if (typeof MapUI !== 'undefined')
        MapUI.showMsg(`✦ Memoria Resonance — +2 ${stat.toUpperCase()} (all party)`, 3000);
    }
    // Full collection
    if (count >= 40 && !G.memoriaComplete) {
      G.memoriaComplete = true;
      // Grant Memoria Seal relic (to be defined in relics.json)
      if (typeof MapUI !== 'undefined')
        MapUI.showMsg('✦ Memoria Seal obtained — All memories restored.', 5000);
    }
  }
};
```

---

## `map-engine.js` — Extend NPC Handler

In the existing NPC interaction block at `map-engine.js:1912`, add:

```javascript
if (npc.type === 'memoria_shard') {
  if (typeof MemoriaShard !== 'undefined') MemoriaShard.collect(npc.shardId);
  return; // do not continue to normal NPC dialogue
}
```

---

## `js/story.js` — Pre-Boss Bonus Dialogue

In the story boss launch sequence, before battle starts:

```javascript
if (typeof MemoriaShard !== 'undefined' && MemoriaShard.checkBossBonus(bossId)) {
  const shard = (window.MEMORIA_DATA?.shards || []).find(s => s.bossLink === bossId && G.collectedShards?.has(s.id));
  if (shard) {
    // Inject a pre-battle dialogue line specific to the shard
    // This can use the existing cutscene or showMsg system
    MapUI.showMsg(`"${shard.bossPreLine || 'I understand now. Let us end this.'}"`, 4000, () => {
      // proceed to battle
    });
  }
}
```

---

## Save/Load — `js/story.js` or `js/game.js`

```javascript
// On save:
Save.patch({ collectedShards: [...(G.collectedShards || [])] });

// On load:
if (s.collectedShards) G.collectedShards = new Set(s.collectedShards);
```

---

## Visual Treatment (Vivid)

- **On map**: Shards appear as a subtle shimmer — a single pixel-scale glowing mote at their tile. NOT a large marker. Reward curiosity.
  - Dawn window: Gold shimmer (`hsl(45, 90%, 60%)`)
  - Midnight window: Indigo shimmer (`hsl(260, 80%, 60%)`)
- **Flashback overlay**: `filter: grayscale(1) contrast(1.15) brightness(0.9)` on `#explore-canvas-wrap` — film-like monochrome
- **Collection spark**: A brief 3-frame CSS keyframe flash at the collection point

---

## Milestone Rewards (Full 40-Shard Arc)

| Shard Count | Stat Bonus |
|---|---|
| 5 | +2 SPD (all party) |
| 10 | +2 LCK (all party) |
| 15 | +2 MAG (all party) |
| 20 | +10 HP (all party) |
| 25 | +5 MP (all party) |
| 30 | +2 DEF (all party) |
| 35 | +2 ATK (all party) |
| 40/40 | **Memoria Seal** relic (+5 ALL stats, unique) |

Bonuses are applied via `G.memoriaBonus{}` — read in `party.js#computeStats()`.

---

## Files Modified

| File | Change |
|---|---|
| `data/memoria_shards.json` | **NEW** — 11 Arc 1–2 shard definitions |
| `js/systems/memoria-shards.js` | **NEW** — `MemoriaShard` system module |
| `js/data-loader.js` | Fetch `memoria_shards.json` → `window.MEMORIA_DATA` |
| `js/map/map-engine.js` | `memoria_shard` type check in NPC handler (line ~1912) |
| `js/map/data/map-verdant-vale.js` | 5 shard NPC entities added |
| `js/map/data/map-crystal-cavern-f1.js` | 2 shard NPC entities |
| `js/map/data/map-crystal-cavern-f2.js` | 2 shard NPC entities |
| `js/map/data/map-crystal-cavern-f3.js` | 2 shard NPC entities |
| `js/story.js` | Pre-boss bonus dialogue hook + save/load |
| `js/game.js` | `G.collectedShards`, `G.memoriaBonus`, `G.memoriaComplete` init |
| `js/systems/party.js` | Read `G.memoriaBonus` in `computeStats()` |
| `index.html` | `<script src="js/systems/memoria-shards.js">` |
| `sw.js` | Add `data/memoria_shards.json`, `js/systems/memoria-shards.js` to SHELL_ASSETS + CACHE_NAME bump |
