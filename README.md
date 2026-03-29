# Crystal Chronicles RPG — v2.0

**4 Characters × 4 Classes × 4 Enemies**

---

## 📁 Project Structure

```
crystal-chronicles/
├── index.html                  ← Open this to play
├── css/style.css               ← All styling
├── js/
│   ├── sprites.js              ← Pixel art renderer
│   ├── data-loader.js          ← Embeds all JSON data
│   └── game.js                 ← Game engine
├── data/
│   ├── characters.json         ← 4 characters with backstories
│   ├── classes.json            ← 4 classes with abilities
│   ├── enemies.json            ← 4 enemies with sprites
│   └── items.json              ← Items
└── characters/
    └── custom_characters.json  ← Add your own here
```

---

## 🧙 The 4 Characters

| Character | Title | Strength | Passive |
|-----------|-------|----------|---------|
| **Aria** | The Wanderer | SPD / ATK | Windfoot — always acts first |
| **Kael** | The Iron Shield | HP / DEF | Iron Will — DEF+25% below 30% HP |
| **Sera** | The Stormcaller | MAG / MP | Arcane Surge — +15% magic damage |
| **Torin** | The Forest Sage | Balance | Nature's Grace — +5 HP regen/turn |

---

## ⚔ The 4 Classes

| Class | Role | Best With |
|-------|------|-----------|
| **Warrior** | Physical tank, cleave damage | Kael, Aria |
| **Mage** | Burst magic, Fire/Ice/Thunder | Sera |
| **Rogue** | Fast striker, steals, backstab | Aria |
| **Healer** | Cure, Regen, Holy damage | Torin |

**Affinity Bonus:** Each character has 2 preferred classes (shown with ★ AFFINITY tag). These give better combined stat scaling.

---

## 👹 The 4 Enemies

| Enemy | Type | Tier | Special |
|-------|------|------|---------|
| **Toxic Slime** | Ooze / Acid | Easy | Acid splash magic |
| **Bone Knight** | Undead | Medium | Dark Aura magic |
| **Stone Golem** | Construct | Hard | Very high DEF |
| **Shadow Dragon** | Boss | Very Hard | Dark Flame 2x magic |

---

## 🎮 How to Play

1. Open `index.html` in your browser
2. **Step 1 — Choose Character**: Each character has unique base stats and a passive ability
3. **Step 2 — Choose Class**: Classes multiply stats and give you abilities. Affinity classes give better results
4. **Step 3 — Battle**: Fight through 4 enemies in sequence. Level up between fights!

---

## ➕ How to Add a Custom Character

### 1. Edit `characters/custom_characters.json`

```json
{
  "id": "lyra",
  "name": "Lyra",
  "title": "The Starweaver",
  "icon": "⭐",
  "description": "A celestial mage who weaves starlight into weapons.",
  "personality": "Dreamy, precise, distant",
  "portrait_color": "#80c0ff",
  "hair_color": "#c0e0ff",
  "skin_color": "#f0e8ff",
  "armor_color": "#4080c0",
  "base_stats": { "hp": 45, "mp": 45, "atk": 9, "def": 8, "spd": 12, "mag": 22 },
  "stat_bonuses": { "mag": 4, "mp": 8 },
  "class_affinity": ["mage", "healer"],
  "passive": {
    "id": "starlight",
    "name": "Starlight",
    "description": "First ability each battle costs 0 MP."
  },
  "lore": "She learned to read the stars before she learned to speak."
}
```

### 2. Copy into `js/data-loader.js`

Add your character object to `window.CHARACTERS_DATA`.

### 3. Add a custom sprite (optional)

```javascript
// characters/lyra_sprite.js
SpriteRenderer.registerHero('lyra', function(ctx, char, cls) {
  function p(ctx, x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x*3, y*3, w*3, h*3);
  }
  // Draw on a 16×19 grid (each unit = 3px)
  p(ctx, 5, 1, 6, 5, char.skin_color);  // head
  // ...
});
```

Then add to `index.html`:
```html
<script src="characters/lyra_sprite.js"></script>
```

---

## 🧩 Next Features to Add

- [ ] World map with tile exploration
- [ ] Party system (2-3 characters)
- [ ] Equipment / weapon system
- [ ] Save / load (localStorage)
- [ ] Status effects: poison, sleep, blind
- [ ] Random encounters on world map
- [ ] Boss special attack patterns
- [ ] Sound effects (Web Audio API)
- [ ] Animated attack effects (canvas particles)
