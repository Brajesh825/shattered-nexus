# Shattered Nexus — Combat System Design Reference

> This document explains **how the combat system actually works** — mechanics, intent, and flow — written as a design reference. For raw number tables, see `implementation_plan.md`.

---

## 1. How a Turn Works

Every battle operates on a **Speed-sorted round queue**.

1. At the start of each round, the game builds a queue of all living units (party + enemies) sorted from highest to lowest `SPD`.
2. Units act in that order. When all units have acted, a new round begins with a freshly sorted queue.
3. If a unit is KO'd mid-round, their pending turn is skipped silently.

**Why this matters:** Speed is arguably the most impactful stat in the game. Aya (SPD 38 at Lv5, rising to 213 at Lv40) almost always acts before every enemy. Drake's Dragon's Leap passive grants a bonus attack every 3rd turn — his high SPD means he reaches that 3rd turn faster than slower characters.

---

## 2. Physical Damage (DEF)

### The Formula
```
Phys Damage = max(1,  (ATK + AttackerLv × 1.2) − (DEF + DefenderLv × 0.6) × 0.75  ) × skill_mult × variance
```

### What Each Part Means

| Component | What It Represents |
|---|---|
| `ATK + Level × 1.2` | Total offensive power. Level scaling is large — Lv10→Lv20 adds +12 flat power. |
| `(DEF + Level × 0.6) × 0.75` | Total flat damage absorbed. 10 DEF = ~7.5 damage blocked per hit. |
| `skill_mult` | The ability's base power (e.g. 1.7×, 2.2×, 4.0×). Applied after mitigation. |
| `variance` | Random roll 0.85–1.15. Creates natural hit-to-hit fluctuation. |
| `max(1, ...)` | Damage floor. Even extreme defense allows minimum 1 damage per hit. |

### DEF in Practice

DEF is **flat damage reduction** — not a percentage. This creates strong differentiation:
- **Rei (DEF 221 at Lv40)** reduces T1 and T2 physical hits to the `1` floor constantly.
- **Tao (DEF 46 at Lv40)** takes nearly the full force of every hit — she needs to kill first.
- **Relic DEF buffs compound hard** on already high-DEF characters. A +18% relic on Rei's 221 DEF blocks ~30 extra flat damage per hit; the same relic on Aya blocks only ~12.

### STAB Bonus

When a hero uses a skill whose element matches their class element (e.g. Drake using a Wind skill), the damage is multiplied by **×1.25**. Rewards elemental consistency.

---

## 3. Magic Damage (SDEF — Spirit Defense)

### The Formula
```
Magic Damage = max(1,  (MAG + AttackerLv × 0.8) − (TargetMAG + TargetLv × 0.3) × 0.4  ) × skill_mult × passiveBonus × variance
```

### The Key Difference from Physical

Magic uses the **target's MAG stat as its defense** (Spirit Defense / SDEF). Not DEF. This creates two critical asymmetries:

1. **High-DEF tanks like Rei are NOT magic resistant.** Rei's MEF is low (~25 at Lv20), so enemy spells deal ~65–85 DMG to him even when physical hits deal 1.
2. **High-MAG characters (Lulu, Ria) become nearly magic-immune at high levels.** Lulu at Lv40 has MAG 212. The SDEF mitigation is `(212 + 12) × 0.4 = ~90` — which completely negates most enemy spells.

### Passive Bonus Stack

Some passives amplify magic damage before application:
- `arcane_surge` → ×1.15
- `eidolon_bond` (Ria) → ×1.20

This is why Ria's Absolute Summon at Lv40 can exceed **~1000+ AoE damage** — highest MAG in the game + generous level scaling + 20% passive bonus all compound together.

### Elemental Reactions

| Result | Trigger | Multiplier |
|---|---|---|
| **Weak** | Element is in enemy `weakTo` list | ×1.5 damage |
| **Shatter** | Frozen (from Aya freeze) hit with any attack | ×2.0 damage |
| **Resist** | Element is in enemy `resistTo` list | ×0.5 damage |
| **Immune** | Special immunity flag | ×0 (zero) |

