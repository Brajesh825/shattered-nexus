# Cinematic NPC Encounter System

> **Status**: Design spec ready for implementation.
> Covers map-level story encounters that play like short films — NPC walks to the player, dialogue unfolds, an optional ambush interrupts, enemies march in on the map, and the whole scene is gated by a persistent `firedScenes` save flag so it never replays.

---

## The Problem With Static Triggers

Current region triggers fire a dialogue panel the instant the player steps on them. No motion, no atmosphere, no sense that another character is reacting to the player's presence. The Azure Commander intro is the clearest example — she's just a text box standing still. This proposal replaces that pattern with a three-act scene runner that can drive any significant story encounter.

---

## The Three-Act Scene Structure

Every cinematic encounter is composed of sequential **acts**. The scene runner executes them in order, waiting for each to resolve before starting the next.

### Act 1 — The Crossing (NPC Walks to Player)

When the player enters the scene's trigger region, the NPC "notices" them and begins walking toward the player's tile. No UI opens. The player can still move — the NPC pathfinds to intercept. When the NPC closes to within 2 tiles, Act 1 resolves and Act 2 begins automatically.

This creates the physical sensation of being approached rather than simply triggering a box.

### Act 2 — The Conversation (Dialogue)

Both characters stop. Player input locks. The dialogue panel opens and plays lines sequentially — speaker name, text, portrait. Standard NPC dialogue engine, no new rendering code needed.

A scene can have multiple dialogue acts separated by other act types (e.g., dialogue → wait → ambush → dialogue).

### Act 3 — The Ambush (Optional)

Mid-conversation, enemy sprites spawn 2 tiles outside the canvas edge on the defined `spawnEdge`. Each engine tick they advance toward the party like real map entities — same sprite renderer, same shadow, walking animation. After 3–4 tiles of advance they halt and the encounter begins.

During the march-in:
- Both the player character sprite and the NPC sprite rotate to **face the enemy direction** (via a `facing` override on the entity).
- A `braceDialogue` line fires as a timed HUD overlay (no panel — just the floating speaker text at the top of the map area). This keeps the screen unobstructed during the dramatic moment.

After the battle resolves, an optional `postBattleAct` sequence fires — additional dialogue, NPC exit, etc.

---

## Scene Definition Schema

Scenes live directly in the map's JS file alongside `triggers`, `npcs`, and `voiceLines`.

```js
scenes: [
  {
    id: 'azure_intro',                         // unique ID — used for save gating
    once: true,                                // if true, never re-fires after first completion
    trigger: { x: 18, y: 12, w: 6, h: 4 },   // region that activates the scene
    npcId: 'azure_commander',                  // NPC to animate

    acts: [
      // Act 1 — NPC walks to player
      { type: 'npc_walk_to_player' },

      // Act 2a — initial dialogue
      {
        type: 'dialogue',
        lines: [
          { speaker: 'Azure Commander', text: 'You actually came. I wasn't sure anyone would.' },
          { speaker: 'Azure Commander', text: 'The patrol routes have been broken for three days. Something is pushing them west.' },
          { speaker: 'Aya', text: 'From the ruins? We came through there. It isn't empty anymore.' },
        ]
      },

      // Act 3 — ambush interrupts
      {
        type: 'ambush',
        enemies: ['zombie_soldier', 'zombie_soldier'],
        spawnEdge: 'right',                    // 'left' | 'right' | 'top' | 'bottom' | 'all'
        braceDialogue: {
          speaker: 'Azure Commander',
          text: 'Contact — they found us. Stay close.'
        },
        npcFacing: 'right',                    // direction both player and NPC face during march-in
        postBattleAct: {
          type: 'dialogue',
          lines: [
            { speaker: 'Azure Commander', text: 'They're still coming from the eastern ruins. Go. I'll hold this side.' },
            { speaker: 'Azure Commander', text: 'Find whatever is driving them. I'll be here when you get back.' },
          ]
        }
      },

      // Act 4 — NPC walks to exit tile and despawns
      { type: 'npc_exit', targetTile: { x: 28, y: 12 } }
    ]
  }
]
```

---

## Act Type Reference

