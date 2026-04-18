# ⚔️ Shattered Nexus - Developer & AI Knowledge Base (claude.md)

This document serves as the "Source of Truth" for the game's core architecture. Refer to this before making any changes to combat, UI, or party systems to avoid common regressions.

---

## 🛡️ Formation & Party Indices (Diamond Formation)
The party is arranged in a diamond shape. The indices in `G.party` map strictly to specific board positions and combat roles:

| Index | Visual Position | Role | Special Logic |
| :--- | :--- | :--- | :--- |
| **0** | **Top Flank** | Offense | Standard targeting. |
| **1** | **Back (Rearguard)** | Support | **30% Evasion bonus** against physical strikes. |
| **2** | **Front (Vanguard)** | Tank | **Intercepts ALL single-target physical attacks** intended for other allies. |
| **3** | **Bottom Flank** | Offense | Standard targeting. |

> [!IMPORTANT]
> **Vanguard Interception**: In `action-handler.js`, if a physical attack targets any ally other than Index 2, it is automatically redirected to Index 2 if they are alive.

---

## 🛠️ Combat Engine Standardization
All damage calculation functions in `js/battle/combat-engine.js` and their wrappers in `js/game.js` MUST follow this exact 4-argument signature:

### `(PowerStat, MitigationStat, Multiplier, OptionsObject)`

**Physical Example:**
```javascript
Battle.physDmg(atk, def, 1.5, { atkLevel: 1, defLevel: 1, defPen: 0, isCrit: false });
```

**Magic Example:**
```javascript
Battle.magicDmg(mag, mdef, 1.25, { magLevel: 1, mdefLevel: 1, isCrit: false });
```

> [!CAUTION]
> Passing an object as the 3rd argument (legacy style) will result in **`NaN` damage**, breaking the health bars and causing instant KO bugs.

---

## 🔍 Diagnostic Logging & Debugging
The engine includes a visual console logger. Use `window.LogDebug(msg, type)` to output information during battle.

### Log Types:
- `'hi'`: High-priority math logs (Light blue).
- `'dmg'`: Damage/Critical notifications (Red).
- `'passive'`: Status effect or passive triggers (Yellow).
- `'regen'`: Healing or recovery (Green).

### Active Diagnostic Tags:
- **`[MATH-PHYS]` / `[MATH-MAGIC]`**: Shows raw stats vs resulting damage.
- **`[STATE-DIAG]`**: Shows the "Before" and "After" HP of a unit to prove damage is applying to the correct object reference.

---

## 🎭 Key Character Logic
- **Rei (Xiao)**: Usually the **Vanguard (Slot 2)**. Utilizes `Iron Will` (DEF boost at low HP) and `Mastery of Pain` (Taunt + DEF Scaling).
- **Ayaka**: Swift striker (SPD Scaling). Often placed in **Slot 0/3**.
- **Tao (Hu Tao)**: High-risk damage dealer. Relies on **Elemental Reactions (RX)** for 2x damage multipliers.
- **Lulu**: Primary healer. High Magic Defense (MDEF).

---

## 📂 Core File Roadmap
- `js/game.js`: Global `Battle` wrappers and high-level game state (`G`).
- `js/battle/action-handler.js`: The "brain" of combat. Handles animations, target selection, and interception.
- `js/battle/combat-engine.js`: Pure math formulas for damage and status rolls.
- `js/ui/battle-ui.js`: Visual representation! Renders HP bars, logs, and sprites.
- `data/enemies.json`: Base definitions for all monsters.

---

## 👾 Enemy Tier System
Enemies are categorized by **Tier (1-3)**. This determines their base growth and reward scaling:

| Tier | Type | Stat Mult | Level Growth (HP/ATK) | Action Speed |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Normal | 1.0x | 5 HP / 1.2 ATK | Standard fodder. |
| **2** | Elite | 1.3x | 10 HP / 2.5 ATK | Significant threat. |
| **3** | Alpha | 1.7x | 18 HP / 4.5 ATK | High-stat Miniboss. |

> [!IMPORTANT]
> **Decoupling**: Tier 3 describes stat growth (Alpha strength), but it **DOES NOT** confer Boss status. Only units explicitly flagged with `isBoss: true` receive the Boss bonuses listed below.

---

## 👑 Boss Mechanics (`isBoss: true`)
When an enemy is tagged as a boss, several critical changes occur:

1.  **Base Stat Boost**: Bosses receive a flat **1.3x multiplier** on all calculated final stats.
2.  **Action Economy**: If a boss is the **last remaining unit** on their side, they automatically take **Double Actions** (Attack 2x per round).
3.  **AI Rotation**: Bosses typically use a `sequenced` AI type, following a strict skill rotation rather than random attacks.
4.  **Visual Presence**: Bosses are automatically scaled larger in the `battle-scene`.

---

## 🧪 Mutations: Corrupt & Mutant
Enemies can appear as enhanced variations of themselves:

### 🟣 Corrupted (The Void's Touch)
- **Effect**: **1.28x Stat Multiplier** (Math) | 1.12x Size (Visual).
- **Rewards**: 1.5x EXP | 1.4x Gold.
- **Lore**: Enemies consumed by the Void Citadel's influence.

### 🟢 Mutant (Unstable Evolution)
- **Effect**: **1.55x Stat Multiplier** (Math) | 1.28x Size (Visual).
- **Rewards**: 2.2x EXP | 2.0x Gold.
- **Mutant Traits**: Gain 1-3 random abilities (e.g., **Vampiric** - heals 25% of damage dealt).

> [!CAUTION]
> **Immunities**: Bosses and Tier 3 Alphas **CANNOT** be Corrupted or Mutant. If you encounter one, it is a logic bug.
