# Hu Tao — Battle Sprite Sheet

## Existing Sheets (reference)

| File | Location | Used for |
|------|-----------|---------|
| `hutao_sheet.png` | `images/characters/map/sheets/` | Chibi walk — exploration |
| `hutao_face.png` | `images/characters/faces/` | Portrait — HUD / dialogue |
| `hutao_spirit.png` | `images/characters/spirits/` | Full art — story / menus |

---

## Battle Sheet Spec

```
Frame size : 160 × 200 px
Format     : PNG-32 (transparent bg)
Facing     : character faces RIGHT
```

6 actions split across **2 source files**, merged into one final sheet.

---

## File 1 — `hutao_battle_a.png`  *(active actions)*

| Row | Action  | Frames | Loop | FPS | Notes |
|-----|---------|--------|------|-----|-------|
| 0   | idle    | 4      | yes  | 6   | swaying, playful lean, ghost flames flicker at hem |
| 1   | attack  | 6      | no   | 14  | polearm spinning lunge → pyro burst on impact → pull back |
| 2   | skill   | 8      | no   | 10  | ghost summon rises → Hu Tao channels blood flame → full pyro release |

```
Sheet size : 1280 × 600 px  (8 cols × 3 rows)
```

---

## File 2 — `hutao_battle_b.png`  *(reactive actions)*

| Row | Action  | Frames | Loop | FPS | Notes |
|-----|---------|--------|------|-----|-------|
| 0   | hurt    | 3      | no   | 11  | stumble back, hat tips forward, flames sputter |
| 1   | ko      | 5      | no   | 8   | kneel → slump sideways → collapse, ghost flames fade out, hold last frame |
| 2   | victory | 4      | yes  | 6   | twirl polearm, wink, ghost appears beside her and bows |

```
Sheet size : 1280 × 600 px  (8 cols × 3 rows)
```

---

## Merged Output — `hutao_battle.png`

Stack File 1 on top of File 2:

```
Row 0 — idle     (from hutao_battle_a)
Row 1 — attack   (from hutao_battle_a)
Row 2 — skill    (from hutao_battle_a)
Row 3 — hurt     (from hutao_battle_b)
Row 4 — ko       (from hutao_battle_b)
Row 5 — victory  (from hutao_battle_b)
```

```
Final size : 1280 × 1200 px
Destination: images/characters/battle/hutao_battle.png
```

---

## Code Reference

```js
const HUTAO_BATTLE = {
  frameW: 160, frameH: 200,
  actions: {
    idle:    { row: 0, frames: 4, loop: true,  fps: 6  },
    attack:  { row: 1, frames: 6, loop: false, fps: 14 },
    skill:   { row: 2, frames: 8, loop: false, fps: 10 },
    hurt:    { row: 3, frames: 3, loop: false, fps: 11 },
    ko:      { row: 4, frames: 5, loop: false, fps: 8  },
    victory: { row: 5, frames: 4, loop: true,  fps: 6  },
  }
};
```

---

## Checklist

- [ ] `hutao_battle_a.png` — idle, attack, skill
- [ ] `hutao_battle_b.png` — hurt, ko, victory
- [ ] Merge → `hutao_battle.png`
