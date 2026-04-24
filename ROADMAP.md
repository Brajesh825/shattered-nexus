# RPG+ Development Roadmap

## ✅ Completed Milestones
- **[2026-04-25] PWA Offline & Update System**: Overhauled service worker (v4.x) with complete asset list, quality-aware sprite caching (Normal ~37 MB / Low ~1.7 MB), and user-facing update toast ("⚔ Update available — Apply & Reload") with spring-in animation. Fixed response clone bug.
- **[2026-04-25] Battle UI Overhaul (Phase 1 & 2)**: Party lunge animations, enemy strike archetypes (physical/magic/debuff CSS), ghost HP drain bars, status icon rows, screen shake, hit-pause, ability info pane, turn bar polish. Fixed double `TurnManager.advance()` bug.
- **[2026-04-25] Sprite Quality Mode Selection**: One-time launch modal (Normal PNG ~37 MB / Low WebP ~1.7 MB). Persisted to localStorage; preloader and story portraits both respect the choice.
- **[2026-04-24] Mobile PWA Stabilization**: Fixed virtual joystick, optimized sprites with WebP downsampling, finalized manifest.
- **[2026-04-24] NPC Restoration & High-Fidelity Sprites**: Directional spritesheet rendering, state-aware interaction bubbles, robust image caching.
- **[2026-04-24] Universal Phase System**: HP-triggered stat transformations for bosses (King Galdor, Spectral Guardian).
- **[2026-04-22] The Ruined Kingdom**: Aethelgard ruins, river-bank geometry, King Galdor mini-boss.
- **[2026-04-20] Combat Animation Restore**: Fixed `action-handler.js` battle overlays and flow.

---

## 4. Mobile UI/UX Improvement (Current Focus)
Ensure the game feels native and polished on all mobile devices across supported breakpoints (iPhone SE 375px → modern 414px).
- **Touch Target Sizing**: All buttons and interactive elements must meet 44×44px minimum tap targets.
- **Battle HUD Scaling**: Party status cards, turn bar, and ability buttons must not overlap or clip on small screens.
- **Joystick Feel**: Review dead zone, sensitivity, and visual feedback of the virtual joystick on touch devices.
- **Landscape Lock UX**: Improve the rotate-to-landscape prompt for portrait-mode users.
- **iOS Safe Area**: Apply `env(safe-area-inset-*)` padding to fixed UI elements for notch/home-bar devices.
- **Scroll Prevention**: Prevent accidental page scroll during joystick drag and battle interactions.

## 1. Map Enhancing
- **Smooth Enemy Rendering**: Remove heavy pixelation from map canvas enemies.
- **Interactive Map Puzzles**: Environmental puzzles (switches, blocks, traps).
- **Animated Map Tiles**: Wind-blown grass, flowing water, flickering torches.

## 2. Save & Versioning
- **Save Migration**: Version migration logic in `save.js` to prevent old saves breaking.
- **Patch Notes**: "Patch Notes" modal on the Title Screen.

## 3. Quest & Shop Systems
- **Shop Merchants**: Merchant UI for buying/selling items with Gold.
- **Quest Log**: Dedicated UI to track story and side-quest progress.
- **State-Aware Dialogue**: NPCs react to quest progress.
- **Per-Character Gear**: Individual Weapons and Armor with Equipment UI.

---
*Created for planning discussion. Please add comments or adjust priorities as needed.*
