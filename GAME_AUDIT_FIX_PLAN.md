# Shattered Nexus Audit Fix Plan

This document captures the main issues found during the game-wide audit and turns them into concrete fix work. The game is already in a strong state for a solo web RPG: tests pass, data mostly lines up, the content volume is high, and the combat systems are much more complete than a prototype. The remaining work is mostly hardening, consistency, and polish.

## Current Health

- Test suite: `54/54` passing.
- JSON data: `34/34` files parse successfully.
- Core IDs: characters, classes, enemies, items, and relics have no duplicate IDs.
- Story index: all 8 arcs resolve.
- Major systems present: combat, reactions, status effects, map exploration, story, saves, archive, quests, inventory, PWA shell, sprite quality, audio, visual harness.

Overall project rating from audit: **9.0/10**.

With the fixes below, the project can realistically move toward **8.5/10** because the biggest gaps are not missing vision; they are consistency and production hardening.

## P2: Data Contract Validation

Problem: data exists and parses, but validation only covers a small slice of the game.

Current validation checks enemy required fields. It does not comprehensively verify story references, ability IDs, map references, asset references, item effects, unlocks, or encounter IDs.

Affected files:

- `js/data-loader.js`
- `data/*.json`
- `data/story/*.json`
- `js/map/data/*.js`
- `js/map/data/*.json`
- `tests/`

Required work:

- Add a validation script under `tests/` or `tools/`, for example:

```text
tests/data-contract.test.js
```

- Validate:
  - All character `class_affinity` IDs exist in `classes.json`.
  - Every enemy ability has required fields.
  - Every item effect type is supported.
  - Every relic effect type is supported.
  - Every story arc file listed in `data/story/index.json` exists and parses.
  - Every story encounter enemy ID exists in `enemies.json`.
  - Every story character/cast ID maps to a known character or NPC alias.
  - Every map `jsonFile` exists and parses.
  - Every map encounter enemy ID exists.
  - Every referenced environment SVG exists.
  - Every referenced background image exists.
  - Every sprite path for normal and low quality exists.

Acceptance checks:

- `npm test` includes data contract validation.
- A typo in an enemy ID, story arc file, or asset path fails tests before runtime.
- Data loader warnings become actionable test failures for required contracts.

## P2: Asset Weight and Loading Strategy

Problem: image assets total about **112 MB**, and several individual assets are very large.

Largest examples from audit:

- `images/characters/map/sheets/rex_sheet.png`: about 8.0 MB.
- `images/characters/map/sheets/tao_sheet.png`: about 7.7 MB.
- Several spirit sprites are around 4 to 5 MB each.

The low-quality WebP path helps, but normal quality is heavy for mobile and first load.

Required work:

- Keep normal quality for desktop/high-end.
- Ensure auto mode chooses low quality on mobile before preloading.
- Consider generating optimized normal WebP versions for large PNG sheets.
- Lazy-load rarely used character sheets and NPC sheets instead of caching everything early.
- Avoid preloading unused arcs/maps/assets during first boot.

Acceptance checks:

- First meaningful title screen appears quickly on mobile.
- Low quality mode keeps total initial character sprite load under a small target, for example 2 MB.
- Normal quality does not block UI startup unnecessarily.

## P2: Save and Settings Robustness

Current save logic is decent: slots exist, corrupt JSON is handled, legacy migration exists, and tests cover save-contract payloads.

Remaining work:

- Add tests for importing invalid saves.
- Add tests for migration from old character IDs.
- Add tests for missing fields in old saves.
- Make settings migration explicit and covered by tests.
- Keep filesystem sync dev-only and silent in production.

Affected files:

- `js/save.js`
- `js/systems/settings-manager.js`
- `tests/save-contract.test.js`

Acceptance checks:

- Bad imports do not overwrite good save slots.
- Old saves migrate without losing party HP/MP/KO state.
- Settings survive reload and match runtime state.

## P3: InnerHTML and UI Safety

Problem: the app uses `innerHTML` heavily.

This is common in small web games and acceptable if all content is trusted local data. But because the game supports save import and renders some data-driven UI, it should be hardened.

Affected areas:

- Save slot rendering.
- Archive UI.
- Quest UI.
- Inventory UI.
- Battle log.
- Story/map region panels.

Required work:

- Keep `innerHTML` for static templates where data is trusted.
- Escape imported save data before rendering.
- Escape any content sourced from user import, save files, or localStorage.
- Add a tiny helper:

```js
function escapeHtml(value) { ... }
```

- Use DOM APIs or escaping in places that render save names, imported fields, or external JSON.

Acceptance checks:

- Imported save text cannot inject HTML.
- Local content still renders with icons and formatting where intended.

## P3: Visual Regression Harness

Problem: sprite/UI regressions are currently caught manually.

Recent sprite changes showed that small renderer changes can produce obvious visual issues without failing tests.

Required work:

- Add a local debug page or test mode that renders:
  - All six sprite frames for every character.
  - Normal and low quality variants.
  - Battle party layout.
  - Character select cards.
  - Result screen party.
  - Story/cutscene standing sprite.
- Optional: use Playwright screenshots for desktop and mobile viewport snapshots.

Acceptance checks:

- A wrong grid or wrong sprite size is visible immediately on one debug screen.
- The debug harness does not require starting a full story run.

## Suggested Fix Order

1. Add data contract validation to tests.
2. Add sprite visual/debug harness.
3. Harden save/settings migration tests.
4. Audit and escape imported/user-controlled UI data.
5. Reduce asset load weight and improve lazy loading.

## Release Checklist

Before a release, run:

```bash
npm test
node --check sw.js
node --check js/sprites.js
node --check js/asset-preloader.js
```

Manual checks:

- Fresh load with cleared site data.
- First-run quality picker.
- Normal quality battle.
- Low quality battle.
- Mobile viewport battle.
- Story start and story skip.
- Map entry and encounter launch.
- Save, load, export, import.
- Offline/PWA reload after first install.

## Bottom Line

The game is already content-rich and mechanically ambitious. The combat system is the strongest part technically, and the art/content pipeline is becoming much better now that sprites are standardized.

The main weakness is consistency across infrastructure: cache manifest, settings state, data contracts, and global script order. Fixing those will make the game feel much more stable and professional without needing to redesign the gameplay.
