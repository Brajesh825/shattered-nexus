/**
 * archive.js — RPG+ Bestiary & Records System
 * Tracks encountered enemies, revealed weaknesses, and kill counts.
 */
const Archive = {
  data: {
    bestiary: {}, // { enemyId: { seen: true, kills: 0, weaknesses: [] } }
    story: {},    // { fragmentId: { seen: true, date: Date } }
  },

  init() {
    // Load existing archive from global G (which loads from Save)
    if (G.archive) {
      this.data = { ...this.data, ...G.archive };
      // Ensure story registry exists for legacy saves
      if (!this.data.story) this.data.story = {};
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
    this.sync();
  },

  /**
   * Record a kill
   */
  recordKill(enemyId) {
    this.recordSeen(enemyId);
    this.data.bestiary[enemyId].kills++;
    this.sync();
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
    this.sync();
  },

  /**
   * Record a story fragment or NPC interaction
   */
  recordStoryFragment(fragmentId) {
    if (!this.data.story[fragmentId]) {
      this.data.story[fragmentId] = { seen: true, date: Date.now() };
    }
    this.sync();
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
    // Auto-save if Story system is active
    if (typeof Story !== 'undefined' && Story._doSave) Story._doSave();
  }
};

// Initialize on script load
if (typeof G !== 'undefined') Archive.init();
