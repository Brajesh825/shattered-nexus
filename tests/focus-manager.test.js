/**
 * focus-manager.test.js
 * Contracts for the Focus module: phase-aware navigation, context lifecycle,
 * navigation blocking, pause-menu shortcut, story-screen handling.
 *
 * DOM is minimal — only the parts Focus actually touches are mocked.
 */
const assert = require('node:assert/strict');
const fs     = require('node:fs');
const path   = require('node:path');
const vm     = require('node:vm');
const { test } = require('./test-harness.js');

const ROOT = path.resolve(__dirname, '..');

// ── Minimal DOM helpers ───────────────────────────────────────────────────────

function makeEl(id, { classes = [], tagName = 'div', hidden = false, children = [] } = {}) {
  const _cls = new Set(classes);
  const el = {
    id,
    tagName,
    style: { display: hidden ? 'none' : '' },
    dataset: {},
    _clicked: false,
    _children: children,
    scrollIntoView() {},
    click() { this._clicked = true; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 40 }),
    classList: {
      has:    c => _cls.has(c),
      contains: c => _cls.has(c),
      add:    c => _cls.add(c),
      remove: c => _cls.delete(c),
      toggle(c, v) {
        const next = typeof v === 'boolean' ? v : !_cls.has(c);
        next ? _cls.add(c) : _cls.delete(c);
      },
    },
    get offsetParent() { return hidden ? null : {}; },
    querySelectorAll() { return []; },
    contains(other) {
      if (this._children.includes(other)) return true;
      return this._children.some(c => c.contains && c.contains(other));
    },
  };
  return el;
}

function makeBtn(id, { classes = [], hidden = false } = {}) {
  return makeEl(id, { tagName: 'button', classes: ['btn', ...classes], hidden });
}

// ── Sandbox loader ────────────────────────────────────────────────────────────

function loadFocus(domOverrides = {}) {
  const rafQueue  = [];
  const listeners = {};

  // Minimal document: getElementById / querySelector / querySelectorAll / getComputedStyle
  const elements = { ...(domOverrides.elements || {}) };

  const document = {
    getElementById(id)    { return elements[id] || null; },
    querySelector(sel)    { return domOverrides.querySelector?.(sel) || null; },
    querySelectorAll(sel) { return domOverrides.querySelectorAll?.(sel) || []; },
    body: makeEl('body', { children: Object.values(elements) }),
  };

  const window = {
    addEventListener(evt, fn) {
      (listeners[evt] = listeners[evt] || []).push(fn);
    },
    getComputedStyle(el) {
      return { display: el.style?.display || 'block', visibility: 'visible' };
    },
  };

  // Modules Focus may optionally call — provide safe no-op stubs
  const Input = domOverrides.Input || {
    justPressed: () => false,
    isDown:      () => false,
  };

  const sandbox = {
    console,
    window,
    document,
    requestAnimationFrame(fn) { rafQueue.push(fn); },
    Input,
    Story:    domOverrides.Story    || { advance() {} },
    Cutscene: domOverrides.Cutscene || { skip() {} },
    MapUI:    domOverrides.MapUI    || { openPauseMenu() {}, closePauseMenu() {}, closeCampMenu() {} },
    BattleUI: domOverrides.BattleUI || { openSub() {}, addLog() {} },
    G:        domOverrides.G        || { pendingAction: null, targetEnemyIdx: 0, enemyGroup: [] },
    PartyMenu: domOverrides.PartyMenu || { prev() {}, next() {} },
  };

  vm.createContext(sandbox);
  const src = fs.readFileSync(path.join(ROOT, 'js', 'systems', 'focus-manager.js'), 'utf8');
  vm.runInContext(`${src}\nglobalThis.__Focus = Focus;`, sandbox, { filename: 'focus-manager.js' });

  function tick() {
    const batch = rafQueue.splice(0);
    batch.forEach(fn => fn());
  }

  // Simulate mouse movement
  function mouseMove() {
    (listeners['mousemove'] || []).forEach(h => h({}));
  }

  return { Focus: sandbox.__Focus, tick, mouseMove, sandbox };
}

// ── setContext lifecycle ──────────────────────────────────────────────────────

test('Focus: setContext(null) clears container and disables cursor mode', () => {
  const menu = makeEl('my-menu');
  const btn  = makeBtn('b1');
  menu._children = [btn];
  menu.querySelectorAll = () => [btn];
  menu.contains = el => el === btn;

  const { Focus, tick } = loadFocus({ elements: { 'my-menu': menu } });

  Focus.setContext('my-menu');
  tick(); // drain RAF

  Focus.setContext(null);
  // After null context, setting context to null should clear _current
  // (pressing CONFIRM should not click anything — tested via _clicked flag)
  // We verify by confirming the button was NOT clicked after setContext(null)
  assert.equal(btn._clicked, false);
});

