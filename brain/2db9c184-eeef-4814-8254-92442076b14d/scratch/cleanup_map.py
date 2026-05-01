import json

map_path = r'c:\Users\ASUS\VVI\rpg+\js\map\data\map-verdant-vale.json'

with open(map_path, 'r') as f:
    data = json.load(f)

# Data structure: [layer0, layer1, layer2]
# Each layer is a 60x60 grid
layers = data

# Clear everything from Layer 1 and Layer 2 except for the top-left area we might want to keep
for l in range(1, 3):
    for y in range(len(layers[l])):
        for x in range(len(layers[l][y])):
            # If it's a Scorched Earth (ID 24) or similar unwanted ghost tile, wipe it
            if layers[l][y][x] == 24 or layers[l][y][x] == 250:
                layers[l][y][x] = 0

with open(map_path, 'w') as f:
    json.dump(layers, f)

print("Surgically cleaned ghost tiles from decoration layers.")
