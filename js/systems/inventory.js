/* ============================================================
   INVENTORY SYSTEM
   ============================================================ */
const MAX_INVENTORY_STACKS = 20;
const MAX_STACK_QTY        = 99;

function addToInventory(itemId, qty = 1) {
  const def = G.items.find(i => i.id === itemId);
  if (!def) return false;
  const existing = G.inventory.find(s => s.itemId === itemId);
  if (existing) {
    existing.qty = Math.min(MAX_STACK_QTY, existing.qty + qty);
  } else {
    if (G.inventory.length >= MAX_INVENTORY_STACKS) return false; // bag full
    G.inventory.push({ itemId, qty: Math.min(MAX_STACK_QTY, qty) });
  }
  return true;
}

function removeFromInventory(itemId, qty = 1) {
  const idx = G.inventory.findIndex(s => s.itemId === itemId);
  if (idx < 0) return false;
  G.inventory[idx].qty -= qty;
  if (G.inventory[idx].qty <= 0) G.inventory.splice(idx, 1);
  return true;
}

// Open the item submenu in battle
function heroItem() {
  if (G.busy) return;
  BattleUI.openSub(null);
  _buildItemMenu();
}

function _buildItemMenu() {
  const menu = document.getElementById('item-sub');
  if (!menu) return;
  menu.innerHTML = '';

  const battleItems = G.inventory.filter(s => {
    const def = G.items.find(i => i.id === s.itemId);
    return def && def.usable_in.includes('battle');
  });

  if (!battleItems.length) {
    const empty = document.createElement('div');
    empty.className = 'item-empty';
    empty.textContent = 'No items available.';
    menu.appendChild(empty);
    const back = document.createElement('button');
    back.className = 'cmd-btn dim';
    back.textContent = '← BACK';
    back.onclick = () => BattleUI.openSub(null);
    menu.appendChild(back);
    BattleUI.openSub('item-sub');
    return;
  }

  battleItems.forEach(stack => {
    const def = G.items.find(i => i.id === stack.itemId);
    if (!def) return;
    const needsTarget = def.effect.target === 'single';
    const btn = document.createElement('button');
    btn.className = 'cmd-btn item-btn';
    btn.innerHTML = `<span class="item-icon">${def.icon}</span> ${def.name} <span class="item-qty">×${stack.qty}</span>`;
    btn.title = def.description;
    btn.onclick = () => {
      if (needsTarget) {
        _buildItemTargetMenu(def);
      } else {
        _useItem(def, -1);
      }
    };
    menu.appendChild(btn);
  });

  const back = document.createElement('button');
  back.className = 'cmd-btn dim';
  back.textContent = '← BACK';
  back.onclick = () => BattleUI.openSub(null);
  menu.appendChild(back);
  BattleUI.openSub('item-sub');
}

function _buildItemTargetMenu(def) {
  const menu = document.getElementById('item-sub');
  menu.innerHTML = '';

  // Filter valid targets based on item subtype
  const isRevive = def.subtype === 'revive';
  const targets  = G.party.filter((m, i) => isRevive ? m.isKO : Battle.alive(m));

  targets.forEach(m => {
    const idx = G.party.indexOf(m);
    const col = CHAR_COLOR[m.charId] || '#aaa';
    const btn = document.createElement('button');
    btn.className = 'cmd-btn';
    btn.style.borderLeftColor = col;
    btn.innerHTML = `<span style="color:${col}">${m.displayName}</span> <span class="item-qty">${m.hp}/${m.maxHp} HP</span>`;
    btn.onclick = () => _useItem(def, idx);
    menu.appendChild(btn);
  });

  const back = document.createElement('button');
  back.className = 'cmd-btn dim';
  back.textContent = '← BACK';
  back.onclick = () => _buildItemMenu();
  menu.appendChild(back);
}

