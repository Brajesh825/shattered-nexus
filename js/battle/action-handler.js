/**
 * action-handler.js — Combat flow coordination.
 * Coordinates between math (CombatEngine) and presentation (BattleUI).
 */

const ActionHandler = {
  _tutCount: 0,
  execute(actor, target, ab, targetIdx, isEnemy = false) {
    // Show one-time tutorial hint for Vanguard
    if (!isEnemy && this._tutCount === 0) {
      this._tutCount++;
      BattleUI.showTutorial("🛡️ VANGUARD: The front-most ally (left) intercepts single-target attacks. Keep them healthy!");
    }

    if (ab.type === 'physical' || ab.type === 'magic_damage') {
      return resolveOffensiveAction(actor, target, targetIdx, ab, ab.element || 'physical');
    } else if (ab.type === 'buff_def' || ab.type === 'heal' || ab.type === 'buff') {
      // These are handled by ActionEngine generally now, but kept for legacy calls
      ActionEngine.execute(actor, [target], ab, ab.element || 'physical', {}, isEnemy);
    }
  }
};

/**
 * Check if a fallen party member should be revived by the reviveOnce relic bonus.
 * Fires at most once per battle per member. Only applies to party members, not enemies.
 */
function _checkReviveOnce(member) {
  if (member._reviveOnceFired || !member._reviveOnceRelic) return;
  
  // Find name for log (optional but nice)
  const relicDef = (G.relics || []).find(r => r.id === 'rampart_oath');
  const relicName = relicDef ? relicDef.name : 'Rampart Oath';
  
  member._reviveOnceFired = true;
  member.isKO = false;
  member.hp = 1;
  BattleUI.addLog(`🛡️ ${member.displayName} revived by ${relicName}!`, 'heal');
  BattleUI.popParty(G.party.indexOf(member), 1, 'heal');
}

/**
 * Returns move animation config for the given ability ID, with safe defaults.
 */
