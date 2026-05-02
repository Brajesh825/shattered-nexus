# Concept: The Rumor Board & World Quests

## Overview
Currently, the story progresses linearly through Arcs and Chapters. The **World Quest System** introduces non-linear, optional side objectives. Instead of a traditional MMO "Quest Log," this is framed as a **Rumor Board** accessed at specific safe zones (like the Southern Isles settlement or major cities).

## How It Works
Players interact with a `Notice Board` (Tile ID 368). This opens a UI displaying current "Rumors" circulating in the world.

### Quest Structure
Each rumor has a vague description rather than a glowing map marker. Players must use context clues.
1. **The Rumor**: *"Fishermen say the sunken bell in the southern lagoon rings at midnight, even when the tide is low..."*
2. **The Investigation**: The player travels to the Southern Isles and interacts with the Tide Bell specifically during the night cycle.
3. **The Encounter**: Triggers an ambush by a hidden Elite enemy (e.g., a massive spectral crab).
4. **The Resolution**: Returning to the notice board marks the rumor as "Resolved."

### Rewards
Instead of just EXP and Gold, World Quests are the primary method for unlocking:
- **Unique Relics**: Powerful accessories that aren't sold in shops.
- **Hidden Expansion Maps**: Resolving certain rumors gives the player a `Keystone`, unlocking a teleport node to a previously hidden Elite Expansion Path (like the Lighthouse Isles).

## Implementation Complexity: MEDIUM
- **Why**: We already have interactive tiles, an overarching `G.story` state, and map triggers. We would need to add a `G.quests` object to save data (tracking rumor states: `unseen`, `active`, `resolved`), build a simple UI overlay for the Notice Board, and add conditional logic to existing map triggers (e.g., `if (G.quests['sunken_bell'] === 'active') { spawnBoss(); }`).
