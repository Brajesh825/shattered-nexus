/**
 * action-handler.js — Combat flow coordination.
 * Coordinates between math (CombatEngine) and presentation (BattleUI).
 */


/**
 * Check if a fallen party member should be revived by the reviveOnce relic bonus.
 * Fires at most once per battle per member. Only applies to party members, not enemies.
 */
function _checkReviveOnce(member) {
  if (member._reviveOnceFired) return;
  const relicDef = (G.activeRelics || [])
    .map(id => (G.relics || []).find(r => r.id === id))
    .find(r => r?.bonus?.reviveOnce);
  if (!relicDef) return;
  member._reviveOnceFired = true;
  member.isKO = false;
  member.hp = 1;
  BattleUI.addLog(`🛡️ ${member.displayName} revived by ${relicDef.name}!`, 'heal');
  BattleUI.popParty(G.party.indexOf(member), 1, 'heal');
}

/**
 * Consolidated logic for offensive actions (Physical/Magic).
 * Reduces code duplication between heroAttack and heroAbility.
 */
function resolveOffensiveAction(actor, target, targetIdx, action, element) {
  const isMagic = action.type === 'magic_damage';
  const e = action.effect || {};
  
  // 1. Hit Check
  if (!Battle.rollHit(actor, target)) {
    BattleUI.addLog(`${actor.displayName}'s ${action.name} missed ${target.name}!`, 'dmg');
    BattleUI.popEnemy(targetIdx, 0, 'miss');
    return 0;
  }

  // 2. Catalyst & Synergy: Check for Reaction
  const reaction = Battle.triggerReaction(target, element);
  const _rxMult = reaction ? reaction.dmgMult : 1.0;

  // 3. Damage & Crit
  const isCrit = Battle.rollCrit(actor);
  const _em = Battle.elemMult(element, target);
  const _stab = (element === actor.cls?.element) ? 1.25 : 1.0;
  const _hpPercent = actor.hp / actor.maxHp;
  const _lowHpMult = 1 + (1 - _hpPercent) * (e.lowHpDmgBonus || 0);
  
  let dmg = 0;

  if (isMagic) {
    const passiveBonus = (actor.passive?.id === 'arcane_surge' || actor.passive?.id === 'eidolon_bond') ? 1.2 : 1.0;
    const _summonBonus = (action.id?.startsWith('summon_') || action.id?.startsWith('absolute_')) ? (actor.summonBoost || 1.0) : 1.0;
    dmg = Math.floor(Battle.magicDmg(Battle.getStat(actor, 'mag'), e.dmgMultiplier || 1.5, passiveBonus, actor.lv || 1, target.mag, target.lv || 1, actor.displayName, target.name, isCrit) * _em * _stab * _lowHpMult * _summonBonus * _rxMult);
  } else {
    const _effAtk = Battle.getStat(actor, 'atk');
    const _bb = actor.passive?.id === 'blood_blossom' && _hpPercent < 0.5 ? 1.35 : 1.0;
    const _scaleCoeff = (e.statScale === 'hp' || e.statScale === 'maxHp') ? 0.1 : 0.5;
    const _scaleStat = e.statScale ? Math.floor(Battle.getStat(actor, e.statScale) * _scaleCoeff) : 0;
    dmg = Math.floor(Battle.physDmg(_effAtk + _scaleStat, Battle.getStat(target, 'def'), e.dmgMultiplier || 1, actor.lv || 1, target.level || 1, e.defPen || 0, actor.displayName, target.name, isCrit) * _em * _stab * _bb * _lowHpMult * _rxMult);
  }

  // 4. Process Reaction Effects
  if (reaction) {
    BattleUI.addLog(`⚡ REACTION: ${reaction.label}!`, 'hi');
    BattleUI.popEnemy(targetIdx, reaction.label, 'crit');
    if (reaction.debuff === 'def') {
      Battle.addStatus(target, { id: 'debuff_def_shatter', label: 'Shattered', icon: '❄️', stat: 'def', type: 'mult', value: 0.7, turns: 1 });
      BattleUI.addLog(`🛡️ ${target.name}'s DEF shattered!`, 'magic');
    }
    if (reaction.stun) {
      Battle.addStatus(target, { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1 });
      BattleUI.addLog(`💫 ${target.name} is Conductive! (Stunned)`, 'magic');
    }
    if (reaction.dot) {
      Battle.addStatus(target, { id: 'debuff_burn', label: 'Burn', icon: '🔥', stat: 'hp', type: 'dot', value: Math.floor(dmg * 0.2), turns: 3 });
      BattleUI.addLog(`🔥 ${target.name} is Burning!`, 'dmg');
    }
  }

  if (isCrit) {
    BattleUI.addLog(`⭐ ${isMagic ? 'CRITICAL MAGIC!' : 'CRITICAL HIT!'}`, 'hi');
    BattleUI.popEnemy(targetIdx, 'CRITICAL!', 'crit');
  }

  // 5. Apply result
  target.hp = Math.max(0, target.hp - dmg);
  if (target.hp <= 0) target.isKO = true;
  BattleUI.popEnemy(targetIdx, dmg, isMagic ? 'magic' : 'dmg', element);
  BattleUI.createEffectOverlay(targetIdx, element, 'enemy', action.id);

  if (!reaction && element !== 'physical') {
    Battle.applyAura(target, element);
  }

  const _er = Battle.elemResult(element, target);
  if (_er === 'weak') BattleUI.addLog('✦ WEAK!', 'magic');
  else if (_er === 'resist') BattleUI.addLog('▸ Resist', 'regen');
  else if (_er === 'shatter') BattleUI.addLog('⚡ SHATTER!', 'dmg');

  BattleUI.shakeEnemy(targetIdx);
  return dmg;
}



