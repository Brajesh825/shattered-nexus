# 🔒 Game Constraints and Limits

## Overview
This document catalogs architectural constraints, hardcoded limits, and practical boundaries in the Crystal Chronicles RPG engine. Understanding these limits is essential for extending the game with new content.

---

## 1. Party System (Battle)

### Hard Limit: 4 Characters Maximum

**Code Locations:**
- `js/game.js:45` — `party: []` comment: "4 party members (all player-controlled)"
- `js/game.js:43` — `selectedChars: []` comment: "ordered array of up to 4 char IDs"

**Enforcement:**
- `js/game.js:556` — Returns early if `G.selectedChars.length >= 4` (prevents selecting 5th character)
- `js/game.js:750` — Requires `G.selectedChars.length < 4` (won't proceed to battle with fewer than 4)

**UI Layout Positions:**
- `js/game.js:69` — `PARTY_POP_X = [42, 108, 174, 240]` (4 X-coordinates for damage popups)
- Each position is hardcoded for a specific character slot
- If extended to 5+ characters, new positions must be added and UI adjusted

**Character Color Mapping:**
- `js/game.js:67` — `CHAR_COLOR = { ayaka:'#7dd3fc', hutao:'#ef4444', nilou:'#2dd4bf', xiao:'#4ade80' }`
- Only 4 colors defined (one per current character)
- **Requirement for new characters:** Must add entry to CHAR_COLOR dictionary

### To Support More Than 4 Characters in Battle:

1. ❌ Add new entries to `CHAR_COLOR` dictionary
2. ❌ Add new X-positions to `PARTY_POP_X` array
3. ❌ Modify selection logic at `js/game.js:556` and `js/game.js:750`
4. ❌ Update battle UI layout to accommodate new party size
5. ❌ Adjust turn queue system (currently designed for 4-member synchronization)
6. ❌ Test all attack, spell, and target selection logic

**Current Status:** ⚠️ **Not recommended without significant refactoring**

---

## 2. Story System (Scene Display)

### Current Flexibility: Technically Unlimited Cast Size

**Code Location:**
- `js/story.js:959-1003` — `_renderSceneCharacters()` function
- Uses `cast.forEach(charName => {...})` with **no explicit limit**
- Dynamically creates character elements for each cast member
- CSS uses flexbox layout (`.s-scene-layer`) with `gap: 20px`

**How It Works:**
```javascript
// Iterates through ALL cast members without limit
cast.forEach(charName => {
  if (!charName) return;
  // Create character element for each cast member
  const charEl = document.createElement('div');
  // ... render logic
});
```

### Practical Limits: Depends on Dictionaries

**Hard Dependencies:**

1. **SPEAKER_COLOR Dictionary** (`js/story.js:7-12`)
   - Only defines: Ayaka, Hutao, Nilou, Xiao
   - Required for dialogue speaker color
   - Missing entry = default color '#f0f0f8'

2. **SPEAKER_IMG Dictionary** (`js/story.js:15-20`)
   - Only defines: Ayaka, Hutao, Nilou, Xiao
   - Uses pattern: `images/characters/spirits/{name}_spirit.png`
   - Missing entry = broken image link

3. **Image Files Required**
   - Spirit portrait: `images/characters/spirits/{charname}_spirit.png`
   - Face icon: `images/characters/faces/{charname}_face.png`

### CSS Layout Constraints:
- `.s-scene-layer` — `flex` container with `gap: 20px` and `flex-end` alignment
- `.s-scene-char img` — Fixed height: `160px`
- No maximum width constraint on container
- Layout **will wrap** if too many characters for screen width (1280px viewport)

### Practical Recommendation: **Up to 6 Characters Per Scene**

At 160px per character + 20px gaps:
- 4 characters: 4×160 + 3×20 = 700px (comfortable)
- 5 characters: 5×160 + 4×20 = 880px (tight but works)
- 6 characters: 6×160 + 5×20 = 1060px (approaching limit)
- 7+ characters: Will exceed typical viewport width and wrap awkwardly

---

## 3. Current Character Roster

### Hardcoded Characters: 4

**Characters:**
- Ayaka (Cryo Bladestorm)
- Hu Tao (Spirit Incinerator)
- Nilou (Hydro Performer)
- Xiao (Yaksha Protector)

**Where Defined:**
- `data/characters.json` — Character stats, lore, passives
- `js/sprites.js` — Pixel art rendering functions (hero/enemy sprites)
- `images/characters/spirits/` — Portrait images (256×256px)
- `images/characters/faces/` — Face icons (128×128px)

### Adding a 5th Character (Battle-Ready)

Would require:
1. ❌ Add entry to `data/characters.json`
2. ❌ Add sprite function to `js/sprites.js`
3. ❌ Create `images/characters/spirits/newchar_spirit.png`
4. ❌ Create `images/characters/faces/newchar_face.png`
5. ❌ Add color to `js/game.js:67` CHAR_COLOR
6. ❌ Add X-position to `js/game.js:69` PARTY_POP_X
7. ❌ Add class to `data/classes.json`
8. ❌ Add animations to `js/svg-animations.js`
9. ❌ Update selection/party logic

**Marked with ❌** because steps 5-7 require architectural changes to battle system (not just data additions).

---

## 4. Story Arc System

### Flexible: No Hard Limit on Arc Count

**Structure:**
- `data/story/index.json` — References N arc files (currently 5)
- Each arc can reference any valid file path
- New arcs can be added by:
  1. Creating `data/story/arc_N.json`
  2. Adding entry to `data/story/index.json` arcs array
  3. Defining chapters, dialogue, and story flow

**No code changes needed** — purely data-driven.

### Chapters Per Arc: Flexible
- Each arc can have any number of chapters
- Chapters are stored in `chapters[]` array in arc JSON
- No hardcoded limits in story engine

### Story Dialogue: Flexible
- Any number of dialogue lines per scene
- Any number of scenes per chapter
- Supports custom emotions via `emotion` field
- See: `QUICK_START.md` for dialogue examples

---

## 5. Enemy System

### Available Enemies: Configurable

**Current Pool:**
- `data/enemies.json` — Defines all enemy types (50+)
- Examples: goblin, bat, rat, slime, orc, skeleton, dragon, lich, etc.

**Adding Enemies:**
1. Add entry to `data/enemies.json`
2. Create sprite function in `js/sprites.js`
3. Create image if needed (optional, can reuse existing)
4. Reference in arc enemy pools
5. No battle system changes needed

**Can add unlimited enemies** — purely data-driven.

---

## 6. Move/Ability System

### Current Moves: 16 (4 per character)

**Defined In:** `js/svg-animations.js`

Each move has:
- `duration` (milliseconds)
- `create()` factory function returning SVG animation
- 78 CSS keyframes for various animations

**Move ID Naming:**
- Snake case format: `glacial_waltz`, `spirit_flame`, etc.
- Must match references in `data/classes.json` moves array
- Must match references in `js/game.js:75-99` moveAnimations dictionary

### Adding More Moves:

1. Add entry to `js/svg-animations.js` with duration and create function
2. Add move ID to character's class `moves[]` array in `data/classes.json`
3. Add timing metadata to `js/game.js:75-99` moveAnimations dictionary
4. Optional: Create corresponding battle logic

**No system limits** — can add as many moves as needed. Only limited by performance.

---

## 7. Class System

### Current Classes: 4 (one per character)

**Defined In:** `data/classes.json`

Each class has:
- `id` (snake_case)
- `name` (display name)
- `description`
- `color` (hex color code)
- `element` (fire, water, cryo, electro, etc.)
- `moves[]` (array of 4 move IDs)

**Adding New Classes:**
1. Add entry to `data/classes.json`
2. Ensure referenced moves exist in `js/svg-animations.js`
3. Update character `class_affinity[]` to include new class if desired
4. No code changes needed

**Can add unlimited classes** — purely data-driven.

---

## 8. Summary Table

| System | Current | Hard Limit | Flexible? | Notes |
|--------|---------|------------|-----------|-------|
| **Battle Party Size** | 4 | 4 | ❌ No | Requires refactoring PARTY_POP_X, CHAR_COLOR, selection logic |
| **Scene Characters** | 4 | ~6 | ✅ Yes | Limited by dictionary entries and screen width |
| **Characters** | 4 | 4 (battle) | Partial | Story scenes: add freely. Battle: requires architectural changes |
| **Story Arcs** | 5 | ∞ | ✅ Yes | Purely data-driven, no code changes |
| **Chapters/Arc** | Varies | ∞ | ✅ Yes | Purely data-driven |
| **Enemies** | 50+ | ∞ | ✅ Yes | Purely data-driven |
| **Moves** | 16 | ∞ | ✅ Yes | Limited by performance, not architecture |
| **Classes** | 4 | ∞ | ✅ Yes | Purely data-driven |

---

## 9. Checklist: Adding Content Without Architectural Changes

✅ **CAN do without code changes:**
- [ ] Add new story arc
- [ ] Add new chapters
- [ ] Add new dialogue
- [ ] Add new enemies
- [ ] Add new classes
- [ ] Add new moves
- [ ] Add characters to story scenes (up to 6 per scene)

❌ **REQUIRES code changes:**
- [ ] Add 5th character to active party (battle)
- [ ] Change party size
- [ ] Extend character limit beyond 6 in scenes

---

## 10. Future: Supporting 5+ Characters in Battle

If you want to support a larger party, here's the refactoring needed:

### Step 1: Make Party Size Configurable
```javascript
const PARTY_SIZE = 5; // was hardcoded as 4
const PARTY_POP_X = [40, 105, 170, 235, 300]; // adjust positions
```

### Step 2: Update Selection Logic
```javascript
if (G.selectedChars.length >= PARTY_SIZE) return; // line 556
if (G.selectedChars.length < PARTY_SIZE) return; // line 750
```

### Step 3: Update UI Layout
- Adjust battle screen character display
- Reposition damage popup markers
- Update CSS for battle-screen layout

### Step 4: Update Move Selection/Turn Queue
- Ensure turn system handles variable party size
- Adjust target selection UI

**Estimated Effort:** 2-3 hours of refactoring + testing

---

## 11. References

For implementation guides, see:
- **QUICK_START.md** — 10-minute walkthroughs for adding content
- **GUIDE_ADDING_CONTENT.md** — Comprehensive step-by-step guides
- **data/TEMPLATES_* .json** — Copy-paste templates for new content

---

**Last Updated:** April 1, 2026
**Version:** 1.0
