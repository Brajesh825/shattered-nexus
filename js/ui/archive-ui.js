/**
 * archive-ui.js — RPG+ Bestiary UI
 * Manages rendering and interaction for the enemy archive and story lore.
 */
const ArchiveUI = {
  activeTab: 'bestiary', // 'bestiary' | 'story'

  open() {
    if (typeof MapEngine !== 'undefined' && MapEngine.isRunning()) MapEngine.stop();
    const overlay = document.getElementById('bestiary-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    this.updateProgress();
    this.renderList();
    if (typeof Focus !== 'undefined') {
      Focus.setContext('bestiary-overlay');
    }
  },

  updateProgress() {
    const stats = this.getProgress();
    const titleEl = document.querySelector('.bestiary-title');
    if (titleEl) {
      titleEl.innerHTML = `THE ARCHIVE <span style="font-size:10px; color:var(--text-dim); margin-left:15px; vertical-align:middle; letter-spacing:1px;">COMPLETION: ${stats.total}%</span>`;
    }
  },

  getProgress() {
    const enemiesDiscovered = G.enemies ? G.enemies.filter(e => Archive.getEntry(e.id)).length : 0;
    const enemiesTotal = G.enemies ? G.enemies.length : 1;
    const storiesDiscovered = window.LORE_FRAGMENTS ? window.LORE_FRAGMENTS.filter(f => Archive.data.story[f.id]).length : 0;
    const storiesTotal = window.LORE_FRAGMENTS ? window.LORE_FRAGMENTS.length : 1;
    
    return {
      enemies: Math.round((enemiesDiscovered / enemiesTotal) * 100),
      stories: Math.round((storiesDiscovered / storiesTotal) * 100),
      total: Math.round(((enemiesDiscovered + storiesDiscovered) / (enemiesTotal + storiesTotal)) * 100)
    };
  },

  close() {
    const overlay = document.getElementById('bestiary-overlay');
    if (overlay) overlay.style.display = 'none';
    if (typeof Focus !== 'undefined') {
      Focus.setContext(null);
    }
    if (typeof MapEngine !== 'undefined') MapEngine.resume();
  },

  setTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.b-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab)?.classList.add('active');
    
    // Clear detail view on tab switch
    const detail = document.getElementById('bestiary-detail');
    if (detail) detail.innerHTML = `<div style="text-align:center; padding-top:100px; color:var(--text-dim); font-family:var(--vt);">Select an entry to view details</div>`;
    
    this.renderList();

    if (typeof Focus !== 'undefined') {
      Focus.setContext('bestiary-overlay');
    }
  },

  renderList() {
    const list = document.getElementById('bestiary-list');
    if (!list) return;
    list.innerHTML = '';

    if (this.activeTab === 'bestiary') {
      if (!G.enemies) return;
      G.enemies.forEach(enemy => {
        const entry = Archive.getEntry(enemy.id);
        const row = document.createElement('div');
        row.className = 'bestiary-row' + (entry ? ' discovered' : ' undiscovered');
        
        if (entry) {
          const isMastered = entry.kills >= 5;
          row.innerHTML = `<span class="br-icon">${enemy.icon || '💀'}</span>` +
                          `<span class="br-name">${enemy.name}</span>` +
                          (isMastered ? `<span class="br-mastery-tag" title="Target Mastered">★</span>` : '');
          row.onclick = () => this.renderDetail(enemy.id);
        } else {
          row.innerHTML = `<span class="br-icon">❓</span> <span class="br-name">???</span>`;
        }
        list.appendChild(row);
      });
    } else {
      // Story Tab - Load from dynamic data
      const fragments = window.LORE_FRAGMENTS || [];

      fragments.forEach(frag => {
        const discovered = Archive.data.story && Archive.data.story[frag.id];
        const row = document.createElement('div');
        row.className = 'bestiary-row' + (discovered ? ' discovered' : ' undiscovered');
        
        if (discovered) {
          row.innerHTML = `<span class="br-icon">${frag.icon}</span> <span class="br-name">${frag.title || frag.name}</span>`;
          row.onclick = () => this.renderStoryFrag(frag);
        } else {
          row.innerHTML = `<span class="br-icon">🔒</span> <span class="br-name">LOCKED</span>`;
        }
        list.appendChild(row);
      });
    }
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
        <div class="bd-stat"><span>Eliminated</span> <strong style="color:${entry.kills >= 5 ? 'var(--gold)' : ''}">${entry.kills}x</strong></div>
        <div class="bd-stat"><span>Status</span> <strong>${entry.kills >= 5 ? '<span style="color:var(--gold)">MASTERED</span>' : 'HUNTING'}</strong></div>
      </div>

      <div class="bd-section">
        <div class="bd-section-label">ELEMENTAL WEAKNESSES</div>
        <div class="bd-weakness-list">${weaknesses}</div>
      </div>

      <div class="bd-section">
        <div class="bd-section-label">OBSERVATIONS & LORE</div>
        <div class="bd-desc" style="white-space: pre-wrap; line-height:1.6; font-style:italic; color:rgba(255,255,255,0.7); font-family:var(--vt); font-size:15px; border-left: 2px solid var(--gold-dim); padding-left: 12px;">
${enemy.lore || 'No detailed observations recorded yet.'}
        </div>
      </div>

      <div class="bd-section">
        <div class="bd-section-label">NATURAL ABILITIES</div>
        <div class="bd-abilities">
          ${(enemy.abilities || []).map(a => `<div class="bd-ab"><strong>${a.name}</strong>: ${a.description || 'No data.'}</div>`).join('')}
        </div>
      </div>
    `;
  },

  renderStoryFrag(frag) {
    const detail = document.getElementById('bestiary-detail');
    if (!detail) return;
    detail.innerHTML = `
      <div class="bd-header">
        <div class="bd-icon-wrap">${frag.icon}</div>
        <div class="bd-meta">
          <div class="bd-name">${frag.title || frag.name}</div>
          <div class="bd-tier">Discovered Nexus-Fragment</div>
        </div>
      </div>
      <div class="bd-section" style="margin-top:20px;">
        <div class="bd-desc" style="white-space: pre-wrap; line-height:1.8; color:var(--text); padding:16px; background:rgba(0,0,0,0.2); border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
${frag.description}
        </div>
      </div>
    `;
  }
};
