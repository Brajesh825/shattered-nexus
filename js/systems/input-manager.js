/**
 * input-manager.js — Unified Keyboard & Gamepad (Controller) system.
 * Translates low-level inputs into high-level "Intents".
 */
const Input = (() => {
  const _keys = {};
  const _intents = {
    UP: false, DOWN: false, LEFT: false, RIGHT: false,
    CONFIRM: false, BACK: false, MENU: false, TAB: false,
    TOGGLE_FOCUS: false, SKIP_CUTSCENE: false,
    X: 0, Y: 0
  };

  const _justPressed = {};
  const _prevIntents = {};

  // Custom bindings — loaded from InputSettings or localStorage
  let _bindings = null;
  function _getBindings() {
    if (!_bindings) reloadBindings();
    return _bindings;
  }
  function reloadBindings() {
    if (typeof InputSettings !== 'undefined') {
      _bindings = InputSettings.getBindings();
    } else {
      _bindings = null;
    }
  }
  function _hasKey(intent) {
    const b = _getBindings();
    if (!b || !b[intent]) return false;
    return b[intent].keys.some(k => _keys[k]);
  }

  let _lastType = 'mouse';

  function init() {
    window.addEventListener('keydown', e => {
      _lastType = 'keyboard';
      _keys[e.key] = true;
      // Global prevention for arrow keys/tab to avoid scrolling/browser defaults
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.key)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', e => { _keys[e.key] = false; });
    
    window.addEventListener('mousemove', () => { _lastType = 'mouse'; }, { passive: true });
    window.addEventListener('mousedown', () => { _lastType = 'mouse'; }, { passive: true });

    // Start polling loop
    _poll();
  }

  function _poll() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0]; // Primary controller
    
    // Save previous state for "just pressed" detection
    Object.assign(_prevIntents, _intents);

    // 1. Directional Axis (Gamepad Stick or Keyboard WASD/Arrows)
    let stickX = 0, stickY = 0;
    if (gp && gp.axes.length >= 2) {
      stickX = gp.axes[0];
      stickY = gp.axes[1];
      // Deadzone
      if (Math.abs(stickX) < 0.2) stickX = 0;
      if (Math.abs(stickY) < 0.2) stickY = 0;
    }

    const kbUp    = _hasKey('UP');
    const kbDown  = _hasKey('DOWN');
    const kbLeft  = _hasKey('LEFT');
    const kbRight = _hasKey('RIGHT');

    _intents.X = stickX || (kbRight ? 1 : (kbLeft ? -1 : 0));
    _intents.Y = stickY || (kbDown  ? 1 : (kbUp   ? -1 : 0));

    // Merge analog stick + D-pad (buttons 12=Up 13=Down 14=Left 15=Right)
    _intents.UP    = _intents.Y < -0.5 || !!(gp?.buttons[12]?.pressed);
    _intents.DOWN  = _intents.Y > 0.5  || !!(gp?.buttons[13]?.pressed);
    _intents.LEFT  = _intents.X < -0.5 || !!(gp?.buttons[14]?.pressed);
    _intents.RIGHT = _intents.X > 0.5  || !!(gp?.buttons[15]?.pressed);

    _intents.CONFIRM        = _hasKey('CONFIRM')        || !!(gp?.buttons[0]?.pressed);
    _intents.BACK           = _hasKey('BACK')           || !!(gp?.buttons[1]?.pressed);
    _intents.MENU           = _hasKey('MENU')           || !!(gp?.buttons[9]?.pressed);
    _intents.TAB            = _hasKey('TAB')            || !!(gp?.buttons[5]?.pressed);
    _intents.TOGGLE_FOCUS   = _hasKey('TOGGLE_FOCUS')   || !!(gp?.buttons[8]?.pressed);
    _intents.SKIP_CUTSCENE  = _hasKey('SKIP_CUTSCENE')  || !!(gp?.buttons[3]?.pressed); // Y / Triangle

    // Detect "Just Pressed" (rising edge)
    for (const key in _intents) {
      if (typeof _intents[key] === 'boolean') {
        _justPressed[key] = _intents[key] && !_prevIntents[key];
      }
    }

    requestAnimationFrame(_poll);
  }

  return {
    init,
    reloadBindings,
    isDown: (intent) => _intents[intent],
    justPressed: (intent) => _justPressed[intent],
    getAxis: () => ({ x: _intents.X, y: _intents.Y }),
    lastType: () => _lastType
  };
})();

// Self-init if loaded early
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Input.init());
} else {
  Input.init();
}