---

## 4. Enemy Tiers

### Tier 1 — Regular Mobs
*Goblin, Bat, Wolf, Spider, Zombie, Wisp...*

- Stats start low (ATK 8–13, DEF 2–8)
- **Growth**: ATK +1.2/Lv, HP +5/Lv
- Early game: genuinely threatening. By Arc 5: routine filler.
- At Lv40, they still deal ~16 DMG to glass cannons — never fully trivial.

### Tier 2 — Elite Mobs
*Orc Berserker, Werewolf, Vampire, Gargoyle, Minotaur...*

- ×1.3 stat multiplier at spawn
- **Growth**: ATK +2.5/Lv, HP +10/Lv
- Mid-game gatekeepers. At Lv20, T2 hits glass cannons for 49–87 DMG/turn.
- Some have built-in buffs (e.g. Orc's `Rage`, Troll's `Regenerate`) that must be played around.

### Tier 3 — Apex Threats
*Dark Knight, Ancient Lich, Chimera Beast, Necromancer, Dark Phoenix...*

- ×1.7 stat multiplier at spawn
- **Growth**: ATK +4.5/Lv, HP +18/Lv — grows the fastest
- A T3 at Lv20 one-shots Aya and Tao in a single standard hit.
- Always require active healing and defensive skill use to survive.

### Boss Multiplier
Arc bosses get ×1.6 on all stats + spawn at pre-scripted high levels (Arc 1 = Lv6, Arc 8 = Lv50). Endgame boss HP regularly exceeds 1,000–2,000+. Script-locked to specific arcs, they do not appear in free exploration.

---

## 5. Horde Scaling

When multiple enemies appear together, each individual enemy's stats are automatically reduced:

| Group Size | Per-Enemy Multiplier |
|---|---|
| 1 | ×1.0 (full power) |
| 2 | ×1.0 (no change) |
| 3 | ×0.78 |
| 4 | ×0.65 |

Four Goblins together are each weaker than one solo Goblin — but they take 4 actions per round vs the party's 4. They overwhelm via action economy, not raw power. AoE skills (Lulu's Water Wheel, Ria's Bahamut, Drake's Heaven's Fall) are designed to swing horde fights heavily back in the party's favor.

---

## 6. Elite Variants

### [CORRUPTED] — Ambient Danger

Any regular enemy that has absorbed Void energy. Denoted by a **purple aura** in battle.

**Stat change:** All stats ×**1.28**
**Spawn rule:** Same level as the area max
**Reward:** EXP ×1.5

**How they fight:** Corrupted enemies are simply harder versions of the base enemy. Their higher DEF hurts physical attackers, but their MAG only goes up ~28% too — so Ria and Lulu still deal near-normal magic damage to them. Corrupted encounters push parties toward magic-first composition.

**When they appear:** From Arc 1 onward. Become routine by Arc 4–5.

---

### [MUTANT] — The Fear Mechanic

Mutants are not normal encounters. For the first half of the game, **they are meant to be run from.**

