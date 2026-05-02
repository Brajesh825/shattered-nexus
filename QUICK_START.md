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

For the exact schema, copy an existing entry from `data/characters.json` and `data/classes.json` — they are the canonical templates.

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

For the exact schema, copy an existing arc file from `data/story/arc_1.json` — it is the canonical template. All 8 arcs already exist; add a new one by following the same structure.

---

## 💬 Add Story Dialogue (5 minutes per scene)

Add to any chapter's scenes array:

```json
{
  "narration": "The chamber falls silent. In that silence, they all understand: there is no going back.",
  "dialogue": [
    { "speaker": "Tao", "emotion": "earnest", "text": "Whatever happens next—we do it together." },
    { "speaker": "Lulu", "emotion": "soft_strength", "text": "Together." },
    { "speaker": "Aya", "emotion": "steady", "text": "Together." },
    { "speaker": "Rei", "emotion": "quiet", "text": "...Yes." }
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

---

**That's it! You now have everything to extend the game! 🎮✨**
