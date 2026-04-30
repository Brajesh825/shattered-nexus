import os

svg_dir = r'c:\Users\ASUS\VVI\rpg+\images\environment\svg'
os.makedirs(svg_dir, exist_ok=True)

svgs = {
    'barracks': '''<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 180 L280 180 L280 80 L150 20 L20 80 Z" fill="#5d4037" stroke="#3e2723" stroke-width="4"/>
  <path d="M20 80 L150 20 L280 80" fill="none" stroke="#2b1d16" stroke-width="6"/>
  <rect x="50" y="100" width="30" height="50" fill="#3e2723"/>
  <rect x="120" y="100" width="30" height="50" fill="#3e2723"/>
  <rect x="190" y="100" width="30" height="50" fill="#3e2723"/>
  <path d="M20 180 L280 180" stroke="#1a1410" stroke-width="4"/>
</svg>''',
    'archery_range': '''<svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="120" width="160" height="10" fill="#8d6e63"/>
  <circle cx="50" cy="80" r="25" fill="#fff" stroke="#ff5252" stroke-width="4"/>
  <circle cx="50" cy="80" r="15" fill="#fff" stroke="#ff5252" stroke-width="4"/>
  <circle cx="50" cy="80" r="5" fill="#ff5252"/>
  <rect x="120" y="40" width="60" height="90" fill="#a1887f" stroke="#5d4037" stroke-width="3"/>
  <path d="M120 40 L150 10 L180 40 Z" fill="#5d4037"/>
</svg>''',
    'blacksmith': '''<svg width="200" height="180" viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 160 L170 160 L170 60 L100 20 L30 60 Z" fill="#455a64" stroke="#263238" stroke-width="4"/>
  <rect x="140" y="20" width="20" height="50" fill="#263238"/>
  <path d="M140 20 L160 20" stroke="#1a1a1a" stroke-width="2"/>
  <rect x="70" y="100" width="60" height="60" fill="#263238"/>
  <rect x="80" y="110" width="40" height="30" fill="#ff5722" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
  </rect>
  <path d="M80 150 L120 150 L130 160 L70 160 Z" fill="#37474f"/>
</svg>''',
    'stable': '''<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 130 L270 130 L270 60 L150 20 L30 60 Z" fill="#795548" stroke="#3e2723" stroke-width="4"/>
  <line x1="90" y1="60" x2="90" y2="130" stroke="#3e2723" stroke-width="3"/>
  <line x1="150" y1="60" x2="150" y2="130" stroke="#3e2723" stroke-width="3"/>
  <line x1="210" y1="60" x2="210" y2="130" stroke="#3e2723" stroke-width="3"/>
  <rect x="40" y="110" width="40" height="20" fill="#ffeb3b" opacity="0.6"/>
  <rect x="100" y="110" width="40" height="20" fill="#ffeb3b" opacity="0.6"/>
</svg>''',
    'tavern': '''<svg width="300" height="220" viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 200 L270 200 L270 90 L150 20 L30 90 Z" fill="#5d4037" stroke="#3e2723" stroke-width="5"/>
  <rect x="130" y="130" width="40" height="70" fill="#3e2723"/>
  <rect x="60" y="110" width="30" height="30" fill="#ffe082" stroke="#3e2723"/>
  <rect x="210" y="110" width="30" height="30" fill="#ffe082" stroke="#3e2723"/>
  <rect x="200" y="50" width="40" height="15" fill="#8d6e63" stroke="#3e2723"/>
  <text x="205" y="62" font-family="Arial" font-size="10" fill="#fff">PUB</text>
</svg>''',
    'chapel': '''<svg width="200" height="250" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
  <path d="M40 230 L160 230 L160 100 L100 40 L40 100 Z" fill="#cfd8dc" stroke="#455a64" stroke-width="4"/>
  <path d="M85 230 L115 230 L115 170 Q100 150 85 170 Z" fill="#455a64"/>
  <path d="M70 120 L70 80 Q100 60 130 80 L130 120 Z" fill="#90caf9" stroke="#455a64" opacity="0.7"/>
  <rect x="90" y="10" width="20" height="40" fill="#455a64"/>
  <circle cx="100" cy="30" r="5" fill="#ffd700"/>
</svg>''',
    'watchtower': '''<svg width="100" height="300" viewBox="0 0 100 300" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 280 L70 280 L60 60 L40 60 Z" fill="#5d4037" stroke="#3e2723" stroke-width="4"/>
  <rect x="20" y="20" width="60" height="50" fill="#8d6e63" stroke="#3e2723" stroke-width="3"/>
  <path d="M20 20 L50 0 L80 20 Z" fill="#3e2723"/>
  <rect x="45" y="30" width="10" height="15" fill="#ffe082"/>
</svg>''',
    'wall_section': '''<svg width="100" height="150" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="30" width="80" height="120" fill="#90a4ae" stroke="#455a64" stroke-width="4"/>
  <rect x="10" y="10" width="20" height="20" fill="#455a64"/>
  <rect x="40" y="10" width="20" height="20" fill="#455a64"/>
  <rect x="70" y="10" width="20" height="20" fill="#455a64"/>
  <line x1="10" y1="60" x2="90" y2="60" stroke="#455a64" stroke-width="2"/>
  <line x1="10" y1="90" x2="90" y2="90" stroke="#455a64" stroke-width="2"/>
</svg>''',
    'granary': '''<svg width="150" height="200" viewBox="0 0 150 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 180 A50 20 0 0 0 130 180 L130 60 A50 20 0 0 0 30 60 Z" fill="#b0bec5" stroke="#455a64" stroke-width="4"/>
  <path d="M30 60 Q80 10 130 60" fill="#546e7a" stroke="#455a64" stroke-width="4"/>
  <rect x="70" y="140" width="10" height="40" fill="#455a64"/>
</svg>''',
    'healer_hut': '''<svg width="200" height="180" viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 160 L170 160 L170 70 L100 20 L30 70 Z" fill="#5d4037" stroke="#3e2723" stroke-width="4"/>
  <rect x="85" y="100" width="30" height="60" fill="#3e2723"/>
  <path d="M140 100 L160 100 L160 120 L140 120 Z" fill="#fff" stroke="#4caf50" stroke-width="2"/>
  <path d="M150 102 L150 118 M142 110 L158 110" stroke="#4caf50" stroke-width="3"/>
  <rect x="40" y="80" width="20" height="10" fill="#4caf50" opacity="0.6"/>
</svg>'''
}

for name, content in svgs.items():
    with open(os.path.join(svg_dir, f'{name}.svg'), 'w') as f:
        f.write(content)
