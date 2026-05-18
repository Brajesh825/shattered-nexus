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
      dialogue: {
        char: "Aya",
        avatar: "❄️",
        msg: "The forest ahead is dense and full of surprises. Let's stick together and keep our eyes open.",
        class: "dialogue-glow-aya"
      }
    },
    vanguard: {
      title: "Combat: The Vanguard Shield",
      text: "The front-most character (Vanguard slot) intercepts single-target physical strikes. Protect them!",
      dialogue: {
        char: "Sera",
        avatar: "🛡️",
        msg: "I will hold the front line. Focus on elemental strikes and coordinate our resources!",
        class: "dialogue-glow-aya"
      }
    },
    reactions: {
      title: "Tactics: Elemental Reactions",
      text: "Striking a foe with elementally opposing forces triggers Reactions (like Melt, Shatter, Swirl, or Stun)!",
      dialogue: {
        char: "Rei",
        avatar: "🌀",
        msg: "An enemy coated in auras is extremely vulnerable. Pierce their defenses with elemental harmony!",
        class: "dialogue-glow-rei"
      }
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
      
      // Auto-save save game state
      if (typeof Save !== 'undefined' && typeof G !== 'undefined') {
        const slot = Save.getActiveSlot ? Save.getActiveSlot() : 0;
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
