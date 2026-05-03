# ⚔️ RPG+ Technical Source of Truth (claude.md)

This document contains the essential architectural and technical rules for the RPG+ engine. Refer to this to maintain system integrity and prevent regressions.

---

## 🛡️ Diamond Formation & Vanguard Logic
The 4-slot diamond arrangement is the foundation of targeting logic.
- **Slot 1 (Back)**: Grants a **30% Evasion bonus** against physical strikes.
- **Slot 2 (Front/Vanguard)**: **Vanguard Interception** is active. ALL single-target physical attacks intended for other allies are redirected here if Slot 2 is alive.
- **Indices**: These map strictly to `G.party` and `G.enemyGroup` indices.

---

## 🧬 Data-Driven Passive Trait System
Managed via **[PassiveSystem](file:///c:/Users/ASUS/VVI/rpg+/js/battle/passive-system.js)**. 
- **Querying**: Use `PassiveSystem.hasTrait(unit, 'TYPE')` or `PassiveSystem.val(unit, 'TYPE', fallback)`.
- **Stat Integration**: `CombatEngine.getStat` automatically applies multipliers (e.g., `STAT_BOOST`, `LOW_HP_STAT_BOOST`) during every calculation.
- **Key Trait Types**: `HEAL_AMP`, `MP_COST_MULT`, `DAMAGE_REDUCTION`, `REFLECT`, `FIRST_STRIKE`, `SUMMON_STAT_BOOST`.

---

## 🔮 Ability Framework & Composite Scaling
Defined in **classes.json** and **enemies.json**.
- **Signature**: Uses `dmgMultiplier` and `type` (`physical` / `magic_damage`).
- **Composite Scaling**: Use `effect.statScale: ["stat1", "stat2"]` to pull multiple attributes into a single move's power calculation.
- **Vampiric Logic**: `effect.vampiric` (0.0 - 1.0) determines healing-on-hit percentage.

---

## 🛠️ Combat Engine Math Standard
All Core math functions in `js/battle/combat-engine.js` MUST use this signature to avoid `NaN` errors:
### `(PowerStat, MitigationStat, Multiplier, OptionsObject)`

### 📊 Multiplier & Capping Hierarchy
Combat stats are calculated in four distinct layers to allow for high-impact scaling:
1. **Base Passives**: Multipliers from `PassiveSystem` (Capped at **2.5x** / `NexusScaling.caps.statMult`).
2. **Status/Moves**: Multipliers from statuses (`sBonus`) are added *after* the passive cap.
3. **Phases**: Multipliers from `statPhases` are applied multiplicative to the result.
4. **Absolute Cap**: The final multiplier is clamped at **8.0x** (The "Extreme Premium" limit).

---

## 🧪 Elemental Reactions (RX) & Auras
Elemental damage interaction is the primary multiplier in combat.
- **Aura Application**: If no reaction occurs, the element applies an `Aura` status to the target.
- **Reaction Matrix (RX)**:
  - **Vaporize / Melt**: 1.5x - 2.0x Damage.
  - **Shatter**: High damage + removes Freeze.
  - **Conductive**: Damage + Stun chance.
  - **Swirl**: AOE Dispersion of status.

---

## 🌪️ Universal Phase System
Enemies can define dynamic stat transformations triggered by HP thresholds using the `statPhases` array in `enemies.json`.
- **Implementation**: `CombatEngine.getStat` automatically picks the phase for the *lowest* threshold reached (e.g., at 20% HP, it picks the 25% phase).
- **Structure**: `{"hp": 0.25, "atk": 1.5, "def": 0.8}`
- **Stacking**: Phase multipliers bypass passive caps and stack with statuses, allowing for dramatic "Enrage" or "Fragile Power" shifts.

---

## 👾 Elite & Boss Scaling Formula
All enemies in `enemies.json` use **Level 1 baseline stats**. The engine projects these to their spawn level using this formula:

```
Final_Stat = floor( ( (Base_Stat × Tier_Mult) + (SpawnLevel - 1) × Tier_Growth ) × Boss_Mult )
```

### 📊 Baseline Coefficients (The Sacred Standard)
- **Boss Multiplier (HP)**: 4.5x
- **Boss Multiplier (ATK/DEF/MAG)**: 1.3x
- **Tier 3 Growth Multiplier**: 1.3x
- **Tier 3 Growth (per level)**: HP: 22 | ATK: 3.0 | DEF: 2.0 | SPD: 1.0 | MAG: 0.6

> [!CAUTION]
> **HANDS-OFF DIRECTIVE**: The `Base_Stats` for Story Bosses in `enemies.json` are primary gameplay anchors. Antigravity is **NOT permitted** to tweak these values or the multipliers above without explicit user approval. 

### 🛡️ Boss Archetypes (Reference)
- **Void Knight (Arc 1)**: 240 HP / 22 DEF (The Balanced Start)
- **Demon Lord (Arc 2)**: 185 HP / 15 DEF (The Magic Menace)
- **King Galdor (Sideboss)**: 200 HP / 16 DEF (The Greed King - Hardens with HP loss)
- **Spectral Guardian (Sideboss)**: 480 HP / 60 DEF (The Wall - Shatters into glass cannon at 40% HP)
- **Dark Phoenix (Arc 3)**: 170 HP / 10 DEF (The Self-Healer)

---

## 📐 Character Stat & Growth Formulas
All character stats are computed in `js/systems/party.js → computeStats(ch, cls)`. **Never save or restore derived combat stats — always recompute from source.**

### Stat Formula (per stat: hp, mp, atk, def, spd, mag, lck)
```
FinalStat = floor( (BaseStat + (Level - 1) × GrowthPerLevel + StatBonus) × ClassMultiplier )
```
- `BaseStat` — from `characters.json → base_stats`
- `GrowthPerLevel` — from `classes.json → growthPerLevel` (0 if absent)
- `StatBonus` — from `characters.json → stat_bonuses` (0 if absent)
- `ClassMultiplier` — from `classes.json → stat_multipliers`

### Relic Multipliers (applied after `computeStats`, inside `applyRelicBonuses()`)
```
FinalStat = floor( FinalStat × RelicMultiplier )   // hp, mp, atk, def, spd, mag, lck
```
Relic bonuses are **additive across relics, then applied once** as a single multiplier. They are re-applied fresh every time `buildParty()` is called — never stack.

### EXP Threshold (level-up gate)
```
ExpNeeded(L) = 5 × L² + 25 × L
```
Example thresholds: Lv1→2: 30 | Lv5→6: 250 | Lv10→11: 750 | Lv20→21: 2,280

### EXP Distribution (per battle)
EXP is **split among alive party members** — not given in full to each.
```
splitExp   = floor(totalEnemyExp / aliveCount)
earnedExp  = floor(splitExp × expScale)       // per surviving member
```
- Dead members receive **0 EXP** but their level/exp is always synced back to `G.chars` regardless of KO state (prevents level reset on next battle).
- Gold is split the same way.

### EXP Scaling (enemy spawn formula)
```
finalExp = floor(baseExp × tierExpMult × hordeScale × levelScale × bossExpMult)
```
- `tierExpMult`: Tier 1 = 1.0 | Tier 2 = 1.5 | Tier 3 = 2.5
- `levelScale`: `1 + (spawnLevel - 1) × 0.1`  — grows linearly, adds ~10% per level
- `hordeScale`: 3 enemies = 0.78× each | 4+ enemies = 0.65× each
- `bossExpMult`: 2.5× for bosses (`isBoss: true`)

### EXP Level-Gap Penalty
```
expScale = clamp(1 - (memberLevel - enemyLevel) / 3,  0, 1)
```
At **+3 levels above the enemy average** the member earns 0 EXP. Linear ramp between gap 0 → 3.

### Archive Mastery Buffs
Applied as **flat additions** after `computeStats()` and `applyRelicBonuses()` in all code paths: `buildParty()`, save load (`story.js`), and Gauntlet (`boss-gauntlet.js`). Must be reapplied in every path that rebuilds stats from scratch.

### PassiveSystem STAT_BOOST Rules
- `value` is a **float > 1** (e.g. `1.15`) → applied as a **multiplier** in `getStatMultiplier`
- `value` is an **integer** (e.g. `3`) → applied as a **flat bonus** in `getStatBonus`
- Never use integers > 1 for multiplier intent — use floats.

### Save / Load Contract
Only `lv`, `exp`, `gold`, `hp`, `mp`, `isKO` are persisted. On load, all other stats are recomputed via `computeStats()` + `applyRelicBonuses()` + Archive mastery buffs. This prevents corrupted saves from permanently inflating stats.

### Save Trigger Rule
Saving is **camp-only**. The `💾 SAVE PROGRESS` button lives exclusively in the Camp menu (`MapUI.campSave()`). There is no save button in the pause menu. Do not re-add campfire tile checks or auto-save prompts — they were intentionally removed.

---

## 🔍 Debugging & Diagnostics
Engine status is exposed via `window.LogDebug(msg, type)`.
- **Reserved Tags**: `[MATH-PHYS]`, `[MATH-MAGIC]`, `[ENEMY-MATH-MAGIC]`, `[ENEMY-MATH-PHYS]`, `[STATE-DIAG]`, `[Aura]`, `[Passive]`, `[Gauntlet]`, `[BUFF]`, `[DEBUFF]`, `[AI-SUPPORT]`, `[HitRoll]`, `[CritRoll]`, `[KO]`.
- **Gauntlet Mode**: Use for stress-testing AI and new enemy tiers. Accessible from the map screen. Boss list defined in `BossGauntlet.getBossIds()` — add new arc bosses here.
- **Magic Defense Formula**: `mdef = def×0.25 + mag×0.25 + level×0.5` — both attacker and defender use this blend. Pure DEF tanks and pure MAG mages both get meaningful resistance without immunity.

---

## 🎵 Audio & Music Handling (BGM)
The **BGM** module (`js/bgm.js`) handles all background music with crossfading support.
- **Map Music**: Driven by the `bgm` property in the map definition (e.g., `map-riverlands-crossing.js`). Triggered automatically by `MapEngine.loadMap()`.
- **Battle Music**: Driven by the map's `battleBgm` or `bossBgm` properties. Initiated when `MapEngine.onEncounterStart()` fires. Returns to map music automatically on `onBattleComplete()`.
- **Arc Bosses (Story)**: Bypasses the Map Engine. Configure story boss tracks by adding `"bossBgm": "track_name"` or `"battleBgm": "track_name"` directly to the chapter object in `data/story/*.json`. `js/story.js` handles the crossfade.
- **File Assets**: BGM tracks live in `audio/bgm/`. Always provide MP3 files that match the metadata names.

---

## 🔄 Service Worker & PWA Update Rules

The game is installable as a PWA. The Service Worker in `sw.js` caches all assets for offline play.

> [!CAUTION]
> **ALWAYS bump `CACHE_NAME`** in `sw.js` when pushing any significant update (new assets, JS changes, CSS changes). The version string (e.g. `nexus-cache-v4.0`) is the sole mechanism that triggers cache invalidation on installed PWAs. Forgetting to bump it means users continue serving stale images and audio from the old cache indefinitely.

### Update Flow (automatic — no user action needed)
1. Browser re-fetches `sw.js` on every app open and does a byte-diff
2. If changed → new SW installs in background, old SW stays active
3. `self.skipWaiting()` in the install handler forces immediate activation on next navigation
4. Activate handler deletes all caches whose key ≠ `CACHE_NAME`

### Sprite Quality Cache Rules
- Character sprites are split into `SPRITES_NORMAL` (PNG ~37 MB) and `SPRITES_LOW` (WebP ~1.7 MB)
- The fetch handler reads `_quality` (set via `SET_QUALITY` postMessage from the page) and only caches sprites matching the player's choice
- Enemy sprites have a single quality — always cached regardless of setting
- When adding new character sprites, add both variants to `SPRITES_NORMAL` and `SPRITES_LOW` in `sw.js`

---

## 📱 Device Support Standards
The game is responsive and cross-platform. UI components MUST be rigorously tested and scale correctly across the following core breakpoints/devices:
1. **iPhone SE (375x667)** - The tightest baseline testing boundary. UI elements cannot overlap or require horizontal scrolling.
2. **iPhone XR / 11 (414x896)** - Mid-tier standard mobile.
3. **iPhone 12/13/14 Pro (390x844)** - Modern portrait standard.
4. **Desktop / Laptops** - Widescreen layouts, where the main wrapper should gracefully constrain with empty side gutters or an expanded view without stretching character sprites incorrectly.

---

## ⚠️ `loadMap` is Async — Teleport Position Rule

`loadMap(mapId)` in `map-engine.js` does a `await fetch(jsonFile)` internally and calls `MapPlayer.reset(playerStart)` **after** that fetch resolves. Any code that calls `loadMap()` without awaiting it and then immediately calls `MapPlayer.reset(targetX, targetY)` will have its position **silently overwritten** when the fetch completes.

**Rule**: All post-teleport work (position reset, message display, story hooks) MUST go inside `.then()`:
```js
loadMap(targetMapId).then(() => {
  MapPlayer.reset(targetX, targetY);
  MapUI.showMsg(msg, 1500);
  Story.onMapTeleport(targetMapId);
});
```
Never call `MapPlayer.reset` on the same tick as `loadMap` — it will be stomped.

---

## 🏰 Multi-Floor Dungeon Pattern (The Crystal Cavern Standard)

When a story arc uses a multi-floor dungeon (several connected maps that together form one arc chapter sequence), follow this exact pattern. Crystal Cavern (Arc 2, Floors 1–3) is the reference implementation.

### Story Data Structure (`data/story/arc_N.json`)
Each floor is its own **`type: "explore"`** chapter in `arc.chapters[]`. They share the same arc; they are NOT separate arcs.

```json
{ "id": "ch_f1", "type": "explore", "map": "dungeon_f1", "map_hint": "Navigate Floor 1 — find the descent." },
{ "id": "ch_f2", "type": "explore", "map": "dungeon_f2", "map_hint": "Navigate Floor 2 — find the stairs." },
{ "id": "ch_f3", "type": "explore", "map": "dungeon_f3", "map_hint": "Defeat the dungeon guardian." },
```
The arc's `boss_chapter` fires immediately after the final floor chapter completes.

### Floor Traversal Rules (Map JS files)
**Intermediate floors (F1, F2 …):**
- `objective: null` — no objective needed; chapter advancement is driven by the teleport itself.
- Descend teleport: any tile/position pointing to the next floor with `targetX`/`targetY`.
- Return teleport: placed **away from `playerStart`** (use `x: 2` as the convention) so the player cannot land on it on spawn.
- `playerStart` must NOT coincide with any teleport trigger on that floor.

**Final floor (last before boss):**
- `objective: { type: 'kill_boss', label: '...', completeMsg: '...' }` — defeating the boss entity triggers `onExploreComplete()` → `_showBossChapter()`.
- No exit teleport pointing to the next world map. The boss-defeat chain handles the exit.
- Return teleport back to previous floor is still allowed.

### How Chapter Advancement Works
`MapEngine` calls `Story.onMapTeleport(newMapId)` every time a `type: 'teleport'` trigger fires. `Story.onMapTeleport` checks if `newMapId` matches `arc.chapters[chapIdx + 1].map` — if so, silently advances `chapIdx` and shows the new chapter's `map_hint`. This means:
- **F1 → F2 teleport** = story advances to the F2 chapter, F2 hint shown.
- **F2 → F3 teleport** = story advances to the F3 chapter, F3 hint shown.
- **F3 → F2 return** = story does NOT regress (only advances forward via `chapIdx + 1`).

### Trigger Placement Rules
| Trigger | Position rule |
|---|---|
| Descent (Fn → Fn+1) | Far end of the floor, inside a safe zone |
| Return (Fn → Fn-1) | `x: 2, y: <same as playerStart.y>` — west edge, player must walk left deliberately |
| `playerStart` | Must be ≥ 5 tiles away from any return trigger |

### Objective Types Per Floor Role
| Floor role | Objective type | Notes |
|---|---|---|
| Entry / transit floor | `null` | Chapter advances on teleport exit |
| Final / boss floor | `kill_boss` | `isBoss: true` enemy required in `enemies[]` |
| Collection floor | `collect` | Artifacts array required |
| Survival floor | `survive` | Duration in ms |

> [!CAUTION]
> **NEVER** put a `type: 'teleport'` trigger and a `type: 'reach'`/`kill_boss` objective on the same tile. They conflict. The final floor uses `kill_boss` objective as the sole exit mechanism — no exit teleport needed.

---

## 🗟 Map NPC & Event System

### Trigger Types (`map.triggers[]`)
All triggers fire once per session (stored in `_firedTriggers`). They are checked every player-move tick via `_checkRegionTriggers()`.

| `type` | Required fields | What it does |
|---|---|---|
| `dialogue` | `lines: [{speaker, text}]` | Pauses the map, opens the NPC dialogue panel, plays the lines sequentially. Reuses `_openGenericDialogue` — same panel as NPC talk. |
| `msg` | `msg: string` | Shows a brief HUD notification (`MapUI.showMsg`). Doesn't pause the map. |
| `teleport` | `targetMapId`, optionally `targetX`/`targetY` | Loads a new map. All post-load work (position reset, story hooks) MUST go inside `.then()`. |
| `reach` | *(objective target, not a trigger type)* | Completes the `reach` objective when the player steps on `target.x/y`. |

Trigger region shape: `{ id, x, y, w, h, type, ...typeFields }`. `w`/`h` default to 1 if omitted.

### NPC Definition Pattern (`data/npcs.js`)
```js
npcKey: {
  name: 'Display Name',
  color: '#hexcolor',          // speaker name color in dialogue
  sprite: 'path/to/sheet.png', // fallback: images/characters/map/sheets/npc/<id>_sheet.png
  dialogues: {
    mapId: [
      { speaker: 'Name', text: 'Line.' },
    ],
  },
}
```
Placed in a map via `map.npcs[]`: `{ id: 'npcKey', x, y, dialogueKey: 'mapId', behavior: 'stationary'|'wander'|'patrol', ... }`.

### `hideIfUnlocked` Gate
Adding `hideIfUnlocked: 'charId'` to an NPC entry in `map.npcs[]` causes `MapEntities.init()` to filter that NPC out when `G.unlockedChars` contains `charId`. Use this to make pre-recruit NPCs disappear once the character has joined the party.

### Narrative 3-Beat Pattern (Verdant Vale / Sera standard)
For story-relevant NPCs that appear before recruitment, follow this structure:
1. **First Sighting trigger** — region trigger fires automatically when the player approaches (~10 tiles before the NPC). The character calls out without the player needing to interact. Establishes presence.
2. **NPC Direct Talk** — player walks up to the NPC sprite and interacts. Full lore dialogue. Can be revisited.
3. **Gate trigger** — region trigger near the dungeon/boss entrance. Final words before the fight. Plants the emotional setup for the post-boss recruit scene.

All three beats use `type: 'dialogue'` with `speaker: 'Azure Commander'` (or whatever the pre-recruit display name is). The NPC's true name (`Sera`) is only revealed in the post-boss `character_moment` in `arc_N.json`.

### Voice Lines (`map.voiceLines`)
```js
voiceLines: {
  ambient: [...],    // random lines during normal exploration
  fogRising: [...],  // fired at fog milestone thresholds
  encounter: [...],  // fired on enemy encounter
}
```
Each entry: `{ char: 'Name', color: '#hex', text: 'Line.' }`. Story NPCs (e.g. Azure Commander) can appear here to reinforce presence without triggering a full dialogue panel. Keep these 1-line atmospheric observations — they are not gated and fire randomly.

---

## 🗺️ Map Architect Data Standards (V1.1)
The **Architect Pro** editor (`tools/tile-editor.html`) is the primary source for region data.

### 📁 Manifest & Dynamic Assets
- **Manifest**: `images/environment/sprites.json`
- **Rule**: All new SVG assets MUST be registered in the manifest with a unique ID (200-299) to appear in the editor and game engine.
- **Paths**: SVGs reside in `images/environment/svg/`.

### 📊 Export Schema
- **Structure**: `metadata`, `palette_schema`, and `data` (3D array).
- **Z-Order Indexing**:
    - `data[0]`: Ground (rendered behind player).
    - `data[1]`: Decoration/Objects (same-level occlusion).
    - `data[2]`: Overhead (rendered in front of player).
- **ID Registry**: 
    - `0`: Transparent/Empty.
    - `1-199`: Standard core tiles.
    - `200-299`: Dynamic SVG assets.
    - `1000+`: Sprite-based environmental objects.

---

## 🎨 Idea & Asset Staging (`_concepts/`)
- **`_concepts/`**: This directory serves as a staging ground for **anything** under consideration for future integration. This includes raw generated artwork, draft story documents, lore expansions, and experimental game mechanics. Once finalized, content should be moved to its permanent location in the codebase (e.g., `images/`, `data/`, `js/`), and the raw concepts can be safely removed.
