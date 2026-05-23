# Concept: Beta 1.1 Gameplay Quality, Tuning, and Cinematic Polish

## 📋 Identity
- **Ref**: `nexus-concept-beta-1.1-quality-polish-v1.0`
- **Status**: PROPOSED
- **Enforcing Personas**: The Curator (Gatekeeper), Aethon (Architect), Vivid (Aesthetics)

---

## 🎨 Creative & Aesthetic Specifications (Vivid)

### 1. Cinematic Weapon Acquisition UI Overlay
- **Layout & Visual Design**:
  - Full-screen glassmorphic modal with a radial backdrop gradient (`radial-gradient(circle, hsla(240, 30%, 10%, 0.95), hsla(240, 50%, 5%, 0.99))`) and custom backdrop blur.
  - Interactive popup card featuring a pulsing border, themed dynamically using HSL gradients matching the weapon's element (e.g. ice uses `#00ddff`, fire uses `#f97316`).
  - Pulsing background conic gradient light-sweep rotation (`conic-gradient`) around the weapon card to represent relic/breakthrough energy.
  - Ambient slow vertical floating micro-animation for the weapon icon.
- **Weapon Detail Cards**:
  - Grid-aligned display showing weapon stats, active passive skills (e.g. purple/violet HSL themed), and active character resonance details (pink HSL themed).
  - Explicit action button: `EQUIP WEAPON`.
  
### 2. Pre-Combat Boss Introductions
- **Boss Cast Registration**:
  - All boss chapters (e.g., `The Unmade Knight` in Arc 1, `The Ambush in the Undercroft` in Arc 2) will explicitly register the boss enemy name (e.g., `"Void Knight"`, `"Demon Lord"`) in their cutscene `"cast"` list.
  - Dialogue speaker tags will be updated from `"narrator"` to the respective boss name so their dialogue shows speaker cards in active HSL colors.
- **Portrait Pipeline Integration**:
  - Boss sprites will render as high-fidelity full-height portraits on the screen layer, dimming and lighting up in tandem with the party characters.

### 3. Widescreen Desktop Typography Scaling
- **Media Query Layout Enhancements**:
  - Automatically scale typography elements on display resolutions width >= 1024px to prevent readability strains.
  - **Tutorial Overlay**: Scale title to `24px` and text body to `17px` (line-height: 1.6).
  - **Cutscene/Boss Dialogue Panels**: Scale active dialogue text to `26px` (line-height: 1.7) and speaker label to `17px`.
  - **NPC Dialogue Panel**: Scale name to `16px` and dialogue body text to `20px` (line-height: 1.6).

### 4. Boss Defeat Impact (Shatter Flash)
- **Visual Feedback**:
  - The moment a boss enemy (Void Knight, Demon Lord, River King, Sunken Leviathan) is defeated (HP reaches 0), trigger a full-screen white flash overlay (`#ffffff` opacity transitioning rapidly).
  - Apply a camera shake effect (canvas translation offset or container shake class) for 0.5 seconds to convey heavy physical impact.
  - Apply a temporary slow-motion time-warp effect to the battle screen (delayed UI updates) to emphasize the defeat moment before showing the final reward logs.

---

## 🏗️ Engine & Technical Blueprints (Aethon)

### 1. Economy & Upgrade Material Drop Tuning
- **Gold Yield Scaling**:
  - Scale baseline gold drops with the enemy level using a level growth factor: `levelScale = 1 + (spawnLevel - 1) * 0.1`.
  - Apply a flat **2.5×** multiplier to all gold drops. This bridges the gap between typical 5–20 gold rewards and 2,500 gold ascension milestones.
- **Material Drop Optimization**:
  - In `_awardDrops`, increase Tier 1 drops to **75%** chance (was 50%) and Tier 2 drops to **35%** chance (was 15%).
- **Smooth Weapon Refining Costs**:
  - Re-tune refining cost scaling to prevent abrupt curves:
    - Level < 10: `level * 50` gold.
    - Level >= 10: `500 + (level - 10) * 150` gold.

