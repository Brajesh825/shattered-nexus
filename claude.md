# ⚔️ RPG+ Technical Source of Truth (claude.md)

This document contains the essential architectural and technical rules for the RPG+ engine. Refer to this to maintain system integrity and prevent regressions.

---

## 🛡️ Diamond Formation & Vanguard Logic
The 4-slot diamond arrangement is the foundation of targeting logic.
- **Slot 1 (Back)**: Grants a **30% Evasion bonus** against physical strikes.
- **Slot 2 (Front/Vanguard)**: **Vanguard Interception** is active. ALL single-target physical attacks intended for other allies are redirected here if Slot 2 is alive.
- **Indices**: These map strictly to `G.party` and `G.enemyGroup` indices.

---

## 🧬 Data-Driven Passive Trait System
Managed via **[PassiveSystem](file:///c:/Users/ASUS/VVI/rpg+/js/battle/passive-system.js)**. 
- **Querying**: Use `PassiveSystem.hasTrait(unit, 'TYPE')` or `PassiveSystem.val(unit, 'TYPE', fallback)`.
- **Stat Integration**: `CombatEngine.getStat` automatically applies multipliers (e.g., `STAT_BOOST`, `LOW_HP_STAT_BOOST`) during every calculation.
- **Key Trait Types**: `HEAL_AMP`, `MP_COST_MULT`, `DAMAGE_REDUCTION`, `REFLECT`, `FIRST_STRIKE`, `SUMMON_STAT_BOOST`.

---

## 🔮 Ability Framework & Composite Scaling
Defined in **classes.json** and **enemies.json**.
- **Signature**: Uses `dmgMultiplier` and `type` (`physical` / `magic_damage`).
- **Composite Scaling**: Use `effect.statScale: ["stat1", "stat2"]` to pull multiple attributes into a single move's power calculation.
- **Vampiric Logic**: `effect.vampiric` (0.0 - 1.0) determines healing-on-hit percentage.

---

## 🛠️ Combat Engine Math Standard
All Core math functions in `js/battle/combat-engine.js` MUST use this signature to avoid `NaN` errors:
### `(PowerStat, MitigationStat, Multiplier, OptionsObject)`

---

## 🧪 Elemental Reactions (RX) & Auras
Elemental damage interaction is the primary multiplier in combat.
- **Aura Application**: If no reaction occurs, the element applies an `Aura` status to the target.
- **Reaction Matrix (RX)**:
  - **Vaporize / Melt**: 1.5x - 2.0x Damage.
  - **Shatter**: High damage + removes Freeze.
  - **Conductive**: Damage + Stun chance.
  - **Swirl**: AOE Dispersion of status.

---

## 👾 Scalable Scaling: Tiers, Bosses, and Mutations
Scaling is handled by global growth coefficients in `scaling-config.js` and multipliers.

- **Growth Curves**: The engine uses `atkStep`, `defStep`, and `hpStep` to control stat inflation. Adjusting these in **[scaling-config.js](file:///c:/Users/ASUS/VVI/rpg+/js/scaling-config.js)** is the correct way to fix global pacing issues.
- **Enemy Tiers (1-3)**: Tier 3 (Alpha) has **18 HP / 4.5 ATK** per level growth.
- **Boss Status (`isBoss: true`)**:
  - **1.3x Final Stat Multiplier**.
  - **Double Actions** when the unit is the last one alive.
- **Mutations**:
  - **Corrupted**: 1.28x Stats | 1.5x EXP.
  - **Mutant**: 1.55x Stats | 1-3 Random Traits | 2.2x EXP.

---

## 🔍 Debugging & Diagnostics
Engine status is exposed via `window.LogDebug(msg, type)`.
- **Reserved Tags**: `[MATH-PHYS]`, `[MATH-MAGIC]`, `[STATE-DIAG]`, `[Aura]`, `[Passive]`, `[Gauntlet]`.
- **Gauntlet Mode**: Use for stress-testing AI and new enemy tiers.
