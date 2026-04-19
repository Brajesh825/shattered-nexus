/**
 * Credits Module
 * Handles the cinematic finale scrolling credits.
 */
const Credits = (() => {
  let _active = false;
  let _scrollPos = 0;
  let _rafId = null;

  function launch() {
    if (_active) return;
    _active = true;
    
    const overlay = document.getElementById('credits-overlay');
    const scroller = document.getElementById('credits-scroller');
    if (!overlay || !scroller) return;

    // Reset scroller position
    _scrollPos = window.innerHeight;
    scroller.style.transform = `translateY(${_scrollPos}px)`;
    
    // Build party list
    this._renderPartyList();

    // Show overlay
    overlay.style.display = 'flex';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 2s';
    
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      // Fade out BGM and start finale theme
      if (typeof BGM !== 'undefined') {
        BGM.fadeOut(2000, () => BGM.play('credits'));
      }
      this._startScroll();
    });
  }

  function _renderPartyList() {
    const list = document.getElementById('credits-party-list');
    if (!list) return;
    list.innerHTML = '';
    
    if (G.party && G.party.length) {
      G.party.forEach(m => {
        if (!m) return;
        const card = document.createElement('div');
        card.className = 'credits-party-card';
        card.style.borderColor = CHAR_COLOR[m.charId] || '#fff';
        card.innerHTML = `
          <div style="font-size:18px;color:${CHAR_COLOR[m.charId]}">${m.displayName}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.6)">Lv ${m.lv} · ${m.cls.name}</div>
        `;
        list.appendChild(card);
      });
    }
  }

  function _startScroll() {
    const scroller = document.getElementById('credits-scroller');
    let lastTs = performance.now();
    
    const loop = (ts) => {
      if (!_active) return;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      _scrollPos -= 50 * dt; // 50px per second
      scroller.style.transform = `translateY(${_scrollPos}px)`;

      // Stop once reached end (bottom margin is 50vh)
      const rect = scroller.getBoundingClientRect();
      if (rect.bottom < 0) {
        this._showCloseButton();
        return;
      }

      _rafId = requestAnimationFrame(loop);
    };
    _rafId = requestAnimationFrame(loop);
  }

  function _showCloseButton() {
    const btn = document.getElementById('credits-close-btn');
    if (btn) {
      btn.style.display = 'block';
      btn.style.opacity = '0';
      btn.style.transition = 'opacity 1s';
      requestAnimationFrame(() => btn.style.opacity = '1');
    }
  }

  function close() {
    _active = false;
    if (_rafId) cancelAnimationFrame(_rafId);
    
    const overlay = document.getElementById('credits-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        // Return to title screen
        if (typeof showScreen === 'function') showScreen('title-screen');
        if (typeof BGM !== 'undefined') BGM.play('title');
      }, 2000);
    }
  }

  return { launch, close, _renderPartyList, _startScroll, _showCloseButton };
})();