/**
 * Mirror of resolveOffensiveAction for enemy → party attacks.
 * Returns a result code: 'evade' | 'miss' | 'absorb' | number (dmg dealt).
 * Does NOT call TurnManager.advance() — caller handles that.
 */
function resolveEnemyOffensiveAction(actor, target, targetIdx, ab, element) {
  const isMagic = ab?.type === 'magic_damage';

  // Elite resist helper (Tarnished Wing relic)
  const _isElite = !!(actor.mutantTraits || actor.isCorrupted);
  const _applyEliteResist = dmg => {
    const resist = target._eliteResist || 0;
    return (_isElite && resist > 0) ? Math.max(1, Math.floor(dmg * (1 - resist))) : dmg;
  };

  // 1. Evasion Check
  let evaBonus = 0;
  if (!isMagic && targetIdx === 1) evaBonus = 0.3; // Diamond Formation: Rearguard
  if (target.evasion && Math.random() < (target.evasion + evaBonus)) {
    BattleUI.addLog(`💨 ${target.displayName} ${evaBonus > 0 ? '(Rearguard) ' : ''}dodged the ${isMagic ? 'spell' : 'attack'}!`, 'hi');
    BattleUI.popParty(targetIdx, 0, 'miss');
    return 'evade';
  }

  // 2. Hit Check
  if (!Battle.rollHit(actor, target)) {
    BattleUI.addLog(`${actor.name}'s ${isMagic ? 'spell' : 'attack'} missed!`, isMagic ? 'magic' : 'dmg');
    BattleUI.popParty(targetIdx, 0, 'miss');
    return 'miss';
  }

  // 3. Reaction
  const reaction = Battle.triggerReaction(target, element);
  const _rxMult = reaction ? reaction.dmgMult : 1.0;

  // 4. Damage
  const isCrit = Battle.rollCrit(actor);
  const _pm = Battle.playerElemMult(element, target);
  let dmg;
  if (isMagic) {
    const _eMag = Battle.getStat(actor, 'mag');
    const _tMag = Battle.getStat(target, 'mag');
    dmg = Math.floor(Battle.magicDmg(_eMag, ab.dmgMultiplier || 1.3, 1.0, actor.level || 1, _tMag, target.lv || 1, actor.name, target.displayName, isCrit) * _pm * _rxMult);
  } else {
    const _eAtk = Battle.getStat(actor, 'atk');
    const _tDef = Battle.getStat(target, 'def');
    dmg = Math.floor(Battle.physDmg(_eAtk, _tDef, ab?.dmgMultiplier || 1, actor.level || 1, target.lv || 1, 0, actor.name, target.displayName, isCrit) * _pm * _rxMult);
  }

  // 5. Reaction effects
  if (reaction) {
    BattleUI.addLog(`⚠️ ENEMY REACTION: ${reaction.label}!`, 'dmg');
    BattleUI.popParty(targetIdx, reaction.label, 'crit');
    if (reaction.debuff === 'def') {
      Battle.addStatus(target, { id: 'debuff_def_shatter', label: 'Shattered', icon: '❄️', stat: 'def', type: 'mult', value: 0.7, turns: 1 });
      BattleUI.addLog(`🛡️ ${target.displayName}'s DEF shattered!`, 'dmg');
    }
    if (reaction.stun) {
      Battle.addStatus(target, { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1 });
      BattleUI.addLog(`💫 ${target.displayName} is Conductive! (Stunned)`, 'dmg');
    }
    if (reaction.dot) {
      Battle.addStatus(target, { id: 'debuff_burn', label: 'Burn', icon: '🔥', stat: 'hp', type: 'dot', value: Math.floor(dmg * 0.2), turns: 3 });
      BattleUI.addLog(`🔥 ${target.displayName} is Burning!`, 'dmg');
    }
    if (reaction.isDampened) BattleUI.addLog('(Effect dampened by resistance)', 'regen');
  }

  if (isCrit) {
    BattleUI.addLog(`⭐ ${isMagic ? 'ENEMY CRITICAL MAGIC!' : 'ENEMY CRITICAL!'}`, isMagic ? 'magic' : 'dmg');
    BattleUI.popParty(targetIdx, 'CRITICAL!', 'crit');
  }

  // 6. Absorption
  if (target.absorbElement && target.absorbElement === element) {
    target.hp = Math.min(target.maxHp, target.hp + dmg);
    BattleUI.popParty(targetIdx, dmg, 'heal');
    BattleUI.addLog(`⭐ ${target.displayName} ABSORBED the ${isMagic ? 'spell' : 'attack'}!`, 'heal');
    if (window.LogDebug) window.LogDebug(`[Absorb] ${target.displayName} absorbed ${dmg} from ${actor.name}`, 'buff');
    BattleUI.createEffectOverlay(targetIdx, element, 'party');
    BattleUI.renderPartyStatus();
    return 'absorb';
  }

  // 7. Passive reductions
  if (target.passive?.id === 'yakshas_valor') dmg = Math.floor(dmg * 0.9);
  if (target.passive?.id === 'divine_authority') dmg = Math.floor(dmg * 0.85);
  if (target.passive?.id === 'divine_blessing') dmg = Math.floor(dmg * 0.88);
  if (Battle.getStat(target, 'reduction') < 1) dmg = Math.floor(dmg * Battle.getStat(target, 'reduction'));
  if (StatusSystem.has(target, 'status_guardian')) {
    dmg = Math.floor(dmg * 0.7);
    BattleUI.addLog(`(Guardian Mitigated -30%)`, 'hi');
  }
  dmg = _applyEliteResist(dmg);

  // 8. Apply damage
  target.hp = Math.max(0, target.hp - dmg);
  if (target.hp <= 0) { target.isKO = true; _checkReviveOnce(target); if (target.isKO) BattleUI.addLog(`${target.displayName} has fallen!`, 'dmg'); }
  BattleUI.popParty(targetIdx, dmg, isMagic ? 'magic' : 'dmg', element);

  // 9. Aura
  if (!reaction && element !== 'physical') Battle.applyAura(target, element);

  // 10. Effects overlay + party sprite shake
  BattleUI.createEffectOverlay(targetIdx, element, 'party');
  if (!isMagic) {
    const pspr = BattleUI.getSprite(targetIdx, 'party');
    if (pspr) { pspr.classList.add('anim-shake'); setTimeout(() => pspr.classList.remove('anim-shake'), 380); }
  }

  // 11. Log
  const _pr = Battle.playerElemResult(element, target);
  if (isMagic) {
    BattleUI.setLog([`${actor.name} uses ${ab.name}!`, `${target.displayName} took ${dmg} magic damage!`], ['magic', 'dmg']);
  } else {
    BattleUI.setLog([`${actor.name} attacks ${target.displayName}!`, `${target.displayName} took ${dmg} damage!`], ['', 'dmg']);
  }
  if (_pr === 'weak') BattleUI.addLog('✦ WEAK!', 'dmg');
  else if (_pr === 'resist') BattleUI.addLog('▸ Resist', 'regen');

  // 12. Reflect
  const reflectPerc = (target.reflect || 0) + (target.passive?.id === 'divine_authority' ? 0.1 : 0);
  if (reflectPerc > 0 && dmg > 0 && Battle.alive(actor)) {
    const reflect = Math.floor(dmg * reflectPerc);
    actor.hp = Math.max(0, actor.hp - reflect);
    BattleUI.addLog(`✦ Reflected ${reflect} damage!`, 'magic');
  }

  return dmg;
}


