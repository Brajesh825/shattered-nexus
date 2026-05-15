# Concept: The Hollow Archive — In-Game Lore Codex Extension
**Domain**: The Chronicler (Story) + Vivid (Visual)
**Status**: Concept — Extension Plan Ready (~70% Already Implemented)
**Priority**: LOW-MEDIUM
**Arc Scope**: Arc 1+ (Triggers on first lore fragment collection)

---

## Overview

The Archive system is **substantially implemented**. `archive-ui.js`, `archive.js`, and the `Archive.recordStoryFragment()` pipeline are all live. The goals for Arc 1–2 are:
1. Make the archive feel **discoverable** — notify the player when new content is added
2. Ensure the Archive's Bestiary kill thresholds are working correctly
3. Lay groundwork for the **Memories** tab (Memoria Shards integration — Arc 2+)

---

## Pre-Implementation Audit

| System | Exists? | Detail |
|---|---|---|
| `js/ui/archive-ui.js` | ✅ **Yes** | 191 lines. Full Bestiary + Story tab UI with `renderList()`, `renderDetail()`, `renderStoryFrag()`. |
| `js/systems/archive.js` | ✅ **Yes** | `Archive.recordSeen(id)`, `Archive.recordStoryFragment(id)`, `Archive.getEntry(id)`, `Archive.getMasteryBuffs()`, `Archive.data.story{}`, `Archive.data.bestiary{}`. All live. |
| `map-engine.js:1912` | ✅ **Yes** | Already calls `Archive.recordStoryFragment(npc.id)` on NPC interaction. |
| `Archive.data.story{}` | ✅ **Yes** | Persisted to `G.archive.story` via `Save.patch`. |
| Kill threshold badge | ✅ **Yes** | `archive-ui.js:97` checks `entry.kills >= 5` for ★ mastery. |
| New-entry notification | ❌ **Missing** | No visual alert when archive is updated. Player has no feedback. |
| "NEW" indicator on camp button | ❌ **Missing** | Camp menu Archive button has no new-content badge. |
| Memories tab | ❌ **Not built** | Third tab for Memoria Shards does not exist yet. |

---

## What Exists (Do Not Re-Implement)

The Bestiary + Story tab pipeline is complete. `Archive.recordSeen(id)` is called from `menu-manager.js:149` on every enemy encounter. `Archive.recordStoryFragment(id)` is called from `map-engine.js:1912` on every NPC interaction. **Do not touch these flows.**

---

## What to Build (Arc 1–2 Scope)

### Step 1 — New-Entry Flag in `js/systems/archive.js`

In `recordStoryFragment()`, set a flag when a genuinely new entry is created:

```javascript
recordStoryFragment(id) {
  if (!id || this.data.story[id]) return; // already known — early exit
  this.data.story[id] = true;
  G.archive = this.data;
  G.newArchiveEntry = true; // NEW — triggers notification
},
```

### Step 2 — `js/game.js`

Add to `G` initializer:
```javascript
G.newArchiveEntry = false;
G.archiveEverOpened = false;
```
Persist `G.archiveEverOpened` in save (so the first-time hint only shows once, ever).

### Step 3 — First-Time Discovery Hint

In `map-engine.js` NPC interaction handler, after `Archive.recordStoryFragment()` fires:
```javascript
if (G.newArchiveEntry && !G.archiveEverOpened) {
  setTimeout(() => {
    MapUI.showMsg('📖 New entry in The Archive — check the Camp Menu.', 4000);
  }, 1500);
}
```

### Step 4 — "NEW" Dot on Camp Menu Archive Button

In `js/map/map-ui.js`, inside `openCampMenu()`, check and inject the dot:
```javascript
const archiveBtn = document.getElementById('camp-btn-archive');
if (archiveBtn) {
  archiveBtn.innerHTML = G.newArchiveEntry
    ? '📖 ARCHIVE <span class="new-dot">NEW</span>'
    : '📖 ARCHIVE';
}
```

In `ArchiveUI.open()`, clear the flag:
```javascript
// Add at top of open():
G.newArchiveEntry = false;
G.archiveEverOpened = true;
const btn = document.getElementById('camp-btn-archive');
if (btn) btn.innerHTML = '📖 ARCHIVE';
```

### Step 5 — `.new-dot` Badge Style in `css/map.css`

```css
.new-dot {
  display: inline-block;
  background: var(--crimson, #ef4444);
  color: #fff;
  font-size: 8px;
  font-family: var(--vt);
  padding: 1px 5px;
  border-radius: 6px;
  margin-left: 6px;
  vertical-align: middle;
  animation: pulse 1.2s ease-in-out infinite;
  letter-spacing: 1px;
}
```

### Step 6 — Memories Tab Foundation (Post-Arc 2, after Memoria Shards are built)

Add a third tab to `archive-ui.js`:
```javascript
// In setTab():
// activeTab: 'bestiary' | 'story' | 'memories'

// In renderList() — memories branch:
} else if (this.activeTab === 'memories') {
  const shards = window.MEMORIA_DATA?.shards || [];
  shards.forEach(shard => {
    const collected = G.collectedShards?.has(shard.id);
    const row = document.createElement('div');
    row.className = 'bestiary-row' + (collected ? ' discovered' : ' undiscovered');
    row.innerHTML = collected
      ? `<span class="br-icon">💎</span> <span class="br-name">${shard.title}</span>`
      : `<span class="br-icon">🔒</span> <span class="br-name">Unknown Memory</span>`;
    if (collected) row.onclick = () => MemoriaShard._playFlashback(shard.flashback);
    list.appendChild(row);
  });
}
```

**Note**: This step is blocked on `memoria-shards.js` being implemented first.

---

## Completionist Rewards (Future — Arc 3+)

When a region's lore fragments reach 100% completion, award a passive bonus for that region. Tracked via:
```javascript
Archive.getRegionCompletion(regionId) {
  // Count story fragments tagged with regionId vs. total for that region
}
```
This is a future extension. Do not implement in Arc 1–2 scope.

---

## Visual Treatment Notes (Vivid)

The Archive UI already exists with dark glass aesthetics. The only new visual work needed for Arc 1–2 is:
- `.new-dot` badge (pulsing red indicator)
- The `📖 ARCHIVE` camp button should have `id="camp-btn-archive"` if it does not already — verify in `index.html`

---

## Files Modified

| File | Change |
|---|---|
| `js/systems/archive.js` | Add `G.newArchiveEntry = true` in `recordStoryFragment` |
| `js/game.js` | Add `G.newArchiveEntry`, `G.archiveEverOpened` |
| `js/map/map-engine.js` | First-time discovery hint after `recordStoryFragment` |
| `js/map/map-ui.js` | NEW dot injection in `openCampMenu()` |
| `js/ui/archive-ui.js` | Clear flag + `archiveEverOpened` in `open()`, Memories tab stub |
| `index.html` | Verify `id="camp-btn-archive"` on Archive camp button; add Memories tab button |
| `css/map.css` | `.new-dot` badge animation |
