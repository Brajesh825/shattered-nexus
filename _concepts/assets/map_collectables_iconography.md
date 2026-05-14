# Concept Blueprint: Universal Map Collectable Iconography & Multi-Frame Layout Engine Parity

## Core Directive
Establish custom high-fidelity pixel art game assets for regional lore fragments, quest offerings, and interactive environmental nodes within the Shattered Nexus layout framework. Sourced directly from our persistent design requirements, this blueprint eliminates generic placeholders (`offering_point.png`) in favor of dedicated, cel-shaded custom icon sets backed by a multi-directional 12-frame grid structure.

## Registered Target Assets
The following key items are formally incorporated into `data/npcs.js` and their authoritative sprite layouts are strictly anchored to the `1024x512` multi-frame standard:

1. **Holographic Log Orb** (`holographic_log_orb`)
   - **Visual Profile**: Translucent cyan crystalline orb on a dark carved pedestal emitting faint holographic light strings.
   - **Regional Integration**: Crystal Cavern F1 Archive terminal nodes.

2. **Ancient Tide Bell** (`ancient_tide_bell`)
   - **Visual Profile**: Rusted verdigris bronze sea bell covered in oceanic runes hanging from a simple cross-beam.
   - **Regional Integration**: Southern Isles deep channels.

3. **Toll Bridge Marker** (`toll_bridge_marker`)
   - **Visual Profile**: Weathered grey keystone pillar rising from green river weeds with glowing light cyan runes.
   - **Regional Integration**: Riverlands Crossing neutral domain.

4. **Bone Shard** (`bone_shard`)
   - **Visual Profile**: Jagged crystalline bone fragment radiating pure white marrow resonance.
   - **Regional Integration**: Bones of the Fallen mission scatterings.

5. **Silver Locket** (`silver_locket`)
   - **Visual Profile**: Open filigree silver locket containing a brilliantly glowing sapphire gemstone.
   - **Regional Integration**: Verdant Vale hidden memorial nodes.

6. **Squad Insignia** (`squad_insignia`)
   - **Visual Profile**: Heavy polished gold Vanguard winged-shield medal radiating faint dissipating golden light.
   - **Regional Integration**: Fallen Guard retrieval markers.

7. **Cursed Idol** (`cursed_idol`)
   - **Visual Profile**: Ancient tribal wood carving sealed with crimson void runic strips wrapped in wet river roots.
   - **Regional Integration**: River King ambient suppression triggers.

## Technical Execution & Canvas Occlusion Parity
Sourced directly from `MapEngine` execution boundaries, standalone square object icons are downsampled smoothly to `120x120` pixels using Lanczos resampling and mapped precisely across all twelve directional sub-frames (`170x256` slots) of an authoritative `1024x512` transparent canvas. 
- **Shadow Line Alignment**: Anchoring icons with a bottom offset of precisely `25px` pins them directly onto the standard floor tile shadow matrices without requiring layout slicing patches inside `js/map/map-entities.js`.
- **Dual-Asset Emission**: Both fully operational `.png` master matrices and highly compressed `_low.webp` low-weight versions are natively built and cached via client registration updates (`nexus-cache-v8.52`).
