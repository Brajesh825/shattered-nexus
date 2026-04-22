const ReactionEffects = (() => {
  function buildSwirlTargets(target, group, isAlive) {
    return (group || []).filter(unit => unit && unit !== target && isAlive(unit));
  }

  function applyReactionEffects({
    reaction,
    target,
    group = [],
    damage = 0,
    addStatus,
    applyAura,
    isAlive = unit => !unit.isKO,
    scaling = NexusScaling
  }) {
    if (!reaction || !target) {
      return {
        defShattered: false,
        stunned: false,
        burning: false,
        swirlAura: null,
        swirlTargets: []
      };
    }

    const result = {
      defShattered: false,
      stunned: false,
      burning: false,
      swirlAura: null,
      swirlTargets: []
    };

    if (reaction.debuff === 'def') {
      addStatus(target, { id: 'debuff_def_shatter', label: 'Shattered', icon: '❄️', stat: 'def', type: 'mult', value: 0.7, turns: 1 });
      result.defShattered = true;
    }

    if (reaction.stun) {
      addStatus(target, { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1 });
      result.stunned = true;
    }

    if (reaction.dot) {
      addStatus(target, {
        id: 'debuff_burn',
        label: 'Burn',
        icon: '🔥',
        stat: 'hp',
        type: 'dot',
        value: Math.floor(damage * scaling.engine.burnReactionDotPercent),
        turns: 3
      });
      result.burning = true;
    }

    if (reaction.swirlAura && applyAura) {
      const swirlTargets = buildSwirlTargets(target, group, isAlive);
      swirlTargets.forEach(unit => applyAura(unit, reaction.swirlAura));
      result.swirlAura = reaction.swirlAura;
      result.swirlTargets = swirlTargets;
    }

    return result;
  }

  return {
    applyReactionEffects
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReactionEffects;
}
