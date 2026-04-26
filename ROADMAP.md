# RPG+ Development Roadmap

## ✅ Completed Milestones
- **[2026-04-26] Smooth-Curve Scaling Audit**: Comprehensive re-leveling of 15 maps (1-8, 7-15, 12-20) to ensure overlapping, accessible progression. Synchronized code with documentation, including the final shift of Northern Highlands to endgame status (Arc 6, Lv 35-43).
- **[2026-04-26] Story Progression Documentation**: Created a master guide mapping all 8 Narrative Arcs and expansion regions with exact level ranges and unlock triggers.
- **[2026-04-26] Sky Ruins Overhaul**: Massive 80x40 gauntlet redesigned with a 4-chamber "Four Kings" citadel, obsidian-bridge nexus, and Tier 3 corrupted bosses.
- **[2026-04-26] World Expansion Finalization**: Completed 5 massive 80x40 "Elite" gauntlets (Highlands, Lighthouse, Southern, Wetlands, Ruins) using a optimized "Clean Slate" tile system for 100% pathing reliability.
- **[2026-04-26] Production Readiness Audit**: Comprehensive codebase audit for "v1.0-beta" release. Verified enemy scaling (Level 50 boss balance), data integrity, and cross-platform UI stability.
- **[2026-04-26] Interactive World Map (v2)**: Implemented 1024x1024 high-fidelity physical map with landmark navigation, party tracking (🚩), and responsive scale-to-fit logic for mobile viewports.
- **[2026-04-26] Save System Guards & Versioning**: Established `SAVE_VERSION` (v4.0) with structural validation and a "Safe Spawn" collision-aware loading guard to prevent out-of-bounds spawning.
- **[2026-04-26] UI/UX Restoration**: Fixed CSS specificity leaks on screens, restored full-height exploration canvas, and synchronized multi-screen visibility state.
- **[2026-04-25] Mobile Control Overhaul**: Implementation of virtual joystick, X/Y action buttons, and proximity-based interaction logic for a native-feeling experience.
- **[2026-04-25] PWA Native Installation**: Integrated high-fidelity icons and a Title Screen "INSTALL" prompt for standalone home-screen play.
- **[2026-04-25] PWA Offline & Update System**: Overhauled service worker (v4.x) with complete asset list, quality-aware sprite caching (Normal ~37 MB / Low ~1.7 MB), and user-facing update toast ("⚔ Update available — Apply & Reload") with spring-in animation. Fixed response clone bug.
- **[2026-04-25] Battle UI Overhaul (Phase 1 & 2)**: Party lunge animations, enemy strike archetypes (physical/magic/debuff CSS), ghost HP drain bars, status icon rows, screen shake, hit-pause, ability info pane, turn bar polish. Fixed double `TurnManager.advance()` bug.
- **[2026-04-25] Sprite Quality Mode Selection**: One-time launch modal (Normal PNG ~37 MB / Low WebP ~1.7 MB). Persisted to localStorage; preloader and story portraits both respect the choice.
- **[2026-04-24] Mobile PWA Stabilization**: Fixed virtual joystick, optimized sprites with WebP downsampling, finalized manifest.
- **[2026-04-24] NPC Restoration & High-Fidelity Sprites**: Directional spritesheet rendering, state-aware interaction bubbles, robust image caching.
- **[2026-04-24] Universal Phase System**: HP-triggered stat transformations for bosses (King Galdor, Spectral Guardian).
- **[2026-04-22] The Ruined Kingdom**: Aethelgard ruins, river-bank geometry, King Galdor mini-boss.
- **[2026-04-20] Combat Animation Restore**: Fixed `action-handler.js` battle overlays and flow.

---

## 🚀 1. Release & Polish (Current Focus)
Ensure the game feels native and polished on all mobile devices across supported breakpoints (iPhone SE 375px → modern 414px).
- **Patch Notes**: "Patch Notes" modal on the Title Screen.
- **iOS Safe Area**: Apply `env(safe-area-inset-*)` padding to fixed UI elements for notch/home-bar devices.
- **Landscape Lock UX**: Improve the rotate-to-landscape prompt for portrait-mode users.
- **Scroll Prevention**: Prevent accidental page scroll during joystick drag and battle interactions.

