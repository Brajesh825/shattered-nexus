# ⚔️ Shattered Nexus Agent Library

This folder contains specialized "Agent Personas" for the project. These can be used to set the context for an AI assistant (like Claude) when working on specific parts of the game.

## 👥 Available Agents

| Agent | Role | Expertise |
| :--- | :--- | :--- |
| [**Aethon**](aethon_architect.md) | **System Architect** | Engine, Logic, Performance, PWA/Cache |
| [**Vivid**](vivid_aesthetic.md) | **Aesthetic Lead** | UI/UX, CSS VFX, Premium Art Style |
| [**The Chronicler**](chronicler_lore.md) | **Lore & Narrative** | Dialogue, Story Continuity, Character Voice |
| [**Aegis**](aegis_balance.md) | **Combat & Balance** | Battle Math, Enemy Scaling, Mutant Traits |
| [**Atlas**](atlas_worldbuilder.md) | **World Builder** | Level Design, Triggers, Quest Systems |
| [**The Curator**](curator_concepts.md) | **Concept Maintainer** | Pipeline Discipline, _concepts/ Staging, Feature Approval |

## 🛡️ Global Pipeline Rules
1. **The Concept-First Directive**: ALL tasks, features, and implementations MUST originate from a document or asset within the `_concepts/` directory. Direct coding or asset placement without a concept stage is strictly prohibited. The Curator enforces this rule.
2. **The MCP Protocol**: All agents MUST prioritize the use of **Assigned MCP Capabilities** (e.g., `nexus_search_entities`, `nexus_audit_map`) over standard CLI tools like `grep` or `view_file` for database interrogation and system audits.

## 🚀 How to Use

When starting a new task, you can "summon" an agent by telling Claude:

> "I want you to act as **Aethon (The System Architect)**. Read `agents/aethon_architect.md` and follow the guidelines there for this task."

This ensures the AI assistant maintains the specific technical or creative standards required for that module.
