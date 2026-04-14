
const fs = require('fs');
const FILE = 'js/battle/action-handler.js';
let content = fs.readFileSync(FILE, 'utf8');

// ─── 1. Replace stub with full ActionEngine ────────────────────────────────
const stubPattern = /\/\*\s*=+\s*ACTION ENGINE \(Phase 5\)\s*=+\s*\*\/[\s\S]*?\nconst ActionEngine = \{[\s\S]*?\n\};\n/;

const fullEngine = `
/* ============================================================
   ACTION ENGINE (Phase 5)
   Processes all ability side-effects through discrete handlers.
   ============================================================ */
const ActionEngine = {

  /** Main dispatch: routes ab.type to the correct processor. */
  execute(actor, targets, ab, element, moveConfig = {}, isEnemyAction = false) {
    const proc = this.Processors[ab.type];
    if (proc) proc(actor, targets, ab, element, moveConfig, isEnemyAction);
    else {
      BattleUI.setLog([\`\${actor.displayName || actor.name} uses \${ab.name}!\`], ['']);
      BattleUI.renderEnemyRow(); BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), moveConfig.isUltimate ? 900 : 750);
    }
  },

  Processors: {

    physical:     (a, t, ab, el, mc, ie) => ActionEngine._offensive(a, t, ab, el, mc, ie),
    magic_damage: (a, t, ab, el, mc, ie) => ActionEngine._offensive(a, t, ab, el, mc, ie),

    heal(actor, targets, ab, element, moveConfig) {
      if (typeof SFX !== 'undefined') SFX.heal();
      const e = ab.effect || {};
      const _healAmp = (actor.passive?.id === 'dance_of_haftkarsvar' ? 1.3 : 1.0) * (actor.healBoost || 1.0);
      const _getAmt = m => {
        if (e.healPercent) return Math.floor(m.maxHp * e.healPercent);
        return Math.floor(((e.healBase || 20) + Math.random() * (e.healRandom || 15) + Math.floor(Battle.getStat(actor, 'mag') * 1.5)) * _healAmp);
      };
      targets.forEach(m => {
        if (ab.isUltimate && m.isKO) { m.isKO = false; m.hp = 1; }
        if (!Battle.alive(m) && !ab.isUltimate) return;
        const amt = _getAmt(m);
        m.hp = Math.min(m.maxHp, m.hp + amt);
        BattleUI.popParty(G.party.indexOf(m), amt, 'heal', 'light');
        if (e.cleanse && Battle.alive(m)) {
          m.statuses = (m.statuses || []).filter(s => !s.id.includes('debuff') && s.id !== 'status_frozen' && s.id !== 'status_stunned');
          BattleUI.addLog(\`✨ \${m.displayName} Cleansed!\`, 'heal');
        }
      });
      BattleUI.createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
      if (e.healBoost) Battle.addStatus(actor, { ...StatusSystem.DEFS.heal_boost, turns: e.duration || 3 });
      if (e.spdBuff) { actor.spd = Math.floor(actor.spd * e.spdBuff); actor._spdBuffVal = e.spdBuff; BattleUI.addLog(\`💨 \${actor.displayName}: SPD up!\`, 'heal'); }
      BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), 800);
    },

    regen(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      targets.forEach(m => Battle.addStatus(m, { ...StatusSystem.DEFS.regen, turns: e.duration || 3 }));
      BattleUI.createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
      BattleUI.addLog(\`\${actor.displayName}: Regen activated!\`, 'regen');
      BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), 750);
    },

    buff(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      const _applyBuff = (m, idx) => {
        if (!Battle.alive(m)) return;
        if (e.stat) Battle.addStatus(m, { id: \`buff_\${e.stat}\`, label: \`\${e.stat.toUpperCase()} Up\`, icon: e.stat === 'atk' ? '⚔️' : e.stat === 'def' ? '🛡️' : e.stat === 'spd' ? '💨' : '🔮', stat: e.stat, type: 'mult', value: e.multiplier || 1.3, turns: e.duration || 2 });
        if (e.atkBuff) Battle.addStatus(m, { id: 'buff_atk', label: 'ATK Up', icon: '⚔️', stat: 'atk', type: 'mult', value: e.atkBuff, turns: e.duration || 3 });
        if (e.defBuff) Battle.addStatus(m, { id: 'buff_def', label: 'DEF Up', icon: '🛡️', stat: 'def', type: 'mult', value: e.defBuff, turns: e.duration || 3 });
        if (e.magBuff) Battle.addStatus(m, { id: 'buff_mag', label: 'MAG Up', icon: '🔮', stat: 'mag', type: 'mult', value: e.magBuff, turns: e.duration || 3 });
        if (e.damageReduction) Battle.addStatus(m, { id: 'buff_ward', label: 'Warded', icon: '💎', type: 'reduction', value: 1 - e.damageReduction, turns: e.duration || 3 });
        if (e.hpRegen) Battle.addStatus(m, { ...StatusSystem.DEFS.regen, turns: e.duration || 3 });
        if (e.guardMark) Battle.addStatus(m, { id: 'status_taunt', label: 'Taunt', icon: '🛡️', type: 'buff', turns: e.duration || 3 });
        if (e.summonBoost) m.summonBoost = e.summonBoost;
        BattleUI.createEffectOverlay(idx, element, 'party', ab.id);
      };
      if (e.aoe) G.party.forEach(_applyBuff);
      else _applyBuff(actor, G.activeMemberIdx);
      BattleUI.addLog(\`\${actor.displayName}: \${ab.name}!\${BattleUI._getBuffReport(actor)}\`, 'heal');
      BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), 750);
    },

    debuff(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      const enemy = targets[0];
      if (!enemy) { setTimeout(() => TurnManager.advance(), 750); return; }
      if (e.stat) { Battle.addStatus(enemy, { id: \`debuff_\${e.stat}\`, label: \`\${e.stat.toUpperCase()} Down\`, icon: '🔻', stat: e.stat, type: 'mult', value: e.multiplier || 0.7, turns: e.duration || 2, color: 'var(--red)' }); BattleUI.addLog(\`\${enemy.name}'s \${e.stat.toUpperCase()} lowered!\`, 'magic'); }
      if (e.freezeChance && !StatusSystem.has(enemy, 'status_frozen') && Math.random() < e.freezeChance) { Battle.addStatus(enemy, { id: 'status_frozen', label: 'Frozen', icon: '❄️', type: 'control', turns: 2 }); BattleUI.addLog(\`❄️ \${enemy.name} is Frozen for 2 turns!\`, 'magic'); }
      BattleUI.renderEnemyRow();
      setTimeout(() => TurnManager.advance(), 750);
    },

    stun(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      const enemy = targets[0];
      if (enemy && Math.random() < (e.stunChance || 0.5)) { Battle.addStatus(enemy, { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1 }); BattleUI.addLog(\`💫 \${enemy.name} is stunned!\`, 'magic'); }
      else BattleUI.addLog('Had no effect!', '');
      setTimeout(() => TurnManager.advance(), 750);
    },

    steal(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      const enemy = targets[0];
      if (enemy && Math.random() < (e.stealChance || 0.5)) { const gold = 5 + Math.floor(Math.random() * 10); actor.gold += gold; BattleUI.addLog(\`Stole \${gold} gold from \${enemy.name}!\`, 'steal'); }
      else BattleUI.addLog('Steal failed!', '');
      setTimeout(() => TurnManager.advance(), 750);
    },

    run(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      if (e.guaranteedRun || Math.random() < 0.6) { BattleUI.addLog('Escaped successfully!', 'hi'); setTimeout(() => showResult('escaped'), 1000); return; }
      BattleUI.addLog('Could not escape!', 'dmg');
      BattleUI.renderEnemyRow(); BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), 800);
    }
  },

  /** Shared offensive processor for hero physical/magic attacks */
  _offensive(actor, targets, ab, element, moveConfig, isEnemyAction) {
    const e = ab.effect || {};

    // Cooldown guard (hero actions only)
    if (!isEnemyAction && actor.cooldowns?.[ab.id] > 0) {
      BattleUI.addLog(\`\${ab.name} is on cooldown for \${actor.cooldowns[ab.id]} turns!\`, 'dmg');
      G.busy = false; BattleUI.btns(true); return;
    }
    if (typeof SFX !== 'undefined') { if (ab.type === 'physical') SFX.attack(); else SFX.magic(); }

    const execute = () => {
      let totalDmg = 0;
      targets.forEach(tgt => {
        const tIdx = isEnemyAction ? G.party.indexOf(tgt) : G.enemyGroup.indexOf(tgt);
        // Hero: use resolveOffensiveAction; Enemy: use legacy inline logic (unchanged)
        if (!isEnemyAction) {
          const dmg = resolveOffensiveAction(actor, tgt, tIdx, ab, element);
          totalDmg += dmg;
          if (ab.id === 'cryoclasm' && StatusSystem.has(tgt, 'status_frozen')) actor._cryoReset = true;
        }
      });

      if (!isEnemyAction) {
        if (e.lifeSteal && totalDmg > 0) {
          let lMult = e.lifeSteal;
          if (e.healLowMult && actor.hp / actor.maxHp < 0.5) lMult *= e.healLowMult;
          const healAmt = Math.floor(totalDmg * lMult);
          const healTargets = e.aoe ? G.party.filter(m => Battle.alive(m)) : [actor];
          healTargets.forEach(m => { const idx = G.party.indexOf(m); m.hp = Math.min(m.maxHp, m.hp + healAmt); BattleUI.popParty(idx, healAmt, 'heal', 'light'); });
          BattleUI.addLog(\`💖 \${ab.name}: Restored \${healAmt} HP!\`, 'heal');
        }
        if (e.guardian) { G.party.forEach(m => { if (Battle.alive(m)) Battle.addStatus(m, StatusSystem.DEFS.guardian); }); BattleUI.addLog('🛡️ Phantom Guardian summoned!', 'heal'); }
        if (e.partyBuff) { G.party.forEach((m, idx) => { if (!Battle.alive(m)) return; Battle.addStatus(m, { id: 'status_atk_boost', label: 'ATK+', icon: '⚔️', type: 'mult', stat: 'atk', value: 1.3, turns: 3 }); Battle.addStatus(m, { id: 'status_def_boost', label: 'DEF+', icon: '🛡️', type: 'mult', stat: 'def', value: 1.3, turns: 3 }); BattleUI.popParty(idx, 'ATK & DEF Up!', 'buff', 'holy'); }); BattleUI.addLog(\`✨ \${ab.name}: The party is blessed!\`, 'buff'); }
        if (e.cooldown) actor.cooldowns[ab.id] = e.cooldown + 1;
        if (actor._cryoReset) { actor.cooldowns[ab.id] = 0; BattleUI.addLog('❄ Cryoclasm Reset!', 'regen'); delete actor._cryoReset; }
        _checkDragonLeap(actor);
      }

      BattleUI.renderEnemyRow(); BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), moveConfig.isUltimate ? 900 : 750);
    };

    if (moveConfig.isUltimate) setTimeout(execute, 3000); else execute();
  }
};

`;

