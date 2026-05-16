/**
 * Aethelgard (Shattered Nexus) Utility Helpers
 */

/**
 * Escapes HTML special characters to prevent XSS.
 * Use this when rendering user-provided or external data into the DOM.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.escapeHtml = escapeHtml;

/* ── CINEMATIC FX MANAGER ──────────────────────────────── */
const FX = {
  /**
   * Triggers a screen-shatter transition.
   * Creates 16 geometric shards that explode outward.
   */
  shatter(onComplete) {
    const overlay = document.createElement('div');
    overlay.className = 'shatter-overlay active';
    for (let i = 0; i < 16; i++) {
      const shard = document.createElement('div');
      shard.className = 'shatter-shard';
      shard.style.setProperty('--tx', `${(Math.random() - 0.5) * 500}px`);
      shard.style.setProperty('--ty', `${(Math.random() - 0.5) * 500}px`);
      shard.style.setProperty('--tr', `${(Math.random() - 0.5) * 720}deg`);
      overlay.appendChild(shard);
    }
    document.body.appendChild(overlay);
    
    // Visual impact
    document.body.classList.add('impact-blur');
    
    // Brief freeze before the break — slightly longer for cinematic weight
    setTimeout(() => {
      overlay.classList.add('shattered');
      if (onComplete) onComplete();
      
      // Cleanup after longer animation (1.2s in CSS)
      setTimeout(() => {
        overlay.remove();
        document.body.classList.remove('impact-blur');
      }, 1300);
    }, 450);
  }
};
window.FX = FX;
