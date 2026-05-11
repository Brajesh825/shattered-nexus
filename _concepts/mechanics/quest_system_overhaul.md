# Quest System Overhaul — NPC-Driven Quest Flow

> **Status**: Design spec ready for implementation.  
> Supersedes the partial spec in `world_quests_and_rumors.md` (Rumor Board remains separate).

---

## Current State — What Works, What Doesn't

### Already in place
| Thing | Where |
|---|---|
| `QuestSystem` with `onKill` / `onGather` progress tracking | `js/systems/quest-system.js` |
| Quest definitions with `giver` field | `data/quests.json` |
| NPC dialogue engine with `onDialogueComplete` callback hook | `js/map/map-engine.js → _openGenericDialogue` |
| `💬` bubble renderer on untalked NPCs | `js/map/map-entities.js → _renderNPC` |
| `isTalked` flag + `_return` dialogue key for repeat visits | `js/map/map-engine.js → _openNPCDialogue` |
| `SFX.buff()` already implemented | `js/sfx.js` |

### What's missing
1. No `❗` / `❕` / `❓` quest-state visual indicators on NPCs
2. No quest pick-up flow — player can't accept from NPC dialogue
3. No quest submission flow — player can't turn in to the giver NPC
4. No `quests: []` association on NPC definitions in `npcs.js`
5. No dialogue choice buttons (accept / later / collect reward) in the dialogue panel
6. `isActive`, `isReadyToSubmit`, `canAccept`, `submit` methods missing from `QuestSystem`
7. `getActive()` returns the live internal array — external code can mutate it

---

## System Design

### NPC Quest State Machine

Every NPC with quests sits in exactly one state at any moment. Evaluated fresh on every render tick and every interaction.

| State | Indicator | Priority | Trigger condition |
|---|---|---|---|
| `quest_ready` | **❕** green, fast pulse | 1 (highest) | Player has a **completed** quest for this NPC |
| `quest_available` | **❗** gold, normal pulse | 2 | NPC has a quest the player hasn't accepted |
| `quest_active` | **❓** dim, slow pulse | 3 | Player has an **in-progress** quest from this NPC |
| `talk_only` | **💬** existing bubble | 4 | No quests, NPC not yet talked to |
| *(nothing)* | — | 5 (lowest) | No quests, already talked |

The indicator replaces the current unconditional `💬` block in `_renderNPC`. NPCs with no quests keep the existing `💬` / silence behavior unchanged.

---

### Data Changes

#### `data/npcs.js` — add `quests: []` to givers

```js
elder_maren: {
  name: 'Elder Maren',
  color: '#d4a56a',
  sprite: 'images/characters/map/sheets/npc/elder_maren_sheet.png',
  quests: ['goblin_menace'],         // ← NEW: ties NPC to quest IDs
  dialogues: {
    verdant_vale: [
      { speaker: 'Elder Maren', text: 'The goblins hit us again last night. We have nothing left to give them.' },
    ]
  }
},

the_archivist: {
  name: 'The Archivist',
  color: '#a0c8e8',
  sprite: 'images/characters/map/sheets/npc/archivist_sheet.png',
  quests: ['bones_of_the_fallen'],
  dialogues: {
    crystal_cavern_f1: [
      { speaker: 'The Archivist', text: 'History demands witnesses. Even of its ugliest chapters.' },
    ]
  }
},

si_elder: {
  name: 'Isle Elder',
  color: '#7ecfa0',
  sprite: 'images/characters/map/sheets/npc/si_elder_sheet.png',
  quests: ['naga_threat'],
  dialogues: {
    sacred_isles: [
      { speaker: 'Isle Elder', text: 'The naga raid at low tide. We cannot hold them much longer.' },
    ]
  }
},
```

The three arc-0 quests (`mercy_fallen`, `locket_lost`, `void_sentinel`) have no `giver` — they auto-accept on arc start. No NPC association needed for those.

#### `data/quests.json` — add three dialogue arrays per quest

Each quest needs `acceptDialogue`, `activeDialogue`, and `submitDialogue`:

```json
{
  "id": "goblin_menace",
  "label": "Goblin Menace",
  "desc": "Elder Maren asks you to drive back the goblin raiders preying on the refugee camp.",
  "type": "hunt",
  "target": "goblin",
  "count": 4,
  "giver": "elder_maren",
  "rewards": { "exp": 200, "gold": 150 },

  "acceptDialogue": [
    { "speaker": "Elder Maren", "text": "You really mean to help us? The goblins have raided three nights running. Four of them at least — they have a leader somewhere in those hills." },
    { "speaker": "Elder Maren", "text": "If you can drive them back... we'd owe you more than we can repay." }
  ],
  "activeDialogue": [
    { "speaker": "Elder Maren", "text": "The goblins are still out there. Please hurry — we can't take another night of this." }
  ],
  "submitDialogue": [
    { "speaker": "Elder Maren", "text": "They're gone? Truly gone?" },
    { "speaker": "Elder Maren", "text": "I watched from the gate. I saw you. I never thought... thank you. This is everything we have left to give." }
  ]
}
```

