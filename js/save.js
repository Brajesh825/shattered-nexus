/**
 * save.js — Crystal Chronicles Save System
 * Persists story progress to localStorage.
 */
const Save = {
  KEY: 'cc_save_v1',

  /** Write current state to localStorage */
  write(state) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify({ ...state, timestamp: Date.now() }));
    } catch(e) { console.warn('Save.write failed:', e); }
  },

  /** Read saved state — returns null if none */
  read() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  },

  /** Delete save */
  clear() { localStorage.removeItem(this.KEY); },

  /** Check if a save slot exists */
  exists() { return !!localStorage.getItem(this.KEY); },

  /** Readable timestamp string */
  dateStr(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  },
};
