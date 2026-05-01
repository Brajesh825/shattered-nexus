import os

svg_dir = r'c:\Users\ASUS\VVI\rpg+\images\environment\svg'
os.makedirs(svg_dir, exist_ok=True)

svgs = {
    'cottage': '''<svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 130 L170 130 L170 70 L100 20 L30 70 Z" fill="#a1887f" stroke="#5d4037" stroke-width="4"/>
  <path d="M30 70 L100 20 L170 70" fill="none" stroke="#795548" stroke-width="6"/>
  <rect x="140" y="30" width="15" height="40" fill="#5d4037"/>
  <rect x="85" y="90" width="30" height="40" fill="#3e2723"/>
  <rect x="45" y="85" width="20" height="20" fill="#ffe082" stroke="#5d4037" stroke-width="2"/>
</svg>''',
    'farmhouse': '''<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="80" width="240" height="100" fill="#8d6e63" stroke="#5d4037" stroke-width="4"/>
  <path d="M30 80 L150 20 L270 80 Z" fill="#5d4037"/>
  <rect x="50" y="110" width="40" height="70" fill="#3e2723"/>
  <rect x="120" y="100" width="30" height="30" fill="#ffe082" stroke="#5d4037"/>
  <rect x="180" y="100" width="30" height="30" fill="#ffe082" stroke="#5d4037"/>
  <rect x="230" y="100" width="30" height="30" fill="#ffe082" stroke="#5d4037"/>
</svg>''',
    'windmill': '''<svg width="200" height="250" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
  <path d="M60 230 L140 230 L120 80 L80 80 Z" fill="#cfd8dc" stroke="#455a64" stroke-width="4"/>
  <path d="M80 80 L100 50 L120 80 Z" fill="#455a64"/>
  <g transform="translate(100, 80)">
    <g>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite" />
      <rect x="-5" y="-70" width="10" height="140" fill="#795548" stroke="#3e2723"/>
      <rect x="-70" y="-5" width="140" height="10" fill="#795548" stroke="#3e2723"/>
      <rect x="-60" y="-15" width="50" height="30" fill="#eceff1" opacity="0.8"/>
      <rect x="10" y="-15" width="50" height="30" fill="#eceff1" opacity="0.8"/>
    </g>
  </g>
  <rect x="90" y="190" width="20" height="40" fill="#3e2723"/>
</svg>''',
    'well_house': '''<svg width="120" height="150" viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 130 A40 15 0 0 0 100 130 L100 100 A40 15 0 0 0 20 100 Z" fill="#90a4ae" stroke="#455a64" stroke-width="3"/>
  <rect x="30" y="40" width="5" height="70" fill="#795548"/>
  <rect x="85" y="40" width="5" height="70" fill="#795548"/>
  <path d="M10 50 L60 10 L110 50 Z" fill="#5d4037" stroke="#3e2723"/>
  <rect x="55" y="60" width="10" height="15" fill="#3e2723"/>
</svg>''',
    'workshop': '''<svg width="250" height="180" viewBox="0 0 250 180" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 160 L180 160 L180 80 L100 30 L20 80 Z" fill="#8d6e63" stroke="#5d4037" stroke-width="4"/>
  <rect x="190" y="130" width="40" height="10" fill="#795548"/>
  <rect x="195" y="140" width="30" height="10" fill="#795548"/>
  <rect x="200" y="150" width="20" height="10" fill="#795548"/>
  <rect x="40" y="110" width="60" height="50" fill="#3e2723"/>
  <rect x="120" y="110" width="40" height="50" fill="#5d4037" stroke="#3e2723"/>
</svg>''',
    'merchant_store': '''<svg width="220" height="200" viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 180 L200 180 L200 90 L110 30 L20 90 Z" fill="#5d4037" stroke="#3e2723" stroke-width="4"/>
  <rect x="40" y="110" width="70" height="50" fill="#ffe082" stroke="#3e2723" stroke-width="2"/>
  <rect x="130" y="110" width="40" height="70" fill="#3e2723"/>
  <path d="M20 90 L110 30 L200 90" fill="none" stroke="#795548" stroke-width="6"/>
  <circle cx="110" cy="55" r="15" fill="#ffd700" stroke="#b8860b" stroke-width="2"/>
  <text x="105" y="60" font-family="Arial" font-size="12" font-weight="bold" fill="#b8860b">$</text>
</svg>''',
    'library': '''<svg width="200" height="280" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 260 L170 260 L170 60 L100 10 L30 60 Z" fill="#cfd8dc" stroke="#455a64" stroke-width="4"/>
  <rect x="50" y="90" width="25" height="40" fill="#90caf9" stroke="#455a64"/>
  <rect x="125" y="90" width="25" height="40" fill="#90caf9" stroke="#455a64"/>
  <rect x="50" y="160" width="25" height="40" fill="#90caf9" stroke="#455a64"/>
  <rect x="125" y="160" width="25" height="40" fill="#90caf9" stroke="#455a64"/>
  <rect x="85" y="210" width="30" height="50" fill="#4e342e"/>
</svg>''',
    'bakery': '''<svg width="220" height="180" viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 160 L200 160 L200 70 L110 20 L20 70 Z" fill="#d7ccc8" stroke="#5d4037" stroke-width="4"/>
  <rect x="40" y="90" width="60" height="50" fill="#ffe082" stroke="#5d4037"/>
  <rect x="120" y="90" width="40" height="70" fill="#5d4037"/>
  <path d="M40 80 Q70 60 100 80" fill="none" stroke="#ffb74d" stroke-width="4"/>
</svg>''',
    'fisherman_hut': '''<svg width="250" height="180" viewBox="0 0 250 180" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 140 L160 140 L160 70 L90 20 L20 70 Z" fill="#a1887f" stroke="#5d4037" stroke-width="3"/>
  <rect x="160" y="130" width="80" height="10" fill="#795548"/>
  <line x1="180" y1="140" x2="180" y2="160" stroke="#795548" stroke-width="4"/>
  <line x1="220" y1="140" x2="220" y2="160" stroke="#795548" stroke-width="4"/>
  <path d="M40 140 Q70 100 100 140" fill="none" stroke="#eceff1" stroke-width="1" opacity="0.6"/>
  <rect x="60" y="90" width="30" height="50" fill="#3e2723"/>
</svg>''',
    'village_hall': '''<svg width="350" height="250" viewBox="0 0 350 250" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="100" width="270" height="130" fill="#cfd8dc" stroke="#455a64" stroke-width="5"/>
  <path d="M40 100 L175 20 L310 100 Z" fill="#455a64"/>
  <rect x="150" y="150" width="50" height="80" fill="#3e2723"/>
  <rect x="165" y="30" width="20" height="40" fill="#90a4ae"/>
  <circle cx="175" cy="45" r="5" fill="#ffd700"/>
  <rect x="70" y="130" width="40" height="40" fill="#90caf9" stroke="#455a64"/>
  <rect x="240" y="130" width="40" height="40" fill="#90caf9" stroke="#455a64"/>
</svg>'''
}

for name, content in svgs.items():
    with open(os.path.join(svg_dir, f'{name}.svg'), 'w') as f:
        f.write(content)
