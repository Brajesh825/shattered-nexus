import { handleSyncRag } from "./nexus-mcp/handlers/ragIndexer.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../");

async function run() {
  console.log("ℹ️ Triggering standalone RAG sync pipeline...");
  const res = await handleSyncRag({}, rootDir);
  const text = res.content[0].text;
  try {
    const data = JSON.parse(text);
    if (data.status === "SUCCESS") {
      console.log(`✅ ${data.message}`);
      process.exit(0);
    } else {
      console.error(`❌ ${text}`);
      process.exit(1);
    }
  } catch (e) {
    console.log(text);
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("❌ Fatal Error during RAG Synchronization:", err);
  process.exit(1);
});
