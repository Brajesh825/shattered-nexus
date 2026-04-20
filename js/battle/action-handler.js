/**
 * action-handler.js — Shattered Nexus
 * Defines heroAbility(), heroAttack(), and enemyAct() — the core
 * combat action dispatchers for both player and AI turns.
 *
 * Ultimate Cooldown System
 * ─────────────────────────
 * Any ability with effect.cooldown > 0 (typically isUltimate abilities)
 * starts a cooldown after use. The `unit.cooldowns[ab.id]` counter is
 * decremented once per turn inside StatusSystem.tick() (status-system.js).
 * buildAbilityMenu() reads this counter to display "⏳ Xt" and disable
 * the button until the cooldown expires.
 */

/* ============================================================
   HERO ABILITY  — Player casts an ability from the menu
   ============================================================ */
function heroAbility(ab) {
  if (G.busy) return;

  const actor = G.party[G.activeMemberIdx];
  if (!actor || !Battle.alive(actor)) return;

  // ── 1. MP cost (apply passive reduction) ────────────────
  const mpCost = Math.ceil(ab.mp * PassiveSystem.val(actor, 'MP_COST_MULT', 1.0));
  if (actor.mp < mpCost) {
    BattleUI.addLog(`${actor.displayName} needs ${mpCost} MP for ${ab.name}!`, 'dmg');
    return;
  }

  // ── 2. Cooldown check ────────────────────────────────────
  const cd = (actor.cooldowns || {})[ab.id] || 0;
  if (cd > 0) {
    BattleUI.addLog(`${ab.name} is on cooldown — ${cd} turn${cd > 1 ? 's' : ''} left!`, 'dmg');
    return;
  }

  G.busy = true;
  BattleUI.btns(false);
  BattleUI.openSub(null);

  // ── 3. Deduct MP ─────────────────────────────────────────
  actor.mp = Math.max(0, actor.mp - mpCost);

  // ── 4. Set cooldown (from ability effect data or isUltimate default) ──
  const abilityCD = ab.effect?.cooldown ?? (ab.isUltimate ? 2 : 0);
  if (abilityCD > 0) {
    if (!actor.cooldowns) actor.cooldowns = {};
    actor.cooldowns[ab.id] = abilityCD;
  }

  // ── 5. Log & animate ─────────────────────────────────────
  const moveConfig = (typeof moveAnimations !== 'undefined' && moveAnimations[ab.id])
    ? moveAnimations[ab.id]
    : { actorDuration: 560, overlayDuration: 600, isUltimate: !!ab.isUltimate };

  BattleUI.updateStats();

  // Sprite animation
  const sprFrame = ab.type === 'heal' || ab.type === 'buff' ? 'magic' : 'attack';
  BattleUI.setSpriteFrame(G.activeMemberIdx, sprFrame);
  setTimeout(() => BattleUI.setSpriteFrame(G.activeMemberIdx, 'idle'), moveConfig.actorDuration + 300);

  // ── 6. Pick targets ──────────────────────────────────────
  const e = ab.effect || {};
  const element = e.element || 'physical';

  const isOffensive = ['physical', 'magic_damage', 'debuff'].includes(ab.type);
  const isHealing   = ['heal', 'regen', 'buff'].includes(ab.type);

  const offensiveTargets = (e.aoe || ab.isUltimate)
    ? G.enemyGroup.filter(m => Battle.alive(m))
    : [G.enemyGroup[G.targetEnemyIdx] || G.enemyGroup.find(m => Battle.alive(m))].filter(Boolean);

  const healTargets = (e.aoe || ab.isUltimate)
    ? G.party.filter(m => Battle.alive(m) || ab.isUltimate)
    : [G.party[G.activeMemberIdx]].filter(m => m && (Battle.alive(m) || ab.isUltimate));

  // ── 7. Ultimate: cinematic log & overlay ─────────────────
  if (ab.isUltimate || moveConfig.isUltimate) {
    BattleUI.addLog(`${actor.displayName} unleashes ${ab.name}!`, 'hi');
    const primaryTarget = isOffensive ? (G.targetEnemyIdx ?? 0) : G.activeMemberIdx;
    const targetType    = isOffensive ? 'enemy' : 'party';
    BattleUI.createEffectOverlay(primaryTarget, element, targetType, ab.id);
  } else {
    BattleUI.addLog(`${actor.displayName} uses ${ab.name}!`, 'hi');
  }

  // ── 8. Execute after animation delay ─────────────────────
  const execDelay = (ab.isUltimate || moveConfig.isUltimate) ? 3000 : 0;

  function execute() {
    _resolveAbility(actor, ab, e, element, offensiveTargets, healTargets, moveConfig);
  }

  if (execDelay > 0) {
    setTimeout(execute, execDelay);
  } else {
    execute();
  }
}

