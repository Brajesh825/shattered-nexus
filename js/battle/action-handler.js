function createEffectOverlay(targetIdx, element, targetType = 'enemy', abilityId = null) {
  if (targetIdx === undefined || targetIdx === null) return;

  // Try to get SVG animation from SVGAnimations factory
  let overlay = null;
  let duration = 600;

  if (abilityId && SVGAnimations && SVGAnimations[abilityId]) {
    // Use SVG animation factory
    overlay = SVGAnimations[abilityId].create(targetIdx, targetType);
    duration = SVGAnimations[abilityId].duration;
  } else if (abilityId && moveAnimations[abilityId]) {
    // Fallback to CSS overlay animation from moveAnimations
    overlay = document.createElement('div');
    overlay.className = `effect-overlay overlay-${abilityId}`;
    duration = moveAnimations[abilityId].overlayDuration;
  } else {
    // Fallback to element-based CSS animation
    overlay = document.createElement('div');
    overlay.className = `effect-overlay element-${element}`;
    const durations = {
      'ice': 600, 'fire': 650, 'wind': 600, 'electric': 500,
      'water': 600, 'light': 700, 'dark': 650, 'physical': 500
    };
    duration = durations[element] || 600;
  }

  if (!overlay) return;

  // Position overlay on target sprite (enemy right side or party left side)
  const sprId = targetType === 'enemy' ? `espr-${targetIdx}` : `pspr-${targetIdx}`;
  const spr = document.getElementById(sprId);
  if (spr) {
    const rect = spr.getBoundingClientRect();
    const sceneRect = document.getElementById('battle-scene').getBoundingClientRect();
    // getBoundingClientRect() returns screen pixels; divide by game scale so the
    // overlay lands correctly inside the scaled #game coordinate space.
    const gameEl = document.getElementById('game');
    const scaleMatch = gameEl?.style.transform.match(/scale\(([\d.]+)\)/);
    const gameScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    overlay.style.left = ((rect.left - sceneRect.left + 8) / gameScale) + 'px';
    overlay.style.top = ((rect.top - sceneRect.top - 10) / gameScale) + 'px';
  }

  document.getElementById('battle-scene').appendChild(overlay);
  setTimeout(() => overlay.remove(), duration);
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
    UI.addLog(`${actor.displayName}'s ${action.name} missed ${target.name}!`, 'dmg');
    UI.popEnemy(targetIdx, 0, 'miss');
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
    UI.addLog(`⚡ REACTION: ${reaction.label}!`, 'hi');
    UI.popEnemy(targetIdx, reaction.label, 'crit');
    if (reaction.debuff === 'def') {
      Battle.addStatus(target, { id: 'debuff_def_shatter', label: 'Shattered', icon: '❄️', stat: 'def', type: 'mult', value: 0.7, turns: 1 });
      UI.addLog(`🛡️ ${target.name}'s DEF shattered!`, 'magic');
    }
    if (reaction.stun) {
      Battle.addStatus(target, { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1 });
      UI.addLog(`💫 ${target.name} is Conductive! (Stunned)`, 'magic');
    }
    if (reaction.dot) {
      Battle.addStatus(target, { id: 'debuff_burn', label: 'Burn', icon: '🔥', stat: 'hp', type: 'dot', value: Math.floor(dmg * 0.2), turns: 3 });
      UI.addLog(`🔥 ${target.name} is Burning!`, 'dmg');
    }
  }

  if (isCrit) {
    UI.addLog(`⭐ ${isMagic ? 'CRITICAL MAGIC!' : 'CRITICAL HIT!'}`, 'hi');
    UI.popEnemy(targetIdx, 'CRITICAL!', 'crit');
  }

  // 5. Apply result
  target.hp = Math.max(0, target.hp - dmg);
  if (target.hp <= 0) target.isKO = true;
  UI.popEnemy(targetIdx, dmg, isMagic ? 'magic' : 'dmg', element);
  createEffectOverlay(targetIdx, element, 'enemy', action.id);

  if (!reaction && element !== 'physical') {
    Battle.applyAura(target, element);
  }

  const _er = Battle.elemResult(element, target);
  if (_er === 'weak') UI.addLog('✦ WEAK!', 'magic');
  else if (_er === 'resist') UI.addLog('▸ Resist', 'regen');
  else if (_er === 'shatter') UI.addLog('⚡ SHATTER!', 'dmg');

  shakeEnemy(targetIdx);
  return dmg;
}

/* ============================================================
   HERO / PARTY ACTIONS  (actor = current party member)
   ============================================================ */
