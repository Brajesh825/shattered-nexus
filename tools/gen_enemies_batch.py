import json
import requests
import time
import random
import os
import re
from pathlib import Path
from PIL import Image

# Config
COMFY_URL = "http://127.0.0.1:8188"
WORKFLOW_PATH = Path("c:/Users/ASUS/VVI/prompt_gen/workflows/illustrious_xl_pixelart_t2i.json")
PROMPTS_FILE = Path("c:/Users/ASUS/VVI/rpg+/images/enemies/_prompts.txt")
OUTPUT_DIR = Path("c:/Users/ASUS/VVI/rpg+/images/enemies")

NEGATIVE = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, realistic, 3d, gradient shading, soft shading"

def parse_prompts():
    content = PROMPTS_FILE.read_text(encoding="utf-8")
    # Matches [NAME] or [DONE][NAME] or [NAME][SEED]
    pattern = re.compile(r"^\[(?:DONE)?\]?\[?([^\]\n]+)\](?:\[.*?\])?\n(.*?)$", re.MULTILINE)
    
    enemies = []
    for match in pattern.finditer(content):
        name = match.group(1).strip()
        prompt = match.group(2).strip()
        
        # Skip already done ones if they have [DONE] at the very start of the line
        # The regex above handles [DONE][NAME], but let's be safe
        line_start = content.rfind('\n', 0, match.start()) + 1
        if content[line_start:line_start+6] == "[DONE]":
            continue
            
        # Standardize ID
        enemy_id = name.lower().replace(" ", "_").replace("(", "").replace(")", "").replace("'", "")
        enemies.append({"id": enemy_id, "name": name, "prompt": prompt})
    
    return enemies

def queue_enemy(enemy, wf_template):
    wf = json.loads(json.dumps(wf_template)) # deep copy
    seed = random.randint(1, 1000000000)
    
    wf.pop("_workflow_notes", None)
    wf["6"]["inputs"]["text"] = enemy["prompt"]
    wf["7"]["inputs"]["text"] = NEGATIVE
    wf["3"]["inputs"]["seed"] = seed
    wf["3"]["inputs"]["cfg"] = 5.0
    wf["3"]["inputs"]["sampler_name"] = "euler_ancestral"
    
    prefix = f"batch_{enemy['id']}_{seed}"
    wf["12"]["inputs"]["filename_prefix"] = f"{prefix}_01_RAW"
    wf["21"]["inputs"]["filename_prefix"] = f"{prefix}_02_NOBG"
    
    # Strip downscaling nodes to save time and ensure 1024x1024 output
    for nid in ["22", "23", "24", "25"]:
        wf.pop(nid, None)
    
    payload = {"prompt": wf}
    r = requests.post(f"{COMFY_URL}/prompt", json=payload)
    r.raise_for_status()
    return r.json()["prompt_id"], enemy['id']

def process_output(prompt_id, enemy_id):
    print(f"Polling {enemy_id} ({prompt_id})...", flush=True)
    while True:
        r = requests.get(f"{COMFY_URL}/history/{prompt_id}")
        history = r.json()
        if prompt_id in history:
            break
        time.sleep(5)
    
    outputs = history[prompt_id]["outputs"]
    # Node 21 is the 1024x1024 NOBG output
    if "21" not in outputs:
        print(f"Error: Node 21 output missing for {enemy_id}")
        return
        
    img_data = outputs["21"]["images"][0]
    filename = img_data["filename"]
    subfolder = img_data["subfolder"]
    
    view_url = f"{COMFY_URL}/view?filename={filename}&subfolder={subfolder}&type=output"
    img_resp = requests.get(view_url)
    
    png_path = OUTPUT_DIR / f"{enemy_id}.png"
    png_path.write_bytes(img_resp.content)
    
    with Image.open(png_path) as img:
        webp_path = png_path.with_suffix(".webp")
        # Save at 1024x1024 (lossless WebP)
        img.save(webp_path, "WEBP", lossless=True)
    
    os.remove(png_path)
    print(f"Success: {enemy_id}.webp created at 1024x1024.")

def main():
    enemies = parse_prompts()
    # Filter for the specific 7 enemies requested
    targets = [
        "void-touched_valkyrie", "mire_horror", "sky_reaver", 
        "starknight_sentinel", "void_reaver", "reality_fracture", "abyssal_eye"
    ]
    enemies = [e for e in enemies if e["id"] in targets]
    
    if not enemies:
        print("No pending enemies found in target list.")
        return

    with open(WORKFLOW_PATH, "r", encoding="utf-8") as f:
        wf_template = json.load(f)

    active_jobs = []
    for e in enemies:
        try:
            pid, eid = queue_enemy(e, wf_template)
            print(f"Queued {eid} -> {pid}", flush=True)
            active_jobs.append((pid, eid))
        except Exception as ex:
            print(f"Failed to queue {e['id']}: {ex}", flush=True)

    print(f"\nAll {len(active_jobs)} jobs queued. Processing...", flush=True)
    
    for pid, eid in active_jobs:
        process_output(pid, eid)

if __name__ == "__main__":
    main()
