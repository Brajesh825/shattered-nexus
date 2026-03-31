# Animation System for Moves - Complete Guide

## Overview
The animation system is built on three layers:
1. **Actor Animation** - Applied to the attacker's sprite
2. **Effect Overlay** - Visual element effect displayed on the target
3. **Target Reactions** - Damage flash and shake effects on the target

---

## 1. ACTOR ANIMATIONS (Party Member Sprite)

### Attack Animation
- **Class:** `.anim-slash`
- **Element Class:** `.element-physical`
- **Duration:** 460ms
- **Keyframes:** `heroSlash` - translates sprite right 64px with 1.12x horizontal scale
- **Timing:** Applied immediately, removed after 460ms
- **Sound:** SFX.attack() at time 0, SFX.enemyHit() at time 80ms

```javascript
// Applied in heroAttack()
actorSpr.classList.add('anim-slash');
actorSpr.classList.add('element-physical');
// Removed after 460ms
setTimeout(() => {
  actorSpr.classList.remove('anim-slash');
  actorSpr.classList.remove('element-physical');
}, 460);
```

### Ability Animation - Regular
- **Class:** `.anim-cast`
- **Element Class:** `.element-{element}` (ice, fire, wind, electric, water, light, dark)
- **Duration:** 560ms
- **Keyframes:** `castAnim` - scales (1→1.14→0.92→1) and rotates (-8°→5°)
- **Timing:** Applied immediately, removed after 560ms

### Ability Animation - Ultimate
- **Class:** `.anim-ultimate`
- **Element Class:** `.element-{element}`
- **Duration:** 800ms
- **Keyframes:** `ultimateCast` - larger scale transformation (1→1.2→0.95→1.1→1) with 10° rotation
- **Timing:** Applied immediately, removed after 800ms

```javascript
// Applied in heroAbility()
const isUltimate = ab.isUltimate || false;
const animDuration = isUltimate ? 800 : 560;

spr.classList.add(isUltimate ? 'anim-ultimate' : 'anim-cast');
spr.classList.add(`element-${element}`);
setTimeout(() => {
  spr.classList.remove(isUltimate ? 'anim-ultimate' : 'anim-cast');
  spr.classList.remove(`element-${element}`);
}, animDuration);
```

---

## 2. EFFECT OVERLAYS (Visual Effects on Target)

The `createEffectOverlay()` function displays element-specific visual effects on the target sprite.

### Element-Specific Animations
Each element has a unique CSS keyframe animation that applies brightness, saturation, hue-rotation, and filter effects:

| Element | Animation | Effect |
|---------|-----------|--------|
| `fire` | `fireFlare` | Brightness spike (1→1.4→1.2→1), saturation increase |
| `ice` | `iceShimmer` | Brightness spike (1→1.3→1), hue-rotate 200° |
| `wind` | `windSwirl` | Rotation (0→6°→0), scale (1→1.05→1) |
| `electric` | `sparkFlash` | Brightness spike (1→1.5→1), drop-shadow 12px |
| `water` | `waterRipple` | Brightness spike (1→1.2→1), hue-rotate 10° |
| `light` | `lightBurst` | Brightness spike (1→1.6→1), drop-shadow 20px |
| `dark` | `darkPulse` | Brightness dip (1→0.9→1), drop-shadow 16px |
| `physical` | `heroSlash` | Same as actor slash |

### Animation Duration Mapping
```javascript
const durations = {
  'ice': 600, 'fire': 650, 'wind': 600, 'electric': 500,
  'water': 600, 'light': 700, 'dark': 650, 'physical': 500,
  'cryoclasm': 3000,
  'guide_to_afterlife': 3000,
  'hajras_hymn': 3000,
  'mastery_of_pain': 3000
};
```

### Ultimate-Specific Overlays
Ultimate abilities have special CSS classes:
- `cryoclasm` - Massive ice effect
- `guide_to_afterlife` - Soul fire effect
- `hajras_hymn` - Star blessing effect
- `mastery_of_pain` - Karmic wind effect

