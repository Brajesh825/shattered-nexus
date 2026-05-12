import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";

const COMFY_URL = "http://127.0.0.1:8188";
const NEGATIVE = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, realistic, 3d, gradient shading, soft shading";

// Dependency-free PIL WebP conversion sub-process execution wrapper
async function convertPngToWebp(pngPath, webpPath) {
  return new Promise((resolve, reject) => {
    const pyScript = `
from PIL import Image
import sys
try:
    with Image.open(sys.argv[1]) as img:
        img.save(sys.argv[2], 'WEBP', lossless=True)
    sys.exit(0)
except Exception as e:
    print(e)
    sys.exit(1)
`;
    const child = spawn("python", ["-c", pyScript, pngPath, webpPath]);
    let errOut = "";
    child.stderr.on("data", (d) => errOut += d.toString());
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`PIL WebP conversion failed: ${errOut}`));
    });
  });
}

// Safely polling history packet for prompt node outputs
async function pollComfyHistory(promptId, enemyId) {
  const startTime = Date.now();
  while (Date.now() - startTime < 300000) { // 5-minute safety timeout
    try {
      const resp = await fetch(`${COMFY_URL}/history/${promptId}`);
      if (resp.ok) {
        const history = await resp.json();
        if (history[promptId]) {
          return history[promptId].outputs;
        }
      }
    } catch (e) {
      // Backend busy or queuing frames...
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error(`Polling timeout exceeded for prompt task: ${promptId}`);
}

export async function handleGenerateSprites(args, rootDir) {
  const { targetEnemyIds, cfgScale = 5.0 } = args;
  const reportLog = [];

  try {
    const promptsPath = path.join(rootDir, "images/enemies/_prompts.txt");
    const workflowPath = path.join(rootDir, "../prompt_gen/workflows/illustrious_xl_pixelart_t2i.json");
    const outDir = path.join(rootDir, "images/enemies");

    // 1. Verify and parse authoritative prompts
    let contentBuf = await fs.readFile(promptsPath, "utf-8");
    const pattern = /^\[(?:DONE)?\]?\s*\[?([^\]\n]+)\]\s*(?:\[.*?\])?\r?\n(.*?)$/gm;
    const candidates = [];
    let match;

    while ((match = pattern.exec(contentBuf)) !== null) {
      const lineStart = contentBuf.lastIndexOf("\n", match.index) + 1;
      const checkTag = contentBuf.substring(lineStart, lineStart + 6);
      if (checkTag === "[DONE]") continue;

      const rawName = match[1].trim();
      const promptText = match[2].trim();
      const enemyId = rawName.toLowerCase().replace(/ /g, "_").replace(/[\(\)\']/g, "");

      if (!targetEnemyIds || targetEnemyIds.length === 0 || targetEnemyIds.includes(enemyId)) {
        candidates.push({ id: enemyId, name: rawName, prompt: promptText, lineIndex: lineStart });
      }
    }

    if (candidates.length === 0) {
      return {
        content: [{ type: "text", text: JSON.stringify({ status: "No pending generation records found matching target criteria." }, null, 2) }]
      };
    }

    reportLog.push(`Found ${candidates.length} candidate entity targets. Reading workflow DAG graph...`);

    // 2. Load baseline JSON DAG template
    const wfRaw = await fs.readFile(workflowPath, "utf-8");
    const wfTemplate = JSON.parse(wfRaw);

    // 3. Dispatch REST payloads iteratively
    for (const item of candidates) {
      reportLog.push(`\n[Queueing Entity Generation]: "${item.id}"`);
      try {
        // Deep clone DAG graph instance
        const wf = JSON.parse(JSON.stringify(wfTemplate));
        const seed = Math.floor(Math.random() * 1000000000) + 1;

        delete wf._workflow_notes;
        if (wf["6"]) wf["6"].inputs.text = item.prompt;
        if (wf["7"]) wf["7"].inputs.text = NEGATIVE;
        if (wf["3"]) {
          wf["3"].inputs.seed = seed;
          wf["3"].inputs.cfg = Number(cfgScale) || 5.0;
          wf["3"].inputs.sampler_name = "euler_ancestral";
        }

        const prefix = `batch_${item.id}_${seed}`;
        if (wf["12"]) wf["12"].inputs.filename_prefix = `${prefix}_01_RAW`;
        if (wf["21"]) wf["21"].inputs.filename_prefix = `${prefix}_02_NOBG`;

        // Prune extra scaling nodes to guarantee pristine 1024x1024 output
        ["22", "23", "24", "25"].forEach((nid) => delete wf[nid]);

        // Trigger REST endpoint dispatch
        const postResp = await fetch(`${COMFY_URL}/prompt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: wf }),
        });

        if (!postResp.ok) {
          throw new Error(`ComfyUI dispatch responded with code: ${postResp.status}`);
        }

        const { prompt_id } = await postResp.json();
        reportLog.push(`Successfully allocated DAG prompt slot ID: ${prompt_id}. Polling execution...`);

        // Polling loop
        const outputs = await pollComfyHistory(prompt_id, item.id);
        if (!outputs["21"]) {
          throw new Error("Target extraction Node 21 (02_NOBG) missing from outputs object packet.");
        }

        const imgMeta = outputs["21"].images[0];
        const fetchViewUrl = `${COMFY_URL}/view?filename=${encodeURIComponent(imgMeta.filename)}&subfolder=${encodeURIComponent(imgMeta.subfolder || "")}&type=output`;
        
        const imgBinaryResp = await fetch(fetchViewUrl);
        if (!imgBinaryResp.ok) throw new Error("Failed fetching isolated image view stream from ComfyUI output buffer.");
        
        const pngBinaryBuffer = await imgBinaryResp.arrayBuffer();
        const tempPngPath = path.join(outDir, `${item.id}.png`);
        const finalWebpPath = path.join(outDir, `${item.id}.webp`);

        await fs.writeFile(tempPngPath, Buffer.from(pngBinaryBuffer));
        reportLog.push(`Transcoding raw Alpha PNG buffer natively to Lossless WebP asset...`);

        await convertPngToWebp(tempPngPath, finalWebpPath);
        await fs.unlink(tempPngPath); // Cleanup intermediate alpha layer file

        reportLog.push(`SUCCESS: High-fidelity asset "${item.id}.webp" strictly preserved at 1024x1024 resolution.`);

        // Flag prompt row as completed inside _prompts.txt to prevent looping processing
        contentBuf = contentBuf.replace(new RegExp(`^(\\[?)(${escapeRegex(item.name)}\\])`, "m"), "[DONE]$1$2");
        await fs.writeFile(promptsPath, contentBuf, "utf-8");

      } catch (ex) {
        reportLog.push(`FAILED execution chain for "${item.id}": ${ex.message}`);
      }
    }

    return {
      content: [{ type: "text", text: JSON.stringify({ telemetryLog: reportLog }, null, 2) }]
    };

  } catch (err) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Sprite Generation Exception: ${err.message}`, telemetryLog: reportLog }, null, 2) }]
    };
  }
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
