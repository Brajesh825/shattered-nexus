# 🎨 Concept: The Dark Phoenix (`dark_phoenix`) — Arc 3 Story Boss

## 📖 Lore Identity & Narrative Anchor
**Region**: Ember Wastes (Arc 3: The Scorched Spiral)
**Entity Class**: Non-humanoid Legendary Firebird
**Lore Fragment**: Sourced directly from `STORY_PROGRESSION.md`. 
> *A creature of renewal with its death-cycle removed by Valdris. Burns endlessly, waiting for a spring that cannot come.*

---

## 🎨 Visual Excellence & Aesthetic Guidelines (Vivid's Domain)
* **The Void Knight Standard**: High-contrast cel-shading with razor-thin outlines emphasizing roiling purple and fiery orange light.
* **Cinematic Boss Intro Protocol**: Triggers a thematic custom intro transition sequence (`obsidianMelt`) upon encounter initiation to set a harrowing visual tone.
* **Curated Premium Palette**:
  * **Primary Body**: `#8b0032` (Deep Ash Crimson)
  * **Core Core**: `#ffaa00` (Blazing Sun Gold)
  * **Ethereal Void Flames**: `#8b5cf6` (Valdris's Violet Signature)

---

## ⚔️ Mathematical Parity & Balance Directives (Aegis's Domain)
* **Tier & Classification**: Tier 3 Arc Story Boss (`isBoss: true`). Receives authoritative `4.5x` baseline HP Boss multipliers.
* **Universal Phase System (`statPhases`)**:
  * **Phase 1 (100% - 51% HP)**: The Scorched Sovereign. Steady physical/magical pressure.
  * **Phase 2 (50% - 21% HP)**: The Endless Burn. Triggers an automatic stat phase transition scaling `mag` by `1.5x` but reducing `def` by `0.8x`.
  * **Phase 3 (20% - 0% HP)**: Desperate Renewal. Magic scales to `2.0x`, speed scales to `1.4x`, simulating an entity burning its own structural integrity faster to force a rebirth cycle that Valdris locked.

---

## 🛠️ Proposed JSON Entity Blueprint (`data/enemies.json`)
```json
{
  "id": "dark_phoenix",
  "name": "Dark Phoenix",
  "subtitle": "An eternal flame crying out for a spring that cannot arrive",
  "element": "fire",
  "isBoss": true,
  "tier": 3,
  "weakTo": ["water", "ice"],
  "resistTo": ["fire", "wind", "physical"],
  "stats": {
    "hp": 850,
    "atk": 45,
    "def": 30,
    "spd": 42,
    "mag": 75
  },
  "reward": {
    "exp": 1250,
    "gold": 450
  },
  "palette": {
    "body": "#8b0032",
    "dark": "#4a0018",
    "shine": "#ffaa00",
    "eye": "#8b5cf6",
    "pupil": "#ffffff"
  },
  "abilities": [
    {
      "id": "void_flare",
      "name": "Void Flare",
      "type": "magic_damage",
      "weight": 50,
      "dmgMultiplier": 1.4
    },
    {
      "id": "scorched_wing",
      "name": "Scorched Wing",
      "type": "physical",
      "weight": 30,
      "dmgMultiplier": 1.1
    },
    {
      "id": "locked_rebirth",
      "name": "Locked Rebirth",
      "type": "buff_mag",
      "weight": 20
    }
  ],
  "statPhases": [
    {
      "hpThreshold": 0.5,
      "statMultipliers": {
        "mag": 1.5,
        "def": 0.8
      },
      "phaseMessage": "The Dark Phoenix burns away its own feathers, magic surging wildly!"
    },
    {
      "hpThreshold": 0.2,
      "statMultipliers": {
        "mag": 2.0,
        "spd": 1.4,
        "def": 0.5
      },
      "phaseMessage": "Blinding violet light erupts from the core—a desperate, locked cycle of renewal!"
    }
  ],
  "lore": "Sourced directly from the official Shattered Nexus story progression archives. The Dark Phoenix was once the sacred herald of the Ember Wastes' spring cycle. When Valdris corrupted the region's leylines, he surgically excised the entity's ability to die and be reborn. It now burns in a continuous state of agony, radiating intense heat that turns the surrounding landscape to ash.",
  "drops": [
    { "item": "Phoenix Ash", "chance": 1.0 },
    { "item": "Ethereal Ember", "chance": 0.4 }
  ]
}
```

---

## 🛡️ Pipeline Rule Authorization
- [x] Originated in `_concepts/characters/` staging ground.
- [ ] Review by **The USER** & **Vivid**.
- [ ] Integration into live `data/enemies.json` upon approval.
