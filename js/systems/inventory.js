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
  if (G.activeRelics.length < 3) G.activeRelics.push(relicId);
  return relic;
}
