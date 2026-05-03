# Concept: World Corruption & Infection

## Overview
The world of Aethoria is physically decaying under the weight of the Void Rift. This is not just a narrative theme, but a persistent mechanical threat known as **World Corruption**. 

## How It Works
As the party explores non-safe "Wild" zones, they accumulate **Infection**. This represents the mental and physical toll of the void-heavy atmosphere.

### 1. Accumulation
- **Infection per Minute**: The player gains Corruption automatically as they spend time in "Wild" zones (non-safe zones).
- **Combat Exposure**: Encountering "Corrupt" or "Void-touched" enemies adds a minor burst of corruption.
- **Safe Zones**: In towns or camps (Tile 74), corruption accumulation pauses and slowly reverses.

### 2. Random Encounter Mutations
Previously, only visible map enemies would mutate over time. With this system:
- **Invisible Ambushes**: Random encounters will now roll for Corrupted/Mutant status based on the current world Corruption level.
- **Difficulty Scaling**: As you spend more time in the wild, every fight—whether visible or random—becomes progressively more dangerous.

### 3. The Atmospheric Decay (Visuals)
As Corruption rises, the screen physically changes to reflect the party's deteriorating state:
- **0 - 100 (Stable)**: Normal map lighting.
- **100 - 200 (Contaminated)**: A subtle purple/sepia tint begins to wash over the screen. Fog density increases by 20%.
- **200+ (Infected)**: High-contrast void purple tint. The screen occasionally "pulses" with static. The "Shattered Nexus" becomes visible in the distance (if on overworld).

### 3. Mechanical Danger
Corruption acts as a global difficulty modifier:
- **Mutant Spawns**: Higher corruption increases the chance that a normal enemy spawns as a **Tier 2** or **Tier 3 Mutant**.
- **Stat Penalty**: At 250+ Corruption, the party suffers a -10% Speed penalty as the weight of the void slows them down.

### 4. Purification
The only ways to clear Corruption are:
- **Resting at Camp**: Fully clears all accumulated Corruption.
- **Purifying Items**: Rare items like "Sacred Incense" can reduce Corruption by 50 points.
- **Relics**: Certain relics can slow the rate of accumulation.

## Implementation Complexity: MEDIUM
- **Why**: We already have a `G.corruption` stat. We need to hook into the `MapEngine` step-counter and use CSS filters (e.g., `hue-rotate`) on the map container to achieve the visual decay. The mutation logic already exists in the battle engine; we simply need to tie the "mutation chance" variable to the `G.corruption` value.
