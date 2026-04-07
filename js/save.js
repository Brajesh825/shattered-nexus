/**
 * save.js — Crystal Chronicles Save System v2
 * • 3 independent save slots
 * • Export slot as downloadable JSON
 * • Import JSON file into a slot
 * • Auto-save toast notification
 * • Migrates legacy v1 single save to slot 0
 */
const Save = {
  SLOTS: 3,
  _key: (slot) => `cc_save_v2_s${slot}`,
  _LEGACY_KEY: 'cc_save_v1',

  /* ─── Core I/O ─────────────────────────────────────────────── */

  /** Write state to a slot and show toast */
  write(state, slot = 0) {
    try {
      const data = { ...state, slot, timestamp: Date.now() };
      localStorage.setItem(this._key(slot), JSON.stringify(data));
      this._showToast('Progress saved');
    } catch(e) { console.warn('Save.write failed:', e); }
  },

  /** Read a slot — migrates legacy save on first access of slot 0 */
  read(slot = 0) {
    try {
      if (slot === 0 && !localStorage.getItem(this._key(0))) {
        const legacy = localStorage.getItem(this._LEGACY_KEY);
        if (legacy) {
          localStorage.setItem(this._key(0), legacy);
          localStorage.removeItem(this._LEGACY_KEY);
        }
      }
      const raw = localStorage.getItem(this._key(slot));
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  },

  /** Delete a slot */
  clear(slot = 0) {
    localStorage.removeItem(this._key(slot));
    if (slot === 0) localStorage.removeItem(this._LEGACY_KEY);
  },

  /** True if a slot has data */
  exists(slot = 0) {
    if (slot === 0 && !localStorage.getItem(this._key(0))) {
      return !!localStorage.getItem(this._LEGACY_KEY);
    }
    return !!localStorage.getItem(this._key(slot));
  },

  /** Returns array of info objects for all 3 slots */
  listAll() {
    return Array.from({ length: this.SLOTS }, (_, i) => {
      const s = this.read(i);
      return s ? { slot: i, empty: false, ...s } : { slot: i, empty: true };
    });
  },

  /* ─── Export / Import ──────────────────────────────────────── */

  /** Trigger a browser download of the slot data as JSON */
  exportSlot(slot = 0) {
    const s = this.read(slot);
    if (!s) return;
    const label = (s.arcName || `slot${slot}`).replace(/[^a-z0-9]/gi, '_');
    const blob  = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const url   = URL.createObjectURL(blob);
    const a     = Object.assign(document.createElement('a'), { href: url, download: `cc_save_${label}.json` });
    a.click();
    URL.revokeObjectURL(url);
  },

  /** Read a File object and write its contents into a slot */
  importSlot(file, slot = 0, onDone) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (typeof data.arcIdx === 'undefined') throw new Error('Not a valid Crystal Chronicles save.');
        data.slot = slot;
        data.timestamp = data.timestamp || Date.now();
        localStorage.setItem(this._key(slot), JSON.stringify(data));
        this._showToast(`Slot ${slot + 1} imported`);
        if (onDone) onDone();
      } catch(err) { alert('Import failed: ' + err.message); }
    };
    reader.readAsText(file);
  },

  /* ─── Helpers ───────────────────────────────────────────────── */

  /** Human-readable date string from a timestamp */
  dateStr(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  /** Show a brief floating toast message */
  _showToast(msg = 'Progress saved') {
    const toast = document.getElementById('save-toast');
    if (!toast) return;
    toast.textContent = '💾 ' + msg;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  },
};
