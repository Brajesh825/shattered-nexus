# 🎮 Concept Blueprint: Interactive Tutorial & Control Overlay
**Authors**: Vivid (Aesthetics) & Aethon (Systems & Mechanics)  
**Status**: DRAFT (Review and Approval Phase)

---

## 🎨 1. The Design Vision (Vivid)

Shattered Nexus is a premium, atmospheric experience. Traditional text popup tutorials break immersion and feel dated. Our vision is a **Vivid Glassmorphism Overlay** that feels integrated into the world:

* **Curved Glassmorphism Paneling**: Light, frosted panels utilizing `backdrop-filter: blur(16px)` and ultra-thin white borders (`1px solid rgba(255, 255, 255, 0.15)`) to keep the underlying game map beautifully visible.
* **Animated SVG Keycaps**: Realistic keyboard keys and gamepad buttons that light up with custom keydown/keyup animations that mirror the player's physical input.
* **Aura HSL Glows**: Soft drop shadows utilizing character colors (e.g., Ice Blue for Aya, Fire Orange for Tao) that pulse depending on who is talking or what mechanic is described.
* **Non-Disruptive Transitioning**: Smooth slide-and-fade entries utilizing `cubic-bezier(0.16, 1, 0.3, 1)` transitions for premium responsiveness.

```
+-----------------------------------------------------------+
|                                                           |
|    🎮 TUTORIAL: MOVEMENT & EXPLORATION                    |
|                                                           |
|    Use the keyboard or gamepad stick to navigate:         |
|                                                           |
|         [ W ]                     ( L-Stick )             |
|     [ A ][ S ][ D ]    -- or --     D-PAD                 |
|                                                           |
|    *Press keys to see them light up in real-time!*        |
|                                                           |
|    +-------------------------------------------------+    |
|    | ❄️ Aya: "We must move forward. The ruins lie   |    |
|    |          just beyond this ridge."               |    |
|    +-------------------------------------------------+    |
|                                                           |
+-----------------------------------------------------------+
```

---

## ⚙️ 2. Systems & Mechanics Architecture (Aethon)

The tutorial is split into three context-aware **Phases** designed to onboard new players without overwhelming them.

### Phase A: The Arrival (Summoning Grounds)
* **Trigger**: Fires immediately on entering the first map (`map-verdant-vale.js` or summoning ruins).
* **Focus**: Basic exploration.
* **Challenge**: Interactive movement sandbox. Players must walk 4 steps in each direction and press the `CONFIRM` key (`Enter` / `Space` / `Cross`) on a glowing relic pillar to unlock the rest of the map.

### Phase B: Battle Basics & Vanguard Rules (First Encounter)
* **Trigger**: Fires at the start of the first combat sequence.
* **Focus**: Position shielding and element application.
* **Challenge**: Displays the **Vanguard Rule** (the leftmost active slot absorbs single-target hits). Shows how elements apply to units, outlining how auras stick to targets for elemental combos.

### Phase C: Elements & Reactions (Echoing Caverns)
* **Trigger**: Fires when a character first lands an elementally aligned strike.
* **Focus**: Triggering Reactions.
* **Challenge**: Displays a reactive flowchart demonstrating:
  * ❄️ + 🔥 = **Melt** (Extra Amplified Damage)
  * ❄️ + 🌀 = **Swirl / Shatter** (DEF shred & crowd control)

---

## 🛠️ 3. Proposed Implementation Draft

Below is the complete, proposed UI layout structure and controller code. It can be injected directly into the game shell to handle overlay rendering, input mapping, and custom key animation.

### 📄 HTML Overlay Shell (to be appended to `index.html`)
```html
<div id="tutorial-overlay" class="tut-overlay" style="display: none;">
  <div class="tut-card glass-panel">
    <button class="tut-close-btn" onclick="TutorialSystem.close()">&times;</button>
    <div class="tut-header">
      <span class="tut-icon">🎮</span>
      <span class="tut-title">Movement & Exploration</span>
    </div>
    
    <div class="tut-body">
      <p class="tut-text">Use your keyboard or primary gamepad stick to navigate Aethoria:</p>
      
      <!-- Keycap Playground -->
      <div class="tut-playground">
        <div class="keyboard-wrap">
          <div class="keycap" data-key="w">W</div>
          <div class="keycap-row">
            <div class="keycap" data-key="a">A</div>
            <div class="keycap" data-key="s">S</div>
            <div class="keycap" data-key="d">D</div>
          </div>
        </div>
        <div class="separator-or">or</div>
        <div class="gamepad-wrap">
          <div class="gp-axis-analog">
            <div class="gp-analog-stick"></div>
          </div>
          <div class="gp-label">L-Stick / D-Pad</div>
        </div>
      </div>

      <p class="tut-subtext">Press any directional key above to see it light up!</p>
    </div>

    <!-- Character Dialogue Tip Box -->
    <div class="tut-dialogue-box dialogue-glow-aya">
      <div class="tut-avatar">❄️</div>
      <div class="tut-msg-content">
        <div class="tut-speaker">Aya</div>
        <div class="tut-msg">"Our worlds are fracturing. Let us stick together and cross the forest ahead."</div>
      </div>
    </div>

    <div class="tut-footer">
      <button class="camp-btn" onclick="TutorialSystem.close()">Begin Adventure</button>
    </div>
  </div>
</div>
```