/* ============================================================
   ACTION ENGINE
   Processes all ability side-effects through discrete handlers.
   ============================================================ */
const ActionEngine = {

  /** Main dispatch: routes ab.type to the correct processor. */
  execute(actor, targets, ab, element, moveConfig = {}, isEnemyAction = false) {
    const proc = this.Processors[ab.type];
    if (proc) proc(actor, targets, ab, element, moveConfig, isEnemyAction);
    else {
      BattleUI.setLog([`${actor.displayName || actor.name} uses ${ab.name}!`], ['']);
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
          BattleUI.addLog(`✨ ${m.displayName} Cleansed!`, 'heal');
        }
      });
      BattleUI.createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
      if (e.healBoost) Battle.addStatus(actor, { ...StatusSystem.DEFS.heal_boost, turns: e.duration || 3 });
      if (e.spdBuff) { actor.spd = Math.floor(actor.spd * e.spdBuff); actor._spdBuffVal = e.spdBuff; BattleUI.addLog(`💨 ${actor.displayName}: SPD up!`, 'heal'); }
      BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), 800);
    },

    regen(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      targets.forEach(m => Battle.addStatus(m, { ...StatusSystem.DEFS.regen, turns: e.duration || 3 }));
      BattleUI.createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
      BattleUI.addLog(`${actor.displayName}: Regen activated!`, 'regen');
      BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), 750);
    },

    buff(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      const _applyBuff = (m, idx) => {
        if (!Battle.alive(m)) return;
        if (e.stat) Battle.addStatus(m, { id: `buff_${e.stat}`, label: `${e.stat.toUpperCase()} Up`, icon: e.stat === 'atk' ? '⚔️' : e.stat === 'def' ? '🛡️' : e.stat === 'spd' ? '💨' : '🔮', stat: e.stat, type: 'mult', value: e.multiplier || 1.3, turns: e.duration || 2 });
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
      BattleUI.addLog(`${actor.displayName}: ${ab.name}!${BattleUI._getBuffReport(actor)}`, 'heal');
      BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), 750);
    },

    debuff(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      const enemy = targets[0];
      if (!enemy) { setTimeout(() => TurnManager.advance(), 750); return; }
      if (e.stat) { Battle.addStatus(enemy, { id: `debuff_${e.stat}`, label: `${e.stat.toUpperCase()} Down`, icon: '🔻', stat: e.stat, type: 'mult', value: e.multiplier || 0.7, turns: e.duration || 2, color: 'var(--red)' }); BattleUI.addLog(`${enemy.name}'s ${e.stat.toUpperCase()} lowered!`, 'magic'); }
      if (e.freezeChance && !StatusSystem.has(enemy, 'status_frozen') && Math.random() < e.freezeChance) { Battle.addStatus(enemy, { id: 'status_frozen', label: 'Frozen', icon: '❄️', type: 'control', turns: 2 }); BattleUI.addLog(`❄️ ${enemy.name} is Frozen for 2 turns!`, 'magic'); }
      BattleUI.renderEnemyRow();
      setTimeout(() => TurnManager.advance(), 750);
    },

    stun(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      const enemy = targets[0];
      if (enemy && Math.random() < (e.stunChance || 0.5)) { Battle.addStatus(enemy, { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1 }); BattleUI.addLog(`💫 ${enemy.name} is stunned!`, 'magic'); }
      else BattleUI.addLog('Had no effect!', '');
      setTimeout(() => TurnManager.advance(), 750);
    },

    steal(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      const enemy = targets[0];
      if (enemy && Math.random() < (e.stealChance || 0.5)) { const gold = 5 + Math.floor(Math.random() * 10); actor.gold += gold; BattleUI.addLog(`Stole ${gold} gold from ${enemy.name}!`, 'steal'); }
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
      BattleUI.addLog(`${ab.name} is on cooldown for ${actor.cooldowns[ab.id]} turns!`, 'dmg');
      G.busy = false; BattleUI.btns(true); return;
    }
    if (typeof SFX !== 'undefined') {
      if (!isEnemyAction) {
        if (ab.type === 'physical') SFX.attack(); else SFX.magic();
      } else {
        if (ab.type === 'physical' || !ab.type) { SFX.enemyHit(); setTimeout(() => SFX.attack(), 60); }
        else SFX.magic();
      }
    }

    const execute = () => {
      let totalDmg = 0;
      targets.forEach(tgt => {
        const tIdx = isEnemyAction ? G.party.indexOf(tgt) : G.enemyGroup.indexOf(tgt);
        if (!isEnemyAction) {
          const dmg = resolveOffensiveAction(actor, tgt, tIdx, ab, element);
          totalDmg += dmg;
          if (ab.id === 'cryoclasm' && StatusSystem.has(tgt, 'status_frozen')) actor._cryoReset = true;
        } else {
          resolveEnemyOffensiveAction(actor, tgt, tIdx, ab, element);
        }
      });

      if (!isEnemyAction) {
        if (e.lifeSteal && totalDmg > 0) {
          let lMult = e.lifeSteal;
          if (e.healLowMult && actor.hp / actor.maxHp < 0.5) lMult *= e.healLowMult;
          const healAmt = Math.floor(totalDmg * lMult);
          const healTargets = e.aoe ? G.party.filter(m => Battle.alive(m)) : [actor];
          healTargets.forEach(m => { const idx = G.party.indexOf(m); m.hp = Math.min(m.maxHp, m.hp + healAmt); BattleUI.popParty(idx, healAmt, 'heal', 'light'); });
          BattleUI.addLog(`💖 ${ab.name}: Restored ${healAmt} HP!`, 'heal');
        }
        if (e.guardian) { G.party.forEach(m => { if (Battle.alive(m)) Battle.addStatus(m, StatusSystem.DEFS.guardian); }); BattleUI.addLog('🛡️ Phantom Guardian summoned!', 'heal'); }
        if (e.partyBuff) { G.party.forEach((m, idx) => { if (!Battle.alive(m)) return; Battle.addStatus(m, { id: 'status_atk_boost', label: 'ATK+', icon: '⚔️', type: 'mult', stat: 'atk', value: 1.3, turns: 3 }); Battle.addStatus(m, { id: 'status_def_boost', label: 'DEF+', icon: '🛡️', type: 'mult', stat: 'def', value: 1.3, turns: 3 }); BattleUI.popParty(idx, 'ATK & DEF Up!', 'buff', 'holy'); }); BattleUI.addLog(`✨ ${ab.name}: The party is blessed!`, 'buff'); }
        if (e.cooldown) actor.cooldowns[ab.id] = e.cooldown + 1;
        if (actor._cryoReset) { actor.cooldowns[ab.id] = 0; BattleUI.addLog('❄ Cryoclasm Reset!', 'regen'); delete actor._cryoReset; }
        _checkDragonLeap(actor);
      } else {
        // Iron Will (Kael): triggers below 30% HP on first hit
        const tgt = targets[0];
        if (tgt) {
          if (tgt.passive?.id === 'iron_will' && !tgt.passive.triggered && tgt.hp / tgt.maxHp < 0.3) {
            tgt.def = Math.floor(tgt.def * 1.25);
            tgt.passive = { ...tgt.passive, triggered: true };
          }
        }
        // Mutant trait ticks after enemy action
        G.enemyGroup.forEach((e, i) => {
          if (!Battle.alive(e) || !e.mutantTraits) return;
          const traits = e.mutantTraits;
          if (traits.some(t => t.id === 'regenerating')) {
            const healAmt = Math.max(1, Math.floor(e.maxHp * 0.05));
            e.hp = Math.min(e.maxHp, e.hp + healAmt);
            BattleUI.popEnemy(i, healAmt, 'regen');
            if (window.LogDebug) window.LogDebug(`[Passive] ${e.name} (Regenerating): Recovered ${healAmt} HP`, 'buff');
          }
          if (traits.some(t => t.id === 'enraged')) {
            e._enragedTurns = (e._enragedTurns || 0) + 1;
            const gain = Math.max(1, Math.floor(e.atk * 0.05));
            e.atk += gain;
            if (e._enragedTurns === 1) BattleUI.addLog(`⚡ ${e.name} is Enraged! ATK rising each turn!`, 'dmg');
            if (window.LogDebug) window.LogDebug(`[Passive] ${e.name} (Enraged): ATK increased to ${e.atk}`, 'passive');
          }
        });
        BattleUI.renderPartyRow();
      }

      BattleUI.renderEnemyRow(); BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), moveConfig.isUltimate ? 900 : 750);
    };

    if (moveConfig.isUltimate) setTimeout(execute, 3000); else execute();
  }
};


