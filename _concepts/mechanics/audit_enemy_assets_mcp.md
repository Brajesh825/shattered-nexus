# 🎨 Concept: Automated Asset Quality Auditing MCP Tool (`nexus_audit_enemy_assets`)

## 🎯 Primary Objective
Introduce a dedicated binary inspection capability hosted inside the `nexus-engine-mcp` server to systematically detect low-quality, broken, or non-compliant enemy image creations inside the `images/enemies/` delivery folder.

This empowers automated pipeline routines to instantly flag bad generations before they propagate into the client application.

---

## 🖼️ Vivid's Quality Directives & Audit Criteria
1. **The 1024x1024 Resolution Constraint**: Upholding the **Void Knight Standard** mandates that all final generation frames retain their raw `1024x1024` dimensions. Any downscaled (e.g. `512x512`), non-square, or cropped outputs indicate pipeline failures or placeholder assets.
2. **File Size Anomalies**: Excessively low binary sizes (e.g. `< 12KB` for a lossless WebP) typically reveal solid color blocks, broken transparency extraction from ComfyUI Node 21, or compression artifact erosion.
3. **Format Parity**: Verifying every source image has successfully undergone PWA performance optimization via transcoding to `.webp`.
4. **Orphan Registry Mapping**: Cross-referencing active base files against authoritative ID strings loaded inside `data/enemies.json` and `images/enemies/_prompts.txt`.

---

## 🛠️ Proposed MCP Tool Schema

### Tool Signature
`nexus_audit_enemy_assets`

### Input Schema
```json
{
  "type": "object",
  "properties": {
    "autoFix": {
      "type": "boolean",
      "default": false,
      "description": "If true, attempts to clean up orphaned intermediate PNG buffers or missing file links."
    }
  }
}
```

---

## ⚙️ Execution Handler Workflow (`handlers/auditAssets.js`)
1. **Directory Discovery**: Iterates over all children present inside `images/enemies/`.
2. **Native Header Decoding**: Extracts pixel resolution dynamically directly from raw binary chunk offsets:
   * **WebP**: Validates `RIFF` signatures, inspects `VP8X` metadata bytes (offset 24/27), or parses `VP8L` lossless block bits.
   * **PNG**: Validates standard 8-byte magic numbers and isolates the 4-byte big-endian dimensions embedded inside `IHDR` chunks.
3. **Quality Classification Scoring**:
   * Generates a structured alert record if dimensions do not equal exactly `1024x1024`.
   * Triggers a warning if file sizes fall below threshold parameters.
4. **Unified Reporting**: Serializes comprehensive visual audit logs returned over JSON-RPC transport boundaries.

---

## 🛡️ Pipeline Rule Checklist
- [x] Originated in `_concepts/mechanics/` staging environment.
- [x] Review and authorization by **The Curator** & **Vivid**.
- [x] Handler implementation and injection into `tools/nexus-mcp/index.js` tool registries upon blessing.
