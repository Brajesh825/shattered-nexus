import fs from "fs/promises";
import path from "path";

// Helper to extract tokens/trigrams as flat dictionary object + precalculated L2 Norm
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

  let normSq = 0;
  for (const val of Object.values(tokens)) {
    normSq += val * val;
  }

  return { tokens, norm: Math.sqrt(normSq) };
}

// Scorer for offline static precomputed vectors
function computeCachedSimilarity(queryObj, docVector, docNorm) {
  let dotProduct = 0;
  for (const [t, weight] of Object.entries(queryObj.tokens)) {
    if (docVector[t] !== undefined) {
      dotProduct += weight * docVector[t];
    }
  }
  if (queryObj.norm === 0 || docNorm === 0) return 0;
  return dotProduct / (queryObj.norm * docNorm);
}

export async function handleSemanticSearch(args, rootDir) {
  const { collection, query } = args;

  try {
    const queryObj = getTokensAsObject(query);
    const scored = [];
    let usedCache = false;
    let collectionLength = 0;

    // 1. Attempt O(1) retrieval from static offline index cache if generated
    try {
      const cachePath = path.join(rootDir, "data/rag_index_cache.json");
      const cacheContent = await fs.readFile(cachePath, "utf-8");
      const cacheIndex = JSON.parse(cacheContent);

      if (cacheIndex && cacheIndex[collection]) {
        usedCache = true;
        const cachedDocs = cacheIndex[collection];
        collectionLength = cachedDocs.length;

        for (const doc of cachedDocs) {
          const score = computeCachedSimilarity(queryObj, doc.vector || {}, doc.norm || 1);
          if (score > 0.01) {
            scored.push({ item: doc.original, score });
          }
        }
      }
    } catch (e) {
      // Cache file absent/unreadable — gracefully drop into fallback generator execution
      usedCache = false;
    }

    // 2. Dynamic Fallback generation if offline index cache is unavailable
    let fileName = "";
    if (!usedCache) {
      if (collection === "lore") fileName = "lore_fragments.json";
      else if (collection === "classes") fileName = "classes.json";
      else if (collection === "characters") fileName = "characters.json";
      else if (collection === "quests") fileName = "quests.json";
      else if (collection === "npcs") fileName = "npcs.js";
      else throw new Error(`Unknown semantic collection namespace requested: ${collection}`);

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
      collectionLength = items.length;

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

        const docObj = getTokensAsObject(searchableText);
        const score = computeCachedSimilarity(queryObj, docObj.tokens, docObj.norm);
        if (score > 0.01) {
          scored.push({ item, score });
        }
      }
    }

    // Sort descending by calculated dot product weights
    scored.sort((a, b) => b.score - a.score);
    const topMatches = scored.slice(0, 10).map(({ item, score }) => {
      const projection = { _similarityScore: score.toFixed(4), id: item.id };
      if (collection === "lore") {
        projection.title = item.title;
        projection.category = item.category;
        projection.region = item.region;
        projection.descriptionSnippet = item.description ? `${item.description.substring(0, 280)}...` : "";
      } else if (collection === "classes") {
        projection.name = item.name;
        projection.role = item.role;
        projection.statMultipliers = item.stat_multipliers || {};
        projection.abilitiesList = (item.abilities || []).map((a) => a.id || a.name);
      } else if (collection === "characters") {
        projection.name = item.name;
        projection.title = item.title || "";
        projection.classAffinity = item.class_affinity || [];
        projection.baseStats = item.base_stats || {};
      } else if (collection === "quests") {
        projection.title = item.title;
        projection.giver = item.giver || "None";
        projection.map = item.map || "Global";
        projection.objectives = item.objectives || [];
      } else if (collection === "npcs") {
        projection.name = item.name;
        projection.dialogueSnippet = item.description ? `${item.description.substring(0, 280)}...` : "";
      }
      return projection;
    });

    const report = {
      ragMetadata: {
        collectionQueried: collection,
        executionMode: usedCache ? "STATIC_OFFLINE_CACHE" : "DYNAMIC_ON_THE_FLY",
        queryVector: query,
        totalDocumentsParsed: collectionLength,
        relevantDocumentsRetrieved: scored.length,
        status: "OPTIMAL"
      },
      retrievalContext: topMatches
    };

    return {
      content: [{ type: "text", text: JSON.stringify(report, null, 2) }]
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `RAG Vector Search failed: ${err.message}` }, null, 2) }]
    };
  }
}
