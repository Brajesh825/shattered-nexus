const SVGAnimations = {
  // Frostblossom
  'frostblossom': { duration: 1900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes fb-glow-bloom { 0% { r: 4; opacity: 0; fill-opacity: 0; } 30% { r: 18; opacity: 1; fill-opacity: 0.25; } 60% { r: 32; opacity: 0.6; fill-opacity: 0.1; } 100% { r: 55; opacity: 0; fill-opacity: 0; } }
      @keyframes fb-slow-ring { 0% { r: 6; stroke-width: 3; opacity: 0.9; stroke-dashoffset: 0; } 100% { r: 55; stroke-width: 0.5; opacity: 0; stroke-dashoffset: 80; } }
    </style></defs><defs><filter id="fb-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="fb-blade-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#b0f0ff" stop-opacity="0"/><stop offset="40%" stop-color="#4ecfff"/><stop offset="100%" stop-color="#ffffff"/></linearGradient></defs><!-- glow bloom at center --><circle cx="100" cy="108" r="4" fill="#4ecfff" filter="url(#fb-glow)" style="animation: fb-glow-bloom 1900ms ease-out forwards 200ms; animation-fill-mode: both;"/><!-- slash 1: top-left to bottom-right --><line x1="45" y1="55" x2="155" y2="165" stroke="url(#fb-blade-grad)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="200" stroke-dashoffset="200" filter="url(#fb-glow)" style="animation: fb-slash1 1900ms cubic-bezier(0.1,0.6,0.3,1) forwards;"/><!-- slash 2: top-right to bottom-left, staggered --><line x1="155" y1="55" x2="45" y2="165" stroke="url(#fb-blade-grad)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="200" stroke-dashoffset="200" filter="url(#fb-glow)" style="animation: fb-slash2 1900ms cubic-bezier(0.1,0.6,0.3,1) forwards 150ms;"/><!-- slow indicator dashed ring --><circle cx="100" cy="110" r="6" fill="none" stroke="#7dd3fc" stroke-width="1.5" stroke-dasharray="40 8" style="animation: fb-slow-ring 1900ms ease-out forwards 500ms; animation-fill-mode: both;"/>`;
    return s;
  }},

  // Glacial Waltz — Snowstorm Vortex
  'glacial_waltz': { duration: 2100, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes gw-wave-ring { 0%{r:8;opacity:1;stroke-width:3} 50%{r:48;opacity:0.6} 100%{r:92;opacity:0;stroke-width:0.3} }
      @keyframes gw-spin-blade { 0%{transform:rotate(0deg);opacity:0} 8%{opacity:1} 100%{transform:rotate(780deg);opacity:0} }
      @keyframes gw-snow { 0%{transform:rotate(calc(var(--a)*1deg)) translateX(var(--r)) scale(1);opacity:0.9} 100%{transform:rotate(calc((var(--a)+360)*1deg)) translateX(calc(var(--r)*1.6)) scale(0.2);opacity:0} }
      @keyframes gw-spd-arrow { 0%{transform:translateY(40px);opacity:0} 30%{opacity:1} 70%{transform:translateY(-50px);opacity:1} 100%{transform:translateY(-80px);opacity:0} }
      @keyframes gw-vortex-fade { 0%{opacity:0} 15%{opacity:0.7} 80%{opacity:0.5} 100%{opacity:0} }
    </style>
    <filter id="gw-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="gw-vortex-filter">
      <feTurbulence type="turbulence" baseFrequency="0.04 0.02" numOctaves="2" result="turb">
        <animate attributeName="baseFrequency" values="0.04 0.02;0.09 0.05;0.04 0.02" dur="0.7s" repeatCount="indefinite"/>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="turb" scale="10" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    </defs>
    <!-- outer AOE wave rings -->
    <circle cx="100" cy="105" r="8" fill="none" stroke="#4ecfff" stroke-width="3" style="animation:gw-wave-ring 2100ms ease-out forwards 180ms;"/>
    <circle cx="100" cy="105" r="8" fill="none" stroke="#7dd3fc" stroke-width="1.5" style="animation:gw-wave-ring 2100ms ease-out forwards 480ms;"/>
    <!-- spinning ice blade core — displaced by vortex turbulence filter -->
    <g filter="url(#gw-vortex-filter)" style="animation:gw-vortex-fade 2100ms ease-out forwards;">
      <g style="transform-origin:100px 105px; animation:gw-spin-blade 2100ms cubic-bezier(0.34,1.56,0.64,1) forwards;">
        <ellipse cx="100" cy="65" rx="4" ry="16" fill="#4ecfff" opacity="0.92" filter="url(#gw-glow)"/>
        <ellipse cx="100" cy="65" rx="4" ry="16" fill="#b0f0ff" opacity="0.85" transform="rotate(60 100 105)"/>
        <ellipse cx="100" cy="65" rx="4" ry="16" fill="#7dd3fc" opacity="0.9"  transform="rotate(120 100 105)"/>
        <ellipse cx="100" cy="65" rx="4" ry="16" fill="#4ecfff" opacity="0.92" transform="rotate(180 100 105)"/>
        <ellipse cx="100" cy="65" rx="4" ry="16" fill="#b0f0ff" opacity="0.85" transform="rotate(240 100 105)"/>
        <ellipse cx="100" cy="65" rx="4" ry="16" fill="#7dd3fc" opacity="0.9"  transform="rotate(300 100 105)"/>
      </g>
    </g>
    <!-- snow particles orbiting in a widening spiral -->
    <circle cx="100" cy="105" r="2"   fill="#e0f8ff" style="transform-origin:100px 105px; --a:0;   --r:22px; animation:gw-snow 2100ms linear forwards 100ms;"/>
    <circle cx="100" cy="105" r="1.5" fill="#4ecfff" style="transform-origin:100px 105px; --a:45;  --r:28px; animation:gw-snow 2100ms linear forwards 150ms;"/>
    <circle cx="100" cy="105" r="2"   fill="#b0f0ff" style="transform-origin:100px 105px; --a:90;  --r:18px; animation:gw-snow 2100ms linear forwards 200ms;"/>
    <circle cx="100" cy="105" r="1.5" fill="#7dd3fc" style="transform-origin:100px 105px; --a:135; --r:32px; animation:gw-snow 2100ms linear forwards 250ms;"/>
    <circle cx="100" cy="105" r="2"   fill="#e0f8ff" style="transform-origin:100px 105px; --a:180; --r:24px; animation:gw-snow 2100ms linear forwards 300ms;"/>
    <circle cx="100" cy="105" r="1.5" fill="#4ecfff" style="transform-origin:100px 105px; --a:225; --r:20px; animation:gw-snow 2100ms linear forwards 350ms;"/>
    <circle cx="100" cy="105" r="2"   fill="#b0f0ff" style="transform-origin:100px 105px; --a:270; --r:30px; animation:gw-snow 2100ms linear forwards 400ms;"/>
    <circle cx="100" cy="105" r="1.5" fill="#7dd3fc" style="transform-origin:100px 105px; --a:315; --r:26px; animation:gw-snow 2100ms linear forwards 450ms;"/>
    <circle cx="100" cy="105" r="1"   fill="#ffffff" style="transform-origin:100px 105px; --a:22;  --r:36px; animation:gw-snow 2100ms linear forwards 500ms;"/>
    <circle cx="100" cy="105" r="1"   fill="#b0f0ff" style="transform-origin:100px 105px; --a:202; --r:38px; animation:gw-snow 2100ms linear forwards 550ms;"/>
    <!-- SPD indicator -->
    <g style="animation:gw-spd-arrow 2100ms ease-out forwards 850ms; transform-origin:160px 150px;">
      <line x1="155" y1="155" x2="155" y2="130" stroke="#80ffcc" stroke-width="2"/>
      <polygon points="155,125 151,133 159,133" fill="#80ffcc"/>
      <text x="163" y="145" fill="#80ffcc" font-size="8" font-family="monospace">SPD+</text>
    </g>`;
    return s;
  }},

  // Permafrost
  'permafrost': { duration: 2100, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes pf-cage-ring { 0% { stroke-dashoffset: 400; opacity: 0; } 20% { opacity: 1; } 60% { stroke-dashoffset: 0; opacity: 1; } 100% { opacity: 0; } }
      @keyframes pf-spike-grow { 0% { transform: scaleY(0) translateY(50px); opacity: 0; transform-origin: bottom; } 40% { transform: scaleY(1) translateY(0); opacity: 1; transform-origin: bottom; } 75% { opacity: 1; } 100% { opacity: 0; transform: scaleY(1.1) translateY(0); transform-origin: bottom; } }
      @keyframes pf-def-down { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(30px); opacity: 0; } }
      @keyframes pf-snow-fall { 0% { transform: translate(0,0); opacity: 0.8; } 100% { transform: translate(var(--sx), 60px); opacity: 0; } }
    </style></defs><defs><filter id="pf-glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><!-- cage ring --><circle cx="100" cy="110" r="52" fill="none" stroke="#4ecfff" stroke-width="1.5" stroke-dasharray="400" stroke-dashoffset="400" style="animation: pf-cage-ring 2100ms ease-out forwards 200ms;"/><!-- inner lock ring --><circle cx="100" cy="110" r="30" fill="none" stroke="#7dd3fc" stroke-width="1" stroke-dasharray="200" stroke-dashoffset="200" style="animation: pf-cage-ring 2100ms ease-out forwards 500ms;"/><!-- ice spikes rising from bottom --><polygon points="100,160 94,160 97,100" fill="#b0f0ff" fill-opacity="0.9" filter="url(#pf-glow)" style="animation: pf-spike-grow 2100ms cubic-bezier(0.1,0.8,0.2,1) forwards 100ms;"/><polygon points="80,165 74,165 77,115" fill="#4ecfff" fill-opacity="0.8" style="animation: pf-spike-grow 2100ms ease-out forwards 200ms;"/><polygon points="120,165 114,165 117,115" fill="#4ecfff" fill-opacity="0.8" style="animation: pf-spike-grow 2100ms ease-out forwards 250ms;"/><polygon points="62,168 56,168 59,125" fill="#7dd3fc" fill-opacity="0.6" style="animation: pf-spike-grow 2100ms ease-out forwards 350ms;"/><polygon points="138,168 132,168 135,125" fill="#7dd3fc" fill-opacity="0.6" style="animation: pf-spike-grow 2100ms ease-out forwards 380ms;"/><!-- DEF down indicator --><g style="animation: pf-def-down 2100ms ease-out forwards 700ms;"><line x1="100" y1="60" x2="100" y2="75" stroke="#ff6666" stroke-width="1.5"/><polygon points="100,80 96,72 104,72" fill="#ff6666"/><text x="106" y="70" fill="#ff6666" font-size="8" font-family="monospace">DEF-</text></g><!-- snowflakes --><circle cx="100" cy="60" r="2.5" fill="#b0f0ff" style="--sx:-28px; animation: pf-snow-fall 2100ms ease-in forwards 300ms;"/><circle cx="100" cy="50" r="2" fill="#7dd3fc" style="--sx:20px; animation: pf-snow-fall 2100ms ease-in forwards 500ms;"/><circle cx="100" cy="55" r="1.5" fill="#b0f0ff" style="--sx:-10px; animation: pf-snow-fall 2100ms ease-in forwards 700ms;"/><circle cx="100" cy="45" r="2" fill="#4ecfff" style="--sx:35px; animation: pf-snow-fall 2100ms ease-in forwards 900ms;"/>`;
    return s;
  }},

  // Cryoclasm — Shattering Glass
  'cryoclasm': { duration: 2400, screenShake: 360, shakeDelay: 670, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes cc-buildup { 0%{r:2;fill-opacity:0.9;opacity:1} 38%{r:20;fill-opacity:0.35} 54%{r:16;fill-opacity:0.8} 64%{r:88;fill-opacity:0;opacity:0} 100%{opacity:0} }
      @keyframes cc-shockwave { 0%{r:5;stroke-width:8;opacity:1} 100%{r:95;stroke-width:0.3;opacity:0} }
      @keyframes cc-shard { 0%,28%{transform:rotate(calc(var(--a)*1deg)) translateX(0) scale(0.15);opacity:0} 30%{transform:rotate(calc(var(--a)*1deg)) translateX(3px) scale(1.4);opacity:1} 100%{transform:rotate(calc(var(--a)*1deg)) translateX(var(--d)) scale(0.1) skewY(12deg);opacity:0} }
      @keyframes cc-crack { 0%,26%{stroke-dashoffset:90;opacity:0} 28%{opacity:1;stroke-dashoffset:90} 60%{stroke-dashoffset:0;opacity:0.65} 100%{opacity:0} }
      @keyframes cc-flash { 0%,27%{opacity:0} 30%{opacity:0.88} 54%{opacity:0.15} 100%{opacity:0} }
    </style></defs>
    <defs>
      <radialGradient id="cc-bg" cx="50%" cy="55%" r="50%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="40%" stop-color="#4ecfff" stop-opacity="0.5"/><stop offset="100%" stop-color="#1a5a8a" stop-opacity="0"/></radialGradient>
      <filter id="cc-glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <!-- buildup core -->
    <circle cx="100" cy="108" r="2" fill="url(#cc-bg)" style="animation:cc-buildup 2400ms ease-in-out forwards;"/>
    <!-- fracture cracks emanating from center at impact -->
    <line x1="100" y1="108" x2="56" y2="64" stroke="#b0f0ff" stroke-width="1.5" stroke-dasharray="90" stroke-dashoffset="90" filter="url(#cc-glow)" style="animation:cc-crack 2400ms ease-out forwards;"/>
    <line x1="100" y1="108" x2="144" y2="64" stroke="#4ecfff" stroke-width="1.5" stroke-dasharray="90" stroke-dashoffset="90" style="animation:cc-crack 2400ms ease-out forwards 40ms;"/>
    <line x1="100" y1="108" x2="100" y2="46" stroke="#ffffff" stroke-width="2" stroke-dasharray="65" stroke-dashoffset="65" filter="url(#cc-glow)" style="animation:cc-crack 2400ms ease-out forwards 20ms;"/>
    <line x1="100" y1="108" x2="47" y2="114" stroke="#7dd3fc" stroke-width="1" stroke-dasharray="60" stroke-dashoffset="60" style="animation:cc-crack 2400ms ease-out forwards 65ms;"/>
    <line x1="100" y1="108" x2="153" y2="114" stroke="#7dd3fc" stroke-width="1" stroke-dasharray="60" stroke-dashoffset="60" style="animation:cc-crack 2400ms ease-out forwards 85ms;"/>
    <!-- triangular glass shards — each flies in a distinct radial direction -->
    <polygon points="100,100 97,112 103,112" fill="#b0f0ff" filter="url(#cc-glow)" style="transform-origin:100px 108px; --a:-135; --d:64px; animation:cc-shard 2400ms cubic-bezier(0.15,0.85,0.2,1) forwards 668ms;"/>
    <polygon points="100,100 96,112 104,112" fill="#4ecfff"                         style="transform-origin:100px 108px; --a:-45;  --d:60px; animation:cc-shard 2400ms cubic-bezier(0.15,0.85,0.2,1) forwards 682ms;"/>
    <polygon points="100,99  95,112 105,112" fill="#ffffff"  filter="url(#cc-glow)" style="transform-origin:100px 108px; --a:180;  --d:72px; animation:cc-shard 2400ms cubic-bezier(0.15,0.85,0.2,1) forwards 692ms;"/>
    <polygon points="100,99  96,112 104,112" fill="#7dd3fc"                         style="transform-origin:100px 108px; --a:0;    --d:68px; animation:cc-shard 2400ms cubic-bezier(0.15,0.85,0.2,1) forwards 704ms;"/>
    <polygon points="100,101 97,111 103,111" fill="#b0f0ff"                         style="transform-origin:100px 108px; --a:135;  --d:62px; animation:cc-shard 2400ms cubic-bezier(0.15,0.85,0.2,1) forwards 715ms;"/>
    <polygon points="100,101 96,111 104,111" fill="#4ecfff"                         style="transform-origin:100px 108px; --a:45;   --d:57px; animation:cc-shard 2400ms cubic-bezier(0.15,0.85,0.2,1) forwards 724ms;"/>
    <polygon points="100,99  96,112 104,112" fill="#e0f8ff"  filter="url(#cc-glow)" style="transform-origin:100px 108px; --a:-90;  --d:70px; animation:cc-shard 2400ms cubic-bezier(0.15,0.85,0.2,1) forwards 678ms;"/>
    <polygon points="100,100 95,113 105,113" fill="#7dd3fc"                         style="transform-origin:100px 108px; --a:90;   --d:74px; animation:cc-shard 2400ms cubic-bezier(0.15,0.85,0.2,1) forwards 708ms;"/>
    <polygon points="100,100 96,112 104,112" fill="#b0f0ff"                         style="transform-origin:100px 108px; --a:-160; --d:54px; animation:cc-shard 2400ms cubic-bezier(0.15,0.85,0.2,1) forwards 738ms;"/>
    <polygon points="100,100 96,112 104,112" fill="#4ecfff"                         style="transform-origin:100px 108px; --a:-20;  --d:58px; animation:cc-shard 2400ms cubic-bezier(0.15,0.85,0.2,1) forwards 748ms;"/>
    <!-- shockwave rings with bouncy cubic-bezier -->
    <circle cx="100" cy="108" r="5" fill="none" stroke="#ffffff" stroke-width="8" style="animation:cc-shockwave 2400ms cubic-bezier(0.1,0.8,0.3,1) forwards 700ms;"/>
    <circle cx="100" cy="108" r="5" fill="none" stroke="#4ecfff" stroke-width="5" style="animation:cc-shockwave 2400ms cubic-bezier(0.1,0.8,0.3,1) forwards 900ms;"/>
    <circle cx="100" cy="108" r="5" fill="none" stroke="#7dd3fc" stroke-width="2" style="animation:cc-shockwave 2400ms cubic-bezier(0.1,0.8,0.3,1) forwards 1100ms;"/>
    <!-- blinding cryo flash -->
    <rect x="0" y="0" width="200" height="200" fill="#d8f6ff" style="animation:cc-flash 2400ms ease-out forwards;"/>`;
    return s;
  }},

  // Spirit Flame — Soul Wisps Lifesteal
  'spirit_flame': { duration: 1900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes sf-ghost-flicker { 0%,100%{opacity:0.15} 50%{opacity:0.55} }
      @keyframes sf-thrust { 0%{transform:translateY(-90px) scaleX(0.7);opacity:0} 15%{opacity:1;transform:translateY(-90px) scaleX(1)} 50%{transform:translateY(80px) scaleX(1);opacity:1} 70%{transform:translateY(80px) scaleX(1);opacity:0.7} 100%{transform:translateY(80px) scaleX(0.5);opacity:0} }
      @keyframes sf-impact-ring { 0%{r:4;opacity:0} 45%{r:4;opacity:0} 50%{r:6;opacity:1} 100%{r:50;opacity:0;stroke-width:0.5} }
      @keyframes sf-soul-wisp { 0%{transform:translate(0,0) scale(1.2);opacity:0} 12%{opacity:1} 75%{transform:translate(var(--wx),var(--wy)) scale(0.5);opacity:0.9} 100%{transform:translate(var(--wx),var(--wy)) scale(0.1);opacity:0} }
      @keyframes sf-absorb-flash { 0%,72%{opacity:0} 75%{opacity:0.6} 85%{opacity:0.25} 100%{opacity:0} }
      @keyframes sf-lifesteal-orb { 0%{transform:translate(60px,-60px) scale(0.3);opacity:0} 30%{opacity:1} 70%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(0,0) scale(1.4);opacity:0} }
    </style>
    <filter id="sf-glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="sf-soul-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="sf-spear" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ff9900"/><stop offset="50%" stop-color="#ff3300"/><stop offset="100%" stop-color="#ff6600" stop-opacity="0"/></linearGradient>
    </defs>
    <!-- ghost aura -->
    <ellipse cx="100" cy="100" rx="40" ry="55" fill="#440022" fill-opacity="0.3" style="animation:sf-ghost-flicker 1900ms ease-in-out infinite;"/>
    <!-- spear thrust -->
    <rect x="97" y="30" width="6" height="80" fill="url(#sf-spear)" rx="3" filter="url(#sf-glow)" style="animation:sf-thrust 1900ms cubic-bezier(0.1,0.8,0.3,1) forwards;"/>
    <polygon points="100,30 94,48 106,48" fill="#ffcc00" filter="url(#sf-glow)" style="animation:sf-thrust 1900ms cubic-bezier(0.1,0.8,0.3,1) forwards;"/>
    <!-- soul wisps — teal/violet orbs torn from enemy, arcing toward party (lower-left) -->
    <circle cx="100" cy="108" r="5"   fill="#22ffcc" filter="url(#sf-soul-glow)" style="--wx:-58px; --wy:52px; animation:sf-soul-wisp 1900ms cubic-bezier(0.34,1.56,0.64,1) forwards 480ms;"/>
    <circle cx="100" cy="108" r="4"   fill="#bb88ff" filter="url(#sf-soul-glow)" style="--wx:-48px; --wy:62px; animation:sf-soul-wisp 1900ms cubic-bezier(0.34,1.56,0.64,1) forwards 540ms;"/>
    <circle cx="100" cy="108" r="3.5" fill="#22ffcc"                             style="--wx:-66px; --wy:38px; animation:sf-soul-wisp 1900ms cubic-bezier(0.34,1.56,0.64,1) forwards 600ms;"/>
    <circle cx="100" cy="108" r="3"   fill="#88ccff"                             style="--wx:-42px; --wy:70px; animation:sf-soul-wisp 1900ms cubic-bezier(0.34,1.56,0.64,1) forwards 660ms;"/>
    <circle cx="100" cy="108" r="2.5" fill="#bb88ff"                             style="--wx:-54px; --wy:46px; animation:sf-soul-wisp 1900ms cubic-bezier(0.34,1.56,0.64,1) forwards 720ms;"/>
    <!-- absorb flash when wisps arrive at party -->
    <rect x="0" y="0" width="200" height="200" fill="#22ffcc" style="animation:sf-absorb-flash 1900ms ease-out forwards;"/>
    <!-- lifesteal orb returning to caster -->
    <circle cx="100" cy="110" r="8" fill="#ff4488" fill-opacity="0.8" filter="url(#sf-glow)" style="animation:sf-lifesteal-orb 1900ms ease-in-out forwards 500ms;"/>
    <!-- impact ring -->
    <circle cx="100" cy="110" r="4" fill="none" stroke="#ff6600" stroke-width="3" style="animation:sf-impact-ring 1900ms ease-out forwards;"/>`;
    return s;
  }},

  // Paramita Papilio
  'paramita_papilio': { duration: 2300, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes pp-butterfly-orbit { 0% { transform: rotate(calc(var(--ba) * 1deg)) translateX(52px); opacity: 0; } 10% { opacity: 1; } 90% { transform: rotate(calc((var(--ba) + 400) * 1deg)) translateX(52px); opacity: 1; } 100% { opacity: 0; transform: rotate(calc((var(--ba) + 440) * 1deg)) translateX(80px); } }
      @keyframes pp-wing-flap { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(0.2); } }
      @keyframes sf-ghost-flicker { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.55; } }
      @keyframes pp-atk-buff-text { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 60% { transform: translateY(-28px); opacity: 1; } 100% { transform: translateY(-50px); opacity: 0; } }
      @keyframes pp-burst-ring { 0% { r: 5; stroke-width: 5; opacity: 1; } 100% { r: 80; stroke-width: 0.3; opacity: 0; } }
    </style></defs><defs><filter id="pp-glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><!-- butterfly 1 --><g style="transform-origin:100px 108px; --ba:0; animation: pp-butterfly-orbit 2300ms ease-in-out forwards;"><g style="transform-origin:100px 56px; animation: pp-wing-flap 300ms ease-in-out infinite;"><ellipse cx="91" cy="56" rx="10" ry="7" fill="#ff4488" fill-opacity="0.85" filter="url(#pp-glow)"/><ellipse cx="109" cy="56" rx="10" ry="7" fill="#ff6699" fill-opacity="0.85" filter="url(pp-glow)"/><ellipse cx="91" cy="63" rx="7" ry="5" fill="#cc2266" fill-opacity="0.7"/><ellipse cx="109" cy="63" rx="7" ry="5" fill="#cc2266" fill-opacity="0.7"/></g></g><!-- butterfly 2 --><g style="transform-origin:100px 108px; --ba:120; animation: pp-butterfly-orbit 2300ms ease-in-out forwards 150ms;"><g style="transform-origin:100px 56px; animation: pp-wing-flap 280ms ease-in-out infinite 140ms;"><ellipse cx="91" cy="56" rx="10" ry="7" fill="#ff6600" fill-opacity="0.8" filter="url(#pp-glow)"/><ellipse cx="109" cy="56" rx="10" ry="7" fill="#ff9900" fill-opacity="0.8"/><ellipse cx="91" cy="63" rx="7" ry="5" fill="#cc4400" fill-opacity="0.7"/><ellipse cx="109" cy="63" rx="7" ry="5" fill="#cc4400" fill-opacity="0.7"/></g></g><!-- butterfly 3 --><g style="transform-origin:100px 108px; --ba:240; animation: pp-butterfly-orbit 2300ms ease-in-out forwards 300ms;"><g style="transform-origin:100px 56px; animation: pp-wing-flap 320ms ease-in-out infinite 80ms;"><ellipse cx="91" cy="56" rx="10" ry="7" fill="#ff4488" fill-opacity="0.75" filter="url(#pp-glow)"/><ellipse cx="109" cy="56" rx="10" ry="7" fill="#ff6699" fill-opacity="0.75"/><ellipse cx="91" cy="63" rx="7" ry="5" fill="#cc2266" fill-opacity="0.65"/><ellipse cx="109" cy="63" rx="7" ry="5" fill="#cc2266" fill-opacity="0.65"/></g></g><!-- center ghost flame --><ellipse cx="100" cy="108" rx="8" ry="14" fill="#ff3300" fill-opacity="0.5" style="animation: sf-ghost-flicker 400ms ease-in-out infinite;"/><!-- ATK buff indicator --><g style="animation: pp-atk-buff-text 2300ms ease-out forwards 1200ms;"><text x="132" y="88" fill="#ff9900" font-size="9" font-family="monospace" font-weight="bold">ATK+50%</text><text x="140" y="98" fill="#ff6666" font-size="7" font-family="monospace">if HP&lt;50%</text></g><!-- burst ring --><circle cx="100" cy="108" r="5" fill="none" stroke="#ff4488" stroke-width="4" style="animation: pp-burst-ring 2300ms ease-out forwards 1800ms;"/>`;
    return s;
  }},

  // Dance of Blessing
  'dance_of_blessing': { duration: 1900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes dob-ripple { 0% { r: 4; stroke-width: 3; opacity: 0.9; } 100% { r: 75; stroke-width: 0.3; opacity: 0; } }
      @keyframes dob-petal-dance { 0% { transform: rotate(calc(var(--dp) * 1deg)) translateX(30px) scale(0.5); opacity: 0; } 20% { transform: rotate(calc((var(--dp)+90) * 1deg)) translateX(42px) scale(1); opacity: 1; } 80% { transform: rotate(calc((var(--dp)+270) * 1deg)) translateX(35px) scale(0.8); opacity: 0.7; } 100% { transform: rotate(calc((var(--dp)+360) * 1deg)) translateX(20px) scale(0.3); opacity: 0; } }
      @keyframes dob-water-drop { 0% { transform: translate(var(--ddx), -60px); opacity: 0; } 30% { opacity: 1; } 80% { transform: translate(var(--ddx), 0); opacity: 1; } 100% { transform: translate(var(--ddx), 10px); opacity: 0; } }
      @keyframes dob-sparkle { 0%, 100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1.2); } }
    </style></defs><defs><filter id="db-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><!-- ripple rings --><circle cx="100" cy="108" r="4" fill="none" stroke="#00d4b4" stroke-width="3" style="animation: dob-ripple 1900ms ease-out forwards 200ms;"/><circle cx="100" cy="108" r="4" fill="none" stroke="#80ffee" stroke-width="1.5" style="animation: dob-ripple 1900ms ease-out forwards 500ms;"/><!-- water petals --><ellipse cx="100" cy="70" rx="7" ry="18" fill="#00d4b4" fill-opacity="0.8" filter="url(#db-glow)" style="--dp:0; transform-origin:100px 108px; animation: dob-petal-dance 1900ms ease-in-out forwards;"/><ellipse cx="100" cy="70" rx="7" ry="18" fill="#00b8f5" fill-opacity="0.75" style="--dp:60; transform-origin:100px 108px; animation: dob-petal-dance 1900ms ease-in-out forwards 100ms;"/><ellipse cx="100" cy="70" rx="7" ry="18" fill="#80ffee" fill-opacity="0.7" style="--dp:120; transform-origin:100px 108px; animation: dob-petal-dance 1900ms ease-in-out forwards 200ms;"/><ellipse cx="100" cy="70" rx="7" ry="18" fill="#00d4b4" fill-opacity="0.65" style="--dp:180; transform-origin:100px 108px; animation: dob-petal-dance 1900ms ease-in-out forwards 300ms;"/><ellipse cx="100" cy="70" rx="7" ry="18" fill="#00b8f5" fill-opacity="0.7" style="--dp:240; transform-origin:100px 108px; animation: dob-petal-dance 1900ms ease-in-out forwards 400ms;"/><ellipse cx="100" cy="70" rx="7" ry="18" fill="#80ffee" fill-opacity="0.65" style="--dp:300; transform-origin:100px 108px; animation: dob-petal-dance 1900ms ease-in-out forwards 500ms;"/><!-- water drops falling in --><ellipse cx="80" cy="108" rx="3" ry="5" fill="#00d4b4" style="--ddx:-20px; animation: dob-water-drop 1900ms ease-out forwards 200ms;"/><ellipse cx="120" cy="108" rx="3" ry="5" fill="#80ffee" style="--ddx:20px; animation: dob-water-drop 1900ms ease-out forwards 350ms;"/><!-- sparkle --><circle cx="75" cy="80" r="3" fill="#80ffee" filter="url(#db-glow)" style="animation: dob-sparkle 400ms ease-in-out infinite 600ms;"/><circle cx="130" cy="75" r="2.5" fill="#00d4b4" style="animation: dob-sparkle 400ms ease-in-out infinite 800ms;"/><circle cx="100" cy="60" r="2" fill="#80ffee" style="animation: dob-sparkle 400ms ease-in-out infinite 700ms;"/>`;
    return s;
  }},

  // Water Wheel
  'water_wheel': { duration: 2300, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes ww-wheel-spin { 0% { transform: rotate(0deg) scale(0.3); opacity: 0; } 10% { transform: rotate(0deg) scale(1); opacity: 1; } 90% { transform: rotate(1080deg) scale(1); opacity: 0.8; } 100% { transform: rotate(1200deg) scale(1.4); opacity: 0; } }
      @keyframes ww-spoke { 0% { stroke-dashoffset: 100; opacity: 0; } 20% { opacity: 1; stroke-dashoffset: 0; } 80% { opacity: 1; } 100% { opacity: 0; } }
      @keyframes ww-aoe-wave { 0% { r: 8; stroke-width: 4; opacity: 1; } 100% { r: 95; stroke-width: 0.3; opacity: 0; } }
      @keyframes ww-heal-stream { 0% { transform: translate(var(--hx), var(--hy)) scale(1); opacity: 1; } 100% { transform: translate(0, 0) scale(0.3); opacity: 0; } }
    </style></defs><defs><filter id="ww-glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><!-- spinning water wheel --><g style="transform-origin:100px 108px; animation: ww-wheel-spin 2300ms ease-out forwards;"><!-- rim --><circle cx="100" cy="108" r="42" fill="none" stroke="#00d4b4" stroke-width="2.5" filter="url(#ww-glow)"/><!-- spokes as water blades --><line x1="100" y1="66" x2="100" y2="150" stroke="#80ffee" stroke-width="3" stroke-linecap="round" stroke-dasharray="84" stroke-dashoffset="84" style="animation: ww-spoke 2300ms ease-out forwards;"/><line x1="58" y1="108" x2="142" y2="108" stroke="#00b8f5" stroke-width="3" stroke-linecap="round" stroke-dasharray="84" stroke-dashoffset="84" style="animation: ww-spoke 2300ms ease-out forwards 100ms;"/><line x1="71" y1="71" x2="129" y2="145" stroke="#80ffee" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="84" stroke-dashoffset="84" style="animation: ww-spoke 2300ms ease-out forwards 200ms;"/><line x1="129" y1="71" x2="71" y2="145" stroke="#00d4b4" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="84" stroke-dashoffset="84" style="animation: ww-spoke 2300ms ease-out forwards 300ms;"/></g><!-- AOE wave ring --><circle cx="100" cy="108" r="8" fill="none" stroke="#00d4b4" stroke-width="5" style="animation: ww-aoe-wave 2300ms ease-out forwards 900ms;"/><!-- heal streams to allies --><circle cx="100" cy="108" r="5" fill="#44ffbb" fill-opacity="0.8" filter="url(#ww-glow)" style="--hx:-65px; --hy:-55px; animation: ww-heal-stream 2300ms ease-in-out forwards 1100ms;"/><circle cx="100" cy="108" r="4" fill="#80ffee" style="--hx:65px; --hy:-50px; animation: ww-heal-stream 2300ms ease-in-out forwards 1200ms;"/>`;
    return s;
  }},

  // Harmony Preservation
  'harmony_preservation': { duration: 2300, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes harm-shield-raise { 0% { transform: translateY(50px) scale(0.8); opacity: 0; } 30% { transform: translateY(0) scale(1); opacity: 1; } 70% { opacity: 1; } 100% { transform: translateY(-20px) scale(1.1); opacity: 0; } }
      @keyframes harm-rune-spin { 0% { transform: rotate(0deg); opacity: 0; } 15% { opacity: 1; } 100% { transform: rotate(540deg); opacity: 0; } }
      @keyframes harm-buff-ring { 0% { stroke-dashoffset: 600; opacity: 0; } 25% { opacity: 1; } 75% { stroke-dashoffset: 0; opacity: 1; } 100% { opacity: 0; } }
      @keyframes harm-regen-drop { 0% { transform: translate(var(--rx), 0) scale(1); opacity: 1; } 100% { transform: translate(var(--rx), 60px) scale(0.3); opacity: 0; } }
    </style></defs><defs><filter id="harm-glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><!-- shield hexagon --><g style="animation: harm-shield-raise 2300ms ease-out forwards;" filter="url(#harm-glow)"><polygon points="100,62 128,78 128,112 100,128 72,112 72,78" fill="none" stroke="#00d4b4" stroke-width="2.5"/><polygon points="100,72 118,82 118,104 100,114 82,104 82,82" fill="#00d4b4" fill-opacity="0.08"/></g><!-- spinning water runes --><g style="transform-origin:100px 108px; animation: harm-rune-spin 2300ms ease-out forwards 200ms;"><circle cx="100" cy="60" r="4" fill="#80ffee" fill-opacity="0.9"/><circle cx="140" cy="84" r="3.5" fill="#00d4b4" fill-opacity="0.8"/><circle cx="140" cy="132" r="4" fill="#80ffee" fill-opacity="0.9"/><circle cx="100" cy="156" r="3.5" fill="#00d4b4" fill-opacity="0.8"/><circle cx="60" cy="132" r="4" fill="#80ffee" fill-opacity="0.9"/><circle cx="60" cy="84" r="3.5" fill="#00d4b4" fill-opacity="0.8"/></g><!-- ATK+DEF ring --><circle cx="100" cy="108" r="58" fill="none" stroke="#00d4b4" stroke-width="1.5" stroke-dasharray="600" stroke-dashoffset="600" style="animation: harm-buff-ring 2300ms ease-out forwards 300ms;"/><!-- regen drops falling down --><ellipse cx="75" cy="108" rx="3" ry="5" fill="#44ffbb" style="--rx:-25px; animation: harm-regen-drop 2300ms ease-in forwards 800ms;"/><ellipse cx="100" cy="108" rx="3" ry="5" fill="#80ffee" style="--rx:0px; animation: harm-regen-drop 2300ms ease-in forwards 950ms;"/><ellipse cx="125" cy="108" rx="3" ry="5" fill="#44ffbb" style="--rx:25px; animation: harm-regen-drop 2300ms ease-in forwards 1100ms;"/><!-- stat labels --><text x="42" y="54" fill="#00d4b4" font-size="8" font-family="monospace" style="animation: harm-shield-raise 2300ms ease-out forwards 400ms;">ATK+20% DEF+20%</text><text x="60" y="175" fill="#44ffbb" font-size="8" font-family="monospace" style="animation: harm-shield-raise 2300ms ease-out forwards 600ms;">REGEN 5HP/turn</text>`;
    return s;
  }},

  // Hajra's Hymn — Light Feathers & Prismatic Lens Flare
  'hajras_hymn': { duration: 2600, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes hh-star-ray { 0%{transform:rotate(calc(var(--ray)*1deg)) scaleX(0);opacity:0} 30%{transform:rotate(calc(var(--ray)*1deg)) scaleX(1);opacity:1} 100%{transform:rotate(calc(var(--ray)*1deg)) scaleX(1.5);opacity:0} }
      @keyframes hh-star-burst { 0%{transform:scale(0) rotate(0deg);opacity:0} 20%{transform:scale(1.2) rotate(30deg);opacity:1} 50%{transform:scale(1) rotate(60deg)} 80%{transform:scale(1.05) rotate(90deg);opacity:0.8} 100%{transform:scale(1.8) rotate(120deg);opacity:0} }
      @keyframes hh-heal-wave { 0%{r:5;stroke-width:5;opacity:1} 100%{r:95;stroke-width:0.3;opacity:0} }
      @keyframes hh-cleanse-bubble { 0%{transform:translate(var(--cbx),var(--cby)) scale(0.5);opacity:0} 30%{opacity:1} 70%{transform:translate(var(--cbx),calc(var(--cby) - 30px)) scale(1);opacity:0.7} 100%{transform:translate(var(--cbx),calc(var(--cby) - 60px)) scale(1.5);opacity:0} }
      @keyframes hh-feather { 0%{transform:translate(var(--fx),var(--fy)) rotate(var(--fr)) scale(0.4);opacity:0} 20%{opacity:1} 80%{transform:translate(var(--fx),calc(var(--fy) - 55px)) rotate(calc(var(--fr) + 20deg)) scale(1);opacity:0.7} 100%{transform:translate(var(--fx),calc(var(--fy) - 80px)) rotate(calc(var(--fr) + 30deg)) scale(0.5);opacity:0} }
      @keyframes hh-lens-flare { 0%{opacity:0;transform:rotate(calc(var(--lra)*1deg)) scaleX(0)} 25%{opacity:var(--lo);transform:rotate(calc(var(--lra)*1deg)) scaleX(1)} 65%{opacity:var(--lo)} 100%{opacity:0;transform:rotate(calc(var(--lra)*1deg)) scaleX(1.8)} }
      @keyframes hh-spd-streak { 0%{transform:translateX(-80px) skewX(-20deg);opacity:0} 20%{opacity:1} 100%{transform:translateX(80px) skewX(-20deg);opacity:0} }
    </style>
    <filter id="hh-glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <!-- star rays -->
    <g style="transform-origin:100px 108px;">
      <line x1="100" y1="108" x2="100" y2="30" stroke="#80ffee" stroke-width="3" stroke-linecap="round" style="--ray:0;   transform-origin:100px 108px; animation:hh-star-ray 2600ms ease-out forwards;"/>
      <line x1="100" y1="108" x2="100" y2="30" stroke="#00d4b4" stroke-width="2.5" stroke-linecap="round" style="--ray:45;  transform-origin:100px 108px; animation:hh-star-ray 2600ms ease-out forwards 100ms;"/>
      <line x1="100" y1="108" x2="100" y2="30" stroke="#80ffee" stroke-width="3" stroke-linecap="round" style="--ray:90;  transform-origin:100px 108px; animation:hh-star-ray 2600ms ease-out forwards 200ms;"/>
      <line x1="100" y1="108" x2="100" y2="30" stroke="#00d4b4" stroke-width="2.5" stroke-linecap="round" style="--ray:135; transform-origin:100px 108px; animation:hh-star-ray 2600ms ease-out forwards 300ms;"/>
      <line x1="100" y1="108" x2="100" y2="30" stroke="#80ffee" stroke-width="3" stroke-linecap="round" style="--ray:180; transform-origin:100px 108px; animation:hh-star-ray 2600ms ease-out forwards 400ms;"/>
      <line x1="100" y1="108" x2="100" y2="30" stroke="#00d4b4" stroke-width="2.5" stroke-linecap="round" style="--ray:225; transform-origin:100px 108px; animation:hh-star-ray 2600ms ease-out forwards 500ms;"/>
      <line x1="100" y1="108" x2="100" y2="30" stroke="#80ffee" stroke-width="3" stroke-linecap="round" style="--ray:270; transform-origin:100px 108px; animation:hh-star-ray 2600ms ease-out forwards 600ms;"/>
      <line x1="100" y1="108" x2="100" y2="30" stroke="#00d4b4" stroke-width="2.5" stroke-linecap="round" style="--ray:315; transform-origin:100px 108px; animation:hh-star-ray 2600ms ease-out forwards 700ms;"/>
    </g>
    <!-- center star bloom -->
    <g style="transform-origin:100px 108px; animation:hh-star-burst 2600ms ease-out forwards 200ms;" filter="url(#hh-glow)">
      <polygon points="100,82 104,100 122,100 108,112 113,130 100,120 87,130 92,112 78,100 96,100" fill="#80ffee" fill-opacity="0.9"/>
    </g>
    <!-- heal waves -->
    <circle cx="100" cy="108" r="5" fill="none" stroke="#44ffbb" stroke-width="5" style="animation:hh-heal-wave 2600ms ease-out forwards 400ms;"/>
    <circle cx="100" cy="108" r="5" fill="none" stroke="#00d4b4" stroke-width="3" style="animation:hh-heal-wave 2600ms ease-out forwards 700ms;"/>
    <!-- cleanse bubbles -->
    <circle cx="100" cy="108" r="8" fill="#80ffee" fill-opacity="0.3" stroke="#80ffee" stroke-width="1" style="--cbx:-35px; --cby:-30px; animation:hh-cleanse-bubble 2600ms ease-out forwards 600ms;"/>
    <circle cx="100" cy="108" r="6" fill="#00d4b4" fill-opacity="0.25" stroke="#00d4b4" stroke-width="1" style="--cbx:38px; --cby:-25px; animation:hh-cleanse-bubble 2600ms ease-out forwards 750ms;"/>
    <circle cx="100" cy="108" r="7" fill="#80ffee" fill-opacity="0.2" stroke="#80ffee" stroke-width="1" style="--cbx:-10px; --cby:-40px; animation:hh-cleanse-bubble 2600ms ease-out forwards 900ms;"/>
    <!-- light feathers drifting upward (thin teardrop ellipses) -->
    <ellipse cx="100" cy="108" rx="2" ry="9" fill="#b0fff0" filter="url(#hh-glow)" style="--fx:-32px; --fy:-20px; --fr:-25deg; animation:hh-feather 2600ms cubic-bezier(0.34,1.56,0.64,1) forwards 300ms;"/>
    <ellipse cx="100" cy="108" rx="2" ry="9" fill="#80ffee"                         style="--fx:34px;  --fy:-18px; --fr:28deg;  animation:hh-feather 2600ms cubic-bezier(0.34,1.56,0.64,1) forwards 420ms;"/>
    <ellipse cx="100" cy="108" rx="1.5" ry="7" fill="#44ffcc"                       style="--fx:-48px; --fy:-10px; --fr:-40deg; animation:hh-feather 2600ms cubic-bezier(0.34,1.56,0.64,1) forwards 540ms;"/>
    <ellipse cx="100" cy="108" rx="2" ry="8" fill="#b0fff0"                         style="--fx:50px;  --fy:-8px;  --fr:42deg;  animation:hh-feather 2600ms cubic-bezier(0.34,1.56,0.64,1) forwards 660ms;"/>
    <ellipse cx="100" cy="108" rx="1.5" ry="7" fill="#80ffee"                       style="--fx:-20px; --fy:-35px; --fr:-15deg; animation:hh-feather 2600ms cubic-bezier(0.34,1.56,0.64,1) forwards 780ms;"/>
    <ellipse cx="100" cy="108" rx="2" ry="9" fill="#44ffcc"                         style="--fx:22px;  --fy:-32px; --fr:18deg;  animation:hh-feather 2600ms cubic-bezier(0.34,1.56,0.64,1) forwards 900ms;"/>
    <!-- prismatic lens flare: 6 short coloured lines at 30° intervals -->
    <line x1="100" y1="108" x2="100" y2="78" stroke="#ff6699" stroke-width="2.5" stroke-linecap="round" style="transform-origin:100px 108px; --lra:0;   --lo:0.7; animation:hh-lens-flare 2600ms ease-out forwards 800ms;"/>
    <line x1="100" y1="108" x2="100" y2="78" stroke="#ffaa22" stroke-width="2" stroke-linecap="round"   style="transform-origin:100px 108px; --lra:60;  --lo:0.65; animation:hh-lens-flare 2600ms ease-out forwards 860ms;"/>
    <line x1="100" y1="108" x2="100" y2="78" stroke="#ffff44" stroke-width="2" stroke-linecap="round"   style="transform-origin:100px 108px; --lra:120; --lo:0.6; animation:hh-lens-flare 2600ms ease-out forwards 920ms;"/>
    <line x1="100" y1="108" x2="100" y2="78" stroke="#44ffaa" stroke-width="2" stroke-linecap="round"   style="transform-origin:100px 108px; --lra:180; --lo:0.65; animation:hh-lens-flare 2600ms ease-out forwards 980ms;"/>
    <line x1="100" y1="108" x2="100" y2="78" stroke="#44aaff" stroke-width="2" stroke-linecap="round"   style="transform-origin:100px 108px; --lra:240; --lo:0.6; animation:hh-lens-flare 2600ms ease-out forwards 1040ms;"/>
    <line x1="100" y1="108" x2="100" y2="78" stroke="#cc66ff" stroke-width="2.5" stroke-linecap="round" style="transform-origin:100px 108px; --lra:300; --lo:0.7; animation:hh-lens-flare 2600ms ease-out forwards 1100ms;"/>
    <!-- speed streaks -->
    <line x1="40" y1="162" x2="80" y2="162" stroke="#80ffee" stroke-width="2" stroke-linecap="round" style="animation:hh-spd-streak 2600ms ease-out forwards 1100ms;"/>
    <line x1="40" y1="168" x2="70" y2="168" stroke="#00d4b4" stroke-width="1.5" style="animation:hh-spd-streak 2600ms ease-out forwards 1200ms;"/>
    <text x="88" y="167" fill="#80ffee" font-size="9" font-family="monospace">SPD+</text>`;
    return s;
  }},

  // Lancing Strike
  'lancing_strike': { duration: 1900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes ls-lance-charge { 0% { transform: translateY(-110px) scaleY(0.3); opacity: 0; } 18% { transform: translateY(-110px) scaleY(1); opacity: 1; } 45% { transform: translateY(90px) scaleY(1); opacity: 1; } 65% { transform: translateY(90px) scaleY(1); opacity: 0.6; } 100% { transform: translateY(90px) scaleY(0.4); opacity: 0; } }
      @keyframes ls-anemo-ring { 0% { stroke-dashoffset: 300; opacity: 0; } 40% { opacity: 0; } 45% { stroke-dashoffset: 300; opacity: 0; } 50% { opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }
      @keyframes ls-pierce-crack { 0%, 44% { opacity: 0; } 45% { opacity: 1; stroke-dashoffset: 80; } 80% { stroke-dashoffset: 0; opacity: 1; } 100% { opacity: 0; } }
      @keyframes ls-wind-streak { 0% { transform: translate(var(--wsx), var(--wsy)) scaleX(0); opacity: 0; } 35% { opacity: 0; } 45% { transform: translate(var(--wsx), var(--wsy)) scaleX(0); opacity: 1; } 80% { transform: translate(0, 0) scaleX(1); opacity: 1; } 100% { opacity: 0; } }
      @keyframes ls-impact-flash { 0%, 43% { opacity: 0; } 46% { opacity: 0.8; } 55% { opacity: 0; } 100% { opacity: 0; } }
    </style></defs><defs><filter id="ls-glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="ls-lance-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#aaffdd"/><stop offset="50%" stop-color="#22bb88"/><stop offset="100%" stop-color="#22bb88" stop-opacity="0"/></linearGradient></defs><!-- lance body --><rect x="97" y="25" width="6" height="90" fill="url(#ls-lance-grad)" rx="3" filter="url(#ls-glow)" style="animation: ls-lance-charge 1900ms cubic-bezier(0.1,0.8,0.3,1) forwards;"/><!-- lance tip diamond --><polygon points="100,22 95,38 100,32 105,38" fill="#aaffdd" filter="url(#ls-glow)" style="animation: ls-lance-charge 1900ms cubic-bezier(0.1,0.8,0.3,1) forwards;"/><!-- anemo ring at bottom --><circle cx="100" cy="120" r="5" fill="none" stroke="#66ffcc" stroke-width="3" stroke-dasharray="300" stroke-dashoffset="300" style="animation: ls-anemo-ring 1900ms ease-out forwards;"/><!-- pierce crack lines --><line x1="100" y1="118" x2="135" y2="145" stroke="#aaffdd" stroke-width="1.5" stroke-dasharray="80" stroke-dashoffset="80" style="animation: ls-pierce-crack 1900ms ease-out forwards;"/><line x1="100" y1="118" x2="65" y2="145" stroke="#66ffcc" stroke-width="1.5" stroke-dasharray="80" stroke-dashoffset="80" style="animation: ls-pierce-crack 1900ms ease-out forwards 100ms;"/><line x1="100" y1="118" x2="140" y2="110" stroke="#aaffdd" stroke-width="1" stroke-dasharray="50" stroke-dashoffset="50" style="animation: ls-pierce-crack 1900ms ease-out forwards 180ms;"/><!-- wind streaks --><line x1="130" y1="80" x2="155" y2="72" stroke="#66ffcc" stroke-width="2" style="--wsx:30px; --wsy:-28px; animation: ls-wind-streak 1900ms ease-out forwards;"/><line x1="145" y1="95" x2="168" y2="90" stroke="#22bb88" stroke-width="1.5" style="--wsx:45px; --wsy:-13px; animation: ls-wind-streak 1900ms ease-out forwards 100ms;"/><line x1="55" y1="80" x2="30" y2="72" stroke="#66ffcc" stroke-width="2" style="--wsx:-30px; --wsy:-28px; animation: ls-wind-streak 1900ms ease-out forwards 50ms;"/><!-- DEF pierce label --><text x="42" y="52" fill="#aaffdd" font-size="8" font-family="monospace" style="animation: ls-impact-flash 1900ms ease-out forwards;">DEF PIERCE 20%</text><!-- impact flash --><circle cx="100" cy="118" r="20" fill="#aaffdd" fill-opacity="0.5" style="animation: ls-impact-flash 1900ms ease-out forwards;"/>`;
    return s;
  }},

  // Yaksha Valor
  'yaksha_valor_active': { duration: 2300, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes yv-shield-form { 0% { transform: scale(0.2) rotate(-10deg); opacity: 0; } 25% { transform: scale(1.05) rotate(2deg); opacity: 1; } 50% { transform: scale(1) rotate(0deg); opacity: 1; } 80% { opacity: 1; } 100% { transform: scale(1.1) rotate(0deg); opacity: 0; } }
      @keyframes yv-reflect-pulse { 0%, 100% { opacity: 0.2; r: 50; } 50% { opacity: 0.7; r: 56; } }
      @keyframes yv-damage-reduce { 0% { r: 3; stroke-width: 6; opacity: 1; fill-opacity: 0.5; } 100% { r: 60; stroke-width: 0.5; opacity: 0; fill-opacity: 0; } }
      @keyframes yv-reflect-arrow { 0% { transform: translate(var(--rax), var(--ray2)); opacity: 0; } 40% { opacity: 1; } 80% { transform: translate(calc(var(--rax) * -0.6), calc(var(--ray2) * -0.6)); opacity: 1; } 100% { transform: translate(calc(var(--rax) * -1.2), calc(var(--ray2) * -1.2)); opacity: 0; } }
    </style></defs><defs><filter id="yv-glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><!-- shield shape --><g style="transform-origin:100px 105px; animation: yv-shield-form 2300ms ease-out forwards;" filter="url(#yv-glow)"><path d="M100,62 L132,80 L132,118 C132,135 100,148 100,148 C100,148 68,135 68,118 L68,80 Z" fill="#004422" fill-opacity="0.7" stroke="#66ffcc" stroke-width="2.5"/><!-- yaksha mask design inside shield --><ellipse cx="93" cy="95" rx="5" ry="6" fill="#22bb88" fill-opacity="0.6"/><ellipse cx="107" cy="95" rx="5" ry="6" fill="#22bb88" fill-opacity="0.6"/><path d="M88,108 Q100,116 112,108" fill="none" stroke="#66ffcc" stroke-width="1.5"/></g><!-- reflect pulse ring --><circle cx="100" cy="108" r="50" fill="none" stroke="#66ffcc" stroke-width="1.5" style="animation: yv-reflect-pulse 800ms ease-in-out infinite;"/><!-- damage reduction ring --><circle cx="100" cy="108" r="3" fill="#aaffdd" fill-opacity="0.6" style="animation: yv-damage-reduce 2300ms ease-out forwards 400ms;"/><!-- reflect arrow indicators --><g style="--rax:-50px; --ray2:-30px; animation: yv-reflect-arrow 2300ms ease-out forwards 900ms;"><line x1="140" y1="75" x2="125" y2="88" stroke="#66ffcc" stroke-width="2" marker-end="url(#arrowhead)"/><polygon points="125,88 121,80 130,82" fill="#66ffcc"/></g><!-- damage reduction label --><text x="40" y="52" fill="#aaffdd" font-size="8" font-family="monospace" style="animation: yv-shield-form 2300ms ease-out forwards 500ms;">DMG -25% | REFLECT 15%</text>`;
    return s;
  }},

  // Karmic Barrier
  'karmic_barrier': { duration: 2600, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes kb-ward-expand { 0% { transform: scale(0.1); opacity: 0; } 20% { transform: scale(1.08); opacity: 1; } 40% { transform: scale(1); opacity: 1; } 75% { opacity: 1; } 100% { transform: scale(1.15); opacity: 0; } }
      @keyframes kb-barrier-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes kb-def-ring { 0% { stroke-dashoffset: 700; opacity: 0; } 15% { opacity: 1; } 70% { stroke-dashoffset: 0; opacity: 1; } 100% { opacity: 0; } }
      @keyframes kb-rune-appear { 0% { opacity: 0; transform: scale(0); } 30% { opacity: 1; transform: scale(1); } 70% { opacity: 1; } 100% { opacity: 0; } }
    </style></defs><defs><filter id="kb-glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><!-- ward hexagon expanding --><polygon points="100,55 132,72 132,110 100,127 68,110 68,72" fill="#004422" fill-opacity="0.5" stroke="#66ffcc" stroke-width="2.5" filter="url(#kb-glow)" style="transform-origin:100px 108px; animation: kb-ward-expand 2600ms ease-out forwards;"/><!-- inner ward ring --><polygon points="100,68 122,79 122,103 100,114 78,103 78,79" fill="none" stroke="#22bb88" stroke-width="1.5" style="transform-origin:100px 108px; animation: kb-ward-expand 2600ms ease-out forwards 200ms;"/><!-- spinning karmic runes --><g style="transform-origin:100px 108px; animation: kb-barrier-spin 3s linear infinite;"><rect x="96" y="42" width="8" height="8" fill="#66ffcc" fill-opacity="0.8" rx="1" filter="url(#kb-glow)"/><rect x="96" y="42" width="8" height="8" fill="#66ffcc" fill-opacity="0.8" rx="1" transform="rotate(60 100 108)"/><rect x="96" y="42" width="8" height="8" fill="#66ffcc" fill-opacity="0.8" rx="1" transform="rotate(120 100 108)"/><rect x="96" y="42" width="8" height="8" fill="#aaffdd" fill-opacity="0.7" rx="1" transform="rotate(180 100 108)"/><rect x="96" y="42" width="8" height="8" fill="#aaffdd" fill-opacity="0.7" rx="1" transform="rotate(240 100 108)"/><rect x="96" y="42" width="8" height="8" fill="#aaffdd" fill-opacity="0.7" rx="1" transform="rotate(300 100 108)"/></g><!-- DEF ring building --><circle cx="100" cy="108" r="65" fill="none" stroke="#66ffcc" stroke-width="2" stroke-dasharray="700" stroke-dashoffset="700" style="animation: kb-def-ring 2600ms ease-out forwards 200ms;"/><!-- DEF label --><text x="53" y="50" fill="#aaffdd" font-size="9" font-family="monospace" style="animation: kb-rune-appear 2600ms ease-out forwards 500ms;">PARTY DEF +40%</text><text x="62" y="168" fill="#66ffcc" font-size="8" font-family="monospace" style="animation: kb-rune-appear 2600ms ease-out forwards 700ms;">DMG WARD ACTIVE</text>`;
    return s;
  }},

  // Mastery of Pain
  'mastery_of_pain': { duration: 2900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200');
    s.setAttribute('width', '200');
    s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes mp-def-crystal { 0% { transform: translate(0,0) rotate(0deg) scale(1); opacity: 0; } 10% { opacity: 1; } 60% { transform: translate(var(--dcx), var(--dcy)) rotate(180deg) scale(0.9); opacity: 1; } 100% { transform: translate(var(--dcx), var(--dcy)) rotate(360deg) scale(0.2); opacity: 0; } }
      @keyframes mp-karmic-charge { 0% { transform: scale(0); opacity: 0; filter: blur(6px); } 20% { transform: scale(0.6); opacity: 1; filter: blur(2px); } 45% { transform: scale(1); opacity: 1; filter: blur(0); } 60% { transform: scale(1.05); } 100% { transform: scale(2.5); opacity: 0; } }
      @keyframes mp-shockwave { 0%, 44% { r: 5; opacity: 0; } 45% { r: 5; opacity: 1; stroke-width: 10; } 100% { r: 95; opacity: 0; stroke-width: 0.5; } }
      @keyframes mp-guard-mark { 0% { transform: translate(35px, -45px) scale(0); opacity: 0; } 55% { transform: translate(35px, -45px) scale(0); opacity: 0; } 65% { transform: translate(35px, -45px) scale(1.2); opacity: 1; } 80% { transform: translate(35px, -45px) scale(1); opacity: 1; } 100% { opacity: 0; } }
    </style></defs><defs><filter id="mp-glow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="mp-core-grad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="35%" stop-color="#aaffdd"/><stop offset="70%" stop-color="#22bb88"/><stop offset="100%" stop-color="#004422" stop-opacity="0"/></radialGradient></defs><!-- DEF crystal orbs gathering --><polygon points="100,108 96,100 88,98 94,92 92,84 100,88 108,84 106,92 112,98 104,100" fill="#22bb88" style="--dcx:-45px; --dcy:-35px; transform-origin:100px 108px; animation: mp-def-crystal 2900ms ease-in forwards 100ms;"/><polygon points="100,108 96,100 88,98 94,92 92,84 100,88 108,84 106,92 112,98 104,100" fill="#66ffcc" style="--dcx:48px; --dcy:-30px; transform-origin:100px 108px; animation: mp-def-crystal 2900ms ease-in forwards 150ms;"/><polygon points="100,108 96,100 88,98 94,92 92,84 100,88 108,84 106,92 112,98 104,100" fill="#aaffdd" style="--dcx:-38px; --dcy:45px; transform-origin:100px 108px; animation: mp-def-crystal 2900ms ease-in forwards 200ms;"/><polygon points="100,108 96,100 88,98 94,92 92,84 100,88 108,84 106,92 112,98 104,100" fill="#22bb88" style="--dcx:42px; --dcy:40px; transform-origin:100px 108px; animation: mp-def-crystal 2900ms ease-in forwards 250ms;"/><!-- core karmic sphere charging --><circle cx="100" cy="108" r="4" fill="url(#mp-core-grad)" filter="url(#mp-glow)" style="animation: mp-karmic-charge 2900ms ease-in-out forwards 300ms;"/><!-- shockwave --><circle cx="100" cy="108" r="5" fill="none" stroke="#ffffff" stroke-width="10" style="animation: mp-shockwave 2900ms ease-out forwards;"/><circle cx="100" cy="108" r="5" fill="none" stroke="#aaffdd" stroke-width="5" style="animation: mp-shockwave 2900ms ease-out forwards 200ms;"/><!-- guard mark stamp --><g style="animation: mp-guard-mark 2900ms ease-out forwards;"><polygon points="135,55 145,65 145,80 135,88 125,80 125,65" fill="#004422" fill-opacity="0.8" stroke="#66ffcc" stroke-width="2"/><text x="127" y="75" fill="#aaffdd" font-size="7" font-family="monospace" font-weight="bold">GRD</text></g><!-- DEF SCALE text --><text x="42" y="50" fill="#66ffcc" font-size="8" font-family="monospace" style="animation: mp-guard-mark 2900ms ease-out forwards 400ms;">DEF SCALE 3.5×</text>`;
    return s;
  }},



  /* ════════════════════════════════════════════════════════════════════════
     NEW CHARACTERS: RYDIA (Summoner) • LENNETH (Valkyrie) • KAIN (Dragoon) • LEON (King)
  ════════════════════════════════════════════════════════════════════════ */

  // ─ RYDIA (SUMMONER) ─────────────────────────────────────────────────
  // Summon Bahamut — Shadow Passthrough + Megaflare
  'summon_bahamut': { duration: 2600, screenShake: 380, shakeDelay: 1200, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes sb-dim{0%{opacity:0}25%{opacity:0.55}50%{opacity:0.7}58%{opacity:0}100%{opacity:0}}
      @keyframes sb-shadow-pass{0%{transform:translateX(-160px) scaleX(0.4);opacity:0}10%{opacity:0.7}55%{transform:translateX(180px) scaleX(1);opacity:0.5}70%{opacity:0}100%{opacity:0}}
      @keyframes sb-wing-pass{0%{transform:translateX(-180px);opacity:0}10%{opacity:0.5}55%{transform:translateX(200px);opacity:0.35}65%{opacity:0}100%{opacity:0}}
      @keyframes sb-megaflare{0%,54%{opacity:0}56%{opacity:0.95}68%{opacity:0.4}100%{opacity:0}}
      @keyframes sb-fire-ring{0%{r:8;opacity:1;stroke-width:4}100%{r:92;opacity:0;stroke-width:0.3}}
      @keyframes sb-ember{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--fx),var(--fy)) scale(0);opacity:0}}
    </style>
    <filter id="sb-glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="sb-blur"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    <!-- PHASE 1: screen dims as dragon shadow sweeps through -->
    <rect x="0" y="0" width="200" height="200" fill="#1a0800" style="animation:sb-dim 2600ms ease-in-out forwards;"/>
    <!-- dragon body silhouette sweeping left to right -->
    <g style="animation:sb-shadow-pass 2600ms cubic-bezier(0.3,0,0.7,1) forwards;" filter="url(#sb-blur)">
      <ellipse cx="100" cy="75" rx="32" ry="22" fill="#0d0400" opacity="0.9"/>
      <ellipse cx="100" cy="60" rx="16" ry="12" fill="#0d0400" opacity="0.9"/>
      <!-- head -->
      <circle cx="100" cy="48" r="11" fill="#0d0400" opacity="0.9"/>
      <!-- horns -->
      <polygon points="94,40 88,22 92,38" fill="#0d0400" opacity="0.9"/>
      <polygon points="106,40 112,22 108,38" fill="#0d0400" opacity="0.9"/>
      <!-- tail -->
      <path d="M 132 78 Q 158 70 168 82 Q 178 90 172 98" stroke="#0d0400" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.9"/>
    </g>
    <!-- wing silhouettes -->
    <ellipse cx="65" cy="72" rx="26" ry="16" fill="#0d0400" opacity="0.7" filter="url(#sb-blur)" style="animation:sb-wing-pass 2600ms cubic-bezier(0.3,0,0.7,1) forwards;"/>
    <ellipse cx="135" cy="72" rx="26" ry="16" fill="#0d0400" opacity="0.7" filter="url(#sb-blur)" style="animation:sb-wing-pass 2600ms cubic-bezier(0.3,0,0.7,1) forwards;"/>
    <!-- PHASE 2: Megaflare — blinding orange-white flash -->
    <rect x="0" y="0" width="200" height="200" fill="#ff8800" style="animation:sb-megaflare 2600ms ease-out forwards;"/>
    <!-- expanding fire rings after the flash -->
    <circle cx="100" cy="105" r="8" fill="none" stroke="#ffffff" stroke-width="6" style="animation:sb-fire-ring 2600ms cubic-bezier(0.1,0.8,0.3,1) forwards 1250ms;"/>
    <circle cx="100" cy="105" r="8" fill="none" stroke="#ff6600" stroke-width="4" style="animation:sb-fire-ring 2600ms cubic-bezier(0.1,0.8,0.3,1) forwards 1450ms;"/>
    <circle cx="100" cy="105" r="8" fill="none" stroke="#ff3300" stroke-width="3" style="animation:sb-fire-ring 2600ms cubic-bezier(0.1,0.8,0.3,1) forwards 1650ms;"/>
    <circle cx="100" cy="105" r="8" fill="none" stroke="#ffaa00" stroke-width="1.5" style="animation:sb-fire-ring 2600ms cubic-bezier(0.1,0.8,0.3,1) forwards 1850ms;"/>
    <!-- embers scattering -->
    <circle cx="100" cy="105" r="4" fill="#ffff00" filter="url(#sb-glow)" style="--fx:-48px;--fy:-52px; animation:sb-ember 2600ms ease-out forwards 1300ms;"/>
    <circle cx="100" cy="105" r="3.5" fill="#ff6600"                      style="--fx:52px; --fy:-48px; animation:sb-ember 2600ms ease-out forwards 1380ms;"/>
    <circle cx="100" cy="105" r="3"   fill="#ff3300"                      style="--fx:-55px;--fy:42px;  animation:sb-ember 2600ms ease-out forwards 1440ms;"/>
    <circle cx="100" cy="105" r="3"   fill="#ffaa00"                      style="--fx:58px; --fy:46px;  animation:sb-ember 2600ms ease-out forwards 1500ms;"/>
    <circle cx="100" cy="105" r="2.5" fill="#ffff00"                      style="--fx:0px;  --fy:-68px; animation:sb-ember 2600ms ease-out forwards 1560ms;"/>
    <circle cx="100" cy="105" r="2"   fill="#ff6600"                      style="--fx:-70px;--fy:0px;   animation:sb-ember 2600ms ease-out forwards 1620ms;"/>`;
    return s;
  }},

  'summon_syldra': { duration: 2200, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes ss-serpent-rise{0%{transform:translateY(80px) scaleY(0.5);opacity:0;}15%{opacity:1;}75%{transform:translateY(-50px) scaleY(1);opacity:1;}100%{transform:translateY(-70px) scaleY(0.9);opacity:0;}}@keyframes ss-water-wave{0%{r:5;opacity:0;}30%{r:5;opacity:1;}100%{r:70;opacity:0;stroke-width:0.3;}}@keyframes ss-bubble-float{0%{transform:translateY(0) scale(1);opacity:1;}100%{transform:translateY(-80px) scale(0.2);opacity:0;}}</style></defs><defs><filter id="ss-glow"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g style="animation:ss-serpent-rise 2200ms cubic-bezier(0.2,0.8,0.3,1) forwards;"><circle cx="100" cy="130" r="10" fill="#00ffff" filter="url(#ss-glow)"/><path d="M 90 130 Q 85 110 90 90 Q 95 70 100 50" stroke="#00ccff" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="100" cy="40" r="8" fill="#00ccff"/><circle cx="96" cy="38" r="2" fill="#ffffff"/><circle cx="104" cy="38" r="2" fill="#ffffff"/><line x1="100" y1="46" x2="100" y2="50" stroke="#ffffff" stroke-width="1"/><polygon points="108,60 115,55 110,70" fill="#0099ff" opacity="0.7"/><polygon points="92,70 85,65 90,80" fill="#0099ff" opacity="0.7"/></g><circle cx="100" cy="120" r="5" fill="none" stroke="#00ffff" stroke-width="3" style="animation:ss-water-wave 2200ms ease-out forwards 600ms;"/><circle cx="100" cy="120" r="5" fill="none" stroke="#0099ff" stroke-width="2" style="animation:ss-water-wave 2200ms ease-out forwards 900ms;"/><circle cx="100" cy="120" r="5" fill="none" stroke="#00ccff" stroke-width="1.5" style="animation:ss-water-wave 2200ms ease-out forwards 1200ms;"/><circle cx="85" cy="100" r="3" fill="#00ffff" filter="url(#ss-glow)" style="animation:ss-bubble-float 2200ms ease-out forwards 400ms;"/><circle cx="115" cy="105" r="2.5" fill="#0099ff" style="animation:ss-bubble-float 2200ms ease-out forwards 600ms;"/><circle cx="100" cy="110" r="2" fill="#00ccff" style="animation:ss-bubble-float 2200ms ease-out forwards 800ms;"/><circle cx="100" cy="100" r="35" fill="#00ffff" fill-opacity="0.15"/>`;
    return s;
  }},

  'eidolon_channel': { duration: 2100, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes ec-rune-orbit{0%{transform:rotate(0deg) translateX(35px);opacity:0;}15%{opacity:1;}100%{transform:rotate(360deg) translateX(35px);opacity:0.3;}}@keyframes ec-glow-pulse{0%,100%{r:20;opacity:0.3;}50%{r:30;opacity:0.7;}}@keyframes ec-energy-vortex{0%{transform:rotate(0deg) scale(1);opacity:1;}100%{transform:rotate(360deg) scale(0.7);opacity:0;}}@keyframes ec-charge-spark{0%{transform:translate(0,0);opacity:0.8;}100%{transform:translate(var(--sx),var(--sy));opacity:0;}}</style></defs><defs><filter id="ec-glow"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="100" cy="100" r="15" fill="#b366ff" filter="url(#ec-glow)"/><g style="transform-origin:100px 100px;animation:ec-rune-orbit 2100ms ease-in-out forwards;"><rect x="128" y="96" width="6" height="8" fill="#9933ff" transform="rotate(45 131 100)" filter="url(#ec-glow)"/></g><g style="transform-origin:100px 100px;animation:ec-rune-orbit 2100ms ease-in-out forwards 350ms;"><rect x="128" y="96" width="6" height="8" fill="#cc66ff" transform="rotate(45 131 100)" filter="url(#ec-glow)"/></g><g style="transform-origin:100px 100px;animation:ec-rune-orbit 2100ms ease-in-out forwards 700ms;"><rect x="128" y="96" width="6" height="8" fill="#9933ff" transform="rotate(45 131 100)" filter="url(#ec-glow)"/></g><circle cx="100" cy="100" r="20" fill="none" stroke="#cc66ff" stroke-width="1" style="animation:ec-glow-pulse 2100ms ease-in-out infinite;"/><circle cx="100" cy="100" r="25" fill="none" stroke="#b366ff" stroke-width="0.5" style="animation:ec-energy-vortex 2100ms ease-out forwards;"/><circle cx="100" cy="100" r="25" fill="none" stroke="#9933ff" stroke-width="0.5" style="animation:ec-energy-vortex 2100ms ease-out forwards 500ms;"/><circle cx="100" cy="100" r="25" fill="none" stroke="#cc66ff" stroke-width="0.5" style="animation:ec-energy-vortex 2100ms ease-out forwards 1000ms;"/><circle cx="100" cy="100" r="2" fill="#ffff99" filter="url(#ec-glow)" style="--sx:-50px;--sy:-30px;animation:ec-charge-spark 2100ms ease-out forwards 600ms;"/><circle cx="100" cy="100" r="2" fill="#ffff99" style="--sx:50px;--sy:-30px;animation:ec-charge-spark 2100ms ease-out forwards 800ms;"/><circle cx="100" cy="100" r="1.5" fill="#ffccff" style="--sx:-40px;--sy:40px;animation:ec-charge-spark 2100ms ease-out forwards 1000ms;"/><circle cx="100" cy="100" r="1.5" fill="#ffccff" style="--sx:40px;--sy:40px;animation:ec-charge-spark 2100ms ease-out forwards 1200ms;"/>`;
    return s;
  }},

  'absolute_summon': { duration: 2700, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes as-phantom-rise{0%{transform:translateY(60px) scale(0);opacity:0;}20%{opacity:1;}75%{transform:translateY(-40px) scale(1);opacity:0.8;}100%{transform:translateY(-50px) scale(0.9);opacity:0;}}@keyframes as-aura-expand{0%{r:10;opacity:1;stroke-width:3;}100%{r:95;opacity:0;stroke-width:0.2;}}@keyframes as-shimmer{0%,100%{opacity:0.3;}50%{opacity:0.8;}}@keyframes as-cosmic-swirl{0%{transform:rotate(0deg);}100%{transform:rotate(720deg);}}</style></defs><defs><filter id="as-glow"><feGaussianBlur stdDeviation="6"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g style="animation:as-phantom-rise 2700ms cubic-bezier(0.1,0.6,0.2,1) forwards;"><ellipse cx="100" cy="80" rx="18" ry="32" fill="#cc99ff" fill-opacity="0.7" filter="url(#as-glow)"/><circle cx="100" cy="65" r="10" fill="#9966ff" opacity="0.8"/><circle cx="95" cy="62" r="2.5" fill="#ffff99" filter="url(#as-glow)"/><circle cx="105" cy="62" r="2.5" fill="#ffff99" filter="url(#as-glow)"/><ellipse cx="100" cy="95" rx="14" ry="18" fill="#cc66ff" opacity="0.6"/><line x1="88" y1="90" x2="75" y2="95" stroke="#9966ff" stroke-width="3" opacity="0.6"/><line x1="112" y1="90" x2="125" y2="95" stroke="#9966ff" stroke-width="3" opacity="0.6"/><circle cx="100" cy="80" r="30" fill="#ffff99" fill-opacity="0.2"/></g><circle cx="100" cy="100" r="10" fill="none" stroke="#ffff99" stroke-width="3" style="animation:as-aura-expand 2700ms ease-out forwards 400ms;"/><circle cx="100" cy="100" r="10" fill="none" stroke="#cc66ff" stroke-width="2" style="animation:as-aura-expand 2700ms ease-out forwards 700ms;"/><circle cx="100" cy="100" r="10" fill="none" stroke="#9966ff" stroke-width="1.5" style="animation:as-aura-expand 2700ms ease-out forwards 1000ms;"/><circle cx="100" cy="100" r="10" fill="none" stroke="#3300ff" stroke-width="1" style="animation:as-aura-expand 2700ms ease-out forwards 1300ms;"/><circle cx="100" cy="100" r="45" fill="none" stroke="#ffff99" stroke-width="0.5" style="animation:as-cosmic-swirl 2700ms linear forwards 500ms;"/><circle cx="100" cy="100" r="35" fill="none" stroke="#ffff99" stroke-width="0.3" style="animation:as-cosmic-swirl 2700ms linear reverse forwards 600ms;"/><circle cx="100" cy="100" r="40" fill="#ffff99" opacity="0.1" style="animation:as-shimmer 2700ms ease-in-out infinite;"/>`;
    return s;
  }},

  // ─ LENNETH (VALKYRIE) ──────────────────────────────────────────────
  'valkyrie_strike': { duration: 1800, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes vs-slash{0%{transform:rotate(-45deg) translateX(-80px);opacity:0;}10%{opacity:1;}70%{transform:rotate(45deg) translateX(80px);opacity:0.8;}100%{opacity:0;}}@keyframes vs-light-spark{0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:translate(var(--lx),var(--ly)) scale(0);opacity:0;}}@keyframes vs-holy-ring{0%{r:4;opacity:0;}40%{r:4;opacity:1;}100%{r:60;opacity:0;}}</style></defs><defs><filter id="vs-glow"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="97" y="20" width="6" height="100" fill="#ffffff" filter="url(#vs-glow)" style="animation:vs-slash 1800ms cubic-bezier(0.2,0.8,0.2,1) forwards;"/><rect x="94" y="20" width="12" height="100" fill="#ffff99" fill-opacity="0.2" style="animation:vs-slash 1800ms cubic-bezier(0.2,0.8,0.2,1) forwards;"/><polygon points="100,15 96,28 104,28" fill="#ffff00" filter="url(#vs-glow)" style="animation:vs-slash 1800ms cubic-bezier(0.2,0.8,0.2,1) forwards;"/><circle cx="100" cy="100" r="2" fill="#ffff99" filter="url(#vs-glow)" style="--lx:-40px;--ly:-40px;animation:vs-light-spark 1800ms ease-out forwards 200ms;"/><circle cx="100" cy="100" r="1.5" fill="#ffff00" style="--lx:40px;--ly:-40px;animation:vs-light-spark 1800ms ease-out forwards 350ms;"/><circle cx="100" cy="100" r="1.5" fill="#ffff99" style="--lx:-35px;--ly:45px;animation:vs-light-spark 1800ms ease-out forwards 500ms;"/><circle cx="100" cy="100" r="2" fill="#ffff00" style="--lx:35px;--ly:45px;animation:vs-light-spark 1800ms ease-out forwards 650ms;"/><circle cx="100" cy="120" r="4" fill="none" stroke="#ffff99" stroke-width="2" style="animation:vs-holy-ring 1800ms ease-out forwards 700ms;"/>`;
    return s;
  }},

  // Judgment Seal — Rune Chains Vortex
  'judgment_seal': { duration: 2200, screenShake: 300, shakeDelay: 1380, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes js-ring-draw{0%{stroke-dashoffset:220;opacity:0}10%{opacity:1}100%{stroke-dashoffset:0;opacity:0.8}}
      @keyframes js-ring-spin{0%{transform:rotate(0deg);opacity:0}8%{opacity:1}100%{transform:rotate(var(--spin));opacity:0.7}}
      @keyframes js-rune-orbit{0%{transform:rotate(calc(var(--ra)*1deg)) translateX(38px) scale(0.5);opacity:0}15%{opacity:1;transform:rotate(calc(var(--ra)*1deg)) translateX(38px) scale(1)}85%{transform:rotate(calc((var(--ra)+270)*1deg)) translateX(38px) scale(0.9);opacity:1}100%{transform:rotate(calc((var(--ra)+360)*1deg)) translateX(5px) scale(0);opacity:0}}
      @keyframes js-chain{0%,40%{stroke-dashoffset:90;opacity:0}42%{opacity:1}85%{stroke-dashoffset:0;opacity:1}100%{opacity:0}}
      @keyframes js-bind-flash{0%,84%{opacity:0}86%{opacity:0.8}92%{opacity:0.3}100%{opacity:0}}
      @keyframes js-debuff-text{0%{transform:translateY(0) scale(0.5);opacity:0}30%{opacity:1}100%{transform:translateY(-40px) scale(1);opacity:0}}
    </style>
    <filter id="js-glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="js-rglow"><feGaussianBlur stdDeviation="6" result="b"/><feColorMatrix in="b" type="matrix" values="1 0 0 0 0.5  0 0 0 0 0  0 0 0 0 0.3  0 0 0 1 0" result="rc"/><feMerge><feMergeNode in="rc"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <!-- outer rune ring drawing itself while rotating -->
    <g style="transform-origin:100px 108px; --spin:320deg; animation:js-ring-spin 2200ms ease-out forwards;">
      <circle cx="100" cy="108" r="48" fill="none" stroke="#aa0099" stroke-width="1.5" stroke-dasharray="220" stroke-dashoffset="220" style="animation:js-ring-draw 2200ms ease-out forwards;"/>
    </g>
    <!-- inner rune ring spinning opposite direction -->
    <g style="transform-origin:100px 108px; --spin:-240deg; animation:js-ring-spin 2200ms ease-out forwards 150ms;">
      <circle cx="100" cy="108" r="30" fill="none" stroke="#ff0099" stroke-width="1" stroke-dasharray="220" stroke-dashoffset="220" style="animation:js-ring-draw 2200ms ease-out forwards 150ms;"/>
    </g>
    <!-- orbiting rune particles that spiral inward -->
    <rect x="96" y="66" width="8" height="8" fill="#ff0099" rx="1" filter="url(#js-glow)" style="transform-origin:100px 108px; --ra:0;   animation:js-rune-orbit 2200ms cubic-bezier(0.34,1.56,0.64,1) forwards 200ms;"/>
    <rect x="96" y="66" width="8" height="8" fill="#cc0077" rx="1"                       style="transform-origin:100px 108px; --ra:90;  animation:js-rune-orbit 2200ms cubic-bezier(0.34,1.56,0.64,1) forwards 280ms;"/>
    <rect x="96" y="66" width="8" height="8" fill="#ff0099" rx="1" filter="url(#js-glow)" style="transform-origin:100px 108px; --ra:180; animation:js-rune-orbit 2200ms cubic-bezier(0.34,1.56,0.64,1) forwards 360ms;"/>
    <rect x="96" y="66" width="8" height="8" fill="#cc0077" rx="1"                       style="transform-origin:100px 108px; --ra:270; animation:js-rune-orbit 2200ms cubic-bezier(0.34,1.56,0.64,1) forwards 440ms;"/>
    <rect x="96" y="66" width="6" height="6" fill="#ff66cc" rx="1"                       style="transform-origin:100px 108px; --ra:45;  animation:js-rune-orbit 2200ms cubic-bezier(0.34,1.56,0.64,1) forwards 320ms;"/>
    <rect x="96" y="66" width="6" height="6" fill="#ff66cc" rx="1"                       style="transform-origin:100px 108px; --ra:225; animation:js-rune-orbit 2200ms cubic-bezier(0.34,1.56,0.64,1) forwards 480ms;"/>
    <!-- chains that emerge from 4 corners and snap to center -->
    <path d="M 52 60 Q 76 84 100 108"  stroke="#ff0099" stroke-width="2.5" stroke-dasharray="90" stroke-dashoffset="90" stroke-linecap="round" style="animation:js-chain 2200ms ease-out forwards;"/>
    <path d="M 148 60 Q 124 84 100 108" stroke="#aa0099" stroke-width="2.5" stroke-dasharray="90" stroke-dashoffset="90" stroke-linecap="round" style="animation:js-chain 2200ms ease-out forwards 80ms;"/>
    <path d="M 52 156 Q 76 132 100 108" stroke="#ff0099" stroke-width="2.5" stroke-dasharray="90" stroke-dashoffset="90" stroke-linecap="round" style="animation:js-chain 2200ms ease-out forwards 120ms;"/>
    <path d="M 148 156 Q 124 132 100 108" stroke="#aa0099" stroke-width="2.5" stroke-dasharray="90" stroke-dashoffset="90" stroke-linecap="round" style="animation:js-chain 2200ms ease-out forwards 160ms;"/>
    <!-- bind flash — red glow burst when chains lock -->
    <circle cx="100" cy="108" r="20" fill="#ff0099" fill-opacity="0.35" filter="url(#js-rglow)" style="animation:js-bind-flash 2200ms ease-out forwards;"/>
    <!-- debuff labels -->
    <text x="100" y="82" text-anchor="middle" fill="#ff66cc" font-size="7" font-family="monospace" font-weight="bold" style="animation:js-debuff-text 2200ms ease-out forwards 950ms;">ATK−30%</text>
    <text x="100" y="136" text-anchor="middle" fill="#cc88ff" font-size="7" font-family="monospace" font-weight="bold" style="animation:js-debuff-text 2200ms ease-out forwards 1150ms;">DEF−20%</text>`;
    return s;
  }},

  'transcendent_power': { duration: 2300, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes tp-wings-spread{0%{transform:scaleX(0);opacity:0;}15%{opacity:1;}80%{transform:scaleX(1);opacity:1;}100%{opacity:0.4;}}@keyframes tp-halo-glow{0%,100%{r:30;opacity:0.2;}50%{r:40;opacity:0.6;}}@keyframes tp-light-ascend{0%{transform:translateY(30px);opacity:0;}30%{opacity:1;}100%{transform:translateY(-60px);opacity:0;}}@keyframes tp-blessing-rain{0%{transform:translateY(-50px);opacity:0;}20%{opacity:1;}100%{transform:translateY(60px);opacity:0;}}</style></defs><defs><filter id="tp-glow"><feGaussianBlur stdDeviation="5"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="100" cy="100" r="12" fill="#ffff99" filter="url(#tp-glow)"/><ellipse cx="70" cy="100" rx="20" ry="35" fill="#ffff99" fill-opacity="0.3" style="animation:tp-wings-spread 2300ms ease-out forwards;"/><ellipse cx="130" cy="100" rx="20" ry="35" fill="#ffff99" fill-opacity="0.3" style="animation:tp-wings-spread 2300ms ease-out forwards 150ms;"/><circle cx="100" cy="100" r="30" fill="none" stroke="#ffff99" stroke-width="1" style="animation:tp-halo-glow 2300ms ease-in-out infinite;"/><line x1="100" y1="30" x2="100" y2="70" stroke="#ffff99" stroke-width="1" opacity="0.6" style="animation:tp-light-ascend 2300ms ease-out forwards 400ms;"/><line x1="130" y1="50" x2="120" y2="85" stroke="#ffff00" stroke-width="0.8" opacity="0.6" style="animation:tp-light-ascend 2300ms ease-out forwards 550ms;"/><line x1="70" y1="50" x2="80" y2="85" stroke="#ffff00" stroke-width="0.8" opacity="0.6" style="animation:tp-light-ascend 2300ms ease-out forwards 700ms;"/><circle cx="80" cy="50" r="2" fill="#ffff99" filter="url(#tp-glow)" style="animation:tp-blessing-rain 2300ms ease-in forwards 500ms;"/><circle cx="100" cy="45" r="1.5" fill="#ffff99" style="animation:tp-blessing-rain 2300ms ease-in forwards 700ms;"/><circle cx="120" cy="50" r="1.5" fill="#ffff00" style="animation:tp-blessing-rain 2300ms ease-in forwards 900ms;"/>`;
    return s;
  }},

  'divine_execution': { duration: 2600, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes de-sword-drop{0%{transform:translateY(-100px) scaleY(0.5);opacity:0;}20%{opacity:1;}70%{transform:translateY(0) scaleY(1);opacity:1;}100%{transform:translateY(40px) scaleY(0.9);opacity:0.3;}}@keyframes de-judgment-ring{0%{r:5;opacity:1;stroke-width:4;}100%{r:95;opacity:0;stroke-width:0.2;}}@keyframes de-light-burst{0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:translate(var(--bx),var(--by)) scale(0);opacity:0;}}@keyframes de-stun-indicator{0%{transform:translateY(0) rotate(0deg);opacity:0;}30%{opacity:1;}100%{transform:translateY(-50px) rotate(180deg);opacity:0;}}</style></defs><defs><filter id="de-glow"><feGaussianBlur stdDeviation="6"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g style="animation:de-sword-drop 2600ms cubic-bezier(0.2,0.8,0.3,1) forwards;"><rect x="97" y="20" width="6" height="100" fill="#ffff99" filter="url(#de-glow)"/><polygon points="100,15 96,25 104,25" fill="#ffff00" filter="url(#de-glow)"/><rect x="90" y="115" width="20" height="8" fill="#8B4513" rx="2"/><rect x="85" y="120" width="30" height="4" fill="#dd8800"/></g><circle cx="100" cy="120" r="5" fill="none" stroke="#ffff99" stroke-width="4" style="animation:de-judgment-ring 2600ms ease-out forwards 800ms;"/><circle cx="100" cy="120" r="5" fill="none" stroke="#ffff00" stroke-width="3" style="animation:de-judgment-ring 2600ms ease-out forwards 1100ms;"/><circle cx="100" cy="120" r="5" fill="none" stroke="#ddaa00" stroke-width="2" style="animation:de-judgment-ring 2600ms ease-out forwards 1400ms;"/><circle cx="100" cy="120" r="3" fill="#ffff99" filter="url(#de-glow)" style="--bx:-50px;--by:-40px;animation:de-light-burst 2600ms ease-out forwards 900ms;"/><circle cx="100" cy="120" r="2.5" fill="#ffff00" style="--bx:50px;--by:-40px;animation:de-light-burst 2600ms ease-out forwards 1000ms;"/><circle cx="100" cy="120" r="2" fill="#ddaa00" style="--bx:-45px;--by:50px;animation:de-light-burst 2600ms ease-out forwards 1100ms;"/><circle cx="100" cy="120" r="2" fill="#ffff99" style="--bx:45px;--by:50px;animation:de-light-burst 2600ms ease-out forwards 1200ms;"/><polygon points="100,60 105,70 115,72 108,78 110,88 100,84 90,88 92,78 85,72 95,70" fill="#ffff00" opacity="0.7" style="animation:de-stun-indicator 2600ms ease-out forwards 1300ms;"/>`;
    return s;
  }},

  // ─ KAIN (DRAGOON) ──────────────────────────────────────────────────
  'dragoon_lance': { duration: 1900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes dl-lance-thrust{0%{transform:translateY(60px);opacity:0;}15%{opacity:1;}60%{transform:translateY(-80px);opacity:1;}100%{opacity:0;}}@keyframes dl-wind-trail{0%{opacity:0;}20%{opacity:0.7;}100%{opacity:0;}}@keyframes dl-speed-boost{0%{transform:translateY(20px) scale(0.5);opacity:0;}30%{opacity:1;}100%{transform:translateY(-40px) scale(1);opacity:0;}}@keyframes dl-sparkles{0%{transform:translate(0,0);opacity:1;}100%{transform:translate(var(--sx),var(--sy));opacity:0;}}</style></defs><defs><filter id="dl-glow"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="97" y="20" width="6" height="120" fill="#0099ff" filter="url(#dl-glow)" style="animation:dl-lance-thrust 1900ms cubic-bezier(0.2,0.7,0.2,1) forwards;"/><polygon points="100,15 96,25 104,25" fill="#00ffff" filter="url(#dl-glow)" style="animation:dl-lance-thrust 1900ms cubic-bezier(0.2,0.7,0.2,1) forwards;"/><line x1="75" y1="70" x2="90" y2="65" stroke="#4ecfff" stroke-width="1" opacity="0.5" style="animation:dl-wind-trail 1900ms ease-out forwards 300ms;"/><line x1="125" y1="60" x2="110" y2="55" stroke="#0099ff" stroke-width="1" opacity="0.5" style="animation:dl-wind-trail 1900ms ease-out forwards 400ms;"/><g style="animation:dl-speed-boost 1900ms ease-out forwards 700ms;"><polygon points="155,100 160,110 150,110" fill="#00ffff" filter="url(#dl-glow)"/><text x="162" y="105" fill="#0099ff" font-size="6" font-family="monospace">SPD+</text></g><circle cx="100" cy="80" r="1.5" fill="#00ffff" filter="url(#dl-glow)" style="--sx:-30px;--sy:-40px;animation:dl-sparkles 1900ms ease-out forwards 500ms;"/><circle cx="100" cy="85" r="1" fill="#4ecfff" style="--sx:30px;--sy:-45px;animation:dl-sparkles 1900ms ease-out forwards 700ms;"/>`;
    return s;
  }},

  'dragon_jump': { duration: 2100, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes dj-dragon-fly{0%{transform:translateY(80px) scale(0.5);opacity:0;}15%{opacity:1;}50%{transform:translateY(-60px) scale(1);opacity:1;}100%{transform:translateY(-80px) scale(0.8);opacity:0;}}@keyframes dj-wind-gust{0%{r:4;opacity:0;}40%{r:4;opacity:1;}100%{r:70;opacity:0;stroke-width:0.3;}}@keyframes dj-evasion-flash{0%,100%{opacity:0;}50%{opacity:0.6;}}@keyframes dj-trail{0%{transform:translate(0,0) scale(1);opacity:0.8;}100%{transform:translate(var(--tx),var(--ty)) scale(0.2);opacity:0;}}</style></defs><defs><filter id="dj-glow"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g style="animation:dj-dragon-fly 2100ms cubic-bezier(0.1,0.7,0.2,1) forwards;"><ellipse cx="100" cy="100" rx="15" ry="20" fill="#0066cc" filter="url(#dj-glow)"/><ellipse cx="80" cy="95" rx="12" ry="15" fill="#0099ff" opacity="0.7"/><ellipse cx="120" cy="95" rx="12" ry="15" fill="#0099ff" opacity="0.7"/><circle cx="100" cy="85" r="8" fill="#003399"/><circle cx="96" cy="83" r="1.5" fill="#00ffff"/><circle cx="104" cy="83" r="1.5" fill="#00ffff"/></g><circle cx="100" cy="120" r="4" fill="none" stroke="#0099ff" stroke-width="2" style="animation:dj-wind-gust 2100ms ease-out forwards 600ms;"/><circle cx="100" cy="120" r="4" fill="none" stroke="#4ecfff" stroke-width="1.5" style="animation:dj-wind-gust 2100ms ease-out forwards 900ms;"/><circle cx="100" cy="140" r="20" fill="#0099ff" fill-opacity="0.1" style="animation:dj-evasion-flash 2100ms ease-in-out infinite 500ms;"/><ellipse cx="100" cy="100" rx="12" ry="16" fill="#4ecfff" opacity="0.3" style="--tx:-40px;--ty:20px;animation:dj-trail 2100ms ease-out forwards 700ms;"/><ellipse cx="100" cy="100" rx="12" ry="16" fill="#0099ff" opacity="0.2" style="--tx:40px;--ty:25px;animation:dj-trail 2100ms ease-out forwards 900ms;"/>`;
    return s;
  }},

  'divine_flight': { duration: 2400, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes df-wings-glow{0%,100%{opacity:0.3;}50%{opacity:0.9;}}@keyframes df-halo-expand{0%{r:30;opacity:1;}100%{r:80;opacity:0;}}@keyframes df-ascend{0%{transform:translateY(30px);opacity:0;}20%{opacity:1;}100%{transform:translateY(-80px);opacity:0;}}@keyframes df-buff-particle{0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:translate(var(--bpx),var(--bpy)) scale(0);opacity:0;}}</style></defs><defs><filter id="df-glow"><feGaussianBlur stdDeviation="5"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="100" cy="100" r="10" fill="#ffff99" filter="url(#df-glow)"/><ellipse cx="70" cy="100" rx="18" ry="30" fill="#ffff99" fill-opacity="0.3" filter="url(#df-glow)" style="animation:df-wings-glow 2400ms ease-in-out infinite;"/><ellipse cx="130" cy="100" rx="18" ry="30" fill="#ffff99" fill-opacity="0.3" filter="url(#df-glow)" style="animation:df-wings-glow 2400ms ease-in-out infinite 200ms;"/><circle cx="100" cy="100" r="30" fill="none" stroke="#ffff99" stroke-width="2" style="animation:df-halo-expand 2400ms ease-out forwards 400ms;"/><rect x="40" y="40" width="120" height="120" fill="#ffff99" opacity="0.05" style="animation:df-ascend 2400ms ease-out forwards 600ms;"/><circle cx="80" cy="120" r="2.5" fill="#ffff99" filter="url(#df-glow)" style="--bpx:0px;--bpy:-80px;animation:df-buff-particle 2400ms ease-out forwards 700ms;"/><circle cx="100" cy="130" r="2" fill="#ffff00" style="--bpx:0px;--bpy:-90px;animation:df-buff-particle 2400ms ease-out forwards 900ms;"/><circle cx="120" cy="125" r="2" fill="#ffff99" style="--bpx:0px;--bpy:-85px;animation:df-buff-particle 2400ms ease-out forwards 1100ms;"/>`;
    return s;
  }},

  'heavens_fall': { duration: 2700, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes hf-meteor-fall{0%{transform:translateY(-120px) scale(0.3) rotate(0deg);opacity:0;}20%{opacity:1;}70%{transform:translateY(40px) scale(1) rotate(360deg);opacity:1;}100%{transform:translateY(60px) scale(0.8) rotate(450deg);opacity:0;}}@keyframes hf-impact-shockwave{0%{r:8;opacity:1;stroke-width:6;}100%{r:100;opacity:0;stroke-width:0.2;}}@keyframes hf-crater-ring{0%{r:4;opacity:0;}40%{r:4;opacity:1;}100%{r:80;opacity:0;}}@keyframes hf-debris{0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:translate(var(--dx),var(--dy)) scale(0.1);opacity:0;}}</style></defs><defs><filter id="hf-glow"><feGaussianBlur stdDeviation="6"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g style="animation:hf-meteor-fall 2700ms cubic-bezier(0.3,0.9,0.2,1) forwards;"><circle cx="100" cy="40" r="16" fill="#ffaa00" filter="url(#hf-glow)"/><circle cx="100" cy="40" r="8" fill="#ffff99" filter="url(#hf-glow)"/><circle cx="100" cy="60" r="6" fill="#ff6600" opacity="0.4"/><circle cx="100" cy="75" r="4" fill="#ff6600" opacity="0.2"/></g><circle cx="100" cy="120" r="8" fill="none" stroke="#ffaa00" stroke-width="6" style="animation:hf-impact-shockwave 2700ms ease-out forwards 1200ms;"/><circle cx="100" cy="120" r="8" fill="none" stroke="#ff6600" stroke-width="4" style="animation:hf-impact-shockwave 2700ms ease-out forwards 1500ms;"/><circle cx="100" cy="120" r="8" fill="none" stroke="#cc3300" stroke-width="2" style="animation:hf-impact-shockwave 2700ms ease-out forwards 1800ms;"/><circle cx="100" cy="120" r="4" fill="none" stroke="#ffaa00" stroke-width="1.5" style="animation:hf-crater-ring 2700ms ease-out forwards 1300ms;"/><circle cx="100" cy="120" r="4" fill="none" stroke="#ff6600" stroke-width="1" style="animation:hf-crater-ring 2700ms ease-out forwards 1600ms;"/><circle cx="100" cy="120" r="3" fill="#ff6600" filter="url(#hf-glow)" style="--dx:-50px;--dy:-50px;animation:hf-debris 2700ms ease-out forwards 1400ms;"/><circle cx="100" cy="120" r="2.5" fill="#ffaa00" style="--dx:50px;--dy:-50px;animation:hf-debris 2700ms ease-out forwards 1500ms;"/><circle cx="100" cy="120" r="2" fill="#cc3300" style="--dx:-60px;--dy:50px;animation:hf-debris 2700ms ease-out forwards 1600ms;"/><circle cx="100" cy="120" r="2" fill="#ff6600" style="--dx:60px;--dy:50px;animation:hf-debris 2700ms ease-out forwards 1700ms;"/>`;
    return s;
  }},

  // ─ LEON (GRAIL GUARDIAN) ───────────────────────────────────────────
  'holy_strike': { duration: 1850, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes hs-sword-swing{0%{transform:rotate(-60deg) translateX(-40px);opacity:0;}10%{opacity:1;}70%{transform:rotate(60deg) translateX(40px);opacity:1;}100%{opacity:0;}}@keyframes hs-holy-trail{0%{opacity:0;}30%{opacity:0.8;}100%{opacity:0;}}@keyframes hs-light-ring{0%{r:5;opacity:0;}40%{r:5;opacity:1;}100%{r:65;opacity:0;}}@keyframes hs-holy-sparks{0%{transform:translate(0,0);opacity:1;}100%{transform:translate(var(--hsx),var(--hsy));opacity:0;}}</style></defs><defs><filter id="hs-glow"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="95" y="30" width="10" height="110" fill="#ffffff" filter="url(#hs-glow)" style="animation:hs-sword-swing 1850ms cubic-bezier(0.2,0.8,0.2,1) forwards;"/><rect x="88" y="30" width="24" height="110" fill="#ffff99" opacity="0.15" style="animation:hs-sword-swing 1850ms cubic-bezier(0.2,0.8,0.2,1) forwards;"/><rect x="90" y="135" width="20" height="10" fill="#d4af37" rx="2" style="animation:hs-sword-swing 1850ms cubic-bezier(0.2,0.8,0.2,1) forwards;"/><ellipse cx="100" cy="80" rx="8" ry="15" fill="#ffff99" opacity="0.4" style="animation:hs-holy-trail 1850ms ease-out forwards 200ms;"/><ellipse cx="100" cy="100" rx="10" ry="20" fill="#ffff00" opacity="0.3" style="animation:hs-holy-trail 1850ms ease-out forwards 400ms;"/><circle cx="100" cy="120" r="5" fill="none" stroke="#ffff99" stroke-width="2" style="animation:hs-light-ring 1850ms ease-out forwards 700ms;"/><circle cx="100" cy="110" r="2" fill="#ffff99" filter="url(#hs-glow)" style="--hsx:-40px;--hsy:-40px;animation:hs-holy-sparks 1850ms ease-out forwards 300ms;"/><circle cx="100" cy="110" r="1.5" fill="#ffff00" style="--hsx:40px;--hsy:-40px;animation:hs-holy-sparks 1850ms ease-out forwards 450ms;"/><circle cx="100" cy="110" r="1.5" fill="#ffff99" style="--hsx:-35px;--hsy:45px;animation:hs-holy-sparks 1850ms ease-out forwards 600ms;"/>`;
    return s;
  }},

  'divine_shield': { duration: 2200, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes dsh-shield-form{0%{transform:scale(0) rotate(-45deg);opacity:0;}20%{opacity:1;}100%{transform:scale(1) rotate(0deg);opacity:0.7;}}@keyframes dsh-shield-glow{0%,100%{opacity:0.3;}50%{opacity:0.8;}}@keyframes dsh-protection-ring{0%{r:8;opacity:0;}30%{opacity:1;}100%{r:90;opacity:0;stroke-width:0.2;}}@keyframes dsh-defense-indicator{0%{transform:translateY(30px);opacity:0;}30%{opacity:1;}100%{transform:translateY(-30px);opacity:0;}}</style></defs><defs><filter id="dsh-glow"><feGaussianBlur stdDeviation="5"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M 100 40 L 140 70 L 135 130 Q 100 160 100 160 Q 65 130 60 130 L 65 70 Z" fill="#ffff99" fill-opacity="0.3" stroke="#ffff00" stroke-width="2" filter="url(#dsh-glow)" style="animation:dsh-shield-form 2200ms cubic-bezier(0.1,0.8,0.2,1) forwards;"/><path d="M 100 45 L 135 70 L 130 125 Q 100 150 100 150 Q 70 125 70 125 L 70 70 Z" fill="#ffff99" fill-opacity="0.2" style="animation:dsh-shield-glow 2200ms ease-in-out infinite 300ms;"/><line x1="100" y1="50" x2="100" y2="150" stroke="#ffff00" stroke-width="1" opacity="0.5" style="animation:dsh-shield-form 2200ms ease-out forwards 200ms;"/><line x1="65" y1="100" x2="135" y2="100" stroke="#ffff00" stroke-width="1" opacity="0.5" style="animation:dsh-shield-form 2200ms ease-out forwards 300ms;"/><circle cx="100" cy="100" r="8" fill="none" stroke="#ffff99" stroke-width="2" style="animation:dsh-protection-ring 2200ms ease-out forwards 500ms;"/><circle cx="100" cy="100" r="8" fill="none" stroke="#ffff00" stroke-width="1.5" style="animation:dsh-protection-ring 2200ms ease-out forwards 800ms;"/><g style="animation:dsh-defense-indicator 2200ms ease-out forwards 1000ms;"><text x="100" y="180" text-anchor="middle" fill="#ffff99" font-size="8" font-family="monospace" font-weight="bold">DEF+45%</text></g>`;
    return s;
  }},

  'grail_blessing': { duration: 2300, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes gb-chalice-rise{0%{transform:translateY(80px) scale(0.3);opacity:0;}15%{opacity:1;}70%{transform:translateY(-30px) scale(1);opacity:1;}100%{transform:translateY(-50px) scale(0.8);opacity:0;}}@keyframes gb-light-flow{0%{r:3;opacity:0;}30%{opacity:1;}100%{r:60;opacity:0;}}@keyframes gb-healing-aura{0%,100%{opacity:0.2;}50%{opacity:0.7;}}@keyframes gb-light-particles{0%{transform:translateY(40px);opacity:0;}30%{opacity:1;}100%{transform:translateY(-60px);opacity:0;}}</style></defs><defs><filter id="gb-glow"><feGaussianBlur stdDeviation="5"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g style="animation:gb-chalice-rise 2300ms cubic-bezier(0.1,0.7,0.2,1) forwards;"><path d="M 90 70 L 85 95 Q 85 105 92 110 L 108 110 Q 115 105 115 95 L 110 70 Z" fill="#ffff99" filter="url(#gb-glow)"/><ellipse cx="100" cy="70" rx="10" ry="5" fill="#ffff99" stroke="#ffdd00" stroke-width="1" opacity="0.8"/><ellipse cx="100" cy="95" rx="8" ry="6" fill="#ffff00" opacity="0.6" filter="url(#gb-glow)"/></g><circle cx="100" cy="100" r="3" fill="none" stroke="#ffff99" stroke-width="2" style="animation:gb-light-flow 2300ms ease-out forwards 600ms;"/><circle cx="100" cy="100" r="3" fill="none" stroke="#ffff00" stroke-width="1.5" style="animation:gb-light-flow 2300ms ease-out forwards 900ms;"/><circle cx="100" cy="100" r="3" fill="none" stroke="#ffdd00" stroke-width="1" style="animation:gb-light-flow 2300ms ease-out forwards 1200ms;"/><circle cx="100" cy="100" r="50" fill="#ffff99" fill-opacity="0.1" style="animation:gb-healing-aura 2300ms ease-in-out infinite;"/><circle cx="80" cy="120" r="2" fill="#ffff99" filter="url(#gb-glow)" style="animation:gb-light-particles 2300ms ease-out forwards 700ms;"/><circle cx="100" cy="125" r="1.5" fill="#ffff00" style="animation:gb-light-particles 2300ms ease-out forwards 900ms;"/><circle cx="120" cy="120" r="1.5" fill="#ffff99" style="animation:gb-light-particles 2300ms ease-out forwards 1100ms;"/>`;
    return s;
  }},

  'lionheart_ascendant': { duration: 2900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes la-seal-slam{0%{transform:translateY(-120px) scale(1.5);opacity:0;}15%{opacity:1;}35%{transform:translateY(10px) scale(1);opacity:1;}45%{transform:translateY(0px) scale(1);opacity:1;}85%{transform:translateY(0px) scale(1);opacity:1;}100%{transform:translateY(20px) scale(0.9);opacity:0;}}@keyframes la-chains{0%{stroke-dashoffset:200;opacity:0;}35%{opacity:0;}45%{opacity:1;stroke-dashoffset:0;}85%{opacity:1;stroke-dashoffset:0;}100%{opacity:0;}}@keyframes la-royal-ring{0%{r:8;opacity:0;stroke-width:8;}35%{r:8;opacity:0;}40%{r:8;opacity:1;stroke-width:6;}100%{r:120;opacity:0;stroke-width:0.5;}}@keyframes la-blessing-cascade{0%{transform:translateY(0) scale(1);opacity:0;}35%{opacity:0;}45%{opacity:1;}100%{transform:translateY(80px) scale(0.3);opacity:0;}}</style></defs><defs><filter id="la-glow"><feGaussianBlur stdDeviation="5"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g style="transform-origin:100px 100px; animation:la-seal-slam 2900ms cubic-bezier(0.1,0.8,0.2,1) forwards;"><polygon points="100,20 130,50 100,80 70,50" fill="#ffd700" fill-opacity="0.8" stroke="#ffffff" stroke-width="2" filter="url(#la-glow)"/><polygon points="100,30 120,50 100,70 80,50" fill="#ffaa00" opacity="0.9"/><circle cx="100" cy="50" r="8" fill="#ffffff" filter="url(#la-glow)"/></g><g style="animation:la-chains 2900ms ease-out forwards;"><path d="M 0 120 L 80 80" stroke="#ffd700" stroke-width="4" stroke-dasharray="200" stroke-dashoffset="200" stroke-linecap="round"/><path d="M 200 120 L 120 80" stroke="#ffd700" stroke-width="4" stroke-dasharray="200" stroke-dashoffset="200" stroke-linecap="round"/><path d="M 100 0 L 100 60" stroke="#ffff99" stroke-width="6" stroke-dasharray="200" stroke-dashoffset="200" stroke-linecap="round"/></g><circle cx="100" cy="75" r="8" fill="none" stroke="#ffd700" stroke-width="6" style="animation:la-royal-ring 2900ms ease-out forwards;"/><circle cx="100" cy="75" r="8" fill="none" stroke="#ffff99" stroke-width="3" style="animation:la-royal-ring 2900ms ease-out forwards 200ms;"/><circle cx="100" cy="100" r="3" fill="#ffd700" filter="url(#la-glow)" style="--bcx:-30px; animation:la-blessing-cascade 2900ms ease-in forwards;"/><circle cx="80" cy="105" r="2" fill="#ffff99" style="--bcx:30px; animation:la-blessing-cascade 2900ms ease-in forwards 100ms;"/><circle cx="120" cy="105" r="2.5" fill="#ffaa00" style="--bcx:-10px; animation:la-blessing-cascade 2900ms ease-in forwards 200ms;"/><circle cx="100" cy="110" r="1.5" fill="#ffd700" style="--bcx:15px; animation:la-blessing-cascade 2900ms ease-in forwards 300ms;"/>`;
    return s;
  }}

};
