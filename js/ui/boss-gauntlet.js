/**
 * js/ui/boss-gauntlet.js
 * Manages the "Legendary Gauntlet" (Boss Mode).
 * Allows players to refight defeated bosses at adaptive level for stress testing.
 */
const BossGauntlet = {
    isOpen: false,

    init() {
        this.updateButtonVisibility();
    },

    updateButtonVisibility() {
        const btn = document.getElementById('gauntlet-btn');
        if (!btn) return;

        // DEBUG: Force button visibility for testing
        btn.style.display = 'flex';

        if (window.LogDebug) window.LogDebug(`[Gauntlet] Mode unlocked for testing`, 'passive');
    },

    // Definitive list of Story Bosses (Arc Guardians)
    getBossIds() {
        return [
            "void_knight", "abomination", "dragon", "fallen_angel",
            "void_warden", "shadow_titan", "shadow_emperor", "kraken",
            "demon_lord", "dark_phoenix"
        ];
    },

    getDefeatedBosses() {
        if (!window.ENEMIES_DATA) return [];
        const bossIds = this.getBossIds();

        // Return only the true Story Bosses found in the data
        return window.ENEMIES_DATA.filter(e => bossIds.includes(e.id));
    },

    open() {
        const overlay = document.getElementById('gauntlet-overlay');
        const grid = document.getElementById('gauntlet-grid');
        if (!overlay || !grid) return;

        overlay.style.display = 'flex';
        this.isOpen = true;

        // If no party is active, show the Save Picker
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
            card.style.cursor = 'pointer';

            if (s.empty) {
                card.innerHTML = `
                    <div class="gc-body">
                        <div class="gc-name">SLOT ${s.slot + 1}</div>
                        <div class="gc-subtitle">Empty Slot</div>
                    </div>
                `;
                card.style.opacity = '0.5';
                card.style.pointerEvents = 'none';
            } else {
                const date = Save.dateStr(s.timestamp);
                const lv = s.partyStats?.[0]?.lv || s.heroLv || '?';

                card.innerHTML = `
                    <div class="gc-header">
                        <span class="gc-tier">LV ${lv}</span>
                    </div>
                    <div class="gc-body">
                        <div class="gc-name">SLOT ${s.slot + 1}</div>
                        <div class="gc-subtitle">${s.arcName || 'Story Progress'}</div>
                        <div class="gc-stat" style="margin-top:10px">${date}</div>
                    </div>
                    <div class="gc-footer">
                        <button class="gc-fight-btn">LOAD SAVE</button>
                    </div>
                `;
                card.onclick = () => {
                    this.loadSaveData(s.slot);
                };
            }
            grid.appendChild(card);
        });
    },

    loadSaveData(slot) {
        const s = Save.read(slot);
        if (!s) return;

        // Perform "Silent Hydration" of the global game state
        G.selectedChar = s.selectedChar || (G.chars[0] && G.chars[0].id);
        G.selectedClass = s.selectedClass || (G.classes[0] && G.classes[0].id);

        if (s.selectedChars && s.selectedChars.length) {
            G.selectedChars = s.selectedChars;
        } else {
            const heroId_ = G.selectedChar;
            G.selectedChars = [heroId_, ...G.chars.map(c => c.id).filter(id => id !== heroId_)].slice(0, 4);
        }

        // Build the combat-ready party object
        if (typeof buildParty === 'function') {
            buildParty();
        }

        // Apply saved stats (HP, MP, LV, etc.) to both active party AND base characters
        if (s.partyStats && s.partyStats.length) {
            s.partyStats.forEach(saved => {
                // 1. Sync the active combat member in G.party
                const member = G.party?.find(m => m.charId === saved.charId);
                if (member) {
                    member.lv = saved.lv || 1;
                    member.exp = saved.exp || 0;
                    member.gold = saved.gold || 0;

                    // Sync level to char FIRST so computeStats uses the correct level
                    if (member.char) member.char.lv = saved.lv || 1;

                    // Recompute stats fresh from source so saved combat stats never inflate values
                    if (member.char && member.cls) {
                        const fresh = computeStats(member.char, member.cls);
                        const relicMult = typeof _getRelicStatMult === 'function' ? _getRelicStatMult() : { hp:1, mp:1, atk:1, def:1, spd:1, mag:1, lck:1 };
                        member.maxHp = Math.floor(fresh.hp * relicMult.hp);
                        member.maxMp = Math.floor(fresh.mp * relicMult.mp);
                        member.atk   = Math.floor(fresh.atk * relicMult.atk);
                        member.def   = Math.floor(fresh.def * relicMult.def);
                        member.mag   = Math.floor(fresh.mag * relicMult.mag);
                        member.spd   = Math.floor(fresh.spd * relicMult.spd);
                        member.lck   = Math.floor(fresh.lck * relicMult.lck);
                    }

                    // Re-apply Archive mastery flat buffs
                    if (typeof Archive !== 'undefined') {
                      const mastery = Archive.getMasteryBuffs();
                      member.atk += mastery.atk || 0;
                      member.def += mastery.def || 0;
                      member.mag += mastery.mag || 0;
                      member.spd += mastery.spd || 0;
                      member.lck += mastery.lck || 0;
                    }

                    // FORCE FULL RESTORATION FOR GAUNTLET MODE
                    member.hp = member.maxHp;
                    member.mp = member.maxMp;
                    member.isKO = false;
                    member.statuses = [];
                }

                // 2. Sync the base character definition in G.chars (prevents reset if party is rebuilt)
                const char = G.chars?.find(c => c.id === saved.charId);
                if (char) {
                    char.lv = saved.lv || 1;
                    char.exp = saved.exp || 0;
                    char.hp = saved.hp;
                    char.mp = saved.mp;
                }
            });
        }

        // Ensure global references are set for the combat engine
        G.hero = G.party?.[0];
        if (s.inventory) G.inventory = s.inventory;
        if (s.activeRelics) G.activeRelics = s.activeRelics;
        if (s.ownedRelics) G.ownedRelics = s.ownedRelics;

        // Tag story as temporarily active so turn-based engine logic is valid
        if (typeof Story !== 'undefined') Story.active = true;

        if (window.LogDebug) window.LogDebug(`[Gauntlet] Party synced from Slot ${slot + 1} (LV ${G.party?.[0]?.lv || 1})`, 'regen');

        // Refresh UI to show the Boss List now that we have a party
        this.renderBossList();
    },

    renderBossList() {
        const grid = document.getElementById('gauntlet-grid');
        if (!grid) return;

        grid.innerHTML = '';
        const allBossIds = this.getBossIds();

        // Ensure we handle both cases where ENEMIES_DATA is global or localized
        const data = window.ENEMIES_DATA || (typeof G !== 'undefined' ? G.enemies : []);
        const bosses = data.filter(e => allBossIds.includes(e.id));

        if (bosses.length === 0) {
            grid.innerHTML = '<div class="gauntlet-empty">Loading Boss Data...<br><span style="font-size:12px;color:#666">If this persists, ensuring enemies.json is loaded</span></div>';
            // Retry once if data was empty
            setTimeout(() => this.renderBossList(), 500);
        } else {
            bosses.forEach(boss => {
                const card = this.createBossCard(boss);
                grid.appendChild(card);
            });
        }
    },

    close() {
        const overlay = document.getElementById('gauntlet-overlay');
        if (overlay) overlay.style.display = 'none';
        this.isOpen = false;

        if (typeof SFX !== 'undefined' && typeof SFX.click === 'function') SFX.click();
    },

    createBossCard(boss) {
        const card = document.createElement('div');
        card.className = `gauntlet-card element-${boss.element || 'neutral'}`;

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

        // Render sprite
        const cont = card.querySelector(`#gspr-cont-${boss.id}`);
        const spr = document.createElement('img');
        spr.className = 'gauntlet-sprite';
        if (typeof SpriteRenderer !== 'undefined') {
            SpriteRenderer.drawEnemy(spr, boss.id, boss.palette);
        }
        cont.appendChild(spr);

        // Make both the button AND the entire card (including sprite) clickable
        const triggerStart = (e) => {
            e.stopPropagation();
            this.start(boss.id);
        };

        card.querySelector('.gc-fight-btn').onclick = triggerStart;
        card.querySelector('.gc-body').onclick = triggerStart;
        card.querySelector('.gc-body').style.cursor = 'pointer';
        card.style.cursor = 'pointer';

        return card;
    },

    start(bossId) {
        if (window.LogDebug) window.LogDebug(`[Gauntlet] Starting stress test against: ${bossId}`, 'fight');

        const bossDef = window.ENEMIES_DATA.find(e => e.id === bossId);
        if (!bossDef) return;

        this.close();

        // Ensure Story mode is active so win/loss logic works correctly
        if (typeof Story !== 'undefined') Story.active = true;

        // 0. RESTORE PARTY TO FULL HEALTH (Quality of Life)
        if (G.party) {
            G.party.forEach(m => {
                m.hp = m.maxHp;
                m.mp = m.maxMp;
                m.isKO = false;
                m.statuses = [];
                // Sync to base character definition
                const ch = G.chars.find(c => c.id === m.charId);
                if (ch) { ch.hp = m.hp; ch.mp = m.mp; ch.isKO = false; }
            });
        }

        // 1. Set Gauntlet Mode flag
        G.isGauntletMode = true;

        // 2. Build Enemy Group (Force player level + Boss multiplier)
        const playerLv = (G.party && G.party[0]) ? G.party[0].lv : 1;
        buildEnemyGroup([bossDef], playerLv, true);

        // 2b. Synchronize global references for the Turn Engine
        G.enemies = G.enemyGroup;
        G.targetEnemyIdx = 0;

        // 3. Launch Battle
        if (typeof _initBattle === 'function') {
            _initBattle();
        }

        // 4. KICKSTART TURN ENGINE (Critical fix for "A")
        if (typeof processCurrentTurn === 'function') {
            processCurrentTurn();
        }
    }
};

// Global hook for Save/Load
window.addEventListener('saveLoaded', () => {
    BossGauntlet.updateButtonVisibility();
    if (BossGauntlet.isOpen) BossGauntlet.open();
});

setTimeout(() => BossGauntlet.init(), 1000);
