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

  function _questLabel(id) {
    if (typeof window !== 'undefined' && window.QUESTS_DATA) {
      const def = window.QUESTS_DATA.find(q => q.id === id);
      if (def) return def.label;
    }
    return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  const TYPE_BADGE = { hunt: '⚔ HUNT', gather: '◈ GATHER', mutant_kill: '☠ MUTANT' };

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
      const badge = TYPE_BADGE[q.type] || '';
      return `
        <div class="quest-card">
          <div class="quest-title">
            ${badge ? `<span class="quest-type-badge">${badge}</span>` : ''}
            ${esc(q.label)}
          </div>
          <div class="quest-desc">${esc(q.desc)}</div>
          <div class="quest-progress-wrap">
            <div class="quest-progress-fill" style="width:${progress}%"></div>
          </div>
          <div class="quest-footer">
            <div class="quest-meta">Progress: ${q.current} / ${q.count}</div>
            <div class="quest-reward">Reward: ${esc(_rewardLabel(q.rewards))}</div>
          </div>
        </div>`;
    }).join('');

    const completedCards = completed.length ? `
      <div class="quest-claimed-header">CLAIMED</div>
      ${completed.map(id => `
        <div class="quest-card completed">
          <div class="quest-status-done">✔ ${esc(_questLabel(id))}</div>
          <div class="quest-meta">Complete</div>
        </div>`).join('')}` : '';

    list.innerHTML = activeCards + completedCards;
  }

  return { open, close };
})();
