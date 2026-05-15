# Concept: Resonance Arts (Desperation Gauge & Ultimate System)
**Domain**: Aegis (Combat Balance) + Vivid (Visual) + The Chronicler (Story)
**Status**: Concept — Detailed Blueprint — Ready for Staged Implementation
**Priority**: HIGH

> [!IMPORTANT]
> **Pipeline Rule**: This document is the authoritative staging blueprint. No code-level implementation may begin until this document is reviewed and Aegis signs off on the multiplier table. **Concept staging verified.**

---

## The Narrative Gate — Defeating the Demon Lord (Arc 2)

The Resonance Arts system does **not** exist at the start of the game. It is **narratively unlocked** as a permanent party ability after the party defeats the **Demon Lord** — `demon_lord`, **Chief Archivist Solvan**, the Arc 2 story boss of the Crystal Caverns. Solvan was the greatest scholar of the pre-civilization Sky Archive, fused against his will to the Fire Fragment and turned into an endless elemental siphon, feeding stolen knowledge directly to Valdris.

### Why This Gate Makes Sense

Solvan is the first boss who is not simply a monster — he is a *person who was broken by the Void's hunger for knowledge*. Defeating him does not kill him cleanly. The Fire Fragment cracks. For the first time, raw elemental resonance bleeds back into the open — untainted, uncontrolled, unclaimed by Valdris's leyline poisoning.

The party, standing in the crater of that freed Fragment energy, instinctively absorbs it. They are not trained scholars. They cannot hold it precisely. But they can hold it *together* — through the trust built in Arc 1 and the weight of their near-deaths — and that accumulated will crystallizes into the first spark of a **Resonance Art**.

This is a mid-game unlock (Arc 2 is level 7–15), giving players more than half the game to master the system before the endgame arcs where it becomes critical.

> *"The Fragment shatters. The fire doesn't go out — it comes home. And somewhere in the resonance that washes over them, the party realizes they are not just surviving anymore. They are burning back."*

The Resonance Arts gauge activates permanently from this point forward, carrying into all subsequent arcs, Boss Soul Echoes, and Abyssal Modifier runs.

