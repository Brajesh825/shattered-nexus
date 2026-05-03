# ⚔️ RPG+ Development Roadmap: Beta 1.0

## 🎯 Current Objective: The First Release
**Scope**: Full playable experience through Arcs 1 & 2, including the first two Expansion Regions.


### 🔷 Phase 4: Input & Accessibility
- [x] **Mobile Joystick**: Virtual joystick fully wired — touchstart/move/end → `MapInput.setVector` → player movement.
- [x] **Mobile Action Buttons**: `#btn-x` (✦ Interact) and `#btn-y` (☰ Menu) wired and labelled.
- [x] **Input Settings Screen**: In-game overlay (`⌨ CONTROLS` in pause menu) shows all keyboard + gamepad bindings; click any row to remap; persists to `localStorage`.
- [x] **Control Hints Bar**: Contextual hint bar slides up from bottom on keyboard/gamepad input, auto-hides on mouse/touch, updates context per screen.
- [ ] **Battle Touch**: Tap-to-navigate battle command buttons via on-screen virtual buttons during combat.
- [ ] **Gamepad on World Map**: Extend gamepad polling to drive cursor movement and node selection on the world map screen.

### 🔷 Phase 3: Content & Balance
- [x] **Boss Balancing**: Final tuning pass on Spectral Guardian, Sunken Leviathan, and River King.
- [ ] **Gold Balance**: Tune enemy gold drops to ensure shops feel meaningful.

### 🔷 Phase 5: Release Readiness
- [ ] **Walkthrough Update**: Finalize the step-by-step guide for Arc 1 and Arc 2.
- [ ] **Beta Lock**: Set `MAX_REACHABLE_ARC: 1` in `release-config.js` for the public itch.io push.
- [ ] **Deployment Script**: Finalize a script to minify/obfuscate core logic for the production build.
- [x] **PWA Cache Fix**: Removed missing `lulu_sheet_1` sprite entries from `sw.js`; cache bumped to v7.0.
- [ ] **Production Debug Gate**: Route `LogDebug`, story diagnostics, and verbose console output through `ReleaseConfig.IS_DEV` / `?debug=true`.
- [ ] **Dev-Only Save Sync**: Wrap the `127.0.0.1:3000/sync` save backup bridge behind a development flag so production saves stay local-only.

---

## 🛠️ Technical Debt & Engineering (Prioritized)
### P0 - Release Blockers
- [ ] **Cache Manifest Test**: Add a test that verifies every asset listed in `sw.js` exists on disk, starting with the missing `lulu_sheet_1` entries.
- [ ] **Content Integrity Tests**: Validate enemy images, story references, item effect handlers, map references, and relic definitions before release.
- [ ] **Production/Dev Boundary**: Gate localhost save sync, debug battle tools, verbose logs, and diagnostic overlays behind `ReleaseConfig.IS_DEV` / `?debug=true`.

### P1 - Stability & Maintainability
- [ ] **Encapsulate Turn State**: Replace loose `G.turnIdx`, `G.turnQueue`, and battle locks with a centralized `G.turn` object. (Verified still in use.)
- [ ] **Named Damage Modifiers**: Refactor the combat damage chain so STAB, affinity, reactions, mitigation, crits, passives, and relics are named steps.
- [ ] **HTML Injection Guardrails**: Add escaping/DOM-builder helpers for UI generated from imported saves, JSON content, archive entries, and dialogue.
- [ ] **JSON Loading Standard**: Move story, map, and data loading onto one `DataLoader.loadJson()` helper instead of mixing `fetch` and `XMLHttpRequest`.
- [ ] **Null Guard Standard**: Standardize optional access and fallback behavior across battle, story, map, and save hydration paths.

### P2 - Performance & Architecture
- [ ] **Asset Weight Pass**: Convert oversized character/map PNGs to optimized WebP/AVIF and default mobile users to low-quality sprite mode.
- [ ] **Boot Flow Manifest**: Replace the long manual script list in `index.html` with a maintained boot manifest or production bundle pipeline.
- [ ] **Global State Split**: Separate `G` into `GameState`, `BattleState`, `MapState`, and `ProgressState` once the release blockers are handled.
- [ ] **Large Module Split**: Break up `svg-animations.js`, `story.js`, `map-engine.js`, and `action-handler.js` by loader, renderer, state, and action responsibilities.

---

## ✅ Completed Milestones (Condensed)

### 🎨 UX & Systems (May 2026)
- [x] **Item Vault Overhaul**: Premium, tabbed inventory with visual targeting and unified effect engine.
- [x] **Data Integrity Audit**: Full scan of all JSON assets; resolved ID conflicts and parsing errors.
- [x] **Party Menu Overhaul**: Premium, paginated character showcase with ethereal effects and responsive split-views.
- [x] **Global UX Polish**: Pixel-art cursor, custom scrollbars, and stabilized navigation flows.
- [x] **Sprite System Optimization**: Removed 700+ lines of legacy procedural code; standardized all fallbacks to 'aya' (hero) and 'slime' (enemy).
- [x] **Audio System**: Full BGM support with crossfading and placeholder audit completed for all maps.
- [x] **Camp-Only Saving**: Save removed from pause menu; `💾 SAVE PROGRESS` lives exclusively in the Camp menu.
- [x] **Echo Quest System**: Data-driven hunt/gather quests from `data/quests.json`; NPC `giveQuest` field; arc auto-unlock via `onArcAdvance`. *(Concept: `world_quests_and_rumors.md`)*
- [x] **World Corruption & Fog**: Time-based corruption accumulation in wild zones, visual void-purple decay, mutant encounter scaling. *(Concept: `corruption_and_infection.md`)*
- [x] **Character Recruitment Reorder**: Valka → Arc 4 (Sunken Temple), Rex → Arc 5 (Shadow Reach), Drake → Arc 3.

### 🌍 World & Map Foundations (May 2026)
- [x] **Arc 1 (Verdant Vale)**: Narrative, enemies, and Void Knight boss finalized.
- [x] **Arc 2 (Crystal Cavern)**: Full 3-floor suite (F1-F3) with Spectral Guardian boss.
- [x] **Multi-Floor Navigation**: Dynamic World Map entry; selectable destinations for multi-floor dungeons; fixed Crystal Cavern floor-skipping bug.
- [x] **Expansion Regions**: Southern Isles and Riverlands Crossing lore and map implementations completed.
- [x] **SVG Asset Standard**: All environmental assets converted and preloaded as high-fidelity SVGs.

### ⚙️ Technical Foundations (April 2026)
- [x] **Combat Engine Audit**: Fixed `getStat('reduction')` bug and stabilized damage multipliers.
- [x] **Sera/Lyra Registration**: Standardized sprite-sheet configuration for new heroes to fix 'whole-sheet' rendering bug.
- [x] **Mobile Controls**: Virtual joystick and X/Y button implementation.
- [x] **Architect Pro**: Browser-based tile editor for high-fidelity map creation.
- [x] **Story Refactor**: Extracted cutscene logic into `js/cutscene.js`.

---
*Last Audited: 2026-05-03 23:00. Status: Stable. Priority: Resonance Weapons System.*