## 🗺️ 2. Map & World
- **Smooth Enemy Rendering**: Remove heavy pixelation from map canvas enemies.
- **Interactive Map Puzzles**: Environmental puzzles (switches, blocks, traps).
- **Animated Map Tiles**: Wind-blown grass, flowing water, flickering torches.

## 📜 3. Quest & Shop Systems
- **Shop Merchants**: Merchant UI for buying/selling items with Gold.
- **Quest Log**: Dedicated UI to track story and side-quest progress.
- **State-Aware Dialogue**: NPCs react to quest progress.
- **Per-Character Gear**: Individual Weapons and Armor with Equipment UI.

## 📖 4. World Lore & Living World (Current Focus)
Make the dead world feel *haunted* — not empty. Every region, enemy, and NPC should carry a trace of what was lost.

### 4a — Lore Fragments (Collectibles)
Expand `data/lore_fragments.json` to cover all 15 regions. Each region gets 4–6 fragments:
- **Echo Stones**: Environmental lore (who lived here, what destroyed it)
- **Remnant Records**: Journals/letters from people who didn't survive
- **Corrupted Memories**: Fragments found on named enemies (Void Knight, King Galdor's Knights)
- **Eidolon Songs**: Lore from Ria's summons about the pre-Shattering world

Target: **~70 total fragments** across all regions. Readable in the Archive/Bestiary.

### 4b — Enemy Lore Completion
Every enemy in `enemies.json` needs a `lore` field that answers:
1. What were they before corruption?
2. What does the corruption *do* to them (is it painful? mindless? angry?)?
3. Do they remember anything?

Priority enemies: all Tier 2 and all Bosses. Tier 1 can share lore categories (e.g., all Goblins share the King Galdor curse origin).

### 4c — NPC Depth Pass
Each NPC gets 3 tiers of dialogue (not just 1–2 lines):
- **First meeting**: Who they are and where they're from
- **Post-arc**: Reacts to what just happened in the story
- **Endgame**: Reflective — what the world might become

### 4d — Region History Entries
One per region (15 total). Shown on the world map as a readable "Region Record" — a paragraph describing what the place was before the Shattering. Gives players context for why a beautiful ruined map looks the way it does.

### 4e — Faction Codex
Four factions defined with history, goals, and relationship to Valdris:
- **The Summoned** (player party): Eight cross-world warriors
- **The Corrupted** (Valdris's forces): What each enemy type *was* before
- **The Remnants** (surviving NPCs): Isabela, scattered survivors, Oracle lineage
- **The Ancient Ones** (pre-Shattering): Green Emperor, Nexus builders, Tide guardians

---

## 🎬 5. Cutscene & Narrative Presentation
Address the gap between strong written story and flat visual delivery.

### 5a — Cutscene Skip (Priority: High)
- Tap once to complete the current typewriter line instantly
- Tap again to advance to the next line
- Table-stakes UX for any RPG with non-skippable scenes

### 5b — Emotion → Portrait Visual Mapping
- Map `emotion` values already in arc JSON (e.g. `"grave"`, `"shocked"`) to CSS filter overlays on character portraits
- Use `hue-rotate`, `brightness`, and `saturate` — no new assets required
- Dramatically increases scene expressiveness at near-zero cost

### 5c — Cutscene Presentation Modes
Add an optional `"mode"` field to arc JSON chapters for distinct visual treatments:
- `"standard"` — current portrait + typewriter (default)
- `"blackout"` — full black background, centered text only (for Valdris reveals / heavy lore drops)
- `"combat_flashback"` — battle sprite visible + screen shake (for action recall moments)
- Driven entirely by a CSS class toggle in `story.js` — no new engine work

### 5d — Story.js Refactor (Code Health)
- Extract cutscene rendering into a dedicated `js/cutscene.js`
- `story.js` becomes an orchestrator; `cutscene.js` owns portrait management, typewriter, and dialogue queue
- Resolves the current 1643-line monolith mixing save/load/world-map/cutscene logic

### 5e — Intra-Party Dialogue Beats
- Add 2–3 party chemistry moments per arc, triggered after boss defeat
- Example: Rei's reaction to Aya's memory loss evolving across arcs
- Pure data work in arc JSON — zero engine changes

### 5f — Character Moment Content Pass
- Current `char_moment` phases post-boss are structurally defined but content-thin
- Each character moment should reference that arc's specific emotional beat, not be generic
- Tie `char_moment` to arc-specific dialogue in the existing arc JSON format

---

## ⚔️ 6. Battle System Improvements
Polish and close gaps in an already strong combat engine.

### 6a — Enemy AI Extraction (Code Health)
- Extract AI decision logic from `action-handler.js` / `game.js` into a dedicated `js/battle/enemy-ai.js`
- Define `aiRole` values (`predator`, `support`, `berserker`) as priority-weighted action selectors
- Prerequisite for expanding AI role variety without bloating `action-handler.js`

### 6b — Action Handler Split (Code Health)
- Split `action-handler.js` (currently 1038 lines) into:
  - `action-handler.js` — flow coordinator only
  - `ability-resolver.js` — per-ability outcome math
- Remove or formalize the "kept for legacy" dispatch path

### 6c — Vanguard Intercept UI Feedback
- Flash a `"VANGUARD INTERCEPT"` indicator when Slot 2 absorbs a redirected attack
- Matches the existing `CRIT` flash pattern — same implementation effort
- Players currently may not understand *why* an attack redirected

### 6d — Status Effect Counterplay
- Add a Dispel mechanic to at least one hero skill
- Alternatively, allow Swirl reaction to cleanse allied debuffs (infrastructure already exists in `reaction-effects.js`)
- Addresses the freeze/stun dead-turn problem for affected heroes

### 6e — EXP Gap Penalty Smoothing
- Current formula: `clamp(1 - (memberLevel - enemyLevel) / 3, 0, 1)` — hits 0 EXP at +3 levels
- In a 4-person party with uneven KO history, one member can soft-lock progression
- Replace with: `max(0.1, 1 - gap / 5)` — always grants at least 10%, linear ramp to gap 5

---

## 🗺️ 7. Map & World Tools
Reduce maintainability risk and add missing player-facing systems.

### 7a — Browser-Based Tile Editor (Priority: High)
- All 15 map layouts are hand-coded JS tile arrays — largest maintainability risk in the codebase
- Build a minimal HTML canvas tile editor: click-to-paint tiles, export to existing JS array format
- The map data format is clean enough that editor output drops in directly
- Check `tools/` folder for any existing foundation to build on

### 7b — NPC Dialogue → Arc JSON Bridge
- Add an optional `arcDialogue` field to NPC entities in map data
- When set, `story.js` looks up that key in the arc JSON and renders it through the cutscene engine
- Connects the two narrative systems that currently don't talk to each other
- Unlocks richer side-region storytelling (NPC depth pass from §4c) without a new engine

### 7c — Fast Travel System
- Add world-map fast-travel unlocked after first visit to a region
- Save infrastructure already exists — just requires a `visitedRegions` flag set in save state
- Critical for an 80×40 expanded world where backtracking for side content is high friction

### 7d — Encounter Cooldown
- Add a `_encounterCooldown` step counter (minimum ~8 steps between encounters)
- Prevents back-to-back encounters that feel punishing and break exploration flow
- Does not reduce overall encounter density — just distributes it

### 7e — Level Range Documentation Audit
- `map-data.js` comments and `STORY_PROGRESSION.md` have drifted (e.g., Arc 3 comments say Lv 8–12, doc says Lv 12–20)
- One-time pass to align all level range comments to `STORY_PROGRESSION.md` as the single source of truth

---

## 🌍 8. Side-Expansion Story Depth
Side-expansion regions (8 total) currently lack the narrative depth of main arcs.

- Each expansion region needs at minimum 1 lore-giving NPC linked to the arc JSON narrative engine (see §7b)
- Plant "Valdris aftermath" environmental storytelling per region — a former civilization leader's final words as a lore fragment, unlocked on that map
- Aligns with §4a Lore Fragments target of ~70 total

---
*Created for planning discussion. Please add comments or adjust priorities as needed.*
