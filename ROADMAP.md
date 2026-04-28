# RPG+ Development Roadmap

## ✅ Completed Milestones
- **[2026-04-28] System Audit & Roadmap Refresh**: Full codebase audit.
- **[2026-04-28] Level Range Comment Audit (M8)**: Corrected `map-data.js` comments to strictly match `STORY_PROGRESSION.md`.
- **[2026-04-27] Encounter Data Migration & Overworld Declutter**: Removed legacy `enemies_pool` from Arc JSONs, routing Skirmishes and Bestiary directly to `MAP_DEFS.encounterTemplates`. Curated overworld enemies down to 4-5 sentinels per map in favor of the new 8% random encounter system.
- **[2026-04-27] Critical Story Fixes & Arc Depth (C1–C3, S1–S2)**: Verified Arc 7 cast split was already resolved via `arc7_ch1b` ("Reunited"). Confirmed Arc 5→6 tonal break was already fixed. Arc 6 (`Fortress Gates`): added `seal_void` shard reward, new cutscene "What It Used to Be" (Consumed Angel reveal, all 8 cast), expanded boss pre/post dialogue from 3 to 6 lines. Arc 7 (`Inner Sanctum`): expanded Shadow Titan pre-dialogue from 3 to 7 lines with Rei's parallel with Maren the Still, boss cast expanded to all 8, typo fixed. Boss Gauntlet dynamic registry: auto-scans `Story.data.arcs` + `MAP_DEFS`, kills tracked via `Archive.recordKill` centralized in `Battle.setKO`, discovery gate enforced.
- **[2026-04-27] Boss Integration Complete**: Added 11 new enemy entries (forge_sentinel, deep_archpriest, void_stalker, consumed_angel, void_colossus, the_unravelling, sunken_leviathan, river_king, molten_golem, abyssal_kraken, storm_sentinel) with full stats, lore, abilities, and statPhases. Fixed 5 proxy ID bugs in expansion maps. Added map boss entities to all Arc 3–8 main maps. Every map now has a two-layer boss structure.
- **[2026-04-27] Lore & NPC Overhaul**: Rewrote lore_fragments.json (70 fragments) aligned to campaign canon, including 7 Expansion Region specific fragments. Rewrote npcs.js (21 NPCs, 307 dialogue lines). Fixed duplicate void_citadel NPC key (silent Arc 6 dialogue loss). Corrected mire_witch sprite path. Complete lore consistency sweep across all 8 arcs and expansion maps to explicitly align with the "Summoned" premise (main cast learns Aethorian history from Oracle/NPCs rather than knowing it natively).
- **[2026-04-27] Expansion Region Story Depth (E1)**: Fixed 14 NPC `dialogueKey` mismatches across all 7 expansion maps — expansion NPC dialogue now fully functional. Added boss approach triggers (3–4 lines, referencing lore) to all 7 maps: Ashen Foothills (Molten Golem), Northern Highlands (Shadow Dragon), Lighthouse Isles (Abyssal Kraken), Southern Isles (Sunken Leviathan), Eastern Wetlands (Flesh Abomination), Sky Ruins (Storm Sentinel), Riverlands Crossing (River King). Enriched all 7 `completeMsg` strings from generic to emotionally specific story beats.
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
- **[2026-04-25] PWA Offline & Update System**: Overhauled service worker (v4.x) with complete asset list, quality-aware sprite caching (Normal ~37 MB / Low ~1.7 MB), and user-facing update toast with spring-in animation. Fixed response clone bug.
- **[2026-04-25] Battle UI Overhaul (Phase 1 & 2)**: Party lunge animations, enemy strike archetypes, ghost HP drain bars, status icon rows, screen shake, hit-pause, ability info pane, turn bar polish. Fixed double `TurnManager.advance()` bug.
- **[2026-04-25] Sprite Quality Mode Selection**: One-time launch modal (Normal PNG ~37 MB / Low WebP ~1.7 MB). Persisted to localStorage; preloader and story portraits both respect the choice.
- **[2026-04-24] Mobile PWA Stabilization**: Fixed virtual joystick, optimized sprites with WebP downsampling, finalized manifest.
- **[2026-04-24] NPC Restoration & High-Fidelity Sprites**: Directional spritesheet rendering, state-aware interaction bubbles, robust image caching.
- **[2026-04-24] Universal Phase System**: HP-triggered stat transformations for bosses (King Galdor, Spectral Guardian).
- **[2026-04-22] The Ruined Kingdom**: Aethelgard ruins, river-bank geometry, King Galdor mini-boss.
- **[2026-04-20] Combat Animation Restore**: Fixed `action-handler.js` battle overlays and flow.

