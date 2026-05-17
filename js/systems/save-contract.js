const SaveContract = (() => {
  function serializePartyStats(party) {
    return (party || []).map(m => ({
      charId: m.charId,
      classId: m.classId,
      lv: m.lv || 1,
      exp: m.exp || 0,
      gold: m.gold || 0,
      hp: m.hp,
      mp: m.mp,
      isKO: m.isKO || false
    }));
  }

  function buildFreeExploreSaveState(G) {
    return {
      arcIdx: 0,
      chapIdx: -1,
      arcName: 'Free Explore',
      selectedChars: G.selectedChars || [],
      partyStats: serializePartyStats(G.party),
      hero: { lv: G.hero?.lv || 1, exp: G.hero?.exp || 0, gold: G.hero?.gold || 0 },
      unlockedChars: G.unlockedChars || [],
      inventory: G.inventory || [],
      bondProgress: G.bondProgress || {},
      earnedBondRewards: G.earnedBondRewards || [],
      questState: typeof QuestSystem !== 'undefined' ? QuestSystem.save() : null,
      firedScenes: Array.from(G.firedScenes || []),
      nexusTime: G.nexusTime ?? 8.0,
      voidFragments: G.voidFragments || 0,
      weaponsUpgrades: G.weaponsUpgrades || {},
      weaponsLevels: G.weaponsLevels || {},
      equippedWeapons: (G.party || []).reduce((acc, m) => {
        if (m.char?.equippedWeapon) acc[m.charId] = m.char.equippedWeapon;
        return acc;
      }, {})
    };
  }

  function validateSaveStructure(s) {
    if (!s || typeof s !== 'object') {
      console.error('SaveContract: Save object is null or not an object.');
      return false;
    }

    if (!Number.isInteger(s.arcIdx) || s.arcIdx < 0 || s.arcIdx > 7) {
      console.error(`SaveContract: Invalid arcIdx (${s.arcIdx}).`);
      return false;
    }
    if (s.chapIdx !== undefined && (!Number.isInteger(s.chapIdx) || s.chapIdx < -1)) {
      console.error(`SaveContract: Invalid chapIdx (${s.chapIdx}).`);
      return false;
    }
    if (!Array.isArray(s.selectedChars)) {
      console.error('SaveContract: selectedChars is not an array.');
      return false;
    }

    const chars = (typeof CHARACTERS_DATA !== 'undefined' && Array.isArray(CHARACTERS_DATA) && CHARACTERS_DATA.length > 0)
      ? CHARACTERS_DATA
      : (typeof G !== 'undefined' && Array.isArray(G.chars) && G.chars.length > 0 ? G.chars : null);
    
    if (chars) {
      const charIds = new Set(chars.map(c => c.id));
      if (!s.selectedChars.every(id => typeof id === 'string' && charIds.has(id))) {
        console.error('SaveContract: One or more IDs in selectedChars are invalid or missing from registry.', s.selectedChars);
        return false;
      }
      if (s.unlockedChars && (!Array.isArray(s.unlockedChars) || !s.unlockedChars.every(id => typeof id === 'string' && charIds.has(id)))) {
        console.error('SaveContract: Invalid unlockedChars list.', s.unlockedChars);
        return false;
      }
    } else {
      // If registry isn't ready, just check types to avoid blocking early hydration
      if (!s.selectedChars.every(id => typeof id === 'string')) {
        console.error('SaveContract: Non-string ID found in selectedChars during early validation.');
        return false;
      }
    }

    if (s.partyStats !== undefined) {
      if (!Array.isArray(s.partyStats)) return false;
      for (const member of s.partyStats) {
        if (!member || typeof member !== 'object') return false;
        if (typeof member.charId !== 'string') return false;
        // Skip registry check if it's not ready yet
        if (chars && !chars.some(c => c.id === member.charId)) {
          console.error(`SaveContract: partyStats contains unregistered charId: ${member.charId}`);
          return false;
        }
        if (member.lv !== undefined && (!Number.isFinite(member.lv) || member.lv < 1)) return false;
      }
    }

    // Weapon ID validation: strip any equippedWeapon / weaponsUpgrades / weaponsLevels
    // entries whose IDs no longer exist in WEAPONS_DATA (renamed, removed, or typo'd in a future patch).
    // This prevents silent stat corruption from loading stale weapon state.
    const weaponsRegistry = (typeof window !== 'undefined' && window.WEAPONS_DATA)
      ? window.WEAPONS_DATA
      : (typeof WEAPONS_DATA !== 'undefined' ? WEAPONS_DATA : null);
    if (weaponsRegistry) {
      const validWeaponIds = new Set(weaponsRegistry.map(w => w.id));
      if (s.equippedWeapons && typeof s.equippedWeapons === 'object') {
        for (const charId of Object.keys(s.equippedWeapons)) {
          const wId = s.equippedWeapons[charId];
          if (wId && !validWeaponIds.has(wId)) {
            console.warn(`SaveContract: equippedWeapon "${wId}" for char "${charId}" not in WEAPONS_DATA — cleared.`);
            delete s.equippedWeapons[charId];
          }
        }
      }
      if (s.weaponsUpgrades && typeof s.weaponsUpgrades === 'object') {
        for (const wId of Object.keys(s.weaponsUpgrades)) {
          if (!validWeaponIds.has(wId)) {
            console.warn(`SaveContract: weaponsUpgrades key "${wId}" not in WEAPONS_DATA — cleared.`);
            delete s.weaponsUpgrades[wId];
          }
        }
      }
      if (s.weaponsLevels && typeof s.weaponsLevels === 'object') {
        for (const wId of Object.keys(s.weaponsLevels)) {
          if (!validWeaponIds.has(wId)) {
            console.warn(`SaveContract: weaponsLevels key "${wId}" not in WEAPONS_DATA — cleared.`);
            delete s.weaponsLevels[wId];
          }
        }
      }
    }

    if (s.mapId !== undefined && s.mapId !== null) {
      if (typeof s.mapId !== 'string' || !s.mapId) return false;
      if (typeof MAP_DEFS !== 'undefined') {
        const mapDef = MAP_DEFS[s.mapId];
        if (!mapDef) {
          console.error(`SaveContract: Unknown mapId in save: ${s.mapId}`);
          return false;
        }
        if (s.mapX !== undefined && (s.mapX < 0 || s.mapX >= mapDef.width)) {
          console.error(`SaveContract: Invalid mapX coordinate: ${s.mapX}`);
          return false;
        }
        if (s.mapY !== undefined && (s.mapY < 0 || s.mapY >= mapDef.height)) {
          console.error(`SaveContract: Invalid mapY coordinate: ${s.mapY}`);
          return false;
        }
      }
    }

    return true;
  }

  return {
    serializePartyStats,
    buildFreeExploreSaveState,
    validateSaveStructure
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SaveContract;
}
