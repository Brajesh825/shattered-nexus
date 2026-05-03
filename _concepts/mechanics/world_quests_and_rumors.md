# Concept: The Rumor Board

## Overview
Echo Quests (hunt/gather from NPCs) are already implemented. This concept covers the remaining layer: **narrative Rumor puzzles** accessed via a Notice Board at safe zones.

## How It Works
Players interact with a `Notice Board` (Tile ID 368). This opens a UI displaying current "Rumors" circulating in the world. Each rumor has a vague description — no map markers. Players must use context clues to investigate.

### Example
1. **The Rumor**: *"Fishermen say the sunken bell in the southern lagoon rings at midnight, even when the tide is low..."*
2. **The Investigation**: Player travels to Southern Isles and interacts with the Tide Bell.
3. **The Encounter**: Triggers an ambush by a hidden Elite enemy.
4. **The Resolution**: Returning to the notice board marks it "Resolved."

### Rewards
- **Unique Relics** not sold in shops
- **Keystone items** that unlock hidden Elite Expansion Path teleport nodes

## Implementation Notes
- Needs `type: 'noticeboard'` trigger on map tiles
- Quest state already persists via `QuestSystem.save()` — rumor states can piggyback on this
- Reward pipeline (relic drops, keystone items) needs shop/crafting system first
