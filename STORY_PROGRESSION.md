# Story Progression & World Reality Audit

This document defines the two parallel paths of the Shattered Nexus: the **Main Narrative Path** (8 Arcs) and the **Elite Expansion Path** (Side Regions).

## 🟢 The Main Narrative Path (8 Arcs)

These 8 arcs drive the primary story progression. Defeating the boss of one arc automatically unlocks the next main destination.

| Arc | Arc Name | Primary Map | Level Range | Key Objective |
| :--- | :--- | :--- | :--- | :--- |
| **1** | The Rift Awakening | **Verdant Vale** | **1 - 8** | Wake the first Nexus Crystal. |
| **2** | Beneath the Ashes | **Crystal Cavern** | **7 - 15** | Retrieve the Mountain Seal. |
| **3** | The Scorched Spiral | **Ember Wastes** | **12 - 20** | Defeat the Dark Phoenix. |
| **4** | Tides of Fate | **Sunken Temple** | **17 - 25** | Reclaim the Ocean Soul. |
| **5** | Shadow's Heart | **Shadow Reach** | **22 - 30** | Confront the first Void Rift. |
| **6** | Fortress Gates | **Void Citadel** | **27 - 35** | Breach the outer obsidian walls. |
| **7** | Inner Sanctum | **Fortress Ramparts** | **32 - 40** | Climb the Citadel's core. |
| **8** | Shattered Source | **Eternal Void** | **37 - 45** | The final stand against the Source. |

---

## 🟣 The Elite Expansion Path (Side Regions)

These 80x40 "Expansion" maps are high-fidelity side gauntlets. They follow the same overlapping logic to provide a challenging but fair detour.

| Expansion Region | Unlock Requirement | Level Range | Boss Guardian | Geographic Note |
| :--- | :--- | :--- | :--- | :--- |
| **Southern Isles** | Clear **Arc 1** | **10 - 18** | **Sunken Leviathan** | Far South. Early-game abyss. |
| **Riverlands Crossing** | Clear **Arc 1** | **10 - 18** | **River King** | Central Hub. |
| **Northern Highlands** | Clear **Arc 6** | **35 - 43** | **Shadow Dragon** | Far North. Endgame latitude. |
| **Ashen Foothills** | Clear **Arc 3** | **20 - 28** | **Molten Golem** | Central volcanic zone. |
| **Lighthouse Isles** | Clear **Arc 4** | **25 - 33** | **Sea Kraken** | North-West sea routes. |
| **Eastern Wetlands** | Clear **Arc 5** | **30 - 38** | **Flesh Abomination** | Mid-East toxic mire. |
| **Sky Ruins** | Clear **Arc 6** | **35 - 43** | **The Four Kings** | Far North-East floating debris. |

---

## 🛠️ Technical Implementation Notes

- **Arc vs. Map**: The engine treats Arcs 1-8 as the mandatory backbone. Expansion maps are "Side Routes" defined in `js/story.js` under `MAP_SIDE_ROUTES`.
- **Unlock Logic**: Side maps become travel-ready the moment their parent arc is marked as `done`.
- **Level Scaling**: All regions follow the **Smooth-Curve Pattern** (approx. +7 levels per stage with overlap). This prevents sharp difficulty spikes and encourages exploration.
- **Connectivity**: Every 80x40 map (Main and Side) follows the "Safe Haven" standard to ensure NPCs and player starts are never blocked by decorative tiles.
