/**
 * combat-engine.js — Shattered Nexus
 * Pure mathematical functions for RPG combat calculations.
 * Decoupled from global state (G) to improve testability.
 */
const CombatEngine = (() => {

  // Balance constants — pulling from NexusScaling.mechanics
  const MAG_MITIGATION_RATE = NexusScaling.mechanics.magMitigationRate;
  function getPassiveSystem() {
    if (typeof PassiveSystem !== 'undefined') return PassiveSystem;
    if (typeof globalThis !== 'undefined') return globalThis.PassiveSystem;
    return undefined;
  }

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
      else if (stat === 'healBoost') base = 1.0;
      else if (stat === 'evasion') base = 0.0;
      else base = 0;
    }

    // 0. Boss Phase Modifiers (Non-stacking per stat; takes highest triggered mult)
    if (unit.statPhases) {
      let maxPhaseMult = 1.0;
      unit.statPhases.forEach(p => {
        if (p.triggered && p[stat] !== undefined) {
          maxPhaseMult = Math.max(maxPhaseMult, p[stat]);
        }
      });
      base *= maxPhaseMult;
    }

    let pMult = 1.0;
    let sBonus = 0;
    let flat = 0;

    // 1. Calculate Passive Multiplier (Capped at 2.5x - "Base Scaling")
    const passiveSystem = getPassiveSystem();
    if (passiveSystem) {
      pMult *= passiveSystem.getStatMultiplier(unit, stat);
      flat += passiveSystem.getStatBonus(unit, stat);
    }
    const cappedPassive = Math.min(NexusScaling.caps.statMult || 2.5, pMult);

    // 2. Calculate Status Bonuses (Additive Stacking for Moves - Uncapped by Base)
    // reductionMult is tracked separately because cappedPassive is already captured above;
    // multiplying pMult here would have no effect on finalMult.
    let reductionMult = 1.0;
    (unit.statuses || []).forEach(s => {
      if (s.stat === stat || s.type === stat) {
        if (s.type === 'mult') sBonus += (s.value - 1.0);
        else if (s.type === 'reduction') reductionMult *= s.value;
        else if (s.type === 'flat') flat += s.value;
      }
    });

    // 3. Combine and apply HP-Based Stat Phases (Universal System)
    let finalMult = Math.max(0.2, cappedPassive + sBonus);
    
    if (unit.statPhases && unit.hp && unit.maxHp) {
      const hpRatio = unit.hp / unit.maxHp;
      // Sort phases by HP descending to find the deepest reached phase
      const activePhase = [...unit.statPhases]
        .sort((a, b) => a.hp - b.hp)
        .find(p => hpRatio <= p.hp);
      
      if (activePhase && activePhase[stat]) {
        finalMult *= activePhase[stat];
      }
    }

    // 4. Final Result with Absolute Safety Cap (8.0x - "Extreme Premium")
    finalMult = Math.min(8.0, finalMult);
    const result = (base + flat) * finalMult;

    // 4. Handle Float-based Combat Stats
    if (stat === 'accuracy') return Math.max(NexusScaling.caps.accuracyMin, Math.min(1.0, result));
    if (stat === 'critRate') return Math.min(NexusScaling.caps.critRate, result);
    if (stat === 'reduction') return Math.max(1 - NexusScaling.caps.mitigation, reductionMult);
    if (stat === 'evasion') return Math.min(NexusScaling.caps.evasion || 0.75, result);

    const floor = Math.max(1, Math.floor(result)); // Minimum 1 for primary stats
    if (stat === 'hp' || stat === 'maxHp' || stat === 'mp' || stat === 'maxMp') return Math.min(NexusScaling.caps.maxHp, floor);
    return Math.min(NexusScaling.caps.maxStat, floor);
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
   * Rolls for a hit. Consolidated evasion and accuracy check.
   */
  function rollHit(attacker, defender, bonusEvasion = 0) {
    const acc = getStat(attacker, 'accuracy');
    const eva = getStat(defender, 'evasion') + bonusEvasion;
    
    // Chance = Accuracy - Evasion. Minimum 5% pity hit chance.
    const chance = Math.max(0.05, acc - eva);
    return Math.random() < chance;
  }

  /**
   * Rolls for a critical hit.
   */
  function rollCrit(attacker) {
    const baseCrit = getStat(attacker, 'critRate');
    const lckBonus = (getStat(attacker, 'lck') || 0) * 0.01; // +1% crit per LCK point
    const chance = Math.min(NexusScaling.caps.critRate, baseCrit + lckBonus); // Cap crit rate
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
if (typeof window !== 'undefined') window.CombatEngine = CombatEngine;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CombatEngine;
}