**Stat change:** All stats ×**1.55**
**Spawn rule:** Area max level **+ 3** (always above the party's level)
**Reward:** EXP ×2.2 if killed
**Special:** Gains **1–2 random Traits**

**The RUN command** (success rate 60%) is the intended response:
- Success → Party escapes cleanly, no damage.
- Failure → Mutant immediately attacks before the next hero turn. Logged as `⚠ Escape failed! [Enemy] strikes!`

**Why running is correct early on:**
- Mutant's DEF is so high that physical heroes deal 0–1 damage per hit (the formula floor).
- Mutant's ATK one-shots Aya, Tao, and Ria at normal arc-appropriate levels.
- The only long-term damage strategy (sustained magic from Ria) requires Ria to survive long enough to cast — she can't.

---

## 7. Mutant Traits

### 🩸 Vampiric
The Mutant heals **25% of all damage it deals** after each hit.

A 199 DMG swing against Aya heals the Mutant for ~50 HP. This defeats the classic "let the tank absorb hits while DPS chip it down" strategy — every hit the Mutant lands is sustain for it, not just hurt for the party. The counters are:
- **Burst it before it heals too much** (Ria's Ultimate, Drake's Heaven's Fall with STAB)
- **ATK debuffs** (Valka's Judgment Seal, Aya's Screaming Gale) reduce both damage AND healing simultaneously

### ⚡ Enraged
The Mutant gains **+5% ATK every turn, permanently**.

This is a **DPS timer**. The longer the fight runs, the more dangerous it becomes:

| Turn | ATK Multiplier | Effect |
|---|---|---|
| 1 | ×1.00 (baseline) | Standard dangerous hit |
| 5 | ×1.22 | ~22% more damage per hit |
| 10 | ×1.63 | Even Rei starts taking serious damage |

After ~10 turns, the Mutant becomes effectively unkillable because every hit removes most of the tank's HP pool and one-shots everyone else. Aya's Permafrost (60% freeze, wastes enemy turns) and Lulu's Hajra's Hymn (party-wide 50% HP heal) are the key tools to survive long enough for Ria to end the fight.

### 💎 Shatter [Element]
The Mutant takes **×2.0 damage from one specific element** (e.g. Shatter[Ice]) and **×0.5 from all others**.

This is a hidden discovery mechanic. When the right element lands, the log shows `⚡ SHATTER!`. From that moment, the entire party should pivot to that element exclusively. A Shatter[Ice] Mutant hit by Aya's Cryoclasm (3.0× ice magic) at Lv20 takes ~352 damage — which is otherwise completely impossible through physical attacks.

Equally important: all other elements deal half damage. Using the wrong element on a Shatter Mutant actively makes the fight harder.

### 🛡️ Immune [Physical]
All physical attacks deal **exactly 0 damage** for the entire battle.

This silences Aya, Drake, Rex and Rei's primary damage source completely. Only magic abilities bypass it: Lulu's Water Wheel, Ria's summons, Valka's Divine Execution, Rex's Lionheart Ascendant. If Ria is already KO'd when this spawns, the party has almost no viable strategy. Running is almost always correct unless Lulu or Valka can sustain enough magic output.

---

## 8. Relics

Relics are the primary power progression system outside of leveling. The party equips **3 relics simultaneously**, and the combination chosen defines what encounters are survivable.

### How They Stack

Relic bonuses are additive within type and then applied as multipliers to base stats. 3 DEF relics each giving +10% DEF → total +30% DEF applied once. Because DEF's new formula multiplier (`×0.75`) is meaningful, even small DEF percentage improvements have large flat blocking effects on high-DEF characters.

### Relic Categories

**Offensive Relics** — ATK%, MAG%, SPD%
Best for: Tao, Ria, Drake, Aya
Effect: Each percent in ATK directly scales with skill multipliers. A +20% ATK relic on Tao (ATK 176 at Lv30) adds ~35 flat power, and her 4.0× ultimate scales that ~+140 on top.

**Defensive Relics** — DEF%, HP%, statusResist
Best for: Rei, Valka, Rex; also Lulu as pseudo-tank
Effect: DEF% matters most on already high-DEF characters. HP% matters most on low-health glass cannons like Tao or Ria who need the "survive one hit" breakpoint.

**Special Effect Relics** — eliteResist, reviveOnce, healAmp, firstStrike, mpRegen
These are the game-changers at critical arc milestones:

| Relic | Effect | When It Matters |
|---|---|---|
| 🪶 Tarnished Wing | Elite dmg −15% | From Arc 6: reduces all Corrupted and Mutant damage |
| 🛡️ Rampart Oath | Revive one fallen ally at 1 HP | Arc 7–8: the anti-wipe safety net |
| 💧 Tide Remembrance | All healing +20% | Any arc: amplifies Lulu's heals significantly |
| 🌑 Echo of the Unmade | First Strike | Aya/Drake go before even the fastest enemies |

---

## 9. The Arc Threat Curve

The arc structure is designed so the player's relationship with elites **evolves** across 8 arcs:

### Arcs 1–4 — "The Fear Phase"

```
Mutants → Run immediately
Corrupted → Dangerous. Use healing items.
Regular T3 → Requires active play
```

Mutants are introduced as horror encounters. The player's first instinct when they appear should be to flee. Corrupted enemies are a meaningful step up but still manageable with potions. Regular T3 enemies begin to teach the importance of elemental matchups and defensive positioning (putting Rei at the front, protecting Ria).

### Arcs 5–6 — "The Gear Phase"

```
Mutants → T1/T2: fight. T3: escape or attempt carefully.
Corrupted → Routine with 2+ relics
```

**Tarnished Wing (Arc 5)** is the turning point relic — its `eliteResist −15%` makes fighting Corrupted and Mutant T1/T2 encounters rewarding rather than suicidal. Rei with Wing + Drowned Sigil takes ~1 damage from T2 Mutants and viable damage from T3 Mutants. Ria can nuke a T3 Mutant in 3 Bahamut casts if Rei buys the time.

### Arcs 7–8 — "The Power Phase"

```
Mutants → All variants: expected combat. Arc 8 → No escape.
Corrupted → Trivial
```

**Rampart Oath (Arc 7)** removes the one-shot dread. When Aya dies to a Mutant T3 hit, she revives at 1 HP. Lulu immediately restores her to full. The fight continues normally. The party finally feels **powerful**, not just surviving. Arc 8 forces the culmination — escape is disabled in all Mutant zones, and the endgame relics make this the most dangerous-but-winnable the game has ever been.

---

## 10. Quick Reference

### Character Role Summary

| Character | Primary Role | Strength | Weakness |
|---|---|---|---|
| ❄️ Aya | Speed DPS / Freeze | Fastest, freezes enemies, STAB ice magic | Low HP — dies to T3 hits |
| 🔥 Tao | Burst DPS (Blood Blossom) | Highest physical DPS, huge ultimates | Lowest HP in the game |
| 💧 Lulu | Healer / Support | Magic-immune by Lv20, best party heals | Low ATK, passive damage only |
| 🌀 Rei | Physical Tank | Functionally immune to physical by Lv10+ | Takes full magic damage |
| ✨ Ria | Magic Nuker | Highest AoE damage in game, magic-immune | Dies to any physical hit |
| 👑 Valka | Balanced Knight | Tanky, reflects damage, versatile | Jack of all, master of none |
| 🐉 Drake | Momentum DPS | Best physical AoE ultimate, rhythm-based | Can't survive sustained T3 hits |
| ⚔️ Rex | Paladin / Anchor | Highest all-round stats, party heals | No single outstanding specialty |

### Stat Who-Cares Summary

| Stat | Primary Users | Ignored By |
|---|---|---|
| ATK | Tao, Drake, Rex | Ria, Lulu |
| DEF | Rei, Rex, Valka | Ria, Tao |
| MAG (offense) | Ria, Lulu, Valka | Tao, Drake |
| MAG (SDEF) | Lulu, Ria resist magic well | Rei, Tao very vulnerable |
| SPD | Aya, Drake | Rei, Rex (slow is fine when tanky) |
| HP | Rei, Rex, Lulu | Ria, Tao (compensate with damage) |

### Skill Multiplier Tiers

| Tier | Range | Examples |
|---|---|---|
| Basic enemy hit | 1.0–1.1× | Goblin slash, Orc swing |
| Hero standard | 1.4–1.8× | Lancing Strike, Valkyrie Strike, Holy Strike |
| Hero strong | 2.0–2.5× | Dragon Jump, Frostblossom, Water Wheel |
| Hero ultimate | 3.0–4.2× | Cryoclasm, Heaven's Fall, Lionheart Ascendant, Absolute Summon |

---

*Document version: Proposed balance pass (pre-implementation). All mechanics reflect new formula constants pending approval.*
