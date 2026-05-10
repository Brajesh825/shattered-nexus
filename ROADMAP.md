# ⚔️ RPG+ Development Roadmap: Beta 1.0

## 🎯 Current Objective: The First Release
**Scope**: Full playable experience through Arcs 1 & 2, including the first two Expansion Regions.


### 🔷 Phase 6: Visual Fidelity & Asset Polish
- [x] **High-Fidelity Sprite Rendering**: Audit battle sprite scaling and CSS filters; eliminate blurring/interpolation artifacts for "neat and clear" character detail.
- [x] **Tiered Sprite System**: Implemented dual-tier sprite pipeline (Classic/Flat vs Vivid/Illustrious) across the entire primary roster.
- [ ] **Combat VFX Overhaul**: Standardize ethereal glows and status overlays to ensure they don't obscure character detail.
- [x] **Asset Weight Pass**: Verified and optimized WebP/PNG dual-tier asset roster for all characters.

---

## 🛠️ Technical Debt & Engineering (Prioritized)
### P0 - Release Blockers
*(All P0 blockers cleared for Beta 1.0)*

### P1 - Stability & Maintainability
- [ ] **Encapsulate Turn State**: Replace loose `G.turnIdx`, `G.turnQueue`, and battle locks with a centralized `G.turn` object.
- [ ] **Named Damage Modifiers**: Refactor the combat damage chain so STAB, affinity, reactions, mitigation, crits, passives, and relics are named steps.
- [x] **HTML Injection Guardrails**: Implemented safe `escapeHtml` and verified Battle Log / UI security.
- [ ] **JSON Loading Standard**: Move all data loading onto a unified `DataLoader` service.

---

## ✅ Completed Milestones (Condensed)

### 🎨 Visual & Engine Standards (May 2026)
- [x] **Dynamic Style Switching**: Integrated per-player art preference (Vivid vs Classic) into the rendering pipeline and settings.
- [x] **Tiered Roster Synchronization**: Achieved 100% parity across 9 primary spirits for both Flat and Illustrious styles.
- [x] **Technical Asset Audit**: 86/86 automated tests passed, verifying all sprite references and data integrity.

### 🚀 Release Readiness (May 2026)
- [x] **Production Gating**: Silenced debug logs and gated development tools behind `IS_DEV` flag.
- [x] **CI/CD Pipeline**: Automated production builds via GitHub Actions with isolated `dist/` deployment.
- [x] **Data Integrity**: Verified all 172 assets, character references, and story links (passed audit).
- [x] **Story Guide**: Finalized comprehensive mechanics and narrative walkthrough for Arcs 1 & 2.

### 🎨 UX & Systems (May 2026)
- [x] **Item Vault Overhaul**: Premium, tabbed inventory with visual targeting and unified effect engine.
- [x] **Data Integrity Audit**: Full scan of all JSON assets; resolved ID conflicts and parsing errors.
- [x] **Party Menu Overhaul**: Premium, paginated character showcase with ethereal effects and responsive split-views.
- [x] **Global UX Polish**: Pixel-art cursor, custom scrollbars, and stabilized navigation flows.
- [x] **Sprite System Optimization**: Removed 700+ lines of legacy procedural code; standardized all fallbacks to 'aya' (hero) and 'slime' (enemy).
- [x] **Mobile Landscape Refinement**: Fixed sprite overlapping on mid-sized landscape devices (600-800px) by synchronizing compact layout breakpoints.
- [x] **Audio System**: Full BGM support with crossfading and placeholder audit completed for all maps.
- [x] **Camp-Only Saving**: Save removed from pause menu; `💾 SAVE PROGRESS` lives exclusively in the Camp menu.
- [x] **Echo Quest System**: Data-driven hunt/gather quests from `data/quests.json`; NPC `giveQuest` field; arc auto-unlock via `onArcAdvance`. *(Concept: `world_quests_and_rumors.md`)*
- [x] **World Corruption & Fog**: Time-based corruption accumulation in wild zones, visual void-purple decay, mutant encounter scaling. *(Concept: `corruption_and_infection.md`)*
- [x] **Character Recruitment Reorder**: Valka → Arc 4 (Sunken Temple), Rex → Arc 5 (Shadow Reach), Drake → Arc 3.

### 🌍 World & Map Foundations (May 2026)
- [x] **Arc 1 (Verdant Vale)**: Narrative, enemies, and Void Knight boss finalized.
- [x] **Arc 2 (Crystal Cavern)**: Full 3-floor suite (F1-F3) with Spectral Guardian boss.
- [x] **Multi-Floor Navigation**: Dynamic World Map entry; selectable destinations for multi-floor dungeons; fixed Crystal Cavern floor-skipping bug.
- [x] **Expansion Regions**: Southern Isles and Riverlands Crossing lore and map implementations completed.
- [x] **SVG Asset Standard**: All environmental assets converted and preloaded as high-fidelity SVGs.
- [x] **Content Balance**: Final tuning pass for all Arc 1 & 2 bosses completed.
- [x] **PWA Stability**: Fixed service worker cache manifest and bumped cache version to v7.0.

### ⚙️ Technical Foundations (April 2026)
- [x] **Combat Engine Audit**: Fixed `getStat('reduction')` bug and stabilized damage multipliers.
- [x] **Sera/Lyra Registration**: Standardized sprite-sheet configuration for new heroes to fix 'whole-sheet' rendering bug.
- [x] **Input & Accessibility**: Virtual joystick, mobile action buttons, contextual hint bar, and full gamepad support for World Map navigation.
- [x] **Mobile Controls**: Virtual joystick and X/Y button implementation.
- [x] **Architect Pro**: Browser-based tile editor for high-fidelity map creation.
- [x] **Story Refactor**: Extracted cutscene logic into `js/cutscene.js`.

---
*Last Audited: 2026-05-03 23:15. Status: Stable. Priority: Technical Debt & Release Blockers.*
