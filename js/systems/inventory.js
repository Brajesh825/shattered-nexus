/* ============================================================
   INVENTORY SYSTEM
   ============================================================ */
const MAX_INVENTORY_STACKS = 30;
const MAX_STACK_QTY        = 99;

/**
 * Unified logic to apply item effects to a target (or all).
 * Returns a result object { success: boolean, msg: string, leveledUp: string[] }
 */
const ItemSystem = {
  apply(def, targetIdx) {
    const e = def.effect;
    if (!e) return { success: false, msg: "Item has no effect." };

    const targets = e.target === 'all'
      ? G.party.filter(m => def.subtype === 'revive' ? m.isKO : !m.isKO)
      : [G.party[targetIdx]];

    if (!targets.length || targets.every(t => !t)) {
      return { success: false, msg: "No valid targets." };
    }

    let used = false;
    let leveledUp = [];

    targets.forEach(m => {
      const pIdx = G.party.indexOf(m);

      if (e.stat === 'hp') {
        if (m.isKO) return;
        const amt = e.percent ? Math.floor(m.maxHp * e.amount / 100) : e.amount;
        const oldHp = m.hp;
        m.hp = Math.min(m.maxHp, m.hp + amt);
        if (m.hp > oldHp) used = true;
        // Visuals (if in battle)
        if (typeof BattleUI !== 'undefined' && BattleUI.popParty) BattleUI.popParty(pIdx, amt, 'heal');

      } else if (e.stat === 'mp') {
        if (m.isKO) return;
        const amt = e.percent ? Math.floor(m.maxMp * e.amount / 100) : e.amount;
        const oldMp = m.mp;
        m.mp = Math.min(m.maxMp, m.mp + amt);
        if (m.mp > oldMp) used = true;
        if (typeof BattleUI !== 'undefined' && BattleUI.popParty) BattleUI.popParty(pIdx, amt, 'regen');

      } else if (e.stat === 'both') {
        if (m.isKO) return;
        m.hp = m.maxHp; m.mp = m.maxMp;
        used = true;
        if (typeof BattleUI !== 'undefined' && BattleUI.popParty) BattleUI.popParty(pIdx, 0, 'heal');

      } else if (e.stat === 'revive') {
        if (!m.isKO) return;
        m.isKO = false;
        m.hp = Math.max(1, Math.floor(m.maxHp * e.amount / 100));
        used = true;
        if (typeof BattleUI !== 'undefined' && BattleUI.popParty) BattleUI.popParty(pIdx, m.hp, 'heal');

      } else if (e.stat === 'debuff') {
        m.statuses = (m.statuses || []).filter(s =>
          !s.id.includes('debuff') && s.type !== 'control' && s.type !== 'dot'
        );
        used = true;
        if (typeof BattleUI !== 'undefined' && BattleUI.popParty) BattleUI.popParty(pIdx, 0, 'regen');

      } else if (e.stat === 'atk' || e.stat === 'def') {
        // Battle-only buffs usually
        if (typeof Battle !== 'undefined' && Battle.addStatus) {
          Battle.addStatus(m, {
            id: `buff_${e.stat}_item`,
            label: `${e.stat.toUpperCase()} Up`,
            icon: e.stat === 'atk' ? '⚔️' : '🛡️',
            stat: e.stat, type: 'mult',
            value: 1 + (e.amount / 100),
            turns: e.turns || 3
          });
          used = true;
          if (typeof BattleUI !== 'undefined' && BattleUI.popParty) BattleUI.popParty(pIdx, 0, 'hi');
        }
      } else if (e.stat === 'exp') {
        m.exp += e.amount;
        used = true;
        if (typeof checkMemberLevel === 'function') {
          while (checkMemberLevel(m)) {
            if (!leveledUp.includes(m.displayName)) leveledUp.push(m.displayName);
          }
        }
      }
    });

    if (used) {
      removeFromInventory(def.id);
      // Sync to source char data
      G.party.forEach(m => {
        if (m && m.char) {
          m.char.hp = m.hp; m.char.mp = m.mp; m.char.isKO = m.isKO;
          m.char.exp = m.exp; m.char.lv = m.lv;
        }
      });
      return { success: true, msg: `Used ${def.name}!`, leveledUp };
    } else {
      return { success: false, msg: "Item had no effect." };
    }
  }
};