function getMoveConfig(id) {
  return moveAnimations[id] || { actorDuration: 560, overlayDuration: 600, isUltimate: false };
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

  if (reaction) {
    BattleUI.popReaction(targetIdx, reaction.label, 'enemy');

    // Record discovered weakness in Archive
    if (typeof Archive !== 'undefined') {
      Archive.recordWeakness(target.id, element);
    }

    // Play corresponding SFX
    if (typeof SFX !== 'undefined') {
      const lbl = reaction.label.toUpperCase();
      if (lbl.includes('SHATTER')) SFX.shatter();
      else if (lbl.includes('MELT') || lbl.includes('BURN')) SFX.melt();
      else if (lbl.includes('SWIRL')) SFX.swirl();
      else SFX.magic(); // Fallback
    }
  }
  const isCrit = Battle.rollCrit(actor);
  const _em = Battle.elemMult(element, target);
  const _stab = (element === actor.cls?.element) ? 1.25 : 1.0;
  const _fireAmp = element === 'fire' ? (actor.statuses?.find(s => s.type === 'fire_amp')?.value || 1.0) : 1.0;
  const _hpPercent = actor.hp / actor.maxHp;
  const _lowHpMult = 1 + (1 - _hpPercent) * (e.lowHpDmgBonus || 0);

  let dmg = 0;

  if (isMagic) {
    const _pBoost = PassiveSystem.val(actor, 'MAGIC_BOOST', 1.0);
    const _summonBonus = (action.id?.startsWith('summon_') || action.id?.startsWith('absolute_')) ? PassiveSystem.val(actor, 'SUMMON_STAT_BOOST', 1.0) : 1.0;
    dmg = Battle.magicDmg(Battle.getStat(actor, 'mag'), Battle.getStat(target, 'mag'), e.dmgMultiplier || NexusScaling.engine.magicDmgFallback,
      { passiveBonus: _pBoost, magLevel: actor.lv || 1, mdefLevel: target.level || 1, isCrit });
    dmg = Math.floor(dmg * _em * _stab * _fireAmp * _lowHpMult * _summonBonus * _rxMult);

    if (window.LogDebug) {
      window.LogDebug(`[MATH-MAGIC] ${actor.displayName} -> ${target.name}: BaseMag=${Battle.getStat(actor, 'mag')}, T-MDef=${Battle.getStat(target, 'mag')}, Mult=${e.dmgMultiplier || 1.5}, Stab=${_stab}, Elem=${_em}, RX=${_rxMult} -> Final=${dmg}`, 'hi');
    }
  } else {
    const _effAtk = Battle.getStat(actor, 'atk');
    const statsToScale = Array.isArray(e.statScale) ? e.statScale : (e.statScale ? [e.statScale] : []);
    let _scaleStat = 0;
    statsToScale.forEach(s => {
      const coeff = (s === 'hp' || s === 'maxHp') ? 0.1 : 0.5;
      _scaleStat += Math.floor(Battle.getStat(actor, s) * coeff);
    });
    dmg = Battle.physDmg(_effAtk + _scaleStat, Battle.getStat(target, 'def'), e.dmgMultiplier || 1,
      { atkLevel: actor.lv || 1, defLevel: target.level || 1, defPen: e.defPen || 0, isCrit });
    dmg = Math.floor(dmg * _em * _stab * _fireAmp * _lowHpMult * _rxMult);

    if (window.LogDebug) {
      window.LogDebug(`[MATH-PHYS] ${actor.displayName} -> ${target.name}: Atk=${_effAtk + _scaleStat}, T-Def=${Battle.getStat(target, 'def')}, Mult=${e.dmgMultiplier || 1}, Stab=${_stab}, Elem=${_em}, RX=${_rxMult} -> Final=${dmg}`, 'hi');
    }
  }

  // Final floor for player attacks
  dmg = Math.max(1, Math.floor(dmg));

  // 4. Process Reaction Effects
  if (reaction) {
    if (reaction.debuff === 'def') {
      Battle.addStatus(target, { id: 'debuff_def_shatter', label: 'Shattered', icon: '❄️', stat: 'def', type: 'mult', value: 0.7, turns: 1 });
      BattleUI.addLog(`🛡️ ${target.name}'s DEF shattered!`, 'magic');
    }
    if (reaction.stun) {
      Battle.addStatus(target, { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1 });
      BattleUI.addLog(`💫 ${target.name} is Conductive! (Stunned)`, 'magic');
    }
    if (reaction.dot) {
      Battle.addStatus(target, { id: 'debuff_burn', label: 'Burn', icon: '🔥', stat: 'hp', type: 'dot', value: Math.floor(dmg * NexusScaling.engine.burnReactionDotPercent), turns: 3 });
      BattleUI.addLog(`🔥 ${target.name} is Burning!`, 'dmg');
    }
  }

  if (isCrit) {
    BattleUI.addLog(`⭐ ${isMagic ? 'CRITICAL MAGIC!' : 'CRITICAL HIT!'}`, 'hi');
    BattleUI.popEnemy(targetIdx, 'CRITICAL!', 'crit');
    if (typeof SFX !== 'undefined') SFX.crit();
    BattleUI.flash('#ffffff33', 200);
  }

  // 5. Apply result
  target.hp = Math.max(0, target.hp - dmg);
  BattleUI.renderEnemyRow(); // Immediate refresh for boss/enemy bars

  // Strategic Thaw: Attacking a frozen target breaks the ice
  if (typeof StatusSystem !== 'undefined' && StatusSystem.has(target, 'status_frozen')) {
    StatusSystem.remove(target, 'status_frozen');
    BattleUI.addLog(`❄️ ${target.name} shattered! They are no longer frozen!`, 'magic');
    BattleUI.renderEnemyRow();
  }

  if (target.hp <= 0) {
    Battle.setKO(target, true);
    // If it was an enemy kill, record in Archive
    if (typeof Archive !== 'undefined') Archive.recordKill(target.id);
  }

  BattleUI.popEnemy(targetIdx, dmg, isMagic ? 'magic' : 'dmg', element);

  // Ultimate Impact logic
  const isUltimate = action.id?.includes('_ult_') || action.isUltimate;
  if (isUltimate) {
    if (typeof SFX !== 'undefined') SFX.ultimate();
    BattleUI.flash('#ffffff', 400);
  }

  // Skip overlay for ultimates — heroAbility already fired it before the execute delay
  if (!action._ultimateOverlayShown) {
    BattleUI.createEffectOverlay(targetIdx, element, 'enemy', action.id);
  }

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
 * Maps enemy specific move IDs to existing SVG animations or generic variants.
 */
function mapEnemyAnimation(moveId) {
  if (!moveId) return null;
  const registry = {
    'inferno': 'inferno',
    'hell_strike': 'hell_strike',
    'demon_eye': 'demon_eye',
    'quick_slash': 'generic_slash',
    'slimy_strike': 'generic_slam',
    'stone_throw': 'generic_slam',
    'dirty_trick': 'generic_bash',
    'bite': 'generic_slash',
    'dark_pulse': 'generic_dark',
    'shadow_web': 'generic_dark'
  };
  return registry[moveId] || moveId;
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
  if (!isMagic && targetIdx === 1) evaBonus = NexusScaling.engine.rearguardEvasionBonus;
  const _evasionBuff = target.statuses?.find(s => s.type === 'evasion')?.value || 0;
  if (((target.evasion || 0) + _evasionBuff + evaBonus) > 0 && Math.random() < ((target.evasion || 0) + _evasionBuff + evaBonus)) {
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

  if (reaction) {
    BattleUI.addLog(`⚠️ ENEMY REACTION: ${reaction.label}!`, 'dmg');
    BattleUI.popReaction(targetIdx, reaction.label, 'party');

    // Play corresponding SFX
    if (typeof SFX !== 'undefined') {
      const lbl = reaction.label.toUpperCase();
      if (lbl.includes('SHATTER')) SFX.shatter();
      else if (lbl.includes('MELT') || lbl.includes('BURN')) SFX.melt();
      else if (lbl.includes('SWIRL')) SFX.swirl();
      else SFX.magic(); // Fallback
    }
  }
  const isCrit = Battle.rollCrit(actor);
  const _pm = Battle.playerElemMult(element, target);
  let dmg;
  if (isMagic) {
    const _eMag = Battle.getStat(actor, 'mag');
    const _tMag = Battle.getStat(target, 'mag');
    dmg = Battle.magicDmg(_eMag, _tMag, ab.dmgMultiplier || NexusScaling.engine.enemyMagicFallback,
      { magLevel: actor.level || 1, mdefLevel: target.lv || 1, isCrit });
    dmg = Math.floor(dmg * _pm * _rxMult);
    if (window.LogDebug) {
      window.LogDebug(`[ENEMY-MATH-MAGIC] ${actor.name} -> ${target.displayName}: BaseMag=${_eMag}, T-MDef=${_tMag}, Mult=${ab.dmgMultiplier || 1.3}, PM=${_pm}, RX=${_rxMult} -> Final=${dmg}`, 'hi');
    }
  } else {
    const _eAtk = Battle.getStat(actor, 'atk');
    const _tDef = Battle.getStat(target, 'def');
    dmg = Battle.physDmg(_eAtk, _tDef, ab?.dmgMultiplier || 1,
      { atkLevel: actor.level || 1, defLevel: target.lv || 1, isCrit });
    dmg = Math.floor(dmg * _pm * _rxMult);
    if (window.LogDebug) {
      window.LogDebug(`[ENEMY-MATH-PHYS] ${actor.name} -> ${target.displayName}: Atk=${_eAtk}, T-Def=${_tDef}, Mult=${ab?.dmgMultiplier || 1.4}, PM=${_pm}, RX=${_rxMult} -> Final=${dmg}`, 'hi');
      window.LogDebug(`[STATE-DIAG] ${target.displayName} HP: ${target.hp} pre-hit. [TargetIndex: ${targetIdx}]`, 'passive');
    }
  }

  // Handle post-damage reaction status effects
  if (reaction) {
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

  // 6. Passive reductions & Final Rounding
  const _passResist = 1 - PassiveSystem.val(target, 'DAMAGE_REDUCTION', 0);
  dmg *= _passResist;
  if (Battle.getStat(target, 'reduction') < 1) dmg *= Battle.getStat(target, 'reduction');
  if (StatusSystem.has(target, 'status_guardian')) {
    dmg *= 0.7;
    BattleUI.addLog(`(Guardian Mitigated -30%)`, 'hi');
  }
  // Relic: Cinder of Ashveil — fire damage reduction
  if (element === 'fire' && target._fireResist) {
    dmg *= (1 - target._fireResist);
    BattleUI.addLog(`🔥 Fire Resist! (–${Math.round(target._fireResist * 100)}%)`, 'hi');
  }
  dmg = _applyEliteResist(dmg);

  // Final floor: Ensure at least 1 damage if not immune
  dmg = Math.max(1, Math.floor(dmg));

  // 7b. Absorb check — fire element absorbed as healing by Sanguine Rouge buff
  const _absorbStatus = target.statuses?.find(s => s.type === 'absorb' && s.value === element);
  if (_absorbStatus) {
    target.hp = Math.min(target.maxHp, target.hp + dmg);
    BattleUI.popParty(targetIdx, dmg, 'heal', element);
    BattleUI.addLog(`✨ ${target.displayName} absorbed ${element} damage!`, 'heal');
    return 'absorb';
  }

  // 8. Apply damage
  const preHp = target.hp;
  target.hp = Math.max(0, target.hp - dmg);
  if (window.LogDebug) window.LogDebug(`[STATE-DIAG] ${target.displayName} HP Transition: ${preHp} -> ${target.hp}`, 'dmg');

  if (target.hp <= 0) Battle.setKO(target, false);
  BattleUI.popParty(targetIdx, dmg, isMagic ? 'magic' : 'dmg', element);

  // 9. Aura
  if (!reaction && element !== 'physical') Battle.applyAura(target, element);

  // 10. Effects overlay + party sprite shake
  const animId = mapEnemyAnimation(ab?.id);
  BattleUI.createEffectOverlay(targetIdx, element, 'party', animId);
  if (!isMagic) {
    const pspr = BattleUI.getSprite(targetIdx, 'party');
    if (pspr) {
      pspr.classList.add('anim-shake');
      BattleUI.setSpriteFrame(targetIdx, 'hurt');
      setTimeout(() => {
        pspr.classList.remove('anim-shake');
        if (Battle.alive(target)) BattleUI.setSpriteFrame(targetIdx, 'idle');
      }, 380);
    }
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
  const reflectPerc = (target.reflect || 0) + PassiveSystem.val(target, 'REFLECT', 0);
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
      BattleUI.setLog([`${actor.name || actor.displayName} uses ${ab.name}!`], ['']);
      BattleUI.renderEnemyRow(); BattleUI.renderPartyStatus();
      setTimeout(() => TurnManager.advance(), moveConfig.isUltimate ? 900 : 750);
    }
  },

  Processors: {

    physical: (a, t, ab, el, mc, ie) => ActionEngine._offensive(a, t, ab, el, mc, ie),
    magic_damage: (a, t, ab, el, mc, ie) => ActionEngine._offensive(a, t, ab, el, mc, ie),
    buff_def: (a, t, ab, el, mc, ie) => ActionEngine.Processors.buff(a, t, ab, el, mc, ie),

    heal(actor, targets, ab, element, moveConfig, isEnemyAction) {
      if (typeof SFX !== 'undefined') SFX.heal();
      const e = ab.effect || {};
      const _healAmp = PassiveSystem.val(actor, 'HEAL_AMP', 1.0) * (actor.healBoost || 1.0);
      const _getAmt = m => {
        if (e.healPercent) return Math.floor(m.maxHp * e.healPercent);
        return Math.floor(((e.healBase || 20) + Math.random() * (e.healRandom || 15) + Math.floor(Battle.getStat(actor, 'mag') * NexusScaling.healing.globalMagMult)) * _healAmp);
      };
      targets.forEach(m => {
        const _wasKO = m.isKO;
        if (ab.isUltimate && m.isKO) {
          m.isKO = false;
          m.hp = 1;
        }
        if (!Battle.alive(m) && !ab.isUltimate) return;
        const amt = _getAmt(m);
        m.hp = Math.min(m.maxHp, m.hp + amt);

        const mIdx = isEnemyAction ? G.enemyGroup.indexOf(m) : G.party.indexOf(m);
        const layer = isEnemyAction ? 'enemy' : 'party';

        if (isEnemyAction) {
          BattleUI.popEnemy(mIdx, amt, 'heal', 'light');
        } else {
          BattleUI.popParty(mIdx, amt, 'heal', 'light');
          // Nilou Fix: If we just revived someone, wake them up immediately
          if (_wasKO && !m.isKO) BattleUI.setSpriteFrame(mIdx, 'idle');
        }

        if (e.cleanse && Battle.alive(m)) {
          m.statuses = (m.statuses || []).filter(s => !s.id.includes('debuff') && s.id !== 'status_frozen' && s.id !== 'status_stunned');
          BattleUI.addLog(`✨ ${m.displayName} Cleansed!`, 'heal');
        }
        BattleUI.createEffectOverlay(mIdx, element, layer, ab.id);
      });
      if (e.healBoost) Battle.addStatus(actor, { ...StatusSystem.DEFS.heal_boost, turns: e.duration || 3 });
      if (e.spdBuff) {
        // spdBuff > 1 = percentage multiplier (e.g. 1.2 = +20%); spdBuff <= 1 = flat additive (e.g. 1 = +1 SPD)
        const spdType = e.spdBuff > 1 ? 'mult' : 'flat';
        Battle.addStatus(actor, { id: 'buff_spd_ability', label: 'SPD Up', icon: '💨', stat: 'spd', type: spdType, value: e.spdBuff, turns: e.duration || 3 });
        BattleUI.addLog(`💨 ${actor.displayName}: SPD up!`, 'heal');
      }
      BattleUI.renderPartyStatus();
      BattleUI.renderPartyRow(); // Nilou Fix: Ensure sprites/HP bars are updated
      setTimeout(() => TurnManager.advance(), 800);
    },

    regen(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      targets.forEach(m => Battle.addStatus(m, { ...StatusSystem.DEFS.regen, turns: e.duration || 3 }));
      BattleUI.createEffectOverlay(G.activeMemberIdx, element, isEnemyAction ? 'enemy' : 'party', ab.id);
      BattleUI.addLog(`${actor.name || actor.displayName}: Regen activated!`, 'regen');
      BattleUI.renderPartyStatus();
      BattleUI.renderPartyRow(); // Sync update
      setTimeout(() => TurnManager.advance(), 750);
    },

    buff(actor, targets, ab, element, moveConfig, isEnemyAction) {
      const e = ab.effect || {};
      const _applyBuff = (m) => {
        if (!Battle.alive(m)) return;
        if (e.stat) Battle.addStatus(m, { id: `buff_${e.stat}`, label: `${e.stat.toUpperCase()} Up`, icon: e.stat === 'atk' ? '⚔️' : e.stat === 'def' ? '🛡️' : e.stat === 'spd' ? '💨' : '🔮', stat: e.stat, type: 'mult', value: e.multiplier || 1.3, turns: e.duration || 2 });
        if (e.atkBuff) Battle.addStatus(m, { id: 'buff_atk', label: 'ATK Up', icon: '⚔️', stat: 'atk', type: 'mult', value: e.atkBuff, turns: e.duration || 3 });
        if (e.defBuff) Battle.addStatus(m, { id: 'buff_def', label: 'DEF Up', icon: '🛡️', stat: 'def', type: 'mult', value: e.defBuff, turns: e.duration || 3 });
        if (e.magBuff) Battle.addStatus(m, { id: 'buff_mag', label: 'MAG Up', icon: '🔮', stat: 'mag', type: 'mult', value: e.magBuff, turns: e.duration || 3 });
        if (e.damageReduction) Battle.addStatus(m, { id: 'buff_ward', label: 'Warded', icon: '💎', type: 'reduction', value: 1 - e.damageReduction, turns: e.duration || 3 });
        if (e.hpRegen) Battle.addStatus(m, { ...StatusSystem.DEFS.regen, turns: e.duration || 3 });
        if (e.guardMark) Battle.addStatus(m, { id: 'status_taunt', label: 'Taunt', icon: '🛡️', type: 'buff', turns: e.duration || 3 });
        if (e.summonBoost) m.summonBoost = e.summonBoost;
        if (e.fireAmp) Battle.addStatus(m, { id: 'buff_fire_amp', label: 'Fire Amp', icon: '🔥', type: 'fire_amp', value: e.fireAmp, turns: e.duration || 3 });
        if (e.absorb) Battle.addStatus(m, { id: `buff_absorb_${e.absorb}`, label: `${e.absorb[0].toUpperCase() + e.absorb.slice(1)} Absorb`, icon: '💫', type: 'absorb', value: e.absorb, turns: e.duration || 3 });
        if (e.evasion) Battle.addStatus(m, { id: 'buff_evasion', label: 'Evasion', icon: '💨', type: 'evasion', value: e.evasion, turns: e.duration || 2 });

        const mIdx = isEnemyAction ? G.enemyGroup.indexOf(m) : G.party.indexOf(m);
        const layer = isEnemyAction ? 'enemy' : 'party';
        BattleUI.createEffectOverlay(mIdx, element, layer, ab.id);
      };

      if (e.aoe) {
        const pool = isEnemyAction ? G.enemyGroup : G.party;
        pool.filter(m => Battle.alive(m)).forEach(_applyBuff);
      } else {
        _applyBuff(actor);
      }
      BattleUI.addLog(`${actor.name || actor.displayName}: ${ab.name}!${BattleUI._getBuffReport(actor)}`, 'heal');
      BattleUI.renderPartyStatus();
      BattleUI.renderPartyRow(); // Fix: Ensure HP sacrifice (Hu Tao) or buffs show immediately
      setTimeout(() => TurnManager.advance(), 750);
    },

    debuff(actor, targets, ab, element, moveConfig, isEnemyAction) {
      const e = ab.effect || {};
      const enemy = targets[0];
      if (!enemy) { setTimeout(() => TurnManager.advance(), 750); return; }
      if (e.stat) { Battle.addStatus(enemy, { id: `debuff_${e.stat}`, label: `${e.stat.toUpperCase()} Down`, icon: '🔻', stat: e.stat, type: 'mult', value: e.multiplier || 0.7, turns: e.duration || 2, color: 'var(--red)' }); BattleUI.addLog(`${enemy.name}'s ${e.stat.toUpperCase()} lowered!`, 'magic'); }
      if (e.defDebuff) { Battle.addStatus(enemy, { id: 'debuff_def', label: 'DEF Down', icon: '🔻', stat: 'def', type: 'mult', value: e.defDebuff, turns: e.duration || 2 }); BattleUI.addLog(`${enemy.name}'s DEF lowered!`, 'magic'); }
      if (e.stunLow && enemy.hp <= enemy.maxHp * 0.3) { Battle.addStatus(enemy, { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1 }); BattleUI.addLog(`💫 ${enemy.name} is stunned! (Low HP)`, 'magic'); }
      if (e.freezeChance && !StatusSystem.has(enemy, 'status_frozen') && Math.random() < e.freezeChance) { Battle.addStatus(enemy, { id: 'status_frozen', label: 'Frozen', icon: '❄️', type: 'control', turns: 2 }); BattleUI.addLog(`❄️ ${enemy.name} is Frozen for 2 turns!`, 'magic'); }
      if (e.slowChance && !StatusSystem.has(enemy, 'status_slow') && Math.random() < e.slowChance) { Battle.addStatus(enemy, { ...StatusSystem.DEFS.slow }); BattleUI.addLog(`🐌 ${enemy.name} is Slowed!`, 'magic'); }
      BattleUI.renderEnemyRow();
      setTimeout(() => TurnManager.advance(), 750);
    },

    stun(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      const enemy = targets[0];
      if (enemy && Math.random() < (e.stunChance || NexusScaling.thresholds.stunChanceDefault)) {
        Battle.addStatus(enemy, { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1 });
        BattleUI.addLog(`💫 ${enemy.name} is stunned!`, 'magic');
      } else {
        BattleUI.addLog('Had no effect!', '');
      }
      BattleUI.renderEnemyRow(); // Sync update
      setTimeout(() => TurnManager.advance(), 750);
    },

    steal(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      const enemy = targets[0];
      if (enemy && Math.random() < (e.stealChance || NexusScaling.thresholds.stealChanceDefault)) { const gold = 5 + Math.floor(Math.random() * 10); actor.gold += gold; BattleUI.addLog(`Stole ${gold} gold from ${enemy.name}!`, 'steal'); }
      else BattleUI.addLog('Steal failed!', '');
      setTimeout(() => TurnManager.advance(), 750);
    },

    run(actor, targets, ab, element, moveConfig) {
      const e = ab.effect || {};
      if (e.guaranteedRun || Math.random() < NexusScaling.engine.escapeChanceBase) { BattleUI.addLog('Escaped successfully!', 'hi'); setTimeout(() => showResult('escaped'), 1000); return; }
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
      // For ultimates the pre-execute step already showed the overlay; suppress it for all AOE targets
      if (moveConfig.isUltimate && !isEnemyAction) ab._ultimateOverlayShown = true;
      targets.forEach(tgt => {
        const tIdx = isEnemyAction ? G.party.indexOf(tgt) : G.enemyGroup.indexOf(tgt);
        if (!isEnemyAction) {
          const dmg = resolveOffensiveAction(actor, tgt, tIdx, ab, element);
          totalDmg += dmg;
          if (ab.id === 'cryoclasm' && StatusSystem.has(tgt, 'status_frozen')) actor._cryoReset = true;
          // Apply vampiric effect if enemy survives and has the trait (logic from heroAttack)
          if (!isEnemyAction && Battle.alive(tgt)) _applyVampiric(tgt, dmg, tIdx);
        } else {
          resolveEnemyOffensiveAction(actor, tgt, tIdx, ab, element);
        }
      });
      if (moveConfig.isUltimate && !isEnemyAction) delete ab._ultimateOverlayShown;

      if (!isEnemyAction) {
        if (e.lifeSteal && totalDmg > 0) {
          let lMult = e.lifeSteal;
          if (e.healLowMult && actor.hp / actor.maxHp < NexusScaling.thresholds.wounded) lMult *= e.healLowMult;
          const healAmt = Math.floor(totalDmg * lMult);
          const healTargets = e.aoe ? G.party.filter(m => Battle.alive(m)) : [actor];
          healTargets.forEach(m => { const idx = G.party.indexOf(m); m.hp = Math.min(m.maxHp, m.hp + healAmt); BattleUI.popParty(idx, healAmt, 'heal', 'light'); });
          BattleUI.addLog(`💖 ${ab.name}: Restored ${healAmt} HP!`, 'heal');
          BattleUI.renderPartyRow(); // Fix: Update HP bars for lifesteal
        }
        if (e.guardian) { G.party.forEach(m => { if (Battle.alive(m)) Battle.addStatus(m, StatusSystem.DEFS.guardian); }); BattleUI.addLog('🛡️ Phantom Guardian summoned!', 'heal'); }
        if (e.partyBuff) { G.party.forEach((m, idx) => { if (!Battle.alive(m)) return; Battle.addStatus(m, { id: 'status_atk_boost', label: 'ATK+', icon: '⚔️', type: 'mult', stat: 'atk', value: 1.3, turns: 3 }); Battle.addStatus(m, { id: 'status_def_boost', label: 'DEF+', icon: '🛡️', type: 'mult', stat: 'def', value: 1.3, turns: 3 }); BattleUI.popParty(idx, 'ATK & DEF Up!', 'buff', 'holy'); }); BattleUI.addLog(`✨ ${ab.name}: The party is blessed!`, 'buff'); }
        if (e.cooldown) actor.cooldowns[ab.id] = e.cooldown + 1;
        if (actor._cryoReset) { actor.cooldowns[ab.id] = 0; BattleUI.addLog('❄ Cryoclasm Reset!', 'regen'); delete actor._cryoReset; }
        _checkDragonLeap(actor);
        BattleUI.renderPartyRow(); // Final catch-all refresh
      } else {
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
      setTimeout(() => {
        if (!isEnemyAction && Battle.alive(actor)) {
          const idx = G.party.indexOf(actor);
          if (idx !== -1) BattleUI.setSpriteFrame(idx, 'idle');
        }
        TurnManager.advance();
      }, moveConfig.isUltimate ? 900 : 750);
    };

    if (moveConfig.isUltimate) setTimeout(execute, 3000); else execute();
  }
};


/* ============================================================
   HERO / PARTY ACTIONS  (actor = current party member)
   ============================================================ */
function heroAttack() {
  if (G.busy) return;

  const actor = G.party[G.activeMemberIdx];
  const aliveEnemies = G.enemyGroup.filter(e => Battle.alive(e));
  if (!actor || !aliveEnemies.length) return;

  // Targeting Phase (Keyboard/Controller support)
  if (aliveEnemies.length > 1 && !G.pendingAction && !G._executingPending) {
    G.pendingAction = { type: 'attack' };
    BattleUI.openSub(null);
    if (typeof Focus !== 'undefined') {
      Focus.setTargeting(true, 'enemy');
      BattleUI.addLog(`Choose a target for ${actor.displayName}...`, 'hi');
    }
    return;
  }

  BattleUI.openSub(null);
  G.busy = true; BattleUI.btns(false);

  try {
    const actor = G.party[G.activeMemberIdx];
    const enemy = G.enemy;
    if (!actor || !enemy) { G.busy = false; BattleUI.btns(true); return; }

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
    BattleUI.setSpriteFrame(G.activeMemberIdx, 'prepare');

    setTimeout(() => {
      try {
        BattleUI.setSpriteFrame(G.activeMemberIdx, 'attack');
        if (typeof SFX !== 'undefined') { SFX.attack(); setTimeout(() => SFX.enemyHit(), 80); }
        const dmg = resolveOffensiveAction(actor, enemy, G.targetEnemyIdx, { name: 'attack', type: 'physical' }, _atkElem);
        _applyVampiric(enemy, dmg, G.targetEnemyIdx);
        _checkDragonLeap(actor);
        BattleUI.renderEnemyRow();
        setTimeout(() => {
          if (Battle.alive(actor)) BattleUI.setSpriteFrame(G.activeMemberIdx, 'idle');
          TurnManager.advance();
        }, 700);
      } catch (err) {
        console.error('[heroAttack inner] Error:', err);
        G.busy = false; BattleUI.btns(true);
      }
    }, 250); // Hold prepare frame for 250ms
  } catch (err) {
    console.error('[heroAttack] Error:', err);
    G.busy = false; BattleUI.btns(true);
  }
}

function heroAbility(ab) {
  if (G.busy) return;
  const actor = G.party[G.activeMemberIdx];
  if (!actor) return;

  const e = ab.effect || {};
  const offensive = ab.type === 'physical' || ab.type === 'magic_damage' || ab.type === 'debuff' || ab.type === 'stun';
  const aoe = e.aoe || ab.isUltimate;
  const aliveEnemies = G.enemyGroup.filter(en => Battle.alive(en));

  // Targeting Phase (Keyboard/Controller support)
  if (offensive && !aoe && aliveEnemies.length > 1 && !G.pendingAction && !G._executingPending) {
    // MP check first
    const _mpCost = Math.ceil(ab.mp * PassiveSystem.val(actor, 'MP_COST_MULT', 1.0));
    if (actor.mp < _mpCost) { BattleUI.setLog(['Not enough MP!'], ['dmg']); BattleUI.openSub(null); return; }

    G.pendingAction = { type: 'ability', ab: ab };
    BattleUI.openSub(null);
    if (typeof Focus !== 'undefined') {
      Focus.setTargeting(true, 'enemy');
      BattleUI.addLog(`Choose a target for ${ab.name}...`, 'hi');
    }
    return;
  }

  // MP Cost
  const _mpCost = Math.ceil(ab.mp * PassiveSystem.val(actor, 'MP_COST_MULT', 1.0));
  if (actor.mp < _mpCost) { BattleUI.setLog(['Not enough MP!'], ['dmg']); BattleUI.openSub(null); return; }

  BattleUI.openSub(null);
  G.busy = true; BattleUI.btns(false);

  try {
    actor.mp = Math.max(0, actor.mp - _mpCost);

    const e = ab.effect || {};
    const element = e.element || 'physical';
    const moveConfig = getMoveConfig(ab.id);

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
      BattleUI.setSpriteFrame(G.activeMemberIdx, 'magic');
      setTimeout(() => {
        spr.classList.remove(`anim-${ab.id}`, `element-${element}`);
        // Frame will be reset to idle inside ActionEngine.execute callback or here if not offensive
      }, moveConfig.actorDuration);
    }
    BattleUI.setLog([`${actor.displayName} uses ${ab.name}!`], ['magic']);

    const ultimateChannels = { cryoclasm: 'channels ice blades...', spirit_soother: 'channels soul fire...', hajras_hymn: 'channels star blessing...', mastery_of_pain: 'channels karmic winds...', absolute_summon: 'commands the Phantom Guardian...' };
    const isUltimate = ultimateChannels.hasOwnProperty(ab.id);

    const enemy = G.enemy;
    const offensiveTargets = e.aoe
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
      if (isUltimate) {
        BattleUI.addLog(`${actor.displayName} ${ultimateChannels[ab.id]}`, 'magic');
        // Only pre-show the overlay for offensive ultimates targeting enemies.
        // Buff/heal ultimates show their overlay inside the action handler on the correct party target.
        const isOffensiveUlt = ab.type === 'physical' || ab.type === 'magic_damage';
        if (isOffensiveUlt) {
          const _cfg = (typeof SVGAnimations !== 'undefined') ? SVGAnimations[ab.id] : null;
          // Fire screen shake once at the right cinematic moment
          if (_cfg?.screenShake) {
            setTimeout(() => BattleUI.triggerScreenShake(_cfg.screenShake), _cfg.shakeDelay || 0);
          }
          // Cascade overlay across each living enemy with 150ms stagger for visual impact
          offensiveTargets.forEach((en, i) => {
            const tIdx = G.enemyGroup.indexOf(en);
            setTimeout(() => BattleUI.createEffectOverlay(tIdx, element, 'enemy', ab.id, { suppressShake: true }), i * 150);
          });
          ab._ultimateOverlayShown = true;
        }
      }
      ActionEngine.execute(actor, targets, ab, element, { ...moveConfig, isUltimate }, false);
    }, moveConfig.actorDuration);
  } catch (err) {
    console.error('[heroAbility] Error:', err);
    G.busy = false; BattleUI.btns(true);
  }
}


