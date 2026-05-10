import os
import subprocess
from pathlib import Path

# Paths
AUDIO_DIR = Path(r"c:\Users\ASUS\VVI\rpg+\audio\bgm")

def convert_audio():
    print(f"Starting audio migration in {AUDIO_DIR}...")
    
    mp3_files = list(AUDIO_DIR.glob("*.mp3"))
    total = len(mp3_files)
    
    if total == 0:
        print("No MP3 files found.")
        return

    # Check for local ffmpeg in tools/ first
    local_ffmpeg = Path(__file__).parent / "ffmpeg.exe"
    ffmpeg_cmd = "ffmpeg"
    if local_ffmpeg.exists():
        ffmpeg_cmd = str(local_ffmpeg)
        print(f"Using local ffmpeg: {ffmpeg_cmd}")

    try:
        subprocess.run([ffmpeg_cmd, "-version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(f"\nERROR: '{ffmpeg_cmd}' not found.")
        print("Please ensure ffmpeg is available to proceed with conversion.")
        return

    for i, mp3_path in enumerate(mp3_files, 1):
        webm_path = mp3_path.with_suffix(".webm")
        
        print(f"[{i}/{total}] Converting: {mp3_path.name} ...")
        
        # ffmpeg command for high-quality Opus (WebM)
        # -c:a libopus: Use Opus codec
        # -b:a 96k: 96kbps is excellent for JRPG music (comparable to 192kbps+ MP3)
        # -vbr on: Variable Bitrate for efficiency
        cmd = [
            ffmpeg_cmd, "-y", "-i", str(mp3_path),
            "-c:a", "libopus", "-b:a", "96k", "-vbr", "on",
            str(webm_path)
        ]
        
        try:
            subprocess.run(cmd, capture_output=True, check=True)
            old_size = mp3_path.stat().st_size / 1024 / 1024
            new_size = webm_path.stat().st_size / 1024 / 1024
            reduction = (1 - new_size/old_size) * 100
            print(f"  [OK] Success! {old_size:.1f}MB -> {new_size:.1f}MB ({reduction:.0f}% reduction)")
        except subprocess.CalledProcessError as e:
            print(f"  [ERROR] FAILED: {e.stderr.decode()}")

    print("\nPhase 1 Complete! You can now listen to the .webm files in the audio/bgm folder.")

if __name__ == "__main__":
    convert_audio()
