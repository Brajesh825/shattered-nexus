import os

svg_dir = r'c:\Users\ASUS\VVI\rpg+\images\environment\svg'
os.makedirs(svg_dir, exist_ok=True)

svgs = {
    'military_tent': '''<svg width="100" height="80" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 70 L50 10 L90 70 Z" fill="#5d4037" stroke="#3e2723" stroke-width="3"/>
  <path d="M50 10 L50 70" stroke="#3e2723" stroke-width="2" stroke-dasharray="4"/>
  <rect x="40" y="50" width="20" height="20" fill="#3e2723"/>
</svg>''',
    'training_ring': '''<svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
  <circle cx="75" cy="75" r="60" fill="none" stroke="#8d6e63" stroke-width="4" stroke-dasharray="10,5"/>
  <circle cx="75" cy="75" r="40" fill="none" stroke="#8d6e63" stroke-width="2" opacity="0.5"/>
  <rect x="70" y="20" width="10" height="20" fill="#4e342e"/>
  <rect x="70" y="110" width="10" height="20" fill="#4e342e"/>
</svg>''',
    'supply_crate': '''<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="50" height="50" fill="#795548" stroke="#3e2723" stroke-width="3"/>
  <line x1="5" y1="5" x2="55" y2="55" stroke="#3e2723" stroke-width="2"/>
  <line x1="5" y1="55" x2="55" y2="5" stroke="#3e2723" stroke-width="2"/>
</svg>''',
    'barracks': '''<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="60" width="260" height="120" fill="#37474f" stroke="#263238" stroke-width="5"/>
  <path d="M20 60 L150 10 L280 60 Z" fill="#263238"/>
  <rect x="130" y="120" width="40" height="60" fill="#3e2723"/>
  <rect x="50" y="90" width="30" height="40" fill="#90a4ae" stroke="#263238"/>
  <rect x="220" y="90" width="30" height="40" fill="#90a4ae" stroke="#263238"/>
</svg>'''
}

for name, content in svgs.items():
    with open(os.path.join(svg_dir, f'{name}.svg'), 'w') as f:
        f.write(content)