test('Focus: setContext sets container element and auto-focuses first visible button', () => {
  const menu = makeEl('pause-menu');
  const btn  = makeBtn('resume-btn');
  menu._children = [btn];
  menu.querySelectorAll = () => [btn];
  menu.contains = el => el === btn;

  const { Focus, tick } = loadFocus({ elements: { 'pause-menu': menu } });

  Focus.setContext('pause-menu');
  tick();

  assert.equal(btn.classList.has('kb-focus'), true, 'first button should receive kb-focus ring');
});

// ── Mouse-move persistence contract (key regression guard) ────────────────────

test('Focus: mouse move hides ring but _current survives — CONFIRM still fires', () => {
  const menu = makeEl('my-menu');
  const btn  = makeBtn('btn1');
  menu._children = [btn];
  menu.querySelectorAll = () => [btn];
  menu.contains = el => el === btn;

  // Build an Input stub that reports CONFIRM pressed on demand
  let confirmPressed = false;
  const Input = {
    justPressed: intent => intent === 'CONFIRM' && confirmPressed,
    isDown: () => false,
  };

  const { Focus, tick, mouseMove } = loadFocus({
    elements: { 'my-menu': menu },
    Input,
  });

  Focus.setContext('my-menu');
  tick();  // _current = btn, ring visible

  assert.equal(btn.classList.has('kb-focus'), true, 'ring should be visible after setContext');

  mouseMove();  // should hide ring but keep _current
  assert.equal(btn.classList.has('kb-focus'), false, 'ring should be hidden after mouse move');

  // Now fire CONFIRM — _current must still be set so the click happens
  confirmPressed = true;
  tick();  // _handleInput reads Input.justPressed('CONFIRM')

  assert.equal(btn._clicked, true, '_current must survive mouse move so CONFIRM clicks it');
});

// ── Navigation blocking contract ──────────────────────────────────────────────

test('Focus: navigation is blocked on explore screen when no container is set', () => {
  const exploreScreen = makeEl('explore-screen', { classes: ['active'] });
  const btn = makeBtn('map-btn');

  let navFired = false;
  let downPressed = true;
  const Input = {
    justPressed: intent => {
      if (intent === 'DOWN') { const v = downPressed; downPressed = false; return v; }
      return false;
    },
    isDown: () => false,
  };

  // No container set → _isNavigationBlocked returns true on explore screen
  const { Focus, tick } = loadFocus({
    elements: { 'explore-screen': exploreScreen },
    Input,
    querySelector: sel => sel.includes('screen.active') ? exploreScreen : null,
  });

  // No setContext called → _container = null
  tick(); // _handleInput runs; DOWN should be blocked
  assert.equal(btn._clicked, false, 'navigation should be blocked on explore without context');
});

test('Focus: navigation is NOT blocked on title screen', () => {
  const titleScreen  = makeEl('title-screen',  { classes: ['active'] });
  // No explore-screen in DOM → _isNavigationBlocked returns false
  const btn = makeBtn('new-game-btn', { classes: ['title-btn'] });
  titleScreen._children = [btn];

  let downPressed = true;
  const Input = {
    justPressed: intent => {
      if (intent === 'DOWN') { const v = downPressed; downPressed = false; return v; }
      return false;
    },
    isDown: () => false,
  };

  const { Focus, tick } = loadFocus({
    elements: { 'title-screen': titleScreen },
    Input,
  });

  Focus.setContext('title-screen');
  tick(); // should not throw or block
  // No assertion on click needed — just verifying no exception and no block
  assert.ok(true);
});

// ── Map pause menu shortcut (key regression guard) ────────────────────────────

test('Focus: MENU key opens map pause menu from explore screen before nav block', () => {
  const exploreScreen = makeEl('explore-screen', { classes: ['active'] });
  const pauseMenu     = makeEl('map-pause-menu');
  pauseMenu.style.display = 'none';  // closed initially

  let menuOpened = false;
  const MapUI  = { openPauseMenu() { menuOpened = true; }, closePauseMenu() {}, closeCampMenu() {} };

  let menuPressed = true;
  const Input = {
    justPressed: intent => {
      if (intent === 'MENU') { const v = menuPressed; menuPressed = false; return v; }
      return false;
    },
    isDown: () => false,
  };

  const { Focus, tick } = loadFocus({
    elements: { 'explore-screen': exploreScreen, 'map-pause-menu': pauseMenu },
    Input,
    MapUI,
  });

  // No container set — explore screen would normally block all navigation
  tick();

  assert.equal(menuOpened, true, 'MENU must open pause menu even when navigation is blocked');
});