function heroAttack() {
  if (G.busy) return;
  UI.openSub(null);
  G.busy = true; UI.btns(false);

  const actor = G.party[G.activeMemberIdx];
  const enemy = G.enemy;
  if (!actor || !enemy) { G.busy = false; return; }

  // Basic attack carries the character's class element
  const _atkElem = actor.cls?.element || 'physical';
  const actorSpr = document.getElementById('pspr-' + G.activeMemberIdx);
  if (actorSpr) {
    actorSpr.classList.add('anim-slash');
    actorSpr.classList.add(`element-${_atkElem}`);
    setTimeout(() => {
      actorSpr.classList.remove('anim-slash');
      actorSpr.classList.remove(`element-${_atkElem}`);
    }, 460);
  }

  UI.setLog([`${actor.displayName} attacks ${enemy.name}!${UI._getBuffReport(actor)}`], ['hi']);

  setTimeout(() => {
    if (typeof SFX !== 'undefined') { SFX.attack(); setTimeout(() => SFX.enemyHit(), 80); }
    
    const dmg = resolveOffensiveAction(actor, enemy, G.targetEnemyIdx, { name: 'attack', type: 'physical' }, _atkElem);
    
    _applyVampiric(enemy, dmg, G.targetEnemyIdx);
    _checkDragonLeap(actor);
    UI.renderEnemyRow();
    setTimeout(advanceTurn, 700);
  }, 460);
}

