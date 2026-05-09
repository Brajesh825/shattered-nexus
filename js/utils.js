/**
 * Aethelgard (Shattered Nexus) Utility Helpers
 */

/**
 * Escapes HTML special characters to prevent XSS.
 * Use this when rendering user-provided or external data into the DOM.
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.escapeHtml = escapeHtml;