function addToInventory(itemId, qty = 1) {
  const def = G.items.find(i => i.id === itemId);
  if (!def) return false;
  
  // --- QUEST SYSTEM INTEGRATION ---
  if (typeof QuestSystem !== 'undefined') {
    for (let i = 0; i < qty; i++) QuestSystem.onGather(itemId);
  }

  const existing = G.inventory.find(s => s.itemId === itemId);
  if (existing) {
    existing.qty = Math.min(MAX_STACK_QTY, existing.qty + qty);
  } else {
    if (G.inventory.length >= MAX_INVENTORY_STACKS) return false;
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

/* ── BATTLE ITEM UI ─────────────────────────────────────── */
function heroItem() {
  const isBusy = typeof TurnState !== 'undefined' ? TurnState.isBusy() : G.busy;
  if (isBusy) return;
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
    menu.innerHTML = '<div class="item-empty">No usable items.</div>';
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
    const btn = document.createElement('button');
    btn.className = 'cmd-btn item-btn';
    btn.innerHTML = `<span class="item-icon">${def.icon}</span> ${def.name} <span class="item-qty">×${stack.qty}</span>`;
    btn.onclick = () => {
      if (def.effect.target === 'single') _buildItemTargetMenu(def);
      else _useItemInBattle(def, -1);
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
  const isRevive = def.subtype === 'revive';
  const targets  = G.party.filter(m => isRevive ? m.isKO : !m.isKO);

  targets.forEach(m => {
    const idx = G.party.indexOf(m);
    const col = CHAR_COLOR[m.charId] || '#aaa';
    const btn = document.createElement('button');
    btn.className = 'cmd-btn';
    btn.style.borderLeftColor = col;
    btn.innerHTML = `<span style="color:${col}">${m.displayName}</span> <span class="item-qty">${m.hp}/${m.maxHp} HP</span>`;
    btn.onclick = () => _useItemInBattle(def, idx);
    menu.appendChild(btn);
  });

  const back = document.createElement('button');
  back.className = 'cmd-btn dim';
  back.textContent = '← BACK';
  back.onclick = () => _buildItemMenu();
  menu.appendChild(back);
}

function _useItemInBattle(def, targetIdx) {
  const isBusy = typeof TurnState !== 'undefined' ? TurnState.isBusy() : G.busy;
  if (isBusy) return;
  if (typeof TurnState !== 'undefined') {
    TurnState.setBusy(true);
    TurnState.setPhase('resolving');
  } else {
    G.busy = true;
  }
  BattleUI.btns(false); BattleUI.openSub(null);

  if (def.subtype === 'escape') {
    removeFromInventory(def.id);
    BattleUI.setLog(['The party vanishes in a cloud of smoke!'], ['hi']);
    setTimeout(() => typeof showResult === 'function' ? showResult('escaped') : advanceTurn(), 900);
    return;
  }

  const res = ItemSystem.apply(def, targetIdx);
  if (res.success) {
    const tName = def.effect.target === 'all' ? 'the party' : G.party[targetIdx]?.displayName || '?';
    BattleUI.setLog([`Used ${def.icon} ${def.name} on ${tName}!`], ['hi']);
  } else {
    BattleUI.setLog([res.msg], ['dim']);
  }

  BattleUI.renderPartyStatus();
  setTimeout(advanceTurn, 800);
}

/* ── OUT-OF-BATTLE ITEM UI (VAULT) ───────────────────────── */
const InventoryUI = (() => {
  let _selectedItem = null;
  let _category = 'consumable';

  function open() {
    if (typeof UI !== 'undefined') UI.hideAllOverlays();
    const el = document.getElementById('inventory-overlay');
    if (el) el.style.display = 'flex';
    
    _selectedItem = null;
    render();
    if (typeof Focus !== 'undefined') Focus.setContext('inventory-overlay');
  }

  function close() {
    const el = document.getElementById('inventory-overlay');
    if (el) el.style.display = 'none';
    if (typeof MapUI !== 'undefined' && typeof MapEngine !== 'undefined' && !MapEngine.isRunning()) {
      const isCamp = MapData.getTileAt(MapEngine.getMap(), MapPlayer.tx, MapPlayer.ty) === 74;
      if (isCamp) {
        document.getElementById('camp-menu').style.display = 'flex';
        if (typeof Focus !== 'undefined') Focus.setContext('camp-menu');
      } else {
        document.getElementById('map-pause-menu').style.display = 'flex';
        if (typeof Focus !== 'undefined') Focus.setContext('map-pause-menu');
      }
    }
  }

  function setCategory(cat) {
    _category = cat;
    _selectedItem = null;
    render();
  }

  function render() {
    renderTabs();
    renderList();
    renderDetail();
  }

  function renderTabs() {
    const tabs = document.querySelectorAll('.itm-tab');
    tabs.forEach(t => {
      t.classList.toggle('active', t.dataset.cat === _category);
    });
  }

  function renderList() {
    const listEl = document.getElementById('inventory-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const items = G.inventory.filter(s => {
      const def = G.items.find(i => i.id === s.itemId);
      return def && def.type === _category;
    });

    if (!items.length) {
      listEl.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-dim); font-size:0.8rem">No ${_category} items.</div>`;
      return;
    }

    const esc = (typeof escapeHtml === 'function') ? escapeHtml : (v) => v;
    items.forEach(stack => {
      const def = G.items.find(i => i.id === stack.itemId);
      const active = _selectedItem && _selectedItem.id === def.id;
      const btn = document.createElement('div');
      btn.className = `itm-entry ${active ? 'active' : ''}`;
      btn.innerHTML = `
        <span class="itm-entry-icon">${def.icon}</span>
        <span class="itm-entry-name">${esc(def.name)}</span>
        <span class="itm-entry-qty">×${stack.qty}</span>
      `;
      btn.onclick = () => { _selectedItem = def; render(); };
      listEl.appendChild(btn);
    });
  }

  function renderDetail() {
    const detEl = document.getElementById('inventory-detail');
    if (!detEl) return;
    if (!_selectedItem) {
      detEl.innerHTML = '<div style="height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:0.85rem">Select an item</div>';
      return;
    }

    const def = _selectedItem;
    const isUsable = def.usable_in?.includes('map');
    const rarityClass = `rarity-${def.rarity || 'common'}`;

    const esc = (typeof escapeHtml === 'function') ? escapeHtml : (v) => v;
    detEl.innerHTML = `
      <div class="itm-showcase-box ${rarityClass}">${def.icon}</div>
      <div class="itm-detail-name">${esc(def.name)}</div>
      <div class="itm-detail-meta">${esc(def.rarity || 'Common')} · ${esc(def.subtype?.replace('_',' ') || 'Item')}</div>
      <div class="itm-detail-desc">${esc(def.description)}</div>
      <button class="itm-use-btn" ${!isUsable ? 'disabled' : ''} onclick="InventoryUI.onUseClick()">
        ${isUsable ? 'USE ITEM' : 'CANNOT USE ON MAP'}
      </button>
    `;
  }

  function onUseClick() {
    if (!_selectedItem) return;
    const def = _selectedItem;
    if (def.effect?.target === 'single') openTargetPicker();
    else useItem(null);
  }

  function openTargetPicker() {
    const overlay = document.getElementById('itm-target-picker');
    const grid = document.getElementById('itm-target-grid');
    overlay.style.display = 'flex';
    grid.innerHTML = '';
    
    if (typeof Focus !== 'undefined') Focus.setContext('itm-target-picker');

    const isRevive = _selectedItem.subtype === 'revive';

    G.party.forEach((m, i) => {
      const col = CHAR_COLOR[m.charId] || '#aaa';
      const hpPct = (m.hp / m.maxHp) * 100;
      const mpPct = (m.mp / m.maxMp) * 100;
      const invalid = isRevive ? !m.isKO : m.isKO;

      const esc = (typeof escapeHtml === 'function') ? escapeHtml : (v) => v;
      const card = document.createElement('div');
      card.className = `itm-target-card ${invalid ? 'disabled' : ''}`;
      card.innerHTML = `
        <div class="itm-target-name" style="color:${col}">${esc(m.displayName)}</div>
        <div class="itm-target-bar-bg"><div class="itm-target-bar-fill" style="width:${hpPct}%; background:#4ade80"></div></div>
        <div class="itm-target-bar-bg"><div class="itm-target-bar-fill" style="width:${mpPct}%; background:#5060ff"></div></div>
      `;
      if (!invalid) card.onclick = () => useItem(i);
      grid.appendChild(card);
    });
  }

  function closeTargetPicker() {
    document.getElementById('itm-target-picker').style.display = 'none';
    if (typeof Focus !== 'undefined') Focus.setContext('inventory-overlay');
  }

  function useItem(targetIdx) {
    const res = ItemSystem.apply(_selectedItem, targetIdx);
    if (res.success) {
      if (res.leveledUp.length) MapUI.showMsg(`★ ${res.leveledUp.join(', ')} Leveled Up!`, 2000);
      else MapUI.showMsg(res.msg, 1200);
      closeTargetPicker();
      render();
    } else {
      MapUI.showMsg(res.msg, 1200);
    }
  }

  return { open, close, setCategory, onUseClick, closeTargetPicker };
})();

/* Award drops from a defeated enemy def */
function _awardDrops(enemyDef) {
  const awarded = [];
  if (enemyDef.drops && enemyDef.drops.length) {
    enemyDef.drops.forEach(drop => {
      if (Math.random() > (drop.chance || 0.2)) return;
      let itemId = drop.itemId;
      if (!itemId && drop.item) {
        const match = (G.items || []).find(i =>
          i.name.toLowerCase() === drop.item.toLowerCase() ||
          i.id === drop.item.toLowerCase().replace(/[- ]/g, '_')
        );
        itemId = match?.id;
      }
      if (itemId) { addToInventory(itemId, drop.qty || 1); awarded.push(itemId); }
    });
  }

  // --- Dynamic Elemental Monster Materials (vivid_hybrid_weapon_system.md Roadmap) ---
  const id = enemyDef.id;
  let t1 = null;
  let t2 = null;

  if (['crystal_shard', 'crystal_golem', 'spectral_guardian', 'shadow_wraith'].includes(id)) {
    t1 = 'ice_shard';
    t2 = 'glacial_prism';
  } else if (['imp', 'bat', 'chimera', 'forge_sentinel'].includes(id)) {
    t1 = 'ember_shard';
    t2 = 'phoenix_hearth';
  } else if (['goblin', 'goblin_elite', 'wyvern', 'void_stalker'].includes(id)) {
    t1 = 'gale_feather';
    t2 = 'tornado_core';
  } else if (['crab', 'mushroom', 'rat', 'void_colossus'].includes(id)) {
    t1 = 'tide_shell';
    t2 = 'oceanic_pearl';
  } else if (['zombie', 'zombie_soldier'].includes(id)) {
    t1 = 'void_dust';
    t2 = 'void_catalyst';
  }

  if (t1 && Math.random() < 0.50) {
    addToInventory(t1, 1);
    awarded.push(t1);
  }
  if (t2 && Math.random() < 0.15) {
    addToInventory(t2, 1);
    awarded.push(t2);
  }

  return awarded;
}

function _tryRelicDrop(isElite) {
  const chance = isElite ? 25 : 8;
  if (Math.random() * 100 > chance) return null;
  const pool = (G.relics || []).filter(r => (r.rarity === 'common' || r.rarity === 'uncommon') && !G.ownedRelics.includes(r.id));
  if (!pool.length) return null;
  const relic = pool[Math.floor(Math.random() * pool.length)];
  // Validation guard: drawn relic must have a valid id before entering the owned pool
  if (!relic?.id) {
    if (typeof IS_DEV !== 'undefined' && IS_DEV) console.warn('[Inventory] _tryRelicDrop: drawn relic is missing an id — drop skipped.');
    return null;
  }
  G.ownedRelics.push(relic.id);
  if (G.activeRelics.length < 3) G.activeRelics.push(relic.id);
  return relic;
}

function awardBossRelic(relicId) {
  if (!relicId || G.ownedRelics.includes(relicId)) return null;
  const relic = (G.relics || []).find(r => r.id === relicId);
  // Validation guard: warn if relicId doesn't exist in G.relics (typo, stale data, or renamed relic)
  if (!relic) {
    if (typeof IS_DEV !== 'undefined' && IS_DEV) console.warn(`[Inventory] awardBossRelic: relicId "${relicId}" not found in G.relics — award skipped.`);
    return null;
  }
  G.ownedRelics.push(relicId);
  return relic;
}
