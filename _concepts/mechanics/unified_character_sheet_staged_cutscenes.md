# Concept: Unified Character Sheet (`unisheet v1`) & Staged Cutscene System

## 📋 Identity
- **Ref**: `nexus-concept-unisheet-staged-cutscenes-v1.0`
- **Status**: DRAFT — pending Curator review
- **Enforcing Personas**: The Curator (Gatekeeper), Vivid (Aesthetics), Aethon (Architect), Chronicler (Narrative)
- **Touches**: `js/cutscene.js`, `js/sprites.js`, `js/map/map-entities.js`, `data/story/*.json` schema, `images/characters/sheets/`, `sw.js`, `css/story-ui.css`

---

## 🎯 Goal

Replace the dual-pipeline sprite system (small map sprite + large `_sprite.png` / `_sprite_1.png` cutscene portraits) with a **single 96×96 cell sprite sheet per character** that drives both map walking and cutscene presence. Cutscenes are reframed as a **stage**: characters walk on from off-screen, stand at marks, and speak with light animation — no oversized portraits for routine dialogue. Cinematic portrait mode is preserved as an opt-in escape hatch (`chap.epic = true`) for ~5–10 climactic story moments per game.

### Why this matters
- **Asset workload collapse**: per-character files drop from 4 (Classic PNG + Vivid PNG + 2 WebP) to 1 sheet PNG + 1 JSON entry. New characters become add-one-file operations.
- **Stylistic coherence**: the Aya the player walks around as *is* the Aya in the cutscene. No more pipeline-split visual identity.
- **Payload reduction**: ~37 MB `SPRITES_NORMAL` → well under 6 MB total. The `SPRITES_NORMAL` / `SPRITES_LOW` quality toggle becomes unnecessary for routine play.
- **Climactic moments hit harder**: when the Vivid portrait *does* appear (epic chapters), it lands because it isn't the default render mode anymore.

---

## 🎨 Creative & Aesthetic Specifications (Vivid)

### 1. The `unisheet v1` Format

**One PNG per character. One JSON entry. That's the contract.**

#### File contract
- **Location**: `images/characters/sheets/<charid>.png`
- **Cell size**: **96 × 96 px** (fixed)
- **Sheet dimensions**: **384 × 384 px** (4 cols × 4 rows = 16 cells)
- **Background**: transparent
- **Render mode**: `image-rendering: pixelated`, pixel-grid aligned

#### Cell grid

| Row | Col 0 (idle) | Col 1 (walk A) | Col 2 (walk B) | Col 3 (talk / emote) |
|---|---|---|---|---|
| **0 Front** | Idle front | Walk front 1 | Walk front 2 | Talk-open front |
| **1 Right** | Stand right | Walk right 1 | Walk right 2 | Talk-open right |
| **2 Back** | Idle back | Walk back 1 | Walk back 2 | *(reserved)* |
| **3 Emotes** *(optional row)* | 😊 happy | 😢 sad | 😠 angry | 😲 surprised |

- **Left** = Right row mirrored in code via `transform: scaleX(-1)`. Saves 4 cells per character, zero quality loss for symmetrical characters.
- **Row 3** is **optional**. Characters without emotes render the neutral `idle_*` instead — engine falls back gracefully.
- **Talk-open** cells are mouth-open variants of the matching idle. Engine alternates between idle and talk-open every ~200ms while the character is the active speaker.

#### The "budget, not target" rule
> Cells are **96 × 96 px** as a budget. Characters occupy *however many pixels they need* inside the cell. The rest stays transparent.

- **Aya idle (front)** — ~28 × 88 px of art, centered. Visually identical to her current 32×96 sprite at the same display size.
- **Aya walk-right** — ~36 × 88 px (swing leg adds horizontal width).
- **Future attack pose** — up to 64–96 px wide as needed (sword extended).
- **Future bulky character (Rex with axe)** — ~80 × 90 px idle, can fill the full 96 × 96 for an attack.

This guarantees **no character ever exceeds 96 × 96**, locking the renderer to a single cell size forever, while letting slim characters stay slim.

### 2. Metadata Manifest (`data/character-sheets.json`)

