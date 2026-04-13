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
    overlay.style.top  = ((rect.top  - sceneRect.top  - 10) / gameScale) + 'px';
  }

  document.getElementById('battle-scene').appendChild(overlay);
  setTimeout(() => overlay.remove(), duration);
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
    const _em   = Battle.elemMult(_atkElem, enemy);
    const _bb   = actor.passive?.id === 'blood_blossom' && actor.hp / actor.maxHp < 0.5 ? 1.35 : 1.0;
    const _stab = actor.cls?.element ? 1.25 : 1.0; // no element = no STAB on basic attack
    const dmg   = Math.floor(Battle.physDmg(actor.atk, enemy.def, 1, actor.lv || 1, enemy.level || 1) * _em * _stab * _bb);
    enemy.hp  = Math.max(0, enemy.hp - dmg);
    if (enemy.hp <= 0) enemy.isKO = true;
    const _er = Battle.elemResult(_atkElem, enemy);
    if (_er === 'shatter') UI.addLog('⚡ SHATTER!', 'magic');
    else if (_er === 'weak')   UI.addLog('✦ WEAK!', 'magic');
    else if (_er === 'resist') UI.addLog('▸ Resist', 'regen');
    else if (_er === 'immune') UI.addLog('■ IMMUNE — no effect!', 'regen');
    UI.addLog('◈ STAB!', 'magic');

    UI.popEnemy(G.targetEnemyIdx, dmg, 'dmg', _atkElem);
    createEffectOverlay(G.targetEnemyIdx, _atkElem, 'enemy');

    const enemySpr = document.getElementById('espr-' + G.targetEnemyIdx);
    if (enemySpr) {
      enemySpr.classList.add('sprite-damage-flash');
      setTimeout(() => enemySpr.classList.remove('sprite-damage-flash'), 200);
    }

    shakeEnemy(G.targetEnemyIdx);
    _applyVampiric(enemy, dmg, G.targetEnemyIdx);
    UI.addLog(`Dealt ${dmg} damage!`, 'dmg');
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

  const e   = ab.effect || {};
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

  // HP Sacrifice (Hu Tao mechanics)
  if (e.hpCostPercent) {
    const cost = Math.floor(actor.hp * e.hpCostPercent);
    actor.hp = Math.max(1, actor.hp - cost);
    UI.popParty(G.activeMemberIdx, cost, 'dmg', 'dark');
    UI.addLog(`${actor.displayName} sacrifices vitality for power!`, 'dmg');
  }

  // Ultimates with 3-second channel animation before damage lands
  const ultimateChannels = {
    'cryoclasm':         'channels ice blades...',
    'spirit_soother':    'channels soul fire...',
    'hajras_hymn':       'channels star blessing...',
    'mastery_of_pain':   'channels karmic winds...',
    'absolute_summon':   'commands the Phantom Guardian...'
  };
  const isUltimate = ultimateChannels.hasOwnProperty(ab.id);

  setTimeout(() => {
    const enemy = G.enemy;

    if (isUltimate) {
      UI.addLog(`${actor.displayName} ${ultimateChannels[ab.id]}`, 'magic');
      createEffectOverlay(G.targetEnemyIdx, element, 'enemy', ab.id);
    }

    if (ab.type === 'physical') {
      const isOnCD = actor.cooldowns && actor.cooldowns[ab.id] > 0;
      if (isOnCD) { UI.addLog(`${ab.name} is on cooldown for ${actor.cooldowns[ab.id]} turns!`, 'dmg'); G.busy = false; UI.btns(true); return; }

      if (typeof SFX !== 'undefined') SFX.attack();
      const _stab = actor.passive?.id === 'eidolon_bond' ? 1.25 : (element === actor.cls?.element || (element === 'wind' && actor.cls?.element === 'anemo') || (element === 'anemo' && actor.cls?.element === 'wind')) ? 1.25 : 1.0;
      const _bb   = actor.passive?.id === 'blood_blossom' && actor.hp / actor.maxHp < 0.5 ? 1.35 : 1.0;
      
      // Balanced HP Scaling (10%) vs Standard Stat Scaling (50%)
      const _scaleCoeff = (e.statScale === 'hp' || e.statScale === 'maxHp') ? 0.1 : 0.5;
      const _scaleStat = e.statScale ? Math.floor((actor[e.statScale] || 0) * _scaleCoeff) : 0;
      const _effectiveAtk = actor.atk + _scaleStat;

      // Desperation Bonus: Hits harder with lower health
      const _hpPercent = actor.hp / actor.maxHp;
      const _lowHpMult = 1 + (1 - _hpPercent) * (e.lowHpDmgBonus || 0);

      const targets = e.aoe
        ? G.enemyGroup.map((en, i) => ({ en, i })).filter(({ en }) => Battle.alive(en))
        : [{ en: enemy, i: G.targetEnemyIdx }];

      let totalDmg = 0;
      targets.forEach(({ en: tgt, i: tIdx }) => {
        const _em = Battle.elemMult(element, tgt);
        // Elemental Amps
        const _amp = (element === 'fire' ? actor.fireAmp || 1.0 : 1.0);
        const dmg = Math.floor(Battle.physDmg(_effectiveAtk, tgt.def, e.dmgMultiplier || 1, actor.lv || 1, tgt.level || 1, e.defPen || 0) * _em * _stab * _bb * _amp * _lowHpMult);
        tgt.hp = Math.max(0, tgt.hp - dmg);
        if (tgt.hp <= 0) tgt.isKO = true;
        totalDmg += dmg;

        // Cryoclasm reset logic
        if (ab.id === 'cryoclasm' && tgt.frozen > 0) {
          actor._cryoReset = true;
        }

        const _er = Battle.elemResult(element, tgt);
        if (_er === 'shatter') UI.addLog('⚡ SHATTER!', 'dmg');
        else if (_er === 'weak') UI.addLog('✦ WEAK!', 'dmg');
        else if (_er === 'resist') UI.addLog('▸ Resist', 'regen');
        else if (_er === 'immune') UI.addLog('■ IMMUNE!', 'regen');

        UI.popEnemy(tIdx, dmg, 'dmg', element);
        createEffectOverlay(tIdx, element, 'enemy', ab.id);
        const eSpr = document.getElementById('espr-' + tIdx);
        if (eSpr) { eSpr.classList.add('sprite-damage-flash'); setTimeout(() => eSpr.classList.remove('sprite-damage-flash'), 200); }
        shakeEnemy(tIdx);
        _applyVampiric(tgt, dmg, tIdx);
        UI.addLog(`${actor.displayName} strikes ${tgt.name} for ${dmg}!`, 'dmg');
      });

      if (_stab > 1) UI.addLog('◈ STAB!', 'magic');
      if (_bb > 1)   UI.addLog('🔥 Blood Blossom!', 'magic');
      if (_scaleStat > 0) UI.addLog(`💠 Scales +${_scaleStat} ATK from ${e.statScale.toUpperCase()}!`, 'magic');

      // Set cooldown
      if (e.cooldown) {
        actor.cooldowns[ab.id] = e.cooldown + 1; // +1 because decrement happens immediately/next turn
      }
      if (actor._cryoReset) {
        actor.cooldowns[ab.id] = 0;
        UI.addLog('❄ Cryoclasm Reset! Strike again!', 'regen');
        delete actor._cryoReset;
      }

      // Handle LifeSteal
      if (e.lifeSteal && totalDmg > 0) {
        let lMult = e.lifeSteal;
        // Low HP Bonus Healing (Hu Tao ultimate)
        if (e.healLowMult && actor.hp / actor.maxHp < 0.5) lMult *= e.healLowMult;
        
        const healAmt = Math.floor(totalDmg * lMult);
        if (e.aoe) {
          G.party.forEach((m, idx) => {
            if (!Battle.alive(m)) return;
            m.hp = Math.min(m.maxHp, m.hp + healAmt);
            UI.popParty(idx, healAmt, 'heal', 'light');
          });
          UI.addLog(`💖 ${ab.name}: Party restored ${healAmt} HP!`, 'heal');
        } else {
          actor.hp = Math.min(actor.maxHp, actor.hp + healAmt);
          UI.popParty(G.activeMemberIdx, healAmt, 'heal', 'light');
          UI.addLog(`💖 ${ab.name}: ${actor.displayName} restored ${healAmt} HP!`, 'heal');
        }
      }

      // Handle Secondary Buffs on self
      if (e.spdBuff) {
        actor.spd += e.spdBuff;
        UI.addLog(`${actor.displayName}'s SPD raised!`, 'heal');
      }

      _checkDragonLeap(actor);
      UI.renderEnemyRow(); UI.renderPartyStatus();
      setTimeout(advanceTurn, targets.length > 1 ? 1000 : 600);
      return;

    } else if (ab.type === 'magic_damage') {
      if (typeof SFX !== 'undefined') SFX.magic();
      const _stab = actor.passive?.id === 'eidolon_bond' ? 1.25 : (element === actor.cls?.element || (element === 'wind' && actor.cls?.element === 'anemo') || (element === 'anemo' && actor.cls?.element === 'wind')) ? 1.25 : 1.0;
      const passiveBonus = actor.passive?.id === 'arcane_surge' ? 1.15
                         : actor.passive?.id === 'eidolon_bond'  ? 1.2 : 1.0;

      const _scaleCoeff = (e.statScale === 'hp' || e.statScale === 'maxHp') ? 0.1 : 0.5;
      const _scaleStat = e.statScale ? Math.floor((actor[e.statScale] || 0) * _scaleCoeff) : 0;
      const _effectiveMag = actor.mag + _scaleStat;

      const _hpPercent = actor.hp / actor.maxHp;
      const _lowHpMult = 1 + (1 - _hpPercent) * (e.lowHpDmgBonus || 0);

      if (isUltimate) {
        const _em = Battle.elemMult(element, enemy);
        const _er = Battle.elemResult(element, enemy);
        const _summonBonus = (ab.id.startsWith('summon_') || ab.id.startsWith('absolute_')) ? (actor.summonBoost || 1.0) : 1.0;
        
        createEffectOverlay(G.targetEnemyIdx, element, 'enemy', ab.id);
        UI.addLog(`${actor.displayName} ${ultimateChannels[ab.id]}`, 'magic');
        setTimeout(() => {
          if (_summonBonus > 1.0) UI.addLog('✦ Eidolon Power Boost!', 'magic');
          const dmg = Math.floor(Battle.magicDmg(_effectiveMag, e.dmgMultiplier || 1.5, passiveBonus, actor.lv || 1) * _em * _stab * _summonBonus);
          if (e.guardian) {
            G.party.forEach(m => { if (Battle.alive(m)) m.guardianTurns = 2; });
            UI.addLog('🛡️ Phantom Guardian summoned!', 'heal');
          }
          if (_scaleStat > 0) UI.addLog(`💠 Karmic scales +${_scaleStat} from ${e.statScale.toUpperCase()}!`, 'magic');
          enemy.hp  = Math.max(0, enemy.hp - dmg);
          if (enemy.hp <= 0) enemy.isKO = true;
          if (_er === 'shatter') UI.addLog('⚡ SHATTER!', 'magic');
          else if (_er === 'weak')   UI.addLog('✦ WEAK!', 'magic');
          else if (_er === 'resist') UI.addLog('▸ Resist', 'regen');
          else if (_er === 'immune') UI.addLog('■ IMMUNE — no effect!', 'regen');
          if (_stab > 1) UI.addLog('◈ STAB!', 'magic');
          UI.popEnemy(G.targetEnemyIdx, dmg, 'magic', element);
          const eSpr = document.getElementById('espr-' + G.targetEnemyIdx);
          if (eSpr) { eSpr.classList.add('sprite-damage-flash'); setTimeout(() => eSpr.classList.remove('sprite-damage-flash'), 200); }
          shakeEnemy(G.targetEnemyIdx);
          _applyVampiric(enemy, dmg, G.targetEnemyIdx);
          UI.addLog(`${enemy.name} took ${dmg} magic damage!`, 'magic');
          UI.renderEnemyRow(); UI.renderPartyStatus();
          setTimeout(advanceTurn, 750);
        }, 3000);
      } else {
        // Normal magic damage — supports AoE
        const _magTargets = e.aoe
          ? G.enemyGroup.map((en, i) => ({ en, i })).filter(({ en }) => Battle.alive(en))
          : [{ en: enemy, i: G.targetEnemyIdx }];
        let totalDmg = 0;
        _magTargets.forEach(({ en: tgt, i: tIdx }) => {
          const _em = Battle.elemMult(element, tgt);
          // Amps
          const _amp = (element === 'fire' ? actor.fireAmp || 1.0 : 1.0);
          const _summonBonus = (ab.id.startsWith('summon_') || ab.id.startsWith('absolute_')) ? (actor.summonBoost || 1.0) : 1.0;
          if (_summonBonus > 1.0) UI.addLog('✦ Eidolon Power Boost!', 'magic');

          const dmg = Math.floor(Battle.magicDmg(_effectiveMag, e.dmgMultiplier || 1.5, passiveBonus, actor.lv || 1, tgt.mag, tgt.lv || 1) * _em * _stab * _amp * _lowHpMult * _summonBonus);
          tgt.hp = Math.max(0, tgt.hp - dmg);
          if (tgt.hp <= 0) tgt.isKO = true;
          totalDmg += dmg;

          const _er = Battle.elemResult(element, tgt);
          if (_er === 'shatter') UI.addLog('⚡ SHATTER!', 'magic');
          else if (_er === 'weak')   UI.addLog('✦ WEAK!', 'magic');
          else if (_er === 'resist') UI.addLog('▸ Resist', 'regen');
          else if (_er === 'immune') UI.addLog('■ IMMUNE — no effect!', 'regen');
          UI.popEnemy(tIdx, dmg, 'magic', element);
          createEffectOverlay(tIdx, element, 'enemy', ab.id);
          const eSpr = document.getElementById('espr-' + tIdx);
          if (eSpr) { eSpr.classList.add('sprite-damage-flash'); setTimeout(() => eSpr.classList.remove('sprite-damage-flash'), 200); }
          shakeEnemy(tIdx);
          _applyVampiric(tgt, dmg, tIdx);
          UI.addLog(`${tgt.name} took ${dmg} magic damage!`, 'magic');
        });

        // LifeSteal for Magic (Lulu's Water Wheel)
        if (e.lifeSteal && totalDmg > 0) {
          const healAmt = Math.floor(totalDmg * e.lifeSteal);
          G.party.forEach((m, idx) => {
            if (!Battle.alive(m)) return;
            m.hp = Math.min(m.maxHp, m.hp + healAmt);
            UI.popParty(idx, healAmt, 'heal', 'light');
          });
          UI.addLog(`💖 ${ab.name}: Party restored ${healAmt} HP from spell!`, 'heal');
        }

        if (_stab > 1) UI.addLog('◈ STAB!', 'magic');
        _checkDragonLeap(actor);
      }

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

      const targets = (e.aoe || ab.isUltimate) ? G.party.filter(m => (Battle.alive(m) || ab.isUltimate)) : [G.party[G.activeMemberIdx]];
      targets.forEach(m => {
        // Revival logic for Ultimate heals (Hajra's Hymn)
        if (ab.isUltimate && m.isKO) {
          m.isKO = false;
          m.hp = 1; // Start at 1 for the addition process below
        }
        const amt = getHealAmt(m);
        m.hp = Math.min(m.maxHp, m.hp + amt);
        if (e.cleanse) {
          m.frozen = 0; m.stunned = false; m.debuff = null;
        }
        const pIdx = G.party.indexOf(m);
        UI.popParty(pIdx, amt, 'heal', 'light');
        
        if (e.cleanse) {
          m.debuff = null;
          m.stunned = false;
          m.frozen = 0;
          UI.addLog(`✨ ${m.displayName} Cleansed!`, 'heal');
        }
      });
      createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
      
      if (e.healBoost) {
        actor.healBoost = e.healBoost;
        actor.healBoostTurns = e.duration || 3;
        UI.addLog(`🌿 ${actor.displayName}: Healing Power +${Math.round((e.healBoost-1)*100)}%!`, 'heal');
      }
      if (e.spdBuff) {
        actor.spd = Math.floor(actor.spd * e.spdBuff);
        actor._spdBuffVal = e.spdBuff;
        UI.addLog(`💨 ${actor.displayName}: SPD +${Math.round((e.spdBuff-1)*100)}%!`, 'heal');
      }

      UI.renderPartyStatus();
      setTimeout(advanceTurn, 800);
      return;

    } else if (ab.type === 'regen') {
      actor.regenTurns = e.duration || 3;
      createEffectOverlay(G.activeMemberIdx, element, 'party', ab.id);
      UI.addLog(`${actor.displayName}: Regen (${e.hpRegen || 8} HP/turn) for ${actor.regenTurns} turns!`, 'regen');

    } else if (ab.type === 'buff') {
      const _fmt = v => (v > 1) ? `+${Math.round((v-1)*100)}%` : `${Math.round((v-1)*100)}%`;
      const applyBuff = (m, idx) => {
        // Ultimate heals/buffs (like Hajra's Hymn) can target everyone
        if (!Battle.alive(m) && !ab.isUltimate) return;
        
        // Revive logic for Ultimates
        if (ab.isUltimate && m.isKO) { m.isKO = false; m.hp = 1; }

        // Primary stat buff
        if (e.stat) {
          if (m.buff) m[m.buff.stat] = m.buff.origVal;
          m.buff = { stat: e.stat, origVal: m[e.stat], turns: e.duration || 2 };
          const mult = e.multiplier || 1.3;
          m[e.stat] = Math.floor(m[e.stat] * mult);
        }
        
        if (e.atkBuff) { m.atk = Math.floor(m.atk * e.atkBuff); m._atkBuffVal = e.atkBuff; }
        if (e.defBuff) { m.def = Math.floor(m.def * e.defBuff); m._defBuffVal = e.defBuff; }
        if (e.magBuff) { m.mag = Math.floor(m.mag * e.magBuff); m._magBuffVal = e.magBuff; }
        
        if (e.damageReduction) { m.dmgReduction = (1 - e.damageReduction); }
        if (e.hpRegen) { m.hpRegenAmt = e.hpRegen; m.regenTurns = e.duration || 3; }
        if (e.guardMark) { m.guardMark = true; m.guardMarkTurns = e.duration || 3; }
        if (e.summonBoost) { m.summonBoost = e.summonBoost; }

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
      if (!enemy.debuff && e.stat) {
        enemy.debuff = { stat: e.stat, origVal: enemy[e.stat], turns: e.duration || 2 };
        enemy[e.stat] = Math.floor(enemy[e.stat] * (e.multiplier || 0.7));
        UI.addLog(`${enemy.name}'s ${e.stat.toUpperCase()} lowered!`, 'magic');
      } else if (e.stat) {
        UI.addLog(`${enemy.name} is already debuffed!`, '');
      }
      // Freeze secondary effect (e.g. Permafrost)
      if (e.freezeChance && !enemy.frozen && Math.random() < e.freezeChance) {
        enemy.frozen = 2;
        UI.addLog(`❄ ${enemy.name} is Frozen for 2 turns!`, 'magic');
      }

    } else if (ab.type === 'stun') {
      enemy.stunned = Math.random() < (e.stunChance || 0.5);
      UI.addLog(enemy.stunned ? `${enemy.name} is stunned!` : 'Had no effect!', enemy.stunned ? 'magic' : '');

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
  const dmg = Math.floor(Battle.physDmg(actor.atk, tgt.def, 1.6, actor.lv || 1, tgt.level || 1) * Battle.elemMult('wind', tgt));
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
  if (enemy.stunned || enemy.frozen > 0) {
    const isFrozen = enemy.frozen > 0;
    if (isFrozen) enemy.frozen--;
    else enemy.stunned = false;
    
    UI.setLog([`${enemy.name} is ${isFrozen?'Frozen':'Stunned'} — skips turn!`], ['magic']);
    setTimeout(advanceTurn, 700);
    return;
  }
  if (enemy.frozen > 0) {
    enemy.frozen--;
    UI.setLog([`❄ ${enemy.name} is frozen — skips turn!`], ['magic']);
    setTimeout(advanceTurn, 700);
    return;
  }

  // Tick enemy debuff
  if (enemy.debuff) {
    enemy.debuff.turns--;
    if (enemy.debuff.turns <= 0) { enemy[enemy.debuff.stat] = enemy.debuff.origVal; enemy.debuff = null; }
  }

  const alive = G.party.filter(m => Battle.alive(m));
  if (!alive.length) { advanceTurn(); return; }

  // Taunt Check: If anyone has guardMark, they are the mandatory target
  const taunterIdx = G.party.findIndex(m => Battle.alive(m) && m.guardMark);
  let target;
  if (taunterIdx !== -1) {
    target = G.party[taunterIdx];
    UI.addLog(`🛡️ Enemies focused on ${target.displayName}'s Guard Mark!`, 'regen');
  } else {
    // Pick target — bias toward lower HP ratio
    alive.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
    target = Math.random() < 0.6 ? alive[0] : alive[Math.floor(Math.random() * alive.length)];
  }
  const targetIdx = G.party.indexOf(target);

  const ab = Battle.pickAbility(enemy.abilityDefs);
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
      if (target.evasion && Math.random() < target.evasion) {
        UI.addLog(`💨 ${target.displayName} dodged the attack!`, 'hi');
        UI.popParty(targetIdx, 0, 'miss');
        return;
      }

      const _pm  = Battle.playerElemMult(element, target);
      let dmg    = Math.floor(Battle.physDmg(enemy.atk, target.def, ab?.dmgMultiplier || 1, enemy.level || 1, target.lv || 1) * _pm);
      
      // Absorption Check
      if (target.absorbElement && target.absorbElement === element) {
        target.hp = Math.min(target.maxHp, target.hp + dmg);
        UI.popParty(targetIdx, dmg, 'heal');
        UI.addLog(`⭐ ${target.displayName} ABSORBED the attack!`, 'heal');
        createEffectOverlay(targetIdx, element, 'party');
        UI.renderPartyStatus();
        setTimeout(advanceTurn, 700);
        return;
      }

      // Apply passive & buff damage reductions
      if (target.passive?.id === 'yakshas_valor')    dmg = Math.floor(dmg * 0.9);
      if (target.passive?.id === 'divine_authority') dmg = Math.floor(dmg * 0.85);
      if (target.passive?.id === 'divine_blessing')  dmg = Math.floor(dmg * 0.88);
      if (target.dmgReduction) dmg = Math.floor(dmg * target.dmgReduction);
      if (target.guardianTurns > 0) {
        dmg = Math.floor(dmg * 0.7);
        UI.addLog(`(Guardian Mitigated -30%)`, 'hi');
      }

      dmg = _applyEliteResist(dmg, target); // Tarnished Wing elite resist
      target.hp  = Math.max(0, target.hp - dmg);
      UI.popParty(targetIdx, dmg, 'dmg', element);
      createEffectOverlay(targetIdx, element, 'party');
      const pspr = document.getElementById('pspr-' + targetIdx);
      if (pspr) { pspr.classList.add('anim-shake'); setTimeout(() => pspr.classList.remove('anim-shake'), 380); }
      const _pr = Battle.playerElemResult(element, target);
      UI.setLog([`${enemy.name} attacks ${target.displayName}!`, `${target.displayName} took ${dmg} damage!`], ['','dmg']);
      if (_pr === 'weak')   UI.addLog('✦ WEAK!', 'dmg');
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
      let dmg   = Math.floor(Battle.magicDmg(enemy.mag, ab.dmgMultiplier || 1.3, 1.0, enemy.level || 1, target.mag || 0, target.lv || 1) * _pm);
      
      // Absorption Check
      if (target.absorbElement && target.absorbElement === element) {
        target.hp = Math.min(target.maxHp, target.hp + dmg);
        UI.popParty(targetIdx, dmg, 'heal');
        UI.addLog(`⭐ ${target.displayName} ABSORBED the spell!`, 'heal');
        createEffectOverlay(targetIdx, element, 'party');
        UI.renderPartyStatus();
        setTimeout(advanceTurn, 700);
        return;
      }

      if (target.passive?.id === 'yakshas_valor')    dmg = Math.floor(dmg * 0.9);
      if (target.passive?.id === 'divine_authority') dmg = Math.floor(dmg * 0.85);
      if (target.passive?.id === 'divine_blessing')  dmg = Math.floor(dmg * 0.88);
      if (target.dmgReduction) dmg = Math.floor(dmg * target.dmgReduction);
      if (target.guardianTurns > 0) {
        dmg = Math.floor(dmg * 0.7);
        UI.addLog(`(Guardian Mitigated -30%)`, 'hi');
      }

      dmg = _applyEliteResist(dmg, target); // Tarnished Wing elite resist
      target.hp = Math.max(0, target.hp - dmg);
      UI.popParty(targetIdx, dmg, 'magic', element);
      createEffectOverlay(targetIdx, element, 'party');
      const _pr = Battle.playerElemResult(element, target);
      UI.setLog([`${enemy.name} uses ${ab.name}!`, `${target.displayName} took ${dmg} magic damage!`], ['magic','dmg']);
      if (_pr === 'weak')   UI.addLog('✦ WEAK!', 'dmg');
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

    // Regen ticks for all party members after each enemy action
    const _hasDivBless = G.party.some(p => Battle.alive(p) && p.passive?.id === 'divine_blessing');
    G.party.forEach((m, i) => {
      if (!Battle.alive(m)) return;
      // Passive MP regen: 3 MP per turn (mpRegen relic gives bonus)
      const mpRegenAmt = 3 + Math.floor((m._mpRegenBonus || 0) * m.maxMp);
      m.mp = Math.min(m.maxMp, m.mp + mpRegenAmt);
      if (m.passive?.id === 'natures_grace' && m.hp < m.maxHp) {
        m.hp = Math.min(m.maxHp, m.hp + 5); UI.popParty(i, 5, 'regen');
      }
      if (m.regenTurns > 0) {
        m.regenTurns--; 
        const _amt = m.hpRegenAmt || 8;
        m.hp = Math.min(m.maxHp, m.hp + _amt); 
        UI.popParty(i, _amt, 'regen');
      }
      
      // Cooldown & Status decrement
      if (m.frozen > 0) m.frozen--;
      if (m.healBoostTurns > 0) {
        m.healBoostTurns--;
        if (m.healBoostTurns <= 0) m.healBoost = null;
      }
      if (m.guardMarkTurns > 0) {
        m.guardMarkTurns--;
        if (m.guardMarkTurns <= 0) m.guardMark = null;
      }
      if (m.guardianTurns > 0) m.guardianTurns--;

      if (m.cooldowns) {
        for (let cid in m.cooldowns) {
          if (m.cooldowns[cid] > 0) m.cooldowns[cid]--;
        }
      }

      // Divine Blessing: knight king's aura grants all allies 15% max HP regen per turn
      if (_hasDivBless && m.hp < m.maxHp) {
        const _dbAmt = Math.max(1, Math.floor(m.maxHp * 0.15));
        m.hp = Math.min(m.maxHp, m.hp + _dbAmt);
        UI.popParty(i, _dbAmt, 'heal', 'light');
      }
      if (m.buff) { 
        m.buff.turns--; 
        if (m.buff.turns <= 0) { 
          m[m.buff.stat] = m.buff.origVal; 
          m.buff = null; 
          
          // Multi-stat cleanup
          if (m._atkBuffVal) { m.atk = Math.ceil(m.atk / m._atkBuffVal); delete m._atkBuffVal; }
          if (m._defBuffVal) { m.def = Math.ceil(m.def / m._defBuffVal); delete m._defBuffVal; }
          if (m._spdBuffVal) { m.spd = Math.ceil(m.spd / m._spdBuffVal); delete m._spdBuffVal; }
          if (m._magBuffVal) { m.mag = Math.ceil(m.mag / m._magBuffVal); delete m._magBuffVal; }

          // Reset special buff flags: Hu Tao cleanup
          m.dmgReduction = null;
          m.evasion = null;
          m.hpRegenAmt = null;
          m.reflect = null;
          m.fireAmp = null;
          m.absorbElement = null;
        } 
      }
    });

    // ── Mutant trait ticks after enemy action ─────────────────
    G.enemyGroup.forEach((e, i) => {
      if (!Battle.alive(e) || !e.mutantTraits) return;
      const traits = e.mutantTraits;

      // Regenerating: recover 5% max HP per turn end
      if (traits.some(t => t.id === 'regenerating')) {
        const healAmt = Math.max(1, Math.floor(e.maxHp * 0.05));
        e.hp = Math.min(e.maxHp, e.hp + healAmt);
        UI.popEnemy(i, healAmt, 'regen');
      }

      // Enraged: ATK grows +5% per turn, no cap — hard DPS timer
      if (traits.some(t => t.id === 'enraged')) {
        e._enragedTurns = (e._enragedTurns || 0) + 1;
        const gain = Math.max(1, Math.floor(e.atk * 0.05));
        e.atk += gain;
        if (e._enragedTurns === 1) UI.addLog(`⚡ ${e.name} is Enraged! ATK rising each turn!`, 'dmg');
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
