import os
import sys
import subprocess
import argparse
from pathlib import Path

# Auto-install yt-dlp if missing
try:
    import yt_dlp
except ImportError:
    print("yt-dlp not found. Installing via pip...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "yt-dlp"])
    import yt_dlp

ROOT_DIR = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT_DIR / "audio"

# Locate ffmpeg
FFMPEG_PATH = Path(__file__).parent / "ffmpeg.exe"
if not FFMPEG_PATH.exists():
    FFMPEG_PATH = "ffmpeg"

def download_and_convert(url, output_name, category="bgm", volume_norm="-3dB"):
    """
    Downloads audio using yt-dlp and transcodes it directly to Opus (.webm).
    Uses yt-dlp's built-in postprocessor to avoid temp-file naming issues.
    """
    target_dir = AUDIO_DIR / category
    target_dir.mkdir(parents=True, exist_ok=True)

    final_webm = target_dir / f"{output_name}.webm"
    bitrate = "96k" if category == "bgm" else "48k"

    print(f"Sourcing audio from: {url}")

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': str(target_dir / f"{output_name}.%(ext)s"),
        'postprocessors': [
            {
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'opus',
                'preferredquality': bitrate.replace('k', ''),
            },
            {
                'key': 'FFmpegMetadata',
            }
        ],
        'postprocessor_args': [
            '-af', f'volume={volume_norm}',
            '-b:a', bitrate,
            '-vbr', 'on',
        ],
        'ffmpeg_location': str(FFMPEG_PATH),
        'match_filter': yt_dlp.utils.match_filter_func("duration < 360"),
        'quiet': False,
        'no_warnings': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except Exception as e:
        print(f"Download failed: {e}")
        sys.exit(1)

    # yt-dlp names it .opus, rename to .webm for PWA compatibility
    opus_file = target_dir / f"{output_name}.opus"
    if opus_file.exists():
        opus_file.rename(final_webm)
        print(f"Success! Audio saved to: {final_webm.relative_to(ROOT_DIR)}")
    elif final_webm.exists():
        print(f"Success! Audio saved to: {final_webm.relative_to(ROOT_DIR)}")
    else:
        # Try any matching file
        candidates = list(target_dir.glob(f"{output_name}.*"))
        if candidates:
            candidates[0].rename(final_webm)
            print(f"Success! Audio saved to: {final_webm.relative_to(ROOT_DIR)}")
        else:
            print(f"Warning: could not locate output for {output_name}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Resonance AI Audio Fetcher")
    parser.add_argument("url", help="YouTube URL or search query (e.g. 'ytsearch1:royalty free boss music')")
    parser.add_argument("name", help="Output filename (without extension)")
    parser.add_argument("--category", choices=["bgm", "sfx"], default="bgm", help="Target category (default: bgm)")

    args = parser.parse_args()

    search_url = args.url
    if not search_url.startswith("http") and not search_url.startswith("ytsearch"):
        search_url = f"ytsearch1:{args.url}"

    download_and_convert(search_url, args.name, args.category)
