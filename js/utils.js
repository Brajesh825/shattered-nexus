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
