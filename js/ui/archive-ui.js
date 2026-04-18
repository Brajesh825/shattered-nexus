/**
 * archive-ui.js — RPG+ Bestiary UI
 * Manages rendering and interaction for the enemy archive.
 */
const ArchiveUI = {
  open() {
    const overlay = document.getElementById('bestiary-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    this.renderList();
  },

  close() {
    const overlay = document.getElementById('bestiary-overlay');
    if (overlay) overlay.style.display = 'none';
  },

  renderList() {
    const list = document.getElementById('bestiary-list');
    if (!list || !G.enemies) return;
    list.innerHTML = '';

    G.enemies.forEach(enemy => {
      const entry = Archive.getEntry(enemy.id);
      const row = document.createElement('div');
      row.className = 'bestiary-row' + (entry ? ' discovered' : ' undiscovered');
      
      if (entry) {
        row.innerHTML = `<span class="br-icon">${enemy.icon || '💀'}</span> <span class="br-name">${enemy.name}</span>`;
        row.onclick = () => this.renderDetail(enemy.id);
      } else {
        row.innerHTML = `<span class="br-icon">❓</span> <span class="br-name">???</span>`;
      }
      
      list.appendChild(row);
    });
  },

  renderDetail(enemyId) {
    const detail = document.getElementById('bestiary-detail');
    const enemy = G.enemies.find(e => e.id === enemyId);
    const entry = Archive.getEntry(enemyId);
    if (!detail || !enemy || !entry) return;

    const weaknesses = entry.weaknesses.length > 0
      ? entry.weaknesses.map(w => `<span class="weakness-tag">${w.toUpperCase()}</span>`).join(' ')
      : '<span class="undiscovered-text">Unknown</span>';

    detail.innerHTML = `
      <div class="bd-header">
        <div class="bd-icon-wrap">${enemy.icon || '💀'}</div>
        <div class="bd-meta">
          <div class="bd-name">${enemy.name}</div>
          <div class="bd-tier">Tier ${enemy.tier || 1} — ${enemy.role || 'Elite'}</div>
        </div>
      </div>
      
      <div class="bd-stats-grid">
        <div class="bd-stat"><span>Kills</span> <strong>${entry.kills}</strong></div>
        <div class="bd-stat"><span>Level Range</span> <strong>${enemy.lv || 1}+</strong></div>
      </div>

      <div class="bd-section">
        <div class="bd-section-label">ELEMENTAL WEAKNESSES</div>
        <div class="bd-weakness-list">${weaknesses}</div>
      </div>

      <div class="bd-section">
        <div class="bd-section-label">DESCRIPTION</div>
        <div class="bd-desc">${enemy.description || 'A mysterious inhabitant of the realm. Little is known of its origin.'}</div>
      </div>

      <div class="bd-section">
        <div class="bd-section-label">ABILITIES</div>
        <div class="bd-abilities">
          ${(enemy.abilities || []).map(a => `<div class="bd-ab"><strong>${a.name}</strong>: ${a.description || 'No data.'}</div>`).join('')}
        </div>
      </div>
    `;
  }
};
