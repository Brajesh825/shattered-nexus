# Resonance Weapons — System Concept

## The Idea in One Line
> *Each character equips one weapon that resonates with their elemental class — granting personal stat boosts, a unique passive trait, and optionally upgrading one of their abilities.*

---

## How It's Different From Relics

| | **Relics** | **Resonance Weapons** |
|:--|:--|:--|
| Who benefits | **Whole party** | **One character only** |
| Source | Boss drops, exploration | Found, purchased, or crafted |
| Stat changes | Percentage bonuses | Flat + percentage boosts |
| Special effects | Passive combat traits | Passive trait + optional ability mod |
| Slots | 1 equipped at a time | 1 per character |
| Lore anchor | Remnants of fallen worlds | Forged from rift-crystal and memory |

---

## Lore Hook

When the Rift tore open, it did not only pull people through. It pulled **objects** — weapons mid-swing, tools mid-use, instruments mid-note. These objects, saturated with the energy of their original world and now exposed to void energy, have crystallized into something new.

The party calls them **Resonance Weapons**. They are not just tools. They are *echoes* — of a life interrupted, a purpose unfinished, a world that still wants to exist through them.

Each weapon **resonates stronger with characters whose element matches its core**, but any character can wield one.

---

## Weapon Anatomy

```
┌─────────────────────────────────────────────────┐
│  ⚔️  Frostbrand Katana                          │
│  "A blade from a winter that never ended."       │
│                                                 │
│  Element:  Ice ❄️       Rarity: ★★★ Rare        │
│  Character Fit: Aya (Perfect), Sera (Good)       │
│                                                 │
│  STATS                                          │
│  ├─ ATK  +14                                    │
│  ├─ SPD  +6                                     │
│  └─ DEF  +4                                     │
│                                                 │
│  PASSIVE                                        │
│  └─ Cryo Edge: Basic attacks apply Ice Aura     │
│                                                 │
│  RESONANCE BONUS (Ice characters only)          │
│  └─ Cryoclasm deals +25% damage                 │
└─────────────────────────────────────────────────┘
```

---

## The Three Layers

### Layer 1 — Flat Stats
Every weapon gives raw stat boosts. No percentage — just numbers added to the character's final computed stats. Simple and readable.

| Stat | Early Game Range | Late Game Range |
|:--|:--|:--|
| ATK | +8 to +16 | +22 to +40 |
| DEF | +4 to +10 | +12 to +22 |
| MAG | +6 to +14 | +18 to +36 |
| SPD | +3 to +8 | +8 to +16 |
| HP  | +20 to +50 | +60 to +120 |
| MP  | +5 to +12 | +12 to +28 |

### Layer 2 — Passive Trait
One unique combat trait baked into the weapon. Not a status, not a buff — always active.

**Examples:**
- `Cryo Edge` — basic attacks apply Ice Aura
- `Ghost Step` — 15% chance to dodge any attack
- `Soul Link` — healing received by allies heals the wielder for 10%
- `Relentless` — if the wielder KOs an enemy, they gain +1 SPD this turn
- `Void Hunger` — deal +20% damage when below 40% HP
- `Sentinel` — if an adjacent ally would be KO'd, absorb 30% of that hit

### Layer 3 — Resonance Bonus (Element Match)
If the weapon's element matches the character's class element, they unlock an additional effect tied to one specific ability.

**Examples:**

| Weapon Element | Character | Resonance Bonus |
|:--|:--|:--|
| Ice | Aya | *Cryoclasm* deals +25% damage |
| Fire | Tao | *Spirit Soother* heals an additional 10% max HP |
| Wind | Rei | *Mastery of Pain* generates a guard effect |
| Holy | Valka | *Divine Execution* stun chance raised to 60% |
| Water | Lulu | *Hajra's Hymn* restores an extra 15% MP to all |

Non-matching characters still get Layers 1 and 2 — they just miss the Resonance Bonus.

---

## Rarity Tiers

| Tier | Stars | Stats | Passive | Resonance |
|:--|:--|:--|:--|:--|
| **Common** | ★ | Low | None | None |
| **Uncommon** | ★★ | Moderate | Basic passive | None |
| **Rare** | ★★★ | Good | Strong passive | ✅ |
| **Epic** | ★★★★ | High | Powerful passive | ✅ + enhanced |
| **Void-Touched** | ★★★★★ | Very High | Unique trait | ✅ + ability mod |

---

## Where Weapons Come From

| Source | Rarity Range | Notes |
|:--|:--|:--|
| Dungeon chest | ★ – ★★★ | Random, floor-appropriate |
| Shop (gold) | ★ – ★★★ | Reliable but limited stock |
| Boss drop | ★★★ – ★★★★ | Unique weapons per boss |
| Void Fragment crafting | ★★★★ – ★★★★★ | Requires Void Fragments (rare drops) |
| Arc reward | ★★★★★ | Guaranteed on Arc completion |

### Void Fragments
A new drop category — rare crystalline shards from elite enemies and bosses. Used at a **Forge** (map feature, unlocked mid-Arc 2) to craft or upgrade weapons.

