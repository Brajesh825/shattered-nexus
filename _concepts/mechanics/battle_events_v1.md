# ⚙️ Concept: Mid-Battle Event Triggers (In-Combat Dialogue)

## 📌 Objective
Our current engine supports cinematic sequences *before* a battle, and sequential wave combat *between* encounters (`_actAmbush`), but the combat itself is a closed loop. To truly enhance the cinematic feel of the game, we need to break that loop.

We will introduce a **Mid-Battle Event System** capable of interrupting the turn queue, rendering visual novel-style dialogue directly over the combat canvas, applying mid-fight stat changes or transformations, and then resuming the battle.

## 🛠️ The Mechanics

### `CombatEvents` Registration
Enemies (specifically bosses) can define an `events` array in their `enemies.json` block:
```json
"events": [
  {
    "trigger": { "type": "hp", "threshold": 0.5 },
    "id": "morgana_phase_two",
    "fired": false
  }
]
```

### Event Interception (`turn-manager.js`)
Before `TurnManager` issues a `start_turn` event, it checks the combatants for any unfired events whose conditions are met. If found, it halts the queue and fires a `battle_event` payload.

### UI Rendering (`battle-ui.js`)
The `BattleUI` listens for `battle_event`.
1. It immediately hides the Action Menu and Focus Manager.
2. It invokes a new overlay: `<div id="battle-dialogue-overlay">`.
3. Character portraits and text render exactly as they do on the map screen.
4. Upon clicking "Next" through the sequence, a callback resumes the `TurnManager`.

## 🎭 The Proof of Concept
We will retrofit the **Sunken Leviathan** (Arc 0 Boss) or **Morgana** to utilize this. When they drop below 50% HP:
- The UI disappears.
- A dialogue box appears with the boss's portrait, taunting the party.
- The boss gains an `enraged` buff or changes elements.
- The turn queue resumes.