These map to special CSS animations defined with `ultimateCast` keyframes.

### Effect Overlay Positioning
The overlay is positioned relative to the target sprite with special offset handling:

```javascript
const offset = abilityId === 'cryoclasm' ? 0 : 8;      // 0 for large ultimates
const topOffset = abilityId === 'cryoclasm' ? -30 : -10; // -30 for large ultimates

overlay.style.left = (rect.left - sceneRect.left + offset) + 'px';
overlay.style.top = (rect.top - sceneRect.top + topOffset) + 'px';
```

### Effect Overlay Structure
```javascript
const overlay = document.createElement('div');
overlay.className = `effect-overlay element-${element}`;
overlay.style.cssText = `
  position: absolute;
  width: 64px; height: 64px;
  animation: ${animationName} ${duration}ms ease-out;
`;
```

---

## 3. TARGET REACTIONS

### Damage Flash
- **Class:** `.sprite-damage-flash`
- **Duration:** 200ms
- **Effect:** Visual flash to indicate damage taken
- **Applied:** After damage is calculated
- **Removed:** Automatically after 200ms

```javascript
const enemySpr = document.getElementById('espr-' + G.targetEnemyIdx);
if (enemySpr) {
  enemySpr.classList.add('sprite-damage-flash');
  setTimeout(() => enemySpr.classList.remove('sprite-damage-flash'), 200);
}
```

### Sprite Shake
- **Function:** `shakeEnemy(targetIdx)`
- **Effect:** Applies `.shakeAnim` for visual impact
- **Keyframes:** `shakeAnim` - oscillates -9px to +9px horizontally
- **Applied:** After damage calculation
- **Duration:** Full animation duration

```javascript
// Shake applied after damage flash
shakeEnemy(G.targetEnemyIdx);
```

---

## 4. ANIMATION SEQUENCE TIMING

### Physical Attack Sequence
```
t=0ms:   Apply .anim-slash to actor sprite
t=0ms:   Play SFX.attack()
t=80ms:  Play SFX.enemyHit()
t=460ms: Actor animation ends
t=460ms: Damage calculation & effects applied
t=460ms: Effect overlay created
t=460ms: Enemy damage flash starts
t=660ms: Enemy damage flash ends (200ms)
t=460ms: Enemy shake starts
t=700ms: Enemy shake ends + turn advances
t=860ms: Effect overlay removed (600ms duration)
```

### Magic Ability Sequence (Regular)
```
t=0ms:   Apply .anim-cast to actor sprite
t=0ms:   Play SFX.magic()
t=560ms: Actor animation ends
t=560ms: Damage calculation & effects applied
t=560ms: Effect overlay created
t=560ms: Enemy damage flash starts
t=760ms: Enemy damage flash ends
t=560ms: Enemy shake starts
t=800ms: Enemy shake ends + turn advances
t=1160ms: Effect overlay removed (600ms duration)
```

### Ultimate Ability Sequence
```
t=0ms:   Apply .anim-ultimate to actor sprite
t=0ms:   Play SFX.magic()
t=0ms:   Show channeling message
t=800ms: Actor animation ends
t=800ms: Effect overlay created (3000ms duration)
t=3000ms: DAMAGE APPLIED (delayed until animation completes!)
t=3000ms: Damage flash and shake applied
t=3800ms: Effect overlay removed
t=3800ms: Turn advances
```

**Special Note:** Ultimates delay damage application until the effect overlay animation is complete (3000ms), creating a dramatic impact moment.

---

## 5. CSS KEYFRAME DEFINITIONS