### 2. Background Asset Preloading & SW Caching
- **Asset Preloading Registry**:
  - Add all missing high-fidelity battle backgrounds (`cavern_f1`, `cavern_f2`, `cavern_f3`, `ember_wastes`, `riverlands`, `sunken_temple`, `shadow_reach`, `void_citadel`, `eternal_void`, `guardian_arena`, `demon_lord_arena`) into `AssetPreloader`'s backgrounds list.
- **PWA Precaching**:
  - Register `riverlands.webp` and `sunken_temple.webp` in `SHELL_ASSETS` within `sw.js`.
  - Bump `CACHE_NAME` to invalidate stale cached styles.

### 3. Spawn Density & Chase Speed Tuning
- **Encounter Probability**:
  - Reduce tile step spawn probability from `0.08` to `0.035` (3.5% chance) to reduce encounter noise.
  - Increase grace period steps after completing battle from `4` / `8` to `10` / `12` steps.
- **Smart Patrol Chase Speed**:
  - Dynamically ramp up enemy patrol speed if player enters their aggro range:
    - Normal Chase Speed: `3.2` tiles/sec (was `2.0`).
    - Boss Chase Speed: `4.0` tiles/sec (was `2.5`).

### 4. Dynamic Cutscene Cast Assembly
- **Continuous Roster Cast Injection**:
  - Cutscene rendering engine will automatically capture currently unlocked party members (`G.party`) and the current speaker (if a playable character or registered enemy) and append them dynamically to the active chapter's `cast` array if not already present.
  - Fix `SpriteRenderer.setFrame` to resolve paths for enemy sprites (`images/enemies/${id}.webp`) if a character is not found in the player character sprite registry.

### 5. Post-Battle Boss Dialogue & Weapon Grants
- **State Buffer Lifecycle**:
  - Introduce `_lastEncountered` in `MapEntities` to buffer the active enemy reference.
  - Set `_lastEncountered` at collision check, and keep it active until the battle outcome resolves.
  - This ensures that boss weapon rewards (`chain_of_nights` and `tide_caller`) are successfully yielded to Rei and Lulu upon battle victory instead of returning `null` due to early state teardown.
- **No Rechallenge Restriction**:
  - **One-Time Only**: Both `river_king` and `sunken_leviathan` are strictly one-time map battles in this version.
  - **Permanent Removal**: Once the weapon is granted, the boss entity is permanently removed from the map state. Rechallenging them is not an option; they do not respawn, and the interactive triggers for these fights disappear completely.
- **Weapon Grant Story Integration**:
  - After victory against the `river_king` and `sunken_leviathan`, before displaying the weapon acquisition card, play a customized in-game dialogue sequence.
  - **River King Dialogue**:
    - *narrator*: "The River King sinks back into the depths of the waterfall. As the mist clears, a heavy, dark iron chain lies coiled on the stone altar, pulsing with wind resonance."
    - *Rei*: "This... is the Chain of Ten Thousand Nights. It was forged in the deep vaults of Aethalgard before the corruption."
    - *Aya*: "It responds to your resonance, Rei. It has been waiting for someone who carries your weight."
    - *Rei*: "Then I will carry it. Its balance is familiar."
  - **Sunken Leviathan Dialogue**:
    - *narrator*: "The Leviathan retreats into the abyssal trench. As the water calms, a glowing staff of blue driftwood floats to the surface, surrounded by pristine tide bubbles."
    - *Lulu*: "The Tide Caller... I can feel the memories of the old priests inside it. It's warm, despite the deep water."
    - *Tao*: "It likes you, Lulu! The tide spirits are dancing around your feet. That's a good sign."
    - *Lulu*: "I will carry their memories. They won't be forgotten."

### 6. Boss Defeat Impact Integration
- **Combat Victory Hook**:
  - In the battle outcome logic (`js/game.js`), check if any defeated enemy is a boss (e.g. `isBoss` or tier checks).
  - If a boss is defeated, trigger a rapid CSS class addition for a fullscreen whiteout overlay (`#battle-screen .shatter-flash` or similar overlay) and initiate a 500ms screen shake animation.
  - Delay the display of the leveling-up, items/relic logs, and map-return sequence to ensure the flash and screen shake complete.
