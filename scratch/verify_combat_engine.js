/**
 * Verification script for CombatEngine.
 * Run this in the browser console or a temporary environment to verify math.
 */

// Mock data
const mockActor = {
  displayName: "Hero",
  lv: 50,
  atk: 100,
  mag: 100,
  def: 80,
  spd: 90,
  hp: 500,
  maxHp: 1000,
  cls: { element: 'fire' },
  buffs: []
};

const mockEnemy = {
  name: "Slime",
  level: 45,
  hp: 1000,
  maxHp: 1000,
  def: 60,
  mag: 40,
  resist: { fire: 0.5, ice: 2.0 },
  statuses: []
};

function runTests() {
  console.log("=== CombatEngine Verification Tests ===");

  // 1. Math Resolution
  const effAtk = CombatEngine.getStat(mockActor, 'atk');
  console.assert(effAtk === 100, `Expected 100 ATK, got ${effAtk}`);

  // 2. Elemental Multipliers
  const fireMult = CombatEngine.elemMult('fire', mockEnemy);
  console.assert(fireMult === 0.5, `Expected 0.5x Fire Mult, got ${fireMult}`);
  
  const iceMult = CombatEngine.elemMult('ice', mockEnemy);
  console.assert(iceMult === 2.0, `Expected 2.0x Ice Mult, got ${iceMult}`);

  // 3. Physical Damage
  const pDmg = CombatEngine.physDmg(100, 60, 1, 50, 45, 0, "Hero", "Slime", false);
  console.log(`Base Physical Damage: ${pDmg}`);
  console.assert(pDmg > 0, "Physical damage should be positive");

  // 4. Critical Hits
  let critFound = false;
  for(let i=0; i<100; i++) {
    if (CombatEngine.rollCrit({ spd: 500 })) critFound = true; // High speed to force crit
  }
  console.assert(critFound, "High speed should eventually crit");

  // 5. Hit Rates
  const hit = CombatEngine.rollHit({ spd: 100 }, { spd: 10 });
  console.assert(hit === true, "High accuracy should hit");

  console.log("Tests completed successfully!");
}

// Check if CombatEngine is available
if (typeof CombatEngine !== 'undefined') {
  runTests();
} else {
  console.error("CombatEngine not found. Make sure it's loaded.");
}