/* ============================================================
   HERO / PARTY ACTIONS  (actor = current party member)
   ============================================================ */
function heroAttack() {
  if (G.busy) return;
  BattleUI.openSub(null);
  G.busy = true; BattleUI.btns(false);

  const actor = G.party[G.activeMemberIdx];
  const enemy = G.enemy;
  if (!actor || !enemy) { G.busy = false; return; }

  // Basic attack carries the character's class element
  const _atkElem = actor.cls?.element || 'physical';
  const actorSpr = BattleUI.getSprite(G.activeMemberIdx, 'party');
  if (actorSpr) {
    actorSpr.classList.add('anim-slash');
    actorSpr.classList.add(`element-${_atkElem}`);
    setTimeout(() => {
      actorSpr.classList.remove('anim-slash');
      actorSpr.classList.remove(`element-${_atkElem}`);
    }, 460);
  }

  BattleUI.setLog([`${actor.displayName} attacks ${enemy.name}!`], ['hi']);

  setTimeout(() => {
    if (typeof SFX !== 'undefined') { SFX.attack(); setTimeout(() => SFX.enemyHit(), 80); }
    
    const dmg = resolveOffensiveAction(actor, enemy, G.targetEnemyIdx, { name: 'attack', type: 'physical' }, _atkElem);
    
    _applyVampiric(enemy, dmg, G.targetEnemyIdx);
    _checkDragonLeap(actor);
    BattleUI.renderEnemyRow();
    setTimeout((() => TurnManager.advance()), 700);
  }, 460);
}

