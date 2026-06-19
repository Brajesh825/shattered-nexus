import os
import sys
import time
from pathlib import Path
from PIL import Image

# Configuration
# Two scan-dir tables: one rooted at "rpg+/..." (when run from the parent of the project folder),
# and a fallback rooted at "images/..." (when run from inside the project folder).
SCAN_DIRS_NESTED = [
    "rpg+/images/characters/spirits",       # Battle Sprites
    "rpg+/images/characters/map/sheets",    # Hero Map Sheets
    "rpg+/images/characters/map/sheets/npc" # NPC Map Sheets
]
SCAN_DIRS_DIRECT = [
    "images/characters/spirits",
    "images/characters/map/sheets",
    "images/characters/map/sheets/npc"
]

TARGET_WIDTH_LOW = 1024
WEBP_QUALITY_LOW = 85
WEBP_QUALITY_FULL = 92   # higher quality for full-size normal-quality assets

# Suffix policy:
#   low  -> stem + '_low.webp'   (downsampled)
#   full -> stem + '.webp'       (same resolution, lossless-ish WebP)
LOW_SUFFIX = "_low.webp"
FULL_SUFFIX = ".webp"


def _output_path_for(image_path: Path, mode: str) -> Path:
    """Resolve the output WebP path for a given input PNG and conversion mode."""
    stem = image_path.stem
    if mode == "low":
        return image_path.parent / f"{stem}{LOW_SUFFIX}"
    return image_path.parent / f"{stem}{FULL_SUFFIX}"


def optimize_image(image_path: Path, mode: str = "low"):
    """Convert an image to WebP. mode='low' downsamples to TARGET_WIDTH_LOW;
    mode='full' preserves the original resolution at WEBP_QUALITY_FULL."""
    output_path = _output_path_for(image_path, mode)

    if output_path.exists():
        return "SKIPPED (Already exists)"

    try:
        with Image.open(image_path) as img:
            original_size = os.path.getsize(image_path)
            w, h = img.size

            if mode == "low":
                if w <= TARGET_WIDTH_LOW:
                    new_w, new_h = w, h
                else:
                    ratio = TARGET_WIDTH_LOW / float(w)
                    new_w = TARGET_WIDTH_LOW
                    new_h = int(float(h) * ratio)
                img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                img_resized.save(output_path, "WEBP", quality=WEBP_QUALITY_LOW)
            else:  # full
                new_w, new_h = w, h
                # Preserve mode (RGBA, P, etc.) — WebP supports alpha
                img.save(output_path, "WEBP", quality=WEBP_QUALITY_FULL, method=6)

            new_size = os.path.getsize(output_path)
            reduction_mb = (original_size - new_size) / 1024 / 1024
            return f"DONE ({w}x{h} -> {new_w}x{new_h}, saved {reduction_mb:.2f} MB)"
    except Exception as e:
        return f"FAILED: {str(e)}"


def _resolve_scan_dirs(base_dir: Path):
    """Pick the right scan-dir list based on where the script is being run."""
    if (base_dir / SCAN_DIRS_NESTED[0]).exists():
        return SCAN_DIRS_NESTED
    if (base_dir / SCAN_DIRS_DIRECT[0]).exists():
        return SCAN_DIRS_DIRECT
    # Fallback: try script-relative resolution (parent of /tools)
    script_root = Path(__file__).resolve().parent.parent
    if (script_root / SCAN_DIRS_DIRECT[0]).exists():
        return [str(script_root / d) for d in SCAN_DIRS_DIRECT]
    return SCAN_DIRS_DIRECT  # let the "not found" warnings surface


def run_optimization(mode: str = "low"):
    print(f"[RUN] RPG+ Sprite Optimization Utility (mode={mode})")
    print("====================================")

    base_dir = Path.cwd()
    scan_dirs = _resolve_scan_dirs(base_dir)

    total_processed = 0
    total_skipped = 0
    total_failed = 0

    for rel_dir in scan_dirs:
        abs_dir = Path(rel_dir) if Path(rel_dir).is_absolute() else (base_dir / rel_dir)
        if not abs_dir.exists():
            print(f"(!) Directory not found: {rel_dir}")
            continue

        print(f"\nScanning: {rel_dir}")

        # Look for PNG files (skip any that look like generated outputs)
        for img_file in abs_dir.glob("*.png"):
            # Skip Pillow tmp files / placeholders
            if img_file.name.startswith("."):
                continue

            print(f"  * Processing {img_file.name}...", end=" ", flush=True)
            result = optimize_image(img_file, mode=mode)
            print(result)

            if "DONE" in result:
                total_processed += 1
            elif "SKIPPED" in result:
                total_skipped += 1
            elif "FAILED" in result:
                total_failed += 1

    print("\n====================================")
    print("Finished!")
    print(f"   Processed: {total_processed}")
    print(f"   Skipped:   {total_skipped}")
    print(f"   Failed:    {total_failed}")


if __name__ == "__main__":
    # CLI:
    #   python tools/optimize_sprites.py            -> low (downsampled, legacy default)
    #   python tools/optimize_sprites.py --full     -> full (same-resolution WebP)
    #   python tools/optimize_sprites.py --all      -> run both passes
    args = [a.lower() for a in sys.argv[1:]]
    if "--all" in args:
        run_optimization("full")
        run_optimization("low")
    elif "--full" in args:
        run_optimization("full")
    else:
        run_optimization("low")
