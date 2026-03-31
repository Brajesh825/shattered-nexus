# ⚡ Quick Start: Adding Content

## 🎭 Add a New Character (10 minutes)

```
1. Open: data/characters.json
   ↓
2. Copy TEMPLATES_CHARACTER.json
   ↓
3. Fill in character data (name, stats, colors)
   ↓
4. Open: js/sprites.js
   ↓
5. Add sprite function (copy existing, modify colors)
   ↓
6. Create images:
   - images/characters/spirits/charactername_spirit.png
   - images/characters/faces/charactername_face.png
   ↓
7. Add class to: data/classes.json
   ↓
8. Add moves to: js/svg-animations.js
   ↓
✅ Test in Free Battle mode
```

### Example: Add "Lyra" Character

**Step 1:** Edit `data/characters.json`, add:
```json
{
  "id": "lyra",
  "name": "Lyra",
  "title": "The Stellar Mage",
  "gender": "female",
  "age": 22,
  "origin": "Celestial Observatory",
  "description": "A mage who reads the stars and commands their light",
  "personality": "Wise, mysterious, patient",
  "icon": "⭐",
  "portrait_color": "#fbbf24",
  "hair_color": "#f59e0b",
  "skin_color": "#fef3c7",
  "armor_color": "#f97316",
  "base_stats": {
    "hp": 60,
    "mp": 50,
    "atk": 12,
    "def": 10,
    "spd": 14,
    "mag": 22
  },
  "stat_bonuses": { "mag": 5 },
  "class_affinity": ["stellar_mage"],
  "passive": {
    "id": "starlight_barrier",
    "name": "Starlight Barrier",
    "description": "All allies gain +15% magic defense"
  },
  "lore": "She watched the stars for so long she forgot to watch the ground. When she fell through the rift, she was still looking up."
}
```

**Step 2:** Edit `js/sprites.js`, add to HEROES:
```javascript
lyra(ctx, char, cls) {
  const sc = char.skin_color, hc = char.hair_color, ac = cls ? cls.color : char.armor_color;
  // Hair (star-like, flowing)
  p(ctx, 4, 0, 8, 4, hc);
  p(ctx, 3, 3, 10, 2, hc);
  // Head
  p(ctx, 4, 2, 8, 5, sc);
  // Eyes (glowing star)
  p(ctx, 5, 4, 2, 1, '#301010');
  p(ctx, 9, 4, 2, 1, '#301010');
  p(ctx, 6, 4, 1, 1, '#fbbf24');
  p(ctx, 10, 4, 1, 1, '#fbbf24');
  // Robe (long, elegant)
  p(ctx, 3, 9, 10, 8, ac);
  p(ctx, 2, 9, 1, 8, '#ffffff');
  // Staff (right side)
  p(ctx, 15, 8, 1, 10, '#d4a574');
  p(ctx, 14, 7, 3, 1, '#fbbf24');
}
```

**Step 3:** Create portrait images:
- Draw or export 256x256px spirit portrait
- Save as `images/characters/spirits/lyra_spirit.png`
- Draw or export 128x128px face icon
- Save as `images/characters/faces/lyra_face.png`

**Step 4:** Add moves to `js/svg-animations.js`:
```javascript
'stellar_burst': { duration: 1900, create: () => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 200 200');
  s.setAttribute('width', '200');
  s.setAttribute('height', '200');
  s.classList.add('battle-svg-animation');
  s.innerHTML = `<defs><style>
    @keyframes star-burst {
      0% { r: 5px; opacity: 0; }
      50% { r: 40px; opacity: 1; }
      100% { r: 100px; opacity: 0; }
    }
  </style></defs>
  <circle cx="100" cy="100" r="5" fill="none" stroke="#fbbf24"
          style="animation: star-burst 1900ms ease-out forwards;"/>`;
  return s;
}},
```

**Step 5:** Add to `data/classes.json`:
```json
{
  "id": "stellar_mage",
  "name": "Stellar Mage",
  "description": "Masters of cosmic magic, supporting and attacking with starlight",
  "color": "#f97316",
  "element": "light",
  "moves": ["stellar_burst", "cosmic_shield", "supernova", "eclipse_ascendant"]
}
```

**Step 6:** Test in game:
- Go to Free Battle → Select Lyra
- Verify sprite, portrait appear correctly
- Test battle and moves

---

## 📖 Add a New Arc (15 minutes)

```
1. Copy: TEMPLATES_ARC.json
   ↓
2. Rename to: data/story/arc_6.json
   ↓
3. Fill in arc data (name, theme, boss, chapters)
   ↓
4. Edit: data/story/index.json
   Add reference to arc_6
   ↓
5. Create chapters with dialogue
   ↓
6. Make sure all enemies exist in data/enemies.json
   ↓
✅ Test by progressing story
```

### Example: Arc 6 - "Shadows Fall"

