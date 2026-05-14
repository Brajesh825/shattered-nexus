/**
 * shop-ui.js — Controller module for Regional Merchants and Economy Transactions.
 * Enforces Supply Pouch mechanics (stack limit attrition) to drive restock tactics.
 */

const ShopUI = (() => {
  let _activeMerchant = null;
  let _currentTab = 'buy'; // 'buy' | 'sell'
  let _selectedItem = null; // { itemDef, price, stock, isRelic, type }
  let _selectedQty = 1;

  // Supply pouch static limit for combat attrition management
  const POUCH_CAP = 15;

  /** Helper to fetch the aggregate gold available across the entire active party */
  function _getPlayerGold() {
    if (typeof G === 'undefined' || !G.party) return 0;
    return G.party.reduce((sum, member) => sum + (member ? (member.gold || 0) : 0), 0);
  }

  /** Helper to deduct gold from party members sequentially until covered */
  function _deductPlayerGold(amount) {
    if (typeof G === 'undefined' || !G.party) return false;
    let remaining = amount;
    for (const member of G.party) {
      if (!member || !member.gold) continue;
      if (member.gold >= remaining) {
        member.gold -= remaining;
        remaining = 0;
        break;
      } else {
        remaining -= member.gold;
        member.gold = 0;
      }
    }
    return remaining === 0;
  }

  /** Helper to grant gold evenly or to the main active protagonist slot */
  function _addPlayerGold(amount) {
    if (typeof G === 'undefined' || !G.party || !G.party[0]) return;
    G.party[0].gold = (G.party[0].gold || 0) + amount;
  }

  /** Helper to count party's current supply pouch quantity for a given consumable ID */
  function _getPouchQty(itemId) {
    if (typeof G === 'undefined' || !G.inventory) return 0;
    const stack = G.inventory.find(i => i && i.itemId === itemId);
    return stack ? stack.qty : 0;
  }

  /** Helper to get full definition object for an item or relic */
  function _resolveItemDef(itemId) {
    if (typeof G === 'undefined') return null;
    let def = G.items && G.items.find(i => i.id === itemId);
    if (def) return { ...def, _isRelic: false };
    def = G.relics && G.relics.find(r => r.id === itemId);
    if (def) return { ...def, _isRelic: true };
    return { id: itemId, name: itemId.toUpperCase(), icon: '📦', description: 'Curiosity of the Nexus', _isRelic: false };
  }

  function open(merchantId) {
    if (typeof UI !== 'undefined' && UI.hideAllOverlays) {
      UI.hideAllOverlays();
    }
    
    // Resume loop if map engine was suspended during dialogue to animate overlays smoothly
    if (typeof MapEngine !== 'undefined' && !MapEngine.isRunning()) {
      MapEngine.resume();
    }

    const merchants = (typeof G !== 'undefined' && G.merchants) ? G.merchants : window.MERCHANTS_DATA;
    if (!merchants) return;

    // Find the tailored merchant catalog
    _activeMerchant = merchants.find(m => m.id === merchantId || (m.aliases && m.aliases.includes(merchantId)));
    if (!_activeMerchant) {
      // Create adaptive fallback merchant profile if untracked
      _activeMerchant = {
        id: merchantId,
        name: merchantId.replace(/_/g, ' ').toUpperCase(),
        lore: 'Wandering merchant of the fractured realms.',
        items: [
          { itemId: 'potion', price: 50, stock: 15 },
          { itemId: 'ether', price: 100, stock: 10 },
          { itemId: 'tent', price: 200, stock: 5 }
        ]
      };
    }

    _currentTab = 'buy';
    _selectedItem = null;
    _selectedQty = 1;

    // Populate descriptive framework
    const nameEl = document.getElementById('shop-merchant-name');
    const loreEl = document.getElementById('shop-merchant-lore');
    const overlay = document.getElementById('shop-overlay');

    if (nameEl) nameEl.textContent = _activeMerchant.name;
    if (loreEl) loreEl.textContent = _activeMerchant.lore || '';

    _updateTabHeaders();
    _renderList();
    _renderDetail();
    _updateGoldDisplay();

    if (overlay) {
      overlay.style.display = 'flex';
      if (typeof SFX !== 'undefined' && SFX.click) SFX.click();
    }
  }

  function close() {
    const overlay = document.getElementById('shop-overlay');
    if (overlay) overlay.style.display = 'none';
    _activeMerchant = null;
    if (typeof SFX !== 'undefined' && SFX.cancel) SFX.cancel();
  }

  function setTab(tab) {
    if (_currentTab === tab) return;
    _currentTab = tab;
    _selectedItem = null;
    _selectedQty = 1;
    _updateTabHeaders();
    _renderList();
    _renderDetail();
    if (typeof SFX !== 'undefined' && SFX.click) SFX.click();
  }

  function _updateTabHeaders() {
    const bTab = document.getElementById('shop-tab-buy');
    const sTab = document.getElementById('shop-tab-sell');
    if (bTab) bTab.classList.toggle('active', _currentTab === 'buy');
    if (sTab) sTab.classList.toggle('active', _currentTab === 'sell');
  }

  function _updateGoldDisplay() {
    const goldEl = document.getElementById('shop-player-gold');
    if (goldEl) goldEl.textContent = _getPlayerGold();
  }

  function _renderList() {
    const listEl = document.getElementById('shop-item-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const esc = (typeof escapeHtml === 'function') ? escapeHtml : (v) => v;

    if (_currentTab === 'buy') {
      const items = _activeMerchant?.items || [];
      if (items.length === 0) {
        listEl.innerHTML = `<div class="shop-empty-hint" style="margin-top: 40px;">No wares currently available.</div>`;
        return;
      }

      items.forEach((entry, idx) => {
        const def = _resolveItemDef(entry.itemId);
        if (!def) return;

        const isRelic = def._isRelic;
        const owned = isRelic ? (G?.ownedRelics?.includes(def.id) || false) : false;
        const curQty = isRelic ? (owned ? 1 : 0) : _getPouchQty(def.id);
        const maxCap = isRelic ? 1 : (def.type === 'key_item' ? 1 : POUCH_CAP);
        const atCap = curQty >= maxCap;
        const noStock = entry.stock != null && entry.stock <= 0;
        const disabled = atCap || noStock;

        const isSelected = _selectedItem && _selectedItem.itemDef.id === def.id;

        const row = document.createElement('div');
        row.className = `shop-item-row${isSelected ? ' active' : ''}${disabled ? ' disabled' : ''}`;
        row.innerHTML = `
          <div class="shop-item-left">
            <div class="shop-item-icon">${def.icon || '📦'}</div>
            <div class="shop-item-info">
              <div class="shop-item-name">${esc(def.name)}</div>
              <div class="shop-item-stock">${isRelic ? 'Relic Equipment' : (entry.stock != null ? `Stock: ${entry.stock}` : 'Infinite Stock')}</div>
            </div>
          </div>
          <div class="shop-item-right">
            <div class="shop-item-pouch${atCap ? ' full' : ''}">${isRelic ? (owned ? 'OWNED' : 'NEW') : `${curQty}/${maxCap}`}</div>
            <div class="shop-item-price">${entry.price}G</div>
          </div>
        `;

        row.addEventListener('click', () => {
          _selectedItem = { itemDef: def, price: entry.price, stock: entry.stock, isRelic, maxCap, curQty, atCap };
          _selectedQty = 1;
          _renderList();
          _renderDetail();
          if (typeof SFX !== 'undefined' && SFX.click) SFX.click();
        });

        listEl.appendChild(row);
      });
    } else {
      // ── SELL TAB ─────────────────────────────────────────────
      // Aggregate sellable stack materials, trophies, and surplus non-equipped relics
      const sellableList = [];

      // Consumables and trophies in inventory
      if (typeof G !== 'undefined' && G.inventory) {
        G.inventory.forEach(stk => {
          if (!stk || !stk.itemId || stk.qty <= 0) return;
          const def = _resolveItemDef(stk.itemId);
          if (!def || def.type === 'key_item' || def.value === 0) return;
          sellableList.push({ itemDef: def, qty: stk.qty, value: def.value || Math.floor((def.price || 50) / 2), isRelic: false });
        });
      }

      // Owned relics that are not currently active
      if (typeof G !== 'undefined' && G.ownedRelics && G.activeRelics) {
        G.ownedRelics.forEach(rId => {
          if (G.activeRelics.includes(rId)) return; // prevent selling equipped item directly
          const def = _resolveItemDef(rId);
          if (!def) return;
          sellableList.push({ itemDef: def, qty: 1, value: def.value || 150, isRelic: true });
        });
      }

      if (sellableList.length === 0) {
        listEl.innerHTML = `<div class="shop-empty-hint" style="margin-top: 40px;">No surplus wares or collected trophies to trade.</div>`;
        return;
      }

      sellableList.forEach(entry => {
        const def = entry.itemDef;
        const isSelected = _selectedItem && _selectedItem.itemDef.id === def.id;

        const row = document.createElement('div');
        row.className = `shop-item-row${isSelected ? ' active' : ''}`;
        row.innerHTML = `
          <div class="shop-item-left">
            <div class="shop-item-icon">${def.icon || '✦'}</div>
            <div class="shop-item-info">
              <div class="shop-item-name">${esc(def.name)}</div>
              <div class="shop-item-stock">${entry.isRelic ? 'Unequipped Relic' : `Carried: ${entry.qty}`}</div>
            </div>
          </div>
          <div class="shop-item-right">
            <div class="shop-item-price" style="color: #4ade80;">+${entry.value}G</div>
          </div>
        `;

        row.addEventListener('click', () => {
          _selectedItem = { itemDef: def, price: entry.value, stock: entry.qty, isRelic: entry.isRelic, maxCap: entry.qty, curQty: entry.qty, atCap: false };
          _selectedQty = 1;
          _renderList();
          _renderDetail();
          if (typeof SFX !== 'undefined' && SFX.click) SFX.click();
        });

        listEl.appendChild(row);
      });
    }
  }

  function _renderDetail() {
    const detailEl = document.getElementById('shop-item-detail');
    if (!detailEl) return;

    if (!_selectedItem) {
      detailEl.innerHTML = `<div class="shop-empty-hint">Select an item to view specifications and supply pouch constraints.</div>`;
      return;
    }

    const { itemDef, price, stock, isRelic, maxCap, curQty, atCap } = _selectedItem;
    const esc = (typeof escapeHtml === 'function') ? escapeHtml : (v) => v;

    // Calculate maximum dynamic purchase/sell quantity limits
    let limitMax = 1;
    if (_currentTab === 'buy') {
      const room = Math.max(0, maxCap - curQty);
      const afford = Math.floor(_getPlayerGold() / price);
      limitMax = isRelic ? 1 : Math.min(room, afford);
      if (stock != null) limitMax = Math.min(limitMax, stock);
      limitMax = Math.max(1, limitMax); // ensure 1 for visual preview even if disabled
    } else {
      limitMax = stock; // stock represents player inventory quantity in sell mode
    }

    const totalCost = price * _selectedQty;
    const canTransact = _currentTab === 'buy'
      ? (!atCap && _getPlayerGold() >= totalCost && (stock == null || stock >= _selectedQty))
      : (_selectedQty <= stock);

    // Build stat view block if item provides modifiers
    let statsBlock = '';
    if (isRelic && itemDef.stats) {
      const parts = [];
      for (const [key, val] of Object.entries(itemDef.stats)) {
        parts.push(`<span style="color:#fbbf24">${key.toUpperCase()} +${val}</span>`);
      }
      if (parts.length) {
        statsBlock = `<div style="display:flex;gap:12px;font-size:12px;margin-top:8px;background:rgba(0,0,0,0.3);padding:6px 12px;border-radius:6px;border:1px solid rgba(251,191,36,0.2)">${parts.join(' · ')}</div>`;
      }
    } else if (itemDef.healAmount || itemDef.mpHealAmount) {
      const parts = [];
      if (itemDef.healAmount) parts.push(`<span style="color:#4ade80">Restores ${itemDef.healAmount} HP</span>`);
      if (itemDef.mpHealAmount) parts.push(`<span style="color:#38bdf8">Restores ${itemDef.mpHealAmount} MP</span>`);
      statsBlock = `<div style="display:flex;gap:12px;font-size:12px;margin-top:8px;background:rgba(0,0,0,0.3);padding:6px 12px;border-radius:6px;">${parts.join(' · ')}</div>`;
    }

    // Pouch fill cap bar width preview
    const nextQty = _currentTab === 'buy' ? curQty + _selectedQty : curQty - _selectedQty;
    const fillPct = Math.min(100, Math.max(0, (nextQty / maxCap) * 100));

    detailEl.innerHTML = `
      <div class="shop-detail-top">
        <div class="shop-detail-card">
          <div class="shop-detail-icon">${itemDef.icon || '📦'}</div>
          <div class="shop-detail-headers">
            <div class="shop-detail-name">${esc(itemDef.name)}</div>
            <div class="shop-detail-tag">${isRelic ? 'Relic Artifact' : (itemDef.type || 'Consumable').replace('_', ' ')}</div>
          </div>
        </div>
        <div class="shop-detail-desc">${esc(itemDef.description || 'Ancient oddity of the Vale.')}</div>
        ${statsBlock}
        
        <div class="shop-pouch-box">
          <div class="shop-pouch-title">
            <span>${isRelic ? 'PARTY VAULT' : 'SUPPLY POUCH LIMIT'}</span>
            <span style="color:#f8fafc">${isRelic ? (curQty ? 'Already Acquired' : 'Available') : `${nextQty} / ${maxCap}`}</span>
          </div>
          ${!isRelic ? `
            <div class="shop-pouch-bar-bg">
              <div class="shop-pouch-bar-fill${nextQty >= maxCap ? ' cap' : ''}" style="width: ${fillPct}%"></div>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="shop-action-area">
        ${(!isRelic && limitMax > 1) ? `
          <div class="shop-qty-row">
            <button class="shop-qty-btn" id="shop-qty-sub" ${(_selectedQty <= 1) ? 'disabled' : ''}>-</button>
            <span class="shop-qty-val">${_selectedQty}</span>
            <button class="shop-qty-btn" id="shop-qty-add" ${(_selectedQty >= limitMax) ? 'disabled' : ''}>+</button>
          </div>
        ` : ''}
        
        <div class="shop-total-row">
          <span>${_currentTab === 'buy' ? 'TRANSACTION TOTAL' : 'ACQUIRED REVENUE'}</span>
          <span class="shop-total-val${(_currentTab === 'buy' && _getPlayerGold() < totalCost) ? ' insufficient' : ''}" style="${_currentTab === 'sell' ? 'color:#4ade80' : ''}">
            ${_currentTab === 'sell' ? '+' : ''}${totalCost}G
          </span>
        </div>

        <button class="shop-confirm-btn" id="shop-btn-confirm" ${!canTransact ? 'disabled' : ''}>
          ${_currentTab === 'buy' ? '✔ ACQUIRE' : '✔ SELL OFF'}
        </button>
      </div>
    `;

    // Wire Quantity triggers
    const subBtn = document.getElementById('shop-qty-sub');
    const addBtn = document.getElementById('shop-qty-add');
    const cnfBtn = document.getElementById('shop-btn-confirm');

    if (subBtn) {
      subBtn.onclick = () => {
        if (_selectedQty > 1) { _selectedQty--; _renderDetail(); }
      };
    }
    if (addBtn) {
      addBtn.onclick = () => {
        if (_selectedQty < limitMax) { _selectedQty++; _renderDetail(); }
      };
    }

    if (cnfBtn) {
      cnfBtn.onclick = () => _executeTransaction();
    }
  }

  function _executeTransaction() {
    if (!_selectedItem) return;
    const { itemDef, price, stock, isRelic } = _selectedItem;
    const totalCost = price * _selectedQty;

    if (_currentTab === 'buy') {
      // Execute gold deduction checks safely
      if (!_deductPlayerGold(totalCost)) {
        if (typeof MapUI !== 'undefined') MapUI.showMsg('Insufficient aggregated funds!', 1500);
        return;
      }

      // Add purchased item into current persistent scope
      if (isRelic) {
        if (!G.ownedRelics) G.ownedRelics = [];
        if (!G.ownedRelics.includes(itemDef.id)) G.ownedRelics.push(itemDef.id);
      } else {
        if (!G.inventory) G.inventory = [];
        const stack = G.inventory.find(i => i && i.itemId === itemDef.id);
        if (stack) {
          stack.qty += _selectedQty;
        } else {
          G.inventory.push({ itemId: itemDef.id, qty: _selectedQty });
        }
      }

      // Decrement source inventory stock cap limits if trackable
      if (_activeMerchant && _activeMerchant.items) {
        const catEntry = _activeMerchant.items.find(e => e.itemId === itemDef.id);
        if (catEntry && catEntry.stock != null) {
          catEntry.stock -= _selectedQty;
        }
      }

      if (typeof MapUI !== 'undefined') MapUI.showMsg(`Acquired ${_selectedQty}x ${itemDef.name}!`, 1200);
      if (typeof SFX !== 'undefined' && SFX.buff) SFX.buff();

    } else {
      // ── SELL EXECUTION ───────────────────────────────────────
      _addPlayerGold(totalCost);

      if (isRelic) {
        // Remove relic from global ownership records
        const rIdx = G.ownedRelics ? G.ownedRelics.indexOf(itemDef.id) : -1;
        if (rIdx !== -1) G.ownedRelics.splice(rIdx, 1);
      } else {
        // Reduce count in single inventory structure
        const stack = G.inventory ? G.inventory.find(i => i && i.itemId === itemDef.id) : null;
        if (stack) {
          stack.qty -= _selectedQty;
          if (stack.qty <= 0) {
            const sIdx = G.inventory.indexOf(stack);
            if (sIdx !== -1) G.inventory.splice(sIdx, 1);
          }
        }
      }

      if (typeof MapUI !== 'undefined') MapUI.showMsg(`Sold ${_selectedQty}x ${itemDef.name}.`, 1200);
      if (typeof SFX !== 'undefined' && SFX.coin) SFX.coin();
    }

    // Fully reload visual views to capture live transactional offsets
    _selectedItem = null;
    _selectedQty = 1;
    _updateGoldDisplay();
    _renderList();
    _renderDetail();
  }

  return { open, close, setTab };
})();

window.ShopUI = ShopUI;
if (typeof global !== 'undefined') global.ShopUI = ShopUI;
if (typeof module !== 'undefined' && module.exports) module.exports = ShopUI;
