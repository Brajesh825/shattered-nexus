/**
 * scaling-config.js — Shattered Nexus
 * Central Source of Truth for game-wide balance and scaling.
 * 
 * Hierarchy: Tier Growth -> Mutation Scalar -> Boss Multipliers -> Horde Factors.
 */
const NexusScaling = {

  // 1. BASE TIER GROWTH (Stats gained per enemy level)
  // growth: flat value added per level-1.
  // statMult: base multiplier applied to definitions in enemies.json.
  tierGrowth: {
    1: { hp: 5, atk: 1.2, def: 0.5, spd: 0.5, mag: 0.3, statMult: 1.0, expMult: 1.0 },
    2: { hp: 10, atk: 2.5, def: 1.0, spd: 0.8, mag: 0.5, statMult: 1.3, expMult: 1.5 },
    3: { hp: 22, atk: 3.0, def: 2.0, spd: 1.0, mag: 0.6, statMult: 1.3, expMult: 2.5 }
  },

  // 2. BOSS MULTIPLIERS (Applied when isBoss: true)
  // Used to make solo legendary foes durable and dangerous without breaking speed-caps.
  boss: {
    hp: 4.5,    // High durability for testing bursts
    atk: 1.3,    // Recreated the "Good Battle" feeling (Was 1.4x)
    def: 1.3,    // You can actually hurt him now (Was 1.4x)
    spd: 1.1,    // Fair speed (Was 1.2x)
    mag: 1.3,
    exp: 2.5,
    gold: 2.0
  },

  // 3. HORDE SCALING (Reduces individual stats when multiple enemies spawn)
  horde: {
    3: 0.78,     // multiplier for 3 enemies
    4: 0.65      // multiplier for 4+ enemies
  },

  // 4. MUTATION SCALARS (Corrupted and Mutant status)
  // hpMult: specific multiplier for health (Mini-boss durability)
  // statMult: general multiplier for atk/def/mag/spd
  mutation: {
    corrupted: { statMult: 1.28, hpMult: 1.5, levelBonus: 1, expMult: 1.5, goldMult: 1.4 },
    mutant: { statMult: 1.55, hpMult: 4.0, levelBonus: 3, expMult: 2.2, goldMult: 2.0 }
  },

  // 5. ELEMENTAL & REACTION MULTIPLIERS
  // Centralizes all "Magic Numbers" for elemental combat.
  elements: {
    weakness: 1.5,
    resistance: 0.5,
    mutantShatter: 2.0 // Multiplier for enemies with the "Shatter" trait
  },

  mechanics: {
    critMult: 2.0,
    physAtkStep: 1.2, // Bonus per ATK level in physDmg
    physDefStep: 0.6, // Bonus per DEF level in physDmg
    magAtkStep: 0.8,  // Bonus per MAG level in magicDmg
    magDefStep: 0.3,  // Bonus per MDEF level in magicDmg
    magMitigationRate: 0.55 // fraction of mdef applied as reduction
  },

  reactions: {
    melt_fire_on_ice: 2.0,   // Fire hitting Frozen/Ice Aura
    melt_ice_on_fire: 1.5,   // Ice hitting Fire Aura
    vaporize_water_on_fire: 2.0, // Water hitting Fire Aura
    vaporize_fire_on_water: 1.5, // Fire hitting Water Aura
    shatter: 1.5,            // Physical/Earth hitting Frozen
    conductive: 1.3,         // Lightning hitting Water
    conflagration: 1.5,      // Nature hitting Fire
    burning: 1.2,            // Fire hitting Nature
    affinityBonus: 1.5       // Extra mult if reaction aligns with enemy weakness
  },

  // 6. STATUS & BUFF CONSTANTS
  // Multipliers for specific status types and periodic effects.
  status: {
    regenHP: 0.08,           // 8% Max HP per tick
    poisonHP: 0.05,          // 5% Max HP per tick
    mendHealBoost: 1.5,      // 1.5x healing multiplier
    guardianReduction: 0.5,  // 50% damage reduction
    empowerAtk: 1.3,         // 30% ATK boost
    fortifyDef: 1.3,         // 30% DEF boost
    shatterDef: 0.7          // 30% DEF reduction
  },

  // 7. THRESHOLDS & ENGINE CONSTANTS
  thresholds: {
    wounded: 0.5,            // 50% HP for "Low HP" passives/AI
    danger: 0.3,             // 30% HP for Iron Will / Crisis logic
    bloodBlossomBonus: 1.35, // Mult for Blood Blossom passive
    ironWillDefBonus: 1.25,  // 25% DEF boost for Iron Will
    stunChanceDefault: 0.5,
    stealChanceDefault: 0.5
  },

  healing: {
    globalMagMult: 1.5       // Base multiplier for Magic -> Heal conversion
  },

  engine: {
    escapeChanceBase: 0.6,
    rearguardEvasionBonus: 0.3,
    burnReactionDotPercent: 0.2, // 20% of dmg dealt as DOT
    magicDmgFallback: 1.5,
    enemyMagicFallback: 1.3
  }
};
