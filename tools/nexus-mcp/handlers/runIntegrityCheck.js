import fs from "fs/promises";
import path from "path";

export async function handleRunIntegrityCheck(rootDir) {
  const dataDir = path.join(rootDir, "data");
  const imagesDir = path.join(rootDir, "images");

  let errors = [];
  let warnings = [];
  let verifiedCounts = { characters: 0, enemies: 0, items: 0, storyChapters: 0 };

  async function fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  try {
    // 1. Audit Characters
    const charsPath = path.join(dataDir, "characters.json");
    if (await fileExists(charsPath)) {
      const chars = JSON.parse(await fs.readFile(charsPath, "utf-8"));
      verifiedCounts.characters = chars.length;
      for (const c of chars) {
        const spiritPath = path.join(imagesDir, "characters", "spirits", `${c.id}_sprite.png`);
        const sheetPath = path.join(imagesDir, "characters", "map", "sheets", `${c.id}_sheet.png`);
        if (!(await fileExists(spiritPath))) {
          errors.push(`Character [${c.id}] missing primary combat spirit asset: images/characters/spirits/${c.id}_sprite.png`);
        }
        if (!(await fileExists(sheetPath))) {
          errors.push(`Character [${c.id}] missing exploration map sheet asset: images/characters/map/sheets/${c.id}_sheet.png`);
        }
      }
    }

    // 2. Audit Enemies
    const enemiesPath = path.join(dataDir, "enemies.json");
    if (await fileExists(enemiesPath)) {
      const enemies = JSON.parse(await fs.readFile(enemiesPath, "utf-8"));
      verifiedCounts.enemies = enemies.length;
      for (const e of enemies) {
        const webpSprite = path.join(imagesDir, "enemies", `${e.id}.webp`);
        if (!(await fileExists(webpSprite))) {
          errors.push(`Enemy [${e.id}] missing standard WebP delivery asset: images/enemies/${e.id}.webp`);
        }
        if (e.portrait) {
          const p = path.join(imagesDir, e.portrait);
          if (!(await fileExists(p))) {
            errors.push(`Enemy [${e.id}] missing legacy metadata portrait: images/${e.portrait}`);
          }
        }
      }
    }

    // 3. Audit Items
    const itemsPath = path.join(dataDir, "items.json");
    if (await fileExists(itemsPath)) {
      const items = JSON.parse(await fs.readFile(itemsPath, "utf-8"));
      verifiedCounts.items = items.length;
      for (const it of items) {
        if (it.icon && it.icon.startsWith("img:")) {
          const relImg = it.icon.replace("img:", "");
          const fullImg = path.join(rootDir, relImg);
          if (!(await fileExists(fullImg))) {
            errors.push(`Item [${it.id}] missing icon asset: ${relImg}`);
          }
        }
      }
    }

    // 4. Audit Arcs/Story Maps
    const arcs = ["arc_1.json", "arc_2.json"];
    for (const arcFile of arcs) {
      const arcPath = path.join(dataDir, arcFile);
      if (await fileExists(arcPath)) {
        const arc = JSON.parse(await fs.readFile(arcPath, "utf-8"));
        for (const ch of arc.chapters || []) {
          verifiedCounts.storyChapters++;
          if (ch.type === "explore" && ch.mapId) {
            const mapJson = path.join(rootDir, "js", "map", "data", `map-${ch.mapId}.json`);
            const mapJs = path.join(rootDir, "js", "map", "data", `map-${ch.mapId}.js`);
            if (!(await fileExists(mapJson)) && !(await fileExists(mapJs))) {
              errors.push(`Arc [${arcFile}] Chapter [${ch.id}] missing assigned map script: js/map/data/map-${ch.mapId}`);
            }
          }
        }
      }
    }

    const passed = errors.length === 0;
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: passed ? "PASSED" : "FAILED",
            totalErrorsDetected: errors.length,
            metrics: verifiedCounts,
            errors: errors,
            executionRuleSet: "Aethon Rule 6 — Pre-Release Integrity Gating"
          }, null, 2),
        },
      ],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: JSON.stringify({ status: "CRITICAL_ERROR", error: err.message }, null, 2) }],
    };
  }
}