function heroAbility(ab) {
  if (G.busy) return;
  const actor = G.party[G.activeMemberIdx];
  if (!actor) return;
  const _mpCost = actor.passive?.id === 'eidolon_bond' ? Math.ceil(ab.mp * 0.85) : ab.mp;
  if (actor.mp < _mpCost) { UI.setLog(['Not enough MP!'], ['dmg']); UI.openSub(null); return; }
  UI.openSub(null);
  G.busy = true; UI.btns(false);

  const e = ab.effect || {};
  const element = e.element || 'physical';

  // Get move-specific animation config or use defaults
  const moveConfig = moveAnimations[ab.id] || { actorDuration: 560, overlayDuration: 600, isUltimate: false };
  const animDuration = moveConfig.actorDuration;

  const spr = document.getElementById('pspr-' + G.activeMemberIdx);
  if (spr) {
    spr.classList.add(`anim-${ab.id}`);
    spr.classList.add(`element-${element}`);
    setTimeout(() => {
      spr.classList.remove(`anim-${ab.id}`);
      spr.classList.remove(`element-${element}`);
    }, animDuration);
  }
  UI.setLog([`${actor.displayName} uses ${ab.name}!`], ['magic']);
  actor.mp = Math.max(0, actor.mp - _mpCost);
  if (window.LogDebug) {
    window.LogDebug(`[Cost] ${actor.displayName}: Consumed ${_mpCost} MP (Remaining: ${actor.mp})`, 'info');
  }

  // HP Sacrifice (Hu Tao mechanics)
  if (e.hpCostPercent) {
    const cost = Math.floor(actor.hp * e.hpCostPercent);
    actor.hp = Math.max(1, actor.hp - cost);
    UI.popParty(G.activeMemberIdx, cost, 'dmg', 'dark');
    UI.addLog(`${actor.displayName} sacrifices vitality for power!`, 'dmg');
    if (window.LogDebug) {
      window.LogDebug(`[Sacrifice] ${actor.displayName}: Consumed ${cost} HP (${Math.round(e.hpCostPercent * 100)}% of current) for ability power`, 'dmg');
    }
  }

  // Ultimates with 3-second channel animation before damage lands
  const ultimateChannels = {
    'cryoclasm': 'channels ice blades...',
    'spirit_soother': 'channels soul fire...',
    'hajras_hymn': 'channels star blessing...',
    'mastery_of_pain': 'channels karmic winds...',
    'absolute_summon': 'commands the Phantom Guardian...'
  };
  const isUltimate = ultimateChannels.hasOwnProperty(ab.id);

  setTimeout(() => {
    const enemy = G.enemy;

    if (isUltimate) {
      UI.addLog(`${actor.displayName} ${ultimateChannels[ab.id]}`, 'magic');
      createEffectOverlay(G.targetEnemyIdx, element, 'enemy', ab.id);
    }

    if (ab.type === 'physical' || ab.type === 'magic_damage') {
      const isOnCD = actor.cooldowns && actor.cooldowns[ab.id] > 0;
      if (isOnCD) { UI.addLog(`${ab.name} is on cooldown for ${actor.cooldowns[ab.id]} turns!`, 'dmg'); G.busy = false; UI.btns(true); return; }

      if (typeof SFX !== 'undefined') {
        if (ab.type === 'physical') SFX.attack(); else SFX.magic();
      }

      const targets = (e.aoe || isUltimate)
        ? G.enemyGroup.map((en, i) => ({ en, i })).filter(({ en }) => Battle.alive(en))
        : [{ en: enemy, i: G.targetEnemyIdx }];

      // Special handling for Ultimates (delay)
      const executeResolvedAction = () => {
        let totalDmg = 0;
        targets.forEach(({ en: tgt, i: tIdx }) => {
          const dmg = resolveOffensiveAction(actor, tgt, tIdx, ab, element);
          totalDmg += dmg;

          // Cryoclasm reset logic
          const _isFrozen = tgt.statuses?.some(s => s.id === 'status_frozen');
          if (ab.id === 'cryoclasm' && _isFrozen) {
            actor._cryoReset = true;
          }
        });

        // LifeSteal
        if (e.lifeSteal && totalDmg > 0) {
          let lMult = e.lifeSteal;
          if (e.healLowMult && actor.hp / actor.maxHp < 0.5) lMult *= e.healLowMult;
          const healAmt = Math.floor(totalDmg * lMult);
          
          const healTargets = e.aoe ? G.party.filter(m => Battle.alive(m)) : [actor];
          healTargets.forEach(m => {
            const idx = G.party.indexOf(m);
            m.hp = Math.min(m.maxHp, m.hp + healAmt);
            UI.popParty(idx, healAmt, 'heal', 'light');
          });
          UI.addLog(`💖 ${ab.name}: Restored ${healAmt} HP!`, 'heal');
        }

        if (e.guardian) {
          G.party.forEach(m => { if (Battle.alive(m)) m.guardianTurns = 2; });
          UI.addLog('🛡️ Phantom Guardian summoned!', 'heal');
        }

        if (e.partyBuff) {
          G.party.forEach((m, idx) => {
            if (!Battle.alive(m)) return;
            Battle.addStatus(m, { id: 'status_atk_boost', label: 'ATK+', icon: '⚔️', type: 'mult', stat: 'atk', value: 1.3, turns: 3 });
            Battle.addStatus(m, { id: 'status_def_boost', label: 'DEF+', icon: '🛡️', type: 'mult', stat: 'def', value: 1.3, turns: 3 });
            UI.popParty(idx, 'ATK & DEF Up!', 'buff', 'holy');
          });
          UI.addLog(`✨ ${ab.name}: The party is blessed! (ATK & DEF +30%)`, 'buff');
        }

        if (e.cooldown) {
          actor.cooldowns[ab.id] = e.cooldown + 1;
        }
        if (actor._cryoReset) {
          actor.cooldowns[ab.id] = 0;
          UI.addLog('❄ Cryoclasm Reset! Strike again!', 'regen');
          delete actor._cryoReset;
        }

        _checkDragonLeap(actor);
        UI.renderEnemyRow(); UI.renderPartyStatus();
        setTimeout(advanceTurn, moveConfig.isUltimate ? 900 : 750);
      };

      if (isUltimate) {
        setTimeout(executeResolvedAction, 3000);
      } else {
        executeResolvedAction();
      }
      return;

    } else if (ab.type === 'heal') {
      if (typeof SFX !== 'undefined') SFX.heal();
      const _healAmp = (actor.passive?.id === 'dance_of_haftkarsvar' ? 1.3 : 1.0) * (actor.healBoost || 1.0);
      const getHealAmt = (m) => {
        if (e.healPercent) return Math.floor(m.maxHp * e.healPercent);
        const base = e.healBase || 20;
        const rand = e.healRandom || 15;
        const magBonus = Math.floor(actor.mag * 1.5);
        return Math.floor((base + Math.random() * rand + magBonus) * _healAmp);
      };

      const targets = (e.aoe || ab.isUltimate)
        ? G.party.filter(m => Battle.alive(m) || ab.isUltimate)
        : (() => { const self = G.party[G.activeMemberIdx]; return (!Battle.alive(self) && !ab.isUltimate) ? [] : [self]; })();
      targets.forEach(m => {
        // Revival logic for Ultimate heals (Hajra's Hymn)
        if (ab.isUltimate && m.isKO) {
          m.isKO = false;
          m.hp = 1; // Start at 1 for the addition process below
          if (window.LogDebug) window.LogDebug(`[Revive] ${actor.displayName} resurrected ${m.displayName}!`, 'buff');
        }
        const amt = getHealAmt(m);
        m.hp = Math.min(m.maxHp, m.hp + amt);

        if (window.LogDebug) {
          const base = e.healBase || 20;
          const magBonus = Math.floor(actor.mag * 1.5);
          window.LogDebug(`[Heal] ${actor.displayName} ➔ ${m.displayName}: ${amt} HP (Base ${base} + MagBonus ${magBonus} * Amp ${_healAmp.toFixed(2)})`, 'buff');
        }

        const pIdx = G.party.indexOf(m);
        UI.popParty(pIdx, amt, 'heal', 'light');

        if (e.cleanse && Battle.alive(m)) {
          if (!m.statuses) m.statuses = [];
          m.statuses = m.statuses.filter(s => s.id !== 'status_frozen' && s.id !== 'status_stunned' && !s.id.includes('debuff'));
          UI.addLog(`✨ ${m.displayName} Cleansed!`, 'heal');
        }
      });
      createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);

      if (e.healBoost) {
        actor.healBoost = e.healBoost;
        actor.healBoostTurns = e.duration || 3;
        UI.addLog(`🌿 ${actor.displayName}: Healing Power +${Math.round((e.healBoost - 1) * 100)}%!`, 'heal');
      }
      if (e.spdBuff) {
        actor.spd = Math.floor(actor.spd * e.spdBuff);
        actor._spdBuffVal = e.spdBuff;
        UI.addLog(`💨 ${actor.displayName}: SPD +${Math.round((e.spdBuff - 1) * 100)}%!`, 'heal');
      }

      UI.renderPartyStatus();
      setTimeout(advanceTurn, 800);
      return;

    } else if (ab.type === 'regen') {
      actor.regenTurns = e.duration || 3;
      createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
      UI.addLog(`${actor.displayName}: Regen (${e.hpRegen || 8} HP/turn) for ${actor.regenTurns} turns!`, 'regen');

    } else if (ab.type === 'buff') {
      const _fmt = v => (v > 1) ? `+${Math.round((v - 1) * 100)}%` : `${Math.round((v - 1) * 100)}%`;
      const applyBuff = (m, idx) => {
        // NEVER apply buffs to KO'd members — revival belongs to heal-type ultimates only
        if (!Battle.alive(m)) return;

        // Primary stat buff
        if (e.stat) {
          const icon = e.stat === 'atk' ? '⚔️' : e.stat === 'def' ? '🛡️' : e.stat === 'spd' ? '💨' : '🔮';
          Battle.addStatus(m, {
            id: `buff_${e.stat}`,
            label: `${e.stat.toUpperCase()} Up`,
            icon: icon,
            stat: e.stat,
            type: 'mult',
            value: e.multiplier || 1.3,
            turns: e.duration || 2
          });
        }

        if (e.atkBuff) {
          Battle.addStatus(m, { id: 'buff_atk', label: 'ATK Up', icon: '⚔️', stat: 'atk', type: 'mult', value: e.atkBuff, turns: e.duration || 3 });
        }
        if (e.defBuff) {
          Battle.addStatus(m, { id: 'buff_def', label: 'DEF Up', icon: '🛡️', stat: 'def', type: 'mult', value: e.defBuff, turns: e.duration || 3 });
        }
        if (e.magBuff) {
          Battle.addStatus(m, { id: 'buff_mag', label: 'MAG Up', icon: '🔮', stat: 'mag', type: 'mult', value: e.magBuff, turns: e.duration || 3 });
        }

        // Legacy fields preserved as properties for now (HP Regen, Guard, etc.)
        if (e.damageReduction) { m.dmgReduction = (1 - e.damageReduction); }
        if (e.hpRegen) { m.hpRegenAmt = e.hpRegen; m.regenTurns = e.duration || 3; }
        if (e.guardMark) {
          Battle.addStatus(m, { id: 'status_taunt', label: 'Taunt', icon: '🛡️', type: 'buff', turns: e.duration || 3 });
        }
        if (e.summonBoost) { m.summonBoost = e.summonBoost; }

        if (window.LogDebug) {
          window.LogDebug(`[Buff] ${m.displayName}: Applied ${ab.name} (Duration: ${e.duration || 2} turns)`, 'buff');
        }

        createEffectOverlay(idx, element, 'party', ab.id);
      };

      if (e.aoe) {
        G.party.forEach((m, i) => applyBuff(m, i));
        UI.addLog(`${actor.displayName}: ${ab.name}!${UI._getBuffReport(actor)}`, 'heal');
      } else {
        applyBuff(actor, G.activeMemberIdx);
        UI.addLog(`${actor.displayName}: ${ab.name}!${UI._getBuffReport(actor)}`, 'heal');
      }

    } else if (ab.type === 'debuff') {
      if (e.stat) {
        Battle.addStatus(enemy, {
          id: `debuff_${e.stat}`,
          label: `${e.stat.toUpperCase()} Down`,
          icon: '🔻',
          stat: e.stat,
          type: 'mult',
          value: e.multiplier || 0.7,
          turns: e.duration || 2,
          color: 'var(--red)'
        });
        UI.addLog(`${enemy.name}'s ${e.stat.toUpperCase()} lowered!`, 'magic');
      }
      // Freeze secondary effect (e.g. Permafrost)
      if (e.freezeChance && !enemy.statuses?.some(s => s.id === 'status_frozen') && Math.random() < e.freezeChance) {
        Battle.addStatus(enemy, { id: 'status_frozen', label: 'Frozen', icon: '❄️', type: 'control', turns: 2 });
        UI.addLog(`❄️ ${enemy.name} is Frozen for 2 turns!`, 'magic');
      }

    } else if (ab.type === 'stun') {
      if (Math.random() < (e.stunChance || 0.5)) {
        Battle.addStatus(enemy, { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1 });
        UI.addLog(`💫 ${enemy.name} is stunned!`, 'magic');
      } else {
        UI.addLog('Had no effect!', '');
      }

    } else if (ab.type === 'steal') {
      const ok = Math.random() < (e.stealChance || 0.5);
      if (ok) {
        const gold = 5 + Math.floor(Math.random() * 10);
        actor.gold += gold;
        UI.addLog(`Stole ${gold} gold from ${enemy.name}!`, 'steal');
      } else {
        UI.addLog('Steal failed!', '');
      }

    } else if (ab.type === 'run') {
      if (e.guaranteedRun || Math.random() < 0.6) {
        UI.addLog('Escaped successfully!', 'hi');
        setTimeout(() => showResult('escaped'), 1000);
        return;
      }
      UI.addLog('Could not escape!', 'dmg');
      UI.renderEnemyRow(); UI.renderPartyStatus();
      setTimeout(advanceTurn, 800);
      return;
    }

    // Skip normal render/turn for all ultimates (handled in special timing)
    const ultimateIds = ['cryoclasm', 'guide_to_afterlife', 'hajras_hymn', 'mastery_of_pain', 'absolute_summon'];
    if (ab.type === 'magic_damage' && ultimateIds.includes(ab.id)) {
      return;
    }

    UI.renderEnemyRow(); UI.renderPartyStatus();
    setTimeout(advanceTurn, moveConfig.isUltimate ? 900 : 750);
  }, animDuration);
}



