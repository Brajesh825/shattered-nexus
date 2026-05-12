# ⚔️ RPG+ Development Roadmap: Beta 1.0

## 🎯 Current Objective: The First Release
**Scope**: Full playable experience through Arcs 1 & 2, including the first two Expansion Regions.


---

## 🛠️ Technical Debt & Engineering (Prioritized)
### P0 - Release Blockers
*(All P0 blockers cleared for Beta 1.0)*

### 1. Stability & Maintainability
- [ ] **Named Damage Modifiers**: Refactor the combat damage chain so STAB, affinity, reactions, mitigation, crits, passives, and relics are named steps.
- [ ] **JSON Loading Standard**: Move all data loading onto a unified `DataLoader` service.

---

## ✅ Completed Milestones (Condensed)

### 🛡️ Core Stability & Security (May 2026)
- [x] **Turn State Encapsulation**: Centralized turn logic into `G.turn` object for battle lock stability.
- [x] **Security Guardrails**: Implemented global `escapeHtml` and sanitized Battle Log outputs.

### ⚔️ High-Fidelity Pipeline & Bestiary (May 2026)
- [x] **Headless MCP Orchestration**: Automated local ComfyUI generation queues and WebP aspect-ratio auditing.
- [x] **Visual Polish**: Standardized 79 enemies to the "Void Knight" aesthetic; resolved morphology drift.
- [x] **Tiered Rendering**: Deployed dual-tier (Flat/Illustrious) sprite pipeline across the roster.
- [x] **VFX Standardization**: Universal ethereal glows for Void-tier entities (Titan, Warden).
- [x] **Asset Migration**: Converted all legacy PNGs to WebP; reduced PWA shell to ~5.5MB.
- [x] **Smart On-Demand Loading**: Implemented background-fetch architecture in `AssetPreloader.js`.
- [x] **Automated Registry Sync**: Resolved prompt regex line-ending bugs and automated completion tagging.
- [x] **Council Awakening & Walkable Ground Baseline**: Enshrined strict widescreen bottom 50% walkable stone platform staging rules referencing `@riverlands.webp`, and mapped dynamic living archetypes across all six agentic profiles.


### 🎨 Visual & Engine Standards (May 2026)
- [x] **Dynamic Style Switching**: Integrated per-player art preference (Vivid vs Classic) into the rendering pipeline and settings.
- [x] **Tiered Roster Synchronization**: Achieved 100% parity across 9 primary spirits for both Flat and Illustrious styles.

### 🚀 Release Readiness (May 2026)
- [x] **Production Gating**: Silenced debug logs and gated development tools behind `IS_DEV` flag.
- [x] **CI/CD Pipeline**: Automated production builds via GitHub Actions with isolated `dist/` deployment.
- [x] **Global Asset & Data Integrity**: Verified all 172 assets, character references, JSON table syntax, and story links natively (passed automated suite).
- [x] **Story Guide**: Finalized comprehensive mechanics and narrative walkthrough for Arcs 1 & 2.

### 🎨 UX & Systems (May 2026)
- [x] **Item Vault Overhaul**: Premium, tabbed inventory with visual targeting and unified effect engine.
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
- [x] **Input & Mobile Accessibility**: Virtual joystick, context hint bars, native X/Y virtual buttons, and gamepad hooks mapped across all exploration layers.
- [x] **Architect Pro**: Browser-based tile editor for high-fidelity map creation.
- [x] **Story Refactor**: Extracted cutscene logic into `js/cutscene.js`.

---
+*Last Audited: 2026-05-11 04:10. Status: Stable. Priority: Technical Debt & Release Blockers.*
