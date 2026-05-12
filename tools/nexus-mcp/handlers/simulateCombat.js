import fs from "fs/promises";
import path from "path";
import vm from "vm";

export async function handleSimulateCombat(args, rootDir) {
  const { characterId, heroClassId, heroLevel = 10, enemyId = "skeleton", formationSlot = 2 } = args;

  try {
    // Read engine files source buffers
    const scalingPath = path.join(rootDir, "js/scaling-config.js");
    const enemyScalingPath = path.join(rootDir, "js/battle/enemy-scaling.js");
    const combatEnginePath = path.join(rootDir, "js/battle/combat-engine.js");
    const classesJsonPath = path.join(rootDir, "data/classes.json");
    const enemiesJsonPath = path.join(rootDir, "data/enemies.json");
    const charactersJsonPath = path.join(rootDir, "data/characters.json");

    const scalingSrc = await fs.readFile(scalingPath, "utf-8");
    const enemyScalingSrc = await fs.readFile(enemyScalingPath, "utf-8");
    const combatEngineSrc = await fs.readFile(combatEnginePath, "utf-8");
    const classesData = JSON.parse(await fs.readFile(classesJsonPath, "utf-8"));
    const enemiesData = JSON.parse(await fs.readFile(enemiesJsonPath, "utf-8"));
    const charactersData = JSON.parse(await fs.readFile(charactersJsonPath, "utf-8"));

    // Prepare sandbox context
    const sandbox = {
      console,
      setTimeout,
      Math,
      module: { exports: {} },
      window: {},
      globalThis: {},
      PassiveSystem: {
        getStatMultiplier: () => 1.0,
        getStatBonus: () => 0,
      },
    };
    sandbox.globalThis = sandbox;
    sandbox.window = sandbox;

    vm.createContext(sandbox);

    // Compile and run scripts sequentially inside the shared context
    vm.runInContext(scalingSrc, sandbox, { filename: "scaling-config.js" });
    sandbox.NexusScaling = sandbox.module.exports || sandbox.NexusScaling;

    vm.runInContext(enemyScalingSrc, sandbox, { filename: "enemy-scaling.js" });
    sandbox.EnemyScaling = sandbox.module.exports || sandbox.EnemyScaling;

    vm.runInContext(combatEngineSrc, sandbox, { filename: "combat-engine.js" });
    const CombatEngine = sandbox.module.exports || sandbox.CombatEngine;

    // Retrieve character and hero class definitions safely
    const charProfile = characterId ? charactersData.find((c) => c.id === characterId) : null;
    const resolvedClassId = heroClassId || (charProfile?.class_affinity?.[0]) || "vanguard";
    const heroCls = classesData.find((c) => c.id === resolvedClassId) || classesData[0];

    // Compute customized character or generic class baselines
    let baseAtk = charProfile?.base_stats?.atk ?? heroCls?.stats?.atk ?? 15;
    let baseDef = charProfile?.base_stats?.def ?? heroCls?.stats?.def ?? 10;
    let baseHp = charProfile?.base_stats?.hp ?? heroCls?.stats?.hp ?? 100;

    // Apply level growths and inherent stat bonuses
    const growthAtk = (heroCls?.growthPerLevel?.atk ?? 2) + (charProfile?.stat_bonuses?.atk ?? 0);
    const growthDef = (heroCls?.growthPerLevel?.def ?? 1) + (charProfile?.stat_bonuses?.def ?? 0);
    const growthHp = (heroCls?.growthPerLevel?.hp ?? 10) + (charProfile?.stat_bonuses?.hp ?? 0);

    // Construct mock unit states
    const heroUnit = {
      name: charProfile?.name || heroCls?.name || "Hero",
      level: heroLevel,
      hp: baseHp + heroLevel * growthHp,
      maxHp: baseHp + heroLevel * growthHp,
      atk: baseAtk + heroLevel * growthAtk,
      def: baseDef + heroLevel * growthDef,
      cls: heroCls,
      statuses: [],
    };

    // Locate enemy definition and instantiate scaled entry using real scaling logic
    const enemyDef = enemiesData.find((e) => e.id === enemyId) || enemiesData[0];
    const enemyUnit = sandbox.EnemyScaling.buildEnemyEntry(
      enemyDef,
      heroLevel,
      enemyDef.isBoss || false,
      1,
      sandbox.NexusScaling
    );

    // Evaluate physical interception rules based on slot setup
    let finalAtkToUse = enemyUnit.atk;
    let interceptionTriggered = false;
    if (formationSlot === 2) {
      // Vanguard interception slot mitigates direct inbound kinetic physical strikes
      finalAtkToUse = Math.max(1, Math.floor(finalAtkToUse * 0.85));
      interceptionTriggered = true;
    }

    // Run core engine math functions directly
    const sampleHeroDmg = CombatEngine.physDmg(heroUnit.atk, enemyUnit.def, 1.0, { atkLevel: heroLevel, defLevel: heroLevel });
    const sampleEnemyDmg = CombatEngine.physDmg(finalAtkToUse, heroUnit.def, 1.0, { atkLevel: heroLevel, defLevel: heroLevel });

    const expectedHeroTTK = Math.ceil(enemyUnit.hp / sampleHeroDmg);
    const expectedEnemyTTK = Math.ceil(heroUnit.hp / sampleEnemyDmg);

    const simulationReport = {
      simulationMeta: {
        hero: `${heroUnit.name} (Lv.${heroLevel})`,
        enemy: `${enemyUnit.name} (Lv.${heroLevel}${enemyUnit.isBoss ? " BOSS" : ""})`,
        slot: formationSlot,
        interceptionActive: interceptionTriggered,
      },
      computedStats: {
        heroEffectiveAtk: heroUnit.atk,
        heroEffectiveDef: heroUnit.def,
        enemyScaledHp: enemyUnit.hp,
        enemyScaledAtk: enemyUnit.atk,
        enemyScaledDef: enemyUnit.def,
      },
      combatMathOutcomes: {
        heroDamagePerStrike: sampleHeroDmg,
        enemyDamagePerStrike: sampleEnemyDmg,
        turnsToKillEnemy: expectedHeroTTK,
        turnsToSurvive: expectedEnemyTTK,
        verdict: expectedHeroTTK < expectedEnemyTTK ? "VICTORY_LIKELY" : "DEFEAT_PROBABLE",
      },
      status: "Calculated zero-drift metrics via sandboxed context compilation."
    };

    return {
      content: [{ type: "text", text: JSON.stringify(simulationReport, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Headless Simulation failed: ${err.message}` }, null, 2) }],
    };
  }
}
