# Concept: Chronos Cycle (Time & Environment)

## 🕰️ Overview
The Chronos Cycle introduces a dynamic 24-minute real-world loop (1 minute = 1 Nexus hour) that governs the visual atmosphere and mechanical rules of the world.

## 🎨 Atmospheric Grading (Vivid Visuals)
The world uses a global CSS overlay that shifts HSL values to simulate light progression:

| Phase | Time | HSL Filter (Target) | Atmosphere |
| :--- | :--- | :--- | :--- |
| **Dawn** | 04:00 - 08:00 | `hue-rotate(10deg) sepia(20%)` | Pale amber, misty. |
| **Noon** | 08:00 - 17:00 | `none` | High contrast, saturated. |
| **Dusk** | 17:00 - 20:00 | `hue-rotate(-20deg) saturate(140%)` | Deep crimson and violet. |
| **Midnight**| 20:00 - 04:00 | `brightness(60%) hue-rotate(180deg) saturate(80%)` | Indigo, bioluminescent. |

## ⚔️ Remaining Mechanical Goals
1. **Time-Gated Triggers**: 
   - [ ] The "Rumor Board" triggers (e.g., The Tide Bell) only fire during specific windows.
2. **Economic Shifting**: 
   - [ ] Certain Black Market merchants only appear during the Midnight phase in safe zones.
3. **Advanced Combat Buffs**:
   - [ ] Celestial relics provide stat bonuses during Noon; Void relics during Midnight.

## 🛠️ Technical Implementation Notes
- **Data Persistence**: `G.nexusTime` (0.0 to 24.0) stored in global state.
- **Clockwork Heartbeat**: Synchronized background loop in `MapEngine.js` and `BattleUI.js`.
- **World Resonance**: Global multipliers applied dynamically in `CombatEngine.js`.
- **Atmospheric Sync**: Visual filters applied to `#explore-canvas-wrap` and `#battle-scene`.