/**
 * archive.js — RPG+ Bestiary & Records System
 * Tracks encountered enemies, revealed weaknesses, and kill counts.
 */
const Archive = {
  data: {
    bestiary: {}, // { enemyId: { seen: true, kills: 0, weaknesses: [] } }
  },

  init() {
    // Load existing archive from global G (which loads from Save)
    if (G.archive) {
      this.data = { ...this.data, ...G.archive };
    } else {
      G.archive = this.data;
    }
  },

  /**
   * Record an encounter
   */
  recordSeen(enemyId) {
    if (!this.data.bestiary[enemyId]) {
      this.data.bestiary[enemyId] = { seen: true, kills: 0, weaknesses: [] };
    }
  },

  /**
   * Record a kill
   */
  recordKill(enemyId) {
    this.recordSeen(enemyId);
    this.data.bestiary[enemyId].kills++;
  },

  /**
   * Record a revealed weakness
   */
  recordWeakness(enemyId, element) {
    this.recordSeen(enemyId);
    const entry = this.data.bestiary[enemyId];
    if (!entry.weaknesses.includes(element)) {
      entry.weaknesses.push(element);
    }
  },

  /**
   * Get entry for an enemy
   */
  getEntry(enemyId) {
    return this.data.bestiary[enemyId] || null;
  },

  /**
   * Sync data back to global state for saving
   */
  sync() {
    G.archive = this.data;
  }
};

// Initialize on script load
if (typeof G !== 'undefined') Archive.init();
