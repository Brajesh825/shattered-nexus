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
    // Load existing archive from global G (which loads from Save).
    // Safe to call multiple times — always replaces live data with G.archive
    // so switching saves in the Gauntlet never bleeds stale kill counts.
    if (G.archive) {
      this.data = {
        bestiary: { ...(G.archive.bestiary || {}) },
        story:    { ...(G.archive.story    || {}) },
      };
    } else {
      this.data = { bestiary: {}, story: {} };
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
    // Derive enemy list from the map that belongs to this arc (single source of truth)
    const mapDef = typeof MAP_DEFS !== 'undefined'
      ? Object.values(MAP_DEFS).find(m => m.arcId === arcIdx + 1)
      : null;
    if (!mapDef) return false;

    // Collect all unique non-boss enemy IDs from encounter templates
    const enemyIds = [...new Set(
      (mapDef.encounterTemplates || []).flatMap(t => t.enemies || [])
    )];
    if (enemyIds.length === 0) return false;

    // Must have seen and killed at least 5 of every enemy in the template pool
    return enemyIds.every(enemyId => {
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
  }
};

// Initialize on script load
if (typeof G !== 'undefined') Archive.init();