/* ============================================================
   RESOLVE ABILITY EFFECTS
   ============================================================ */
function _resolveAbility(actor, ab, e, element, offensiveTargets, healTargets, moveConfig) {
  let anyHit = false;

  switch (ab.type) {

    // ── PHYSICAL DAMAGE ──────────────────────────────────────
    case 'physical': {
      offensiveTargets.forEach((target, tIdx) => {
        if (!Battle.alive(target)) return;

        const atk = Battle.getStat(actor, 'atk');
        const def = Battle.getStat(target, 'def') * (1 - (e.defPen || 0));

        // Stat scaling bonus (e.g. SPD-scaled attacks)
        let mult = e.dmgMultiplier || 1.0;
        if (e.statScale) {
          const scaleStat = typeof e.statScale === 'string' ? e.statScale : e.statScale[0];
          mult += Battle.getStat(actor, scaleStat) / 100;
        }

        const hitRoll = Battle.rollHit(actor, target);
        if (!hitRoll) {
          BattleUI.popEnemy(G.enemyGroup.indexOf(target), 'MISS', 'miss');
          return;
        }

        const crit = Battle.rollCrit(actor);
        const baseDmg = Battle.physDmg(atk, def, mult * (crit ? 1.5 : 1), {
          source: actor.displayName, target: target.displayName
        });

        // Elemental multiplier
        const elemM = Battle.elemMult(element, target);
        const reaction = Battle.triggerReaction(target, element);
        const reactionMult = reaction ? reaction.dmgMult : 1.0;
        let dmg = Math.round(baseDmg * elemM * reactionMult);
        if (dmg < 1) dmg = 1;

        // Damage reduction (guardian buffs on target)
        const dr = target._damageReduction || 0;
        dmg = Math.round(dmg * (1 - dr));

        target.hp = Math.max(0, target.hp - dmg);
        const enemyIdx = G.enemyGroup.indexOf(target);
        BattleUI.popEnemy(enemyIdx, crit ? `${dmg}!` : dmg, 'dmg', element);
        BattleUI.shakeEnemy(enemyIdx);
        if (elemM > 1) BattleUI.popEnemy(enemyIdx, 'WEAK!', 'weak');
        if (elemM < 1) BattleUI.popEnemy(enemyIdx, 'RESIST', 'resist');
        if (reaction) {
          BattleUI.addLog(`⚡ ${reaction.label}!`, 'hi');
          BattleUI.popReaction(enemyIdx, reaction.label);
        }
        BattleUI.flash('#ffffff33', 200);

        // Apply element aura to target
        Battle.applyAura(target, element);

        // Life-steal
        if (e.lifeSteal && dmg > 0) {
          const heal = Math.max(1, Math.floor(dmg * e.lifeSteal));
          actor.hp = Math.min(actor.maxHp, actor.hp + heal);
          BattleUI.popParty(G.party.indexOf(actor), `+${heal}`, 'regen');
        }

        // HP cost on self (e.g. Paramita Papilio)
        if (e.hpCostPercent) {
          const cost = Math.floor(actor.hp * e.hpCostPercent);
          actor.hp = Math.max(1, actor.hp - cost);
        }

        // Low-HP damage bonus
        if (e.lowHpDmgBonus && actor.hp < actor.maxHp * 0.5) {
          const bonus = Math.floor(dmg * e.lowHpDmgBonus);
          target.hp = Math.max(0, target.hp - bonus);
          BattleUI.popEnemy(enemyIdx, `+${bonus}`, 'dmg');
        }

        if (target.hp <= 0) Battle.setKO(target, true);
        anyHit = true;
        _applyVampiric(target, dmg, enemyIdx);
      });
      break;
    }

    // ── MAGIC DAMAGE ─────────────────────────────────────────
    case 'magic_damage': {
      offensiveTargets.forEach(target => {
        if (!Battle.alive(target)) return;

        const mag  = Battle.getStat(actor, 'mag');
        const mdef = Battle.getStat(target, 'mag') * 0.4;

        let mult = e.dmgMultiplier || 1.0;
        if (e.statScale) {
          const scaleStat = typeof e.statScale === 'string' ? e.statScale : e.statScale[0];
          mult += Battle.getStat(actor, scaleStat) / 100;
        }

        const crit = Battle.rollCrit(actor);
        const baseDmg = Battle.magicDmg(mag, mdef, mult * (crit ? 1.5 : 1), {
          source: actor.displayName, target: target.displayName
        });

        const elemM = Battle.elemMult(element, target);
        const reaction = Battle.triggerReaction(target, element);
        const reactionMult = reaction ? reaction.dmgMult : 1.0;
        let dmg = Math.round(baseDmg * elemM * reactionMult);
        if (dmg < 1) dmg = 1;

        target.hp = Math.max(0, target.hp - dmg);
        const enemyIdx = G.enemyGroup.indexOf(target);
        BattleUI.popEnemy(enemyIdx, crit ? `${dmg}!` : dmg, 'dmg', element);
        BattleUI.shakeEnemy(enemyIdx);
        if (elemM > 1) BattleUI.popEnemy(enemyIdx, 'WEAK!', 'weak');
        if (elemM < 1) BattleUI.popEnemy(enemyIdx, 'RESIST', 'resist');
        if (reaction) {
          BattleUI.addLog(`⚡ ${reaction.label}!`, 'hi');
          BattleUI.popReaction(enemyIdx, reaction.label);
        }
        BattleUI.flash('#6644ff22', 200);
        Battle.applyAura(target, element);

        // Stun mechanics
        if (e.stunLow && target.hp < target.maxHp * 0.3) {
          Battle.addStatus(target, 'stunned');
          BattleUI.addLog(`${target.name} is stunned!`, 'hi');
        }
        if (e.guardMark) target._guardMark = true;

        // DOT from reactions
        if (reaction?.dot) {
          const dotAmt = Math.max(1, Math.floor(target.maxHp * 0.05));
          Battle.addStatus(target, { ...StatusSystem.DEFS.burn, value: dotAmt, turns: 2 });
        }

        if (target.hp <= 0) Battle.setKO(target, true);
        anyHit = true;
        _applyVampiric(target, dmg, G.enemyGroup.indexOf(target));
      });
      break;
    }

    // ── HEAL ──────────────────────────────────────────────────
    case 'heal': {
      healTargets.forEach(target => {
        if (!target) return;

        let amt = 0;
        if (e.healPercent) {
          amt = Math.floor(target.maxHp * e.healPercent);
        } else {
          amt = (e.healBase || 20) + Math.floor(Math.random() * (e.healRandom || 10));
          // Scale with MAG
          amt = Math.floor(amt * (1 + Battle.getStat(actor, 'mag') / 150));
        }

        // HealBoost buff
        const healMult = PassiveSystem.val(actor, 'HEAL_POWER', 1.0);
        amt = Math.floor(amt * healMult);

        const wasKO = target.isKO;
        if (ab.isUltimate && wasKO) {
          target.isKO = false;
          const idx = G.party.indexOf(target);
          BattleUI.setSpriteFrame(idx, 'idle');
          BattleUI.addLog(`${target.displayName} has been revived!`, 'hi');
        }

        target.hp = Math.min(target.maxHp, target.hp + amt);
        BattleUI.popParty(G.party.indexOf(target), `+${amt}`, 'regen');

        if (e.cleanse) {
          target.statuses = (target.statuses || []).filter(s =>
            s.type === 'mult' || s.type === 'regen' || s.type === 'aura'
          );
          BattleUI.addLog(`Debuffs cleansed!`, 'hi');
        }

        if (e.spdBuff) {
          Battle.addStatus(target, {
            ...StatusSystem.DEFS.atk_boost,
            id: 'status_spd_boost', label: 'Haste', stat: 'spd', value: e.spdBuff, turns: 3
          });
        }
        anyHit = true;
      });
      break;
    }

    // ── BUFF ──────────────────────────────────────────────────
    case 'buff': {
      const buffTargets = e.aoe ? G.party.filter(m => Battle.alive(m)) : [actor];

      // HP cost on self before applying buff
      if (e.hpCostPercent) {
        const cost = Math.floor(actor.hp * e.hpCostPercent);
        actor.hp = Math.max(1, actor.hp - cost);
        BattleUI.addLog(`${actor.displayName} sacrifices ${cost} HP!`, 'dmg');
      }

      buffTargets.forEach(target => {
        if (e.stat && e.multiplier) {
          Battle.addStatus(target, {
            id: `status_${e.stat}_boost`,
            label: e.stat.toUpperCase() + ' Up',
            icon: '⬆️',
            stat: e.stat,
            type: 'mult',
            value: e.multiplier,
            turns: e.duration || 3,
            color: 'var(--gold)'
          });
        }
        if (e.defBuff) {
          Battle.addStatus(target, { ...StatusSystem.DEFS.def_boost, value: e.defBuff, turns: e.duration || 3 });
        }
        if (e.atkBuff) {
          Battle.addStatus(target, { ...StatusSystem.DEFS.atk_boost, value: e.atkBuff, turns: e.duration || 3 });
        }
        if (e.hpRegen) {
          Battle.addStatus(target, { ...StatusSystem.DEFS.regen, turns: e.duration || 3 });
        }
        if (e.spdBuff) {
          Battle.addStatus(target, {
            ...StatusSystem.DEFS.atk_boost,
            id: 'status_spd_boost', label: 'Haste', stat: 'spd', value: 1.0 + (e.spdBuff / 10), turns: e.duration || 2
          });
        }
        if (e.damageReduction) {
          target._damageReduction = e.damageReduction;
        }
        if (e.fireAmp) {
          target._fireAmp = e.fireAmp;
        }
        if (e.guardian) {
          Battle.addStatus(target, { ...StatusSystem.DEFS.guardian, turns: e.duration || 2 });
        }
        BattleUI.popParty(G.party.indexOf(target), '✦ Buff', 'buff');
        anyHit = true;
      });
      break;
    }

    // ── DEBUFF ────────────────────────────────────────────────
    case 'debuff': {
      offensiveTargets.forEach(target => {
        if (!Battle.alive(target)) return;

        if (e.freezeChance && Math.random() < e.freezeChance) {
          Battle.addStatus(target, 'frozen');
          BattleUI.addLog(`${target.name} is frozen!`, 'hi');
        }
        if (e.stat && e.multiplier) {
          Battle.addStatus(target, {
            id: `status_${e.stat}_shatter`,
            label: e.stat.toUpperCase() + ' Down',
            icon: '⬇️',
            stat: e.stat,
            type: 'mult',
            value: e.multiplier,
            turns: e.duration || 2,
            color: '#ff8800'
          });
        }
        if (e.defDebuff) {
          Battle.addStatus(target, { ...StatusSystem.DEFS.def_shatter, value: e.defDebuff, turns: e.duration || 2 });
        }
        const enemyIdx = G.enemyGroup.indexOf(target);
        BattleUI.popEnemy(enemyIdx, '⬇ Debuff', 'debuff');
        anyHit = true;
      });
      break;
    }
  }

  // ── Post-execution ───────────────────────────────────────
  BattleUI.renderPartyStatus();
  BattleUI.updateStats();
  BattleUI.renderEnemyRow();

  // Refresh ability menu to reflect new cooldown state
  if (typeof buildAbilityMenu === 'function') buildAbilityMenu();

  const delay = (ab.isUltimate || moveConfig.isUltimate) ? 900 : 750;
  setTimeout(() => {
    G.busy = false;
    TurnManager.advance();
  }, delay);
}

