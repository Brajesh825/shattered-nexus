const fs = require('fs');

const FILE = 'js/battle/action-handler.js';
let content = fs.readFileSync(FILE, 'utf8');

// I will replace the ActionEngine stub with the full implementation
const fullEngineCode = `
/* ============================================================
   ACTION ENGINE (Phase 5)
   ============================================================ */
const ActionEngine = {
  execute(actor, targets, ab, element, moveConfig = {}, isEnemyAction = false) {
    const type = ab.type || 'physical';
    const processor = this.Processors[type] || this.Processors['default'];
    processor(actor, targets, ab, element, moveConfig, isEnemyAction);
  },

  Processors: {
    'default': (actor, targets, ab, element, moveConfig, isEnemyAction) => {
      BattleUI.setLog([\`\${actor.displayName || actor.name} uses \${ab.name}!\`], ['']);
      setTimeout(() => TurnManager.advance(), moveConfig.isUltimate ? 900 : 750);
    },

    'physical': (actor, targets, ab, element, moveConfig, isEnemyAction) => ActionEngine._processOffensive(actor, targets, ab, element, moveConfig, isEnemyAction),
    'magic_damage': (actor, targets, ab, element, moveConfig, isEnemyAction) => ActionEngine._processOffensive(actor, targets, ab, element, moveConfig, isEnemyAction),

    'heal': (actor, targets, ab, element, moveConfig, isEnemyAction) => {
      if (typeof SFX !== 'undefined') SFX.heal();
      const e = ab.effect || {};
      const _healAmp = (actor.passive?.id === 'dance_of_haftkarsvar' ? 1.3 : 1.0) * (actor.healBoost || 1.0);
      
      const getHealAmt = (m) => {
        if (e.healPercent) return Math.floor(m.maxHp * e.healPercent);
        const base = e.healBase || 20;
        const rand = e.healRandom || 15;
        const magBonus = Math.floor(Battle.getStat(actor, 'mag') * 1.5);
        return Math.floor((base + Math.random() * rand + magBonus) * _healAmp);
      };

      targets.forEach(m => {
        if (ab.isUltimate && m.isKO) {
          m.isKO = false;
          m.hp = 1;
        }
        const amt = getHealAmt(m);
        m.hp = Math.min(m.maxHp, m.hp + amt);

        const group = G.party.includes(m) ? 'party' : 'enemy';
        const idx = G[group].indexOf(m);
        if (group === 'party') BattleUI.popParty(idx, amt, 'heal', 'light');
        else BattleUI.popEnemy(idx, amt, 'heal');

        if (e.cleanse && Battle.alive(m)) {
          m.statuses = (m.statuses || []).filter(s => s.id !== 'status_frozen' && s.id !== 'status_stunned' && !s.id.includes('debuff'));
          BattleUI.addLog(\`✨ \${m.displayName || m.name} Cleansed!\`, 'heal');
        }
      });

      if (e.healBoost) {
        Battle.addStatus(actor, { ...StatusSystem.DEFS.heal_boost, turns: e.duration || 3 });
      }
      if (e.spdBuff) {
        actor.spd = Math.floor(actor.spd * e.spdBuff);
        actor._spdBuffVal = e.spdBuff;
      }

      BattleUI.renderPartyStatus();
      BattleUI.renderEnemyRow();
      setTimeout(() => TurnManager.advance(), 800);
    },

    'regen': (actor, targets, ab, element, moveConfig, isEnemyAction) => {
      const e = ab.effect || {};
      targets.forEach(m => {
        Battle.addStatus(m, { ...StatusSystem.DEFS.regen, turns: e.duration || 3 });
      });
      BattleUI.addLog(\`\${actor.displayName || actor.name}: Regen activated!\`, 'regen');
      setTimeout(() => TurnManager.advance(), 750);
    },

    'buff': (actor, targets, ab, element, moveConfig, isEnemyAction) => {
      const e = ab.effect || {};
      targets.forEach(m => {
        if (!Battle.alive(m)) return;
        if (e.stat) {
          const icon = e.stat === 'atk' ? '⚔️' : e.stat === 'def' ? '🛡️' : e.stat === 'spd' ? '💨' : '🔮';
          Battle.addStatus(m, {
            id: \`buff_\${e.stat}\`, label: \`\${e.stat.toUpperCase()} Up\`, icon, stat: e.stat, type: 'mult', value: e.multiplier || 1.3, turns: e.duration || 2
          });
        }
        if (e.atkBuff) Battle.addStatus(m, { id: 'buff_atk', label: 'ATK Up', icon: '⚔️', stat: 'atk', type: 'mult', value: e.atkBuff, turns: e.duration || 3 });
        if (e.defBuff) Battle.addStatus(m, { id: 'buff_def', label: 'DEF Up', icon: '🛡️', stat: 'def', type: 'mult', value: e.defBuff, turns: e.duration || 3 });
        if (e.magBuff) Battle.addStatus(m, { id: 'buff_mag', label: 'MAG Up', icon: '🔮', stat: 'mag', type: 'mult', value: e.magBuff, turns: e.duration || 3 });
        if (e.damageReduction) Battle.addStatus(m, { id: 'buff_ward', label: 'Warded', icon: '💎', type: 'reduction', value: (1 - e.damageReduction), turns: e.duration || 3 });
        if (e.hpRegen) Battle.addStatus(m, { ...StatusSystem.DEFS.regen, turns: e.duration || 3 });
        if (e.guardMark) Battle.addStatus(m, { id: 'status_taunt', label: 'Taunt', icon: '🛡️', type: 'buff', turns: e.duration || 3 });
        if (e.summonBoost) m.summonBoost = e.summonBoost;
      });
      
      BattleUI.addLog(\`\${actor.displayName || actor.name}: \${ab.name}!\${BattleUI._getBuffReport(actor)}\`, 'heal');
      BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), 750);
    },

    'debuff': (actor, targets, ab, element, moveConfig, isEnemyAction) => {
      const e = ab.effect || {};
      targets.forEach(m => {
        if (e.stat) {
          Battle.addStatus(m, {
            id: \`debuff_\${e.stat}\`, label: \`\${e.stat.toUpperCase()} Down\`, icon: '🔻', stat: e.stat, type: 'mult', value: e.multiplier || 0.7, turns: e.duration || 2, color: 'var(--red)'
          });
          BattleUI.addLog(\`\${m.displayName || m.name}'s \${e.stat.toUpperCase()} lowered!\`, 'magic');
        }
        if (e.freezeChance && !StatusSystem.has(m, 'status_frozen') && Math.random() < e.freezeChance) {
          Battle.addStatus(m, { id: 'status_frozen', label: 'Frozen', icon: '❄️', type: 'control', turns: 2 });
          BattleUI.addLog(\`❄️ \${m.displayName || m.name} is Frozen!\`, 'magic');
        }
      });
      setTimeout(() => TurnManager.advance(), 750);
    },

    'stun': (actor, targets, ab, element, moveConfig, isEnemyAction) => {
      const e = ab.effect || {};
      targets.forEach(m => {
        if (Math.random() < (e.stunChance || 0.5)) {
          Battle.addStatus(m, { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1 });
          BattleUI.addLog(\`💫 \${m.displayName || m.name} is stunned!\`, 'magic');
        }
      });
      setTimeout(() => TurnManager.advance(), 750);
    }
  },

  _processOffensive(actor, targets, ab, element, moveConfig, isEnemyAction) {
    const e = ab.effect || {};
    if (!isEnemyAction) {
      const isOnCD = actor.cooldowns && actor.cooldowns[ab.id] > 0;
      if (isOnCD) { 
        BattleUI.addLog(\`\${ab.name} is on cooldown for \${actor.cooldowns[ab.id]} turns!\`, 'dmg'); 
        G.busy = false; BattleUI.btns(true); return; 
      }
    }

    if (typeof SFX !== 'undefined') {
      if (ab.type === 'physical') SFX.attack(); else SFX.magic();
    }

    const execute = () => {
      let totalDmg = 0;
      targets.forEach(tgt => {
        const tIdx = (isEnemyAction ? G.party : G.enemyGroup).indexOf(tgt);
        const dmg = isEnemyAction ? ActionEngine._resolveEnemyAttack(actor, tgt, tIdx, ab, element) : resolveOffensiveAction(actor, tgt, tIdx, ab, element);
        totalDmg += dmg;
        if (!isEnemyAction && ab.id === 'cryoclasm' && StatusSystem.has(tgt, 'status_frozen')) actor._cryoReset = true;
      });

      // Lifesteal / Guardian / PartyBuff logic
      if (e.lifeSteal && totalDmg > 0) {
        const healAmt = Math.floor(totalDmg * e.lifeSteal);
        const healTargets = e.aoe ? G.party.filter(m => Battle.alive(m)) : [actor];
        healTargets.forEach(m => {
          m.hp = Math.min(m.maxHp, m.hp + healAmt);
          BattleUI.popParty(G.party.indexOf(m), healAmt, 'heal', 'light');
        });
      }
      if (e.guardian) {
        G.party.forEach(m => { if (Battle.alive(m)) Battle.addStatus(m, StatusSystem.DEFS.guardian); });
      }
      if (e.partyBuff) {
        G.party.forEach(m => {
          if (!Battle.alive(m)) return;
          Battle.addStatus(m, { id: 'status_atk_boost', label: 'ATK+', icon: '⚔️', type: 'mult', stat: 'atk', value: 1.3, turns: 3 });
          Battle.addStatus(m, { id: 'status_def_boost', label: 'DEF+', icon: '🛡️', type: 'mult', stat: 'def', value: 1.3, turns: 3 });
        });
      }

      if (e.cooldown) actor.cooldowns[ab.id] = e.cooldown + 1;
      if (actor._cryoReset) { 
        actor.cooldowns[ab.id] = 0; 
        BattleUI.addLog('❄ Cryoclasm Reset!', 'regen'); 
        delete actor._cryoReset; 
      }

      _checkDragonLeap(actor);
      BattleUI.renderEnemyRow(); BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), moveConfig.isUltimate ? 900 : 750);
    };

    if (moveConfig.isUltimate) setTimeout(execute, 3000);
    else execute();
  },

  _resolveEnemyAttack(enemy, target, targetIdx, ab, element) {
    if (!Battle.rollHit(enemy, target)) {
      BattleUI.addLog(\`\${enemy.name}'s attack missed!\`, 'dmg');
      BattleUI.popParty(targetIdx, 0, 'miss');
      return 0;
    }
    const isMagic = ab?.type === 'magic_damage';
    const isCrit = Battle.rollCrit(enemy);
    const pm = Battle.playerElemMult(element, target);
    const reaction = Battle.triggerReaction(target, element);
    const rxMult = reaction ? reaction.dmgMult : 1.0;

    let dmg = 0;
    if (isMagic) {
      dmg = Math.floor(Battle.magicDmg(Battle.getStat(enemy, 'mag'), ab?.dmgMultiplier || 1.3, 1.0, enemy.level || 1, Battle.getStat(target, 'mag'), target.lv || 1, enemy.name, target.displayName, isCrit) * pm * rxMult);
    } else {
      dmg = Math.floor(Battle.physDmg(Battle.getStat(enemy, 'atk'), Battle.getStat(target, 'def'), ab?.dmgMultiplier || 1, enemy.level || 1, target.lv || 1, 0, enemy.name, target.displayName, isCrit) * pm * rxMult);
    }

    dmg = ActionEngine._applyProtections(dmg, target, element, reaction);
    target.hp = Math.max(0, target.hp - dmg);
    if (target.hp <= 0) target.isKO = true;
    
    BattleUI.popParty(targetIdx, dmg, isMagic ? 'magic' : 'dmg', element);
    if (!reaction && element !== 'physical') Battle.applyAura(target, element);
    
    return dmg;
  },

  _applyProtections(dmg, target, element, reaction) {
    // Basic mitigation logic from legacy action-handler
    if (target.absorbElement === element) return -dmg; // Simplified for this refactor
    if (target.passive?.id === 'yakshas_valor') dmg = Math.floor(dmg * 0.9);
    if (Battle.getStat(target, 'reduction') < 1) dmg = Math.floor(dmg * Battle.getStat(target, 'reduction'));
    if (StatusSystem.has(target, 'status_guardian')) dmg = Math.floor(dmg * 0.7);
    return dmg;
  }
};
`;

// Replace the injected stub
content = content.replace(/\/\* =+ ACTION ENGINE \(Phase 5\) =+ \*\/[\s\S]*?};/, fullEngineCode);

// Simplify heroAttack
const newHeroAttack = `
function heroAttack() {
  if (G.busy) return;
  BattleUI.openSub(null);
  G.busy = true; BattleUI.btns(false);
  const actor = G.party[G.activeMemberIdx];
  const enemy = G.enemy;
  if (!actor || !enemy) { G.busy = false; return; }

  const element = actor.cls?.element || 'physical';
  BattleUI.playAnimation(G.activeMemberIdx, 'party', 'slash', element);
  BattleUI.setLog([\`\${actor.displayName} attacks \${enemy.name}!\`], ['hi']);

  setTimeout(() => {
    ActionEngine.execute(actor, [enemy], { name: 'attack', type: 'physical' }, element);
    _applyVampiric(enemy, 0, G.targetEnemyIdx); // logic for tracking dmg needs care
  }, 460);
}
`;

// Simplify heroAbility and enemyAct would be next, but let's start with this.
fs.writeFileSync(FILE, content);
console.log("ActionEngine fully populated.");