**Step 1:** Create `data/story/arc_6.json`:
```json
{
  "id": "arc_6",
  "number": 6,
  "name": "Shadows Fall",
  "subtitle": "The darkness reaches its peak",
  "theme": "Desperation / Revelation / Hope",
  "location": "The Obsidian Tower",
  "shard": {
    "id": "seal_night",
    "name": "Seal Fragment of Eternal Night",
    "description": "Black as void. Cold as forgotten worlds.",
    "color": "#1a1a2e"
  },
  "enemies_pool": ["shadow_emperor", "void_knight", "dark_knight", "lich"],
  "boss_enemy": "shadow_lord_risen",
  "boss_chapter": {
    "title": "The Shadow Ascendant",
    "background": "obsidian_tower",
    "cast": ["Ayaka", "Hutao", "Nilou", "Xiao"],
    "pre_dialogue": [
      { "speaker": "narrator", "emotion": "apocalyptic", "text": "The tower trembles. Something ancient awakens." },
      { "speaker": "Xiao", "emotion": "grim", "text": "This... this is older than Valdris. The shadow itself is waking." }
    ],
    "post_dialogue": [
      { "speaker": "narrator", "emotion": "solemn", "text": "The darkness recedes. But something fundamental has changed." }
    ]
  },
  "chapters": [
    {
      "id": "arc6_ch1_ascent",
      "title": "The Tower's Call",
      "type": "cutscene",
      "background": "obsidian_tower",
      "cast": ["Ayaka", "Xiao"],
      "scenes": [
        {
          "narration": "The tower rises before them, black stone against a darker sky. It was not here before. Or perhaps it was always here, hidden.",
          "dialogue": [
            { "speaker": "Ayaka", "emotion": "resolved", "text": "It calls to us. I can feel it." },
            { "speaker": "Xiao", "emotion": "low", "text": "Not a call. A challenge." }
          ]
        }
      ]
    }
  ]
}
```

**Step 2:** Edit `data/story/index.json`:
```json
{
  "arcs": [
    { "id": "arc_1", "file": "data/story/arc_1.json" },
    { "id": "arc_2", "file": "data/story/arc_2.json" },
    { "id": "arc_3", "file": "data/story/arc_3.json" },
    { "id": "arc_4", "file": "data/story/arc_4.json" },
    { "id": "arc_5", "file": "data/story/arc_5.json" },
    { "id": "arc_6", "file": "data/story/arc_6.json" }
  ]
}
```

**Step 3:** Make sure boss enemy exists in `data/enemies.json`:
```json
{
  "id": "shadow_lord_risen",
  "name": "The Shadow Lord Risen",
  "level": 50,
  "hp": 600,
  "atk": 30,
  "def": 18,
  "spd": 14,
  "mag": 28,
  "moves": ["void_collapse", "shadow_storm", "reality_warp"],
  "drops": { "gold": 8000, "exp": 20000 },
  "lore": "The primal shadow itself, given form and hunger."
}
```

**Step 4:** Test:
- Play through story
- Reach Arc 6
- Fight boss
- Check dialogue appears correctly

---

## 💬 Add Story Dialogue (5 minutes per scene)

Add to any chapter's scenes array:

```json
{
  "narration": "The chamber falls silent. In that silence, they all understand: there is no going back.",
  "dialogue": [
    { "speaker": "Hutao", "emotion": "earnest", "text": "Whatever happens next—we do it together." },
    { "speaker": "Nilou", "emotion": "soft_strength", "text": "Together." },
    { "speaker": "Ayaka", "emotion": "steady", "text": "Together." },
    { "speaker": "Xiao", "emotion": "quiet", "text": "...Yes." }
  ]
}
```

**Emotion Guide:**
- Serious moments: `grave`, `solemn`, `ominous`, `resolved`
- Gentle moments: `gentle`, `soft`, `warm`, `soft_strength`
- Action moments: `fierce`, `sharp`, `alert`, `grim`
- Thoughtful moments: `calm`, `quiet`, `wondering`, `composed`

---

## 📊 Character Stats Guide

Aim for balance:
```
Tanky Character:        Attacker:              Mage:
HP: 80-100            HP: 50-70              HP: 60-70
ATK: 10-14            ATK: 20-25             ATK: 10-14
DEF: 14-18            DEF: 8-12              DEF: 10-12
SPD: 11-13            SPD: 14-18             SPD: 12-15
MAG: 8-12             MAG: 8-14              MAG: 18-25
MP: 20-30             MP: 15-25              MP: 35-50
```

---

## ✅ Testing Checklist

After adding character:
- [ ] Sprite appears in Free Battle
- [ ] Stats match JSON
- [ ] Name/title display correctly
- [ ] Moves work in battle
- [ ] No console errors (F12)

After adding arc:
- [ ] Arc name appears in story
- [ ] Chapters display properly
- [ ] Dialogue shows with correct emotions
- [ ] Boss battle works
- [ ] Victory leads to next arc

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Sprite doesn't show | Check `js/sprites.js` function name matches character ID |
| Image not found | Check file path and spelling: `images/characters/spirits/characterid_spirit.png` |
| JSON error | Validate JSON at jsonlint.com - likely missing comma or bracket |
| Dialogue doesn't appear | Check character name spelling matches exactly in cast array |
| Move not working | Verify move ID exists in `js/svg-animations.js` |
| Stats seem weak | Compare to existing characters, adjust base_stats and bonuses |

---

## 📚 For More Details

See: `GUIDE_ADDING_CONTENT.md` (comprehensive guide)

---

**That's it! You now have everything to extend the game! 🎮✨**