/* ============================================================
   HERO ATTACK — Basic attack (no ability)
   ============================================================ */
function heroAttack() {
  if (G.busy) return;

  const actor = G.party[G.activeMemberIdx];
  if (!actor || !Battle.alive(actor)) return;

  const target = G.enemyGroup[G.targetEnemyIdx] || G.enemyGroup.find(e => Battle.alive(e));
  if (!target) return;

  G.busy = true;
  BattleUI.btns(false);
  BattleUI.openSub(null);

  BattleUI.setSpriteFrame(G.activeMemberIdx, 'attack');
  setTimeout(() => BattleUI.setSpriteFrame(G.activeMemberIdx, 'idle'), 700);

  const atk     = Battle.getStat(actor, 'atk');
  const def     = Battle.getStat(target, 'def');
  const hitRoll = Battle.rollHit(actor, target);
  const enemyIdx = G.enemyGroup.indexOf(target);

  if (!hitRoll) {
    BattleUI.addLog(`${actor.displayName} attacks — missed!`, '');
    BattleUI.popEnemy(enemyIdx, 'MISS', 'miss');
    setTimeout(() => { G.busy = false; TurnManager.advance(); }, 750);
    return;
  }

  const crit = Battle.rollCrit(actor);
  let dmg = Battle.physDmg(atk, def, crit ? 1.5 : 1.0, {
    source: actor.displayName, target: target.displayName
  });
  if (dmg < 1) dmg = 1;

  const dr = target._damageReduction || 0;
  dmg = Math.round(dmg * (1 - dr));

  target.hp = Math.max(0, target.hp - dmg);
  BattleUI.addLog(`${actor.displayName} attacks ${target.name} for ${dmg} damage!${crit ? ' CRIT!' : ''}`, crit ? 'hi' : '');
  BattleUI.popEnemy(enemyIdx, crit ? `${dmg}!` : dmg, 'dmg', 'physical');
  BattleUI.shakeEnemy(enemyIdx);
  BattleUI.flash('#ffffff22', 160);
  BattleUI.renderPartyStatus();
  BattleUI.renderEnemyRow();
  BattleUI.updateStats();
  _applyVampiric(target, dmg, enemyIdx);

  if (target.hp <= 0) Battle.setKO(target, true);

  setTimeout(() => { G.busy = false; TurnManager.advance(); }, 750);
}

