import os
from pathlib import Path
from PIL import Image

# Paths
NPC_SHEETS_DIR = Path("images/characters/map/sheets/npc")

TARGETS = [
    "holographic_log_orb_sheet.png",
    "ancient_tide_bell_sheet.png",
    "toll_bridge_marker_sheet.png",
    "bone_shard_sheet.png",
    "silver_locket_sheet.png",
    "squad_insignia_sheet.png",
    "cursed_idol_sheet.png"
]

SHEET_WIDTH = 1024
SHEET_HEIGHT = 512
COLS = 6
ROWS = 2

# Target icon dimension to comfortably fit inside the 170px wide frame column
ICON_SIZE = 120
BOTTOM_PADDING = 25  # Rest icon perfectly on the lower tile shadow plane

def build_compatible_sheet(filename):
    file_path = NPC_SHEETS_DIR / filename
    if not file_path.exists():
        print(f"Skipping {filename}: Source not found.")
        return

    print(f"Constructing 12-frame compatible sheet grid for {filename}...")
    try:
        # Load the transparent single icon buffer
        with Image.open(file_path) as src_img:
            src_img = src_img.convert("RGBA")
            
            # Isolate the actual non-transparent bounding box to be absolutely robust
            bbox = src_img.getbbox()
            if bbox:
                cropped_icon = src_img.crop(bbox)
            else:
                cropped_icon = src_img
                
            # Scale icon cleanly
            cropped_icon.thumbnail((ICON_SIZE, ICON_SIZE), Image.Resampling.LANCZOS)
            icon_w, icon_h = cropped_icon.size

            # Create pristine master transparent canvas
            master_sheet = Image.new("RGBA", (SHEET_WIDTH, SHEET_HEIGHT), (255, 255, 255, 0))
            frame_w = SHEET_WIDTH // COLS
            frame_h = SHEET_HEIGHT // ROWS

            # Populate all 12 major operational frame slots to ensure total directional compatibility
            for r in range(ROWS):
                for c in range(COLS):
                    dest_x = c * frame_w + (frame_w - icon_w) // 2
                    dest_y = r * frame_h + frame_h - icon_h - BOTTOM_PADDING
                    master_sheet.paste(cropped_icon, (dest_x, dest_y), cropped_icon)

            # Save full authoritative PNG sprite sheet natively
            master_sheet.save(file_path, "PNG")
            print(f"  * Master 12-frame PNG sheet saved perfectly to {filename}")

            # Concurrently emit highly compressed low-weight WebP asset variant
            low_webp_filename = filename.replace(".png", "_low.webp")
            low_webp_path = NPC_SHEETS_DIR / low_webp_filename
            master_sheet.save(low_webp_path, "WEBP", quality=85)
            print(f"  * Companion low-weight WebP saved successfully as {low_webp_filename}")

    except Exception as e:
        print(f"  * FAILED processing {filename}: {e}")

if __name__ == "__main__":
    print("RPG+ Universal Object Grid Sheet Compiler")
    print("========================================")
    for target in TARGETS:
        build_compatible_sheet(target)
    print("\nUniversal 12-frame grid compiler successfully completed.")
