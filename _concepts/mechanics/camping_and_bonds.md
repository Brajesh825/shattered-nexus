# Concept: Campfires & Character Bonds

## Overview
Currently, HP/MP restoration outside of battle relies on items or returning to a major city heal point. The **Campfire System** introduces an interactive rest mechanic on the world map, combined with a narrative **Bond System** to flesh out character relationships.

## How It Works
Players can interact with `Bonfire` (Tile ID 377) or `Campfire` tiles scattered in safe zones across the world.

1. **Resting**: Clicking the fire restores 100% HP and MP for the entire party, but respawns all defeated non-boss enemies in the current region (acting as an exploration reset).
2. **The Camp UI**: Resting opens a cozy Campfire UI overlay showing the current 4 active party members sitting around a fire.
3. **Bond Events**: Occasionally, a speech bubble will appear over two characters' heads. Clicking it triggers a **Bond Event** — a short, unique dialogue scene between those specific characters (e.g., Sera and Drake discussing battle tactics; Lulu and Aya talking about elemental spirits).

### Mechanical Rewards
Completing a Bond Event grants a permanent, minor stat boost to the involved characters through the `PassiveSystem`. 
- Example: Completing Sera and Drake's 3-part bond arc permanently gives them both a +2% `DAMAGE_REDUCTION` passive trait.

## Implementation Complexity: HIGH
- **Why**: While the full-heal and enemy respawn logic is easy (`G.party.forEach(heal)`, `MapEngine.respawnEnemies()`), the Camp UI requires a dedicated HTML/CSS overlay and sprite positioning logic. The Bond Events require a new data structure (`data/bonds.json`) to track conversation progress between character pairs (`Sera_Drake_1`, `Sera_Drake_2`, etc.) and ensure they only trigger once.
