# ⚔️ RPG+ Development Roadmap: Beta 1.0

## 🎯 Current Objective: The First Release
**Scope**: Full playable experience through Arcs 1 & 2, including the first two Expansion Regions.


### 🔷 Phase 2: Beta 1.0 Map Polish
- [x] **Southern Isles Lore**: Sunken Leviathan and archipelago concept finalized.
- [x] **Southern Isles Implementation**: Map `.json` generated, but needs palm trees, water shaders, and stilt-house SVGs.
- [x] **Riverlands Crossing Lore**: Great Bridge and River King guardian finalized.
- [x] **Riverlands Implementation**: Base map generated. Needs stone bridges and flowing water visual polish.
- [x] **Crystal Caverns F3 Tweaks**: Finalized the ice castle layout and the southern ruins where the Spectral Guardian resides.

### 🔷 Phase 3: Audio & System Polish
- [ ] **Music Integration**: Add BGM (Background Music) and SFX for the following:
  - [ ] Map Exploration
  - [ ] Regular Encounters
  - [ ] Boss Battles
- [ ] **Item Audit**: Verify that all 20+ items in `data/items.json` have correct logic in `inventory.js`.
- [ ] **Boss Balancing**: Perform a final tuning pass on the Spectral Guardian, Sunken Leviathan, and River King.
- [ ] **Gold Balance**: Tune enemy gold drops to ensure shops feel meaningful.
- [ ] **UI Scaling**: Ensure the "Item Submenu" in battle is perfectly readable on iPhone SE/XR.

### 🔷 Phase 5: Release Readiness
- [ ] **Walkthrough Update**: Finalize the step-by-step guide for Arc 1 and Arc 2.
- [ ] **Beta Lock**: Set `MAX_REACHABLE_ARC: 1` in `release-config.js` for the public itch.io push.
- [ ] **Deployment Script**: Finalize a script to minify/obfuscate core logic for the production build.
- [ ] **PWA Cache Fix**: Remove or replace missing `lulu_sheet_1` sprite entries in `sw.js` so offline install does not cache broken URLs.
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

### 🌍 World & Map Foundations (May 2026)
- [x] **Arc 1 (Verdant Vale)**: Narrative, enemies, and Void Knight boss finalized.
- [x] **Arc 2 (Crystal Cavern)**: Full 3-floor suite (F1-F3) with Spectral Guardian boss.
- [x] **Expansion Foundations**: Generated `.json` terrain grids for Southern Isles and Riverlands.
- [x] **SVG Asset Standard**: All environmental assets converted and preloaded as high-fidelity SVGs.

### ⚙️ Technical Foundations (April 2026)
- [x] **Combat Engine Audit**: Fixed `getStat('reduction')` bug and stabilized damage multipliers.
- [x] **Mobile Controls**: Virtual joystick and X/Y button implementation.
- [x] **Architect Pro**: Browser-based tile editor for high-fidelity map creation.
- [x] **Story Refactor**: Extracted cutscene logic into `js/cutscene.js`.

---
*Last Audited: 2026-05-02. Priority: Technical Debt Resolution.*
