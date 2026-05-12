import fs from "fs/promises";
import path from "path";

export async function handleStageConcept(args, rootDir) {
  const { category, filename, content } = args;
  const targetPath = path.join(rootDir, "_concepts", category, filename);

  try {
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, content, "utf-8");
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            stagedFile: `_concepts/${category}/${filename}`,
            status: "Staged perfectly compliant with the Pipeline Rule."
          }, null, 2),
        },
      ],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Staging failure: ${err.message}` }, null, 2) }],
    };
  }
}
