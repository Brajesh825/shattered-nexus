# Story Progression & World Reality Audit

This document defines the two parallel paths of the Shattered Nexus: the **Main Narrative Path** (8 Arcs) and the **Elite Expansion Path** (Side Regions).

Each location has two boss layers:
- **Map Boss** — a powerful entity encountered during exploration. Defeated on the map itself.
- **Arc Story Boss** — the Fragment anchor or narrative boss. Triggered by the arc engine at the end of the arc chapter.

---

## 🟢 The Main Narrative Path (8 Arcs)

| Arc | Arc Name | Primary Map | Level Range | Map Boss | Arc Story Boss | Key Objective |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | The Rift Awakening | **Verdant Vale** | **1 – 8** | **King Galdor** `galdor_king` — The Goblin King. Cursed sovereign of Aethelgard, soul bound to Void-Gild. Guards the Vale ruins. | **Void Knight** `void_knight` — Arren. A Vale soldier stripped of self by Valdris, kept as a guardian of the Light Fragment. | Retrieve the Light Seal Fragment. |
| **2** | Beneath the Ashes | **Crystal Cavern** | **7 – 15** | **Spectral Guardian** `spectral_guardian` — The Crystal Sentinel. Pre-civilization guardian of the Sky Archive's underground relay. Shatters into a glass cannon at 40% HP. | **Demon Lord** `demon_lord` — Chief Archivist Solvan. Fused to the Fire Fragment, endlessly absorbing elemental memory, siphoning knowledge to Valdris. | Retrieve the Fire Seal Fragment. |
| **3** | The Scorched Spiral | **Ember Wastes** | **12 – 20** | **Forge Sentinel** `forge_sentinel` — The last automated guardian of the Forge Lords' outer perimeter. Not Dara, but built by her. Still running its final instruction because Void-metal doesn't stop. | **Dark Phoenix** `dark_phoenix` — A creature of renewal with its death-cycle removed by Valdris. Burns endlessly, waiting for a spring that cannot come. | Retrieve the Earth Seal Fragment. |
| **4** | The Weeping Depths | **Sunken Temple** | **17 – 25** | **Deep Archpriest** `deep_archpriest` — One of Oremis's inner council. Transformed first by proximity, deeper in the temple. Still performs healing rites — rites that now spread corruption. The first thing the party fights that used to heal people. | **Sea Kraken** `kraken` — High Archpriest Oremis merged with his congregation. Went to the deep to find a cure, became the corruption. Still trying to heal. | Retrieve the Seal Fragment of Wind. |
| **5** | Shadow's Heart | **Shadow Reach** | **22 – 30** | **Void Stalker** `void_stalker` — A Void Rift spawn that has achieved enough mass to take permanent form. Not a former person — pure Rift antibody given a body by accumulated despair. | **Fallen Angel** `fallen_angel` — Commander Veleth. Essabella's first lieutenant, consumed by Valdris. Essabella sends the party knowing what they will find. | Breach the first Void Rift. |
| **6** | Fortress Gates | **Void Citadel** | **27 – 35** | **Consumed Angel** `consumed_angel` — One of Essabella's Fallen Angels, taken by Valdris and placed as a guardian of the inner gate. The party recognises the wings. | **Void Warden** `void_warden` — Valdris's last mortal strategist. Stood at the gate so long that willing service became irrelevant. Holds the outer wall. | Breach the obsidian outer walls. |
| **7** | Inner Sanctum | **Fortress Ramparts** | **32 – 40** | **Void Colossus** `void_colossus` — Six centuries of Valdris absorbing world data has left residue. The Colossus is crystallised ambient data given weight and hostility. A preview of what the final confrontation will feel like. | **Shadow Titan** `shadow_titan` — Maren the Still and all Shadow Keepers. Sacrificed themselves as a barrier around the Void Seal. Six hundred years of refusal given form. | Reach Valdris's inner chamber. |
| **8** | The Shadow Emperor | **Eternal Void** | **37 – 45** | **The Unravelling** `the_unravelling` — The Void itself reacting to the party's presence. Not a creature. A process. Loses coherence as the Fragments are assembled — the last resistance before the weight lifts. | **Shadow Emperor** `shadow_emperor` — Valdris. The Living Core of Aethoria's archive implanted in his own heart. Final confrontation. | Recover the Core. End the hunger. |

---

## 🟣 The Elite Expansion Path (Side Regions)

| Expansion Region | Unlock | Level Range | Map Boss (Entity ID) | Lore Identity | Geographic Note |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Southern Isles** | Clear Arc 1 | **10 – 18** | **Sunken Leviathan** `sunken_leviathan` | An oceanic apex predator drawn to the concentrated elemental resonance of the submerged coastal cities. Valdris found it already there and ensured it stayed. | Far South. Early abyss. |
| **Riverlands Crossing** | Clear Arc 1 | **10 – 18** | **River King** `river_king` | A water spirit that governed the crossing for centuries by collecting a truth as toll. Tried to stay neutral. The corruption entered through the neutrality agreement itself. | Central Hub. |
| **Ashen Foothills** | Clear Arc 3 | **20 – 28** | **Molten Golem** `molten_golem` | Grand Forgemaster Dara. Became the indestructible thing her civilization always sought. Still protecting the deepest forge shaft. Still performing the last instruction her mind could hold. | Central volcanic zone. |
| **Lighthouse Isles** | Clear Arc 4 | **25 – 33** | **Abyssal Kraken** `abyssal_kraken` | A separate sea creature from Oremis. Drawn to the Lighthouse Isles' submerged elemental resonance. Distinct from the Sunken Temple Kraken in origin and identity. | North-West sea routes. |
| **Eastern Wetlands** | Clear Arc 5 | **30 – 38** | **Flesh Abomination** `abomination` | Accumulated organic matter of everything that has died in the mire for three centuries. Not a single creature — a colony of decomposition given purpose by the corruption's hunger. | Mid-East toxic mire. |
| **Northern Highlands** | Clear Arc 6 | **35 – 43** | **Shadow Dragon** `dragon` | The last of seven dragons. Six faded as the Seals weakened. This one survived by absorbing void energy in place of elemental resonance. Alive. No longer purely what it was. The Highland Monk prays for it every dawn. | Far North. Endgame latitude. |
| **Sky Ruins** | Clear Arc 6 | **35 – 43** | **Four Kings** — four simultaneous bosses: `lich` (The Pale King), `dark_knight` (The Ebon Champion), `bone_dragon` (The Skeletal Maw), `storm_sentinel` (Storm Sentinel) | Valdris's lieutenants placed in the pre-civilization Sky Ruins as throne guardians. The ruins themselves predate all five civilizations and respond to elemental resonance, not force. | Far North-East floating ruins. |

---

## 🛠️ Technical Implementation Notes

- **Arc vs. Map**: The engine treats Arcs 1–8 as the mandatory backbone. Expansion maps are "Side Routes" defined in `js/story.js` under `MAP_SIDE_ROUTES`.
- **Boss Layers**: Map bosses are defined in `js/map/data/map-*.js` via `isBoss: true` on the entity. Arc story bosses are defined in `data/story/arc_N.json` via `boss_enemy`. These are two independent systems.
- **Unlock Logic**: Side maps become travel-ready the moment their parent arc is marked as `done`.
- **Level Scaling**: All regions follow the **Smooth-Curve Pattern** (approx. +7 levels per stage with overlap). This prevents sharp difficulty spikes and encourages exploration.
- **Connectivity**: Every 80x40 map (Main and Side) follows the "Safe Haven" standard — NPCs and player starts are never blocked by decorative tiles.