function _useItem(def, targetIdx) {
  if (G.busy) return;
  G.busy = true; BattleUI.btns(false);
  BattleUI.openSub(null);

  const e = def.effect;

  // Escape item
  if (def.subtype === 'escape') {
    removeFromInventory(def.id);
    BattleUI.setLog(['The party vanishes in a cloud of smoke!'], ['hi']);
    setTimeout(() => showResult('escaped'), 900);
    return;
  }

  const targets = e.target === 'all'
    ? G.party.filter(m => def.subtype === 'revive' ? m.isKO : Battle.alive(m))
    : [G.party[targetIdx]];

  targets.forEach((m, i) => {
    const pIdx = G.party.indexOf(m);

    if (e.stat === 'hp') {
      const amt = e.percent ? Math.floor(m.maxHp * e.amount / 100) : e.amount;
      m.hp = Math.min(m.maxHp, m.hp + amt);
      BattleUI.popParty(pIdx, amt, 'heal');

    } else if (e.stat === 'mp') {
      const amt = e.percent ? Math.floor(m.maxMp * e.amount / 100) : e.amount;
      m.mp = Math.min(m.maxMp, m.mp + amt);
      BattleUI.popParty(pIdx, amt, 'regen');

    } else if (e.stat === 'both') {
      m.hp = m.maxHp; m.mp = m.maxMp;
      BattleUI.popParty(pIdx, 0, 'heal');

    } else if (e.stat === 'revive') {
      m.isKO = false;
      m.hp   = Math.max(1, Math.floor(m.maxHp * e.amount / 100));
      BattleUI.popParty(pIdx, m.hp, 'heal');

    } else if (e.stat === 'debuff') {
      m.statuses = (m.statuses || []).filter(s =>
        !s.id.includes('debuff') && s.type !== 'control' && s.type !== 'dot'
      );
      BattleUI.popParty(pIdx, 0, 'regen');

    } else if (e.stat === 'atk' || e.stat === 'def') {
      const boost = Math.floor(m[e.stat] * e.amount / 100);
      Battle.addStatus(m, {
        id: `buff_${e.stat}_item`,
        label: `${e.stat.toUpperCase()} Up`,
        icon: e.stat === 'atk' ? '⚔️' : '🛡️',
        stat: e.stat, type: 'mult',
        value: 1 + (e.amount / 100),
        turns: e.turns || 3
      });
      BattleUI.popParty(pIdx, boost, 'hi');

    } else if (e.stat === 'exp') {
      m.exp += e.amount;
      BattleUI.popParty(pIdx, e.amount, 'hi');
      // Sync back immediately for exp
      const ch = G.chars.find(c => c.id === m.charId);
      if (ch) ch.exp = m.exp;
    }
  });

  removeFromInventory(def.id);

  const tName = e.target === 'all' ? 'the party' : targets[0]?.displayName || '?';
  BattleUI.setLog([`Used ${def.icon} ${def.name} on ${tName}!`], ['hi']);
  BattleUI.renderPartyStatus();

  setTimeout(advanceTurn, 800);
}

// Award drops from a defeated enemy def
function _awardDrops(enemyDef) {
  if (!enemyDef.drops || !enemyDef.drops.length) return [];
  const awarded = [];
  enemyDef.drops.forEach(drop => {
    // chance is stored as 0–1 fraction (e.g. 0.15 = 15%)
    if (Math.random() > (drop.chance || 0.2)) return;

    // Support both {itemId:"potion"} and legacy {item:"Potion"} formats
    let itemId = drop.itemId;
    if (!itemId && drop.item) {
      // Try name-based lookup in G.items
      const match = (G.items || []).find(i =>
        i.name.toLowerCase() === drop.item.toLowerCase() ||
        i.id === drop.item.toLowerCase().replace(/[- ]/g, '_')
      );
      itemId = match?.id;
    }
    if (!itemId) return; // Trophy item not in items.json — skip silently

    addToInventory(itemId, drop.qty || 1);
    awarded.push(itemId);
  });
  return awarded;
}

// Attempt to drop a random common/uncommon relic from enemies
// elite flag raises the chance
function _tryRelicDrop(isElite) {
  const chance = isElite ? 25 : 8;
  if (Math.random() * 100 > chance) return null;
  const pool = (G.relics || []).filter(r =>
    (r.rarity === 'common' || r.rarity === 'uncommon') &&
    !G.ownedRelics.includes(r.id)
  );
  if (!pool.length) return null;
  const relic = pool[Math.floor(Math.random() * pool.length)];
  G.ownedRelics.push(relic.id);
  // Auto-equip if a slot is free
  if (G.activeRelics.length < 3) G.activeRelics.push(relic.id);
  return relic;
}

// Award a specific boss relic by ID (called after arc boss victory)
function awardBossRelic(relicId) {
  if (!relicId || G.ownedRelics.includes(relicId)) return null;
  const relic = (G.relics || []).find(r => r.id === relicId);
  if (!relic) return null;
  G.ownedRelics.push(relicId);
}

/* ============================================================
   OUT-OF-BATTLE INVENTORY UI
   ============================================================ */