if (!stubPattern.test(content)) {
  console.error("ERROR: Could not locate ActionEngine stub to replace.");
  process.exit(1);
}
content = content.replace(stubPattern, fullEngine);

// ─── 2. Simplify heroAbility: route through ActionEngine ──────────────────
const oldHeroAbilityBlock = /function heroAbility\(ab\) \{[\s\S]*?\n\} \/\/ end heroAbility\n/;

const newHeroAbility = `function heroAbility(ab) {
  if (G.busy) return;
  const actor = G.party[G.activeMemberIdx];
  if (!actor) return;

  // MP Cost
  const _mpCost = actor.passive?.id === 'eidolon_bond' ? Math.ceil(ab.mp * 0.85) : ab.mp;
  if (actor.mp < _mpCost) { BattleUI.setLog(['Not enough MP!'], ['dmg']); BattleUI.openSub(null); return; }

  BattleUI.openSub(null);
  G.busy = true; BattleUI.btns(false);
  actor.mp = Math.max(0, actor.mp - _mpCost);

  const e = ab.effect || {};
  const element = e.element || 'physical';
  const moveConfig = moveAnimations[ab.id] || { actorDuration: 560, overlayDuration: 600, isUltimate: false };

  // HP Sacrifice (Hu Tao)
  if (e.hpCostPercent) {
    const cost = Math.floor(actor.hp * e.hpCostPercent);
    actor.hp = Math.max(1, actor.hp - cost);
    BattleUI.popParty(G.activeMemberIdx, cost, 'dmg', 'dark');
    BattleUI.addLog(\`\${actor.displayName} sacrifices vitality for power!\`, 'dmg');
  }

  // Sprite Animation
  const spr = BattleUI.getSprite(G.activeMemberIdx, 'party');
  if (spr) {
    spr.classList.add(\`anim-\${ab.id}\`, \`element-\${element}\`);
    setTimeout(() => spr.classList.remove(\`anim-\${ab.id}\`, \`element-\${element}\`), moveConfig.actorDuration);
  }
  BattleUI.setLog([\`\${actor.displayName} uses \${ab.name}!\`], ['magic']);

  const ultimateChannels = { cryoclasm: 'channels ice blades...', spirit_soother: 'channels soul fire...', hajras_hymn: 'channels star blessing...', mastery_of_pain: 'channels karmic winds...', absolute_summon: 'commands the Phantom Guardian...' };
  const isUltimate = ultimateChannels.hasOwnProperty(ab.id);

  const enemy = G.enemy;
  const offensiveTargets = (e.aoe || isUltimate)
    ? G.enemyGroup.filter(en => Battle.alive(en))
    : (enemy ? [enemy] : []);

  const healTargets = (e.aoe || ab.isUltimate)
    ? G.party.filter(m => Battle.alive(m) || ab.isUltimate)
    : [actor];

  const targets = (ab.type === 'physical' || ab.type === 'magic_damage') ? offensiveTargets :
    (ab.type === 'heal' || ab.type === 'regen' || ab.type === 'buff') ? healTargets :
    (ab.type === 'debuff' || ab.type === 'stun') ? [enemy] :
    [];

  setTimeout(() => {
    if (isUltimate) { BattleUI.addLog(\`\${actor.displayName} \${ultimateChannels[ab.id]}\`, 'magic'); BattleUI.createEffectOverlay(G.targetEnemyIdx, element, 'enemy', ab.id); }
    ActionEngine.execute(actor, targets, ab, element, { ...moveConfig, isUltimate }, false);
  }, moveConfig.actorDuration);
}
`;

// Replace the old heroAbility — use a clean boundary approach
const heroAbilityStart = content.indexOf('function heroAbility(ab) {');
// Find next top-level function
const nextFuncAfterHeroAbility = content.indexOf('\nfunction ', heroAbilityStart + 1);
const oldHeroAbility = content.slice(heroAbilityStart, nextFuncAfterHeroAbility);

content = content.replace(oldHeroAbility, newHeroAbility + '\n');

fs.writeFileSync(FILE, content);
console.log("Phase 5 complete: ActionEngine populated, heroAbility simplified.");