### Actor Animation Keyframes
```css
@keyframes heroSlash {
  0%   { transform: translateX(0) }
  45%  { transform: translateX(64px) scaleX(1.12) }
  100% { transform: translateX(0) }
}

@keyframes castAnim {
  0%   { transform: scale(1) rotate(0) }
  30%  { transform: scale(1.14) rotate(-8deg) }
  65%  { transform: scale(0.92) rotate(5deg) }
  100% { transform: scale(1) rotate(0) }
}

@keyframes ultimateCast {
  0%   { transform: scale(1) rotate(0deg); filter: brightness(1); }
  15%  { transform: scale(1.2) rotate(-8deg); filter: brightness(1.3) drop-shadow(0 0 20px rgba(255,255,255,0.8)); }
  50%  { transform: scale(1) rotate(8deg); }
  100% { transform: scale(1.1) rotate(0deg); filter: brightness(1) drop-shadow(0 0 12px rgba(255,255,255,0.5)); }
}
```

### Target Reaction Keyframes
```css
@keyframes shakeAnim {
  0%,100% { transform: translateX(0) }
  25%     { transform: translateX(-9px) }
  75%     { transform: translateX(9px) }
}

@keyframes fireFlare {
  0%   { filter: brightness(1) }
  30%  { filter: brightness(1.4) saturate(1.5) }
  70%  { filter: brightness(1.2) saturate(1.2) }
  100% { filter: brightness(1) }
}
```

---

## 6. ABILITY DATA STRUCTURE

Abilities are defined in `data/classes.json` with animation properties:

```json
{
  "id": "cryoclasm",
  "name": "Cryoclasm",
  "icon": "❄",
  "mp": 10,
  "type": "magic_damage",
  "isUltimate": true,
  "description": "Massive ice explosion — 3.0x magic damage",
  "effect": {
    "dmgMultiplier": 3.0,
    "element": "ice",
    "cooldown": 2
  }
}
```

**Key Fields for Animation:**
- `type` - Determines damage type (physical, magic_damage, heal, buff, debuff)
- `isUltimate` - Triggers 800ms actor animation + delayed damage
- `effect.element` - Determines effect overlay animation
- `effect.dmgMultiplier` - Scales damage output

---

## 7. ADDING NEW ANIMATIONS

### To Add a New Ability Animation:
1. Define the ability in `data/classes.json` with `element` and `isUltimate` properties
2. CSS animation already exists for most elements
3. If creating a new element, add CSS keyframes to `css/style.css`:

```css
@keyframes newElementEffect {
  0%   { filter: brightness(1) }
  50%  { filter: brightness(1.5) /* your effect */ }
  100% { filter: brightness(1) }
}

.effect-overlay.element-newtype {
  animation: newElementEffect 600ms ease-out;
}
```

4. Update duration mapping in `game.js` if needed

### To Modify Existing Animations:
- **Actor animation speed:** Change duration constant (460ms, 560ms, 800ms)
- **Effect visual:** Modify CSS keyframes in `style.css`
- **Effect duration:** Update `durations` object in `createEffectOverlay()`
- **Ultimate delay:** Modify the 3000ms `setTimeout` in ultimate handling

---

## 8. QUICK REFERENCE TABLE

| Animation Type | Duration | Applied To | Trigger | Removal |
|---|---|---|---|---|
| Actor Slash | 460ms | Party sprite | Attack action | Automatic |
| Actor Cast | 560ms | Party sprite | Regular ability | Automatic |
| Actor Ultimate | 800ms | Party sprite | Ultimate ability | Automatic |
| Effect Overlay | 600-3000ms | Enemy sprite | Damage action | Automatic |
| Damage Flash | 200ms | Enemy sprite | After damage | Automatic |
| Enemy Shake | Varies | Enemy sprite | After damage | Synced with turn advance |

---

## 9. DEBUGGING TIPS

To verify animation states:
```javascript
// Check if animation is playing
console.log(element.classList); // Should show anim-cast, element-ice, etc.

// Check overlay duration
const overlay = document.querySelector('.effect-overlay');
console.log(overlay.style.animation); // Shows animation properties

// Monitor timing
console.time('attack');
// ... action happens
console.timeEnd('attack'); // Shows total duration
```

