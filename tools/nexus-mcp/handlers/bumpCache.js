import fs from "fs/promises";
import path from "path";

export async function handleBumpCache(rootDir) {
  const swPath = path.join(rootDir, "sw.js");

  try {
    let swContent = await fs.readFile(swPath, "utf-8");
    const versionMatch = swContent.match(/const CACHE_NAME = ['"]nexus-cache-v(\d+)\.(\d+)['"];/);

    if (!versionMatch) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "Could not isolate standard CACHE_NAME version signature string in sw.js." }, null, 2) }],
      };
    }

    const major = parseInt(versionMatch[1], 10);
    const minor = parseInt(versionMatch[2], 10);
    const newMinor = minor + 1;
    const newVersionString = `nexus-cache-v${major}.${newMinor}`;

    swContent = swContent.replace(versionMatch[0], `const CACHE_NAME = '${newVersionString}';`);
    await fs.writeFile(swPath, swContent, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            previousVersion: `v${major}.${minor}`,
            updatedVersion: `v${major}.${newMinor}`,
            filePatched: "sw.js"
          }, null, 2),
        },
      ],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Cache bump failure: ${err.message}` }, null, 2) }],
    };
  }
}
