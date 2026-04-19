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
            "void_knight", "demon_lord", "dark_phoenix", "kraken", 
            "fallen_angel", "void_warden", "shadow_titan", "shadow_emperor"
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

        grid.innerHTML = '';
        const bosses = this.getDefeatedBosses();

        if (bosses.length === 0) {
            grid.innerHTML = '<div class="gauntlet-empty">No legendary foes defeated yet.</div>';
        } else {
            bosses.forEach(boss => {
                const card = this.createBossCard(boss);
                grid.appendChild(card);
            });
        }

        overlay.style.display = 'flex';
        this.isOpen = true;
        
        if (typeof SFX !== 'undefined') SFX.play('menu_open');
    },

    close() {
        const overlay = document.getElementById('gauntlet-overlay');
        if (overlay) overlay.style.display = 'none';
        this.isOpen = false;
        
        if (typeof SFX !== 'undefined') SFX.play('menu_close');
    },

    createBossCard(boss) {
        const card = document.createElement('div');
        card.className = `gauntlet-card element-${boss.element || 'neutral'}`;
        
        const kills = Archive.getEntry(boss.id)?.kills || 0;
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

        card.querySelector('.gc-fight-btn').onclick = () => this.start(boss.id);

        return card;
    },

    start(bossId) {
        if (window.LogDebug) window.LogDebug(`[Gauntlet] Starting stress test against: ${bossId}`, 'fight');
        
        const bossDef = window.ENEMIES_DATA.find(e => e.id === bossId);
        if (!bossDef) return;

        this.close();

        // 1. Set Gauntlet Mode flag
        G.isGauntletMode = true;

        // 2. Build Enemy Group (Force player level + Boss multiplier)
        const playerLv = (G.party && G.party[0]) ? G.party[0].lv : 1;
        buildEnemyGroup([bossDef], playerLv, true);

        // 3. Launch Battle
        if (typeof _initBattle === 'function') {
            _initBattle();
        } else if (window.Battle) {
            // Fallback for newer modular engine if present
            Battle.start();
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
});

// Auto-init fallback
setTimeout(() => BossGauntlet.init(), 1000);
