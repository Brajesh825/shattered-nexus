# 🎨 Concept: ComfyUI Enemy Sprite Generation MCP Integration (`nexus_generate_enemy_sprites`)

## 🎯 Primary Objective
Transform the standalone `tools/gen_enemies_batch.py` ComfyUI batch runner into an authoritative, discoverable **Model Context Protocol (MCP)** tool capability hosted within the core `nexus-engine-mcp` server. 

This enables automated agentic frameworks to programmatically trigger, monitor, and audit high-fidelity 2D cel-shaded enemy sprite generation directly through unified JSON-RPC transport streams.

---

## 🖼️ Aesthetic & Technical Alignment (Vivid's Directives)
1. **The Void Knight Standard**: Enforces clean cel-shading, flat colors, and high-contrast razor-thin lineart without upscaling/downscaling artifacts.
2. **Resolution Guarantee**: Retains raw `1024x1024` dimensions strictly sourced from Illustrious XL pixelart generation pipelines.
3. **Alpha Isolation**: Extracts output exclusively from Node 21 (`02_NOBG`) to guarantee crisp, pre-isolated background transparency.
4. **PWA Performance Optimization**: Directly transcodes final image buffers into lossless `.webp` assets to maximize storage and delivery speeds.

---

## 🛠️ Proposed MCP Tool Schema

### Tool Name
`nexus_generate_enemy_sprites`

### Input Schema
```json
{
  "type": "object",
  "properties": {
    "targetEnemyIds": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Optional array of specific enemy ID strings to generate (e.g. ['void_reaver', 'mire_horror']). If omitted, scans images/enemies/_prompts.txt for ungenerated items lacking a leading [DONE] tag."
    },
    "cfgScale": {
      "type": "number",
      "default": 5.0,
      "description": "Guidance scale for visual adherence."
    }
  }
}
```

---

## ⚙️ Execution Handler Workflow (`handlers/generateSprites.js`)
1. **Prompt Synchronization**: Reads authoritative prompts directly from `images/enemies/_prompts.txt`.
2. **Workflow Graph Construction**: Loads the pristine JSON DAG template from `prompt_gen/workflows/illustrious_xl_pixelart_t2i.json`.
3. **Queue Invocation**: Dispatches REST POST payloads directly to the active ComfyUI backend instance (`http://127.0.0.1:8188/prompt`).
4. **Non-Blocking Telemetry**: Polls `/history/{prompt_id}` endpoints gracefully until graph node execution concludes.
5. **Asset Transcoding**: Streams image binaries back, serializes losslessly to `images/enemies/{id}.webp`, and automatically flags generated prompts with `[DONE]` inside `_prompts.txt` to prevent duplicate processing.
6. **Cache Invalidation Lifecycle**: Triggers an automatic minor version bump to `CACHE_NAME` in `sw.js` via local utility handlers to ensure PWA asset sync.

---

## 🛡️ Pipeline Rule Checklist
- [x] Originated in `_concepts/mechanics/` staging environment.
- [x] Review and authorization by **The Curator** & **Vivid**.
- [x] Integration into `tools/nexus-mcp/index.js` tool registries upon final blessing.
