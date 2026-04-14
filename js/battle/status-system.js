/**
 * StatusSystem Module
 * Handles application, ticking, and interaction of combat status effects.
 */
const StatusSystem = {
  
  /**
   * Status Definitions Table
   * Centralizes configuration for all combat status effects.
   */
  DEFS: {
    // Buffs
    regen: { id: 'status_regen', label: 'Regen', icon: '🌿', type: 'regen', color: 'var(--hp-hi)' },
    heal_boost: { id: 'status_heal_boost', label: 'Mend', icon: '💖', type: 'mult', stat: 'healBoost', value: 1.5, color: '#ff66aa' },
    guardian: { id: 'status_guardian', label: 'Guardian', icon: '🛡️', type: 'reduction', value: 0.5, color: 'var(--amber)' },
    atk_boost: { id: 'status_atk_boost', label: 'Empower', icon: '⚔️', stat: 'atk', type: 'mult', value: 1.3, color: 'var(--gold)' },
    def_boost: { id: 'status_def_boost', label: 'Fortify', icon: '🛡️', stat: 'def', type: 'mult', value: 1.3, color: 'var(--blue)' },
    
    // Control / Debuffs
    stunned: { id: 'status_stunned', label: 'Stunned', icon: '💫', type: 'control', turns: 1, color: '#ffcc00' },
    frozen: { id: 'status_frozen', label: 'Frozen', icon: '❄️', type: 'control', turns: 2, color: '#00ccff' },
    burn: { id: 'status_burn', label: 'Burn', icon: '🔥', type: 'dot', color: '#ff4400' },
    def_shatter: { id: 'status_def_shatter', label: 'Shattered', icon: '❄️', stat: 'def', type: 'mult', value: 0.7, color: '#00ccff' },
    
    // Auras
    aura_fire: { id: 'aura_fire', label: 'Fire Aura', icon: '🔥', type: 'aura', color: '#ff4400' },
    aura_ice: { id: 'aura_ice', label: 'Ice Aura', icon: '❄️', type: 'aura', color: '#00ccff' },
    aura_water: { id: 'aura_water', label: 'Water Aura', icon: '💧', type: 'aura', color: '#0066ff' },
    aura_nature: { id: 'aura_nature', label: 'Nature Aura', icon: '🌿', type: 'aura', color: '#22cc44' },
    aura_lightning: { id: 'aura_lightning', label: 'Spark Aura', icon: '⚡', type: 'aura', color: '#ffcc00' }
  },

  /**
   * Adds a status to an actor, handling duration refreshing and strength stacking.
   */
  add(unit, config) {
    if (!unit.statuses) unit.statuses = [];
    
    // Support either a key from DEFS or a full config object
    const def = typeof config === 'string' ? this.DEFS[config] : config;
    if (!def) return;

    const existing = unit.statuses.find(s => s.id === def.id);
    if (existing) {
      existing.turns = Math.max(existing.turns ?? 0, def.turns ?? 3);
      if (def.type === 'mult') {
        existing.value = Math.max(existing.value, def.value ?? 1.0);
      }
      return;
    }

    unit.statuses.push({
      id: def.id,
      label: def.label || def.id,
      icon: def.icon || '✨',
      stat: def.stat,
      type: def.type || 'mult',
      value: def.value !== undefined ? def.value : 1.0,
      turns: def.turns ?? 3,
      color: def.color || 'var(--amber)'
    });
  },

  has(unit, effectId) {
    return unit.statuses?.some(s => s.id === effectId);
  },

  remove(unit, effectId) {
    if (!unit.statuses) return;
    unit.statuses = unit.statuses.filter(s => s.id !== effectId);
  },

  /**
   * Turn-start maintenance: Tick durations, apply DOT/Regen, manage MP regen.
   */
  tick(unit, isEnemy = false) {
    if (!unit || (typeof Battle !== 'undefined' && !Battle.alive(unit))) return;

    // 1. MP Regen & Passives (Player only)
    if (!isEnemy) {
      const mpRegenAmt = 3 + Math.floor((unit._mpRegenBonus || 0) * unit.maxMp);
      unit.mp = Math.min(unit.maxMp, unit.mp + mpRegenAmt);
      
      if (unit.passive?.id === 'natures_grace' && unit.hp < unit.maxHp) {
        unit.hp = Math.min(unit.maxHp, unit.hp + 5);
        if (window.LogDebug) window.LogDebug(`[Passive] ${unit.displayName}: Nature's Grace (+5 HP)`, 'passive');
      }

      // Divine Blessing (Aura-based passive)
      const _hasDivBless = G.party.some(p => Battle.alive(p) && p.passive?.id === 'divine_blessing');
      if (_hasDivBless && unit.hp < unit.maxHp) {
        const _dbAmt = Math.max(1, Math.floor(unit.maxHp * 0.15));
        unit.hp = Math.min(unit.maxHp, unit.hp + _dbAmt);
        if (window.LogDebug) window.LogDebug(`[Passive] ${unit.displayName}: Divine Blessing aura (+${_dbAmt} HP)`, 'passive');
      }
    }

    // 2. Cooldowns
    if (unit.cooldowns) {
      for (const id in unit.cooldowns) {
        if (unit.cooldowns[id] > 0) unit.cooldowns[id]--;
      }
    }

    // 3. Status Effects Ticking
    if (!unit.statuses || unit.statuses.length === 0) return;

    unit.statuses.forEach(s => {
      // Apply periodic effects
      if (s.type === 'regen' || s.id === 'status_regen') {
        const amt = Math.floor(unit.maxHp * 0.08); // 8% Max HP
        unit.hp = Math.min(unit.maxHp, unit.hp + amt);
        if (typeof BattleUI !== 'undefined') BattleUI.popParty(G.party.indexOf(unit), amt, 'regen');
      }
      
      if (s.type === 'dot' || s.id === 'status_burn') {
        const amt = s.value || 10;
        unit.hp = Math.max(0, unit.hp - amt);
        if (unit.hp <= 0) unit.isKO = true;
        
        const idx = isEnemy ? G.enemyGroup.indexOf(unit) : G.party.indexOf(unit);
        if (typeof BattleUI !== 'undefined') {
          if (isEnemy) BattleUI.popEnemy(idx, amt, 'dmg', 'fire');
          else BattleUI.popParty(idx, amt, 'dmg', 'fire');
        }
      }

      // Decrement duration (except for permanent or aura effects that might have special rules)
      if (typeof s.turns === 'number') {
        s.turns--;
      }
    });

    // Clean up expired statuses
    unit.statuses = unit.statuses.filter(s => s.turns === undefined || s.turns > 0);
  },

  /**
   * Apply Elemental Aura logic (Prime the target)
   */
  applyAura(target, element) {
    if (!element || ['physical', 'holy', 'shadow'].includes(element)) return;

    const auraKey = `aura_${element}`;
    const config = this.DEFS[auraKey];
    if (!config) return;

    // Auras last 2 turns generally
    const mult = typeof Battle !== 'undefined' ? Battle.elemMult(element, target) : 1.0;
    const duration = mult < 1.0 ? 1 : 2;

    // Remove any existing aura (One Aura Rule)
    target.statuses = (target.statuses || []).filter(s => !s.id.startsWith('aura_'));

    this.add(target, { ...config, turns: duration });
    if (window.LogDebug) window.LogDebug(`[Aura] Applied ${config.label} to ${target.displayName || target.name}`, 'buff');
  },

  /**
   * Check for Elemental Reactions
   */
  triggerReaction(target, detonator) {
    if (!target.statuses) return null;
    const aura = target.statuses.find(s => s.id.startsWith('aura_'));
    if (!aura) return null;

    const auraType = aura.id.replace('aura_', '');
    let reaction = null;

    if (auraType === 'ice') {
      if (detonator === 'physical' || detonator === 'earth') reaction = { id: 'shatter', label: 'SHATTER', color: '#00ccff', dmgMult: 1.5, debuff: 'def' };
      else if (detonator === 'fire') reaction = { id: 'melt', label: 'MELT', color: '#ffaa00', dmgMult: 2.0 };
    } else if (auraType === 'fire') {
      if (detonator === 'nature') reaction = { id: 'conflagration', label: 'CONFLAGRATION', color: '#ff4400', dmgMult: 1.25, isAOE: true };
      else if (detonator === 'water') reaction = { id: 'vaporize', label: 'VAPORIZE', color: '#55aaff', dmgMult: 2.0 };
      else if (detonator === 'ice') reaction = { id: 'melt', label: 'MELT', color: '#ffaa00', dmgMult: 1.5 };
    } else if (auraType === 'water') {
      if (detonator === 'lightning') reaction = { id: 'conductive', label: 'CONDUCTIVE', color: '#ffcc00', dmgMult: 1.3, stun: true };
    } else if (auraType === 'nature') {
      if (detonator === 'fire') reaction = { id: 'burn', label: 'BURNING', color: '#ee4400', dmgMult: 1.2, dot: true };
    }

    if (reaction) {
      this.remove(target, aura.id); // Consume aura
      
      // Scaling by elemental affinity
      const m = typeof Battle !== 'undefined' ? Battle.elemMult(detonator, target) : 1.0;
      if (m < 1.0) reaction.dmgMult = (reaction.dmgMult - 1) * 0.5 + 1;
      else if (m > 1.0) reaction.dmgMult *= 1.5;
    }

    return reaction;
  }
};
