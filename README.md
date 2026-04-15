# RPG+ — Aethoria Chronicles

> *Eight heroes. Five seals. One immortal shadow that has consumed worlds for seventeen centuries.*

A browser-based tactical RPG with elemental reaction combat, a full narrative campaign across 8 story arcs, and a living world map — no install required.

---

## Quick Start

```
Open index.html in any modern browser.
```

No build step. No server. No dependencies.

---

## Table of Contents

1. [Game Overview](#-game-overview)
2. [Characters](#-characters)
3. [Classes & Abilities](#-classes--abilities)
4. [Combat System](#-combat-system)
5. [Elemental Reactions](#-elemental-reactions)
6. [Status Effects](#-status-effects)
7. [Formation System](#-formation-system)
8. [Story & World](#-story--world)
9. [Maps](#-maps)
10. [Items](#-items)
11. [Relics](#-relics)
12. [Enemies](#-enemies)
13. [Project Structure](#-project-structure)

---

## 🎮 Game Overview

RPG+ is a full-featured JRPG running entirely in the browser:

- **8 playable characters**, each with a unique passive ability and class
- **8 story arcs** with hand-authored dialogue, cutscenes, and boss encounters
- **Turn-based combat** with elemental priming, reactions, crits, evasion, and status effects
- **World map exploration** with animated character sprites, random encounters, and boss nodes
- **Formation system** — Vanguard intercepts, Rearguard evades
- **Relic system** — permanent stat bonuses unlocked by beating bosses
- **Inventory** — 16 item types, usable in and out of battle
- **Party screen** — live stat viewer, passive descriptions, relic slots

---

## 🧙 Characters

Eight characters join your party across the campaign. The first four are available from the start; the remaining four are recruited through story events.

### Starter Party

| Character | Class | Role | Passive |
|-----------|-------|------|---------|
| **Ayaka** *(Aya)* | Cryo Bladestorm | Swift physical striker | **Frostflake Dance** — Always acts first; +3 SPD, attacks carry a cryo edge |
| **Hu Tao** *(Tao)* | Spirit Incinerator | High-risk fire attacker | **Blood Blossom** — When HP < 50%, ATK +35% |
| **Nilou** *(Lulu)* | Hydro Performer | Healer / buffer | **Dance of Haftkarsvar** — All healing amplified by 30% |
| **Xiao** *(Rei)* | Ancient Warden | Tank / barrier setter | **Warden's Valor** — Takes 10% reduced damage; ATK +15% from karmic resolve |

### Recruited Characters

| Character | Class | Arc Joined | Role | Passive |
|-----------|-------|-----------|------|---------|
| **Rydia** *(Ria)* | Summoner | Arc 2 | AOE magic / healing | **Eidolon Bond** — Summons +20% stats; MP efficiency +15% |
| **Lenneth** *(Valka)* | Valkyrie | Arc 2 | Holy attacker / debuffer | **Divine Authority** — DEF +20%; reflects 10% of damage taken |
| **Kain** *(Drake)* | Divine Dragoon | Arc 3 | Speed striker / evader | **Dragon's Leap** — Every 3rd turn, bonus aerial strike; SPD +2 in aerial combat |
| **Leon** *(Rex)* | Grail Guardian | Arc 7 | Demi-god tank / healer | **Divine Blessing** — Grants allies +15% HP regen per turn; takes 12% reduced damage |

### Base Stats (at Level 1)

| Character | HP | MP | ATK | DEF | SPD | MAG |
|-----------|----|----|-----|-----|-----|-----|
| Ayaka | 65 | 30 | 16 | 12 | 18 | 14 |
| Hu Tao | 50 | 22 | 20 | 7 | 14 | 12 |
| Nilou | 72 | 42 | 10 | 13 | 11 | 20 |
| Xiao | 80 | 18 | 18 | 16 | 13 | 8 |
| Rydia | 58 | 48 | 8 | 9 | 12 | 24 |
| Lenneth | 88 | 28 | 19 | 18 | 15 | 16 |
| Kain | 75 | 20 | 19 | 14 | 16 | 10 |
| Leon | 92 | 32 | 22 | 20 | 14 | 18 |

---

## ⚔ Classes & Abilities

Each character has a fixed class with 4 abilities (3 active + 1 ultimate). Ultimates cost more MP and deliver decisive effects.

---

### Cryo Bladestorm — *Ayaka*
*Ice and swift strikes. Speed-scaling damage, freeze control.*

| Ability | Type | MP | Effect |
|---------|------|----|--------|
| Frostblossom Slash | Physical | 0 | 1.5× ATK; 40% chance to slow target |
| Glacial Waltz | Physical AOE | 8 | 2.2× to all enemies; scales with SPD; grants SPD buff |
| Permafrost | Debuff | 6 | 60% freeze; DEF −20% for 2 turns |
| **Cryoclasm** *(Ultimate)* | Physical | 10 | 3.0× damage + SPD scaling; resets cooldown if target is frozen |

---

### Spirit Incinerator — *Hu Tao*
*Fire and life force. Trade HP for devastating power.*

| Ability | Type | MP | Effect |
|---------|------|----|--------|
| Spirit Flame | Physical | 0 | 1.6× ATK; 15% life steal; fire element |
| Paramita Papilio | Buff | 6 | Costs 30% current HP; ATK +60% for 3 turns |
| Sanguine Rouge | Buff | 4 | Fire damage +33%; absorbs fire damage as healing for 5 turns |
| **Spirit Soother** *(Ultimate)* | Physical | 12 | 4.0× dynamic damage scaling with MaxHP & HP lost; massive self-heal |

---

### Hydro Performer — *Nilou*
*Water and grace. The party's primary healer and enabler.*

| Ability | Type | MP | Effect |
|---------|------|----|--------|
| Dance of Blessing | Heal | 5 | Restore 35–55 HP; heal output +30% for 3 turns |
| Water Wheel | Magic AOE | 8 | 2.2× magic to all; heal allies for 50% of damage dealt |
| Harmony Preservation | Buff | 10 | Party ATK +20%, DEF +20%, +5 HP/turn regen for 4 turns |
| **Hajra's Hymn** *(Ultimate)* | Heal | 12 | Restore 50% max HP to all; cleanse all debuffs; SPD +1 to party |

---

### Ancient Warden — *Xiao*
*Wind and karmic defense. Forces enemies to focus on him.*

| Ability | Type | MP | Effect |
|---------|------|----|--------|
| Lancing Strike | Physical | 0 | 1.4× ATK; ignore 20% enemy DEF; wind element |
| Warden's Valor | Buff | 6 | Incoming damage −25%; 15% reflect for 3 turns |
| Karmic Barrier | Buff | 8 | All allies DEF +40%; next attacked ally takes 10% less damage for 2 turns |
| **Mastery of Pain** *(Ultimate)* | Magic | 14 | 3.7× magic + DEF scaling; forces all enemies to target Xiao |

---

### Summoner — *Rydia*
*Magic and eidolons. Powerful AOE and party-wide healing.*

| Ability | Type | MP | Effect |
|---------|------|----|--------|
| Summon Bahamut | Magic AOE | 8 | 2.4× magic to all; fire element |
| Summon Syldra | Heal AOE | 8 | Restore 40–60 HP to all; cure one debuff; water element |
| Eidolon Channel | Buff | 10 | MAG +50%; summons +30% damage for 4 turns |
| **Absolute Summon** *(Ultimate)* | Magic AOE | 14 | 3.8× magic to all; summon phantom guardian for 2 turns |

---

### Valkyrie — *Lenneth*
*Holy and divine judgment. Debuffs enemies, buffs allies.*

| Ability | Type | MP | Effect |
|---------|------|----|--------|
| Valkyrie Strike | Physical | 0 | 1.6× ATK; ignore 15% DEF; holy element |
| Judgment Seal | Debuff | 7 | Enemy ATK −30%, DEF −20% for 3 turns |
| Transcendent Power | Buff | 9 | Party ATK +25%, DEF +30%, holy aura for 4 turns |
| **Divine Execution** *(Ultimate)* | Magic | 13 | 3.6× magic + DEF scaling; stun if enemy HP is low |

---

### Divine Dragoon — *Kain*
*Wind and sky. Aerial evasion, speed snowballing.*

| Ability | Type | MP | Effect |
|---------|------|----|--------|
| Dragoon Lance | Physical | 0 | 1.8× ATK; +1 SPD for 2 turns; wind element |
| Dragon Jump | Physical | 6 | 2.2× ATK; evasion +20% next turn |
| Divine Flight | Buff | 8 | Evasion +40%; SPD +30%; party SPD +2 for 3 turns |
| **Heaven's Fall** *(Ultimate)* | Magic | 12 | 4.0× ATK + SPD scaling; area strike |

---

### Grail Guardian — *Leon*
*Holy and divinity. Tanky multi-target sustain.*

| Ability | Type | MP | Effect |
|---------|------|----|--------|
| Holy Strike | Physical | 0 | 1.7× ATK; holy element |
| Divine Shield | Buff | 7 | DEF +45%; damage reduction 20% for 3 turns |
| Grail Blessing | Heal AOE | 9 | Restore 50–70 HP to all; cleanse all debuffs |
| **Lionheart Ascendant** *(Ultimate)* | Physical | 14 | 2.5× physical + ATK/DEF scaling; bless all allies |

---

## ⚡ Combat System

Battles are turn-based. Turn order is determined by each unit's SPD stat.

### On Your Turn
- **Attack** — Basic physical attack
- **Ability** — Use a class ability (costs MP)
- **Item** — Use an inventory item
- **Guard** — Halves incoming damage until next turn
- **Run** — Attempt to flee; success chance scales with SPD

### Damage Formula

```
physDmg  = ATK × multiplier × (100 / (100 + target.DEF)) × critMult
magicDmg = MAG × multiplier × (100 / (100 + target.RES)) × critMult
```

- **Crit chance**: base 10% + SPD/200 modifier
- **Crit multiplier**: 1.8×
- **Evasion**: base 5% + DEF/300; Rearguard position adds 30%

### MP Regeneration

Each party member recovers **3 MP per turn** passively. Certain passives and relics increase this rate.

---

## 🔥 Elemental Reactions

Hitting a target with one element **primes** an aura on them. A follow-up strike with a second element **detonates** a reaction for bonus effects.

| Aura | Detonator | Reaction | Effect |
|------|-----------|----------|--------|
| Ice | Physical / Earth | **SHATTER** | 1.5× damage; DEF debuff applied |
| Ice | Fire | **MELT** | 2.0× damage |
| Fire | Nature | **CONFLAGRATION** | 1.25× damage; hits all enemies (AOE) |
| Fire | Water | **VAPORIZE** | 2.0× damage |
| Fire | Ice | **MELT** | 1.5× damage |
| Water | Lightning | **CONDUCTIVE** | 1.3× damage; stun applied |
| Nature | Fire | **BURNING** | 1.2× damage; burn DOT applied |

**Elemental affinity** modifies reaction multipliers: hitting a resistant target weakens the bonus; hitting a weakness amplifies it by an additional 1.5×.

Auras are **consumed** on reaction. Only one aura can exist on a target at a time (One Aura Rule).

---

## 💫 Status Effects

### Buffs

| Status | Icon | Effect | Default Duration |
|--------|------|--------|-----------------|
| Regen | 🌿 | +8% max HP per turn | 3 turns |
| Mend | 💖 | Healing output ×1.5 | 3 turns |
| Guardian | 🛡️ | Incoming damage ×0.5 | 3 turns |
| Empower | ⚔️ | ATK ×1.3 | 3 turns |
| Fortify | 🛡️ | DEF ×1.3 | 3 turns |

### Debuffs & Control

| Status | Icon | Effect | Duration |
|--------|------|--------|----------|
| Stunned | 💫 | Skip turn | 1 turn |
| Frozen | ❄️ | Skip turn | 2 turns |
| Burn | 🔥 | DOT damage per turn | Until removed |
| Shattered | ❄️ | DEF ×0.7 | 3 turns |

### Elemental Auras *(reaction primers)*

| Aura | Icon | Applied by |
|------|------|-----------|
| Fire Aura | 🔥 | Any fire-element hit |
| Ice Aura | ❄️ | Any ice-element hit |
| Water Aura | 💧 | Any water-element hit |
| Nature Aura | 🌿 | Any nature-element hit |
| Spark Aura | ⚡ | Any lightning-element hit |

---

## 🧱 Formation System

Up to 4 members can be in the active party at once, placed in **Vanguard** and **Rearguard** positions.

| Position | Index | Effect |
|----------|-------|--------|
| Lead | 0 | Normal |
| Rearguard | 1 | +30% evasion vs physical attacks |
| **Vanguard** | 2 | **Intercepts all physical attacks** aimed at allies |
| Support | 3 | Normal |

The Vanguard interception mechanic makes tank characters like Xiao and Leon extremely effective in slot 2.

---

## 📖 Story & World

The world of Aethoria is in crisis. **Valdris**, the Shadow Emperor, has consumed entire civilizations for seventeen centuries using five stolen Seal Fragments. Your party must collect all five and reassemble them before Valdris finishes breaking through to the last remaining realm.

### Story Arcs

| Arc | Title | Location | Theme | Boss | Fragment |
|-----|-------|----------|-------|------|----------|
| 1 | **The Rift Awakening** | Summoning Grounds → Sacred Ruins | Arrival, trust, purpose | Void Knight | Seal of Origin |
| 2 | **Beneath the Ashes** | Crystal Cavern → Ashveil Kingdom | Loss, resolve, cost of inaction | Demon Lord | Seal of Fire |
| 3 | **The Scorched Spiral** | Ember Wastes | Endurance, buried truths | Dark Phoenix | Seal of Earth |
| 4 | **The Weeping Depths** | Sunken Temple | Perseverance, hidden truths | Sea Kraken | Seal of Wind |
| 5 | **The Shadow's Heart** | Emperor's Sanctum → Core | Sacrifice, triumph | Fallen Angel | Seal of Shadow |
| 6 | **The Fortress Gates** | Valdris's Outer Fortress | Unity, courage | Void Warden | — |
| 7 | **The Inner Sanctum** | Valdris's Core Chamber | Sacrifice, revelation | Shadow Titan | — |
| 8 | **The Shadow Emperor** | The Eternal Void | Redemption, end of eternity | **Shadow Emperor** *(final)* | — |

**Party growth through story:**
- Arcs 1–2: Ayaka, Hu Tao, Nilou, Xiao (core four)
- Arc 2: Rydia and Lenneth rescued and recruited
- Arc 3: Kain joins
- Arc 7: Leon joins (full party of 8)

---

## 🗺 Maps

The world map features 8 explorable zones. Each zone has random encounters and a boss node that unlocks story progression and a boss relic.

| Map | Biome | Boss | Relic Reward |
|-----|-------|------|-------------|
| Verdant Vale | Grasslands / Ruins | Void Knight | Echo of the Unmade |
| Crystal Cavern | Ice caverns | Demon Lord | Cinder of Ashveil |
| Ember Wastes | Volcanic desert | Dark Phoenix | Scorched Core |
| Sunken Temple | Flooded ruins | Sea Kraken | Drowned Sigil |
| Shadow Reach | Corrupted wilds | Fallen Angel Commander | Tarnished Wing |
| Void Citadel | Dark fortress exterior | Void Warden | Void Crown Shard |
| Fortress Ramparts | Fortress interior | Shadow Titan | Rampart Oath |
| Eternal Void | Void dimension | **Shadow Emperor** | Last Light of Aethoria |

Characters are rendered as **animated spritesheet sprites** on the map — 4 directional animations, 3 frames each — walking, facing the camera, looking left and right.

---

## 🎒 Items

Items are usable from the inventory screen or in battle (select "Item" on your turn).

| Item | Type | Effect | Value |
|------|------|--------|-------|
| Potion | Consumable | Restore 80 HP to one member | 50g |
| Hi-Potion | Consumable | Restore 200 HP to one member | 150g |
| Ether | Consumable | Restore 40 MP to one member | 80g |
| Hi-Ether | Consumable | Restore 100 MP to one member | 200g |
| Tent | Consumable | Restore 50% HP to all (map only) | 120g |
| Elixir | Consumable | Fully restore HP & MP to one member | 400g |
| Mega Elixir | Consumable | Fully restore HP & MP to all | 1200g |
| Antidote | Consumable | Cure all debuffs from one member | 40g |
| Phoenix Down | Consumable | Revive fallen member at 25% HP | 300g |
| Strength Tonic | Battle buff | ATK +20% for 3 turns | 100g |
| Barrier Stone | Battle buff | DEF +20% for 3 turns | 100g |
| Smoke Bomb | Utility | Guarantee escape from any battle | 60g |
| Soul Crystal | Utility | Grant 50 EXP to all party members | 500g |
| Golden Feather | Valuable | Sell for 500 gold | 500g |
| Shard Fragment | Key item | Story-critical; connected to the seals | — |

---

## 💎 Relics

Relics grant permanent passive bonuses. They are awarded for defeating bosses and occasionally found as drops. Each character has relic slots visible in the party screen.

### Boss Relics

| Relic | Source | Bonus |
|-------|--------|-------|
| Echo of the Unmade | Arc 1 Boss | SPD +12% · First-strike chance in battle |
| Cinder of Ashveil | Arc 2 Boss | ATK +10% · Fire damage taken −20% |
| Scorched Core | Arc 3 Boss | ATK +12% · DEF +6% |
| Drowned Sigil | Arc 4 Boss | Max HP +15% · Status resistance +25% |
| Tarnished Wing | Arc 5 Boss | DEF +12% · Damage from elites −15% |
| Void Crown Shard | Arc 6 Boss | MAG +12% · MP regenerates 10% each turn |
| Rampart Oath | Arc 7 Boss | DEF +18% · Once per battle: one fallen ally auto-revives at 1 HP |
| Last Light of Aethoria | Arc 8 Final Boss | HP +10% · ATK +10% · MAG +10% · SPD +10% |

### Common & Uncommon Relics

| Relic | Rarity | Bonus |
|-------|--------|-------|
| Shattered Horizon | Uncommon | SPD +8% · ATK +8% · DEF +8% |
| Warden's Chain | Uncommon | DEF +10% · ATK +5% |
| Tide Remembrance | Uncommon | All healing +20% |
| Summoner's Thread | Uncommon | MAG +10% · Max MP +8% |
| Ashen Shard | Common | DEF +6% |
| Cracked Talisman | Common | Max HP +8% |
| Ember Token | Common | ATK +7% |

---

## 👹 Enemies

Over **50 unique enemies** spread across three tiers plus boss encounters.

### Tier 1 — Common Foes
*Found in early zones; light HP, basic single-target attacks.*

Goblin Scout, Giant Bat, Giant Rat, Spore Mushroom, Fire Imp, Armored Crab, Dire Wolf, Poison Spider, Rotting Zombie, Lost Wisp, Lizardman Scout, Road Bandit, Cursed Scarecrow, and more.

### Tier 2 — Mid-game Threats
*Multiple abilities, elemental attacks, status application.*

Dark Knight, Venom Wyvern, Werewolf, Harpy, Minotaur, Necromancer, Fire Elemental, Gargoyle, Lesser Demon, Chimera Beast, Golem, Bone Dragon, Merman, Void Knight, Dark Phantom, Shadow Wraith, and more.

### Tier 3 — Bosses & Elites
*Story bosses and high-HP elites. Multi-phase attacks, elite resistance, passive traits.*

| Boss | Arc | Traits |
|------|-----|--------|
| Void Knight | Arc 1 | High DEF; shadow element |
| Demon Lord | Arc 2 | Fire AOE; summons minions |
| Dark Phoenix | Arc 3 | Rebirth mechanic; fire/shadow hybrid |
| Sea Kraken | Arc 4 | AOE tsunami; water/lightning |
| Fallen Angel Commander | Arc 5 | Holy/shadow duality; multi-target |
| Void Warden | Arc 6 | Damage reduction aura; void element |
| Shadow Titan | Arc 7 | Enrage + regenerating traits; AOE |
| **Shadow Emperor** | Arc 8 | Full elemental repertoire; final boss |

**Mutant traits** (elite enemies):
- `regenerating` — Recovers HP at the end of each of its turns
- `enraged` — ATK scales upward as HP decreases

---

## 📁 Project Structure

```
rpg+/
├── index.html                        ← Entry point — open to play
├── css/
│   └── style.css                     ← All styling + CSS variables
├── js/
│   ├── game.js                       ← Core game loop, screen routing, party menu
│   ├── story.js                      ← All 8 story arcs, dialogue, scene logic
│   ├── data/
│   │   ├── characters.js             ← 8 character definitions
│   │   ├── abilities.js              ← All class abilities (4 per class)
│   │   ├── enemies.js                ← 50+ enemy definitions across 3 tiers
│   │   ├── items.js                  ← 15 item definitions
│   │   └── relics.js                 ← 16 relic definitions
│   ├── battle/
│   │   ├── action-handler.js         ← ActionEngine, ability processors, enemy AI
│   │   ├── battle-core.js            ← Battle init, hit/crit/absorption math
│   │   ├── status-system.js          ← Status application, tick, elemental reactions
│   │   └── turn-manager.js           ← Turn order, KO checks, battle end logic
│   ├── ui/
│   │   ├── battle-ui.js              ← Battle HUD rendering, pop-ups, turn bar
│   │   ├── menu-manager.js           ← Party menu, relic viewer, map encounter UI
│   │   └── result-ui.js              ← Victory / defeat / escape result screen
│   ├── systems/
│   │   └── inventory.js              ← Inventory management, item use in battle
│   ├── map/
│   │   ├── map-engine.js             ← World map state, movement, encounters
│   │   └── map-ui.js                 ← Map rendering, sprite animation, tile drawing
│   └── sprites.js                    ← SpriteRenderer — hero portraits + map sprites
└── images/
    ├── characters/                   ← Character spritesheets (battle + map)
    └── maps/                         ← Map tile assets
```

### Architecture Notes

- **ActionEngine** — Centralised action dispatch. All attacks (hero and enemy) flow through `ActionEngine.execute()` → `ActionEngine._offensive()` → element-specific resolver. No duplicate damage logic.
- **StatusSystem** — Single source of truth for status application, duration ticking, and aura management. Elemental reactions are resolved here.
- **showScreen(id)** — All screen transitions go through this function, which handles BGM switching, step-bar visibility, and dialogue cleanup.
- **ResultUI** — Isolated module for the victory/defeat/escape result screen.
- **BattleUI** — All in-battle rendering: party bars, enemy row, turn indicator, pop-up floaters.

---

## 🌐 Browser Compatibility

Tested and working on:
- Chrome 120+
- Firefox 121+
- Edge 120+

Requires ES6+ (`const`, `class`, template literals, optional chaining). No polyfills included.
