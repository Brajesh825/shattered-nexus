# Concept: Character Bonds

## Overview
The Camp UI, heal-at-camp, and camp-only saving are already implemented. This concept covers the remaining layer: **Bond Events** — short character dialogue scenes that fire when resting.

## How It Works
Occasionally when the player opens the Camp menu, a speech bubble appears over two characters. Clicking it triggers a Bond Event — a short unique dialogue between that pair (e.g., Sera and Drake on battle tactics; Lulu and Aya on elemental spirits).

### Mechanical Reward
Completing a Bond Event grants a permanent minor stat boost via `PassiveSystem`:
- Example: Completing Sera + Drake's 3-part bond arc gives both `+2% DAMAGE_REDUCTION`.

### Implementation Notes
- Needs `data/bonds.json` tracking conversation progress per character pair (`sera_drake_1`, etc.)
- Each bond entry fires once; progress persists via save state
- UI: speech bubble overlay on the existing camp panel, triggers `_openGenericDialogue` with bond lines
- Stat reward: `PassiveSystem` already supports flat `DAMAGE_REDUCTION` traits — just inject on completion
