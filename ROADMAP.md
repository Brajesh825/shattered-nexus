# RPG+ Development Roadmap

## ✅ Completed Milestones
- **[2026-04-25] Battle UI Overhaul (Phase 1)**: Implemented party lunge animations (idle→prepare→lunge→attack→return→idle), enemy strike archetypes (physical/magic/debuff via pure CSS), ghost HP drain bars, colored initial-letter badges for party tokens, enemy HP numbers, pop-text types, and low-HP turn bar pulse. Fixed critical double `TurnManager.advance()` bug in `ActionEngine` for enemy actions.
- **[2026-04-24] Mobile PWA Stabilization**: Fixed virtual joystick logic, optimized high-res sprites with WebP downsampling for mobile memory efficiency, and finalized manifest integration.
- **[2026-04-24] NPC Restoration & High-Fidelity Sprites**: Restored directional spritesheet rendering, state-aware interaction bubbles, and robust image caching.
- **[2026-04-24] Universal Phase System**: Implemented HP-triggered transformations for bosses (e.g., King Galdor, Spectral Guardian) with high-impact scaling.
- **[2026-04-22] The Ruined Kingdom**: Expanded the South East of Verdant Vale with the Aethelgard ruins, river-bank geometry, and the King Galdor mini-boss.
- **[2026-04-20] Combat Animation Restore**: Fixed the breaks in `action-handler.js` to restore battle overlays and flow.

## 1. Map Enhancing (Make it feel amazing)
The `map-engine.js` and `map-ui.js` handle tiling and exploration. Remaining work:
- **Smooth Enemy Rendering**: Ensure enemies drawn on the map canvas are rendered smoothly to remove heavy pixelation.
- **Interactive Map Puzzles**: Introduce environmental puzzles (switches, pushing blocks, traps) to make map traversal more engaging.
- **Animated Map Tiles**: Add wind-blown grass, flowing water, and flickering torches to the tile renderer.

## 2. Save & Versioning
- **Save Migration**: In `save.js`, introduce version migration logic to prevent old saves from breaking.
- **Patch Notes**: Add a "Patch Notes" modal to the Title Screen.

## 3. Quest & Shop Systems (Current Focus)
- **Shop Merchants**: Create the Merchant UI for buying/selling items using Gold.
- **Quest Log**: Implement a dedicated UI to track story and side-quest progress.
- **State-Aware Dialogue**: NPCs change what they say based on quest progress (e.g., Aethelgard ruins cleared).
To expand progress beyond the party-wide Relic system in a later update:
- **Per-Character Gear:** Implement individual Weapons and Armor that distinctively alter a specific character's stats.
- **Equipment UI:** Expand the inventory screens to gracefully handle gear equipping comparing stats.

## ✅ [2026-04-25] Battle UI Polish (Phase 2) — Complete
- Ability Info Pane wired (name, MP cost, description on hover/focus).
- Status icon row with turn counts on party status cards.
- Screen shake (`triggerScreenShake` + `.battle-scene-shake`) on heavy hits and ultimates.
- Hit pause / party flash fires at impact frame (t=280ms) inside `enemyStrike`.

## 4. Sprite Quality Mode Selection
Ask the player during launch/preload whether they want **Full HD** or **Normal** sprite quality, and persist the choice. All sprite loads must respect the preference:
- **Launch Modal**: Show a one-time quality picker before the preloader starts — two clear options with a short description of the tradeoff (detail vs. load time/memory).
- **Persistence**: Save the choice to `localStorage` (`spriteQuality: 'hd' | 'normal'`) so returning players skip the picker.
- **Preloader Integration**: Route all sprite URLs through a resolver that swaps path prefix or filename suffix based on the stored preference (e.g. `images/sprites/hd/` vs `images/sprites/`).
- **In-Game Toggle**: Expose the setting in the Options/Settings screen so players can change it later without clearing storage.

---
*Created for planning discussion. Please add comments or adjust priorities as needed.*