function heroAbility(ab) {
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
    BattleUI.addLog(`${actor.displayName} sacrifices vitality for power!`, 'dmg');
  }

  // Sprite Animation
  const spr = BattleUI.getSprite(G.activeMemberIdx, 'party');
  if (spr) {
    spr.classList.add(`anim-${ab.id}`, `element-${element}`);
    setTimeout(() => spr.classList.remove(`anim-${ab.id}`, `element-${element}`), moveConfig.actorDuration);
  }
  BattleUI.setLog([`${actor.displayName} uses ${ab.name}!`], ['magic']);

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
    if (isUltimate) { BattleUI.addLog(`${actor.displayName} ${ultimateChannels[ab.id]}`, 'magic'); BattleUI.createEffectOverlay(G.targetEnemyIdx, element, 'enemy', ab.id); }
    ActionEngine.execute(actor, targets, ab, element, { ...moveConfig, isUltimate }, false);
  }, moveConfig.actorDuration);
}


function _checkDragonLeap(actor) {
  if (actor.passive?.id !== 'dragon_leap') return;
  actor._dragonLeapTurns = (actor._dragonLeapTurns || 0) + 1;
  if (actor._dragonLeapTurns % 3 !== 0) return;
  const tgt = G.enemy;
  if (!tgt || !Battle.alive(tgt)) return;
  const dmg = Math.floor(Battle.physDmg(Battle.getStat(actor, 'atk'), Battle.getStat(tgt, 'def'), 1.6, actor.lv || 1, tgt.level || 1) * Battle.elemMult('wind', tgt));
  tgt.hp = Math.max(0, tgt.hp - dmg);
  if (tgt.hp <= 0) tgt.isKO = true;
  BattleUI.popEnemy(G.targetEnemyIdx, dmg, 'dmg', 'wind');
  BattleUI.addLog(`🐉 Dragon's Leap! Bonus aerial strike for ${dmg}!`, 'magic');
  BattleUI.renderEnemyRow();
}

