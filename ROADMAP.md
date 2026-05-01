# ⚔️ RPG+ Development Roadmap: Beta 1.0

## 🎯 Current Objective: The First Release
**Scope**: Full playable experience through Arcs 1 & 2, including the first two Expansion Regions.

### 🔷 Phase 1: Expansion Content (Southern Isles & Riverlands)
- [/] **Southern Isles Terrain**: Base archipelago terrain generated. (Refinement needed).
- [/] **Riverlands Crossing Terrain**: Base river & bridge terrain generated. (Refinement needed).
- [ ] **Expansion NPCs**: Add specialized "Survivor" NPCs with unique dialogue for each island/riverbank.
- [ ] **Boss Balancing**: Perform a final tuning pass on the **Sunken Leviathan** and **River King**.

### 🔷 Phase 2: System Polish (Items & UI)
- [ ] **Item Audit**: Verify that all 20+ items in `data/items.json` have correct logic in `inventory.js`.
- [ ] **UI Scaling**: Ensure the "Item Submenu" in battle is perfectly readable on iPhone SE/XR.
- [ ] **Gold Balance**: Tune enemy gold drops to ensure shops feel meaningful.

### 🔷 Phase 3: Release Readiness
- [ ] **Walkthrough Update**: Finalize the step-by-step guide for Arc 1 and Arc 2.
- [ ] **Beta Lock**: Set `MAX_REACHABLE_ARC: 1` in `release-config.js` for the public itch.io push.
- [ ] **Deployment Script**: Finalize a script to minify/obfuscate core logic for the production build.

---

## 🛠️ Technical Debt & Engineering (Prioritized)
- [ ] **Encapsulate Turn State**: Replace loose `G.turnIdx` with a centralized `G.turn` object.
- [ ] **Named Modifiers**: Refactor the combat damage chain for better rebalancing visibility.
- [ ] **Null Guards**: Standardize the `?.` access pattern across the engine.

---

## ✅ Completed Milestones (Condensed)

### 🌍 World & Map Foundations (May 2026)
- [x] **Arc 1 (Verdant Vale)**: Narrative, enemies, and Void Knight boss finalized.
- [x] **Arc 2 (Crystal Cavern)**: Full 3-floor suite (F1-F3) with Spectral Guardian boss.
- [x] **Expansion Foundations**: Generated `.json` terrain grids for Southern Isles and Riverlands.
- [x] **SVG Asset Standard**: All environmental assets converted and preloaded as high-fidelity SVGs.

### ⚙️ Technical Foundations (April 2026)
- [x] **Combat Engine Audit**: Fixed `getStat('reduction')` bug and stabilized damage multipliers.
- [x] **Mobile Controls**: Virtual joystick and X/Y button implementation.
- [x] **Architect Pro**: Browser-based tile editor for high-fidelity map creation.
- [x] **Story Refactor**: Extracted cutscene logic into `js/cutscene.js`.

---
*Last Audited: 2026-05-02. Priority: Technical Debt Resolution.*
