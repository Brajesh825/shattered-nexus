/**
 * input-manager.test.js
 * Contracts for the Input module: key binding, justPressed rising-edge,
 * WASD aliases, D-pad gamepad buttons, SKIP_CUTSCENE intent.
 */
const assert = require('node:assert/strict');
const fs     = require('node:fs');
const path   = require('node:path');
const vm     = require('node:vm');
const { test } = require('./test-harness.js');

const ROOT = path.resolve(__dirname, '..');

const DEFAULT_BINDINGS = {
  UP:            { keys: ['ArrowUp',  'w'] },
  DOWN:          { keys: ['ArrowDown', 's'] },
  LEFT:          { keys: ['ArrowLeft', 'a'] },
  RIGHT:         { keys: ['ArrowRight','d'] },
  CONFIRM:       { keys: ['Enter', ' '] },
  BACK:          { keys: ['Escape', 'Backspace'] },
  MENU:          { keys: ['m'] },
  TAB:           { keys: ['Tab'] },
  TOGGLE_FOCUS:  { keys: ['`'] },
  SKIP_CUTSCENE: { keys: ['q', 'Q'] },
};

function loadInput(gpFactory = () => [null]) {
  const rafQueue   = [];
  const listeners  = {};

  const sandbox = {
    console,
    document: { readyState: 'loading', addEventListener() {} },
    navigator: { getGamepads: gpFactory },
    requestAnimationFrame(fn) { rafQueue.push(fn); },
    window: {
      addEventListener(evt, fn) {
        (listeners[evt] = listeners[evt] || []).push(fn);
      }
    },
    InputSettings: { getBindings: () => DEFAULT_BINDINGS },
  };

  vm.createContext(sandbox);
  const src = fs.readFileSync(path.join(ROOT, 'js', 'systems', 'input-manager.js'), 'utf8');
  vm.runInContext(`${src}\nglobalThis.__Input = Input;`, sandbox, { filename: 'input-manager.js' });

  const Input = sandbox.__Input;
  // readyState was 'loading' so init() was not called automatically — call it now
  Input.init();

  function tick() {
    // Drain ONE level of RAF callbacks (mirrors a single animation frame)
    const batch = rafQueue.splice(0);
    batch.forEach(fn => fn());
  }

  function keydown(key) {
    (listeners['keydown'] || []).forEach(h => h({ key, preventDefault() {} }));
  }

  function keyup(key) {
    (listeners['keyup'] || []).forEach(h => h({ key }));
  }

  return { Input, tick, keydown, keyup };
}

// ── Key binding contracts ─────────────────────────────────────────────────────

test('Input: ArrowDown → DOWN intent on first poll', () => {
  const { Input, tick, keydown } = loadInput();
  keydown('ArrowDown');
  tick();
  assert.equal(Input.justPressed('DOWN'), true);
  assert.equal(Input.isDown('DOWN'), true);
});

test('Input: WASD aliases — w/a/s/d drive UP/LEFT/DOWN/RIGHT', () => {
  const { Input, tick, keydown } = loadInput();
  keydown('w');
  tick();
  assert.equal(Input.justPressed('UP'), true);

  const { Input: I2, tick: t2, keydown: kd2 } = loadInput();
  kd2('d');
  t2();
  assert.equal(I2.justPressed('RIGHT'), true);
});

test('Input: Space bar maps to CONFIRM', () => {
  const { Input, tick, keydown } = loadInput();
  keydown(' ');
  tick();
  assert.equal(Input.justPressed('CONFIRM'), true);
});

test('Input: Escape and Backspace both map to BACK', () => {
  const { Input: I1, tick: t1, keydown: kd1 } = loadInput();
  kd1('Escape');
  t1();
  assert.equal(I1.justPressed('BACK'), true);

  const { Input: I2, tick: t2, keydown: kd2 } = loadInput();
  kd2('Backspace');
  t2();
  assert.equal(I2.justPressed('BACK'), true);
});

test('Input: SKIP_CUTSCENE fires on q and Q', () => {
  const { Input: I1, tick: t1, keydown: kd1 } = loadInput();
  kd1('q');
  t1();
  assert.equal(I1.justPressed('SKIP_CUTSCENE'), true);

  const { Input: I2, tick: t2, keydown: kd2 } = loadInput();
  kd2('Q');
  t2();
  assert.equal(I2.justPressed('SKIP_CUTSCENE'), true);
});