- **3 matching Fragments** → forge a Rare weapon for that element
- **5 mixed Fragments** → upgrade any weapon by one rarity tier
- Fragments are **character-agnostic** — any character can use them

---

## Sample Weapons (Core Party)

### Aya — *Winter's Last Petal* ★★★★
> *"A katana found mid-draw, frozen in the moment its owner fell."*
- ATK +18, SPD +10, DEF +6
- **Passive**: First attack each battle always applies Freeze (no RNG)
- **Resonance** (Ice): *Glacial Waltz* hits twice on frozen targets

### Tao — *The Laughing Lantern* ★★★★
> *"A funeral lantern that refuses to go out. It smells like incense and iron."*
- ATK +20, MAG +10, HP +30
- **Passive**: *Blood Blossom* passive activates at 60% HP instead of 50%
- **Resonance** (Fire): *Spirit Soother* steals 50% of damage as HP instead of 35%

### Rei — *Chain of Ten Thousand Nights* ★★★★
> *"Two thousand years of use have worn it smooth. It weighs nothing to him."*
- ATK +12, DEF +20, HP +60
- **Passive**: Reflect 20% of physical damage received back to attacker
- **Resonance** (Wind): *Mastery of Pain* also reduces all incoming damage by 15% for 2 turns

### Lulu — *Tide Caller* ★★★★
> *"A staff carved from driftwood from a coast that no longer exists."*
- MAG +16, MP +18, HP +40
- **Passive**: Healing abilities restore 5 MP to the target as well
- **Resonance** (Water): *Hajra's Hymn* cooldown reduced to 1 instead of 2

---

## Enemy & Monster Balancing

> This is the most critical part of the system. Weapons add meaningful flat stats to characters, which means **enemies must be re-evaluated** at each Arc to avoid trivializing encounters.

### The Problem Without Balancing

A ★★★ weapon adding +18 ATK to Tao at Arc 1 could push her damage output **30–40% above** the intended ceiling for that Arc, making the Void Knight trivial even without a Melt combo.

### Balancing Philosophy: Gear Tiers Mirror Arc Tiers

Weapon rarity is gated by Arc progression — and **enemy stat growth should assume the player has Arc-appropriate gear equipped**.

| Arc | Expected Weapon Rarity | Enemy Stat Adjustment |
|:--|:--|:--|
| Arc 1 (Lv 1–10) | Common ★ / Uncommon ★★ | Baseline — no change to current stats |
| Arc 2 (Lv 11–20) | Uncommon ★★ / Rare ★★★ | +10–15% to enemy HP and ATK |
| Arc 3 (Lv 21–30) | Rare ★★★ / Epic ★★★★ | +20–25% to enemy HP and ATK |
| Arc 4+ (Lv 31+) | Epic ★★★★ / Void-Touched ★★★★★ | +30–40% to enemy HP and ATK |

This is applied through the **existing `tierGrowth` system** in `scaling-config.js` — no new engine needed, just tuned values per Arc tier.

### Boss-Specific Balancing

Bosses should be tuned **assuming the party has the best weapon available for that Arc**. Specifically:

- **Void Knight (Arc 1)**: Balanced assuming ★★ Uncommon weapons. Players with ★★★ should still win, just more comfortably.
- **Spectral Guardian (Arc 2)**: Balanced assuming ★★★ Rare weapons. His 680 HP and 60 DEF wall is designed for parties with weapon-boosted ATK.
- **Future bosses**: Each boss should have a note in their `enemies.json` entry documenting what weapon tier was assumed during balancing.

### Enemy Passive Scaling (Future)

For higher Arc enemies, introduce **enemy-side passives** that counteract specific weapon advantages:

| Enemy Passive | Counters |
|:--|:--|
| `Void Shroud` — immune to elemental auras | Resonance passives like *Cryo Edge* |
| `Iron Will` — first hit each battle deals 50% damage | Burst-first weapons like Tao's *Laughing Lantern* |
| `Nullfield` — disables Resonance Bonus for 2 turns | Over-reliance on Resonance abilities |
| `Adaptive Armor` — DEF +20% if same element hits twice | Mono-element parties |

These passives create **counter-play** that prevents Void-Touched weapons from being an "I win" button in late-game encounters.

### Mutant & Elite Scaling

`mutantThreshold` and `corruptThreshold` in `mutationConfig` already apply stat multipliers. When weapons are introduced:

- **Corrupted** enemies: scale HP by an additional `+5%` per Arc to offset weapon HP boosts
- **Mutants**: their existing `4.0x HP multiplier` remains aggressive enough — no change needed until Arc 4

---

## Open Questions

> [!IMPORTANT]
> **1 slot or 2?** Does each character get exactly 1 weapon slot, or can they also equip an offhand (shield, tome, quiver)?

> [!IMPORTANT]
> **Swappable mid-dungeon?** Or only at the camp/map screen between floors?

> [!NOTE]
> **Forge UI** — dedicated screen, or a menu option at camp? Forge could be a special NPC or a tile on the map.

> [!NOTE]
> **Boss-specific weapons** — should the Void Knight drop *Arren's Oath* (a unique named weapon), or just generic Void Fragments?
