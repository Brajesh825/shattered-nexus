# 🎮 Crystal Chronicles — Content Addition Guide

Complete guides for extending the game with new characters, arcs, and story content.

---

## 📖 Table of Contents
1. [Adding New Characters](#adding-new-characters)
2. [Adding New Arcs](#adding-new-arcs)
3. [Adding Story & Dialogue](#adding-story--dialogue)
4. [Adding Classes & Moves](#adding-classes--moves)
5. [Adding Enemies](#adding-enemies)
6. [Quick Reference](#quick-reference)

---

## ✨ Adding New Characters

### Step 1: Add Character Data to `data/characters.json`

Open `data/characters.json` and add a new character object:

```json
{
  "id": "khaenri'ah",
  "name": "Dainsleif",
  "title": "The Twilight Wanderer",
  "gender": "male",
  "age": 500,
  "origin": "Khaenri'ah, the Fallen Kingdom",
  "description": "A mysterious wanderer bearing the curse of his fallen kingdom. He fights with the precision of a royal guard and the weight of a thousand regrets.",
  "personality": "Solemn, protective, burdened by the past",
  "icon": "🌑",
  "portrait_color": "#9d4edd",
  "hair_color": "#4a0080",
  "skin_color": "#e8d8ff",
  "armor_color": "#6a4c93",

  "base_stats": {
    "hp": 75,
    "mp": 25,
    "atk": 17,
    "def": 14,
    "spd": 15,
    "mag": 11
  },

  "stat_bonuses": {
    "def": 2,
    "atk": 2,
    "hp": 3
  },

  "class_affinity": ["twilight_wielder"],

  "passive": {
    "id": "curse_of_the_abyss",
    "name": "Curse of the Abyss",
    "description": "Takes 15% reduced damage. Every turn in battle grants +2% ATK (stacks up to 100%)."
  },

  "lore": "Once a prince of Khaenri'ah. Now a wanderer between worlds, bearing the curse that destroyed his kingdom."
}
```

**Key Fields:**
- `id`: Unique lowercase identifier (used in story, moves, etc.)
- `base_stats`: HP, MP, ATK, DEF, SPD, MAG (see existing characters for balance)
- `icon`: Emoji representation (shown in UI)
- `portrait_color`: Hex color for UI elements
- `class_affinity`: Array of class IDs the character can use
- `passive`: Special ability unique to this character

---

### Step 2: Create Character Sprite

Edit `js/sprites.js` and add rendering function to `HEROES` object:

```javascript
dainsleif(ctx, char, cls) {
  const sc = char.skin_color, hc = char.hair_color, ac = cls ? cls.color : char.armor_color;

  // Hair (long, dark, flowing)
  p(ctx, 3,  0, 10, 5, hc);
  p(ctx, 2,  4, 2, 12, hc);   // left side
  p(ctx, 12, 4, 2, 12, hc);   // right side

  // Head
  p(ctx, 4,  2, 8, 5, sc);

  // Eyes (glowing purple)
  p(ctx, 5,  4, 2, 1, '#301030');
  p(ctx, 9,  4, 2, 1, '#301030');
  p(ctx, 5,  4, 1, 1, '#9d4edd'); // iris
  p(ctx, 9,  4, 1, 1, '#9d4edd');
  p(ctx, 6,  3, 1, 1, '#ffffff'); // glint
  p(ctx, 10, 3, 1, 1, '#ffffff');

  // Crown/circlet
  p(ctx, 3, 0, 10, 1, '#d4a574');
  p(ctx, 5, 0, 1, 1, '#9d4edd');
  p(ctx, 9, 0, 1, 1, '#9d4edd');

  // Armor (purple-tinged)
  p(ctx, 4,  9, 8, 5, ac);
  p(ctx, 3,  9, 1, 5, '#e0d8ff');

  // Cape (dark, flowing)
  p(ctx, 2,  8, 12, 8, '#4a0080');
  p(ctx, 1, 10, 1, 6, '#6a4c93');
  p(ctx, 15,10, 1, 6, '#6a4c93');

  // Sword (elegant, purple-tinged)
  p(ctx, 14, 9, 2, 8, '#c0c0c0');
  p(ctx, 13, 12, 3, 1, '#804010');
}
```

**Tips:**
- Use `p(x, y, width, height, color)` function
- 3px grid system (16×19 grid @ 3px per pixel = 48×57px canvas)
- Keep colors consistent with `char.skin_color`, `char.hair_color`, `char.armor_color`
- Reference existing sprites in `js/sprites.js` for structure

---

### Step 3: Create Character Portrait Images

Create two PNG files:
- `images/characters/spirits/dainsleif_spirit.png` (full portrait for story scenes)
- `images/characters/faces/dainsleif_face.png` (small face icon for dialogue)

**Recommended Sizes:**
- Spirit: 256×256px or larger
- Face: 128×128px

---

### Step 4: Create SVG Animations (Moves)

Add character's move animations to `js/svg-animations.js`:

```javascript
const SVGAnimations = {
  // ... existing moves ...

  'twilight_slash': { duration: 1900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes twilight-blade {
        0% { stroke-dashoffset: 300; opacity: 0; }
        20% { opacity: 1; }
        60% { stroke-dashoffset: 0; opacity: 1; }
        100% { opacity: 0; }
      }
    </style></defs>
    <line x1="50" y1="50" x2="150" y2="150"
          stroke="#9d4edd" stroke-width="4"
          stroke-dasharray="200" stroke-dashoffset="200"
          style="animation: twilight-blade 1900ms ease-out forwards;"/>`;
    return s;
  }},
};
```

See `js/svg-animations.js` for more animation examples.

---

### Step 5: Add Class & Moves

Edit `data/classes.json`:

```json
{
  "id": "twilight_wielder",
  "name": "Twilight Wielder",
  "description": "Masters of shadow and light, cursed yet powerful",
  "color": "#6a4c93",
  "element": "twilight",
  "moves": [
    "twilight_slash",
    "shadow_step",
    "abyss_pulse",
    "eternal_night"
  ]
}
```

Then add move definitions in `data/classes.json` (or create separate `data/moves.json`):

```json
{
  "id": "twilight_slash",
  "name": "Twilight Slash",
  "type": "physical",
  "element": "twilight",
  "power": 1.5,
  "accuracy": 95,
  "description": "A slash infused with shadow magic"
}
```

---

### Step 6: Add to Story

Update `data/story/arc_X.json` to include your character in story scenes:

```json
{
  "cast": ["Ayaka", "Hutao", "Nilou", "Xiao", "Dainsleif"],
  "dialogue": [
    { "speaker": "Dainsleif", "emotion": "solemn", "text": "I sense the darkness. It is familiar. This burden is mine to bear." }
  ]
}
```

---

### Checklist: Adding a Character
- [ ] Character data added to `data/characters.json`
- [ ] Sprite rendering function added to `js/sprites.js`
- [ ] Spirit portrait created (`images/characters/spirits/`)
- [ ] Face icon created (`images/characters/faces/`)
- [ ] SVG animations created in `js/svg-animations.js`
- [ ] Class created in `data/classes.json`
- [ ] Moves defined in `data/classes.json`
- [ ] Character added to preloader in `js/asset-preloader.js`
- [ ] Story dialogue includes character

---

## 🗺️ Adding New Arcs

### Step 1: Create Arc JSON File

Create `data/story/arc_6.json`:

```json
{
  "id": "arc_6",
  "number": 6,
  "name": "The Final Seal",
  "subtitle": "All must end. All must begin.",
  "theme": "Sacrifice / Truth / New Beginning",
  "location": "The Throne of Valdris",

  "shard": {
    "id": "seal_eternity",
    "name": "Seal Fragment of Eternity",
    "description": "A crystal containing the final seal. Black and white together.",
    "color": "#1a1a1a"
  },

  "enemies_pool": ["shadow_emperor", "void_knight", "demon_lord", "lich"],

  "boss_enemy": "valdris_final",
  "boss_chapter": {
    "title": "Valdris Unbound",
    "background": "throne_of_valdris",
    "cast": ["Ayaka", "Hutao", "Nilou", "Xiao", "Dainsleif"],
    "pre_dialogue": [
      { "speaker": "narrator", "emotion": "apocalyptic", "text": "The final throne. The heart of all corruption. Valdris waits." },
      { "speaker": "Xiao", "emotion": "resolute", "text": "This ends here. All of it." }
    ],
    "post_dialogue": [
      { "speaker": "narrator", "emotion": "bittersweet", "text": "The darkness falls. The world breathes. Valdris is no more." }
    ]
  },

  "chapters": [
    {
      "id": "arc6_ch1_ascent",
      "title": "The Final Ascent",
      "type": "cutscene",
      "background": "throne_of_valdris",
      "cast": ["Ayaka", "Hutao", "Nilou", "Xiao", "Dainsleif"],
      "scenes": [
        {
          "narration": "The five stand at the base of the tower. Above, darkness churns.",
          "dialogue": [
            { "speaker": "Ayaka", "emotion": "resolute", "text": "Together. Always." },
            { "speaker": "Xiao", "emotion": "low", "text": "Then we climb." }
          ]
        }
      ]
    }
  ]
}
```

**Required Fields:**
- `id`: Arc identifier (arc_1, arc_2, etc.)
- `number`: Arc number (1-5, etc.)
- `name`: Full arc name
- `subtitle`: Short tagline
- `theme`: Main themes of the arc (separated by /)
- `shard`: The seal fragment story element
- `boss_enemy`: Boss enemy ID
- `chapters`: Array of chapters (see next section)

---

### Step 2: Update Story Index

Edit `data/story/index.json`:

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

---

### Step 3: Add Arc Enemies & Boss

Update the arc JSON to include:

```json
"enemies_pool": ["shadow_emperor", "void_knight", "demon_lord", "lich"],
"boss_enemy": "valdris_final"
```

Make sure these enemy IDs exist in `data/enemies.json`:

```json
{
  "id": "valdris_final",
  "name": "Valdris, The Unbound",
  "level": 45,
  "hp": 500,
  "atk": 28,
  "def": 15,
  "spd": 12,
  "mag": 25,
  "moves": ["void_blast", "shadow_surge", "reality_tear"],
  "drops": { "gold": 5000, "exp": 10000 },
  "lore": "The final form of the scholar turned shadow god."
}
```

---

### Checklist: Adding an Arc
- [ ] Arc JSON file created (`data/story/arc_X.json`)
- [ ] Arc added to `data/story/index.json`
- [ ] Boss enemy exists in `data/enemies.json`
- [ ] All enemies in `enemies_pool` exist
- [ ] At least 1-2 chapters defined
- [ ] Boss pre/post dialogue written
- [ ] Theme and location described

---

## 📝 Adding Story & Dialogue

### Chapter Structure

```json
{
  "id": "arc1_ch5_revelation",
  "title": "Chapter Title",
  "type": "cutscene",
  "background": "background_id",
  "cast": ["Character1", "Character2"],

  "scenes": [
    {
      "narration": "Long-form story narration. Describe the scene vividly.",
      "dialogue": [
        { "speaker": "Character", "emotion": "calm", "text": "Dialogue text." },
        { "speaker": "narrator", "emotion": "grave", "text": "Narration can also appear as dialogue." }
      ]
    },
    {
      "narration": "Second scene in the chapter...",
      "dialogue": []
    }
  ]
}
```

### Dialogue Emotions

Available emotions for characters:
- `calm`, `quiet`, `solemn`, `grave`, `ominous`
- `resolved`, `determined`, `fierce`, `sharp`
- `gentle`, `soft`, `warm`, `soft_strength`
- `awed`, `wondering`, `sad`, `sorrowful`
- `mischievous`, `earnest`, `unusual_quiet`
- `low`, `grim`, `alert`, `controlled`, `composed`, `serene`, `steady`

### Adding a Chapter to an Arc

```json
{
  "chapters": [
    // ... existing chapters ...
    {
      "id": "arc2_ch3_mystery",
      "title": "Whispers in the Dark",
      "type": "cutscene",
      "background": "cursed_forest",
      "cast": ["Hutao", "Nilou", "Xiao"],
      "scenes": [
        {
          "narration": "The three wander deeper into the forest. The trees here are different — wrong. Their bark is too dark, their branches too angular.",
          "dialogue": [
            { "speaker": "Nilou", "emotion": "uneasy", "text": "Something watches us. Can you feel it?" },
            { "speaker": "Xiao", "emotion": "alert", "text": "Malevolent energy. Old. And hungry." },
            { "speaker": "Hutao", "emotion": "mischievous", "text": "Well, at least it's honest about its intentions. I respect that in a curse." }
          ]
        },
        {
          "narration": "The forest opens into a clearing. In its center stands a monument of stone, covered in symbols that hurt to look at.",
          "dialogue": [
            { "speaker": "narrator", "emotion": "ominous", "text": "This place remembers pain. Every soul that died here left an echo." },
            { "speaker": "Hutao", "emotion": "quiet", "text": "...I can hear them. So many voices." }
          ]
        }
      ]
    }
  ]
}
```

---

## ⚔️ Adding Classes & Moves

### Step 1: Create Class in `data/classes.json`

```json
{
  "id": "shadow_dancer",
  "name": "Shadow Dancer",
  "description": "Swift and deadly, commanding both darkness and grace",
  "color": "#8b5a8a",
  "element": "shadow",
  "moves": [
    "shadow_waltz",
    "night_embrace",
    "obsidian_storm",
    "eternal_darkness"
  ]
}
```

### Step 2: Add SVG Animation for Each Move

```javascript
'shadow_waltz': { duration: 2000, create: () => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 200 200');
  s.setAttribute('width', '200');
  s.setAttribute('height', '200');
  s.classList.add('battle-svg-animation');
  s.innerHTML = `<defs><style>
    @keyframes waltz-spin {
      0% { transform: rotate(0deg); opacity: 0; }
      100% { transform: rotate(720deg); opacity: 0; }
    }
    @keyframes shadow-bloom {
      0% { r: 5px; opacity: 0; }
      50% { r: 30px; opacity: 1; }
      100% { r: 80px; opacity: 0; }
    }
  </style></defs>
  <circle cx="100" cy="100" r="5" fill="none" stroke="#8b5a8a" stroke-width="2"
          style="animation: shadow-bloom 2000ms ease-out forwards;"/>
  <g style="animation: waltz-spin 2000ms ease-out forwards;">
    <polygon points="100,50 110,70 90,70" fill="#8b5a8a"/>
  </g>`;
  return s;
}},
```

---

## 👹 Adding Enemies

Edit `data/enemies.json`:

```json
{
  "id": "shadow_wraith",
  "name": "Shadow Wraith",
  "level": 18,
  "hp": 45,
  "atk": 14,
  "def": 6,
  "spd": 16,
  "mag": 12,
  "element": "shadow",
  "moves": ["shadow_slash", "dark_pulse"],
  "drops": {
    "gold": 120,
    "exp": 350,
    "items": [
      { "id": "shadow_shard", "chance": 0.15 }
    ]
  },
  "lore": "A manifestation of pure darkness, given form by the breaking seals."
}
```

Then create enemy sprite image:
- `images/enemies/shadow_wraith.png` (any size, will be scaled by game)

---

## 🔗 Quick Reference

### File Structure
```
data/
├── characters.json          # Character stats, stats, passives
├── classes.json            # Classes & moves
├── enemies.json            # Enemy definitions
└── story/
    ├── index.json          # Story metadata
    ├── arc_1.json          # First arc chapters & dialogue
    ├── arc_2.json
    └── ...

js/
├── sprites.js              # Character sprite rendering
├── svg-animations.js       # Battle move animations
├── story.js                # Story logic & dialogue display
└── game.js                 # Battle system

images/
├── characters/
│   ├── spirits/            # Full character portraits (story scenes)
│   └── faces/              # Face icons (dialogue)
└── enemies/                # Enemy sprites
```

### Common JSON IDs (for reference)
- **Emotions:** calm, grave, ominous, resolute, gentle, soft, awed, sad, mischievous
- **Elements:** cryo, pyro, hydro, anemo, electro, geo, shadow, twilight
- **Speakers:** Character names or "narrator"

### Stat Balancing Tips
- **HP:** 50-120 (depends on def)
- **ATK:** 10-25
- **DEF:** 7-18
- **SPD:** 11-20 (higher = faster turn order)
- **MAG:** 8-25
- **MP:** 15-50

---

## 🧪 Testing Your Content

1. **Character Test:**
   - Go to Free Battle → Select your new character
   - Verify sprite renders correctly
   - Check stats match JSON
   - Test moves in battle

2. **Story Test:**
   - Go to New Story → Progress to your arc
   - Verify dialogue displays
   - Check character portraits load
   - Test battle encounters

3. **Animation Test:**
   - Open browser dev console
   - Check for JS errors
   - Play a move animation
   - Verify smooth playback

---

## 📌 Common Mistakes

❌ **Wrong sprite rendering:** Mismatched coordinate system or color variables
❌ **Missing image files:** Portrait/face not found
❌ **Invalid JSON:** Missing commas, unclosed brackets
❌ **Character ID mismatch:** "dainsleif" in JSON but "Dainsleif" in dialogue
❌ **Animation duration mismatch:** Class says 560ms but animation is 1900ms
❌ **Missing boss enemy:** Arc references enemy that doesn't exist

---

## 🎯 Quick Start: Add Your First Character

1. Copy existing character object from `data/characters.json`
2. Change `id`, `name`, `title`, colors, stats
3. Add sprite function to `js/sprites.js` (copy & modify existing)
4. Create portrait images (resize existing images)
5. Add moves to SVG animations (copy & modify existing)
6. Create class in `data/classes.json`
7. Add character to story dialogue in arc chapter
8. Test in Free Battle mode

---

**Questions? Check the existing JSON files for more examples!**
