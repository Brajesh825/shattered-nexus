# Concept: Relic Synthesis & Crafting

## Overview
We have a robust shop economy and dropped loot, but to give monster drops a meaningful late-game purpose, we need a **Relic Synthesis** system. This prevents old accessories from becoming useless and rewards grinding/exploration.

## How It Works
At specific safe zones (like the Crystal Forger in Crystal Caverns F1), players can access the **Synthesis Anvil**.

### The Mechanics
Instead of just buying higher-tier Relics with Gold, the absolute best Relics in the game must be forged by combining:
1. **Base Relics**: Outdated, low-tier relics (e.g., *Iron Ring* +10 DEF).
2. **Monster Materials**: Rare drops from specific enemies (e.g., *Void Cornea*, *Wyvern Scale*).
3. **Synthesis Catalyst**: A rare item found only in hidden chests or rewarded from the Rumor Board (World Quests).

### Example Recipes
*   **Titan's Band (+40 DEF, Nullifies Stun)** 
    *   *Requires*: 2x Iron Ring, 5x Golem Core, 1x Earth Catalyst, 500G
*   **Abyssal Pendant (+30 MAG, 15% Lifesteal on Magic)**
    *   *Requires*: 1x Coral Pendant, 3x Void Cornea, 1x Dark Catalyst, 1000G

## Implementation Complexity: LOW-MEDIUM
*   **Data**: Add a `recipes.json` file linking target item IDs to required component IDs.
*   **Engine**: We already have inventory management and items. The UI would just need a "Craft" tab at the shop that checks if `Inventory.has(components)` before calling `Inventory.remove(components)` and `Inventory.add(target)`.
