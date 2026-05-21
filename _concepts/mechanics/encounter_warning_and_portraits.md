# Concept: Dialogue Portrait Scaling, Encounter Warning, and Leveling UI

## 📋 Identity
- **Ref**: `nexus-concept-warning-portraits-v1.0`
- **Status**: APPROVED
- **Enforcing Personas**: The Curator (Gatekeeper), Aethon (Architect), Vivid (Aesthetics)

---

## 🎨 Creative & Aesthetic Specifications (Vivid)

### 1. Dialogue Portrait Decoupling & Viewport-Relative Scaling
- **Viewport Unit Control**: Transition portrait width/height from absolute JavaScript pixel values (`px`) to viewport-height relative CSS units (`vh`).
  - **Landscape Target**: `80vh` height.
  - **Portrait Target**: `55vh` height.
  - This ensures that character sprites scale smoothly when browser scale/zoom is adjusted, maintaining an elegant, high-fidelity torso-up visual novel appearance.
- **Multi-Character Side-by-Side (VVN Layout)**:
  - Multi-character scenes will render speakers side-by-side using horizontal offsets calculated from their index in the cast.
  - Non-speaking characters must remain visible (rather than being hidden via `display: none`). 
  - Apply HSL-tuned filters to dimmed (inactive) characters:
    - `opacity: 0.55`
    - `filter: brightness(0.4) grayscale(0.15)`
    - `transform: translate(-50%, 0) scale(0.9)`
  - Active characters are brought forward:
    - `opacity: 1`
    - `filter: brightness(1) drop-shadow(0 0 20px rgba(160, 144, 208, 0.6))`
    - `transform: translate(-50%, 0) scale(1.05)`
    - `z-index: 20`

### 2. Pre-Encounter Warning Screen Overlay
- **Visual Alert**: Display a full-screen, high-contrast hazard overlay upon step-triggering an encounter.
- **Theme Color Mapping**:
  - **Standard Encounter**: Deep Red `#ff3333` vignette with warning stripes.
  - **Corrupted Mutation**: Purple `#a855f7` vignette.
  - **Mutant Mutation**: Green `#22c55e` vignette.
  - **Ambush**: Golden Orange `#f59e0b` vignette.
- **Animations**:
  - Diagonal hazard stripes scrolling horizontally at the top and bottom.
  - Glitching neon warning text: `⚠️ WARNING ⚠️`
  - Pulsing text displaying the specific detected enemy name.

---

## 🏗️ Engine & Technical Blueprints (Aethon)

### 1. Pre-Battle State Synchronization & Transition Delay
- **Input Locking**: Lock player movement and disable coordinates update instantly upon encounter detection.
- **Audio Pulse Synthesis**:
  - Generate a synchronized, tension-building double pulse ("BAM BAM!") heartbeat/siren sound effect (`encounterAlert()`) using the Web Audio API.
  - Low-frequency sawtooth oscillator sweep (`120Hz -> 40Hz`) paired with a high-tension dissonant sine sweep (`320Hz -> 480Hz`).
- **Timing Gate**:
  - Display the warning overlay for exactly `1200ms`.
  - Stagger the transition to ensure the player fully absorbs the threat warning.
  - Transition to battle via `FX.shatter()` at the close of the warning window.

### 2. Cache Invalidation & PWA Stability
- **Cache Invalidations**: Increment PWA cache identity inside `sw.js` to `nexus-cache-v9.19` to force reloading of updated style vectors (`map.css`, `story-ui.css`) and script modules (`map-engine.js`, `cutscene.js`, `sprites.js`, `sfx.js`, `game.js`).

---

## 👥 Leveling Mechanics UI Clarification
- **EXP Interface Tooltip**: Add a small, high-contrast, low-opacity pixel-font hint label directly beneath the Party Menu experience bar:
  `Gain EXP by defeating enemies in battles to level up characters automatically. Upgrades stats (HP, MP, ATK, etc.).`
