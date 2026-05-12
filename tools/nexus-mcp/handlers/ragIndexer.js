import fs from "fs/promises";
import path from "path";

// Extract n-grams (trigrams) and clean tokens to compute robust static Cosine Similarity vectors
function getTokensAsObject(text) {
  const clean = (text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const tokens = {};
  
  const words = clean.split(/\s+/);
  for (const w of words) {
    if (w.length > 0) {
      tokens[w] = (tokens[w] || 0) + 1;
    }
  }

  const padded = `_${clean.replace(/\s+/g, "_")}_`;
  for (let i = 0; i <= padded.length - 3; i++) {
    const tg = padded.substring(i, i + 3);
    tokens[tg] = (tokens[tg] || 0) + 0.4;
  }

  // Pre-calculate vector norm for extreme runtime retrieval efficiency
  let normSq = 0;
  for (const val of Object.values(tokens)) {
    normSq += val * val;
  }

  return { tokens, norm: Math.sqrt(normSq) };
}

export async function handleSyncRag(args, rootDir) {
  try {
    const collections = ["lore", "classes", "characters", "quests", "npcs"];
    const vectorIndex = {};

    for (const collection of collections) {
      let fileName = "";
      if (collection === "lore") fileName = "lore_fragments.json";
      else if (collection === "classes") fileName = "classes.json";
      else if (collection === "characters") fileName = "characters.json";
      else if (collection === "quests") fileName = "quests.json";
      else if (collection === "npcs") fileName = "npcs.js";

      const targetPath = path.join(rootDir, `data/${fileName}`);
      const fileContent = await fs.readFile(targetPath, "utf-8");
      
      let items = [];
      if (collection === "npcs") {
        const blockParts = fileContent.split(/\n  ([a-z0-9_]+):\s*\{/);
        for (let i = 1; i < blockParts.length; i += 2) {
          const id = blockParts[i];
          const content = blockParts[i + 1] || "";
          const nameMatch = /name:\s*['"]([^'"]+)['"]/.exec(content);
          const name = nameMatch ? nameMatch[1] : id;
          const textMatches = content.match(/text:\s*['"]([^'"]+)['"]/g) || [];
          const textContent = textMatches.map(t => t.replace(/text:\s*['"]|['"]$/g, "")).join(" ");
          items.push({
            id,
            name,
            description: textContent
          });
        }
      } else {
        items = JSON.parse(fileContent);
      }

      const indexedItems = [];
      for (const item of items) {
        let searchableText = "";
        if (collection === "lore") {
          searchableText = `${item.id || ""} ${item.title || ""} ${item.category || ""} ${item.region || ""} ${item.description || ""}`;
        } else if (collection === "classes") {
          searchableText = `${item.id || ""} ${item.name || ""} ${item.role || ""} ${item.element || ""} ${JSON.stringify(item.abilities || [])} ${JSON.stringify(item.stat_multipliers || {})}`;
        } else if (collection === "characters") {
          searchableText = `${item.id || ""} ${item.name || ""} ${item.title || ""} ${JSON.stringify(item.class_affinity || [])} ${JSON.stringify(item.stat_bonuses || {})}`;
        } else if (collection === "quests") {
          searchableText = `${item.id || ""} ${item.title || ""} ${item.description || ""} ${item.giver || ""} ${item.map || ""} ${JSON.stringify(item.objectives || [])}`;
        } else if (collection === "npcs") {
          searchableText = `${item.id || ""} ${item.name || ""} ${item.description || ""}`;
        }

        const vectorData = getTokensAsObject(searchableText);
        indexedItems.push({
          id: item.id,
          vector: vectorData.tokens,
          norm: vectorData.norm,
          original: item
        });
      }

      vectorIndex[collection] = indexedItems;
    }

    const cachePath = path.join(rootDir, "data/rag_index_cache.json");
    await fs.writeFile(cachePath, JSON.stringify(vectorIndex, null, 2), "utf-8");

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "SUCCESS",
          message: "Static vector embeddings cache generated successfully at data/rag_index_cache.json.",
          indexedNamespaces: collections,
          performanceMetrics: "O(1) execution ready"
        }, null, 2)
      }]
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `RAG Index generation failed: ${err.message}` }, null, 2) }]
    };
  }
}
