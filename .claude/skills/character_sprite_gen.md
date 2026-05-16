# Shattered Nexus: Character Sprite Art Specification (THE LAW)

Aethelgard uses a **Tiered Sprite System** to balance consistency and fidelity.

---

## I. THE TIERED SYSTEM
1. **Baseline (`_sprite.png`)**: **MUST** be in the **Flat & Clean** style. This is the mandatory requirement for all characters to ensure the game feels unified.
2. **Premium (`_sprite_1.png`)**: **OPTIONAL** high-fidelity upgrade in the **Illustrious Vivid** style. Used for special forms, PC releases, or "Ascendant" states.

---

## II. BASELINE STYLE: "FLAT & CLEAN" (MANDATORY)
**Goal**: Maximum readability, sharp lines, iconic JRPG feel.
- **Positive Anchors**: `(thin outlines:1.2), (flat color:1.3), source_anime, clean lines, (solid color:1.1), (high contrast:1.1)`
- **Negative Anchors**: `sketchy, gradients, blurry, soft shading, painterly, watercolor, realistic, 3d, (soft lighting:1.2)`

weight : 0.40
Restyle 1x

---

## III. PREMIUM STYLE: "ILLUSTRIOUS VIVID" (UPGRADE)
**Goal**: Cinematic depth, high-budget anime feel, rich lighting.
- **Positive Anchors**: `(illustrious vivid:1.2), (vivid anime style:1.3), rich lighting, detailed gradients, cinematic anime, <lora:add-detail-xl:0.8>, refined features, detailed face, perfect anatomy`
- **Negative Anchors**: `blurry, lowres, simple, flat, (sketchy:1.2), (messy:1.1)`

---

## IV. MAP SPRITE (CHIBI) STANDARDS
**Goal**: Iconic map presence, clear directional indicators, "Aya-Style" proportions.

### 1. The Grid (2x6)
- **Top Row**: Front View (3 frames: Idle, Step L, Step R) | Right View (3 frames).
- **Bottom Row**: Left View (3 frames) | Back View (3 frames).
- **Format**: 2048x1024 total canvas (approx. 341px per frame cell).

### 2. SD Proportions
- **Head-to-Body**: 1:1 or 1:1.2 ratio (Classic Chibi).
- **Eyes**: Enlarged and highly expressive.
- **Style**: Simplified **"Flat & Clean"** for map readability.
- **Silhouette**: Outsize key accessories (capes, weapons, hair-tails) for instant identification from a distance.

### 3. Anchors
- **Positive**: `(chibi style:1.4), (super deformed:1.3), (2x6 spritesheet:1.2), directional walking, 4-way view, (simplified anime:1.1)`
- **Negative**: `tall, realistic proportions, high detail, complex shading, messy backgrounds`
- **Negative Anchors**: `low contrast, flat shading, (dull colors:1.2), simple backgrounds, blurry faces`

weight : 0.40
Restyle 1x
---

## V. TECHNICAL SPECS (REQUIRED FOR BOTH)
1. **Layout**: 2 rows x 3 columns (Total 6 frames) for Combat, 2 rows x 6 columns for Map.
2. **Background**: Pure white.
3. **Facing**: Right (Standard).

---

## VI. THE UPGRADE WORKFLOW (FLAT TO DETAILED)
1. **Source**: Use the `_sprite.png` (Baseline Flat).
2. **Settings**: Run Img2Img at **0.4 - 0.5 Denoising Strength**.
3. **Prompt**: Combine the character's unique prompt with the **Premium Style** anchors.
4. **Output**: Save as `_sprite_1.png`.
