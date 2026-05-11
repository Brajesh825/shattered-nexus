from PIL import Image
import os
from pathlib import Path

# Paths
ENEMIES_DIR = Path("images/enemies")

# Mapping of generated PNGs to target WebP filenames
MAPPING = {
    "pale_king.png": "lich.webp",
    "ebon_champion.png": "dark_knight.webp",
    "skeletal_maw.png": "bone_dragon.webp",
    "storm_sentinel_v2.png": "storm_sentinel.webp",
    "shadow_emperor_true.png": "shadow_emperor_true.webp"
}

def remove_background_and_convert(src_filename, dest_filename):
    src_path = ENEMIES_DIR / src_filename
    dest_path = ENEMIES_DIR / dest_filename
    
    if not src_path.exists():
        print(f"Skipping {src_filename}: Source not found.")
        return

    print(f"Processing {src_filename} -> {dest_filename}...")
    
    try:
        with Image.open(src_path) as img:
            img = img.convert("RGBA")
            datas = img.getdata()

            # Create new data with transparency
            new_data = []
            for item in datas:
                # If pixel is white or very close to white, make it transparent
                # generate_image usually produces very clean white backgrounds
                if item[0] > 250 and item[1] > 250 and item[2] > 250:
                    new_data.append((255, 255, 255, 0))
                else:
                    new_data.append(item)

            img.putdata(new_data)
            
            # Save as lossless WebP
            img.save(dest_path, "WEBP", lossless=True)
            print(f"  * Successfully saved to {dest_path}")
            
            # Remove the original PNG to clean up
            os.remove(src_path)
            
    except Exception as e:
        print(f"  * FAILED: {e}")

if __name__ == "__main__":
    print("RPG+ Sprite Background Removal & Conversion Tool")
    print("================================================")
    for src, dest in MAPPING.items():
        remove_background_and_convert(src, dest)
    print("\nProcess complete.")
