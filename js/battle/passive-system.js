/**
 * PassiveSystem — Shattered Nexus
 * Orchestrates the data-driven legendary traits of heroes.
 * This system decouples character identity from engine logic.
 */
const PassiveSystem = (() => {

  /**
   * Returns a multiplier for a specific stat from all unit traits.
   * Handles flat multipliers and conditional threshold boosts.
   */
  function getStatMultiplier(unit, stat) {
    if (!unit.passive?.traits) return 1.0;
    let mult = 1.0;
    const hpPercent = (unit.hp / unit.maxHp) || 1.0;

    unit.passive.traits.forEach(t => {
      // 1. Direct Static Boosts (e.g. STAT_BOOST: { stat: "atk", value: 1.15 })
      if (t.type === 'STAT_BOOST' && t.stat === stat && t.value > 1) {
        mult *= t.value;
      }
      
      // 2. Threshold Boosts (e.g. LOW_HP_STAT_BOOST: { stat: "atk", value: 1.35, threshold: 0.5 })
      if (t.type === 'LOW_HP_STAT_BOOST' && t.stat === stat) {
        const threshold = t.threshold || 0.5;
        if (hpPercent < threshold) mult *= (t.value || 1.3);
      }
    });
    return mult;
  }

  /**
   * Returns a flat additive bonus for a specific stat.
   * Used for traits like Ayaka's SPD +3.
   */
  function getStatBonus(unit, stat) {
    if (!unit.passive?.traits) return 0;
    let bonus = 0;
    unit.passive.traits.forEach(t => {
      if (t.type === 'STAT_BOOST' && t.stat === stat && t.value < 10 && t.value % 1 === 0) {
        bonus += t.value;
      }
    });
    return bonus;
  }

  /**
   * Returns a specific value for a trait type (Heal Amp, MP Cost, etc).
   * Supports FALLBACK to 1.0 (multiplier) or custom default.
   */
  function val(unit, traitType, fallback = 1.0) {
    if (!unit.passive?.traits) return fallback;
    const trait = unit.passive.traits.find(t => t.type === traitType);
    if (!trait) return fallback;

    // Handle conditional checks for generic values
    if (trait.threshold) {
      const hpPercent = (unit.hp / unit.maxHp) || 1.0;
      if (hpPercent >= trait.threshold) return fallback;
    }

    return (trait.value !== undefined) ? trait.value : fallback;
  }

  /**
   * Returns true if the unit possesses a specific trait type.
   */
  function hasTrait(unit, traitType) {
    if (!unit.passive?.traits) return false;
    return unit.passive.traits.some(t => t.type === traitType);
  }

  return {
    getStatMultiplier,
    getStatBonus,
    val,
    hasTrait
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PassiveSystem;
}
