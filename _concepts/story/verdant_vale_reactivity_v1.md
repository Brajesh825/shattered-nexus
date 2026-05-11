# 🌿 Concept: Verdant Vale — Post-Boss Reactivity (Arc 1 Life)

## 📌 Objective
After the player defeats King Galdor (map boss) and the Void Knight (arc story boss, `arcIdx` advances to 1), the NPCs in Verdant Vale should react. Currently they speak as if the threat is still live forever. This concept defines two reactivity layers:

## 🗡️ Layer 1: Post-Galdor (Map Boss Defeated)
Galdor's defeat can be tracked via `G.firedScenes` — his isBoss entity triggers a scene flag when the map boss is downed. 

**NPCs that should react:**
- **Elder Maren** — acknowledge the goblin raids stopped; reflect on what Galdor's curse meant
- **Soldier Davan** — dare to hope his brother might wake up from the Void consumption now
- **Lira** — one small line of relief that the ruins feel quieter

**Implementation**: Add `verdant_vale_return` dialogue keys to each NPC, checked after `galdor_king` boss is marked as killed.

## ⚔️ Layer 2: Post-Void Knight (Arc Story Boss Defeated, arcIdx ≥ 1)
After arc 1 completes, the Void Knight is freed, Sera joins the party, and the Light Seal Fragment is recovered. 

**NPCs that should react:**
- **Elder Maren** — knows Arren's name was spoken aloud for the first time in 600 years; says goodbye to the party
- **Soldier Davan** — the impossibility becomes possible; his brother shows a flicker of recognition
- **Soldier Kael** — reopens the east gate; his vigil is over
- **Soldier Jace** — stands down from the capital posture; admits he was afraid the whole time
- **Lira** — a follow-up quest unlocked: `lira_second_chance` (she wants to send something east as thanks)
- **Azure Commander** — new dialogue key `verdant_vale_post_arc` delivered IN the ruins (she walked to where Arren fell)

## 🛠️ Implementation Strategy

### Dialogue Keys
The map engine checks `npc.dialogueKey + '_return'` on repeat visits. We need to add a third tier: `npc.dialogueKey + '_post_arc'`.

The simplest approach without engine changes: check `Story.arcIdx >= 1` inside the NPC's dialogue array — but that requires JS conditional logic in `_openNPCDialogue`.

**Better approach**: Use two separate NPC entries in the map file with different `dialogueKey` values, filtered by the engine's existing `showAfterScene` (or equivalent condition). Since `showAfterScene` isn't hooked yet, we will instead add a new dialogue key per NPC in `npcs.js` and use `giveQuest` conditionality.

**Simplest working approach for now**: Add a `_post_boss` dialogueKey variant to each NPC in `npcs.js`, and add a new scene trigger in `map-verdant-vale.js` that fires once `Story.arcIdx >= 1` (via a `type: 'conditional_msg'` or just by placing a new `scene` with a condition function).

## 📝 New Quest: `lira_second_chance`
- **Giver**: Lira (unlocked after arc 1 complete)
- **Type**: gather (1x `silver_locket` — she wants to send her own locket east as an offering to whoever Arren was)
- **Reward**: exp 300, unique accessory `lira_ribbon`
