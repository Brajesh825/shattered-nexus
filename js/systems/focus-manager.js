/**
 * focus-manager.js — Phase-aware UI navigation (Keyboard, Controller, Mouse sync).
 *
 * Combat follows the classic FF four-phase chain:
 *   Phase 1 Main Menu → Phase 2 Sub-Menu → Phase 3 Target → Phase 4 Execute
 *
 * BACK always regresses exactly one phase. BACK from Phase 1 does nothing.
 * Enemies are only focusable during Phase 3 (targeting active).
 * Mouse hover during Phase 3 syncs the keyboard cursor and live log.
 *
 * Key design rule:
 *   _active  = whether the kb-focus ring is VISIBLE (hides on mouse move, shows on key press)
 *   _current = the remembered focused element — persists after mouse move so Enter/Confirm works
 */
const Focus = (() => {
  let _active    = false;
  let _current   = null;   // last focused element (ring may or may not be visible)
  let _container = null;   // active navigation container
  let _targeting = false;  // true during Phase 3
  let _targetType = 'enemy'; // 'enemy' | 'party'
  let _prevSubId  = null;  // sub-menu to return to when BACK cancels targeting

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    // Mouse move hides the ring but keeps _current so Enter/Confirm still works.
    window.addEventListener('mousemove', () => {
      if (!_targeting && _active) {
        _active = false;
        if (_current) _current.classList.remove('kb-focus');
      }
    });
    requestAnimationFrame(_update);
    // Bootstrap the title screen (or whichever screen is active at load) one frame
    // after DOMContentLoaded so all elements are rendered.
    requestAnimationFrame(_bootstrapContext);
  }

  // Detect the active screen at page load and set focus context for it.
  function _bootstrapContext() {
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;
    const ctxMap = {
      'title-screen':    'title-screen',
      'battle-screen':   'cmd-grid-main',
      'char-screen':     'char-grid',
      'class-screen':    'class-grid',
      'result-screen':   'result-screen',
      'game-over-screen':'game-over-screen',
    };
    const ctx = ctxMap[activeScreen.id];
    if (ctx) setContext(ctx);
    // story-screen and explore-screen intentionally get null context
  }

  function _update() {
    if (typeof Input !== 'undefined') _handleInput();
    requestAnimationFrame(_update);
  }

  // ── Input dispatch ─────────────────────────────────────────────────────────
  function _handleInput() {
    // Story/cutscene screen: CONFIRM = advance one line, SKIP = skip all.
    // Normal spatial navigation is suppressed here — the screen is not a menu.
    const storyActive = document.getElementById('story-screen')?.classList.contains('active');
    if (storyActive) {
      if (Input.justPressed('CONFIRM') && typeof Story !== 'undefined')    Story.advance();
      if (Input.justPressed('SKIP_CUTSCENE') && typeof Cutscene !== 'undefined') Cutscene.skip();
      return;
    }

    _handleToggle();

    // Map pause menu — must run before _isNavigationBlocked() so it works on the
    // explore screen (where navigation is otherwise suppressed). BACK mirrors MENU
    // so players don't need to hunt for the right key.
    if (!_container && (Input.justPressed('MENU') || Input.justPressed('BACK'))) {
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
    if (Input.justPressed('DOWN'))  _navigate(0,  1);

    if (Input.justPressed('LEFT')) {
      if (_container?.id === 'party-menu' && typeof PartyMenu !== 'undefined')
        PartyMenu.prev();
      else
        _navigate(-1, 0);
    }
    if (Input.justPressed('RIGHT')) {
      if (_container?.id === 'party-menu' && typeof PartyMenu !== 'undefined')
        PartyMenu.next();
      else
        _navigate(1, 0);
    }

    if (Input.justPressed('CONFIRM')) {
      // If nothing is focused yet, activate cursor mode and pick the first item.
      if (!_current) {
        _active = true;
        const focusables = _getFocusables();
        if (focusables.length) _focus(focusables[0]);
      }
      if (_current) _current.click();
      // setTargeting(false) is called inside selectTarget when pendingAction resolves;
      // no need to duplicate here.
    }

    if (Input.justPressed('BACK')) _handleBack();
  }

  // ── TOGGLE_FOCUS (map header focus) ───────────────────────────────────────
  function _handleToggle() {
    if (!Input.justPressed('TOGGLE_FOCUS')) return;
    const exploreScreen = document.getElementById('explore-screen');
    if (exploreScreen?.classList.contains('active')) {
      if (_container?.id === 'explore-header') setContext(null);
      else                                         setContext('explore-header');
    }
  }

  // ── Blocks navigation on the explore screen unless a context is set ────────
  function _isNavigationBlocked() {
    const exploreScreen = document.getElementById('explore-screen');
    return !!(exploreScreen?.classList.contains('active') && !_container);
  }

  // ── BACK — regress exactly one phase ──────────────────────────────────────
  function _handleBack() {
    // Phase 3 → Phase 2 or Phase 1
    if (_targeting) {
      cancelTargeting();
      return;
    }

    // System menus (map)
    if (_container && typeof MapUI !== 'undefined') {
      if (_container.id === 'map-pause-menu') { MapUI.closePauseMenu(); return; }
      if (_container.id === 'camp-menu')       { MapUI.closeCampMenu();  return; }
    }

    // Generic close buttons (party menu, item overlay, etc.)
    const backBtns = document.querySelectorAll(
      '.pm-close-btn, .pms-close, .itm-close, .bestiary-close, .pause-btn:last-child, .tutorial-close, .shop-close-btn'
    );
    const visibleBackBtn = Array.from(backBtns).find(b => b.offsetParent);
    if (visibleBackBtn) { visibleBackBtn.click(); return; }

    // Phase 2 → Phase 1 (battle sub-menu open)
    if (typeof BattleUI !== 'undefined') {
      const activeSub = document.querySelector('.sub-menu.open');
      if (activeSub) { BattleUI.openSub(null); return; }
      // Phase 1 → nothing (FF rule: must act on your turn)
      const battleActive = document.getElementById('battle-screen')?.classList.contains('active');
      if (battleActive) return;
    }
  }

  /**
   * Cancel Phase 3 targeting. Called by BACK key and right-click.
   * Clears pendingAction, removes CSS class, returns to Phase 2 or Phase 1.
   */
  function cancelTargeting() {
    if (!_targeting) return;
    setTargeting(false);
    if (typeof TurnState !== 'undefined') TurnState.clearPendingAction();
    else if (typeof G !== 'undefined') G.pendingAction = null;
    if (typeof BattleUI !== 'undefined') {
      BattleUI.openSub(_prevSubId || null);
      BattleUI.addLog('Choose an action.', 'hi');
    }
    _prevSubId = null;
  }

  // ── Phase 3 — targeting mode ───────────────────────────────────────────────
  /**
   * @param {boolean} on
   * @param {'enemy'|'party'} type
   * @param {string|null} fromSubId  Sub-menu ID to return to on BACK (null = main menu)
   */
  function setTargeting(on, type = 'enemy', fromSubId = null) {
    _targeting   = on;
    _targetType  = type;
    if (on) _prevSubId = fromSubId;

    // Toggle CSS class that gates pointer-events on targets
    const scene = document.getElementById('battle-scene');
    if (scene) {
      scene.classList.toggle('targeting-active',      on && type === 'enemy');
      scene.classList.toggle('targeting-active-ally', on && type === 'party');
    }

    // Clear previous focus ring
    if (_current) { _current.classList.remove('kb-focus'); _current = null; }

    if (on) {
      _active = true;
      const focusables = _getFocusables();
      // Prefer last-targeted enemy, otherwise fall to first alive
      const hint = (type === 'enemy' && typeof G !== 'undefined')
        ? (typeof TurnState !== 'undefined' ? TurnState.getTargetEnemyIdx() : G.targetEnemyIdx)
        : -1;
      const target = (hint >= 0 && hint < focusables.length) ? focusables[hint] : focusables[0];
      if (target) _focus(target);
    } else {
      _active = false;
      if (_container) _autoFocus();
    }
  }

  /**
   * Set the navigation container (Phase 1 or Phase 2 menus).
   * Exits targeting mode and removes all targeting CSS.
   */
  function setContext(containerId) {
    // Clear previous focus ring and remembered element when switching contexts.
    if (_current) { _current.classList.remove('kb-focus'); _current = null; }

    _container  = containerId ? document.getElementById(containerId) : null;
    _targeting  = false;
    _prevSubId  = null;

    const scene = document.getElementById('battle-scene');
    if (scene) scene.classList.remove('targeting-active', 'targeting-active-ally');

    if (containerId) {
      _active = true;
      _autoFocus();
      // Retry one frame later in case the screen is still in a CSS transition.
      requestAnimationFrame(_autoFocus);
    } else {
      _active = false;
    }
  }

  // ── Mouse hover sync (called from hoverTarget in game.js) ─────────────────
  /**
   * Sync the keyboard cursor to whichever enemy the mouse is hovering.
   * Only active during Phase 3; no-op otherwise.
   */
  function syncHover(el) {
    if (!_targeting || !el) return;
    if (_current) _current.classList.remove('kb-focus');
    _current = el;
    _active  = true;
    _current.classList.add('kb-focus');
  }

  // ── Auto-focus ────────────────────────────────────────────────────────────
  function _autoFocus() {
    const focusables = _getFocusables();
    if (!focusables.length) return;
    // Only auto-focus if no element is currently remembered for this container.
    if (!_current || (_container && !_container.contains(_current))) {
      _focus(focusables[0]);
    }
  }

  // ── Focusable pool ────────────────────────────────────────────────────────
  function _getFocusables() {
    // Phase 3: only alive enemies or party members (never both at once)
    if (_targeting) {
      const root = document.getElementById('battle-scene') || document.body;
      const selector = _targetType === 'enemy' ? '.enemy:not(.ko-enemy)' : '.pa-member';
      return Array.from(root.querySelectorAll(selector)).filter(_isVisible);
    }

    // Phase 1 / Phase 2 / system menus — standard button pool
    const root = _container || document.body;
    const candidates = root.querySelectorAll(
      'button:not([tabindex="-1"]):not(:disabled), ' +
      '.pause-inv-slot, .itm-entry, .itm-target-card, .bestiary-row, ' +
      '.b-tab, .title-btn, .char-card, .class-card, .swap-card, ' +
      '.sc, .sc-action, .tutorial-close, .npc-dialogue-next, ' +
      '.map-node, .mrp-btn, .shop-tab, .shop-item-row, .shop-qty-btn, .shop-confirm-btn'
    );
    // NOTE: enemy elements intentionally excluded here — only reachable in Phase 3.
    return Array.from(candidates).filter(_isVisible);
  }

  function _isVisible(el) {
    const s = window.getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && el.offsetParent !== null;
  }

  // ── Focus a single element ────────────────────────────────────────────────
  function _focus(el) {
    if (_current) _current.classList.remove('kb-focus');
    _current = el;
    if (!_current) return;
    if (_active) _current.classList.add('kb-focus');
    _current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // During Phase 3: sync G.targetEnemyIdx + update target indicators + live log
    if (_targeting && _current.classList.contains('enemy')) {
      const allEnemyEls = Array.from(document.querySelectorAll('.enemy'));
      const idx = allEnemyEls.indexOf(_current);
      if (idx >= 0 && typeof G !== 'undefined' && G.enemyGroup[idx]) {
        if (typeof TurnState !== 'undefined') TurnState.setTargetEnemyIdx(idx);
        else G.targetEnemyIdx = idx;
        allEnemyEls.forEach((e, i) => { e.dataset.target = (i === idx) ? 'true' : 'false'; });
        if (typeof BattleUI !== 'undefined') {
          BattleUI.addLog(`Target → ${G.enemyGroup[idx].name}`, 'hi');
        }
      }
    }
  }

  // ── Spatial navigation ────────────────────────────────────────────────────
  function _navigate(dx, dy) {
    // Show the ring whenever a directional key is pressed
    _active = true;
    if (_current) _current.classList.add('kb-focus');

    const focusables = _getFocusables();
    if (!focusables.length) return;
    if (!_current || !focusables.includes(_current)) { _focus(focusables[0]); return; }

    const r1  = _current.getBoundingClientRect();
    const c1  = { x: r1.left + r1.width / 2, y: r1.top + r1.height / 2 };

    let best    = null;
    let minDist = Infinity;

    focusables.forEach(el => {
      if (el === _current) return;
      const r2 = el.getBoundingClientRect();
      const c2 = { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 };
      const diffX = c2.x - c1.x, diffY = c2.y - c1.y;

      const inDir = (dx > 0 && diffX >  Math.abs(diffY)) ||
                    (dx < 0 && diffX < -Math.abs(diffY)) ||
                    (dy > 0 && diffY >  Math.abs(diffX)) ||
                    (dy < 0 && diffY < -Math.abs(diffX));
      if (!inDir) return;

      const dist = diffX * diffX + diffY * diffY;
      if (dist < minDist) { minDist = dist; best = el; }
    });

    // Wrap-around when hitting the edge of the list
    if (!best && focusables.length > 1) {
      const cur = focusables.indexOf(_current);
      if (dy > 0 || dx > 0) best = focusables[cur === focusables.length - 1 ? 0 : focusables.length - 1];
      else                   best = focusables[cur === 0 ? focusables.length - 1 : 0];
    }

    if (best) _focus(best);
  }

  function hasActiveContext() {
    return !!_container;
  }

  return { init, setContext, setTargeting, cancelTargeting, syncHover, hasActiveContext };
})();

Focus.init();
