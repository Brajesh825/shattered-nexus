# RPG+ Development Roadmap

## ✅ Completed Milestones
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

---
*Created for planning discussion. Please add comments or adjust priorities as needed.*
