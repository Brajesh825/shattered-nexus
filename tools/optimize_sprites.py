import os
import time
from pathlib import Path
from PIL import Image

# Configuration
SCAN_DIRS = [
    "rpg+/images/characters/spirits",       # Battle Sprites
    "rpg+/images/characters/map/sheets",    # Hero Map Sheets
    "rpg+/images/characters/map/sheets/npc" # NPC Map Sheets
]
TARGET_WIDTH = 1024
WEBP_QUALITY = 85
OUTPUT_SUFFIX = "_low.webp"

def optimize_image(image_path: Path):
    """Resizes an image to 1024px width and saves as WebP."""
    # Determine output path: [base]_low.webp
    # If input is 'ayaka_sprite.png' -> 'ayaka_sprite_low.webp'
    # If input is 'ayaka_sheet.png' -> 'ayaka_sheet_low.webp'
    stem = image_path.stem
    output_path = image_path.parent / f"{stem}{OUTPUT_SUFFIX}"
    
    if output_path.exists():
        return "SKIPPED (Already exists)"
    
    try:
        with Image.open(image_path) as img:
            original_size = os.path.getsize(image_path)
            w, h = img.size
            
            # Skip if already smaller than target width
            if w <= TARGET_WIDTH:
                # Still convert to WebP to save space if it doesn't exist
                new_w, new_h = w, h
            else:
                # Calculate new height maintaining aspect ratio
                ratio = TARGET_WIDTH / float(w)
                new_w = TARGET_WIDTH
                new_h = int(float(h) * ratio)
            
            # Resize
            img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Save as WebP
            img_resized.save(output_path, "WEBP", quality=WEBP_QUALITY)
            
            new_size = os.path.getsize(output_path)
            reduction = (original_size - new_size) / 1024 / 1024
            return f"DONE ({w}x{h} -> {new_w}x{new_h}, saved {reduction:.2f} MB)"
            
    except Exception as e:
        return f"FAILED: {str(e)}"

def run_optimization():
    print("[RUN] RPG+ Sprite Optimization Utility")
    print("====================================")
    
    # Change CWD to the parent of 'rpg+' to ensure relative paths work
    # Assuming script is run from the project root
    base_dir = Path.cwd()
    
    total_processed = 0
    total_skipped = 0
    total_failed = 0
    
    for rel_dir in SCAN_DIRS:
        abs_dir = base_dir / rel_dir
        if not abs_dir.exists():
            print(f"(!) Directory not found: {rel_dir}")
            continue
            
        print(f"\nScanning: {rel_dir}")
        
        # Look for PNG files (excluding existing _low files if they somehow got in as PNG)
        for img_file in abs_dir.glob("*.png"):
            if img_file.name.endswith(OUTPUT_SUFFIX.replace(".webp", ".png")):
                continue
            
            print(f"  * Processing {img_file.name}...", end=" ", flush=True)
            result = optimize_image(img_file)
            print(result)
            
            if "DONE" in result:
                total_processed += 1
            elif "SKIPPED" in result:
                total_skipped += 1
            elif "FAILED" in result:
                total_failed += 1
                
    print("\n====================================")
    print(f"Finished!")
    print(f"   Processed: {total_processed}")
    print(f"   Skipped:   {total_skipped}")
    print(f"   Failed:    {total_failed}")

if __name__ == "__main__":
    run_optimization()