Schema:
```json
{
  "aya": {
    "sheet": "images/characters/sheets/aya.png",
    "cellW": 96, "cellH": 96,
    "cols": 4, "rows": 4,
    "frames": {
      "idle_front":  [0, 0],
      "walk_front":  [[1, 0], [2, 0]],
      "talk_front":  [3, 0],
      "idle_right":  [0, 1],
      "walk_right":  [[1, 1], [2, 1]],
      "talk_right":  [3, 1],
      "idle_back":   [0, 2],
      "walk_back":   [[1, 2], [2, 2]],
      "emote_happy":     [0, 3],
      "emote_sad":       [1, 3],
      "emote_angry":     [2, 3],
      "emote_surprised": [3, 3]
    },
    "hasEmotes": true,
    "anchor": { "x": 48, "y": 90 }
  }
}
```

- `frames`: cell indices `[col, row]`. Animations are arrays of cells.
- `anchor`: the pixel inside the cell that aligns to the character's "foot mark" on the map / stage. Default `{48, 90}` (bottom-center). Adjustable for characters with unusual silhouettes (e.g., floating spirits).
- `hasEmotes`: false → engine skips emote overlays entirely for this character.

### 3. The Staged Cutscene Visual

Replaces the current 80vh / 55vh portrait layer with a **stage**:

```
┌─────────────────────────────────────────────────────────┐
│              [ backdrop — current map blurred ]         │
│                                                         │
│                                                         │
│                                                         │
│       👤        👤        👤                            │  ← character sprites
│       Tao       Aya       Sera                          │     at marks (≈30vh tall)
│   ════════════════════════════════════════════════════  │  ← platform line
│  ┌───────────────────────────────────────────────────┐  │
│  │  AYA                                              │  │  ← dialogue box (unchanged)
│  │  > The rift is widening. We don't have much time. │  │
│  └───────────────────────────────────────────────────┘  │
│                                            [▶ CONTINUE] │
└─────────────────────────────────────────────────────────┘
```

#### Sprite presentation
- **Stage height target**: `30vh` (landscape) / `22vh` (portrait). Sprite cell rendered at native aspect; padding stays transparent.
- **Backdrop**: current map texture, blurred (`filter: blur(8px) brightness(0.4)`). Cheap, contextual, no per-arc backdrop authoring required for v1.
- **Platform line**: a horizontal CSS gradient bar at `bottom: 28vh` (landscape) acting as the "floor" characters stand on. Subtle, ~2 px tall, faint glow.

#### Speaker animation (active character)
- Sprite alternates `idle_*` ↔ `talk_*` every **200 ms** while typewriter is running.
- 2 px vertical bob synced to typewriter character ticks (`translateY` keyframe).
- Existing speaker highlight retained: `opacity: 1`, `filter: brightness(1) drop-shadow(0 0 20px rgba(160, 144, 208, 0.6))`, `scale(1.05)`, `z-index: 20`.

#### Non-speaker (dimmed)
- Existing dim treatment retained: `opacity: 0.55`, `filter: brightness(0.4) grayscale(0.15)`, `scale(0.9)`.
- Sprite locked to `idle_*` facing toward the current speaker (`facingOverride` computed from relative mark positions).

#### Emote overlay
- When `line.emotion` is set and the character `hasEmotes`, render a small (~36×36 px) emote sprite floating above the speaker's head for the duration of the line.
- Fade in 150 ms, hold, fade out on `advance()`.

### 4. Walk-On / Walk-Off Choreography

#### Entry
1. On first appearance per chapter, character spawns off-stage at `x = -10%` (heroes, left side) or `x = 110%` (enemies, right side).
2. Sprite walks to its computed mark over **600 ms**:
   - `transform: translateX()` tween from off-stage to mark percentage.
   - Frame cycles between `walk_right` cells every **160 ms** (mirrored for left-facing entries).
3. On arrival: 1 frame of `idle_right` facing center, 80 ms "landing" bob, then snap to `idle_front`.

#### Sub-segment behavior
- A scene may run multiple cutscene segments (`pre_dialogue` → `post_dialogue` → `character_moment`). Within the same chapter, characters that already walked on **stay on the stage** between segments — no re-walk. The existing `_charAppeared` registry already tracks this; reuse it.
- Cast added partway through (e.g., a guest speaker auto-injected) gets a walk-on animation when first rendered.

#### Exit
- On chapter end / `Cutscene.clear()`: characters fade out over 250 ms in place. No reverse walk-off (too slow, breaks pacing). Reserve walk-off for explicitly scripted `npc_exit` scene acts.