### 🎨 CSS Styling (to be appended to `css/party-menu.css` or equivalent)
```css
.tut-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(10, 8, 16, 0.75);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.tut-card {
  width: 90%;
  max-width: 480px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(25, 20, 35, 0.85), rgba(15, 25, 35, 0.85));
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 
              0 0 30px rgba(125, 211, 252, 0.15); /* Aya Ice-glow default */
  padding: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tut-close-btn {
  position: absolute;
  top: 16px; right: 16px;
  background: none; border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 24px; cursor: pointer;
  transition: color 0.2s;
}
.tut-close-btn:hover { color: #fff; }

.tut-header {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
}
.tut-title {
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 0.5px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.tut-playground {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 20px 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Keycaps Style */
.keycap {
  width: 40px; height: 40px;
  background: linear-gradient(180deg, #374151, #1f2937);
  border: 1px solid #4b5563;
  border-radius: 6px;
  color: #d1d5db;
  text-align: center;
  line-height: 38px;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 4px 0 #111827;
  transition: all 0.08s;
  user-select: none;
}
.keycap.active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #111827;
  background: linear-gradient(180deg, var(--sky, #38bdf8), #0284c7);
  border-color: #7dd3fc;
  color: #fff;
}

.keyboard-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.keycap-row {
  display: flex;
  gap: 4px;
}

.separator-or {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.3);
  font-style: italic;
}

/* Dialogue Box Glows */
.tut-dialogue-box {
  display: flex;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.25);
  border-left: 4px solid #fff;
  transition: all 0.3s ease;
}
.dialogue-glow-aya { border-left-color: #7dd3fc; box-shadow: inset 0 0 10px rgba(125, 211, 252, 0.1); }
.dialogue-glow-tao { border-left-color: #ef4444; box-shadow: inset 0 0 10px rgba(239, 68, 68, 0.1); }

.tut-avatar {
  font-size: 1.8rem;
}
.tut-speaker {
  font-weight: bold;
  font-size: 0.9rem;
  color: #f3f4f6;
  margin-bottom: 2px;
}
.tut-msg {
  font-size: 0.85rem;
  line-height: 1.4;
  color: #d1d5db;
}
```

### 🧠 4. Javascript Controller (Draft `js/systems/tutorial-manager.js`)
```javascript
/**
 * tutorial-manager.js
 * Tracks tutorial stages, captures input keys for real-time overlay feedback,
 * and highlights active systems.
 */
const TutorialSystem = (() => {
  let _activeStage = null;
  let _isOpen = false;

  const STAGES = {
    explore: {
      title: "Movement & Exploration",
      text: "Use keyboard directional keys or your controller to move:",
      dialogue: {
        char: "Aya",
        avatar: "❄️",
        msg: "The road ahead is scarred by the Rift. Let's tread carefully.",
        class: "dialogue-glow-aya"
      }
    },
    vanguard: {
      title: "Combat: The Vanguard Shield",
      text: "Single-target attacks are intercepted by your front-most character (Vanguard slot). Keep them healthy!",
      dialogue: {
        char: "Sera",
        avatar: "🛡️",
        msg: "I will hold the front line. Focus on your strikes!",
        class: "dialogue-glow-aya"
      }
    }
  };

  function init() {
    // Listen to real key presses when the tutorial is visible
    window.addEventListener('keydown', e => {
      if (!_isOpen) return;
      const key = e.key.toLowerCase();
      const cap = document.querySelector(`.keycap[data-key="${key}"]`);
      if (cap) cap.classList.add('active');
    });

    window.addEventListener('keyup', e => {
      if (!_isOpen) return;
      const key = e.key.toLowerCase();
      const cap = document.querySelector(`.keycap[data-key="${key}"]`);
      if (cap) cap.classList.remove('active');
    });
  }

  function show(stageId) {
    const stage = STAGES[stageId];
    if (!stage) return;

    _activeStage = stageId;
    _isOpen = true;

    // Pause player explore or turn manager actions
    if (typeof MapEngine !== 'undefined') MapEngine.stop();

    // Populate DOM
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) {
      overlay.querySelector('.tut-title').textContent = stage.title;
      overlay.querySelector('.tut-text').textContent = stage.text;
      
      const dBox = overlay.querySelector('.tut-dialogue-box');
      dBox.className = `tut-dialogue-box ${stage.dialogue.class}`;
      overlay.querySelector('.tut-avatar').textContent = stage.dialogue.avatar;
      overlay.querySelector('.tut-speaker').textContent = stage.dialogue.char;
      overlay.querySelector('.tut-msg').textContent = stage.dialogue.msg;

      overlay.style.display = 'flex';
    }
  }

  function close() {
    _isOpen = false;
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.style.display = 'none';

    // Resume player explore
    if (typeof MapEngine !== 'undefined') MapEngine.resume();
  }

  return { init, show, close };
})();

// Auto-init on launch
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => TutorialSystem.init());
} else {
  TutorialSystem.init();
}
```

---

## 💬 5. Next Steps & Action Request

To proceed, we seek the Council's approval on the following decisions:
1. **Interactive Sandbox Consent**: Do you agree to add the movement sandbox block in the Summoning Grounds of Arc 1?
2. **Visual Palette Harmony**: Shall we customize the Dialogue Tip glows dynamically based on whichever character gives the hint?

Let us know, and we will hook this up in a unified, beautifully styled rollout!
