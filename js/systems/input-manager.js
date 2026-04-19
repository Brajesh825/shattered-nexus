/**
 * input-manager.js — Unified Keyboard & Gamepad (Controller) system.
 * Translates low-level inputs into high-level "Intents".
 */
const Input = (() => {
  const _keys = {};
  const _intents = {
    UP: false, DOWN: false, LEFT: false, RIGHT: false,
    CONFIRM: false, BACK: false, MENU: false, TAB: false,
    TOGGLE_FOCUS: false,
    X: 0, Y: 0 // Axis movement for map
  };
  
  // Track "Just Pressed" state for menu navigation
  const _justPressed = {};
  const _prevIntents = {};

  function init() {
    window.addEventListener('keydown', e => {
      _keys[e.key] = true;
      // Global prevention for arrow keys/tab to avoid scrolling/browser defaults
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.key)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', e => { _keys[e.key] = false; });
    
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

    const kbUp    = _keys['ArrowUp']    || _keys['w'] || _keys['W'];
    const kbDown  = _keys['ArrowDown']  || _keys['s'] || _keys['S'];
    const kbLeft  = _keys['ArrowLeft']  || _keys['a'] || _keys['A'];
    const kbRight = _keys['ArrowRight'] || _keys['d'] || _keys['D'];

    _intents.X = stickX || (kbRight ? 1 : (kbLeft ? -1 : 0));
    _intents.Y = stickY || (kbDown  ? 1 : (kbUp   ? -1 : 0));

    // 2. Discrete Intents
    _intents.UP    = _intents.Y < -0.5;
    _intents.DOWN  = _intents.Y > 0.5;
    _intents.LEFT  = _intents.X < -0.5;
    _intents.RIGHT = _intents.X > 0.5;

    // Buttons
    _intents.CONFIRM = _keys['Enter'] || _keys[' '] || (gp?.buttons[0]?.pressed); // A / Cross
    _intents.BACK    = _keys['Escape'] || _keys['Backspace'] || (gp?.buttons[1]?.pressed); // B / Circle
    _intents.MENU    = _keys['m'] || _keys['M'] || (gp?.buttons[9]?.pressed); // Start / Options
    _intents.TAB     = _keys['Tab'] || (gp?.buttons[5]?.pressed); // R1 / RB
    // Use code 'Backquote' for reliability across keyboard layouts
    _intents.TOGGLE_FOCUS = _keys['`'] || _keys['~'] || _keys['Backquote'] || (gp?.buttons[8]?.pressed); 

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
    isDown: (intent) => _intents[intent],
    justPressed: (intent) => _justPressed[intent],
    getAxis: () => ({ x: _intents.X, y: _intents.Y })
  };
})();

// Self-init if loaded early
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Input.init());
} else {
  Input.init();
}