Same pattern for `bones_of_the_fallen` and `naga_threat`.

---

### QuestSystem API Additions (`js/systems/quest-system.js`)

Four new public methods:

```js
// True if quest is in _active and not yet complete
function isActive(id) {
  return !!_active.find(q => q.id === id && !q.complete);
}

// True if quest is in _active and marked complete (rewards not yet claimed)
function isReadyToSubmit(id) {
  return !!_active.find(q => q.id === id && q.complete);
}

// True if quest hasn't been accepted or completed — player can pick it up
function canAccept(id) {
  return !_completed.includes(id) && !_active.find(q => q.id === id);
}

// Called by the dialogue system after the player clicks "Collect Reward"
function submit(id) {
  const q = _active.find(q => q.id === id && q.complete);
  if (q) _grantRewards(q);  // existing internal function handles everything
}
```

Also fix `getActive()` to return a copy:
```js
function getActive() { return [..._active]; }
```

---

### NPC Indicator Rendering (`js/map/map-entities.js → _renderNPC`)

Replace the current unconditional `💬` block (~lines 1084–1092) with:

```js
// Determine quest state for this NPC
function _getNPCQuestState(npc) {
  const def = (typeof NPC_DEFS !== 'undefined') ? NPC_DEFS[npc.id] : null;
  if (!def || !def.quests || !def.quests.length) return null;
  if (def.quests.some(id => QuestSystem.isReadyToSubmit(id))) return 'ready';
  if (def.quests.some(id => QuestSystem.isActive(id)))         return 'active';
  if (def.quests.some(id => QuestSystem.canAccept(id)))        return 'available';
  return null;
}

// Inside _renderNPC, replace the 💬 block:
const questState = _getNPCQuestState(n);
const t = performance.now();

if (questState === 'ready') {
  // Green ❕ — fast pulse, bright
  const pulse = 0.75 + 0.25 * Math.sin(t / 200);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.font = 'bold 13px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4ade80';
  ctx.fillText('❕', sx + TILE / 2, sy + oy + bounce - 4);
  ctx.restore();
} else if (questState === 'available') {
  // Gold ❗ — normal pulse
  const pulse = 0.7 + 0.3 * Math.sin(t / 300);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.font = 'bold 13px serif';
  ctx.textAlign = 'center';
  ctx.fillText('❗', sx + TILE / 2, sy + oy + bounce - 4);
  ctx.restore();
} else if (questState === 'active') {
  // Dim ❓ — slow fade
  const pulse = 0.4 + 0.2 * Math.sin(t / 800);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.font = '11px serif';
  ctx.textAlign = 'center';
  ctx.fillText('❓', sx + TILE / 2, sy + oy + bounce - 4);
  ctx.restore();
} else if (!n.isTalked) {
  // Existing 💬 — for non-quest NPCs not yet talked to
  const pulse = 0.7 + 0.3 * Math.sin(t / 300);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.font = 'bold 12px serif';
  ctx.textAlign = 'center';
  ctx.fillText('💬', sx + TILE / 2, sy + oy + bounce - 4);
  ctx.restore();
}
```

---

### NPC Interaction Flow (`js/map/map-engine.js → _openNPCDialogue`)

When `_openNPCDialogue(npc)` fires, intercept before the normal dialogue lookup:

```
_openNPCDialogue(npc)
│
├─ Get NPC's quest IDs from NPC_DEFS[npc.id].quests
│
├─ Find a quest that isReadyToSubmit?
│   └─ Load that quest's submitDialogue lines
│      Append synthetic entry: { type: 'submit', questId }
│      → Player sees submit dialogue, then [✔ Collect Reward] button
│      → On click: QuestSystem.submit(id), SFX.buff(), reset npc.isTalked = false
│
├─ Else: find a quest that isActive?
│   └─ Load that quest's activeDialogue lines
│      No choice button — just a short check-in, ends normally
│
├─ Else: find a quest that canAccept?
│   └─ Load that quest's acceptDialogue lines
│      Append synthetic entry: { type: 'choice', questId, options: [
│        { label: '✔ Accept', action: 'accept' },
│        { label: '✗ Maybe later', action: 'dismiss' }
│      ]}
│      → Accept: QuestSystem.accept(id), MapUI.showMsg('✦ NEW ECHO: ...', 2000)
│      → Dismiss: close dialogue, npc.isTalked stays false (indicator stays ❗)
│
└─ Else: fall through to existing dialogue logic (normal / _return key)
```

