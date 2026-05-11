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
      questState: typeof QuestSystem !== 'undefined' ? QuestSystem.save() : null,
      firedScenes: Array.from(G.firedScenes || [])
    };
  }

  function validateSaveStructure(s) {
    if (!s || typeof s !== 'object') return false;

    if (!Number.isInteger(s.arcIdx) || s.arcIdx < 0 || s.arcIdx > 7) return false;
    if (s.chapIdx !== undefined && (!Number.isInteger(s.chapIdx) || s.chapIdx < -1)) return false;
    if (!Array.isArray(s.selectedChars)) return false;

    const chars = (typeof CHARACTERS_DATA !== 'undefined' && Array.isArray(CHARACTERS_DATA))
      ? CHARACTERS_DATA
      : (typeof G !== 'undefined' && Array.isArray(G.chars) ? G.chars : null);
    if (chars) {
      const charIds = new Set(chars.map(c => c.id));
      if (!s.selectedChars.every(id => typeof id === 'string' && charIds.has(id))) return false;
      if (s.unlockedChars && (!Array.isArray(s.unlockedChars) || !s.unlockedChars.every(id => typeof id === 'string' && charIds.has(id)))) return false;
    } else if (!s.selectedChars.every(id => typeof id === 'string')) {
      return false;
    }

    if (s.partyStats !== undefined) {
      if (!Array.isArray(s.partyStats)) return false;
      for (const member of s.partyStats) {
        if (!member || typeof member !== 'object') return false;
        if (typeof member.charId !== 'string') return false;
        if (chars && !chars.some(c => c.id === member.charId)) return false;
        if (member.lv !== undefined && (!Number.isFinite(member.lv) || member.lv < 1)) return false;
        if (member.hp !== undefined && (!Number.isFinite(member.hp) || member.hp < 0)) return false;
        if (member.mp !== undefined && (!Number.isFinite(member.mp) || member.mp < 0)) return false;
      }
    }

    if (s.mapId !== undefined && s.mapId !== null) {
      if (typeof s.mapId !== 'string' || !s.mapId) return false;
      if (typeof MAP_DEFS !== 'undefined' && !MAP_DEFS[s.mapId]) return false;
      const hasX = s.mapX !== undefined && s.mapX !== null;
      const hasY = s.mapY !== undefined && s.mapY !== null;
      if (hasX !== hasY) return false;
      if (hasX) {
        if (!Number.isInteger(s.mapX) || !Number.isInteger(s.mapY) || s.mapX < 0 || s.mapY < 0) return false;
        const map = typeof MAP_DEFS !== 'undefined' ? MAP_DEFS[s.mapId] : null;
        if (map && (s.mapX >= map.width || s.mapY >= map.height)) return false;
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
