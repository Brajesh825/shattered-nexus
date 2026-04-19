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
   * Check if an arc is fully mastered (seen all enemies + 5 kills each)
   */
  isArcMastered(arcIdx) {
    if (typeof Story === 'undefined' || !Story.data) return false;
    const arc = Story.data.arcs[arcIdx];
    if (!arc) return false;
    const pool = arc.enemies_pool || [];
    if (pool.length === 0) return false;

    // Must have seen and killed at least 5 of every enemy in the pool
    return pool.every(enemyId => {
      const entry = this.getEntry(enemyId);
      return entry && entry.seen && entry.kills >= 5;
    });
  },

  /**
   * Get all active mastery buffs based on completed arcs
   */
  getMasteryBuffs() {
    const bonuses = { atk: 0, def: 0, mag: 0, spd: 0, lck: 0 };
    if (typeof Story === 'undefined' || !Story.data) return bonuses;

    for (let i = 0; i < Story.data.arcs.length; i++) {
      if (this.isArcMastered(i)) {
        // Mastery Bonus Table
        if (i === 0) bonuses.atk += 5; // Verdant Vale
        if (i === 1) bonuses.def += 5; // Ember Wastes
        if (i === 2) bonuses.mag += 5; // Sunken Temple
        if (i === 3) bonuses.spd += 5; // Shadow Reach
        if (i === 4) bonuses.lck += 5; // Inner Sanctum
        if (i === 5) bonuses.atk += 10; // Fortress Gates
        if (i === 6) bonuses.def += 10; // Fortress Inner
        if (i === 7) bonuses.atk += 25; // Eternal Void (Legendary Mastery)
      }
    }
    return bonuses;
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
