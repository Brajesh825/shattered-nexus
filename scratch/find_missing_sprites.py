
import json
import os

with open('data/enemies.json', 'r') as f:
    enemies = json.load(f)

enemy_ids = [e['id'] for e in enemies]
images = [f.replace('.png', '') for f in os.listdir('images/enemies') if f.endswith('.png')]

missing = [eid for eid in enemy_ids if eid not in images]

print("Missing Sprites:")
for m in missing:
    print(f"- {m}")
