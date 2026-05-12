import fs from "fs/promises";
import path from "path";

export async function handleSearchEntities(args, rootDir) {
  const { database, query } = args;

  try {
    const dbPath = path.join(rootDir, `data/${database}.json`);
    const fileContent = await fs.readFile(dbPath, "utf-8");
    const records = JSON.parse(fileContent);

    const safeQuery = (query || "").trim().toLowerCase();
    
    // Filter records matching ID, name, or subtitle variants
    const matches = records.filter((r) => {
      const idMatch = (r.id || "").toLowerCase().includes(safeQuery);
      const nameMatch = (r.name || "").toLowerCase().includes(safeQuery);
      const subMatch = (r.subtitle || "").toLowerCase().includes(safeQuery);
      return idMatch || nameMatch || subMatch;
    });

    // Structure beautiful summary items mapping essential metadata attributes
    const formattedResults = matches.map((m) => {
      if (database === "enemies") {
        return {
          id: m.id,
          name: m.name,
          subtitle: m.subtitle || "",
          tier: m.tier || 1,
          isBoss: !!m.isBoss,
          element: m.element || "physical",
          baseHp: m.stats?.hp || 0,
          baseAtk: m.stats?.atk || 0,
          baseDef: m.stats?.def || 0,
        };
      }
      if (database === "characters") {
        return {
          id: m.id,
          name: m.name,
          title: m.title || "",
          classAffinity: m.class_affinity || [],
          baseHp: m.base_stats?.hp || 0,
          baseAtk: m.base_stats?.atk || 0,
          baseDef: m.base_stats?.def || 0,
          statBonuses: m.stat_bonuses || {},
        };
      }
      if (database === "classes") {
        return {
          id: m.id,
          name: m.name,
          role: m.role || "",
          element: m.element || "physical",
          statMultipliers: m.stat_multipliers || {},
          abilitiesCount: (m.abilities || []).length,
        };
      }
      return { id: m.id, name: m.name };
    });

    const report = {
      searchMeta: {
        databaseScanned: `${database}.json`,
        querySubmitted: query,
        totalEntriesScanned: records.length,
        totalMatchesRetrieved: matches.length,
      },
      results: formattedResults,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Entity Database Search failed: ${err.message}` }, null, 2) }],
    };
  }
}
