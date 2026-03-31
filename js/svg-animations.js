const SVGAnimations = {
  // AYAKA - Cryo Bladestorm
  frostblossom: { duration: 1900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes blade{0%{transform:rotate(0deg)scale(0.3);opacity:0}50%{opacity:1}100%{transform:rotate(720deg)scale(1.5);opacity:0}}
      @keyframes crystal{0%{opacity:0;transform:translate(0,-20px)}100%{opacity:0;transform:translate(0,40px)}}
    </style></defs>
    <g style="animation:blade 1900ms ease-out forwards"><polygon points="100,60 120,100 100,140 80,100" fill="#4ecfff"/><line x1="100" y1="50" x2="100" y2="150" stroke="#7dd3fc" stroke-width="2"/></g>
    <circle cx="100" cy="100" r="6" fill="#7dd3fc" style="animation:crystal 1900ms ease-out forwards 300ms"/>
    <circle cx="70" cy="100" r="6" fill="#7dd3fc" style="animation:crystal 1900ms ease-out forwards 500ms"/>
    <circle cx="130" cy="100" r="6" fill="#7dd3fc" style="animation:crystal 1900ms ease-out forwards 700ms"/>`;
    return s;
  }},

  glacial_waltz: { duration: 2100, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes orbit{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(360deg)}}
      @keyframes wave{0%{r:5px;opacity:1}100%{r:60px;opacity:0}}
    </style></defs>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#4ecfff" stroke-width="1.5" style="animation:wave 2100ms ease-out forwards"/>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#4ecfff" stroke-width="1.5" style="animation:wave 2100ms ease-out forwards 500ms"/>
    <g style="animation:orbit 2100ms linear forwards">
      <rect x="90" y="30" width="20" height="8" fill="#7dd3fc" rx="4"/>
      <rect x="160" y="90" width="8" height="20" fill="#7dd3fc" rx="4"/>
      <rect x="90" y="160" width="20" height="8" fill="#7dd3fc" rx="4"/>
      <rect x="30" y="90" width="8" height="20" fill="#7dd3fc" rx="4"/>
    </g>`;
    return s;
  }},

  permafrost: { duration: 1800, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes grow{0%{r:10px;opacity:0.8}100%{r:70px;opacity:0}}
      @keyframes crack{0%{opacity:0;transform:scaleY(0)}100%{opacity:0;transform:scaleY(1)}}
    </style></defs>
    <circle cx="100" cy="100" r="10" fill="none" stroke="#4ecfff" stroke-width="2.5" style="animation:grow 1800ms ease-out forwards"/>
    <line x1="100" y1="30" x2="100" y2="170" stroke="#7dd3fc" stroke-width="1.5" style="animation:crack 1800ms ease-out forwards 400ms;transform-origin:100px 100px"/>
    <line x1="30" y1="100" x2="170" y2="100" stroke="#7dd3fc" stroke-width="1.5" style="animation:crack 1800ms ease-out forwards 600ms;transform-origin:100px 100px"/>`;
    return s;
  }},

  cryoclasm: { duration: 2900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes spin{0%{transform:translate(100px,100px)rotate(0deg)scale(0.4)}50%{transform:translate(100px,100px)rotate(360deg)scale(1)}100%{transform:translate(100px,100px)rotate(720deg)scale(1.8);opacity:0}}
      @keyframes burst{0%{r:20px;opacity:1}100%{r:100px;opacity:0}}
    </style></defs>
    <circle cx="100" cy="100" r="30" fill="none" stroke="#4ecfff" stroke-width="3" style="animation:burst 2900ms ease-out forwards 600ms"/>
    <g style="animation:spin 2900ms ease-out forwards"><circle cx="100" cy="100" r="25" fill="none" stroke="#7dd3fc" stroke-width="2"/><line x1="75" y1="75" x2="125" y2="125" stroke="#4ecfff" stroke-width="2"/><line x1="125" y1="75" x2="75" y2="125" stroke="#4ecfff" stroke-width="2"/></g>`;
    return s;
  }},

  // HU TAO - Spirit Incinerator
  spirit_flame: { duration: 1900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes flame1{0%{opacity:0;transform:translateY(40px)}100%{opacity:0;transform:translateY(-80px)}}
      @keyframes flame2{0%{opacity:0;transform:translateY(40px)rotateX(0deg)}100%{opacity:0;transform:translateY(-80px)rotateX(20deg)}}
    </style></defs>
    <polygon points="100,140 80,100 90,80 100,70 110,80 120,100" fill="#ff7700" style="animation:flame1 1900ms ease-out forwards"/>
    <polygon points="75,120 65,90 72,75 75,65 78,75 85,90" fill="#ff9933" style="animation:flame2 1900ms ease-out forwards 150ms"/>
    <polygon points="125,120 135,90 128,75 125,65 122,75 115,90" fill="#ff9933" style="animation:flame2 1900ms ease-out forwards 300ms"/>`;
    return s;
  }},

  paramita_papilio: { duration: 2200, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes butterfly{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(360deg)}}
      @keyframes flapL{0%{transform:rotateY(0deg)}50%{transform:rotateY(45deg)}100%{transform:rotateY(0deg)}}
    </style></defs>
    <g style="animation:butterfly 2200ms linear forwards">
      <ellipse cx="60" cy="100" rx="12" ry="18" fill="#ff7700" style="animation:flapL 400ms ease-in-out infinite"/>
      <ellipse cx="140" cy="100" rx="12" ry="18" fill="#ff7700" style="animation:flapL 400ms ease-in-out infinite;transform-origin:140px 100px"/>
      <circle cx="100" cy="100" r="6" fill="#ff9933"/>
    </g>`;
    return s;
  }},

  blood_blossom_enhanced: { duration: 2000, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes petal{0%{opacity:0;transform:translate(0,-20px)rotate(0deg)scale(0.3)}100%{opacity:0;transform:translate(0,30px)rotate(180deg)scale(1.2)}}
      @keyframes core{0%{opacity:1;r:8px}100%{opacity:0;r:40px}}
    </style></defs>
    <circle cx="100" cy="100" r="8" fill="#ff3333" style="animation:core 2000ms ease-out forwards"/>
    <circle cx="100" cy="70" r="8" fill="#ff6666" style="animation:petal 2000ms ease-out forwards"/>
    <circle cx="130" cy="100" r="8" fill="#ff6666" style="animation:petal 2000ms ease-out forwards 150ms"/>
    <circle cx="100" cy="130" r="8" fill="#ff6666" style="animation:petal 2000ms ease-out forwards 300ms"/>
    <circle cx="70" cy="100" r="8" fill="#ff6666" style="animation:petal 2000ms ease-out forwards 450ms"/>`;
    return s;
  }},

  guide_to_afterlife: { duration: 2900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes vortex{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(720deg)}}
      @keyframes soul{0%{opacity:0.6;transform:translate(100px,100px)rotate(0deg)translateX(40px)}100%{opacity:0;transform:translate(100px,100px)rotate(-360deg)translateX(80px)}}
    </style></defs>
    <circle cx="100" cy="100" r="30" fill="#330000" opacity="0.4"/>
    <g style="animation:vortex 2900ms ease-out forwards"><circle cx="100" cy="100" r="40" fill="none" stroke="#660000" stroke-width="2" opacity="0.6"/><circle cx="100" cy="100" r="55" fill="none" stroke="#330000" stroke-width="1.5" opacity="0.4"/></g>
    <circle cx="140" cy="100" r="5" fill="#ff6600" style="animation:soul 2900ms ease-out forwards 600ms"/>
    <circle cx="100" cy="140" r="5" fill="#ff6600" style="animation:soul 2900ms ease-out forwards 1000ms"/>`;
    return s;
  }},

  // NILOU - Hydro Performer
  dance_of_blessing: { duration: 2000, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes wave{0%{r:3px;opacity:1}100%{r:70px;opacity:0}}
      @keyframes sparkle{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0)translateY(-30px)}}
    </style></defs>
    <circle cx="100" cy="100" r="3" fill="none" stroke="#00d4b4" stroke-width="1.5" style="animation:wave 2000ms ease-out forwards"/>
    <circle cx="100" cy="100" r="3" fill="none" stroke="#00d4b4" stroke-width="1.5" style="animation:wave 2000ms ease-out forwards 400ms"/>
    <circle cx="100" cy="60" r="4" fill="#00d4b4" style="animation:sparkle 2000ms ease-out forwards 200ms"/>
    <circle cx="75" cy="75" r="4" fill="#00d4b4" style="animation:sparkle 2000ms ease-out forwards 400ms"/>
    <circle cx="125" cy="75" r="4" fill="#00d4b4" style="animation:sparkle 2000ms ease-out forwards 600ms"/>`;
    return s;
  }},

  water_wheel: { duration: 2100, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes wheelspin{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(1080deg)}}
      @keyframes spray{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:var(--spray)}}
    </style></defs>
    <g style="animation:wheelspin 2100ms ease-out forwards"><circle cx="100" cy="100" r="35" fill="none" stroke="#00d4b4" stroke-width="2"/><line x1="65" y1="100" x2="135" y2="100" stroke="#00d4b4" stroke-width="1.5"/><line x1="100" y1="65" x2="100" y2="135" stroke="#00d4b4" stroke-width="1.5"/></g>
    <circle cx="100" cy="100" r="4" fill="#00d4b4" style="--spray:translate(60px,-60px);animation:spray 2100ms ease-out forwards 400ms"/>
    <circle cx="100" cy="100" r="4" fill="#00d4b4" style="--spray:translate(0,-80px);animation:spray 2100ms ease-out forwards 600ms"/>
    <circle cx="100" cy="100" r="4" fill="#00d4b4" style="--spray:translate(-60px,-60px);animation:spray 2100ms ease-out forwards 800ms"/>`;
    return s;
  }},

  harmony_preservation: { duration: 2200, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes shield{0%{r:20px;opacity:1}100%{r:80px;opacity:0}}
      @keyframes glyph{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.8)rotate(180deg)}}
    </style></defs>
    <circle cx="100" cy="100" r="20" fill="none" stroke="#00d4b4" stroke-width="2" style="animation:shield 2200ms ease-out forwards"/>
    <polygon points="100,60 120,100 100,140 80,100" fill="none" stroke="#00d4b4" stroke-width="1.5" style="animation:glyph 2200ms ease-out forwards"/>
    <circle cx="60" cy="100" r="3" fill="#00d4b4" style="animation:glyph 2200ms ease-out forwards 200ms"/>
    <circle cx="140" cy="100" r="3" fill="#00d4b4" style="animation:glyph 2200ms ease-out forwards 400ms"/>`;
    return s;
  }},

  hajras_hymn: { duration: 2900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes starburst{0%{opacity:1;transform:scale(0.2)}100%{opacity:0;transform:scale(2)rotate(180deg)}}
      @keyframes ray{0%{opacity:0.8;stroke-width:1}100%{opacity:0;stroke-width:4}}
    </style></defs>
    <polygon points="100,50 110,80 140,80 117,105 127,135 100,110 73,135 83,105 60,80 90,80" fill="#00d4b4" style="animation:starburst 2900ms ease-out forwards"/>
    <line x1="100" y1="30" x2="100" y2="10" stroke="#00d4b4" stroke-width="1" style="animation:ray 2900ms ease-out forwards 400ms"/>
    <line x1="140" y1="60" x2="160" y2="40" stroke="#00d4b4" stroke-width="1" style="animation:ray 2900ms ease-out forwards 700ms"/>
    <line x1="140" y1="140" x2="160" y2="160" stroke="#00d4b4" stroke-width="1" style="animation:ray 2900ms ease-out forwards 1000ms"/>`;
    return s;
  }},

  // XIAO - Yaksha Protector
  lancing_strike: { duration: 1700, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes thrust{0%{opacity:1;transform:translateY(-60px)}100%{opacity:0;transform:translateY(60px)}}
      @keyframes impact{0%{r:5px;opacity:1}100%{r:80px;opacity:0}}
    </style></defs>
    <g style="animation:thrust 1700ms ease-out forwards"><line x1="100" y1="40" x2="100" y2="120" stroke="#7ddc5f" stroke-width="3"/><polygon points="100,35 95,50 105,50" fill="#7ddc5f"/></g>
    <circle cx="100" cy="100" r="5" fill="none" stroke="#7ddc5f" stroke-width="2" style="animation:impact 1700ms ease-out forwards 600ms"/>`;
    return s;
  }},

  yaksha_valor_active: { duration: 2000, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes form{0%{r:15px;opacity:0.3}50%{opacity:1}100%{r:75px;opacity:0}}
      @keyframes aura{0%{r:25px;opacity:1}100%{r:80px;opacity:0}}
    </style></defs>
    <circle cx="100" cy="100" r="15" fill="none" stroke="#7ddc5f" stroke-width="2.5" style="animation:form 2000ms ease-out forwards"/>
    <circle cx="100" cy="100" r="25" fill="none" stroke="#7ddc5f" stroke-width="1.5" opacity="0.5" style="animation:aura 2000ms ease-out forwards"/>
    <line x1="100" y1="50" x2="100" y2="150" stroke="#7ddc5f" stroke-width="1" opacity="0.6"/>
    <line x1="50" y1="100" x2="150" y2="100" stroke="#7ddc5f" stroke-width="1" opacity="0.6"/>`;
    return s;
  }},

  karmic_barrier: { duration: 2200, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes dome{0%{r:25px;opacity:0.6}100%{r:90px;opacity:0}}
      @keyframes runerot{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(360deg)}}
    </style></defs>
    <circle cx="100" cy="100" r="25" fill="none" stroke="#7ddc5f" stroke-width="2" style="animation:dome 2200ms ease-out forwards"/>
    <g style="animation:runerot 2200ms linear forwards">
      <rect x="95" y="40" width="10" height="10" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.7"/>
      <rect x="150" y="95" width="10" height="10" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.7"/>
      <rect x="95" y="150" width="10" height="10" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.7"/>
      <rect x="40" y="95" width="10" height="10" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.7"/>
    </g>`;
    return s;
  }},

  mastery_of_pain: { duration: 2900, create: () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>
      @keyframes vortexwind{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(720deg)}}
      @keyframes slash{0%{opacity:1;stroke-width:2}50%{opacity:1}100%{opacity:0;stroke-width:4}}
    </style></defs>
    <g style="animation:vortexwind 2900ms ease-out forwards"><circle cx="100" cy="100" r="45" fill="none" stroke="#7ddc5f" stroke-width="1.5" opacity="0.5"/><circle cx="100" cy="100" r="60" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.3"/></g>
    <line x1="50" y1="50" x2="150" y2="150" stroke="#7ddc5f" stroke-width="2" style="animation:slash 2900ms ease-out forwards 400ms"/>
    <line x1="150" y1="50" x2="50" y2="150" stroke="#7ddc5f" stroke-width="2" style="animation:slash 2900ms ease-out forwards 900ms"/>`;
    return s;
  }}
};
