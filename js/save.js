/**
 * save.js — Shattered Nexus Save System v2
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
  async write(state, slot = 0) {
    try {
      const version = (typeof ReleaseConfig !== 'undefined') ? ReleaseConfig.SAVE_VERSION : '1.0';
      const data = { ...state, slot, timestamp: Date.now(), version };
      const json = JSON.stringify(data);
      
      // 1. Browser Persistence
      localStorage.setItem(this._key(slot), json);
      
      // 2. Workspace Sync (Architect Pro Feature)
      // If the sync server is running, we also backup to the filesystem
      if (typeof ReleaseConfig !== 'undefined' && ReleaseConfig.IS_DEV) {
        try {
          await fetch('http://127.0.0.1:3000/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              path: `saves/slot_${slot}.json`,
              data: json
            })
          });
          console.log(`[Save] Sync successful for slot ${slot}`);
        } catch (syncErr) {
          // Silent fail for sync — the localStorage write already succeeded
          console.warn('[Save] Sync bridge not available.');
        }
      }

      this._showToast('Progress saved');
    } catch(e) { 
      console.error('Save.write failed:', e);
      this._showToast('Save failed!');
    }
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
      if (!raw) return null;
      
      let s;
      try {
        s = JSON.parse(raw);
      } catch (parseErr) {
        console.error(`[Save] Corrupt data in slot ${slot}`);
        return { slot, corrupt: true };
      }

      // Migration: Map old character IDs to new ones
      if (typeof migrateCharId === 'function') {
        if (s.selectedChar) s.selectedChar = migrateCharId(s.selectedChar);
        if (s.selectedChars) s.selectedChars = s.selectedChars.map(migrateCharId);
        if (s.unlockedChars) s.unlockedChars = s.unlockedChars.map(migrateCharId);
        if (s.partyStats) {
          s.partyStats.forEach(p => { if (p.charId) p.charId = migrateCharId(p.charId); });
        }
      }
      return s;
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
    const raw = localStorage.getItem(this._key(slot));
    return !!raw;
  },

  /** Returns array of info objects for all 3 slots */
  listAll() {
    return Array.from({ length: this.SLOTS }, (_, i) => {
      const s = this.read(i);
      if (!s) return { slot: i, empty: true };
      if (s.corrupt) return { slot: i, empty: false, corrupt: true, arcName: 'CORRUPT DATA' };
      return { slot: i, empty: false, ...s };
    });
  },

  /* ─── Export / Import ──────────────────────────────────────── */

  /** Trigger a browser download of the slot data as JSON */
  exportSlot(slot = 0) {
    const s = this.read(slot);
    if (!s || s.corrupt) return;
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
      if (this.validateAndImport(e.target.result, slot)) {
        if (onDone) onDone();
      }
    };
    reader.readAsText(file);
  },

  /** 
   * Validates a JSON string and writes it to a slot.
   * Returns true on success, false on failure (shows alert).
   */
  validateAndImport(jsonString, slot = 0) {
    try {
      const data = JSON.parse(jsonString);
      
      // Use SaveContract if available, otherwise fallback to basic check
      const isValid = (typeof SaveContract !== 'undefined') 
        ? SaveContract.validateSaveStructure(data)
        : (typeof data.arcIdx !== 'undefined' || data.corrupt);

      if (!isValid) throw new Error('Not a valid Shattered Nexus save.');

      data.slot = slot;
      data.timestamp = data.timestamp || Date.now();
      localStorage.setItem(this._key(slot), JSON.stringify(data));
      this._showToast(`Slot ${slot + 1} imported`);
      return true;
    } catch(err) {
      if (typeof alert === 'function') alert('Import failed: ' + err.message);
      else console.error('Import failed:', err.message);
      return false;
    }
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
window.Save = Save;
