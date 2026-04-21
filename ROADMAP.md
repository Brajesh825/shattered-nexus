# RPG+ Development Roadmap

This document outlines the detailed roadmap for the next phase of RPG+ (Aethoria Chronicles) development.

## 1. Cutscenes Improvement First
The current `story.js` system linearly processes `narrative` and `dialogue` objects. To make cutscenes feel more dynamic and cinematic, we plan to implement:
- **Final Fantasy Style Portraits:** When characters talk in cutscenes, their idle sprite will appear on screen scaled up as a "half-body" portrait to give a dynamic, classic RPG feel.
- **Typewriter Enhancements:** Implement dynamic typewriter pacing (e.g. slight pauses for punctuation).
- **Cinematic Backdrops:** Enhance the backdrop transition effects to create smooth scene crossfading.
- **Responsive Text Sizing:** Ensure dialogue text sizes scale appropriately for various screens (mobile, ultrawide).

## 2. Map Enhancing (Make it feel amazing)
The `map-engine.js` and `map-ui.js` handle tiling and exploration. To improve the visual fidelity and "feel" of exploration, we will add:
- **Lighting & Shadows:** Introduce a dynamic vignette or lighting gradient around the player character.
- **Ambient Particles:** Add an ambient particle system to the `<canvas>` rendering loop (e.g., leaves in Verdant Vale, embers in Ember Wastes, snow in Crystal Cavern).
- **Camera Polish:** Add smooth camera pan/lerping when following the player rather than rigid grid snapping.
- **Smooth Enemy Rendering:** Ensure enemies drawn on the map canvas are rendered smoothly to remove heavy pixelation.
- **Interactive Map Puzzles:** Introduce environmental puzzles (switches, pushing blocks, traps) to make map traversal more engaging.
- **Audio Feedback:** Add gentle footstep SFX when the player moves.

## 3. Story and World Building with NPCs
Currently, storytelling relies on cutscenes and lore fragments. To make the world feel lived-in:
- **Interactive NPCs:** Expand the entity system to allow placed NPCs on map tiles.
- **Action Triggers:** Add a "talk" interaction raycast on the Spacebar/Interact action.
- **Dialogue Trees:** Write multi-branched dialogue trees and lore snippets for locals in the different Map nodes, bypassing the full cutscene enging for lightweight chats.

## 4. Story Plan and Versioning
As new content and arcs are added, saving game state across updates is crucial:
- **Save Migration:** In `save.js`, introduce version migration logic to prevent old saves from breaking when new arcs or characters are patched in.
- **Patch Notes:** Add a "Patch Notes" modal or version indicator on the Title Screen.
- **Content Organization:** Organize upcoming narrative arcs structurally inside the JSON definitions.

## 5. Porting for Several Devices
To ensure the game is accessible and plays flawlessly on mobile, tablet, and desktop:
- **PWA Integration:** Add a `manifest.json` and a Service Worker to allow the game to be installed as a standalone app on phones.
- **Touch Polish:** Refine the DOM-based D-Pad sensitivity and sizing in `map-ui.js`.
- **UI Scaling:** Ensure combat action buttons and menus are "fat-finger friendly".
- **Responsive Layouts:** Guarantee that CSS resolution scaling symmetrically accommodates both ultrawide monitors and narrow mobile portrait screens.

## 6. Complete Inventory & Item System
Although items exist in the data/ UI, the core loop needs to be fully integrated:
- **Loot Integration:** Allow items to drop from battles and openable chests on the map.
- **Inventory UI Restructuring:** Enhance the pause menu and battle menu inventory screens for better readability and usage flows.
- **Battle & Overworld Usage:** Ensure items (potions, ethers, revives) function perfectly inside and outside of combat, subtracting stock correctly and applying accurate stats.

## 7. Quest & Shop Systems
To provide a true RPG progression cycle outside of the main story:
- **Shop Merchants:** Create an interactive UI for NPC merchants allowing players to buy and sell items/relics using Gold.
- **Quest System:** Introduce side quests (e.g., fetch quests or bounty hunts) given by map NPCs, complete with a dedicated Quest Log UI to track progress and rewards.

## 8. Deep Equipment System (Future Expansion)
To expand progress beyond the party-wide Relic system in a later update:
- **Per-Character Gear:** Implement individual Weapons and Armor that distinctively alter a specific character's stats.
- **Equipment UI:** Expand the inventory screens to gracefully handle gear equipping comparing stats.

## 9. Battle Screen UX Overhaul
The current battle screen lacks clarity for deeper mechanics:
- **Ability Descriptions:** Implement hover tooltips or dedicated info boxes so players can see exactly what a move does, its MP cost, and its cooldown before casting.
- **Clarity & Feedback:** Improve visibility for active buffs/debuffs and make the turn-order bar easier to interpret at a glance.

---
*Created for planning discussion. Please add comments or adjust priorities as needed.*
