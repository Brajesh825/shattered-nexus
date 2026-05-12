import fs from "fs/promises";
import path from "path";

function getManhattanDistance(p1, p2) {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

export async function handleAuditMap(args, rootDir) {
  const { mapFileName } = args;
  const mapFilePath = path.join(rootDir, "js/map/data", mapFileName);

  try {
    const fileContent = await fs.readFile(mapFilePath, "utf-8");
    
    // Parse playerStart via RegEx/string scanning safely
    const startMatch = fileContent.match(/playerStart:\s*\{\s*x:\s*(\d+),\s*y:\s*(\d+)\s*\}/);
    if (!startMatch) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "Could not locate standard playerStart coordinates object in map file." }, null, 2) }],
      };
    }
    const playerStart = { x: parseInt(startMatch[1], 10), y: parseInt(startMatch[2], 10) };

    // Parse Teleport Triggers safely inside the triggers array
    const teleports = [];
    const triggersBlockMatch = fileContent.match(/triggers:\s*\[([\s\S]*?)\]/);
    if (triggersBlockMatch) {
      const triggerObjects = triggersBlockMatch[1].split(/\}\s*,\s*\{/);
      for (const to of triggerObjects) {
        if (/type:\s*['"]teleport['"]/.test(to)) {
          const idMatch = /id:\s*['"]([^'"]+)['"]/.exec(to);
          const xMatch = /x:\s*(\d+)/.exec(to);
          const yMatch = /y:\s*(\d+)/.exec(to);
          if (idMatch && xMatch && yMatch) {
            teleports.push({
              id: idMatch[1],
              x: parseInt(xMatch[1], 10),
              y: parseInt(yMatch[1], 10)
            });
          }
        }
      }
    }

    // Parse NPCs safely
    const npcs = [];
    const npcBlockMatch = fileContent.match(/npcs:\s*\[([\s\S]*?)\]/);
    if (npcBlockMatch) {
      const npcLineMatches = npcBlockMatch[1].matchAll(/\{\s*id:\s*['"]([^'"]+)['"][\s\S]*?x:\s*(\d+)[\s\S]*?y:\s*(\d+)/g);
      for (const nm of npcLineMatches) {
        npcs.push({
          id: nm[1],
          x: parseInt(nm[2], 10),
          y: parseInt(nm[3], 10),
        });
      }
    }

    // Run Verification Checks
    const auditReport = {
      mapFile: mapFileName,
      playerStart,
      checks: {
        teleportSpacingValid: true,
        spawnAdjacencySafe: true,
        details: []
      }
    };

    // Check 1: Teleport Spacing (Atlas Rule >= 5 tiles)
    for (const t of teleports) {
      const dist = getManhattanDistance(playerStart, t);
      if (dist < 5) {
        auditReport.checks.teleportSpacingValid = false;
        auditReport.checks.details.push(`VIOLATION: Return teleport '${t.id}' at (${t.x}, ${t.y}) is only ${dist} tiles from spawn. Must be >= 5 tiles.`);
      } else {
        auditReport.checks.details.push(`PASS: Return teleport '${t.id}' maintains a clean distance of ${dist} tiles from spawn.`);
      }
    }

    // Check 2: NPC Adjacency Buffer (Atlas Rule > 1 tile)
    for (const n of npcs) {
      const dist = getManhattanDistance(playerStart, n);
      if (dist <= 1) {
        auditReport.checks.spawnAdjacencySafe = false;
        auditReport.checks.details.push(`VIOLATION: NPC '${n.id}' at (${n.x}, ${n.y}) is directly adjacent to playerStart (distance ${dist}). Triggers automatic looping.`);
      } else {
        auditReport.checks.details.push(`PASS: NPC '${n.id}' is safely isolated from spawn vector (distance ${dist}).`);
      }
    }

    return {
      content: [{ type: "text", text: JSON.stringify(auditReport, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Audit execution failed: ${err.message}` }, null, 2) }],
    };
  }
}
