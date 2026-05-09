/**
 * quest-ui.js — Echo Log (Quest Menu) UI
 */
const QuestUI = (() => {

  function open() {
    const el = document.getElementById('quest-overlay');
    if (!el) return;

    if (typeof UI !== 'undefined') UI.hideAllOverlays();

    _renderList();
    el.style.display = 'flex';

    if (typeof Focus !== 'undefined') Focus.setContext('quest-overlay');
  }

  function close() {
    const el = document.getElementById('quest-overlay');
    if (el) el.style.display = 'none';

    // Intelligent restore: only show pause menu if we are actually paused/in a menu context
    if (typeof MapEngine !== 'undefined' && !MapEngine.isRunning()) {
      const pauseMenu = document.getElementById('map-pause-menu');
      if (pauseMenu) pauseMenu.style.display = 'flex';
      if (typeof Focus !== 'undefined') Focus.setContext('map-pause-menu');
    } else {
      if (typeof Focus !== 'undefined') Focus.setContext(null);
    }
  }

  function _rewardLabel(rewards) {
    const parts = [];
    if (rewards.exp)  parts.push(`${rewards.exp} XP`);
    if (rewards.gold) parts.push(`${rewards.gold}G`);
    if (rewards.item) {
      const def = (typeof G !== 'undefined' && G.items)
        ? G.items.find(i => i.id === rewards.item)
        : null;
      parts.push(def ? def.name : rewards.item);
    }
    return parts.join(' · ') || '—';
  }

  function _renderList() {
    const list = document.getElementById('quest-list');
    if (!list) return;

    const active    = QuestSystem.getActive();
    const completed = QuestSystem.getCompleted();

    if (!active.length && !completed.length) {
      list.innerHTML = `<div style="text-align:center; padding:40px; color:rgba(255,255,255,0.3); font-style:italic;">No active Echoes found. Explore more to find rumors.</div>`;
      return;
    }

    const esc = (typeof escapeHtml === 'function') ? escapeHtml : (v) => v;
    const activeCards = active.map(q => {
      const progress = Math.min(100, (q.current / q.count) * 100);
      return `
        <div class="quest-card" style="
          background: rgba(10, 8, 25, 0.7);
          border: 1px solid rgba(200, 164, 90, 0.3);
          padding: 12px; margin-bottom: 12px; border-radius: 4px;">
          <div style="color:var(--gold); font-weight:bold; margin-bottom:4px;">${esc(q.label)}</div>
          <div style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:8px;">${esc(q.desc)}</div>
          <div style="height:6px; background:rgba(0,0,0,0.4); border-radius:3px; overflow:hidden; margin-bottom:8px;">
            <div style="width:${progress}%; height:100%; background:var(--gold); transition:width 0.3s ease;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:10px; color:rgba(255,255,255,0.4);">Progress: ${q.current} / ${q.count}</div>
            <div style="font-size:10px; color:var(--cyan);">Reward: ${esc(_rewardLabel(q.rewards))}</div>
          </div>
        </div>`;
    }).join('');

    const completedCards = completed.length ? `
      <div style="font-size:11px; color:rgba(255,255,255,0.3); margin:16px 0 8px; letter-spacing:0.05em;">CLAIMED</div>
      ${completed.map(id => `
        <div style="
          background: rgba(10, 8, 25, 0.4);
          border: 1px solid rgba(74, 222, 128, 0.2);
          padding: 10px 12px; margin-bottom: 8px; border-radius: 4px;
          display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11px; color:rgba(74,222,128,0.7);">✔ ${id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
          <div style="font-size:10px; color:rgba(255,255,255,0.25);">Complete</div>
        </div>`).join('')}` : '';

    list.innerHTML = activeCards + completedCards;
  }

  return { open, close };
})();
