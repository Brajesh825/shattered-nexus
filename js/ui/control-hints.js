/**
 * control-hints.js — Contextual control hint bar.
 * Shows the active bindings for the current screen at the bottom of the viewport.
 * Hides on mouse/touch, reappears on any gamepad or keyboard input.
 */
const ControlHints = (() => {

  const HINT_SETS = {
    explore: [
      { key: '↕←→ / Stick', action: 'Move' },
      { key: 'X / A', action: 'Interact' },
      { key: 'Y / Start', action: 'Menu' },
      { key: 'Tab', action: 'Cycle Char' },
    ],
    battle: [
      { key: '↕ / Stick', action: 'Navigate' },
      { key: 'A / Enter', action: 'Confirm' },
      { key: 'B / Esc', action: 'Back' },
    ],
    menu: [
      { key: '↕ / Stick', action: 'Navigate' },
      { key: 'A / Enter', action: 'Select' },
      { key: 'B / Esc', action: 'Close' },
      { key: 'Start / M', action: 'Menu' },
    ],
    worldmap: [
      { key: 'Click / Tap', action: 'Select Node' },
      { key: 'Pinch', action: 'Zoom' },
    ],
  };

  let _el = null;
  let _visible = false;
  let _hideTimer = null;
  let _currentSet = 'explore';
  const _isTouch = window.matchMedia('(pointer: coarse)').matches;

  function init() {
    _el = document.getElementById('control-hints-bar');
    if (!_el) return;

    // Hide on mouse activity (not on touch devices)
    if (!_isTouchActive()) {
      window.addEventListener('mousemove', _hide);
    }
    // Hide on touch (player sees on-screen buttons instead)
    window.addEventListener('touchstart', _hide, { passive: true });

    // Show on keyboard or gamepad
    window.addEventListener('keydown', _showBriefly);
    _pollGamepad();
  }

  function setContext(name) {
    if (!HINT_SETS[name]) return;
    _currentSet = name;
    if (_visible) _render();
  }

  function _render() {
    if (!_el) return;
    const hints = HINT_SETS[_currentSet] || [];
    _el.innerHTML = hints.map(h =>
      `<span class="hint-item"><kbd>${h.key}</kbd> ${h.action}</span>`
    ).join('<span class="hint-sep">·</span>');
  }

  function _showBriefly() {
    if (_isTouchActive()) return;
    _show();
    clearTimeout(_hideTimer);
    _hideTimer = setTimeout(_hide, 4000);
  }

  function _show() {
    if (!_el || _visible) return;
    _render();
    _visible = true;
    _el.classList.add('visible');
  }

  function _hide() {
    if (!_el || !_visible) return;
    _visible = false;
    _el.classList.remove('visible');
  }

  function _pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (gp) {
      const anyPressed = gp.buttons.some(b => b.pressed) ||
        Math.abs(gp.axes[0]) > 0.3 || Math.abs(gp.axes[1]) > 0.3;
      if (anyPressed) _showBriefly();
    }
    requestAnimationFrame(_pollGamepad);
  }

  return { init, setContext };
})();
