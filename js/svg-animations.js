const SVGAnimations = {
  frostblossom: { duration: 1900, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes f{0%{opacity:0}50%{opacity:1}100%{opacity:0;transform:scale(1.5)}}@keyframes c{0%{opacity:0;transform:translate(20px,20px)}100%{opacity:0;transform:translate(-20px,-20px)}}</style></defs>
      <circle cx="100" cy="100" r="20" fill="#4ecfff" style="animation:f 1900ms ease-out forwards"/>
      <circle cx="70" cy="70" r="8" fill="#7dd3fc" style="animation:c 1900ms ease-out forwards 200ms"/>
      <circle cx="130" cy="130" r="8" fill="#7dd3fc" style="animation:c 1900ms ease-out forwards 400ms"/>`;
    return s;
  }},

  glacial_waltz: { duration: 2100, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes ring{0%{r:10px;opacity:1}100%{r:80px;opacity:0}}@keyframes shard{0%{opacity:0;transform:translate(0,-20px)}100%{opacity:0;transform:translate(0,40px)}}</style></defs>
      <circle cx="100" cy="100" r="10" fill="none" stroke="#4ecfff" stroke-width="2" style="animation:ring 2100ms ease-out forwards"/>
      <rect x="95" y="50" width="10" height="20" fill="#7dd3fc" style="animation:shard 2100ms ease-out forwards 400ms"/>
      <rect x="95" y="130" width="10" height="20" fill="#7dd3fc" style="animation:shard 2100ms ease-out forwards 600ms"/>`;
    return s;
  }},

  permafrost: { duration: 1800, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes bloom{0%{r:20px;opacity:1}100%{r:80px;opacity:0}}@keyframes fall{0%{opacity:1;transform:translateY(-30px)}100%{opacity:0;transform:translateY(50px)}}</style></defs>
      <circle cx="100" cy="100" r="20" fill="#4ecfff" opacity="0.3" style="animation:bloom 1800ms ease-out forwards"/>
      <circle cx="80" cy="60" r="6" fill="#7dd3fc" style="animation:fall 1800ms ease-out forwards 200ms"/>
      <circle cx="120" cy="60" r="6" fill="#7dd3fc" style="animation:fall 1800ms ease-out forwards 400ms"/>`;
    return s;
  }},

  cryoclasm: { duration: 2900, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes spin{0%{opacity:1;transform:rotate(0deg)scale(0.5)}100%{opacity:0;transform:rotate(720deg)scale(2)}}@keyframes burst{0%{r:10px;opacity:1}100%{r:100px;opacity:0}}</style></defs>
      <circle cx="100" cy="100" r="20" fill="none" stroke="#4ecfff" stroke-width="3" style="animation:spin 2900ms ease-out forwards"/>
      <line x1="80" y1="100" x2="120" y2="100" stroke="#4ecfff" stroke-width="2" style="animation:spin 2900ms ease-out forwards"/>
      <circle cx="100" cy="100" r="10" fill="none" stroke="#7dd3fc" stroke-width="2" style="animation:burst 2900ms ease-out forwards 600ms"/>`;
    return s;
  }},

  spirit_flame: { duration: 1900, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes rise{0%{opacity:0;transform:translateY(40px)}50%{opacity:1}100%{opacity:0;transform:translateY(-60px)}}@keyframes glow{0%{opacity:0.3}50%{opacity:1}100%{opacity:0}}</style></defs>
      <circle cx="100" cy="100" r="35" fill="#ff7700" opacity="0.4" style="animation:glow 1900ms ease-out forwards"/>
      <polygon points="100,120 85,80 100,70 115,80" fill="#ff7700" style="animation:rise 1900ms ease-out forwards"/>
      <polygon points="70,100 60,70 70,60 80,70" fill="#ff9933" style="animation:rise 1900ms ease-out forwards 200ms"/>
      <polygon points="130,100 120,70 130,60 140,70" fill="#ff9933" style="animation:rise 1900ms ease-out forwards 400ms"/>`;
    return s;
  }},

  paramita_papilio: { duration: 2200, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes orbit{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(360deg)}}@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(-15px)}100%{transform:translateY(0)}}</style></defs>
      <g style="animation:orbit 2200ms linear forwards">
        <ellipse cx="40" cy="100" rx="10" ry="18" fill="#ff7700" style="animation:bob 600ms ease-in-out infinite"/>
        <ellipse cx="160" cy="100" rx="10" ry="18" fill="#ff7700" style="animation:bob 600ms ease-in-out infinite"/>
        <circle cx="100" cy="100" r="7" fill="#ff9933"/>
      </g>`;
    return s;
  }},

  blood_blossom_enhanced: { duration: 2000, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes bloom{0%{opacity:0;transform:scale(0.1)}50%{opacity:1}100%{opacity:0;transform:scale(1.8)}}@keyframes pulse{0%{r:15px;opacity:0.8}100%{r:70px;opacity:0}}</style></defs>
      <circle cx="100" cy="100" r="15" fill="none" stroke="#ff3333" stroke-width="2" style="animation:pulse 2000ms ease-out forwards"/>
      <circle cx="100" cy="70" r="9" fill="#ff6666" style="animation:bloom 2000ms ease-out forwards"/>
      <circle cx="130" cy="100" r="9" fill="#ff6666" style="animation:bloom 2000ms ease-out forwards 150ms"/>
      <circle cx="100" cy="130" r="9" fill="#ff6666" style="animation:bloom 2000ms ease-out forwards 300ms"/>
      <circle cx="70" cy="100" r="9" fill="#ff6666" style="animation:bloom 2000ms ease-out forwards 450ms"/>`;
    return s;
  }},

  guide_to_afterlife: { duration: 2900, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes vortex{0%{opacity:1;transform:rotate(0deg)}100%{opacity:0;transform:rotate(720deg)}}@keyframes orb{0%{opacity:0.6}100%{opacity:0;transform:scale(2)}}</style></defs>
      <circle cx="100" cy="100" r="40" fill="#330000" opacity="0.5" style="animation:vortex 2900ms ease-out forwards"/>
      <circle cx="100" cy="100" r="55" fill="none" stroke="#660000" stroke-width="2" style="animation:vortex 2900ms ease-out forwards"/>
      <circle cx="150" cy="100" r="6" fill="#ff6600" style="animation:orb 2900ms ease-out forwards 800ms"/>
      <circle cx="50" cy="100" r="6" fill="#ff6600" style="animation:orb 2900ms ease-out forwards 1200ms"/>`;
    return s;
  }},

  dance_of_blessing: { duration: 2000, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes wave{0%{r:8px;opacity:1}100%{r:75px;opacity:0}}@keyframes drop{0%{opacity:1;transform:translateY(-25px)}100%{opacity:0;transform:translateY(40px)}}</style></defs>
      <circle cx="100" cy="100" r="8" fill="none" stroke="#00d4b4" stroke-width="2" style="animation:wave 2000ms ease-out forwards"/>
      <circle cx="100" cy="100" r="8" fill="none" stroke="#00d4b4" stroke-width="2" style="animation:wave 2000ms ease-out forwards 350ms"/>
      <circle cx="100" cy="70" r="4" fill="#00d4b4" style="animation:drop 2000ms ease-in forwards 250ms"/>
      <circle cx="80" cy="65" r="4" fill="#00d4b4" style="animation:drop 2000ms ease-in forwards 400ms"/>
      <circle cx="120" cy="65" r="4" fill="#00d4b4" style="animation:drop 2000ms ease-in forwards 550ms"/>`;
    return s;
  }},

  water_wheel: { duration: 2100, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes spin{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(720deg)}}@keyframes spray{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:var(--spray)}}</style></defs>
      <g style="animation:spin 2100ms ease-out forwards">
        <circle cx="100" cy="100" r="38" fill="none" stroke="#00d4b4" stroke-width="3"/>
        <line x1="62" y1="100" x2="138" y2="100" stroke="#00d4b4" stroke-width="2"/>
        <line x1="100" y1="62" x2="100" y2="138" stroke="#00d4b4" stroke-width="2"/>
      </g>
      <circle cx="100" cy="100" r="5" fill="#00d4b4" style="--spray:translate(70px,-70px);animation:spray 2100ms ease-out forwards 350ms"/>
      <circle cx="100" cy="100" r="5" fill="#00d4b4" style="--spray:translate(0,-90px);animation:spray 2100ms ease-out forwards 500ms"/>
      <circle cx="100" cy="100" r="5" fill="#00d4b4" style="--spray:translate(-70px,-70px);animation:spray 2100ms ease-out forwards 650ms"/>`;
    return s;
  }},

  harmony_preservation: { duration: 2200, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes shield{0%{r:25px;opacity:1}100%{r:90px;opacity:0}}@keyframes fade{0%{opacity:1}100%{opacity:0}}</style></defs>
      <circle cx="100" cy="100" r="25" fill="none" stroke="#00d4b4" stroke-width="3" style="animation:shield 2200ms ease-out forwards"/>
      <polygon points="100,60 120,100 100,140 80,100" fill="none" stroke="#00d4b4" stroke-width="2" style="animation:fade 2200ms ease-out forwards"/>
      <circle cx="60" cy="100" r="3" fill="#00d4b4" style="animation:fade 2200ms ease-out forwards"/>
      <circle cx="140" cy="100" r="3" fill="#00d4b4" style="animation:fade 2200ms ease-out forwards"/>`;
    return s;
  }},

  hajras_hymn: { duration: 2900, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes burst{0%{opacity:1;transform:scale(0.2)}100%{opacity:0;transform:scale(2.5)}}@keyframes ray{0%{opacity:0.8}100%{opacity:0;stroke-width:4px}}</style></defs>
      <polygon points="100,50 110,80 140,80 117,105 127,135 100,110 73,135 83,105 60,80 90,80" fill="#00d4b4" style="animation:burst 2900ms ease-out forwards"/>
      <line x1="100" y1="20" x2="100" y2="0" stroke="#00d4b4" stroke-width="2" style="animation:ray 2900ms ease-out forwards 400ms"/>
      <line x1="140" y1="60" x2="160" y2="40" stroke="#00d4b4" stroke-width="2" style="animation:ray 2900ms ease-out forwards 600ms"/>
      <line x1="140" y1="140" x2="160" y2="160" stroke="#00d4b4" stroke-width="2" style="animation:ray 2900ms ease-out forwards 800ms"/>`;
    return s;
  }},

  lancing_strike: { duration: 1700, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes thrust{0%{opacity:1;transform:translateY(-50px)}100%{opacity:0;transform:translateY(30px)}}@keyframes impact{0%{r:5px;opacity:1}100%{r:80px;opacity:0}}</style></defs>
      <line x1="100" y1="40" x2="100" y2="120" stroke="#7ddc5f" stroke-width="3" style="animation:thrust 1700ms ease-out forwards"/>
      <polygon points="100,35 95,50 105,50" fill="#7ddc5f" style="animation:thrust 1700ms ease-out forwards"/>
      <circle cx="100" cy="100" r="5" fill="none" stroke="#7ddc5f" stroke-width="2" style="animation:impact 1700ms ease-out forwards 600ms"/>`;
    return s;
  }},

  yaksha_valor_active: { duration: 2000, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes form{0%{r:15px;opacity:0.2}50%{opacity:1}100%{r:75px;opacity:0}}@keyframes pulse{0%{opacity:1;r:30px}100%{opacity:0;r:80px}}</style></defs>
      <circle cx="100" cy="100" r="15" fill="none" stroke="#7ddc5f" stroke-width="3" style="animation:form 2000ms ease-out forwards"/>
      <circle cx="100" cy="100" r="30" fill="none" stroke="#7ddc5f" stroke-width="2" opacity="0.5" style="animation:pulse 2000ms ease-out forwards"/>
      <line x1="70" y1="100" x2="130" y2="100" stroke="#7ddc5f" stroke-width="1.5" opacity="0.6" style="animation:pulse 2000ms ease-out forwards"/>`;
    return s;
  }},

  karmic_barrier: { duration: 2200, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes dome{0%{r:25px;opacity:0.6}100%{r:95px;opacity:0}}@keyframes rotate{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(360deg)}}</style></defs>
      <circle cx="100" cy="100" r="25" fill="none" stroke="#7ddc5f" stroke-width="2" style="animation:dome 2200ms ease-out forwards"/>
      <g style="animation:rotate 2200ms linear forwards">
        <rect x="95" y="45" width="10" height="10" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.7"/>
        <rect x="145" y="95" width="10" height="10" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.7"/>
        <rect x="95" y="145" width="10" height="10" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.7"/>
        <rect x="45" y="95" width="10" height="10" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.7"/>
      </g>`;
    return s;
  }},

  mastery_of_pain: { duration: 2900, create: (i, t) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('width', '200'); s.setAttribute('height', '200');
    s.classList.add('battle-svg-animation');
    s.innerHTML = `<defs><style>@keyframes vortex{0%{transform:translate(100px,100px)rotate(0deg)}100%{transform:translate(100px,100px)rotate(720deg)}}@keyframes slash{0%{opacity:1}50%{opacity:1}100%{opacity:0;transform:scaleX(2)}}@keyframes gust{0%{r:50px;opacity:0.6}100%{r:90px;opacity:0}}</style></defs>
      <g style="animation:vortex 2900ms ease-out forwards">
        <circle cx="100" cy="100" r="45" fill="none" stroke="#7ddc5f" stroke-width="2" opacity="0.6"/>
        <circle cx="100" cy="100" r="65" fill="none" stroke="#7ddc5f" stroke-width="1.5" opacity="0.3"/>
      </g>
      <line x1="50" y1="50" x2="150" y2="150" stroke="#7ddc5f" stroke-width="3" opacity="0.8" style="animation:slash 2900ms ease-out forwards 400ms"/>
      <line x1="150" y1="50" x2="50" y2="150" stroke="#7ddc5f" stroke-width="3" opacity="0.8" style="animation:slash 2900ms ease-out forwards 900ms"/>
      <circle cx="100" cy="100" r="50" fill="none" stroke="#7ddc5f" stroke-width="1" opacity="0.4" style="animation:gust 2900ms ease-out forwards"/>`;
    return s;
  }}
};
