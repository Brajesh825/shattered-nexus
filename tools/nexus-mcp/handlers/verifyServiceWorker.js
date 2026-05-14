import fs from "fs/promises";
import path from "path";

export async function handleVerifyServiceWorker(rootDir) {
  const swPath = path.join(rootDir, "sw.js");

  async function fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  try {
    if (!(await fileExists(swPath))) {
      return {
        content: [{ type: "text", text: JSON.stringify({ status: "FAILED", error: "Target service worker contract sw.js missing from deployment root." }, null, 2) }],
      };
    }

    const swContent = await fs.readFile(swPath, "utf-8");

    function extractArray(content, arrayName) {
      const regex = new RegExp(`const\\s+${arrayName}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
      const match = content.match(regex);
      if (!match) return [];
      const assetsRaw = match[1];
      const items = assetsRaw.match(/['"](.*?)['"]/g) || [];
      return items.map((s) => s.replace(/['"]/g, ""));
    }

    const shell = extractArray(swContent, "SHELL_ASSETS");
    const normal = extractArray(swContent, "SPRITES_NORMAL");
    const low = extractArray(swContent, "SPRITES_LOW");
    const allAssets = [...shell, ...normal, ...low];

    let missingFiles = [];
    let validatedCount = 0;

    for (const assetString of allAssets) {
      const cleanRelPath = assetString.replace("./", "").split("?")[0];
      if (cleanRelPath === "/" || cleanRelPath === "") continue;

      const absoluteTarget = path.join(rootDir, cleanRelPath);
      if (!(await fileExists(absoluteTarget))) {
        missingFiles.push(cleanRelPath);
      } else {
        validatedCount++;
      }
    }

    const passed = missingFiles.length === 0;
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: passed ? "VERIFIED" : "UNSYNCHRONIZED",
            totalAssetsParsed: allAssets.length,
            validatedOnDisk: validatedCount,
            missingCachePaths: missingFiles,
            manifestSegments: {
              shellCount: shell.length,
              normalSpritesCount: normal.length,
              lowSpritesCount: low.length
            }
          }, null, 2),
        },
      ],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: JSON.stringify({ status: "ERROR", error: err.message }, null, 2) }],
    };
  }
}
