# Concept: Abyssal Modifiers (Endgame Challenge)

## Overview
Currently, the game provides static difficulty via the `enemyLevelRange` and Boss multipliers. The **Abyssal Modifiers** system introduces customizable, opt-in difficulty scalers for players who want to test their late-game party builds, inspired by "heat" or "ascension" mechanics in roguelikes.

## How It Works
Before entering an Elite Expansion Path map (like the Sky Ruins) or starting a Boss Gauntlet run, the player can interact with a `Dark Altar` (Tile ID 359). This opens the Abyssal Modifiers UI.

Players can toggle various negative modifiers on their run. Each active modifier adds a percentage boost to Final EXP, Final Gold, and Relic Drop Rates.

### Example Modifiers
1. **Atrophy (+20% Rewards)**: All healing effects (Potions, Spells, Vampiric) are reduced by 50%.
2. **Haste of the Void (+30% Rewards)**: All enemies have +50% Base Speed.
3. **Shattered Shields (+40% Rewards)**: `DEF` and `MAG` stats for the entire player party are treated as 0 during damage calculations. Evasion is the only defense.
4. **Blood Price (+50% Rewards)**: Using an ability costs HP equal to its MP cost in addition to the MP.
5. **Enrage Timer (+50% Rewards)**: If a battle lasts longer than 10 turns, all enemies instantly trigger their final Phase multipliers (e.g., +200% ATK) regardless of their current HP.

### The "Void Echo" Reward
If a player clears a Boss Gauntlet with 150%+ Rewards active, they are awarded a **Void Echo**. This is a unique crafting material used to upgrade ultimate weapons, essentially serving as the ultimate endgame chase goal for min-max players.

## Implementation Complexity: MEDIUM
- **Why**: The math scaling in `CombatEngine` and `PassiveSystem` is already extremely modular. We would simply need to inject a `G.modifiers` array that the Combat Engine checks during stat computation (e.g., `if (G.modifiers.includes('shattered_shields')) def = 0;`). The main work is building the UI to toggle these before a fight and ensuring the state resets properly if the player wipes.
