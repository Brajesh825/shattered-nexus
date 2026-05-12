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
    const partyPath = path.join(rootDir, "js/systems/party.js");
    const classesJsonPath = path.join(rootDir, "data/classes.json");
    const enemiesJsonPath = path.join(rootDir, "data/enemies.json");
    const charactersJsonPath = path.join(rootDir, "data/characters.json");

    const scalingSrc = await fs.readFile(scalingPath, "utf-8");
    const enemyScalingSrc = await fs.readFile(enemyScalingPath, "utf-8");
    const combatEngineSrc = await fs.readFile(combatEnginePath, "utf-8");
    const partySrc = await fs.readFile(partyPath, "utf-8");
    const classesData = JSON.parse(await fs.readFile(classesJsonPath, "utf-8"));
    const enemiesData = JSON.parse(await fs.readFile(enemiesJsonPath, "utf-8"));
    const charactersData = JSON.parse(await fs.readFile(charactersJsonPath, "utf-8"));

    // Prepare sandbox context
    const sandbox = {
      console,
      setTimeout,
      Math: Object.create(Math, {
        random: { value: () => 0.5 }
      }),
      module: { exports: {} },
      window: {},
      globalThis: {},
      G: {}, // Provide empty Global namespace for robust module encapsulation
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

    vm.runInContext(partySrc, sandbox, { filename: "party.js" });
    sandbox.computeStats = sandbox.module.exports.computeStats || sandbox.computeStats;

    // Retrieve character and hero class definitions safely
    const charProfile = characterId ? charactersData.find((c) => c.id === characterId) : null;
    const resolvedClassId = heroClassId || (charProfile?.class_affinity?.[0]) || "vanguard";
    const heroCls = classesData.find((c) => c.id === resolvedClassId) || classesData[0];

    // Leverage true production computeStats function to derive unified unit states natively
    const mockChar = charProfile ? {
      ...charProfile,
      lv: heroLevel
    } : {
      base_stats: { hp: 100, mp: 50, atk: 15, def: 10, spd: 10, mag: 10, lck: 10 },
      stat_bonuses: {},
      lv: heroLevel
    };

    const computedHeroStats = sandbox.computeStats(mockChar, heroCls);

    // Construct unified player unit states aligned with live party structures
    const heroUnit = {
      name: charProfile?.name || heroCls?.name || "Hero",
      level: heroLevel,
      hp: computedHeroStats.hp,
      maxHp: computedHeroStats.hp,
      atk: computedHeroStats.atk,
      def: computedHeroStats.def,
      cls: heroCls,
      statuses: [],
      statPhases: [],
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

    // Retrieve final production stat evaluations natively
    const heroFinalAtk = CombatEngine.getStat(heroUnit, "atk");
    const heroFinalDef = CombatEngine.getStat(heroUnit, "def");
    const enemyFinalAtk = CombatEngine.getStat(enemyUnit, "atk");
    const enemyFinalDef = CombatEngine.getStat(enemyUnit, "def");

    // Evaluate physical interception rules based on slot setup
    let finalAtkToUse = enemyFinalAtk;
    let interceptionTriggered = false;
    if (formationSlot === 2) {
      // Vanguard interception slot mitigates direct inbound kinetic physical strikes
      finalAtkToUse = Math.max(1, Math.floor(finalAtkToUse * 0.85));
      interceptionTriggered = true;
    }

    // Capture true production elemental reaction factors natively
    const heroElemMult = CombatEngine.elemMult(heroCls?.element || "physical", enemyUnit, null);
    const enemyElemMult = CombatEngine.elemMult(enemyUnit.element || "physical", heroUnit, null);

    // Run core engine math functions directly
    const sampleHeroDmg = CombatEngine.physDmg(heroFinalAtk, enemyFinalDef, heroElemMult, { atkLevel: heroLevel, defLevel: heroLevel });
    const sampleEnemyDmg = CombatEngine.physDmg(finalAtkToUse, heroFinalDef, enemyElemMult, { atkLevel: heroLevel, defLevel: heroLevel });

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
        heroEffectiveAtk: heroFinalAtk,
        heroEffectiveDef: heroFinalDef,
        enemyScaledHp: enemyUnit.hp,
        enemyScaledAtk: enemyFinalAtk,
        enemyScaledDef: enemyFinalDef,
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
