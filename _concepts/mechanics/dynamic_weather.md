# Concept: Dynamic Weather Auras

## Overview
Currently, the map engine supports weather (e.g., `weather: 'rain'` in Southern Isles), but it is primarily visual. This mechanic proposes linking the existing weather system directly to the **Elemental Reactions (RX)** system in combat.

## How It Works
When combat initiates, the engine checks `MapEngine.currentWeather`. If a weather condition is active, a global **Aura** is applied to *all* combatants (Player and Enemy) at the start of Turn 1.

### Proposed Weather States
1. **Rain / Storm** 🌧️
   - **Aura Applied**: `Wet` (Water Aura)
   - **Combat Impact**: 
     - **Lightning** attacks immediately trigger **Conductive** (AoE damage spread + stun chance) without needing a setup turn.
     - **Ice** attacks immediately trigger **Shatter/Freeze**.
     - **Fire** attacks trigger **Vaporize** (consuming the Wet status for 1.5x damage, but removing the weather effect from that target for 2 turns).

2. **Fog / Mist** 🌫️
   - **Aura Applied**: `Obscured` (Unique Status)
   - **Combat Impact**:
     - All single-target attacks (physical and magic) have a flat 15% miss chance, bypassing normal Evasion stats.
     - **Wind** attacks clear the Fog for the entire field.
     - **Vanguard Interception** (Slot 2) is disabled because enemies cannot see the formation clearly.

3. **Harsh Sun / Volcanic Ash** ☀️
   - **Aura Applied**: `Scorched` (Fire Aura)
   - **Combat Impact**:
     - HP regeneration and `vampiric` healing are reduced by 50%.
     - **Water** attacks trigger **Vaporize**.
     - **Earth** attacks trigger **Petrify** (Ash cementing into stone).

## Implementation Complexity: LOW
- **Why**: The CombatEngine already has an Aura/Status system. We just need to inject a predefined status effect to `G.party` and `G.enemyGroup` arrays during `BattleEngine.init()`, checking a `weather` flag from the map.
