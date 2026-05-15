/**
 * map-touch.js — Pinch-to-zoom, pan, double-tap and swipe-dismiss
 * for the World Map screen on Android PWA (landscape).
 *
 * API:
 *   MapTouch.init()   — call once after DOM ready
 *   MapTouch.reset()  — reset zoom/pan (called by Story._showWorldMap)
 */
const MapTouch = (() => {

  /* ── Config ─────────────────────────────────────────── */
  const MIN_SCALE  = 1;
  const MAX_SCALE  = 4;
  const SNAP_BACK  = 1.1;   // below this, snap back to 1×
  const DBL_MS     = 280;   // max ms between taps for double-tap
  const DBL_PX     = 30;    // max px movement between taps
  const SWIPE_DIST = 80;    // px swipe-down to dismiss region panel

  /* ── State ───────────────────────────────────────────── */
  let _el      = null;   // #map-area
  let _scale   = 1;
  let _tx      = 0;
  let _ty      = 0;

  // Pinch state
  let _pinching      = false;
  let _pinchDist0    = 0;
  let _pinchScale0   = 1;
  let _pinchMidX     = 0;
  let _pinchMidY     = 0;
  let _pinchTx0      = 0;
  let _pinchTy0      = 0;

  // Pan state
  let _panning    = false;
  let _panX0      = 0;
  let _panY0      = 0;
  let _panTx0     = 0;
  let _panTy0     = 0;

  // Double-tap state
  let _lastTapT   = 0;
  let _lastTapX   = 0;
  let _lastTapY   = 0;

  /* ── Helpers ─────────────────────────────────────────── */
  function _dist(t) {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.hypot(dx, dy);
  }

  function _mid(t) {
    return {
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    };
  }

  function _clampTranslate(tx, ty, s) {
    if (!_el) return { tx, ty };
    const w   = _el.offsetWidth;
    const h   = _el.offsetHeight;
    const maxX = (w * (s - 1)) / 2;
    const maxY = (h * (s - 1)) / 2;
    return {
      tx: Math.max(-maxX, Math.min(maxX, tx)),
      ty: Math.max(-maxY, Math.min(maxY, ty)),
    };
  }

  function _apply(s, tx, ty, instant) {
    if (!_el) return;
    _scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));
    const clamped = _clampTranslate(tx, ty, _scale);
    _tx = clamped.tx;
    _ty = clamped.ty;

    _el.style.transition = instant
      ? 'none'
      : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    _el.style.transform  = `scale(${_scale}) translate(${_tx / _scale}px, ${_ty / _scale}px)`;

    _syncResetBtn();
  }

  function _syncResetBtn() {
    const btn = document.getElementById('map-zoom-reset');
    if (!btn) return;
    btn.classList.toggle('visible', _scale > SNAP_BACK);
  }

  /* ── Touch handlers ──────────────────────────────────── */
  function _onStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      _pinching     = true;
      _panning      = false;
      _pinchDist0   = _dist(e.touches);
      _pinchScale0  = _scale;
      _pinchTx0     = _tx;
      _pinchTy0     = _ty;
      const m       = _mid(e.touches);
      const rect    = _el.getBoundingClientRect();
      // Midpoint relative to element centre
      _pinchMidX    = m.x - rect.left - rect.width  / 2;
      _pinchMidY    = m.y - rect.top  - rect.height / 2;
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      _panning  = true;
      _panX0    = t.clientX;
      _panY0    = t.clientY;
      _panTx0   = _tx;
      _panTy0   = _ty;
    }
  }

  function _onMove(e) {
    if (_pinching && e.touches.length === 2) {
      e.preventDefault();
      const newDist  = _dist(e.touches);
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, _pinchScale0 * (newDist / _pinchDist0)));

      // Scale around pinch midpoint
      const scaleDelta = newScale / _pinchScale0;
      const newTx = _pinchMidX * (1 - scaleDelta) + _pinchTx0 * scaleDelta;
      const newTy = _pinchMidY * (1 - scaleDelta) + _pinchTy0 * scaleDelta;

      // Also track finger translation during pinch
      const m      = _mid(e.touches);
      const rect   = _el.getBoundingClientRect();
      const midX   = m.x - rect.left - rect.width  / 2;
      const midY   = m.y - rect.top  - rect.height / 2;
      const panDx  = midX - _pinchMidX;
      const panDy  = midY - _pinchMidY;

      _apply(newScale, newTx + panDx, newTy + panDy, true);

    } else if (_panning && !_pinching && e.touches.length === 1 && _scale > SNAP_BACK) {
      e.preventDefault();
      const t  = e.touches[0];
      const dx = t.clientX - _panX0;
      const dy = t.clientY - _panY0;
      _apply(_scale, _panTx0 + dx, _panTy0 + dy, true);
    }
  }

  function _onEnd(e) {
    if (_pinching && e.touches.length < 2) {
      _pinching = false;
      // Snap back if barely zoomed
      if (_scale < SNAP_BACK) {
        _apply(1, 0, 0, false);
      }
    }
    if (e.touches.length === 0) {
      _panning = false;
    }

    // Double-tap to zoom
    if (e.changedTouches.length === 1 && !_pinching) {
      const t    = e.changedTouches[0];
      const now  = Date.now();
      const dx   = t.clientX - _lastTapX;
      const dy   = t.clientY - _lastTapY;
      if (now - _lastTapT < DBL_MS && Math.hypot(dx, dy) < DBL_PX) {
        // Double-tap: toggle between 1× and 2.5×
        if (_scale > 1.5) {
          _apply(1, 0, 0, false);
        } else {
          const rect  = _el.getBoundingClientRect();
          const focusX = t.clientX - rect.left - rect.width  / 2;
          const focusY = t.clientY - rect.top  - rect.height / 2;
          // Pan so the tapped point becomes the new centre
          _apply(2.5, -focusX * 1.5, -focusY * 1.5, false);
        }
        _lastTapT = 0; // reset so triple-tap doesn't re-trigger
        return;
      }
      _lastTapT = now;
      _lastTapX = t.clientX;
      _lastTapY = t.clientY;
    }
  }

  /* ── Region panel swipe-to-dismiss ───────────────────── */
  let _swipePanel  = null;
  let _swipeY0     = 0;
  let _swipeLive   = false;

  function _initPanelSwipe(panel) {
    _swipePanel = panel;

    // Only wire up on the handle element so normal panel scrolling isn't blocked
    const handle = panel.querySelector('.mrp-handle');
    if (!handle) return;

    handle.addEventListener('touchstart', ev => {
      _swipeY0   = ev.touches[0].clientY;
      _swipeLive = true;
      ev.preventDefault();
    }, { passive: false });

    handle.addEventListener('touchmove', ev => {
      if (!_swipeLive) return;
      const dy = ev.touches[0].clientY - _swipeY0;
      if (dy > 0) {
        // Translate panel downward as user drags
        panel.style.transition = 'none';
        panel.style.transform  = `translateY(${dy}px)`;
        ev.preventDefault();
      }
    }, { passive: false });

    handle.addEventListener('touchend', ev => {
      if (!_swipeLive) return;
      _swipeLive = false;
      const dy = ev.changedTouches[0].clientY - _swipeY0;
      panel.style.transition = '';
      panel.style.transform  = '';
      if (dy > SWIPE_DIST && typeof Story !== 'undefined') {
        Story._closeRegionPanel();
      }
    });
  }

  /* ── Public API ──────────────────────────────────────── */
  function init() {
    _el = document.getElementById('map-area');
    if (!_el) return;

    _el.addEventListener('touchstart', _onStart, { passive: false });
    _el.addEventListener('touchmove',  _onMove,  { passive: false });
    _el.addEventListener('touchend',   _onEnd,   { passive: true  });
  }

  function reset() {
    _apply(1, 0, 0, false);
  }

  /* Called by story.js each time a region panel is opened (innerHTML replaces handle) */
  function initPanelSwipe(panel) {
    _initPanelSwipe(panel);
  }

  function isActive() { return _pinching || _panning; }

  return { init, reset, initPanelSwipe, isActive };

})();
