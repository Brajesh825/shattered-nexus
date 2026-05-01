import os

svg_dir = r'c:\Users\ASUS\VVI\rpg+\images\environment\svg'
os.makedirs(svg_dir, exist_ok=True)

svgs = {
    'estate_manor': '''<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="100" width="300" height="180" fill="#cfd8dc" stroke="#455a64" stroke-width="6"/>
  <path d="M50 100 L200 20 L350 100 Z" fill="#455a64"/>
  <rect x="150" y="200" width="100" height="80" fill="#3e2723"/>
  <rect x="150" y="120" width="100" height="40" fill="#90caf9" stroke="#455a64" stroke-width="2"/>
  <rect x="70" y="140" width="50" height="80" fill="#90caf9" stroke="#455a64" stroke-width="2"/>
  <rect x="280" y="140" width="50" height="80" fill="#90caf9" stroke="#455a64" stroke-width="2"/>
  <rect x="140" y="190" width="120" height="10" fill="#455a64"/>
</svg>''',
    'conservatory': '''<svg width="250" height="200" viewBox="0 0 250 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 180 L220 180 L200 60 L125 20 L50 60 Z" fill="rgba(144, 202, 249, 0.4)" stroke="#4fc3f7" stroke-width="3"/>
  <line x1="50" y1="60" x2="200" y2="60" stroke="#4fc3f7" stroke-width="2"/>
  <line x1="125" y1="20" x2="125" y2="180" stroke="#4fc3f7" stroke-width="1"/>
  <rect x="60" y="120" width="20" height="60" fill="#4caf50" opacity="0.8"/>
  <rect x="170" y="100" width="20" height="80" fill="#2e7d32" opacity="0.8"/>
  <rect x="110" y="130" width="30" height="50" fill="#81c784" opacity="0.8"/>
</svg>''',
    'noble_villa': '''<svg width="250" height="180" viewBox="0 0 250 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="70" width="190" height="100" fill="#eceff1" stroke="#b0bec5" stroke-width="4"/>
  <path d="M30 70 L125 10 L220 70 Z" fill="#78909c"/>
  <rect x="100" y="110" width="50" height="60" fill="#4e342e"/>
  <rect x="50" y="90" width="30" height="30" fill="#bbdefb" stroke="#78909c"/>
  <rect x="170" y="90" width="30" height="30" fill="#bbdefb" stroke="#78909c"/>
</svg>''',
    'gazebo': '''<svg width="150" height="180" viewBox="0 0 150 180" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 160 L130 160 L130 140 L20 140 Z" fill="#cfd8dc" stroke="#455a64"/>
  <rect x="35" y="60" width="8" height="80" fill="#b0bec5"/>
  <rect x="107" y="60" width="8" height="80" fill="#b0bec5"/>
  <rect x="71" y="60" width="8" height="80" fill="#b0bec5"/>
  <path d="M10 70 L75 10 L140 70 Z" fill="#455a64"/>
  <rect x="30" y="150" width="90" height="10" fill="#90a4ae"/>
</svg>''',
    'triumphal_arch': '''<svg width="300" height="250" viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="50" width="60" height="180" fill="#cfd8dc" stroke="#455a64" stroke-width="5"/>
  <rect x="200" y="50" width="60" height="180" fill="#cfd8dc" stroke="#455a64" stroke-width="5"/>
  <path d="M40 50 L260 50 L260 20 L40 20 Z" fill="#455a64"/>
  <path d="M100 100 Q150 50 200 100" fill="none" stroke="#455a64" stroke-width="10"/>
  <circle cx="150" cy="35" r="10" fill="#ffd700" stroke="#b8860b"/>
</svg>'''
}

for name, content in svgs.items():
    with open(os.path.join(svg_dir, f'{name}.svg'), 'w') as f:
        f.write(content)