/* ============================================================
   ENEMY ACT — AI turn dispatcher
   ============================================================ */
function enemyAct(enemy, enemyIdx) {
  if (!Battle.alive(enemy)) { TurnManager.advance(); return; }

  // Tick enemy status
  StatusSystem.tick(enemy, true);

  BattleUI.addLog(`${enemy.name} acts!`, '');

  const ab = Battle.pickAbility(enemy, G.party.find(m => Battle.alive(m)));
  if (!ab) {
    // Fallback: basic attack on first live party member
    _enemyBasicAttack(enemy, enemyIdx);
    return;
  }

  const e       = ab.effect || {};
  const element = e.element || enemy.element || 'physical';

  BattleUI.popAI(enemyIdx, ab.name || 'Attack');

  // Pick alive party targets
  const aliveParts = G.party.filter(m => Battle.alive(m));
  if (!aliveParts.length) { TurnManager.advance(); return; }

  const target = aliveParts[0]; // enemies always target front
  const tIdx   = G.party.indexOf(target);

  // Animate enemy sprite
  const spr = document.getElementById('espr-' + enemyIdx);
  if (spr) {
    spr.classList.add('anim-attack');
    setTimeout(() => spr.classList.remove('anim-attack'), 500);
  }

  setTimeout(() => {
    if (ab.type === 'heal') {
      // Enemy self-heal
      const amt = Math.floor(enemy.maxHp * (e.healPercent || 0.15));
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + amt);
      BattleUI.popEnemy(enemyIdx, `+${amt}`, 'regen');
      BattleUI.addLog(`${enemy.name} heals for ${amt}!`, 'regen');
    } else {
      // Offensive: pick random alive member
      const rndTarget = aliveParts[Math.floor(Math.random() * aliveParts.length)];
      const rndIdx    = G.party.indexOf(rndTarget);

      const atk  = Battle.getStat(enemy, 'atk');
      const mag  = Battle.getStat(enemy, 'mag');
      const def  = Battle.getStat(rndTarget, 'def');
      const mdef = Battle.getStat(rndTarget, 'mag') * 0.4;

      const isPhys = !ab.type || ab.type === 'physical';
      const mult   = e.dmgMultiplier || 1.0;
      const elemMult = Battle.playerElemMult(element, rndTarget);

      let dmg = isPhys
        ? Battle.physDmg(atk, def, mult, { source: enemy.name, target: rndTarget.displayName })
        : Battle.magicDmg(mag, mdef, mult, { source: enemy.name, target: rndTarget.displayName });

      dmg = Math.round(dmg * elemMult);
      if (dmg < 1) dmg = 1;

      // Passive: damage reduction
      const dr = rndTarget._damageReduction || 0;
      dmg = Math.round(dmg * (1 - dr));

      // Reflect trait
      if (rndTarget._reflect) {
        const reflected = Math.floor(dmg * rndTarget._reflect);
        enemy.hp = Math.max(0, enemy.hp - reflected);
        BattleUI.popEnemy(enemyIdx, reflected, 'dmg');
        BattleUI.addLog(`${rndTarget.displayName} reflects ${reflected} damage!`, 'hi');
      }

      rndTarget.hp = Math.max(0, rndTarget.hp - dmg);
      BattleUI.addLog(`${enemy.name} uses ${ab.name} on ${rndTarget.displayName} for ${dmg}!`, '');
      BattleUI.setSpriteFrame(rndIdx, 'hurt');
      setTimeout(() => BattleUI.setSpriteFrame(rndIdx, 'idle'), 400);
      BattleUI.popParty(rndIdx, dmg, 'dmg', element);
      BattleUI.flash('#ff000022', 150);

      const elemRes = Battle.playerElemResult(element, rndTarget);
      if (elemRes === 'weak')   BattleUI.popParty(rndIdx, 'WEAK!',   'weak');
      if (elemRes === 'resist') BattleUI.popParty(rndIdx, 'RESIST',  'resist');

      // Apply aura to player targets
      Battle.applyAura(rndTarget, element);

      // Status effects
      if (e.slowChance && Math.random() < e.slowChance) {
        Battle.addStatus(rndTarget, 'slow');
        BattleUI.addLog(`${rndTarget.displayName} is slowed!`, 'regen');
      }
      if (e.freezeChance && Math.random() < e.freezeChance) {
        Battle.addStatus(rndTarget, 'frozen');
        BattleUI.addLog(`${rndTarget.displayName} is frozen!`, 'regen');
      }
      if (e.burn && Math.random() < (e.burnChance || 0.4)) {
        Battle.addStatus(rndTarget, { ...StatusSystem.DEFS.burn, value: Math.max(1, Math.floor(rndTarget.maxHp * 0.04)), turns: 2 });
      }
      if (e.poison) {
        Battle.addStatus(rndTarget, 'poison');
      }

      if (rndTarget.hp <= 0) Battle.setKO(rndTarget, false);
    }

    BattleUI.renderPartyStatus();
    BattleUI.renderEnemyRow();
    BattleUI.updateStats();

    setTimeout(() => { G.busy = false; TurnManager.advance(); }, 750);
  }, 600);
}

