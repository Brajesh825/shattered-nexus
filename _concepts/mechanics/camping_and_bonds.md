# Character Resonance: Bond System

## 1. Overview
The **Bond System** transforms the Camp UI from a simple rest-stop into a narrative and mechanical hub. By fostering relationships between party members, players unlock **Resonance Traits**—powerful passive synergies that activate when bonded characters fight side-by-side.

## 2. Core Mechanics

### Bond Events & Stages
*   **Three-Stage Arc**: Every character pair MUST have exactly three tiers of dialogue:
    1.  **Tier I (Awakening)**: Initial friction or curiosity. Reward: Minor Stat Boost.
    2.  **Tier II (Synchronization)**: Mutual understanding. Reward: Elemental/Mechanical Synergy.
    3.  **Tier III (Unity)**: Total resonance. Reward: Major Stat Boost or "Dual Passive".
*   **Visual Trigger**: A pulsing "Resonance Spark" (✨) overlay appears on the characters in the Camp UI. The "BOND EVENTS" button should only appear when a spark is active.

### Activation Criteria
Bonds are gated by more than just "being in the party". Each tier can require:
*   `minArc`: Minimum story arc index.
*   `mapId`: Must be at a campfire in a specific region.
*   `flag`: A specific story event must have fired (e.g., `boss_void_knight_defeated`).
*   `battles`: Number of battles fought together as a pair.

## 3. Data Structure (Updated)

### `data/story/bonds.json`
```json
{
  "pairs": [
    {
      "id": "aya_tao",
      "chars": ["aya", "tao"],
      "tiers": [
        {
          "tier": 1,
          "criteria": { "minLevel": 5 },
          "dialogue": [...],
          "reward": { "type": "resonance", "stat": "spd", "val": 2 }
        },
        {
          "tier": 2,
          "criteria": { "mapCleared": "verdant_vale" },
          "dialogue": [...],
          "reward": { "type": "reaction_boost", "aura": "ice", "detonator": "fire" }
        },
        {
          "tier": 3,
          "criteria": { "minArc": 1, "flag": "arc_1_complete" },
          "dialogue": [...],
          "reward": { "type": "resonance", "stat": "mag", "val": 10 }
        }
      ]
    }
  ]
}
```

### `G.bonds` Persistence
*   `G.bondProgress = { "aya_tao": 1, "lulu_rei": 0 }`
*   Serialized in `sw.js` and `SaveContract`.

## 4. Visual Excellence (UI/VFX)
*   **The "Spark" Indicator**: A pulsing HSL-tuned glow over characters in the Camp UI.
*   **Cinematic Focus**: When a bond starts, the Camp UI dims, and the two characters slide to the center-front for their conversation.
*   **Trait Unlock Pop-up**: A premium "VVI" styled card showing the new Resonance Trait icon and stats.

## 5. Integration Workflow
1.  **Registry**: Create `js/data/bonds.js` with initial Arc 1 & 2 pairings.
2.  **UI Injection**: Update `js/ui/map-ui.js` (Camp section) to check for available bonds.
3.  **Passive Hook**: Update `PassiveSystem.js` to calculate bonuses based on `G.bondProgress` and active battle members.
4.  **Save Update**: Ensure `Save.js` captures the new bond states.
