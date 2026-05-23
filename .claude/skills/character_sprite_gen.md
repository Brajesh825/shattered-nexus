# Shattered Nexus: Character Sprite Art Specification (THE LAW)

Aethelgard uses a **Tiered Sprite System** to balance consistency and fidelity.

---

## I. THE TIERED SYSTEM
1. **Baseline (`_sprite.png`)**: **MUST** be in the **Flat & Clean** style. This is the mandatory requirement for all characters to ensure the game feels unified.
2. **Premium (`_sprite_1.png`)**: **OPTIONAL** high-fidelity upgrade in the **Illustrious Vivid** style. Used for special forms, PC releases, or "Ascendant" states.

---

## II. BASELINE STYLE: "FLAT & CLEAN" (MANDATORY)
**Goal**: Maximum readability, sharp lines, iconic JRPG feel.
- **Positive Anchors**: `(thin outlines:1.2), (flat color:1.3), source_anime, clean lines, (solid color:1.1), (high contrast:1.1), <lora:add-detail-xl:0.8>, refined features, detailed face, perfect anatomy `
- **Negative Anchors**: `sketchy, gradients, blurry, soft shading, painterly, watercolor, realistic, 3d, (soft lighting:1.2)`

weight : 0.40
Restyle 1x

---

## III. PREMIUM STYLE: "ILLUSTRIOUS VIVID" (UPGRADE)
**Goal**: Cinematic depth, high-budget anime feel, rich lighting.
- **Positive Anchors**: `<lora:add-detail-xl:0.8>, refined features, detailed face, perfect anatomy`
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

---

## VII. FACE DETAILER PROTOCOL (ADetailer)

> **When to use**: After any spritesheet generation — both Flat & Vivid tiers.
> **When to SKIP**: Map/chibi sheets (Section IV). Faces are too small (~10px) for reliable YOLO detection. Fix chibi faces manually or via inpaint brush instead.

### How It Works on a Spritesheet
ADetailer runs a YOLO face detection pass over the full sheet, finds **one bounding box per frame cell**, then crops → upscales → re-renders → pastes each face back independently. All 6 faces on a 2×3 combat sheet are fixed in a single pass.

---

### 🔧 Required Setup (one-time)
| Item | How to get it |
| :--- | :--- |
| **ADetailer extension** | A1111 → Extensions → Install from URL → `github.com/Bing-su/adetailer` |
| **`face_yolov8n.pt`** | Auto-downloads on first ADetailer use (Slot 1 — whole face) |
| **`eyes_yolov8n.pt`** | Auto-downloads from ADetailer model list (Slot 2 — eyes only) |

---

### ⚙️ Slot 1 — Face Pass (both tiers)

| Setting | Flat & Clean | Illustrious Vivid |
| :--- | :--- | :--- |
| **Model** | `face_yolov8n.pt` | `face_yolov8n.pt` |
| **Confidence** | `0.30` | `0.30` |
| **Mask padding** | `32 px` | `48 px` |
| **Denoising** | `0.35 – 0.45` | `0.45 – 0.55` |

**Slot 1 Prompt template** (customise per character):
```
(thin outlines:1.2), flat color, clean anime face,
[HAIR_COLOR] hair framing face, [EYE_COLOR] eyes,
sharp iris, (defined pupils:1.1), high contrast
```
**Slot 1 Negative**:
```
blurry, soft, realistic eyes, 3d, gradients, smudged, deformed face, extra eyes
```

For the **Vivid tier**, swap the positive to:
```
(detailed anime face:1.3), cinematic lighting on face,
[EYE_COLOR] glowing eyes, sharp iris, (complex eye detail:1.2),
soft rim light, high fidelity, [HAIR_COLOR] hair
```

---

### ⚙️ Slot 2 — Eyes Pass (runs after Slot 1)

| Setting | Value |
| :--- | :--- |
| **Model** | `eyes_yolov8n.pt` |
| **Confidence** | `0.25` (lower — eyes are tiny) |
| **Mask padding** | `16 px` |
| **Denoising** | `0.25 – 0.35` (gentle — just sharpening) |

**Slot 2 Prompt template** (reusable — swap colour only):
```
(detailed iris:1.3), (sharp pupils:1.2), (anime eye:1.2),
bright catch light, [EYE_COLOR] iris, perfect symmetry
```
**Slot 2 Negative**:
```
blurry iris, dull eyes, flat eyes, asymmetric, deformed pupils
```

---

### 📋 Per-Character Quick Reference

Fill this in for each character when building their concept doc:

```
Character : [NAME]
Eye colour : [e.g. crimson red / violet / teal]
Hair colour: [e.g. silver-white / dark navy / fiery orange]
Face marks : [scar / markings / none]
Slot 1 (+) : (thin outlines:1.2), flat color, clean anime face,
             [HAIR] hair, [EYE] eyes, sharp iris, defined pupils
Slot 2 (+) : detailed iris, bright catch light, [EYE] iris,
             sharp pupils, anime eye, perfect symmetry
```

---

### 🔁 Full Pipeline Order

```
txt2img / img2img  →  base spritesheet
        ↓
ADetailer Slot 1   →  face_yolov8n  (all 6 faces refined)
        ↓
ADetailer Slot 2   →  eyes_yolov8n  (all 6 eye pairs sharpened)
        ↓
Save as _sprite.png (Flat) or _sprite_1.png (Vivid)
```
