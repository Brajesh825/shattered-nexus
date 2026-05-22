# ⚔️ Shattered Nexus Agent Library

This folder contains specialized "Agent Personas" for the project. These can be used to set the context for an AI assistant (like Claude) when working on specific parts of the game.

## 👥 Available Agents (7 Active)

| Agent file | `name` key | Role | Expertise |
| :--- | :--- | :--- | :--- |
| [**aethon_architect.md**](aethon_architect.md) | `aethon-architect` | **System Architect** | Engine, Logic, Performance, PWA/Cache |
| [**vivid_aesthetic.md**](vivid_aesthetic.md) | `vivid-aesthetic` | **Aesthetic Lead** | UI/UX, CSS VFX, Premium Art Style |
| [**chronicler_lore.md**](chronicler_lore.md) | `chronicler-lore` | **Lore & Narrative** | Dialogue, Story Continuity, Character Voice |
| [**aegis_balance.md**](aegis_balance.md) | `aegis-balance` | **Combat & Balance** | Battle Math, Enemy Scaling, Mutant Traits |
| [**atlas_worldbuilder.md**](atlas_worldbuilder.md) | `atlas-worldbuilder` | **World Builder** | Level Design, Triggers, Quest Systems |
| [**curator_concepts.md**](curator_concepts.md) | `curator-concepts` | **Concept Maintainer** | Pipeline Discipline, _concepts/ Staging, Feature Approval |
| [**resonance_audio.md**](resonance_audio.md) | `resonance-audio` | **Audio Engineer** | BGM, SFX, Opus encoding, audio crossfade |

## 🛡️ Global Pipeline Rules
1. **The Concept-First Directive**: ALL tasks, features, and implementations MUST originate from a document or asset within the `_concepts/` directory. Direct coding or asset placement without a concept stage is strictly prohibited. The Curator enforces this rule.
2. **The MCP Protocol**: All agents MUST prioritize the use of **Assigned MCP Capabilities** (e.g., `nexus_search_entities`, `nexus_audit_map`) over standard CLI tools like `grep` or `view_file` for database interrogation and system audits.
3. **Character Design Pipeline**: All new playable characters must follow the 5-Stage Flow: Identity → Synchronization (Curator/Aegis/Vivid) → Staging → Production → Authorization.
4. **Pre-PR Gate**: `aethon-architect` must run all integrity check tools before any PR is raised.

## 🚀 How to Use

Agents are **automatically discovered** by Claude Code via the YAML `name` frontmatter in each file. To explicitly route a task, reference the agent by name:

> "Use **`aethon-architect`** to audit the service worker cache."
> "Use **`vivid-aesthetic`** to polish the encounter overlay CSS."

Or use the legacy summon pattern:

> "Act as **Aethon (The System Architect)**. Read `agents/aethon_architect.md` and follow the guidelines there for this task."
