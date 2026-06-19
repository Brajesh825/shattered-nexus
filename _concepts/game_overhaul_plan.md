# Concept: RPG+ Architectural, Mechanical, and Narrative Overhaul Plan

This document outlines a complete proposal for refactoring the state management, optimizing asset delivery, restructuring temporal mechanics, and rewriting the narrative lore of *Shattered Nexus*.

---

## 1. Architectural Restructuring (Global State Encapsulation)

### Goal
Replace the massive, mutable global state object `G` with an encapsulated, reactive `StateManager` class to prevent untracked state mutations.

### Actions Needed
*   **Create State Manager Class:**
    *   Design a `StateManager` class in `js/systems/state-manager.js` to manage the core game data.
    *   Expose read-only getters for key properties (e.g. `party`, `inventory`, `unlockedChars`, `gold`).
    *   Expose explicit transaction methods:
        *   `State.addGold(amount)`
        *   `State.spendGold(amount)`
        *   `State.addItemToInventory(itemId, qty)`
        *   `State.removeInventoryItem(itemId, qty)`
        *   `State.unlockCharacter(charId)`
        *   `State.setMemberKO(charId, isKO)`
*   **Event-Driven UI Updates:**
    *   Incorporate a simple Publish-Subscribe mechanism.
    *   Allow the UI managers (`BattleUI`, `MapUI`) to subscribe to specific state events (e.g., `'inventory_changed'`, `'hp_updated'`) and trigger local renders rather than calling global redraw hooks on every line.
*   **Remove Global Write Access:**
    *   Freeze or seal the state context to prevent direct assignments like `G.gold = 9999` from random modules.

---

## 2. Asset Pipeline Optimization

### Goal
Reduce the total PWA payload from 184MB+ to a lightweight standard (~10MB) by compressing spritesheets and migrating to WebP by default.

### Actions Needed
*   **Batch Image Compression:**
    *   Run the sprite optimizer (`tools/optimize_sprites.py`) over all character face portraits and walk-animation spritesheets.
*   **Migrate Character Sprites to WebP:**
    *   Convert the heavy normal-quality spirit sheets in `images/characters/spirits/` and map sheets in `images/characters/map/sheets/` from `.png` to `.webp` formats.
    *   Maintain cel-shaded high-contrast styling while achieving a 75-90% reduction in file sizes.
*   **Update Renderer Paths:**
    *   Modify `SpriteRenderer.getSpritePath` (`js/sprites.js`) to resolve `.webp` files by default for both normal and low-quality assets.
*   **Clean Up Service Worker Caching:**
    *   Update `sw.js` assets arrays (`SHELL_ASSETS`, `SPRITES_NORMAL`) to use `.webp` extensions instead of `.png` extensions for character sprites.

---

## 3. Clock & Temporal Systems (Chronos Cycle Refactoring)

### Goal
Decouple temporal stat bonuses from the real-world computer system clock, replacing them with a controllable in-game day/night step cycle.

### Actions Needed
*   **Step-Based Time Advancement:**
    *   Modify `ChronosEngine` (`js/systems/chronos-engine.js`) to maintain an in-game time variable (0-24 hours).
    *   Increment the in-game clock:
        *   By **15 minutes** for every 10 steps the player walks on exploration maps.
        *   By **30 minutes** for every combat round completed in battle.
*   **Synchronize Cycle Phases:**
    *   Update `ChronosEngine.getPhase()` to compute the phase from the in-game time:
        *   `06:00 - 12:00` ➔ Dawn
        *   `12:00 - 18:00` ➔ Noon
        *   `18:00 - 24:00` ➔ Dusk
        *   `00:00 - 06:00` ➔ Midnight
*   **HUD clock display:**
    *   Show a clean clock indicator on the explore screen (e.g. `[ 🕰️ 14:30 — Vitality of Noon ]`) so the player can strategically plan movement and time battles to align with active stat bonuses.

---

## 4. Stat & Combat Formulas (HP-Phase Optimization)

### Goal
Eliminate runtime sorting bottlenecks during stat checks in the combat engine.

### Actions Needed
*   **Cache Unit HP Phases:**
    *   Refactor `CombatEngine.getStat` in `js/battle/combat-engine.js` so it does not recreate, copy, and sort the `statPhases` array on every single stat read.
    *   Implement an `onHpChanged(unit)` listener that evaluates the current HP percentage, identifies the active phase object from `statPhases`, and stores a reference to it as `unit.activeStatPhase`.
    *   Update `getStat` to read directly from `unit.activeStatPhase[stat]` in `O(1)` time.

---

## 5. Naming & Lore De-Plagiarism

### Goal
Establish unique world boundaries, character origins, and names to build an original fantasy universe instead of relying on copied characters.

### Actions Needed
*   **Rewrite Character Database (`data/characters.json`):**
    *   **Keep the "Summoned Stranger" Premise:** Maintain the core concept that the Major 8 are observers and saviors summoned from other worlds via the rifts, keeping the portal fantasy intact.
    *   **Overhaul Original Identities:** Change who they "really were" so it maps to original, custom fantasy dimensions rather than plagiarized game worlds. However, design their pasts to be fragmented, glitched, or corrupted by the Rift transition so that their memories of their old lives are unreliable or "won't work" in this world:
        *   *Aya (Ayaka):* A noble shrineswarden from a falling blossom realm. Her memory is glitched; she remembers cherry blossoms and prayers, but the Rift has distorted her past.
        *   *Tao (Hu Tao):* A mischievous spirit guide from an afterlife plane. She remembers guiding souls, but her poems have been scrambled by the Rift into ominous portal warnings.
        *   *Lulu (Nilou):* An aquatic dancer from a star-lit oasis world. Her memories of the pool dances are intact, but she cannot recall her patron gods.
        *   *Rei (Xiao):* A silent protector from a demonic wasteland realm. He carries a karmic burden, but the Rift has wiped the names of the masters he served.
        *   *Ria/Valka/Drake/Rex:* Completely detach them from Rydia, Lenneth, Kain, and Leon, mapping them to original, mysterious summoned backgrounds with memory gaps.
*   **Rename Copy-Paste Class Abilities (`data/classes.json`):**
    *   *Tao:* Change *Paramita Papilio* state to *Wraith-Form Ascension* and *Sanguine Rouge* to *Aura of Ember.*
    *   *Lulu:* Change *Dance of Haftkarsvar* to *Priestess's Cleansing Dance* and *Hajra's Hymn* to *Oasis Invocation.*
    *   *Rei:* Change *Warden's Valor* to *Sentinel's Resolve* and *Mastery of Pain* to *Aura of Retribution.*

---

## 6. Narrative Dialogue & Banter Redo

### Goal
Reposition the dialogue tone from angsty pseudo-philosophical monologues to natural, high-quality, and character-driven writing.

### Actions Needed
*   **Rewrite Refugee & Guard NPC Lines (`data/npcs.js`):**
    *   Make guard and refugee NPCs talk about practical problems (e.g. food shortages, collapsed bridge logistics, scouts lost in the fog, reinforcing the eastern gate) instead of weeping about the "loneliness of gates."
    *   Add realistic, weary resolve to commanders and soldiers rather than angsty statements about "emptied souls."
*   **Refactor Camp Banter (`data/banter.json`):**
    *   Rewrite ambient conversations to build unique relationships, banter, and lighthearted interactions between the party members.
    *   Let the characters talk about their skills, classes, or Aethorian customs during campfire rests, providing contrast to the dark atmosphere of the outer wilds.
