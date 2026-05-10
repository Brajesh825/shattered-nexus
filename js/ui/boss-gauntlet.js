const BossGauntlet = {
    isOpen: false,
    _bossRegistry: null, // Cache: { id: { name, subtitle, arcIdx, mapId, isStoryBoss } }

    init() {
        this.updateButtonVisibility();
        // Pre-warm story data so the registry can find arc bosses immediately
        // when the Gauntlet opens, even before any game has been started.
        if (typeof Story !== 'undefined' && !Story.data) {
            Story.init(() => {
                // Invalidate the registry cache so it rebuilds with fresh arc data
                this._bossRegistry = null;
            });
        }
    },

    updateButtonVisibility() {
        const btn = document.getElementById('gauntlet-btn');
        if (!btn) return;

        const urlParams = new URLSearchParams(window.location.search);
        const isDebug = urlParams.get('debug') === 'true' || urlParams.get('dev') === 'true' || (typeof ReleaseConfig !== 'undefined' && ReleaseConfig.IS_DEV);
        const isEnabled = (typeof ReleaseConfig !== 'undefined' && ReleaseConfig.ENABLE_BOSS_MODE) || isDebug;

        btn.style.display = isEnabled ? 'flex' : 'none';
    },

    /**
     * Dynamically builds the boss registry from Story and Map data.
     * Prevents hardcoding of IDs and requirements.
     */
    buildBossRegistry() {
        if (this._bossRegistry) return this._bossRegistry;
        const registry = {};

        // 1. Arc Story Bosses (The Guardians)
        if (typeof Story !== 'undefined' && Story.data && Story.data.arcs) {
            Story.data.arcs.forEach((arc, idx) => {
                if (arc.boss_enemy) {
                    registry[arc.boss_enemy] = {
                        id: arc.boss_enemy,
                        arcIdx: idx,
                        mapId: ARC_MAP_ID[idx] || null,
                        isStoryBoss: true,
                        tier: 3
                    };
                }
                // Also check chapters for map-specific bosses within the arc sequence
                (arc.chapters || []).forEach(chap => {
                    if (chap.type === 'boss_battle' && chap.enemy_id) {
                        if (!registry[chap.enemy_id]) {
                            registry[chap.enemy_id] = {
                                id: chap.enemy_id,
                                arcIdx: idx,
                                mapId: chap.map || ARC_MAP_ID[idx] || null,
                                isStoryBoss: false,
                                tier: 3
                            };
                        }
                    }
                });
            });
        }

        // 2. Expansion & Map Bosses (The Predators)
        if (typeof MAP_DEFS !== 'undefined') {
            Object.keys(MAP_DEFS).forEach(mapId => {
                const map = MAP_DEFS[mapId];
                // Support both arcIdx and arcId property names across map definitions
                const mapArcIdx = map.arcIdx ?? map.arcId ?? 99;
                (map.enemies || []).forEach(en => {
                    if (en.isBoss) {
                        if (!registry[en.id]) {
                            registry[en.id] = {
                                id: en.id,
                                arcIdx: mapArcIdx - 1, // arcId is 1-based; convert to 0-based index
                                mapId: mapId,
                                isStoryBoss: false,
                                tier: 3
                            };
                        }
                    }
                });
            });
        }

        this._bossRegistry = registry;
        return registry;
    },

    getBossIds() {
        return Object.keys(this.buildBossRegistry());
    },

    getBossArcMap() {
        const reg = this.buildBossRegistry();
        const map = {};
        Object.keys(reg).forEach(id => {
            map[id] = reg[id].arcIdx;
        });
        return map;
    },

    open() {
        const overlay = document.getElementById('gauntlet-overlay');
        const grid = document.getElementById('gauntlet-grid');
        if (!overlay || !grid) return;

        overlay.style.display = 'flex';
        this.isOpen = true;

        if (!G.party || G.party.length === 0) {
            this.showSavePicker();
        } else {
            this.renderBossList();
        }
        if (typeof SFX !== 'undefined' && typeof SFX.click === 'function') SFX.click();
    },

    showSavePicker() {
        const grid = document.getElementById('gauntlet-grid');
        if (!grid) return;
        const slots = Save.listAll();

        grid.innerHTML = `
            <div class="gauntlet-empty" style="margin-bottom:20px; font-size:18px; color:var(--gold)">
                NO ACTIVE PARTY DETECTED<br>
                <span style="font-size:14px; color:#aaa">Select a Crystal Save to load your party data</span>
            </div>
        `;

        slots.forEach(s => {
            const card = document.createElement('div');
            card.className = 'gauntlet-card save-select-card';
            if (s.empty) {
                card.innerHTML = `<div class="gc-body"><div class="gc-name">SLOT ${s.slot + 1}</div><div class="gc-subtitle">Empty Slot</div></div>`;
                card.style.opacity = '0.5';
                card.style.pointerEvents = 'none';
            } else {
                const date = Save.dateStr(s.timestamp);
                const lv = s.partyStats?.[0]?.lv || s.heroLv || '?';
                card.innerHTML = `
                    <div class="gc-header"><span class="gc-tier">LV ${lv}</span></div>
                    <div class="gc-body">
                        <div class="gc-name">SLOT ${s.slot + 1}</div>
                        <div class="gc-subtitle">${escapeHtml(s.arcName || 'Story Progress')}</div>
                        <div class="gc-stat" style="margin-top:10px">${date}</div>
                    </div>
                    <div class="gc-footer"><button class="gc-fight-btn">LOAD SAVE</button></div>
                `;
                card.onclick = () => this.loadSaveData(s.slot);
            }
            grid.appendChild(card);
        });
    },

    loadSaveData(slot) {
        const s = Save.read(slot);
        if (!s) return;

        // CRITICAL: Bind the active slot so subsequent saves (if any) target the right place
        if (typeof Story !== 'undefined') Story._activeSlot = slot;

        // Hydrate G state
        G.selectedChar = s.selectedChar || (G.chars[0] && G.chars[0].id);
        G.selectedClass = s.selectedClass || (G.classes[0] && G.classes[0].id);
        G.selectedChars = s.selectedChars || [G.selectedChar];
        G.inventory = s.inventory || [];
        G.clearedMaps = s.clearedMaps || [];
        G.arcIdx = s.arcIdx || 0;
        G.unlockedChars = s.unlockedChars || G.selectedChars;

        // ── Hydrate Archive from save ─────────────────────────────────────
        // Critical: the Archive system reads from G.archive, which won't be
        // populated unless we copy it from the save file and re-initialize.
        if (s.archive) {
            G.archive = s.archive;
            if (typeof Archive !== 'undefined') Archive.init();
        }

        if (typeof buildParty === 'function') buildParty();

        // Restore party stats
        if (s.partyStats && G.party) {
            s.partyStats.forEach(saved => {
                const member = G.party.find(m => m.charId === saved.charId);
                if (member) {
                    member.lv = saved.lv;
                    if (member.char) member.char.lv = saved.lv;
                    rebuildMemberCombatStats(member, { resourceStrategy: 'full' });
                    member.isKO = false;
                }
            });
        }
        G.hero = G.party?.[0];
        this.renderBossList();
    },

    renderBossList() {
        const grid = document.getElementById('gauntlet-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const registry = this.buildBossRegistry();
        const data = window.ENEMIES_DATA || (typeof G !== 'undefined' ? G.enemies : []);
        
        // Filter and sort bosses
        let bosses = data.filter(e => registry[e.id])
            .sort((a, b) => {
                const regA = registry[a.id], regB = registry[b.id];
                // Story bosses first, then by arcIdx
                if (regA.isStoryBoss !== regB.isStoryBoss) return regB.isStoryBoss ? 1 : -1;
                return regA.arcIdx - regB.arcIdx;
            });

        // Application of Release and Discovery Filters
        // isDebug: shows ALL bosses within MAX_REACHABLE_ARC, no kill required (dev testing).
        // Normal mode: boss must have at least one confirmed kill to appear.
        const isDebug = new URLSearchParams(window.location.search).get('debug') === 'true' || (typeof ReleaseConfig !== 'undefined' && ReleaseConfig.IS_DEV);

        bosses.forEach(boss => {
            const reg = registry[boss.id];
            const isReleased = (typeof ReleaseConfig === 'undefined') || reg.arcIdx <= ReleaseConfig.MAX_REACHABLE_ARC;

            // Discovery gate: boss must have at least one confirmed kill
            let hasKills = 0;
            if (typeof Archive !== 'undefined' && typeof Archive.getEntry === 'function') {
                hasKills = Archive.getEntry(boss.id)?.kills || 0;
            }

            // Legacy fallback: cleared map also counts (handles old saves without kill records)
            const isCleared = (G.clearedMaps && G.clearedMaps.includes(reg.mapId));

            // Dev mode bypasses the kill requirement but respects the release gate
            const isUnlocked = isDebug || hasKills > 0 || isCleared;

            // Only show if released AND unlocked
            if (isReleased && isUnlocked) {
                const card = this.createBossCard(boss, true);
                grid.appendChild(card);
            }
        });

        if (grid.children.length === 0) {
            grid.innerHTML = '<div class="gauntlet-empty">No Bosses Encountered Yet<br><span style="font-size:12px;color:#666">Defeat bosses in Story Mode to unlock them here.</span></div>';
        }
    },

    createBossCard(boss, isUnlocked) {
        const card = document.createElement('div');
        card.className = `gauntlet-card element-${boss.element || 'neutral'} ${isUnlocked ? '' : 'locked'}`;

        if (!isUnlocked) {
            card.innerHTML = `
                <div class="gc-body" style="filter: grayscale(1) opacity(0.5)">
                    <div class="gc-sprite-container"><div class="locked-icon">🔒</div></div>
                    <div class="gc-name">???</div>
                    <div class="gc-subtitle">Undiscovered Legendary</div>
                </div>
                <div class="gc-footer">
                    <div class="gc-stat">Requirement: <span>Explore further</span></div>
                </div>
            `;
            return card;
        }

        let kills = 0;
        if (typeof Archive !== 'undefined' && typeof Archive.getEntry === 'function') {
            kills = Archive.getEntry(boss.id)?.kills || 0;
        }
        const playerLv = (G.party && G.party[0]) ? G.party[0].lv : 1;

        card.innerHTML = `
            <div class="gc-header">
                <span class="gc-tier">TIER 3</span>
                <span class="gc-element">${(boss.element || 'neutral').toUpperCase()}</span>
            </div>
            <div class="gc-body">
                <div class="gc-sprite-container" id="gspr-cont-${boss.id}"></div>
                <div class="gc-name">${boss.name}</div>
                <div class="gc-subtitle">${boss.subtitle || 'Legendary Foe'}</div>
            </div>
            <div class="gc-footer">
                <div class="gc-stat">Adaptive Level: <span>${playerLv}</span></div>
                <div class="gc-stat">Record Kills: <span>${kills}</span></div>
                <button class="gc-fight-btn">CHALLENGE</button>
            </div>
        `;

        const cont = card.querySelector(`#gspr-cont-${boss.id}`);
        const spr = document.createElement('img');
        spr.className = 'gauntlet-sprite';
        if (typeof SpriteRenderer !== 'undefined') SpriteRenderer.drawEnemy(spr, boss.id, boss.palette);
        cont.appendChild(spr);

        const triggerStart = (e) => {
            e.stopPropagation();
            this.start(boss.id);
        };
        card.querySelector('.gc-fight-btn').onclick = triggerStart;
        card.onclick = triggerStart;

        return card;
    },

    close() {
        const overlay = document.getElementById('gauntlet-overlay');
        if (overlay) overlay.style.display = 'none';
        this.isOpen = false;
    },

    start(bossId) {
        const bossDef = (window.ENEMIES_DATA || G.enemies).find(e => e.id === bossId);
        if (!bossDef) return;

        this.close();
        if (typeof Story !== 'undefined') Story.active = true;

        // Full Restore
        if (G.party) {
            G.party.forEach(m => {
                m.hp = m.maxHp; m.mp = m.maxMp; m.isKO = false; m.statuses = [];
            });
        }

        G.isGauntletMode = true;
        const playerLv = (G.party && G.party[0]) ? G.party[0].lv : 1;
        buildEnemyGroup([bossDef], playerLv, true);
        G.enemies = G.enemyGroup;
        if (typeof TurnState !== 'undefined') TurnState.setTargetEnemyIdx(0);
        else G.targetEnemyIdx = 0;

        if (typeof _initBattle === 'function') _initBattle();
        if (typeof processCurrentTurn === 'function') processCurrentTurn();
    }
};

window.addEventListener('saveLoaded', () => {
    BossGauntlet.updateButtonVisibility();
    if (BossGauntlet.isOpen) BossGauntlet.open();
});

setTimeout(() => BossGauntlet.init(), 1000);
