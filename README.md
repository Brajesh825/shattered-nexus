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
| **Aya** | Cryo Bladestorm | Swift physical striker | **Frostflake Dance** — Always acts first; +3 SPD, attacks carry a cryo edge |
| **Tao** | Spirit Incinerator | High-risk fire attacker | **Blood Blossom** — When HP < 50%, ATK +35% |
| **Lulu** | Hydro Performer | Healer / buffer | **Dance of Haftkarsvar** — All healing amplified by 30% |
| **Rei** | Ancient Warden | Tank / barrier setter | **Warden's Valor** — Takes 10% reduced damage; ATK +15% from karmic resolve |


### Recruited Characters

| Character | Class | Arc Joined | Role | Passive |
|-----------|-------|-----------|------|---------|
| **Ria** | Summoner | Arc 2 | AOE magic / healing | **Eidolon Bond** — Summons +20% stats; MP efficiency +15% |
| **Valka** | Valkyrie | Arc 2 | Holy attacker / debuffer | **Divine Authority** — DEF +20%; reflects 10% of damage taken |
| **Drake** | Divine Dragoon | Arc 3 | Speed striker / evader | **Dragon's Leap** — Every 3rd turn, bonus aerial strike; SPD +2 in aerial combat |
| **Rex** | Grail Guardian | Arc 7 | Demi-god tank / healer | **Divine Blessing** — Grants allies +15% HP regen per turn; takes 12% reduced damage |

Full base stats and growth rates are in `data/characters.json`.

---

## ⚔ Classes & Abilities

Each character has a fixed class with 4 abilities (3 active + 1 ultimate). Ultimates cost more MP and deliver decisive effects. Full ability definitions, MP costs, and effects are in `data/classes.json`.

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

The Vanguard interception mechanic makes tank characters like Rei and Rex extremely effective in slot 2.

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
- Arcs 1–2: Aya, Tao, Lulu, Rei (core four)
- Arc 2: Ria and Valka rescued and recruited
- Arc 3: Drake joins
- Arc 7: Rex joins (full party of 8)

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

Items are usable from the inventory screen or in battle (select "Item" on your turn). Full item catalog is in `data/items.json`.

---

## 💎 Relics

Relics grant permanent passive bonuses, awarded for defeating bosses and found as drops. Each character has relic slots visible in the party screen. Full relic catalog is in `data/relics.json`.

---

## 👹 Enemies

Over **100 unique enemies** across three tiers plus boss encounters. Full enemy roster with stats, abilities, and lore is in `data/enemies.json`. Boss entity IDs and arc assignments are in `STORY_PROGRESSION.md`.

---

## 🛠️ Architect Pro (Map Editor)

RPG+ includes a high-fidelity **Architect Pro** map editor for creating and modifying game regions. It features a modern glassmorphic UI, high-fidelity SVG assets, and advanced editing tools.

- **URL**: `tools/tile-editor.html`
- **Features**: 
    - **Bucket Fill (G)** and **Rectangle (R)** tools for rapid terrain creation.
    - **Eyedropper (I)** for instant tile sampling.
    - **Master Manifest**: Data-driven asset loading via `sprites.json`.
    - **SVG Support**: Integration of premium vector assets for environmental storytelling.

### Map Data Schema (V1.1)

Maps are exported as JSON with the following structure:

- **Metadata**: Dimensions, versioning, and palette reference.
- **Data (3D Array)**: `[Layer][Y][X]`
    - **Layer 0**: Ground terrain (Grass, Water, Path).
    - **Layer 1**: Objects & Decoration (Trees, Rocks, SVGs).
    - **Layer 2**: Overhead / Canopy (Tree tops, arches).

---

## 📁 Project Structure

```
rpg+/
├── index.html                        ← Entry point — open to play
├── css/                              ← 13 stylesheets (style, animations, battle, map, etc.)
├── data/
│   ├── characters.json               ← 8 character definitions (stats, passives, lore)
│   ├── classes.json                  ← 8 classes (abilities, growths, multipliers)
│   ├── enemies.json                  ← 100+ enemy definitions across 3 tiers
│   ├── items.json                    ← Consumables, revives, buffs
│   ├── relics.json                   ← 20 equippable relics
│   └── story/
│       ├── index.json                ← Arc registry
│       └── arc_1.json … arc_8.json  ← Full narrative for each arc
├── js/
│   ├── game.js                       ← Core state, screen routing
│   ├── story.js                      ← Narrative engine, arc loading, cutscene logic
│   ├── save.js                       ← localStorage persistence, import/export
│   ├── battle/
│   │   ├── combat-engine.js          ← Stat calculations, damage formulas
│   │   ├── action-handler.js         ← Ability execution, enemy AI
│   │   ├── turn-manager.js           ← Turn order, KO checks, battle end
│   │   ├── status-system.js          ← Buffs, debuffs, elemental auras
│   │   ├── passive-system.js         ← Trait queries and multiplier injection
│   │   └── enemy-scaling.js          ← Level-based stat projection
│   ├── ui/
│   │   ├── battle-ui.js              ← Battle HUD, floating numbers, turn bar
│   │   ├── menu-manager.js           ← Party menu, relic viewer
│   │   ├── result-ui.js              ← Victory / defeat / escape screens
│   │   ├── archive-ui.js             ← Bestiary and lore compendium
│   │   └── boss-gauntlet.js          ← Postgame gauntlet challenge
│   ├── systems/
│   │   ├── party.js                  ← computeStats(), buildParty(), relic bonuses
│   │   ├── inventory.js              ← Item management, in-battle use
│   │   └── archive.js                ← Bestiary tracking, mastery buffs
│   └── map/
│       ├── map-engine.js             ← Canvas rendering, camera, game loop
│       ├── map-entities.js           ← NPCs, enemies on map
│       ├── map-ui.js                 ← HUD, camp menu, minimap
│       └── map-data.js               ← Map registry (15 regions)
└── images/
    └── characters/
        ├── faces/                    ← 128×128 face icons (dialogue, HUD)
        ├── spirits/                  ← 256×256 full art (story scenes, menus)
        └── map/sheets/               ← Chibi walk spritesheets (exploration)
```

Architecture decisions and invariants are documented in `CLAUDE.md`.

---

## 🌐 Browser Compatibility

Tested and working on:
- Chrome 120+
- Firefox 121+
- Edge 120+

Requires ES6+ (`const`, `class`, template literals, optional chaining). No polyfills included.