function _enemyBasicAttack(enemy, enemyIdx) {
  const aliveParts = G.party.filter(m => Battle.alive(m));
  if (!aliveParts.length) { TurnManager.advance(); return; }

  const target = aliveParts[0];
  const tIdx   = G.party.indexOf(target);

  const atk = Battle.getStat(enemy, 'atk');
  const def = Battle.getStat(target, 'def');
  let dmg = Battle.physDmg(atk, def, 1.0, { source: enemy.name, target: target.displayName });
  if (dmg < 1) dmg = 1;

  const dr = target._damageReduction || 0;
  dmg = Math.round(dmg * (1 - dr));

  if (target._reflect) {
    const reflected = Math.floor(dmg * target._reflect);
    enemy.hp = Math.max(0, enemy.hp - reflected);
    BattleUI.popEnemy(enemyIdx, reflected, 'dmg');
  }

  target.hp = Math.max(0, target.hp - dmg);
  BattleUI.addLog(`${enemy.name} attacks ${target.displayName} for ${dmg}!`, '');
  BattleUI.setSpriteFrame(tIdx, 'hurt');
  setTimeout(() => BattleUI.setSpriteFrame(tIdx, 'idle'), 400);
  BattleUI.popParty(tIdx, dmg, 'dmg', 'physical');
  BattleUI.flash('#ff000022', 150);
  _applyVampiric(enemy, -dmg, enemyIdx); // Vampiric: enemy heals off damage
  if (target.hp <= 0) Battle.setKO(target, false);

  BattleUI.renderPartyStatus();
  BattleUI.renderEnemyRow();
  BattleUI.updateStats();

  setTimeout(() => { G.busy = false; TurnManager.advance(); }, 750);
}
