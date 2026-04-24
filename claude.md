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

### 📊 Multiplier & Capping Hierarchy
Combat stats are calculated in four distinct layers to allow for high-impact scaling:
1. **Base Passives**: Multipliers from `PassiveSystem` (Capped at **2.5x** / `NexusScaling.caps.statMult`).
2. **Status/Moves**: Multipliers from statuses (`sBonus`) are added *after* the passive cap.
3. **Phases**: Multipliers from `statPhases` are applied multiplicative to the result.
4. **Absolute Cap**: The final multiplier is clamped at **8.0x** (The "Extreme Premium" limit).

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

## 🌪️ Universal Phase System
Enemies can define dynamic stat transformations triggered by HP thresholds using the `statPhases` array in `enemies.json`.
- **Implementation**: `CombatEngine.getStat` automatically picks the phase for the *lowest* threshold reached (e.g., at 20% HP, it picks the 25% phase).
- **Structure**: `{"hp": 0.25, "atk": 1.5, "def": 0.8}`
- **Stacking**: Phase multipliers bypass passive caps and stack with statuses, allowing for dramatic "Enrage" or "Fragile Power" shifts.

---

## 👾 Elite & Boss Scaling Formula
All enemies in `enemies.json` use **Level 1 baseline stats**. The engine projects these to their spawn level using this formula:

```
Final_Stat = floor( ( (Base_Stat × Tier_Mult) + (SpawnLevel - 1) × Tier_Growth ) × Boss_Mult )
```

### 📊 Baseline Coefficients (The Sacred Standard)
- **Boss Multiplier (HP)**: 4.5x
- **Boss Multiplier (ATK/DEF/MAG)**: 1.3x
- **Tier 3 Growth Multiplier**: 1.3x
- **Tier 3 Growth (per level)**: HP: 22 | ATK: 3.0 | DEF: 2.0 | SPD: 1.0 | MAG: 0.6

> [!CAUTION]
> **HANDS-OFF DIRECTIVE**: The `Base_Stats` for Story Bosses in `enemies.json` are primary gameplay anchors. Antigravity is **NOT permitted** to tweak these values or the multipliers above without explicit user approval. 

### 🛡️ Boss Archetypes (Reference)
- **Void Knight (Arc 1)**: 240 HP / 22 DEF (The Balanced Start)
- **Demon Lord (Arc 2)**: 185 HP / 15 DEF (The Magic Menace)
- **King Galdor (Sideboss)**: 200 HP / 16 DEF (The Greed King - Hardens with HP loss)
- **Spectral Guardian (Sideboss)**: 480 HP / 60 DEF (The Wall - Shatters into glass cannon at 40% HP)
- **Dark Phoenix (Arc 3)**: 170 HP / 10 DEF (The Self-Healer)

---

## 📐 Character Stat & Growth Formulas
All character stats are computed in `js/systems/party.js → computeStats(ch, cls)`. **Never save or restore derived combat stats — always recompute from source.**

### Stat Formula (per stat: hp, mp, atk, def, spd, mag, lck)
```
FinalStat = floor( (BaseStat + (Level - 1) × GrowthPerLevel + StatBonus) × ClassMultiplier )
```
- `BaseStat` — from `characters.json → base_stats`
- `GrowthPerLevel` — from `classes.json → growthPerLevel` (0 if absent)
- `StatBonus` — from `characters.json → stat_bonuses` (0 if absent)
- `ClassMultiplier` — from `classes.json → stat_multipliers`

### Relic Multipliers (applied after `computeStats`, inside `applyRelicBonuses()`)
```
FinalStat = floor( FinalStat × RelicMultiplier )   // hp, mp, atk, def, spd, mag, lck
```
Relic bonuses are **additive across relics, then applied once** as a single multiplier. They are re-applied fresh every time `buildParty()` is called — never stack.

### EXP Threshold (level-up gate)
```
ExpNeeded(L) = 5 × L² + 25 × L
```
Example thresholds: Lv1→2: 30 | Lv5→6: 250 | Lv10→11: 750 | Lv20→21: 2,280

### EXP Distribution (per battle)
EXP is **split among alive party members** — not given in full to each.
```
splitExp   = floor(totalEnemyExp / aliveCount)
earnedExp  = floor(splitExp × expScale)       // per surviving member
```
- Dead members receive **0 EXP** but their level/exp is always synced back to `G.chars` regardless of KO state (prevents level reset on next battle).
- Gold is split the same way.

