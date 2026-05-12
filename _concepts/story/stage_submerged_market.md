# 🌊 Stage Concept: The Submerged Market (`sunken_temple`)

## 📖 Narrative Foundation & Source of Truth
* **Primary Source**: `data/lore_fragments.json`
* **Target Fragments**: 
  - `world_tide_water_market` (Fragment #51)
  - `temple_water_market` (Fragment #411)
* **Authoritative Text**:
  > *"The broad stone platforms of the Sunken Temple — now submerged and patrolled by corrupted creatures — were a daily market. Iron rings hammered into the stone tied boats. Healers worked from floating barges. Vendors called their prices across the water. The iron rings are still there, underwater. Some still have rope attached, half-dissolved. The party swims past them without knowing what they were. They look like decoration. They are a market that forgot to close."*

---

## 🎨 Visual Excellence & Layout Architecture (Vivid's Standards)

### 1. The Strict 50/50 Frame Rule
Conforming absolutely to Vivid's Stage Standards, the background frame layout must adhere to a strict horizontal split exactly in the center:
* **Top 50% (Atmosphere/Horizon)**: Massive, wet ancient pillars carved with Tide-Priest wave motifs rising toward a vaulted, deep-sea ceiling. Shimmering turquoise light filters downward through overhead aqueduct cracks, casting volumetric light rays across the abandoned space.
* **Bottom 50% (Combat Interactivity Floor)**: A completely flat, straight, solid stone walking platform spanning horizontally across the entire width of the viewport. This serves as level ground for the side-view combat character sprites to anchor and walk firmly upon. The flat pavement is layered beneath paper-thin shallow saltwater puddles reflecting the upper ambient light, with rusted iron mooring rings embedded directly into the solid walking floor.

### 2. Premium Lighting & HSL Palette Tokens
* **Primary Ambient Tone**: Deep Submerged Teal (`hsl(185, 75%, 15%)`) providing high-contrast shadowing for razor-thin combat sprite lineart.
* **Volumetric Highlights**: Aquamarine Ray Highlights (`hsl(170, 85%, 60%)`) intersecting the central focal plane.
* **Sub-Surface Mooring Rings**: Corroded Bronze Glow (`hsl(35, 60%, 40%)`) casting subtle bottom-lit caustics onto the platform floor.

### 3. Dynamic Micro-Animations (CSS/Canvas Overlay Blueprint)
* **Water Surface Ripples**: Smooth, overlapping sine-wave displacement filters acting on the lower 50% layer boundary to convey gentle tide movement.
* **Drifting Bubbles Engine**: Procedurally spawned lightweight particle buffers moving upward with subtle horizontal swaying following a `cubic-bezier(0.4, 0, 0.2, 1)` easing curve.

---

## ⚙️ Combat Engine & Trigger Integration

### Stage Identifier Mapping
```javascript
// Target Registration inside BattleUI.BOSS_CONFIG or Map Data Configs
export const SUBMERGED_MARKET_CONFIG = {
  stageId: "stage_submerged_market",
  regionKey: "sunken_temple",
  bgmKey: "bgm_sunken_depths",
  ambientSfx: "sfx_tide_lapping",
  visualSplitRatio: 0.5, // Enforces 50% baseline collision layer boundary
  lightingOverlay: "hsl(185, 80%, 20%, 0.35)", // Cinematic tinting
};
```

---

## 🛡️ Pipeline Authorization Check-offs
- [x] Sourced directly from authenticated collection records (`data/lore_fragments.json`).
- [x] Staged inside `_concepts/story/` staging boundary.
- [x] Preview Asset Demonstration generated via Gemini AI Engine.
- [ ] Final Stage Blessing by **The Curator** & **Vivid** prior to full production binary import into `images/stages/`.
