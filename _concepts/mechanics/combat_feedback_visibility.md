# 🎨 Concept: Combat Feedback Visibility & Premium Action Notification

## 🎯 Architectural Intent
During spatial combat interactions, legacy action logs populate transient arrays via `BattleUI.addLog()` but remain heavily constrained or completely hidden across larger PC viewing frame formats due to aggressive viewport max-height bounds and minimalist grid overlaps. To establish optimal player awareness and state-of-the-art combat immersion, this concept drafts a dual-tier visibility standard ensuring visual and mechanical feedback clarity.

---

## 🖼️ Implementation Blueprint

### 1. In-Situ Action Notification (AI Speech Bubbles)
Rather than forcing players to constantly divert focus downward to read action descriptions, monsters will natively broadcast their intended ability names directly over their stage presence the moment their combat ticker triggers.
- **Interface Hooks**: Inside `js/battle/action-handler.js`, within the execution loop of `enemyAct()`, invoke `BattleUI.popAI(enemyIdx, "⚡ " + ab.name.toUpperCase())` immediately prior to dispatching `BattleUI.enemyStrike()`.
- **Styling Architecture**: Sourced directly from `.ai-pop` in `css/combat.css`, floating move alerts render via high-contrast HSL-tuned tokens (`var(--cyan)`), premium dark translucent backdrops (`rgba(10, 15, 30, 0.85)`), and smooth multi-stage cubic-bezier pop micro-animations (`popUp` sequence).

### 2. PC Desktop Viewport Optimization (Major Screens)
For large monitor frames (`min-width: 1200px` through `1800px`), the dedicated `#menu-area` container provides abundant structural depth. The action feed will be fully liberated to fill the intermediate grid section without truncation.
- **CSS Rule Overhaul**: Ensure `#battle-screen .battle-log` and global `.battle-log` maintain rich atmospheric blur aesthetics (`backdrop-filter: blur(12px)`) while removing clipping limitations on PC desktop aspect ratios.

---

## 🛡️ Pipeline & Cache Invalidation Check-Offs
- [x] **Concept Staging**: Registered inside `_concepts/mechanics/combat_feedback_visibility.md` following **The Curator's** strict gatekeeping directives.
- [x] **Core Script Update**: Injection of `BattleUI.popAI()` hooks straight into `js/battle/action-handler.js`.
- [x] **Cache Versioning**: Mandatory version bump of `CACHE_NAME` inside `sw.js` to ensure production clients flush stale browser worker contexts immediately.
