# 📜 Concept: Regional Shops, Economy & Supply Pouch Restrictions

## 🎯 Core Objectives
Gold is continuously collected across free-roam and narrative maps, but players currently lack a resource sink. This concept establishes a high-fidelity **Regional Shop System** coupled with a **Supply Pouch limit** to prevent infinite consumable hoarding and restore strategic attrition before descending into dungeon depths.

---

## 🏛️ Architectural Blueprint

### 1. Data Structure (`js/data/merchants.json`)
Define an explicit static catalog mapping unique merchants to tailored arrays of items/relics and premium pricing tiers:
*   **Outpost Quartermaster** (`outpost_quartermaster` mapped exclusively to `soldier_2` in `verdant_vale`): Sells Potions (50G), Antidotes (40G), Ethers (100G), Smoke Bombs (60G), Iron Helm (250G), and Silver Lock (400G).
*   **Drowned Trader** (`drowned_trader` mapped exclusively to `isle_merchant` in `southern_isles`): Sells Hi-Potions (150G), Kraken Ink (300G), Sea Pearl (600G), Sea Crystal (450G), and Water Seal Fragment context elements.
*   **Riverlands Crossing Trader** (`riverlands_merchant` mapped exclusively to `guilt_ridden_merchant` in `riverlands_crossing`): Sells Tents (200G), Cursed Straw (150G), Shadow Shards, and Barrier Stones.

### 2. Supply Pouch & Economy Constraints
*   **Restock Attrition**: Enforce strict purchase limits on standard consumables so players cannot carry more than 15 of a single combat restoration item, keeping combat tightly balanced.
*   **Shared Party Vault**: Calculate aggregate spending pools by combining gold across all alive/KO party members.

### 3. Engine Integration Hooks
*   **Synthetic Shop Dialogue Action**: Append a `{ _type: 'shop', merchantId: npc.id }` action onto dialogue outputs inside `js/map/map-engine.js` whenever the target NPC is a recognized trader.
*   **Interactive Modal Design**: Implement `ShopUI` inside `js/ui/shop-ui.js` featuring Premium Vivid glassmorphism interfaces, item icon galleries, detailed stat sheets, and Buy/Sell item switches.

---

## 🛡️ Integration Check-Offs
- [x] **Concept Staging**: Registered inside `_concepts/mechanics/shops_and_economy.md` under **The Curator's** oversight.
- [x] **Data Subsystem Creation**: Build `js/data/merchants.json` mapping strictly one unique NPC ID per region to prevent alias cross-over.
- [x] **Data Loader Wiring**: Register `merchants.json` inside `js/data-loader.js`.
- [x] **Engine Interception Layer**: Hook synthetic line array routing inside `js/map/map-engine.js` with exact ID queries.
- [x] **Modal Interface Build**: Code `js/ui/shop-ui.js` with premium vivid aesthetics and inject into `index.html` overlay wrappers.
- [x] **Service Worker Sync**: Bump `CACHE_NAME` in `sw.js` to ensure immediate production uptake.