| `type` | Required fields | What it does |
|---|---|---|
| `npc_walk_to_player` | — | Sets NPC `_sceneTarget` to player tile; resolves when NPC is ≤ 2 tiles away |
| `dialogue` | `lines: [{speaker, text}]` | Locks input, opens NPC dialogue panel, plays lines, resolves on final advance |
| `ambush` | `enemies`, `spawnEdge`, `braceDialogue` | Spawns enemy entities at map edge, advances them, fires brace line, starts battle |
| `wait` | `ms: number` | Pause — resolves after the given duration |
| `lock_player` | — | Freezes player movement without opening dialogue (use before `npc_walk_to_player` to stop the player from walking away) |
| `npc_exit` | `targetTile: {x, y}` | NPC pathfinds to tile and despawns on arrival |
| `npc_face` | `direction: 'left'\|'right'\|'up'\|'down'` | Instantly rotates NPC sprite to face a direction |
| `player_face` | `direction` | Instantly rotates player sprite to face a direction |
| `show_msg` | `text`, `duration?` | HUD message — same as `MapUI.showMsg`, doesn't lock input |
| `flag` | `key`, `value` | Sets a value in `G.firedScenes` metadata — use for branching or multi-stage scenes |

---

## NPC Walk Behavior During Scenes

During `npc_walk_to_player`, the NPC is given a `_sceneTarget` property (tile coordinate). Each engine tick, the entity system moves it one tile per step toward `_sceneTarget` using the same cardinal pathfinding as `wander`, but with a goal instead of a random direction. When within 2 tiles, `_sceneTarget` is cleared and the act resolves.

**Collision**: If a wall blocks the direct path, the NPC tries the perpendicular axis. For scene triggers, map designers should ensure a clear corridor between the trigger zone and the player's likely entry path.

**Player movement during walk**: Players can move during Act 1 — the NPC closes the gap regardless. For hard cinematic locks, prefix with `{ type: 'lock_player' }`.

---

## Ambush Mechanics

### Enemy March-In

Enemy entities are created 2 tiles outside the canvas edge (off-screen) at the moment the `ambush` act fires. Each is given a `marchTarget` — a tile 3–4 tiles inside the player's area. The entity renderer draws them identically to normal map enemies. Over 1–2 seconds they walk in, then stop.

This gives the player one moment of "oh no" before the battle screen opens. The march speed matches the NPC walk speed — roughly 1 tile per 400ms.

### Facing Override

During the march-in, both the player sprite and the NPC sprite receive a `facingOverride` property set to the enemy approach direction (e.g., `'right'`). The existing sprite renderer's walk frame system respects this — it will hold the last-step frame facing that direction instead of the player's actual movement direction.

### Brace Dialogue

The `braceDialogue` line appears as a floating HUD overlay at the top of the map canvas — same style as `voiceLines` ambient text, with speaker name colored per NPC definition. It does not open the dialogue panel, so the enemy march-in is fully visible. Duration: ~2000ms, then fades.

### Battle Handoff

After the march-in animation completes, `MapEngine` hands off to the normal encounter system (`onEncounterStart`). The enemy group is built from the `enemies` array in the act definition, at the player's current average level. On battle resolution, `onBattleComplete(won)` is called normally. If `postBattleAct` is defined, the scene runner continues from there.

---

## Persistence — `G.firedScenes`

### Data Structure

```js
G.firedScenes = new Set()   // of scene id strings
```

### Save / Load

Included in both `Story._doSave()` and `SaveContract.buildFreeExploreSaveState()`:

```js
// Serialize
firedScenes: Array.from(G.firedScenes || [])

// Restore
G.firedScenes = new Set(s.firedScenes || [])
```

### Auto-Persist on Scene Complete

When a `once: true` scene finishes, `G.firedScenes.add(scene.id)` fires and a lightweight save patch writes only this field to the current slot immediately. The player does not lose the "seen" flag even if they quit before the next camp save.

```js
// After scene completes
G.firedScenes.add(scene.id);
Save.patch({ firedScenes: Array.from(G.firedScenes) }, Story._activeSlot ?? 0);
```

`Save.patch(partial, slot)` merges `partial` into the existing slot JSON without overwriting other fields — a small addition to `save.js`.

### Gate Check

Before executing any scene:
```js
if (scene.once && G.firedScenes?.has(scene.id)) return;
```

Evaluated on every player-move tick in `_checkScenes()`, same loop as `_checkRegionTriggers()`.

---

## NPC Lifecycle — `hideAfterScene`

