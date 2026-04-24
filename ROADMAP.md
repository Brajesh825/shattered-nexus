# RPG+ Development Roadmap

## ✅ Completed Milestones
- **[2026-04-24] Universal Phase System**: Implemented HP-triggered transformations for bosses (e.g., King Galdor, Spectral Guardian) with high-impact scaling.
- **[2026-04-22] The Ruined Kingdom**: Expanded the South East of Verdant Vale with the Aethelgard ruins, river-bank geometry, and the King Galdor mini-boss.
- **[2026-04-20] Combat Animation Restore**: Fixed the breaks in `action-handler.js` to restore battle overlays and flow.

## 1. NPC System Overhaul (Current Focus)
The world needs to feel reactive and alive. Our goal is a data-driven NPC framework:
- **State-Aware Dialogue**: NPCs change what they say based on quest progress (e.g., Aethelgard ruins cleared).
- **Behavior Profiles**: Define "Citizen," "Merchant," and "Patrol" behaviors without hardcoding individual NPCs.
- **Interaction Raycast**: Better proximity checks for "Talk" and "Shop" interactions.
- **Dynamic Emotes**: Small visual indicators ( ! / ? / ... ) above NPC heads.

## 2. Map Enhancing (Make it feel amazing)
The `map-engine.js` and `map-ui.js` handle tiling and exploration. Remaining work:
- **Smooth Enemy Rendering**: Ensure enemies drawn on the map canvas are rendered smoothly to remove heavy pixelation.
- **Interactive Map Puzzles**: Introduce environmental puzzles (switches, pushing blocks, traps) to make map traversal more engaging.
- **Animated Map Tiles**: Add wind-blown grass, flowing water, and flickering torches to the tile renderer.

## 3. Save & Versioning
- **Save Migration**: In `save.js`, introduce version migration logic to prevent old saves from breaking.
- **Patch Notes**: Add a "Patch Notes" modal to the Title Screen.

## 4. Device Porting & PWA
- **PWA Integration**: Add `manifest.json` and Service Workers for mobile installation.
- **Touch Polish**: Refine D-Pad sensitivity and button sizes for "fat-finger" mobile play.

## 5. Quest & Shop Systems
- **Shop Merchants**: Create the Merchant UI for buying/selling items using Gold.
- **Quest Log**: Implement a dedicated UI to track story and side-quest progress.
To expand progress beyond the party-wide Relic system in a later update:
- **Per-Character Gear:** Implement individual Weapons and Armor that distinctively alter a specific character's stats.
- **Equipment UI:** Expand the inventory screens to gracefully handle gear equipping comparing stats.

## 8. Battle Screen UX Overhaul
The current battle screen lacks clarity for deeper mechanics:
- **Ability Descriptions:** Implement hover tooltips or dedicated info boxes so players can see exactly what a move does, its MP cost, and its cooldown before casting.
- **Clarity & Feedback:** Improve visibility for active buffs/debuffs and make the turn-order bar easier to interpret at a glance.

---
*Created for planning discussion. Please add comments or adjust priorities as needed.*
