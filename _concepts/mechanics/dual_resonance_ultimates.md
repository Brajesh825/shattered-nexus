# Concept: Dual Resonance Ultimates — Pair Ultimates
**Domain**: Aegis (Combat Balance) + Vivid (Visual) + The Chronicler (Story)
**Status**: Concept — Not Yet Implemented
**Priority**: HIGH — Extends Bond System & Resonance Arts

> [!IMPORTANT]
> This concept depends on **Resonance Arts (Concept 1)** being implemented first. The Bond System (Tier III requirement) must also be active. Do not implement without those two systems live.

---

## Overview

The Bond System establishes *who* characters are to each other. The Resonance Arts system gives individual characters ultimates. **Dual Resonance Ultimates** are the logical intersection: when two characters with a **Tier III Bond** both have their Resonance Gauge at 100% simultaneously, they can combine those charges into a single, uniquely cinematic joint ultimate that is *mechanically different* from either character's solo art.

---

## Trigger Conditions

1. Two party members must have a **Tier III Bond** (completed via Bond Events at camp).
2. Both characters must have their Resonance Gauge at **100%** simultaneously.
3. When both conditions are met, a new pulsing `[⚡ DUAL RESONANCE]` button appears, replacing both characters' individual `[RESONANCE ART]` buttons.
4. Activating it drains **both** gauges.
5. The move triggers as a **special phase** — it does not consume either character's queued turn in the ATB.

---

## The Dual Ultimate Roster

| Pair | Bond | Title | Effect |
|---|---|---|---|
| **Aya + Tao** | Tier III: *Unity of Void and Flame* | *Absolute Zero Ignition* | Aya's ice freezes ALL enemies (2 turns). Tao's fire detonates every frozen target simultaneously — Melt reaction on all. Massive AOE. |
| **Lulu + Rei** | Tier III: *Tides of the Ancients* | *Tide of Ten Thousand Years* | Rei absorbs ALL incoming damage for 2 turns (party becomes immune). During the window, Lulu's wave restores 40% max HP to every party member. |
| **Valka + Sera** | Tier III: *Redemption's Commander* | *Sovereign Judgment* | Valka marks all enemies with Divine Sentence (2x damage for 3 turns). Sera's Aegis absorbs the first retaliatory hit from each enemy after the mark. |
| **Ria + Rex** | Tier III: *Legacy of the Lionheart* | *Primordial Decree* | Rex's divine authority amplifies Ria's eidolon summon by 3x. The eidolon delivers a full-party composite (Physical + Magic) AOE detonation. |

---

## Aegis Balance Compliance

- All Dual Ultimate damage is **hard-capped at 6.0x** — below the absolute 8.0x ceiling.
- The AOE Melt chain (*Absolute Zero Ignition*) applies Melt at the standard **2.0x multiplier per target**, not stacked — total output remains within bounds across multi-enemy scenarios.
- Dual trigger requires Tier III Bond — a genuine Arc 5+ gate. Not accessible early-game.
- The 2-gauge cost is a significant resource investment. The gauge does not carry over between battles.

---

## Visual Treatment (Vivid's Domain)

1. When the Dual trigger is available, both character portrait icons in the HUD should **pulse in unison** with their bond color (Aya: `#7dd3fc` blue + Tao: `#ef4444` red = white-hot oscillation).
2. On activation: both sprites slide to the **center of the battle scene**, their rendering filters merging into a single bloom.
3. A **2-second dramatic freeze frame** — the world holds still, the music cuts, only the merged particle effect remains.
4. The detonation sequence plays as a full-width overlay cinematic (no health bars visible).
5. After the animation, both sprites return to their formation slots with their filters fading back to normal.

### Per-Pair Filter Blend Examples
- **Aya + Tao**: `hue-rotate(0deg) brightness(2.0) saturate(3.0)` — white-hot plasma
- **Lulu + Rei**: `hue-rotate(150deg) brightness(1.5) saturate(2.0)` — deep teal surge
- **Valka + Sera**: `hue-rotate(250deg) brightness(1.6) saturate(2.5)` — violet-gold divine
- **Ria + Rex**: `hue-rotate(30deg) brightness(1.8) saturate(2.8)` — amber-gold eidolon flare

---

## Implementation Path

1. `data/story/bonds.json` — add `dualUltimate` block to Tier III of each pair
2. `js/battle/passive-system.js` — `checkDualResonance(unit)` function: verify Tier III + dual gauge
3. `js/ui/battle-ui.js` — Dual Resonance button reveal + cinematic overlay rendering
4. `js/battle/action-handler.js` — `DUAL_RESONANCE` action type execution
5. `js/battle/combat-engine.js` — gauge consumption for both characters
6. `css/combat.css` — dual-ultimate cinematic animation styles