/* ============================================================
   ENEMY AI
   ============================================================ */
function enemyAct(enemy, enemyIdx) {
  // Start-of-Turn maintenance (debuffs, cooldowns)
  Battle.tickActorStatus(enemy, true);

  // Control check — skip turn if stunned or frozen
  const isIncapacitated = enemy.statuses?.some(s => s.id === 'status_stunned' || s.id === 'status_frozen');
  if (isIncapacitated) {
    TurnManager.advance();
    return;
  }

  // ── TARGET SELECTION (Role-Based AI) ──────────────────
  const alive = G.party.filter(m => Battle.alive(m));
  if (!alive.length) { TurnManager.advance(); return; }

  let target;
  let targetIdx;
  const role = enemy.aiRole || 'attacker';

  // 1. Forced Targeting (Taunt)
  const taunterIdx = G.party.findIndex(m => Battle.alive(m) && m.statuses?.some(s => s.id === 'status_taunt'));
  if (taunterIdx !== -1) {
    target = G.party[taunterIdx];
    targetIdx = taunterIdx;
    BattleUI.addLog(`🛡️ Enemies focused on ${target.displayName}'s Taunt!`, 'regen');
  }

  // 2. Role-Based Logic
  else {
    if (role === 'tactician') {
      // Find targets with an active aura
      const auratized = alive.filter(m => m.statuses?.some(s => s.id.startsWith('aura_')));
      if (auratized.length > 0) {
        target = auratized[Math.floor(Math.random() * auratized.length)];
        BattleUI.addLog(`🔍 ${enemy.name} is looking for a Synergy...`, 'hi');
        BattleUI.popAI(enemyIdx, '⚡ FOCUS SYNERGY!');
      }
    }

    if (!target && role === 'predator') {
      // Always target lowest HP
      alive.sort((a, b) => a.hp - b.hp);
      target = alive[0];
      BattleUI.addLog(`🐺 ${enemy.name} is hunting the weak...`, 'hi');
      BattleUI.popAI(enemyIdx, '🐺 TARGET WEAKNESS!');
    }

    // Default Attacker / Fallback
    if (!target) {
      alive.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
      target = Math.random() < 0.6 ? alive[0] : alive[Math.floor(Math.random() * alive.length)];
    }
  }

  // 3. Ability Selection
  let ab;

  // Support logic: check for wounded allies before picking an attack
  if (role === 'support') {
    const woundedAlly = G.enemyGroup.filter(e => Battle.alive(e) && (e.hp / e.maxHp) < 0.5)
      .sort((a, b) => a.hp - b.hp)[0];
    if (woundedAlly) {
      const healAb = (enemy.abilities || enemy.abilityDefs || []).find(a => a.type === 'heal' || a.id?.includes('heal'));
      if (healAb) {
        ab = healAb;
        target = woundedAlly; // Redirect target to ally
        targetIdx = G.enemyGroup.indexOf(woundedAlly);
        BattleUI.addLog(`🩹 ${enemy.name} prioritizes healing!`, 'hi');
        BattleUI.popAI(enemyIdx, '🩹 HEAL ALLY!');
      }
    }
  }

  if (!ab) {
    ab = Battle.pickAbility(enemy, target);
  }

  // --- DIAMOND FORMATION: VANGUARD INTERCEPTION ---
  // If attack is physical and target is NOT the Vanguard (index 2), check for interception
  // 0=Top, 1=Back, 2=Front(Vanguard), 3=Bottom
  targetIdx = G.party.indexOf(target);
  const isPhysical = !ab || ab.type === 'physical';
  if (isPhysical && targetIdx !== -1 && targetIdx !== 2) {
    const vanguard = G.party[2];
    if (vanguard && Battle.alive(vanguard)) {
      target = vanguard;
      targetIdx = 2;
      BattleUI.addLog(`🛡️ Vanguard: ${target.displayName} intercepts for the party!`, 'hi');
      BattleUI.popParty(targetIdx, '🛡️ PROTECT!', 'buff', 'holy');
    }
  }

  if (window.LogDebug) {
    const abName = ab ? ab.name : 'Standard Attack';
    window.LogDebug(`[AI-${role.toUpperCase()}] ${enemy.name} selects ${abName} against ${target?.displayName || target?.name}`, 'info');
  }
  const element = enemy.element || ab?.effect?.element || 'physical';

  // Get move-specific animation config or use defaults
  const moveConfig = (ab?.id && moveAnimations[ab.id])
    ? moveAnimations[ab.id]
    : { actorDuration: 460, overlayDuration: 600, isUltimate: false };
  const animDuration = moveConfig.actorDuration;

  const enemySpr = BattleUI.getSprite(enemyIdx, 'enemy');
  if (enemySpr) {
    // Use move-specific animation if available, otherwise use generic slash
    const animClass = ab?.id ? `anim-${ab.id}` : 'anim-slash';
    enemySpr.classList.add(animClass);
    enemySpr.classList.add(`element-${element}`);
    setTimeout(() => {
      enemySpr.classList.remove(animClass);
      enemySpr.classList.remove(`element-${element}`);
    }, animDuration);
  }

  setTimeout(() => {
    ActionEngine.execute(enemy, [target], ab, element, moveConfig, true);
  }, 580);
}

/* ============================================================
   WIN / LOSE CHECK + LEVEL UP
   ============================================================ */
