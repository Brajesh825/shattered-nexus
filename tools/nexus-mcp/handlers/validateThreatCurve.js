import fs from "fs/promises";
import path from "path";
import vm from "vm";

export async function handleValidateThreatCurve(args, rootDir) {
  const { targetBossId, partyAverageLevel = 15, simulatedRounds = 20, partySustainProfile = "balanced" } = args;

  try {
    // Read core production data files
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

    // Prepare robust VM context environment
    const sandbox = {
      console,
      setTimeout,
      Math: Object.create(Math, {
        random: { value: () => 0.5 }
      }),
      module: { exports: {} },
      window: {},
      globalThis: {},
      G: {},
      PassiveSystem: {
        getStatMultiplier: () => 1.0,
        getStatBonus: () => 0,
      },
    };
    sandbox.globalThis = sandbox;
    sandbox.window = sandbox;

    vm.createContext(sandbox);

    // Compile modules inside sandboxed workspace
    vm.runInContext(scalingSrc, sandbox, { filename: "scaling-config.js" });
    sandbox.NexusScaling = sandbox.module.exports || sandbox.NexusScaling;

    vm.runInContext(enemyScalingSrc, sandbox, { filename: "enemy-scaling.js" });
    sandbox.EnemyScaling = sandbox.module.exports || sandbox.EnemyScaling;

    vm.runInContext(combatEngineSrc, sandbox, { filename: "combat-engine.js" });
    const CombatEngine = sandbox.module.exports || sandbox.CombatEngine;

    vm.runInContext(partySrc, sandbox, { filename: "party.js" });
    sandbox.computeStats = sandbox.module.exports.computeStats || sandbox.computeStats;

    // Resolve canonical boss blueprint supporting custom identifier aliases
    const resolvedBossId = targetBossId === "valdor_king" ? "galdor_king" : targetBossId;
    const bossDef = enemiesData.find((e) => e.id === resolvedBossId) || enemiesData[0];
    const bossUnit = sandbox.EnemyScaling.buildEnemyEntry(
      bossDef,
      partyAverageLevel,
      true, // Guarantee Boss multiplier expansions evaluate natively
      1,
      sandbox.NexusScaling
    );

    // Prepare canonical asymmetric 4-member striking party (Aya, Tao, Lulu, Rei)
    const canonicalTeamIds = ["aya", "tao", "lulu", "rei"];
    const partyMembers = canonicalTeamIds.map((charId) => {
      const charProfile = charactersData.find((c) => c.id === charId) || {
        name: charId.toUpperCase(),
        base_stats: { hp: 70, mp: 30, atk: 18, def: 12, spd: 14, mag: 12, lck: 10 },
        stat_bonuses: {},
        class_affinity: ["vanguard"]
      };
      const resolvedClassId = charProfile.class_affinity?.[0] || "vanguard";
      const clsProfile = classesData.find((c) => c.id === resolvedClassId) || classesData[0];
      
      const targetCharStub = {
        ...charProfile,
        lv: partyAverageLevel
      };
      const stats = sandbox.computeStats(targetCharStub, clsProfile);
      return {
        name: charProfile.name || charId,
        level: partyAverageLevel,
        hp: stats.hp,
        maxHp: stats.hp,
        atk: stats.atk,
        def: stats.def,
        mag: stats.mag || 12,
        cls: clsProfile,
        isAlive: true,
        turnCount: 0
      };
    });

    // Extract production attributes
    let currentBossHp = bossUnit.hp;
    const initialBossMaxHp = bossUnit.hp;
    let bossCurrentPhaseIdx = 0;
    let maxMultiplierObserved = 1.0;
    let maxCapViolations = 0;
    let currentPhaseMultiplier = 1.0;
    let currentEventMultiplier = 1.0;

    const phaseAuditLog = [];
    const statPhases = Array.isArray(bossDef.statPhases) ? bossDef.statPhases : [];
    const battleEvents = Array.isArray(bossDef.battleEvents) ? JSON.parse(JSON.stringify(bossDef.battleEvents)) : [];

    // Log base phase mapping
    phaseAuditLog.push({
      phaseIndex: 0,
      triggerThreshold: "100%",
      status: "STABLE",
      mitigationShift: "0%"
    });

    // Execute round-by-round Virtual Action Loops
    let round = 1;
    let partyTotalHpPool = partyMembers.reduce((sum, m) => sum + m.hp, 0);
    const initialPartyTotalHp = partyTotalHpPool;

    for (; round <= simulatedRounds; round++) {
      if (currentBossHp <= 0 || partyTotalHpPool <= 0) break;

      // ─── Phase Shift Trigger Check ───
      const hpPct = currentBossHp / initialBossMaxHp;
      const nextPhase = statPhases[bossCurrentPhaseIdx];
      const targetThreshold = nextPhase ? (nextPhase.hpThreshold !== undefined ? nextPhase.hpThreshold : (nextPhase.hp !== undefined ? nextPhase.hp : 0.5)) : 0;
      if (nextPhase && hpPct <= targetThreshold) {
        bossCurrentPhaseIdx++;
        // Apply phase stat transformation simulation safely
        const simulatedMult = nextPhase.atk !== undefined ? nextPhase.atk : (nextPhase.statMultiplier || 1.5);
        currentPhaseMultiplier = simulatedMult;
        
        const cumulativeScalar = currentPhaseMultiplier * currentEventMultiplier;
        if (cumulativeScalar > maxMultiplierObserved) {
          maxMultiplierObserved = cumulativeScalar;
        }
        // Enforce absolute 8.0x mitigation ceiling cap
        if (cumulativeScalar > 8.0) {
          maxCapViolations++;
        }
        phaseAuditLog.push({
          phaseIndex: bossCurrentPhaseIdx,
          triggerThreshold: `${Math.round(targetThreshold * 100)}%`,
          status: cumulativeScalar > 8.0 ? "CLAMPED_AT_CEILING" : "STABLE",
          mitigationShift: `+${Math.round((cumulativeScalar - 1) * 100)}% (Cumulative ATK: ${cumulativeScalar.toFixed(2)}x)`
        });
      }

      // ─── Battle Events Trigger Check ───
      for (const evt of battleEvents) {
        if (evt.fired) continue;
        const trig = evt.trigger;
        if (trig && trig.type === "hp" && hpPct <= (trig.threshold || 0.5)) {
          evt.fired = true;
          const statusBuff = evt.onComplete?.addStatus;
          if (statusBuff && statusBuff.value) {
            currentEventMultiplier = statusBuff.value;
            
            const cumulativeScalar = currentPhaseMultiplier * currentEventMultiplier;
            if (cumulativeScalar > maxMultiplierObserved) {
              maxMultiplierObserved = cumulativeScalar;
            }
            if (cumulativeScalar > 8.0) {
              maxCapViolations++;
            }
            phaseAuditLog.push({
              phaseIndex: `Event_${evt.id}`,
              triggerThreshold: `${Math.round((trig.threshold || 0.5) * 100)}%`,
              status: cumulativeScalar > 8.0 ? "CLAMPED_AT_CEILING" : "EVENT_BUFF_STABLE",
              mitigationShift: `+${Math.round((cumulativeScalar - 1) * 100)}% (${statusBuff.label || 'Buff'}, Effective ATK: ${cumulativeScalar.toFixed(2)}x)`
            });
          }
        }
      }

      // ─── Party Rotation Phase (Skills, Ultimates & Dynamic Elemental Rx) ───
      let compositeRoundDmg = 0;
      let roundTargetAura = null;
      
      // Derive effective boss active parameters clamped at ceiling
      const activeBossDef = Math.min(8.0, CombatEngine.getStat(bossUnit, "def") * currentPhaseMultiplier);
      
      for (const member of partyMembers) {
        if (!member.isAlive) continue;
        
        // Track unique individual action turn economy count per party member
        member.turnCount++;
        const isMemberUltimateTurn = member.turnCount % 3 === 0;
        
        // Resolve elemental attribute dynamically via class profile or natural binding
        const memberElement = member.cls?.element || (member.name.toLowerCase() === "aya" ? "ice" : (member.name.toLowerCase() === "tao" ? "fire" : "physical"));
        const elemMult = CombatEngine.elemMult(memberElement, bossUnit, null);
        
        // Evaluate native low HP passive multipliers dynamically if defined in characters schema
        const isLowHp = (member.hp / member.maxHp) <= 0.5;
        let passiveAtkBoost = 1.0;
        if (isLowHp && member.cls?.id?.includes("incinerator")) {
          passiveAtkBoost = 1.35; // Canonical Spirit Incinerator low-HP threshold modifier
        }
        
        // Model dynamic environmental aura combinations natively
        let finalReactionMult = 1.0;
        if (memberElement === "fire" && roundTargetAura === "ice") {
          finalReactionMult = 2.0; // Dynamic Melt multiplication
          roundTargetAura = null;
        } else if (memberElement === "ice" || memberElement === "water") {
          roundTargetAura = memberElement;
        }
        
        // Ability output weighting mapping: Burst available exactly on every 3rd turn of this character's individual action economy
        const outputWeight = isMemberUltimateTurn ? 2.5 : 1.3;
        
        const baseDmg = CombatEngine.physDmg(
          member.atk * outputWeight * passiveAtkBoost,
          activeBossDef,
          elemMult * finalReactionMult,
          { atkLevel: partyAverageLevel, defLevel: partyAverageLevel }
        );
        
        compositeRoundDmg += Math.max(1, baseDmg);
        if (currentBossHp - compositeRoundDmg <= 0) break;
      }
      currentBossHp = Math.max(0, currentBossHp - compositeRoundDmg);

      // ─── Boss Asymmetric Sweeper Output Phase ───
      if (currentBossHp > 0) {
        // Calculate true combined asymmetric force output
        const activeBossAtk = Math.min(8.0 * CombatEngine.getStat(bossUnit, "atk"), CombatEngine.getStat(bossUnit, "atk") * currentPhaseMultiplier * currentEventMultiplier);
        
        // Frontline absorption calculation
        const targetMember = partyMembers.find(m => m.isAlive) || partyMembers[0];
        const bossDmgSweep = CombatEngine.physDmg(
          activeBossAtk,
          targetMember.def,
          1.0,
          { atkLevel: partyAverageLevel, defLevel: partyAverageLevel }
        );

        // Apply sustain logic mitigation
        const sustainRecoveryFactor = partySustainProfile === "defensive" ? 0.6 : (partySustainProfile === "aggressive" ? 0.2 : 0.4);
        const netDamageTaken = Math.max(5, Math.floor(bossDmgSweep * (1 - sustainRecoveryFactor)));

        targetMember.hp -= netDamageTaken;
        if (targetMember.hp <= 0) {
          targetMember.hp = 0;
          targetMember.isAlive = false;
        }
        partyTotalHpPool = partyMembers.reduce((sum, m) => sum + m.hp, 0);
      }
    }

    const finalSurvivalPct = (partyMembers.filter(m => m.isAlive).length / partyMembers.length) * 100;

    const reportOutput = {
      encounterAnalyzed: targetBossId,
      simulationMetrics: {
        simulatedCast: partyMembers.map(m => `${m.name} (Lv.${m.level})`),
        totalRoundsSimulated: round - 1,
        partySurvivalRate: `${finalSurvivalPct.toFixed(1)}%`,
        effectiveBossTTKSeconds: parseFloat(((round - 1) * 6.0).toFixed(1)), // 6 seconds per asymmetric rotation round
        maxAttributeMultiplierHit: `${maxMultiplierObserved.toFixed(1)}x`,
        statusCeilingViolations: maxCapViolations
      },
      phaseTransformAudit: phaseAuditLog,
      balanceEquilibrium: maxCapViolations > 0 ? "CLAMPED" : "PRESERVED"
    };

    return {
      content: [{ type: "text", text: JSON.stringify(reportOutput, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Threat Curve validation failed: ${err.message}` }, null, 2) }],
    };
  }
}
