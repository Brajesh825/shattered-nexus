# Concept: Character & Class Upgrades (Endgame)

## Overview
As the party progresses through the game, they encounter the "Four Kings" in the Sky Ruins—tragic heroes who were corrupted by Valdris. Defeating them acts as a purification process. Upon their defeat, the four starting characters inherit their elemental resonance, unlocking ultimate "Class Upgrades."

## The Mechanics

### 1. Stat Multipliers & Base Stat Bump
When a character inherits the will of a King, they don't just gain an item. Their core class changes, providing a massive permanent bump to their Base Stats (e.g., +20% HP, +15% ATK) and changing their `stat_bonuses` on level up to reflect their new hybrid nature.

### 2. Passive Trait Evolution
Their existing unique passive trait evolves into a much stronger version that incorporates the powers of the defeated King.
- **Tao -> Lunar Deathspeaker**: `Blood Blossom` evolves into `Lich's Blossom`. (Increases ATK when HP is low, but now also grants a 10% chance to instantly execute non-boss enemies).
- **Rei -> Ebon Warden**: `Warden's Valor` evolves into `Ebon Resolve`. (Retains damage reduction, but now reflects 15% of all Void/Dark damage back at the attacker).
- **Drake -> Wyrmfall Knight**: `Dragon's Leap` evolves into `Wyrm's Ascent`. (The 3rd turn aerial attack is now an AoE strike that hits the entire enemy party).
- **Aya -> Storm-Rime Sovereign**: `Frostflake Dance` evolves into `Storm-Rime Waltz`. (Retains First Strike, but now applies a "Paralyze/Freeze" hybrid debuff on her first attack of every encounter).

### 3. Ultimate Abilities (Limit Breaks)
Upgrading their class unlocks their ultimate "Inheritance Skill." This is a high-cost MP (or entirely new resource) skill that visually combines their original element with the King's element.
* Example: Aya's ultimate summons a massive blizzard infused with crackling blue lightning, dealing massive Cryo and Lightning damage.

### 4. UI Integration
- When the upgrade occurs, the character's portrait in the `PouchUI`, Battle Screen, and Dialogues automatically swaps to their new, upgraded artwork.
- Their `class_affinity` string in `characters.json` is updated (e.g., `cryo_bladestorm` -> `storm_rime_sovereign`), changing their title in the status menus.
