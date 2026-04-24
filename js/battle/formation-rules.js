const FormationRules = (() => {
  function getRearguardEvasionBonus(targetIdx, isMagic, scaling = NexusScaling) {
    return (!isMagic && targetIdx === 1) ? (scaling.engine.rearguardEvasionBonus || 0) : 0;
  }

  function resolveVanguardInterception(party, target, targetIdx, ability, isAlive) {
    const isPhysical = !ability || ability.type === 'physical';
    if (!isPhysical || targetIdx === -1 || targetIdx === 2) {
      return { target, targetIdx, intercepted: false };
    }

    const vanguard = party?.[2];
    if (!vanguard || !isAlive(vanguard)) {
      return { target, targetIdx, intercepted: false };
    }

    return { target: vanguard, targetIdx: 2, intercepted: true };
  }

  return {
    getRearguardEvasionBonus,
    resolveVanguardInterception
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormationRules;
}
