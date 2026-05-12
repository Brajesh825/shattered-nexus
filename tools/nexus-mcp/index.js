import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Import Modular Tool Handlers
import { handleAuditMap } from "./handlers/auditMap.js";
import { handleStageConcept } from "./handlers/stageConcept.js";
import { handleBumpCache } from "./handlers/bumpCache.js";
import { handleSimulateCombat } from "./handlers/simulateCombat.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../");

// Initialize MCP Server instance
const server = new Server(
  {
    name: "nexus-engine-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ─── 1. REGISTER RESOURCES ──────────────────────────────────────────────────
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "nexus://state/schema",
        name: "Engine Architecture & Protocol Standards",
        mimeType: "text/markdown",
        description: "Core structural guidelines and constraints for Shattered Nexus game engine files.",
      },
      {
        uri: "nexus://state/entity-relations",
        name: "Global Dialogues Validation Keys",
        mimeType: "application/json",
        description: "List of loaded top-level NPC dialogue mapping keys present in data/npcs.js.",
      }
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  if (uri === "nexus://state/schema") {
    const rules = [
      "1. Manhattan distance from playerStart to return teleport triggers MUST be >= 5 tiles.",
      "2. Interactive NPC entities MUST NOT be within 1-tile adjacent radius of playerStart.",
      "3. All new game features, scripts, or narrative additions MUST originate from the _concepts/ directory.",
      "4. Any logic updates to core files MUST trigger a minor version increment to CACHE_NAME in sw.js."
    ].join("\n");
    return {
      contents: [{ uri, mimeType: "text/markdown", text: rules }],
    };
  }
  
  if (uri === "nexus://state/entity-relations") {
    try {
      const npcsPath = path.join(ROOT_DIR, "data/npcs.js");
      const content = await fs.readFile(npcsPath, "utf-8");
      const keys = [];
      const matches = content.matchAll(/^\s*([a-zA-Z0-9_]+):\s*\{/gm);
      for (const m of matches) {
        keys.push(m[1]);
      }
      return {
        contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ keys }, null, 2) }],
      };
    } catch (err) {
      throw new Error(`Failed to read entity relations: ${err.message}`);
    }
  }

  throw new Error(`Resource not found: ${uri}`);
});

// ─── 2. REGISTER TOOLS ──────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "nexus_audit_map",
        description: "Audits a designated map definition file for spawn isolation distance, anti-adjacency buffers, and database key integrity.",
        inputSchema: {
          type: "object",
          properties: {
            mapFileName: {
              type: "string",
              description: "Name of the map JS file inside js/map/data/ (e.g., 'map-riverlands-crossing.js' or 'map-southern-isles.js').",
            },
          },
          required: ["mapFileName"],
        },
      },
      {
        name: "nexus_stage_concept",
        description: "Enforces the mandatory Pipeline Rule by staging raw design plans into structured markdown templates inside the _concepts/ domain.",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["story", "mechanics", "characters"],
              description: "Target subdirectory inside _concepts/.",
            },
            filename: {
              type: "string",
              description: "Target markdown file name (e.g., 'combat_expansion.md').",
            },
            content: {
              type: "string",
              description: "Full markdown structure detailing the proposed implementation plan.",
            },
          },
          required: ["category", "filename", "content"],
        },
      },
      {
        name: "nexus_bump_cache",
        description: "Safely mutates sw.js to bump the active CACHE_NAME minor version string, automatically invalidating stale web application client cache states.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "nexus_simulate_combat",
        description: "Sandboxes live game engine logic buffers dynamically to simulate zero-drift Time-to-Kill (TTK) metrics and kinetic physical interception formulas.",
        inputSchema: {
          type: "object",
          properties: {
            characterId: { type: "string", description: "Optional Character ID from data/characters.json (e.g. 'tao' or 'aya')." },
            heroClassId: { type: "string", description: "Optional Class ID from data/classes.json. Defaults to character's primary affinity if omitted." },
            heroLevel: { type: "integer", description: "Target testing level." },
            enemyId: { type: "string", description: "Target Enemy ID from data/enemies.json." },
            formationSlot: { type: "integer", description: "Slot position index inside the Diamond Formation (e.g. 2 for Vanguard)." }
          },
          required: ["heroLevel", "enemyId", "formationSlot"]
        }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "nexus_audit_map") {
    return await handleAuditMap(args, ROOT_DIR);
  }

  if (name === "nexus_stage_concept") {
    return await handleStageConcept(args, ROOT_DIR);
  }

  if (name === "nexus_bump_cache") {
    return await handleBumpCache(ROOT_DIR);
  }

  if (name === "nexus_simulate_combat") {
    return await handleSimulateCombat(args, ROOT_DIR);
  }

  throw new Error(`Unknown tool requested: ${name}`);
});

// ─── 3. TRANSPORT LISTENER INITIALIZATION ───────────────────────────────────
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Shattered Nexus MCP Server successfully connected via STDIO Transport streams.");
}

run().catch((err) => {
  console.error("Fatal Nexus MCP initialisation error:", err);
  process.exit(1);
});