function _checkDragonLeap(actor) {
  if (!PassiveSystem.hasTrait(actor, 'PROC_ATTACK_3RD_TURN')) return;
  actor._dragonLeapTurns = (actor._dragonLeapTurns || 0) + 1;
  if (actor._dragonLeapTurns % 3 !== 0) return;
  const target = G.enemy;
  if (!target || !Battle.alive(target)) return;
  const dmg = Math.floor(Battle.physDmg(Battle.getStat(actor, 'atk'), Battle.getStat(target, 'def'), 1.6, { atkLevel: actor.lv || 1, defLevel: target.level || 1 }) * Battle.elemMult('wind', target.element || 'physical'));
  target.hp = Math.max(0, target.hp - dmg);

  // Strategic Thaw: Attacking a frozen target breaks the ice
  if (typeof StatusSystem !== 'undefined' && StatusSystem.has(target, 'status_frozen')) {
    StatusSystem.remove(target, 'status_frozen');
    BattleUI.addLog(`❄️ ${target.name} shattered! They are no longer frozen!`, 'regen');
    BattleUI.renderEnemyRow();
  }

  if (target.hp <= 0) {
    Battle.setKO(target, false);
  }
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

  // Control check is handled at TurnManager level.
  // This legacy check is kept simplified as a fallback.
  if (enemy.statuses?.some(s => s.id === 'status_stunned' || s.id === 'status_frozen')) {
    TurnManager.advance();
    return;
  }
  // Slow — 50% chance to lose turn
  if (StatusSystem.has(enemy, 'status_slow') && Math.random() < 0.5) {
    BattleUI.addLog(`🐌 ${enemy.name} is too slow to act!`, 'regen');
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
  const moveConfig = getMoveConfig(ab?.id);
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

  // 4. Execution
  const targets = (ab?.effect?.aoe) ? alive : [target];

  setTimeout(() => {
    ActionEngine.execute(enemy, targets, ab, element, moveConfig, true);
  }, 580);
}

/* ============================================================
   WIN / LOSE CHECK + LEVEL UP
   ============================================================ */
