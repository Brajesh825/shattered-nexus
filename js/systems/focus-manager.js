/**
 * focus-manager.js — Handles UI selection state and spatial navigation.
 * Adds visual highlight (.kb-focus) and executes clicks on confirm.
 */
const Focus = (() => {
  let _active = false;
  let _current = null;
  let _container = null;
  let _targeting = false;
  let _targetType = 'enemy'; // 'enemy' | 'party'

  function init() {
    window.addEventListener('mousemove', () => _setCursorMode(false));
    requestAnimationFrame(_update);
  }

  function _update() {
    if (typeof Input !== 'undefined') {
      _handleInput();
    }
    requestAnimationFrame(_update);
  }

  function _handleInput() {
    _handleToggle();

    // Dedicated key handling for Map Menu
    if (Input.justPressed('MENU') || Input.justPressed('BACK')) {
      const exploreActive = document.getElementById('explore-screen')?.classList.contains('active');
      if (exploreActive && typeof MapUI !== 'undefined') {
        const pauseMenu = document.getElementById('map-pause-menu');
        if (pauseMenu && pauseMenu.style.display === 'none') {
           MapUI.openPauseMenu();
           return; 
        }
      }
    }

    if (_isNavigationBlocked()) return;

    if (Input.justPressed('UP'))    _navigate(0, -1);
    if (Input.justPressed('DOWN'))  _navigate(0, 1);
    if (Input.justPressed('LEFT'))  _navigate(-1, 0);
    if (Input.justPressed('RIGHT')) _navigate(1, 0);
    
    if (Input.justPressed('CONFIRM') && _current) {
      _current.click();
      // If we confirm a target, end targeting mode
      if (_targeting) setTargeting(false);
      // If we confirm a header button (MENU), the menu will open and reset context
    }
    
    if (Input.justPressed('BACK')) {
      if (_targeting) {
        setTargeting(false);
        // Return to command menu
        if (typeof BattleUI !== 'undefined') BattleUI.openSub(null);
      } else {
        _handleBack();
      }
    }
  }

  function _handleToggle() {
    if (Input.justPressed('TOGGLE_FOCUS')) {
      const exploreScreen = document.getElementById('explore-screen');
      const isExplore = exploreScreen && exploreScreen.classList.contains('active');
      
      if (isExplore) {
        // Toggle between Header Focus and Map Movement
        if (_container && _container.id === 'explore-header') {
          setContext(null); // Return to map movement
        } else {
          setContext('explore-header'); // Focus the menu buttons
        }
      }
    }
  }

  /**
   * Prevents focus navigation from stealing input from the map character.
   */
  function _isNavigationBlocked() {
    // If on explore screen, only allow navigation if we specifically have a context set (Header or Overlay)
    const exploreScreen = document.getElementById('explore-screen');
    const isExplore = exploreScreen && exploreScreen.classList.contains('active');
    
    if (isExplore && !_container) return true;
    return false;
  }

  function _handleBack() {
    // Priority sequence for back buttons
    const backBtn = document.querySelector('.pm-close-btn, .bestiary-close, .pause-btn:last-child, .tutorial-close');
    if (backBtn && backBtn.offsetParent) {
      backBtn.click();
      return;
    }
    // If in a sub-menu in battle, close it
    if (typeof BattleUI !== 'undefined') {
      const activeSub = document.querySelector('.sub-menu.open');
      if (activeSub) BattleUI.openSub(null);
    }
  }

  /**
   * Special mode for Battle Targeting (Enemy or Ally selection)
   */
  function setTargeting(on, type = 'enemy') {
    _targeting = on;
    _targetType = type;
    _setCursorMode(on);
    if (on) _autoFocus();
    else if (_container) _autoFocus(); // Return to container items
  }

  /**
   * Sets the container to navigate within (e.g. #cmd-grid-main)
   */
  function setContext(containerId) {
    _container = containerId ? document.getElementById(containerId) : null;
    _targeting = false; // Normal navigation overrides targeting
    _setCursorMode(true);
    _autoFocus();
  }

  function _setCursorMode(on) {
    _active = on;
    if (!_active && _current) {
      _current.classList.remove('kb-focus');
      _current = null;
    }
  }

  function _autoFocus() {
    if (!_active) return;
    const focusables = _getFocusables();
    if (focusables.length > 0) {
      _focus(focusables[0]);
    }
  }

  function _getFocusables() {
    if (_targeting) {
      const root = document.getElementById('battle-scene') || document.body;
      const selector = _targetType === 'enemy' ? '.enemy' : '.pa-member';
      return Array.from(root.querySelectorAll(selector)).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
      });
    }

    const root = _container || document.body;
    // Selection criteria: visible buttons or specific game elements
    // Strictly exclude tabindex="-1" to prevent focus leaks to global utility buttons
    const candidates = root.querySelectorAll('button:not([tabindex="-1"]), .enemy, .pa-member, .pause-inv-slot, .bestiary-row, .b-tab, .title-btn, .char-card, .class-card, .swap-card, .sc, .sc-action, .tutorial-close, .npc-dialogue-next');
    return Array.from(candidates).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    });
  }

  function _focus(el) {
    if (_current) _current.classList.remove('kb-focus');
    _current = el;
    if (_current) {
      _current.classList.add('kb-focus');
      _current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Simple spatial navigation: finds element closest to the desired direction.
   */
  function _navigate(dx, dy) {
    _setCursorMode(true);
    const focusables = _getFocusables();
    if (focusables.length === 0) return;
    if (!_current) { _focus(focusables[0]); return; }

    const r1 = _current.getBoundingClientRect();
    const c1 = { x: r1.left + r1.width / 2, y: r1.top + r1.height / 2 };

    let best = null;
    let minDist = Infinity;

    focusables.forEach(el => {
      if (el === _current) return;
      const r2 = el.getBoundingClientRect();
      const c2 = { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 };

      const diffX = c2.x - c1.x;
      const diffY = c2.y - c1.y;

      // Ensure target is in the correct directional half-plane
      const inDirection = (dx > 0 && diffX > Math.abs(diffY)) ||
                          (dx < 0 && diffX < -Math.abs(diffY)) ||
                          (dy > 0 && diffY > Math.abs(diffX)) ||
                          (dy < 0 && diffY < -Math.abs(diffX));

      if (inDirection) {
        const dist = diffX * diffX + diffY * diffY;
        if (dist < minDist) {
          minDist = dist;
          best = el;
        }
      }
    });

    if (best) _focus(best);
  }

  return { init, setContext, setTargeting };
})();

Focus.init();
