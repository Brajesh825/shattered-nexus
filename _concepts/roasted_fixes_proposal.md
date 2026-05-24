# Concept: Roasted Fixes Proposal

This concept document details the architectural, technical, and content changes required to address the primary mechanical shortcuts, documentation gaps, assets inefficiencies, and copyright-vulnerable elements identified in the *Shattered Nexus* codebase.

---

## 1. Purging the "Cold Migration" Hack
The inline regex search-and-replace script embedded in the `<head>` of [index.html](file:///c:/Users/ASUS/VVI/rpg+/index.html#L34-L54) exposes the development history of ripping character concepts directly from *Genshin Impact*. 

### Proposed Action
* **Remove Script from entry point:** Completely delete the self-invoking function from [index.html](file:///c:/Users/ASUS/VVI/rpg+/index.html).
* **Consolidate Migrations in Save System:** Migrate this logic into the initialization phase of [js/save.js](file:///c:/Users/ASUS/VVI/rpg+/js/save.js). The migration code should run once during the save file loading sequence, parsing and transforming legacy keys (`ayaka`, `hutao`, `nilou`, `xiao`) cleanly into a unified format before saving the updated payload back to `localStorage`.
* **Standardize Save Versioning:** Update the save file schema to include a `version` field (e.g., `version: 3.0`). Any saves lacking this version will be run through a dedicated `migrateSave()` pipeline in [js/save.js](file:///c:/Users/ASUS/VVI/rpg+/js/save.js) and automatically upgraded.

---

## 2. Implementing a Modern Autosave System
The current manual-only save restriction (noted in [README.md](file:///c:/Users/ASUS/VVI/rpg+/README.md#L3-L5)) forces players to manually navigate to the Camp menu to save their progress. This exposes players to severe progress loss if the browser tab is closed, crashes, or reloads.

### Proposed Action
* **Throttled Autosave Dispatcher:** Implement a non-intrusive autosave helper function in [js/save.js](file:///c:/Users/ASUS/VVI/rpg+/js/save.js) that saves state in a dedicated `autosave` slot:
  ```javascript
  SaveSystem.triggerAutosave = function() {
      // Throttle save requests to once every 10 seconds to prevent blocking UI animations
      if (Date.now() - this.lastSaveTime < 10000) return;
      
      const payload = SaveSystem.serializeState();
      localStorage.setItem('cc_save_autosave', JSON.stringify(payload));
      this.lastSaveTime = Date.now();
      
      // Trigger a subtle UI notification overlay in MapUI
      MapUI.showToast("Progress autosaved...");
  };
  ```
* **Hook Save Checkpoints:** Bind `triggerAutosave` to key gameplay milestones:
  * Entering or exiting a map node.
  * Completing a random battle or defeating a boss.
  * Turning in or accepting a quest from the Echo Log.
  * Recruiting a new party member or equipping a Relic.
* **Auto-Load Option:** On the title screen, if `cc_save_autosave` is present and newer than the latest manual save, offer the user a `"Restore Auto-Save"` option.

---

## 3. Resolving CSS Bloat and Sprite Placeholders
The codebase contains over 500KB of hand-authored styling across 16 different CSS files (including the 195KB [css/style.css](file:///c:/Users/ASUS/VVI/rpg+/css/style.css)), yet represents characters as textual emojis (`❄️`, `🔥`, `💧`, `🌀`) in dialogues and screens.

### Proposed Action
* **Consolidate Stylesheets:** Merge the highly redundant files into a modular, production-ready bundle.
  * Group layout, resets, and core variables into [css/base.css](file:///c:/Users/ASUS/VVI/rpg+/css/base.css).
  * Consolidate combat-related styles ([css/combat.css](file:///c:/Users/ASUS/VVI/rpg+/css/combat.css), [css/battle-screens.css](file:///c:/Users/ASUS/VVI/rpg+/css/battle-screens.css), [css/battle-juice.css](file:///c:/Users/ASUS/VVI/rpg+/css/battle-juice.css), [css/sprite-battle-ui.css](file:///c:/Users/ASUS/VVI/rpg+/css/sprite-battle-ui.css)) into a single `css/battle-combined.css`.
  * Eliminate duplicate keyframes and duplicate class selectors that currently bloat the layout files.
* **Migrate Emojis to Inline Vector Assets:**
  * Reorganize character assets to replace unicode emojis with lightweight, color-themed inline SVG icons defined in [js/sprites.js](file:///c:/Users/ASUS/VVI/rpg+/js/sprites.js).
  * Build a unified CSS class structure that applies modern styling and shadows directly to SVGs instead of using generic text shadow rules on emoji characters.

---

## 4. Aligning Documentation and Restoring Sera
There are critical discrepancies between the developer documentation and the live JSON data structures:
* [sera](file:///c:/Users/ASUS/VVI/rpg+/data/characters.json#L401) is missing from the character tables in [README.md](file:///c:/Users/ASUS/VVI/rpg+/README.md).
* Class naming inconsistencies exist between the README, [data/characters.json](file:///c:/Users/ASUS/VVI/rpg+/data/characters.json), and [data/classes.json](file:///c:/Users/ASUS/VVI/rpg+/data/classes.json).

### Proposed Action
* **Update Roster Tables in README:** Add a dedicated row to the recruited characters table in [README.md](file:///c:/Users/ASUS/VVI/rpg+/README.md) documenting [sera](file:///c:/Users/ASUS/VVI/rpg+/data/characters.json#L401):
  | Character | Class | Arc Joined | Role | Passive |
  |---|---|---|---|---|
  | **Sera** | Azure Commander | Arc 5 (Expansion) | Elite Physical Tank / Guard | **Azure Resolve** — Takes 15% reduced damage from bosses; immune to guard-break |
* **Synchronize Class Identifiers:** Standardize naming conventions across database files and documentation:
  * Rename occurrences of "Cryo Bladestorm" in the README to "Cryo Princess" to align with [data/classes.json](file:///c:/Users/ASUS/VVI/rpg+/data/classes.json#L4).
  * Update "Spirit Incinerator" in the character sheets to match the "Ghost Guide" naming convention used in the battle and class definitions.
  * Standardize [rex](file:///c:/Users/ASUS/VVI/rpg+/data/characters.json#L351)'s class as "Lionheart King" instead of "Grail Guardian".

---

## 5. Overhauling "100+ Unique Enemies" Paint-Bucket & AI
The "100+ enemies" in [data/enemies.json](file:///c:/Users/ASUS/VVI/rpg+/data/enemies.json) are largely recolors of the same 10 basic SVG shapes utilizing simple HSL color palette swaps.

### Proposed Action
* **Diversify SVG Silhouettes:** Update the SVG renderer in [js/sprites.js](file:///c:/Users/ASUS/VVI/rpg+/js/sprites.js) to accept structural mutations (e.g., adding horns to a Goblin Scout to make it an Elite, adding crystalline growth paths to the Giant Bat to make it a Cavern Dweller) instead of only changing the base fills.
* **Implement Behavioral AI Profiles:** Expand [js/battle/action-handler.js](file:///c:/Users/ASUS/VVI/rpg+/js/battle/action-handler.js) to support distinct AI roles that dictate combat behaviors:
  * **Vampiric:** Targets units with the lowest health to maximize lifesteal gains.
  * **Karmic Punisher:** Focuses damage on active party members who are currently guarding or generating shielding.
  * **Vanguard Disrupter:** Uses shield-penetrating strikes specifically targeting Vanguard intercept slots.
  * **Enragers:** Buffs allies and gains speed multipliers as their own health thresholds decline.

---

## 6. Summons De-Plagiarism
Ria’s ability to summon Bahamut and Syldra in [data/classes.json](file:///c:/Users/ASUS/VVI/rpg+/data/classes.json#L368) directly copies names from the *Final Fantasy* universe.

### Proposed Action
* **Rename Summon Entities:** Modify the database values in [data/classes.json](file:///c:/Users/ASUS/VVI/rpg+/data/classes.json):
  * **Summon Bahamut** $\rightarrow$ **Summon Pyroclast Wyrm** (an ancient fire dragon born of the Ember Wastes).
  * **Summon Syldra** $\rightarrow$ **Summon Abyss Leviathan** (a massive aquatic guardian tied to the depths of the Sunken Temple).
* **Update Lore References:** Rewrite the descriptions and dialogue triggers in [data/story/](file:///c:/Users/ASUS/VVI/rpg+/data/story/) to refer to these new original summons, establishing them as native spirits of Aethoria.
