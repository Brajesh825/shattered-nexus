# ⚔️ Shattered Nexus (RPG+) - Core Game Mechanics

This document outlines the core gameplay systems and combat mechanics as of the **Phase 5 Engine Refinement**.

## 1. The Catalyst & Synergy System (Elemental Reactions)
Combat in *Shattered Nexus* has evolved past simple rock-paper-scissors into a **Synergy setup-and-detonation system**.

### The Flow of Synergy
1. **Prime (Aura)**: Certain abilities apply an Elemental Aura (e.g., Ice, Fire, Water, Nature) to a target. Auras last for 3 turns.
2. **Detonate**: Hitting an "Auratized" target with a specific contrasting element triggers a powerful secondary reaction, consuming the aura.
3. **Symmetry**: Both the player's party and the enemy forces utilize this system. If your party is primed with an Aura, enemies will try to detonate it.

### Major Reactions
- **Shatter (Ice + Physical/Earth/Fire)**: The frozen shell shatters, dealing massive bonus damage (+50% base modifier).
- **Melt (Ice + Fire)**: Violently consumes the aura for a **2.0x Damage Multiplier**. This is the highest raw damage reaction in the game.
- **Vaporize (Fire + Water)**: Deals 1.5x damage and creates a blinding steam cloud (lowers enemy Accuracy/Evasion).
- **Conflagration (Nature + Fire)**: Ignites the target, causing intense Burning (Damage over Time) for 3 turns.
- **Conductive (Water + Lightning)**: Electrocutes the wet target, dealing bonus damage and **Stunning** them, forcing them to skip their next turn.

---

## 2. Tactical AI (Role-Based Behaviors)
Enemies no longer blindly pick actions. They operate on a weighted system driven by their inherent `aiRole`.

- **Attacker (Default)**: Attacks standard targets, mildly preferring weaker units.
- **Tactician**: Actively scans the battlefield for players who have an active Aura. If a synergy is possible, their probability of using a detonator ability skyrockets (300% weight boost).
- **Predator**: Ruthless assassins that bypass tanks (unless Taunted) and exclusively hunt the party member with the lowest HP percentage.
- **Support**: Prioritizes checking allied HP. If a teammate falls below 50% HP, they will override their normal offensive pattern to heal or buff them.

---

## 3. Unified Status System
Buffs, Debuffs, and Control Effects (Stun/Freeze) are managed in a centralized, duration-based status array (`m.statuses`).

- **Control (Stuns & Freezes)**: Skip the unit's turn entirely. Hard-CC is automatically cleansed when the skipped turn ends.
- **Stat Modifiers (Buffs/Debuffs)**: Multiply base stats (`atk`, `def`, `spd`, `mag`). 
- **Auras**: Do not affect stats directly but act as triggers for the Synergy system.
- **Cleanse**: Abilities with a Cleanse effect wipe all negative statuses, removing debuffs and hard CC while leaving positive buffs intact.

---

## 4. Stat Scaling & Damage
Abilities are no longer strictly locked into checking the `ATK` stat for physical moves and `MAG` stat for spells.

- **Dynamic Scaling**: Many elite classes and characters possess abilities that scale off non-traditional stats. For example, a heavy shield bash might derive its power completely from the user's `DEF` stat (`statScale: "def"`), or a rogue's flurry from `SPD`.
- **Desperation Modifiers**: Certain traits and unique boss moves gain raw multiplier boosts as the attacker's HP gets lower (`lowHpDmgBonus`).

---

## 5. Party Roles & Diamond Formation (Exploration)
- **Vanguard (Taunters)**: Units with high Defense using "Guard" or "Taunt" abilities will physically draw 100% of single-target enemy attacks.
- **Eidolon / Summoners**: Some characters possess summon abilities. These add dynamic "Phantom Guardians" that soak damage or permanently boost the party's elemental output while they remain active.

---

## 6. Game Loop & Persistence
- **Exploration**: Movement involves traversing map zones (Verdant Vale, Ember Wastes, Fortress Ramparts).
- **Encounters**: Triggering battles leads to instances scaled to the party's average level.
- **Post-Battle**: HP and MP levels persist between encounters. If the party falls, they must respawn or revive. Leveling up occurs seamlessly during the post-battle summary.
