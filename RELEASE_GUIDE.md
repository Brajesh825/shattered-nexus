# Release Management Guide: Shattered Nexus

This document serves as the official trace and operational manual for the **Arc-Based Release System** implemented to facilitate incremental updates on platforms like itch.io.

---

## 🏗 System Architecture Trace

### 1. Centralized Configuration ([js/release-config.js](js/release-config.js))
The single source of truth for the build's constraints.
- `MAX_REACHABLE_ARC`: Controls narrative and feature depth.
- `ENABLE_BOSS_MODE`: Feature toggle for the Legendary Gauntlet.
- `IS_DEV`: Internal flag for developer overrides.
- `BETA_END_TEXT`: Custom messaging for the current content ceiling.

### 2. Narrative Engine ([js/story.js](js/story.js))
- **Release Filtering**: Intercepts `_startNextArc()` to prevent out-of-scope progression.
- **World Map Culling**: Dynamically hides unreleased nodes and SVG paths.
- **Branding**: Automatically updates the Title Screen tagline (e.g., "1 Released Arc").

### 3. Boss Gauntlet Engine ([js/ui/boss-gauntlet.js](js/ui/boss-gauntlet.js))
- **Visibility Logic**: Hides the Title Screen button based on `ENABLE_BOSS_MODE`.
- **Developer Backdoor**: Support for `?debug=true` or `?dev=true` to access hidden features.
- **Content Filtering**: Uses a hardcoded `BossArcMap` to ensure only bosses from released arcs appear in the UI.

### 4. Visual Components
- **Beta End Screen**: A cinematic overlay triggered at the end of available content.
- **Version Tagging**: Dynamic version display on the Title Screen.

---

## 🚀 How to Release a New Update

Follow these steps to ship a new version (e.g., moving from Arc 1 to Arc 2):

### Step 1: Update Configuration
Open `js/release-config.js` and modify:
```javascript
VERSION: "v1.1.0-beta",
MAX_REACHABLE_ARC: 1, // Unlock Arc 2
ENABLE_BOSS_MODE: true, // Optional: Unlock Boss Mode for players
```

### Step 2: Content Verification
1.  Run the game locally.
2.  Verify the World Map now shows **Crystal Caverns** (or the new arc).
3.  Check the Title Screen for the updated version and arc count.

### Step 3: Bundle for Itch.io
1.  Zip the entire project directory.
2.  Ensure `index.html` is at the root of the zip.
3.  Upload to itch.io as a **Web Playable** project.

---

## 🛠 Developer Testing
To test unreleased content or hidden features without changing the config:
- Add `?debug=true` to your local URL (e.g., `http://127.0.0.1:5500/index.html?debug=true`).
- The console will output `[Gauntlet] Mode unlocked (DEV)` to confirm active debug mode.

---

## 📝 Change Log (Trace)
- **Feat**: Implemented `ReleaseConfig` architecture.
- **Feat**: Added World Map node/path filtering.
- **Feat**: Added `beta-end-screen` with itch.io "Follow" integration.
- **Feat**: Added `ENABLE_BOSS_MODE` global toggle.
- **Fix**: Resolved Title Screen tagline grammar ("Arc" vs "Arcs").
- **Fix**: Resolved cinematic overlay visibility and font overlapping glitches.
