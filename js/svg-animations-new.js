// New SVG Animations for 16 New Moves (Rydia, Lenneth, Kain, Leon)

const NewSVGAnimations = {
  /* ════════════════════════════════════════════════════════════════════════
     RYDIA (SUMMONER) - 4 Moves
  ════════════════════════════════════════════════════════════════════════ */

  // Summon Bahamut - Dragon king descends with fire
  'summon_bahamut': { duration: 2400, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes sb-dragon-descend { 0% { transform: translateY(-100px) scale(0.3); opacity: 0; } 20% { opacity: 1; } 70% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(20px) scale(0.95); opacity: 0.6; } }
      @keyframes sb-fire-ring { 0% { r: 8; opacity: 1; stroke-width: 4; } 100% { r: 90; opacity: 0; stroke-width: 0.3; } }
      @keyframes sb-flame-burst { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--fx), var(--fy)) scale(0); opacity: 0; } }
      @keyframes sb-glow-pulse { 0%, 100% { filter: drop-shadow(0 0 2px #ff6600); } 50% { filter: drop-shadow(0 0 8px #ff3300); } }
    </style></defs><defs><filter id="sb-glow"><feGaussianBlur stdDeviation="5"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="sb-fire"><stop offset="0%" stop-color="#ffff00"/><stop offset="50%" stop-color="#ff6600"/><stop offset="100%" stop-color="#cc0000" stop-opacity="0"/></radialGradient></defs><!-- dragon body --><g style="animation: sb-dragon-descend 2400ms cubic-bezier(0.1,0.6,0.2,1) forwards; transform-origin: 100px 100px;"><ellipse cx="100" cy="60" rx="22" ry="28" fill="#8B4513" filter="url(#sb-glow)"/><!-- dragon head --><circle cx="100" cy="35" r="12" fill="#A0522D"/><!-- eyes --><circle cx="96" cy="32" r="2" fill="#ffff00"/><circle cx="104" cy="32" r="2" fill="#ffff00"/><!-- horns --><polygon points="92,25 88,10 90,24" fill="#8B4513"/><polygon points="108,25 112,10 110,24" fill="#8B4513"/><!-- wings --><ellipse cx="75" cy="60" rx="8" ry="18" fill="#A0522D" opacity="0.8"/><ellipse cx="125" cy="60" rx="8" ry="18" fill="#A0522D" opacity="0.8"/><!-- tail --><path d="M 100 85 Q 130 90 140 70" stroke="#8B4513" stroke-width="6" fill="none"/><!-- fire aura --><circle cx="100" cy="60" r="30" fill="url(#sb-fire)" opacity="0.5"/></g><!-- fire rings expanding --><circle cx="100" cy="100" r="8" fill="none" stroke="#ff6600" stroke-width="4" style="animation: sb-fire-ring 2400ms ease-out forwards 600ms;"/><circle cx="100" cy="100" r="8" fill="none" stroke="#ff3300" stroke-width="3" style="animation: sb-fire-ring 2400ms ease-out forwards 900ms;"/><circle cx="100" cy="100" r="8" fill="none" stroke="#ffaa00" stroke-width="2" style="animation: sb-fire-ring 2400ms ease-out forwards 1200ms;"/><!-- fire bursts --><circle cx="100" cy="100" r="4" fill="#ffff00" filter="url(#sb-glow)" style="--fx:-40px; --fy:-50px; animation: sb-flame-burst 2400ms ease-out forwards 800ms;"/><circle cx="100" cy="100" r="3.5" fill="#ff6600" style="--fx:45px; --fy:-45px; animation: sb-flame-burst 2400ms ease-out forwards 850ms;"/><circle cx="100" cy="100" r="3" fill="#ff3300" style="--fx:-50px; --fy:45px; animation: sb-flame-burst 2400ms ease-out forwards 900ms;"/><circle cx="100" cy="100" r="3" fill="#ffaa00" style="--fx:50px; --fy:50px; animation: sb-flame-burst 2400ms ease-out forwards 950ms;"/>`;
    return s;
  }},

  // Summon Syldra - Water serpent rises
  'summon_syldra': { duration: 2200, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes ss-serpent-rise { 0% { transform: translateY(80px) scaleY(0.5); opacity: 0; } 15% { opacity: 1; } 75% { transform: translateY(-50px) scaleY(1); opacity: 1; } 100% { transform: translateY(-70px) scaleY(0.9); opacity: 0; } }
      @keyframes ss-water-wave { 0% { r: 5; opacity: 0; } 30% { r: 5; opacity: 1; } 100% { r: 70; opacity: 0; stroke-width: 0.3; } }
      @keyframes ss-bubble-float { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-80px) scale(0.2); opacity: 0; } }
      @keyframes ss-glow-shine { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.9; } }
    </style></defs><defs><filter id="ss-glow"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="ss-water" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00ffff" stop-opacity="0.9"/><stop offset="50%" stop-color="#0099ff" stop-opacity="0.6"/><stop offset="100%" stop-color="#003399" stop-opacity="0"/></linearGradient></defs><!-- serpent body coiled --><g style="animation: ss-serpent-rise 2200ms cubic-bezier(0.2,0.8,0.3,1) forwards;"><circle cx="100" cy="130" r="10" fill="url(#ss-water)" filter="url(#ss-glow)"/><!-- coils --><path d="M 90 130 Q 85 110 90 90 Q 95 70 100 50" stroke="url(#ss-water)" stroke-width="12" fill="none" stroke-linecap="round"/><!-- serpent head --><circle cx="100" cy="40" r="8" fill="#00ccff"/><!-- eyes --><circle cx="96" cy="38" r="2" fill="#ffffff"/><circle cx="104" cy="38" r="2" fill="#ffffff"/><!-- mouth --><line x1="100" y1="46" x2="100" y2="50" stroke="#ffffff" stroke-width="1"/><!-- fins/spines --><polygon points="108,60 115,55 110,70" fill="#0099ff" opacity="0.7"/><polygon points="92,70 85,65 90,80" fill="#0099ff" opacity="0.7"/></g><!-- water rings --><circle cx="100" cy="120" r="5" fill="none" stroke="#00ffff" stroke-width="3" style="animation: ss-water-wave 2200ms ease-out forwards 600ms;"/><circle cx="100" cy="120" r="5" fill="none" stroke="#0099ff" stroke-width="2" style="animation: ss-water-wave 2200ms ease-out forwards 900ms;"/><circle cx="100" cy="120" r="5" fill="none" stroke="#00ccff" stroke-width="1.5" style="animation: ss-water-wave 2200ms ease-out forwards 1200ms;"/><!-- rising bubbles --><circle cx="85" cy="100" r="3" fill="#00ffff" filter="url(#ss-glow)" style="animation: ss-bubble-float 2200ms ease-out forwards 400ms;"/><circle cx="115" cy="105" r="2.5" fill="#0099ff" style="animation: ss-bubble-float 2200ms ease-out forwards 600ms;"/><circle cx="100" cy="110" r="2" fill="#00ccff" style="animation: ss-bubble-float 2200ms ease-out forwards 800ms;"/><!-- glow aura --><circle cx="100" cy="100" r="35" fill="#00ffff" fill-opacity="0.15" style="animation: ss-glow-shine 2200ms ease-in-out infinite;"/>`;
    return s;
  }},

  // Eidolon Channel - Magical energy channeling
  'eidolon_channel': { duration: 2100, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes ec-rune-orbit { 0% { transform: rotate(0deg) translateX(35px); opacity: 0; } 15% { opacity: 1; } 100% { transform: rotate(360deg) translateX(35px); opacity: 0.3; } }
      @keyframes ec-glow-pulse { 0%, 100% { r: 20; opacity: 0.3; } 50% { r: 30; opacity: 0.7; } }
      @keyframes ec-energy-vortex { 0% { transform: rotate(0deg) scale(1); opacity: 1; } 100% { transform: rotate(360deg) scale(0.7); opacity: 0; } }
      @keyframes ec-charge-spark { 0% { transform: translate(0,0); opacity: 0.8; } 100% { transform: translate(var(--sx), var(--sy)); opacity: 0; } }
    </style></defs><defs><filter id="ec-glow"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><!-- center orb --><circle cx="100" cy="100" r="15" fill="#b366ff" filter="url(#ec-glow)"/><!-- rune 1 --><g style="transform-origin: 100px 100px; animation: ec-rune-orbit 2100ms ease-in-out forwards;"><rect x="128" y="96" width="6" height="8" fill="#9933ff" transform="rotate(45 131 100)" filter="url(#ec-glow)"/></g><!-- rune 2 --><g style="transform-origin: 100px 100px; animation: ec-rune-orbit 2100ms ease-in-out forwards 350ms;"><rect x="128" y="96" width="6" height="8" fill="#cc66ff" transform="rotate(45 131 100)" filter="url(#ec-glow)"/></g><!-- rune 3 --><g style="transform-origin: 100px 100px; animation: ec-rune-orbit 2100ms ease-in-out forwards 700ms;"><rect x="128" y="96" width="6" height="8" fill="#9933ff" transform="rotate(45 131 100)" filter="url(#ec-glow)"/></g><!-- glow pulse --><circle cx="100" cy="100" r="20" fill="none" stroke="#cc66ff" stroke-width="1" style="animation: ec-glow-pulse 2100ms ease-in-out infinite;"/><!-- energy vortex rings --><circle cx="100" cy="100" r="25" fill="none" stroke="#b366ff" stroke-width="0.5" style="animation: ec-energy-vortex 2100ms ease-out forwards;"/><circle cx="100" cy="100" r="25" fill="none" stroke="#9933ff" stroke-width="0.5" style="animation: ec-energy-vortex 2100ms ease-out forwards 500ms;"/><circle cx="100" cy="100" r="25" fill="none" stroke="#cc66ff" stroke-width="0.5" style="animation: ec-energy-vortex 2100ms ease-out forwards 1000ms;"/><!-- sparks flying out --><circle cx="100" cy="100" r="2" fill="#ffff99" filter="url(#ec-glow)" style="--sx:-50px; --sy:-30px; animation: ec-charge-spark 2100ms ease-out forwards 600ms;"/><circle cx="100" cy="100" r="2" fill="#ffff99" style="--sx:50px; --sy:-30px; animation: ec-charge-spark 2100ms ease-out forwards 800ms;"/><circle cx="100" cy="100" r="1.5" fill="#ffccff" style="--sx:-40px; --sy:40px; animation: ec-charge-spark 2100ms ease-out forwards 1000ms;"/><circle cx="100" cy="100" r="1.5" fill="#ffccff" style="--sx:40px; --sy:40px; animation: ec-charge-spark 2100ms ease-out forwards 1200ms;"/>`;
    return s;
  }},

  // Absolute Summon - Ultimate phantom guardian
  'absolute_summon': { duration: 2700, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes as-phantom-rise { 0% { transform: translateY(60px) scale(0); opacity: 0; } 20% { opacity: 1; } 75% { transform: translateY(-40px) scale(1); opacity: 0.8; } 100% { transform: translateY(-50px) scale(0.9); opacity: 0; } }
      @keyframes as-aura-expand { 0% { r: 10; opacity: 1; stroke-width: 3; } 100% { r: 95; opacity: 0; stroke-width: 0.2; } }
      @keyframes as-shimmer { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
      @keyframes as-cosmic-swirl { 0% { transform: rotate(0deg); } 100% { transform: rotate(720deg); } }
    </style></defs><defs><filter id="as-glow"><feGaussianBlur stdDeviation="6"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="as-cosmic"><stop offset="0%" stop-color="#ffff99"/><stop offset="50%" stop-color="#cc66ff"/><stop offset="100%" stop-color="#3300ff" stop-opacity="0"/></radialGradient></defs><!-- phantom form --><g style="animation: as-phantom-rise 2700ms cubic-bezier(0.1,0.6,0.2,1) forwards;"><ellipse cx="100" cy="80" rx="18" ry="32" fill="#cc99ff" fill-opacity="0.7" filter="url(#as-glow)"/><!-- phantom face --><circle cx="100" cy="65" r="10" fill="#9966ff" opacity="0.8"/><!-- eyes glowing --><circle cx="95" cy="62" r="2.5" fill="#ffff99" filter="url(#as-glow)"/><circle cx="105" cy="62" r="2.5" fill="#ffff99" filter="url(#as-glow)"/><!-- ethereal body --><ellipse cx="100" cy="95" rx="14" ry="18" fill="#cc66ff" opacity="0.6"/><!-- arms --><line x1="88" y1="90" x2="75" y2="95" stroke="#9966ff" stroke-width="3" opacity="0.6"/><line x1="112" y1="90" x2="125" y2="95" stroke="#9966ff" stroke-width="3" opacity="0.6"/><!-- cosmic aura --><circle cx="100" cy="80" r="30" fill="url(#as-cosmic)" opacity="0.4"/></g><!-- expanding aura rings --><circle cx="100" cy="100" r="10" fill="none" stroke="#ffff99" stroke-width="3" style="animation: as-aura-expand 2700ms ease-out forwards 400ms;"/><circle cx="100" cy="100" r="10" fill="none" stroke="#cc66ff" stroke-width="2" style="animation: as-aura-expand 2700ms ease-out forwards 700ms;"/><circle cx="100" cy="100" r="10" fill="none" stroke="#9966ff" stroke-width="1.5" style="animation: as-aura-expand 2700ms ease-out forwards 1000ms;"/><circle cx="100" cy="100" r="10" fill="none" stroke="#3300ff" stroke-width="1" style="animation: as-aura-expand 2700ms ease-out forwards 1300ms;"/><!-- cosmic vortex --><circle cx="100" cy="100" r="45" fill="none" stroke="url(#as-cosmic)" stroke-width="0.5" style="animation: as-cosmic-swirl 2700ms linear forwards 500ms;"/><circle cx="100" cy="100" r="35" fill="none" stroke="url(#as-cosmic)" stroke-width="0.3" style="animation: as-cosmic-swirl 2700ms linear reverse forwards 600ms;"/><!-- shimmer overlay --><circle cx="100" cy="100" r="40" fill="#ffff99" opacity="0.1" style="animation: as-shimmer 2700ms ease-in-out infinite;"/>`;
    return s;
  }},

  /* ════════════════════════════════════════════════════════════════════════
     LENNETH (VALKYRIE) - 4 Moves
  ════════════════════════════════════════════════════════════════════════ */

  // Valkyrie Strike - Holy sword slash
  'valkyrie_strike': { duration: 1800, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes vs-slash { 0% { transform: rotate(-45deg) translateX(-80px); opacity: 0; } 10% { opacity: 1; } 70% { transform: rotate(45deg) translateX(80px); opacity: 0.8; } 100% { opacity: 0; } }
      @keyframes vs-holy-glow { 0% { filter: drop-shadow(0 0 2px #ffffff); } 50% { filter: drop-shadow(0 0 8px #ffff99); } 100% { filter: drop-shadow(0 0 2px #ffffff); } }
      @keyframes vs-light-spark { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--lx), var(--ly)) scale(0); opacity: 0; } }
      @keyframes vs-holy-ring { 0% { r: 4; opacity: 0; } 40% { r: 4; opacity: 1; } 100% { r: 60; opacity: 0; } }
    </style></defs><defs><filter id="vs-glow"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="vs-sword" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#ffff99"/><stop offset="100%" stop-color="#ffff00"/></linearGradient></defs><!-- sword blade --><rect x="97" y="20" width="6" height="100" fill="url(#vs-sword)" filter="url(#vs-glow)" style="animation: vs-slash 1800ms cubic-bezier(0.2,0.8,0.2,1) forwards;"/><!-- sword glow --><rect x="94" y="20" width="12" height="100" fill="#ffff99" fill-opacity="0.2" style="animation: vs-slash 1800ms cubic-bezier(0.2,0.8,0.2,1) forwards;"/><!-- sword tip --><polygon points="100,15 96,28 104,28" fill="#ffff00" filter="url(#vs-glow)" style="animation: vs-slash 1800ms cubic-bezier(0.2,0.8,0.2,1) forwards;"/><!-- light sparks --><circle cx="100" cy="100" r="2" fill="#ffff99" filter="url(#vs-glow)" style="--lx:-40px; --ly:-40px; animation: vs-light-spark 1800ms ease-out forwards 200ms;"/><circle cx="100" cy="100" r="1.5" fill="#ffff00" style="--lx:40px; --ly:-40px; animation: vs-light-spark 1800ms ease-out forwards 350ms;"/><circle cx="100" cy="100" r="1.5" fill="#ffff99" style="--lx:-35px; --ly:45px; animation: vs-light-spark 1800ms ease-out forwards 500ms;"/><circle cx="100" cy="100" r="2" fill="#ffff00" style="--lx:35px; --ly:45px; animation: vs-light-spark 1800ms ease-out forwards 650ms;"/><!-- impact ring --><circle cx="100" cy="120" r="4" fill="none" stroke="#ffff99" stroke-width="2" style="animation: vs-holy-ring 1800ms ease-out forwards 700ms;"/>`;
    return s;
  }},

  // Judgment Seal - Divine debuff
  'judgment_seal': { duration: 2200, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes js-seal-form { 0% { transform: scale(0) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 70% { transform: scale(1) rotate(360deg); opacity: 1; } 100% { opacity: 0.5; } }
      @keyframes js-chain-appear { 0% { stroke-dashoffset: 200; opacity: 0; } 20% { opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0.8; } }
      @keyframes js-chains-bind { 0% { transform: translate(0,0); } 100% { transform: translate(var(--cx), var(--cy)); } }
      @keyframes js-debuff-text { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-40px) scale(1); opacity: 0; } }
    </style></defs><defs><filter id="js-glow"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><!-- seal circle outer --><circle cx="100" cy="100" r="35" fill="none" stroke="#aa0099" stroke-width="2" style="animation: js-seal-form 2200ms ease-out forwards;"/><!-- seal circle inner --><circle cx="100" cy="100" r="25" fill="none" stroke="#ff0099" stroke-width="1.5" style="animation: js-seal-form 2200ms ease-out forwards 150ms;"/><!-- seal rune --><circle cx="100" cy="100" r="15" fill="#dd0088" fill-opacity="0.3" filter="url(#js-glow)" style="animation: js-seal-form 2200ms ease-out forwards 300ms;"/><!-- binding chains --><path d="M 65 100 Q 85 95 100 95" stroke="#ff0099" stroke-width="1.5" stroke-dasharray="50" stroke-dashoffset="50" style="animation: js-chain-appear 2200ms ease-out forwards 500ms;"/><path d="M 135 100 Q 115 95 100 95" stroke="#aa0099" stroke-width="1.5" stroke-dasharray="50" stroke-dashoffset="50" style="animation: js-chain-appear 2200ms ease-out forwards 600ms;"/><!-- debuff indicators --><circle cx="60" cy="100" r="3" fill="#ff0099" filter="url(#js-glow)" style="--cx:-50px; --cy:0px; animation: js-chains-bind 2200ms ease-out forwards 700ms;"/><circle cx="140" cy="100" r="3" fill="#aa0099" style="--cx:50px; --cy:0px; animation: js-chains-bind 2200ms ease-out forwards 750ms;"/><!-- text indicators --><text x="100" y="80" text-anchor="middle" fill="#ff0099" font-size="7" font-family="monospace" font-weight="bold" style="animation: js-debuff-text 2200ms ease-out forwards 900ms;">ATK-30%</text><text x="100" y="120" text-anchor="middle" fill="#aa0099" font-size="7" font-family="monospace" font-weight="bold" style="animation: js-debuff-text 2200ms ease-out forwards 1100ms;">DEF-20%</text>`;
    return s;
  }},

  // Transcendent Power - Divine blessing
  'transcendent_power': { duration: 2300, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes tp-wings-spread { 0% { transform: scaleX(0); opacity: 0; } 15% { opacity: 1; } 80% { transform: scaleX(1); opacity: 1; } 100% { opacity: 0.4; } }
      @keyframes tp-halo-glow { 0%, 100% { r: 30; opacity: 0.2; } 50% { r: 40; opacity: 0.6; } }
      @keyframes tp-light-ascend { 0% { transform: translateY(30px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-60px); opacity: 0; } }
      @keyframes tp-blessing-rain { 0% { transform: translateY(-50px); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(60px); opacity: 0; } }
    </style></defs><defs><filter id="tp-glow"><feGaussianBlur stdDeviation="5"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="tp-wings" x1="0%" y1="50%" x2="100%" y2="50%"><stop offset="0%" stop-color="#ffff00" stop-opacity="0"/><stop offset="50%" stop-color="#ffff99"/><stop offset="100%" stop-color="#ffff00" stop-opacity="0"/></linearGradient></defs><!-- center orb --><circle cx="100" cy="100" r="12" fill="#ffff99" filter="url(#tp-glow)"/><!-- wings --><ellipse cx="70" cy="100" rx="20" ry="35" fill="url(#tp-wings)" style="animation: tp-wings-spread 2300ms ease-out forwards;"/><ellipse cx="130" cy="100" rx="20" ry="35" fill="url(#tp-wings)" style="animation: tp-wings-spread 2300ms ease-out forwards 150ms;"/><!-- halo --><circle cx="100" cy="100" r="30" fill="none" stroke="#ffff99" stroke-width="1" style="animation: tp-halo-glow 2300ms ease-in-out infinite;"/><!-- light beams --><line x1="100" y1="30" x2="100" y2="70" stroke="#ffff99" stroke-width="1" opacity="0.6" style="animation: tp-light-ascend 2300ms ease-out forwards 400ms;"/><line x1="130" y1="50" x2="120" y2="85" stroke="#ffff00" stroke-width="0.8" opacity="0.6" style="animation: tp-light-ascend 2300ms ease-out forwards 550ms;"/><line x1="70" y1="50" x2="80" y2="85" stroke="#ffff00" stroke-width="0.8" opacity="0.6" style="animation: tp-light-ascend 2300ms ease-out forwards 700ms;"/><!-- blessing particles falling --><circle cx="80" cy="50" r="2" fill="#ffff99" filter="url(#tp-glow)" style="animation: tp-blessing-rain 2300ms ease-in forwards 500ms;"/><circle cx="100" cy="45" r="1.5" fill="#ffff99" style="animation: tp-blessing-rain 2300ms ease-in forwards 700ms;"/><circle cx="120" cy="50" r="1.5" fill="#ffff00" style="animation: tp-blessing-rain 2300ms ease-in forwards 900ms;"/>`;
    return s;
  }},

  // Divine Execution - Ultimate judgment
  'divine_execution': { duration: 2600, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes de-sword-drop { 0% { transform: translateY(-100px) scaleY(0.5); opacity: 0; } 20% { opacity: 1; } 70% { transform: translateY(0) scaleY(1); opacity: 1; } 100% { transform: translateY(40px) scaleY(0.9); opacity: 0.3; } }
      @keyframes de-judgment-ring { 0% { r: 5; opacity: 1; stroke-width: 4; } 100% { r: 95; opacity: 0; stroke-width: 0.2; } }
      @keyframes de-light-burst { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--bx), var(--by)) scale(0); opacity: 0; } }
      @keyframes de-stun-indicator { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-50px) rotate(180deg); opacity: 0; } }
    </style></defs><defs><filter id="de-glow"><feGaussianBlur stdDeviation="6"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="de-sword" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffff99"/><stop offset="50%" stop-color="#ffff00"/><stop offset="100%" stop-color="#ddaa00"/></linearGradient></defs><!-- judgment sword falling --><g style="animation: de-sword-drop 2600ms cubic-bezier(0.2,0.8,0.3,1) forwards;"><rect x="97" y="20" width="6" height="100" fill="url(#de-sword)" filter="url(#de-glow)"/><!-- sword hilt --><rect x="90" y="115" width="20" height="8" fill="#8B4513" rx="2"/><!-- cross guard --><rect x="85" y="120" width="30" height="4" fill="#dd8800"/></g><!-- judgment rings expanding --><circle cx="100" cy="120" r="5" fill="none" stroke="#ffff99" stroke-width="4" style="animation: de-judgment-ring 2600ms ease-out forwards 800ms;"/><circle cx="100" cy="120" r="5" fill="none" stroke="#ffff00" stroke-width="3" style="animation: de-judgment-ring 2600ms ease-out forwards 1100ms;"/><circle cx="100" cy="120" r="5" fill="none" stroke="#ddaa00" stroke-width="2" style="animation: de-judgment-ring 2600ms ease-out forwards 1400ms;"/><!-- light bursts --><circle cx="100" cy="120" r="3" fill="#ffff99" filter="url(#de-glow)" style="--bx:-50px; --by:-40px; animation: de-light-burst 2600ms ease-out forwards 900ms;"/><circle cx="100" cy="120" r="2.5" fill="#ffff00" style="--bx:50px; --by:-40px; animation: de-light-burst 2600ms ease-out forwards 1000ms;"/><circle cx="100" cy="120" r="2" fill="#ddaa00" style="--bx:-45px; --by:50px; animation: de-light-burst 2600ms ease-out forwards 1100ms;"/><circle cx="100" cy="120" r="2" fill="#ffff99" style="--bx:45px; --by:50px; animation: de-light-burst 2600ms ease-out forwards 1200ms;"/><!-- stun star indicators --><polygon points="100,60 105,70 115,72 108,78 110,88 100,84 90,88 92,78 85,72 95,70" fill="#ffff00" opacity="0.7" style="animation: de-stun-indicator 2600ms ease-out forwards 1300ms;"/>`;
    return s;
  }},

  /* ════════════════════════════════════════════════════════════════════════
     KAIN (DRAGOON) - 4 Moves
  ════════════════════════════════════════════════════════════════════════ */

  // Dragoon Lance - Skyward thrust
  'dragoon_lance': { duration: 1900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes dl-lance-thrust { 0% { transform: translateY(60px); opacity: 0; } 15% { opacity: 1; } 60% { transform: translateY(-80px); opacity: 1; } 100% { opacity: 0; } }
      @keyframes dl-wind-trail { 0% { opacity: 0; } 20% { opacity: 0.7; } 100% { opacity: 0; } }
      @keyframes dl-speed-boost { 0% { transform: translateY(20px) scale(0.5); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-40px) scale(1); opacity: 0; } }
      @keyframes dl-sparkles { 0% { transform: translate(0,0); opacity: 1; } 100% { transform: translate(var(--sx), var(--sy)); opacity: 0; } }
    </style></defs><defs><filter id="dl-glow"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="dl-lance" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#4ecfff"/><stop offset="50%" stop-color="#0099ff"/><stop offset="100%" stop-color="#003399" stop-opacity="0"/></linearGradient></defs><!-- lance shaft --><rect x="97" y="20" width="6" height="120" fill="url(#dl-lance)" filter="url(#dl-glow)" style="animation: dl-lance-thrust 1900ms cubic-bezier(0.2,0.7,0.2,1) forwards;"/><!-- lance tip --><polygon points="100,15 96,25 104,25" fill="#00ffff" filter="url(#dl-glow)" style="animation: dl-lance-thrust 1900ms cubic-bezier(0.2,0.7,0.2,1) forwards;"/><!-- wind trails --><line x1="75" y1="70" x2="90" y2="65" stroke="#4ecfff" stroke-width="1" opacity="0.5" style="animation: dl-wind-trail 1900ms ease-out forwards 300ms;"/><line x1="125" y1="60" x2="110" y2="55" stroke="#0099ff" stroke-width="1" opacity="0.5" style="animation: dl-wind-trail 1900ms ease-out forwards 400ms;"/><!-- speed indicator --><g style="animation: dl-speed-boost 1900ms ease-out forwards 700ms;"><polygon points="155,100 160,110 150,110" fill="#00ffff" filter="url(#dl-glow)"/><text x="162" y="105" fill="#0099ff" font-size="6" font-family="monospace">SPD+</text></g><!-- sparkles --><circle cx="100" cy="80" r="1.5" fill="#00ffff" filter="url(#dl-glow)" style="--sx:-30px; --sy:-40px; animation: dl-sparkles 1900ms ease-out forwards 500ms;"/><circle cx="100" cy="85" r="1" fill="#4ecfff" style="--sx:30px; --sy:-45px; animation: dl-sparkles 1900ms ease-out forwards 700ms;"/>`;
    return s;
  }},

  // Dragon Jump - Aerial strike
  'dragon_jump': { duration: 2100, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes dj-dragon-fly { 0% { transform: translateY(80px) scale(0.5); opacity: 0; } 15% { opacity: 1; } 50% { transform: translateY(-60px) scale(1); opacity: 1; } 100% { transform: translateY(-80px) scale(0.8); opacity: 0; } }
      @keyframes dj-wind-gust { 0% { r: 4; opacity: 0; } 40% { r: 4; opacity: 1; } 100% { r: 70; opacity: 0; stroke-width: 0.3; } }
      @keyframes dj-evasion-flash { 0%, 100% { opacity: 0; } 50% { opacity: 0.6; } }
      @keyframes dj-trail { 0% { transform: translate(0,0) scale(1); opacity: 0.8; } 100% { transform: translate(var(--tx), var(--ty)) scale(0.2); opacity: 0; } }
    </style></defs><defs><filter id="dj-glow"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><!-- dragon jumping --><g style="animation: dj-dragon-fly 2100ms cubic-bezier(0.1,0.7,0.2,1) forwards;"><ellipse cx="100" cy="100" rx="15" ry="20" fill="#0066cc" filter="url(#dj-glow)"/><!-- wings spread --><ellipse cx="80" cy="95" rx="12" ry="15" fill="#0099ff" opacity="0.7"/><ellipse cx="120" cy="95" rx="12" ry="15" fill="#0099ff" opacity="0.7"/><!-- dragon head --><circle cx="100" cy="85" r="8" fill="#003399"/><!-- eyes --><circle cx="96" cy="83" r="1.5" fill="#00ffff"/><circle cx="104" cy="83" r="1.5" fill="#00ffff"/></g><!-- wind gusts --><circle cx="100" cy="120" r="4" fill="none" stroke="#0099ff" stroke-width="2" style="animation: dj-wind-gust 2100ms ease-out forwards 600ms;"/><circle cx="100" cy="120" r="4" fill="none" stroke="#4ecfff" stroke-width="1.5" style="animation: dj-wind-gust 2100ms ease-out forwards 900ms;"/><!-- evasion indicator --><circle cx="100" cy="140" r="20" fill="#0099ff" fill-opacity="0.1" style="animation: dj-evasion-flash 2100ms ease-in-out infinite 500ms;"/><!-- after-image trails --><ellipse cx="100" cy="100" rx="12" ry="16" fill="#4ecfff" opacity="0.3" style="--tx:-40px; --ty:20px; animation: dj-trail 2100ms ease-out forwards 700ms;"/><ellipse cx="100" cy="100" rx="12" ry="16" fill="#0099ff" opacity="0.2" style="--tx:40px; --ty:25px; animation: dj-trail 2100ms ease-out forwards 900ms;"/>`;
    return s;
  }},

  // Divine Flight - Blessing boost
  'divine_flight': { duration: 2400, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes df-wings-glow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; } }
      @keyframes df-halo-expand { 0% { r: 30; opacity: 1; } 100% { r: 80; opacity: 0; } }
      @keyframes df-ascend { 0% { transform: translateY(30px); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-80px); opacity: 0; } }
      @keyframes df-buff-particle { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--bpx), var(--bpy)) scale(0); opacity: 0; } }
    </style></defs><defs><filter id="df-glow"><feGaussianBlur stdDeviation="5"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="df-wing-light" x1="0%" y1="50%" x2="100%" y2="50%"><stop offset="0%" stop-color="#ffff99" stop-opacity="0"/><stop offset="50%" stop-color="#ffff00"/><stop offset="100%" stop-color="#ffff99" stop-opacity="0"/></linearGradient></defs><!-- center orb --><circle cx="100" cy="100" r="10" fill="#ffff99" filter="url(#df-glow)"/><!-- left wing --><ellipse cx="70" cy="100" rx="18" ry="30" fill="url(#df-wing-light)" filter="url(#df-glow)" style="animation: df-wings-glow 2400ms ease-in-out infinite;"/><!-- right wing --><ellipse cx="130" cy="100" rx="18" ry="30" fill="url(#df-wing-light)" filter="url(#df-glow)" style="animation: df-wings-glow 2400ms ease-in-out infinite 200ms;"/><!-- halo expanding --><circle cx="100" cy="100" r="30" fill="none" stroke="#ffff99" stroke-width="2" style="animation: df-halo-expand 2400ms ease-out forwards 400ms;"/><!-- ascension glow --><rect x="40" y="40" width="120" height="120" fill="#ffff99" opacity="0.05" style="animation: df-ascend 2400ms ease-out forwards 600ms;"/><!-- buff particles rising --><circle cx="80" cy="120" r="2.5" fill="#ffff99" filter="url(#df-glow)" style="--bpx:0px; --bpy:-80px; animation: df-buff-particle 2400ms ease-out forwards 700ms;"/><circle cx="100" cy="130" r="2" fill="#ffff00" style="--bpx:0px; --bpy:-90px; animation: df-buff-particle 2400ms ease-out forwards 900ms;"/><circle cx="120" cy="125" r="2" fill="#ffff99" style="--bpx:0px; --bpy:-85px; animation: df-buff-particle 2400ms ease-out forwards 1100ms;"/>`;
    return s;
  }},

  // Heaven's Fall - Ultimate descent
  'heavens_fall': { duration: 2700, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes hf-meteor-fall { 0% { transform: translateY(-120px) scale(0.3) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 70% { transform: translateY(40px) scale(1) rotate(360deg); opacity: 1; } 100% { transform: translateY(60px) scale(0.8) rotate(450deg); opacity: 0; } }
      @keyframes hf-impact-shockwave { 0% { r: 8; opacity: 1; stroke-width: 6; } 100% { r: 100; opacity: 0; stroke-width: 0.2; } }
      @keyframes hf-crater-ring { 0% { r: 4; opacity: 0; } 40% { r: 4; opacity: 1; } 100% { r: 80; opacity: 0; } }
      @keyframes hf-debris { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) scale(0.1); opacity: 0; } }
    </style></defs><defs><filter id="hf-glow"><feGaussianBlur stdDeviation="6"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="hf-meteor"><stop offset="0%" stop-color="#ffaa00"/><stop offset="50%" stop-color="#ff6600"/><stop offset="100%" stop-color="#cc3300" stop-opacity="0"/></radialGradient></defs><!-- falling meteor --><g style="animation: hf-meteor-fall 2700ms cubic-bezier(0.3,0.9,0.2,1) forwards;"><circle cx="100" cy="40" r="16" fill="url(#hf-meteor)" filter="url(#hf-glow)"/><!-- meteor core --><circle cx="100" cy="40" r="8" fill="#ffff99" filter="url(#hf-glow)"/><!-- trail behind meteor --><circle cx="100" cy="60" r="6" fill="#ff6600" opacity="0.4"/><circle cx="100" cy="75" r="4" fill="#ff6600" opacity="0.2"/></g><!-- impact shockwaves --><circle cx="100" cy="120" r="8" fill="none" stroke="#ffaa00" stroke-width="6" style="animation: hf-impact-shockwave 2700ms ease-out forwards 1200ms;"/><circle cx="100" cy="120" r="8" fill="none" stroke="#ff6600" stroke-width="4" style="animation: hf-impact-shockwave 2700ms ease-out forwards 1500ms;"/><circle cx="100" cy="120" r="8" fill="none" stroke="#cc3300" stroke-width="2" style="animation: hf-impact-shockwave 2700ms ease-out forwards 1800ms;"/><!-- crater rings --><circle cx="100" cy="120" r="4" fill="none" stroke="#ffaa00" stroke-width="1.5" style="animation: hf-crater-ring 2700ms ease-out forwards 1300ms;"/><circle cx="100" cy="120" r="4" fill="none" stroke="#ff6600" stroke-width="1" style="animation: hf-crater-ring 2700ms ease-out forwards 1600ms;"/><!-- debris flying out --><circle cx="100" cy="120" r="3" fill="#ff6600" filter="url(#hf-glow)" style="--dx:-50px; --dy:-50px; animation: hf-debris 2700ms ease-out forwards 1400ms;"/><circle cx="100" cy="120" r="2.5" fill="#ffaa00" style="--dx:50px; --dy:-50px; animation: hf-debris 2700ms ease-out forwards 1500ms;"/><circle cx="100" cy="120" r="2" fill="#cc3300" style="--dx:-60px; --dy:50px; animation: hf-debris 2700ms ease-out forwards 1600ms;"/><circle cx="100" cy="120" r="2" fill="#ff6600" style="--dx:60px; --dy:50px; animation: hf-debris 2700ms ease-out forwards 1700ms;"/>`;
    return s;
  }},

  /* ════════════════════════════════════════════════════════════════════════
     LEON (GRAIL GUARDIAN) - 4 Moves
  ════════════════════════════════════════════════════════════════════════ */

  // Holy Strike - Divine sword strike
  'holy_strike': { duration: 1850, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes hs-sword-swing { 0% { transform: rotate(-60deg) translateX(-40px); opacity: 0; } 10% { opacity: 1; } 70% { transform: rotate(60deg) translateX(40px); opacity: 1; } 100% { opacity: 0; } }
      @keyframes hs-holy-trail { 0% { opacity: 0; } 30% { opacity: 0.8; } 100% { opacity: 0; } }
      @keyframes hs-light-ring { 0% { r: 5; opacity: 0; } 40% { r: 5; opacity: 1; } 100% { r: 65; opacity: 0; } }
      @keyframes hs-holy-sparks { 0% { transform: translate(0,0); opacity: 1; } 100% { transform: translate(var(--hsx), var(--hsy)); opacity: 0; } }
    </style></defs><defs><filter id="hs-glow"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="hs-blade" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffff99"/><stop offset="50%" stop-color="#ffff00"/><stop offset="100%" stop-color="#ffdd00"/></linearGradient></defs><!-- holy sword --><rect x="95" y="30" width="10" height="110" fill="url(#hs-blade)" filter="url(#hs-glow)" style="animation: hs-sword-swing 1850ms cubic-bezier(0.2,0.8,0.2,1) forwards;"/><!-- holy aura around sword --><rect x="88" y="30" width="24" height="110" fill="#ffff99" opacity="0.15" style="animation: hs-sword-swing 1850ms cubic-bezier(0.2,0.8,0.2,1) forwards;"/><!-- sword hilt --><rect x="90" y="135" width="20" height="10" fill="#d4af37" rx="2" style="animation: hs-sword-swing 1850ms cubic-bezier(0.2,0.8,0.2,1) forwards;"/><!-- holy light trail --><ellipse cx="100" cy="80" rx="8" ry="15" fill="#ffff99" opacity="0.4" style="animation: hs-holy-trail 1850ms ease-out forwards 200ms;"/><ellipse cx="100" cy="100" rx="10" ry="20" fill="#ffff00" opacity="0.3" style="animation: hs-holy-trail 1850ms ease-out forwards 400ms;"/><!-- impact ring --><circle cx="100" cy="120" r="5" fill="none" stroke="#ffff99" stroke-width="2" style="animation: hs-light-ring 1850ms ease-out forwards 700ms;"/><!-- holy sparks --><circle cx="100" cy="110" r="2" fill="#ffff99" filter="url(#hs-glow)" style="--hsx:-40px; --hsy:-40px; animation: hs-holy-sparks 1850ms ease-out forwards 300ms;"/><circle cx="100" cy="110" r="1.5" fill="#ffff00" style="--hsx:40px; --hsy:-40px; animation: hs-holy-sparks 1850ms ease-out forwards 450ms;"/><circle cx="100" cy="110" r="1.5" fill="#ffff99" style="--hsx:-35px; --hsy:45px; animation: hs-holy-sparks 1850ms ease-out forwards 600ms;"/>`;
    return s;
  }},

  // Divine Shield - Protective barrier
  'divine_shield': { duration: 2200, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes dsh-shield-form { 0% { transform: scale(0) rotate(-45deg); opacity: 0; } 20% { opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 0.7; } }
      @keyframes dsh-shield-glow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
      @keyframes dsh-protection-ring { 0% { r: 8; opacity: 0; } 30% { opacity: 1; } 100% { r: 90; opacity: 0; stroke-width: 0.2; } }
      @keyframes dsh-defense-indicator { 0% { transform: translateY(30px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-30px); opacity: 0; } }
    </style></defs><defs><filter id="dsh-glow"><feGaussianBlur stdDeviation="5"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><!-- shield outline --><path d="M 100 40 L 140 70 L 135 130 Q 100 160 100 160 Q 65 130 60 130 L 65 70 Z" fill="#ffff99" fill-opacity="0.3" stroke="#ffff00" stroke-width="2" filter="url(#dsh-glow)" style="animation: dsh-shield-form 2200ms cubic-bezier(0.1,0.8,0.2,1) forwards;"/><!-- shield inner glow --><path d="M 100 45 L 135 70 L 130 125 Q 100 150 100 150 Q 70 125 70 125 L 70 70 Z" fill="#ffff99" fill-opacity="0.2" style="animation: dsh-shield-glow 2200ms ease-in-out infinite 300ms;"/><!-- shield cross --><line x1="100" y1="50" x2="100" y2="150" stroke="#ffff00" stroke-width="1" opacity="0.5" style="animation: dsh-shield-form 2200ms ease-out forwards 200ms;"/><line x1="65" y1="100" x2="135" y2="100" stroke="#ffff00" stroke-width="1" opacity="0.5" style="animation: dsh-shield-form 2200ms ease-out forwards 300ms;"/><!-- protection rings expanding --><circle cx="100" cy="100" r="8" fill="none" stroke="#ffff99" stroke-width="2" style="animation: dsh-protection-ring 2200ms ease-out forwards 500ms;"/><circle cx="100" cy="100" r="8" fill="none" stroke="#ffff00" stroke-width="1.5" style="animation: dsh-protection-ring 2200ms ease-out forwards 800ms;"/><!-- DEF+ indicator --><g style="animation: dsh-defense-indicator 2200ms ease-out forwards 1000ms;"><text x="100" y="180" text-anchor="middle" fill="#ffff99" font-size="8" font-family="monospace" font-weight="bold">DEF+45%</text></g>`;
    return s;
  }},

  // Grail Blessing - Healing light
  'grail_blessing': { duration: 2300, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes gb-chalice-rise { 0% { transform: translateY(80px) scale(0.3); opacity: 0; } 15% { opacity: 1; } 70% { transform: translateY(-30px) scale(1); opacity: 1; } 100% { transform: translateY(-50px) scale(0.8); opacity: 0; } }
      @keyframes gb-light-flow { 0% { r: 3; opacity: 0; } 30% { opacity: 1; } 100% { r: 60; opacity: 0; } }
      @keyframes gb-healing-aura { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.7; } }
      @keyframes gb-light-particles { 0% { transform: translateY(40px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-60px); opacity: 0; } }
    </style></defs><defs><filter id="gb-glow"><feGaussianBlur stdDeviation="5"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="gb-light" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffff99"/><stop offset="50%" stop-color="#ffff00"/><stop offset="100%" stop-color="#ffdd00"/></linearGradient></defs><!-- holy chalice/grail --><g style="animation: gb-chalice-rise 2300ms cubic-bezier(0.1,0.7,0.2,1) forwards;"><path d="M 90 70 L 85 95 Q 85 105 92 110 L 108 110 Q 115 105 115 95 L 110 70 Z" fill="url(#gb-light)" filter="url(#gb-glow)"/><!-- chalice rim --><ellipse cx="100" cy="70" rx="10" ry="5" fill="#ffff99" stroke="#ffdd00" stroke-width="1" opacity="0.8"/><!-- glowing liquid inside --><ellipse cx="100" cy="95" rx="8" ry="6" fill="#ffff00" opacity="0.6" filter="url(#gb-glow)"/></g><!-- light rings expanding --><circle cx="100" cy="100" r="3" fill="none" stroke="#ffff99" stroke-width="2" style="animation: gb-light-flow 2300ms ease-out forwards 600ms;"/><circle cx="100" cy="100" r="3" fill="none" stroke="#ffff00" stroke-width="1.5" style="animation: gb-light-flow 2300ms ease-out forwards 900ms;"/><circle cx="100" cy="100" r="3" fill="none" stroke="#ffdd00" stroke-width="1" style="animation: gb-light-flow 2300ms ease-out forwards 1200ms;"/><!-- healing aura --><circle cx="100" cy="100" r="50" fill="#ffff99" fill-opacity="0.1" style="animation: gb-healing-aura 2300ms ease-in-out infinite;"/><!-- light particles floating up --><circle cx="80" cy="120" r="2" fill="#ffff99" filter="url(#gb-glow)" style="animation: gb-light-particles 2300ms ease-out forwards 700ms;"/><circle cx="100" cy="125" r="1.5" fill="#ffff00" style="animation: gb-light-particles 2300ms ease-out forwards 900ms;"/><circle cx="120" cy="120" r="1.5" fill="#ffff99" style="animation: gb-light-particles 2300ms ease-out forwards 1100ms;"/>`;
    return s;
  }},

  // Lionheart Ascendant - Ultimate king power
  'lionheart_ascendant': { duration: 2900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes la-crown-descend { 0% { transform: translateY(-100px) scale(0.5) rotate(-30deg); opacity: 0; } 20% { opacity: 1; } 70% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; } 100% { transform: translateY(20px) scale(0.95); opacity: 0.4; } }
      @keyframes la-royal-ring { 0% { r: 8; opacity: 1; stroke-width: 4; } 100% { r: 100; opacity: 0; stroke-width: 0.2; } }
      @keyframes la-crown-glow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; } }
      @keyframes la-blessing-cascade { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(80px) scale(0.3); opacity: 0; } }
    </style></defs><defs><filter id="la-glow"><feGaussianBlur stdDeviation="6"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><!-- crown --><g style="animation: la-crown-descend 2900ms cubic-bezier(0.1,0.6,0.2,1) forwards;"><path d="M 80 65 L 85 50 L 95 55 L 100 40 L 105 55 L 115 50 L 120 65 Z" fill="#ffd700" filter="url(#la-glow)"/><!-- crown band --><ellipse cx="100" cy="70" rx="22" ry="6" fill="none" stroke="#ffff99" stroke-width="2" opacity="0.8"/><!-- jewels on crown --><circle cx="100" cy="50" r="3" fill="#ff6b9d" filter="url(#la-glow)"/><circle cx="85" cy="62" r="2" fill="#00ffff" opacity="0.9"/><circle cx="115" cy="62" r="2" fill="#00ffff" opacity="0.9"/></g><!-- royal rings expanding --><circle cx="100" cy="100" r="8" fill="none" stroke="#ffd700" stroke-width="4" style="animation: la-royal-ring 2900ms ease-out forwards 700ms;"/><circle cx="100" cy="100" r="8" fill="none" stroke="#ffff99" stroke-width="3" style="animation: la-royal-ring 2900ms ease-out forwards 1100ms;"/><circle cx="100" cy="100" r="8" fill="none" stroke="#ffff00" stroke-width="2" style="animation: la-royal-ring 2900ms ease-out forwards 1500ms;"/><!-- crown glow aura --><circle cx="100" cy="70" r="35" fill="#ffd700" fill-opacity="0.15" style="animation: la-crown-glow 2900ms ease-in-out infinite 500ms;"/><!-- blessing cascade particles --><circle cx="100" cy="100" r="2.5" fill="#ffd700" filter="url(#la-glow)" style="animation: la-blessing-cascade 2900ms ease-in forwards 1200ms;"/><circle cx="80" cy="105" r="2" fill="#ffff99" style="animation: la-blessing-cascade 2900ms ease-in forwards 1400ms;"/><circle cx="120" cy="105" r="2" fill="#ffff00" style="animation: la-blessing-cascade 2900ms ease-in forwards 1600ms;"/><circle cx="100" cy="110" r="1.5" fill="#ffd700" style="animation: la-blessing-cascade 2900ms ease-in forwards 1800ms;"/>`;
    return s;
  }}
};
