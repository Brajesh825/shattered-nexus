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
      inventory: G.inventory || []
    };
  }

  function validateSaveStructure(s) {
    if (!s || typeof s !== 'object') return false;
    // Mandatory fields for a functional story session
    const required = ['arcIdx', 'selectedChars'];
    for (const key of required) {
      if (typeof s[key] === 'undefined') return false;
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
