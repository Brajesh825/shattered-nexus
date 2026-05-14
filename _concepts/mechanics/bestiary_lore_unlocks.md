# 📜 Concept: Bestiary Lore Unlocks & Dynamic Story Archive Hydration

## 🎯 Core Objectives
Currently, `data/lore_fragments.json` populates `window.LORE_FRAGMENTS` beautifully with rich, deep narrative history tracking Valdris, Essabella, and the five ancient civilizations. However, the UI method `ArchiveUI.renderList()` expects `Archive.data.story[frag.id]` to be true, and the invocation logic for `Archive.recordStoryFragment()` is completely missing across the game engine. 

To ensure players unlock entries dynamically as they progress, this concept outlines a unified **Auto-Evaluation Pipeline** embedded natively inside the Bestiary state manager.

---

## 🏛️ Architectural Blueprint

### 1. Smart Evaluation Method (`Archive.evaluateLoreUnlocks`)
Inject a real-time evaluator function inside `js/systems/archive.js` that inspects game progress metrics (`Archive.data.bestiary` encounter registers, current Map context, and `Story.arcIdx`) to retroactively and dynamically activate appropriate lore fragments:
*   **Foundational Knowledge**: Unlocked immediately upon encountering any enemy/map to seed the Bestiary with core context (`world_five_civilizations`, `world_verdant_throne`, `valdris_origin`, `valdris_star_maps`, `valdris_nexus_discovery`, `world_nexus_purpose`, `world_relics`, `world_oracle_lineage`, `world_fallen_angels`, `essabella_vessel`).
*   **Boss / Regional Dependency Triggers**:
    *   *Verdant Vale* (`galdor_king`, `void_knight`): unlocks `vale_green_emperor`, `vale_king_galdor`, `vale_before`, `vale_void_knight_name`, `vale_bridge_ward`, `valdris_seduction_emperor`, `valdris_galdor`.
    *   *Crystal Cavern* (`demon_lord`, `spectral_guardian`): unlocks `world_ashveil_kingdom`, `valdris_seduction_archivist`, `cavern_demon_lord_origin`, `cavern_archivist`, `cavern_ghost_knight`, `npc_archivist_distinction`.
    *   *Ember Wastes* (`forge_sentinel`, `dark_phoenix`): unlocks `world_forge_lords`, `world_forge_lords_vault`, `valdris_seduction_forge`, `wastes_forge_lords_end`, `wastes_dark_phoenix`, `wastes_drake_ash`.
    *   *Sunken Temple* (`deep_archpriest`, `kraken`): unlocks `world_tide_priests`, `world_tide_water_market`, `valdris_seduction_tide`, `temple_tide_civilization`, `temple_water_market`, `temple_transformed_people`, `temple_kraken_guardian`, `temple_valdris_speaks`, `essabella_kraken`.
    *   *Expansion / Side Encounters*: encountering side bosses natively unlocks companion records (`sunken_leviathan` $\rightarrow$ `southern_isles_before`, `npc_survivor_southern_isles`; `river_king` $\rightarrow$ `riverlands_river_king`, `npc_old_guard_riverlands`; `molten_golem` $\rightarrow$ `ashen_foothills_mines`).

### 2. Live Runtime Interception Hooks
*   **Map Dialogue Evaluation**: Inside `js/map/map-engine.js`, within `_startNPCDialogue(npc)`, trigger `Archive.recordStoryFragment(npc.id)` and `Archive.recordStoryFragment(npc.dialogueKey)` directly.
*   **Robust Record Insertion**: Expand `Archive.recordStoryFragment()` to map entity keys intelligently to targets prefixed with `npc_` or matching region labels.

---

## 🛡️ Integration Check-Offs
- [x] **Concept Staging**: Registered inside `_concepts/mechanics/bestiary_lore_unlocks.md` following **The Curator's** strict directives.
- [x] **Archive Subsystem Injection**: Build and wire `evaluateLoreUnlocks()` inside `js/systems/archive.js`.
- [x] **Dialogue Layer Hooks**: Wire real-time reporting inside `js/map/map-engine.js`.
- [x] **Service Worker Refresh**: Bump `CACHE_NAME` in `sw.js` to ensure production caching invalidates stale references.