Priority: **submit → active → accept → normal**. Correct because a turn-in is always the most urgent action.

If an NPC has multiple quests, handle the **highest-priority one** per interaction. After submit, the next interaction will catch the next available quest naturally.

---

### Dialogue Choice Rendering

The dialogue panel (`#npc-dialogue`) currently has a single `▶ CONTINUE` / `✔ CLOSE` button. When a `{ type: 'choice' }` or `{ type: 'submit' }` synthetic entry is reached, the button row changes:

**HTML addition** (inside `#npc-dialogue`):
```html
<div id="npc-dialogue-choices" style="display:none">
  <!-- Buttons injected by JS per-interaction -->
</div>
```

**CSS** (in `css/map.css`):
```css
#npc-dialogue-choices {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 8px 16px 12px;
  flex-wrap: wrap;
}

.npc-choice-btn {
  font-family: var(--px);
  font-size: 10px;
  letter-spacing: 1px;
  padding: 8px 18px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.05);
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.npc-choice-btn:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.4);
}

.npc-choice-btn.primary {
  border-color: rgba(200, 164, 90, 0.5);
  color: var(--gold);
}

.npc-choice-btn.primary:hover {
  background: rgba(200, 164, 90, 0.12);
  border-color: var(--gold);
}
```

**JS logic** — in `_advanceNPCDialogue`, when the current synthetic line is detected:
```js
if (line.type === 'choice' || line.type === 'submit') {
  // Hide the normal CONTINUE button, show the choices div
  document.getElementById('npc-dialogue-next').style.display = 'none';
  const choicesEl = document.getElementById('npc-dialogue-choices');
  choicesEl.style.display = 'flex';
  choicesEl.innerHTML = ''; // clear previous
  
  const options = line.type === 'submit'
    ? [{ label: '✔ Collect Reward', action: 'submit', questId: line.questId, primary: true },
       { label: '✗ Not yet',       action: 'dismiss' }]
    : line.options;

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'npc-choice-btn' + (opt.primary ? ' primary' : '');
    btn.textContent = opt.label;
    btn.onclick = () => _handleNPCChoice(opt);
    choicesEl.appendChild(btn);
  });
  return; // don't advance line idx
}
```

`_handleNPCChoice(opt)` performs the action then calls `_closeNPCDialogue()`.

---

## Implementation Order

These are the exact files to touch, in dependency order:

| Step | File | What changes |
|---|---|---|
| 1 | `js/systems/quest-system.js` | Add `isActive`, `isReadyToSubmit`, `canAccept`, `submit`; fix `getActive()` |
| 2 | `data/npcs.js` | Add `quests: []` to `elder_maren`, `the_archivist`, `si_elder` entries |
| 3 | `data/quests.json` | Add `acceptDialogue`, `activeDialogue`, `submitDialogue` to all 3 giver quests |
| 4 | `js/map/map-entities.js` | Replace 💬 block with `_getNPCQuestState` + state-driven indicator rendering |
| 5 | `index.html` | Add `#npc-dialogue-choices` div inside the existing `#npc-dialogue` panel |
| 6 | `css/map.css` | Add `.npc-dialogue-choices` + `.npc-choice-btn` styles |
| 7 | `js/map/map-engine.js` | Quest-priority interception in `_openNPCDialogue` + choice rendering in `_advanceNPCDialogue` |

Total estimated lines changed: ~150 lines across 7 files. No new files required.

---

## Edge Cases to Handle

| Case | Handling |
|---|---|
| NPC has quest but is in a different map | Indicator still shows — player can find them |
| Player dismisses an accept choice | `npc.isTalked` stays `false`, ❗ persists next visit |
| Quest completes mid-exploration (kill count hits) | `isReadyToSubmit` becomes true → ❕ lights up on next render frame |
| NPC has 2 quests, one active, one available | Show `active` state (higher priority) — second quest revealed after first completes |
| Arc-0 auto-accepted quests (no giver) | No NPC association — progress via `onKill`/`onGather` as today |
| Submit when player has no space for item reward | `addToInventory` already handles overflow — existing behavior |
| `QUESTS_DATA` not loaded yet | `_getNPCQuestState` returns `null` → indicator gracefully absent |

---

## Out of Scope (separate concepts)

- **Notice Board / Rumors** — `world_quests_and_rumors.md`
- **Multi-step quests** (deliver to NPC A then NPC B)
- **Timed / escort quests**
- **Map pin markers** for quest givers — needs map marker system first
- **Quest log tracker showing giver NPC name** — small follow-up to quest-ui.js