function shakeEnemy(idx) {
  const spr = document.getElementById('espr-' + idx);
  if (!spr) return;
  spr.classList.add('anim-shake');
  setTimeout(() => spr.classList.remove('anim-shake'), 380);
}

/* ============================================================
   PASSIVE HELPERS
   ============================================================ */
// Dragon's Leap: every 3rd hero action fires a free bonus aerial strike
function _checkDragonLeap(actor) {
  if (actor.passive?.id !== 'dragon_leap') return;
  actor._dragonLeapTurns = (actor._dragonLeapTurns || 0) + 1;
  if (actor._dragonLeapTurns % 3 !== 0) return;
  const tgt = G.enemy;
  if (!tgt || !Battle.alive(tgt)) return;
  const dmg = Math.floor(Battle.physDmg(Battle.getStat(actor, 'atk'), Battle.getStat(tgt, 'def'), 1.6, actor.lv || 1, tgt.level || 1) * Battle.elemMult('wind', tgt));
  tgt.hp = Math.max(0, tgt.hp - dmg);
  if (tgt.hp <= 0) tgt.isKO = true;
  UI.popEnemy(G.targetEnemyIdx, dmg, 'dmg', 'wind');
  UI.addLog(`🐉 Dragon's Leap! Bonus aerial strike for ${dmg}!`, 'magic');
  UI.renderEnemyRow();
}

