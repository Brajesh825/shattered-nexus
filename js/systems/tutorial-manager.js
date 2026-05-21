/**
 * tutorial-manager.js — Interactive, glassmorphic tutorial overlay.
 * Coordinates input listening, real-time keycap animations, and dialogue prompts.
 */
const TutorialSystem = (() => {
  let _activeStage = null;
  let _isOpen = false;

  const STAGES = {
    explore: {
      title: "Movement & Exploration",
      text: "Navigate Aethoria using your keyboard or primary controller:",
      subtext: "Press directional keys to see them light up in real-time!",
      dialogue: {
        char: "Aya",
        avatar: "❄️",
        msg: "The forest ahead is dense and full of surprises. Let's stick together and keep our eyes open.",
        class: "dialogue-glow-aya"
      },
      playgroundHtml: `
          <div class="keyboard-wrap" style="display: flex; gap: 20px; justify-content: center; align-items: center;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div class="keycap" data-key="w">W</div>
              <div class="keycap-row" style="display: flex; gap: 4px;">
                <div class="keycap" data-key="a">A</div>
                <div class="keycap" data-key="s">S</div>
                <div class="keycap" data-key="d">D</div>
              </div>
            </div>
            <div class="separator-or">or</div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div class="keycap" data-key="↑">↑</div>
              <div class="keycap-row" style="display: flex; gap: 4px;">
                <div class="keycap" data-key="←">←</div>
                <div class="keycap" data-key="↓">↓</div>
                <div class="keycap" data-key="→">→</div>
              </div>
            </div>
          </div>
          <div class="separator-or" style="margin: 8px 0;">or</div>
          <div class="gamepad-wrap" style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <div class="gp-axis-analog">
              <div class="gp-analog-stick"></div>
            </div>
            <div class="gp-label" style="font-size: 10px; color: #64748b;">L-Stick / D-Pad</div>
          </div>
      `
    },
    vanguard: {
      title: "Combat: The Vanguard Shield",
      text: "The front-most character (Vanguard slot) intercepts single-target physical strikes. Protect them!",
      subtext: "",
      dialogue: {
        char: "Sera",
        avatar: "🛡️",
        msg: "I will hold the front line. Focus on elemental strikes and coordinate our resources!",
        class: "dialogue-glow-aya"
      },
      playgroundHtml: `
          <div class="tut-formation-grid" style="display: flex; flex-direction: column; gap: 12px; width: 100%; align-items: center; margin: 10px 0;">
            <div style="display: flex; gap: 24px; align-items: center; background: rgba(0,0,0,0.3); padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); width: 100%; box-sizing: border-box; justify-content: center;">
              <!-- Rearguard Slot 2 -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: 0.7;">
                <div style="width: 44px; height: 44px; border-radius: 50%; border: 2px dashed rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 20px; background: rgba(255,255,255,0.03);">🔮</div>
                <div style="font-size: 9px; font-weight: 700; color: #71717a; letter-spacing: 0.5px;">REAR 2</div>
              </div>
              
              <!-- Connection Line -->
              <div style="color: rgba(255,255,255,0.1); font-size: 12px;">◀</div>

              <!-- Rearguard Slot 1 (Protected) -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; border: 1px dashed rgba(236,72,153,0.2); padding: 4px; border-radius: 8px;">
                <div style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid #ec4899; display: flex; align-items: center; justify-content: center; font-size: 20px; background: rgba(236,72,153,0.1); box-shadow: 0 0 8px rgba(236,72,153,0.15);">🏹</div>
                <div style="font-size: 9px; font-weight: 700; color: #ec4899; letter-spacing: 0.5px;">REAR 1</div>
              </div>

              <!-- Connection Arrow with block shield -->
              <div style="color: #38bdf8; font-size: 16px; font-weight: bold; animation: pulse 1.5s infinite; display: flex; align-items: center; gap: 2px;">
                <span>🛡️</span>
                <span>◀</span>
              </div>

              <!-- Vanguard Slot (The Shield) -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 20px; background: rgba(56,189,248,0.15); box-shadow: 0 0 12px rgba(56,189,248,0.3);">⚔️</div>
                <div style="font-size: 9px; font-weight: 700; color: #38bdf8; letter-spacing: 0.5px;">VANGUARD</div>
              </div>
            </div>
            <div style="font-size: 11px; color: #94a3b8; text-align: center; max-width: 380px; line-height: 1.4;">
              Physical single-target attacks aimed at **Slot 1 (Rearguard 1)** are **automatically intercepted** by your Vanguard! Keep a high-defense hero in the front!
            </div>
          </div>
      `
    },
    reactions: {
      title: "Tactics: Elemental Reactions",
      text: "Striking a foe with elementally opposing forces triggers Reactions (like Melt, Shatter, Swirl, or Stun)!",
      subtext: "",
      dialogue: {
        char: "Rei",
        avatar: "🌀",
        msg: "An enemy coated in auras is extremely vulnerable. Pierce their defenses with elemental harmony!",
        class: "dialogue-glow-rei"
      },
      playgroundHtml: `
          <div class="tut-reactions-grid" style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin: 6px 0;">
            <!-- Melt Row -->
            <div style="display: flex; align-items: center; gap: 8px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.12); padding: 6px 12px; border-radius: 8px; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="background: rgba(239,68,68,0.15); border: 1px solid #ef4444; border-radius: 4px; padding: 2px 6px; font-size: 9px; color: #f87171; font-weight: bold; letter-spacing: 0.5px;">🔥 PYRO</span>
                <span style="color: #64748b; font-size: 10px;">+</span>
                <span style="background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; border-radius: 4px; padding: 2px 6px; font-size: 9px; color: #7dd3fc; font-weight: bold; letter-spacing: 0.5px;">❄️ CRYO</span>
              </div>
              <span style="color: #64748b; font-size: 10px;">➔</span>
              <span style="background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 11px; letter-spacing: 0.5px;">💥 MELT (+100% DMG)</span>
            </div>

            <!-- Shatter Row -->
            <div style="display: flex; align-items: center; gap: 8px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.12); padding: 6px 12px; border-radius: 8px; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; border-radius: 4px; padding: 2px 6px; font-size: 9px; color: #7dd3fc; font-weight: bold; letter-spacing: 0.5px;">❄️ CRYO</span>
                <span style="color: #64748b; font-size: 10px;">+</span>
                <span style="background: rgba(59,130,246,0.15); border: 1px solid #3b82f6; border-radius: 4px; padding: 2px 6px; font-size: 9px; color: #60a5fa; font-weight: bold; letter-spacing: 0.5px;">💧 HYDRO</span>
              </div>
              <span style="color: #64748b; font-size: 10px;">➔</span>
              <span style="background: linear-gradient(135deg, #a5f3fc, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 11px; letter-spacing: 0.5px;">🥶 SHATTER (STUN & CRIT)</span>
            </div>

            <!-- Swirl Row -->
            <div style="display: flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.12); padding: 6px 12px; border-radius: 8px; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; border-radius: 4px; padding: 2px 6px; font-size: 9px; color: #34d399; font-weight: bold; letter-spacing: 0.5px;">🌀 ANEMO</span>
                <span style="color: #64748b; font-size: 10px;">+</span>
                <span style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 2px 6px; font-size: 9px; color: #cbd5e1; font-weight: bold; letter-spacing: 0.5px;">ANY</span>
              </div>
              <span style="color: #64748b; font-size: 10px;">➔</span>
              <span style="background: linear-gradient(135deg, #34d399, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 11px; letter-spacing: 0.5px;">🌪️ SWIRL (AOE SHRED)</span>
            </div>
          </div>
          <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 4px; line-height: 1.4;">
            Elemental strikes apply corresponding element auras. Attacking with opposing elements triggers **devastating elemental reactions**!
          </div>
      `
    }
  };

  function init() {
    // Keyboard keycap lighting listeners
    window.addEventListener('keydown', e => {
      if (!_isOpen) return;
      const key = e.key.toLowerCase();
      // Match wasd keys or arrow keys
      let keyAttr = key;
      if (e.key === 'ArrowUp') keyAttr = '↑';
      else if (e.key === 'ArrowDown') keyAttr = '↓';
      else if (e.key === 'ArrowLeft') keyAttr = '←';
      else if (e.key === 'ArrowRight') keyAttr = '→';

      const cap = document.querySelector(`.keycap[data-key="${keyAttr}"]`);
      if (cap) cap.classList.add('active');
    });

    window.addEventListener('keyup', e => {
      if (!_isOpen) return;
      const key = e.key.toLowerCase();
      let keyAttr = key;
      if (e.key === 'ArrowUp') keyAttr = '↑';
      else if (e.key === 'ArrowDown') keyAttr = '↓';
      else if (e.key === 'ArrowLeft') keyAttr = '←';
      else if (e.key === 'ArrowRight') keyAttr = '→';

      const cap = document.querySelector(`.keycap[data-key="${keyAttr}"]`);
      if (cap) cap.classList.remove('active');
    });
  }

  let _rafId = null;

  function _startLoop() {
    _stopLoop();
    _loop();
  }

  function _stopLoop() {
    if (_rafId) {
      cancelAnimationFrame(_rafId);
      _rafId = null;
    }
  }

  function _loop() {
    if (!_isOpen) return;

    if (typeof Input !== 'undefined') {
      const axis = Input.getAxis ? Input.getAxis() : { x: 0, y: 0 };
      const stick = document.querySelector('.gp-analog-stick');
      if (stick) {
        const maxOffset = 8;
        const tx = (axis.x || 0) * maxOffset;
        const ty = (axis.y || 0) * maxOffset;
        stick.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;

        const axisRim = document.querySelector('.gp-axis-analog');
        if (axisRim) {
          if (Math.abs(axis.x || 0) > 0.2 || Math.abs(axis.y || 0) > 0.2) {
            axisRim.style.borderColor = '#38bdf8';
            axisRim.style.boxShadow = '0 0 12px rgba(56, 189, 248, 0.5), inset 0 1px 3px rgba(0,0,0,0.8)';
          } else {
            axisRim.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            axisRim.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.6)';
          }
        }
      }
    }

    _rafId = requestAnimationFrame(_loop);
  }

  function show(stageId) {
    const stage = STAGES[stageId];
    if (!stage) return;

    _activeStage = stageId;
    _isOpen = true;

    // Pause player explore movement
    if (typeof MapEngine !== 'undefined') MapEngine.stop();

    // Populate DOM dynamically
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) {
      overlay.querySelector('.tut-title').textContent = stage.title;
      overlay.querySelector('.tut-text').textContent = stage.text;
      
      const pg = overlay.querySelector('.tut-playground');
      if (pg && stage.playgroundHtml) {
        pg.innerHTML = stage.playgroundHtml;
      }
      
      const sub = overlay.querySelector('.tut-subtext');
      if (sub) {
        sub.textContent = stage.subtext || '';
        sub.style.display = stage.subtext ? 'block' : 'none';
      }

      const dBox = overlay.querySelector('.tut-dialogue-box');
      dBox.className = `tut-dialogue-box ${stage.dialogue.class || ''}`;
      overlay.querySelector('.tut-avatar').textContent = stage.dialogue.avatar;
      overlay.querySelector('.tut-speaker').textContent = stage.dialogue.char;
      overlay.querySelector('.tut-msg').textContent = stage.dialogue.msg;

      overlay.style.display = 'flex';
      
      // Hook up Focus system to the close button
      if (typeof Focus !== 'undefined') {
        Focus.setContext('tutorial-overlay');
      }
    }

    // Start physical controller feedback loop
    _startLoop();
  }

  function close() {
    _isOpen = false;
    _stopLoop();
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.style.display = 'none';

    // Persist as a viewed/fired scene to avoid duplicate triggers
    if (_activeStage) {
      const sceneId = 'tut_' + _activeStage;
      if (typeof MapEngine !== 'undefined' && MapEngine.fireScene) {
        MapEngine.fireScene(sceneId);
      } else if (typeof G !== 'undefined') {
        if (!G.firedScenes) G.firedScenes = new Set();
        G.firedScenes.add(sceneId);
      }

      // Layer 1 — standalone localStorage key, independent of save slots.
      // Survives slot switching, pre-save quits, and new game starts.
      try {
        const raw = localStorage.getItem('nexus_seen_tutorials');
        const seen = raw ? JSON.parse(raw) : [];
        if (Array.isArray(seen) && !seen.includes(sceneId)) {
          seen.push(sceneId);
          localStorage.setItem('nexus_seen_tutorials', JSON.stringify(seen));
        }
      } catch (e) { /* private mode / quota — silently ignore */ }

      // Layer 2 — existing save-slot persistence, using authoritative slot source.
      if (typeof Save !== 'undefined' && typeof G !== 'undefined' && Save.patch) {
        const slot = (typeof Story !== 'undefined' && Story._activeSlot !== undefined) ? Story._activeSlot : 0;
        Save.patch({ firedScenes: Array.from(G.firedScenes || []) }, slot);
      }
    }

    // Restore Focus context
    if (typeof Focus !== 'undefined') {
      Focus.setContext(null);
    }

    // Resume player explore movement
    if (typeof MapEngine !== 'undefined') MapEngine.resume();
  }

  return { init, show, close, isOpen: () => _isOpen };
})();

// Auto-bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => TutorialSystem.init());
} else {
  TutorialSystem.init();
}