### M6 — NPC Dialogue → Arc JSON Bridge (Tier 2 Upgrade)
- The existing `dialogueKey` fix routes to the map NPC panel (existing engine)
- Tier 2: add an optional `arcDialogue` field that routes to the full Story Screen with character portraits
- **Not required for arc release cadence** — current NPC panel is sufficient for weekly drops

---

## 🟢 Release & Polish

### ~~P1 — Cutscene Skip~~ (Done)
- Tap once to complete the current typewriter line instantly
- Tap again to advance to the next line
- Bound to the entire cutscene screen, excluding choice buttons

### P2 — iOS Safe Area
- Apply `env(safe-area-inset-*)` padding to fixed UI elements for notch/home-bar devices

### P3 — Landscape Lock UX
- Improve the rotate-to-landscape prompt for portrait-mode users

### P4 — Scroll Prevention
- Prevent accidental page scroll during joystick drag and battle interactions

### P5 — Patch Notes Modal
- "Patch Notes" modal on the Title Screen listing recent updates

---

## 🎬 Cutscene & Narrative Presentation

### ~~N1 — Emotion → Portrait Visual Mapping~~ (Done)
- Map `emotion` values already in arc JSON (e.g. `"grave"`, `"shocked"`) to CSS filter overlays on character portraits
- Used `hue-rotate`, `brightness`, and `saturate` — no new assets required
- Dramatically increases scene expressiveness at near-zero cost

### N2 — Cutscene Presentation Modes
Add an optional `"mode"` field to arc JSON chapters for distinct visual treatments:
- `"standard"` — current portrait + typewriter (default)
- `"blackout"` — full black background, centered text only (for Valdris reveals / heavy lore drops)
- `"combat_flashback"` — battle sprite visible + screen shake (for action recall moments)
- Driven entirely by a CSS class toggle in `story.js` — no new engine work

### N3 — Story.js Refactor (Code Health)
- Extract cutscene rendering into a dedicated `js/cutscene.js`
- `story.js` becomes an orchestrator; `cutscene.js` owns portrait management, typewriter, and dialogue queue
- Resolves the current 1643-line monolith mixing save/load/world-map/cutscene logic

### ~~N4 — Intra-Party Chemistry Beats~~ (Done)
- Added 2–3 party chemistry moments per arc, triggered after boss defeat
- Arcs 1–5 have strong individual character beats; Arcs 6–8 have none
- Pure data work in arc JSON — zero engine changes
- Added Essabella naming the Consumed Angel in Arc 6, Rei and Maren's parallel in Arc 7, and Tao's final eulogy before Arc 8.

### N5 — Character Moment Content Pass
- Current `char_moment` phases post-boss are structurally defined but content-thin in Arc 5
- Each moment should reference that arc's specific emotional beat, not use generic text
- ~~Arc 3: Drake's curse breaking should tie directly to the Dark Phoenix's own trapped cycle~~ (Done)
- ~~Arc 4: Rex's immortality burden should mirror Oremis's failed attempt to cure his people~~ (Done)

---

## 🗺️ Map & World

### M1 — Smooth Enemy Rendering
- Remove heavy pixelation from map canvas enemies

### M2 — Animated Map Tiles
- Wind-blown grass, flowing water, flickering torches

