/**
 * input-settings.js — Controls Settings Overlay
 * Displays keyboard and gamepad bindings; allows keyboard remapping.
 * Persists custom bindings to localStorage under 'rpg_key_bindings'.
 */
const InputSettings = (() => {

  const STORAGE_KEY = 'rpg_key_bindings';

  const DEFAULT_BINDINGS = {
    UP:           { keys: ['ArrowUp', 'w'],       label: 'Move Up' },
    DOWN:         { keys: ['ArrowDown', 's'],      label: 'Move Down' },
    LEFT:         { keys: ['ArrowLeft', 'a'],      label: 'Move Left' },
    RIGHT:        { keys: ['ArrowRight', 'd'],     label: 'Move Right' },
    CONFIRM:      { keys: ['Enter', ' '],          label: 'Confirm / Interact' },
    BACK:         { keys: ['Escape', 'Backspace'], label: 'Back / Cancel' },
    MENU:         { keys: ['m'],                   label: 'Open Menu' },
    TAB:          { keys: ['Tab'],                 label: 'Cycle Character' },
    TOGGLE_FOCUS: { keys: ['`'],                   label: 'Toggle UI Focus' },
  };

  const GAMEPAD_BINDINGS = [
    { button: 'Left Stick',  intent: 'Move',    label: 'Move' },
    { button: 'A / Cross',   intent: 'CONFIRM', label: 'Confirm / Interact' },
    { button: 'B / Circle',  intent: 'BACK',    label: 'Back / Cancel' },
    { button: 'Start',       intent: 'MENU',    label: 'Open Menu' },
    { button: 'R1 / RB',     intent: 'TAB',     label: 'Cycle Character' },
    { button: '` / Select',  intent: 'TOGGLE',  label: 'Toggle UI Focus' },
  ];

  let _remapping = null; // { intent } while listening for a key

  function _loadCustom() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
  }

  function _saveCustom(custom) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  }

  function getBindings() {
    const custom = _loadCustom();
    const result = {};
    for (const intent in DEFAULT_BINDINGS) {
      result[intent] = {
        ...DEFAULT_BINDINGS[intent],
        keys: custom[intent] || DEFAULT_BINDINGS[intent].keys,
      };
    }
    return result;
  }

  function open() {
    const el = document.getElementById('controls-overlay');
    if (!el) return;

    if (typeof UI !== 'undefined') UI.hideAllOverlays();

    _render();
    el.style.display = 'flex';
    if (typeof Focus !== 'undefined') Focus.setContext('controls-overlay');
  }

  function close() {
    _remapping = null;
    const el = document.getElementById('controls-overlay');
    if (el) el.style.display = 'none';

    if (typeof MapEngine !== 'undefined' && !MapEngine.isRunning()) {
      const pauseMenu = document.getElementById('map-pause-menu');
      if (pauseMenu) pauseMenu.style.display = 'flex';
      if (typeof Focus !== 'undefined') Focus.setContext('map-pause-menu');
    } else {
      if (typeof Focus !== 'undefined') Focus.setContext(null);
    }
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    _remapping = null;
    _render();
    if (typeof Input !== 'undefined' && Input.reloadBindings) Input.reloadBindings();
  }

  function _startRemap(intent, rowEl) {
    _remapping = intent;
    rowEl.querySelector('.binding-keys').textContent = '[ press a key… ]';
    rowEl.classList.add('remapping');

    const onKey = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') {
        _remapping = null;
        window.removeEventListener('keydown', onKey, true);
        _render();
        return;
      }
      const custom = _loadCustom();
      custom[intent] = [e.key];
      _saveCustom(custom);
      _remapping = null;
      window.removeEventListener('keydown', onKey, true);
      if (typeof Input !== 'undefined' && Input.reloadBindings) Input.reloadBindings();
      _render();
    };
    window.addEventListener('keydown', onKey, true);
  }

  function _formatKey(k) {
    const map = {
      ' ': 'Space', 'ArrowUp': '↑', 'ArrowDown': '↓',
      'ArrowLeft': '←', 'ArrowRight': '→',
      'Escape': 'Esc', 'Backspace': 'BSp', 'Tab': 'Tab', '`': '`',
    };
    return map[k] || k.toUpperCase();
  }

  function _render() {
    const list = document.getElementById('controls-list');
    if (!list) return;

    const bindings = getBindings();
    const custom = _loadCustom();

    const kbRows = Object.entries(bindings).map(([intent, b]) => {
      const isCustom = !!custom[intent];
      const keyLabels = b.keys.map(_formatKey).join('  /  ');
      return `
        <div class="ctrl-row" data-intent="${intent}">
          <div class="ctrl-label">${b.label}</div>
          <div class="binding-keys ${isCustom ? 'custom' : ''}">${keyLabels}</div>
          <button class="ctrl-remap-btn" onclick="InputSettings._remapClick('${intent}', this.closest('.ctrl-row'))">Remap</button>
        </div>`;
    }).join('');

    const gpRows = GAMEPAD_BINDINGS.map(b => `
      <div class="ctrl-row ctrl-row-gp">
        <div class="ctrl-label">${b.label}</div>
        <div class="binding-keys gp-key">${b.button}</div>
        <div class="ctrl-remap-btn" style="opacity:0.2; cursor:default; pointer-events:none;">—</div>
      </div>`).join('');

    list.innerHTML = `
      <div class="ctrl-section-title">⌨ KEYBOARD</div>
      ${kbRows}
      <div class="ctrl-section-title" style="margin-top:20px;">🎮 GAMEPAD</div>
      ${gpRows}
      <div style="text-align:center; margin-top:20px;">
        <button class="camp-btn" style="width:auto; padding:8px 24px;" onclick="InputSettings.resetAll()">↺ Reset to Defaults</button>
      </div>`;
  }

  function _remapClick(intent, rowEl) {
    _startRemap(intent, rowEl);
  }

  return { open, close, resetAll, getBindings, _remapClick };
})();
