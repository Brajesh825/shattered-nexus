import fs from "fs/promises";
import path from "path";

export async function handleAuditAssets(args, rootDir) {
  const { autoFix, minSizeBytes } = args;
  const targetDir = path.join(rootDir, "images/enemies");
  const dbPath = path.join(rootDir, "data/enemies.json");
  
  const results = {
    totalScanned: 0,
    badResolutions: [],
    lowQualityWeights: [],
    unoptimizedFormats: [],
    orphanedAssets: [],
    cleanedUpFiles: []
  };

  const sizeThreshold = minSizeBytes || 50000; // default 50KB

  try {
    // 1. Map registered live enemies from database source of truth
    let registeredIds = new Set();
    try {
      const dbContent = await fs.readFile(dbPath, "utf-8");
      const enemies = JSON.parse(dbContent);
      enemies.forEach(e => {
        if (e.id) registeredIds.add(e.id);
      });
    } catch (dbErr) {
      // Continue gracefully if json syntax is broken
    }

    // 2. Read directory content list
    const files = await fs.readdir(targetDir, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || file.name.startsWith("_") || file.name.startsWith(".")) {
        continue;
      }

      results.totalScanned++;
      const ext = path.extname(file.name).toLowerCase();
      const baseId = path.basename(file.name, ext);
      const filePath = path.join(targetDir, file.name);

      // Track unoptimized raw PNG assets
      if (ext === ".png") {
        results.unoptimizedFormats.push({
          file: file.name,
          issue: "Unoptimized raw format. Lacks PWA lossless WebP encoding."
        });

        // If autoFix enabled, unlink lingering unoptimized PNGs assuming corresponding WebP exists
        if (autoFix) {
          const matchingWebp = path.join(targetDir, `${baseId}.webp`);
          try {
            await fs.access(matchingWebp);
            await fs.unlink(filePath);
            results.cleanedUpFiles.push(file.name);
            continue; // file cleaned up successfully
          } catch (err) {
            // WebP copy missing, retain PNG as fallback
          }
        }
      }

      // Track orphans not actively leveraged inside live runtime databases
      if (!registeredIds.has(baseId) && ext === ".webp") {
        results.orphanedAssets.push({
          id: baseId,
          file: file.name,
          status: "Orphaned. Asset file exists but lacks mapping inside data/enemies.json."
        });
      }

      // 3. Inspect raw image dimensions and weight layers dynamically
      try {
        const stats = await fs.stat(filePath);
        const sizeBytes = stats.size;

        // Detect low quality creations (e.g. solid blanks, severe compression artifacts)
        if (sizeBytes < sizeThreshold) {
          results.lowQualityWeights.push({
            file: file.name,
            sizeBytes,
            thresholdBytes: sizeThreshold,
            severity: sizeBytes < 15000 ? "CRITICAL" : "WARNING",
            analysis: sizeBytes < 15000 
              ? "Extremely compressed or empty alpha layer payload. High probability of failed generation."
              : "Abnormally light binary payload for high-fidelity 1024x1024 Illustrious XL pixel art sprites."
          });
        }

        // Decode native resolution headers
        const buffer = await fs.readFile(filePath);
        let width = 0;
        let height = 0;

        if (ext === ".webp" && buffer.toString("utf-8", 0, 4) === "RIFF" && buffer.toString("utf-8", 8, 12) === "WEBP") {
          let offset = 12;
          while (offset < buffer.length) {
            const chunkId = buffer.toString("utf-8", offset, offset + 4);
            const chunkSize = buffer.readUInt32LE(offset + 4);
            const dataOffset = offset + 8;

            if (chunkId === "VP8X") {
              width = 1 + (buffer[dataOffset + 4] | (buffer[dataOffset + 5] << 8) | (buffer[dataOffset + 6] << 16));
              height = 1 + (buffer[dataOffset + 7] | (buffer[dataOffset + 8] << 8) | (buffer[dataOffset + 9] << 16));
              break;
            } else if (chunkId === "VP8 ") {
              if (buffer[dataOffset + 3] === 0x9d && buffer[dataOffset + 4] === 0x01 && buffer[dataOffset + 5] === 0x2a) {
                width = buffer.readUInt16LE(dataOffset + 6) & 0x3fff;
                height = buffer.readUInt16LE(dataOffset + 8) & 0x3fff;
              }
              break;
            } else if (chunkId === "VP8L") {
              if (buffer[dataOffset] === 0x2f) {
                const b1 = buffer[dataOffset + 1];
                const b2 = buffer[dataOffset + 2];
                const b3 = buffer[dataOffset + 3];
                const b4 = buffer[dataOffset + 4];
                width = 1 + ((b1 | ((b2 & 0x3f) << 8)) & 0x3fff);
                height = 1 + ((((b2 >> 6) & 0x03) | (b3 << 2) | ((b4 & 0x0f) << 10)) & 0x3fff);
              }
              break;
            }
            offset = dataOffset + chunkSize + (chunkSize & 1);
          }
        } else if (ext === ".png" && buffer.toString("hex", 0, 8) === "89504e470d0a1a0a") {
          if (buffer.toString("utf-8", 12, 16) === "IHDR") {
            width = buffer.readUInt32BE(16);
            height = buffer.readUInt32BE(20);
          }
        }

        // Apply Vivid's strict 1024x1024 square constraint
        if (width > 0 && height > 0) {
          if (width !== 1024 || height !== 1024) {
            results.badResolutions.push({
              file: file.name,
              detectedResolution: `${width}x${height}`,
              requiredResolution: "1024x1024",
              violation: "Fails the Void Knight Standard square dimension guarantee. Assets must not be cropped or downscaled."
            });
          }
        }

      } catch (fileErr) {
        // Skip unreadable files
      }
    }

    const totalIssues = results.badResolutions.length + results.lowQualityWeights.length + results.unoptimizedFormats.length;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: totalIssues === 0 ? "PRISTINE" : "ATTENTION_REQUIRED",
            auditSummary: {
              totalFilesScanned: results.totalScanned,
              resolutionFailuresDetected: results.badResolutions.length,
              lowFidelityWeightsDetected: results.lowQualityWeights.length,
              unoptimizedLegacyFormats: results.unoptimizedFormats.length,
              orphanedDatabaseMappings: results.orphanedAssets.length,
              autoFixCleanupsPerformed: results.cleanedUpFiles.length
            },
            resolutionViolations: results.badResolutions.length > 0 ? results.badResolutions : undefined,
            lowQualityBinaries: results.lowQualityWeights.length > 0 ? results.lowQualityWeights : undefined,
            unoptimizedFormats: results.unoptimizedFormats.length > 0 ? results.unoptimizedFormats : undefined,
            orphanedAssets: results.orphanedAssets.length > 0 ? results.orphanedAssets : undefined,
            cleanedUpFiles: results.cleanedUpFiles.length > 0 ? results.cleanedUpFiles : undefined
          }, null, 2)
        }
      ]
    };

  } catch (globalErr) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Asset auditing workflow failure: ${globalErr.message}` }, null, 2) }]
    };
  }
}