### 5. The `epic` Escape Hatch

For climactic moments where the current Vivid portrait treatment is the right tool, chapters opt in:

```json
{
  "id": "ch_finale",
  "type": "boss",
  "epic": true,
  "cast": ["Aya", "Demon Lord"],
  ...
}
```

- `epic: true` → engine renders the current 80vh/55vh portrait path (legacy code preserved).
- `epic: false` or absent (default) → engine renders the stage.
- Only chapters explicitly authored as epic require Vivid portrait assets. **All other characters/enemies can omit `_sprite_1.png` entirely.**

---

## 🏗️ Engine & Technical Blueprints (Aethon)

### 1. New Module: `js/systems/character-sheet.js`

Single source of truth for unified sheet data.

```js
const CharacterSheet = {
  _manifest: null,
  async init() { /* load data/character-sheets.json */ },
  get(charId) { /* returns manifest entry */ },
  hasSheet(charId) { /* boolean */ },
  cellRect(charId, frameKey, frameIdx = 0) { /* {x, y, w, h} in sheet px */ },
  // CSS helpers
  styleFor(charId, frameKey, frameIdx = 0, displayHeight) { /* returns inline style obj */ },
};
```

### 2. `SpriteRenderer.setFrame()` Extension

Located in `js/sprites.js`. Add a branch:
1. If `CharacterSheet.hasSheet(charId)` → render via `unisheet` (background-image + background-position + display height).
2. Else → fall back to existing `_sprite.png` / `_sprite_1.png` path (legacy support during migration).

This preserves the existing API surface — `Cutscene._renderSceneCharacters()` doesn't need to know which path is active. Switching a character to `unisheet` is purely a data-side change.

### 3. `Cutscene.js` Refactor

#### New flag check (one line)
```js
const useStage = !window.Story?.currentChap?.epic;
```

