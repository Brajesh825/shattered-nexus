# Concept: Party Formation Presets
**Domain**: Aethon (Architect) + Aegis (Combat Systems)
**Status**: Concept — Not Yet Implemented
**Priority**: LOW (Quality of Life)

---

## Overview

By mid-game, players manage 5–6 characters and frequently reorganize their Diamond Formation for different situations — an aggressive glass-cannon setup for grinding, a defensive tank-heavy formation for bosses, a healer-stack for attrition fights. Currently, every formation change requires manually reassigning characters at the Camp Menu. **Formation Presets** eliminate this friction by allowing players to save, name, and instantly recall up to 4 party configurations.

---

## The System

### Access Point
A new **`[⚙️ FORMATIONS]`** button in the Camp Menu opens the Formations overlay. It is positioned between `[CHANGE PARTY]` and `[HEAL PARTY]`.

### Preset Slots
The overlay displays **4 formation preset slots**, each showing:
- A miniature **Diamond Formation diagram** with character portrait bubbles in positions 1–4
- A custom **text label** (up to 16 characters, e.g., "Boss Killer", "Grind Mode", "The Wall")
- `[LOAD]` button — instantly applies the saved formation to the current party
- `[SAVE CURRENT]` button — overwrites the slot with the current party configuration
- A `[CLEAR]` button per slot

### What Is Saved Per Preset
1. The **4 active party members** (which characters are in the party)
2. Their **slot positions** in the Diamond Formation (positions 1, 2, 3, 4)
3. A **custom name** (player-written)

### Persistence
Formation presets are stored in `G.formationPresets` (an array of 4 preset objects) and are fully serialized into the save file. They persist across sessions.

---

## The Diamond Formation Positions (Reference)

```
       [1] Front/Evasion
      /                \
  [2] Vanguard     [3] Flank
      \                /
          [4] Rear
```

- Slot 1 (Front): +30% physical evasion
- Slot 2 (Vanguard): Intercepts single-target attacks
- Slot 3 (Flank): Unrestricted — flanking damage bonus in some skills
- Slot 4 (Rear): Protected — last to be targeted by AoE cascades

---

## Lore Justification

Rex calls formation presets **"Battle Doctrines"** — a term rooted in his 200-year military history. When a preset is loaded, he has an optional banter line (if in the party):

> *"Formation set. The doctrine holds."*

Valka has a different reaction:
> *"These arrangements are... efficient. A Valkyrie evaluates formation discipline before combat worthiness."*

---

## Visual Treatment

### Formation Overlay
- Uses a dark glass panel (`background: rgba(5, 4, 22, 0.95)`, `backdrop-filter: blur(12px)`)
- Each preset slot is a card with a **Diamond Formation mini-diagram** — 4 circle nodes connected by thin gold lines, with character portrait thumbnails inside each node
- The active/last-used preset has a subtle gold border: `border: 1px solid rgba(245, 208, 96, 0.4)`
- Empty slots show the Diamond outline with translucent empty circles and the text `Empty Doctrine`

### Saving Feedback
When `[SAVE CURRENT]` is pressed, the slot's Diamond diagram animates — the character portraits **drop into their nodes** with a brief bounce (`transform: scale(1.15) → scale(1.0)`, 200ms). A toast notification shows: `✓ Doctrine Saved`.

### Loading Feedback
When `[LOAD]` is pressed, the Camp party display updates instantly and a **gold sweep** animation wipes across the party formation area.

---

## Data Structure

```javascript
// G.formationPresets (in game.js)
G.formationPresets = [
  {
    name: "Boss Killer",
    party: [
      { charId: "aya",   slot: 1 },
      { charId: "rei",   slot: 2 },
      { charId: "tao",   slot: 3 },
      { charId: "drake", slot: 4 }
    ]
  },
  null, // empty
  null,
  null
];
```

---

## Edge Cases

| Scenario | Handling |
|---|---|
| A character in the preset is not unlocked | That slot shows a ❓ placeholder. The preset cannot be loaded until the character is unlocked. |
| A character in the preset is KO'd and uncleansed | The preset loads, but the KO'd member is placed with 1HP until healed. |
| Less than 4 characters unlocked | Presets can be saved with fewer than 4 members. Empty slots show as `—`. |

---

## Implementation Path

1. `js/game.js` — `G.formationPresets` array (4 slots, nullable, persisted in save)
2. `js/systems/party.js` — `Party.savePreset(slot)`, `Party.loadPreset(slot)` functions
3. `js/map/map-ui.js` — Formations overlay UI + `[FORMATIONS]` button in camp menu
4. `index.html` — Formations overlay DOM element
5. `css/map.css` — Diamond mini-diagram styles, preset card animation
6. `data/banter.json` — Rex + Valka preset-load banter entries (trigger: `PRESET_LOADED`)