### EXP Scaling (enemy spawn formula)
```
finalExp = floor(baseExp × tierExpMult × hordeScale × levelScale × bossExpMult)
```
- `tierExpMult`: Tier 1 = 1.0 | Tier 2 = 1.5 | Tier 3 = 2.5
- `levelScale`: `1 + (spawnLevel - 1) × 0.1`  — grows linearly, adds ~10% per level
- `hordeScale`: 3 enemies = 0.78× each | 4+ enemies = 0.65× each
- `bossExpMult`: 2.5× for bosses (`isBoss: true`)

### EXP Level-Gap Penalty
```
expScale = clamp(1 - (memberLevel - enemyLevel) / 3,  0, 1)
```
At **+3 levels above the enemy average** the member earns 0 EXP. Linear ramp between gap 0 → 3.

### Archive Mastery Buffs
Applied as **flat additions** after `computeStats()` and `applyRelicBonuses()` in all code paths: `buildParty()`, save load (`story.js`), and Gauntlet (`boss-gauntlet.js`). Must be reapplied in every path that rebuilds stats from scratch.

### PassiveSystem STAT_BOOST Rules
- `value` is a **float > 1** (e.g. `1.15`) → applied as a **multiplier** in `getStatMultiplier`
- `value` is an **integer** (e.g. `3`) → applied as a **flat bonus** in `getStatBonus`
- Never use integers > 1 for multiplier intent — use floats.

### Save / Load Contract
Only `lv`, `exp`, `gold`, `hp`, `mp`, `isKO` are persisted. On load, all other stats are recomputed via `computeStats()` + `applyRelicBonuses()` + Archive mastery buffs. This prevents corrupted saves from permanently inflating stats.

---

## 🔍 Debugging & Diagnostics
Engine status is exposed via `window.LogDebug(msg, type)`.
- **Reserved Tags**: `[MATH-PHYS]`, `[MATH-MAGIC]`, `[ENEMY-MATH-MAGIC]`, `[ENEMY-MATH-PHYS]`, `[STATE-DIAG]`, `[Aura]`, `[Passive]`, `[Gauntlet]`, `[BUFF]`, `[DEBUFF]`, `[AI-SUPPORT]`, `[HitRoll]`, `[CritRoll]`, `[KO]`.
- **Gauntlet Mode**: Use for stress-testing AI and new enemy tiers. Accessible from the map screen. Boss list defined in `BossGauntlet.getBossIds()` — add new arc bosses here.
- **Magic Defense Formula**: `mdef = def×0.25 + mag×0.25 + level×0.5` — both attacker and defender use this blend. Pure DEF tanks and pure MAG mages both get meaningful resistance without immunity.

---

## 🔄 Service Worker & PWA Update Rules

The game is installable as a PWA. The Service Worker in `sw.js` caches all assets for offline play.

> [!CAUTION]
> **ALWAYS bump `CACHE_NAME`** in `sw.js` when pushing any significant update (new assets, JS changes, CSS changes). The version string (e.g. `nexus-cache-v4.0`) is the sole mechanism that triggers cache invalidation on installed PWAs. Forgetting to bump it means users continue serving stale images and audio from the old cache indefinitely.

### Update Flow (automatic — no user action needed)
1. Browser re-fetches `sw.js` on every app open and does a byte-diff
2. If changed → new SW installs in background, old SW stays active
3. `self.skipWaiting()` in the install handler forces immediate activation on next navigation
4. Activate handler deletes all caches whose key ≠ `CACHE_NAME`

### Sprite Quality Cache Rules
- Character sprites are split into `SPRITES_NORMAL` (PNG ~37 MB) and `SPRITES_LOW` (WebP ~1.7 MB)
- The fetch handler reads `_quality` (set via `SET_QUALITY` postMessage from the page) and only caches sprites matching the player's choice
- Enemy sprites have a single quality — always cached regardless of setting
- When adding new character sprites, add both variants to `SPRITES_NORMAL` and `SPRITES_LOW` in `sw.js`

---

## 📱 Device Support Standards
The game is responsive and cross-platform. UI components MUST be rigorously tested and scale correctly across the following core breakpoints/devices:
1. **iPhone SE (375x667)** - The tightest baseline testing boundary. UI elements cannot overlap or require horizontal scrolling.
2. **iPhone XR / 11 (414x896)** - Mid-tier standard mobile.
3. **iPhone 12/13/14 Pro (390x844)** - Modern portrait standard.
4. **Desktop / Laptops** - Widescreen layouts, where the main wrapper should gracefully constrain with empty side gutters or an expanded view without stretching character sprites incorrectly.
