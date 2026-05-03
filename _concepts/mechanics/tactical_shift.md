# Concept: Mid-Battle Tactical Shift

## Overview
Currently, the **Diamond Formation** (Slot 1 = Back/Evasion, Slot 2 = Vanguard/Intercept, Slots 3 & 4 = Flanks) is locked when the battle starts based on the `party.js` order. The Tactical Shift mechanic would allow players to adapt to telegraphed Boss attacks mid-combat.

## How It Works
A new action button `[SHIFT]` is added next to Attack/Skill/Item. 

When a character selects `[SHIFT]`, they can click another living party member to instantly swap slots with them. 
- **Action Cost**: Costs the character's turn, but the swapped character retains their position in the ATB/Speed queue.
- **Cooldown**: 3 turns for the party (to prevent endless juggling).

### Strategic Use Cases
1. **Saving the Mage**: If the Boss is charging a massive physical attack ("Takes Aim..."), the player can have their squishy Mage (currently in Slot 3) swap with the Vanguard (Slot 2). The Vanguard will now intercept the attack, while the Mage safely avoids the hit.
2. **Rotating Tanks**: If Sera (Slot 2 Vanguard) drops to 10% HP, another bruiser like Drake can use their turn to swap into Slot 2, taking over Vanguard Interception duties while Sera heals in the back.
3. **Evasion Baiting**: Slot 1 grants +30% Physical Evasion. A character with naturally high speed/evasion can be rotated into Slot 1 specifically when a barrage attack is incoming.

## Implementation Complexity: MEDIUM
- **Why**: We would need to update the UI to allow selecting an ally slot, and safely swap the `G.party` array indices. We also need to ensure that enemy targeting logic (which caches target indices) recalculates if the Vanguard moves before their attack executes.