// ── Rising-edge (justPressed) contract ────────────────────────────────────────

test('Input: justPressed is true only on the frame the key first goes down', () => {
  const { Input, tick, keydown, keyup } = loadInput();

  keydown('Enter');
  tick();  // frame 1 — key goes down
  assert.equal(Input.justPressed('CONFIRM'), true,  'should fire on first frame');

  tick();  // frame 2 — key still held
  assert.equal(Input.justPressed('CONFIRM'), false, 'should NOT fire while held');

  keyup('Enter');
  tick();  // frame 3 — released (poll captures "key up" state)
  assert.equal(Input.justPressed('CONFIRM'), false, 'should be false immediately after release');

  keydown('Enter');
  tick();  // frame 4 — pressed again in a new poll frame
  assert.equal(Input.justPressed('CONFIRM'), true,  'should fire again on re-press');
});

test('Input: isDown stays true while key is held, false after release', () => {
  const { Input, tick, keydown, keyup } = loadInput();

  keydown('ArrowUp');
  tick();
  assert.equal(Input.isDown('UP'), true);

  keyup('ArrowUp');
  tick();
  assert.equal(Input.isDown('UP'), false);
});

// ── Gamepad D-pad contract ────────────────────────────────────────────────────

function makeGamepad(buttonIdx) {
  return {
    axes: [0, 0],
    buttons: Array.from({ length: 16 }, (_, i) => ({ pressed: i === buttonIdx })),
  };
}

test('Input: gamepad button 12 (D-pad Up) → UP intent', () => {
  let gp = null;
  const { Input, tick } = loadInput(() => [gp]);
  gp = makeGamepad(12);
  tick();
  assert.equal(Input.justPressed('UP'), true);
});

test('Input: gamepad button 13 (D-pad Down) → DOWN intent', () => {
  let gp = null;
  const { Input, tick } = loadInput(() => [gp]);
  gp = makeGamepad(13);
  tick();
  assert.equal(Input.justPressed('DOWN'), true);
});

test('Input: gamepad button 14 (D-pad Left) → LEFT intent', () => {
  let gp = null;
  const { Input, tick } = loadInput(() => [gp]);
  gp = makeGamepad(14);
  tick();
  assert.equal(Input.justPressed('LEFT'), true);
});

test('Input: gamepad button 15 (D-pad Right) → RIGHT intent', () => {
  let gp = null;
  const { Input, tick } = loadInput(() => [gp]);
  gp = makeGamepad(15);
  tick();
  assert.equal(Input.justPressed('RIGHT'), true);
});

test('Input: gamepad button 0 (A/Cross) → CONFIRM intent', () => {
  let gp = null;
  const { Input, tick } = loadInput(() => [gp]);
  gp = makeGamepad(0);
  tick();
  assert.equal(Input.justPressed('CONFIRM'), true);
});

test('Input: gamepad button 1 (B/Circle) → BACK intent', () => {
  let gp = null;
  const { Input, tick } = loadInput(() => [gp]);
  gp = makeGamepad(1);
  tick();
  assert.equal(Input.justPressed('BACK'), true);
});

test('Input: gamepad button 3 (Y/Triangle) → SKIP_CUTSCENE intent', () => {
  let gp = null;
  const { Input, tick } = loadInput(() => [gp]);
  gp = makeGamepad(3);
  tick();
  assert.equal(Input.justPressed('SKIP_CUTSCENE'), true);
});

// ── Axis contract ─────────────────────────────────────────────────────────────

test('Input: getAxis reflects keyboard directional state', () => {
  const { Input, tick, keydown } = loadInput();
  keydown('d');
  tick();
  const axis = Input.getAxis();
  assert.equal(axis.x, 1);
  assert.equal(axis.y, 0);
});

test('Input: getAxis reflects gamepad stick within deadzone as 0', () => {
  const gp = { axes: [0.1, -0.1], buttons: Array(16).fill({ pressed: false }) };
  const { Input, tick } = loadInput(() => [gp]);
  tick();
  const axis = Input.getAxis();
  assert.equal(axis.x, 0);
  assert.equal(axis.y, 0);
});
