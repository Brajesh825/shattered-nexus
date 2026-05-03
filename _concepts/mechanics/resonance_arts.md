# Concept: Resonance Arts (Desperation Gauge)

## Overview
Currently, characters rely on MP (Mana) for powerful abilities. The **Resonance Art** mechanic introduces a secondary, shared party meter that builds up organically during difficult fights, rewarding the player for surviving heavy damage.

## How It Works
A new visual gauge (The **Resonance Gauge**, 0-100%) sits at the top of the battle UI. 
- It is shared by the entire party.
- It starts at 0% every battle.
- **Building the Gauge**:
  - Taking Damage: +1% per 5% of max HP lost by a character.
  - Elemental Reactions: Triggering any Elemental Reaction (Vaporize, Shatter, Swirl) adds +5%.
  - Vanguard Blocks: Every time Slot 2 intercepts an attack, +3%.

### Unleashing a Resonance Art
When the gauge hits 100%, the `[ATTACK]` button for whichever character is currently taking their turn transforms into a glowing `[RESONANCE]` button.

Activating it consumes the entire gauge and triggers a cinematic, zero-MP ultimate ability based on the character's Class. 
- **Sera (Azure Commander)**: *Aegis of the Fallen* — Grants the entire party a 500-HP shield and completely cleanses all debuffs.
- **Ria (Spellweaver)**: *Arcane Cascade* — Deals massive composite (Physical + Magic) AoE damage and applies random Auras (Burn, Wet, Shock) to surviving enemies.
- **Drake (Berserker)**: *Sundering Cleave* — Single-target execution move. If the enemy is below 25% HP (or is in their final Enrage phase), this attack does 4.0x damage.

## Implementation Complexity: HIGH
- **Why**: Requires building a new UI element for the Battle Scene, hooking into the damage calculation pipeline in `CombatEngine` to increment the gauge, and defining a new subset of ultimate skills in `classes.json` that bypass the standard MP economy. However, it provides a massive "comeback" mechanic for Arc Boss fights.
