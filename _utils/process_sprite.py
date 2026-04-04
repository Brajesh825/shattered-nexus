"""
process_sprite.py — Downscale image(s) to 48x48 PNG.

Usage:
    python process_sprite.py ayaka.png
    python process_sprite.py *.png
    python process_sprite.py ayaka.png --size 64

Output: ../images/characters/map/<filename>.png

Install: pip install pillow
"""

import argparse
from pathlib import Path
from PIL import Image


def process(input_path: Path, output_path: Path, size: int):
    img = Image.open(input_path).convert("RGBA")

    # Trim transparent border so character fills the frame
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    img = img.resize((size, size), Image.LANCZOS)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "PNG")
    print(f"  saved: {output_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("inputs", nargs="+", help="Input image(s)")
    parser.add_argument("--size", "-s", type=int, default=128)
    args = parser.parse_args()

    default_out = Path(__file__).parent.parent / "images" / "characters" / "map"

    # Collect all matching files
    files = []
    for pattern in args.inputs:
        matches = list(Path(".").glob(pattern))
        if matches:
            files.extend(matches)
        else:
            p = Path(pattern)
            if p.exists():
                files.append(p)
            else:
                print(f"  [not found] {pattern}")

    if not files:
        print("No files found. Check the path and try again.")
        return

    print(f"Processing {len(files)} file(s)...")
    for path in files:
        print(f"  {path.name}")
        try:
            process(path, default_out / (path.stem + ".png"), args.size)
        except Exception as e:
            print(f"  [error] {e}")

    print("Done.")


if __name__ == "__main__":
    main()
