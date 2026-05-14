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
    this.evaluateLoreUnlocks();
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
  recordStoryFragment(fragmentId, silent = false) {
    if (!fragmentId) return;
    let targetFrag = null;
    if (typeof window !== 'undefined' && window.LORE_FRAGMENTS) {
      targetFrag = window.LORE_FRAGMENTS.find(f => f.id === fragmentId)
        || window.LORE_FRAGMENTS.find(f => f.id === 'npc_' + fragmentId)
        || window.LORE_FRAGMENTS.find(f => f.id.includes(fragmentId) || (f.region && f.region === fragmentId));
    }
    const idToUnlock = targetFrag ? targetFrag.id : fragmentId;

    if (!this.data.story[idToUnlock]) {
      this.data.story[idToUnlock] = { seen: true, date: Date.now() };
      if (!silent) this.sync();
    }
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
   * Retroactively evaluates and activates lore fragments based on current progress metrics.
   */
  evaluateLoreUnlocks() {
    if (typeof window === 'undefined' || !window.LORE_FRAGMENTS) return;
    
    // Always unlock foundational records to seed archive context
    const foundational = [
      'world_five_civilizations', 'world_verdant_throne', 'valdris_origin', 
      'valdris_star_maps', 'valdris_nexus_discovery', 'world_nexus_purpose', 
      'world_relics', 'world_oracle_lineage', 'world_fallen_angels', 'essabella_vessel'
    ];
    foundational.forEach(id => this.recordStoryFragment(id, true));

    const bestiary = this.data.bestiary;
    const seen = id => bestiary[id] && bestiary[id].seen;

    // Boss & Regional progression links
    if (seen('galdor_king') || seen('void_knight')) {
      ['vale_green_emperor', 'vale_king_galdor', 'vale_before', 'vale_void_knight_name', 'vale_bridge_ward', 'valdris_seduction_emperor', 'valdris_galdor'].forEach(id => this.recordStoryFragment(id, true));
    }
    if (seen('demon_lord') || seen('spectral_guardian')) {
      ['world_ashveil_kingdom', 'valdris_seduction_archivist', 'cavern_demon_lord_origin', 'cavern_archivist', 'cavern_ghost_knight', 'npc_archivist_distinction'].forEach(id => this.recordStoryFragment(id, true));
    }
    if (seen('forge_sentinel') || seen('dark_phoenix')) {
      ['world_forge_lords', 'world_forge_lords_vault', 'valdris_seduction_forge', 'wastes_forge_lords_end', 'wastes_dark_phoenix', 'wastes_drake_ash'].forEach(id => this.recordStoryFragment(id, true));
    }
    if (seen('deep_archpriest') || seen('kraken')) {
      ['world_tide_priests', 'world_tide_water_market', 'valdris_seduction_tide', 'temple_tide_civilization', 'temple_water_market', 'temple_transformed_people', 'temple_kraken_guardian', 'temple_valdris_speaks', 'essabella_kraken'].forEach(id => this.recordStoryFragment(id, true));
    }
    
    // Side Region links
    if (seen('sunken_leviathan')) {
      ['southern_isles_before', 'npc_survivor_southern_isles'].forEach(id => this.recordStoryFragment(id, true));
    }
    if (seen('river_king')) {
      ['riverlands_river_king', 'npc_old_guard_riverlands'].forEach(id => this.recordStoryFragment(id, true));
    }
    if (seen('molten_golem')) {
      this.recordStoryFragment('ashen_foothills_mines', true);
    }
    if (seen('abyssal_kraken')) {
      this.recordStoryFragment('lighthouse_isles_ghost_ship', true);
    }
    if (seen('abomination')) {
      ['eastern_wetlands_abomination', 'npc_mire_witch'].forEach(id => this.recordStoryFragment(id, true));
    }
    if (seen('dragon')) {
      this.recordStoryFragment('northern_highlands_dragon', true);
    }
    if (seen('lich') || seen('bone_dragon')) {
      this.recordStoryFragment('sky_ruins_origin', true);
    }
  },

  /**
   * Sync data back to global state for saving
   */
  sync() {
    this.evaluateLoreUnlocks();
    G.archive = this.data;
  }
};

// Initialize on script load
if (typeof G !== 'undefined') Archive.init();