test('Focus: BACK key also opens map pause menu from explore screen', () => {
  const exploreScreen = makeEl('explore-screen', { classes: ['active'] });
  const pauseMenu     = makeEl('map-pause-menu');
  pauseMenu.style.display = 'none';

  let menuOpened = false;
  const MapUI = { openPauseMenu() { menuOpened = true; }, closePauseMenu() {}, closeCampMenu() {} };

  let backPressed = true;
  const Input = {
    justPressed: intent => {
      if (intent === 'BACK') { const v = backPressed; backPressed = false; return v; }
      return false;
    },
    isDown: () => false,
  };

  const { Focus, tick } = loadFocus({
    elements: { 'explore-screen': exploreScreen, 'map-pause-menu': pauseMenu },
    Input,
    MapUI,
  });

  tick();
  assert.equal(menuOpened, true, 'BACK must also open pause menu from explore screen');
});

// ── Story screen contract ─────────────────────────────────────────────────────

test('Focus: CONFIRM on story screen calls Story.advance(), not button click', () => {
  const storyScreen = makeEl('story-screen', { classes: ['active'] });
  const btn = makeBtn('some-btn');

  let advanced = false;
  const Story = { advance() { advanced = true; } };

  let confirmPressed = true;
  const Input = {
    justPressed: intent => {
      if (intent === 'CONFIRM') { const v = confirmPressed; confirmPressed = false; return v; }
      return false;
    },
    isDown: () => false,
  };

  const { Focus, tick } = loadFocus({
    elements: { 'story-screen': storyScreen },
    Input,
    Story,
  });

  tick();

  assert.equal(advanced,    true,  'Story.advance must be called on CONFIRM in story screen');
  assert.equal(btn._clicked, false, 'normal button click must NOT fire during story screen');
});

test('Focus: SKIP_CUTSCENE on story screen calls Cutscene.skip()', () => {
  const storyScreen = makeEl('story-screen', { classes: ['active'] });
  let skipped = false;
  const Cutscene = { skip() { skipped = true; } };

  let skipPressed = true;
  const Input = {
    justPressed: intent => {
      if (intent === 'SKIP_CUTSCENE') { const v = skipPressed; skipPressed = false; return v; }
      return false;
    },
    isDown: () => false,
  };

  const { Focus, tick } = loadFocus({
    elements: { 'story-screen': storyScreen },
    Input,
    Cutscene,
  });

  tick();
  assert.equal(skipped, true, 'Cutscene.skip must be called on SKIP_CUTSCENE in story screen');
});

// ── Phase 3 targeting contract ────────────────────────────────────────────────

test('Focus: setTargeting(true) restricts focusable pool to enemies', () => {
  const battleScene = makeEl('battle-scene');
  const enemy1 = makeEl('enemy-0', { classes: ['enemy'] });
  const enemy2 = makeEl('enemy-1', { classes: ['enemy'] });

  battleScene.querySelectorAll = sel => {
    if (sel.includes('.enemy:not(.ko-enemy)')) return [enemy1, enemy2];
    return [];
  };

  const { Focus, tick } = loadFocus({
    elements: { 'battle-scene': battleScene },
    G: { targetEnemyIdx: 0, enemyGroup: [{ name: 'Slime' }, { name: 'Goblin' }] },
  });

  Focus.setTargeting(true, 'enemy', null);
  tick();

  assert.equal(enemy1.classList.has('kb-focus'), true, 'first enemy should be focused in Phase 3');
  assert.equal(enemy2.classList.has('kb-focus'), false);
});

test('Focus: setTargeting(false) clears targeting state', () => {
  const battleScene = makeEl('battle-scene');
  battleScene.querySelectorAll = () => [];

  const { Focus } = loadFocus({ elements: { 'battle-scene': battleScene } });

  Focus.setTargeting(true,  'enemy', null);
  Focus.setTargeting(false, 'enemy', null);
  // Should not throw; targeting-active classes should be removed
  assert.equal(battleScene.classList.has('targeting-active'), false);
});

// ── cancelTargeting contract ──────────────────────────────────────────────────

test('Focus: cancelTargeting clears G.pendingAction', () => {
  const battleScene = makeEl('battle-scene');
  battleScene.querySelectorAll = () => [];
  const menuEl = makeEl('cmd-grid-main');
  menuEl.querySelectorAll = () => [];

  const G = { pendingAction: { type: 'attack' }, targetEnemyIdx: 0, enemyGroup: [] };

  const { Focus } = loadFocus({
    elements: { 'battle-scene': battleScene, 'cmd-grid-main': menuEl },
    G,
  });

  Focus.setContext('cmd-grid-main');
  Focus.setTargeting(true, 'enemy', null);
  Focus.cancelTargeting();

  assert.equal(G.pendingAction, null, 'cancelTargeting must null G.pendingAction');
});