/* ============================================================
   ENEMY AI
   ============================================================ */
function enemyAct(enemy, enemyIdx) {
  // NEW: Start-of-Turn maintenance (debuffs, cooldowns)
  Battle.tickActorStatus(enemy, true);

  // CONTROL CHECK (Phase 5 Refinement: Unified Status System)
  const isIncapacitated = enemy.statuses?.some(s => s.id === 'status_stunned' || s.id === 'status_frozen');
  if (isIncapacitated) {
    advanceTurn();
    return;
  }
  // (Frozen turn-skip now handled unified in processCurrentTurn)

  // ── TARGET SELECTION (Phase 5: Role-Based AI) ──────────────────
  const alive = G.party.filter(m => Battle.alive(m));
  if (!alive.length) { advanceTurn(); return; }

  let target;
  let targetIdx;
  const role = enemy.aiRole || 'attacker';

  // 1. Forced Targeting (Taunt)
  const taunterIdx = G.party.findIndex(m => Battle.alive(m) && m.statuses?.some(s => s.id === 'status_taunt'));
  if (taunterIdx !== -1) {
    target = G.party[taunterIdx];
    targetIdx = taunterIdx;
    UI.addLog(`🛡️ Enemies focused on ${target.displayName}'s Taunt!`, 'regen');
  }

  // 2. Role-Based Logic
  else {
    if (role === 'tactician') {
      // Find targets with an active aura
      const auratized = alive.filter(m => m.statuses?.some(s => s.id.startsWith('aura_')));
      if (auratized.length > 0) {
        target = auratized[Math.floor(Math.random() * auratized.length)];
        UI.addLog(`🔍 ${enemy.name} is looking for a Synergy...`, 'hi');
        UI.popAI(enemyIdx, '⚡ FOCUS SYNERGY!');
      }
    }

    if (!target && role === 'predator') {
      // Always target lowest HP
      alive.sort((a, b) => a.hp - b.hp);
      target = alive[0];
      UI.addLog(`🐺 ${enemy.name} is hunting the weak...`, 'hi');
      UI.popAI(enemyIdx, '🐺 TARGET WEAKNESS!');
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
        UI.addLog(`🩹 ${enemy.name} prioritizes healing!`, 'hi');
        UI.popAI(enemyIdx, '🩹 HEAL ALLY!');
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
      UI.addLog(`🛡️ Vanguard: ${target.displayName} intercepts for the party!`, 'hi');
      UI.popParty(targetIdx, '🛡️ PROTECT!', 'buff', 'holy');
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

  const enemySpr = document.getElementById('espr-' + enemyIdx);
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
    // Helper: apply elite resist (Tarnished Wing relic) to damage from Corrupted/Mutant
    const _isElite = !!(enemy.mutantTraits || enemy.isCorrupted);
    const _applyEliteResist = (dmg, tgt) => {
      const resist = tgt._eliteResist || 0;
      return (_isElite && resist > 0) ? Math.max(1, Math.floor(dmg * (1 - resist))) : dmg;
    };

    if (!ab || ab.type === 'physical') {
      if (typeof SFX !== 'undefined') { SFX.enemyHit(); setTimeout(() => SFX.attack(), 60); }

      // 1. Check Evasion
      let evaBonus = 0;
      // Diamond Formation: Rearguard (Index 1) gets +30% evasion vs physical
      if (targetIdx === 1) evaBonus = 0.3;

      if (target.evasion && Math.random() < (target.evasion + evaBonus)) {
        UI.addLog(`💨 ${target.displayName} ${evaBonus > 0 ? '(Rearguard)' : ''} dodged the attack!`, 'hi');
        UI.popParty(targetIdx, 0, 'miss');
        setTimeout(advanceTurn, 700); // Need to advance turn on miss too
        return;
      }

      const _pm = Battle.playerElemMult(element, target);
      const _eAtk = Battle.getStat(enemy, 'atk');
      const _tDef = Battle.getStat(target, 'def');

      // 1. Hit Check
      if (!Battle.rollHit(enemy, target)) {
        UI.addLog(`${enemy.name}'s attack missed!`, 'dmg');
        UI.popParty(targetIdx, 0, 'miss');
        setTimeout(advanceTurn, 700);
        return;
      }

      // 2. Catalyst & Synergy: Check for Reaction on Player
      const reaction = Battle.triggerReaction(target, element);
      const _rxMult = reaction ? reaction.dmgMult : 1.0;

      const isCrit = Battle.rollCrit(enemy);
      let dmg = Math.floor(Battle.physDmg(_eAtk, _tDef, ab?.dmgMultiplier || 1, enemy.level || 1, target.lv || 1, 0, enemy.name, target.displayName, isCrit) * _pm * _rxMult);

      if (reaction) {
        UI.addLog(`⚠️ ENEMY REACTION: ${reaction.label}!`, 'dmg');
        UI.popParty(targetIdx, reaction.label, 'crit');
        if (reaction.debuff === 'def') {
          Battle.addStatus(target, { id: 'debuff_def_shatter', label: 'Shattered', icon: '❄️', stat: 'def', type: 'mult', value: 0.7, turns: 1 });
          UI.addLog(`🛡️ ${target.displayName}'s DEF shattered!`, 'dmg');
        }
        if (reaction.isDampened) UI.addLog('(Effect dampened by resistance)', 'regen');
      }

      if (isCrit) {
        UI.addLog(`⭐ ENEMY CRITICAL!`, 'dmg');
        UI.popParty(targetIdx, 'CRITICAL!', 'crit');
      }

      // Absorption Check
      if (target.absorbElement && target.absorbElement === element) {
        target.hp = Math.min(target.maxHp, target.hp + dmg);
        UI.popParty(targetIdx, dmg, 'heal');
        UI.addLog(`⭐ ${target.displayName} ABSORBED the attack!`, 'heal');
        if (window.LogDebug) window.LogDebug(`[Absorb] ${target.displayName} absorbed ${dmg} from ${enemy.name}'s attack`, 'buff');
        createEffectOverlay(targetIdx, element, 'party');
        UI.renderPartyStatus();
        setTimeout(advanceTurn, 700);
        return;
      }

      // Apply passive & buff damage reductions
      if (target.passive?.id === 'yakshas_valor') dmg = Math.floor(dmg * 0.9);
      if (target.passive?.id === 'divine_authority') dmg = Math.floor(dmg * 0.85);
      if (target.passive?.id === 'divine_blessing') dmg = Math.floor(dmg * 0.88);
      if (target.dmgReduction) dmg = Math.floor(dmg * target.dmgReduction);
      if (target.guardianTurns > 0) {
        dmg = Math.floor(dmg * 0.7);
        UI.addLog(`(Guardian Mitigated -30%)`, 'hi');
      }

      dmg = _applyEliteResist(dmg, target); // Tarnished Wing elite resist
      target.hp = Math.max(0, target.hp - dmg);
      UI.popParty(targetIdx, dmg, 'dmg', element);

      // 4. Apply Aura if no reaction occurred
      if (!reaction && element !== 'physical') {
        Battle.applyAura(target, element);
      }

      createEffectOverlay(targetIdx, element, 'party');
      const pspr = document.getElementById('pspr-' + targetIdx);
      if (pspr) { pspr.classList.add('anim-shake'); setTimeout(() => pspr.classList.remove('anim-shake'), 380); }
      const _pr = Battle.playerElemResult(element, target);
      UI.setLog([`${enemy.name} attacks ${target.displayName}!`, `${target.displayName} took ${dmg} damage!`], ['', 'dmg']);
      if (_pr === 'weak') UI.addLog('✦ WEAK!', 'dmg');
      else if (_pr === 'resist') UI.addLog('▸ Resist', 'regen');

      // Reflect Damage (Warden's Valor / passive)
      const reflectPerc = (target.reflect || 0) + (target.passive?.id === 'divine_authority' ? 0.1 : 0);
      if (reflectPerc > 0 && dmg > 0 && Battle.alive(enemy)) {
        const reflect = Math.floor(dmg * reflectPerc);
        enemy.hp = Math.max(0, enemy.hp - reflect);
        UI.addLog(`✦ Reflected ${reflect} damage!`, 'magic');
      }

    } else if (ab.type === 'magic_damage') {
      if (typeof SFX !== 'undefined') SFX.magic();

      // 1. Check Evasion (can dodge magic too in this system)
      if (target.evasion && Math.random() < target.evasion) {
        UI.addLog(`💨 ${target.displayName} dodged the spell!`, 'hi');
        UI.popParty(targetIdx, 0, 'miss');
        return;
      }

      const _pm = Battle.playerElemMult(element, target);
      const _eMag = Battle.getStat(enemy, 'mag');
      const _tMag = Battle.getStat(target, 'mag');

      // 1. Hit Check
      if (!Battle.rollHit(enemy, target)) {
        UI.addLog(`${enemy.name}'s spell missed!`, 'magic');
        UI.popParty(targetIdx, 0, 'miss');
        setTimeout(advanceTurn, 700);
        return;
      }

      // 2. Catalyst & Synergy: Check for Reaction on Player
      const reaction = Battle.triggerReaction(target, element);
      const _rxMult = reaction ? reaction.dmgMult : 1.0;

      const isCrit = Battle.rollCrit(enemy);
      let dmg = Math.floor(Battle.magicDmg(_eMag, ab.dmgMultiplier || 1.3, 1.0, enemy.level || 1, _tMag, target.lv || 1, enemy.name, target.displayName, isCrit) * _pm * _rxMult);

      if (reaction) {
        UI.addLog(`⚠️ ENEMY REACTION: ${reaction.label}!`, 'dmg');
        UI.popParty(targetIdx, reaction.label, 'crit');
        if (reaction.stun) {
          Battle.addStatus(target, { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1 });
          UI.addLog(`💫 ${target.displayName} is Conductive! (Stunned)`, 'dmg');
        }
        if (reaction.dot) {
          Battle.addStatus(target, { id: 'debuff_burn', label: 'Burn', icon: '🔥', stat: 'hp', type: 'dot', value: Math.floor(dmg * 0.2), turns: 3 });
          UI.addLog(`🔥 ${target.displayName} is Burning!`, 'dmg');
        }
        if (reaction.isDampened) UI.addLog('(Effect dampened by resistance)', 'regen');
      }

      if (isCrit) {
        UI.addLog(`⭐ ENEMY CRITICAL MAGIC!`, 'magic');
        UI.popParty(targetIdx, 'CRITICAL!', 'crit');
      }

      // Absorption Check
      if (target.absorbElement && target.absorbElement === element) {
        target.hp = Math.min(target.maxHp, target.hp + dmg);
        UI.popParty(targetIdx, dmg, 'heal');
        UI.addLog(`⭐ ${target.displayName} ABSORBED the spell!`, 'heal');
        if (window.LogDebug) window.LogDebug(`[Absorb] ${target.displayName} absorbed ${dmg} from ${enemy.name}'s spell`, 'buff');
        createEffectOverlay(targetIdx, element, 'party');
        UI.renderPartyStatus();
        setTimeout(advanceTurn, 700);
        return;
      }

      if (target.passive?.id === 'yakshas_valor') dmg = Math.floor(dmg * 0.9);
      if (target.passive?.id === 'divine_authority') dmg = Math.floor(dmg * 0.85);
      if (target.passive?.id === 'divine_blessing') dmg = Math.floor(dmg * 0.88);
      if (target.dmgReduction) dmg = Math.floor(dmg * target.dmgReduction);
      if (target.guardianTurns > 0) {
        dmg = Math.floor(dmg * 0.7);
        UI.addLog(`(Guardian Mitigated -30%)`, 'hi');
      }

      dmg = _applyEliteResist(dmg, target); // Tarnished Wing elite resist
      target.hp = Math.max(0, target.hp - dmg);
      UI.popParty(targetIdx, dmg, 'magic', element);

      // 4. Apply Aura if no reaction occurred
      if (!reaction && element !== 'physical') {
        Battle.applyAura(target, element);
      }

      createEffectOverlay(targetIdx, element, 'party');
      const _pr = Battle.playerElemResult(element, target);
      UI.setLog([`${enemy.name} uses ${ab.name}!`, `${target.displayName} took ${dmg} magic damage!`], ['magic', 'dmg']);
      if (_pr === 'weak') UI.addLog('✦ WEAK!', 'dmg');
      else if (_pr === 'resist') UI.addLog('▸ Resist', 'regen');

      // Reflect
      const reflectPerc = (target.reflect || 0) + (target.passive?.id === 'divine_authority' ? 0.1 : 0);
      if (reflectPerc > 0 && dmg > 0 && Battle.alive(enemy)) {
        const reflect = Math.floor(dmg * reflectPerc);
        enemy.hp = Math.max(0, enemy.hp - reflect);
        UI.addLog(`✦ Reflected ${reflect} damage!`, 'magic');
      }

    } else {
      UI.setLog([`${enemy.name} uses ${ab.name}!`], ['']);
    }

    // Iron Will (Kael)
    if (target.passive?.id === 'iron_will' && !target.passive.triggered && target.hp / target.maxHp < 0.3) {
      target.def = Math.floor(target.def * 1.25);
      target.passive = { ...target.passive, triggered: true };
    }

    // ── Mutant trait ticks after enemy action ─────────────────
    G.enemyGroup.forEach((e, i) => {
      if (!Battle.alive(e) || !e.mutantTraits) return;
      const traits = e.mutantTraits;

      // Regenerating: recover 5% max HP per turn end
      if (traits.some(t => t.id === 'regenerating')) {
        const healAmt = Math.max(1, Math.floor(e.maxHp * 0.05));
        e.hp = Math.min(e.maxHp, e.hp + healAmt);
        UI.popEnemy(i, healAmt, 'regen');
        if (window.LogDebug) window.LogDebug(`[Passive] ${e.name} (Regenerating): Recovered ${healAmt} HP`, 'buff');
      }

      // Enraged: ATK grows +5% per turn
      if (traits.some(t => t.id === 'enraged')) {
        e._enragedTurns = (e._enragedTurns || 0) + 1;
        const gain = Math.max(1, Math.floor(e.atk * 0.05));
        e.atk += gain;
        if (e._enragedTurns === 1) UI.addLog(`⚡ ${e.name} is Enraged! ATK rising each turn!`, 'dmg');
        if (window.LogDebug) window.LogDebug(`[Passive] ${e.name} (Enraged): ATK increased to ${e.atk}`, 'passive');
      }
    });

    if (target.hp <= 0) {
      target.isKO = true;
      UI.addLog(`${target.displayName} has fallen!`, 'dmg');
    }

    UI.renderPartyStatus();
    UI.renderPartyRow();
    setTimeout(advanceTurn, 760);
  }, 580);
}

/* ============================================================
   WIN / LOSE CHECK + LEVEL UP
   ============================================================ */