const InventoryUI = (() => {
  let _selectedItemDef = null;

  function open() {
    // Close other menus if needed
    if (typeof MapUI !== 'undefined') {
      const p = document.getElementById('map-pause-menu');
      if (p) p.style.display = 'none';
      const c = document.getElementById('camp-menu');
      if (c) c.style.display = 'none';
    }
    const el = document.getElementById('inventory-overlay');
    if (el) el.style.display = 'flex';
    
    _selectedItemDef = null;
    renderList();
    renderDetail();
  }

  function close() {
    const el = document.getElementById('inventory-overlay');
    if (el) el.style.display = 'none';
    // Re-open pause or camp if we were in them...
    // Actually MapEngine pause state is enough, the player can just press menu again.
    // Let's bring them back to pause menu for better UX if it was open.
    if (typeof MapUI !== 'undefined' && typeof MapEngine !== 'undefined' && !MapEngine.isRunning()) {
      // It's safer to just reopen the camp menu if they are on the camp tile, otherwise pause
      const isCamp = MapData.getTileAt(MapEngine.getMap(), MapPlayer.tx, MapPlayer.ty) === 74;
      if (isCamp) {
        document.getElementById('camp-menu').style.display = 'flex';
      } else {
        document.getElementById('map-pause-menu').style.display = 'flex';
      }
    }
  }

  function renderList() {
    const listEl = document.getElementById('inventory-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!G.inventory || !G.inventory.length) {
      listEl.innerHTML = '<div style="padding: 20px; color: var(--text-dim);">No items in bag.</div>';
      return;
    }

    G.inventory.forEach(stack => {
      const def = G.items?.find(i => i.id === stack.itemId);
      if (!def) return;
      const isSelected = _selectedItemDef && _selectedItemDef.id === def.id;
      
      const btn = document.createElement('button');
      btn.className = 'b-list-item' + (isSelected ? ' active' : '');
      btn.innerHTML = `<span style="font-size: 1.2em; margin-right: 8px;">${def.icon}</span> ${def.name} <span style="float:right; color:var(--gold)">x${stack.qty}</span>`;
      btn.onclick = () => {
        _selectedItemDef = def;
        renderList();
        renderDetail();
      };
      listEl.appendChild(btn);
    });
  }

  function renderDetail() {
    const detEl = document.getElementById('inventory-detail');
    if (!detEl) return;

    if (!_selectedItemDef) {
      detEl.innerHTML = '<div class="bestiary-empty-hint">Select an item to view details</div>';
      return;
    }

    const def = _selectedItemDef;
    const stack = G.inventory.find(s => s.itemId === def.id);
    const qty = stack ? stack.qty : 0;
    const isUsable = def.usable_in && def.usable_in.includes('map');

    detEl.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="font-size: 48px; margin-right: 20px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">${def.icon}</div>
        <div>
          <h2 style="margin: 0; color: var(--gold); text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${def.name}</h2>
          <div style="color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; font-size: 12px; margin-top: 4px;">
            ${def.type} · Owned: ${qty}
          </div>
        </div>
      </div>
      
      <div style="line-height: 1.6; font-size: 15px; color: #e2e8f0; margin-bottom: 30px; background: rgba(0,0,0,0.2); padding: 15px; border-left: 3px solid var(--gold);">
        ${def.description}
      </div>
      
      <div id="inv-action-area">
        ${isUsable ? `<button class="cmd-btn" style="width: 100%; max-width: 250px; justify-content: center; font-size: 16px; padding: 12px;" onclick="InventoryUI.useSelectedItem()">USE ITEM</button>` : ''}
      </div>
      <div id="inv-target-area" style="display:none; margin-top: 20px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 20px;"></div>
    `;
  }

  function useSelectedItem() {
    if (!_selectedItemDef) return;
    const def = _selectedItemDef;
    
    const needsTarget = def.effect && def.effect.target === 'single';

    if (!needsTarget) {
      _applyMapItem(def, null);
    } else {
      _showTargetPicker(def);
    }
  }

  function _showTargetPicker(def) {
    document.getElementById('inv-action-area').style.display = 'none';
    const tgt = document.getElementById('inv-target-area');
    tgt.style.display = 'block';
    
    let html = `<div style="margin-bottom: 12px; color: var(--gold);">Select Target:</div><div style="display: grid; gap: 8px;">`;
    
    const CHAR_COLOR_MAP = {
      aya:'#7dd3fc', tao:'#ef4444', lulu:'#2dd4bf', rei:'#4ade80',
      rydia:'#a78bfa', lenneth:'#e879f9', kain:'#0ea5e9', leon:'#fbbf24'
    };

    G.party.forEach((m, i) => {
      if (!m) return;
      const col = CHAR_COLOR_MAP[m.charId] || '#a090d0';
      const isKO = !m.hp || m.isKO;
      
      const isReviveItem = def.effect && def.effect.stat === 'revive';
      if (isReviveItem && !isKO) return;
      if (!isReviveItem && isKO) return;

      html += `<button class="cmd-btn" style="border-left-color: ${col}; justify-content: space-between;" onclick="InventoryUI.applyToTarget(${i})">
        <span style="color:${col}">${m.displayName}</span>
        <span style="color:var(--text-dim)">${m.hp}/${m.maxHp} HP</span>
      </button>`;
    });

    html += `<button class="cmd-btn dim" style="justify-content: center; margin-top: 8px;" onclick="InventoryUI.cancelTarget()">Cancel</button></div>`;
    tgt.innerHTML = html;
  }

  function cancelTarget() {
    document.getElementById('inv-action-area').style.display = 'block';
    document.getElementById('inv-target-area').style.display = 'none';
  }

  function applyToTarget(memberIdx) {
    _applyMapItem(_selectedItemDef, memberIdx);
  }

  function _applyMapItem(def, memberIdx) {
    const e = def.effect;
    if (!e) return;
    
    const targets = memberIdx !== null
      ? [G.party[memberIdx]]
      : G.party.filter(m => m && !m.isKO && m.hp > 0);

    let used = false;
    let leveledNames = [];

    targets.forEach(m => {
      if (!m) return;
      if (e.stat === 'hp' && e.amount) {
        if (m.isKO || m.hp <= 0) return; // skip KO'd
        const heal = e.percent ? Math.floor(m.maxHp * e.amount / 100) : e.amount;
        m.hp = Math.min(m.maxHp, m.hp + heal);
        used = true;
      } else if (e.stat === 'mp' && e.amount) {
        if (m.isKO) return;
        const restore = e.percent ? Math.floor(m.maxMp * e.amount / 100) : e.amount;
        m.mp = Math.min(m.maxMp, m.mp + restore);
        used = true;
      } else if (e.stat === 'both' && e.amount) {
        if (m.isKO) return;
        m.hp = m.maxHp;
        m.mp = m.maxMp;
        used = true;
      } else if (e.stat === 'revive') {
        if (!m.isKO && m.hp > 0) return;
        m.isKO = false;
        m.hp = e.amount ? Math.min(m.maxHp, e.percent ? Math.floor(m.maxHp * e.amount / 100) : e.amount) : 1;
        if (m.char) m.char.isKO = false;
        used = true;
      } else if (e.stat === 'debuff') {
        if (m.statuses) {
          m.statuses = m.statuses.filter(s => !s.id.includes('debuff') && s.type !== 'control' && s.type !== 'dot');
        }
        used = true;
      } else if (e.stat === 'exp') {
        if (m.isKO) return;
        m.exp += e.amount;
        used = true;
        // Level up check
        if (typeof checkMemberLevel === 'function') {
          while (checkMemberLevel(m)) {
            if (!leveledNames.includes(m.displayName)) leveledNames.push(m.displayName);
          }
        }
      }
    });

    if (!used) return;

    // Consume item
    removeFromInventory(def.id);

    // Sync char HP/MP/EXP
    G.party.forEach(m => {
      if (m && m.char) {
        m.char.hp = m.hp;
        m.char.mp = m.mp;
        m.char.isKO = m.isKO;
        m.char.exp = m.exp;
        m.char.lv = m.lv;
      }
    });

    if (typeof MapUI !== 'undefined') {
      if (leveledNames.length > 0) {
        MapUI.showMsg(`★ ${leveledNames.join(', ')} Leveled Up!`, 2000);
        if (typeof SFX !== 'undefined') SFX.levelUp();
      } else {
        MapUI.showMsg(`Used ${def.icon} ${def.name}!`, 1400);
      }
    }

    // Refresh UI
    const stack = G.inventory.find(s => s.itemId === def.id);
    if (!stack) {
      _selectedItemDef = null;
    }
    renderList();
    renderDetail();
  }

  return {
    open,
    close,
    renderList,
    useSelectedItem,
    applyToTarget,
    cancelTarget
  };
})();