### M3 — Interactive Map Puzzles
- Environmental puzzles (switches, blocks, traps)

### M4 — Browser-Based Tile Editor (Priority: High)
- All 15 map layouts are hand-coded JS tile arrays — largest maintainability risk in the codebase
- Build a minimal HTML canvas tile editor: click-to-paint tiles, export to existing JS array format
- Check `tools/` folder for any existing foundation to build on

### M5 — Fast Travel System
- Add world-map fast-travel unlocked after first visit to a region
- Save infrastructure already exists — just requires a `visitedRegions` flag in save state
- Critical for an 80×40 expanded world where backtracking for side content is high friction

### M6 — NPC Dialogue → Arc JSON Bridge
- Add an optional `arcDialogue` field to NPC entities in map data
- When set, `story.js` looks up that key in the arc JSON and renders it through the cutscene engine
- Prerequisite for advanced expansion story content without a new engine

---

## 📜 Quest & Shop Systems

### Q1 — Shop Merchants
- Merchant UI for buying/selling items with Gold

### Q2 — Quest Log
- Dedicated UI to track story and side-quest progress

### Q3 — State-Aware Dialogue
- NPCs react to arc completion state (foundation already in npcs.js per-arc keys)

### Q4 — Per-Character Gear
- Individual Weapons and Armor with Equipment UI

---

## ⚔️ Battle System

### B1 — Vanguard Intercept UI Feedback
- Flash a `"VANGUARD INTERCEPT"` indicator when Slot 2 absorbs a redirected attack
- Matches the existing `CRIT` flash pattern — same implementation effort

### B2 — Status Effect Counterplay
- Add a Dispel mechanic to at least one hero skill
- Alternatively allow Swirl reaction to cleanse allied debuffs (infrastructure already in `reaction-effects.js`)
- Addresses the freeze/stun dead-turn problem

### B3 — EXP Gap Penalty Smoothing
- Current formula hits 0 EXP at +3 levels — one KO'd member can soft-lock progression
- Replace with: `max(0.1, 1 - gap / 5)` — always grants at least 10%, linear ramp to gap 5

### B4 — Enemy AI Extraction (Code Health)
- Extract AI decision logic from `action-handler.js` into a dedicated `js/battle/enemy-ai.js`
- Define `aiRole` values as priority-weighted action selectors
- Prerequisite for expanding AI role variety without bloating `action-handler.js`

### B5 — Action Handler Split (Code Health)
- Split `action-handler.js` (currently 1038 lines) into flow coordinator + `ability-resolver.js`
- Remove or formalize the "kept for legacy" dispatch path

---

## 📖 World Lore & Living World

### ~~L1 — Lore Fragments — Expansion Regions~~ (Done)
- Added 7 expansion region lore fragments to `lore_fragments.json`.

### L2 — Enemy Lore Completion
Every Tier 2 enemy and all bosses need a `lore` field covering: what they were, what corruption does to them, whether they remember.
- New bosses added this session (forge_sentinel, deep_archpriest, void_stalker, consumed_angel, void_colossus, the_unravelling, sunken_leviathan, river_king, molten_golem, abyssal_kraken, storm_sentinel) already have lore — audit older Tier 2 enemies for gaps.

### L3 — Region History Entries
One "Region Record" per region (15 total) — a paragraph describing what the place was before the Shattering. Shown on the world map as a readable entry. Currently absent for all expansion regions.

### L4 — Faction Codex
Four factions defined with history, goals, and relationship to Valdris:
- **The Summoned** (player party): Eight cross-world warriors
- **The Corrupted** (Valdris's forces): What each enemy type *was* before
- **The Remnants** (surviving NPCs): Essabella, scattered survivors, Oracle lineage
- **The Ancient Ones** (pre-Shattering): Green Emperor, Nexus builders, Tide guardians

---

*Last audited: 2026-04-28. Priority order: Browser-Based Tile Editor (M4) → Story Refactor (N3) → Action Handler Refactor (B5) → Fast Travel (M5).*