#### Stage render path (`_renderSceneCharactersStaged`)
- Same positioning math as today ([cutscene.js:296-354](rpg+/js/cutscene.js#L296)) — unchanged.
- Sprite element gets `.staged` class; CSS applies the smaller stage-height.
- New: walk-on animator (`_walkOn(charEl, fromX, toX, durMs)`) cycles walk frames during the tween via `setInterval` + `CharacterSheet.cellRect()`.
- New: talk-cycle animator (`_startTalkCycle(charEl, charId, facing)`) alternates idle/talk frames every 200 ms; cleared on `advance()` / `clear()`.

#### Legacy path retained
`_renderSceneCharactersEpic()` = the current implementation, unchanged. Used when `chap.epic === true`.

### 4. CSS Additions (`css/story-ui.css`)

```css
.s-scene-layer.staged {
  --stage-floor: 28vh;
  background: linear-gradient(180deg, transparent 0%, transparent var(--stage-floor),
    rgba(160, 144, 208, 0.15) calc(var(--stage-floor) + 1px),
    rgba(160, 144, 208, 0) calc(var(--stage-floor) + 4px));
}
.s-scene-layer.staged .s-scene-sprite {
  height: 30vh;
  image-rendering: pixelated;
  bottom: var(--stage-floor);
}
@media (orientation: portrait) {
  .s-scene-layer.staged .s-scene-sprite { height: 22vh; }
  .s-scene-layer.staged { --stage-floor: 22vh; }
}
.s-scene-sprite.walking { animation: walk-bob 320ms steps(2) infinite; }
.s-scene-sprite.talking { animation: talk-bob 400ms ease-in-out infinite; }
@keyframes talk-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-2px); }
}
```

### 5. Map Engine Integration

`js/map/map-entities.js` reads `MapEntities.spriteFor(charId)`. Update to:
1. If `CharacterSheet.hasSheet(charId)` → return the unified sheet path + cell info.
2. Else → fall back to current per-NPC sheet path.

Map rendering displays the cell at native map scale (e.g., 48–64 px tall). The 96×96 cell with transparent padding renders identically to the current 32×96 sprite at the same height — slim characters stay slim.

### 6. Cache Invalidation

- Bump `CACHE_NAME` in [`sw.js`](rpg+/sw.js) to **`nexus-cache-v9.20`**.
- Add unified sheets to a new manifest array `SHEETS_UNIFIED` (target ~150–800 KB total for 10 characters).
- Keep `SPRITES_NORMAL` / `SPRITES_LOW` arrays intact for `epic`-chapter portraits and legacy fallback during migration.
- Add `data/character-sheets.json` to the core preload manifest (essential, < 5 KB).

### 7. `tools/asset-audit.js` Update

New checks `aethon-architect` must add before this concept ships:
- For each character flagged `unisheet: true` in `characters.json` → verify `images/characters/sheets/<charid>.png` exists and is 384×384.
- For each chapter with `epic: true` in `data/story/*.json` → verify both `_sprite.png` and `_sprite_1.png` exist for all `cast[]` members.
- Warn (not fail) if a character has both unisheet AND legacy portrait assets — flags migration as incomplete or intentional dual-pipeline.

---

## 📜 Narrative Continuity (Chronicler)

### What changes for story authors
- No JSON schema changes for routine chapters. `pre_dialogue`, `post_dialogue`, `cast`, `character_moment` all work exactly as today.
- New optional chapter flag: `"epic": true` — declares this chapter uses the full Vivid portrait treatment.
- New optional line flag: `"emotion": "happy" | "sad" | "angry" | "surprised"` — triggers emote overlay on the speaker. (Already exists in the cutscene API; now visually realized.)

### Epic chapter audit
Chronicler reviews `data/story/*.json` and flags candidates for `epic: true`. Initial proposal:

| Arc | Chapter | Reason |
|---|---|---|
| Arc 1 | Void Knight reveal | First major boss, sets the tier |
| Arc 1 | Aya recruit / awakening | Protagonist defining moment |
| Arc 2 | Demon Lord reveal | Mid-game power spike |
| Arc 2 | Sera recruit (post-boss) | Sole-native reveal beat |
| Arc 3 | Dark Phoenix climax | Pre-finale emotional peak |
| Arc 3 | Shadow Emperor / Valdris finale | Game-ending moment |

~6 epic chapters total. Everything else: staged.

---

## 🛡️ Concept-First Gate (Curator)

### Promotion criteria for v1.0 → APPROVED
1. **Vivid signs off** on the staged visual mockup (this doc + an HTML proof-of-concept on Aya only).
2. **Aethon signs off** on the `CharacterSheet` module API and the `sw.js` v9.20 cache plan.
3. **Chronicler signs off** on the epic-chapter shortlist and confirms no narrative beat *requires* the Vivid treatment outside that list.
4. **Aegis-balance not impacted** (combat sprites untouched — see "Out of Scope" below).

### Out of Scope for v1
- **Combat sprite unification** — battle keeps the Void Knight standard. The 96×96 cell *could* hold combat poses in a future v2, but that's a separate concept (`unisheet v2: combat poses`).
- **Per-arc dedicated stage backdrops** — v1 uses blurred-current-map. Custom backdrops can be added later by a Vivid concept (`stage_backdrop_library`).
- **Walk-off animations** — v1 fades out. Scripted exits via the future `cinematic_npc_encounters` system.
- **Equipment-swap visual overlays** — possible later (the 96×96 cell allows it), but not v1.

---

## 🚀 Migration Plan

### Phase 0 — Proof of concept (Aya only, sandbox)
- Author Aya's unified sheet (`aya.png`, 384×384). Re-export her existing 4 sprites into 96×96 cells with transparent padding (no redrawing). Draw 4 missing frames: `idle_back`, `walk_back_1`, `walk_back_2`, `talk_front`. Optional row 3 emotes can wait.
- Build a standalone HTML demo (`tools/unisheet-demo.html`) showing Aya walking on stage and talking. **Vivid review gate here.**

### Phase 1 — Engine plumbing
- Build `js/systems/character-sheet.js` and the manifest loader.
- Extend `SpriteRenderer.setFrame()` with the unisheet branch.
- Add staged CSS variants to `story-ui.css`.

### Phase 2 — Cutscene path
- Refactor `Cutscene._renderSceneCharacters` to split into `_staged` and `_epic` paths gated by `chap.epic`.
- Build `_walkOn` and `_startTalkCycle` helpers.

### Phase 3 — Author remaining sheets
- Aya (done in Phase 0), then Tao, Lulu, Rei, Ria, Valka, Drake, Rex, Sera, plus key recurring NPCs (Azure Commander, etc.) and major enemies (Void Knight, Demon Lord, King Galdor, Spectral Guardian, Dark Phoenix, Valdris).
- ~16 sheets total. Each ~2–4 hours of pixel work *if drawing from scratch*; less for characters already drawn at lower fidelity.

### Phase 4 — Flag epic chapters
- Chronicler adds `"epic": true` to the ~6 shortlisted chapters.
- Verify Vivid portrait assets exist for those chapters' casts; everything else can have its `_sprite_1.png` removed in a later cleanup pass.

### Phase 5 — Cleanup & cache bump
- Run `tools/asset-audit.js` with new checks.
- Bump `sw.js` cache to v9.20.
- Delete unused `_sprite.png` / `_sprite_1.png` files for non-epic-only characters (with explicit user approval per the HANDS-OFF DIRECTIVE pattern).

### Effort estimate
- Engine code (phases 1–2): **1–2 days**.
- Sheet authoring (phase 3): art-bound, scales with how fast you draw. Aya in ~3–5 hours; subsequent characters faster once the style template is locked.

---

## 📊 Expected Outcomes

| Metric | Before | After |
|---|---|---|
| Files per character | 4 (Classic PNG + Vivid PNG + 2 WebP) | 1 sheet PNG + 1 JSON entry |
| Per-character disk | ~3–5 MB | ~30–80 KB |
| Total character art payload | ~37 MB (NORMAL) / ~1.7 MB (LOW) | ~0.3–0.8 MB |
| Boot payload target | < 6 MB (tight, requires LOW toggle) | well under 6 MB (no toggle needed) |
| Stylistic split (map vs cutscene) | Yes — different art per context | None — same sprite everywhere |
| New character cost | ~4 portrait illustrations + map sheet | 1 unified sheet |
| Cinematic Vivid moments per game | Every cutscene (~50+) | ~6 epic chapters |

---

## 🔍 Open Questions

1. **Backdrop**: confirm v1 uses blurred-current-map vs. a single neutral gradient. Recommendation: blurred map (contextual, free).
2. **Walk-on duration**: 600 ms feels right for impact but adds ~2.4s before first line for 4-character scenes. Should sub-segments within a chapter skip the walk-on entirely (use the existing `_charAppeared` gate)? Recommendation: yes — walk-on fires only once per chapter per character.
3. **Talk animation aggressiveness**: 200 ms idle↔talk swap might feel jittery for some characters. Tunable per-character via manifest `talkCycleMs` override?
4. **Emote row priority**: ship v1 without row 3, add later? Or commit to row 3 from day one? Recommendation: optional from day one — `hasEmotes: false` is supported, characters add row 3 when ready.
5. **Mobile portrait stage height**: 22vh may feel cramped on iPhone SE (375×667). Verify with `vivid-aesthetic` on the proof-of-concept.

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Stage feels less impactful than current portraits and players notice the downgrade | The `epic` escape hatch — boss reveals and recruit moments retain full Vivid treatment, so peak moments still hit. |
| Sheet authoring becomes the long pole and stalls the concept | Land Phase 1–2 engine work behind the existing portrait fallback; sheets ship incrementally per-character. No big-bang switch required. |
| 96×96 cells feel oversized on the map tile grid | Render at smaller display height on map (existing behavior — current 32×96 already renders at sub-cell heights). Transparent padding has zero visual cost. |
| Existing `chap.cast` / `_canonicalCast` logic regresses during refactor | Both paths (staged & epic) call the same positioning math; only the render leaf differs. Existing tests in `tests/` cover the cast injection logic. |
| `tools/asset-audit.js` flags every character as failing the "must have Vivid version" contract | Loosen the audit rule: Vivid version is required *only* for characters appearing in `epic: true` chapters. Update audit per Phase 5. |

---

## 🔗 Related Concepts
- [`encounter_warning_and_portraits.md`](encounter_warning_and_portraits.md) — established the current `vh`-based portrait scaling; this concept supersedes it for non-epic chapters.
- `_concepts/mechanics/cinematic_npc_encounters.md` *(referenced in `claude.md`, design spec)* — the staged cutscene's walk-on animator is the same primitive needed by `npc_walk_to_player` act. Build once, reuse.
- Future: `unisheet_v2_combat_poses.md` — extends the same sheet format with attack/hurt/cast rows for combat unification.
