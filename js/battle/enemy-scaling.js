const EnemyScaling = (() => {
  function getTierGrowth(tier, scaling = NexusScaling) {
    const tierGrowth = scaling.tierGrowth || {};
    if (tierGrowth[tier]) return tierGrowth[tier];
    return tier > 3 ? tierGrowth[3] : tierGrowth[1];
  }

  function calcEnemyStat(baseStat, statKey, growth, spawnLevel, isBoss, scaling = NexusScaling) {
    const bossMult = isBoss ? (scaling.boss[statKey] || scaling.boss.atk || 1.0) : 1.0;
    const scaledBase = (baseStat * growth.statMult) + ((spawnLevel - 1) * (growth[statKey] || 0));
    return Math.max(1, Math.floor(scaledBase * bossMult));
  }

  function getHordeScale(count, scaling = NexusScaling) {
    if (count >= 4) return scaling.horde[4] || 1.0;
    if (count === 3) return scaling.horde[3] || 1.0;
    return 1.0;
  }

  function calcEnemyRewards(def, growth, spawnLevel, isBoss, groupSize, scaling = NexusScaling) {
    const hordeScale = getHordeScale(groupSize, scaling);
    const levelScale = 1 + (spawnLevel - 1) * 0.1;
    const bossExpMult = isBoss ? (scaling.boss.exp || 1.0) : 1.0;
    const bossGoldMult = isBoss ? (scaling.boss.gold || 1.0) : 1.0;

    return {
      exp: Math.floor(def.reward.exp * growth.expMult * hordeScale * levelScale * bossExpMult),
      gold: Math.floor(def.reward.gold * growth.expMult * hordeScale * bossGoldMult)
    };
  }

  function buildEnemyEntry(def, spawnLevel, isBoss, groupSize, scaling = NexusScaling) {
    const tier = def.tier || 1;
    const growth = getTierGrowth(tier, scaling);
    const actualIsBoss = !!(isBoss || def.isBoss);
    const rewards = calcEnemyRewards(def, growth, spawnLevel, actualIsBoss, groupSize, scaling);

    const finalHp = calcEnemyStat(def.stats.hp, 'hp', growth, spawnLevel, actualIsBoss, scaling);
    const finalAtk = calcEnemyStat(def.stats.atk, 'atk', growth, spawnLevel, actualIsBoss, scaling);
    const finalDef = calcEnemyStat(def.stats.def, 'def', growth, spawnLevel, actualIsBoss, scaling);
    const finalSpd = calcEnemyStat(def.stats.spd, 'spd', growth, spawnLevel, actualIsBoss, scaling);
    const finalMag = calcEnemyStat(def.stats.mag, 'mag', growth, spawnLevel, actualIsBoss, scaling);

    return {
      id: def.id,
      name: def.name,
      level: spawnLevel,
      hp: finalHp,
      maxHp: finalHp,
      atk: finalAtk,
      atk_orig: finalAtk,
      def: finalDef,
      spd: finalSpd,
      mag: finalMag,
      exp: rewards.exp,
      gold: rewards.gold,
      abilityDefs: def.abilities || [],
      palette: def.palette,
      subtitle: def.subtitle || '',
      element: def.element || 'physical',
      weakTo: def.weakTo || [],
      resistTo: def.resistTo || [],
      tier,
      isBoss: actualIsBoss,
      aiRole: def.aiRole || 'attacker',
      aiType: def.aiType || 'random',
      aiStep: 0,
      isKO: false,
      statuses: []
    };
  }

  return {
    getTierGrowth,
    calcEnemyStat,
    getHordeScale,
    calcEnemyRewards,
    buildEnemyEntry
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnemyScaling;
}
