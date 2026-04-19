/**
 * combat-engine.js — Shattered Nexus
 * Pure mathematical functions for RPG combat calculations.
 * Decoupled from global state (G) to improve testability.
 */
const CombatEngine = (() => {

  // Balance constants — pulling from NexusScaling.mechanics
  const MAG_MITIGATION_RATE = NexusScaling.mechanics.magMitigationRate;

  /**
   * Returns final combat stats by applying active modifiers.
   * Formula: (base + Sum(Flat)) * Product(Multipliers)
   */
  function getStat(unit, stat) {
    let base = unit[stat];
    if (base === undefined || base === null) {
      if (stat === 'accuracy') base = 0.95;
      else if (stat === 'critRate') base = 0.05;
      else if (stat === 'reduction') base = 1.0;
      else base = 0;
    }

    if (!unit.statuses || !unit.statuses.length) return base;

    let mult = 1.0;
    let flat = 0;

    // 1. Apply Status Multipliers/Flat
    unit.statuses.forEach(s => {
      if (s.stat === stat) {
        if (s.type === 'mult') mult *= s.value;
        else if (s.type === 'flat') flat += s.value;
      }
    });

    // 2. Apply Passive Traits (Data-driven)
    if (typeof PassiveSystem !== 'undefined') {
      mult *= PassiveSystem.getStatMultiplier(unit, stat);
      flat += PassiveSystem.getStatBonus(unit, stat);
    }

    const finalMult = Math.min(3.0, mult); // Safety cap
    const result = (base + flat) * finalMult;

    return (stat === 'accuracy' || stat === 'critRate')
      ? Math.min(1.0, result)
      : Math.floor(result);
  }

  /**
   * Returns multiplier based on elemental affinity.
   */
  function elemMult(element, target, typeChart) {
    if (!element || element === 'physical') return 1.0;

    // Mutant traits overrides
    const traits = target?.mutantTraits || [];
    for (const t of traits) {
      if (t.type === 'immune' && t.element === element) return 0;
      if (t.type === 'shatter' && t.element === element) return NexusScaling.elements.mutantShatter;
    }

    const weak = target?.weakTo || [];
    const resist = target?.resistTo || [];
    if (weak.includes(element)) return NexusScaling.elements.weakness;
    if (resist.includes(element)) return NexusScaling.elements.resistance;

    // Check typeChart if target is a party member (using class element)
    if (typeChart && target?.cls?.element) {
      const clsElem = target.cls.element;
      const row = typeChart[element];
      if (row) {
        if (row.strong.includes(clsElem)) return NexusScaling.elements.weakness;
        if (row.weak.includes(clsElem)) return NexusScaling.elements.resistance;
      }
    }

    return 1.0;
  }

  /**
   * Physical damage calculation.
   */
  function physDmg(atk, def, mult = 1, options = {}) {
    const {
      atkLevel = 1,
      defLevel = 1,
      defPen = 0,
      isCrit = false
    } = options;

    const scaledAtk = atk + (atkLevel * NexusScaling.mechanics.physAtkStep);
    const effectiveDef = def * (1 - Math.min(0.9, defPen));
    const scaledDef = effectiveDef + (defLevel * NexusScaling.mechanics.physDefStep);

    // Formula components
    const base = Math.max(1, scaledAtk - scaledDef * 0.75);
    const critMult = isCrit ? NexusScaling.mechanics.critMult : 1.0;

    return Math.max(1, Math.floor(base * (0.85 + Math.random() * 0.3) * mult * critMult));
  }

  /**
   * Magic damage calculation.
   */
  function magicDmg(mag, mdef, mult = 1, options = {}) {
    const {
      passiveBonus = 1,
      magLevel = 1,
      mdefLevel = 1,
      isCrit = false
    } = options;

    const scaledMag = mag + (magLevel * NexusScaling.mechanics.magAtkStep);
    const magMitigation = (mdef + mdefLevel * NexusScaling.mechanics.magDefStep) * MAG_MITIGATION_RATE;

    const base = Math.max(1, scaledMag - magMitigation);
    const critMult = isCrit ? NexusScaling.mechanics.critMult : 1.0;

    return Math.max(1, Math.floor(base * (0.9 + Math.random() * 0.2) * mult * passiveBonus * critMult));
  }

  /**
   * Rolls for a hit.
   */
  function rollHit(attacker, defender) {
    const acc = getStat(attacker, 'accuracy');
    const eva = defender.evasion || 0;
    const chance = acc - eva;
    return Math.random() < chance;
  }

  /**
   * Rolls for a critical hit.
   */
  function rollCrit(attacker) {
    const baseCrit = getStat(attacker, 'critRate');
    const lckBonus = (getStat(attacker, 'lck') || 0) * 0.01; // +1% crit per LCK point
    const chance = baseCrit + lckBonus;
    return Math.random() < chance;
  }

  return {
    getStat,
    elemMult,
    physDmg,
    magicDmg,
    rollHit,
    rollCrit
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CombatEngine;
}
