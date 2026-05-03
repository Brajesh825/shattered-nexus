/**
 * js/ui/world-explorer.js
 * Developer tool for instant map testing and region exploration.
 * Revealed only via ?dev=true or ?debug=true URL parameters.
 */
const WorldExplorer = {
    isOpen: false,

    init() {
        this.updateButtonVisibility();
    },

    updateButtonVisibility() {
        const btn = document.getElementById('explore-btn');
        if (!btn) return;

        const urlParams = new URLSearchParams(window.location.search);
        const isDebug = urlParams.get('debug') === 'true' || urlParams.get('dev') === 'true';

        btn.style.display = isDebug ? 'flex' : 'none';
        if (isDebug && window.LogDebug) window.LogDebug(`[Explorer] Dev Mode active. Access granted to all regions.`, 'passive');
    },

    open() {
        const overlay = document.getElementById('explorer-overlay');
        const grid = document.getElementById('explorer-grid');
        if (!overlay || !grid) return;

        overlay.style.display = 'flex';
        this.isOpen = true;

        this.renderMapList();
        if (typeof SFX !== 'undefined' && typeof SFX.click === 'function') SFX.click();
    },

    close() {
        const overlay = document.getElementById('explorer-overlay');
        if (overlay) overlay.style.display = 'none';
        this.isOpen = false;
        if (typeof SFX !== 'undefined' && typeof SFX.click === 'function') SFX.click();
    },

    renderMapList() {
        const grid = document.getElementById('explorer-grid');
        if (!grid) return;

        grid.innerHTML = '';
        
        // MAP_PLACES is defined in js/story.js
        const places = (typeof MAP_PLACES !== 'undefined') ? MAP_PLACES : [];

        if (places.length === 0) {
            grid.innerHTML = '<div class="gauntlet-empty">No Map Data Found</div>';
            return;
        }

        places.forEach((place, idx) => {
            const card = this.createMapCard(place, idx);
            grid.appendChild(card);
        });
    },

    createMapCard(place, idx) {
        const card = document.createElement('div');
        const mapId = place.label.toLowerCase().replace(/ /g, '_');
        const isSide = place.arcIdx === undefined;
        
        card.className = `gauntlet-card ${isSide ? 'side-region' : 'story-region'}`;
        card.style.borderLeft = `4px solid ${place.color || 'var(--cyan)'}`;

        card.innerHTML = `
            <div class="gc-header">
                <span class="gc-tier">${isSide ? 'SIDE' : 'STORY'}</span>
                <span class="gc-element">${place.label.split(' ')[0].toUpperCase()}</span>
            </div>
            <div class="gc-body">
                <div class="gc-name">${place.label}</div>
                <div class="gc-subtitle">${isSide ? 'Optional Challenge' : 'Arc ' + (place.arcIdx + 1)}</div>
                <div class="gc-stat" style="font-size:10px; margin-top:5px; color:#888">ID: ${mapId}</div>
            </div>
            <div class="gc-footer">
                <button class="gc-fight-btn">DEVIATE</button>
            </div>
        `;

        card.onclick = () => this.start(mapId);
        card.style.cursor = 'pointer';

        return card;
    },

    start(mapId) {
        if (typeof MAP_DEFS === 'undefined' || !MAP_DEFS[mapId]) {
            alert(`Map ID "${mapId}" not found in MAP_DEFS!`);
            return;
        }

        this.close();

        // 1. Ensure a party exists for walking
        if (!G.party || G.party.length === 0) {
            // Quick hydration for dev testing
            G.selectedChars = G.chars.slice(0, 4).map(c => c.id);
            G.selectedChar = G.selectedChars[0];
            if (typeof buildParty === 'function') buildParty();
            
            // Set default level 30 for testing side maps
            G.party.forEach(m => {
                m.lv = 30;
                if (m.char) m.char.lv = 30;
                if (typeof rebuildMemberCombatStats === 'function') {
                    rebuildMemberCombatStats(m, { resourceStrategy: 'full' });
                }
            });
        }

        // 2. Launch the map
        if (typeof startExplore === 'function') {
            startExplore(true);
        }
        
        if (typeof MapEngine !== 'undefined') {
            MapEngine.start(mapId);
            if (typeof MapUI !== 'undefined') MapUI.showMsg(`Dev-Jumping to ${MAP_DEFS[mapId].name}...`, 2000);
        }
    }
};

// Auto-init
setTimeout(() => WorldExplorer.init(), 1200);
