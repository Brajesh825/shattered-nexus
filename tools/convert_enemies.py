import os
from PIL import Image
from pathlib import Path

# Paths
ENEMIES_DIR = Path(r"c:\Users\ASUS\VVI\rpg+\images\enemies")

def convert_to_webp():
    print(f"Starting conversion in {ENEMIES_DIR}...")
    
    png_files = list(ENEMIES_DIR.glob("*.png"))
    total = len(png_files)
    
    if total == 0:
        print("No PNG files found.")
        return

    for i, png_path in enumerate(png_files, 1):
        webp_path = png_path.with_suffix(".webp")
        
        try:
            with Image.open(png_path) as img:
                # Save as lossless WebP to preserve high-fidelity details
                img.save(webp_path, "WEBP", lossless=True)
            print(f"[{i}/{total}] Converted: {png_path.name} -> {webp_path.name}")
        except Exception as e:
            print(f"[{i}/{total}] FAILED: {png_path.name} - {e}")

    print("\nConversion complete!")

if __name__ == "__main__":
    convert_to_webp()
