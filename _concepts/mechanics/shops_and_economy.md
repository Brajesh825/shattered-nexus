# Concept: Regional Shops & The Economy

## Overview
Currently, the game has `items.json` and enemies drop `gold`, but there is no way to spend that gold. To prevent the economy from becoming meaningless, we need a robust Shop System that ties into the lore and forces strategic decisions.

## How It Works: The "Supply Pouch" Limit
In many classic RPGs, players hoard 99 Potions and brute-force bosses. To maintain tactical depth, the game will enforce a **Supply Pouch**. 
- Players cannot carry infinite items. The pouch holds max stacks (e.g., 5x Potions, 3x Ethers, 1x Phoenix Down).
- Shops become incredibly important as **Restock Points** before heading into a dungeon floor, rather than places to hoard.

## Regional Merchants
Instead of one generic shop screen, merchants are tied to the lore of the 5 maps. They each have unique, static inventories.

1. **The Outpost Quartermaster (Verdant Vale)**
   - *Lore*: A surviving Aethelgard quartermaster selling scavenged military supplies.
   - *Inventory*: Standard Potions (50G), Ethers (100G), and low-tier Relics (e.g., "Iron Ring" for +10 DEF).

2. **The Drowned Trader (Southern Isles)**
   - *Lore*: The ghost market trader. She sells things recovered from the shipwreck and the deep.
   - *Inventory*: Hi-Potions (150G), Water-ward Relics (e.g., "Coral Pendant"), and unique consumables like "Abyssal Ink" (inflicts blind).
   - *Mechanic*: Items here are extremely expensive (3x markup) until the player completes the "Drowned Ledger" side quest, which fixes her prices.

3. **The Crystal Forger (Crystal Cavern F1)**
   - *Lore*: An automated Sky Archive terminal that requires Gold as "processing material."
   - *Inventory*: Sells Hi-Ethers, Magic-boosting Relics, and single-use "Crystal Shards" (cast a random elemental spell).

## Implementation Complexity: MEDIUM
- **Data Structure**: We need to add a `merchants.json` file that defines arrays of item IDs and prices for each specific merchant.
- **Map Engine**: We add a new trigger type: `type: 'shop', merchantId: 'drowned_trader'`.
- **UI Element**: We need a dedicated Shop UI modal overlay. It lists the merchant's items, shows the player's current Gold, and has Buy/Sell tabs. Selling old Relics should be the primary way to afford the extremely expensive endgame items.