### Unlock Trigger
- **Story Flag**: `demon_lord_defeated`
- **Source**: `data/story/arc_2.json` — post-boss victory callback
- **Unlock Sequence**: A short cinematic fires after the Arc 2 story boss victory. The Fire Fragment cracks, a pulse of gold-amber energy washes over the party's portraits, and an overlay appears: *"The leylines remember your fire. Resonance Arts — Unlocked."*
- **Persistence**: The gauge is permanently active in all subsequent battles. It does not deactivate. It is always available from Arc 2 onwards, including Arc 8 (the Shadow Emperor — Valdris's final form) and the Eternal Void endgame.

---

## Overview

The **Resonance Gauge** is a secondary shared party meter (0–100%) that sits anchored at the top of the Battle UI. It builds organically during combat through hardship, elemental mastery, and tactical positioning. When full, any character whose turn it is may unleash a zero-MP **Resonance Art** — a cinematic, class-specific ultimate that transcends normal combat.

This is a **desperation and mastery** mechanic. It rewards players who are fighting hard, not playing safely.

---

## The Gauge — Build Mechanics

The gauge is **shared by the entire party**, starts at **0% every battle**, and is not save-persistent (resets on battle start).

| Event | Gauge Gain |
|---|---|
| Party member takes ≥5% of their max HP in a single hit | +2% |
| Elemental Reaction triggered (Melt, Shatter, Vaporize, Swirl) | +5% |
| Vanguard Intercept (Slot 2 absorbs a single-target hit) | +3% |
| Any party member is KO'd | +15% (desperation surge) |
| Turn ends without any party member acting (stunned/paralyzed full round) | +8% |

### Gauge Decay
The gauge does **not** decay over time. What the party earns, they keep — until they use it or the battle ends.

---

## Unleashing a Resonance Art

When the gauge reaches **100%**, the currently-acting character's `[ATTACK]` button transforms into a pulsing `[⚡ RESONANCE ART]` button.

- Activating it **consumes the entire gauge** (drops to 0%)
- The ability costs **zero MP** — this is not a normal skill
- The animation is **cinematic** — the battle scene dims, the character's portrait blooms, and the ability plays as a full-width visual sequence
- After the art fires, the gauge immediately begins refilling for the next opportunity

---

## The Resonance Art Roster

Every character has a unique art tied directly to their class archetype and lore. Post-Ascension characters (Tao → Lunar Deathspeaker, etc.) have **evolved versions** of their arts.

| Character | Class | Resonance Art | Effect | Damage Cap |
|---|---|---|---|---|
| **Aya** | Cryo Princess | *Glacial Bloom* | AOE cryo burst. Applies Freeze to all enemies (2 turns). First attack vs. any frozen target this battle deals 2x. | 3.0x |
| **Aya (Ascended)** | Storm-Rime Sovereign | *Storm-Rime Waltz* | AOE Cryo + Lightning cascade. Freezes all, then instantly detonates with Lightning — Shatter reaction on all. | 3.5x |
| **Tao** | Ghost Guide | *Funeral Verse* | Single-target. 3.0x damage. Restores 20% of damage dealt as HP to the entire party (soul drain). | 3.0x |
| **Tao (Ascended)** | Lunar Deathspeaker | *Sovereign Eclipse* | Single-target. 3.5x damage. Replaces healing — drains 30% of target's current HP directly to party. Works on bosses. | 3.5x |
| **Rei** | Ancient Warden | *Karmic Wall* | Party becomes immune to all damage for 1 full turn. Rei absorbs all incoming hits, converts 60% to bonus ATK for his next action. | Non-damaging |
| **Rei (Ascended)** | Ebon Warden | *Karmic Reprisal* | Party immune for 1 turn. Rei absorbs all hits AND reflects 80% as void-type counter damage next turn. Bypasses DEF. | 2.5x (reflected) |
| **Drake** | Dragoon | *Apex Dive* | Single-target aerial strike. Strips all DEF buffs. If target HP < 30%, executes for 4.0x. | 4.0x |
| **Drake (Ascended)** | Wyrmfall Knight | *Apex Heavensplitter* | AOE aerial slam. Strips DEF buffs on all enemies. Landing shockwave hits all for 2.5x. Execution threshold rises to 40% HP. | 4.0x |
| **Sera** | Azure Commander | *Aegis of the Fallen* | No damage. Grants entire party a **500 HP shield**. Fully cleanses all active debuffs from all members. | Non-damaging |
| **Lulu** | Star Dancer | *Tide's Embrace* | Restores 35% max HP to entire party. Applies Wet aura to all enemies (enables Vaporize reactions next turn). | Healing |
| **Valka** | Valkyrie | *Divine Sentence* | Marks 1 enemy with Valkyrie's Seal. All party attacks vs. that target deal **2x damage for 3 turns**. Seal cannot be cleansed. | Buff (2x modifier) |
| **Ria** | Summoner | *Arcane Cascade* | AOE composite (Physical + Magic) explosion. Applies 1 random Aura (Burn / Wet / Shock) to each surviving enemy. | 3.0x |
| **Rex** | Lionheart King | *Lionheart's Decree* | Revives all KO'd party members at 30% HP. Living party members gain +20% ATK for 3 turns. | Utility + Buff |

---

## Aegis Balance Compliance

All damage-dealing Resonance Arts are subject to the **4.0x hard cap** — within the 8.0x absolute ceiling. Non-damaging arts (Sera, Rex, Lulu) are utility/healing and do not interact with the damage pipeline.

The gauge's ramp conditions (KO = +15%, Intercept = +3%) are designed so that a party *playing well* builds the gauge slowly, while a party *barely surviving* builds it rapidly — creating a genuine comeback mechanic.

```
Multiplier Audit (Aegis Sign-Off Required):
Aya:          3.0x  ✅ Within cap
Aya Ascended: 3.5x  ✅ Within cap
Tao:          3.0x  ✅ Within cap
Tao Ascended: 3.5x  ✅ Within cap
Rei:          N/A   ✅ Utility (no damage multiplier)
Rei Ascended: 2.5x  ✅ Within cap (reflected, bypasses DEF — monitor closely)
Drake:        4.0x  ✅ At cap (execution only, single-target)
Drake Ascend: 4.0x  ✅ At cap (AOE reduced to 2.5x base, execution at 4.0x)
Sera:         N/A   ✅ Utility (shield + cleanse, no damage)
Lulu:         N/A   ✅ Healing (no damage multiplier)
Valka:        2.0x  ✅ Buff modifier, within multi-turn balance
Ria:          3.0x  ✅ Within cap (AOE — monitor per-target total)
Rex:          N/A   ✅ Utility (revive + buff, no damage)
```

---

## Visual Treatment (Vivid's Domain)

### The Gauge Widget
- Positioned at the top of the Battle UI, centered above the action buttons
- Width: 60% of the battle panel
- Fill: A left-to-right gradient: `hsl(280, 70%, 20%)` → `hsl(45, 95%, 60%)` (void purple to radiant gold)
- At 100%: gauge **pulses** with a gold shimmer animation; edge emits particle sparks
- The gauge label reads: `✦ RESONANCE` in `font-family: var(--vt)` at 11px

### The Button Transform
- At 100%, `[ATTACK]` smoothly crossfades (300ms, `opacity` + `transform: scale(1.05)`) to the `[⚡ RESONANCE ART]` button
- Button background: `linear-gradient(135deg, hsl(280,80%,25%), hsl(45,90%,50%))`
- A subtle rotating border glow animates on the button: `border: 1px solid rgba(245,208,96,0.6)`

### The Cinematic
1. Battle scene dims: `filter: brightness(0.4)` over 400ms
2. Acting character's sprite scales up slightly: `transform: scale(1.1)`, a divine aura particle ring surrounds them
3. Character portrait blooms with elemental color filter
4. The art animation plays (full-width SVG/CSS overlay — character-specific)
5. Scene snaps back: `filter: brightness(1.0)` over 200ms, results applied
6. Gauge resets to 0% with a brief drain animation

---

## Implementation Path

### Stage 1 — Unlock System
1. `js/story.js` — hook `valdris_first_defeat` flag → call `ResonanceArts.unlock()`
2. `js/game.js` — `G.resonanceArtsUnlocked` boolean (persisted in save)
3. `js/ui/battle-ui.js` — conditionally render gauge only if `G.resonanceArtsUnlocked === true`

### Stage 2 — Gauge Engine
4. `js/battle/combat-engine.js` — gauge increment hooks at damage received, reaction triggered, KO, intercept
5. `js/game.js` — `G.resonanceGauge` (0–100, session-only, not persisted)

### Stage 3 — Button & Execution
6. `js/ui/battle-ui.js` — gauge widget rendering + 100% button transform
7. `js/battle/action-handler.js` — new `RESONANCE_ART` action type; maps to character art by `charId`
8. `data/classes.json` — `resonanceArt` block per class definition (art ID, effect type, value, cap)

### Stage 4 — Ascension Art Variants
9. `data/classes.json` — `resonanceArtAscended` block per ascended class
10. `js/battle/passive-system.js` — check `G.ascended[charId]` to select correct art variant

### Stage 5 — Visual Polish
11. `css/combat.css` — gauge styles, button glow, cinematic dim
12. `js/ui/battle-ui.js` — cinematic sequence choreographer
13. `js/svg-animations.js` — per-art animation definitions

---

## Open Questions

> [!NOTE]
> **Dual Resonance Arts dependency**: The `dual_resonance_ultimates.md` concept requires this system to be live first. Implement this before considering Dual Arts.

> [!NOTE]
> **Gauge persistence between boss phases**: Should the gauge carry over between boss Phase 1 → Phase 2 transitions, or reset? Recommendation: **carry over** — punishing the player for building gauge during Phase 1 would feel unfair.

> [!NOTE]
> **Rex's Decree on KO'd members**: If all 4 members are KO'd (party wipe), Rex's art cannot fire — the battle has already ended. The art should only revive members KO'd *during* the battle while at least 1 member is still standing.
