const SVGAnimations = {
  // AYAKA - Cryo Bladestorm
  frostblossom: { duration: 1900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes bloomblade{0%{transform:translate(100px,100px)rotate(0deg)scale(0.2);opacity:0}30%{opacity:1;transform:translate(100px,100px)rotate(90deg)scale(1)}100%{transform:translate(100px,100px)rotate(720deg)scale(1.3);opacity:0}}
      @keyframes petal{0%{opacity:0;transform:translate(0,-25px)scale(0.2)}50%{opacity:1}100%{opacity:0;transform:translate(0,35px)scale(1)rotate(180deg)}}
      @keyframes crystalrain{0%{opacity:0;transform:translate(0,-30px)}100%{opacity:0;transform:translate(0,40px)rotate(360deg)}}
      @keyframes shimmer{0%{opacity:0}50%{opacity:0.8}100%{opacity:0}}
    </style></defs>
    <g style="animation:bloomblade 1900ms ease-out forwards">
      <polygon points="100,60 115,85 100,110 85,85" fill="#4ecfff" stroke="#7dd3fc" stroke-width="1"/>
      <polygon points="100,50 120,100 100,150 80,100" fill="none" stroke="#7dd3fc" stroke-width="2"/>
      <line x1="100" y1="40" x2="100" y2="160" stroke="#7dd3fc" stroke-width="1.5" opacity="0.6"/>
      <line x1="60" y1="100" x2="140" y2="100" stroke="#7dd3fc" stroke-width="1.5" opacity="0.6"/>
    </g>
    <circle cx="100" cy="70" r="5" fill="#4ecfff" style="animation:petal 1900ms ease-out forwards 100ms"/>
    <circle cx="130" cy="100" r="5" fill="#4ecfff" style="animation:petal 1900ms ease-out forwards 250ms"/>
    <circle cx="100" cy="130" r="5" fill="#4ecfff" style="animation:petal 1900ms ease-out forwards 400ms"/>
    <circle cx="70" cy="100" r="5" fill="#4ecfff" style="animation:petal 1900ms ease-out forwards 550ms"/>
    <circle cx="85" cy="75" r="3" fill="#7dd3fc" style="animation:crystalrain 1900ms ease-out forwards 300ms"/>
    <circle cx="115" cy="85" r="3" fill="#7dd3fc" style="animation:crystalrain 1900ms ease-out forwards 500ms"/>
    <circle cx="115" cy="115" r="3" fill="#7dd3fc" style="animation:crystalrain 1900ms ease-out forwards 700ms"/>
    <circle cx="85" cy="125" r="3" fill="#7dd3fc" style="animation:crystalrain 1900ms ease-out forwards 900ms"/>
    <circle cx="100" cy="100" r="8" fill="none" stroke="#4ecfff" stroke-width="0.5" style="animation:shimmer 1900ms ease-out forwards"/>`;
    return s;
  }},

  glacial_waltz: { duration: 2100, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes ripple{0%{r:5px;opacity:1;stroke-width:2}100%{r:75px;opacity:0;stroke-width:0.5}}
      @keyframes orbitice{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(360deg)}}
      @keyframes shardfall{0%{opacity:1;transform:translate(0,-20px)rotate(0deg)scale(1)}100%{opacity:0;transform:translate(0,30px)rotate(180deg)scale(0.5)}}
      @keyframes flowpulse{0%{opacity:0.4;r:10px}50%{opacity:1;r:12px}100%{opacity:0;r:8px}}
    </style></defs>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#4ecfff" stroke-width="2" style="animation:ripple 2100ms ease-out forwards"/>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#7dd3fc" stroke-width="2" style="animation:ripple 2100ms ease-out forwards 300ms"/>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#4ecfff" stroke-width="2" style="animation:ripple 2100ms ease-out forwards 600ms"/>
    <g style="animation:orbitice 2100ms linear forwards">
      <polygon points="100,30 108,45 92,45" fill="#7dd3fc" style="animation:shardfall 2100ms ease-out forwards"/>
      <polygon points="170,100 155,108 155,92" fill="#7dd3fc" style="animation:shardfall 2100ms ease-out forwards 200ms"/>
      <polygon points="100,170 92,155 108,155" fill="#7dd3fc" style="animation:shardfall 2100ms ease-out forwards 400ms"/>
      <polygon points="30,100 45,92 45,108" fill="#7dd3fc" style="animation:shardfall 2100ms ease-out forwards 600ms"/>
      <polygon points="145,55 153,70 137,70" fill="#4ecfff" style="animation:shardfall 2100ms ease-out forwards 100ms;opacity:0.7"/>
      <polygon points="145,145 137,130 153,130" fill="#4ecfff" style="animation:shardfall 2100ms ease-out forwards 500ms;opacity:0.7"/>
    </g>
    <circle cx="100" cy="100" r="10" fill="none" stroke="#7dd3fc" stroke-width="1" style="animation:flowpulse 2100ms ease-in-out infinite"/>`;
    return s;
  }},

  permafrost: { duration: 1800, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes freezeflow{0%{r:12px;opacity:0.8;stroke-width:3}100%{r:85px;opacity:0;stroke-width:0.5}}
      @keyframes crackspread{0%{opacity:0;stroke-width:0;stroke-dashoffset:20}100%{opacity:0;stroke-width:1.5;stroke-dashoffset:0}}
      @keyframes iceblock{0%{opacity:0;transform:scale(0.2)rotate(-45deg)}60%{opacity:0.8;transform:scale(1)rotate(0deg)}100%{opacity:0;transform:scale(1.2)rotate(45deg)}}
      @keyframes frostpulse{0%{r:8px;fill-opacity:0.3}50%{r:15px;fill-opacity:0.6}100%{r:25px;fill-opacity:0}}
    </style></defs>
    <circle cx="100" cy="100" r="12" fill="none" stroke="#4ecfff" stroke-width="3" style="animation:freezeflow 1800ms ease-out forwards"/>
    <circle cx="100" cy="100" r="8" fill="#7dd3fc" opacity="0.5" style="animation:frostpulse 1800ms ease-out forwards 200ms"/>
    <line x1="100" y1="20" x2="100" y2="180" stroke="#7dd3fc" stroke-width="1.5" stroke-dasharray="20" style="animation:crackspread 1800ms ease-out forwards 300ms;transform-origin:100px 100px"/>
    <line x1="20" y1="100" x2="180" y2="100" stroke="#7dd3fc" stroke-width="1.5" stroke-dasharray="20" style="animation:crackspread 1800ms ease-out forwards 500ms;transform-origin:100px 100px"/>
    <line x1="60" y1="40" x2="140" y2="160" stroke="#7dd3fc" stroke-width="1" stroke-dasharray="20" opacity="0.6" style="animation:crackspread 1800ms ease-out forwards 700ms;transform-origin:100px 100px"/>
    <line x1="140" y1="40" x2="60" y2="160" stroke="#7dd3fc" stroke-width="1" stroke-dasharray="20" opacity="0.6" style="animation:crackspread 1800ms ease-out forwards 800ms;transform-origin:100px 100px"/>
    <rect x="85" y="85" width="30" height="30" fill="#4ecfff" opacity="0.4" rx="4" style="animation:iceblock 1800ms ease-out forwards 400ms"/>
    <rect x="70" y="100" width="15" height="15" fill="#7dd3fc" opacity="0.3" rx="2" style="animation:iceblock 1800ms ease-out forwards 600ms"/>
    <rect x="115" y="85" width="15" height="15" fill="#7dd3fc" opacity="0.3" rx="2" style="animation:iceblock 1800ms ease-out forwards 800ms"/>`;
    return s;
  }},

  cryoclasm: { duration: 2900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes explode{0%{transform:translate(100px,100px)rotate(0deg)scale(0.3)}40%{transform:translate(100px,100px)rotate(180deg)scale(1.2)}100%{transform:translate(100px,100px)rotate(720deg)scale(2);opacity:0}}
      @keyframes burst{0%{r:5px;opacity:1}100%{r:95px;opacity:0}}
      @keyframes shardblast{0%{opacity:1;transform:translate(0,0)scale(1)}100%{opacity:0;transform:var(--pos)scale(0.3)}}
      @keyframes coregen{0%{r:20px;opacity:1}50%{r:25px;opacity:0.8}100%{r:15px;opacity:0}}
    </style></defs>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#4ecfff" stroke-width="2" style="animation:burst 2900ms ease-out forwards"/>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#7dd3fc" stroke-width="1.5" style="animation:burst 2900ms ease-out forwards 300ms"/>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#4ecfff" stroke-width="1" style="animation:burst 2900ms ease-out forwards 600ms"/>
    <g style="animation:explode 2900ms ease-out forwards">
      <circle cx="100" cy="100" r="25" fill="none" stroke="#7dd3fc" stroke-width="1.5" opacity="0.8"/>
      <line x1="75" y1="75" x2="125" y2="125" stroke="#4ecfff" stroke-width="2"/>
      <line x1="125" y1="75" x2="75" y2="125" stroke="#4ecfff" stroke-width="2"/>
      <line x1="100" y1="70" x2="100" y2="130" stroke="#7dd3fc" stroke-width="1"/>
      <line x1="70" y1="100" x2="130" y2="100" stroke="#7dd3fc" stroke-width="1"/>
    </g>
    <polygon points="100,60 110,85 90,85" fill="#4ecfff" style="--pos:translate(0,-50px);animation:shardblast 2900ms ease-out forwards 400ms"/>
    <polygon points="140,100 115,110 115,90" fill="#4ecfff" style="--pos:translate(50px,0);animation:shardblast 2900ms ease-out forwards 600ms"/>
    <polygon points="100,140 90,115 110,115" fill="#4ecfff" style="--pos:translate(0,50px);animation:shardblast 2900ms ease-out forwards 800ms"/>
    <polygon points="60,100 85,90 85,110" fill="#4ecfff" style="--pos:translate(-50px,0);animation:shardblast 2900ms ease-out forwards 1000ms"/>
    <polygon points="130,70 140,85 120,85" fill="#7dd3fc" style="--pos:translate(35px,-35px);animation:shardblast 2900ms ease-out forwards 500ms;opacity:0.7"/>
    <polygon points="130,130 120,115 140,115" fill="#7dd3fc" style="--pos:translate(35px,35px);animation:shardblast 2900ms ease-out forwards 700ms;opacity:0.7"/>
    <polygon points="70,130 60,115 80,115" fill="#7dd3fc" style="--pos:translate(-35px,35px);animation:shardblast 2900ms ease-out forwards 900ms;opacity:0.7"/>
    <polygon points="70,70 80,85 60,85" fill="#7dd3fc" style="--pos:translate(-35px,-35px);animation:shardblast 2900ms ease-out forwards 1100ms;opacity:0.7"/>
    <circle cx="100" cy="100" r="20" fill="none" stroke="#4ecfff" stroke-width="1" style="animation:coregen 2900ms ease-out forwards 1500ms"/>`;
    return s;
  }},

  // HU TAO - Spirit Incinerator
  spirit_flame: { duration: 1900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes flamelick{0%{opacity:0;transform:translateY(60px)scaleX(0.8);filter:drop-shadow(0 0 0px #ff7700)}40%{opacity:1}100%{opacity:0;transform:translateY(-100px)scaleX(1.2);filter:drop-shadow(0 0 10px #ff9933)}}
      @keyframes spiritcore{0%{r:8px;opacity:0.3;fill:#ff5500}50%{r:12px;opacity:1;fill:#ffaa33}100%{r:6px;opacity:0;fill:#ff7700}}
      @keyframes heatwave{0%{r:15px;opacity:0.6}100%{r:60px;opacity:0}}
      @keyframes demonflicker{0%{opacity:0}20%{opacity:0.8}40%{opacity:0.4}60%{opacity:0.8}100%{opacity:0}}
    </style></defs>
    <circle cx="100" cy="100" r="8" fill="none" stroke="#ff5500" stroke-width="1.5" style="animation:heatwave 1900ms ease-out forwards"/>
    <circle cx="100" cy="100" r="8" fill="none" stroke="#ff9933" stroke-width="1" style="animation:heatwave 1900ms ease-out forwards 300ms"/>
    <circle cx="100" cy="100" r="8" fill="#ff7700" style="animation:spiritcore 1900ms ease-in-out forwards 400ms"/>
    <polygon points="100,160 75,110 85,85 100,65 115,85 125,110" fill="#ff7700" style="animation:flamelick 1900ms cubic-bezier(0.25,0.46,0.45,0.94) forwards"/>
    <polygon points="80,130 65,95 72,80 80,70 88,80 95,100" fill="#ff9933" style="animation:flamelick 1900ms cubic-bezier(0.25,0.46,0.45,0.94) forwards 150ms;opacity:0.8"/>
    <polygon points="120,130 135,95 128,80 120,70 112,80 105,100" fill="#ff9933" style="animation:flamelick 1900ms cubic-bezier(0.25,0.46,0.45,0.94) forwards 300ms;opacity:0.8"/>
    <polygon points="100,180 85,125 92,100 100,80 108,100 115,125" fill="#ffaa33" style="animation:flamelick 1900ms cubic-bezier(0.25,0.46,0.45,0.94) forwards 450ms;opacity:0.6"/>
    <circle cx="100" cy="85" r="4" fill="#ff5500" style="animation:demonflicker 1900ms ease-in-out forwards;opacity:0.5"/>
    <circle cx="100" cy="100" r="4" fill="#ff5500" style="animation:demonflicker 1900ms ease-in-out forwards 200ms;opacity:0.5"/>
    <polygon points="100,100 95,105 105,105" fill="#ffaa33" style="animation:spiritcore 1900ms ease-in-out forwards 600ms;opacity:0.6"/>`;
    return s;
  }},

  paramita_papilio: { duration: 2200, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes butterflyorbit{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(360deg)}}
      @keyframes wingflap{0%{transform:scaleY(1)rotateZ(0deg)}25%{transform:scaleY(0.6)rotateZ(20deg)}50%{transform:scaleY(1)rotateZ(0deg)}75%{transform:scaleY(0.6)rotateZ(-20deg)}100%{transform:scaleY(1)rotateZ(0deg)}}
      @keyframes flutter{0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0}}
      @keyframes glow{0%{r:4px;opacity:0;fill:#ff9933}50%{r:6px;opacity:1;fill:#ffaa33}100%{r:4px;opacity:0;fill:#ff7700}}
    </style></defs>
    <g style="animation:butterflyorbit 2200ms linear forwards">
      <ellipse cx="60" cy="100" rx="14" ry="22" fill="#ff7700" stroke="#ffaa33" stroke-width="1" style="animation:wingflap 400ms ease-in-out infinite;transform-origin:60px 100px"/>
      <ellipse cx="140" cy="100" rx="14" ry="22" fill="#ff7700" stroke="#ffaa33" stroke-width="1" style="animation:wingflap 400ms ease-in-out infinite;transform-origin:140px 100px"/>
      <circle cx="100" cy="100" r="7" fill="#ffaa33"/>
      <circle cx="100" cy="85" r="4" fill="#ff9933" opacity="0.8"/>
      <path d="M 95 95 Q 100 115 105 95" stroke="#ff9933" stroke-width="1.5" fill="none" opacity="0.6"/>
    </g>
    <circle cx="100" cy="100" r="4" fill="none" stroke="#ff7700" stroke-width="1" opacity="0.4" style="animation:flutter 2200ms ease-in-out forwards"/>
    <circle cx="65" cy="75" r="2" fill="#ffaa33" style="animation:glow 2200ms ease-in-out forwards 300ms"/>
    <circle cx="135" cy="75" r="2" fill="#ffaa33" style="animation:glow 2200ms ease-in-out forwards 600ms"/>
    <circle cx="65" cy="125" r="2" fill="#ffaa33" style="animation:glow 2200ms ease-in-out forwards 900ms"/>
    <circle cx="135" cy="125" r="2" fill="#ffaa33" style="animation:glow 2200ms ease-in-out forwards 1200ms"/>`;
    return s;
  }},

  blood_blossom_enhanced: { duration: 2000, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes petal{0%{opacity:0;transform:translate(0,-25px)rotate(0deg)scale(0.4)}60%{opacity:1;transform:translate(0,-5px)rotate(90deg)scale(1)}100%{opacity:0;transform:translate(0,35px)rotate(180deg)scale(1.3)}}
      @keyframes coreblood{0%{opacity:0.4;r:6px}40%{opacity:1;r:10px}70%{opacity:0.8;r:12px}100%{opacity:0;r:35px}}
      @keyframes bloodaura{0%{r:8px;opacity:1;stroke-width:2}100%{r:60px;opacity:0;stroke-width:0.5}}
      @keyframes vein{0%{stroke-dashoffset:10;opacity:0}50%{stroke-dashoffset:0;opacity:0.6}100%{stroke-dashoffset:-10;opacity:0}}
    </style></defs>
    <circle cx="100" cy="100" r="6" fill="#cc0033" style="animation:coreblood 2000ms ease-in-out forwards"/>
    <circle cx="100" cy="100" r="8" fill="none" stroke="#ff3333" stroke-width="2" style="animation:bloodaura 2000ms ease-out forwards"/>
    <circle cx="100" cy="100" r="8" fill="none" stroke="#ff6666" stroke-width="1.5" style="animation:bloodaura 2000ms ease-out forwards 300ms"/>
    <circle cx="100" cy="70" r="8" fill="#ff3333" style="animation:petal 2000ms cubic-bezier(0.34,1.56,0.64,1) forwards"/>
    <circle cx="130" cy="100" r="8" fill="#ff3333" style="animation:petal 2000ms cubic-bezier(0.34,1.56,0.64,1) forwards 150ms;transform-origin:100px 100px;transform:rotate(90deg)"/>
    <circle cx="100" cy="130" r="8" fill="#ff3333" style="animation:petal 2000ms cubic-bezier(0.34,1.56,0.64,1) forwards 300ms;transform-origin:100px 100px;transform:rotate(180deg)"/>
    <circle cx="70" cy="100" r="8" fill="#ff3333" style="animation:petal 2000ms cubic-bezier(0.34,1.56,0.64,1) forwards 450ms;transform-origin:100px 100px;transform:rotate(270deg)"/>
    <circle cx="115" cy="85" r="6" fill="#ff6666" style="animation:petal 2000ms cubic-bezier(0.34,1.56,0.64,1) forwards 75ms;transform-origin:100px 100px;transform:rotate(45deg);opacity:0.7"/>
    <circle cx="115" cy="115" r="6" fill="#ff6666" style="animation:petal 2000ms cubic-bezier(0.34,1.56,0.64,1) forwards 225ms;transform-origin:100px 100px;transform:rotate(135deg);opacity:0.7"/>
    <circle cx="85" cy="115" r="6" fill="#ff6666" style="animation:petal 2000ms cubic-bezier(0.34,1.56,0.64,1) forwards 375ms;transform-origin:100px 100px;transform:rotate(225deg);opacity:0.7"/>
    <circle cx="85" cy="85" r="6" fill="#ff6666" style="animation:petal 2000ms cubic-bezier(0.34,1.56,0.64,1) forwards 525ms;transform-origin:100px 100px;transform:rotate(315deg);opacity:0.7"/>
    <line x1="100" y1="100" x2="100" y2="60" stroke="#cc0033" stroke-width="1" stroke-dasharray="5" style="animation:vein 2000ms ease-out forwards 200ms"/>
    <line x1="100" y1="100" x2="130" y2="100" stroke="#cc0033" stroke-width="1" stroke-dasharray="5" style="animation:vein 2000ms ease-out forwards 400ms"/>`;
    return s;
  }},

  guide_to_afterlife: { duration: 2900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes vortexspin{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(720deg)}}
      @keyframes soulpull{0%{opacity:0.8;transform:translate(100px,100px)rotate(0deg)translateX(50px)translateY(0px)}100%{opacity:0;transform:translate(100px,100px)rotate(-720deg)translateX(0px)translateY(0px)}}
      @keyframes vortexgrow{0%{r:15px;opacity:0.8;stroke-width:2}100%{r:80px;opacity:0;stroke-width:0.5}}
      @keyframes darkpulse{0%{r:20px;fill-opacity:0.4}50%{r:25px;fill-opacity:0.6}100%{r:15px;fill-opacity:0}}
      @keyframes ghostfade{0%{opacity:0;transform:scale(0.5)}50%{opacity:0.6;transform:scale(1)}100%{opacity:0;transform:scale(0.5)}}
    </style></defs>
    <circle cx="100" cy="100" r="20" fill="#330000" opacity="0.3" style="animation:darkpulse 2900ms ease-in-out forwards"/>
    <circle cx="100" cy="100" r="15" fill="none" stroke="#660000" stroke-width="2" style="animation:vortexgrow 2900ms ease-out forwards"/>
    <circle cx="100" cy="100" r="15" fill="none" stroke="#440000" stroke-width="1.5" style="animation:vortexgrow 2900ms ease-out forwards 300ms"/>
    <circle cx="100" cy="100" r="15" fill="none" stroke="#330000" stroke-width="1" style="animation:vortexgrow 2900ms ease-out forwards 600ms"/>
    <g style="animation:vortexspin 2900ms linear forwards">
      <circle cx="100" cy="100" r="40" fill="none" stroke="#660000" stroke-width="1.5" opacity="0.6"/>
      <circle cx="100" cy="100" r="55" fill="none" stroke="#440000" stroke-width="1" opacity="0.4"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke="#330000" stroke-width="0.8" opacity="0.2"/>
      <line x1="100" y1="40" x2="100" y2="0" stroke="#660000" stroke-width="1" opacity="0.5"/>
      <line x1="160" y1="100" x2="200" y2="100" stroke="#660000" stroke-width="1" opacity="0.5"/>
      <line x1="100" y1="160" x2="100" y2="200" stroke="#660000" stroke-width="1" opacity="0.5"/>
      <line x1="40" y1="100" x2="0" y2="100" stroke="#660000" stroke-width="1" opacity="0.5"/>
    </g>
    <circle cx="140" cy="100" r="5" fill="#ff6600" style="animation:soulpull 2900ms ease-in forwards 500ms;filter:drop-shadow(0 0 3px #ff6600)"/>
    <circle cx="100" cy="140" r="5" fill="#ff6600" style="animation:soulpull 2900ms ease-in forwards 900ms;filter:drop-shadow(0 0 3px #ff6600);transform-origin:100px 100px;transform:rotate(90deg)"/>
    <circle cx="60" cy="100" r="5" fill="#ff6600" style="animation:soulpull 2900ms ease-in forwards 1300ms;filter:drop-shadow(0 0 3px #ff6600);transform-origin:100px 100px;transform:rotate(180deg)"/>
    <circle cx="100" cy="60" r="5" fill="#ff6600" style="animation:soulpull 2900ms ease-in forwards 1700ms;filter:drop-shadow(0 0 3px #ff6600);transform-origin:100px 100px;transform:rotate(270deg)"/>
    <circle cx="130" cy="70" r="3" fill="#ff8833" style="animation:ghostfade 2900ms ease-in-out forwards 700ms;opacity:0.6"/>
    <circle cx="130" cy="130" r="3" fill="#ff8833" style="animation:ghostfade 2900ms ease-in-out forwards 1100ms;opacity:0.6"/>
    <circle cx="70" cy="130" r="3" fill="#ff8833" style="animation:ghostfade 2900ms ease-in-out forwards 1500ms;opacity:0.6"/>
    <circle cx="70" cy="70" r="3" fill="#ff8833" style="animation:ghostfade 2900ms ease-in-out forwards 1900ms;opacity:0.6"/>`;
    return s;
  }},

  // NILOU - Hydro Performer
  dance_of_blessing: { duration: 2000, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes wave{0%{r:5px;opacity:1;stroke-width:1.5}100%{r:75px;opacity:0;stroke-width:0.5}}
      @keyframes sparkle{0%{opacity:1;transform:scale(1)translateY(0px)}100%{opacity:0;transform:scale(0)translateY(-40px)}}
      @keyframes waterblob{0%{opacity:0;r:3px}50%{opacity:1;r:6px}100%{opacity:0;r:2px}}
      @keyframes bless{0%{opacity:0;transform:scale(0.3)}60%{opacity:0.8}100%{opacity:0;transform:scale(1.5)}}
    </style></defs>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#00d4b4" stroke-width="1.5" style="animation:wave 2000ms ease-out forwards"/>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#00ffee" stroke-width="1" style="animation:wave 2000ms ease-out forwards 250ms"/>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#00d4b4" stroke-width="1.5" style="animation:wave 2000ms ease-out forwards 500ms"/>
    <circle cx="100" cy="60" r="5" fill="#00d4b4" style="animation:sparkle 2000ms ease-out forwards 150ms;filter:drop-shadow(0 0 3px #00ffee)"/>
    <circle cx="135" cy="75" r="5" fill="#00d4b4" style="animation:sparkle 2000ms ease-out forwards 350ms;filter:drop-shadow(0 0 3px #00ffee)"/>
    <circle cx="65" cy="75" r="5" fill="#00d4b4" style="animation:sparkle 2000ms ease-out forwards 550ms;filter:drop-shadow(0 0 3px #00ffee)"/>
    <circle cx="135" cy="125" r="5" fill="#00ffee" style="animation:sparkle 2000ms ease-out forwards 450ms;filter:drop-shadow(0 0 3px #00d4b4);opacity:0.8"/>
    <circle cx="65" cy="125" r="5" fill="#00ffee" style="animation:sparkle 2000ms ease-out forwards 650ms;filter:drop-shadow(0 0 3px #00d4b4);opacity:0.8"/>
    <circle cx="100" cy="150" r="5" fill="#00ffee" style="animation:sparkle 2000ms ease-out forwards 250ms;filter:drop-shadow(0 0 3px #00d4b4);opacity:0.8"/>
    <circle cx="100" cy="100" r="4" fill="#00d4b4" style="animation:waterblob 2000ms ease-in-out forwards 100ms"/>
    <circle cx="120" cy="90" r="4" fill="#00d4b4" style="animation:waterblob 2000ms ease-in-out forwards 300ms"/>
    <circle cx="80" cy="90" r="4" fill="#00d4b4" style="animation:waterblob 2000ms ease-in-out forwards 500ms"/>
    <circle cx="120" cy="110" r="4" fill="#00ffee" style="animation:waterblob 2000ms ease-in-out forwards 400ms;opacity:0.7"/>
    <circle cx="80" cy="110" r="4" fill="#00ffee" style="animation:waterblob 2000ms ease-in-out forwards 600ms;opacity:0.7"/>
    <polygon points="100,100 115,85 120,100 115,115" fill="none" stroke="#00d4b4" stroke-width="1" style="animation:bless 2000ms ease-out forwards 800ms;opacity:0.6"/>
    <polygon points="100,100 85,85 80,100 85,115" fill="none" stroke="#00d4b4" stroke-width="1" style="animation:bless 2000ms ease-out forwards 1000ms;opacity:0.6"/>`;
    return s;
  }},

  water_wheel: { duration: 2100, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes wheelspin{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(1440deg)}}
      @keyframes spray{0%{opacity:1;transform:translate(0,0)scale(1)}100%{opacity:0;transform:var(--spray)scale(0.3)}}
      @keyframes wheelglow{0%{r:35px;opacity:0.6;stroke-width:2}50%{r:35px;opacity:1;stroke-width:2.5}100%{r:35px;opacity:0.4;stroke-width:1.5}}
      @keyframes splatter{0%{opacity:0;r:1px}50%{opacity:1;r:3px}100%{opacity:0;r:1px}}
    </style></defs>
    <circle cx="100" cy="100" r="35" fill="none" stroke="#00d4b4" stroke-width="2" style="animation:wheelglow 2100ms ease-in-out infinite"/>
    <g style="animation:wheelspin 2100ms linear forwards">
      <circle cx="100" cy="100" r="35" fill="none" stroke="#00d4b4" stroke-width="2"/>
      <circle cx="100" cy="60" r="3" fill="#00ffee"/>
      <circle cx="140" cy="100" r="3" fill="#00ffee"/>
      <circle cx="100" cy="140" r="3" fill="#00ffee"/>
      <circle cx="60" cy="100" r="3" fill="#00ffee"/>
      <line x1="65" y1="100" x2="135" y2="100" stroke="#00d4b4" stroke-width="1.5"/>
      <line x1="100" y1="65" x2="100" y2="135" stroke="#00d4b4" stroke-width="1.5"/>
      <line x1="72" y1="72" x2="128" y2="128" stroke="#00d4b4" stroke-width="1" opacity="0.6"/>
      <line x1="128" y1="72" x2="72" y2="128" stroke="#00d4b4" stroke-width="1" opacity="0.6"/>
    </g>
    <circle cx="100" cy="100" r="5" fill="#00d4b4" style="--spray:translate(70px,-70px);animation:spray 2100ms ease-out forwards 300ms;filter:drop-shadow(0 0 2px #00ffee)"/>
    <circle cx="100" cy="100" r="5" fill="#00d4b4" style="--spray:translate(0,-90px);animation:spray 2100ms ease-out forwards 500ms;filter:drop-shadow(0 0 2px #00ffee)"/>
    <circle cx="100" cy="100" r="5" fill="#00d4b4" style="--spray:translate(-70px,-70px);animation:spray 2100ms ease-out forwards 700ms;filter:drop-shadow(0 0 2px #00ffee)"/>
    <circle cx="100" cy="100" r="5" fill="#00ffee" style="--spray:translate(90px,0px);animation:spray 2100ms ease-out forwards 600ms;opacity:0.8"/>
    <circle cx="100" cy="100" r="5" fill="#00ffee" style="--spray:translate(-90px,0px);animation:spray 2100ms ease-out forwards 800ms;opacity:0.8"/>
    <circle cx="100" cy="100" r="5" fill="#00d4b4" style="--spray:translate(60px,60px);animation:spray 2100ms ease-out forwards 900ms;opacity:0.8"/>
    <circle cx="100" cy="100" r="5" fill="#00d4b4" style="--spray:translate(-60px,60px);animation:spray 2100ms ease-out forwards 1100ms;opacity:0.8"/>
    <circle cx="100" cy="100" r="2" fill="#00ffee" style="--spray:translate(0,-120px);animation:spray 2100ms ease-out forwards 400ms"/>
    <circle cx="100" cy="100" r="2" fill="#00ffee" style="--spray:translate(85px,85px);animation:spray 2100ms ease-out forwards 1000ms"/>`;
    return s;
  }},

  harmony_preservation: { duration: 2200, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes shield{0%{r:18px;opacity:1;stroke-width:2.5}100%{r:85px;opacity:0;stroke-width:0.5}}
      @keyframes glyphrotate{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(360deg)}}
      @keyframes glyphpulse{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(2)rotate(180deg)}}
      @keyframes protect{0%{opacity:0;r:8px}50%{opacity:0.8;r:15px}100%{opacity:0;r:25px}}
      @keyframes harmonyglow{0%{opacity:0.3;stroke-width:1}50%{opacity:1;stroke-width:1.5}100%{opacity:0.3;stroke-width:1}}
    </style></defs>
    <circle cx="100" cy="100" r="18" fill="none" stroke="#00d4b4" stroke-width="2.5" style="animation:shield 2200ms ease-out forwards"/>
    <circle cx="100" cy="100" r="18" fill="none" stroke="#00ffee" stroke-width="1.5" style="animation:shield 2200ms ease-out forwards 300ms"/>
    <circle cx="100" cy="100" r="18" fill="none" stroke="#00d4b4" stroke-width="1" style="animation:shield 2200ms ease-out forwards 600ms"/>
    <g style="animation:glyphrotate 2200ms linear forwards">
      <polygon points="100,55 110,80 90,80" fill="none" stroke="#00d4b4" stroke-width="1.5" style="animation:glyphpulse 2200ms ease-out forwards"/>
      <polygon points="145,100 120,110 120,90" fill="none" stroke="#00d4b4" stroke-width="1.5" style="animation:glyphpulse 2200ms ease-out forwards 200ms"/>
      <polygon points="100,145 90,120 110,120" fill="none" stroke="#00d4b4" stroke-width="1.5" style="animation:glyphpulse 2200ms ease-out forwards 400ms"/>
      <polygon points="55,100 80,90 80,110" fill="none" stroke="#00d4b4" stroke-width="1.5" style="animation:glyphpulse 2200ms ease-out forwards 600ms"/>
    </g>
    <circle cx="100" cy="100" r="8" fill="none" stroke="#00ffee" stroke-width="1" style="animation:protect 2200ms ease-out forwards 400ms"/>
    <circle cx="100" cy="100" r="8" fill="none" stroke="#00d4b4" stroke-width="1" style="animation:protect 2200ms ease-out forwards 800ms;opacity:0.7"/>
    <circle cx="100" cy="100" r="30" fill="none" stroke="#00d4b4" stroke-width="1" opacity="0.3" style="animation:harmonyglow 2200ms ease-in-out infinite"/>
    <circle cx="100" cy="70" r="2" fill="#00ffee" style="animation:protect 2200ms ease-out forwards 200ms"/>
    <circle cx="130" cy="100" r="2" fill="#00ffee" style="animation:protect 2200ms ease-out forwards 600ms"/>
    <circle cx="70" cy="100" r="2" fill="#00ffee" style="animation:protect 2200ms ease-out forwards 1000ms"/>
    <circle cx="100" cy="130" r="2" fill="#00ffee" style="animation:protect 2200ms ease-out forwards 1400ms"/>`;
    return s;
  }},

  hajras_hymn: { duration: 2900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes starburst{0%{opacity:0;transform:scale(0.1)rotate(-45deg)}40%{opacity:1;transform:scale(1)rotate(0deg)}100%{opacity:0;transform:scale(2.2)rotate(180deg)}}
      @keyframes ray{0%{opacity:0;stroke-width:0.5;stroke-dashoffset:30}50%{opacity:1;stroke-width:1.5;stroke-dashoffset:0}100%{opacity:0;stroke-width:3;stroke-dashoffset:-30}}
      @keyframes rayburst{0%{opacity:0;r:0px}50%{opacity:1;r:5px}100%{opacity:0;r:40px}}
      @keyframes flare{0%{opacity:0;r:2px}50%{opacity:1;r:5px}100%{opacity:0;r:15px}}
    </style></defs>
    <polygon points="100,50 110,80 140,80 117,105 127,135 100,110 73,135 83,105 60,80 90,80" fill="#00d4b4" stroke="#00ffee" stroke-width="1" style="animation:starburst 2900ms cubic-bezier(0.34,1.56,0.64,1) forwards"/>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#00d4b4" stroke-width="1" style="animation:rayburst 2900ms ease-out forwards 300ms"/>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#00ffee" stroke-width="1" style="animation:rayburst 2900ms ease-out forwards 700ms;opacity:0.6"/>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#00d4b4" stroke-width="1" style="animation:rayburst 2900ms ease-out forwards 1200ms;opacity:0.4"/>
    <line x1="100" y1="20" x2="100" y2="-10" stroke="#00d4b4" stroke-width="1" stroke-dasharray="20" style="animation:ray 2900ms ease-out forwards 400ms"/>
    <line x1="141" y1="59" x2="170" y2="30" stroke="#00d4b4" stroke-width="1" stroke-dasharray="20" style="animation:ray 2900ms ease-out forwards 600ms"/>
    <line x1="171" y1="100" x2="210" y2="100" stroke="#00d4b4" stroke-width="1" stroke-dasharray="20" style="animation:ray 2900ms ease-out forwards 800ms"/>
    <line x1="141" y1="141" x2="170" y2="170" stroke="#00d4b4" stroke-width="1" stroke-dasharray="20" style="animation:ray 2900ms ease-out forwards 1000ms"/>
    <line x1="100" y1="180" x2="100" y2="210" stroke="#00d4b4" stroke-width="1" stroke-dasharray="20" style="animation:ray 2900ms ease-out forwards 1200ms"/>
    <line x1="59" y1="141" x2="30" y2="170" stroke="#00ffee" stroke-width="1" stroke-dasharray="20" style="animation:ray 2900ms ease-out forwards 700ms;opacity:0.8"/>
    <line x1="29" y1="100" x2="-10" y2="100" stroke="#00ffee" stroke-width="1" stroke-dasharray="20" style="animation:ray 2900ms ease-out forwards 900ms;opacity:0.8"/>
    <line x1="59" y1="59" x2="30" y2="30" stroke="#00ffee" stroke-width="1" stroke-dasharray="20" style="animation:ray 2900ms ease-out forwards 1100ms;opacity:0.8"/>
    <circle cx="100" cy="50" r="3" fill="#00ffee" style="animation:flare 2900ms ease-out forwards 500ms"/>
    <circle cx="150" cy="100" r="3" fill="#00ffee" style="animation:flare 2900ms ease-out forwards 900ms"/>
    <circle cx="100" cy="150" r="3" fill="#00ffee" style="animation:flare 2900ms ease-out forwards 1300ms"/>
    <circle cx="50" cy="100" r="3" fill="#00d4b4" style="animation:flare 2900ms ease-out forwards 1100ms;opacity:0.7"/>
    <circle cx="135" cy="65" r="2" fill="#00d4b4" style="animation:flare 2900ms ease-out forwards 700ms;opacity:0.7"/>`;
    return s;
  }},

  // XIAO - Yaksha Protector
  lancing_strike: { duration: 1700, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes thrust{0%{opacity:0;transform:translateY(-80px)scaleY(0.5)}30%{opacity:1;transform:translateY(-20px)scaleY(1)}100%{opacity:0;transform:translateY(80px)scaleY(1.2)}}
      @keyframes impact{0%{r:8px;opacity:1;stroke-width:2}100%{r:90px;opacity:0;stroke-width:0.5}}
      @keyframes trail{0%{opacity:1;stroke-width:1.5}100%{opacity:0;stroke-width:0.5}}
      @keyframes spiralwind{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(360deg)}}
      @keyframes windgust{0%{opacity:0;transform:translateX(0px)}50%{opacity:1;transform:translateX(15px)}100%{opacity:0;transform:translateX(40px)}}
    </style></defs>
    <g style="animation:thrust 1700ms cubic-bezier(0.34,1.56,0.64,1) forwards">
      <line x1="100" y1="30" x2="100" y2="130" stroke="#7ddc5f" stroke-width="4" filter="drop-shadow(0 0 4px #7ddc5f)"/>
      <polygon points="100,25 92,42 108,42" fill="#7ddc5f" filter="drop-shadow(0 0 3px #7ddc5f)"/>
      <line x1="95" y1="50" x2="105" y2="50" stroke="#b0f542" stroke-width="1" opacity="0.6"/>
      <line x1="93" y1="70" x2="107" y2="70" stroke="#b0f542" stroke-width="1" opacity="0.6"/>
      <line x1="95" y1="90" x2="105" y2="90" stroke="#b0f542" stroke-width="1" opacity="0.6"/>
    </g>
    <circle cx="100" cy="100" r="8" fill="none" stroke="#7ddc5f" stroke-width="2" style="animation:impact 1700ms ease-out forwards 400ms;filter:drop-shadow(0 0 3px #7ddc5f)"/>
    <circle cx="100" cy="100" r="8" fill="none" stroke="#b0f542" stroke-width="1.5" style="animation:impact 1700ms ease-out forwards 550ms;opacity:0.6"/>
    <line x1="70" y1="100" x2="130" y2="100" stroke="#7ddc5f" stroke-width="1" style="animation:trail 1700ms ease-out forwards 500ms;opacity:0.5"/>
    <g style="animation:spiralwind 1700ms linear forwards">
      <line x1="100" y1="50" x2="100" y2="20" stroke="#b0f542" stroke-width="1" opacity="0.4" style="animation:windgust 1700ms ease-out forwards 300ms"/>
      <line x1="150" y1="100" x2="180" y2="100" stroke="#b0f542" stroke-width="1" opacity="0.4" style="animation:windgust 1700ms ease-out forwards 500ms"/>
      <line x1="100" y1="150" x2="100" y2="180" stroke="#b0f542" stroke-width="1" opacity="0.4" style="animation:windgust 1700ms ease-out forwards 700ms"/>
      <line x1="50" y1="100" x2="20" y2="100" stroke="#b0f542" stroke-width="1" opacity="0.4" style="animation:windgust 1700ms ease-out forwards 900ms"/>
    </g>
    <polygon points="100,100 110,85 120,95" fill="#7ddc5f" style="animation:windgust 1700ms ease-out forwards 200ms;opacity:0.7"/>
    <polygon points="100,100 115,110 105,120" fill="#7ddc5f" style="animation:windgust 1700ms ease-out forwards 600ms;opacity:0.7"/>`;
    return s;
  }},

  yaksha_valor_active: { duration: 2000, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes form{0%{r:12px;opacity:0.2;stroke-width:2.5}50%{r:18px;opacity:1;stroke-width:3}100%{r:75px;opacity:0;stroke-width:0.5}}
      @keyframes aura{0%{r:20px;opacity:1;stroke-width:2}100%{r:85px;opacity:0;stroke-width:0.5}}
      @keyframes shieldglow{0%{opacity:0.3;r:12px}50%{opacity:0.8;r:15px}100%{opacity:0;r:12px}}
      @keyframes energyrise{0%{opacity:0;transform:translateY(20px)rotate(0deg)}50%{opacity:1;transform:translateY(-10px)rotate(90deg)}100%{opacity:0;transform:translateY(-40px)rotate(180deg)}}
      @keyframes axisspread{0%{opacity:0;stroke-width:0}50%{opacity:1;stroke-width:1.5}100%{opacity:0;stroke-width:0.5}}
    </style></defs>
    <circle cx="100" cy="100" r="12" fill="none" stroke="#7ddc5f" stroke-width="2.5" style="animation:form 2000ms ease-out forwards;filter:drop-shadow(0 0 3px #7ddc5f)"/>
    <circle cx="100" cy="100" r="20" fill="none" stroke="#b0f542" stroke-width="1.5" opacity="0.6" style="animation:aura 2000ms ease-out forwards 200ms"/>
    <circle cx="100" cy="100" r="15" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.4" style="animation:aura 2000ms ease-out forwards 400ms"/>
    <circle cx="100" cy="100" r="12" fill="#7ddc5f" style="animation:shieldglow 2000ms ease-in-out forwards 600ms;opacity:0.5"/>
    <line x1="100" y1="35" x2="100" y2="165" stroke="#7ddc5f" stroke-width="1.5" style="animation:axisspread 2000ms ease-out forwards 300ms" opacity="0.7"/>
    <line x1="35" y1="100" x2="165" y2="100" stroke="#7ddc5f" stroke-width="1.5" style="animation:axisspread 2000ms ease-out forwards 500ms" opacity="0.7"/>
    <line x1="60" y1="60" x2="140" y2="140" stroke="#b0f542" stroke-width="1" style="animation:axisspread 2000ms ease-out forwards 400ms" opacity="0.5"/>
    <line x1="140" y1="60" x2="60" y2="140" stroke="#b0f542" stroke-width="1" style="animation:axisspread 2000ms ease-out forwards 600ms" opacity="0.5"/>
    <polygon points="100,60 106,75 94,75" fill="#7ddc5f" style="animation:energyrise 2000ms ease-out forwards 200ms;filter:drop-shadow(0 0 2px #7ddc5f)"/>
    <polygon points="100,60 106,75 94,75" fill="#b0f542" style="animation:energyrise 2000ms ease-out forwards 600ms;filter:drop-shadow(0 0 2px #b0f542);opacity:0.7;transform:rotate(90deg)"/>
    <polygon points="100,60 106,75 94,75" fill="#7ddc5f" style="animation:energyrise 2000ms ease-out forwards 1000ms;filter:drop-shadow(0 0 2px #7ddc5f);opacity:0.5;transform:rotate(180deg)"/>
    <polygon points="100,60 106,75 94,75" fill="#b0f542" style="animation:energyrise 2000ms ease-out forwards 1400ms;filter:drop-shadow(0 0 2px #b0f542);opacity:0.5;transform:rotate(270deg)"/>
    <circle cx="100" cy="100" r="8" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.3" style="animation:form 2000ms ease-out forwards 800ms"/>`;
    return s;
  }},

  karmic_barrier: { duration: 2200, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes dome{0%{r:20px;opacity:0.8;stroke-width:2.5}100%{r:95px;opacity:0;stroke-width:0.5}}
      @keyframes runerot{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(360deg)}}
      @keyframes runepulse{0%{opacity:0.5;transform:scale(0.8)}50%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.3)}}
      @keyframes karmicflow{0%{opacity:0;r:15px}50%{opacity:0.8;r:20px}100%{opacity:0;r:30px}}
      @keyframes ringemanate{0%{r:8px;opacity:0.3;stroke-width:1}50%{r:12px;opacity:1;stroke-width:1.5}100%{r:8px;opacity:0;stroke-width:0.5}}
    </style></defs>
    <circle cx="100" cy="100" r="20" fill="none" stroke="#7ddc5f" stroke-width="2.5" style="animation:dome 2200ms ease-out forwards;filter:drop-shadow(0 0 3px #7ddc5f)"/>
    <circle cx="100" cy="100" r="20" fill="none" stroke="#b0f542" stroke-width="1.5" style="animation:dome 2200ms ease-out forwards 300ms;opacity:0.6"/>
    <circle cx="100" cy="100" r="20" fill="none" stroke="#7ddc5f" stroke-width="1" style="animation:dome 2200ms ease-out forwards 600ms;opacity:0.3"/>
    <circle cx="100" cy="100" r="15" fill="none" stroke="#7ddc5f" stroke-width="1" style="animation:karmicflow 2200ms ease-in-out forwards 400ms;opacity:0.5"/>
    <circle cx="100" cy="100" r="12" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.2" style="animation:ringemanate 2200ms ease-in-out forwards"/>
    <circle cx="100" cy="100" r="12" fill="none" stroke="#b0f542" stroke-width="1" opacity="0.2" style="animation:ringemanate 2200ms ease-in-out forwards 400ms"/>
    <circle cx="100" cy="100" r="12" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.2" style="animation:ringemanate 2200ms ease-in-out forwards 800ms"/>
    <g style="animation:runerot 2200ms linear forwards">
      <rect x="95" y="35" width="10" height="12" fill="none" stroke="#7ddc5f" stroke-width="1.5" style="animation:runepulse 2200ms ease-out forwards;filter:drop-shadow(0 0 2px #7ddc5f)"/>
      <rect x="155" y="95" width="12" height="10" fill="none" stroke="#7ddc5f" stroke-width="1.5" style="animation:runepulse 2200ms ease-out forwards 200ms;filter:drop-shadow(0 0 2px #7ddc5f)"/>
      <rect x="95" y="153" width="10" height="12" fill="none" stroke="#7ddc5f" stroke-width="1.5" style="animation:runepulse 2200ms ease-out forwards 400ms;filter:drop-shadow(0 0 2px #7ddc5f)"/>
      <rect x="33" y="95" width="12" height="10" fill="none" stroke="#7ddc5f" stroke-width="1.5" style="animation:runepulse 2200ms ease-out forwards 600ms;filter:drop-shadow(0 0 2px #7ddc5f)"/>
      <circle cx="100" cy="60" r="3" fill="#b0f542" style="animation:runepulse 2200ms ease-out forwards 100ms;opacity:0.6"/>
      <circle cx="140" cy="100" r="3" fill="#b0f542" style="animation:runepulse 2200ms ease-out forwards 300ms;opacity:0.6"/>
      <circle cx="100" cy="140" r="3" fill="#b0f542" style="animation:runepulse 2200ms ease-out forwards 500ms;opacity:0.6"/>
      <circle cx="60" cy="100" r="3" fill="#b0f542" style="animation:runepulse 2200ms ease-out forwards 700ms;opacity:0.6"/>
    </g>
    <path d="M 100 100 L 130 70" stroke="#7ddc5f" stroke-width="0.8" opacity="0.4"/>
    <path d="M 100 100 L 130 130" stroke="#7ddc5f" stroke-width="0.8" opacity="0.4"/>
    <path d="M 100 100 L 70 130" stroke="#7ddc5f" stroke-width="0.8" opacity="0.4"/>
    <path d="M 100 100 L 70 70" stroke="#7ddc5f" stroke-width="0.8" opacity="0.4"/>`;
    return s;
  }},

  mastery_of_pain: { duration: 2900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes vortexwind{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(720deg)}}
      @keyframes slash{0%{opacity:0;stroke-width:1;stroke-dashoffset:30}50%{opacity:1;stroke-width:2.5;stroke-dashoffset:0}100%{opacity:0;stroke-width:3;stroke-dashoffset:-30}}
      @keyframes slashtrail{0%{opacity:1;transform:scaleX(0)}100%{opacity:0;transform:scaleX(1)}}
      @keyframes windstorm{0%{r:15px;opacity:0.4}50%{r:50px;opacity:0.7}100%{r:80px;opacity:0}}
      @keyframes painpulse{0%{opacity:0;r:5px;fill:#b0f542}40%{opacity:1;r:8px;fill:#7ddc5f}100%{opacity:0;r:20px;fill:#7ddc5f}}
    </style></defs>
    <circle cx="100" cy="100" r="15" fill="none" stroke="#7ddc5f" stroke-width="1.5" style="animation:windstorm 2900ms ease-out forwards;filter:drop-shadow(0 0 3px #7ddc5f)"/>
    <circle cx="100" cy="100" r="15" fill="none" stroke="#b0f542" stroke-width="1" style="animation:windstorm 2900ms ease-out forwards 400ms;opacity:0.6"/>
    <g style="animation:vortexwind 2900ms linear forwards">
      <circle cx="100" cy="100" r="50" fill="none" stroke="#7ddc5f" stroke-width="1.5" opacity="0.5"/>
      <circle cx="100" cy="100" r="65" fill="none" stroke="#b0f542" stroke-width="1" opacity="0.3"/>
      <line x1="100" y1="30" x2="100" y2="0" stroke="#7ddc5f" stroke-width="1" opacity="0.4"/>
      <line x1="170" y1="100" x2="200" y2="100" stroke="#7ddc5f" stroke-width="1" opacity="0.4"/>
      <line x1="100" y1="170" x2="100" y2="200" stroke="#7ddc5f" stroke-width="1" opacity="0.4"/>
      <line x1="30" y1="100" x2="0" y2="100" stroke="#7ddc5f" stroke-width="1" opacity="0.4"/>
    </g>
    <line x1="50" y1="50" x2="150" y2="150" stroke="#7ddc5f" stroke-width="2" stroke-dasharray="30" style="animation:slash 2900ms ease-out forwards 300ms;filter:drop-shadow(0 0 3px #7ddc5f)"/>
    <line x1="150" y1="50" x2="50" y2="150" stroke="#7ddc5f" stroke-width="2" stroke-dasharray="30" style="animation:slash 2900ms ease-out forwards 800ms;filter:drop-shadow(0 0 3px #7ddc5f)"/>
    <line x1="100" y1="40" x2="100" y2="160" stroke="#b0f542" stroke-width="1" stroke-dasharray="20" style="animation:slash 2900ms ease-out forwards 1300ms;opacity:0.6"/>
    <line x1="40" y1="100" x2="160" y2="100" stroke="#b0f542" stroke-width="1" stroke-dasharray="20" style="animation:slash 2900ms ease-out forwards 1800ms;opacity:0.6"/>
    <path d="M 70 70 L 130 130" stroke="#7ddc5f" stroke-width="1.5" style="animation:slashtrail 2900ms ease-out forwards 400ms;transform-origin:100px 100px;opacity:0.4"/>
    <path d="M 130 70 L 70 130" stroke="#7ddc5f" stroke-width="1.5" style="animation:slashtrail 2900ms ease-out forwards 900ms;transform-origin:100px 100px;opacity:0.4"/>
    <circle cx="100" cy="100" r="5" fill="#b0f542" style="animation:painpulse 2900ms ease-out forwards 500ms"/>
    <circle cx="100" cy="100" r="5" fill="#b0f542" style="animation:painpulse 2900ms ease-out forwards 1200ms;opacity:0.7"/>
    <circle cx="100" cy="100" r="5" fill="#7ddc5f" style="animation:painpulse 2900ms ease-out forwards 1900ms;opacity:0.5"/>
    <polygon points="100,70 108,85 92,85" fill="#7ddc5f" style="animation:painpulse 2900ms ease-out forwards 600ms;opacity:0.6"/>
    <polygon points="100,130 92,115 108,115" fill="#7ddc5f" style="animation:painpulse 2900ms ease-out forwards 1400ms;opacity:0.6"/>
    <polygon points="70,100 85,92 85,108" fill="#b0f542" style="animation:painpulse 2900ms ease-out forwards 1100ms;opacity:0.6;fill:#b0f542"/>
    <polygon points="130,100 115,108 115,92" fill="#b0f542" style="animation:painpulse 2900ms ease-out forwards 1900ms;opacity:0.6;fill:#b0f542"/>`;
    return s;
  }}
};
