/* ============================================================
   RESULT UI — Victory / Defeat / Escape screen rendering
   ============================================================ */
const ResultUI = {
  show(type, party) {
    const t        = document.getElementById('result-title');
    const st       = document.getElementById('result-stats');
    const partyEl  = document.getElementById('result-party');
    const retryBtn = document.getElementById('result-retry-btn');
    const againBtn = document.getElementById('result-again-btn');

    // Party member cards — shown on all result types
    if (partyEl && party.length) {
      partyEl.innerHTML = party.map((m, i) => {
        const col   = (typeof CHAR_COLOR !== 'undefined' && CHAR_COLOR[m.charId]) || '#aaa';
        const isKO  = !Battle.alive(m);
        const hpTxt = isKO ? '0' : m.hp;
        const spriteId = `result-sprite-${m.charId}-${i}`;
        return `<div class="result-member${isKO ? ' ko' : ''}" style="border-color:${col}40">
          <div class="result-member-visual">
            <div id="${spriteId}" class="ui-sprite-result"></div>
          </div>
          <div class="result-member-content">
            <div class="rm-name" style="color:${col}">${m.displayName}</div>
            <div class="rm-lv">LV ${m.lv}</div>
            <div class="rm-hp${isKO ? ' zero' : ''}">HP ${hpTxt}/${m.maxHp}</div>
            <div class="rm-exp" style="color:#8888bb">EXP ${m.exp}</div>
            ${isKO ? '<div style="color:var(--red);font-size:9px">FALLEN</div>' : ''}
          </div>
        </div>`;
      }).join('');

      // Initialize high-res sprites
      if (typeof SpriteRenderer !== 'undefined') {
        party.forEach((m, i) => {
          const sprEl = document.getElementById(`result-sprite-${m.charId}-${i}`);
          if (sprEl) SpriteRenderer.setFrame(sprEl, m.charId, Battle.alive(m) ? 'idle' : 'fallen', 80);
        });
      }
    } else if (partyEl) {
      partyEl.innerHTML = '';
    }

    if (type === 'victory') {
      if (typeof SFX !== 'undefined') SFX.victory();
      t.textContent = '✨ VICTORY! ✨';
      t.className = 'result-title victory';
      const totalGold = party.reduce((s, m) => s + (m.gold || 0), 0);
      st.innerHTML = `All enemies defeated!<br><span class="val">+Gold collected this run: ${totalGold}</span>`;
      if (retryBtn) retryBtn.style.display = 'none';
      if (againBtn) againBtn.textContent = '▶ PLAY AGAIN';
    } else if (type === 'defeat') {
      if (typeof SFX !== 'undefined') SFX.defeat();
      t.textContent = '💀 GAME OVER 💀';
      t.className = 'result-title defeat';
      st.innerHTML = `The party has fallen...`;
      if (retryBtn) retryBtn.style.display = '';
      if (againBtn) againBtn.textContent = '⬅ MENU';
    } else {
      t.textContent = '💨 ESCAPED!';
      t.className = 'result-title escaped';
      st.innerHTML = `The party fled from battle!`;
      if (retryBtn) retryBtn.style.display = 'none';
      if (againBtn) againBtn.textContent = '▶ PLAY AGAIN';
    }

    if (typeof Focus !== 'undefined') {
      Focus.setContext('result-screen');
    }
    showScreen('result-screen');
  }
};
