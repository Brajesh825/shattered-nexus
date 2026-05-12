# 🎬 Cinematic NPC Encounter System (Technical Specification)

**Agent Maintainer**: The Curator  
**Target Subsystems**: `MapEngine`, `MapEntities`, `Story`, `SaveContract`  
**Status**: Staging / Approved Concept  

---

## 1. Core Architectural Goals
The objective is to replace basic interactive touch-triggers with a dynamic **Three-Act Scene Runner** to handle critical pre-combat/narrative encounters. Instead of immediate dialogue box interruption, characters pathfind naturally, cameras or facings align, and ambushes march into the canvas organically.

---

## 2. Supported Act Instructions

A scene is composed of an ordered list of act objects executing sequentially. The map engine halts player processing while `_activeScene` is populated.

| Command | Arguments | Runtime Behavior |
| :--- | :--- | :--- |
| `lock_player` | `state: boolean` | Disables player input and directional updates. |
| `npc_walk_to_player` | `npcId: string`, `speed?: number` | Commands `MapEntities` to step-pathfind the designated NPC toward `MapPlayer` coordinates until distance is $\le 2$ tiles. |
| `npc_face` | `npcId: string`, `dir: string` | Sets the designated NPC's `facingOverride` (`up`, `down`, `left`, `right`). |
| `player_face` | `dir: string` | Sets the player's facing direction. |
| `dialogue` | `lines: Array<{speaker, emotion, text}>` | Opens the narrative dialog overlay. Resolves automatically when the user advances past the final frame. |
| `show_msg` | `msg: string`, `duration?: number` | Displays a transient floating HUD notice via `MapUI.showMsg`. |
| `wait` | `ms: number` | Synchronous delay before processing the subsequent act. |
| `ambush` | `enemyIds: string[]`, `spawnDir: string`, `braceDialogue?: string` | Spawns battle sprites at the map perimeter. The player/NPC automatically orient toward `spawnDir`. Displays `braceDialogue` as a floating screen notification before triggering `onEncounterStart`. |
| `flag` | `sceneId: string` | Marks the scene as persistent within `G.firedScenes`. |
| `npc_exit` | `npcId: string`, `targetX: number`, `targetY: number` | Commands the NPC to walk to exit coordinates and triggers de-spawning. |

---

## 3. Persistence & Lifecycle Contracts

### Global State Registry
*   `G.firedScenes = new Set<string>()` tracks completed encounters globally.
*   **Save Pipeline**: Serialized via `Array.from(G.firedScenes)` within `SaveContract` and restored on initialization.
*   **Auto-Patching**: To prevent sequence loss without requiring full manual camp saves, invoking the `flag` act immediately triggers `Save.patch({ firedScenes: Array.from(G.firedScenes) })` to update the active slot.

### Dynamic NPC Visibility Filtering
Map definitions (`map.npcs[]`) support two new gate attributes checked during `MapEntities.init()`:
*   `hideAfterScene: string` — If `G.firedScenes.has(val)`, the entity is omitted from map generation.
*   `showAfterScene: string` — If `!G.firedScenes.has(val)`, the entity is omitted.

---

## 4. Reference Scene Blueprint (`azure_intro`)

```json
{
  "id": "azure_intro",
  "once": true,
  "acts": [
    { "type": "lock_player", "state": true },
    { "type": "player_face", "dir": "right" },
    { "type": "npc_walk_to_player", "npcId": "azure_commander", "speed": 1.5 },
    { "type": "dialogue", "lines": [
      { "speaker": "Azure Commander", "emotion": "alert", "text": "Halt! The paths ahead are fractured by the Rift." },
      { "speaker": "Aya", "emotion": "focused", "text": "We seek the Sacred Ruins. We do not intend to retreat." }
    ]},
    { "type": "ambush", "enemyIds": ["goblin", "goblin"], "spawnDir": "right", "braceDialogue": "Ambush from the treeline! Form up!" },
    { "type": "flag", "sceneId": "azure_intro" },
    { "type": "lock_player", "state": false }
  ]
}
```
