# ⚔️ RPG+ Development Roadmap: Beta 1.0

## 🎯 Current Objective: The First Release
**Scope**: Full playable experience through Arcs 1 & 2, including the first two Expansion Regions.


---

## 🛠️ Technical Debt & Engineering (Prioritized)
### P0 - Release Blockers
*(All P0 blockers cleared for Beta 1.0)*

### 1. Stability & Maintainability
- [x] **Named Damage Modifiers**: Each multiplier step (STAB, elem affinity, reaction, fireAmp, lowHp, summon, passive, reduction, crit) is now collected into a named `_breakdown` object in `resolveOffensiveAction` and `resolveEnemyOffensiveAction` ([action-handler.js](file:///c:/Users/ASUS/VVI/rpg+/js/battle/action-handler.js)). `[MATH-PHYS]` / `[MATH-MAGIC]` debug logs emit every step by name. NaN guards surface the full breakdown object for rapid diagnosis.
- [x] **JSON Loading Standard**: Move all data loading onto a unified `DataLoader` service.

### 2. Vivid Hybrid Weapon System (Staged)
- [x] **Database Registration**: Load all 9 launch-tier weapon assets, elements, and Aegis-audited balanced stats into [weapons.json](file:///c:/Users/ASUS/VVI/rpg+/data/weapons.json).
- [x] **Core Character Linkage**: Configure starting and pre-equipped weapon IDs inside [characters.json](file:///c:/Users/ASUS/VVI/rpg+/data/characters.json) for starting heroes (Aya, Tao, Rei, Lulu) and pre-equipped recruits (Drake, Valka, Ria, Rex).
- [x] **Stat Computation Hooks**: Modify `computeStats` in `js/systems/party.js` to dynamically add weapon flat stats and bind passive traits during party assembly.
- [x] **Dynamic Idle Aura Glows**: Render elegant, element-specific pulsing HSL radial backdrops and randomized floating spark particles behind active party sprites in [battle-ui.js](file:///c:/Users/ASUS/VVI/rpg+/js/ui/battle-ui.js) and [fx.css](file:///c:/Users/ASUS/VVI/rpg+/css/fx.css).
- [x] **Combat Attack VFX Overrides**: Implement custom slash trails and particle flow overrides (frozen crystals, phoenix embers) during combat action ticks based on the active weapon ID.
- [x] **Vivid Weapon Selection UI Overhaul**: Redevelop the weapon equipped section, character tabs, and available weapons grid into a stunning glassmorphic 2-column workspace layout with neon stat chips, passive description cards, and active Resonance energy banners.
- [x] **Narrative Quest Triggers**: Code post-battle trigger hooks in the Map Engine to automatically yield the *Chain of Ten Thousand Nights* upon defeating the `river_king` and the *Tide Caller* upon defeating the `sunken_leviathan`.
- [x] **Chest Exploration Placements**: Place the *Azure Vanguard Standard* inside a deep crystal-altar chest in the [map-crystal-cavern-f1.js](file:///c:/Users/ASUS/VVI/rpg+/js/map/data/map-crystal-cavern-f1.js) definition.
- [x] **Camp Forge Crafting Interfaces**: Code Camp menu actions for weapon alternate forging and rarity tier upgrades using Void Fragments.

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
- [x] **Dynamic Banter & Reflection System**: MapUI-driven flavor text and post-boss narrative reflections with session-aware persistence.

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

### 🔧 Weapons & Relics System Audit Fixes (May 2026)
- [x] **Named Damage Chain** *(P0)*: `_breakdown` object added to `resolveOffensiveAction` and `resolveEnemyOffensiveAction`; all modifiers (stab, elem, rx, fireAmp, lowHp, summon, passive, reduction, crit) named and logged.
- [x] **Data-Driven Weapon Passives** *(P0)*: Removed hardcoded `laughing_lantern` check from `PassiveSystem.getStatMultiplier`. Weapons now declare `passive.thresholdOverride` in `weapons.json`; PassiveSystem reads it generically.
- [x] **Weapon ID Validation** *(P1)*: `computeStats()` and `buildParty()` in `party.js` now warn (IS_DEV) if `equippedWeapon` ID is not found in `WEAPONS_DATA`, preventing silent stat loss.
- [x] **Relic ID Validation** *(P1)*: `_tryRelicDrop()` and `awardBossRelic()` in `inventory.js` guard against invalid/missing relic IDs before adding to the active pool.
- [x] **Relic Bonus Cap** *(P1)*: `_getRelicStatMult()` in `party.js` now clamps per-stat relic bonuses at `NexusScaling.caps.relicBonusCap` (1.5×). Cap is documented in `scaling-config.js`.
- [x] **Save-Contract Weapon Validation** *(P1)*: `validateSaveStructure()` in `save-contract.js` strips `equippedWeapons`, `weaponsUpgrades`, and `weaponsLevels` keys that reference weapon IDs no longer present in `WEAPONS_DATA`, preventing corrupted stats on load.
- [x] **getStat() Chain Renumbered** *(P2)*: `CombatEngine.getStat` modifier chain renumbered Step 1–8 (was `0`, `1`, `2`, `3`, `4`, `4c`, `4b`, `5`) matching the CLAUDE.md multiplier hierarchy spec.
- [x] **Dev-Mode Fallback Warnings** *(P2)*: `getStat` now emits IS_DEV warnings when `BOND_DATA` is missing (Step 6) or `MapEngine.getWeather` is unavailable (Step 7), surfacing integration gaps during testing.
- [x] **resourceStrategy JSDoc** *(P2)*: `rebuildMemberCombatStats()` in `party.js` now has full JSDoc explaining all three modes (`clamp`, `delta`, `full`) and when to use each.

---
+*Last Audited: 2026-05-17 — Weapons & Relics audit pass complete. Status: Stable. All P0/P1 blockers cleared.*
