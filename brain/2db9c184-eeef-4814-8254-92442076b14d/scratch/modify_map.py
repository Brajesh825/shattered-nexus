import json
import math

path = r'c:\Users\ASUS\VVI\rpg+\js\map\data\map-verdant-vale.json'
with open(path, 'r') as f:
    data = json.load(f)

terrain = data[0]
decor = data[1]

# 1. Winding River & Scorched Earth
for y in range(60):
    offset = int(math.sin(y / 5.0) * 3)
    # Move river
    for x in range(60):
        if terrain[y][x] == 3: terrain[y][x] = 1 # Clear old river
    for x in range(28 + offset, 33 + offset):
        if 0 <= x < 60: terrain[y][x] = 3
    
    # Scorched Earth near bridge (Row 16-18)
    if 14 <= y <= 20:
        for x in range(20 + offset, 40 + offset):
            if 0 <= x < 60 and terrain[y][x] == 1:
                terrain[y][x] = 14

# 2. Void Corruption (Eastern Section)
void_spots = [(10, 45), (15, 52), (25, 48), (38, 55), (45, 50)]
for y, x in void_spots:
    decor[y][x] = 237 # Void Spire
decor[22][53] = 230 # Void Rift
decor[42][56] = 247 # Cursed Well

# 3. Ritual & Castle Detailing
decor[52][12] = 233 # Floating Crystal near Magic Circle
decor[55][15] = 236 # Sacrificial Altar
decor[50][45] = 307 # Armor Stand in Courtyard
decor[50][48] = 308 # Weapon Rack
decor[53][42] = 302 # Stone Bench

with open(path, 'w') as f:
    json.dump(data, f)