NPCs that should disappear after their scene completes (e.g., Azure Commander vanishes after `azure_intro` until she's recruited) use a new map NPC property:

```js
// In map-verdant-vale.js, npcs array:
{ id: 'azure_commander', x: 22, y: 14, ..., hideAfterScene: 'azure_intro' }
```

`MapEntities.init()` filters these out when `G.firedScenes.has(scene.id)` is true — same pattern as the existing `hideIfUnlocked` gate.

A separate, post-arc NPC entry with a different dialogue key can represent the same character after recruitment (e.g., `azure_commander_post`), giving her new lines when the player revisits.

---

## Scene Runner — Implementation Architecture

### Core Function (`js/map/map-engine.js`)

```js
async function _runScene(scene) {
  G.firedScenes = G.firedScenes || new Set();
  if (scene.once && G.firedScenes.has(scene.id)) return;

  _sceneRunning = true;
  for (const act of scene.acts) {
    await _execAct(act, scene.npcId);
  }
  _sceneRunning = false;

  if (scene.once) {
    G.firedScenes.add(scene.id);
    Save.patch({ firedScenes: Array.from(G.firedScenes) }, Story._activeSlot ?? 0);
  }
}

async function _execAct(act, npcId) {
  switch (act.type) {
    case 'npc_walk_to_player': return _actNpcWalk(npcId);
    case 'dialogue':           return _actDialogue(act.lines, npcId);
    case 'ambush':             return _actAmbush(act, npcId);
    case 'wait':               return new Promise(r => setTimeout(r, act.ms || 500));
    case 'lock_player':        return (_playerLocked = true, Promise.resolve());
    case 'npc_exit':           return _actNpcExit(npcId, act.targetTile);
    case 'npc_face':           return _actFace(npcId, act.direction);
    case 'player_face':        return (_playerFacing = act.direction, Promise.resolve());
    case 'show_msg':           return (MapUI.showMsg(act.text, act.duration || 2000), Promise.resolve());
  }
}
```

Each `_act*` function returns a Promise that resolves when the act is complete. This makes sequencing trivial — the `for...of` loop `await`s each one.

### Integration Points

| Engine location | Change |
|---|---|
| `_checkRegionTriggers()` | Add `_checkScenes()` call on same tick |
| `MapEntities.init()` | Add `hideAfterScene` filter alongside `hideIfUnlocked` |
| `MapEntities._tickNPC()` | Handle `_sceneTarget` walk logic |
| `MapEntities._renderNPC()` | Respect `facingOverride` property |
| `MapEngine.onBattleComplete()` | Resume scene runner after ambush battle |
| `story.js → _doSave()` | Include `firedScenes` in save object |
| `save-contract.js` | Include `firedScenes` in free-explore save |
| `story.js → onHeroReady()` | Restore `G.firedScenes = new Set(s.firedScenes || [])` |
| `save.js` | Add `Save.patch(partial, slot)` method |

---

## Implementation Sequence

| Step | File | Scope |
|---|---|---|
| 1 | `js/save.js` | Add `Save.patch(partial, slot)` — merge-write without full overwrite |
| 2 | `js/systems/save-contract.js` | Add `firedScenes` to `buildFreeExploreSaveState` |
| 3 | `js/story.js` | Add `firedScenes` to `_doSave()` + restore in `onHeroReady()` |
| 4 | `js/map/map-engine.js` | `_runScene`, `_execAct`, `_actNpcWalk`, `_actDialogue`, `_actAmbush`, `_actNpcExit`, `_checkScenes()` |
| 5 | `js/map/map-entities.js` | `_sceneTarget` walk in `_tickNPC`; `facingOverride` in `_renderNPC`; `hideAfterScene` in `init` |
| 6 | `js/map/data/map-verdant-vale.js` | Wire up `azure_intro` scene, add `hideAfterScene` to Azure Commander NPC entry |

Estimated total: ~300 new lines, 6 files. No new files required.

---

## Azure Commander — Reference Scene

This is the target implementation for the Verdant Vale encounter.

```
Trigger zone  : x:18–23, y:12–15 (approaches from the west path)
NPC start tile: x:24, y:13 (standing at the treeline, east of trigger)
Player enters trigger → Azure Commander walks west toward player
NPC closes to 2 tiles → dialogue opens

Beat 1: Azure Commander opens — first words, wary, assessing
Beat 2: Aya responds — acknowledges the danger from the ruins
Beat 3: brief silence (wait 800ms)

--- AMBUSH FIRES ---
Enemies: 2× zombie_soldier, spawnEdge: 'right'
Brace line: "Contact — they found us. Stay close."
Player + Azure Commander face right
Enemies march in over 1.5s
Battle begins

--- POST-BATTLE ---
Azure Commander: "They're still coming. Go — find the source."
Azure Commander: "I'll hold the western path. You won't be alone out here."
Azure Commander walks to exit tile (x:28, y:13) and despawns

G.firedScenes.add('azure_intro') — never fires again
```

On next visit to Verdant Vale, the `hideAfterScene: 'azure_intro'` filter removes her from the NPC list. She reappears as a proper party member after the arc boss via the normal `hideIfUnlocked` / character unlock flow.

---

## Out of Scope

- Branching scenes based on player choices (needs a choice-act type — feasible extension)
- Multi-NPC scenes with two NPCs walking toward each other
- Scene replay from a journal / codex menu
- Voice acting / audio per line
- Camera pan / zoom during scenes (canvas transform not currently supported)
