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
*Created for planning discussion. Please add comments or adjust priorities as needed.*
